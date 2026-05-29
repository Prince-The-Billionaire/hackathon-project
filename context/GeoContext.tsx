"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type GeoContextType = {
  countryCode: string; // e.g., "NG", "US"
  flagEmoji: string;    // e.g., "🇳🇬", "🇺🇸"
};

const GeoContext = createContext<GeoContextType | undefined>(undefined);

// Helper to convert ISO 2-letter codes into clean system flag emojis
const getFlagEmoji = (countryCode: string) => {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) =>  127397 + char.charCodeAt(0));
  try {
    return String.fromCodePoint(...codePoints);
  } catch {
    return "🌐";
  }
};

export function GeoProvider({ children }: { children: React.ReactNode }) {
  const [geo, setGeo] = useState<GeoContextType>({ countryCode: "NG", flagEmoji: "🇳🇬" });

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse-geocoding using a free open-source provider (No API Keys required)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=3`
          );
          const data = await res.json();
          if (data?.address?.country_code) {
            const isoCode = data.address.country_code.toUpperCase();
            setGeo({
              countryCode: isoCode,
              flagEmoji: getFlagEmoji(isoCode),
            });
          }
        } catch (err) {
          console.error("Reverse geocoding failed, falling back to default node configuration.", err);
        }
      },
      (error) => console.warn("Geolocation denied or timed out:", error.message),
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, []);

  return <GeoContext.Provider value={geo}>{children}</GeoContext.Provider>;
}

export const useGeo = () => {
  const context = useContext(GeoContext);
  if (!context) throw new Error("useGeo must be wrapped inside a valid GeoProvider configuration block.");
  return context;
};