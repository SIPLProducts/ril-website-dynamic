-- Board committee membership (client document "Committees of the Board")
with c(t, b) as (values
 ('Audit Committee', E'Chairman: Dr. Ravi Kumar Reddy Somavarapu\nMember: Dr. Peddibhotla Gangadhara Sastry\nMember: Dr. Ananthapuram Guggela Ravindranath Reddy\nMember: Mr. Eshwar Reddy Purmandla'),
 ('Nomination & Remuneration Committee', E'Chairman: Mr. Eshwar Reddy Purmandla\nMember: Dr. Ravi Kumar Reddy Somavarapu\nMember: Dr. Peddibhotla Gangadhara Sastry\nMember: Dr. Ananthapuram Guggela Ravindranath Reddy'),
 ('Stakeholders’ Relationship Committee', E'Chairman: Dr. Peddibhotla Gangadhara Sastry\nMember: Dr. Ananthapuram Guggela Ravindranath Reddy\nMember: Mr. Yancharla Rathnakara Nagaraja\nMember: Mr. Eshwar Reddy Purmandla'),
 ('CSR Committee', E'Chairman: Dr. Peddibhotla Gangadhara Sastry\nMember: Dr. Ananthapuram Guggela Ravindranath Reddy\nMember: Mr. Yancharla Rathnakara Nagaraja\nMember: Mr. Eshwar Reddy Purmandla'),
 ('Risk Management Committee', E'Chairman: Mr. Eshwar Reddy Purmandla\nMember: Dr. Ravi Kumar Reddy Somavarapu\nMember: Dr. Peddibhotla Gangadhara Sastry\nMember: Mr. Yancharla Rathnakara Nagaraja\nMember: Mr. Rayapudi Sravanth (Appointed w.e.f. 01.10.2025)')
)
update public.esg_items i set body = c.b from c
where i.kind = 'governance_item' and i.page_slug in ('board-committees','governance') and i.title = c.t;

insert into public.esg_items (page_slug, kind, title, value, body, year, published, sort_order)
select 'board-committees','governance_item','Risk Management Committee','',
 E'Chairman: Mr. Eshwar Reddy Purmandla\nMember: Dr. Ravi Kumar Reddy Somavarapu\nMember: Dr. Peddibhotla Gangadhara Sastry\nMember: Mr. Yancharla Rathnakara Nagaraja\nMember: Mr. Rayapudi Sravanth (Appointed w.e.f. 01.10.2025)','',true,5
where not exists (select 1 from public.esg_items where page_slug='board-committees' and title='Risk Management Committee');
