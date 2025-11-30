// lib/appwrite/server.ts
// Server-side Appwrite clients for Next.js SSR

import { Client, Account, Databases, Users } from "node-appwrite";
import { cookies } from "next/headers";

const SESSION_COOKIE = "session";

/**
 * Admin client - for server-to-server operations
 * Use for: creating users, creating sessions, admin operations
 *
 * Requires APPWRITE_API_KEY environment variable
 */
export async function createAdminClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
    get users() {
      return new Users(client);
    },
  };
}

/**
 * Session client - for authenticated user operations
 * THROWS if no valid session cookie - use with verifySession() or try/catch
 *
 * Uses the session cookie set after login
 */
export async function createSessionClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);

  if (!session?.value) {
    throw new Error("No session cookie");
  }

  client.setSession(session.value);

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
  };
}

/**
 * Set session cookie after login/register
 * Uses httpOnly, secure, and strict sameSite for security
 */
export async function setSessionCookie(secret: string, expires: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, secret, {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(expires),
  });
}

/**
 * Delete session cookie - used for logout
 */
export async function deleteSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
