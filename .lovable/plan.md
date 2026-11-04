# Show only finished modules on the live admin panel

## Goal
On the live site (ril.siplproducts.com and the published Lovable address), the admin menu treats only these as finished:
Dashboard, About Ramky (Clientele), Management, Capabilities, Accolades, Sustainability, Footer, Investors, User Management (incl. Email Configuration).

**Company** (CSR, Media) and **Careers** (Life at Ramky, Current Positions, Applications) show greyed out with a **"Soon"** tag and can't be clicked. In the preview, everything stays clickable so work can continue.

## Changes
1. Add a "live only" list of modules that stay locked on the live site: `company`, `careers`.
2. Detect the live site by its web address, checked in the browser. The admin panel only runs in the browser, so this is safe.
3. In the admin menu (sidebar, top bar and dropdowns), show the locked modules as "Soon" on the live site, the same way unfinished pages look now.
4. If someone types a locked page's address directly on the live site (e.g. `/admin/company/csr`), send them back to the Dashboard.
5. Leave the Dashboard's shortcuts to locked modules out on the live site, if it has any.
6. Public website pages don't change. CSR, Media and Careers keep showing their current content.

## Technical details
- `src/lib/admin-modules.ts`: add `LIVE_LOCKED = ["company","careers"]`, an `isLiveHost()` check that matches hostnames `ril.siplproducts.com` and `ril-website-dynamic.lovable.app`, and `isModuleReady(m)`, which returns false for locked modules on the live site.
- `src/components/admin/AdminShell.tsx`: use `isModuleReady` in place of `isReady` for the module-level checks. Add a `useEffect` guard that redirects to `/admin` when `active.module` is locked on the live site.
- Update `src/test/admin-modules.test.ts` so it covers the locking rule. Change its stale module-order assertion to match the current menu.
- Publish again after this change.
