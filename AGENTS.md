# Kaya AI Dashboard — Agent Guidelines

## Repository rules

- Do **not** force-push, rebase, amend, or squash commits that have already been pushed.  
  Rewriting published history breaks collaborator clones and CI integrations.
- Always push feature work to a new branch and open a pull request; never commit directly to `main`.
- Keep the default branch in a deployable state at all times.

## Code style

- TypeScript strict mode is on — no `any`, no `ts-ignore` without a comment explaining why.
- All React components use named exports; no default exports for components.
- Tailwind utility classes only — no inline `style` props unless strictly necessary.
- Use `cn()` from `@/lib/utils` for conditional class merging.

## Environment variables

- Never commit `.env`, `.env.local`, or any file containing real secrets.
- Client-side env vars must be prefixed `VITE_`; server-side vars live in `.env` only.
- See `.env.example` for the full list of required variables.

## Data layer

- All live data flows through `useLiveData()` in `src/lib/live-store.ts`.
- Do **not** invent placeholder numbers in the UI — show a dash or skeleton when data is unavailable.
- Supabase Realtime subscriptions are opened in `live-store.ts`; do not add new channels elsewhere.

## Auth & roles

- Auth state lives in `AuthProvider` (`src/components/auth-context.tsx`).
- Role-gating uses `useRole()` / `isAdmin` from `src/components/role-context.tsx`.
- The dev-auth bypass (`DEV_AUTH_BYPASS`) is `.env.local`-only and must never reach production.
