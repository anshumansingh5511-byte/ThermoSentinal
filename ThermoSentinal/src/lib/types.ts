export type ThermalClassification =
  | "Abnormal Industrial Fire"
  | "Normal Industrial Flare"
  | "Agricultural Burn"
  | "Wildfire";

export type SatelliteSensor =
  | "VIIRS_SNPP"
  | "VIIRS_NOAA20"
  | "MODIS_AQUA"
  | "MODIS_TERRA";

export type LandCoverType =
  | "Industrial Complex"
  | "Petrochemical Refinery"
  | "Thermal Power Plant"
  | "Steel & Metallurgical"
  | "Agricultural Cropland"
  | "Dense Deciduous Forest"
  | "Scrubland / Barren";

export interface NearestFacility {
  name: string;
  type: "Refinery" | "Petrochemical" | "Thermal Power" | "Chemical SEZ" | "Steel Plant" | "Fertilizer" | "Rural Farmland" | "Reserve Forest";
  distance_m: number;
  city: string;
  state: string;
}

export interface HotspotRecord {
  id: string;
  lat: number;
  lng: number;
  frp: number; // Fire Radiative Power in MW
  brightness_temp: number; // in Kelvin
  confidence: number; // percentage (0-100)
  timestamp: string; // ISO string (UTC)
  acq_date?: string; // e.g. "2026-09-19"
  acq_time?: string; // e.g. "0735"
  formatted_time_ist?: string; // e.g. "19 Sep 2026, 01:05 PM IST"
  formatted_time_utc?: string; // e.g. "07:35 UTC"
  nearest_facility: NearestFacility;
  land_cover: LandCoverType;
  baseline_frp: number; // normal operational baseline in MW
  anomaly_score: number; // 0.0 to 1.0
  classification: ThermalClassification;
  satellite_sensor: SatelliteSensor;
  is_critical: boolean; // FRP > 2.5x baseline and distance < 500m
  ratio_to_baseline: number; // frp / baseline_frp
  daynight: "D" | "N";
  scan: number;
  track: number;
  history_24h?: {
    time: string;
    frp: number;
    baseline: number;
  }[];
}

export interface FilterState {
  classifications: ThermalClassification[];
  minFrp: number;
  sensor: string; // 'ALL' | SatelliteSensor
  searchQuery: string;
  onlyCritical: boolean;
}

export interface AiAnalysisResult {
  hazardLevel: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  rootCauseDiagnosis: string;
  combustionProfile: {
    estimatedFlameTempK: number;
    hydrocarbonTypeLikelihood: string;
    containmentStatus: "Uncontrolled Containment Loss" | "Controlled Regulatory Combustion" | "Vegetation Burn";
  };
  environmentalRisk: {
    plumeDispersionRisk: string;
    toxicGases: string[];
    affectedRadiusMeters: number;
  };
  recommendedActions: string[];
  ndrfDispatchMemo: string;
}
