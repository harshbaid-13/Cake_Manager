import { getDashboardMetrics } from "@/lib/calculations";
import { NextResponse } from "next/server";

export async function GET() {
  const metrics = await getDashboardMetrics();
  return NextResponse.json(metrics);
}


