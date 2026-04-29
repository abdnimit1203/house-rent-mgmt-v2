'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Zap, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { meterReadingsApi, tenantsApi } from '@/lib/apiClient';
import { IMeterReading, ITenant } from '@/types';
import { getCurrentMonthYear } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { MonthYearSelector } from '@/components/ui/MonthYearSelector';

export default function MeterReadingsPage() {
  const [period, setPeriod] = useState(getCurrentMonthYear());
  
  // Fetch active tenants
  const { data: tenants } = useSWR<ITenant[]>('tenants', () => tenantsApi.list().then(res => res.data!));
  
  // Fetch meter readings for this month
  const { data: readings, mutate } = useSWR<IMeterReading[]>(
    ['meter-readings', period.month, period.year], 
    () => meterReadingsApi.list(period.month, period.year).then(res => res.data!)
  );

  const [savingId, setSavingId] = useState<string | null>(null);

  const handleSave = async (tenantId: string, prev: string, current: string) => {
    if (!current) return;
    setSavingId(tenantId);
    try {
      await meterReadingsApi.create({
        tenantId,
        month: period.month,
        year: period.year,
        previousReading: Number(prev) || 0,
        currentReading: Number(current)
      });
      mutate();
      toast.success('Reading saved successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save reading');
    } finally {
      setSavingId(null);
    }
  };

  const activeTenants = tenants?.filter(t => t.isActive) || [];
  const getExistingReading = (tenantId: string) => readings?.find(r => r.tenantId.toString() === tenantId || (r.tenant && r.tenant._id === tenantId));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Zap className="h-6 w-6 text-yellow-500" /> Meter Readings
        </h1>
        <MonthYearSelector 
          month={period.month} year={period.year} 
          onChange={(m, y) => setPeriod({ month: m, year: y })} 
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Tenant</th>
              <th className="px-6 py-4">Previous Reading</th>
              <th className="px-6 py-4">Current Reading</th>
              <th className="px-6 py-4">Units Used</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activeTenants.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No active tenants found.
                </td>
              </tr>
            )}
            {activeTenants.map((tenant) => {
              const existing = getExistingReading(tenant._id);
              return (
                <MeterRow 
                  key={tenant._id} 
                  tenant={tenant} 
                  existingReading={existing} 
                  onSave={(p: string, c: string) => handleSave(tenant._id, p, c)}
                  isSaving={savingId === tenant._id}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MeterRow({ tenant, existingReading, onSave, isSaving }: any) {
  const [prev, setPrev] = useState(existingReading?.previousReading?.toString() || '0');
  const [curr, setCurr] = useState(existingReading?.currentReading?.toString() || '');

  // Update logic if existing reading mounts or changes
  const prevVal = existingReading ? existingReading.previousReading.toString() : prev;
  const currVal = existingReading ? existingReading.currentReading.toString() : curr;
  
  const units = existingReading 
    ? existingReading.unitsUsed 
    : Math.max(0, Number(curr) - Number(prev));

  const saved = !!existingReading;

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-6 py-4 font-medium text-slate-900">
        <div>{tenant.name}</div>
        <div className="text-xs text-slate-500 mt-1">Room {tenant.room?.roomNumber || 'N/A'}</div>
      </td>
      <td className="px-6 py-4">
        <Input 
          type="number" className="w-32" disabled={saved}
          value={saved ? prevVal : prev} onChange={e => setPrev(e.target.value)} 
        />
      </td>
      <td className="px-6 py-4">
        <Input 
          type="number" className="w-32" disabled={saved}
          value={saved ? currVal : curr} onChange={e => setCurr(e.target.value)} 
        />
      </td>
      <td className="px-6 py-4">
        <div className="w-16 text-center font-semibold text-slate-700 bg-slate-100 py-1.5 rounded-md">
          {units}
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        {saved ? (
          <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-md">
            SAVED
          </span>
        ) : (
          <Button onClick={() => onSave(prev, curr)} disabled={!curr || isSaving} size="sm">
            <Save className="h-4 w-4 mr-2" /> Save
          </Button>
        )}
      </td>
    </tr>
  );
}
