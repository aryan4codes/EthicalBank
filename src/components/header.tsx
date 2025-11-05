'use client'

import { Bell, Search } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { UserButton } from '@clerk/nextjs'

export function Header() {
  return (
    <header className="h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
      <div className="flex h-full items-center justify-between px-6">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search transactions, accounts, or help..."
              className="w-full rounded-md border border-neutral-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-400"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative rounded-md p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              3
            </span>
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Clerk UserButton */}
          <UserButton 
            afterSignOutUrl="/login"
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
                userButtonPopoverCard: "shadow-lg",
              },
            }}
          />
        </div>
      </div>
    </header>
  )
}
