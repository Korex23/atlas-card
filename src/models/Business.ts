import mongoose, { Schema, Document } from "mongoose";

export interface IBusiness extends Document {
  name: string;
  wallet: string;
  description: string;
  logo: string;
  banner: string;
  callbackUrl: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}

const BusinessSchema = new Schema<IBusiness>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    wallet: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      required: true,
    },
    banner: {
      type: String,
      required: true,
    },
    callbackUrl: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Business ||
  mongoose.model<IBusiness>("Business", BusinessSchema);
