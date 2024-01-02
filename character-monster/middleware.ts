import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/middleware'
import { API_KEYS_TABLE } from './lib/constants'
import { SupabaseClient } from '@supabase/supabase-js'
import extractErrorMessage from './lib/tools/extractErrorMessage'
import { APIKey } from './lib/schemas'

const protectedRoutes = ['/testing']
const apiKeysTable = API_KEYS_TABLE || 'api_keys' // Adjust as per your table name

export const config = {
  matcher: ['/testing/:path*'],
}

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some((route) => pathname.startsWith(route))
}

function handleUnauthenticatedClient(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone()
  url.pathname = '/account/login'
  return NextResponse.rewrite(url)
}

async function validateApiKey(
  monsterToken: string,
  supabaseClient: SupabaseClient
) {
  const { data, error } = await supabaseClient
    .from(apiKeysTable)
    .select('jwt')
    .eq('id', monsterToken)
    .single()

  if (error) {
    console.log('error', error)
    throw new Error(
      extractErrorMessage(error, 'Unknown error from validateApiKey.')
    )
  }

  if (!data) {
    return ''
  } else {
    return data.jwt
  }
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
        const jwt = await validateApiKey(monsterToken, supabase)
        if (jwt) {
          // Log the user's use of the jwt with timestamp, we don't need to await this
          supabase.rpc('log_api_use', {
            api_key: monsterToken,
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
