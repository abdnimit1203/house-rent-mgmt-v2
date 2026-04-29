'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Settings as SettingsIcon } from 'lucide-react';
import { settingsApi } from '@/lib/apiClient';
import { ISettings } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
  const { data: settings, mutate } = useSWR<ISettings>('settings', () => settingsApi.get().then(res => res.data!));
  
  const [perUnitRate, setPerUnitRate] = useState<number | string>('');
  const [defaultWaterBill, setDefaultWaterBill] = useState<number | string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  if (settings && !isInitialized) {
    setPerUnitRate(settings.perUnitRate);
    setDefaultWaterBill(settings.defaultWaterBill);
    setIsInitialized(true);
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await settingsApi.update({ 
        perUnitRate: Number(perUnitRate), 
        defaultWaterBill: Number(defaultWaterBill) 
      });
      mutate();
      alert('Settings saved successfully');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save settings');
    }
  };

  if (!settings) return <div>Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <SettingsIcon className="h-6 w-6" /> System Settings
      </h1>

      <Card className="dark:bg-slate-900 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="dark:text-slate-100">Rates & Defaults</CardTitle>
          <CardDescription className="dark:text-slate-400">Configure global calculation factors for bills</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <Label>Electricity Per-Unit Rate (৳)</Label>
              <div className="flex items-center gap-2">
                <Input 
                  type="number" step="0.1" required 
                  value={perUnitRate} 
                  onChange={e => setPerUnitRate(e.target.value)} 
                  className="max-w-[200px] dark:bg-slate-950 dark:border-slate-800"
                />
                <span className="text-sm text-slate-500 dark:text-slate-400">per KWh</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Default Water Bill Amount (৳)</Label>
              <Input 
                type="number" required 
                value={defaultWaterBill} 
                onChange={e => setDefaultWaterBill(e.target.value)} 
                className="max-w-[200px] dark:bg-slate-950 dark:border-slate-800"
              />
              <p className="text-xs text-muted-foreground dark:text-slate-500">
                This is just a default placeholder when entering monthly water bills for rooms.
              </p>
            </div>

            <Button type="submit">Save Configurations</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
