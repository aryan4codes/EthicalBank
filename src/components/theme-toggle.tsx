'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from './theme-provider'
import { useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [showMenu, setShowMenu] = useState(false)

  const handleToggle = () => {
    // Simple toggle between light and dark
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    console.log(`Switching theme from ${theme} to ${newTheme}`)
    setTheme(newTheme)
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-900 transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800"
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Current theme: ${theme}. Click to switch to ${theme === 'dark' ? 'light' : 'dark'} mode.`}
      >
        <Sun className="h-4 w-4 transition-all scale-100 rotate-0 dark:scale-0 dark:-rotate-90" />
        <Moon className="absolute h-4 w-4 transition-all scale-0 rotate-90 dark:scale-100 dark:rotate-0" />
      </button>
    </div>
  )
}
