import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tour from '@/models/Tour';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const skip = (page - 1) * limit;

    const [tours, total] = await Promise.all([
      Tour.find({})
        .select('title titleEn slug price duration difficulty image summary summaryEn category categoryEn isFeatured')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Tour.countDocuments({}),
    ]);

    return NextResponse.json(
      {
        tours,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Auto-generate slug if not provided
    if (!body.slug && body.title) {
      body.slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const tour = await Tour.create(body);
    return NextResponse.json(tour);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
