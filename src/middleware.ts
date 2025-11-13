import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

const MOBILE_DOWNLOAD_PATH = "/mobile-download";
const MOBILE_USER_AGENT_REGEX =
  /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;

function shouldRedirectToMobileDownload(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith(MOBILE_DOWNLOAD_PATH) ||
    pathname.startsWith("/api")
  ) {
    return false;
  }

  const userAgent = request.headers.get("user-agent") ?? "";
  return MOBILE_USER_AGENT_REGEX.test(userAgent);
}

export async function middleware(request: NextRequest) {
  try {
    if (shouldRedirectToMobileDownload(request)) {
      const redirectUrl = new URL(MOBILE_DOWNLOAD_PATH, request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Ensure request.url is a valid URL
    if (!request.url || !request.url.startsWith('http')) {
      console.error('Invalid request URL:', request.url);
      return NextResponse.next();
    }

    return await auth0.middleware(request);
  } catch (error) {
    console.error('Auth0 middleware error:', error);
    // If Auth0 middleware fails, continue without authentication
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};