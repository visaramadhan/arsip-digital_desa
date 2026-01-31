import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Archive from '@/models/Archive';
import User from '@/models/User';
import DocumentType from '@/models/DocumentType';

export async function GET() {
  try {
    await connectToDatabase();
    
    const [totalArchives, totalUsers, totalDocTypes, archives] = await Promise.all([
      Archive.countDocuments(),
      User.countDocuments(),
      DocumentType.countDocuments(),
      Archive.find({}, 'documentTypeName') // Fetch only documentTypeName for aggregation
    ]);

    // Aggregate Archives per Type
    const typeCounts: Record<string, number> = {};
    archives.forEach((doc) => {
      const typeName = doc.documentTypeName || "Unknown";
      typeCounts[typeName] = (typeCounts[typeName] || 0) + 1;
    });

    const archivesPerType = Object.entries(typeCounts).map(([name, count]) => ({
      name,
      count
    }));

    return NextResponse.json({
      totalArchives,
      totalUsers,
      totalDocTypes,
      archivesPerType
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
