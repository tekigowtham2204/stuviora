/**
 * Monthly GMV time series per college (M7.1).
 * Demo path returns a synthetic series from the platformMetrics.
 */

import { NextResponse } from "next/server";
import * as demo from "@/lib/demo/data";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const college = searchParams.get("college");

  // Demo: aggregate the last-14-days revenue from platformMetrics.
  const total = demo.platformMetrics.dailyRevenue.reduce((s, d) => s + d.amount, 0);
  const monthly = [
    { month: "Apr 2026", gmv: Math.round(total * 0.3) },
    { month: "May 2026", gmv: Math.round(total * 0.45) },
    { month: "Jun 2026", gmv: Math.round(total * 0.25) },
  ];

  return NextResponse.json({
    college: college ?? "all",
    monthly,
    asOf: new Date().toISOString(),
  });
}
