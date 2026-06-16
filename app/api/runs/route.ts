import { NextResponse } from "next/server";
import { listRuns, isMockMode } from "@/lib/n8n";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") || 30);
  try {
    const runs = await listRuns(Number.isFinite(limit) ? limit : 30);
    return NextResponse.json({ mock: isMockMode(), count: runs.length, runs });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to load runs", mock: isMockMode() },
      { status: 502 }
    );
  }
}
