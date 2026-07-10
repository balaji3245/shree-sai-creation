'use client';

import { useState } from 'react';
import { PageHero } from '@/components/shared/page-hero';
import { projects } from '@/data/site-data';

export default function ProjectsPage() {
  const [activeType, setActiveType] = useState('All');
  const projectTypes = ['All', ...Array.from(new Set(projects.map((project) => project.type)))];
  const visibleProjects = projects.filter(
    (project) => activeType === 'All' || project.type === activeType,
  );

  return (
    <main>
      <PageHero
        eyebrow="Selected installations"
        title="Light, in its element."
        copy="A collection of spaces shaped by atmosphere, architecture and a shared attention to detail."
        image="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=85"
      />
      <section className="container-luxe py-12">
        <div className="flex gap-2 overflow-auto">
          {projectTypes.map((type) => (
            <button
              className={`whitespace-nowrap px-4 py-2 text-[10px] font-bold uppercase tracking-[.12em] ${activeType === type ? 'bg-ink text-ivory' : 'border border-stone'}`}
              key={type}
              onClick={() => setActiveType(type)}
              type="button"
            >
              {type}
            </button>
          ))}
        </div>
        <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {visibleProjects.map((project, index) => (
            <article className="group mb-5 break-inside-avoid" key={project.slug}>
              <div className="relative overflow-hidden">
                <img
                  alt={project.title}
                  className={`w-full object-cover transition duration-700 group-hover:scale-105 ${index % 3 === 0 ? 'aspect-[4/5]' : 'aspect-[4/3]'}`}
                  src={project.image}
                />
              </div>
              <p className="mt-4 text-[10px] font-bold uppercase tracking-[.14em] text-champagne">
                {project.type} · {project.location}
              </p>
              <h2 className="mt-2 font-display text-3xl">{project.title}</h2>
              <p className="mt-2 text-xs leading-6 text-ink/60">{project.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
