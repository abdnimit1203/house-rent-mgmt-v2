import { connectDB } from '@/lib/db';
import Settings from '@/models/Settings';

export async function getSettings(houseLordId: string) {
  await connectDB();
  return Settings.findOne({ houseLordId }).lean();
}

export async function updateSettings(houseLordId: string, data: {
  perUnitRate?: number; defaultWaterBill?: number;
}) {
  await connectDB();
  return Settings.findOneAndUpdate({ houseLordId }, data, { new: true, upsert: true }).lean();
}
