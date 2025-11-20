import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// API permissions
const API_PERMISSIONS = {
  "/api/productApi": ["manage_products"],
  "/api/AdminusersApi": ["manage_users"],
  "/api/ordersApi": ["manage_orders"],
  "/api/blogsApi": ["manage_blogs"],
  "/api/reviewsApi": ["manage_users"],
  "/api/promocodeApi": ["manage_products"],
};

// Page permissions (static + dynamic with regex)
const PAGE_ROUTES = [
  { pattern: /^\/admin$/, perms: ["manage_users", "manage_products", "manage_orders"] },
  { pattern: /^\/products$/, perms: ["manage_products"] },
  { pattern: /^\/users$/, perms: ["manage_users"] },
  { pattern: /^\/orders$/, perms: ["manage_orders"] },
  { pattern: /^\/promocode$/, perms: ["manage_products"] },
  { pattern: /^\/[^/]+\/addUser$/, perms: ["create_users", "manage_users"] },
  { pattern: /^\/products\/[^/]+\/edit$/, perms: ["edit_products", "manage_products"] },
  { pattern: /^\/blogs\/[^/]+\/editor$/, perms: ["edit_blogs", "manage_blogs"] },
];

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // ----------- ALLOW EXTERNAL API REQUESTS -----------
  const allowedExternalDomains = [
    "https://riyoraorganic.com",
    "https://www.riyoraorganic.com",
    "https://riyora-organic.vercel.app",
    "http://localhost:3000/"
    // "http://www.riyoraorganic.com",
  ];

  if (pathname.startsWith("/api/external")) {
    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");

    const isAllowedOrigin =
      allowedExternalDomains.includes(origin) ||
      allowedExternalDomains.some((domain) => referer?.startsWith(domain));

    if (isAllowedOrigin) {
      return NextResponse.next(); // allow request
    }

    return new NextResponse(
      JSON.stringify({ error: "Forbidden: external domain not allowed" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // ----------- PUBLIC ROUTES -----------
  if (
    pathname.startsWith("/api/auth") ||
    pathname === "/authenticate" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/images")
  ) {
    return NextResponse.next();
  }

  // ----------- AUTH CHECK -----------
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const loginUrl = new URL("/authenticate", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ----------- API PROTECTION -----------
  if (pathname.startsWith("/api")) {
    for (const [apiPath, requiredPerms] of Object.entries(API_PERMISSIONS)) {
      if (pathname.startsWith(apiPath)) {
        const hasPermission = requiredPerms.every((perm) =>
          token.permissions?.includes(perm)
        );
        if (!hasPermission) {
          return new NextResponse(
            JSON.stringify({ error: "Forbidden: insufficient permissions" }),
            { status: 403, headers: { "Content-Type": "application/json" } }
          );
        }
      }
    }
  } else {
    // ----------- PAGE PROTECTION -----------
    for (const route of PAGE_ROUTES) {
      if (route.pattern.test(pathname)) {
        const hasPermission = route.perms.every((perm) =>
          token.permissions?.includes(perm)
        );
        if (!hasPermission) {
          return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
