import mongoose, { Schema, Document } from "mongoose";

export interface IUserAuthorization extends Document {
  userEmail: string;
  smartAccountAddress: string;
  businessWallet: string;
  businessName: string;
  delegation: string;
  createdAt: Date;
  updatedAt: Date;
}

const userAuthorizationSchema = new Schema<IUserAuthorization>(
  {
    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    smartAccountAddress: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    businessWallet: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    delegation: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.UserAuthorization ||
  mongoose.model<IUserAuthorization>(
    "UserAuthorization",
    userAuthorizationSchema
  );
