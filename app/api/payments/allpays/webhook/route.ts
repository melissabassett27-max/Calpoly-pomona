export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  APPLICATION_FEE_USD,
  getAllPaysHostedAttempt,
  verifyAllPaysCallbackSignature,
} from '@/lib/allpays';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const paymentId = url.searchParams.get('payment_id');
  const payRequestHash = url.searchParams.get('pay_request_hash');
  const timestamp = request.headers.get('X-AllPays-Timestamp');
  const signature = request.headers.get('X-AllPays-Signature');

  if (!paymentId || !payRequestHash || !timestamp || !signature) {
    return NextResponse.json({ error: 'Invalid AllPays callback.' }, { status: 400 });
  }

  try {
    const payment = await prisma.applicationPayment.findUnique({
      where: { allPaysPaymentId: paymentId },
    });
    if (!payment || !payment.allPaysPaymentSecret) {
      return NextResponse.json({ error: 'Payment not found.' }, { status: 404 });
    }

    if (!verifyAllPaysCallbackSignature(
      url.searchParams,
      timestamp,
      signature,
      payment.allPaysPaymentSecret,
    )) {
      return NextResponse.json({ error: 'Invalid AllPays signature.' }, { status: 401 });
    }

    const attempt = await getAllPaysHostedAttempt(paymentId, payment.allPaysPaymentSecret);
    if (!attempt || attempt.pay_request_hash !== payRequestHash) {
      return NextResponse.json({ error: 'AllPays payment attempt could not be verified.' }, { status: 409 });
    }

    if (
      attempt.status !== 'completed'
      || attempt.amount !== APPLICATION_FEE_USD
      || attempt.currency !== 'USD'
      || attempt.amount_match?.checkout !== 'exact'
    ) {
      return NextResponse.json({ error: 'AllPays has not confirmed the exact application payment.' }, { status: 409 });
    }

    await prisma.$transaction([
      prisma.applicationPayment.update({
        where: { id: payment.id },
        data: { payRequestHash: attempt.pay_request_hash, status: 'completed' },
      }),
      prisma.application.update({
        where: { id: payment.applicationId },
        data: { paymentConfirmed: true },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to process AllPays payment callback:', error);
    return NextResponse.json({ error: 'Could not verify the AllPays payment.' }, { status: 500 });
  }
}
