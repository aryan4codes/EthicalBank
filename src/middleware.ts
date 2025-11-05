import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
// Using (.*) pattern to allow catch-all routes for Clerk
const isPublicRoute = createRouteMatcher([
  '/login(.*)',
  '/register(.*)',
  '/api/auth(.*)',
  '/api/simple-test(.*)',
  '/api/health(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Protect all routes except public ones
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
  
  // Add CORS headers to all responses
  const response = NextResponse.next()
  const origin = req.headers.get('origin') || '*'
  
  response.headers.set('Access-Control-Allow-Origin', origin)
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  response.headers.set('Access-Control-Allow-Headers', '*')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Expose-Headers', '*')
  response.headers.set('Access-Control-Max-Age', '3600')
  
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: response.headers,
    })
  }
  
  return response
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
