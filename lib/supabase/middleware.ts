import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Évite que le middleware ne reste bloqué (et fasse tomber tout /admin)
// si Supabase est injoignable ou en pause — on considère l'utilisateur
// non authentifié passé ce délai plutôt que d'attendre indéfiniment.
const AUTH_CHECK_TIMEOUT_MS = 8000

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2])
          )
        },
      },
    }
  )

  const timeout = new Promise<{ data: { user: null } }>(resolve =>
    setTimeout(() => resolve({ data: { user: null } }), AUTH_CHECK_TIMEOUT_MS)
  )

  const {
    data: { user },
  } = await Promise.race([supabase.auth.getUser(), timeout])

  // Protect /admin routes
  if (!user && request.nextUrl.pathname.startsWith('/admin')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}