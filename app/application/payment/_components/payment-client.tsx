'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, CheckCircle2, ArrowRight, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { ApplicationStepper } from '../../_components/application-stepper';

const PAYMENT_LINK = process.env.NEXT_PUBLIC_PAYMENT_LINK ?? '#payment-coming-soon';

export function PaymentClient() {
  const router = useRouter();
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchApp = useCallback(async () => {
    try {
      const res = await fetch('/api/application');
      if (res.ok) setApp(await res.json());
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchApp(); }, [fetchApp]);

  const handleSubmit = async () => {
    if (!app?.id) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/application/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: app.id }),
      });
      if (!res.ok) throw new Error();
      toast.success('Application submitted successfully!');
      router.push('/portal');
    } catch {
      toast.error('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col"><SiteHeader /><div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#1E5631]" /></div><SiteFooter /></div>
  );

  const s1 = app?.section1Data ?? {};
  const s4 = app?.section4Data ?? {};

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <ApplicationStepper currentStep={6} app={app} />
      <main className="flex-1 bg-[#F5F5F5]">
        <div className="bg-[#1E5631] text-white py-8">
          <div className="max-w-[900px] mx-auto px-4">
            <h1 className="font-display text-2xl md:text-3xl font-bold">Application Payment</h1>
            <p className="mt-1 text-white/80">Complete your payment to submit your application.</p>
          </div>
        </div>

        <div className="max-w-[900px] mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main content */}
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
                      Your application will be submitted upon successful payment. The $90 application fee is non-refundable regardless of admission decision.
                    </p>
                  </div>

                  <a href={PAYMENT_LINK} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-[#1E5631] hover:bg-[#245E36] text-white text-lg py-6 font-bold">
                      Apply Now <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </a>
                  <p className="text-xs text-muted-foreground text-center">
                    After completing payment, click &ldquo;Confirm Submission&rdquo; below.
                  </p>

                  <hr />

                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full bg-[#D4A017] hover:bg-[#b8890f] text-white text-lg py-6 font-bold"
                  >
                    {submitting ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Submitting...</>
                    ) : (
                      <><CheckCircle2 className="w-5 h-5 mr-2" />CONFIRM SUBMISSION</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Order summary sidebar */}
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
