import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type PaymentStatus = 'paid' | 'partial' | 'unpaid';

export interface IPaymentDoc extends Document {
  houseLordId: Types.ObjectId;
  tenantId: Types.ObjectId;
  month: number;
  year: number;
  rent: number;
  electricityBill: number;
  waterBill: number;
  previousDue: number;
  totalBill: number;
  amountPaid: number;
  due: number;
  status: PaymentStatus;
  paidAt?: Date;
}

const PaymentSchema = new Schema<IPaymentDoc>(
  {
    houseLordId: { type: Schema.Types.ObjectId, ref: 'HouseLord', required: true, index: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    rent: { type: Number, required: true, min: 0 },
    electricityBill: { type: Number, default: 0 },
    waterBill: { type: Number, default: 0 },
    previousDue: { type: Number, default: 0 },
    totalBill: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    due: { type: Number, default: 0 },
    status: { type: String, enum: ['paid', 'partial', 'unpaid'], default: 'unpaid' },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

// One payment record per tenant per month+year
PaymentSchema.index({ tenantId: 1, month: 1, year: 1 }, { unique: true });

const Payment: Model<IPaymentDoc> =
  mongoose.models.Payment || mongoose.model<IPaymentDoc>('Payment', PaymentSchema);

export default Payment;
