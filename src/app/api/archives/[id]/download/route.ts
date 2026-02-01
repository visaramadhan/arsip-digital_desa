import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Archive from '@/models/Archive';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const archive = await Archive.findById(id);

    if (!archive || !archive.fileData) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const buffer = archive.fileData;
    const contentType = archive.contentType || 'application/octet-stream';
    const fileName = archive.fileName || 'download.bin';

    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
