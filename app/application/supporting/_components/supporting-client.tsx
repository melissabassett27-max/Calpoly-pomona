'use client';

import { ApplicationShell } from '../../_components/application-shell';
import { FormField } from '../../_components/form-field';
import { useApplication } from '../../_components/use-application';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, ArrowRight, ArrowLeft, Plus, Trash2 } from 'lucide-react';

const ESSAY_PROMPTS = [
  'Describe a leadership experience and what you learned from it.',
  'Tell us about a challenge you overcame and how it shaped you.',
  'Describe your impact on your community and why it matters to you.',
];

export function SupportingClient() {
  const { data, updateField, saving, save } = useApplication(3);

  const workEntries = data?.work ?? [];
  const addWork = () => updateField('work', [...workEntries, { employer: '', position: '', startDate: '', endDate: '', hoursPerWeek: '', description: '' }]);
  const removeWork = (i: number) => updateField('work', workEntries.filter((_: any, idx: number) => idx !== i));
  const updateWork = (i: number, field: string, val: string) => {
    const u = [...workEntries]; u[i] = { ...(u[i] ?? {}), [field]: val }; updateField('work', u);
  };

  const activities = data?.activities ?? [];
  const addActivity = () => updateField('activities', [...activities, { name: '', role: '', org: '', hoursWeek: '', weeksYear: '', description: '', awards: '' }]);
  const removeActivity = (i: number) => updateField('activities', activities.filter((_: any, idx: number) => idx !== i));
  const updateActivity = (i: number, field: string, val: string) => {
    const u = [...activities]; u[i] = { ...(u[i] ?? {}), [field]: val }; updateField('activities', u);
  };

  const awards = data?.awards ?? [];
  const addAward = () => updateField('awards', [...awards, { name: '', org: '', date: '', description: '' }]);
  const removeAward = (i: number) => updateField('awards', awards.filter((_: any, idx: number) => idx !== i));

  return (
    <ApplicationShell currentStep={3}>
      <div className="space-y-6">
        {/* Work Experience */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display text-xl text-[#1E5631]">Work Experience</CardTitle>
            <Button variant="outline" size="sm" onClick={addWork} disabled={workEntries.length >= 5}><Plus className="w-4 h-4 mr-1" />Add ({workEntries.length}/5)</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {workEntries.length === 0 && <p className="text-sm text-muted-foreground">No work experience added.</p>}
            {workEntries.map((w: any, i: number) => (
              <div key={i} className="border rounded-md p-4 space-y-3 relative">
                <button onClick={() => removeWork(i)} className="absolute top-3 right-3 text-destructive hover:bg-destructive/10 p-1 rounded"><Trash2 className="w-4 h-4" /></button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField label="Employer" name="employer" value={w?.employer ?? ''} onChange={(_, v) => updateWork(i, 'employer', v)} />
                  <FormField label="Position" name="position" value={w?.position ?? ''} onChange={(_, v) => updateWork(i, 'position', v)} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <FormField label="Start Date" name="startDate" value={w?.startDate ?? ''} onChange={(_, v) => updateWork(i, 'startDate', v)} type="month" />
                  <FormField label="End Date" name="endDate" value={w?.endDate ?? ''} onChange={(_, v) => updateWork(i, 'endDate', v)} type="month" />
                  <FormField label="Hours/week" name="hoursPerWeek" value={w?.hoursPerWeek ?? ''} onChange={(_, v) => updateWork(i, 'hoursPerWeek', v)} type="number" />
                </div>
                <FormField label="Description" name="description" value={w?.description ?? ''} onChange={(_, v) => updateWork(i, 'description', v)} multiline rows={2} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Activities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display text-xl text-[#1E5631]">Extracurricular Activities</CardTitle>
            <Button variant="outline" size="sm" onClick={addActivity} disabled={activities.length >= 8}><Plus className="w-4 h-4 mr-1" />Add ({activities.length}/8)</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {activities.length === 0 && <p className="text-sm text-muted-foreground">No activities added.</p>}
            {activities.map((a: any, i: number) => (
              <div key={i} className="border rounded-md p-4 space-y-3 relative">
                <button onClick={() => removeActivity(i)} className="absolute top-3 right-3 text-destructive hover:bg-destructive/10 p-1 rounded"><Trash2 className="w-4 h-4" /></button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <FormField label="Activity Name" name="name" value={a?.name ?? ''} onChange={(_, v) => updateActivity(i, 'name', v)} />
                  <FormField label="Role" name="role" value={a?.role ?? ''} onChange={(_, v) => updateActivity(i, 'role', v)} />
                  <FormField label="Organization" name="org" value={a?.org ?? ''} onChange={(_, v) => updateActivity(i, 'org', v)} />
                </div>
                <FormField label="Description" name="description" value={a?.description ?? ''} onChange={(_, v) => updateActivity(i, 'description', v)} multiline rows={2} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Awards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display text-xl text-[#1E5631]">Awards & Achievements</CardTitle>
            <Button variant="outline" size="sm" onClick={addAward} disabled={awards.length >= 5}><Plus className="w-4 h-4 mr-1" />Add ({awards.length}/5)</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {awards.length === 0 && <p className="text-sm text-muted-foreground">No awards added.</p>}
            {awards.map((a: any, i: number) => (
              <div key={i} className="flex gap-3 items-start border rounded-md p-3 relative">
                <button onClick={() => removeAward(i)} className="absolute top-2 right-2 text-destructive p-1"><Trash2 className="w-4 h-4" /></button>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <FormField label="Award Name" name="name" value={a?.name ?? ''} onChange={(_, v) => { const u = [...awards]; u[i] = { ...(u[i] ?? {}), name: v }; updateField('awards', u); }} />
                  <FormField label="Issuing Org" name="org" value={a?.org ?? ''} onChange={(_, v) => { const u = [...awards]; u[i] = { ...(u[i] ?? {}), org: v }; updateField('awards', u); }} />
                  <FormField label="Date" name="date" value={a?.date ?? ''} onChange={(_, v) => { const u = [...awards]; u[i] = { ...(u[i] ?? {}), date: v }; updateField('awards', u); }} type="month" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Essays */}
        <Card>
          <CardHeader><CardTitle className="font-display text-xl text-[#1E5631]">Personal Statement & Essays</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm font-medium">Prompt 1 (Required) <span className="text-destructive">*</span></Label>
              <p className="text-sm text-muted-foreground mb-2">&ldquo;Describe your background and how it has shaped your academic interests.&rdquo; (350 words max)</p>
              <FormField label="" name="essay1" value={data?.essay1 ?? ''} onChange={updateField} multiline rows={6} maxLength={350} />
            </div>
            <div>
              <Label className="text-sm font-medium">Prompt 2 (Choose one, 250 words max)</Label>
              <div className="mt-2 space-y-2">
                {ESSAY_PROMPTS.map((prompt, i) => (
                  <label key={i} className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="essay2Choice"
                      value={String(i)}
                      checked={data?.essay2Choice === String(i)}
                      onChange={(e) => updateField('essay2Choice', e.target.value)}
                      className="mt-1 accent-[#1E5631]"
                    />
                    <span className="text-sm">{prompt}</span>
                  </label>
                ))}
              </div>
              {data?.essay2Choice !== undefined && data?.essay2Choice !== '' && (
                <div className="mt-3">
                  <FormField label="" name="essay2" value={data?.essay2 ?? ''} onChange={updateField} multiline rows={5} maxLength={250} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => save(false, 'academic')}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
            <Button variant="outline" onClick={() => save(false)} disabled={saving}><Save className="w-4 h-4 mr-2" />{saving ? 'Saving...' : 'Save Progress'}</Button>
          </div>
          <Button onClick={() => save(true, 'program')} disabled={saving} className="bg-[#1E5631] hover:bg-[#245E36] text-white">
            Save & Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </ApplicationShell>
  );
}
