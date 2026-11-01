export interface IndustrialFacility {
  name: string;
  type: "Refinery" | "Petrochemical" | "Thermal Power" | "Chemical SEZ" | "Steel Plant" | "Fertilizer" | "Rural Farmland" | "Reserve Forest";
  lat: number;
  lng: number;
  city: string;
  state: string;
  baseline_frp: number; // typical operational flaring FRP in MW
  land_cover: string;
}

export const KNOWN_INDIAN_FACILITIES: IndustrialFacility[] = [
  // Gujarat Industrial Hubs
  {
    name: "Reliance Jamnagar Refinery & Petrochemical Complex",
    type: "Refinery",
    lat: 22.3852,
    lng: 69.8724,
    city: "Jamnagar",
    state: "Gujarat",
    baseline_frp: 18.0,
    land_cover: "Petrochemical Refinery",
  },
  {
    name: "Nayara Energy Vadinar Refinery",
    type: "Refinery",
    lat: 22.4112,
    lng: 69.895,
    city: "Vadinar / Jamnagar",
    state: "Gujarat",
    baseline_frp: 15.0,
    land_cover: "Petrochemical Refinery",
  },
  {
    name: "ONGC Petro additions Ltd (OPaL) Dahej SEZ",
    type: "Petrochemical",
    lat: 21.7134,
    lng: 72.5841,
    city: "Dahej",
    state: "Gujarat",
    baseline_frp: 22.0,
    land_cover: "Industrial Complex",
  },
  {
    name: "Gujarat Alkalies & Chemicals (GACL) Dahej",
    type: "Chemical SEZ",
    lat: 21.698,
    lng: 72.562,
    city: "Dahej",
    state: "Gujarat",
    baseline_frp: 18.5,
    land_cover: "Industrial Complex",
  },
  {
    name: "AM/NS India Hazira Steel & Pellet Complex",
    type: "Steel Plant",
    lat: 21.1055,
    lng: 72.6468,
    city: "Hazira / Surat",
    state: "Gujarat",
    baseline_frp: 14.0,
    land_cover: "Steel & Metallurgical",
  },
  {
    name: "Reliance Hazira Manufacturing Complex",
    type: "Petrochemical",
    lat: 21.125,
    lng: 72.685,
    city: "Hazira / Surat",
    state: "Gujarat",
    baseline_frp: 16.5,
    land_cover: "Petrochemical Refinery",
  },

  // Central India Power & Coal Belt
  {
    name: "NTPC Singrauli Super Thermal Power Station",
    type: "Thermal Power",
    lat: 24.1205,
    lng: 82.664,
    city: "Singrauli",
    state: "Madhya Pradesh",
    baseline_frp: 28.0,
    land_cover: "Thermal Power Plant",
  },
  {
    name: "NCL Jayant Opencast Coal Mine Overburden",
    type: "Thermal Power",
    lat: 24.087,
    lng: 82.641,
    city: "Singrauli",
    state: "Madhya Pradesh",
    baseline_frp: 25.0,
    land_cover: "Scrubland / Barren",
  },
  {
    name: "NTPC Korba Super Thermal Power Plant",
    type: "Thermal Power",
    lat: 22.3584,
    lng: 82.3031,
    city: "Korba",
    state: "Chhattisgarh",
    baseline_frp: 20.0,
    land_cover: "Thermal Power Plant",
  },
  {
    name: "BALCO Aluminum Smelter & Captive Power Plant",
    type: "Steel Plant",
    lat: 22.399,
    lng: 82.742,
    city: "Korba",
    state: "Chhattisgarh",
    baseline_frp: 15.0,
    land_cover: "Industrial Complex",
  },

  // Coastal Andhra Pradesh Hubs
  {
    name: "HPCL Visakh Refinery",
    type: "Refinery",
    lat: 17.698,
    lng: 83.235,
    city: "Visakhapatnam",
    state: "Andhra Pradesh",
    baseline_frp: 22.5,
    land_cover: "Petrochemical Refinery",
  },
  {
    name: "Rashtriya Ispat Nigam Ltd (RINL Vizag Steel)",
    type: "Steel Plant",
    lat: 17.632,
    lng: 83.181,
    city: "Visakhapatnam",
    state: "Andhra Pradesh",
    baseline_frp: 24.0,
    land_cover: "Steel & Metallurgical",
  },

  // Odisha Industrial & Steel Belt
  {
    name: "Jindal Steel & Power (JSPL) Angul Plant",
    type: "Steel Plant",
    lat: 20.785,
    lng: 85.265,
    city: "Angul",
    state: "Odisha",
    baseline_frp: 18.0,
    land_cover: "Steel & Metallurgical",
  },
  {
    name: "NTPC Talcher Thermal Power Station",
    type: "Thermal Power",
    lat: 20.963,
    lng: 85.184,
    city: "Talcher",
    state: "Odisha",
    baseline_frp: 22.0,
    land_cover: "Thermal Power Plant",
  },
  {
    name: "Tata Steel Kalinganagar Complex",
    type: "Steel Plant",
    lat: 20.9502,
    lng: 86.0484,
    city: "Jajpur",
    state: "Odisha",
    baseline_frp: 16.0,
    land_cover: "Steel & Metallurgical",
  },

  // Eastern & Southern Hubs
  {
    name: "Indian Oil Haldia Refinery & Petrochemicals",
    type: "Refinery",
    lat: 22.0519,
    lng: 88.1259,
    city: "Haldia",
    state: "West Bengal",
    baseline_frp: 19.0,
    land_cover: "Petrochemical Refinery",
  },
  {
    name: "Bhilai Steel Plant (SAIL)",
    type: "Steel Plant",
    lat: 21.189,
    lng: 81.392,
    city: "Bhilai",
    state: "Chhattisgarh",
    baseline_frp: 25.0,
    land_cover: "Steel & Metallurgical",
  },
  {
    name: "MRPL Mangalore Refinery and Petrochemicals",
    type: "Refinery",
    lat: 12.991,
    lng: 74.832,
    city: "Mangalore",
    state: "Karnataka",
    baseline_frp: 17.5,
    land_cover: "Petrochemical Refinery",
  },
  {
    name: "BPCL Mumbai Refinery - Mahul Trombay",
    type: "Refinery",
    lat: 19.006,
    lng: 72.894,
    city: "Mumbai",
    state: "Maharashtra",
    baseline_frp: 18.0,
    land_cover: "Petrochemical Refinery",
  },
  {
    name: "CPCL Manali Refinery",
    type: "Refinery",
    lat: 13.165,
    lng: 80.264,
    city: "Chennai",
    state: "Tamil Nadu",
    baseline_frp: 15.0,
    land_cover: "Petrochemical Refinery",
  },

  // Regional reference points for agricultural & forest zones
  {
    name: "Sangrur Agricultural District",
    type: "Rural Farmland",
    lat: 30.291,
    lng: 75.834,
    city: "Sangrur",
    state: "Punjab",
    baseline_frp: 8.0,
    land_cover: "Agricultural Cropland",
  },
  {
    name: "Ludhiana Farm Sector",
    type: "Rural Farmland",
    lat: 30.901,
    lng: 75.857,
    city: "Ludhiana",
    state: "Punjab",
    baseline_frp: 7.5,
    land_cover: "Agricultural Cropland",
  },
  {
    name: "Simlipal Biosphere Reserve",
    type: "Reserve Forest",
    lat: 21.821,
    lng: 86.342,
    city: "Mayurbhanj",
    state: "Odisha",
    baseline_frp: 4.0,
    land_cover: "Dense Deciduous Forest",
  },
];

/**
 * Calculates Haversine distance between two coordinates in meters
 */
export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const rad = Math.PI / 180;
  const phi1 = lat1 * rad;
  const phi2 = lat2 * rad;
  const deltaPhi = (lat2 - lat1) * rad;
  const deltaLambda = (lon2 - lon1) * rad;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Finds the nearest known Indian industrial plant or reference area
 */
export function findNearestFacility(lat: number, lng: number) {
  let closest = KNOWN_INDIAN_FACILITIES[0];
  let minDistance = calculateHaversineDistanceMeters(lat, lng, closest.lat, closest.lng);

  for (let i = 1; i < KNOWN_INDIAN_FACILITIES.length; i++) {
    const fac = KNOWN_INDIAN_FACILITIES[i];
    const dist = calculateHaversineDistanceMeters(lat, lng, fac.lat, fac.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = fac;
    }
  }

  return {
    facility: closest,
    distance_m: minDistance,
  };
}

