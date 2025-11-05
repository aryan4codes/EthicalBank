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
  const [checking, setChecking] = useState(true)
  const [needsCompletion, setNeedsCompletion] = useState(false)

  useEffect(() => {
    async function check() {
      if (!isLoaded || !user) {
        setChecking(false)
        return
      }

      // Don't check completion on settings page - allow access
      if (pathname === '/settings') {
        setChecking(false)
        return
      }

      try {
        const completion = await checkCompletion()
        if (completion && !completion.profileCompleted) {
          setNeedsCompletion(true)
        } else {
          setNeedsCompletion(false)
        }
      } catch (error) {
        console.error('Failed to check profile completion:', error)
        // Don't block if check fails
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

  // Allow access to settings page even if profile incomplete
  if (needsCompletion && pathname !== '/settings') {
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

