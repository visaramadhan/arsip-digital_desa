import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Archive from '@/models/Archive';
import DocumentType from '@/models/DocumentType';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const typeId = searchParams.get('typeId');

    let query: any = {};

    if (typeId && typeId !== 'all') {
      query.documentTypeId = typeId;
    }

    if (year && year !== 'all') {
      const yearInt = parseInt(year);
      const startDate = new Date(yearInt, 0, 1);
      const endDate = new Date(yearInt + 1, 0, 1);
      
      if (month && month !== 'all') {
        const monthInt = parseInt(month) - 1; // 0-indexed
        const startMonth = new Date(yearInt, monthInt, 1);
        const endMonth = new Date(yearInt, monthInt + 1, 1);
        query.createdAt = { $gte: startMonth, $lt: endMonth };
      } else {
        query.createdAt = { $gte: startDate, $lt: endDate };
      }
    }

    const archives = await Archive.find(query).sort({ createdAt: -1 });
    return NextResponse.json(archives);
  } catch (error) {
    console.error('Error fetching archives:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { title, documentTypeId, uploadedBy, fileName, fileData, contentType } = body;
    
    if (!title || !documentTypeId || !fileName || !fileData) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Get Document Type Name
    let documentTypeName = "";
    if (documentTypeId) {
        const docType = await DocumentType.findById(documentTypeId).catch(() => null);
        if (docType) {
            documentTypeName = docType.name;
        } else {
             documentTypeName = "Document";
        }
    }

    // 2. Convert Base64 to Buffer
    // fileData format is usually "data:application/pdf;base64,....."
    const base64Data = fileData.split(';base64,').pop();
    const buffer = Buffer.from(base64Data, 'base64');

    // 3. Create Archive in MongoDB
    // Note: We use a placeholder ID for fileUrl first, then update it, 
    // or we can generate ID first. Let's let MongoDB generate ID.
    
    const archive = new Archive({
      title,
      documentTypeId,
      documentTypeName,
      fileName,
      uploadedBy,
      fileData: buffer,
      contentType: contentType || 'application/octet-stream',
      fileUrl: 'pending', // Temporary placeholder to pass validation
      storagePath: 'mongodb', // Indicator
    });

    // Generate ID and set correct URL before saving
    archive.fileUrl = `/api/archives/${archive._id}/download`;

    await archive.save();

    // Return archive without heavy fileData
    const responseArchive = archive.toObject();
    delete responseArchive.fileData;

    return NextResponse.json(responseArchive, { status: 201 });
  } catch (error) {
    console.error('Error creating archive:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}
