import mongoose, { Schema, Model, models } from 'mongoose';

export interface IInstitution {
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  dashboardTitle?: string;
  logoUrl?: string;
  documents?: {
    name: string;
    url: string;
    uploadedAt: Date;
  }[];
  updatedAt: Date;
}

const InstitutionSchema = new Schema<IInstitution>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    description: { type: String, required: true },
    dashboardTitle: { type: String },
    logoUrl: { type: String },
    documents: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Prevent overwriting the model if it's already compiled
const Institution: Model<IInstitution> =
  models.Institution || mongoose.model<IInstitution>('Institution', InstitutionSchema);

export default Institution;
