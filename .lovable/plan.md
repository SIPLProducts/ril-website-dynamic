# Admin login redesign, roles, account management and email OTP

## What you get
1. **New login page at /admin/login**, matching your reference: a soft light-grey "raised" style with a large round card, a faint Ramky logo watermark behind it, the title "Login / Sign in to your account", an Email field with a user icon, a Password field with a lock icon, a show/hide password eye, a "Forgot password?" link and a SIGN IN button.
   - The reference's "Sign up" link is left out, because only a Super Admin creates accounts.
2. **Two roles only**:
   - **Super Admin**: edits all Investor content and also manages admin accounts.
   - **Admin**: edits Investor content only.
   - The public website stays open to everyone with no login.
3. **"Users" page in the admin portal (Super Admin only)**, using the same visual style. The create form has:
   - Full name (required)
   - Valid email (format checked)
   - Mobile number (10 digits, India format)
   - Password and Confirm password (minimum 8 characters, must match)
   - Role: Admin or Super Admin
   - **"Require OTP verification"** checkbox
   - **Status**: Active or Inactive
   - The list shows each account's name, email, number, role, OTP on/off and status, with Edit, Reset password and Activate/Deactivate actions.
4. **How sign-in works**:
   - Wrong password: shows "Invalid email or password".
   - Inactive account: blocked, with the message "Your account is inactive. Contact the Super Admin."
   - OTP off: the user goes straight to the dashboard.
   - OTP on: after a correct password, a 6-digit code is emailed. A second round screen shows "Enter OTP" with 6 boxes, Verify, and Resend after 60 seconds. The dashboard opens only after the right code.
5. **First Super Admin**: you give me one email address and I make that account the Super Admin. After that, the Super Admin creates everyone else from the Users page.

## Things to know
- OTP emails are sent from the built-in sign-in email system. For branding, you can later set up your own sender domain (e.g. no-reply@siplproducts.com).
- "Forgot password?" sends a reset link by email and opens a "Set new password" page.

## Technical details
- Migration:
  - Add `super_admin` to the `app_role` enum.
  - New `admin_profiles` table (user_id, full_name, phone, otp_required, is_active), with RLS that lets users read their own row and lets super admins manage all rows.
  - Content policies change to allow either role: `is_staff(uid)`, which means an admin or super_admin that is active.
- Account creation and editing run on the server, protected by `requireSupabaseAuth`, and check `has_role(super_admin)` before using the admin client. They create the auth user with email already confirmed, insert the profile and role, and reset passwords.
- Login flow:
  - Sign in with the password, then read the user's profile.
  - Inactive account: sign out and show the error.
  - OTP required: sign out, call `signInWithOtp({ email, shouldCreateUser: false })`, then `verifyOtp({ type: 'email' })` to create the session.
  - The `/admin` guard also checks that the account is active and has a staff role.
- Validation uses zod on both the browser and the server.
- New routes: `admin.users.tsx` and `admin.reset-password.tsx`. The neumorphic styles are added to `src/styles.css` as semantic tokens, and the logo watermark uses the existing Ramky logo.
