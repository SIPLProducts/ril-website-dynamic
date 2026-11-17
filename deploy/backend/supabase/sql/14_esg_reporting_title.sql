-- 14_esg_reporting_title.sql
-- Renames only the heading shown inside the green hero box on the
-- Sustainability (ESG) Reporting page. The tab bar, header menu and admin
-- navigation labels keep reading "ESG Reporting" because those come from code.

update public.esg_pages
   set title = 'Sustainability (ESG) Reports'
 where slug = 'esg-reporting';

-- Check the result:
-- select slug, title from public.esg_pages where slug = 'esg-reporting';
