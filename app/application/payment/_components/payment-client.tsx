'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CreditCard, ArrowRight, Loader2, Info, ShieldCheck, AlertCircle, Mail, RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { ApplicationStepper } from '../../_components/application-stepper';

type PaymentProvider = {
  id: string;
  name: string;
  description?: string;
  notes?: string;
};

export function PaymentClient() {
  const router = useRouter();
  const [app, setApp] = useState<any>(null);
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [loading, setLoading] = useState(true);
  const [providerError, setProviderError] = useState('');
  const [testMode, setTestMode] = useState(false);
  const [startingPayment, setStartingPayment] = useState(false);
  const [retryingProviders, setRetryingProviders] = useState(false);
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
          fetch('/api/payments/providers', { signal: AbortSignal.timeout(20_000) }),
        ]);
        const [appData, paymentData] = await Promise.all([
          appResponse.json(),
          paymentResponse.json(),
        ]);
        if (!appResponse.ok) throw new Error(appData.error ?? 'Could not load your application.');
        if (!active) return;
        setApp(appData);

        if (!active) return;
        setTestMode(paymentData.testMode === true);
        if (!paymentResponse.ok) {
          setProviders([]);
          setProviderError(paymentData.error ?? 'Could not load payment options.');
          return;
        }
        const availableProviders = (paymentData.providers ?? []) as PaymentProvider[];
        setProviders(availableProviders);
        setSelectedProvider(availableProviders[0]?.id ?? '');
        setProviderError(availableProviders.length > 0 ? '' : 'No payment providers are available right now.');
      } catch (error) {
        if (active) {
          setProviderError(error instanceof Error ? error.message : 'Could not load your application or payment options.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => { active = false; };
  }, []);

  const retryPaymentOptions = async () => {
    setRetryingProviders(true);
    try {
      const response = await fetch('/api/payments/providers');
      const data = await response.json();
      setTestMode(data.testMode === true);
      if (!response.ok) throw new Error(data.error ?? 'Could not load payment options.');
      const availableProviders = (data.providers ?? []) as PaymentProvider[];
      setProviders(availableProviders);
      setSelectedProvider(availableProviders[0]?.id ?? '');
      setProviderError(availableProviders.length > 0 ? '' : 'No payment providers are available right now.');
    } catch (error) {
      setProviders([]);
      setProviderError(error instanceof Error ? error.message : 'Could not load payment options.');
    } finally {
      setRetryingProviders(false);
    }
  };

  const startPayment = async () => {
    if (!selectedProvider) return;
    setStartingPayment(true);
    try {
      const response = await fetch('/api/payments/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: selectedProvider }),
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
      setApplicationError('');
      setHasStartedPayment(true);
      window.location.assign(data.checkoutUrl);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not start payment.');
      setStartingPayment(false);
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
      if (data.emailSent) {
        toast.success('Application submitted. Your receipt and application details were emailed to you.');
      } else {
        toast.error(data.emailError ?? 'Application submitted, but the receipt email could not be sent.');
      }
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
                      Your application is submitted only after AllPays confirms an exact $90 USD payment.
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

                  {providerError && (
                    <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900" role="alert">
                      <AlertCircle className="mr-2 inline h-4 w-4" />
                      {providerError}
                    </div>
                  )}

                  {providers.length === 0 && (
                    <Button
                      type="button"
                      onClick={retryPaymentOptions}
                      disabled={retryingProviders}
                      variant="outline"
                      className="w-full"
                    >
                      {retryingProviders
                        ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Checking providers...</>
                        : <><RefreshCw className="mr-2 h-4 w-4" />Retry payment options</>}
                    </Button>
                  )}

                  {providers.length > 0 && (
                    <div>
                      <label htmlFor="payment-provider" className="mb-2 block text-sm font-medium">
                        Choose a payment provider
                      </label>
                      <select
                        id="payment-provider"
                        value={selectedProvider}
                        onChange={(event) => setSelectedProvider(event.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-3 text-sm"
                      >
                        {providers.map((provider) => (
                          <option key={provider.id} value={provider.id}>
                            {provider.name}{provider.notes ? ` — ${provider.notes}` : ''}
                          </option>
                        ))}
                      </select>
                      {providers.find((provider) => provider.id === selectedProvider)?.description && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {providers.find((provider) => provider.id === selectedProvider)?.description}
                        </p>
                      )}
                    </div>
                  )}

                  {providers.length > 0 ? (
                    <Button
                      onClick={startPayment}
                      disabled={startingPayment || !selectedProvider}
                      className="w-full bg-[#1E5631] hover:bg-[#245E36] text-white text-lg py-6 font-bold"
                    >
                      {startingPayment
                        ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Starting secure checkout...</>
                        : <>Pay $90 with AllPays <ArrowRight className="ml-2 h-5 w-5" /></>}
                    </Button>
                  ) : (
                    <Button disabled className="w-full bg-[#1E5631] text-white text-lg py-6 font-bold">
                      Payment checkout unavailable
                    </Button>
                  )}
                  <p className="text-sm text-center text-[#1E5631]">
                    Once your application is submitted successfully, we will email you the full application details and a link to your online-generated receipt.
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    You will continue to AllPays to complete payment. Returning to this page does not by itself confirm payment.
                  </p>

                  {testMode && (
                    <div className="space-y-3 rounded-md border border-amber-300 bg-amber-50 p-4">
                      <p className="text-sm font-medium text-amber-950">Local test mode</p>
                      <p className="text-xs text-amber-900">
                        Simulates a $90 payment without contacting AllPays or moving money. Testing submission still marks this application submitted in the configured database and may send its receipt email. Use only with a test application and a non-production database.
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
