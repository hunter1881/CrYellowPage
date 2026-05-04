export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      cantons: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      districts: {
        Row: {
          id: string
          canton_id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          canton_id: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          canton_id?: string
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: 'districts_canton_id_fkey'
            columns: ['canton_id']
            isOneToOne: false
            referencedRelation: 'cantons'
            referencedColumns: ['id']
          },
        ]
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          icon_emoji: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          icon_emoji?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          icon_emoji?: string | null
        }
        Relationships: []
      }
      providers: {
        Row: {
          id: string
          name: string
          phone: string
          whatsapp: string | null
          email: string | null
          description: string | null
          photo_url: string | null
          district_id: string
          owner_id: string
          verified: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          whatsapp?: string | null
          email?: string | null
          description?: string | null
          photo_url?: string | null
          district_id: string
          owner_id: string
          verified?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          whatsapp?: string | null
          email?: string | null
          description?: string | null
          photo_url?: string | null
          district_id?: string
          owner_id?: string
          verified?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'providers_district_id_fkey'
            columns: ['district_id']
            isOneToOne: false
            referencedRelation: 'districts'
            referencedColumns: ['id']
          },
        ]
      }
      provider_categories: {
        Row: {
          provider_id: string
          category_id: string
        }
        Insert: {
          provider_id: string
          category_id: string
        }
        Update: {
          provider_id?: string
          category_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'provider_categories_provider_id_fkey'
            columns: ['provider_id']
            isOneToOne: false
            referencedRelation: 'providers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'provider_categories_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
        ]
      }
      reviews: {
        Row: {
          id: string
          provider_id: string
          author_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          provider_id: string
          author_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          provider_id?: string
          author_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reviews_provider_id_fkey'
            columns: ['provider_id']
            isOneToOne: false
            referencedRelation: 'providers'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
