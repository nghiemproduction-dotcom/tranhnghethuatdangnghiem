# Auth change: Google OAuth removed

Per request, Google OAuth login has been removed from the application.

Details
- Frontend:
  - `app/components/CongDangNhap/CongDangNhap.tsx` — Google login button removed and replaced with a message indicating it is disabled.
  - `components/auth/login-form.tsx` — Google login button removed.

- Backend:
  - `app/auth/callback/route.ts` — will no longer process OAuth codes and now redirects to `/login?message=google_disabled`.
  - `app/api/auth/staff-login/route.ts` — deprecated and returns HTTP 410.

Notes & Caveats
- If you later want an alternate non-OAuth staff sign-in method (e.g., email+phone with server session issuance), I can implement a secure server-side session creation flow.
- I can also add tests and a small migration note for operations teams.
