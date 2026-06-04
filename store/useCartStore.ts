import { create } from "zustand";
import { createApiClient } from "@/utils/api"; // Assuming your global fetch wrapper

export interface CargoItem {
  id: string; // Database item or allocation primary key
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

export interface ChatMessage {
  id: string;
  type: "sent" | "received" | "system";
  text: string;
  time: string;
  isDocument?: boolean;
  documentData?: {
    itemName: string;
    quantity: number;
    totalValue: number;
  };
}

interface CartState {
  cargoOrders: CargoItem[];
  chatMessages: ChatMessage[];
  escrowBalance: number;
  contractStatus: "negotiating" | "manifest_sent" | "escrow_locked";
  isLoading: boolean;
  
  // Local modifications
  addToCargo: (item: { id: string; name: string; bulkPrice: string; image: string }, quantity: number, storeName: string) => void;
  
  // Live Data Actions syncing to backend
  fetchUserCargo: (getToken: () => Promise<string | null>) => Promise<void>;
  syncAddToCargo: (item: { id: string; name: string; bulkPrice: string; image: string }, quantity: number, storeName: string, getToken: () => Promise<string | null>) => Promise<void>;
  syncUpdateQuantity: (cargoItemId: string, newQty: number, getToken: () => Promise<string | null>) => Promise<void>;
  syncRemoveFromCargo: (cargoItemId: string, getToken: () => Promise<string | null>) => Promise<void>;
  
  sendChatMessage: (text: string, type?: "sent" | "received" | "system") => void;
  generateExportDoc: (itemName: string, quantity: number, unitCost: number) => void;
  confirmEscrowPayment: (amount: number) => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  cargoOrders: [],
  chatMessages: [
    { id: "msg-1", type: "received", text: "Hello! Let me know if you want to review the documentation parameters.", time: "10:14 AM" }
  ],
  escrowBalance: 0,
  contractStatus: "negotiating",
  isLoading: false,

  // Synchronize entire store with database array on route load
  fetchUserCargo: async (getToken) => {
    set({ isLoading: true });
    try {
      const api = await createApiClient(getToken);
      const data = await api("api/cargo/allocation"); // Pull persistent drafts from backend
      set({ cargoOrders: data || [] });
    } catch (err) {
      console.error("Failed to fetch persistent cargo rows:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  // Client display helper (fallback fallback state handling)
  addToCargo: (item, quantity, storeName) => {
    const parsedMinor = parseFloat(item.bulkPrice) || 0;
    const baseCurrencyCost = parsedMinor > 0 ? parsedMinor / 100 : 25000;

    const newCargoUnit: CargoItem = {
      id: `WZ-TEMP-${Math.floor(100 + Math.random() * 900)}`,
      itemName: `Shared Cargo: ${item.name} (${storeName} Allocation)`,
      status: "Drafting",
      carrier: "Pending Scheduling",
      origin: "Global Logistics Hub",
      destination: "Port of Lagos (Apapa)",
      eta: "Calculating...",
      progressPercent: 0,
      materials: { name: item.name, unitCost: baseCurrencyCost, quantity },
      financials: { tariffRate: 0.05, customsFees: 150000, vatRate: 0.075 }
    };
    set((state) => ({ cargoOrders: [newCargoUnit, ...state.cargoOrders] }));
  },

  // The Master Sync Hook that saves the analytics data to DB instantly
  syncAddToCargo: async (item, quantity, storeName, getToken) => {
    // 1. Instantly fire local mutation for instant premium UI snappiness
    get().addToCargo(item, quantity, storeName);

    // 2. Persist to DB for merchant pattern analysis
    try {
      const api = await createApiClient(getToken);
      await api("api/cargo/allocation", {
        method: "POST",
        body: JSON.stringify({
          productId: item.id,
          quantity: quantity,
          storeName: storeName,
          status: "DRAFT_SELECTION" // Tagged distinctly for data science pipelines
        })
      });
      // Optionally refetch to swap out temporary client-generated IDs with real DB UUIDs
      get().fetchUserCargo(getToken);
    } catch (err) {
      console.error("Database tracking write fail:", err);
    }
  },

  syncUpdateQuantity: async (cargoItemId, newQty, getToken) => {
    // Optimistic UI state manipulation
    set((state) => ({
      cargoOrders: state.cargoOrders.map(o => 
        o.id === cargoItemId ? { ...o, materials: { ...o.materials, quantity: newQty } } : o
      )
    }));

    try {
      const api = await createApiClient(getToken);
      await api(`api/cargo/allocation/${cargoItemId}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity: newQty })
      });
    } catch (err) {
      console.error("Failed to update database line quantity:", err);
    }
  },

  syncRemoveFromCargo: async (cargoItemId, getToken) => {
    set((state) => ({
      cargoOrders: state.cargoOrders.filter(o => o.id !== cargoItemId)
    }));

    try {
      const api = await createApiClient(getToken);
      await api(`api/cargo/allocation/${cargoItemId}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to remove item tracking trace from DB:", err);
    }
  },

  sendChatMessage: (text, type = "sent") => set((state) => ({
    chatMessages: [...state.chatMessages, { id: `msg-${Date.now()}`, type, text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]
  })),

  generateExportDoc: (itemName, quantity, unitCost) => set((state) => {
    const totalValue = quantity * unitCost;
    return {
      chatMessages: [...state.chatMessages, { id: `doc-${Date.now()}`, type: "received", text: `📄 Export Manifest Generated: ${itemName}`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isDocument: true, documentData: { itemName, quantity, totalValue } }],
      contractStatus: "manifest_sent"
    };
  }),

  confirmEscrowPayment: (amount) => set((state) => ({
    escrowBalance: state.escrowBalance + amount,
    contractStatus: "escrow_locked",
    chatMessages: [...state.chatMessages, { id: `sys-${Date.now()}`, type: "system", text: `🔒 Escrow Confirmed: ₦${amount.toLocaleString()} locked securely.`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]
  }))
}));