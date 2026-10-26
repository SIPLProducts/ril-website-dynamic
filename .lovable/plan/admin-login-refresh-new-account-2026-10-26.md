# Admin login refresh + new account

## 1. New account
- Create **sunilkumar@sharviinfotech.com** as a **Super Admin** (Active, OTP off), name "Sunil Kumar".
- A "set your password" email is sent to that address (works after publishing; "Forgot password?" also works).

## 2. New login screen behaviour
```text
First view (full screen)                 After clicking the top-right button
+------------------------------[>]+      +-----------------------+---------+
|                                 |      |                       |  Login  |
|   Ramky Group poster (uploaded) |      |  Ramky poster  (70%)  |  card   |
|   full width                    |      |                       |  (30%)  |
+---------------------------------+      +-----------------------+---------+
```
- Opens showing the uploaded Ramky Group poster full screen, with a round button in the top-right corner.
- Clicking it smoothly slides the page into a 70/30 split: poster on the left, login on the right. Clicking again collapses back to the poster.
- On phones: poster first, the button reveals the login full screen below/over it.
- OTP, forgot-password and reset-password steps all appear in the same right panel.

## 3. Visual fixes
- Ramky logo in the login panel is clearly visible (full colour at the top of the card, plus a stronger watermark) instead of the near-invisible grey one.
- Buttons get a bright gradient (Ramky orange to green, with blue accent for secondary), soft glow and hover lift.
- Keep the soft grey raised-card feel for fields.

## Technical details
- Upload `user-uploads://image.png` via lovable-assets to `src/assets/ramky-group-poster.png.asset.json`.
- `NeuShell` gains a `split` state + toggle button (lucide PanelRightOpen/Close), CSS width transition `w-full` -> `md:w-[70%]`, right panel `md:w-[30%]` with the card (rectangular rounded, not circle, to fit 30%).
- New tokens in `src/styles.css`: `--gradient-brand`, `--shadow-glow`, `neu-btn-gradient` utility; `NeuButton` uses it.
- Account via service-role script: auth user (email confirmed), `admin_profiles` row, `user_roles` super_admin, password reset email.
