'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Droplet, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { waterBillsApi, roomsApi } from '@/lib/apiClient';
import { IWaterBillEntry, IRoom } from '@/types';
import { getCurrentMonthYear, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { MonthYearSelector } from '@/components/ui/MonthYearSelector';

export default function WaterBillsPage() {
  const [period, setPeriod] = useState(getCurrentMonthYear());
  
  // Fetch rooms
  const { data: rooms } = useSWR<IRoom[]>('rooms', () => roomsApi.list().then(res => res.data!));
  
  // Fetch water bills for this month
  const { data: bills, mutate } = useSWR<IWaterBillEntry[]>(
    ['water-bills', period.month, period.year], 
    () => waterBillsApi.list(period.month, period.year).then(res => res.data!)
  );

  const [savingId, setSavingId] = useState<string | null>(null);

  // Filter only rooms that require water bills
  const waterRooms = rooms?.filter(r => r.hasWaterBill) || [];

  const handleSave = async (roomId: string, amount: string) => {
    if (!amount) return;
    setSavingId(roomId);
    try {
      await waterBillsApi.create({
        roomId,
        month: period.month,
        year: period.year,
        amount: Number(amount)
      });
      mutate(); // Refresh the list
      toast.success('Water bill saved successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSavingId(null);
    }
  };

  const getExistingBill = (roomId: string) => bills?.find(b => b.roomId.toString() === roomId || (b.room && b.room._id === roomId));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Droplet className="h-6 w-6 text-blue-500" /> Monthly Water Bills
        </h1>
        <MonthYearSelector 
          month={period.month} year={period.year} 
          onChange={(m, y) => setPeriod({ month: m, year: y })} 
        />
      </div>

      <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm mb-6 border border-blue-100">
        You must enter the water bill for these rooms before you can generate their full monthly rent bill.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {waterRooms.length === 0 && (
          <div className="col-span-full py-8 text-center text-slate-500">
            No rooms are configured to require a separate water bill.
          </div>
        )}

        {waterRooms.map((room) => {
          const existing = getExistingBill(room._id);
          return (
            <WaterBillCard 
              key={room._id} 
              room={room} 
              existingEntry={existing} 
              onSave={(amount: string) => handleSave(room._id, amount)}
              isSaving={savingId === room._id}
            />
          );
        })}
      </div>
    </div>
  );
}

function WaterBillCard({ room, existingEntry, onSave, isSaving }: any) {
  const [amount, setAmount] = useState(existingEntry?.amount?.toString() || '');

  // Update local state if existing entry changes (e.g. month navigates)
  useEffect(() => {
    setAmount(existingEntry?.amount?.toString() || '');
  }, [existingEntry]);

  const saved = !!existingEntry;

  return (
    <Card className={saved ? 'border-primary shadow-sm bg-primary/5' : ''}>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg text-slate-800">Room {room.roomNumber}</h3>
            {room.tenantId ? (
              <span className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-600">Occupied</span>
            ) : (
              <span className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded">Vacant</span>
            )}
          </div>
          {saved && <span className="text-xs font-bold text-primary bg-primary/20 px-2 py-1 rounded">SAVED</span>}
        </div>

        <div className="flex gap-2">
          <Input 
            type="number" 
            placeholder="Amount ৳" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={saved}
            className={saved ? 'bg-transparent border-transparent px-0 font-semibold text-lg' : ''}
          />
          {!saved && (
            <Button onClick={() => onSave(amount)} disabled={!amount || isSaving} size="icon" className="shrink-0">
              <Save className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
