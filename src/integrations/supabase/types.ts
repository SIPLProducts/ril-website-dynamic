export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      about_content: {
        Row: {
          banner_image_url: string | null
          extra: Json
          eyebrow: string
          image_url: string | null
          slug: string
          statement: string
          subtitle: string
          title: string
          updated_at: string
        }
        Insert: {
          banner_image_url?: string | null
          extra?: Json
          eyebrow?: string
          image_url?: string | null
          slug: string
          statement?: string
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Update: {
          banner_image_url?: string | null
          extra?: Json
          eyebrow?: string
          image_url?: string | null
          slug?: string
          statement?: string
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      accolades: {
        Row: {
          alt_text: string | null
          award_date: string
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          organisation: string
          project: string | null
          published: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          award_date?: string
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          organisation?: string
          project?: string | null
          published?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          award_date?: string
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          organisation?: string
          project?: string | null
          published?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          is_active: boolean
          otp_required: boolean
          phone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          is_active?: boolean
          otp_required?: boolean
          phone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          is_active?: boolean
          otp_required?: boolean
          phone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      business_projects: {
        Row: {
          client: string
          created_at: string
          id: string
          location: string
          name: string
          published: boolean
          sort_order: number
          status: string
          updated_at: string
          vertical_slug: string
        }
        Insert: {
          client?: string
          created_at?: string
          id?: string
          location?: string
          name: string
          published?: boolean
          sort_order?: number
          status?: string
          updated_at?: string
          vertical_slug: string
        }
        Update: {
          client?: string
          created_at?: string
          id?: string
          location?: string
          name?: string
          published?: boolean
          sort_order?: number
          status?: string
          updated_at?: string
          vertical_slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_projects_vertical_slug_fkey"
            columns: ["vertical_slug"]
            isOneToOne: false
            referencedRelation: "business_verticals"
            referencedColumns: ["slug"]
          },
        ]
      }
      business_verticals: {
        Row: {
          card_text: string
          created_at: string
          description: string
          icon: string
          image_alt: string
          image_url: string | null
          published: boolean
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          card_text?: string
          created_at?: string
          description?: string
          icon?: string
          image_alt?: string
          image_url?: string | null
          published?: boolean
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          card_text?: string
          created_at?: string
          description?: string
          icon?: string
          image_alt?: string
          image_url?: string | null
          published?: boolean
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      capabilities_settings: {
        Row: {
          eyebrow: string
          id: number
          intro: string
          landmark_eyebrow: string
          landmark_title: string
          title: string
          updated_at: string
        }
        Insert: {
          eyebrow?: string
          id?: number
          intro?: string
          landmark_eyebrow?: string
          landmark_title?: string
          title?: string
          updated_at?: string
        }
        Update: {
          eyebrow?: string
          id?: number
          intro?: string
          landmark_eyebrow?: string
          landmark_title?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      career_applications: {
        Row: {
          cover_note: string
          created_at: string
          email: string
          email_sent: boolean
          experience: string
          full_name: string
          id: string
          location: string
          mobile: string
          position: string
          qualification: string
          reference: string
          resume_name: string | null
          resume_path: string | null
          status: string
        }
        Insert: {
          cover_note?: string
          created_at?: string
          email: string
          email_sent?: boolean
          experience?: string
          full_name: string
          id?: string
          location?: string
          mobile: string
          position: string
          qualification?: string
          reference?: string
          resume_name?: string | null
          resume_path?: string | null
          status?: string
        }
        Update: {
          cover_note?: string
          created_at?: string
          email?: string
          email_sent?: boolean
          experience?: string
          full_name?: string
          id?: string
          location?: string
          mobile?: string
          position?: string
          qualification?: string
          reference?: string
          resume_name?: string | null
          resume_path?: string | null
          status?: string
        }
        Relationships: []
      }
      career_flyers: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          published: boolean
          roles: Json
          sort_order: number
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          published?: boolean
          roles?: Json
          sort_order?: number
          title: string
          updated_at?: string
          url?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          published?: boolean
          roles?: Json
          sort_order?: number
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      career_vacancies: {
        Row: {
          created_at: string
          deadline: string
          description: string
          division: string
          employment_type: string
          experience: string
          id: string
          location: string
          published: boolean
          published_date: string
          qualification: string
          req_id: string
          responsibilities: Json
          skills: Json
          sort_order: number
          title: string
          updated_at: string
          vacancies: number | null
        }
        Insert: {
          created_at?: string
          deadline?: string
          description?: string
          division?: string
          employment_type?: string
          experience?: string
          id?: string
          location?: string
          published?: boolean
          published_date?: string
          qualification?: string
          req_id?: string
          responsibilities?: Json
          skills?: Json
          sort_order?: number
          title: string
          updated_at?: string
          vacancies?: number | null
        }
        Update: {
          created_at?: string
          deadline?: string
          description?: string
          division?: string
          employment_type?: string
          experience?: string
          id?: string
          location?: string
          published?: boolean
          published_date?: string
          qualification?: string
          req_id?: string
          responsibilities?: Json
          skills?: Json
          sort_order?: number
          title?: string
          updated_at?: string
          vacancies?: number | null
        }
        Relationships: []
      }
      careers_landing_cards: {
        Row: {
          created_at: string
          eyebrow: string
          href: string
          id: string
          image_url: string | null
          published: boolean
          sort_order: number
          text: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          eyebrow?: string
          href?: string
          id?: string
          image_url?: string | null
          published?: boolean
          sort_order?: number
          text?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          eyebrow?: string
          href?: string
          id?: string
          image_url?: string | null
          published?: boolean
          sort_order?: number
          text?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      careers_life_content: {
        Row: {
          id: number
          mission: string
          positions_intro: string
          updated_at: string
          values_intro: string
          values_list: Json
          vision: string
        }
        Insert: {
          id?: number
          mission?: string
          positions_intro?: string
          updated_at?: string
          values_intro?: string
          values_list?: Json
          vision?: string
        }
        Update: {
          id?: number
          mission?: string
          positions_intro?: string
          updated_at?: string
          values_intro?: string
          values_list?: Json
          vision?: string
        }
        Relationships: []
      }
      careers_life_sections: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          paragraphs: Json
          published: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          paragraphs?: Json
          published?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          paragraphs?: Json
          published?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      careers_purpose_cards: {
        Row: {
          body: string
          bullets: Json
          created_at: string
          id: string
          published: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          body?: string
          bullets?: Json
          created_at?: string
          id?: string
          published?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          bullets?: Json
          created_at?: string
          id?: string
          published?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      clientele: {
        Row: {
          created_at: string
          description: string
          id: string
          image_url: string | null
          published: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      csr_areas: {
        Row: {
          body: string
          created_at: string
          id: string
          published: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          published?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          published?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      csr_content: {
        Row: {
          cta_label: string
          cta_url: string
          eyebrow: string
          id: number
          intro: string
          subtitle: string
          title: string
          updated_at: string
        }
        Insert: {
          cta_label?: string
          cta_url?: string
          eyebrow?: string
          id?: number
          intro?: string
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Update: {
          cta_label?: string
          cta_url?: string
          eyebrow?: string
          id?: number
          intro?: string
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_settings: {
        Row: {
          careers_to: string
          cc: string[]
          enabled: boolean
          from_email: string
          from_name: string
          host: string
          id: number
          password: string
          port: number
          secure: boolean
          updated_at: string
          username: string
        }
        Insert: {
          careers_to?: string
          cc?: string[]
          enabled?: boolean
          from_email?: string
          from_name?: string
          host?: string
          id?: number
          password?: string
          port?: number
          secure?: boolean
          updated_at?: string
          username?: string
        }
        Update: {
          careers_to?: string
          cc?: string[]
          enabled?: boolean
          from_email?: string
          from_name?: string
          host?: string
          id?: number
          password?: string
          port?: number
          secure?: boolean
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      esg_items: {
        Row: {
          body: string
          created_at: string
          group_title: string | null
          id: string
          kind: string
          page_slug: string
          published: boolean
          sort_order: number
          title: string
          updated_at: string
          url: string | null
          value: string
          year: string
        }
        Insert: {
          body?: string
          created_at?: string
          group_title?: string | null
          id?: string
          kind: string
          page_slug: string
          published?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
          url?: string | null
          value?: string
          year?: string
        }
        Update: {
          body?: string
          created_at?: string
          group_title?: string | null
          id?: string
          kind?: string
          page_slug?: string
          published?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
          url?: string | null
          value?: string
          year?: string
        }
        Relationships: [
          {
            foreignKeyName: "esg_items_page_slug_fkey"
            columns: ["page_slug"]
            isOneToOne: false
            referencedRelation: "esg_pages"
            referencedColumns: ["slug"]
          },
        ]
      }
      esg_pages: {
        Row: {
          banner_image_url: string | null
          eyebrow: string
          hero: string
          highlight_label: string
          highlight_title: string
          highlight_value: string
          metrics_period: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          banner_image_url?: string | null
          eyebrow?: string
          hero?: string
          highlight_label?: string
          highlight_title?: string
          highlight_value?: string
          metrics_period?: string
          slug: string
          title?: string
          updated_at?: string
        }
        Update: {
          banner_image_url?: string | null
          eyebrow?: string
          hero?: string
          highlight_label?: string
          highlight_title?: string
          highlight_value?: string
          metrics_period?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      footer_columns: {
        Row: {
          created_at: string
          id: string
          published: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          published?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          published?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      footer_links: {
        Row: {
          column_id: string
          created_at: string
          href: string
          id: string
          label: string
          new_tab: boolean
          published: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          column_id: string
          created_at?: string
          href: string
          id?: string
          label: string
          new_tab?: boolean
          published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          column_id?: string
          created_at?: string
          href?: string
          id?: string
          label?: string
          new_tab?: boolean
          published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "footer_links_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "footer_columns"
            referencedColumns: ["id"]
          },
        ]
      }
      footer_settings: {
        Row: {
          address: string
          copyright_name: string
          description: string
          email: string
          group_eyebrow: string
          group_subtitle: string
          group_title: string
          id: number
          phone: string
          tagline: string
          updated_at: string
        }
        Insert: {
          address?: string
          copyright_name?: string
          description?: string
          email?: string
          group_eyebrow?: string
          group_subtitle?: string
          group_title?: string
          id?: number
          phone?: string
          tagline?: string
          updated_at?: string
        }
        Update: {
          address?: string
          copyright_name?: string
          description?: string
          email?: string
          group_eyebrow?: string
          group_subtitle?: string
          group_title?: string
          id?: number
          phone?: string
          tagline?: string
          updated_at?: string
        }
        Relationships: []
      }
      group_companies: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          published: boolean
          show_link: boolean
          show_logo: boolean
          show_name: boolean
          sort_order: number
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          published?: boolean
          show_link?: boolean
          show_logo?: boolean
          show_name?: boolean
          sort_order?: number
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          published?: boolean
          show_link?: boolean
          show_logo?: boolean
          show_name?: boolean
          sort_order?: number
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      history_milestones: {
        Row: {
          created_at: string
          id: string
          published: boolean
          sort_order: number
          text: string
          updated_at: string
          year: string
        }
        Insert: {
          created_at?: string
          id?: string
          published?: boolean
          sort_order?: number
          text?: string
          updated_at?: string
          year: string
        }
        Update: {
          created_at?: string
          id?: string
          published?: boolean
          sort_order?: number
          text?: string
          updated_at?: string
          year?: string
        }
        Relationships: []
      }
      home_hero_slides: {
        Row: {
          alt: string
          created_at: string
          headline: string
          id: string
          image_url: string | null
          project: string
          published: boolean
          sort_order: number
          sub: string
        }
        Insert: {
          alt?: string
          created_at?: string
          headline?: string
          id?: string
          image_url?: string | null
          project?: string
          published?: boolean
          sort_order?: number
          sub?: string
        }
        Update: {
          alt?: string
          created_at?: string
          headline?: string
          id?: string
          image_url?: string | null
          project?: string
          published?: boolean
          sort_order?: number
          sub?: string
        }
        Relationships: []
      }
      home_journey_milestones: {
        Row: {
          id: string
          published: boolean
          sort_order: number
          text: string
          title: string
          year: string
        }
        Insert: {
          id?: string
          published?: boolean
          sort_order?: number
          text?: string
          title?: string
          year: string
        }
        Update: {
          id?: string
          published?: boolean
          sort_order?: number
          text?: string
          title?: string
          year?: string
        }
        Relationships: []
      }
      home_stats: {
        Row: {
          id: string
          label: string
          published: boolean
          sort_order: number
          value: string
        }
        Insert: {
          id?: string
          label?: string
          published?: boolean
          sort_order?: number
          value: string
        }
        Update: {
          id?: string
          label?: string
          published?: boolean
          sort_order?: number
          value?: string
        }
        Relationships: []
      }
      home_sustainability: {
        Row: {
          body: string
          eyebrow: string
          id: number
          poster_url: string | null
          side_stats: Json
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          body?: string
          eyebrow?: string
          id?: number
          poster_url?: string | null
          side_stats?: Json
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          body?: string
          eyebrow?: string
          id?: number
          poster_url?: string | null
          side_stats?: Json
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      home_sustainability_stats: {
        Row: {
          created_at: string
          id: string
          label: string
          note: string
          published: boolean
          sort_order: number
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string
          note?: string
          published?: boolean
          sort_order?: number
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          note?: string
          published?: boolean
          sort_order?: number
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      home_top: {
        Row: {
          about_eyebrow: string
          about_highlights: Json
          about_images: Json
          about_paragraphs: Json
          about_title: string
          id: number
          journey_eyebrow: string
          journey_title: string
          updated_at: string
        }
        Insert: {
          about_eyebrow?: string
          about_highlights?: Json
          about_images?: Json
          about_paragraphs?: Json
          about_title?: string
          id?: number
          journey_eyebrow?: string
          journey_title?: string
          updated_at?: string
        }
        Update: {
          about_eyebrow?: string
          about_highlights?: Json
          about_images?: Json
          about_paragraphs?: Json
          about_title?: string
          id?: number
          journey_eyebrow?: string
          journey_title?: string
          updated_at?: string
        }
        Relationships: []
      }
      ir_contacts: {
        Row: {
          heading: string
          id: string
          lines: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          heading: string
          id?: string
          lines?: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          heading?: string
          id?: string
          lines?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      ir_documents: {
        Row: {
          created_at: string
          description: string | null
          disclosure_category: string | null
          doc_date: string
          doc_type: string
          fy_year: string | null
          id: string
          published: boolean
          quarter: string | null
          section_key: string
          sort_order: number
          title: string
          updated_at: string
          url: string
          version: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          disclosure_category?: string | null
          doc_date?: string
          doc_type?: string
          fy_year?: string | null
          id?: string
          published?: boolean
          quarter?: string | null
          section_key: string
          sort_order?: number
          title: string
          updated_at?: string
          url: string
          version?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          disclosure_category?: string | null
          doc_date?: string
          doc_type?: string
          fy_year?: string | null
          id?: string
          published?: boolean
          quarter?: string | null
          section_key?: string
          sort_order?: number
          title?: string
          updated_at?: string
          url?: string
          version?: string | null
        }
        Relationships: []
      }
      ir_files: {
        Row: {
          data: string
          mime: string
          path: string
          size: number
          updated_at: string
        }
        Insert: {
          data: string
          mime?: string
          path: string
          size?: number
          updated_at?: string
        }
        Update: {
          data?: string
          mime?: string
          path?: string
          size?: number
          updated_at?: string
        }
        Relationships: []
      }
      landmark_projects: {
        Row: {
          created_at: string
          detail: string
          fit: string
          id: string
          image_url: string | null
          name: string
          published: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          detail?: string
          fit?: string
          id?: string
          image_url?: string | null
          name: string
          published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          detail?: string
          fit?: string
          id?: string
          image_url?: string | null
          name?: string
          published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      management_people: {
        Row: {
          created_at: string
          designation: string
          grp: string
          id: string
          image_url: string | null
          name: string
          published: boolean
          sections: Json
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          designation?: string
          grp: string
          id?: string
          image_url?: string | null
          name: string
          published?: boolean
          sections?: Json
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          designation?: string
          grp?: string
          id?: string
          image_url?: string | null
          name?: string
          published?: boolean
          sections?: Json
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      management_system_items: {
        Row: {
          created_at: string
          cta: string
          doc_page: string
          doc_url: string | null
          focus_areas: string
          icon: string
          id: string
          kind: string
          published: boolean
          sort_order: number
          standard: string
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta?: string
          doc_page?: string
          doc_url?: string | null
          focus_areas?: string
          icon?: string
          id?: string
          kind?: string
          published?: boolean
          sort_order?: number
          standard?: string
          summary?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta?: string
          doc_page?: string
          doc_url?: string | null
          focus_areas?: string
          icon?: string
          id?: string
          kind?: string
          published?: boolean
          sort_order?: number
          standard?: string
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      media_items: {
        Row: {
          created_at: string
          document_url: string | null
          external_url: string | null
          id: string
          item_date: string | null
          item_type: string
          kicker: string | null
          link_label: string | null
          paragraphs: Json
          published: boolean
          sort_order: number
          source: string | null
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_url?: string | null
          external_url?: string | null
          id?: string
          item_date?: string | null
          item_type?: string
          kicker?: string | null
          link_label?: string | null
          paragraphs?: Json
          published?: boolean
          sort_order?: number
          source?: string | null
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_url?: string | null
          external_url?: string | null
          id?: string
          item_date?: string | null
          item_type?: string
          kicker?: string | null
          link_label?: string | null
          paragraphs?: Json
          published?: boolean
          sort_order?: number
          source?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      media_page: {
        Row: {
          card_subtitle: string
          card_text: string
          card_title: string
          eyebrow: string
          id: number
          intro: string
          title: string
          updated_at: string
        }
        Insert: {
          card_subtitle?: string
          card_text?: string
          card_title?: string
          eyebrow?: string
          id?: number
          intro?: string
          title?: string
          updated_at?: string
        }
        Update: {
          card_subtitle?: string
          card_text?: string
          card_title?: string
          eyebrow?: string
          id?: number
          intro?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      page_visibility: {
        Row: {
          key: string
          published: boolean
          updated_at: string
        }
        Insert: {
          key: string
          published?: boolean
          updated_at?: string
        }
        Update: {
          key?: string
          published?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      strength_pillars: {
        Row: {
          body: string
          created_at: string
          id: string
          image_url: string | null
          published: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          image_url?: string | null
          published?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          image_url?: string | null
          published?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      subsidiaries: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          name: string
          published: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "super_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "super_admin"],
    },
  },
} as const
