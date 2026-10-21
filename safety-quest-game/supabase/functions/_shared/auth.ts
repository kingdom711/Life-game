// Shared bearer-token validation for Edge Functions.
//
// `withSupabase({ auth: "user" })` does not populate `ctx.userClaims` for
// modern publishable-key sessions: their access tokens are signed with the
// project's asymmetric key (ES256), and the wrapper leaves the claim unset.
// Functions that treated the missing claim as "anonymous" therefore rejected
// every real request with 401, so the bearer token is validated against
// GoTrue explicitly instead.
//
// Note this is *not* a gateway problem. `verify_jwt = true` accepts ES256
// session tokens; it is only the wrapper claim that is missing.

type AdminAuthContext = {
  supabaseAdmin: {
    auth: {
      getUser: (jwt: string) => Promise<{
        data: { user: { id: string } | null };
        error: unknown;
      }>;
    };
  };
};

/**
 * Resolves the caller's user id from the Authorization header.
 * Returns null when the header is absent or the token is not valid.
 */
export async function resolveUserId(req: Request, ctx: AdminAuthContext): Promise<string | null> {
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (!bearer) return null;

  const { data, error } = await ctx.supabaseAdmin.auth.getUser(bearer);
  if (error) return null;

  return data.user?.id ?? null;
}
