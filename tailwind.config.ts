import type { Config } from 'tailwindcss';
const config: Config = { content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'], theme: { extend: { colors: { ink: '#0B0F19', ivory: '#F5F5F5', champagne: '#D4AF37', stone: '#D9DDE6', bronze: '#9E7D19', midnight: '#111827' }, fontFamily: { display: ['var(--font-cormorant)', 'serif'], sans: ['var(--font-manrope)', 'sans-serif'] }, boxShadow: { luxe: '0 30px 90px rgba(11, 15, 25, .18)', glow: '0 14px 50px rgba(212, 175, 55, .18)' } } }, plugins: [] };
export default config;
