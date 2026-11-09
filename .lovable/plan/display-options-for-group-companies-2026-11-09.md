# Display options for Group Companies

## What changes
In Admin → Footer → Group Companies (add/edit form), add three switches under "Display on website":
- **Show logo**
- **Show company name**
- **Link to website**

## How the footer card shows each company
- Logo ON + Name ON: logo with the company name below it.
- Logo ON only: logo alone (as today).
- Name ON only, or no logo uploaded: company name text (as today).
- Link ON and a website link entered: card is clickable (opens in new tab). Otherwise not clickable.
- If both Logo and Name are OFF (or logo missing and Name OFF), the name is still shown so the card is never empty.

Defaults for existing companies: Logo ON, Name OFF, Link ON — so the site looks the same as now until you change it.

## Technical details
- Migration: add `show_logo boolean default true`, `show_name boolean default false`, `show_link boolean default true` to `group_companies`. Same ALTER given for the self-hosted server.
- `footer.functions.ts`: return the three flags; save them from the admin form.
- `admin.footer.group-companies.tsx`: three Switch controls in the form; small badges in the list.
- `SiteFooter.tsx`: render based on the flags (name under logo uses `text-xs font-semibold`, logo height slightly reduced when name shown).
