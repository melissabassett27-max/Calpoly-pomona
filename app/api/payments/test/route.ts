export const dynamic = 'force-dynamic';

import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { APPLICATION_FEE_USD, isLocalPaymentTestEnabled } from '@/lib/allpays';

export async function POST() {
  if (!isLocalPaymentTestEnabled()) {
    return NextResponse.json({ error: 'Local payment simulation is disabled.' }, { status: 404 });
  }

  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const application = await prisma.application.findFirst({
      where: { userId: session.user.id, status: 'draft' },
      orderBy: { createdAt: 'desc' },
    });
    if (!application) return NextResponse.json({ error: 'No draft application found' }, { status: 404 });
    if (!application.section1Complete || !application.section2Complete || !application.section3Complete || !application.section4Complete) {
      return NextResponse.json({ error: 'Complete all application sections before payment.' }, { status: 409 });
    }

    await prisma.applicationPayment.create({
      data: {
        applicationId: application.id,
        payRequestHash: `test_${randomUUID()}`,
        provider: 'local-test',
        amount: APPLICATION_FEE_USD,
        currency: 'USD',
        status: 'completed',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to create local test payment:', error);
    return NextResponse.json({ error: 'Could not create the local test payment.' }, { status: 500 });
  }
}
