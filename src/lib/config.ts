/**
 * Global API Configuration
 * Centralized configuration for backend API endpoints
 * Supports environment-based switching between local and production backends
 */

export const API_CONFIG = {
  // Backend API base URL
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
  
  // Frontend API base URL (for internal API routes)
  frontendApiUrl: process.env.NEXT_PUBLIC_FRONTEND_API_URL || '/api',
  
  // API timeout in milliseconds
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10),
  
  // Enable debug logging
  debug: process.env.NEXT_PUBLIC_API_DEBUG === 'true',
}

/**
 * Get the appropriate API base URL
 * @param type - 'backend' for external backend API, 'frontend' for internal Next.js API routes
 * @returns The base URL
 */
export function getApiUrl(type: 'backend' | 'frontend' = 'frontend'): string {
  return type === 'backend' ? API_CONFIG.backendUrl : API_CONFIG.frontendApiUrl
}

/**
 * Log API configuration (only in debug mode)
 */
export function logApiConfig(): void {
  if (API_CONFIG.debug && typeof window !== 'undefined') {
    console.log('[API Config]', {
      backendUrl: API_CONFIG.backendUrl,
      frontendApiUrl: API_CONFIG.frontendApiUrl,
      timeout: API_CONFIG.timeout,
    })
  }
}
