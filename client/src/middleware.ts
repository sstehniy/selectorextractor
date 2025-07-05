import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const theme = request.cookies.get("theme")?.value || "";
  if (theme) {
    response.headers.set("x-theme", theme);
  }
  return response;
}

export const config = {
  matcher: "/",
};
