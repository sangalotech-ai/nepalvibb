import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tour from '@/models/Tour';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { slug } = await params;
    const tour = await Tour.findOne({ slug }).lean();
    
    if (!tour) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }
    
    return NextResponse.json(tour, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
