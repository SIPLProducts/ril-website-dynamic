-- Board Committees shown under Investor Relations > Corporate Governance > Board & Committees (editable in Admin > Investors > Board Committees)
insert into public.esg_pages (slug, title) values ('board-committees','Board Committees') on conflict (slug) do nothing;
insert into public.esg_items (page_slug, kind, title, value, body, year, published, sort_order)
select 'board-committees','governance_item',t,'','','',true,o from (values
 ('Audit Committee',1),('Nomination & Remuneration Committee',2),('Stakeholders’ Relationship Committee',3),('CSR Committee',4),('Whistle Blower Policy',5)) v(t,o)
where not exists (select 1 from public.esg_items where page_slug='board-committees');
