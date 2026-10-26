<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Website architecture
- Keep the target TanStack bootstrap and pinned dependencies; import site pages, shared site components, and static content modules from the supplied website to preserve its experience without replacing runtime infrastructure.
- Store imported binary media as Lovable asset pointers; keep the favicon as a real public file so browser icons resolve.

## Admin & dynamic content
- Investor Relations documents and contacts live in the database (`ir_documents` keyed by `section_key` = `category/subTab[/child]`, `ir_contacts`); the tab structure stays in `src/lib/investor-relations.ts` so layouts stay code-controlled while content is admin-editable.
- The admin portal lives at `/admin` (client-only, noindex, never linked from the public site). Staff = `admin` or `super_admin` in `user_roles` plus an active `admin_profiles` row; RLS uses `is_staff`/`is_super_admin`. There is no public sign-up: super admins create accounts through server functions in `src/lib/admin-users.functions.ts`.
- Per-user email OTP is enforced in the login flow: password check, then sign-out, then `signInWithOtp` and `verifyOtp` (because the auth provider has no per-user MFA flag).
- Uploaded files go to the private `investor-documents` bucket and are stored as `storage:<path>`; the public read server function converts them to signed URLs (public buckets are blocked by workspace policy).
- Admin OTP and reset emails go through SMTP settings in `email_settings` (server-only, service role) via `worker-mailer`, falling back to built-in auth emails when SMTP is off/incomplete; codes/links come from `auth.admin.generateLink` so verification stays native.
