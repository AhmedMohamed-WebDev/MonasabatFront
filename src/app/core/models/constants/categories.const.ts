export interface CategoryConfig {
  value: string;
  label: string;
  subcategories: { value: string; label: string; contactOnly?: boolean }[];
  contactOnly?: boolean; // If true, all subcategories are contact-only
}

export const EVENT_CATEGORIES: CategoryConfig[] = [
  {
    value: 'halls',
    label: 'Halls',
    contactOnly: true,
    subcategories: [
      { value: 'wedding-halls', label: 'Wedding Halls', contactOnly: true },
      {
        value: 'engagement-halls',
        label: 'Engagement Halls',
        contactOnly: true,
      },
      {
        value: 'conference-centers',
        label: 'Conference Centers',
        contactOnly: true,
      },
      {
        value: 'multi-purpose-halls',
        label: 'Multi-Purpose Halls',
        contactOnly: true,
      },
      { value: 'hotel-ballrooms', label: 'Hotel Ballrooms', contactOnly: true },
      {
        value: 'guest-houses',
        label: 'Guest Houses / Madafat',
        contactOnly: true,
      },
      {
        value: 'open-grounds',
        label: 'Open Grounds & Yards',
        contactOnly: true,
      },
    ],
  },
  {
    value: 'farm',
    label: 'Farm & Outdoor',
    contactOnly: true,
    subcategories: [
      { value: 'outdoor-farms', label: 'Outdoor Farms', contactOnly: true },
      { value: 'garden-venues', label: 'Garden Venues', contactOnly: true },
      {
        value: 'mountain-view-farms',
        label: 'Mountain View Farms',
        contactOnly: true,
      },
      { value: 'villa-farms', label: 'Villa Farms', contactOnly: true },
      { value: 'pool-farms', label: 'Pool Farms', contactOnly: true },
      { value: 'daily-rental', label: 'Daily Rental', contactOnly: true },
    ],
  },
  {
    value: 'wedding',
    label: 'Wedding',
    subcategories: [
      { value: 'wedding-halls', label: 'Wedding Halls', contactOnly: true },
      { value: 'catering', label: 'Catering Services' },
      { value: 'decoration', label: 'Decoration' },
      { value: 'photography', label: 'Photography & Video' },
      { value: 'entertainment', label: 'Entertainment' },
    ],
    contactOnly: true,
  },
  {
    value: 'zaffat',
    label: 'Zaffat',
    subcategories: [
      { value: 'jordanian-zaffa', label: 'Jordanian Zaffa' },
      { value: 'palestinian-zaffa', label: 'Palestinian Zaffa' },
      { value: 'mixed-zaffa', label: 'Mixed Zaffa' },
      { value: 'lebanese-dabke', label: 'Lebanese Dabke Group' },
      { value: 'syrian-aradah', label: 'Syrian Aradah (Sword & Shield)' },
      { value: 'egyptian-tanoura', label: 'Egyptian Tanoura Show' },
    ],
  },
  {
    value: 'event-planner',
    label: 'Event Planner',
    subcategories: [
      { value: 'wedding-planning', label: 'Wedding Planning' },
      { value: 'corporate-events', label: 'Corporate Events' },
      { value: 'birthday-parties', label: 'Birthday Parties' },
      { value: 'graduation-events', label: 'Graduation Events' },
      { value: 'full-service-planning', label: 'Full Service Planning' },
    ],
  },
  {
    value: 'chairs',
    label: 'Chairs',
    subcategories: [
      { value: 'chrome-chairs', label: 'Chrome Chairs' },
      { value: 'golden-royal-chairs', label: 'Golden & Royal Chairs' },
      { value: 'napoli-chairs', label: 'Napoli Chairs' },
      { value: 'plastic-chairs-samba', label: 'Plastic Chairs Samba' },
      { value: 'silver-chrome-chairs', label: 'Silver Chrome Chairs' },
      { value: 'crystal-acrylic-chairs', label: 'Crystal & Acrylic Chairs' },
      { value: 'louis-chairs', label: 'Louis Chairs' },
      { value: 'chiavari-chairs', label: 'Chiavari Chairs' },
      { value: 'kousha', label: 'Kousha' },
    ],
  },
  {
    value: 'tables',
    label: 'Tables',
    subcategories: [
      { value: 'square-dining-tables', label: 'Square Dining Tables' },
      {
        value: 'rectangular-buffet-tables',
        label: 'Rectangular Buffet Tables',
      },
      { value: 'round-tables', label: 'Round Tables' },
      { value: 'tarabezat', label: 'Tarabezat' },
    ],
  },
  {
    value: 'cars',
    label: 'Cars',
    subcategories: [
      { value: 'luxury-wedding-cars', label: 'Luxury Wedding Cars' },
      { value: 'classic-cars', label: 'Classic Cars' },
      { value: 'modern-luxury-cars', label: 'Modern Luxury Cars' },
      { value: 'suv-4x4', label: 'SUV & 4x4' },
      { value: 'electric-cars', label: 'Electric Cars' },
      { value: 'limousines', label: 'Limousines' },
      { value: 'white-plate-cars', label: 'White Plate Cars' },
    ],
  },

  {
    value: 'photographers',
    label: 'Photographers',
    subcategories: [
      { value: 'video-production', label: 'Video Production' },
      { value: 'female-videography', label: 'Female Videography' },
      { value: 'drone-photography', label: 'Drone Photography' },
      { value: 'studio-photography', label: 'Studio Photography' },
      { value: 'female-photography', label: 'Female Photography' },
      { value: 'outdoor-photography', label: 'Outdoor Photography' },
      { value: 'outdoor-sessions', label: 'Outdoor Sessions by Hour' },
    ],
  },
  {
    value: 'hospitality',
    label: 'Hospitality',
    subcategories: [
      { value: 'coffee-tea-service', label: 'Coffee & Tea Service' },
      { value: 'arabic-coffee-service', label: 'Arabic Coffee Pot Service' },
      { value: 'arabic-sweets', label: 'Arabic Sweets' },
      { value: 'knafeh', label: 'Knafeh' },
      { value: 'hospitality-hostesses', label: 'Hospitality Hostesses' },
      { value: 'full-catering', label: 'Full Catering Service' },
      { value: 'wedding-catering', label: 'Wedding Catering' },
      { value: 'corporate-catering', label: 'Corporate Catering' },
      { value: 'water-cups', label: 'Water Cups' },
    ],
  },
  {
    value: 'matbaqeat',
    label: 'Matbaqeat',
    subcategories: [
      { value: 'wedding-favors', label: 'Wedding Favors' },
      { value: 'baby-shower-favors', label: 'Baby Shower Favors' },
      { value: 'graduation-favors', label: 'Graduation Favors' },
      { value: 'birthday-favors', label: 'Birthday Favors' },
      { value: 'religious-favors', label: 'Religious Occasion Favors' },
      { value: 'luxury-favors', label: 'Luxury Favors (VIP)' },
      { value: 'customized-favors', label: 'Customized Favors' },
    ],
  },
  {
    value: 'flowers',
    label: 'Flowers',
    subcategories: [
      { value: 'wedding-bouquets', label: 'Wedding Bouquets' },
      { value: 'stage-decoration', label: 'Stage Decoration' },
      { value: 'entrance-design', label: 'Entrance Design' },
      { value: 'table-arrangements', label: 'Table Arrangements' },
      { value: 'car-decoration', label: 'Car Decoration' },
      { value: 'flower-bouquets', label: 'Flower Bouquets for Occasions' },
    ],
  },
  {
    value: 'sound-dj',
    label: 'Sound and DJ',
    subcategories: [
      { value: 'wedding-dj', label: 'Wedding DJ' },
      { value: 'sound-systems', label: 'Sound Systems' },
      { value: 'lighting-systems', label: 'Lighting Systems' },
      { value: 'live-sound-mixing', label: 'Live Sound Mixing' },
      { value: 'conference-sound', label: 'Conference Sound' },
      { value: 'stage-equipment', label: 'Stage Equipment' },
    ],
  },

  {
    value: 'mansaf-cooking',
    label: 'Mansaf & Cooking',
    subcategories: [
      { value: 'mansaf', label: 'Mansaf' },
      { value: 'ouzi', label: 'Ouzi' },
      { value: 'stuffed-lamb', label: 'Stuffed Lamb' },
      { value: 'mandi', label: 'Mandi' },
      { value: 'lamb-buffet', label: 'Lamb Buffet' },
      { value: 'pastry-buffet', label: 'Pastry Buffet' },
      { value: 'cold-appetizers', label: 'Cold Appetizers' },
    ],
  },
  {
    value: 'tents-canopies',
    label: 'Tents & Canopies',
    subcategories: [
      { value: 'wedding-tents', label: 'Wedding Tents' },
      { value: 'arabic-majlis-tents', label: 'Arabic Majlis Tents' },
      { value: 'event-canopies', label: 'Event Canopies' },
      { value: 'vip-tents', label: 'VIP Tents' },
      { value: 'ramadan-tents', label: 'Ramadan Tents' },
      { value: 'indian-style-tents', label: 'Indian Style Tents' },
    ],
  },
  {
    value: 'valet-parking',
    label: 'Valet Parking',
    subcategories: [
      { value: 'wedding-valet', label: 'Wedding Valet Service' },
      { value: 'vip-valet', label: 'VIP Valet Service' },
      { value: 'corporate-parking', label: 'Corporate Event Parking' },
    ],
  },
  {
    value: 'balloons',
    label: 'Balloons',
    subcategories: [
      { value: 'wedding-balloon-decor', label: 'Wedding Balloon Décor' },
      { value: 'balloon-arches', label: 'Balloon Arches' },
      { value: 'balloon-bouquets', label: 'Balloon Bouquets' },
      { value: 'balloon-stage-decor', label: 'Stage Decoration' },
      { value: 'balloon-entrance', label: 'Entrance Design' },
      { value: 'custom-balloon-art', label: 'Custom Balloon Art' },
    ],
  },
  {
    value: 'salon-hair',
    label: 'Salon & Hair',
    subcategories: [
      { value: 'bridal-makeup', label: 'Bridal Makeup' },
      { value: 'hair-styling', label: 'Hair Styling' },
      { value: 'full-bridal-package', label: 'Full Bridal Package' },
      { value: 'special-event-makeup', label: 'Special Event Makeup' },
      { value: 'group-services', label: 'Group Services' },
      { value: 'home-service', label: 'Home Service' },
      { value: 'special-offers', label: 'Special Offers' },
    ],
  },

  {
    value: 'entertainment-shows',
    label: 'Entertainment Shows',
    subcategories: [
      { value: 'henna-show', label: 'Full Henna Show' },
      { value: 'bukharan-show', label: 'Bukharan Show / Smoke Show' },
      { value: 'drummers-show', label: 'Drummers Show' },
      { value: 'fireworks-show', label: 'Fireworks Show' },
      { value: 'bubble-show', label: 'Bubble Show' },
      { value: 'live-musician', label: 'Live Musician' },
    ],
  },
  // Legacy/Existing event types kept to avoid breaking existing data
  // {
  //   value: 'wedding',
  //   label: 'Wedding',
  //   subcategories: [
  //     { value: 'wedding-halls', label: 'Wedding Halls', contactOnly: true },
  //     { value: 'catering', label: 'Catering Services' },
  //     { value: 'decoration', label: 'Decoration' },
  //     { value: 'photography', label: 'Photography & Video' },
  //     { value: 'entertainment', label: 'Entertainment' },
  //     { value: 'equipment', label: 'Equipment Rental' },
  //     { value: 'chairs', label: 'Chairs & Seating' },
  //     { value: 'flowers', label: 'Flowers & Bouquets' },
  //     { value: 'tables', label: 'Tables & Settings' },
  //   ],
  // },
  {
    value: 'engagement',
    label: 'Engagement',
    subcategories: [
      { value: 'venues', label: 'Venues & Halls', contactOnly: true },
      { value: 'catering', label: 'Catering Services' },
      { value: 'decoration', label: 'Decoration' },
      { value: 'photography', label: 'Photography' },
    ],
  },
  {
    value: 'conference',
    label: 'Conference',
    subcategories: [
      {
        value: 'conference-halls',
        label: 'Conference Halls',
        contactOnly: true,
      },
      { value: 'audio-equipment', label: 'Audio Equipment' },
      { value: 'catering', label: 'Catering Services' },
      { value: 'photography', label: 'Photography & Documentation' },
    ],
  },
  {
    value: 'birthday',
    label: 'Birthday',
    subcategories: [
      { value: 'venues', label: 'Party Venues', contactOnly: true },
      { value: 'catering', label: 'Food & Beverages' },
      { value: 'decoration', label: 'Party Decoration' },
      { value: 'entertainment', label: 'Entertainment' },
    ],
  },
  {
    value: 'corporate',
    label: 'Corporate Event',
    subcategories: [
      { value: 'venues', label: 'Corporate Venues', contactOnly: true },
      { value: 'equipment', label: 'Audio/Visual Equipment' },
      { value: 'catering', label: 'Corporate Catering' },
      { value: 'decoration', label: 'Stage & Decoration' },
    ],
  },
  {
    value: 'graduation',
    label: 'Graduation',
    subcategories: [
      { value: 'venues', label: 'Graduation Venues', contactOnly: true },
      { value: 'photography', label: 'Photography & Video' },
      { value: 'catering', label: 'Catering Services' },
      { value: 'decoration', label: 'Decoration' },
    ],
  },
  {
    value: 'funeral',
    label: 'Funeral',
    subcategories: [
      { value: 'funeral-halls', label: 'Funeral Halls', contactOnly: true },
      { value: 'catering', label: 'Memorial Catering' },
      { value: 'flowers', label: 'Funeral Flowers & Wreaths' },
      { value: 'chairs', label: 'Seating Arrangements' },
      { value: 'tents', label: 'Memorial Tents', contactOnly: true },
      { value: 'transport', label: 'Transportation Services' },
    ],
  },
  {
    value: 'wedding-arches',
    label: 'Wedding Arches & Stands',
    subcategories: [
      {
        value: 'wedding-kosha',
        label: 'Wedding Kosha',
      },
      {
        value: 'flower-stands',
        label: 'Flower Stands',
      },
      {
        value: 'entrance-arches',
        label: 'Entrance Arches',
      },
    ],
  },
];

// Helper function to check if a service should be contact-only
export function isContactOnlyService(
  category: string,
  subcategory?: string
): boolean {
  const categoryConfig = EVENT_CATEGORIES.find((c) => c.value === category);

  if (!categoryConfig) return false;

  // If the entire category is contact-only
  if (categoryConfig.contactOnly) return true;

  // If subcategory is specified, check if it's contact-only
  if (subcategory) {
    const subcategoryConfig = categoryConfig.subcategories.find(
      (s) => s.value === subcategory
    );
    return subcategoryConfig?.contactOnly || false;
  }

  return false;
}

// List of contact-only subcategories for easy reference
export const CONTACT_ONLY_SUBCATEGORIES = [
  'wedding-halls',
  // 'engagement-halls',
  'conference-halls',
  'funeral-halls',
  'tents',
  'outdoor-farms',
  'garden-venues',
  'mountain-view-farms',
  'villa-farms',
  'pool-farms',
  'daily-rental',
  'hotel-ballrooms',
  'guest-houses',
  'open-grounds',
];

// List of contact-only categories (entire categories)
export const CONTACT_ONLY_CATEGORIES = [
  'wedding',
  // 'engagement',
  'farm',
  'halls',
];

// Some newly introduced top-level categories correspond to legacy subcategories in existing data.
// Use these mappings to search by subcategory for backward compatibility until data migration.
export const CATEGORY_TO_SUBCATEGORY_FALLBACK: { [key: string]: string } = {
  chairs: 'chairs',
  tables: 'tables',
  cars: 'transport',
  halls: 'wedding-halls',
  photographers: 'photography',
  hospitality: 'catering',
  matbaqeat: 'matbaqeat',
  flowers: 'flowers',
};

export const SUBCATEGORY_TO_CATEGORY_ALIAS: { [key: string]: string } = {
  chairs: 'chairs',
  tables: 'tables',
  transport: 'cars',
  'wedding-halls': 'halls',
  photography: 'photographers',
  catering: 'hospitality',
  matbaqeat: 'matbaqeat',
  flowers: 'flowers',
};

// Client-requested main categories list (for UI prominence / top categories computation)
export const CLIENT_MAIN_CATEGORIES: string[] = [
  'wedding',
  'engagement',
  'chairs',
  'tables',
  'cars',
  'farm',
  'halls',
  'photographers',
  'hospitality',
  'matbaqeat',
  'flowers',
  'sound-dj',
  'event-planner',
  'salon-hair',
  'valet-parking',
  'balloons',
  'mansaf-cooking',
  'tents-canopies',
  'zaffat',
  'entertainment-shows',
  'wedding-arches',
];

// Icon mapping for display on service cards (Font Awesome classes)
const SUBCATEGORY_ICON_MAP: { [key: string]: string } = {
  // direct subcategories
  chairs: 'fas fa-chair',
  tables: 'fas fa-table',
  transport: 'fas fa-car',
  photography: 'fas fa-camera',
  catering: 'fas fa-utensils',
  flowers: 'fas fa-spa',
  'wedding-halls': 'fas fa-building',
  venues: 'fas fa-building',
  'conference-halls': 'fas fa-building',
  'funeral-halls': 'fas fa-building',
  tents: 'fas fa-campground',
  equipment: 'fas fa-tools',
  'audio-equipment': 'fas fa-volume-up',
  'av-equipment': 'fas fa-volume-up',
  decoration: 'fas fa-brush',
  'stage-decoration': 'fas fa-brush',
  entertainment: 'fas fa-music',
  seating: 'fas fa-chair',
  'party-venues': 'fas fa-building',
  'food-beverages': 'fas fa-utensils',
  'corporate-venues': 'fas fa-building',
  'corporate-catering': 'fas fa-utensils',
  'memorial-catering': 'fas fa-utensils',
  'funeral-flowers': 'fas fa-spa',
  'farm-venues': 'fas fa-seedling',
  'outdoor-events': 'fas fa-seedling',
  'farm-catering': 'fas fa-utensils',
  'farm-decoration': 'fas fa-brush',
  'farm-photography': 'fas fa-camera',
  matbaqeat: 'fas fa-concierge-bell',
  'wedding-arches': 'fas fa-archway',
};

const CATEGORY_ICON_MAP: { [key: string]: string } = {
  // Event Types
  wedding: 'fas fa-ring',
  engagement: 'fas fa-heart',
  conference: 'fas fa-microphone',
  birthday: 'fas fa-birthday-cake',
  corporate: 'fas fa-briefcase',
  graduation: 'fas fa-graduation-cap',
  funeral: 'fas fa-dove',
  // Service Categories
  chairs: 'fas fa-chair',
  tables: 'fas fa-table',
  cars: 'fas fa-car',
  farm: 'fas fa-seedling',
  halls: 'fas fa-building',
  photographers: 'fas fa-camera',
  hospitality: 'fas fa-utensils',
  matbaqeat: 'fas fa-concierge-bell',
  flowers: 'fas fa-spa',
  'sound-dj': 'fas fa-music',
  'event-planner': 'fas fa-tasks',
  'salon-hair': 'fas fa-cut',
  'valet-parking': 'fas fa-car-side',
  balloons: 'fas fa-birthday-cake',
  'mansaf-cooking': 'fas fa-utensils',
  'tents-canopies': 'fas fa-campground',
  zaffat: 'fas fa-drum',
  'entertainment-shows': 'fas fa-theater-masks',
  'wedding-arches': 'fas fa-archway',
};

export function getServiceIconClass(
  category?: string,
  subcategory?: string
): string {
  if (subcategory && SUBCATEGORY_ICON_MAP[subcategory])
    return SUBCATEGORY_ICON_MAP[subcategory];
  if (category && CATEGORY_ICON_MAP[category])
    return CATEGORY_ICON_MAP[category];
  // try aliasing subcategory to category
  if (subcategory && SUBCATEGORY_TO_CATEGORY_ALIAS[subcategory]) {
    const alias = SUBCATEGORY_TO_CATEGORY_ALIAS[subcategory];
    if (CATEGORY_ICON_MAP[alias]) return CATEGORY_ICON_MAP[alias];
  }
  // default
  return 'fas fa-tag';
}
