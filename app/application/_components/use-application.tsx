'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useApplication(sectionNum: number) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const appId = searchParams?.get('id') ?? '';
  const [data, setData] = useState<any>({});
  const [app, setApp] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const fetchApp = useCallback(async () => {
    try {
      const res = await fetch('/api/application');
      if (res.ok) {
        const appData = await res.json();
        setApp(appData);
        const sectionData = appData?.[`section${sectionNum}Data`];
        if (sectionData) setData(sectionData);
      }
    } catch {}
  }, [sectionNum]);

  useEffect(() => { fetchApp(); }, [fetchApp]);

  const updateField = (name: string, value: any) => {
    setData((prev: any) => ({ ...(prev ?? {}), [name]: value }));
  };

  const save = async (complete = false, nextStep?: string) => {
    if (!app?.id) { toast.error('No application found'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/application', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: app.id,
          section: sectionNum,
          data,
          complete,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      toast.success(complete ? 'Section saved!' : 'Progress saved');
      if (nextStep) {
        router.push(`/application/${nextStep}?id=${app.id}`);
      }
    } catch {
      toast.error('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return { data, setData, updateField, app, saving, save, appId: app?.id ?? appId };
}
