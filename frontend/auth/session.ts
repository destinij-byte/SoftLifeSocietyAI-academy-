/**
 * Placeholder. Delete this file and import from the real SLS app auth
 * module instead — Academy reuses the existing session, it doesn't manage
 * its own token storage or user profile.
 */
export async function getAuthToken(): Promise<string | null> {
  throw new Error("Wire getAuthToken() to the existing SLS auth session module.");
}

export interface CurrentUserProfile {
  name: string;
  email: string;
}

/** Used for the certificate screen's "this certifies ___" line and the
 * Home screen's avatar initial. Wire to the app's real user/profile
 * context rather than fetching it here. */
export async function getCurrentUserProfile(): Promise<CurrentUserProfile | null> {
  throw new Error("Wire getCurrentUserProfile() to the existing SLS user/profile context.");
}
