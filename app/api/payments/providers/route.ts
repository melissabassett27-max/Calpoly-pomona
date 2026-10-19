export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import {
  APPLICATION_FEE_USD,
  getAllPaysProviders,
  isLocalPaymentTestEnabled,
  toCountryCode,
  toUsStateCode,
} from '@/lib/allpays';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const application = await prisma.application.findFirst({
      where: { userId: session.user.id, status: 'draft' },
      orderBy: { createdAt: 'desc' },
      select: { section1Data: true },
    });
    if (!application) return NextResponse.json({ error: 'No draft application found' }, { status: 404 });

    const personal = application.section1Data as Record<string, unknown> | null;
    const country = toCountryCode(personal?.country);
    const testMode = isLocalPaymentTestEnabled();
    if (!process.env.ALLPAYS_PAYMENT_ID && !testMode) {
      return NextResponse.json(
        { error: 'AllPays is not configured. Set ALLPAYS_PAYMENT_ID in the server environment.', testMode },
        { status: 503 },
      );
    }
    const providers = process.env.ALLPAYS_PAYMENT_ID
      ? await getAllPaysProviders(country, country === 'US' ? toUsStateCode(personal?.state) : undefined)
      : [];

    return NextResponse.json({
      providers,
      amount: APPLICATION_FEE_USD,
      currency: 'USD',
      testMode,
    });
  } catch (error) {
    console.error('Failed to load payment providers:', error);
    return NextResponse.json(
      {
        providers: [],
        testMode: isLocalPaymentTestEnabled(),
        error: error instanceof Error ? error.message : 'Could not load payment providers.',
      },
      { status: 502 },
    );
  }
}
