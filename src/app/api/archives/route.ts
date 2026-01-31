import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Archive from '@/models/Archive';
import DocumentType from '@/models/DocumentType';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

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
    
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const documentTypeId = formData.get('documentTypeId') as string;
    const uploadedBy = formData.get('uploadedBy') as string;
    const file = formData.get('file') as File;
    
    if (!file) {
        return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    // 1. Upload File
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Sanitize filename
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const filename = `archive-${Date.now()}-${sanitizedFileName}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'archives');
    
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Ignore
    }
    
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);
    const fileUrl = `/uploads/archives/${filename}`;

    // 2. Get Document Type Name
    let documentTypeName = "";
    if (documentTypeId) {
        // Since we are migrating, we might need to handle if documentTypeId is from Firestore (string ID) 
        // or MongoDB (ObjectId). For now, let's assume we'll fetch from MongoDB if we seeded it, 
        // or just accept what's passed if we can't find it. 
        // Ideally, we should migrate DocumentTypes to MongoDB too.
        // For this step, let's try to find it in MongoDB, if not found, maybe it's a legacy ID?
        // Or simpler: The frontend can pass the name, or we fetch it here.
        // Let's assume we migrated DocumentTypes or created some default ones.
        const docType = await DocumentType.findById(documentTypeId).catch(() => null);
        if (docType) {
            documentTypeName = docType.name;
        } else {
             // Fallback: Check if we have dummy data or just use a placeholder
             // Or maybe the user passed the name? No, usually ID.
             // If we haven't migrated document types, this lookup will fail.
             // We should create an API for DocumentTypes and ensure they exist.
             // For now, let's just use "Unknown" or try to find by ID string if we used string IDs.
             documentTypeName = "Document";
        }
    }

    // 3. Create Archive in MongoDB
    const archive = await Archive.create({
      title,
      documentTypeId,
      documentTypeName,
      fileUrl,
      fileName: file.name,
      storagePath: filepath, // Storing local path
      uploadedBy,
    });

    return NextResponse.json(archive, { status: 201 });
  } catch (error) {
    console.error('Error creating archive:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
