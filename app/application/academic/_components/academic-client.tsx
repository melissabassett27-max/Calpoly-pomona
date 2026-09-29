'use client';

import { useState } from 'react';
import { ApplicationShell } from '../../_components/application-shell';
import { FormField } from '../../_components/form-field';
import { useApplication } from '../../_components/use-application';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, ArrowRight, ArrowLeft, Plus, Trash2, Upload } from 'lucide-react';
import { AG_SUBJECTS } from '@/lib/constants';
import { toast } from 'sonner';

export function AcademicClient() {
  const { data, updateField, saving, save, appId } = useApplication(2);
  const [uploading, setUploading] = useState(false);

  const colleges = data?.colleges ?? [];
  const addCollege = () => updateField('colleges', [...colleges, { name: '', city: '', state: '', startDate: '', endDate: '', degree: '', units: '', gpa: '' }]);
  const removeCollege = (i: number) => updateField('colleges', colleges.filter((_: any, idx: number) => idx !== i));
  const updateCollege = (i: number, field: string, val: string) => {
    const updated = [...colleges];
    updated[i] = { ...(updated[i] ?? {}), [field]: val };
    updateField('colleges', updated);
  };

  const apCourses = data?.apCourses ?? [];
  const addAP = () => updateField('apCourses', [...apCourses, { name: '', score: '' }]);
  const removeAP = (i: number) => updateField('apCourses', apCourses.filter((_: any, idx: number) => idx !== i));

  const handleUpload = async (file: File, docType: string) => {
    if (!appId) { toast.error('No application found'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('File exceeds 10MB limit'); return; }
    setUploading(true);
    try {
      const presignRes = await fetch('/api/upload/presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, contentType: file.type, fileSize: file.size }),
      });
      if (!presignRes.ok) { toast.error('Upload failed'); return; }
      const { uploadUrl, cloud_storage_path } = await presignRes.json();
      await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: appId, documentType: docType, filename: file.name, cloudStoragePath: cloud_storage_path, contentType: file.type }),
      });
      toast.success(`${file.name} uploaded successfully!`);
    } catch { toast.error('Upload failed'); } finally { setUploading(false); }
  };

  return (
    <ApplicationShell currentStep={2}>
      <div className="space-y-6">
        {/* High School */}
        <Card>
          <CardHeader><CardTitle className="font-display text-xl text-[#1E5631]">High School</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="School Name" name="hsName" value={data?.hsName ?? ''} onChange={updateField} required />
              <FormField label="City" name="hsCity" value={data?.hsCity ?? ''} onChange={updateField} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="State" name="hsState" value={data?.hsState ?? ''} onChange={updateField} required />
              <FormField label="Country" name="hsCountry" value={data?.hsCountry ?? ''} onChange={updateField} />
              <FormField label="Graduation Date" name="hsGradDate" value={data?.hsGradDate ?? ''} onChange={updateField} type="month" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="GPA (0.00 - 4.00)" name="hsGpa" value={data?.hsGpa ?? ''} onChange={updateField} type="number" required />
              <div>
                <Label className="text-sm font-medium">Completed A-G Requirements?</Label>
                <select value={data?.agComplete ?? ''} onChange={(e) => updateField('agComplete', e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="In Progress">In Progress</option>
                </select>
              </div>
            </div>

            {/* A-G tracker */}
            <div>
              <Label className="text-sm font-medium mb-2 block">A-G Requirement Tracker</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AG_SUBJECTS.map((subj) => (
                  <div key={subj.code} className="flex items-center gap-2 bg-muted/50 rounded-md p-2">
                    <span className="font-mono text-xs font-bold text-[#1E5631] w-6">{subj.code}.</span>
                    <span className="text-xs flex-1">{subj.name} ({subj.years}yr req)</span>
                    <input
                      type="number"
                      min={0}
                      max={6}
                      value={data?.[`ag_${subj.code}`] ?? ''}
                      onChange={(e) => updateField(`ag_${subj.code}`, e.target.value)}
                      className="w-14 rounded border border-input bg-background px-2 py-1 text-sm text-center"
                      placeholder="Yrs"
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Colleges */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display text-xl text-[#1E5631]">Colleges Attended</CardTitle>
            <Button variant="outline" size="sm" onClick={addCollege}><Plus className="w-4 h-4 mr-1" />Add College</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {colleges.length === 0 && <p className="text-sm text-muted-foreground">No colleges added. Click &quot;Add College&quot; if applicable.</p>}
            {colleges.map((col: any, i: number) => (
              <div key={i} className="border rounded-md p-4 space-y-3 relative">
                <button onClick={() => removeCollege(i)} className="absolute top-3 right-3 text-destructive hover:bg-destructive/10 p-1 rounded"><Trash2 className="w-4 h-4" /></button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <FormField label="College Name" name="name" value={col?.name ?? ''} onChange={(_, v) => updateCollege(i, 'name', v)} required />
                  <FormField label="City" name="city" value={col?.city ?? ''} onChange={(_, v) => updateCollege(i, 'city', v)} />
                  <FormField label="State" name="state" value={col?.state ?? ''} onChange={(_, v) => updateCollege(i, 'state', v)} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <FormField label="Start Date" name="startDate" value={col?.startDate ?? ''} onChange={(_, v) => updateCollege(i, 'startDate', v)} type="month" />
                  <FormField label="End Date" name="endDate" value={col?.endDate ?? ''} onChange={(_, v) => updateCollege(i, 'endDate', v)} type="month" />
                  <FormField label="Units" name="units" value={col?.units ?? ''} onChange={(_, v) => updateCollege(i, 'units', v)} type="number" />
                  <FormField label="GPA" name="gpa" value={col?.gpa ?? ''} onChange={(_, v) => updateCollege(i, 'gpa', v)} type="number" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Standardized Tests */}
        <Card>
          <CardHeader><CardTitle className="font-display text-xl text-[#1E5631]">Standardized Tests</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="SAT Score" name="satScore" value={data?.satScore ?? ''} onChange={updateField} placeholder="Optional" />
              <FormField label="ACT Score" name="actScore" value={data?.actScore ?? ''} onChange={updateField} placeholder="Optional" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">AP/IB Courses</Label>
                <Button variant="outline" size="sm" onClick={addAP}><Plus className="w-4 h-4 mr-1" />Add</Button>
              </div>
              {apCourses.map((ap: any, i: number) => (
                <div key={i} className="flex gap-3 items-end mb-2">
                  <div className="flex-1">
                    <input value={ap?.name ?? ''} onChange={(e) => { const u = [...apCourses]; u[i] = { ...(u[i] ?? {}), name: e.target.value }; updateField('apCourses', u); }} placeholder="Course name" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  </div>
                  <div className="w-20">
                    <input value={ap?.score ?? ''} onChange={(e) => { const u = [...apCourses]; u[i] = { ...(u[i] ?? {}), score: e.target.value }; updateField('apCourses', u); }} placeholder="Score" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  </div>
                  <button onClick={() => removeAP(i)} className="text-destructive p-2"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Document Uploads */}
        <Card>
          <CardHeader><CardTitle className="font-display text-xl text-[#1E5631]">Document Uploads</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {['High School Transcript', 'College Transcript', 'Diploma/Certificate'].map((docType) => (
              <div key={docType} className="border rounded-md p-4">
                <Label className="text-sm font-medium">{docType}</Label>
                <p className="text-xs text-muted-foreground mb-2">PDF, JPG, or PNG — Max 10MB</p>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => { const f = e.target?.files?.[0]; if (f) handleUpload(f, docType); }}
                    disabled={uploading}
                  />
                  <Button variant="outline" size="sm" disabled={uploading} asChild>
                    <span><Upload className="w-4 h-4 mr-1" />{uploading ? 'Uploading...' : 'Upload File'}</span>
                  </Button>
                </label>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => save(false, 'personal')}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
            <Button variant="outline" onClick={() => save(false)} disabled={saving}><Save className="w-4 h-4 mr-2" />{saving ? 'Saving...' : 'Save Progress'}</Button>
          </div>
          <Button onClick={() => save(true, 'supporting')} disabled={saving} className="bg-[#1E5631] hover:bg-[#245E36] text-white">
            Save & Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </ApplicationShell>
  );
}
