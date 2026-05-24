import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/products(.*)",
  "/category(.*)",
  "/search(.*)",
  "/flash-sale(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/products(.*)",
  "/api/orders(.*)",
  "/api/newsletter(.*)",
  "/api/auth/login(.*)",
  "/api/auth/sync(.*)",
]);

// Define admin routes that require admin role
const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
  "/api/admin(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect admin routes
  if (isAdminRoute(req)) {
    await auth.protect();
  }

  // Protect account routes
  if (req.nextUrl.pathname.startsWith("/account")) {
    await auth.protect();
  }

  if (req.nextUrl.pathname.startsWith("/checkout")) {
    await auth.protect();
  }

  if (req.nextUrl.pathname.startsWith("/cart")) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
