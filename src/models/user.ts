import mongoose, { Schema } from 'mongoose';
import { IUser } from '../utils/customTypes';


const UserSchema: Schema = new Schema(
   {
      username: { type: String, required: true, trim: true },
      email: { type: String, required: true, unique: true, trim: true },
      password: { type: String, required: true },
      image: {
         id: {
            type: String,
            default: ''
         },
         url: {
            type: String,
            default: ''
         }
      },
      lastSeen: { type: Date, default: null },
      isVerified: { type: Boolean, default: false },
      otp: String,
      otpExpiresAt: Date,
      token: { type: String, default: '' },
      refreshToken: { type: String, default: '' }
   },
   { timestamps: true }
);

const User = mongoose.model<IUser>('User', UserSchema);

export default User;