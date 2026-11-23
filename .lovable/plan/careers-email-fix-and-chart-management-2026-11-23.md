# Careers Email Fix and Chart Management

The five Sustainability pages stay as they are. There is no page builder.

## Audit result: why Careers emails are not delivered

These were confirmed in the code and the preview database:

1. **The live server cannot send mail at all.** The self-hosted server sends email with "nodemailer", which is missing from the project's install list. Every send fails, and the error is hidden.
2. **The mail login is blank.** In Email Configuration, the username, password and From email are empty, so sending is skipped.
3. **Failures are invisible.** Applications don't show whether their email went out or why it failed.

These parts are already correct: the recipient (careers@ramky.com), the resume attachment with its original file name, Reply-To set to the candidate, and server-only password storage.

## Phase 1: Careers email

- Add nodemailer to the project, so the live server installs it on `npm install`.
- Save the application and resume first, then send the email as a separate step. A failed email never loses the application.
- Store an email status (Pending, Sent or Failed), a readable error, and the time of the last attempt for each application. Passwords and SMTP details are never stored in the error.
- Turn common SMTP errors into plain messages, for example "Login rejected: for Gmail, use an App Password" or "Cannot reach mail server on port 587".
- **Admin → Careers → Applications:**
  - a status badge on each row
  - the error shown when a send failed
  - a **Resend email** button on failed or pending rows, which re-sends with the resume attached
- **Email Configuration → Send Test Email:** uses exactly the same sending path, and shows a clear success message or the exact reason it failed.

## Phase 2: Chart management (Admin → Website settings → ESG trends)

Each chart gets these editable fields:
- Chart title
- Metric name
- Unit
- **Chart type:** Bar or Line
- **Show under figure:** a dropdown of the real figure cards on the Environmental and Social pages, with no text matching
- Financial years and the value for each year
- Notes
- Source
- Summary

Admins can also add, edit and delete charts.

- Existing charts are linked to their current figure cards automatically, so nothing changes visually and no data is lost.
- Pages show a chart wherever one is linked to a figure. A new metric appears as soon as it is saved.
- Line charts use the same colours, labels, "Not disclosed" handling and up/down trend colouring as bar charts.

## Phase 3: Testing

- **Automated checks:**
  - a chart links to its figure card by the chosen card, not by name
  - a line chart renders
  - a deleted chart disappears from the page
  - a failed send records a Failed status and keeps the application
  - error messages never contain the password
- **In the preview:**
  - submit a sample application and confirm it is saved with the status "Pending" or "Failed" (there is no SMTP here)
  - try Resend
  - edit a chart, add a new one, switch it between Bar and Line, and confirm the website updates
- **Needs your live server:** actual delivery to careers@ramky.com. It needs real SMTP details, such as a Gmail App Password or Ramky's mail server, entered in Email Configuration. I will not report emails as delivered until that has been checked there.

## Technical details

- **Careers email:**
  - Add `nodemailer` to `package.json`, and to Nitro externals if needed so the Node build resolves it.
  - Add `email_status text default 'pending'`, `email_error text` and `email_attempted_at timestamptz` to `career_applications`, and backfill `email_sent` to `sent`.
  - Create `src/lib/careers-mail.server.ts` with `sendApplicationEmail(id)`, which reads the stored resume from storage. It is used by both submit and a staff-only `resendApplicationEmail` server function (an `is_staff` check, then the privileged client).
  - In `sendTestEmail`, call the same `sendMail`, and add a `friendlySmtpError()` helper that also strips the password.
- **Chart management:**
  - Extend `MetricTrend` with `id`, `chartType: "bar" | "line"`, `title` and `target: { page, metricId }`, where `metricId` is the `esg_items.id` of the figure card.
  - Migrate the stored `esg_trends` by resolving the current label matches into IDs once. Keep the label match only as a fallback for rows without a target.
  - `MetricTrend.tsx` gets a line variant in SVG, matching the bar styling.
  - The admin editor loads the `esg_items` metrics to fill the figure dropdown.
- **Live server:** a numbered SQL file `26_careers_email_status.sql` for the live server, then `npm install`, build and restart.
