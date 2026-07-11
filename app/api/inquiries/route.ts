import { NextResponse } from 'next/server';
const requiredFields = ['name', 'phone', 'email', 'city', 'projectType'];
export async function POST(request: Request) {
  const body = await request.json();
  const missing = requiredFields.filter((field) => !body[field]?.trim());
  if (missing.length) return NextResponse.json({ error: `Missing: ${missing.join(', ')}` }, { status: 400 });
  return NextResponse.json({ data: { id: crypto.randomUUID(), status: 'received' } }, { status: 202 });
}
