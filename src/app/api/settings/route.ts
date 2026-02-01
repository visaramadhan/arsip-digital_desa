import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Institution from '@/models/Institution';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

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
    
    // Validation
    if (!name || !address || !phone || !email || !description) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Handle Logo Upload
    const logoFile = formData.get('logo') as File | null;
    let logoUrl = formData.get('existingLogoUrl') as string | undefined;

    if (logoFile && logoFile.size > 0) {
      const sanitizedFileName = logoFile.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const filename = `settings/logo-${Date.now()}-${sanitizedFileName}`;
      const storageRef = ref(storage, filename);
      
      const bytes = await logoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const snapshot = await uploadBytes(storageRef, buffer);
      logoUrl = await getDownloadURL(snapshot.ref);
    }

    // Handle PDF Uploads
    const documentFiles = formData.getAll('documents') as File[];
    const existingDocumentsJson = formData.get('existingDocuments') as string;
    let documents: any[] = existingDocumentsJson ? JSON.parse(existingDocumentsJson) : [];
    
    // Ensure existing documents have the correct structure
    documents = documents.map(doc => ({
        name: doc.name,
        url: doc.url,
        uploadedAt: doc.uploadedAt || new Date()
    }));

    for (const docFile of documentFiles) {
      if (docFile instanceof File && docFile.size > 0) {
        const sanitizedFileName = docFile.name.replace(/[^a-zA-Z0-9.]/g, "_");
        const filename = `settings/doc-${Date.now()}-${sanitizedFileName}`;
        const storageRef = ref(storage, filename);
        
        const bytes = await docFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const snapshot = await uploadBytes(storageRef, buffer);
        const fileUrl = await getDownloadURL(snapshot.ref);
        
        documents.push({
          name: docFile.name,
          url: fileUrl,
          uploadedAt: new Date(),
        });
      }
    }

    const updateData: any = {
      name,
      address,
      phone,
      email,
      description,
      dashboardTitle: dashboardTitle || "Sistem Arsip Digital Desa",
      documents,
    };
    
    if (logoUrl) {
      updateData.logoUrl = logoUrl;
    }

    // Upsert: update if exists, insert if not
    // We only want ONE institution profile
    const existing = await Institution.findOne();
    let result;
    
    if (existing) {
        result = await Institution.findByIdAndUpdate(existing._id, updateData, { new: true });
    } else {
        result = await Institution.create(updateData);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}
