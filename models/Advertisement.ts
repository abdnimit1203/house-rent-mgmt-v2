import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IAdvertisementDoc extends Document {
  houseLordId: Types.ObjectId;
  type: 'rent' | 'sale';
  price: number;
  roomSize?: string;
  imageUrl?: string;
  description?: string;
  contactPhone: string;
  isActive: boolean;
}

const AdvertisementSchema = new Schema<IAdvertisementDoc>(
  {
    houseLordId: { type: Schema.Types.ObjectId, ref: 'HouseLord', required: true, index: true },
    type: { type: String, enum: ['rent', 'sale'], required: true },
    price: { type: Number, required: true, min: 0 },
    roomSize: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    description: { type: String, trim: true },
    contactPhone: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Advertisement: Model<IAdvertisementDoc> =
  mongoose.models.Advertisement || mongoose.model<IAdvertisementDoc>('Advertisement', AdvertisementSchema);

export default Advertisement;
