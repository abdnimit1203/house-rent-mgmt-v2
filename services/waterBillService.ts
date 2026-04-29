import { connectDB } from '@/lib/db';
import WaterBillEntry from '@/models/WaterBillEntry';
import Room from '@/models/Room';

export async function listWaterBills(houseLordId: string, month?: number, year?: number) {
  await connectDB();
  const filter: Record<string, unknown> = { houseLordId };
  if (month) filter.month = month;
  if (year) filter.year = year;
  return WaterBillEntry.find(filter).populate('roomId').lean();
}

export async function getWaterBill(houseLordId: string, id: string) {
  await connectDB();
  return WaterBillEntry.findOne({ _id: id, houseLordId }).lean();
}

export async function upsertWaterBill(houseLordId: string, data: {
  roomId: string; month: number; year: number; amount: number;
}) {
  await connectDB();
  const room = await Room.findOne({ _id: data.roomId, houseLordId });
  if (!room) throw new Error('Room not found');
  if (!room.hasWaterBill) throw new Error(`Room ${room.roomNumber} does not have water bill enabled`);

  return WaterBillEntry.findOneAndUpdate(
    { houseLordId, roomId: data.roomId, month: data.month, year: data.year },
    { houseLordId, ...data },
    { upsert: true, new: true }
  );
}

export async function deleteWaterBill(houseLordId: string, id: string) {
  await connectDB();
  return WaterBillEntry.findOneAndDelete({ _id: id, houseLordId });
}

/** Get rooms that still need water bill entries for a given month/year */
export async function getPendingWaterBillRooms(houseLordId: string, month: number, year: number) {
  await connectDB();
  const waterRooms = await Room.find({ houseLordId, hasWaterBill: true });
  const existing = await WaterBillEntry.find({ houseLordId, month, year });
  const existingRoomIds = existing.map((e) => e.roomId.toString());
  return waterRooms.filter((r) => !existingRoomIds.includes(r._id.toString()));
}
