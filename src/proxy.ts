import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isMaintenance = process.env.UNDER_MAINTENANCE === "true" || process.env.NEXT_PUBLIC_UNDER_MAINTENANCE === "true";

  if (isMaintenance) {
    if (pathname.startsWith("/api/")) {
      return new NextResponse(
        JSON.stringify({ error: "Service under maintenance", message: "Please try again later." }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }
    // Let the layout handle the frontend UI block, but we can also rewrite or do whatever
    // But since layout.tsx completely overwrites the DOM, we don't need a rewrite for frontend!
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
