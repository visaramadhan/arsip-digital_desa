import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Institution from '@/models/Institution';
import { writeFile } from 'fs/promises';
import path from 'path';
import { mkdir } from 'fs/promises';

export async function GET() {
  try {
    await connectToDatabase();
    const institution = await Institution.findOne().sort({ createdAt: -1 });
    
    if (!institution) {
      return NextResponse.json(null);
    }
    
    return NextResponse.json(institution);
  } catch (error) {
    console.error('Error fetching institution settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const description = formData.get('description') as string;
    const dashboardTitle = formData.get('dashboardTitle') as string;
    
    // Handle Logo Upload
    const logoFile = formData.get('logo') as File | null;
    let logoUrl = formData.get('existingLogoUrl') as string | undefined;

    if (logoFile && logoFile.size > 0) {
      const bytes = await logoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const filename = `logo-${Date.now()}${path.extname(logoFile.name)}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      
      // Ensure directory exists
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (e) {
        // Ignore if exists
      }
      
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      logoUrl = `/uploads/${filename}`;
    }

    // Handle PDF Uploads
    const documentFiles = formData.getAll('documents') as File[];
    const existingDocumentsJson = formData.get('existingDocuments') as string;
    let documents = existingDocumentsJson ? JSON.parse(existingDocumentsJson) : [];

    for (const docFile of documentFiles) {
      if (docFile instanceof File && docFile.size > 0) {
        const bytes = await docFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const filename = `doc-${Date.now()}-${docFile.name}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        
        try {
          await mkdir(uploadDir, { recursive: true });
        } catch (e) {
          // Ignore
        }
        
        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);
        
        documents.push({
          name: docFile.name,
          url: `/uploads/${filename}`,
          uploadedAt: new Date(),
        });
      }
    }

    const updateData = {
      name,
      address,
      phone,
      email,
      description,
      dashboardTitle,
      logoUrl,
      documents,
    };

    // Find and update or create new
    // We assume only one profile exists effectively, but let's use findOneAndUpdate with upsert
    const institution = await Institution.findOneAndUpdate(
      {}, 
      updateData, 
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(institution);
  } catch (error) {
    console.error('Error updating institution settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
