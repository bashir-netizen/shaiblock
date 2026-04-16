// ============================================================
// Real tea imagery for investor demo
// Using Unsplash with stable photo IDs + picsum fallback
// ============================================================

// Curated set of tea-related Unsplash photos (hero images)
export const TEA_HEROES: Record<string, string> = {
  // Kenya / black tea
  lot1: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=1200&q=80", // dry black tea leaves
  // Darjeeling first flush
  lot2: "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=1200&q=80", // darjeeling tea
  // Ceylon silver tips white tea
  lot3: "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=1200&q=80", // white tea buds
  // Pu-erh cake
  lot4: "https://images.unsplash.com/photo-1545665225-b23b99e4d45e?w=1200&q=80", // chinese tea set
  // Rwanda Highlands orthodox black
  lot5: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=1200&q=80", // dry black tea leaves
  // Kenya CTC
  lot6: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=1200&q=80", // tea cup from above
  // Ceylon OP1
  lot7: "https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=1200&q=80", // tea service
  // Tie Guan Yin oolong — reuse the Chinese tea set photo (thematic fit)
  lot8: "https://images.unsplash.com/photo-1545665225-b23b99e4d45e?w=1200&q=80",
  // Ended lots
  lot9: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=1200&q=80",
  lot10: "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=1200&q=80",
};

// TCR photo slots — same set, different angles
export const TCR_PHOTOS: Record<string, {
  dry: string;
  wet: string;
  liquor: string;
  packaging: string;
}> = {
  lot1: {
    dry: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80",
    wet: "https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?w=800&q=80",
    liquor: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&q=80",
    packaging: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80",
  },
  lot2: {
    dry: "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=800&q=80",
    wet: "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=800&q=80",
    liquor: "https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=800&q=80",
    packaging: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80",
  },
  lot3: {
    dry: "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=800&q=80",
    wet: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80",
    liquor: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80",
    packaging: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80",
  },
  lot4: {
    dry: "https://images.unsplash.com/photo-1545665225-b23b99e4d45e?w=800&q=80",
    wet: "https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?w=800&q=80",
    liquor: "https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=800&q=80",
    packaging: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80",
  },
  lot5: {
    dry: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80",
    wet: "https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?w=800&q=80",
    liquor: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&q=80",
    packaging: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80",
  },
  lot6: {
    dry: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&q=80",
    wet: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80",
    liquor: "https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=800&q=80",
    packaging: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80",
  },
  lot7: {
    dry: "https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=800&q=80",
    wet: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80",
    liquor: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&q=80",
    packaging: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80",
  },
  lot8: {
    dry: "https://images.unsplash.com/photo-1545665225-b23b99e4d45e?w=800&q=80",
    wet: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&q=80",
    liquor: "https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=800&q=80",
    packaging: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80",
  },
  lot9: {
    dry: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&q=80",
    wet: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80",
    liquor: "https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=800&q=80",
    packaging: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80",
  },
  lot10: {
    dry: "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=800&q=80",
    wet: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80",
    liquor: "https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=800&q=80",
    packaging: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80",
  },
};

// Landing page hero background — tea plantation vista
export const HERO_BG =
  "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=1920&q=90";

// Landing page "story" images
export const STORY_IMAGES = {
  plantation:
    "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=1200&q=80",
  harvester:
    "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=1200&q=80",
  cupping:
    "https://images.unsplash.com/photo-1556881286-fc6915169721?w=1200&q=80",
  packaging:
    "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=1200&q=80",
};

// Fallback generator (picsum with seed for consistency)
export function fallbackPhoto(seed: string, width = 800, height = 600): string {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

// Helper to get hero photo for a lot with fallback
export function getLotHeroPhoto(lotId: string): string {
  return TEA_HEROES[lotId] || fallbackPhoto(lotId);
}

// Helper to get TCR photos for a lot
export function getLotTCRPhotos(lotId: string) {
  return (
    TCR_PHOTOS[lotId] || {
      dry: fallbackPhoto(`${lotId}-dry`),
      wet: fallbackPhoto(`${lotId}-wet`),
      liquor: fallbackPhoto(`${lotId}-liquor`),
      packaging: fallbackPhoto(`${lotId}-pack`),
    }
  );
}

// Sudanese retailer names for live activity ticker + simulated bidding
export const DEMO_BUYER_NAMES = [
  "Ahmed Salih",
  "Fatima Osman",
  "Mohamed Idris",
  "Aisha Khalid",
  "Mustafa Ali",
  "Salma Bashir",
  "Omar Tahir",
  "Nafisa Suleiman",
  "Khaled Hassan",
  "Zeinab Ibrahim",
  "Yasir Babikir",
  "Amal Hamid",
];

// Sudanese cities where retailers operate
export const DEMO_BUYER_CITIES = [
  "Khartoum",
  "Omdurman",
  "Port Sudan",
  "Kassala",
  "Wad Madani",
  "El Obeid",
  "Nyala",
  "Gedaref",
  "Atbara",
  "Dongola",
  "Sennar",
  "Al-Qadarif",
];
