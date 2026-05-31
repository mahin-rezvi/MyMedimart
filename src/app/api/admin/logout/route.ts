import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("admin_jwt");
  // Also clear the old cookie name in case it exists
  response.cookies.delete("admin_session");
  return response;
}
