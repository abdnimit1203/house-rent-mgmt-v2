'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { User } from 'lucide-react';
import { profileApi } from '@/lib/apiClient';
import { IHouseLord } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProfilePage() {
  const { data: profile, mutate } = useSWR<IHouseLord>('profile', () => profileApi.get().then(res => res.data!));
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  if (profile && !isInitialized) {
    setName(profile.name);
    setPhone(profile.phone || '');
    setAddress(profile.address || '');
    setIsInitialized(true);
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await profileApi.update({ name, phone, address });
      mutate();
      alert('Profile updated');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update profile');
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(''); setPassSuccess('');
    try {
      await profileApi.changePassword(currentPassword, newPassword);
      setPassSuccess('Password updated successfully');
      setCurrentPassword(''); setNewPassword('');
    } catch (err: any) {
      setPassError(err.response?.data?.error || 'Failed to update password');
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <User className="h-6 w-6" /> Profile
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input required value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input disabled value={profile.email} className="bg-slate-100" />
                <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={address} onChange={e => setAddress(e.target.value)} />
              </div>
              <Button type="submit" className="w-full">Save Changes</Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Card */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              {passError && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{passError}</div>}
              {passSuccess && <div className="text-sm text-green-600 bg-green-50 p-3 rounded">{passSuccess}</div>}
              
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
              <Button type="submit" variant="secondary" className="w-full">Update Password</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
