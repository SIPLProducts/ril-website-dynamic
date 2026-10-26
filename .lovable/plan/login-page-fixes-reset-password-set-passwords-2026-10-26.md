# Login page fixes, reset password, set passwords

## 1. Why reset password failed
- The live site (ril.siplproducts.com) has not been published since the admin portal was built, so `/admin`, `/admin/login` and `/admin/reset-password` all return "Page not found" there right now (checked).
- The first click on the email link was accepted, then landed on that missing page. The second click failed because each reset link works only once ("Email link is invalid or has expired").
- Fix: publish once after these changes. The reset page will also show a clear message ("This link has expired, request a new one") with a button back to login, instead of a blank error.

## 2. Set passwords directly
- Set the password **Admin@1919** for both accounts:
  - masteradmin@sharviinfotech.com (Super Admin)
  - sunilkumar@sharviinfotech.com (Super Admin)
- Both stay Active with OTP off, so you can sign in right away at /admin/login (in preview now, on the live site after publishing).
- Recommendation: change it later from the Users page, since it was shared in chat.

## 3. Login page look
- **Full view:** the whole poster is shown with nothing cut from top or bottom. The space around it is filled with a soft blurred copy of the same poster, so there are no white bands.
- **Split view (60 / 40):** the poster fits its left 60% completely (same blurred fill behind, no cropping, no white bands).
- **Round login card:** the large faded Ramky logo behind the circle is removed. The small colour logo at the top of the card stays.
- **Input fields:** each field gets a coloured bottom border (Ramky orange-to-green), turning stronger when you click into it.

## Technical details
- `src/components/admin/NeuAuth.tsx`: poster panel renders a blurred, scaled `object-cover` copy (aria-hidden) behind an `object-contain` image in both states; delete the watermark `<img>` in the right panel; `NeuField` gets `border-b-2` with a gradient/brand colour token and focus-within emphasis.
- `src/styles.css`: add a `neu-field-accent` utility (bottom border colour via semantic token).
- `src/routes/admin.reset-password.tsx`: on mount, read `error_code`/`error_description` from the URL hash and show the expired-link message with a "Back to login" button; wait for the recovery session before enabling Save.
- Passwords set server-side with the admin auth client (`updateUserById`) for both user IDs; no code change needed for that.
