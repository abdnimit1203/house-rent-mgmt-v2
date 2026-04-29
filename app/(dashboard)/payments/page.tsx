'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { CreditCard, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { paymentsApi, tenantsApi } from '@/lib/apiClient';
import { IPayment, ITenant } from '@/types';
import { getCurrentMonthYear, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { MonthYearSelector } from '@/components/ui/MonthYearSelector';

export default function PaymentsPage() {
  const [period, setPeriod] = useState(getCurrentMonthYear());
  
  // Fetch active tenants
  const { data: tenants } = useSWR<ITenant[]>('tenants', () => tenantsApi.list().then(res => res.data!));
  
  // Fetch payments for this month
  const { data: payments, mutate } = useSWR<IPayment[]>(
    ['payments', period.month, period.year], 
    () => paymentsApi.list(period.month, period.year).then(res => res.data!)
  );

  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const activeTenants = tenants?.filter(t => t.isActive) || [];

  const handleGenerate = async (tenantId: string) => {
    setGeneratingId(tenantId);
    try {
      await paymentsApi.generate(tenantId, period.month, period.year);
      mutate();
      toast.success('Bill generated successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to generate bill. Did you enter water bills and meter readings?');
    } finally {
      setGeneratingId(null);
    }
  };

  const getExistingPayment = (tenantId: string) => payments?.find(p => p.tenantId.toString() === tenantId || (p.tenant && p.tenant._id === tenantId));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-green-500" /> Payments & Billing
        </h1>
        <MonthYearSelector 
          month={period.month} year={period.year} 
          onChange={(m, y) => setPeriod({ month: m, year: y })} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {activeTenants.length === 0 && (
          <div className="col-span-full py-8 text-center text-slate-500">
            No active tenants to bill.
          </div>
        )}
        {activeTenants.map((tenant) => {
          const payment = getExistingPayment(tenant._id);
          return (
            <PaymentCard 
              key={tenant._id} 
              tenant={tenant} 
              payment={payment} 
              onGenerate={() => handleGenerate(tenant._id)}
              isGenerating={generatingId === tenant._id}
              onPaymentRecorded={() => mutate()}
            />
          );
        })}
      </div>
    </div>
  );
}

function PaymentCard({ tenant, payment, onGenerate, isGenerating, onPaymentRecorded }: any) {
  const [payAmount, setPayAmount] = useState('');
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  // If no payment exists, show generate state
  if (!payment) {
    return (
      <Card className="border-dashed border-2 border-slate-200">
        <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4 h-full min-h-[250px]">
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
            <FileText className="h-6 w-6 text-slate-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{tenant.name}</h3>
            <p className="text-sm text-slate-500">Room {tenant.room?.roomNumber}</p>
          </div>
          <Button onClick={onGenerate} disabled={isGenerating} variant="secondary">
            {isGenerating ? 'Generating...' : 'Generate Bill'}
          </Button>
          <p className="text-xs text-slate-400 max-w-[200px]">
            Make sure meter readings and water bills are entered first.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Formatting helper
  const isPaid = payment.status === 'PAID';
  const isPartial = payment.status === 'PARTIAL';
  
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPaying(true);
    try {
      await paymentsApi.recordPayment(payment._id, Number(payAmount));
      setIsPayModalOpen(false);
      setPayAmount('');
      onPaymentRecorded();
      toast.success('Payment recorded successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Payment failed');
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <>
      <Card className={`relative overflow-hidden transition-all ${isPaid ? 'border-green-200 shadow-sm' : 'border-amber-200 shadow-md'}`}>
        {/* Status Tab */}
        <div className={`absolute top-0 inset-x-0 h-1.5 ${isPaid ? 'bg-green-500' : isPartial ? 'bg-amber-500' : 'bg-red-500'}`} />
        
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{tenant.name}</CardTitle>
              <p className="text-sm text-slate-500">Room {tenant.room?.roomNumber}</p>
            </div>
            {isPaid ? (
              <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">
                <CheckCircle2 className="h-3.5 w-3.5" /> PAID
              </span>
            ) : isPartial ? (
              <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded">
                PARTIAL
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded">
                <AlertCircle className="h-3.5 w-3.5" /> UNPAID
              </span>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-2">
          {/* Bill Breakdown */}
          <div className="bg-slate-50 p-3 rounded-lg border text-sm space-y-2">
            <div className="flex justify-between"><span className="text-slate-500">Rent</span><span>{formatCurrency(payment.rentAmount)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Electricity</span><span>{formatCurrency(payment.electricityBill)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Water</span><span>{formatCurrency(payment.waterBill)}</span></div>
            {payment.previousDue > 0 && (
              <div className="flex justify-between text-red-600"><span className="font-medium">Previous Due</span><span>{formatCurrency(payment.previousDue)}</span></div>
            )}
            <div className="border-t pt-2 mt-2 flex justify-between font-bold text-base">
              <span>Total Bill</span><span>{formatCurrency(payment.totalBill)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center bg-white p-3 border rounded-lg shadow-sm">
            <div>
              <div className="text-xs text-slate-500 mb-1">Curent Due</div>
              <div className={`font-bold text-lg ${payment.due > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(payment.due)}
              </div>
            </div>
            {!isPaid && (
              <Button onClick={() => setIsPayModalOpen(true)}>Record</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} title={`Record Payment for ${tenant.name}`}>
         <form onSubmit={handleRecordPayment} className="space-y-4">
            <div className="bg-amber-50 text-amber-800 p-3 rounded text-sm mb-4">
              Total Due: <strong>{formatCurrency(payment.due)}</strong>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount Received (৳)</label>
              <Input 
                type="number" required min="0" max={payment.due}
                value={payAmount} onChange={e => setPayAmount(e.target.value)} 
                placeholder="Enter amount paid"
                className="text-lg"
              />
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsPayModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!payAmount || isPaying}>
                {isPaying ? 'Saving...' : 'Confirm Payment'}
              </Button>
            </div>
         </form>
      </Modal>
    </>
  );
}
