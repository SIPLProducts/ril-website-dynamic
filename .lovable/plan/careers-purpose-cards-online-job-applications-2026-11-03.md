# Careers: Purpose cards + online job applications

## Answer: Vacancies vs Recruitment Flyers
- **Vacancies** = one job per entry (Job Req ID, location, experience, responsibilities, skills). Visitor opens the job and clicks Apply Now.
- **Recruitment Flyers** = one poster image advertising a recruitment drive with several roles listed; each role gets its own Apply Now button.
Admin can already add both under Careers → Current Positions. Both will use the same new application form below.

## 1. Vision, Mission & Values — add new cards
Today Vision and Mission are two fixed boxes and Values is a list. Change to a card list:
- Admin (Careers → Life at Ramky → "Our Purpose" section): add / edit / reorder / show-hide / delete cards. Each card: heading (e.g. "Vision", "Mission", "Values", or any new name), text, optional bullet points.
- Existing Vision, Mission and Values copied in as the first three cards, so the website looks the same.
- Life at Ramky page shows all live cards in order.

## 2. Online application that emails careers@ramky.com
- Replace the "not available yet" notice: the form now really submits.
- Fields: full name, email, mobile, current location, highest qualification, experience (years), position (prefilled), resume (PDF/DOC, max 5 MB), consent checkbox.
- On submit: application saved, resume stored privately, and an email with all details + resume attached sent to **careers@ramky.com** (recipient editable by Super Admin).
- Uses the SMTP settings already in Email Configuration. If SMTP is not set up, the application is still saved and the admin sees it; the visitor sees a success message either way.
- New admin screen **Careers → Applications**: list newest first, view details, download resume, mark status (New / Reviewed / Shortlisted / Rejected), delete.
- Basic spam protection: hidden honeypot field and limit on repeated submissions.

## Technical details
- Tables: `careers_purpose_cards` (title, body, bullets jsonb, published, sort_order) backfilled from `careers_content` vision/mission/values (old columns marked deprecated); `career_applications` (position, reference, applicant fields, resume_path, status, created_at). RLS: anon none; staff read/update/delete via is_staff; insert only via server function.
- Public `createServerFn` `submitApplication`: validates with zod, uploads resume to private bucket `careers/applications/`, inserts row with admin client, sends via existing worker-mailer SMTP helper with attachment; recipient from `email_settings` (new `careers_to` column, default careers@ramky.com).
- Test: submit one test application, confirm row + send log, then delete that test row.
