import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/content-repository';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const products = await getProducts({
    query: searchParams.get('q') ?? undefined,
    category: searchParams.get('category') ?? undefined,
    style: searchParams.get('style') ?? undefined,
    space: searchParams.get('space') ?? undefined,
  });
  return NextResponse.json({ data: products, meta: { total: products.length } });
}
