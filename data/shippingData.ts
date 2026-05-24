// shippingData.ts

export interface CargoVessel {
  id: string;
  name: string;
  company: string;
  capacityTEU: number; // Twenty-Foot Equivalent Unit (Standard Container Measure)
  hasInsurance: boolean;
  ageYears: number;
  avgSpeedKnots: number;
  isActive: boolean;
  imageUrl: string;
}

export interface GlobalMerchant {
  id: string;
  name: string;
  country: string;
  flagCode: string;
  targetImports: string[];
  contactPerson: string;
  verifiedStatus: boolean;
}

export const SEVEN_CARGO_VESSELS: CargoVessel[] = [
  {
    id: "v-01",
    name: "Atlantic Horizon",
    company: "Maersk Line Alliance",
    capacityTEU: 18500,
    hasInsurance: true,
    ageYears: 4,
    avgSpeedKnots: 21.5,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1494412519320-aa613dfb7738?w=500&auto=format&fit=crop"
  },
  {
    id: "v-02",
    name: "Pacific Empress",
    company: "COSCO Shipping Group",
    capacityTEU: 21000,
    hasInsurance: true,
    ageYears: 2,
    avgSpeedKnots: 22.0,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop"
  },
  {
    id: "v-03",
    name: "Bosporus Titan",
    company: "CMA CGM Logistics",
    capacityTEU: 15400,
    hasInsurance: true,
    ageYears: 7,
    avgSpeedKnots: 19.8,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=500&auto=format&fit=crop"
  },
  {
    id: "v-04",
    name: "Northern Venture",
    company: "Hapag-Lloyd AG",
    capacityTEU: 13200,
    hasInsurance: true,
    ageYears: 11,
    avgSpeedKnots: 20.2,
    isActive: false, // Scheduled Maintenance
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop"
  },
  {
    id: "v-05",
    name: "Crescent Mariner",
    company: "MSC Mediterranean Shipping",
    capacityTEU: 23500,
    hasInsurance: true,
    ageYears: 1,
    avgSpeedKnots: 23.1,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=500&auto=format&fit=crop"
  },
  {
    id: "v-06",
    name: "Orient Vanguard",
    company: "ONE (Ocean Network Express)",
    capacityTEU: 14000,
    hasInsurance: false, // Under Policy Renewal Review
    ageYears: 9,
    avgSpeedKnots: 19.5,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1516937941344-00b4e0337589?w=500&auto=format&fit=crop"
  },
  {
    id: "v-07",
    name: "Cape Majestic",
    company: "Evergreen Marine Corp",
    capacityTEU: 20000,
    hasInsurance: true,
    ageYears: 5,
    avgSpeedKnots: 21.0,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1494412519320-aa613dfb7738?w=500&auto=format&fit=crop"
  }
];

export const MOCK_GLOBAL_MERCHANTS: GlobalMerchant[] = [
  {
    id: "m-01",
    name: "Afriluxe Wholesale Ltd",
    country: "Nigeria",
    flagCode: "NG",
    targetImports: ["Consumer Electronics", "Lithium Cells", "Smart Panels"],
    contactPerson: "Alhaji Musa Dikko",
    verifiedStatus: true
  },
  {
    id: "m-02",
    name: "Anatolia Fabric Hub",
    country: "Turkey",
    flagCode: "TR",
    targetImports: ["Raw Cotton", "Synthetic Yarn", "Textiles"],
    contactPerson: "Emre Yilmaz",
    verifiedStatus: true
  },
  {
    id: "m-03",
    name: "Shenzhen Dynamic Components",
    country: "China",
    flagCode: "CN",
    targetImports: ["Copper Scraps", "Industrial Plastics"],
    contactPerson: "Lin Wei",
    verifiedStatus: true
  },
  {
    id: "m-04",
    name: "Eindhoven Tech Assemblies",
    country: "Netherlands",
    flagCode: "NL",
    targetImports: ["Semiconductor Casings", "Refined Silicon"],
    contactPerson: "Dirk de Jong",
    verifiedStatus: false
  },
  {
    id: "m-05",
    name: "Andes Premium Importers",
    country: "Colombia",
    flagCode: "CO",
    targetImports: ["Processing Machinery", "Eco Packaging Matts"],
    contactPerson: "Sofia Restrepo",
    verifiedStatus: true
  }
];