import mongoose, { Schema } from 'mongoose';
import { IUser } from '../utils/customTypes';


const UserSchema: Schema = new Schema(
   {
      username: { type: String, required: true, trim: true },
      email: { type: String, required: true, unique: true, trim: true },
      password: { type: String, required: true },
      contacts: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      token: { type: String, default: '' }
   },
   { timestamps: true }
);

const User = mongoose.model<IUser>('User', UserSchema);

export default User;