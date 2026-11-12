# Publish / Unpublish for every sub-page

## What you get
- A **Live on website** switch at the top of every sub-page in admin (About Ramky pages, History & Milestones, Subsidiaries, Management groups, Capabilities, Accolades, Sustainability tabs, Company, Careers, Investors sub-tabs).
- In the admin side menu, unpublished sub-pages show a small grey "Hidden" tag.
- A new **Page visibility** screen on the admin dashboard listing all modules and sub-pages with one switch each, so staff can publish/unpublish quickly in one place.
- On the website, an unpublished sub-page:
  - disappears from the top menu dropdown, footer links and in-page tabs;
  - shows the "Page not found" screen if someone opens its address directly.
- Content is never deleted — switching back on restores the page as it was.
- Everything is published by default, so the website looks the same until someone switches a page off.

## Technical details
- New table `page_visibility (key text primary key, published boolean default true, updated_at)`; keys match `ADMIN_MODULES` (`about/geographic-presence`, `management/board`, `esg/<slug>`, `ir/<section_key>` …). Missing row = published.
- RLS: anon/authenticated SELECT; staff (`is_staff`) INSERT/UPDATE; grants for anon, authenticated, service_role.
- `src/lib/page-visibility.functions.ts`: public `getHiddenPages()` server fn (query cached via loader `ensureQueryData` in `__root`), and a shared `PublishToggle` admin component that upserts the row.
- Header/footer/tab components filter by hidden keys; each public sub-page route loader throws `notFound()` when its key is hidden.
- Admin sidebar reads the same list for the "Hidden" tag; new route `admin.visibility.tsx`.
- Server migration `09_page_visibility.sql` (table, RLS, grants) to run with psql on your server, then rebuild and redeploy.
- Small test: hidden key filtering and default-published behaviour.
