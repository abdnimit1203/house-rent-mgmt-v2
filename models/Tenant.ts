import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ITenantDoc extends Document {
  houseLordId: Types.ObjectId;
  name: string;
  phone: string;
  roomId: Types.ObjectId;
  category?: string;
  monthlyRent: number;
  advance: number;
  startMonth: number;
  startYear: number;
  isActive: boolean;
}

const TenantSchema = new Schema<ITenantDoc>(
  {
    houseLordId: { type: Schema.Types.ObjectId, ref: 'HouseLord', required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    category: { type: String, trim: true },
    monthlyRent: { type: Number, required: true, min: 0 },
    advance: { type: Number, default: 0, min: 0 },
    startMonth: { type: Number, required: true },
    startYear: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Tenant: Model<ITenantDoc> =
  mongoose.models.Tenant || mongoose.model<ITenantDoc>('Tenant', TenantSchema);

export default Tenant;
