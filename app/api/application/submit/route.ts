export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { APPLICATION_FEE_USD, getAllPaysAttempt, isLocalPaymentTestEnabled } from '@/lib/allpays';
import { sendApplicationReceiptEmail } from '@/lib/application-email';
import { prisma } from '@/lib/db';
import { SAMPLE_ANNOUNCEMENTS } from '@/lib/constants';
import { getApplicationCompletionIssues } from '@/lib/application-validation';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as { applicationId?: unknown };
    if (typeof body.applicationId !== 'string' || !body.applicationId) {
      return NextResponse.json({ error: 'Application ID is required.' }, { status: 400 });
    }

    const application = await prisma.application.findFirst({
      where: { id: body.applicationId, userId: session.user.id },
    });
    if (!application) return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    const completionIssues = getApplicationCompletionIssues(application);
    if (completionIssues.length > 0) {
      return NextResponse.json({
        error: 'Complete the required application fields before submitting.',
        issues: completionIssues,
      }, { status: 409 });
    }

    if (!application.paymentConfirmed) {
      const payments = await prisma.applicationPayment.findMany({
        where: { applicationId: application.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
      if (payments.length === 0) {
        return NextResponse.json({ error: 'Start the $90 payment before submitting.' }, { status: 402 });
      }

      const eligiblePayments = payments.filter((payment) => (
        Number(payment.amount) === APPLICATION_FEE_USD && payment.currency === 'USD'
      ));
      const testPaymentVerified = isLocalPaymentTestEnabled() && eligiblePayments.some((payment) => (
        payment.payRequestHash.startsWith('test_') && payment.status === 'completed'
      ));
      const allPaysPayments = eligiblePayments.filter((payment) => !payment.payRequestHash.startsWith('test_'));
      const attemptResults = await Promise.allSettled(
        allPaysPayments.map((payment) => getAllPaysAttempt(payment.payRequestHash)),
      );
      let paymentVerified = testPaymentVerified;
      let verificationUnavailable = false;
      let latestPaymentStatus = payments[0].status;

      for (const [index, result] of attemptResults.entries()) {
        const payment = allPaysPayments[index];
        if (result.status === 'rejected') {
          verificationUnavailable = true;
          console.error(`Could not verify AllPays attempt ${payment.payRequestHash}:`, result.reason);
          continue;
        }

        const attempt = result.value;
        if (index === 0) latestPaymentStatus = attempt.status;
        await prisma.applicationPayment.update({
          where: { id: payment.id },
          data: { status: attempt.status },
        });
        if (
          attempt.status === 'completed'
          && attempt.amount === APPLICATION_FEE_USD
          && attempt.currency === 'USD'
          && attempt.amount_match?.checkout === 'exact'
        ) {
          paymentVerified = true;
        }
      }

      if (!paymentVerified) {
        if (verificationUnavailable) {
          return NextResponse.json({
            error: 'We could not reach AllPays to verify your payment. Do not start another payment. Please retry verification in a moment.',
            paymentStatus: 'verification_unavailable',
          }, { status: 503 });
        }
        return NextResponse.json({
          error: `AllPays has not confirmed an exact $${APPLICATION_FEE_USD} USD payment yet. Complete checkout and try again.`,
          paymentStatus: latestPaymentStatus,
        }, { status: 402 });
      }
    }

    const updated = await prisma.$transaction(async (transaction) => {
      const submitted = await transaction.application.update({
        where: { id: application.id },
        data: {
          status: 'submitted',
          paymentConfirmed: true,
          submittedAt: application.submittedAt ?? new Date(),
        },
      });

      await transaction.portalStatus.upsert({
        where: { applicationId: application.id },
        update: { currentStatus: 'submitted' },
        create: {
          applicationId: application.id,
          currentStatus: 'submitted',
          checklist: [
            { id: 'transcript', label: 'Official High School Transcript', status: 'pending' },
            { id: 'fafsa', label: 'FAFSA Application', status: 'not_started' },
            { id: 'recommendation', label: 'Letter of Recommendation', status: 'not_started' },
          ],
          announcements: SAMPLE_ANNOUNCEMENTS,
        },
      });
      return submitted;
    });

    const personal = updated.section1Data as Record<string, unknown> | null;
    const applicantEmail = typeof personal?.email === 'string' ? personal.email : session.user.email;
    if (!applicantEmail) {
      return NextResponse.json({
        application: updated,
        emailSent: false,
        emailError: 'Application submitted, but no applicant email address is available for the receipt.',
      });
    }

    try {
      await sendApplicationReceiptEmail(updated, applicantEmail);
      return NextResponse.json({ application: updated, emailSent: true });
    } catch (error) {
      console.error('Application submitted, but receipt email delivery failed:', error);
      return NextResponse.json({
        application: updated,
        emailSent: false,
        emailError: error instanceof Error ? error.message : 'Receipt email delivery failed.',
      });
    }
  } catch (error) {
    console.error('Failed to submit application:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit application.' },
      { status: 500 },
    );
  }
}
