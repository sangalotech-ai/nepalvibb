import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Activity from '@/models/Activity';

export async function GET() {
  try {
    await dbConnect();
    const activities = await Activity.find({}).sort({ name: 1 }).lean();
    return NextResponse.json(activities, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'oe')
    .replace(/å/g, 'aa')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    if (!body.name) {
      return NextResponse.json({ error: 'Activity name is required' }, { status: 400 });
    }

    if (!body.slug) {
      body.slug = slugify(body.name);
    } else {
      body.slug = slugify(body.slug);
    }

    // Ensure unique slug
    let finalSlug = body.slug;
    let counter = 1;
    while (await Activity.findOne({ slug: finalSlug })) {
      finalSlug = `${body.slug}-${counter}`;
      counter++;
    }
    body.slug = finalSlug;

    const activity = await Activity.create(body);
    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
