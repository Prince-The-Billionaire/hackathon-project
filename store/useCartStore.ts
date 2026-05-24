// useCartStore.ts
import { create } from "zustand";

export interface CargoItem {
  id: string;
  itemName: string;
  status: string;
  carrier: string;
  origin: string;
  destination: string;
  eta: string;
  progressPercent: number;
  materials: {
    name: string;
    unitCost: number;
    quantity: number;
  };
  financials: {
    tariffRate: number;
    customsFees: number;
    vatRate: number;
  };
}

interface CartState {
  cargoOrders: CargoItem[];
  addToCargo: (item: { id: string; name: string; bulkPrice: string; image: string }, quantity: number, storeName: string) => void;
}

// Pre-seeded initial data from your mock configurations
const INITIAL_CARGO: CargoItem[] = [
  {
    id: "WZ-441-TCAN",
    itemName: "Shared Cargo: Commercial Telemetry Units (4 slots pooled)",
    status: "In Transit",
    carrier: "Atlantic Pioneer",
    origin: "Port of Rotterdam, Netherlands",
    destination: "Port of Lagos (Tin Can)",
    eta: "June 04, 2026",
    progressPercent: 74,
    materials: {
      name: "Wireless Telemetry Transceiver Node",
      unitCost: 185000,
      quantity: 15,
    },
    financials: {
      tariffRate: 0.05,
      customsFees: 180000,
      vatRate: 0.075,
    }
  },
  {
    id: "WZ-208-LOS",
    itemName: "Shared Cargo: Smart Energy Meter Assemblies (8 slots pooled)",
    status: "Customs Hold",
    carrier: "Pacific Horizon",
    origin: "Port of Shanghai, China",
    destination: "Port of Lagos (Apapa)",
    eta: "May 30, 2026",
    progressPercent: 91,
    materials: {
      name: "Single-Phase Smart Meter Modules",
      unitCost: 95000,
      quantity: 30,
    },
    financials: {
      tariffRate: 0.075,
      customsFees: 210000,
      vatRate: 0.075,
    }
  }
];

export const useCartStore = create<CartState>((set) => ({
  cargoOrders: INITIAL_CARGO,
  addToCargo: (item, quantity, storeName) =>
    set((state) => {
      // Parse numeric integer values out of pricing texts cleanly (e.g. "$120" or "₦45,000" -> 45000)
      const numericPrice = parseInt(item.bulkPrice.replace(/[^0-9]/g, "")) || 25000;
      
      const newCargoUnit: CargoItem = {
        id: `WZ-${Math.floor(100 + Math.random() * 900)}-GEN`,
        itemName: `Shared Cargo: ${item.name} (${storeName} Allocation)`,
        status: "Departed Origin",
        carrier: "Starlight Mariner",
        origin: "Global Logistics Hub",
        destination: "Port of Lagos (Apapa)",
        eta: "June 24, 2026",
        progressPercent: 12,
        materials: {
          name: item.name,
          unitCost: numericPrice,
          quantity: quantity,
        },
        financials: {
          tariffRate: 0.05,
          customsFees: 150000,
          vatRate: 0.075,
        }
      };

      return { cargoOrders: [newCargoUnit, ...state.cargoOrders] };
    }),
}));