import { NextRequest, NextResponse } from "next/server";
import { fetchLiveNasaFirmsHotspots } from "@/lib/nasaFirmsService";
import { ThermalClassification } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const classificationParam = searchParams.get("classification");
  const minFrpParam = searchParams.get("min_frp");
  const sensorParam = searchParams.get("sensor");
  const searchParam = searchParams.get("search");
  const refreshParam = searchParams.get("refresh") === "true";

  try {
    // Fetch 100% authentic NASA FIRMS satellite data (today's flyby or most recent flyby)
    const { source, dayRange, data: rawHotspots, satellites } = await fetchLiveNasaFirmsHotspots(
      refreshParam
    );

    let hotspots = [...rawHotspots];

    // Filter by classification
    if (classificationParam && classificationParam !== "ALL") {
      const allowed = classificationParam.split(",") as ThermalClassification[];
      hotspots = hotspots.filter((h) => allowed.includes(h.classification));
    }

    // Filter by minimum FRP threshold
    if (minFrpParam) {
      const minFrp = parseFloat(minFrpParam);
      if (!isNaN(minFrp)) {
        hotspots = hotspots.filter((h) => h.frp >= minFrp);
      }
    }

    // Filter by satellite sensor
    if (sensorParam && sensorParam !== "ALL") {
      hotspots = hotspots.filter((h) => h.satellite_sensor.startsWith(sensorParam));
    }

    // Search filter
    if (searchParam) {
      const q = searchParam.toLowerCase();
      hotspots = hotspots.filter(
        (h) =>
          h.id.toLowerCase().includes(q) ||
          h.nearest_facility.name.toLowerCase().includes(q) ||
          h.nearest_facility.city.toLowerCase().includes(q) ||
          h.nearest_facility.state.toLowerCase().includes(q) ||
          h.classification.toLowerCase().includes(q)
      );
    }

    const summary = {
      totalHotspots: hotspots.length,
      criticalAnomalies: hotspots.filter((h) => h.is_critical).length,
      normalFlares: hotspots.filter((h) => h.classification === "Normal Industrial Flare").length,
      agriculturalBurns: hotspots.filter((h) => h.classification === "Agricultural Burn").length,
      wildfires: hotspots.filter((h) => h.classification === "Wildfire").length,
      avgFrp: hotspots.length
        ? Number((hotspots.reduce((acc, h) => acc + h.frp, 0) / hotspots.length).toFixed(1))
        : 0,
      maxFrp: hotspots.length ? Math.max(...hotspots.map((h) => h.frp)) : 0,
    };

    return NextResponse.json({
      status: "success",
      source_feed: "NASA FIRMS Near Real-Time (VIIRS SNPP & NOAA-20)",
      satellites,
      data_mode: dayRange === 1 ? "Today's Orbit Overpass" : "Recent Flyby (Past 48 Hours)",
      cache_status: source,
      timestamp: new Date().toISOString(),
      summary,
      data: hotspots,
    });
  } catch (error: any) {
    console.error("Failed to query NASA FIRMS:", error);
    return NextResponse.json(
      { error: "Failed to fetch live NASA satellite data", details: error?.message, data: [] },
      { status: 500 }
    );
  }
}
