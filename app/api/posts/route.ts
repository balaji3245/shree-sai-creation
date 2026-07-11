import { NextResponse } from 'next/server'; import { getPosts } from '@/lib/content-repository';
export async function GET() { const posts = await getPosts(); return NextResponse.json({ data: posts, meta: { total: posts.length } }); }
