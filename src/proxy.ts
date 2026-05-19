import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
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
  "/api/orders",
  "_next",
  "favicon.ico",
];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith("/_next")
  );
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public routes
  if (isPublic(pathname)) return NextResponse.next();

  // For admin routes, verify the session cookie (Firebase ID token in cookie)
  const token = req.cookies.get("__session")?.value;

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Token verification happens in API routes via firebase-admin
  // Middleware just checks cookie presence for fast redirect
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)","/(api|trpc)(.*)"],
};
