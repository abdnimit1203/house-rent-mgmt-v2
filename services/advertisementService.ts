import Advertisement from '@/models/Advertisement';
import type { IAdvertisementDoc } from '@/models/Advertisement';
import { connectDB } from '@/lib/db';

export async function getAdvertisements(houseLordId: string) {
  await connectDB();
  return Advertisement.find({ houseLordId }).sort({ createdAt: -1 });
}

export async function getAdvertisement(houseLordId: string, id: string) {
  await connectDB();
  return Advertisement.findOne({ _id: id, houseLordId });
}

export async function createAdvertisement(houseLordId: string, data: Partial<IAdvertisementDoc>) {
  await connectDB();
  return Advertisement.create({ ...data, houseLordId });
}

export async function updateAdvertisement(houseLordId: string, id: string, data: Partial<IAdvertisementDoc>) {
  await connectDB();
  const ad = await Advertisement.findOneAndUpdate(
    { _id: id, houseLordId },
    { $set: data },
    { new: true, runValidators: true }
  );
  if (!ad) throw new Error('Advertisement not found');
  return ad;
}

export async function deleteAdvertisement(houseLordId: string, id: string) {
  await connectDB();
  const ad = await Advertisement.findOneAndDelete({ _id: id, houseLordId });
  if (!ad) throw new Error('Advertisement not found');
  return ad;
}

export async function getPublicAdvertisements() {
  await connectDB();
  return Advertisement.find({ isActive: true })
    .populate('houseLordId', 'name phone') // optionally populate host info if needed
    .sort({ createdAt: -1 });
}
