// types.ts
export interface Vessel {
  id: string;
  name: string;
  carrier: string;
  eta: string;
  load: string;
  speed: string;
  weather: string;
  purchasePosition: string;
  routePath: string;
  startCoords: { x: number; y: number };
  endCoords: { x: number; y: number };
}

export interface Store {
  id: number;
  name: string;
  location: string;
  category: string;
  items: number;
  minOrder: string;
  flag: string;
}

// marketplacedata.ts
export interface ShopItem {
  id: string;
  name: string;
  bulkPrice: string;
  moq: string; // Minimum Order Quantity
  image: string;
}

export interface ExtendedStore {
  id: string;
  name: string;
  logoUrl: string;
  flag: string;
  location: string;
  category: "Electronics" | "Apparel" | "Machinery" | "Eco Goods" | "Food & Ag" | "Automotive" | "Decor" | "Cosmetics" | "Logistics";
  items: number;
  minOrder: string;
  reliability: string;
  badge?: string;
  featuredItems: ShopItem[];
}