'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { PageHero } from '@/components/shared/page-hero';
import { ProductCard } from '@/components/shared/ui';
import type { Product, ProductCategory } from '@/types';

export default function Collections() {
  const [term, setTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { Promise.all([fetch('/api/products').then(r => r.json()), fetch('/api/categories').then(r => r.json())]).then(([productResponse, categoryResponse]) => { setProducts(productResponse.data); setCategories(categoryResponse.data); }).finally(() => setLoading(false)); }, []);
  const shown = useMemo(() => products.filter((product) => (category === 'All' || product.category === category) && product.name.toLowerCase().includes(term.toLowerCase())), [category, products, term]);

  return <main><PageHero eyebrow="The collection" title="Considered objects of light." copy="Explore chandeliers and decorative lighting defined by material, proportion and a distinctly personal glow."/><section className="container-luxe py-12"><div className="flex flex-col justify-between gap-6 border-y border-stone py-5 lg:flex-row lg:items-center"><div className="flex gap-2 overflow-x-auto">{['All', ...categories.map((item) => item.name)].map((item) => <button key={item} onClick={() => setCategory(item)} className={`whitespace-nowrap px-3 py-2 text-[10px] font-bold uppercase tracking-[.12em] ${category === item ? 'bg-ink text-ivory' : 'border border-stone text-ink/60'}`}>{item}</button>)}</div><label className="flex items-center gap-2 border-b border-ink/30 pb-2 text-sm"><Search size={15}/><input value={term} onChange={event => setTerm(event.target.value)} placeholder="Search pieces" className="w-44 bg-transparent outline-none placeholder:text-ink/40"/></label></div><div className="mt-10 flex items-center justify-between"><p className="text-xs text-ink/55">{loading ? 'Loading collection...' : `${shown.length} pieces`}</p><button className="text-xs font-bold uppercase tracking-[.12em]" type="button">Sort: Featured</button></div><div className="mt-8 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{shown.map(product => <ProductCard key={product.id} product={product}/>)}</div>{!loading && !shown.length && <p className="py-20 text-center text-ink/50">No pieces matched your search. Explore all collections.</p>}</section></main>;
}
