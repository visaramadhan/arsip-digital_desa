import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Archive from '@/models/Archive';
import { unlink } from 'fs/promises';
import path from 'path';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    const archive = await Archive.findById(id);
    
    if (!archive) {
      return NextResponse.json({ error: 'Archive not found' }, { status: 404 });
    }

    // Delete file from disk
    // The storagePath in DB might be absolute or relative or just filename depending on how we saved it.
    // In POST, we saved absolute path to `storagePath`.
    // But we need to be careful if it was migrated data vs new data.
    // For now, only new data has `storagePath` as absolute path on server.
    if (archive.storagePath) {
        try {
            // Check if it's an absolute path or relative
            // If it starts with uploads/, it's relative
            // If it contains disk drive (C:), it's absolute
            let filePathToDelete = archive.storagePath;
            if (!path.isAbsolute(filePathToDelete)) {
                 filePathToDelete = path.join(process.cwd(), 'public', filePathToDelete);
            }
            
            await unlink(filePathToDelete);
        } catch (e) {
            console.error("Failed to delete file from disk:", e);
            // Continue to delete record even if file deletion fails
        }
    }

    await Archive.findByIdAndDelete(id);
    
    return NextResponse.json({ message: 'Archive deleted' });
  } catch (error) {
    console.error('Error deleting archive:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
