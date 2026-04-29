import { connectDB } from '@/lib/db';
import MeterReading from '@/models/MeterReading';
import Settings from '@/models/Settings';

export async function listMeterReadings(houseLordId: string, month?: number, year?: number) {
  await connectDB();
  const filter: Record<string, unknown> = { houseLordId };
  if (month) filter.month = month;
  if (year) filter.year = year;
  return MeterReading.find(filter).populate('tenantId').lean();
}

export async function getMeterReading(houseLordId: string, id: string) {
  await connectDB();
  return MeterReading.findOne({ _id: id, houseLordId }).lean();
}

export async function createMeterReading(houseLordId: string, data: {
  tenantId: string; month: number; year: number;
  previousReading: number; currentReading: number;
}) {
  await connectDB();
  const settings = await Settings.findOne({ houseLordId });
  const perUnitRate = settings?.perUnitRate ?? 8;
  return MeterReading.create({ ...data, houseLordId, perUnitRate });
}

export async function updateMeterReading(houseLordId: string, id: string, data: {
  previousReading?: number; currentReading?: number;
}) {
  await connectDB();
  const reading = await MeterReading.findOne({ _id: id, houseLordId });
  if (!reading) throw new Error('Reading not found');
  if (data.previousReading !== undefined) reading.previousReading = data.previousReading;
  if (data.currentReading !== undefined) reading.currentReading = data.currentReading;
  return reading.save(); // triggers pre-save hook to recalculate
}

export async function deleteMeterReading(houseLordId: string, id: string) {
  await connectDB();
  return MeterReading.findOneAndDelete({ _id: id, houseLordId });
}
