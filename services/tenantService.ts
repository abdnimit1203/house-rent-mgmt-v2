import { connectDB } from '@/lib/db';
import Tenant from '@/models/Tenant';
import Room from '@/models/Room';

export async function listTenants(houseLordId: string) {
  await connectDB();
  return Tenant.find({ houseLordId, isActive: true }).populate('roomId').lean();
}

export async function getTenant(houseLordId: string, id: string) {
  await connectDB();
  return Tenant.findOne({ _id: id, houseLordId }).populate('roomId').lean();
}

export async function createTenant(houseLordId: string, data: {
  name: string; phone: string; roomId: string; category?: string; monthlyRent: number; advance: number; startMonth: number; startYear: number;
}) {
  await connectDB();
  // Check room belongs to this house lord and is not occupied
  const room = await Room.findOne({ _id: data.roomId, houseLordId });
  if (!room) throw new Error('Room not found');
  if (room.isOccupied) throw new Error(`Room ${room.roomNumber} is already occupied`);

  const tenant = await Tenant.create({ ...data, houseLordId });
  // Mark room as occupied
  await Room.findByIdAndUpdate(data.roomId, { isOccupied: true, tenantId: tenant._id });
  return await Tenant.findById(tenant._id).populate('roomId').lean();
}

export async function updateTenant(houseLordId: string, id: string, data: Partial<{
  name: string; phone: string; roomId: string; category: string; monthlyRent: number; advance: number; startMonth: number; startYear: number;
}>) {
  await connectDB();
  const tenant = await Tenant.findOne({ _id: id, houseLordId });
  if (!tenant) throw new Error('Tenant not found');

  // If room is changing, free old room, occupy new room
  if (data.roomId && data.roomId !== tenant.roomId.toString()) {
    const newRoom = await Room.findOne({ _id: data.roomId, houseLordId });
    if (!newRoom) throw new Error('New room not found');
    if (newRoom.isOccupied) throw new Error(`Room ${newRoom.roomNumber} is already occupied`);
    await Room.findByIdAndUpdate(tenant.roomId, { isOccupied: false, tenantId: null });
    await Room.findByIdAndUpdate(data.roomId, { isOccupied: true, tenantId: id });
  }

  return Tenant.findByIdAndUpdate(id, data, { new: true }).populate('roomId').lean();
}

export async function deleteTenant(houseLordId: string, id: string) {
  await connectDB();
  const tenant = await Tenant.findOne({ _id: id, houseLordId });
  if (!tenant) throw new Error('Tenant not found');
  // Free up the room
  await Room.findByIdAndUpdate(tenant.roomId, { isOccupied: false, tenantId: null });
  tenant.isActive = false;
  return tenant.save();
}
