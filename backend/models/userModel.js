import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  membership_start_date: { type: Date, required: true },
  membership_expiry_date: { type: Date, required: true },
});

export const User = mongoose.model('User', UserSchema);

