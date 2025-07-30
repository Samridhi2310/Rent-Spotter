import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({
    req,
    secret: process.env.NEXT_PUBLIC_AUTH_SECRET, // ✅ Use NEXT_PUBLIC_AUTH_SECRET (not NEXTNEXT_PUBLIC_AUTH_SECRET in v5)
  });
  console.log("Middleware is running")
  const { pathname } = req.nextUrl;

  // If no token, redirect to signin
  if (!token) {

    return NextResponse.redirect(new URL("/signin", req.url));
  }
    // Restrict access to /dashboard/addPgDetail for role 'user'
    if (pathname.startsWith("/dashboard/addPgDetail") && token.role === "user") {
      return NextResponse.redirect(new URL("/dashboard", req.url)); // Or show 403 page
    }
    // Restrict access to /dashboard/addPgDetail for role 'user'
    if (pathname.startsWith("/dashboard/manageBookings") && token.role === "user") {
      return NextResponse.redirect(new URL("/dashboard", req.url)); // Or show 403 page
    }
    // Restrict access to /dashboard/addPgDetail for role 'user'
    if (pathname.startsWith("/dashboard/showPgDetails") && token.role === "user") {
      return NextResponse.redirect(new URL("/dashboard", req.url)); // Or show 403 page
    }
   // Restrict access to /dashboard/addPgDetail for role 'user'
   if (pathname.startsWith("/dashboard/showComplaints") && token.role === "user") {
    return NextResponse.redirect(new URL("/dashboard", req.url)); // Or show 403 page
  }
  

  return NextResponse.next();
}

// Run middleware only on these routes
export const config = {
  matcher: ["/dashboard/:path*"],
};


