export const PRODUCT_STATUS = ['draft', 'published', 'archived'];
export const PRODUCT_VISIBILITY = ['public', 'hidden'];

export const PRODUCT_TYPES = [
  'chandelier',
  'pendant',
  'wall_lamp',
  'ceiling_light',
  'linear',
  'outdoor_wall',
  'flush_mount',
  'sconce',
  'other',
];

export const PRODUCT_STYLES = [
  'modern',
  'contemporary',
  'traditional',
  'classic',
  'industrial',
  'art_deco',
  'minimal',
  'luxury',
  'crystal',
];

export const MOUNT_TYPES = [
  'ceiling',
  'pendant',
  'flush',
  'semi_flush',
  'wall',
  'recessed',
];

export const ROOM_TYPES = [
  'living',
  'dining',
  'bedroom',
  'lobby',
  'hallway',
  'outdoor',
  'office',
  'staircase',
];

export const BULB_TYPES = [
  'led_integrated',
  'e27',
  'e14',
  'g9',
  'gu10',
  'b22',
  'other',
];

export const COLOR_TEMPERATURES = [
  'warm_2700k',
  'neutral_4000k',
  'cool_6000k',
  'tunable',
];

export const INSTALLATION_TYPES = ['hardwired', 'plug_in'];

export const PUBLIC_PRODUCT_SORTS = {
  newest: { publishedAt: -1, createdAt: -1 },
  price_asc: { fromPriceInPaise: 1 },
  price_desc: { fromPriceInPaise: -1 },
  popular: { soldCount: -1, averageRating: -1 },
  rating: { averageRating: -1, reviewCount: -1 },
};
