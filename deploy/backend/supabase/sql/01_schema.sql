-- =============================================================================
-- Ramky Infrastructure Limited (RIL) - Self-Hosted Database Schema
-- Target: Self-Hosted Supabase / PostgreSQL 15+
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Custom Roles & Enums
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Helper Functions for Staff & Roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.admin_profiles ap ON ap.user_id = ur.user_id
    WHERE ur.user_id = _user_id 
      AND ur.role IN ('super_admin', 'admin')
      AND ap.is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.admin_profiles ap ON ap.user_id = ur.user_id
    WHERE ur.user_id = _user_id 
      AND ur.role = 'super_admin'
      AND ap.is_active = true
  );
$$;

-- 3. Core User Management Tables
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    user_id uuid PRIMARY KEY,
    full_name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL DEFAULT '',
    otp_required boolean NOT NULL DEFAULT false,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

CREATE TABLE IF NOT EXISTS public.email_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    smtp_host text NOT NULL DEFAULT '',
    smtp_port integer NOT NULL DEFAULT 587,
    smtp_user text NOT NULL DEFAULT '',
    smtp_password text NOT NULL DEFAULT '',
    smtp_from_name text NOT NULL DEFAULT 'Ramky Infrastructure',
    smtp_from_email text NOT NULL DEFAULT 'no-reply@ramky.com',
    smtp_secure boolean NOT NULL DEFAULT true,
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Content Tables
CREATE TABLE IF NOT EXISTS public.about_content (
    slug text PRIMARY KEY,
    eyebrow text NOT NULL DEFAULT '',
    title text NOT NULL DEFAULT '',
    subtitle text NOT NULL DEFAULT '',
    statement text NOT NULL DEFAULT '',
    banner_image_url text,
    image_url text,
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.accolades (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    award_date date NOT NULL DEFAULT CURRENT_DATE,
    category text,
    organisation text NOT NULL DEFAULT '',
    project text,
    description text,
    image_url text,
    alt_text text,
    published boolean NOT NULL DEFAULT true,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.business_verticals (
    slug text PRIMARY KEY,
    title text NOT NULL,
    card_text text NOT NULL DEFAULT '',
    description text NOT NULL DEFAULT '',
    icon text NOT NULL DEFAULT 'building',
    image_url text,
    sort_order integer NOT NULL DEFAULT 0,
    published boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.business_projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vertical_slug text NOT NULL REFERENCES public.business_verticals(slug) ON DELETE CASCADE,
    name text NOT NULL,
    location text NOT NULL DEFAULT '',
    client text NOT NULL DEFAULT '',
    status text NOT NULL DEFAULT 'Ongoing',
    published boolean NOT NULL DEFAULT true,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.capabilities_settings (
    id text PRIMARY KEY DEFAULT 'default',
    eyebrow text NOT NULL DEFAULT 'What We Deliver',
    title text NOT NULL DEFAULT 'Engineering capabilities that span infrastructure sectors',
    description text NOT NULL DEFAULT '',
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.clientele (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    category text,
    description text,
    image_url text NOT NULL,
    alt_text text,
    published boolean NOT NULL DEFAULT true,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.csr_content (
    id text PRIMARY KEY DEFAULT 'default',
    title text NOT NULL DEFAULT 'Corporate Social Responsibility',
    subtitle text NOT NULL DEFAULT 'Empowering communities through sustainable initiatives',
    overview text NOT NULL DEFAULT '',
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.csr_areas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text NOT NULL DEFAULT '',
    icon text NOT NULL DEFAULT 'heart',
    sort_order integer NOT NULL DEFAULT 0,
    published boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.esg_pages (
    slug text PRIMARY KEY,
    eyebrow text NOT NULL DEFAULT '',
    title text NOT NULL DEFAULT '',
    subtitle text NOT NULL DEFAULT '',
    banner_image_url text,
    overview text NOT NULL DEFAULT '',
    sort_order integer NOT NULL DEFAULT 0,
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.esg_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    page_slug text NOT NULL REFERENCES public.esg_pages(slug) ON DELETE CASCADE,
    kind text NOT NULL DEFAULT 'metric',
    title text NOT NULL,
    value text,
    unit text,
    description text,
    category text,
    pdf_url text,
    sort_order integer NOT NULL DEFAULT 0,
    published boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.footer_settings (
    id text PRIMARY KEY DEFAULT 'default',
    about_text text NOT NULL DEFAULT '',
    tagline text NOT NULL DEFAULT '',
    registered_office text NOT NULL DEFAULT '',
    corporate_office text NOT NULL DEFAULT '',
    contact_email text NOT NULL DEFAULT '',
    contact_phone text NOT NULL DEFAULT '',
    copyright_name text NOT NULL DEFAULT 'Ramky Infrastructure Limited',
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.footer_columns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,
    published boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.footer_links (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    column_id uuid NOT NULL REFERENCES public.footer_columns(id) ON DELETE CASCADE,
    label text NOT NULL,
    url text NOT NULL,
    new_tab boolean NOT NULL DEFAULT false,
    sort_order integer NOT NULL DEFAULT 0,
    published boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.group_companies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    url text NOT NULL DEFAULT '',
    logo_url text,
    description text,
    sort_order integer NOT NULL DEFAULT 0,
    published boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.home_top (
    id text PRIMARY KEY DEFAULT 'default',
    who_we_are_eyebrow text NOT NULL DEFAULT 'Who We Are',
    who_we_are_title text NOT NULL DEFAULT 'Ramky Infrastructure Limited',
    who_we_are_intro text NOT NULL DEFAULT '',
    who_we_are_more text NOT NULL DEFAULT '',
    journey_eyebrow text NOT NULL DEFAULT 'Our Journey',
    journey_title text NOT NULL DEFAULT 'Three Decades of Nation-Building',
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.home_hero_slides (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    subtitle text NOT NULL DEFAULT '',
    description text NOT NULL DEFAULT '',
    image_url text NOT NULL,
    project_label text NOT NULL DEFAULT '',
    sort_order integer NOT NULL DEFAULT 0,
    published boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.home_stats (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    stat_value text NOT NULL,
    label text NOT NULL,
    description text NOT NULL DEFAULT '',
    sort_order integer NOT NULL DEFAULT 0,
    published boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.home_journey_milestones (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    year text NOT NULL,
    title text NOT NULL,
    description text NOT NULL DEFAULT '',
    sort_order integer NOT NULL DEFAULT 0,
    published boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.home_sustainability (
    id text PRIMARY KEY DEFAULT 'default',
    eyebrow text NOT NULL DEFAULT 'Sustainability',
    title text NOT NULL DEFAULT 'Towards sustainable growth — not as a slogan, as a method.',
    description text NOT NULL DEFAULT '',
    video_url text,
    cover_image_url text,
    stat1_value text NOT NULL DEFAULT '600+',
    stat1_label text NOT NULL DEFAULT 'MW Clean Power Capacity Built',
    stat2_value text NOT NULL DEFAULT '100+',
    stat2_label text NOT NULL DEFAULT 'Zero-Liquid Discharge Projects',
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.home_sustainability_stats (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    value text NOT NULL,
    label text NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,
    published boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ir_contacts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    name text NOT NULL,
    designation text,
    email text,
    phone text,
    address text,
    sort_order integer NOT NULL DEFAULT 0,
    published boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ir_documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key text NOT NULL,
    title text NOT NULL,
    file_url text NOT NULL,
    file_size text,
    publish_date date NOT NULL DEFAULT CURRENT_DATE,
    financial_year text,
    sort_order integer NOT NULL DEFAULT 0,
    published boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.landmark_projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    location text NOT NULL DEFAULT '',
    category text NOT NULL DEFAULT '',
    description text NOT NULL DEFAULT '',
    image_url text NOT NULL,
    aspect_mode text NOT NULL DEFAULT 'cover',
    sort_order integer NOT NULL DEFAULT 0,
    published boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.management_people (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    group_slug text NOT NULL,
    name text NOT NULL,
    designation text NOT NULL,
    image_url text,
    bio text NOT NULL DEFAULT '',
    sections jsonb NOT NULL DEFAULT '[]'::jsonb,
    sort_order integer NOT NULL DEFAULT 0,
    published boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.media_page (
    id text PRIMARY KEY DEFAULT 'default',
    eyebrow text NOT NULL DEFAULT 'Media Center',
    title text NOT NULL DEFAULT 'News, Press Releases & Corporate Announcements',
    subtitle text NOT NULL DEFAULT '',
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.media_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    published_date date NOT NULL DEFAULT CURRENT_DATE,
    outlet text NOT NULL DEFAULT '',
    category text NOT NULL DEFAULT 'press_release',
    description text,
    external_url text,
    file_url text,
    image_url text,
    sort_order integer NOT NULL DEFAULT 0,
    published boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.career_vacancies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    department text NOT NULL,
    location text NOT NULL,
    experience text NOT NULL DEFAULT '',
    qualifications text NOT NULL DEFAULT '',
    description text NOT NULL DEFAULT '',
    published boolean NOT NULL DEFAULT true,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.career_flyers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    image_url text NOT NULL,
    roles text[] NOT NULL DEFAULT '{}',
    published boolean NOT NULL DEFAULT true,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.career_applications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    position text NOT NULL,
    experience text,
    resume_url text NOT NULL,
    cover_note text,
    status text NOT NULL DEFAULT 'submitted',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.careers_life_content (
    id text PRIMARY KEY DEFAULT 'default',
    eyebrow text NOT NULL DEFAULT 'Life at Ramky',
    title text NOT NULL DEFAULT 'Building Futures, Empowering People',
    intro text NOT NULL DEFAULT '',
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.careers_purpose_cards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text NOT NULL,
    icon text NOT NULL DEFAULT 'star',
    sort_order integer NOT NULL DEFAULT 0,
    published boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.careers_life_sections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    heading text NOT NULL,
    content text NOT NULL,
    image_url text,
    sort_order integer NOT NULL DEFAULT 0,
    published boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Row Level Security (RLS) Configuration
-- Enable RLS on all public tables
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN 
        SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
        -- Public read policy for published content
        EXECUTE format('DROP POLICY IF EXISTS "Public select" ON public.%I;', tbl);
        EXECUTE format('CREATE POLICY "Public select" ON public.%I FOR SELECT USING (true);', tbl);
        -- Staff write policy for administrative mutations
        EXECUTE format('DROP POLICY IF EXISTS "Staff all" ON public.%I;', tbl);
        EXECUTE format('CREATE POLICY "Staff all" ON public.%I FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));', tbl);
    END LOOP;
END $$;

-- Grants for standard API roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;
