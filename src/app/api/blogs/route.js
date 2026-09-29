import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Blog from '@/models/Blog';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const isAll = searchParams.get('all') === 'true';

    let query = isAll ? {} : { isPublished: { $ne: false } };
    let blogQuery = Blog.find(query).sort({ createdAt: -1 });

    if (!isAll) {
      blogQuery = blogQuery.select('title titleEn slug image summary summaryEn category categoryEn readTime author createdAt isFeatured');
    }

    const blogs = await blogQuery.lean();
      
    return NextResponse.json(blogs, {
      headers: {
        'Cache-Control': isAll
          ? 'no-store, no-cache, must-revalidate, proxy-revalidate'
          : 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    if (!body.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!body.slug && body.title) {
      body.slug = body.title
        .toLowerCase()
        .replace(/æ/g, 'ae')
        .replace(/ø/g, 'oe')
        .replace(/å/g, 'aa')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    if (body.slug) {
      let slug = body.slug;
      let count = 1;
      while (await Blog.findOne({ slug })) {
        slug = `${body.slug}-${count}`;
        count++;
      }
      body.slug = slug;
    }

    const blog = await Blog.create(body);
    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
