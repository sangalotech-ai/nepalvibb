import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tour from '@/models/Tour';

export async function GET() {
  try {
    await dbConnect();
    const tours = await Tour.find({})
      .select('title titleEn slug price duration difficulty image summary summaryEn category categoryEn isFeatured')
      .limit(9)
      .lean();
      
    return NextResponse.json(tours, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
