'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Users, Plus, Edit, Trash2, Phone, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { tenantsApi, roomsApi } from '@/lib/apiClient';
import { ITenant, IRoom } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';

export default function TenantsPage() {
  const { data: tenants, mutate: mutateTenants, isLoading } = useSWR<ITenant[]>('tenants', () => tenantsApi.list().then(res => res.data!));
  const { data: rooms } = useSWR<IRoom[]>('rooms', () => roomsApi.list().then(res => res.data!));
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingTenant, setViewingTenant] = useState<ITenant | null>(null);
  
  const [formData, setFormData] = useState({ 
    name: '', phone: '', roomId: '', category: '', monthlyRent: 0, advance: 0, startMonth: new Date().getMonth() + 1, startYear: new Date().getFullYear()
  });
  const [error, setError] = useState('');

  const availableRooms = rooms?.filter(r => !r.isOccupied || r._id === formData.roomId);

  const openAdd = () => {
    setEditingId(null);
    setFormData({ name: '', phone: '', roomId: '', category: '', monthlyRent: 0, advance: 0, startMonth: new Date().getMonth() + 1, startYear: new Date().getFullYear() });
    setIsModalOpen(true);
    setError('');
  };

  const openEdit = (tenant: ITenant) => {
    setEditingId(tenant._id);
    setFormData({
      name: tenant.name, 
      phone: tenant.phone, 
      roomId: (tenant.roomId as any)?._id || tenant.roomId, 
      category: tenant.category || '', 
      monthlyRent: tenant.monthlyRent,
      advance: tenant.advance || 0,
      startMonth: tenant.startMonth || new Date().getMonth() + 1,
      startYear: tenant.startYear || new Date().getFullYear()
    });
    setIsModalOpen(true);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await tenantsApi.update(editingId, formData);
        toast.success("Tenant updated securely!");
      } else {
        await tenantsApi.create({ ...formData, isActive: true });
        toast.success("New tenant created!");
      }
      mutateTenants();
      // mutate rooms so isOccupied flags update
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = (id: string, name: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">Are you sure you want to completely remove {name}? This frees their room.</p>
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={() => toast.dismiss(t.id)}>Cancel</Button>
          <Button size="sm" variant="destructive" onClick={async () => {
            toast.dismiss(t.id);
            try {
              await tenantsApi.remove(id);
              mutateTenants();
              toast.success("Tenant successfully removed.");
            } catch (err: any) {
              toast.error(err.response?.data?.error || 'Failed to delete tenant');
            }
          }}>Remove</Button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  if (isLoading) return <div>Loading tenants...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Tenants</h1>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add Tenant
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border dark:border-slate-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[600px]">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium border-b dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Room</th>
                <th className="px-6 py-4">Rent</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tenants?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No active tenants found. Add your first tenant above.
                  </td>
                </tr>
              )}
              {tenants?.map((tenant) => (
                <tr key={tenant._id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      {tenant.name}
                      {tenant.category && <span className="ml-2 text-xs text-slate-400 dark:text-slate-500 font-normal">({tenant.category})</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                      {tenant.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border dark:border-slate-700">
                      {(tenant.roomId as any)?.roomNumber || tenant.room?.roomNumber || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium dark:text-slate-200">
                    {formatCurrency(tenant.monthlyRent)}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <Button variant="outline" size="sm" onClick={() => setViewingTenant(tenant)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEdit(tenant)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(tenant._id, tenant.name)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Tenant' : 'Add Tenant'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Category (Optional)</Label>
              <Input placeholder="e.g. Family, Student" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Room Assignment</Label>
              <select 
                required 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.roomId} 
                onChange={e => setFormData({ ...formData, roomId: e.target.value })}
              >
                <option value="" disabled>Select a room</option>
                {availableRooms?.map(r => (
                  <option key={r._id} value={r._id}>Room {r.roomNumber} {r.floor ? `(${r.floor})` : ''}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Monthly Rent (৳)</Label>
              <Input type="number" required min="0" value={formData.monthlyRent} onChange={e => setFormData({ ...formData, monthlyRent: Number(e.target.value) })} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Advance Paid (৳)</Label>
              <Input type="number" min="0" value={formData.advance} onChange={e => setFormData({ ...formData, advance: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Start Month</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.startMonth} onChange={e => setFormData({ ...formData, startMonth: Number(e.target.value) })}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Start Year</Label>
              <Input type="number" min="2000" max="2100" value={formData.startYear} onChange={e => setFormData({ ...formData, startYear: Number(e.target.value) })} />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Tenant</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!viewingTenant} onClose={() => setViewingTenant(null)} title="Tenant Details">
        {viewingTenant && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 dark:text-slate-400 mb-1">Full Name</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{viewingTenant.name}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 mb-1">Phone</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{viewingTenant.phone}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 mb-1">Category</p>
                <p className="font-medium text-slate-900 dark:text-slate-200">{viewingTenant.category || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 mb-1">Room Assignment</p>
                <p className="font-medium text-slate-900 dark:text-slate-200">
                  Room {(viewingTenant.roomId as any)?.roomNumber || viewingTenant.room?.roomNumber || 'Unknown'}
                  {(viewingTenant.roomId as any)?.floor ? ` (${(viewingTenant.roomId as any)?.floor})` : ''}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 mb-1">Monthly Rent</p>
                <p className="font-medium text-slate-900 dark:text-slate-200">{formatCurrency(viewingTenant.monthlyRent)}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 mb-1">Advance Paid</p>
                <p className="font-medium text-slate-900 dark:text-slate-200">{formatCurrency(viewingTenant.advance || 0)}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 mb-1">Started Living</p>
                <p className="font-medium text-slate-900 dark:text-slate-200">
                  {viewingTenant.startMonth ? new Date(0, viewingTenant.startMonth - 1).toLocaleString('default', { month: 'short' }) : 'Unknown'}, {viewingTenant.startYear || 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 mb-1">Status</p>
                <span className={`inline-block px-2 text-xs font-semibold rounded-full ${viewingTenant.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                  {viewingTenant.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
