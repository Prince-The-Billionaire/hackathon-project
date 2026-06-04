// src/types/types.ts

export interface Carrier {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface BackendPort {
  id: string;
  code: string;
  name: string;
  countryCode: string;
  lat: string | number;
  lng: string | number;
}

export interface BackendVessel {
  id: string;
  name: string;
  type: "SHIP" | "PLANE" | "TRUCK" | "TRAIN"; // VesselType Enum
  currentLat: string | number;
  currentLng: string | number;
  currentHeadingDegrees: string | number;
  carrier: Carrier;
}

export interface BackendShipment {
  id: string;
  referenceCode: string;
  status: string;
  originPort: { id?: string; name: string };
  destinationPort: { id?: string; name: string };
  vessel: { id?: string; name: string };
}

// Complete response shape returned by GET /api/carrier/map
export interface CarrierMapPayload {
  ports: BackendPort[];
  vessels: BackendVessel[];
  shipments: BackendShipment[];
}

// UI-Mapped interfaces for coordinate plotting
export interface VesselUI {
  id: string;
  name: string;
  carrierName: string;
  eta: string;
  heading: number;
  startCoords: { x: number; y: number };
  endCoords: { x: number; y: number };
}

export interface PortUI {
  id: string;
  name: string;
  x: number;
  y: number;
  distToLagos: string;
  etaLagos: string;
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

export interface ShopItem {
  id: string;
  name: string;
  bulkPrice: string;
  moq: string;
  image: string;
}

export interface ExtendedStore {
  id: string;
  name: string;
  logoUrl: string;
  flag: string;
  location: string;
  category: "ELECTRONICS" | "APPAREL" | "MACHINERY" | "ECO_GOODS" | "FOOD_AND_AG" | "AUTOMOTIVE" | "DECOR" | "COSMETICS" | "LOGISTICS"; // StoreCategory
  items: number;
  minOrder: string;
  reliability: string;
  badge?: string;
  featuredItems: ShopItem[];
}