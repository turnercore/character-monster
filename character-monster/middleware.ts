import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/middleware'
import { API_KEYS_TABLE } from './lib/constants'
import { getJwtFromToken } from './lib/tools/getJwtFromToken'

const protectedRoutes = ['/testing', '/character', '/auth/account/profile']

export const config = {
  matcher: [
    '/testing/:path*',
    '/character/:path*',
    '/auth/account/profile/:path*',
  ],
}

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some((route) => pathname.startsWith(route))
}

function handleUnauthenticatedClient(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone()
  url.pathname = '/account/login'
  return NextResponse.rewrite(url)
}

export async function middleware(req: NextRequest) {
  try {
    const { supabase } = createClient(req)
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession()
    const isApiRoute = req.nextUrl.pathname.startsWith('/api')

    if (
      isProtectedRoute(req.nextUrl.pathname) &&
      (!sessionData?.session || sessionError)
    ) {
      return handleUnauthenticatedClient(req)
    }

    if (isApiRoute && !sessionData?.session) {
      // Check for monster-token header
      const monsterToken = req.headers.get('monster-token')
      // Reset user-allowed-session header to empty string to prevent spoofing
      req.headers.set('user-allowed-session', '')
      if (monsterToken) {
        const jwt = await getJwtFromToken(monsterToken)
        if (jwt) {
          // Log the user's use of the jwt with timestamp, we don't need to await this
          supabase.rpc('log_api_use', {
            id: monsterToken,
            table: API_KEYS_TABLE,
          })
          // Create new headers to add our jwt to the headers for the next function
          const newHeaders = new Headers(req.headers)
          newHeaders.set('user-allowed-session', jwt)
          return NextResponse.next({
            request: {
              ...req,
              headers: newHeaders,
            },
          })
        } else {
          return new NextResponse('Unauthorized', { status: 401 })
        }
      } else {
        return new NextResponse('Unauthorized', { status: 401 })
      }
    }

    return NextResponse.next()
  } catch (e) {
    // Handle errors (e.g., Supabase client creation failure)
    return NextResponse.next()
  }
}
