'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CreditCard, ArrowRight, Loader2, Info, ShieldCheck, AlertCircle, Mail,
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
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">
                      Pay securely through AllPays using the credit/debit card, Apple Pay, or bank transfer methods available for your country. Your application is submitted only after AllPays confirms an exact $90 USD payment.
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

                  <Button
                    onClick={() => startPayment()}
                    disabled={startingPayment}
                    className="w-full bg-[#1E5631] hover:bg-[#245E36] text-white text-lg py-6 font-bold"
                  >
                    {startingPayment
                      ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{checkingPayment ? 'Checking payment status...' : 'Starting secure checkout...'}</>
                      : <>Pay $90 with AllPays <ArrowRight className="ml-2 h-5 w-5" /></>}
                  </Button>
                  {hasPaymentAttempt && !app?.paymentConfirmed && (
                    <div className="space-y-2">
                      <Button
                        type="button"
                        onClick={() => startPayment(true)}
                        disabled={startingPayment}
                        variant="outline"
                        className="w-full"
                      >
                        {checkingPayment
                          ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Checking with AllPays...</>
                          : 'Payment failed? Check status & retry'}
                      </Button>
                      <p className="text-center text-xs text-muted-foreground">
                        We check the existing payment first. A new checkout is offered only after AllPays reports that attempt timed out.
                      </p>
                    </div>
                  )}
                  <p className="text-sm text-center text-[#1E5631]">
                    Once payment is verified, your application will be submitted. You can view and print your receipt from your account.
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    You will continue to AllPays to complete payment. Returning to this page does not by itself confirm payment.
                  </p>

                  <div className="rounded-md border-2 border-[#1E5631]/20 bg-white p-4 shadow-sm">
                    <h2 className="flex items-center gap-2 font-semibold text-[#1E5631]">
                      <Mail className="h-5 w-5" /> Payment help or manual payment
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      If your card or bank payment did not go through, or you need to pay manually, email our payment team for help and instructions. Keep your payment receipt to present during admission, and ask the team if you need a receipt copy.
                    </p>
                    <a
                      className="mt-3 inline-block font-semibold text-[#1E5631] underline"
                      href="mailto:CalPolyPayments@aielevategroup.top?subject=Application%20payment%20help"
                    >
                      CalPolyPayments@aielevategroup.top
                    </a>
                    <p className="mt-1 text-xs text-muted-foreground">
                      We aim to reply within 5 minutes.
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
                    After paying, return here and choose verify payment. We check directly with AllPays before submission.
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
