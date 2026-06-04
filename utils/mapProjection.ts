// src/utils/mapProjection.ts

/**
 * Projects latitude and longitude onto a 1000x500 flat layout grid map image space.
 * Calibrated for a high-fidelity standard global Mercator/Equirectangular base map asset.
 */
export function getPixelCoordinates(
  latStr: string | number,
  lngStr: string | number,
  mapWidth = 1000,
  mapHeight = 500
) {
  const lat = parseFloat(latStr as string);
  const lng = parseFloat(lngStr as string);

  // 1. Longitude (X-axis) is perfectly linear across the 360-degree span
  const x = ((lng + 180) * mapWidth) / 360;

  // 2. Latitude (Y-axis) adjustment
  // Most styled map vectors cut off around 85° N and 75° S to optimize layout framing
  const mapMaxLatitude = 85;
  const mapMinLatitude = -68;

  const latRad = (lat * Math.PI) / 180;
  const maxLatRad = (mapMaxLatitude * Math.PI) / 180;
  const minLatRad = (mapMinLatitude * Math.PI) / 180;

  // Mercator progression ratio scaling matching standard geometry formulas
  const mercY = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const mercMax = Math.log(Math.tan(Math.PI / 4 + maxLatRad / 2));
  const mercMin = Math.log(Math.tan(Math.PI / 4 + minLatRad / 2));

  // Compute percentage depth from the map top canvas frame boundary
  const yPercent = (mercMax - mercY) / (mercMax - mercMin);
  const y = yPercent * mapHeight;

  // Fallback clamping protection to keep nodes safely within visual borders
  return {
    x: Math.max(10, Math.min(mapWidth - 10, x)),
    y: Math.max(10, Math.min(mapHeight - 10, y)),
  };
}