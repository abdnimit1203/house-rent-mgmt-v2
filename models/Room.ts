import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IRoomDoc extends Document {
  houseLordId: Types.ObjectId;
  roomNumber: string;
  floor?: string;
  hasWaterBill: boolean;
  isOccupied: boolean;
  tenantId?: Types.ObjectId;
}

const RoomSchema = new Schema<IRoomDoc>(
  {
    houseLordId: { type: Schema.Types.ObjectId, ref: 'HouseLord', required: true, index: true },
    roomNumber: { type: String, required: true, trim: true },
    floor: { type: String, trim: true },
    hasWaterBill: { type: Boolean, default: false },
    isOccupied: { type: Boolean, default: false },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', default: null },
  },
  { timestamps: true }
);

// Unique room numbers per house lord
RoomSchema.index({ houseLordId: 1, roomNumber: 1 }, { unique: true });

const Room: Model<IRoomDoc> =
  mongoose.models.Room || mongoose.model<IRoomDoc>('Room', RoomSchema);

export default Room;
