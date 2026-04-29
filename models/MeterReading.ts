import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IMeterReadingDoc extends Document {
  houseLordId: Types.ObjectId;
  tenantId: Types.ObjectId;
  month: number;
  year: number;
  previousReading: number;
  currentReading: number;
  unitsUsed: number;
  perUnitRate: number;
  electricityBill: number;
}

const MeterReadingSchema = new Schema<IMeterReadingDoc>(
  {
    houseLordId: { type: Schema.Types.ObjectId, ref: 'HouseLord', required: true, index: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    previousReading: { type: Number, required: true, min: 0 },
    currentReading: { type: Number, required: true, min: 0 },
    unitsUsed: { type: Number },
    perUnitRate: { type: Number, required: true },
    electricityBill: { type: Number },
  },
  { timestamps: true }
);

// One reading per tenant per month+year
MeterReadingSchema.index({ tenantId: 1, month: 1, year: 1 }, { unique: true });

// Auto-calculate before save
MeterReadingSchema.pre('save', async function () {
  this.unitsUsed = Math.max(0, this.currentReading - this.previousReading);
  this.electricityBill = this.unitsUsed * this.perUnitRate;
});

const MeterReading: Model<IMeterReadingDoc> =
  mongoose.models.MeterReading ||
  mongoose.model<IMeterReadingDoc>('MeterReading', MeterReadingSchema);

export default MeterReading;
