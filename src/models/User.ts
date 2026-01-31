import mongoose, { Schema, Model, models } from 'mongoose';

export interface IUser {
  uid: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    uid: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    role: { type: String, default: 'pengguna' },
    firstName: { type: String },
    lastName: { type: String },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
