import type { Config } from 'tailwindcss';
const config: Config = { content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'], theme: { extend: { colors: { ink: '#181715', ivory: '#f6f3ed', champagne: '#b8955e', stone: '#e4dfd6', bronze: '#80633b' }, fontFamily: { display: ['var(--font-cormorant)', 'serif'], sans: ['var(--font-manrope)', 'sans-serif'] }, boxShadow: { luxe: '0 24px 65px rgba(24, 23, 21, .15)' } } }, plugins: [] };
export default config;
