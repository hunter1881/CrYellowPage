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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      cantons: {
        Row: {
          area_m2: number | null
          code: string
          created_at: string
          id: string
          name: string
          province_id: string
          slug: string
          source: string
        }
        Insert: {
          area_m2?: number | null
          code: string
          created_at?: string
          id?: string
          name: string
          province_id: string
          slug: string
          source?: string
        }
        Update: {
          area_m2?: number | null
          code?: string
          created_at?: string
          id?: string
          name?: string
          province_id?: string
          slug?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "cantons_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon_emoji: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_emoji?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_emoji?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      countries: {
        Row: {
          created_at: string
          id: string
          iso2: string
          iso3: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          iso2: string
          iso3: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          iso2?: string
          iso3?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      districts: {
        Row: {
          area_m2: number | null
          canton_id: string
          code: string
          created_at: string
          id: string
          name: string
          postal_code: string
          slug: string
          source: string
          source_updated_at: string | null
        }
        Insert: {
          area_m2?: number | null
          canton_id: string
          code: string
          created_at?: string
          id?: string
          name: string
          postal_code: string
          slug: string
          source?: string
          source_updated_at?: string | null
        }
        Update: {
          area_m2?: number | null
          canton_id?: string
          code?: string
          created_at?: string
          id?: string
          name?: string
          postal_code?: string
          slug?: string
          source?: string
          source_updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "districts_canton_id_fkey"
            columns: ["canton_id"]
            isOneToOne: false
            referencedRelation: "cantons"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          active: boolean
          category: string
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          category: string
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      phone_otp_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          id: string
          phone: string
          provider_id: string
          used: boolean
        }
        Insert: {
          code: string
          created_at?: string
          expires_at?: string
          id?: string
          phone: string
          provider_id: string
          used?: boolean
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          phone?: string
          provider_id?: string
          used?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "phone_otp_codes_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_categories: {
        Row: {
          category_id: string
          created_at: string
          provider_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          provider_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          provider_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_categories_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_payment_methods: {
        Row: {
          created_at: string
          payment_method_id: string
          provider_id: string
        }
        Insert: {
          created_at?: string
          payment_method_id: string
          provider_id: string
        }
        Update: {
          created_at?: string
          payment_method_id?: string
          provider_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_payment_methods_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_payment_methods_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_registrations: {
        Row: {
          accepts_sinpe: boolean
          business_name: string
          category_ids: string[]
          contact_name: string
          created_at: string
          description: string
          district_id: string | null
          email: string | null
          id: string
          owner_id: string | null
          phone: string
          service_areas: Json | null
          source_locale: string
          status: string
          whatsapp: string | null
          works_weekends: boolean
          years_active: number
        }
        Insert: {
          accepts_sinpe?: boolean
          business_name: string
          category_ids: string[]
          contact_name: string
          created_at?: string
          description: string
          district_id?: string | null
          email?: string | null
          id?: string
          owner_id?: string | null
          phone: string
          service_areas?: Json | null
          source_locale?: string
          status?: string
          whatsapp?: string | null
          works_weekends?: boolean
          years_active?: number
        }
        Update: {
          accepts_sinpe?: boolean
          business_name?: string
          category_ids?: string[]
          contact_name?: string
          created_at?: string
          description?: string
          district_id?: string | null
          email?: string | null
          id?: string
          owner_id?: string | null
          phone?: string
          service_areas?: Json | null
          source_locale?: string
          status?: string
          whatsapp?: string | null
          works_weekends?: boolean
          years_active?: number
        }
        Relationships: [
          {
            foreignKeyName: "provider_registrations_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          provider_id: string
          reason: string
          reporter_id: string | null
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          provider_id: string
          reason: string
          reporter_id?: string | null
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          provider_id?: string
          reason?: string
          reporter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_reports_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_service_areas: {
        Row: {
          canton_id: string | null
          district_id: string | null
          id: string
          level: string
          provider_id: string
        }
        Insert: {
          canton_id?: string | null
          district_id?: string | null
          id?: string
          level: string
          provider_id: string
        }
        Update: {
          canton_id?: string | null
          district_id?: string | null
          id?: string
          level?: string
          provider_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_service_areas_canton_id_fkey"
            columns: ["canton_id"]
            isOneToOne: false
            referencedRelation: "cantons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_service_areas_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_service_areas_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      providers: {
        Row: {
          accepts_sinpe: boolean
          completed_jobs: number
          created_at: string
          description: string | null
          district_id: string | null
          email: string | null
          id: string
          name: string
          owner_id: string | null
          phone: string
          phone_verified: boolean
          photo_url: string | null
          response_time_minutes: number | null
          updated_at: string
          verified: boolean
          whatsapp: string | null
          works_weekends: boolean
          years_active: number
        }
        Insert: {
          accepts_sinpe?: boolean
          completed_jobs?: number
          created_at?: string
          description?: string | null
          district_id?: string | null
          email?: string | null
          id?: string
          name: string
          owner_id?: string | null
          phone: string
          phone_verified?: boolean
          photo_url?: string | null
          response_time_minutes?: number | null
          updated_at?: string
          verified?: boolean
          whatsapp?: string | null
          works_weekends?: boolean
          years_active?: number
        }
        Update: {
          accepts_sinpe?: boolean
          completed_jobs?: number
          created_at?: string
          description?: string | null
          district_id?: string | null
          email?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          phone?: string
          phone_verified?: boolean
          photo_url?: string | null
          response_time_minutes?: number | null
          updated_at?: string
          verified?: boolean
          whatsapp?: string | null
          works_weekends?: boolean
          years_active?: number
        }
        Relationships: [
          {
            foreignKeyName: "providers_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      provinces: {
        Row: {
          area_m2: number | null
          code: string
          country_id: string
          created_at: string
          id: string
          name: string
          slug: string
          source: string
        }
        Insert: {
          area_m2?: number | null
          code: string
          country_id: string
          created_at?: string
          id?: string
          name: string
          slug: string
          source?: string
        }
        Update: {
          area_m2?: number | null
          code?: string
          country_id?: string
          created_at?: string
          id?: string
          name?: string
          slug?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "provinces_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          author_id: string | null
          author_name: string | null
          comment: string | null
          created_at: string
          id: string
          provider_id: string
          rating: number
          work_confirmed: boolean
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          provider_id: string
          rating: number
          work_confirmed?: boolean
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          provider_id?: string
          rating?: number
          work_confirmed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "reviews_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_auth_otps: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          id: string
          phone: string
          used: boolean
        }
        Insert: {
          code: string
          created_at?: string
          expires_at: string
          id?: string
          phone: string
          used?: boolean
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          phone?: string
          used?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      provider_effective_districts: {
        Row: {
          district_id: string | null
          provider_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_providers_for_listing: {
        Args: { p_category_id: string; p_district_id: string }
        Returns: {
          accepts_sinpe: boolean
          completed_jobs: number
          created_at: string
          description: string
          id: string
          name: string
          phone: string
          photo_url: string
          response_time_minutes: number
          whatsapp: string
          works_weekends: boolean
          years_active: number
        }[]
      }
      immutable_unaccent: { Args: { "": string }; Returns: string }
      list_valid_listing_combinations: {
        Args: { min_providers?: number }
        Returns: {
          canton_slug: string
          category_slug: string
          district_slug: string
          provider_count: number
        }[]
      }
      search_providers: {
        Args: {
          p_district?: string
          p_limit?: number
          p_offset?: number
          q: string
        }
        Returns: {
          accepts_sinpe: boolean
          completed_jobs: number
          created_at: string
          description: string
          district_id: string
          id: string
          name: string
          phone: string
          photo_url: string
          rank: number
          response_time_minutes: number
          whatsapp: string
          works_weekends: boolean
          years_active: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
