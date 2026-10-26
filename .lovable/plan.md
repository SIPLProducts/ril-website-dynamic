# Logo, tooltips, login poster, and Email Configuration screen

## What changes
1. **Admin logo** in the top bar and sidebar: shown in all-white so it reads cleanly on the teal-green bar. The colour logo stays on login, dashboard and popups.
2. **Hover tooltips** match their button: red-orange for Delete, blue for Edit, dark teal for everything else (no more brand-blue). No button flashes blue on hover.
3. **Login poster**:
   - Full view: the poster is stretched to fill the whole screen edge to edge (nothing cut, slightly squashed on wide screens).
   - Split view: the poster fills the whole left 60% the same way, with no white or blurred sides.
4. **New "Email Configuration" screen** under User Management (Super Admin only), like your screenshot:
   - Enable sending switch, SMTP host, port, encryption (TLS 587 / SSL 465), username, app password (hidden; leave empty to keep the saved one), From email, From name, CC recipients (chips)
   - "Send test to" box with a Send Test Email button, and Save Configuration
5. **Login OTP and Forgot-password emails are sent through this account** (for example from ramky.vyapaar@ramky.com) instead of the built-in sender, using Ramky-branded emails. If sending is switched off or not set up, the built-in sender is used so login never breaks.

## What you need to provide
- The SMTP details (for Gmail: a Google "App password", not the normal password). You enter them on the new screen after this is built.

## Technical details
- `AdminShell.tsx`: `brightness-0 invert` on the nav/sidebar logo images.
- `ui/tooltip.tsx` default bg changes to an admin teal token; `IconAction` passes `btn-grad-danger` / `btn-grad-edit` to `TooltipContent`. Gradient buttons get `hover:bg-transparent`.
- `NeuAuth.tsx`: poster `object-fill w-full h-full` in both modes; remove the blurred fill layer.
- Migration: `email_settings` single-row table (enabled, host, port, secure, username, password, from_email, from_name, cc text[]), GRANT to authenticated/service_role, RLS: super admin only. Password is never sent back to the browser (server function returns `hasPassword`).
- `src/lib/email-settings.functions.ts`: get/save (super admin), `sendTestEmail`, and public `sendLoginOtp` / `sendPasswordReset`.
  - OTP: after the password check, server uses `auth.admin.generateLink({ type: "magiclink" })` to get the 6-digit `email_otp` and emails it via SMTP; the client still verifies with `verifyOtp` (no custom code storage).
  - Reset: `generateLink({ type: "recovery", redirectTo: /admin/reset-password })` and email the link. Only sent for existing active staff; the response is always the same to avoid revealing which emails exist.
  - SMTP sent from the worker with `worker-mailer` (works on the Cloudflare runtime); falls back to the current `signInWithOtp` / `resetPasswordForEmail` when disabled.
- New route `src/routes/admin.email-settings.tsx` plus a "Email Configuration" entry in the User Management menu (both layouts).
- Test for the fallback rule (disabled or incomplete settings means built-in sender).
