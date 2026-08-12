/**
 * Local-only authentication bypass.
 *
 * Google sign-in is brokered by Lovable's hosted infrastructure and the Supabase
 * Google provider has no client credentials of its own, so neither path works on
 * localhost. This lets the command center be opened and reviewed while that is
 * still being configured.
 *
 * Two independent guards, because an auth bypass that escapes into a deployed
 * build is a full account takeover for anyone who finds the URL:
 *
 *  1. `import.meta.env.DEV` is false in every production build, so `npm run
 *     build` strips this to a constant false and the branch is dead code.
 *  2. The flag lives in `.env.local`, which is gitignored, so it is not carried
 *     to Lovable even by accident.
 *
 * Neither guard alone would be enough — .env in this repo is tracked, and a DEV
 * check alone would still leave the door open to anyone running a dev server.
 *
 * Delete this file and its three call sites once Google sign-in is configured.
 */
export const DEV_AUTH_BYPASS =
  import.meta.env.DEV && import.meta.env["VITE_DEV_AUTH_BYPASS"] === "true";

/** Stable synthetic id so rows keyed on the user do not churn between reloads. */
export const DEV_USER_ID = "00000000-0000-4000-8000-0000000000de";
export const DEV_USER_EMAIL = "dev.bypass@Kaya.local";
export const DEV_USER_NAME = "Dev Bypass";
