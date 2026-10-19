import type { Prisma } from '@prisma/client';

type SubmittedApplication = {
  id: string;
  applicationIdNumber: string;
  submittedAt: Date | null;
  section1Data: Prisma.JsonValue | null;
  section2Data: Prisma.JsonValue | null;
  section3Data: Prisma.JsonValue | null;
  section4Data: Prisma.JsonValue | null;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendApplicationReceiptEmail(
  application: SubmittedApplication,
  recipient: string,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const sender = process.env.EMAIL_FROM;
  const siteUrl = process.env.NEXTAUTH_URL ?? process.env.AUTH_URL;

  if (!apiKey || !sender || !siteUrl) {
    throw new Error('Receipt email is not configured. Set RESEND_API_KEY, EMAIL_FROM, and NEXTAUTH_URL.');
  }

  const receiptUrl = new URL('/application/receipt', siteUrl).toString();
  const sections = [
    ['Personal Information', application.section1Data],
    ['Academic History', application.section2Data],
    ['Supporting Information', application.section3Data],
    ['Program Materials', application.section4Data],
  ] as const;
  const detailsText = sections
    .map(([title, data]) => `${title}\n${JSON.stringify(data ?? {}, null, 2)}`)
    .join('\n\n');
  const detailsHtml = sections
    .map(([title, data]) => (
      `<h2>${escapeHtml(title)}</h2><pre style="white-space:pre-wrap;font:14px/1.5 sans-serif">${escapeHtml(JSON.stringify(data ?? {}, null, 2))}</pre>`
    ))
    .join('');
  const submittedDate = application.submittedAt?.toISOString() ?? new Date().toISOString();
  const html = [
    '<div style="font-family:Arial,sans-serif;max-width:720px;margin:auto;color:#1a1a1a">',
    '<h1>Application submitted successfully</h1>',
    `<p>Application receipt: <strong>${escapeHtml(application.applicationIdNumber)}</strong></p>`,
    `<p>Submitted: ${escapeHtml(submittedDate)}</p>`,
    '<p>Application fee: <strong>$90.00</strong></p>',
    '<h2>Application details</h2>',
    detailsHtml,
    `<p><a href="${escapeHtml(receiptUrl)}">View and print your online receipt</a> (sign in to your application account first).</p>`,
    '</div>',
  ].join('');
  const text = [
    'Application submitted successfully',
    `Application receipt: ${application.applicationIdNumber}`,
    `Submitted: ${submittedDate}`,
    'Application fee: $90.00',
    '',
    'Application details',
    detailsText,
    '',
    `View and print your online receipt: ${receiptUrl}`,
    '(Sign in to your application account first.)',
  ].join('\n');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `application-receipt-${application.id}`,
    },
    body: JSON.stringify({
      from: sender,
      to: [recipient],
      subject: `Application receipt ${application.applicationIdNumber}`,
      html,
      text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Receipt email provider returned HTTP ${response.status}.`);
  }
}
