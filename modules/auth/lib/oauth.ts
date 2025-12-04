// modules/auth/lib/oauth.ts
// OAuth authentication helpers for Google and Facebook

import { account } from "@/lib/appwrite/client";
import { OAuthProvider } from "appwrite";

/**
 * Initiate Google OAuth sign-in
 * Redirects user to Google's consent screen
 */
export function signInWithGoogle() {
  const successUrl = `${window.location.origin}/auth/oauth/callback`;
  const failureUrl = `${window.location.origin}/auth/login?error=oauth_failed`;

  account.createOAuth2Session(
    OAuthProvider.Google,
    successUrl,
    failureUrl,
    ["email", "profile"]
  );
}

/**
 * Initiate Facebook OAuth sign-in
 * Redirects user to Facebook's consent screen
 */
export function signInWithFacebook() {
  const successUrl = `${window.location.origin}/auth/oauth/callback`;
  const failureUrl = `${window.location.origin}/auth/login?error=oauth_failed`;

  account.createOAuth2Session(
    OAuthProvider.Facebook,
    successUrl,
    failureUrl,
    ["email", "public_profile"]
  );
}
