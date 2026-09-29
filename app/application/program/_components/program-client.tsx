'use client';

import { ApplicationShell } from '../../_components/application-shell';
import { FormField } from '../../_components/form-field';
import { useApplication } from '../../_components/use-application';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, ArrowRight, ArrowLeft } from 'lucide-react';
import { collegesAndMajors } from '@/lib/majors';

const TERMS = ['Fall 2026', 'Spring 2027', 'Fall 2027'];
const HOW_HEARD = ['Web Search', 'Social Media', 'College Fair', 'School Counselor', 'Friend or Family', 'Advertisement', 'Other'];

export function ProgramClient() {
  const { data, updateField, saving, save } = useApplication(4);

  const selectedCollege = data?.college ?? '';
  const majors = selectedCollege ? (collegesAndMajors[selectedCollege] ?? []) : [];

  return (
    <ApplicationShell currentStep={4}>
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="font-display text-xl text-[#1E5631]">Program Materials</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            {/* Campus */}
            <div>
              <Label className="text-sm font-medium">Campus <span className="text-destructive">*</span></Label>
              <select value={data?.campus ?? 'Cal Poly Pomona — Main Campus'} onChange={(e) => updateField('campus', e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="Cal Poly Pomona — Main Campus">Cal Poly Pomona — Main Campus</option>
              </select>
            </div>

            {/* College */}
            <div>
              <Label className="text-sm font-medium">College/School <span className="text-destructive">*</span></Label>
              <select value={selectedCollege} onChange={(e) => { updateField('college', e.target.value); updateField('major', ''); }} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select a college...</option>
                {Object.keys(collegesAndMajors).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Major */}
            <div>
              <Label className="text-sm font-medium">Major <span className="text-destructive">*</span></Label>
              <select value={data?.major ?? ''} onChange={(e) => updateField('major', e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" disabled={!selectedCollege}>
                <option value="">{selectedCollege ? 'Select a major...' : 'Select a college first'}</option>
                {majors.map((m: string) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <FormField label="Concentration/Track" name="concentration" value={data?.concentration ?? ''} onChange={updateField} placeholder="Optional" />

            {/* Term & Enrollment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Entry Term <span className="text-destructive">*</span></Label>
                <select value={data?.entryTerm ?? ''} onChange={(e) => updateField('entryTerm', e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select...</option>
                  {TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-sm font-medium">Enrollment Type <span className="text-destructive">*</span></Label>
                <select value={data?.enrollmentType ?? ''} onChange={(e) => updateField('enrollmentType', e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select...</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                </select>
              </div>
            </div>

            {/* Housing */}
            <div>
              <Label className="text-sm font-medium">Interested in on-campus housing?</Label>
              <div className="flex gap-4 mt-2">
                {['Yes', 'No'].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="housing" value={opt} checked={data?.housing === opt} onChange={(e) => updateField('housing', e.target.value)} className="accent-[#1E5631]" />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Program-specific questions */}
            <div className="space-y-4 pt-2">
              <h3 className="font-display font-semibold text-[#1A1A1A]">Program-Specific Questions</h3>
              <FormField label="Why did you choose this major? What are your academic and career goals?" name="programQ1" value={data?.programQ1 ?? ''} onChange={updateField} multiline rows={3} />
              <FormField label="What relevant experience or coursework have you completed?" name="programQ2" value={data?.programQ2 ?? ''} onChange={updateField} multiline rows={3} />
            </div>

            {/* Previously applied / How heard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Previously applied to Cal Poly Pomona?</Label>
                <div className="flex gap-4 mt-2">
                  {['Yes', 'No'].map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="prevApplied" value={opt} checked={data?.prevApplied === opt} onChange={(e) => updateField('prevApplied', e.target.value)} className="accent-[#1E5631]" />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">How did you hear about Cal Poly Pomona?</Label>
                <select value={data?.howHeard ?? ''} onChange={(e) => updateField('howHeard', e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select...</option>
                  {HOW_HEARD.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => save(false, 'supporting')}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
            <Button variant="outline" onClick={() => save(false)} disabled={saving}><Save className="w-4 h-4 mr-2" />{saving ? 'Saving...' : 'Save Progress'}</Button>
          </div>
          <Button onClick={() => save(true, 'review')} disabled={saving} className="bg-[#D4A017] hover:bg-[#b8890f] text-white">
            Review Application <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </ApplicationShell>
  );
}
