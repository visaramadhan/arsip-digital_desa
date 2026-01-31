import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import DocumentType from '@/models/DocumentType';

export async function GET() {
  try {
    await connectToDatabase();
    const docTypes = await DocumentType.find().sort({ name: 1 });
    
    // If no document types exist (fresh DB), seed some?
    if (docTypes.length === 0) {
        const dummyTypes = [
            { name: "Surat Keputusan", description: "Dokumen yang berisi keputusan resmi" },
            { name: "Surat Keterangan", description: "Surat keterangan untuk warga" },
            { name: "Surat Masuk", description: "Arsip surat yang diterima" },
            { name: "Surat Keluar", description: "Arsip surat yang dikirim" },
            { name: "Peraturan Desa", description: "Dokumen peraturan desa" },
        ];
        
        await DocumentType.insertMany(dummyTypes);
        const seeded = await DocumentType.find().sort({ name: 1 });
        return NextResponse.json(seeded);
    }
    
    return NextResponse.json(docTypes);
  } catch (error) {
    console.error('Error fetching document types:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
