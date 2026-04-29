import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IWaterBillEntryDoc extends Document {
  houseLordId: Types.ObjectId;
  roomId: Types.ObjectId;
  month: number;
  year: number;
  amount: number;
}

const WaterBillEntrySchema = new Schema<IWaterBillEntryDoc>(
  {
    houseLordId: { type: Schema.Types.ObjectId, ref: 'HouseLord', required: true, index: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    amount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

// One water bill entry per room per month+year
WaterBillEntrySchema.index({ roomId: 1, month: 1, year: 1 }, { unique: true });

const WaterBillEntry: Model<IWaterBillEntryDoc> =
  mongoose.models.WaterBillEntry ||
  mongoose.model<IWaterBillEntryDoc>('WaterBillEntry', WaterBillEntrySchema);

export default WaterBillEntry;
