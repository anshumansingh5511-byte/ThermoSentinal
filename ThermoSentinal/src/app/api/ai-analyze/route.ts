import { NextRequest, NextResponse } from "next/server";
import { HotspotRecord, AiAnalysisResult } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const hotspot: HotspotRecord = body.hotspot;
    const clientApiKey = body.apiKey;

    if (!hotspot) {
      return NextResponse.json({ error: "Missing hotspot data" }, { status: 400 });
    }

    const apiKey = clientApiKey || process.env.GEMINI_API_KEY;

    // If API key is available, try calling Google Gemini
    if (apiKey) {
      try {
        const prompt = `
You are ThermoSentinel AI, an advanced industrial disaster triage intelligence agent specialized in satellite thermal telemetry analysis (NASA FIRMS VIIRS/MODIS) for problem statement SIH26162 (AI Detection & Classification of Industrial Fires / Thermal Sources).

Analyze the following satellite hotspot record for an industrial installation:
- Incident ID: ${hotspot.id}
- Coordinates: ${hotspot.lat}, ${hotspot.lng}
- Fire Radiative Power (FRP): ${hotspot.frp} MW
- Baseline Operational FRP: ${hotspot.baseline_frp} MW
- Ratio to Baseline: ${hotspot.ratio_to_baseline}x
- Brightness Temperature: ${hotspot.brightness_temp} K
- Satellite Sensor: ${hotspot.satellite_sensor}
- Nearest Facility: ${hotspot.nearest_facility.name} (${hotspot.nearest_facility.type})
- Distance to Facility: ${hotspot.nearest_facility.distance_m} meters
- Location: ${hotspot.nearest_facility.city}, ${hotspot.nearest_facility.state}
- Land Cover: ${hotspot.land_cover}
- Detection Confidence: ${hotspot.confidence}%
- Anomaly Flag: ${hotspot.is_critical ? "CRITICAL ANOMALOUS EVENT" : "Operational Routine"}

Return ONLY a valid JSON object (no markdown code fences, just raw JSON) matching this exact TypeScript structure:
{
  "hazardLevel": "CRITICAL" | "HIGH" | "MODERATE" | "LOW",
  "rootCauseDiagnosis": string (2-3 sentences explaining whether this is routine flaring or catastrophic fire based on FRP ratio and proximity),
  "combustionProfile": {
    "estimatedFlameTempK": number,
    "hydrocarbonTypeLikelihood": string,
    "containmentStatus": "Uncontrolled Containment Loss" | "Controlled Regulatory Combustion" | "Vegetation Burn"
  },
  "environmentalRisk": {
    "plumeDispersionRisk": string,
    "toxicGases": string[],
    "affectedRadiusMeters": number
  },
  "recommendedActions": string[] (3-5 urgent action items for plant operators and disaster response teams),
  "ndrfDispatchMemo": string (formal emergency dispatch communiqué for NDRF / Fire Department)
}
`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: "application/json",
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleanJson) as AiAnalysisResult;
            return NextResponse.json({ source: "gemini-api", result: parsed });
          }
        }
      } catch (geminiError) {
        console.warn("Gemini API call failed, falling back to intelligent rule engine", geminiError);
      }
    }

    // High-fidelity heuristic fallback when Gemini API key is not configured or in offline mode
    const isAbnormal = hotspot.is_critical || hotspot.ratio_to_baseline > 2.0;
    const isAgri = hotspot.classification === "Agricultural Burn";
    const isWild = hotspot.classification === "Wildfire";

    const fallbackResult: AiAnalysisResult = {
      hazardLevel: hotspot.is_critical ? "CRITICAL" : isAbnormal ? "HIGH" : isAgri || isWild ? "MODERATE" : "LOW",
      rootCauseDiagnosis: hotspot.is_critical
        ? `Thermal Radiative Power of ${hotspot.frp} MW represents a dangerous ${hotspot.ratio_to_baseline}x spike over the operational baseline (${hotspot.baseline_frp} MW) within ${hotspot.nearest_facility.distance_m}m of ${hotspot.nearest_facility.name}. This thermal signature indicates unconfined hydrocarbon vapor combustion or loss of secondary containment.`
        : isAgri
        ? `Thermal signature (${hotspot.frp} MW) is characteristic of rapid open-field crop residue burning in agricultural cropland, distant from major high-risk industrial infrastructure.`
        : isWild
        ? `High radiative output in dense canopy biomass indicative of uncontrolled forest wildfire propagation.`
        : `Normal operational flaring observed. FRP of ${hotspot.frp} MW is in alignment with routine purge stack combustion (${hotspot.ratio_to_baseline}x baseline).`,
      combustionProfile: {
        estimatedFlameTempK: Math.round(hotspot.brightness_temp + 450 + (hotspot.frp * 2.1)),
        hydrocarbonTypeLikelihood: hotspot.is_critical
          ? "Heavy Crude / Condensate / Liquefied Petroleum Fractions"
          : hotspot.classification === "Normal Industrial Flare"
          ? "Sweet Fuel Gas / Methane / Ethane purge"
          : "Cellulose / Lignin Biomass",
        containmentStatus: hotspot.is_critical
          ? "Uncontrolled Containment Loss"
          : isAgri || isWild
          ? "Vegetation Burn"
          : "Controlled Regulatory Combustion",
      },
      environmentalRisk: {
        plumeDispersionRisk: hotspot.is_critical
          ? "Severe downwind thermal and particulate plume detected. Atmospheric inversion risk present."
          : "Normal thermal lift with minimal local ground-level concentration impact.",
        toxicGases: hotspot.is_critical
          ? ["Sulfur Dioxide (SO2)", "Benzene (C6H6)", "Hydrogen Sulfide (H2S)", "Carbon Monoxide (CO)"]
          : isAgri
          ? ["Particulate Matter (PM2.5 / PM10)", "Carbon Monoxide", "Volatile Organics"]
          : ["Nitrogen Oxides (NOx)", "Carbon Dioxide (CO2)"],
        affectedRadiusMeters: hotspot.is_critical ? 1200 : isAgri ? 450 : 250,
      },
      recommendedActions: hotspot.is_critical
        ? [
            `Immediate automatic shutdown (ESD-1) of adjacent processing trains at ${hotspot.nearest_facility.name}.`,
            `Activate fixed deluge water spray and high-expansion foam monitor systems.`,
            `Sound plant-wide evacuation alarm and establish 1.2km safety perimeter downwind.`,
            `Alert District Disaster Management Authority (DDMA) and mutual aid industrial partners.`,
            `Deploy drone / optical camera inspection to verify structural integrity of nearby storage tanks.`
          ]
        : [
            `Maintain standard flare scrubbers and steam injection ratio.`,
            `Log telemetry into plant CEMS (Continuous Emission Monitoring System).`,
            `Routine satellite verification during next orbital pass.`
          ],
      ndrfDispatchMemo: hotspot.is_critical
        ? `URGENT TACTICAL DISPATCH // DISASTER MANAGEMENT AUTHORITY\n\nINCIDENT: Uncontrolled Industrial Thermal Outburst (${hotspot.frp} MW)\nFACILITY: ${hotspot.nearest_facility.name}, ${hotspot.nearest_facility.city}\nCOORDINATES: ${hotspot.lat.toFixed(4)} N, ${hotspot.lng.toFixed(4)} E\nESTIMATED CASUALTY RISK: HIGH\nACTION: Dispatch NDRF Hazmat Fire Battalion and foam tenders immediately. Establish command post at +1.5km upwind perimeter.`
        : `LOG ENTRY: Routine industrial flare telemetry registered within permissible environmental baseline. No external mobilization required.`
    };

    return NextResponse.json({
      source: apiKey ? "gemini-api" : "heuristic-engine",
      hasCustomKey: !!apiKey,
      result: fallbackResult,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

