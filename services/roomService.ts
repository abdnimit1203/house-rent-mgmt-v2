import { connectDB } from '@/lib/db';
import Room from '@/models/Room';

export async function listRooms(houseLordId: string) {
  await connectDB();
  return Room.find({ houseLordId }).populate('tenantId').lean();
}

export async function getRoom(houseLordId: string, id: string) {
  await connectDB();
  return Room.findOne({ _id: id, houseLordId }).lean();
}

export async function createRoom(houseLordId: string, data: {
  roomNumber: string; floor?: string; hasWaterBill: boolean;
}) {
  await connectDB();
  return Room.create({ ...data, houseLordId, isOccupied: false });
}

export async function updateRoom(houseLordId: string, id: string, data: {
  roomNumber?: string; floor?: string; hasWaterBill?: boolean;
}) {
  await connectDB();
  return Room.findOneAndUpdate({ _id: id, houseLordId }, data, { new: true }).lean();
}

export async function deleteRoom(houseLordId: string, id: string) {
  await connectDB();
  const room = await Room.findOne({ _id: id, houseLordId });
  if (!room) throw new Error('Room not found');
  if (room.isOccupied) throw new Error('Cannot delete an occupied room. Please remove the tenant first.');
  return Room.findByIdAndDelete(id);
}
