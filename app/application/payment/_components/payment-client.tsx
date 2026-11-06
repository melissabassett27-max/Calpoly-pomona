'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CreditCard, Loader2, Info, ShieldCheck, AlertCircle, Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import { ApplicationStepper } from '../../_components/application-stepper';

export function PaymentClient() {
  const router = useRouter();
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentOptionsError, setPaymentOptionsError] = useState('');
  const [testMode, setTestMode] = useState(false);
  const [startingPayment, setStartingPayment] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [hasStartedPayment, setHasStartedPayment] = useState(false);
  const [applicationError, setApplicationError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [appResponse, paymentResponse] = await Promise.all([
          fetch('/api/application', { signal: AbortSignal.timeout(20_000) }),
          fetch('/api/payment/allpays', { signal: AbortSignal.timeout(20_000) }),
        ]);
        const [appData, paymentData] = await Promise.all([
          appResponse.json(),
          paymentResponse.json(),
        ]);
        if (!appResponse.ok) throw new Error(appData.error ?? 'Could not load your application.');
        if (!active) return;
        setApp(appData);

        if (!paymentResponse.ok) throw new Error(paymentData.error ?? 'Could not load payment options.');
        setTestMode(paymentData.testMode === true);
      } catch (error) {
        if (active) {
          setPaymentOptionsError(error instanceof Error ? error.message : 'Could not load your application or payment options.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => { active = false; };
  }, []);

  const startPayment = async (checkBeforeRetry = false) => {
    setStartingPayment(true);
    setCheckingPayment(checkBeforeRetry);
    try {
      const response = await fetch(`/api/payment/allpays${checkBeforeRetry ? '?retry=true' : ''}`, {
        method: 'POST',
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 409 && Array.isArray(data.issues)) {
          setApplicationError([
            data.error ?? 'Complete the required application fields before payment.',
            ...data.issues,
          ].join(' '));
        }
        throw new Error(data.error ?? 'Could not start payment.');
      }
      if (typeof data.checkoutUrl !== 'string') {
        if (data.paymentConfirmed === true) {
          setApp((current: any) => ({ ...current, paymentConfirmed: true }));
          toast.success('AllPays confirms your payment. Choose VERIFY PAYMENT & SUBMIT to finish.');
          return;
        }
        throw new Error('AllPays did not return a valid checkout URL.');
      }
      setApplicationError('');
      setHasStartedPayment(true);
      window.location.assign(data.checkoutUrl);
    } catch (error) {
      if (checkBeforeRetry) {
        setApplicationError(error instanceof Error ? error.message : 'Could not check the AllPays payment status.');
      }
      toast.error(error instanceof Error ? error.message : 'Could not start payment.');
    } finally {
      setStartingPayment(false);
      setCheckingPayment(false);
    }
  };

  const simulatePayment = async () => {
    setSimulating(true);
    try {
      const response = await fetch('/api/payments/test', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Could not simulate payment.');
      setHasStartedPayment(true);
      toast.success('Local test payment recorded. Confirm submission to test the receipt flow.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not simulate payment.');
    } finally {
      setSimulating(false);
    }
  };

  const handleSubmit = async () => {
    if (!app?.id) return;
    setSubmitting(true);
    try {
      const response = await fetch('/api/application/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: app.id }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 409) {
          setApplicationError([
            data.error ?? 'Complete the required application fields before submitting.',
            ...(Array.isArray(data.issues) ? data.issues : []),
          ].join(' '));
        }
        throw new Error(data.error ?? 'Submission failed. Please try again.');
      }

      setApp(data.application);
      setApplicationError('');
      toast.success('Application submitted successfully.');
      router.push('/application/receipt');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#1E5631]" /></div>
      <SiteFooter />
    </div>
  );

  const s1 = app?.section1Data ?? {};
  const s4 = app?.section4Data ?? {};
  const hasPaymentAttempt = (app?.payments?.length ?? 0) > 0 || hasStartedPayment;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <ApplicationStepper currentStep={6} app={app} />
      <main className="flex-1 bg-[#F5F5F5]">
        <div className="bg-[#1E5631] text-white py-8">
          <div className="max-w-[900px] mx-auto px-4">
            <h1 className="font-display text-2xl md:text-3xl font-bold">Application Payment</h1>
            <p className="mt-1 text-white/80">Complete your $90 application fee to submit your application.</p>
          </div>
        </div>

        <div className="max-w-[900px] mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg text-[#1E5631] flex items-center gap-2">
                    <CreditCard className="w-5 h-5" /> Payment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex gap-3">
                    <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-900">
                      All payments are processed directly to the school account only after admissions staff review your submitted documents and confirm your application status. Due to recent cyber incidents and document fraud concerns, all admissions verification is manual. Applicants are not required to pay until the school has reviewed the documents and sent the official payment instructions by email. This protects applicants and helps ensure that by the time payment is made, the applicant is already confident the admissions process is valid and verified.
                    </p>
                  </div>

                  {applicationError && (
                    <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950" role="alert">
                      <AlertCircle className="mr-2 inline h-4 w-4" />
                      {applicationError}
                      {app?.id && (
                        <Link className="ml-1 font-semibold underline" href={`/application/review?id=${app.id}`}>
                          Review and edit your application
                        </Link>
                      )}
                    </div>
                  )}

                  {paymentOptionsError && (
                    <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900" role="alert">
                      <AlertCircle className="mr-2 inline h-4 w-4" />
                      {paymentOptionsError}
                    </div>
                  )}

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

                  <Button
                    onClick={() => startPayment()}
                    disabled={startingPayment || checkingPayment}
                    className="w-full bg-slate-300 text-slate-500 text-lg py-6 font-bold cursor-not-allowed"
                  >
                    Payment instructions sent after admissions review
                  </Button>

                  <p className="text-sm text-center text-[#1E5631]">
                    Payment will only be requested after admissions staff have reviewed your documents and sent the official school payment instructions. Any receipt will be sent to you by email from the school payment or admissions office.
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    No direct online payment is active at this time. All payment communication must be through official school emails only.
                  </p>

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

                  {testMode && (
                    <div className="space-y-3 rounded-md border border-amber-300 bg-amber-50 p-4">
                      <p className="text-sm font-medium text-amber-950">Local test mode</p>
                      <p className="text-xs text-amber-900">
                        Simulates a $90 payment without contacting AllPays or moving money. Testing submission still marks this application submitted in the configured database. Use only with a test application and a non-production database.
                      </p>
                      <Button
                        onClick={simulatePayment}
                        disabled={simulating}
                        variant="outline"
                        className="w-full border-amber-500 text-amber-950"
                      >
                        {simulating
                          ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Recording test payment...</>
                          : 'Simulate payment for local testing'}
                      </Button>
                    </div>
                  )}

                  <hr />

                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || (!hasPaymentAttempt && !app?.paymentConfirmed)}
                    className="w-full bg-[#D4A017] hover:bg-[#b8890f] text-white text-lg py-6 font-bold"
                  >
                    {submitting ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Verifying payment & submitting...</>
                    ) : (
                      <><ShieldCheck className="w-5 h-5 mr-2" />VERIFY PAYMENT & SUBMIT</>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Once admissions staff send the official school payment instructions and you complete the payment to the school account, return to this page and use the verification steps provided by the admissions team. Payment receipts are sent by email from the official school accounts above.
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
