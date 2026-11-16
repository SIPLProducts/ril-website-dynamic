INSERT INTO public.strength_items (title, body, sort_order)
SELECT COALESCE(NULLIF(trim(a.extra->>'introSubtitle'), ''), 'Our Strengths. Our Strategic Advantage.'),
       COALESCE(NULLIF(trim(a.extra->>'introBody'), ''), E'At Ramky Infrastructure Limited, our strength lies in the ability to bring together the critical resources and capabilities required to develop and deliver complex infrastructure projects. Built on decades of engineering and execution experience, our integrated capabilities across people, materials, machinery, methodology and financial resources enable us to undertake projects across diverse sectors and geographies.\n\nOur 5M framework represents the foundation of our execution capabilities and our commitment to quality, timely delivery, operational excellence and sustainable growth.'),
       0
FROM (SELECT (SELECT extra FROM public.about_content WHERE slug = 'strength-strategies') AS extra) a
WHERE NOT EXISTS (SELECT 1 FROM public.strength_items);
