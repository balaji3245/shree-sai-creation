import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPost } from '@/lib/content-repository';

export default async function Post({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug); if (!post) notFound();
  return <main><article><header className="container-luxe mx-auto max-w-5xl py-16 text-center sm:py-24"><p className="eyebrow">{post.category} · {post.date}</p><h1 className="display mt-5 text-6xl sm:text-8xl">{post.title}</h1><p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-ink/65">{post.excerpt}</p></header><img src={post.image} alt={post.title} className="mx-auto aspect-[16/8] max-h-[700px] w-full max-w-[1600px] object-cover"/><div className="mx-auto max-w-2xl px-5 py-16 text-base leading-8 text-ink/70"><p>Great lighting begins with a sense of proportion. It notices how a room is used, how its surfaces respond and what you want to feel when you enter.</p><p className="mt-6">At Shree Sai Creation, we favour a layered approach: a statement piece for identity, ambient light for ease and considered details for intimacy. The result is never simply brighter. It is more alive.</p><p className="mt-6">Whether you are selecting from a collection or developing a bespoke design, use your architecture as the guide. The most memorable light always feels inevitable in its setting.</p><Link href="/blog" className="mt-12 inline-block text-xs font-bold uppercase tracking-[.14em] text-champagne">← Back to journal</Link></div></article></main>;
}
