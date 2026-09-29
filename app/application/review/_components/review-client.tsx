'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle2, XCircle, Edit, Loader2, ArrowRight, Shield } from 'lucide-react';
import { ApplicationStepper } from '../../_components/application-stepper';

export function ReviewClient() {
  const [app, setApp] = useState<any>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [certified, setCertified] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/application');
      if (res.ok) {
        const data = await res.json();
        setApp(data);
        if (data?.id) {
          const docRes = await fetch(`/api/documents?applicationId=${data.id}`);
          if (docRes.ok) setDocs(await docRes.json());
        }
      }
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return (
    <div className="min-h-screen flex flex-col"><SiteHeader /><div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#1E5631]" /></div><SiteFooter /></div>
  );

  const s1 = app?.section1Data ?? {};
  const s2 = app?.section2Data ?? {};
  const s3 = app?.section3Data ?? {};
  const s4 = app?.section4Data ?? {};
  const appId = app?.id ?? '';

  const sections = [
    { num: 1, title: 'Personal Information', complete: app?.section1Complete, slug: 'personal', items: [
      ['Name', `${s1?.firstName ?? ''} ${s1?.middleName ?? ''} ${s1?.lastName ?? ''}`],
      ['Date of Birth', s1?.dateOfBirth ?? 'Not provided'],
      ['Citizenship', s1?.citizenship ?? 'Not provided'],
      ['Email', s1?.email ?? 'Not provided'],
      ['Phone', s1?.phone ?? 'Not provided'],
      ['Address', `${s1?.street ?? ''}, ${s1?.city ?? ''} ${s1?.state ?? ''} ${s1?.zip ?? ''}`],
      ['Emergency Contact', `${s1?.emergencyName ?? ''} (${s1?.emergencyRelationship ?? ''})`],
    ]},
    { num: 2, title: 'Academic History', complete: app?.section2Complete, slug: 'academic', items: [
      ['High School', `${s2?.hsName ?? 'Not provided'}, ${s2?.hsCity ?? ''} ${s2?.hsState ?? ''}`],
      ['HS GPA', s2?.hsGpa ?? 'Not provided'],
      ['A-G Complete', s2?.agComplete ?? 'Not provided'],
      ['SAT', s2?.satScore || 'Not submitted'],
      ['ACT', s2?.actScore || 'Not submitted'],
      ['Colleges Attended', `${(s2?.colleges ?? []).length} listed`],
    ]},
    { num: 3, title: 'Supporting Information', complete: app?.section3Complete, slug: 'supporting', items: [
      ['Work Experience', `${(s3?.work ?? []).length} entries`],
      ['Activities', `${(s3?.activities ?? []).length} entries`],
      ['Awards', `${(s3?.awards ?? []).length} entries`],
      ['Essay 1', s3?.essay1 ? `${(s3.essay1 as string).split(/\s+/).filter(Boolean).length} words` : 'Not written'],
      ['Essay 2', s3?.essay2 ? `${(s3.essay2 as string).split(/\s+/).filter(Boolean).length} words` : 'Not written'],
    ]},
    { num: 4, title: 'Program Materials', complete: app?.section4Complete, slug: 'program', items: [
      ['College', s4?.college ?? 'Not selected'],
      ['Major', s4?.major ?? 'Not selected'],
      ['Entry Term', s4?.entryTerm ?? 'Not selected'],
      ['Enrollment', s4?.enrollmentType ?? 'Not selected'],
      ['Housing', s4?.housing ?? 'Not answered'],
    ]},
  ];

  const allComplete = sections.every((s) => s.complete);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <ApplicationStepper currentStep={5} app={app} />
      <main className="flex-1 bg-[#F5F5F5]">
        <div className="bg-[#1E5631] text-white py-8">
          <div className="max-w-[900px] mx-auto px-4">
            <h1 className="font-display text-2xl md:text-3xl font-bold">Review Your Application</h1>
            <p className="mt-1 text-white/80">Please review all sections before proceeding to payment.</p>
          </div>
        </div>

        <div className="max-w-[900px] mx-auto px-4 py-8 space-y-6">
          <Accordion type="multiple" defaultValue={sections.map((s) => String(s.num))} className="space-y-4">
            {sections.map((section) => (
              <AccordionItem key={section.num} value={String(section.num)} className="bg-white rounded-lg shadow-sm border">
                <AccordionTrigger className="px-5 py-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    {section.complete ? (
                      <CheckCircle2 className="w-5 h-5 text-[#1E5631] shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive shrink-0" />
                    )}
                    <span className="font-display font-semibold text-[#1A1A1A]">Step {section.num}: {section.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-4">
                  <div className="space-y-2">
                    {section.items.map(([label, value]) => (
                      <div key={label as string} className="flex justify-between text-sm py-1 border-b border-dashed last:border-0">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium text-right">{value || 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                  <Link href={`/application/${section.slug}?id=${appId}`}>
                    <Button variant="outline" size="sm" className="mt-3"><Edit className="w-3 h-3 mr-1" />Edit Section</Button>
                  </Link>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Documents */}
          <Card>
            <CardHeader><CardTitle className="font-display text-lg text-[#1E5631]">Uploaded Documents</CardTitle></CardHeader>
            <CardContent>
              {(docs ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
              ) : (
                <div className="space-y-2">
                  {docs.map((doc: any) => (
                    <div key={doc?.id} className="flex items-center justify-between text-sm bg-muted/50 rounded p-2">
                      <span>{doc?.filename ?? 'Unknown'} ({doc?.documentType ?? ''})</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-[#1E5631]/10 text-[#1E5631] font-medium">{doc?.status ?? 'received'}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Certification */}
          <Card className="border-[#D4A017]/30">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="certify"
                  checked={certified}
                  onCheckedChange={(v) => setCertified(Boolean(v))}
                  className="mt-1"
                />
                <div>
                  <Label htmlFor="certify" className="text-sm font-medium cursor-pointer">
                    I certify that all information provided in this application is accurate and complete to the best of my knowledge.
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">Providing false information may result in rescission of admission or dismissal.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {!allComplete && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 text-sm text-destructive">
              <strong>Incomplete sections:</strong> Please complete all four sections before proceeding.
            </div>
          )}

          <div className="flex justify-center">
            <Button
              onClick={() => router.push(`/application/payment?id=${appId}`)}
              disabled={!certified || !allComplete}
              className="bg-[#D4A017] hover:bg-[#b8890f] text-white text-lg px-10 py-6 font-bold shadow-lg"
            >
              <Shield className="w-5 h-5 mr-2" />
              PROCEED TO PAYMENT <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
