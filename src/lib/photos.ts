// ============================================================
// Real tea imagery for investor demo
// Using Unsplash with stable photo IDs + picsum fallback
// ============================================================

// ------------------------------------------------------------
// Photo palette. Each ID has been verified to load and is used
// across TEA_HEROES and TCR_PHOTOS. Adding a new photo: define
// the base URL once here, reference it below.
// ------------------------------------------------------------
const DRY_LEAF_DARK = "https://images.unsplash.com/photo-1576092768241-dec231879fc3"; // orthodox dry black leaves
const LIGHT_BUDS = "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2";   // white-tea silver tips
const DARJEELING_CUP = "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5"; // darjeeling tasting cup
const CHINESE_TEA_SET = "https://images.unsplash.com/photo-1545665225-b23b99e4d45e"; // chinese teapot + cups
const STYLED_CUP = "https://images.unsplash.com/photo-1556881286-fc6915169721";       // single tea cup from above
const TEA_SERVICE = "https://images.unsplash.com/photo-1558160074-4d7d8bdf4256";      // tea service on tray
const WET_INFUSION = "https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9";  // brewed-out wet leaves
const PACKAGING_STILL = "https://images.unsplash.com/photo-1544787219-7f47ccb76574";  // packaging / tins
const PLANTATION = "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9";    // tea plantation vista

const hero = (base: string) => `${base}?w=1200&q=80`;
const tcr = (base: string) => `${base}?w=800&q=80`;

// Lot hero / thumbnail assignments. Each lot gets a visually distinct
// photo where possible; a few duplicates across lots of the same
// origin/style are intentional.
export const TEA_HEROES: Record<string, string> = {
  lot1: hero(DRY_LEAF_DARK),    // Kenya Kericho Gold — black orthodox
  lot2: hero(DARJEELING_CUP),   // Darjeeling 1st flush
  lot3: hero(LIGHT_BUDS),       // Ceylon silver tips — white
  lot4: hero(CHINESE_TEA_SET),  // Pu-erh — fits Chinese aesthetic
  lot5: hero(WET_INFUSION),     // Rwanda orthodox — wet leaf angle
  lot6: hero(STYLED_CUP),       // Kenya CTC — tasting cup
  lot7: hero(TEA_SERVICE),      // Ceylon OP1 — full service
  lot8: hero(CHINESE_TEA_SET),  // Tie Guan Yin — Chinese oolong
  lot9: hero(PACKAGING_STILL),  // Kenya BOP1 (ended) — packaging
  lot10: hero(DARJEELING_CUP),  // Darjeeling (ended)
};

// TCR photo slots — dry leaf / wet leaf / liquor / packaging.
export const TCR_PHOTOS: Record<string, {
  dry: string;
  wet: string;
  liquor: string;
  packaging: string;
}> = {
  lot1: {
    dry: tcr(DRY_LEAF_DARK),
    wet: tcr(WET_INFUSION),
    liquor: tcr(STYLED_CUP),
    packaging: tcr(PLANTATION),
  },
  lot2: {
    dry: tcr(DARJEELING_CUP),
    wet: tcr(LIGHT_BUDS),
    liquor: tcr(TEA_SERVICE),
    packaging: tcr(PLANTATION),
  },
  lot3: {
    dry: tcr(LIGHT_BUDS),
    wet: tcr(DRY_LEAF_DARK),
    liquor: tcr(PACKAGING_STILL),
    packaging: tcr(PLANTATION),
  },
  lot4: {
    dry: tcr(CHINESE_TEA_SET),
    wet: tcr(WET_INFUSION),
    liquor: tcr(TEA_SERVICE),
    packaging: tcr(PACKAGING_STILL),
  },
  lot5: {
    dry: tcr(DRY_LEAF_DARK),
    wet: tcr(WET_INFUSION),
    liquor: tcr(STYLED_CUP),
    packaging: tcr(PLANTATION),
  },
  lot6: {
    dry: tcr(STYLED_CUP),
    wet: tcr(DRY_LEAF_DARK),
    liquor: tcr(TEA_SERVICE),
    packaging: tcr(PLANTATION),
  },
  lot7: {
    dry: tcr(TEA_SERVICE),
    wet: tcr(DRY_LEAF_DARK),
    liquor: tcr(STYLED_CUP),
    packaging: tcr(PLANTATION),
  },
  lot8: {
    dry: tcr(CHINESE_TEA_SET),
    wet: tcr(STYLED_CUP),
    liquor: tcr(TEA_SERVICE),
    packaging: tcr(PLANTATION),
  },
  lot9: {
    dry: tcr(STYLED_CUP),
    wet: tcr(DRY_LEAF_DARK),
    liquor: tcr(TEA_SERVICE),
    packaging: tcr(PLANTATION),
  },
  lot10: {
    dry: tcr(DARJEELING_CUP),
    wet: tcr(DRY_LEAF_DARK),
    liquor: tcr(TEA_SERVICE),
    packaging: tcr(PLANTATION),
  },
};

// Landing page hero background — tea plantation vista
export const HERO_BG = `${PLANTATION}?w=1920&q=90`;

// Landing page "story" images
export const STORY_IMAGES = {
  plantation: `${PLANTATION}?w=1200&q=80`,
  harvester: `${DRY_LEAF_DARK}?w=1200&q=80`,
  cupping: `${STYLED_CUP}?w=1200&q=80`,
  packaging: `${PACKAGING_STILL}?w=1200&q=80`,
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
