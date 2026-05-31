import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_SESSION_SECRET = new TextEncoder().encode(
  process.env.ADMIN_SESSION_SECRET ?? "fallback-secret-change-in-production"
);

const PUBLIC_PATHS = [
  "/",
  "/sign-in",
  "/sign-up",
  "/admin-login",
  "/products",
  "/category",
  "/brand",
  "/search",
  "/flash-sale",
  "/cart",
  "/checkout",
  "/order-confirmed",
  "/about",
  "/contact",
  "/help",
  "/legal",
  "/faq",
  "/api/products",
  "/api/auth",
  "/api/cart",
  "/api/account",
  "/api/invoice",
  "/api/newsletter",
  "/api/admin/login",
  "/api/admin/logout",
  "_next",
  "favicon.ico",
];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) =>
      pathname === path ||
      pathname.startsWith(`${path}/`) ||
      pathname.startsWith("/_next")
  );
}

async function isValidAdminSession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("admin_jwt")?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, ADMIN_SESSION_SECRET);
    return true;
  } catch {
    return false;
  }
}

export const proxy = clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;

  // ── Admin routes ──────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    // Public admin pages
    if (pathname === "/admin-login" || pathname.startsWith("/api/admin/login") || pathname.startsWith("/api/admin/logout")) {
      return NextResponse.next();
    }

    // Verify signed admin JWT cookie
    const valid = await isValidAdminSession(req);
    if (!valid) {
      const res = NextResponse.redirect(new URL("/admin-login", req.url));
      res.cookies.delete("admin_jwt");
      return res;
    }

    return NextResponse.next();
  }

  // ── Public store routes ───────────────────────────────────────────────────
  if (isPublic(pathname)) return NextResponse.next();

  // ── Protected store routes — require Clerk auth ───────────────────────────
  const { userId } = await auth();
  if (!userId) {
    const loginUrl = new URL("/sign-in", req.url);
    loginUrl.searchParams.set("redirect_url", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
