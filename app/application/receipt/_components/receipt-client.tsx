'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

type ApplicationReceipt = {
  id: string;
  applicationIdNumber: string;
  status: string;
  paymentConfirmed: boolean;
  submittedAt: string | null;
  section1Data: Record<string, unknown> | null;
  section2Data: Record<string, unknown> | null;
  section3Data: Record<string, unknown> | null;
  section4Data: Record<string, unknown> | null;
};

const SECTIONS = [
  ['Personal Information', 'section1Data'],
  ['Academic History', 'section2Data'],
  ['Supporting Information', 'section3Data'],
  ['Program Materials', 'section4Data'],
] as const;

export function ReceiptClient() {
  const router = useRouter();
  const [application, setApplication] = useState<ApplicationReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    fetch('/api/application')
      .then(async (response) => {
        if (response.status === 401) {
          if (active) setError('Please sign in to view your application receipt.');
          return null;
        }
        if (!response.ok) throw new Error('Could not load your application receipt.');
        return response.json() as Promise<ApplicationReceipt | null>;
      })
      .then((data) => {
        if (active && data) {
          if (data.status !== 'submitted' || !data.paymentConfirmed) {
            setError('Your application receipt will be available after successful submission.');
          } else {
            setApplication(data);
          }
        }
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Could not load your receipt.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 bg-[#F5F5F5] px-4 py-10">
        <article className="mx-auto max-w-3xl rounded-lg border bg-white p-6 shadow-sm print:border-0 print:shadow-none sm:p-10">
          {loading ? (
            <div className="flex min-h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#1E5631]" />
            </div>
          ) : error ? (
            <div className="space-y-4 text-center">
              <h1 className="font-display text-2xl font-bold text-[#1E5631]">Application Receipt</h1>
              <p role="status" className="text-muted-foreground">{error}</p>
              <Link href="/login"><Button variant="outline">Sign in</Button></Link>
              <Button variant="outline" onClick={() => router.push('/portal')}>Go to applicant portal</Button>
            </div>
          ) : application ? (
            <>
              <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-[#1E5631]">Cal Poly Pomona Admissions</p>
                  <h1 className="mt-2 font-display text-3xl font-bold">Application Receipt</h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Receipt #{application.applicationIdNumber}
                  </p>
                </div>
                <CheckCircle2 className="h-9 w-9 text-green-600" aria-label="Application submitted" />
              </div>

              <dl className="grid gap-3 border-y py-5 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Status</dt>
                  <dd className="font-medium capitalize">{application.status}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Submitted</dt>
                  <dd className="font-medium">
                    {application.submittedAt ? new Date(application.submittedAt).toLocaleString() : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Payment</dt>
                  <dd className="font-medium">{application.paymentConfirmed ? 'Confirmed' : 'Not confirmed'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Application fee</dt>
                  <dd className="font-medium">$90.00</dd>
                </div>
              </dl>

              <div className="mt-6 space-y-6">
                {SECTIONS.map(([title, key]) => {
                  const values = application[key] ?? {};
                  return (
                    <section key={key}>
                      <h2 className="font-display text-lg font-semibold text-[#1E5631]">{title}</h2>
                      <dl className="mt-2 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                        {Object.entries(values).map(([label, value]) => (
                          <div key={label} className="min-w-0 border-b py-2">
                            <dt className="text-xs capitalize text-muted-foreground">{label.replace(/([A-Z])/g, ' $1')}</dt>
                            <dd className="break-words text-sm">
                              {value === null || value === undefined
                                ? '—'
                                : typeof value === 'object'
                                  ? JSON.stringify(value)
                                  : String(value)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </section>
                  );
                })}
              </div>

              <div className="mt-8 flex gap-3 print:hidden">
                <Button onClick={() => window.print()} className="bg-[#1E5631] text-white hover:bg-[#245E36]">
                  <Printer className="mr-2 h-4 w-4" />Print receipt
                </Button>
                <Link href="/portal"><Button variant="outline">Applicant portal</Button></Link>
              </div>
            </>
          ) : null}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
