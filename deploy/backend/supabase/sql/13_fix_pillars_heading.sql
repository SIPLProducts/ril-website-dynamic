UPDATE public.about_content SET extra = jsonb_set(extra, '{pillarsTitle}', '"<h3>Pillars of Ramky Infrastructure</h3>"') WHERE slug = 'strength-strategies';
