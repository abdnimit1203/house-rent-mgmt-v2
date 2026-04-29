'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Home, Plus, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { roomsApi } from '@/lib/apiClient';
import { IRoom } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RoomsPage() {
  const { data: rooms, mutate, isLoading } = useSWR<IRoom[]>('rooms', () => roomsApi.list().then(res => res.data!));
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ roomNumber: '', floor: '', hasWaterBill: false });
  const [error, setError] = useState('');

  const openAdd = () => {
    setEditingId(null);
    setFormData({ roomNumber: '', floor: '', hasWaterBill: false });
    setIsModalOpen(true);
    setError('');
  };

  const openEdit = (room: IRoom) => {
    setEditingId(room._id);
    setFormData({ roomNumber: room.roomNumber, floor: room.floor || '', hasWaterBill: room.hasWaterBill });
    setIsModalOpen(true);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await roomsApi.update(editingId, formData);
        toast.success("Room updated successfully!");
      } else {
        await roomsApi.create(formData as Omit<IRoom, any>);
        toast.success("Room added successfully!");
      }
      mutate();
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = (id: string, roomNumber: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">Are you sure you want to delete room {roomNumber}?</p>
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={() => toast.dismiss(t.id)}>Cancel</Button>
          <Button size="sm" variant="destructive" onClick={async () => {
            toast.dismiss(t.id);
            try {
              await roomsApi.remove(id);
              mutate();
              toast.success("Room deleted!");
            } catch (err: any) {
              toast.error(err.response?.data?.error || 'Failed to delete');
            }
          }}>Delete</Button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  if (isLoading) return <div>Loading rooms...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Rooms</h1>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add Room
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {rooms?.map((room) => (
          <Card key={room._id} className="hover:shadow-md dark:shadow-slate-900/50 transition-shadow relative group dark:bg-slate-900 dark:border-slate-800">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${room.isOccupied ? 'bg-primary/10 dark:bg-primary/20 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                    <Home className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg dark:text-slate-100">{room.roomNumber}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{room.floor || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t dark:border-slate-800 flex justify-between text-sm">
                <span className={room.isOccupied ? 'text-primary font-medium' : 'text-slate-500 dark:text-slate-400'}>
                  {room.isOccupied ? 'Occupied' : 'Vacant'}
                </span>
                {room.hasWaterBill && (
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded text-xs">Water bill</span>
                )}
              </div>

              {/* Action overlay on hover */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                <Button variant="outline" size="icon" className="h-8 w-8 bg-white dark:bg-slate-800 dark:border-slate-700" onClick={() => openEdit(room)}>
                  <Edit className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                </Button>
                {!room.isOccupied && (
                  <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDelete(room._id, room.roomNumber)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Room' : 'Add Room'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Room Number / Name</Label>
            <Input required value={formData.roomNumber} onChange={e => setFormData({ ...formData, roomNumber: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Floor (Optional)</Label>
            <Input value={formData.floor} onChange={e => setFormData({ ...formData, floor: e.target.value })} />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" 
              id="waterBill"
              className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
              checked={formData.hasWaterBill}
              onChange={e => setFormData({ ...formData, hasWaterBill: e.target.checked })} 
            />
            <Label htmlFor="waterBill">Requires separate water bill?</Label>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Room</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
