/**
 * CORS helper for Next.js API routes
 * Adds CORS headers to responses
 */
import { NextResponse } from 'next/server'

export function addCorsHeaders(response: NextResponse, origin?: string | null): NextResponse {
  // Allow all origins
  const allowedOrigin = origin || '*'
  
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin)
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  response.headers.set('Access-Control-Allow-Headers', '*')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Expose-Headers', '*')
  response.headers.set('Access-Control-Max-Age', '3600')
  
  return response
}

export function handleOptionsRequest(request: Request): NextResponse {
  const response = new NextResponse(null, { status: 200 })
  return addCorsHeaders(response, request.headers.get('origin'))
}

