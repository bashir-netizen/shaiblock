import type { TeaType, HarvestSeason, ProcessingMethod } from "./types";

export const TEA_TYPES: { value: TeaType; label: string; emoji: string }[] = [
  { value: "black", label: "Black", emoji: "\u2615" },
  { value: "green", label: "Green", emoji: "\ud83c\udf75" },
  { value: "white", label: "White", emoji: "\ud83e\uddc2" },
  { value: "oolong", label: "Oolong", emoji: "\ud83c\udf3f" },
  { value: "pu_erh", label: "Pu-erh", emoji: "\ud83c\udffa" },
  { value: "herbal", label: "Herbal", emoji: "\ud83c\udf3b" },
  { value: "blend", label: "Blend", emoji: "\ud83c\udf1f" },
];

export const HARVEST_SEASONS: { value: HarvestSeason; label: string }[] = [
  { value: "first_flush", label: "First Flush" },
  { value: "second_flush", label: "Second Flush" },
  { value: "autumn", label: "Autumn" },
  { value: "rain", label: "Rain" },
];

export const PROCESSING_METHODS: {
  value: ProcessingMethod;
  label: string;
}[] = [
  { value: "orthodox", label: "Orthodox" },
  { value: "CTC", label: "CTC" },
  { value: "hand_rolled", label: "Hand Rolled" },
  { value: "steamed", label: "Steamed" },
];

export const GRADES = [
  "SFTGFOP1",
  "FTGFOP1",
  "TGFOP",
  "GFBOP",
  "FBOP",
  "BOP",
  "BOP1",
  "OP",
  "OP1",
  "OPA",
  "FOP",
  "GFOP",
  "CTC PF1",
  "CTC BP",
  "CTC PD",
  "CTC OF",
  "Fannings",
  "Dust",
  "Silver Needle",
  "White Peony",
  "Gunpowder",
  "Sencha",
  "Gyokuro",
  "Matcha",
];

export const CERTIFICATIONS = [
  "Organic",
  "Fair Trade",
  "Rainforest Alliance",
  "UTZ",
  "ISO 22000",
  "HACCP",
  "ETP (Ethical Tea Partnership)",
  "Demeter (Biodynamic)",
  "JAS Organic",
  "USDA Organic",
  "EU Organic",
];

// Sudanese cities where retail tea buyers operate
export const SUDANESE_CITIES = [
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

export const SUDAN_FLAG = "\ud83c\uddf8\ud83c\udde9";

export const ORIGIN_COUNTRIES = [
  { code: "KE", name: "Kenya", flag: "\ud83c\uddf0\ud83c\uddea" },
  { code: "IN", name: "India", flag: "\ud83c\uddee\ud83c\uddf3" },
  { code: "LK", name: "Sri Lanka", flag: "\ud83c\uddf1\ud83c\uddf0" },
  { code: "CN", name: "China", flag: "\ud83c\udde8\ud83c\uddf3" },
  { code: "JP", name: "Japan", flag: "\ud83c\uddef\ud83c\uddf5" },
  { code: "TW", name: "Taiwan", flag: "\ud83c\uddf9\ud83c\uddfc" },
  { code: "NP", name: "Nepal", flag: "\ud83c\uddf3\ud83c\uddf5" },
  { code: "VN", name: "Vietnam", flag: "\ud83c\uddfb\ud83c\uddf3" },
  { code: "ID", name: "Indonesia", flag: "\ud83c\uddee\ud83c\udde9" },
  { code: "RW", name: "Rwanda", flag: "\ud83c\uddf7\ud83c\uddfc" },
  { code: "MW", name: "Malawi", flag: "\ud83c\uddf2\ud83c\uddfc" },
  { code: "TZ", name: "Tanzania", flag: "\ud83c\uddf9\ud83c\uddff" },
];

export const CUPPING_DIMENSIONS = [
  { key: "aroma", label: "Aroma" },
  { key: "body", label: "Body" },
  { key: "color", label: "Color" },
  { key: "briskness", label: "Briskness" },
  { key: "flavor", label: "Flavor" },
  { key: "finish", label: "Finish" },
] as const;

export const AUCTION_DURATIONS = [
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "60 min" },
];

export const BUYER_PREMIUM_PCT = 7.5;
export const BUY_NOW_PREMIUM_PCT = 10;
export const BID_INCREMENTS = [0.1, 0.5, 1.0];
