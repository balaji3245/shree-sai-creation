import { NextRequest, NextResponse } from 'next/server';
import { getProjects } from '@/lib/content-repository';
export async function GET(request: NextRequest) { const projects = await getProjects(new URL(request.url).searchParams.get('type') ?? undefined); return NextResponse.json({ data: projects, meta: { total: projects.length } }); }
