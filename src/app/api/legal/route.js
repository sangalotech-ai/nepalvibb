import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LegalContent from '@/models/LegalContent';

export async function GET() {
  await dbConnect();
  try {
    const docs = await LegalContent.find({}).sort({ slug: 1 });
    return NextResponse.json(docs);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();
  try {
    const body = await request.json();
    const { slug, title, content, titleEn, contentEn } = body;
    if (!slug || !title) {
      return NextResponse.json({ error: 'slug and title are required' }, { status: 400 });
    }
    const doc = await LegalContent.findOneAndUpdate(
      { slug },
      { slug, title, content, titleEn, contentEn },
      { new: true, upsert: true }
    );
    return NextResponse.json(doc);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
