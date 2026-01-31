import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    await connectToDatabase();
    const { uid } = await params;
    
    let user = await User.findOne({ uid });
    
    if (!user) {
      // If user doesn't exist in MongoDB but is authenticated via Firebase, 
      // we can return a 404 or create a default one. 
      // For consistency with the old logic, let's return null and let the client handle creation
      // OR better, creating it here if it's a first-time fetch?
      // The old AuthContext logic created it if missing.
      return NextResponse.json(null, { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    await connectToDatabase();
    const { uid } = await params;
    const body = await request.json();
    
    const user = await User.findOneAndUpdate(
      { uid },
      { ...body, uid }, // Ensure UID is set
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
