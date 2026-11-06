'use client';

import { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Loader2, Info, Mail,
} from 'lucide-react';
import { ApplicationStepper } from '../../_components/application-stepper';

export function PaymentClient() {
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const appResponse = await fetch('/api/application', { signal: AbortSignal.timeout(20_000) });
        const appData = await appResponse.json();
        if (!appResponse.ok) throw new Error(appData.error ?? 'Could not load your application.');
        if (!active) return;
        setApp(appData);
      } catch (error) {
        if (active) {
          console.error('Could not load the application for document verification:', error);
          setLoadError(error instanceof Error ? error.message : 'Could not load your application details.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => { active = false; };
  }, []);

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#1E5631]" /></div>
      <SiteFooter />
    </div>
  );

  const s1 = app?.section1Data ?? {};
  const s4 = app?.section4Data ?? {};
  const applicationReference = typeof app?.id === 'string' ? app.id : '';
  const verificationEmailSubject = `Document verification and payment - Application ${applicationReference}`;
  const verificationEmailBody = `Hello Payments Team,\n\nI am requesting document verification and official payment instructions.\n\nApplication reference: ${applicationReference}\n\nPlease review my application documents and let me know the next steps. I can add any additional information here before sending this email.\n\nThank you.`;
  const gmailComposeUrl = applicationReference
    ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent('CalPolyPayments@aielevategroup.top')}&su=${encodeURIComponent(verificationEmailSubject)}&body=${encodeURIComponent(verificationEmailBody)}`
    : '';

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <ApplicationStepper currentStep={6} app={app} />
      <main className="flex-1 bg-[#F5F5F5]">
        <div className="bg-[#1E5631] text-white py-8">
          <div className="max-w-[900px] mx-auto px-4">
            <h1 className="font-display text-2xl md:text-3xl font-bold">Document Verification</h1>
            <p className="mt-1 text-white/80">Contact admissions to have your documents reviewed before payment.</p>
          </div>
        </div>

        <div className="max-w-[900px] mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg text-[#1E5631] flex items-center gap-2">
                    <Mail className="w-5 h-5" /> Admissions Review
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex gap-3">
                    <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-900">
                      Admissions staff will review your submitted documents first. Do not make a payment until the school has verified your documents and emailed you official payment instructions. This review-first process helps protect applicants and confirms the next steps before any payment is requested.
                    </p>
                  </div>

                  <div className="rounded-md border border-slate-200 bg-slate-100 p-4 opacity-60">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-500">Stripe</p>
                        <p className="text-xs text-slate-500">Previously used for online payment processing</p>
                      </div>
                      <span className="rounded-full border border-slate-300 bg-slate-200 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                        Unavailable
                      </span>
                    </div>
                  </div>

                  {gmailComposeUrl ? (
                    <a
                      href={gmailComposeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#1E5631] px-6 py-6 text-lg font-bold text-white transition-colors hover:bg-[#245E36] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E5631] focus-visible:ring-offset-2"
                    >
                      <Mail className="h-5 w-5" /> Submit details for verification
                    </a>
                  ) : (
                    <Button
                      type="button"
                      disabled
                      className="w-full bg-[#1E5631] text-white text-lg py-6 font-bold"
                    >
                      <Mail className="h-5 w-5" /> Submit details for verification
                    </Button>
                  )}

                  <p className="text-sm text-center text-[#1E5631]">
                    This opens a prefilled Gmail draft addressed to the payments inbox. Add any missing information or attachments, then press Send. The email is not sent automatically.
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    Application reference: <span className="font-medium">{applicationReference || 'Loading...'}</span>
                  </p>
                  {loadError && (
                    <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
                      {loadError} Please refresh the page and try again.
                    </p>
                  )}

                  <div className="rounded-md border-2 border-[#1E5631]/20 bg-white p-4 shadow-sm">
                    <h2 className="flex items-center gap-2 font-semibold text-[#1E5631]">
                      <Mail className="h-5 w-5" /> Admissions and payment support
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Payment and document-related communication must be carried out through the official school emails below. We do not offer live chat or direct messaging with staff through personal emails. If your documents cannot be verified online, you will be asked to submit them physically.
                    </p>
                    <div className="mt-3 space-y-2 text-sm">
                      <a className="block font-semibold text-[#1E5631] underline" href="mailto:CalPolyPayments@aielevategroup.top?subject=Application%20payment%20verification">
                        CalPolyPayments@aielevategroup.top
                      </a>
                      <a className="block font-semibold text-[#1E5631] underline" href="mailto:accounts@aielevategroup.top?subject=Manual%20school%20payment%20instructions">
                        accounts@aielevategroup.top
                      </a>
                      <a className="block font-semibold text-[#1E5631] underline" href="mailto:CalpolyPomonaSupport@aielevategroup.top?subject=Admissions%20document%20verification">
                        CalpolyPomonaSupport@aielevategroup.top
                      </a>
                      <a className="block font-semibold text-[#1E5631] underline" href="mailto:info@aielevategroup.top?subject=Admissions%20information">
                        info@aielevategroup.top
                      </a>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Replies are handled by the school team and generally respond within 5 minutes during active office support hours.
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    No online checkout is available here. Payment details and receipts will be sent by the school through its official email accounts after document review.
                  </p>

                  <div className="rounded-md border bg-muted/30 p-4">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1E5631]">
                      <Mail className="h-4 w-4" /> Need help?
                    </h2>
                    <div className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
                      <div>
                        <p className="font-medium">Payment issues or questions</p>
                        <ul className="mt-1 space-y-1">
                          <li><a className="text-[#1E5631] underline" href="mailto:CalPolyPayments@aielevategroup.top">CalPolyPayments@aielevategroup.top</a></li>
                          <li><a className="text-[#1E5631] underline" href="mailto:accounts@aielevategroup.top">accounts@aielevategroup.top</a></li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium">Other application issues</p>
                        <ul className="mt-1 space-y-1">
                          <li><a className="text-[#1E5631] underline" href="mailto:CalpolyPomonaSupport@aielevategroup.top">CalpolyPomonaSupport@aielevategroup.top</a></li>
                          <li><a className="text-[#1E5631] underline" href="mailto:info@aielevategroup.top">info@aielevategroup.top</a></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-24">
                <CardHeader className="bg-[#F5F5F5]">
                  <CardTitle className="font-display text-base">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Applicant</span>
                    <span className="font-medium">{s1?.firstName ?? ''} {s1?.lastName ?? ''}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Program</span>
                    <span className="font-medium text-right">{s4?.major ?? 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Term</span>
                    <span className="font-medium">{s4?.entryTerm ?? 'N/A'}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Application Fee</span>
                    <span className="font-bold text-[#1A1A1A]">$90.00</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Non-refundable</p>
                  <hr />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-[#1E5631]">$90.00</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
