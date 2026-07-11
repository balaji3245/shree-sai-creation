import type { Metadata } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import './globals.css';
import { Header, Footer } from '@/components/layout/site-chrome';
import { getNavigation, getSettings } from '@/lib/content-repository';
const display = Cormorant_Garamond({ subsets: ['latin'], variable: '--font-cormorant', weight: ['400','500','600','700'] });
const sans = Manrope({ subsets: ['latin'], variable: '--font-manrope', weight: ['400','500','600','700'] });
export const metadata: Metadata = { title: { default: 'Shree Sai Creation | Luxury Decorative Lighting', template: '%s | Shree Sai Creation' }, description: 'Bespoke chandeliers and decorative lighting for exceptional interiors.', metadataBase: new URL('https://shreesaicreation.in'), openGraph: { type: 'website', locale: 'en_IN', siteName: 'Shree Sai Creation' } };
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [navigation, settings] = await Promise.all([getNavigation(), getSettings()]);
  return <html lang="en" className={`${display.variable} ${sans.variable}`}><body><Header navigation={navigation} />{children}<Footer settings={settings} navigation={navigation} /></body></html>;
}
