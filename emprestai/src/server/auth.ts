import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { getAuthEnv } from "./env";

export interface AuthCookieStore {
  getAll(): { name: string; value: string }[];
  set(name: string, value: string, options: CookieOptions): void;
}

export function authCookieOptions(options: CookieOptions = {}, production = process.env.NODE_ENV === "production"): CookieOptions {
  return { ...options, httpOnly: true, secure: production, sameSite: "lax", path: "/" };
}

export function createAuthClient(store: AuthCookieStore) {
  const env = getAuthEnv();
  return createServerClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (cookies) => {
        for (const cookie of cookies) store.set(cookie.name, cookie.value, authCookieOptions(cookie.options));
      },
    },
  });
}

export type SessionClient = Pick<SupabaseClient["auth"], "getUser">;

export async function resolveSession(auth: SessionClient) {
  try {
    const { data, error } = await auth.getUser();
    return error || !data.user ? null : { userId: data.user.id, email: data.user.email ?? null };
  } catch {
    return null;
  }
}

/** Call before returning the proxy response so refreshed cookies are preserved. */
export async function refreshAuthSession(request: NextRequest, response: NextResponse) {
  // Demo/public deployment can still build before Auth environment is provisioned.
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_PUBLISHABLE_KEY) return null;
  const client = createAuthClient({
    getAll: () => request.cookies.getAll(),
    set: (name, value, options) => {
      request.cookies.set(name, value);
      response.cookies.set(name, value, options);
    },
  });
  return resolveSession(client.auth);
}
