import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Destination from '@/models/Destination';

export async function GET() {
  try {
    await dbConnect();
    const destinations = await Destination.find({}).sort({ name: 1 });
    return NextResponse.json(destinations, {
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

export async function POST(req) {
  try {
    await dbConnect();
    const data = await req.json();

    if (!data.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!data.slug) {
      data.slug = data.name
        .toLowerCase()
        .replace(/æ/g, 'ae')
        .replace(/ø/g, 'oe')
        .replace(/å/g, 'aa')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    let slug = data.slug;
    let count = 1;
    while (await Destination.findOne({ slug })) {
      slug = `${data.slug}-${count}`;
      count++;
    }
    data.slug = slug;

    const destination = await Destination.create(data);
    return NextResponse.json(destination, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const data = await req.json();
    const { _id, ...updateData } = data;

    if (!updateData.slug && updateData.name) {
      updateData.slug = updateData.name
        .toLowerCase()
        .replace(/æ/g, 'ae')
        .replace(/ø/g, 'oe')
        .replace(/å/g, 'aa')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const destination = await Destination.findByIdAndUpdate(_id, updateData, { new: true });
    return NextResponse.json(destination);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    await Destination.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

