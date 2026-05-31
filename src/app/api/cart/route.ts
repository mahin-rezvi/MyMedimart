export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { cartRepo, productsRepo } from "@/lib/db/repositories";
import { getCurrentDbUser } from "@/lib/server-auth";

async function getUserOrResponse() {
  const user = await getCurrentDbUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  return user;
}

export async function GET() {
  try {
    const user = await getUserOrResponse();
    if (user instanceof NextResponse) return user;

    const cart = await cartRepo.getByUserId(user.id);
    return NextResponse.json({ cart, source: "neon" });
  } catch (error) {
    console.error("Cart GET error:", error);
    return NextResponse.json({ error: "Failed to load cart" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserOrResponse();
    if (user instanceof NextResponse) return user;

    const body = await req.json();
    let item = {
      productId: body.productId ?? body.id ?? null,
      name: String(body.name ?? ""),
      variant: body.variant ? String(body.variant) : null,
      quantity: Math.max(1, Number(body.quantity ?? body.qty ?? 1)),
      price: Number(body.price ?? body.discountPrice ?? 0),
      imageUrl: body.imageUrl ?? body.image_url ?? body.images?.[0] ?? null,
    };

    if (item.productId) {
      const product = await productsRepo.getBySlugOrId(String(item.productId));
      if (product) {
        item = {
          ...item,
          productId: product.id,
          name: product.name,
          price: Number(product.discountPrice ?? product.price),
          imageUrl: product.images?.[0] ?? item.imageUrl,
        };
      } else {
        item.productId = null;
      }
    }

    if (!item.name || !Number.isFinite(item.price) || item.price <= 0) {
      return NextResponse.json({ error: "Valid product details are required" }, { status: 400 });
    }

    const cart = await cartRepo.addItem(user.id, item);
    return NextResponse.json({ cart, source: "neon" }, { status: 201 });
  } catch (error) {
    console.error("Cart POST error:", error);
    return NextResponse.json({ error: "Failed to add item to cart" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUserOrResponse();
    if (user instanceof NextResponse) return user;

    const body = await req.json();
    if (!body.itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    const cart = await cartRepo.updateItem(user.id, String(body.itemId), Number(body.quantity ?? 1));
    return NextResponse.json({ cart, source: "neon" });
  } catch (error) {
    console.error("Cart PATCH error:", error);
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserOrResponse();
    if (user instanceof NextResponse) return user;

    const { searchParams } = new URL(req.url);
    const clear = searchParams.get("clear") === "true";
    const itemId = searchParams.get("itemId");

    if (clear) {
      const cart = await cartRepo.clear(user.id);
      return NextResponse.json({ cart, source: "neon" });
    }

    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    const cart = await cartRepo.removeItem(user.id, itemId);
    return NextResponse.json({ cart, source: "neon" });
  } catch (error) {
    console.error("Cart DELETE error:", error);
    return NextResponse.json({ error: "Failed to remove cart item" }, { status: 500 });
  }
}
