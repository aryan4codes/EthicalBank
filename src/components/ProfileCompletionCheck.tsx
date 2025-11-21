'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter, usePathname } from 'next/navigation'
import { useBackendProfile } from '@/hooks/useBackend'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export default function ProfileCompletionCheck({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const { checkCompletion } = useBackendProfile()
  const [checking, setChecking] = useState(false)   
  const [needsCompletion, setNeedsCompletion] = useState(false)

  useEffect(() => {
    async function check() {
      if (!isLoaded || !user) {
        return
      }

      // Don't check completion on settings page - allow access
      if (pathname === '/settings') {
        return
      }

      // Skip blocking check on pages that don't need it
      // Allow these pages to load immediately without checking
      const skipBlockingCheck = [
        '/ai-insights',
        '/ai-chat',
        '/ai-perception',
        '/ai-transparency',
        '/ai-logs',
      ].some(path => pathname.startsWith(path))

      if (skipBlockingCheck) {
        // Skip the check entirely for AI pages to avoid timeout issues
        // These pages don't require profile completion
        return
      }

      // For other pages, check with timeout
      setChecking(true)
      try {
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Profile check timeout')), 5000) // 5 second timeout
        })

        const completion = await Promise.race([
          checkCompletion() as Promise<{ profileCompleted?: boolean } | null>,
          timeoutPromise as Promise<never>
        ])

        if (completion && !completion.profileCompleted) {
          setNeedsCompletion(true)
        } else {
          setNeedsCompletion(false)
        }
      } catch (error) {
        console.error('Failed to check profile completion:', error)
        // Don't block if check fails - allow user to proceed
        setNeedsCompletion(false)
      } finally {
        setChecking(false)
      }
    }

    check()
  }, [isLoaded, user, checkCompletion, pathname])

  const handleGoToSettings = () => {
    router.push('/settings')
    // Force a small delay to ensure navigation happens
    setTimeout(() => {
      if (window.location.pathname !== '/settings') {
        window.location.href = '/settings'
      }
    }, 100)
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Skip blocking check on AI-related pages - allow access even if profile incomplete
  const skipBlockingCheck = [
    '/ai-insights',
    '/ai-chat',
    '/ai-perception',
    '/ai-transparency',
    '/ai-logs',
  ].some(path => pathname.startsWith(path))

  // Allow access to settings page even if profile incomplete
  if (needsCompletion && pathname !== '/settings' && !skipBlockingCheck) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              Please complete your profile to continue using EthicalBank services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleGoToSettings} 
              className="w-full"
              type="button"
            >
              Go to Profile Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}

