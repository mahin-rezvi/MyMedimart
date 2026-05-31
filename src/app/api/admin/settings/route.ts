export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { siteSettingsRepo } from "@/lib/db/repositories";
import { verifyAdminJwt } from "@/lib/admin-jwt";

const DEFAULT_STORE_SETTINGS = {
  storeName: "MediMart",
  storeEmail: "info@medimart.com",
  storePhone: "01781452943",
  storeAddress: "Dhaka, Bangladesh",
  currency: "BDT",
  currencySymbol: "৳",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  freeShippingThreshold: 1000,
  standardShippingCost: 80,
};

export async function GET() {
  try {
    await verifyAdminJwt();
    const settings = await siteSettingsRepo.get("store", DEFAULT_STORE_SETTINGS);
    return NextResponse.json({ settings, source: "neon" });
  } catch (error) {
    console.error("Admin settings GET error:", error);
    const message = error instanceof Error ? error.message : "Failed to load settings";
    const status = message.includes("Unauthorized") || message.includes("admin session") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await verifyAdminJwt();
    const body = await req.json();
    const settings = await siteSettingsRepo.set("store", {
      ...DEFAULT_STORE_SETTINGS,
      ...body,
      freeShippingThreshold: Number(body.freeShippingThreshold ?? DEFAULT_STORE_SETTINGS.freeShippingThreshold),
      standardShippingCost: Number(body.standardShippingCost ?? DEFAULT_STORE_SETTINGS.standardShippingCost),
    });
    return NextResponse.json({ settings, source: "neon" });
  } catch (error) {
    console.error("Admin settings PATCH error:", error);
    const message = error instanceof Error ? error.message : "Failed to save settings";
    const status = message.includes("Unauthorized") || message.includes("admin session") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
