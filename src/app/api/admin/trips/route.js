import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tour from '@/models/Tour';

// GET all tours
export async function GET() {
  try {
    await dbConnect();
    const tours = await Tour.find({}).sort({ createdAt: -1 });
    return NextResponse.json(tours, {
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

// POST create a new tour
export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();

    if (!data.slug && data.title) {
      data.slug = data.title
        .toLowerCase()
        .replace(/æ/g, 'ae')
        .replace(/ø/g, 'oe')
        .replace(/å/g, 'aa')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    if (data.slug) {
      let slug = data.slug;
      let count = 1;
      while (await Tour.findOne({ slug })) {
        slug = `${data.slug}-${count}`;
        count++;
      }
      data.slug = slug;
    }

    const tour = await Tour.create(data);
    return NextResponse.json(tour, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
