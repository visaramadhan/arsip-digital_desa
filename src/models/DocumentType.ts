import mongoose, { Schema, Model, models } from 'mongoose';

export interface IDocumentType {
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentTypeSchema = new Schema<IDocumentType>(
  {
    name: { type: String, required: true },
    description: { type: String },
  },
  {
    timestamps: true,
  }
);

const DocumentType: Model<IDocumentType> = models.DocumentType || mongoose.model<IDocumentType>('DocumentType', DocumentTypeSchema);

export default DocumentType;
