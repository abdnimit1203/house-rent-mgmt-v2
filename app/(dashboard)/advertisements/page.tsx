'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Megaphone, Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { advertisementsApi, roomsApi } from '@/lib/apiClient';
import { IAdvertisementDoc, IRoom } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdvertisementsPage() {
  const { data: ads, mutate, isLoading } = useSWR<IAdvertisementDoc[]>('advertisements', () => advertisementsApi.list().then(res => res.data!));
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ 
    type: 'rent', price: 0, roomSize: '', imageUrl: '', description: '', contactPhone: '', isActive: true
  });

  const openAdd = () => {
    setEditingId(null);
    setFormData({ type: 'rent', price: 0, roomSize: '', imageUrl: '', description: '', contactPhone: '', isActive: true });
    setIsModalOpen(true);
  };

  const openEdit = (ad: IAdvertisementDoc) => {
    setEditingId(ad._id);
    setFormData({
      type: ad.type,
      price: ad.price,
      roomSize: ad.roomSize || '',
      imageUrl: ad.imageUrl || '',
      description: ad.description || '',
      contactPhone: ad.contactPhone,
      isActive: ad.isActive
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await advertisementsApi.update(editingId, formData as any);
        toast.success("Advertisement updated!");
      } else {
        await advertisementsApi.create(formData as any);
        toast.success("Advertisement created!");
      }
      mutate();
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = (id: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">Delete this advertisement permanently?</p>
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={() => toast.dismiss(t.id)}>Cancel</Button>
          <Button size="sm" variant="destructive" onClick={async () => {
            toast.dismiss(t.id);
            try {
              await advertisementsApi.remove(id);
              mutate();
              toast.success("Ad deleted!");
            } catch (err: any) {
              toast.error(err.response?.data?.error || 'Failed to delete ad');
            }
          }}>Delete</Button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const toggleActive = async (ad: IAdvertisementDoc) => {
    try {
      await advertisementsApi.update(ad._id, { isActive: !ad.isActive });
      mutate();
      toast.success(ad.isActive ? "Ad hidden" : "Ad is now live");
    } catch (err: any) {
      toast.error("Failed to update status");
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex flex-row items-center gap-2">
          <Megaphone className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          My Advertisements
        </h1>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" /> Post New Ad
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {ads?.length === 0 && (
          <div className="col-span-full py-8 text-center text-slate-500 dark:text-slate-400">
            You haven't posted any advertisements yet.
          </div>
        )}
        {ads?.map((ad) => (
          <Card key={ad._id} className={`overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow relative group dark:bg-slate-900 dark:border-slate-800 ${!ad.isActive && 'opacity-60 grayscale'}`}>
            {ad.imageUrl ? (
              <div className="w-full h-32 bg-slate-200 dark:bg-slate-800">
                <img src={ad.imageUrl} alt="Room" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-full h-32 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                No Image
              </div>
            )}
            <CardContent className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${ad.type === 'sale' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'}`}>
                  For {ad.type}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-100">৳{ad.price}</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">{ad.description || 'No description provided.'}</p>
              
              <div className="mt-auto space-y-1 text-xs text-slate-500 dark:text-slate-400">
                {ad.roomSize && <p>Size: {ad.roomSize}</p>}
                <p>Contact: {ad.contactPhone}</p>
              </div>

              <div className="mt-4 pt-3 border-t dark:border-slate-800 flex justify-between items-center">
                <label className="flex items-center space-x-2 text-sm cursor-pointer">
                  <input type="checkbox" className="rounded" checked={ad.isActive} onChange={() => toggleActive(ad)} />
                  <span className={ad.isActive ? "text-primary font-medium" : "text-slate-500 dark:text-slate-400"}>
                    {ad.isActive ? 'Live Online' : 'Hidden'}
                  </span>
                </label>
                <div className="flex space-x-1">
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => openEdit(ad)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDelete(ad._id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Advertisement' : 'Post Advertisement'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="rent">For Rent</option>
                <option value="sale">For Sale</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>{formData.type === 'sale' ? 'Selling Price (৳)' : 'Monthly Rent (৳)'}</Label>
              <Input type="number" required min="0" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label>Room Size (ex: 2BHK, 1200 sqft)</Label>
              <Input value={formData.roomSize} onChange={e => setFormData({ ...formData, roomSize: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Contact Phone</Label>
              <Input required value={formData.contactPhone} onChange={e => setFormData({ ...formData, contactPhone: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Image URL (Optional)</Label>
            <Input type="url" placeholder="https://..." value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <textarea 
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Features, location details, restrictions..."
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" id="isActive" className="rounded"
              checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} 
            />
            <Label htmlFor="isActive">Publish immediately?</Label>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Advertisement</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
