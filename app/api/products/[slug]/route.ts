import { NextResponse } from 'next/server';
import { getProduct } from '@/lib/content-repository';
export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  return product ? NextResponse.json({ data: product }) : NextResponse.json({ error: 'Product not found' }, { status: 404 });
}
