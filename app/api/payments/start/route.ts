export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { APPLICATION_FEE_USD, startAllPaysCheckout } from '@/lib/allpays';
import { getApplicationCompletionIssues } from '@/lib/application-validation';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as { provider?: unknown };
    if (typeof body.provider !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(body.provider)) {
      return NextResponse.json({ error: 'Choose a valid payment provider.' }, { status: 400 });
    }

    const application = await prisma.application.findFirst({
      where: { userId: session.user.id, status: 'draft' },
      orderBy: { createdAt: 'desc' },
    });
    if (!application) return NextResponse.json({ error: 'No draft application found' }, { status: 404 });
    const completionIssues = getApplicationCompletionIssues(application);
    if (completionIssues.length > 0) {
      return NextResponse.json({
        error: 'Complete the required application fields before payment.',
        issues: completionIssues,
      }, { status: 409 });
    }

    const personal = application.section1Data as Record<string, unknown> | null;
    const email = typeof personal?.email === 'string' ? personal.email.trim() : '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Add a valid email address to your personal information before payment.' }, { status: 400 });
    }

    let hasPendingPayment = false;
    try {
      const latestPayment = await prisma.applicationPayment.findFirst({
        where: { applicationId: application.id, status: 'pending' },
      });
      hasPendingPayment = latestPayment !== null;
    } catch (error) {
      console.error('Payment records are unavailable; checkout was not started:', error);
      return NextResponse.json({
        error: 'Payment setup is not ready. Verify the Supabase connection and run prisma/application-payment.sql before starting checkout.',
      }, { status: 503 });
    }
    if (hasPendingPayment) {
      return NextResponse.json({
        error: 'A payment attempt is already in progress. Return from AllPays and choose VERIFY PAYMENT & SUBMIT before starting another payment.',
      }, { status: 409 });
    }

    const checkout = await startAllPaysCheckout(email, body.provider);
    try {
      await prisma.applicationPayment.create({
        data: {
          applicationId: application.id,
          payRequestHash: checkout.payRequestHash,
          provider: checkout.provider,
          amount: APPLICATION_FEE_USD,
          currency: 'USD',
        },
      });
    } catch (error) {
      console.error('AllPays created a checkout, but its verification reference could not be saved:', error);
      return NextResponse.json({
        error: 'We could not safely record this checkout. Do not continue or start another payment yet. Contact payment support for help.',
      }, { status: 503 });
    }

    return NextResponse.json({
      checkoutUrl: checkout.checkoutUrl,
      provider: checkout.provider,
    });
  } catch (error) {
    console.error('Failed to start application payment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not start payment.' },
      { status: 502 },
    );
  }
}
