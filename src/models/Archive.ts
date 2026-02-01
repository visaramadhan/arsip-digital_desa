import mongoose, { Schema, Model, models } from 'mongoose';

export interface IArchive {
  title: string;
  documentTypeId: string;
  documentTypeName: string;
  fileUrl: string; // Will point to our internal API
  fileName: string;
  storagePath: string; // Not used for MongoDB storage, but kept for schema compatibility
  fileData?: Buffer; // Binary data
  contentType?: string; // MIME type
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
    fileData: { type: Buffer },
    contentType: { type: String },
    uploadedBy: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Archive: Model<IArchive> = models.Archive || mongoose.model<IArchive>('Archive', ArchiveSchema);

export default Archive;
