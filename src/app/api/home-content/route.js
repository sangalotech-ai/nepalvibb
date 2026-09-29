import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/mongodb';
import HomeContent from '@/models/HomeContent';

export async function GET() {
  try {
    await dbConnect();
    let content = await HomeContent.findOne({});
    if (!content) {
      // Create default if not exists
      content = await HomeContent.create({});
    }
    return NextResponse.json(content, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    let content = await HomeContent.findOne({});
    
    if (content) {
      content = await HomeContent.findByIdAndUpdate(content._id, body, { new: true });
    } else {
      content = await HomeContent.create(body);
    }
    
    // Revalidate the homepage so changes appear immediately
    revalidatePath('/');
    
    return NextResponse.json(content);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

