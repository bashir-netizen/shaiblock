// ============================================================
// ShaiBlock — TypeScript Types
// Sudan's live tea auction marketplace
// ============================================================

export type UserRole = "buyer" | "seller" | "admin";
export type KycStatus = "pending" | "verified" | "rejected";

export interface Profile {
  id: string;
  role: UserRole;
  company_name?: string;
  display_name: string;
  email: string;
  phone?: string;
  country?: string;
  city?: string;
  address_line?: string;
  tax_id?: string;
  kyc_status: KycStatus;
  reputation_score: number;
  total_transactions: number;
  stripe_account_id?: string;
  stripe_customer_id?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export type TeaType =
  | "black"
  | "green"
  | "white"
  | "oolong"
  | "pu_erh"
  | "herbal"
  | "blend";

export type HarvestSeason =
  | "first_flush"
  | "second_flush"
  | "autumn"
  | "rain";

export type ProcessingMethod =
  | "orthodox"
  | "CTC"
  | "hand_rolled"
  | "steamed";

export type LotStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "active"
  | "ended"
  | "sold"
  | "unsold"
  | "counter_offer"
  | "buy_now_sold"
  | "cancelled";

export interface CuppingScores {
  aroma: number;
  body: number;
  color: number;
  briskness: number;
  flavor: number;
  finish: number;
  overall: number;
}

export interface Lot {
  id: string;
  seller_id: string;
  lot_number: string;

  // TCR Identity
  title: string;
  description?: string;
  origin_country: string;
  origin_region?: string;
  estate_name?: string;
  tea_type: TeaType;
  grade: string;
  harvest_date?: string;
  harvest_season?: HarvestSeason;
  processing_method?: ProcessingMethod;
  elevation_meters?: number;
  certifications: string[];

  // Cupping
  cupping: CuppingScores;
  cupping_notes?: string;
  cupped_by?: string;
  cupping_date?: string;

  // Photos
  photo_dry_leaf?: string;
  photo_wet_leaf?: string;
  photo_liquor?: string;
  photo_packaging?: string;
  photos_additional: string[];

  // Sizing
  total_kg: number;
  min_purchase_kg: number;

  // Pricing
  reserve_price_per_kg: number;
  starting_price_per_kg: number;
  buy_now_price_per_kg?: number;
  bid_increment: number;
  currency: string;

  // Auction timing
  auction_duration_minutes: number;
  auction_start: string;
  auction_end: string;
  auto_extend_minutes: number;

  // Status
  status: LotStatus;

  // Counter-offer
  counter_offer_price_per_kg?: number;
  counter_offer_expires_at?: string;
  counter_offer_buyer_id?: string;

  // Samples
  sample_available: boolean;
  sample_price?: number;

  // Shipping
  ships_from_country?: string;
  ships_from_city?: string;
  estimated_ship_days?: number;

  // Metadata
  view_count: number;
  bid_count: number;
  watch_count: number;

  created_at: string;
  updated_at: string;

  // Joined data (for display)
  seller?: Profile;
  current_high_bid?: number;
  user_is_winning?: boolean;

  // Trading terminal — sold lot fields
  final_price_per_kg?: number;
  sold_at?: string;
  winning_buyer_id?: string;
}

export type BidStatus = "active" | "outbid" | "won" | "lost" | "cancelled";
export type BidSource = "manual" | "proxy" | "counter_accept";

export interface Bid {
  id: string;
  lot_id: string;
  buyer_id: string;
  amount_per_kg: number;
  kg_requested: number;
  max_auto_bid?: number;
  is_winning: boolean;
  status: BidStatus;
  bid_source: BidSource;
  placed_at: string;
  buyer?: Profile;
}

export type OrderType = "auction_win" | "buy_now" | "counter_offer_accepted";
export type PaymentStatus =
  | "pending"
  | "escrow"
  | "released"
  | "refunded"
  | "disputed";
export type FulfillmentStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "in_transit"
  | "delivered"
  | "confirmed"
  | "disputed";

export interface Order {
  id: string;
  order_number: string;
  lot_id: string;
  bid_id?: string;
  buyer_id: string;
  seller_id: string;
  order_type: OrderType;
  price_per_kg: number;
  total_kg: number;
  subtotal: number;
  buyer_premium_pct: number;
  buyer_premium_amount: number;
  shipping_cost: number;
  total_amount: number;
  seller_payout: number;
  payment_status: PaymentStatus;
  paid_at?: string;
  fulfillment_status: FulfillmentStatus;
  tracking_number?: string;
  tracking_carrier?: string;
  tracking_url?: string;
  shipped_at?: string;
  delivered_at?: string;
  buyer_confirmed_at?: string;
  quality_matches_report?: boolean;
  quality_notes?: string;
  dispute_reason?: string;
  dispute_status?: string;
  created_at: string;
  updated_at: string;
  lot?: Lot;
  buyer?: Profile;
  seller?: Profile;
}

export type CounterOfferStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "rejected"
  | "expired";

export interface CounterOffer {
  id: string;
  lot_id: string;
  seller_id: string;
  buyer_id: string;
  original_bid_id: string;
  highest_bid_amount: number;
  seller_counter_price: number;
  status: CounterOfferStatus;
  buyer_counter_price?: number;
  expires_at: string;
  responded_at?: string;
  created_at: string;
  lot?: Lot;
  seller?: Profile;
  buyer?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  lot_id?: string;
  order_id?: string;
  counter_offer_id?: string;
  action_url?: string;
  read: boolean;
  push_sent: boolean;
  created_at: string;
}

export interface SellerReview {
  id: string;
  order_id: string;
  buyer_id: string;
  seller_id: string;
  tcr_accuracy: number;
  packaging_quality: number;
  shipping_speed: number;
  overall: number;
  comment?: string;
  created_at: string;
  buyer?: Profile;
}

export interface TickerItem {
  symbol: string;
  price: number;
  change: number;
  direction: "up" | "down";
}
