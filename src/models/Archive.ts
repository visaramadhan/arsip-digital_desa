import mongoose, { Schema, Model, models } from 'mongoose';

export interface IArchive {
  title: string;
  documentTypeId: string;
  documentTypeName: string;
  fileUrl: string;
  fileName: string;
  storagePath: string; // Keeping this for compatibility, though it might be local path
  uploadedBy: string; // User UID
  createdAt: Date;
  updatedAt: Date;
}

const ArchiveSchema = new Schema<IArchive>(
  {
    title: { type: String, required: true },
    documentTypeId: { type: String, required: true },
    documentTypeName: { type: String },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    storagePath: { type: String },
    uploadedBy: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Archive: Model<IArchive> = models.Archive || mongoose.model<IArchive>('Archive', ArchiveSchema);

export default Archive;
