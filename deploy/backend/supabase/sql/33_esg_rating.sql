-- ESG Rating tab: page row, public read of the esg_rating setting, and the FY2026 NSE rating. Run once.
INSERT INTO public.esg_pages (slug, eyebrow, title, hero)
VALUES ('esg-rating', 'Independent Assessment', 'ESG Rating', 'Our ESG performance as independently rated by NSE Sustainability Ratings & Analytics — year-wise ratings, rating category and the key drivers behind each pillar score.')
ON CONFLICT (slug) DO NOTHING;

DROP POLICY IF EXISTS "site_settings public read known keys" ON public.site_settings;
CREATE POLICY "site_settings public read known keys" ON public.site_settings FOR SELECT TO anon, authenticated
USING (key = ANY (ARRAY['esg_trends','esg_images','main_menu','sustainability_nav','pdf_viewer','esg_labels','theme','esg_rating']));

INSERT INTO public.site_settings (key, value) VALUES ('esg_rating', '{
 "agency": "NSE Sustainability Ratings & Analytics",
 "company": "Ramky Infrastructure Ltd",
 "sector": "Construction | Civil Construction",
 "reviewDate": "15th October 2026",
 "category": "Moderate",
 "categoryNote": "Displays basic ESG practices with limited strategic depth.",
 "ratings": [{"year":"FY2026","score":"56","note":""},{"year":"FY2025","score":"48","note":"Revised"}],
 "pillars": [{"name":"Environment","score":"32","weight":"40%"},{"name":"Social","score":"70","weight":"29%"},{"name":"Governance","score":"72","weight":"31%"}],
 "coreRating": "42",
 "synopsis": "NSE Sustainability Ratings & Analytics assessed Ramky Infrastructure across Environment, Social and Governance. The FY2026 ESG rating of 56 improves on the revised FY2025 rating of 48. Strengths include near-zero lost-time incidents, zero fatalities, full health insurance cover, CSR spending above obligation and strong independent-director representation on the board and committees. Areas to improve include renewable energy use, waste and energy intensity, women representation and linking executive pay to ESG goals.",
 "drivers": [
  {"pillar":"Environment","points":["Greenhouse gas emissions from direct operations decreased 21% compared to the previous year.","Energy intensity decreased 9% compared to the previous year.","Scope 3 carbon footprint is in line with standard practices.","Waste recycling and recovery are high when compared with peers.","Reliance on renewable energy is minimal."]},
  {"pillar":"Social","points":["Lost time incident rate (LTIR) approaching zero and lower than peers.","Zero employee and worker fatalities reported.","100% of permanent employees covered under health insurance.","CSR spending exceeds obligations, with a documented CSR policy.","Women are underrepresented compared to industry standards."]},
  {"pillar":"Governance","points":["Independent directors on the board exceed the regulatory minimum.","Audit, Nomination & Remuneration, Risk Management and CSR committees exceed independence requirements.","A comprehensive Anti-Corruption and Anti-Bribery policy is in place.","Chairman and CEO roles are combined.","Executive remuneration is not linked to ESG performance."]}
 ],
 "pdf": "/__l5e/assets-v1/bcfebbca-d435-43cb-a9ea-e3ae5a84641d/ESG_Rating_Report_FY2026.pdf"
}'::jsonb) ON CONFLICT (key) DO NOTHING;
