import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SiteSettings from '@/models/SiteSettings';

export async function GET() {
  try {
    await dbConnect();
    let settings = await SiteSettings.findOne({}).lean();
    if (!settings) {
      settings = await SiteSettings.create({});
      settings = JSON.parse(JSON.stringify(settings));
    }
    return NextResponse.json(settings, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const data = await req.json();
    const settings = await SiteSettings.findOneAndUpdate({}, data, { new: true, upsert: true });
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
