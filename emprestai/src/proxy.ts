import { NextResponse, type NextRequest } from "next/server";
import { refreshAuthSession } from "@/server/auth";

export async function proxy(request: NextRequest) {
  const refreshed = NextResponse.next();
  await refreshAuthSession(request, refreshed);
  if (process.env.NODE_ENV !== "production") {
    const response = NextResponse.next({ request: { headers: new Headers(request.headers) } });
    for (const cookie of refreshed.cookies.getAll()) response.cookies.set(cookie);
    return response;
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const policy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' data: blob: https://zvemdkmoagksupyyosuk.supabase.co",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", policy);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  for (const cookie of refreshed.cookies.getAll()) response.cookies.set(cookie);
  response.headers.set("Content-Security-Policy", policy);
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
