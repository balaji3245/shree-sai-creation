import type { BlogPost, FAQ, Product, ProductCategory, Project, SiteSettings, Testimonial } from '@/types';

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=85`;
export const settings: SiteSettings = { phone: '+91 00000 00000', whatsapp: '+910000000000', email: 'hello@shreesaicreation.in', address: 'Showroom address, Mumbai, India', serviceArea: 'Serving discerning spaces across India' };
export const navigation = [{ label:'Home',href:'/' },{ label:'About',href:'/about' },{ label:'Collections',href:'/collections' },{ label:'Projects',href:'/projects' },{ label:'Bespoke',href:'/bespoke' },{ label:'Journal',href:'/blog' },{ label:'Contact',href:'/contact' }];
export const categories: ProductCategory[] = [
 { id:'crystal', name:'Crystal Chandeliers', slug:'crystal-chandeliers', description:'Hand-finished brilliance for rooms made to gather.', image:img('photo-1540932239986-30128078f3c5') },
 { id:'modern', name:'Modern Chandeliers', slug:'modern-chandeliers', description:'Sculptural forms with a quiet contemporary presence.', image:img('photo-1513694203232-719a280e022f') },
 { id:'pendant', name:'Luxury Pendant Lights', slug:'luxury-pendants', description:'A measured glow above dining and living spaces.', image:img('photo-1524484485831-a92ffc0de03f') },
 { id:'ceiling', name:'Decorative Ceiling Lights', slug:'ceiling-lights', description:'Refined light for the everyday extraordinary.', image:img('photo-1600607687939-ce8a6c25118c') },
 { id:'staircase', name:'Staircase Chandeliers', slug:'staircase-chandeliers', description:'Dramatic vertical compositions, tailored to architecture.', image:img('photo-1600210492486-724fe5c67fb0') },
 { id:'bespoke', name:'Bespoke Lighting', slug:'bespoke-lighting', description:'One-of-one pieces created around your space.', image:img('photo-1618221195710-dd6b41faaea6') }
];
const seed = [
 ['Aurelia Cascade','Crystal Chandeliers','A cascading composition of hand-cut crystal, designed for double-height arrivals.','photo-1540932239986-30128078f3c5','Ø 120 × H 240 cm','K9 crystal, brass','Antique champagne','Foyer / staircase','Classic'],
 ['Celeste Orbit','Modern Chandeliers','Satin brass rings orbit around an opal glow.','photo-1513694203232-719a280e022f','Ø 95 × H 75 cm','Brass, opal glass','Satin brass','Living room','Contemporary'],
 ['Noor Linear','Luxury Pendant Lights','A rhythmic pendant arrangement for beautifully considered dining.','photo-1524484485831-a92ffc0de03f','L 140 × H 42 cm','Metal, blown glass','Smoked bronze','Dining room','Modern'],
 ['Elysian Bloom','Decorative Ceiling Lights','A floral ceiling light with a warm, diffused centre.','photo-1600607687939-ce8a6c25118c','Ø 78 × H 28 cm','Glass, brass','Soft gold','Bedroom','Classic'],
 ['Veda Rain','Staircase Chandeliers','Hundreds of illuminated droplets, suspended to your exact height.','photo-1600210492486-724fe5c67fb0','Custom height','Crystal, stainless steel','Mirror chrome','Double-height foyer','Contemporary'],
 ['Mira Halo','Modern Chandeliers','A minimal luminous gesture with maximum atmosphere.','photo-1618221195710-dd6b41faaea6','Ø 110 cm','Aluminium, acrylic','Matte black','Living room','Modern'],
 ['Riviera Prism','Crystal Chandeliers','Architectural prisms bring a poised sparkle to formal rooms.','photo-1600566753086-00f18fb6b3ea','Ø 88 × H 92 cm','Crystal, iron','French gold','Dining room','Classic'],
 ['Siena Cluster','Luxury Pendant Lights','A tactile cluster that makes a statement without noise.','photo-1600607687920-4e2a09cf159d','Ø 62 × H 95 cm','Hand-blown glass','Champagne','Bedroom','Contemporary'],
 ['Opaline Crest','Decorative Ceiling Lights','A low-profile statement rendered in textured opaline glass.','photo-1600585154340-be6161a56a0c','Ø 68 × H 20 cm','Glass, brass','Aged brass','Study','Modern'],
 ['Aster Grand','Staircase Chandeliers','A grand, tiered cascade for hotel and villa atriums.','photo-1600607688969-a5bfcd646154','Ø 150 × H 300 cm','Crystal, brass','Polished gold','Hotel lobby','Classic'],
 ['Arden Axis','Modern Chandeliers','Linear geometry for open-plan contemporary interiors.','photo-1600210491892-03d54c0aaf87','L 130 × H 55 cm','Steel, glass','Gunmetal','Dining room','Contemporary'],
 ['Luna Atelier','Bespoke Lighting','A made-to-measure constellation for a private residence.','photo-1600585154363-67eb9e2e2099','Made to measure','Glass, metal','Custom finish','Villa foyer','Bespoke'],
 ['Regent Tier','Crystal Chandeliers','Layers of precision-cut crystal with an heirloom silhouette.','photo-1600607688960-e095ff83135c','Ø 100 × H 130 cm','Crystal, brass','Antique gold','Banquet hall','Classic'],
 ['Noma Arc','Luxury Pendant Lights','A gentle arc of glowing hand-blown forms.','photo-1600566753190-17f0baa2a6c3','L 120 × H 58 cm','Glass, metal','Bronze','Kitchen island','Modern'],
];
export const products: Product[] = seed.map((p,i) => ({ id:String(i+1), slug:p[0].toLowerCase().replace(/ /g,'-'), name:p[0], category:p[1], description:p[2], image:img(p[3]), images:[img(p[3]),img(i%2?'photo-1600607687920-4e2a09cf159d':'photo-1600585154340-be6161a56a0c')], dimensions:p[4], material:p[5], finish:p[6], space:p[7], style:p[8], featured:i<8 }));
export const projects: Project[] = [
 ['malabar-residence','The Malabar Residence','Private Villa','Mumbai','A cascading crystal installation that gives a double-height foyer its own sense of ceremony.','photo-1600210492486-724fe5c67fb0','Aurelia Cascade'],
 ['palm-house','Palm House','Luxury Home','Goa','Warm brass and soft glass give this open living room a languid evening glow.','photo-1600585154340-be6161a56a0c','Celeste Orbit'],
 ['orion-hotel','Hotel Orion Lobby','Hospitality','New Delhi','A custom 3-metre composition welcomes every guest with quiet grandeur.','photo-1600607688969-a5bfcd646154','Aster Grand'],
 ['sapphire-banquet','Sapphire Banquet','Hospitality','Ahmedabad','A luminous canopy created for celebrations at scale.','photo-1600607688960-e095ff83135c','Regent Tier'],
 ['wren-penthouse','Wren Penthouse','Private Residence','Pune','Sculptural pendant light anchors a beautifully restrained dining setting.','photo-1524484485831-a92ffc0de03f','Noor Linear'],
 ['atelier-arc','Atelier Arc','Commercial','Bengaluru','Layered lighting makes this design studio feel as tailored as the work within it.','photo-1618221195710-dd6b41faaea6','Luna Atelier'],
].map(([slug,title,type,location,description,image,products]) => ({slug,title,type,location,description,image:img(image),products}));
export const testimonials: Testimonial[] = [
 { quote:'They understood the volume of our foyer immediately. The final chandelier feels as though it was always meant to be there.', name:'Rhea Mehta', role:'Private residence, Mumbai' },
 { quote:'From drawings to installation, the level of detail and finish was exceptional.', name:'Studio Aline', role:'Interior design practice' },
 { quote:'The bespoke piece transformed our lobby into a true arrival experience.', name:'The Orion Hotel', role:'Hospitality project, New Delhi' },
 { quote:'A thoughtful, exacting partner for our most considered projects.', name:'Kavya & Partners', role:'Architecture studio' }
];
export const posts: BlogPost[] = [
 ['choosing-chandelier-size','How to Choose the Right Chandelier Size','A considered guide to proportion, ceiling height, and creating the right visual weight.','Guides','12 June 2026','photo-1540932239986-30128078f3c5'],
 ['double-height-lighting','Lighting a Double-Height Living Room','Bring intimacy and drama to generous spaces with layered illumination.','Inspiration','28 May 2026','photo-1600210492486-724fe5c67fb0'],
 ['modern-or-crystal','Modern or Crystal: Finding Your Signature Light','Two distinct visual languages, and how to choose between them.','Design Notes','08 May 2026','photo-1513694203232-719a280e022f'],
 ['2026-lighting','The New Language of Luxury Lighting','Quiet metals, sculptural glass and lighting made for a slower home.','Trends','18 April 2026','photo-1600607687920-4e2a09cf159d'],
].map(([slug,title,excerpt,category,date,image]) => ({slug,title,excerpt,category,date,image:img(image)}));
export const faqs: FAQ[] = [{question:'Can a chandelier be customized to my ceiling height?',answer:'Yes. We tailor drop lengths, diameters, finishes and compositions to the architecture of your space.'},{question:'Do you work with architects and designers?',answer:'We collaborate from concept to final installation, supplying specification support and made-to-measure solutions.'},{question:'Do you offer installation guidance?',answer:'Every piece includes installation guidance, and we coordinate support for projects where required.'},{question:'Can I request a finish sample?',answer:'For bespoke projects, material and finish selections are finalized with dedicated samples and drawings.'}];
