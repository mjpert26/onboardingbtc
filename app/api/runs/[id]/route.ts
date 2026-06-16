import { NextResponse } from "next/server";
import { getRun, isMockMode } from "@/lib/n8n";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const run = await getRun(params.id);
    if (!run) {
      return NextResponse.json({ error: "Run not found", mock: isMockMode() }, { status: 404 });
    }
    return NextResponse.json({ mock: isMockMode(), run });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to load run", mock: isMockMode() },
      { status: 502 }
    );
  }
}
