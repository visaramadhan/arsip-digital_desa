import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import DocumentType from '@/models/DocumentType';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    
    const updatedDocType = await DocumentType.findByIdAndUpdate(
      id,
      body,
      { new: true }
    );
    
    if (!updatedDocType) {
      return NextResponse.json({ error: 'Document type not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedDocType);
  } catch (error) {
    console.error('Error updating document type:', error);
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
    
    const deletedDocType = await DocumentType.findByIdAndDelete(id);
    
    if (!deletedDocType) {
      return NextResponse.json({ error: 'Document type not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Document type deleted' });
  } catch (error) {
    console.error('Error deleting document type:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
