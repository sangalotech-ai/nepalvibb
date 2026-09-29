import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TeamMember from '@/models/TeamMember';

export async function GET() {
  await dbConnect();
  try {
    const members = await TeamMember.find({}).sort({ order: 1 });
    return NextResponse.json(members, {
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
  await dbConnect();
  try {
    const body = await request.json();
    const member = await TeamMember.create(body);
    return NextResponse.json(member);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
