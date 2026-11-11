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
- Serialize each request's QueryClient cache through Router dehydrate/hydrate so public content and images remain identical between server HTML and the first browser render.
- Keep the target TanStack bootstrap and pinned dependencies; import site pages, shared site components, and static content modules from the supplied website to preserve its experience without replacing runtime infrastructure.
- Store imported binary media as Lovable asset pointers; keep the favicon as a real public file so browser icons resolve.

## Admin & dynamic content
- Investor Relations documents and contacts live in the database (`ir_documents` keyed by `section_key` = `category/subTab[/child]`, `ir_contacts`); the tab structure stays in `src/lib/investor-relations.ts` so layouts stay code-controlled while content is admin-editable.
- The admin portal lives at `/admin` (client-only, noindex, never linked from the public site). Staff = `admin` or `super_admin` in `user_roles` plus an active `admin_profiles` row; RLS uses `is_staff`/`is_super_admin`. There is no public sign-up: super admins create accounts through server functions in `src/lib/admin-users.functions.ts`.
- Per-user email OTP is enforced in the login flow: password check, then sign-out, then `signInWithOtp` and `verifyOtp` (because the auth provider has no per-user MFA flag).
- Uploaded files stay in the private `investor-documents` bucket as `storage:<path>`; public reads use stable same-origin `/files/` URLs. The file handler verifies an exact public-content reference using anonymous RLS before privileged storage access, so unpublished uploads and resumes stay private and browser URLs never depend on storage hosts or expiring signatures.
- Admin OTP and reset emails go through SMTP settings in `email_settings` (server-only, service role) via `worker-mailer`, falling back to built-in auth emails when SMTP is off/incomplete; codes/links come from `auth.admin.generateLink` so verification stays native.
- Sustainability (ESG) page content lives in `esg_pages` + `esg_items` (kind = metric|accordion|governance_item|report); `src/lib/esg-sections.ts` keeps only the tab list and types so tabs stay code-controlled.
- Management people (board/executive/senior) live in `management_people` with profile paragraphs in a `sections` jsonb; `src/lib/management.ts` keeps the group list and section headings so layouts stay code-controlled.

## Self-hosting
- `vite.config.ts` switches nitro to the `node-server` preset with output in `dist/` only outside the Lovable sandbox, so `npm run build` makes a self-hostable Node server (`node dist/server/index.mjs`) while Lovable publishing stays unchanged.
- Self-hosted builds set the browser backend URL to window.location.origin (vite define in vite.config.ts) so private IP, public IP and domain all work; Nginx proxies /auth|rest|storage|realtime/v1 on every port.
- Simple admin-edited page lists (history_milestones, subsidiaries, management_system_items, careers_landing_cards) use the generic HomeListEditor and getPageList reader, with code defaults as fallback, so new list pages need no bespoke admin code.
