import { connectDB } from '@/lib/db';
import HouseLord from '@/models/HouseLord';
import Settings from '@/models/Settings';
import bcrypt from 'bcryptjs';

export async function createHouseLord(data: {
  name: string; email: string; password: string; phone?: string;
}) {
  await connectDB();
  const existing = await HouseLord.findOne({ email: data.email.toLowerCase() });
  if (existing) throw new Error('An account with this email already exists');

  const passwordHash = await bcrypt.hash(data.password, 12);
  const lord = await HouseLord.create({ ...data, passwordHash });

  // Create default settings for this house lord
  await Settings.create({ houseLordId: lord._id });
  return lord;
}

export async function authenticateHouseLord(email: string, password: string) {
  await connectDB();
  const lord = await HouseLord.findOne({ email: email.toLowerCase() });
  if (!lord) throw new Error('Invalid email or password');

  const valid = await lord.comparePassword(password);
  if (!valid) throw new Error('Invalid email or password');
  return lord;
}

export async function getHouseLord(id: string) {
  await connectDB();
  return HouseLord.findById(id).select('-passwordHash').lean();
}

export async function updateHouseLord(id: string, data: { name?: string; phone?: string; address?: string }) {
  await connectDB();
  return HouseLord.findByIdAndUpdate(id, data, { new: true }).select('-passwordHash').lean();
}

export async function changePassword(id: string, currentPassword: string, newPassword: string) {
  await connectDB();
  const lord = await HouseLord.findById(id);
  if (!lord) throw new Error('Account not found');
  const valid = await lord.comparePassword(currentPassword);
  if (!valid) throw new Error('Current password is incorrect');
  lord.passwordHash = await bcrypt.hash(newPassword, 12);
  return lord.save();
}
