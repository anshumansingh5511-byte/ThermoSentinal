import { HotspotRecord, SatelliteSensor, LandCoverType } from "./types";
import { findNearestFacility } from "./industrialFacilities";
import { evaluateThermalAnomaly } from "./anomalyEngine";

// In-memory cache for NASA FIRMS data (5 minutes TTL to avoid hitting NASA rate limits on every keystroke)
let cachedHotspots: HotspotRecord[] = [];
let lastFetchTimestamp: number = 0;
let lastUsedDayRange: number = 1;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Converts NASA FIRMS date (YYYY-MM-DD) and time (e.g. "735" or "1420")
 * into formatted UTC and IST (Indian Standard Time = UTC + 5:30) representations.
 */
export function formatNasaDateTime(dateStr: string, timeStr: string) {
  const padded = (timeStr || "0000").toString().padStart(4, "0");
  const utcIso = `${dateStr}T${padded.slice(0, 2)}:${padded.slice(2, 4)}:00Z`;
  const dateObj = new Date(utcIso);

  const formattedUtc = `${padded.slice(0, 2)}:${padded.slice(2, 4)} UTC`;

  let formattedIst = "";
  try {
    const istDate = new Date(dateObj.getTime() + 5.5 * 60 * 60 * 1000);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = String(istDate.getUTCDate()).padStart(2, "0");
    const month = months[istDate.getUTCMonth()];
    const year = istDate.getUTCFullYear();
    
    let hours = istDate.getUTCHours();
    const minutes = String(istDate.getUTCMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = String(hours).padStart(2, "0");

    formattedIst = `${day} ${month} ${year}, ${strHours}:${minutes} ${ampm} IST`;
  } catch {
    formattedIst = `${dateStr} ${formattedUtc}`;
  }

  return {
    utcIso,
    formattedUtc,
    formattedIst,
  };
}

export async function fetchLiveNasaFirmsHotspots(
  forceRefresh = false
): Promise<{
  source: "nasa-firms-live" | "cache";
  dayRange: number;
  data: HotspotRecord[];
  satellites: string[];
}> {
  const mapKey = process.env.NASA_FIRMS_MAP_KEY || "e27b0960581561a0d52af79e12480006";
  const now = Date.now();

  // Return cached live data if still fresh
  if (!forceRefresh && cachedHotspots.length > 0 && now - lastFetchTimestamp < CACHE_TTL_MS) {
    return {
      source: "cache",
      dayRange: lastUsedDayRange,
      data: cachedHotspots,
      satellites: ["VIIRS Suomi-NPP", "VIIRS NOAA-20"],
    };
  }

  const sources = ["VIIRS_SNPP_NRT", "VIIRS_NOAA20_NRT"];
  // India Bounding Box: west=68, south=6, east=98, north=37
  const bbox = "68,6,98,37";

  // Step 1: Attempt to fetch latest 1 day (today's flyby)
  let dayRange = 1;
  let allDetections = await queryNasaSources(mapKey, sources, bbox, dayRange);

  // Step 2: If no data returned for today's pass yet, fetch the most recent flyby data (last 2 days)
  if (allDetections.length === 0) {
    dayRange = 2;
    allDetections = await queryNasaSources(mapKey, sources, bbox, dayRange);
  }

  // If still no data from NASA, return empty array (NO mock data!)
  if (allDetections.length === 0) {
    cachedHotspots = [];
    lastFetchTimestamp = now;
    lastUsedDayRange = dayRange;
    return {
      source: "nasa-firms-live",
      dayRange,
      data: [],
      satellites: ["VIIRS Suomi-NPP", "VIIRS NOAA-20"],
    };
  }

  // Sort by Fire Radiative Power (highest FRP first)
  allDetections.sort((a, b) => b.frp - a.frp);

  cachedHotspots = allDetections;
  lastFetchTimestamp = now;
  lastUsedDayRange = dayRange;

  return {
    source: "nasa-firms-live",
    dayRange,
    data: cachedHotspots,
    satellites: ["VIIRS Suomi-NPP", "VIIRS NOAA-20"],
  };
}

async function queryNasaSources(
  mapKey: string,
  sources: string[],
  bbox: string,
  days: number
): Promise<HotspotRecord[]> {
  const list: HotspotRecord[] = [];

  for (const src of sources) {
    try {
      const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${mapKey}/${src}/${bbox}/${days}`;
      const response = await fetch(url, {
        headers: { "User-Agent": "ThermoSentinel-SIH26162/1.0" },
      });

      if (!response.ok) {
        console.warn(`NASA FIRMS API responded with status ${response.status} for ${src}`);
        continue;
      }

      const csvText = await response.text();
      const parsed = parseFirmsCsv(csvText, src as any);
      list.push(...parsed);
    } catch (err) {
      console.error(`Error querying NASA FIRMS for ${src}:`, err);
    }
  }

  return list;
}

function parseFirmsCsv(csvText: string, sourceName: "VIIRS_SNPP_NRT" | "VIIRS_NOAA20_NRT"): HotspotRecord[] {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  const header = lines[0].split(",").map((h) => h.trim());
  const latIdx = header.indexOf("latitude");
  const lngIdx = header.indexOf("longitude");
  const frpIdx = header.indexOf("frp");
  const tempIdx = header.indexOf("bright_ti4") !== -1 ? header.indexOf("bright_ti4") : header.indexOf("brightness");
  const confIdx = header.indexOf("confidence");
  const dateIdx = header.indexOf("acq_date");
  const timeIdx = header.indexOf("acq_time");
  const scanIdx = header.indexOf("scan");
  const trackIdx = header.indexOf("track");
  const daynightIdx = header.indexOf("daynight");

  const results: HotspotRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim());
    if (cols.length < header.length) continue;

    const lat = parseFloat(cols[latIdx]);
    const lng = parseFloat(cols[lngIdx]);
    const frp = parseFloat(cols[frpIdx]);
    const brightnessTemp = parseFloat(cols[tempIdx]);
    const rawConf = cols[confIdx] || "n";
    const confidence = rawConf === "h" ? 95 : rawConf === "n" ? 75 : rawConf === "l" ? 50 : parseInt(rawConf) || 80;
    const acqDate = cols[dateIdx] || "";
    const acqTime = cols[timeIdx] || "0000";
    const scan = parseFloat(cols[scanIdx]) || 0.4;
    const track = parseFloat(cols[trackIdx]) || 0.4;
    const daynight = (cols[daynightIdx] === "N" ? "N" : "D") as "D" | "N";

    if (isNaN(lat) || isNaN(lng) || isNaN(frp)) continue;

    // Real timestamp from NASA satellite acquisition
    const { utcIso, formattedUtc, formattedIst } = formatNasaDateTime(acqDate, acqTime);

    // Geospatial Proximity Enrichment
    const nearest = findNearestFacility(lat, lng);
    const facility = nearest.facility;
    const distance_m = nearest.distance_m;

    let baselineFrp = facility.baseline_frp;
    let landCover: LandCoverType = facility.land_cover as LandCoverType;

    // Categorize land cover if far from known industrial installations
    if (distance_m > 5000) {
      if (lat > 28.0 && lng > 74.0 && lng < 78.0) {
        landCover = "Agricultural Cropland";
        baselineFrp = 6.0;
      } else if (facility.type === "Reserve Forest" || distance_m < 25000) {
        landCover = "Dense Deciduous Forest";
        baselineFrp = 4.0;
      } else {
        landCover = "Scrubland / Barren";
        baselineFrp = 5.0;
      }
    }

    // SIH26162 Anomaly Engine
    const evalResult = evaluateThermalAnomaly(
      frp,
      baselineFrp,
      distance_m,
      landCover,
      distance_m < 5000 ? facility.type : "Rural Farmland"
    );

    const sensorCode: SatelliteSensor =
      sourceName === "VIIRS_SNPP_NRT" ? "VIIRS_SNPP" : "VIIRS_NOAA20";

    results.push({
      id: `NASA-FIRMS-${lat.toFixed(3)}N-${lng.toFixed(3)}E`,
      lat,
      lng,
      frp: Number(frp.toFixed(1)),
      brightness_temp: Number(brightnessTemp.toFixed(1)),
      confidence,
      timestamp: utcIso,
      acq_date: acqDate,
      acq_time: acqTime,
      formatted_time_ist: formattedIst,
      formatted_time_utc: formattedUtc,
      nearest_facility: {
        name: distance_m < 5000 ? facility.name : `Open Area (${facility.city} Sector)`,
        type: distance_m < 5000 ? facility.type : "Rural Farmland",
        distance_m,
        city: facility.city,
        state: facility.state,
      },
      land_cover: landCover,
      baseline_frp: baselineFrp,
      anomaly_score: evalResult.anomalyScore,
      classification: evalResult.classification,
      satellite_sensor: sensorCode,
      is_critical: evalResult.isCritical,
      ratio_to_baseline: evalResult.ratioToBaseline,
      daynight,
      scan,
      track,
    });
  }

  return results;
}
