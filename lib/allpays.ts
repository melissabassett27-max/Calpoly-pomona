import { createHmac, timingSafeEqual } from 'node:crypto';

const ALLPAYS_API_URL = 'https://api.allpays.co';
const ALLPAYS_REQUEST_TIMEOUT_MS = 12_000;
export const APPLICATION_FEE_USD = 90;

type AllPaysResponse<T> = {
  success?: boolean;
  data?: T;
  error?: string;
};

const REGION_NAMES = new Intl.DisplayNames(['en'], { type: 'region' });
const COUNTRY_NAME_CODES = (() => {
  const codes = new Map<string, string>();
  for (let first = 65; first <= 90; first += 1) {
    for (let second = 65; second <= 90; second += 1) {
      const code = String.fromCharCode(first, second);
      const name = REGION_NAMES.of(code);
      if (name && name.toUpperCase() !== code) codes.set(name.toLowerCase(), code);
    }
  }
  return codes;
})();

const US_STATE_CODES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC',
];
const US_STATE_NAME_CODES = new Map<string, string>([
  ['alabama', 'AL'], ['alaska', 'AK'], ['arizona', 'AZ'], ['arkansas', 'AR'],
  ['california', 'CA'], ['colorado', 'CO'], ['connecticut', 'CT'], ['delaware', 'DE'],
  ['florida', 'FL'], ['georgia', 'GA'], ['hawaii', 'HI'], ['idaho', 'ID'],
  ['illinois', 'IL'], ['indiana', 'IN'], ['iowa', 'IA'], ['kansas', 'KS'],
  ['kentucky', 'KY'], ['louisiana', 'LA'], ['maine', 'ME'], ['maryland', 'MD'],
  ['massachusetts', 'MA'], ['michigan', 'MI'], ['minnesota', 'MN'], ['mississippi', 'MS'],
  ['missouri', 'MO'], ['montana', 'MT'], ['nebraska', 'NE'], ['nevada', 'NV'],
  ['new hampshire', 'NH'], ['new jersey', 'NJ'], ['new mexico', 'NM'], ['new york', 'NY'],
  ['north carolina', 'NC'], ['north dakota', 'ND'], ['ohio', 'OH'], ['oklahoma', 'OK'],
  ['oregon', 'OR'], ['pennsylvania', 'PA'], ['rhode island', 'RI'], ['south carolina', 'SC'],
  ['south dakota', 'SD'], ['tennessee', 'TN'], ['texas', 'TX'], ['utah', 'UT'],
  ['vermont', 'VT'], ['virginia', 'VA'], ['washington', 'WA'], ['west virginia', 'WV'],
  ['wisconsin', 'WI'], ['wyoming', 'WY'], ['district of columbia', 'DC'],
]);

async function allPaysFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${ALLPAYS_API_URL}${path}`, {
      ...init,
      signal: AbortSignal.timeout(ALLPAYS_REQUEST_TIMEOUT_MS),
      cache: 'no-store',
      headers: { Accept: 'application/json', ...init?.headers },
    });
  } catch {
    throw new Error('Could not connect to AllPays. Check the network and try again.');
  }

  const result = await response.json().catch(() => null) as AllPaysResponse<T> | null;
  if (!response.ok || !result?.success || !result.data) {
    throw new Error(result?.error || `AllPays returned HTTP ${response.status}.`);
  }
  return result.data;
}

export function toCountryCode(country: unknown): string | undefined {
  if (typeof country !== 'string') return undefined;
  const trimmed = country.trim();
  if (/^[a-z]{2}$/i.test(trimmed)) return trimmed.toUpperCase();

  const aliases: Record<string, string> = {
    'united states': 'US',
    'united states of america': 'US',
    usa: 'US',
    'u.s.a.': 'US',
    canada: 'CA',
    'united kingdom': 'GB',
    uk: 'GB',
    australia: 'AU',
    india: 'IN',
    kenya: 'KE',
    nigeria: 'NG',
    ghana: 'GH',
    mexico: 'MX',
    germany: 'DE',
    france: 'FR',
    italy: 'IT',
    china: 'CN',
    japan: 'JP',
    philippines: 'PH',
  };
  return aliases[trimmed.toLowerCase()] ?? COUNTRY_NAME_CODES.get(trimmed.toLowerCase());
}

export function toUsStateCode(state: unknown): string | undefined {
  if (typeof state !== 'string') return undefined;
  const trimmed = state.trim();
  if (US_STATE_CODES.includes(trimmed.toUpperCase())) return trimmed.toUpperCase();
  return US_STATE_NAME_CODES.get(trimmed.toLowerCase());
}

function isValidPaymentReference(value: unknown): value is string {
  return typeof value === 'string'
    && value.length > 0
    && value.length <= 512
    && value.trim() === value
    && !/[\u0000-\u001f\u007f]/.test(value);
}

function getAllPaysHostedUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  try {
    const url = new URL(value);
    if (
      url.protocol === 'https:'
      && (url.hostname === 'allpays.co' || url.hostname.endsWith('.allpays.co'))
    ) {
      return url.toString();
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export function getAllPaysCallbackUrl(): string | undefined {
  const configuredOrigin = process.env.ALLPAYS_CALLBACK_URL?.trim() || process.env.NEXTAUTH_URL?.trim();
  if (!configuredOrigin) return undefined;

  let callbackUrl: URL;
  try {
    callbackUrl = new URL('/api/payments/allpays/webhook', configuredOrigin);
  } catch {
    throw new Error('NEXTAUTH_URL or ALLPAYS_CALLBACK_URL must be a valid public URL.');
  }
  if (process.env.NODE_ENV === 'production' && callbackUrl.protocol !== 'https:') {
    throw new Error('The AllPays callback URL must use HTTPS in production.');
  }
  if (
    process.env.NODE_ENV !== 'production'
    && (callbackUrl.protocol !== 'https:' || ['localhost', '127.0.0.1', '::1'].includes(callbackUrl.hostname))
  ) {
    return undefined;
  }
  return callbackUrl.toString();
}

export function verifyAllPaysCallbackSignature(
  params: URLSearchParams,
  timestamp: string,
  signature: string,
  paymentSecret: string,
): boolean {
  const canonicalQuery = [...params.entries()]
    .sort(([keyA], [keyB]) => (keyA < keyB ? -1 : keyA > keyB ? 1 : 0))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  const expected = createHmac('sha256', paymentSecret)
    .update(`${timestamp}\n${canonicalQuery}`)
    .digest('hex');
  const supplied = signature.startsWith('sha256=') ? signature.slice('sha256='.length) : signature;
  if (!/^[a-fA-F0-9]{64}$/.test(supplied)) return false;

  return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(supplied, 'hex'));
}

export async function createAllPaysHostedCheckout(
  country: string,
  state?: string,
): Promise<{ paymentId: string; paymentSecret: string; checkoutUrl: string }> {
  const polygonAddress = process.env.ALLPAYS_POLYGON_ADDRESS?.trim();
  if (!polygonAddress || !/^0x[a-fA-F0-9]{40}$/.test(polygonAddress)) {
    throw new Error('Set ALLPAYS_POLYGON_ADDRESS in the server environment to the USDC Polygon payout wallet.');
  }
  if (!/^[A-Z]{2}$/.test(country)) {
    throw new Error('A valid applicant country is required to load payment methods.');
  }
  const callbackUrl = getAllPaysCallbackUrl();

  const created = await allPaysFetch<{
    payment_id?: string;
    hosted_payment_url?: string;
    payment_secret?: string;
    currency?: string;
    amount?: number | null;
    amount_editable?: boolean;
    fee_payer?: string;
  }>('/v1/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      polygon_address: polygonAddress,
      currency: 'USD',
      amount: APPLICATION_FEE_USD,
      amount_editable: false,
      fee_payer: 'merchant',
      ...(callbackUrl ? { callback_url: callbackUrl } : {}),
    }),
  });

  const paymentId = created.payment_id;
  const paymentSecret = created.payment_secret;
  const checkoutUrl = getAllPaysHostedUrl(created.hosted_payment_url);
  if (
    typeof paymentId !== 'string'
    || !isValidPaymentReference(paymentId)
    || typeof paymentSecret !== 'string'
    || !isValidPaymentReference(paymentSecret)
    || !checkoutUrl
    || created.currency !== 'USD'
    || created.amount !== APPLICATION_FEE_USD
    || created.amount_editable !== false
    || created.fee_payer !== 'merchant'
  ) {
    throw new Error('AllPays did not return a valid hosted checkout link for the fixed $90 USD application fee.');
  }

  const data = await allPaysFetch<{
    available?: {
      payment_methods?: Array<{ id?: string; name?: string }>;
    };
  }>(`/v1/payments/${encodeURIComponent(paymentId)}/providers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept-Language': 'en' },
    body: JSON.stringify({
      mode: 'methods',
      country,
      ...(country === 'US' && toUsStateCode(state) ? { state: toUsStateCode(state) } : {}),
    }),
  });

  const paymentMethods = data.available?.payment_methods;
  const hasCardOrBankMethod = Array.isArray(paymentMethods) && paymentMethods.some((method) => (
    /card|credit|debit|bank|transfer|ach|sepa|apple[\s_-]?pay/i.test(
      `${method.id ?? ''} ${method.name ?? ''}`,
    )
  ));
  if (!hasCardOrBankMethod) {
    throw new Error(`AllPays did not return a card, Apple Pay, or bank payment method for ${country}.`);
  }

  return { paymentId, paymentSecret, checkoutUrl };
}

export async function getAllPaysHostedAttempt(
  paymentId: string,
  paymentSecret: string,
): Promise<{
  pay_request_hash: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'timed_out';
  amount_match?: { checkout?: string };
} | null> {
  if (!isValidPaymentReference(paymentId) || !isValidPaymentReference(paymentSecret)) {
    throw new Error('The saved AllPays payment link credentials are invalid.');
  }

  const data = await allPaysFetch<{
    payment?: { payment_id?: string };
    latest_attempt?: {
      pay_request_hash?: string;
      amount?: number;
      currency?: string;
      status?: string;
      amount_match?: { checkout?: string };
    } | null;
  }>(`/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: { 'X-Payment-Secret': paymentSecret },
  });

  if (data.payment?.payment_id !== paymentId) {
    throw new Error('AllPays returned a mismatched payment link.');
  }
  const attempt = data.latest_attempt;
  if (attempt === undefined || attempt === null) return null;
  const status = attempt.status;
  if (
    !isValidPaymentReference(attempt.pay_request_hash)
    || typeof attempt.amount !== 'number'
    || !Number.isFinite(attempt.amount)
    || typeof attempt.currency !== 'string'
    || (status !== 'pending' && status !== 'completed' && status !== 'timed_out')
  ) {
    throw new Error('AllPays returned invalid payment details for this hosted checkout.');
  }

  return {
    pay_request_hash: attempt.pay_request_hash,
    amount: attempt.amount,
    currency: attempt.currency,
    status,
    amount_match: attempt.amount_match,
  };
}

export async function getAllPaysAttempt(payRequestHash: string): Promise<{
  pay_request_hash: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'timed_out';
  amount_match?: { checkout?: string };
}> {
  if (!isValidPaymentReference(payRequestHash)) {
    throw new Error('The saved AllPays payment reference is invalid.');
  }
  const data = await allPaysFetch<{
    pay_request_hash: string;
    attempt: {
      pay_request_hash: string;
      amount: number;
      currency: string;
      status: 'pending' | 'completed' | 'timed_out';
      amount_match?: { checkout?: string };
    };
  }>(`/v1/payment-attempts/${encodeURIComponent(payRequestHash)}`);

  if (
    data.pay_request_hash !== payRequestHash
    || !data.attempt
    || data.attempt.pay_request_hash !== payRequestHash
    || !Number.isFinite(data.attempt.amount)
    || typeof data.attempt.currency !== 'string'
    || !['pending', 'completed', 'timed_out'].includes(data.attempt.status)
  ) {
    throw new Error('AllPays returned a mismatched payment reference.');
  }
  return data.attempt;
}

export function isLocalPaymentTestEnabled(): boolean {
  return process.env.NODE_ENV === 'development' && process.env.PAYMENTS_TEST_MODE === 'true';
}
