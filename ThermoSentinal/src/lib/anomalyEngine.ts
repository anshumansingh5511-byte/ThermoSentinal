import { HotspotRecord, ThermalClassification } from "./types";

/**
 * Anomaly Engine for SIH26162
 * Core Rule:
 * If current FRP > 2.5x baseline_frp AND distance to industrial plant < 500m
 * => Flag as "Critical Abnormal Industrial Event" (Classification: "Abnormal Industrial Fire")
 */

export interface AnomalyEvaluation {
  isCritical: boolean;
  classification: ThermalClassification;
  anomalyScore: number;
  ratioToBaseline: number;
  urgencyLevel: "CRITICAL" | "HIGH" | "ELEVATED" | "NOMINAL";
  reasons: string[];
}

export function evaluateThermalAnomaly(
  frp: number,
  baselineFrp: number,
  distanceMeters: number,
  landCover: string,
  facilityType: string
): AnomalyEvaluation {
  const ratioToBaseline = baselineFrp > 0 ? Number((frp / baselineFrp).toFixed(2)) : 1.0;
  const reasons: string[] = [];

  const isIndustrialFacility = [
    "Refinery",
    "Petrochemical",
    "Thermal Power",
    "Chemical SEZ",
    "Steel Plant",
    "Fertilizer"
  ].includes(facilityType);

  // Core SIH26162 Rule:
  // If current FRP > 2.5x baseline and distance to industrial plant < 500m
  const isCriticalAnomaly = ratioToBaseline > 2.5 && isIndustrialFacility && distanceMeters < 500;

  let classification: ThermalClassification = "Normal Industrial Flare";
  let anomalyScore = 0.1;
  let urgencyLevel: AnomalyEvaluation["urgencyLevel"] = "NOMINAL";

  if (isCriticalAnomaly) {
    classification = "Abnormal Industrial Fire";
    urgencyLevel = "CRITICAL";
    anomalyScore = Math.min(0.99, Number((0.75 + (ratioToBaseline - 2.5) * 0.05).toFixed(2)));
    reasons.push(
      `CRITICAL: Thermal emission (${frp} MW) is ${ratioToBaseline}x operational baseline (${baselineFrp} MW), exceeding safety threshold (2.5x).`,
      `Proximity Alert: Located only ${distanceMeters}m from ${facilityType} perimeter (<500m safety boundary).`,
      `High probability of catastrophic unconfined hydrocarbon fire or vessel rupture.`
    );
  } else if (isIndustrialFacility && distanceMeters < 1000) {
    if (ratioToBaseline > 1.8) {
      classification = "Abnormal Industrial Fire";
      urgencyLevel = "HIGH";
      anomalyScore = 0.72;
      reasons.push(
        `ELEVATED: Thermal emission is ${ratioToBaseline}x baseline within ${distanceMeters}m of ${facilityType}. Flaring abnormality detected.`
      );
    } else {
      classification = "Normal Industrial Flare";
      urgencyLevel = "NOMINAL";
      anomalyScore = Number((0.15 * ratioToBaseline).toFixed(2));
      reasons.push(
        `Regulated combustion: Flare emissions are consistent with standard operational venting (${ratioToBaseline}x baseline).`
      );
    }
  } else if (landCover.includes("Agricultural") || facilityType === "Rural Farmland") {
    classification = "Agricultural Burn";
    urgencyLevel = frp > 100 ? "ELEVATED" : "NOMINAL";
    anomalyScore = Number((0.2 + Math.min(0.4, frp / 300)).toFixed(2));
    reasons.push(
      `Open biomass stubble burning detected in cropland zone. Low structural hazard.`
    );
  } else if (landCover.includes("Forest") || facilityType === "Reserve Forest") {
    classification = "Wildfire";
    urgencyLevel = frp > 80 ? "HIGH" : "ELEVATED";
    anomalyScore = Number((0.4 + Math.min(0.5, frp / 250)).toFixed(2));
    reasons.push(
      `Canopy/vegetative wildfire detected in protected forest corridor.`
    );
  } else {
    // Default fallback
    if (ratioToBaseline > 2.5 && distanceMeters < 500) {
      classification = "Abnormal Industrial Fire";
      urgencyLevel = "CRITICAL";
      anomalyScore = 0.9;
    } else {
      classification = "Normal Industrial Flare";
      urgencyLevel = "NOMINAL";
      anomalyScore = 0.2;
    }
  }

  return {
    isCritical: isCriticalAnomaly,
    classification,
    anomalyScore,
    ratioToBaseline,
    urgencyLevel,
    reasons,
  };
}

export function processHotspotRecord(hotspot: Omit<HotspotRecord, "is_critical" | "ratio_to_baseline" | "anomaly_score" | "classification"> & {
  classification?: ThermalClassification;
}): HotspotRecord {
  const evalResult = evaluateThermalAnomaly(
    hotspot.frp,
    hotspot.baseline_frp,
    hotspot.nearest_facility.distance_m,
    hotspot.land_cover,
    hotspot.nearest_facility.type
  );

  return {
    ...hotspot,
    classification: hotspot.classification ?? evalResult.classification,
    is_critical: evalResult.isCritical,
    ratio_to_baseline: evalResult.ratioToBaseline,
    anomaly_score: evalResult.anomalyScore,
  };
}

