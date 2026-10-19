const ALLPAYS_API_URL = 'https://api.allpays.co';
const ALLPAYS_REQUEST_TIMEOUT_MS = 12_000;
export const APPLICATION_FEE_USD = 90;

export type AllPaysProvider = {
  id: string;
  name: string;
  description: string;
  notes: string;
  logo: string;
  status?: string;
};

type AllPaysResponse<T> = {
  success?: boolean;
  data?: T;
  error?: string;
};

type PaymentLink = {
  payment_id: string;
  currency: string;
  amount: number | null;
  amount_editable: boolean;
  hosted_payment_url?: string;
  status?: string;
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

export function getAllPaysPaymentId(): string {
  const paymentId = process.env.ALLPAYS_PAYMENT_ID?.trim();
  if (!paymentId || !/^pay_[A-Za-z0-9]+$/.test(paymentId)) {
    throw new Error('Set ALLPAYS_PAYMENT_ID in the project-root .env file to your active AllPays payment ID.');
  }
  return paymentId;
}

export async function getAllPaysPaymentLink(): Promise<PaymentLink> {
  const paymentId = getAllPaysPaymentId();
  const data = await allPaysFetch<{ payment: PaymentLink }>(
    `/v1/payments/${encodeURIComponent(paymentId)}`,
  );
  const payment = data.payment;
  if (!payment || payment.payment_id !== paymentId) {
    throw new Error('AllPays returned an invalid payment link.');
  }
  if (payment.status !== undefined && payment.status !== 'active') {
    throw new Error('This AllPays payment link is not active.');
  }
  if (
    payment.currency !== 'USD'
    || payment.amount !== APPLICATION_FEE_USD
    || payment.amount_editable
  ) {
    throw new Error('The configured AllPays link must be fixed at exactly $90 USD.');
  }
  return payment;
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

export async function getAllPaysProviders(country?: string, state?: string): Promise<AllPaysProvider[]> {
  const paymentId = getAllPaysPaymentId();
  const [payment, data] = await Promise.all([
    getAllPaysPaymentLink(),
    allPaysFetch<{
      available?: { payment_providers?: AllPaysProvider[] };
    }>(`/v1/payments/${encodeURIComponent(paymentId)}/providers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept-Language': 'en' },
      body: JSON.stringify({
        mode: 'providers',
        ...(country ? { country } : {}),
        ...(country === 'US' && toUsStateCode(state) ? { state: toUsStateCode(state) } : {}),
      }),
    }),
  ]);
  if (payment.payment_id !== paymentId) {
    throw new Error('AllPays returned a different payment link while loading providers.');
  }

  return (data.available?.payment_providers ?? []).filter((provider) => (
    typeof provider.id === 'string'
    && typeof provider.name === 'string'
    && (provider.status === undefined || provider.status === 'active')
  ));
}

function isValidPaymentReference(value: unknown): value is string {
  return typeof value === 'string'
    && value.length > 0
    && value.length <= 512
    && value.trim() === value
    && !/[\u0000-\u001f\u007f]/.test(value);
}

export async function startAllPaysCheckout(
  email: string,
  provider: string,
): Promise<{ checkoutUrl: string; payRequestHash: string; provider: string }> {
  const payment = await getAllPaysPaymentLink();
  const url = new URL(
    `/v1/payments/${encodeURIComponent(payment.payment_id)}/pay`,
    ALLPAYS_API_URL,
  );
  url.searchParams.set('email', email);
  url.searchParams.set('provider', provider);

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json', 'Accept-Language': 'en' },
      signal: AbortSignal.timeout(ALLPAYS_REQUEST_TIMEOUT_MS),
      cache: 'no-store',
      redirect: 'manual',
    });
  } catch {
    throw new Error('Could not start checkout with AllPays. Check the connection and try again.');
  }

  if (response.status >= 300 && response.status < 400) {
    throw new Error('AllPays did not return a verifiable checkout session for this provider. Choose another provider or contact payment support.');
  }
  const result = await response.json().catch(() => null) as AllPaysResponse<{
    checkout_url?: string;
    pay_request_hash?: string;
    provider?: string;
  }> | null;
  if (!response.ok || !result?.success || !result.data) {
    throw new Error(result?.error || `AllPays returned HTTP ${response.status}.`);
  }
  const checkoutUrl = result.data.checkout_url;
  const payRequestHash = result.data.pay_request_hash;
  const selectedProvider = result.data.provider;
  let checkoutProtocol: string | undefined;
  try {
    checkoutProtocol = checkoutUrl ? new URL(checkoutUrl).protocol : undefined;
  } catch {
    checkoutProtocol = undefined;
  }
  if (
    typeof checkoutUrl !== 'string'
    || checkoutProtocol !== 'https:'
    || !isValidPaymentReference(payRequestHash)
    || typeof selectedProvider !== 'string'
    || !selectedProvider
  ) {
    throw new Error('AllPays did not return the payment reference needed to verify payment. Checkout was not opened; retry or contact payment support.');
  }

  return { checkoutUrl, payRequestHash, provider: selectedProvider };
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
