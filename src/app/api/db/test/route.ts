import { NextResponse } from "next/server";
import { query } from "@/lib/db/postgres";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Test basic connection
    const result = await query<{ version: string }>("SELECT version()");
    
    // Test table queries
    const categories = await query<{ count: string }>("SELECT COUNT(*) as count FROM categories");
    const products = await query<{ count: string }>("SELECT COUNT(*) as count FROM products");
    const users = await query<{ count: string }>("SELECT COUNT(*) as count FROM users");
    const orders = await query<{ count: string }>("SELECT COUNT(*) as count FROM orders");

    return NextResponse.json(
      {
        status: "connected",
        database: "Neon PostgreSQL",
        version: result.rows[0]?.version,
        tables: {
          categories: parseInt(categories.rows[0]?.count || "0", 10),
          products: parseInt(products.rows[0]?.count || "0", 10),
          users: parseInt(users.rows[0]?.count || "0", 10),
          orders: parseInt(orders.rows[0]?.count || "0", 10),
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database connection test failed:", error);
    return NextResponse.json(
      {
        status: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
