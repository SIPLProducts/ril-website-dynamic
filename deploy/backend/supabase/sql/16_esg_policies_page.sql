-- Add the Policies page and its initial editable policy summaries.
-- Safe to run again: existing rows with the same keys are left unchanged.

insert into public.esg_pages
  (slug, eyebrow, title, hero, metrics_period, banner_image_url, highlight_title, highlight_value, highlight_label)
values
  ('policies', 'Responsible Business', 'Policies', 'Clear principles and accountable practices that guide our people, partners and projects — supporting ethical conduct, safe workplaces and responsible growth.', '', null, '', '', '')
on conflict (slug) do nothing;

insert into public.esg_items
  (id, page_slug, kind, group_title, title, value, body, year, url, published, sort_order)
values
  ('b1000000-0000-4000-8000-000000000001', 'policies', 'accordion', null, 'Environmental & Sustainability Policy', '', 'We are committed to responsible environmental management across our operations and projects. Our approach covers regulatory compliance, resource efficiency, emissions reduction, water stewardship, waste management and continual improvement.', '', null, true, 1),
  ('b1000000-0000-4000-8000-000000000002', 'policies', 'accordion', null, 'Occupational Health, Safety & Environment Policy', '', 'We work to provide safe and healthy workplaces through hazard identification, risk controls, training and active employee participation. Our project teams and partners are expected to follow established safety systems and prevent incidents.', '', null, true, 2),
  ('b1000000-0000-4000-8000-000000000003', 'policies', 'accordion', null, 'Code of Conduct & Business Ethics', '', 'Our Code of Conduct guides employees, directors and business partners in acting with integrity. It addresses legal compliance, fair competition, conflicts of interest, respectful conduct and responsible use of company resources.', '', null, true, 3),
  ('b1000000-0000-4000-8000-000000000004', 'policies', 'accordion', null, 'Anti-Bribery & Anti-Corruption Policy', '', 'We prohibit bribery, corruption, facilitation payments and improper inducements in every form. Employees and representatives must maintain accurate records and conduct all business relationships transparently and lawfully.', '', null, true, 4),
  ('b1000000-0000-4000-8000-000000000005', 'policies', 'accordion', null, 'Human Rights & Labour Policy', '', 'We support equal opportunity, dignity and respect across our workforce and value chain. We do not tolerate discrimination, child labour, forced labour or harassment, and we promote fair and responsible employment practices.', '', null, true, 5),
  ('b1000000-0000-4000-8000-000000000006', 'policies', 'accordion', null, 'Whistle Blower & Grievance Policy', '', 'We provide channels for employees, vendors and other stakeholders to raise concerns in good faith. Reports are handled confidentially and reviewed through established processes, with protection against retaliation.', '', null, true, 6)
on conflict (id) do nothing;
