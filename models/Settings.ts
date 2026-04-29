import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ISettingsDoc extends Document {
  houseLordId: Types.ObjectId;
  perUnitRate: number;
  defaultWaterBill: number;
}

const SettingsSchema = new Schema<ISettingsDoc>(
  {
    houseLordId: { type: Schema.Types.ObjectId, ref: 'HouseLord', required: true, unique: true },
    perUnitRate: { type: Number, default: 8, min: 0 },
    defaultWaterBill: { type: Number, default: 200, min: 0 },
  },
  { timestamps: true }
);

const Settings: Model<ISettingsDoc> =
  mongoose.models.Settings || mongoose.model<ISettingsDoc>('Settings', SettingsSchema);

export default Settings;
