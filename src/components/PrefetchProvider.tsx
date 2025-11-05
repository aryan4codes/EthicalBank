'use client'

import { useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import { dataPrefetchService } from '@/lib/data-prefetch'

/**
 * Prefetch Provider - Preloads dashboard data when user is authenticated
 */
export function PrefetchProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()
  const pathname = usePathname()
  const prefetchedRef = useRef(false)

  useEffect(() => {
    if (!isLoaded || !user?.id) return

    // Prefetch dashboard data when user is authenticated
    if (!prefetchedRef.current) {
      prefetchedRef.current = true
      // Prefetch immediately
      dataPrefetchService.prefetchDashboard(user.id)
      
      // Also prefetch on idle (when browser is not busy)
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        requestIdleCallback(
          () => {
            dataPrefetchService.prefetchDashboard(user.id)
          },
          { timeout: 2000 }
        )
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
          dataPrefetchService.prefetchDashboard(user.id)
        }, 1000)
      }
    }

    // Prefetch when navigating to dashboard
    if (pathname === '/' && user?.id) {
      dataPrefetchService.prefetchDashboard(user.id)
    }
  }, [isLoaded, user?.id, pathname])

  return <>{children}</>
}

