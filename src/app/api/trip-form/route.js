import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TripForm from '@/models/TripForm';

export async function GET() {
  try {
    await dbConnect();
    const steps = await TripForm.find({ isActive: true }).sort({ step: 1 });
    return NextResponse.json(steps, {
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
    const data = await request.json();
    const newStep = await TripForm.create(data);
    return NextResponse.json(newStep);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
