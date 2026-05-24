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
  flag: string; // Now maps to clean ISO-2 Codes (e.g., "CN", "TR")
  location: string;
  category: "Electronics" | "Apparel" | "Machinery" | "Eco Goods" | "Food & Ag" | "Automotive" | "Decor" | "Cosmetics" | "Logistics";
  items: number;
  minOrder: string;
  reliability: string;
  badge?: string;
  featuredItems: ShopItem[];
}

export const THIRTY_MOCK_STORES: ExtendedStore[] = [
  {
    id: "st-01",
    name: "Apex Electronics Wholesale",
    logoUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop",
    flag: "CN",
    location: "Shenzhen, China",
    category: "Electronics",
    items: 1240,
    minOrder: "₦7,500,000",
    reliability: "99.4%",
    badge: "Top Verified",
    featuredItems: [
      { id: "i-01a", name: "OLED Smart Panels", bulkPrice: "₦45,000", moq: "100 units", image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=300" },
      { id: "i-01b", name: "Lithium-Ion Cells 18650", bulkPrice: "₦1,200", moq: "2000 units", image: "https://images.unsplash.com/photo-1620288627223-53302f4e8c74?w=300" }
    ]
  },
  {
    id: "st-02",
    name: "Vanguard Textiles & Apparel",
    logoUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150&auto=format&fit=crop",
    flag: "TR",
    location: "Istanbul, Turkey",
    category: "Apparel",
    items: 850,
    minOrder: "₦1,800,000",
    reliability: "98.7%",
    featuredItems: [
      { id: "i-02a", name: "Organic Cotton Blends", bulkPrice: "₦2,500/m", moq: "500 meters", image: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=300" }
    ]
  },
  {
    id: "st-03",
    name: "Heidelberg Precision Tools",
    logoUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&auto=format&fit=crop",
    flag: "DE",
    location: "Stuttgart, Germany",
    category: "Machinery",
    items: 410,
    minOrder: "₦3,350,000",
    reliability: "99.9%",
    featuredItems: [
      { id: "i-03a", name: "CNC Milling Heads", bulkPrice: "₦340,000", moq: "5 units", image: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=300" }
    ]
  },
  {
    id: "st-04",
    name: "Natura Organics Supply",
    logoUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=150&auto=format&fit=crop",
    flag: "VN",
    location: "Hanoi, Vietnam",
    category: "Eco Goods",
    items: 310,
    minOrder: "₦1,150,000",
    reliability: "97.2%",
    featuredItems: [
      { id: "i-04a", name: "Biodegradable Bamboo Straws", bulkPrice: "₦35", moq: "10000 units", image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=300" }
    ]
  },
  {
    id: "st-05",
    name: "Andes Premium Coffee Co.",
    logoUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=150&auto=format&fit=crop",
    flag: "CO",
    location: "Medellín, Colombia",
    category: "Food & Ag",
    items: 180,
    minOrder: "₦4,800,000",
    reliability: "99.1%",
    badge: "Eco-Certified",
    featuredItems: [
      { id: "i-05a", name: "Green Arabica Beans (Bulk)", bulkPrice: "₦3,800/kg", moq: "500 kg", image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300" }
    ]
  },
  {
    id: "st-06",
    name: "Nippon Auto Components",
    logoUrl: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=150&auto=format&fit=crop",
    flag: "JP",
    location: "Osaka, Japan",
    category: "Automotive",
    items: 3100,
    minOrder: "₦15,000,000",
    reliability: "99.8%",
    featuredItems: [
      { id: "i-06a", name: "Ceramic Brake Rotors", bulkPrice: "₦78,000", moq: "50 units", image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=300" }
    ]
  },
  {
    id: "st-07",
    name: "Nordic Lumina Ceramics",
    logoUrl: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=150&auto=format&fit=crop",
    flag: "FI",
    location: "Helsinki, Finland",
    category: "Decor",
    items: 240,
    minOrder: "₦2,700,000",
    reliability: "96.5%",
    featuredItems: [
      { id: "i-07a", name: "Minimalist Porcelain Vases", bulkPrice: "₦12,500", moq: "100 units", image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=300" }
    ]
  },
  {
    id: "st-08",
    name: "Sahara Nile Botanicals",
    logoUrl: "https://images.unsplash.com/photo-1608248597481-496100c80836?w=150&auto=format&fit=crop",
    flag: "EG",
    location: "Alexandria, Egypt",
    category: "Cosmetics",
    items: 190,
    minOrder: "₦5,250,000",
    reliability: "98.1%",
    badge: "Premium Quality",
    featuredItems: [
      { id: "i-08a", name: "Cold-Pressed Jojoba Oil", bulkPrice: "₦8,500/L", moq: "200 Liters", image: "https://images.unsplash.com/photo-1608248597481-496100c80836?w=300" }
    ]
  },
  {
    id: "st-09",
    name: "Prato Leatherworks Alliance",
    logoUrl: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=150&auto=format&fit=crop",
    flag: "IT",
    location: "Florence, Italy",
    category: "Apparel",
    items: 450,
    minOrder: "₦8,400,000",
    reliability: "99.0%",
    featuredItems: [
      { id: "i-09a", name: "Full-Grain Calf Hide", bulkPrice: "₦18,000/sq-ft", moq: "50 sheets", image: "https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=300" }
    ]
  },
  {
    id: "st-10",
    name: "Siam Teak & Woodworks",
    logoUrl: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=150&auto=format&fit=crop",
    flag: "TH",
    location: "Chiang Mai, Thailand",
    category: "Decor",
    items: 670,
    minOrder: "₦6,200,000",
    reliability: "97.6%",
    featuredItems: [
      { id: "i-10a", name: "Hand-Carved Teak Panels", bulkPrice: "₦95,000", moq: "20 units", image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=300" }
    ]
  },
  {
    id: "st-11",
    name: "Bengal Jute Co. Mills",
    logoUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=150&auto=format&fit=crop",
    flag: "BD",
    location: "Dhaka, Bangladesh",
    category: "Eco Goods",
    items: 150,
    minOrder: "₦2,650,000",
    reliability: "95.4%",
    featuredItems: [
      { id: "i-11a", name: "Industrial Jute Sacks", bulkPrice: "₦450", moq: "5000 units", image: "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=300" }
    ]
  },
  {
    id: "st-12",
    name: "Rhône Chemical Glassware",
    logoUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&auto=format&fit=crop",
    flag: "FR",
    location: "Lyon, France",
    category: "Machinery",
    items: 890,
    minOrder: "₦5,850,000",
    reliability: "99.7%",
    badge: "ISO Compliant",
    featuredItems: [
      { id: "i-12a", name: "Borosilicate Distillation Kits", bulkPrice: "₦210,000", moq: "10 units", image: "https://images.unsplash.com/photo-1532187863486-abf9d39d6618?w=300" }
    ]
  },
  {
    id: "st-13",
    name: "Inca Superfoods Export",
    logoUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=150&auto=format&fit=crop",
    flag: "PE",
    location: "Lima, Peru",
    category: "Food & Ag",
    items: 120,
    minOrder: "₦4,600,000",
    reliability: "98.2%",
    featuredItems: [
      { id: "i-13a", name: "Organic Quinoa Powder", bulkPrice: "₦5,400/kg", moq: "500 kg", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300" }
    ]
  },
  {
    id: "st-14",
    name: "Eindhoven Semiconductor Hub",
    logoUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&auto=format&fit=crop",
    flag: "NL",
    location: "Eindhoven, Netherlands",
    category: "Electronics",
    items: 430,
    minOrder: "₦37,500,000",
    reliability: "99.9%",
    badge: "Tier 1 Supply",
    featuredItems: [
      { id: "i-14a", name: "Microcontroller Gateways", bulkPrice: "₦14,500", moq: "1000 units", image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300" }
    ]
  },
  {
    id: "st-15",
    name: "Highveld Chrome Foundry",
    logoUrl: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=150&auto=format&fit=crop",
    flag: "ZA",
    location: "Johannesburg, S. Africa",
    category: "Machinery",
    items: 210,
    minOrder: "₦43,500,000",
    reliability: "96.8%",
    featuredItems: [
      { id: "i-15a", name: "Reinforced Ferrochrome Rods", bulkPrice: "₦85,000/ton", moq: "50 tons", image: "https://images.unsplash.com/photo-1535813547-99c456a41d4a?w=300" }
    ]
  },
  {
    id: "st-16",
    name: "Seoul Smart Display Corp",
    logoUrl: "https://images.unsplash.com/photo-1551645121-d1034da75057?w=150&auto=format&fit=crop",
    flag: "KR",
    location: "Gyeonggi, S. Korea",
    category: "Electronics",
    items: 1540,
    minOrder: "₦22,500,000",
    reliability: "99.6%",
    featuredItems: [
      { id: "i-16a", name: "AMOLED Flexible Panels", bulkPrice: "₦62,000", moq: "250 units", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300" }
    ]
  },
  {
    id: "st-17",
    name: "Pampa Grain Silos Ltd",
    logoUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=150&auto=format&fit=crop",
    flag: "AR", // Fixed from invalid "AA"
    location: "Rosario, Argentina",
    category: "Food & Ag",
    items: 95,
    minOrder: "₦15,750,000",
    reliability: "97.4%",
    featuredItems: [
      { id: "i-17a", name: "Yellow Non-GMO Corn", bulkPrice: "₦195,000/ton", moq: "40 tons", image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300" }
    ]
  },
  {
    id: "st-18",
    name: "Guangdong LED Outfitters",
    logoUrl: "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=150&auto=format&fit=crop",
    flag: "CN",
    location: "Foshan, China",
    category: "Electronics",
    items: 4320,
    minOrder: "₦4,500,000",
    reliability: "98.3%",
    featuredItems: [
      { id: "i-18a", name: "Commercial Floodlights", bulkPrice: "₦18,500", moq: "150 units", image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=300" }
    ]
  },
  {
    id: "st-19",
    name: "Kolkata Hemp Fabrics",
    logoUrl: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=150&auto=format&fit=crop",
    flag: "IN",
    location: "Kolkata, India",
    category: "Apparel",
    items: 510,
    minOrder: "₦4,350,000",
    reliability: "95.9%",
    featuredItems: [
      { id: "i-19a", name: "Unbleached Hemp Twill", bulkPrice: "₦3,100/m", moq: "400 meters", image: "https://images.unsplash.com/photo-1545048702-79362596cdc9?w=300" }
    ]
  },
  {
    id: "st-20",
    name: "Bavarian Motor Parts (BMP)",
    logoUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=150&auto=format&fit=crop",
    flag: "DE",
    location: "Munich, Germany",
    category: "Automotive",
    items: 1840,
    minOrder: "₦13,400,000",
    reliability: "99.8%",
    badge: "Top Verified",
    featuredItems: [
      { id: "i-20a", name: "Fuel Injector Rails", bulkPrice: "₦110,000", moq: "30 units", image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=300" }
    ]
  },
  {
    id: "st-21",
    name: "Casablanca Phosphate Miners",
    logoUrl: "https://images.unsplash.com/photo-1605787020600-b9ebd5df1d07?w=150&auto=format&fit=crop",
    flag: "MA",
    location: "Casablanca, Morocco",
    category: "Machinery",
    items: 60,
    minOrder: "₦27,000,000",
    reliability: "99.1%",
    featuredItems: [
      { id: "i-21a", name: "Agricultural Grade Phosphate", bulkPrice: "₦480,000/ton", moq: "20 tons", image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=300" }
    ]
  },
  {
    id: "st-22",
    name: "Taipei Precision Plastics",
    logoUrl: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=150&auto=format&fit=crop",
    flag: "TW",
    location: "Hsinchu, Taiwan",
    category: "Electronics",
    items: 920,
    minOrder: "₦9,000,000",
    reliability: "99.5%",
    featuredItems: [
      { id: "i-22a", name: "Injection-Molded Casings", bulkPrice: "₦850", moq: "5000 units", image: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=300" }
    ]
  },
  {
    id: "st-23",
    name: "Amazonas Rubber Collectives",
    logoUrl: "https://images.unsplash.com/photo-1520262454473-a1a82276a574?w=150&auto=format&fit=crop",
    flag: "BR",
    location: "Manaus, Brazil",
    category: "Eco Goods",
    items: 140,
    minOrder: "₦5,900,000",
    reliability: "94.8%",
    featuredItems: [
      { id: "i-23a", name: "Raw Latex Sheets", bulkPrice: "₦6,200/kg", moq: "1000 kg", image: "https://images.unsplash.com/photo-1604147706283-d7119b5b822c?w=300" }
    ]
  },
  {
    id: "st-24",
    name: "Grasse Aromatics Extraction",
    logoUrl: "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=150&auto=format&fit=crop",
    flag: "FR",
    location: "Grasse, France",
    category: "Cosmetics",
    items: 280,
    minOrder: "₦6,700,000",
    reliability: "98.9%",
    badge: "Premium Quality",
    featuredItems: [
      { id: "i-24a", name: "Pure Lavender Absolute", bulkPrice: "₦450,000/L", moq: "5 Liters", image: "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=300" }
    ]
  },
  {
    id: "st-25",
    name: "Valencia Citrus Preserves",
    logoUrl: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=150&auto=format&fit=crop",
    flag: "ES",
    location: "Valencia, Spain",
    category: "Food & Ag",
    items: 210,
    minOrder: "₦7,300,000",
    reliability: "97.2%",
    featuredItems: [
      { id: "i-25a", name: "Concentrated Orange Puree", bulkPrice: "₦4,200/kg", moq: "1000 kg", image: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=300" }
    ]
  },
  {
    id: "st-26",
    name: "Nairobi Botanical Fibers",
    logoUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=150&auto=format&fit=crop",
    flag: "KE",
    location: "Nairobi, Kenya",
    category: "Eco Goods",
    items: 110,
    minOrder: "₦3,750,000",
    reliability: "96.1%",
    featuredItems: [
      { id: "i-26a", name: "Sisal Fiber Bundles", bulkPrice: "₦2,800/kg", moq: "1500 kg", image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=300" }
    ]
  },
  {
    id: "st-27",
    name: "Kyoto Silk Weavers Guild",
    logoUrl: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=150&auto=format&fit=crop",
    flag: "JP",
    location: "Kyoto, Japan",
    category: "Apparel",
    items: 160,
    minOrder: "₦15,000,000",
    reliability: "99.4%",
    featuredItems: [
      { id: "i-27a", name: "Raw Habotai Silk Bolts", bulkPrice: "₦28,500/m", moq: "200 meters", image: "https://images.unsplash.com/photo-1606744824163-985d376605aa?w=300" }
    ]
  },
  {
    id: "st-28",
    name: "Jebel Ali Cable Foundry",
    logoUrl: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&auto=format&fit=crop",
    flag: "AE",
    location: "Dubai, UAE",
    category: "Machinery",
    items: 480,
    minOrder: "₦18,000,000",
    reliability: "99.7%",
    badge: "Tier 1 Supply",
    featuredItems: [
      { id: "i-28a", name: "Armored Copper Cabling", bulkPrice: "₦14,000/m", moq: "1000 meters", image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=300" }
    ]
  },
  {
    id: "st-29",
    name: "Guadalajara Glass Collectives",
    logoUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=150&auto=format&fit=crop",
    flag: "MX",
    location: "Guadalajara, Mexico",
    category: "Decor",
    items: 390,
    minOrder: "₦4,500,000",
    reliability: "95.8%",
    featuredItems: [
      { id: "i-29a", name: "Blown Amber Glassware", bulkPrice: "₦3,400", moq: "500 units", image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300" }
    ]
  },
  {
    id: "st-30",
    name: "Highlands Wool Spinners",
    logoUrl: "https://images.unsplash.com/photo-1543332164-6e82f355bab7?w=150&auto=format&fit=crop",
    flag: "GB",
    location: "Edinburgh, UK",
    category: "Apparel",
    items: 220,
    minOrder: "₦4,180,000",
    reliability: "99.1%",
    featuredItems: [
      { id: "i-30a", name: "Pure Merino Yarn Spools", bulkPrice: "₦8,200/kg", moq: "300 kg", image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=300" }
    ]
  }
];