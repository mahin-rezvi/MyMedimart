export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  return NextResponse.json({ imported: 0, errors: ["Database disabled"], total: 0 }, { status: 503 });
}
