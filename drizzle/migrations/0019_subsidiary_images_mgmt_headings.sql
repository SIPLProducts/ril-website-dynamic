ALTER TABLE public.subsidiaries ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.about_content ADD COLUMN IF NOT EXISTS extra jsonb NOT NULL DEFAULT '{}'::jsonb;
UPDATE public.about_content SET extra = jsonb_build_object(
  'certEyebrow','Certified Systems','certTitle','Management Systems',
  'certIntro','Our management systems reflect our commitment to quality, occupational health and safety, and environmental responsibility across the lifecycle of our projects. These internationally recognised standards guide the way we design, engineer, procure, construct, operate and maintain critical infrastructure.',
  'commitEyebrow','Our Commitment','commitTitle','Our Management Commitments',
  'commitIntro','Our management systems are supported by clearly defined Quality and Health, Safety & Environment commitments that guide our people, processes and project delivery.',
  'tagline','Integrated management systems. Responsible execution. Consistent performance.')
WHERE slug = 'management-systems' AND extra = '{}'::jsonb;