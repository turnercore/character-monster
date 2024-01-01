import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/middleware'

// Define routes that require authentication
const protectedRoutes = ['/testing']

// Middleware configuration
export const config = {
  matcher: [
    '/testing/:path*', // matches /tower and /tower/anything-else
  ],
}

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some((route) => pathname.startsWith(route))
}

function handleUnauthenticatedClient(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone()
  url.pathname = '/login'
  return NextResponse.rewrite(url)
}

export async function middleware(req: NextRequest) {
  try {
    const { supabase } = createClient(req)
    const { data, error } = await supabase.auth.getSession()

    if (isProtectedRoute(req.nextUrl.pathname) && (!data?.session || error)) {
      return handleUnauthenticatedClient(req)
    }

    return NextResponse.next()
  } catch (e) {
    // Handle errors (e.g., Supabase client creation failure)
    return NextResponse.next()
  }
}
