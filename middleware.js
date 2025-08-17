// middleware.js
import { NextResponse } from "next/server";


// Define which routes should be protected
const protectedRoutes = ["/dashboard", "/profile", "/settings"];

export async function middleware(req) {
    const { pathname } = req.nextUrl;

    // Check if the current path is a protected route
    if (protectedRoutes.some((route) => pathname.startsWith(route))) {
        const token = req.cookies.get("auth-token")?.value; // Use HttpOnly cookie for security

        if (!token) {
            // If no token, redirect to login
            const loginUrl = new URL("/login", req.url);
            loginUrl.searchParams.set("redirect", pathname); // so user goes back after login
            return NextResponse.redirect(loginUrl);
        }

        try {
            // Optional: verify JWT token here
            // Example using jose library:
            // const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
            // if (!payload) throw new Error("Invalid token");

            return NextResponse.next(); // Allow request
        } catch (err) {
            console.error("Auth error:", err);
            const loginUrl = new URL("/login", req.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next(); // Allow non-protected routes
}

// Apply middleware only to specific routes
export const config = {
    matcher: ["/dashboard/:path*", "/profile/:path*", "/settings/:path*"],
};
