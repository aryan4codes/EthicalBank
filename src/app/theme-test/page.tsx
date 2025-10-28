'use client'

import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sun, Moon, Monitor } from 'lucide-react'

export default function ThemeTestPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 transition-colors">
      <div className="container mx-auto p-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Theme Test Page</CardTitle>
            <CardDescription>
              Current theme: <strong>{theme}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-neutral-900 dark:text-neutral-100">
              This text should change between black (light mode) and white (dark mode).
            </div>
            
            <div className="flex gap-4">
              <Button 
                onClick={() => setTheme('light')}
                variant={theme === 'light' ? 'default' : 'outline'}
              >
                <Sun className="w-4 h-4 mr-2" />
                Light
              </Button>
              
              <Button 
                onClick={() => setTheme('dark')}
                variant={theme === 'dark' ? 'default' : 'outline'}
              >
                <Moon className="w-4 h-4 mr-2" />
                Dark
              </Button>
              
              <Button 
                onClick={() => setTheme('system')}
                variant={theme === 'system' ? 'default' : 'outline'}
              >
                <Monitor className="w-4 h-4 mr-2" />
                System
              </Button>
            </div>

            <div className="border border-neutral-200 dark:border-neutral-700 p-4 rounded-lg">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                Test Elements
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-2">
                This card should have a white background in light mode and dark background in dark mode.
              </p>
              <div className="bg-neutral-100 dark:bg-neutral-800 p-2 rounded text-center">
                Background test area
              </div>
            </div>

            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              HTML class applied: <code className="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">
                {typeof document !== 'undefined' ? document.documentElement.className : 'Loading...'}
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
