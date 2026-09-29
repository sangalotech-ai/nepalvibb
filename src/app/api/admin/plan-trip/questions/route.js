import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PlanTripQuestion from '@/models/PlanTripQuestion';

export async function GET() {
  try {
    await dbConnect();
    const questions = await PlanTripQuestion.find({}).sort({ order: 1 });
    return NextResponse.json(questions, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const question = await PlanTripQuestion.create(body);
    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { id, ...updateData } = body;
    const question = await PlanTripQuestion.findByIdAndUpdate(id, updateData, { new: true });
    return NextResponse.json(question);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    await PlanTripQuestion.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Question deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
  }
}
