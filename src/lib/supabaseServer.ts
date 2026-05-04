import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr'
import type { Database } from '@generated/database.types'

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'https://example.supabase.co'
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

/**
 * Creates a Supabase client that reads and writes session cookies.
 * Use this in SSR pages that need the logged-in user's identity.
 *
 * @param request  The incoming Request from Astro.request
 * @param response The mutable Headers object from Astro.response.headers
 */
export function createSupabaseServerClient(request: Request, responseHeaders: Headers) {
  return createServerClient<Database, 'public'>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get('Cookie') ?? '')
          .filter((c): c is { name: string; value: string } => c.value !== undefined)
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          responseHeaders.append('Set-Cookie', serializeCookieHeader(name, value, options))
        }
      },
    },
  })
}
