import mongoose from "mongoose";

const CardSchema = new mongoose.Schema(
  {
    identifier: { type: String, required: true },
  },
  { timestamps: true }
);

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    encryptedPrivateKey: { type: String, default: null },
    cards: { type: [CardSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
