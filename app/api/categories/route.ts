import { NextResponse } from 'next/server';
import { contentRepository } from '@/lib/content-repository';
export async function GET() { return NextResponse.json({ data: await contentRepository.getCategories() }); }
