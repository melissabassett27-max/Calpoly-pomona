'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ApplicationShell } from '../../_components/application-shell';
import { FormField } from '../../_components/form-field';
import { useApplication } from '../../_components/use-application';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, ArrowRight } from 'lucide-react';
import { GENDER_OPTIONS, CITIZENSHIP_OPTIONS, ETHNICITY_OPTIONS } from '@/lib/constants';

const REQUIRED_FIELDS: { name: string; label: string }[] = [
  { name: 'firstName', label: 'Legal First Name' },
  { name: 'lastName', label: 'Legal Last Name' },
  { name: 'dateOfBirth', label: 'Date of Birth' },
  { name: 'citizenship', label: 'Citizenship Status' },
  { name: 'email', label: 'Email Address' },
  { name: 'phone', label: 'Phone Number' },
  { name: 'street', label: 'Street Address' },
  { name: 'city', label: 'City' },
  { name: 'state', label: 'State' },
  { name: 'zip', label: 'Zip Code' },
  { name: 'country', label: 'Country' },
  { name: 'emergencyName', label: 'Emergency Contact Name' },
  { name: 'emergencyRelationship', label: 'Emergency Contact Relationship' },
  { name: 'emergencyPhone', label: 'Emergency Contact Phone' },
];

export function PersonalClient() {
  const { data, updateField, saving, save } = useApplication(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setField = (name: string, value: any) => {
    updateField(name, value);
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
  };

  const handleContinue = () => {
    const next: Record<string, string> = {};
    REQUIRED_FIELDS.forEach((f) => {
      const v = (data as any)?.[f.name];
      if (!v || String(v).trim() === '') next[f.name] = `${f.label} is required.`;
    });
    const email = (data as any)?.email;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      next.email = 'Please enter a valid email address.';
    }
    setErrors(next);
    if (Object.keys(next).length > 0) {
      toast.error('Please complete the required fields before continuing.');
      const first = document.getElementById(REQUIRED_FIELDS.find((f) => next[f.name])?.name ?? '');
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      first?.focus?.();
      return;
    }
    save(true, 'academic');
  };

  return (
    <ApplicationShell currentStep={1}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl text-[#1E5631]">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Legal First Name" name="firstName" value={data?.firstName ?? ''} onChange={setField} required error={errors.firstName} />
              <FormField label="Middle Name" name="middleName" value={data?.middleName ?? ''} onChange={updateField} placeholder="Optional" />
              <FormField label="Legal Last Name" name="lastName" value={data?.lastName ?? ''} onChange={setField} required error={errors.lastName} />
            </div>
            <FormField label="Preferred Name" name="preferredName" value={data?.preferredName ?? ''} onChange={updateField} placeholder="Optional" />

            {/* DOB & Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Date of Birth" name="dateOfBirth" value={data?.dateOfBirth ?? ''} onChange={setField} type="date" required error={errors.dateOfBirth} />
              <div>
                <Label className="text-sm font-medium">Gender <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <select
                  value={data?.gender ?? ''}
                  onChange={(e) => updateField('gender', e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select...</option>
                  {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            {/* Citizenship */}
            <div>
              <Label htmlFor="citizenship" className="text-sm font-medium">Citizenship Status <span className="text-destructive">*</span></Label>
              <select
                id="citizenship"
                value={data?.citizenship ?? ''}
                onChange={(e) => setField('citizenship', e.target.value)}
                aria-invalid={errors.citizenship ? true : undefined}
                aria-describedby={errors.citizenship ? 'citizenship-error' : undefined}
                className={`mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm ${errors.citizenship ? 'border-destructive' : 'border-input'}`}
              >
                <option value="">Select...</option>
                {CITIZENSHIP_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.citizenship && <p id="citizenship-error" role="alert" className="text-xs text-destructive mt-1">{errors.citizenship}</p>}
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Email Address" name="email" value={data?.email ?? ''} onChange={setField} type="email" required error={errors.email} />
              <FormField label="Phone Number" name="phone" value={data?.phone ?? ''} onChange={setField} type="tel" required error={errors.phone} />
            </div>

            {/* Permanent Address */}
            <h3 className="font-display font-semibold text-[#1A1A1A] pt-2">Permanent Address</h3>
            <FormField label="Street Address" name="street" value={data?.street ?? ''} onChange={setField} required error={errors.street} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField label="City" name="city" value={data?.city ?? ''} onChange={setField} required error={errors.city} />
              <FormField label="State" name="state" value={data?.state ?? ''} onChange={setField} required error={errors.state} />
              <FormField label="Zip Code" name="zip" value={data?.zip ?? ''} onChange={setField} required error={errors.zip} />
              <FormField label="Country" name="country" value={data?.country ?? ''} onChange={setField} required error={errors.country} />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="sameAddress"
                checked={data?.sameAddress ?? false}
                onCheckedChange={(v) => updateField('sameAddress', v)}
              />
              <Label htmlFor="sameAddress" className="text-sm">Mailing address is the same as permanent address</Label>
            </div>

            {!data?.sameAddress && (
              <>
                <h3 className="font-display font-semibold text-[#1A1A1A]">Mailing Address</h3>
                <FormField label="Street Address" name="mailStreet" value={data?.mailStreet ?? ''} onChange={updateField} />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField label="City" name="mailCity" value={data?.mailCity ?? ''} onChange={updateField} />
                  <FormField label="State" name="mailState" value={data?.mailState ?? ''} onChange={updateField} />
                  <FormField label="Zip" name="mailZip" value={data?.mailZip ?? ''} onChange={updateField} />
                  <FormField label="Country" name="mailCountry" value={data?.mailCountry ?? ''} onChange={updateField} />
                </div>
              </>
            )}

            {/* Emergency Contact */}
            <h3 className="font-display font-semibold text-[#1A1A1A] pt-2">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Contact Name" name="emergencyName" value={data?.emergencyName ?? ''} onChange={setField} required error={errors.emergencyName} />
              <FormField label="Relationship" name="emergencyRelationship" value={data?.emergencyRelationship ?? ''} onChange={setField} required error={errors.emergencyRelationship} />
              <FormField label="Phone" name="emergencyPhone" value={data?.emergencyPhone ?? ''} onChange={setField} type="tel" required error={errors.emergencyPhone} />
            </div>

            {/* Ethnicity */}
            <div>
              <Label className="text-sm font-medium">Ethnicity/Race <span className="text-muted-foreground text-xs">(optional, select all that apply)</span></Label>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ETHNICITY_OPTIONS.map((eth) => (
                  <div key={eth} className="flex items-center gap-2">
                    <Checkbox
                      id={`eth-${eth}`}
                      checked={(data?.ethnicity ?? []).includes(eth)}
                      onCheckedChange={(checked) => {
                        const current = data?.ethnicity ?? [];
                        updateField('ethnicity', checked ? [...current, eth] : current.filter((e: string) => e !== eth));
                      }}
                    />
                    <Label htmlFor={`eth-${eth}`} className="text-sm">{eth}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* First gen */}
            <div>
              <Label className="text-sm font-medium">Are you a first-generation college student?</Label>
              <div className="flex gap-4 mt-2">
                {['Yes', 'No'].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="firstGen"
                      value={opt}
                      checked={data?.firstGen === opt}
                      onChange={(e) => updateField('firstGen', e.target.value)}
                      className="accent-[#1E5631]"
                    />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => save(false)} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />{saving ? 'Saving...' : 'Save Progress'}
          </Button>
          <Button onClick={handleContinue} disabled={saving} className="bg-[#1E5631] hover:bg-[#245E36] text-white">
            Save & Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </ApplicationShell>
  );
}
