'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2, Clock, AlertCircle, FileText, Upload, Bell, DollarSign,
  GraduationCap, User, Calendar, Hash, ExternalLink, Loader2, BookOpen, Award, Phone, Mail, MapPin, MessageSquare
} from 'lucide-react';
import { PORTAL_STATUSES, SAMPLE_SCHOLARSHIPS } from '@/lib/constants';
import { toast } from 'sonner';
import { FadeIn, SlideIn, Stagger, StaggerItem } from '@/components/ui/animate';
import { SafeDate } from '@/components/safe-format';

interface Props {
  userName: string;
}

export function PortalClient({ userName }: Props) {
  const router = useRouter();
  const [app, setApp] = useState<any>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [portal, setPortal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/application');
      if (res.ok) {
        const data = await res.json();
        setApp(data);
        setPortal(data?.portalStatus);
        if (data?.id) {
          const docRes = await fetch(`/api/documents?applicationId=${data.id}`);
          if (docRes.ok) setDocs(await docRes.json());
        }
      }
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpload = async (file: File, docType: string) => {
    if (!app?.id) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('File exceeds 10MB limit'); return; }
    setUploading(true);
    try {
      const presignRes = await fetch('/api/upload/presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, contentType: file.type, fileSize: file.size }),
      });
      if (!presignRes.ok) throw new Error();
      const { uploadUrl, cloud_storage_path } = await presignRes.json();
      await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: app.id, documentType: docType, filename: file.name, cloudStoragePath: cloud_storage_path, contentType: file.type }),
      });
      toast.success('Document uploaded!');
      fetchData();
    } catch { toast.error('Upload failed'); } finally { setUploading(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col"><SiteHeader /><div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#1E5631]" /></div><SiteFooter /></div>
  );

  // If no submitted application, redirect to apply
  if (!app || app?.status === 'draft') {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center bg-[#F5F5F5] p-4">
          <Card className="max-w-md text-center">
            <CardContent className="p-8">
              <GraduationCap className="w-12 h-12 text-[#1E5631] mx-auto mb-4" />
              <h2 className="font-display text-xl font-bold text-[#1A1A1A] mb-2">No Submitted Application</h2>
              <p className="text-muted-foreground mb-4">Complete and submit your application to access the portal.</p>
              <Link href={app?.id ? `/application/personal?id=${app.id}` : '/apply'}>
                <Button className="bg-[#1E5631] hover:bg-[#245E36] text-white">Continue Application</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const s1 = app?.section1Data ?? {};
  const s4 = app?.section4Data ?? {};
  const currentStatus = portal?.currentStatus ?? 'submitted';
  const checklist = portal?.checklist ?? [];
  const announcements = portal?.announcements ?? [];
  const pendingItems = (checklist as any[]).filter((c: any) => c?.status !== 'complete');

  const firstName = s1?.firstName ?? (userName?.split(' ')?.[0] ?? 'Applicant');
  const submittedDate = app?.submittedAt ?? new Date().toISOString();
  const communications = [
    {
      id: 'c1',
      from: 'Office of Admissions',
      subject: 'We received your application',
      date: submittedDate,
      body: `Hi ${firstName}, thank you for applying to Cal Poly Pomona. Your application has been received and is now being processed. You can track its status right here in your portal.`,
    },
    {
      id: 'c2',
      from: 'Admissions Processing',
      subject: 'Next steps & document checklist',
      date: submittedDate,
      body: 'Please make sure any outstanding items in your Action Items list are completed. Upload official transcripts and test scores in the Document Center so we can continue reviewing your file.',
    },
    {
      id: 'c3',
      from: 'Financial Aid Office',
      subject: 'Complete your FAFSA for aid consideration',
      date: submittedDate,
      body: 'To be considered for financial aid and scholarships, submit your FAFSA using school code 001144. Visit the Financial Aid & Scholarships section for details.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 bg-[#F5F5F5]">
        {/* Portal header */}
        <div className="bg-[#1E5631] text-white py-8">
          <div className="max-w-[1200px] mx-auto px-4">
            <FadeIn>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Welcome back,</p>
                  <h1 className="font-display text-2xl font-bold">{userName}</h1>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-4 py-8 space-y-8">
          {/* Status Tracker */}
          <FadeIn>
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg text-[#1E5631]">Application Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between overflow-x-auto gap-0 py-4">
                  {PORTAL_STATUSES.map((status, i) => {
                    const statusIndex = PORTAL_STATUSES.findIndex((s) => s.id === currentStatus);
                    const isComplete = i <= statusIndex;
                    const isCurrent = i === statusIndex;
                    return (
                      <div key={status.id} className="flex items-center flex-1 min-w-0">
                        <div className="flex flex-col items-center text-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            isComplete ? 'bg-[#1E5631] text-white' : 'bg-muted text-muted-foreground'
                          } ${isCurrent ? 'ring-4 ring-[#D4A017]/30' : ''}`}>
                            {isComplete ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                          </div>
                          <span className={`text-xs mt-2 max-w-[80px] ${isCurrent ? 'font-bold text-[#1E5631]' : 'text-muted-foreground'}`}>
                            {status.label}
                          </span>
                          {isCurrent && app?.submittedAt && (
                            <span className="text-[10px] text-[#D4A017] mt-0.5">
                              <SafeDate date={app.submittedAt} options={{ dateStyle: 'short' }} />
                            </span>
                          )}
                        </div>
                        {i < PORTAL_STATUSES.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-1 ${i < statusIndex ? 'bg-[#1E5631]' : 'bg-muted'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Action Items */}
              <SlideIn from="left">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="font-display text-lg text-[#1E5631] flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" /> Action Items
                    </CardTitle>
                    {pendingItems.length > 0 && (
                      <Badge className="bg-destructive text-white">{pendingItems.length} pending</Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    {(checklist as any[]).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No action items at this time.</p>
                    ) : (
                      <div className="space-y-3">
                        {(checklist as any[]).map((item: any) => (
                          <div key={item?.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                            <div className="flex items-center gap-3">
                              {item?.status === 'complete' ? (
                                <CheckCircle2 className="w-5 h-5 text-[#1E5631] shrink-0" />
                              ) : (
                                <Clock className="w-5 h-5 text-[#D4A017] shrink-0" />
                              )}
                              <span className="text-sm">{item?.label ?? ''}</span>
                            </div>
                            <Badge variant={item?.status === 'complete' ? 'default' : 'outline'} className={item?.status === 'complete' ? 'bg-[#1E5631]' : ''}>
                              {item?.status === 'complete' ? 'Complete' : item?.status === 'pending' ? 'Pending' : 'Not Started'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </SlideIn>

              {/* Document Center */}
              <SlideIn from="left" delay={0.1}>
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display text-lg text-[#1E5631] flex items-center gap-2">
                      <FileText className="w-5 h-5" /> Document Center
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(docs ?? []).length > 0 && (
                      <div className="space-y-2">
                        {docs.map((doc: any) => (
                          <div key={doc?.id} className="flex items-center justify-between text-sm bg-muted/50 rounded p-3">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-[#1E5631]" />
                              <span>{doc?.filename ?? 'Unknown'}</span>
                              <span className="text-xs text-muted-foreground">({doc?.documentType ?? ''})</span>
                            </div>
                            <Badge variant="outline" className="text-[#1E5631] border-[#1E5631]/30">{doc?.status ?? 'Received'}</Badge>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="border-2 border-dashed border-border rounded-md p-6 text-center">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-3">Upload additional documents</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {['Transcript', 'Test Scores', 'Letter of Recommendation', 'Financial Document', 'Other'].map((type) => (
                          <label key={type} className="cursor-pointer">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden"
                              onChange={(e) => { const f = e.target?.files?.[0]; if (f) handleUpload(f, type); }}
                              disabled={uploading}
                            />
                            <Button variant="outline" size="sm" asChild disabled={uploading}>
                              <span>{type}</span>
                            </Button>
                          </label>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </SlideIn>

              {/* Financial Aid */}
              <SlideIn from="left" delay={0.2}>
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display text-lg text-[#1E5631] flex items-center gap-2">
                      <DollarSign className="w-5 h-5" /> Financial Aid & Scholarships
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* FAFSA */}
                    <div className="bg-muted/50 rounded-md p-4">
                      <h4 className="font-semibold text-sm mb-2">FAFSA Status</h4>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-[#D4A017]" />
                        <span>Not Started</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">CPP Federal School Code: <span className="font-mono font-bold">001144</span></p>
                      <a href="https://studentaid.gov" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="mt-2">
                          <ExternalLink className="w-3 h-3 mr-1" /> Go to studentaid.gov
                        </Button>
                      </a>
                    </div>

                    {/* Scholarships */}
                    <div>
                      <h4 className="font-semibold text-sm mb-3">Available Scholarships</h4>
                      <Stagger className="space-y-3">
                        {SAMPLE_SCHOLARSHIPS.map((s) => (
                          <StaggerItem key={s.name}>
                            <div className="border rounded-md p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h5 className="font-semibold text-sm text-[#1A1A1A]">{s.name}</h5>
                                  <p className="text-xs text-muted-foreground mt-1">{s.description}</p>
                                </div>
                                <Badge className="bg-[#D4A017] text-white shrink-0">{s.amount}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">Deadline: {s.deadline}</p>
                            </div>
                          </StaggerItem>
                        ))}
                      </Stagger>
                    </div>

                    {/* Cost table */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Estimated Cost of Attendance (Annual)</h4>
                      <div className="text-sm space-y-1">
                        {[
                          ['Tuition & Fees', '$7,432'],
                          ['Room & Board', '$16,890'],
                          ['Books & Supplies', '$1,100'],
                          ['Personal Expenses', '$2,000'],
                        ].map(([label, val]) => (
                          <div key={label} className="flex justify-between py-1 border-b border-dashed">
                            <span className="text-muted-foreground">{label}</span>
                            <span className="font-medium">{val}</span>
                          </div>
                        ))}
                        <div className="flex justify-between py-1 font-bold">
                          <span>Total Estimated</span>
                          <span className="text-[#1E5631]">$27,422</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </SlideIn>

              {/* Application Communications */}
              <SlideIn from="left" delay={0.3}>
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display text-lg text-[#1E5631] flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" /> Application Communications
                    </CardTitle>
                    <CardDescription>Messages and updates from the Office of Admissions regarding your application.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {communications.map((m) => (
                      <div key={m.id} className="flex gap-3 p-3 rounded-md border bg-muted/40">
                        <div className="w-9 h-9 rounded-full bg-[#1E5631]/10 flex items-center justify-center shrink-0">
                          <Mail className="w-4 h-4 text-[#1E5631]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-sm text-[#1A1A1A]">{m.subject}</p>
                            <span className="text-[10px] text-muted-foreground shrink-0"><SafeDate date={m.date} options={{ dateStyle: 'medium' }} /></span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">From: {m.from}</p>
                          <p className="text-sm text-muted-foreground mt-1">{m.body}</p>
                        </div>
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground pt-1">
                      Need help? Reply to any message or contact the Office of Admissions at{' '}
                      <span suppressHydrationWarning className="font-medium">cristinachen.cpp.edu@gmail.com</span>.
                    </p>
                  </CardContent>
                </Card>
              </SlideIn>
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">
              {/* Application Summary */}
              <SlideIn from="right">
                <Card>
                  <CardHeader className="bg-[#1E5631] text-white rounded-t-lg">
                    <CardTitle className="font-display text-base flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> Application Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Application ID:</span>
                      <span className="font-mono text-xs font-bold">{app?.applicationIdNumber?.slice(0, 12) ?? 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Program:</span>
                      <span className="font-medium">{s4?.major ?? 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">College:</span>
                      <span className="font-medium text-xs">{s4?.college ?? 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Term:</span>
                      <span className="font-medium">{s4?.entryTerm ?? 'N/A'}</span>
                    </div>
                    {app?.submittedAt && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Submitted:</span>
                        <span className="font-medium"><SafeDate date={app.submittedAt} options={{ dateStyle: 'medium' }} /></span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </SlideIn>

              {/* Announcements */}
              <SlideIn from="right" delay={0.1}>
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display text-base flex items-center gap-2">
                      <Bell className="w-4 h-4" /> Announcements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(announcements as any[]).map((a: any) => (
                      <div key={a?.id} className={`p-3 rounded-md text-sm border-l-4 ${
                        a?.type === 'warning' ? 'bg-yellow-50 border-[#D4A017]' :
                        a?.type === 'alert' ? 'bg-red-50 border-destructive' :
                        'bg-blue-50 border-blue-400'
                      }`}>
                        <p className="font-semibold text-[#1A1A1A]">{a?.title ?? ''}</p>
                        <p className="text-xs text-muted-foreground mt-1">{a?.message ?? ''}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </SlideIn>

              {/* Contacts */}
              <SlideIn from="right" delay={0.2}>
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display text-base">Important Contacts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div>
                      <p className="font-semibold text-[#1E5631]">Office of Admissions</p>
                      <div className="flex items-center gap-2 text-muted-foreground mt-1">
                        <Phone className="w-3 h-3" /><span suppressHydrationWarning>+1 916-290-8848</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-3 h-3" /><span suppressHydrationWarning>cristinachen.cpp.edu@gmail.com</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-[#1E5631]">Financial Aid Office</p>
                      <div className="flex items-center gap-2 text-muted-foreground mt-1">
                        <Phone className="w-3 h-3" /><span suppressHydrationWarning>+1 916-290-8848</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-3 h-3" /><span suppressHydrationWarning>cristinachen.cpp.edu@gmail.com</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-[#1E5631]">Hours</p>
                      <p className="text-muted-foreground mt-1">Mon–Fri: 8:00 AM – 5:00 PM PST</p>
                    </div>
                  </CardContent>
                </Card>
              </SlideIn>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
