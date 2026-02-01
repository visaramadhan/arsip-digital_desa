import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Archive from '@/models/Archive';
import DocumentType from '@/models/DocumentType';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    const body = await request.json();
    const { title, documentTypeId, fileName, fileData, contentType } = body;
    
    const archive = await Archive.findById(id);
    if (!archive) {
      return NextResponse.json({ error: 'Archive not found' }, { status: 404 });
    }

    let updateData: any = {
      title,
      documentTypeId,
    };

    // Update Document Type Name if changed
    if (documentTypeId && documentTypeId !== archive.documentTypeId) {
        const docType = await DocumentType.findById(documentTypeId).catch(() => null);
        if (docType) {
            updateData.documentTypeName = docType.name;
        }
    }

    // Handle File Update
    if (fileData) {
      const base64Data = fileData.split(';base64,').pop();
      const buffer = Buffer.from(base64Data, 'base64');
      
      updateData.fileData = buffer;
      updateData.fileName = fileName;
      updateData.contentType = contentType;
      updateData.storagePath = 'mongodb';
      updateData.fileUrl = `/api/archives/${id}/download`;
    }

    const updatedArchive = await Archive.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedArchive) {
      return NextResponse.json({ error: 'Failed to update archive' }, { status: 500 });
    }
    
    // Remove binary data from response
    const responseArchive = updatedArchive.toObject();
    delete responseArchive.fileData;
    
    return NextResponse.json(responseArchive);
  } catch (error) {
    console.error('Error updating archive:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

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

    // With MongoDB embedded storage, deleting the document automatically deletes the file data.
    await Archive.findByIdAndDelete(id);
    
    return NextResponse.json({ message: 'Archive deleted' });
  } catch (error) {
    console.error('Error deleting archive:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
