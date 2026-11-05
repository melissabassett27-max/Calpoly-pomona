export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import {
  APPLICATION_FEE_USD,
  createAllPaysHostedCheckout,
  isLocalPaymentTestEnabled,
  toCountryCode,
  toUsStateCode,
} from '@/lib/allpays';
import { getApplicationCompletionIssues } from '@/lib/application-validation';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    return NextResponse.json({ testMode: isLocalPaymentTestEnabled() });
  } catch (error) {
    console.error('Failed to load AllPays payment status:', error);
    return NextResponse.json({ error: 'Could not load payment options.' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const application = await prisma.application.findFirst({
      where: { userId: session.user.id, status: 'draft' },
      orderBy: { createdAt: 'desc' },
    });
    if (!application) return NextResponse.json({ error: 'No draft application found.' }, { status: 404 });
    if (application.paymentConfirmed) {
      return NextResponse.json({ error: 'Payment has already been confirmed for this application.' }, { status: 409 });
    }

    const completionIssues = getApplicationCompletionIssues(application);
    if (completionIssues.length > 0) {
      return NextResponse.json({
        error: 'Complete the required application fields before payment.',
        issues: completionIssues,
      }, { status: 409 });
    }

    const personal = application.section1Data as Record<string, unknown> | null;
    const country = toCountryCode(personal?.country);
    if (!country) {
      return NextResponse.json({ error: 'Enter a valid country in your personal information before payment.' }, { status: 400 });
    }

    const pendingPayment = await prisma.applicationPayment.findFirst({
      where: { applicationId: application.id, status: { in: ['creating', 'pending'] } },
      orderBy: { createdAt: 'desc' },
    });
    if (pendingPayment) {
      if (
        pendingPayment.hostedCheckoutUrl
        && pendingPayment.allPaysPaymentId
        && pendingPayment.allPaysPaymentSecret
      ) {
        return NextResponse.json({ checkoutUrl: pendingPayment.hostedCheckoutUrl });
      }
      return NextResponse.json({
        error: pendingPayment.status === 'creating'
          ? 'Your AllPays checkout is still being prepared. Please wait a moment and try again.'
          : 'A payment attempt is already in progress. Return from the existing checkout and choose VERIFY PAYMENT & SUBMIT before starting another payment.',
      }, { status: 409 });
    }

    let payment: Awaited<ReturnType<typeof prisma.applicationPayment.create>>;
    try {
      payment = await prisma.applicationPayment.create({
        data: {
          applicationId: application.id,
          provider: 'allpays-hosted',
          amount: APPLICATION_FEE_USD,
          currency: 'USD',
          status: 'creating',
        },
      });
    } catch (error) {
      const competingPayment = await prisma.applicationPayment.findFirst({
        where: { applicationId: application.id, status: { in: ['creating', 'pending'] } },
        orderBy: { createdAt: 'desc' },
      });
      if (competingPayment) {
        return NextResponse.json({
          error: 'A payment checkout is already being prepared. Please wait or return to the existing checkout.',
        }, { status: 409 });
      }
      throw error;
    }
    try {
      const checkout = await createAllPaysHostedCheckout(
        country,
        country === 'US' ? toUsStateCode(personal?.state) : undefined,
      );
      await prisma.applicationPayment.update({
        where: { id: payment.id },
        data: {
          allPaysPaymentId: checkout.paymentId,
          allPaysPaymentSecret: checkout.paymentSecret,
          hostedCheckoutUrl: checkout.checkoutUrl,
          status: 'pending',
        },
      });
      return NextResponse.json({ checkoutUrl: checkout.checkoutUrl });
    } catch (error) {
      await prisma.applicationPayment.update({
        where: { id: payment.id },
        data: { status: 'failed' },
      }).catch((updateError: unknown) => {
        console.error('Failed to mark the unsuccessful AllPays checkout reservation:', updateError);
      });
      throw error;
    }
  } catch (error) {
    console.error('Failed to start AllPays hosted checkout:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not start payment.' },
      { status: 502 },
    );
  }
}
