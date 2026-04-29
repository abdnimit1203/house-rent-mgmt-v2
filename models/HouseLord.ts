import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IHouseLordDoc extends Document {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  address?: string;
  comparePassword(candidate: string): Promise<boolean>;
}

const HouseLordSchema = new Schema<IHouseLordDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
  },
  { timestamps: true }
);

HouseLordSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.passwordHash);
};

const HouseLord: Model<IHouseLordDoc> =
  mongoose.models.HouseLord || mongoose.model<IHouseLordDoc>('HouseLord', HouseLordSchema);

export default HouseLord;
