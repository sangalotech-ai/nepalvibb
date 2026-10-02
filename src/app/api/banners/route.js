import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/mongodb';
import Banner from '@/models/Banner';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('all') === 'true';
    const filter = showAll ? {} : { isActive: { $ne: false } };
    const banners = await Banner.find(filter).sort({ order: 1 }).lean();
    return NextResponse.json(banners, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// For admin use
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const banner = await Banner.create(body);
    revalidatePath('/');
    return NextResponse.json(banner);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
