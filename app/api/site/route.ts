import { NextResponse } from 'next/server';
import { contentRepository } from '@/lib/content-repository';

export async function GET() {
  const [settings, navigation, home] = await Promise.all([
    contentRepository.getSettings(),
    contentRepository.getNavigation(),
    contentRepository.getHomeContent(),
  ]);
  return NextResponse.json({ data: { settings, navigation, faqs: home.faqs } });
}
