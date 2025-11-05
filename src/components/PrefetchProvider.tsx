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
    // Disable eager prefetching to avoid parallel request storms.
    // Prefetching is now triggered selectively on sidebar hover.
    if (!isLoaded || !user?.id) return
    prefetchedRef.current = true
  }, [isLoaded, user?.id, pathname])

  return <>{children}</>
}

