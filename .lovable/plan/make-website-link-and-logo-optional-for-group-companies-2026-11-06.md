# Make website link and logo optional for group companies

## What changes
- In the admin "Add / Edit group company" form, only **Company name** stays required. The `*` is removed from "Website link" and "Logo".
- Website link: may be left empty. If something is typed, it must still be a full link starting with https://.
- Logo: may be skipped. The admin list already shows "No logo"; the website footer already shows the company name in place of a missing logo.
- Website footer: a company with no link shows as a plain card (no new-tab link, no arrow icon). Companies with a link work as before.

## Technical details
- Migration: `ALTER TABLE public.group_companies ALTER COLUMN url DROP NOT NULL;` (additive, existing rows unaffected).
- `src/routes/admin.footer.group-companies.tsx`: default url to "" for new rows, validate only when non-empty, remove logo-required check, save `url: url.trim() || null`, show "—" in the list when no link.
- `src/components/site/SiteFooter.tsx` (and its data function): render a `div` instead of `a` when `href` is empty.
- For the self-hosted server, run the same one-line ALTER in the server database.
