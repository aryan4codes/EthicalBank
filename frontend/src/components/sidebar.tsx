'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useLoading } from '@/contexts/LoadingContext'
import { useUser } from '@clerk/nextjs'
import { dataPrefetchService } from '@/lib/data-prefetch'
import { 
  Home, 
  CreditCard, 
  PiggyBank, 
  Shield, 
  Brain, 
  Settings,
  FileText,
  BarChart3,
  Bot,
  Loader2,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Eye,
  MessageSquare
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Account overview and summary'
  },
  {
    name: 'Accounts',
    href: '/accounts',
    icon: CreditCard,
    description: 'Manage your bank accounts'
  },
  {
    name: 'Transactions',
    href: '/transactions',
    icon: FileText,
    description: 'View transaction history'
  },
  {
    name: 'Savings',
    href: '/savings',
    icon: PiggyBank,
    description: 'Savings accounts and goals'
  },
  {
    name: 'Loans',
    href: '/loans',
    icon: BarChart3,
    description: 'Loan applications and eligibility checker'
  },
  {
    name: 'Privacy & Control',
    href: '/privacy-control',
    icon: Shield,
    description: 'Manage data privacy settings'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Account and app settings'
  }
]

const aiHubItem = {
  name: 'AI Hub',
  href: '/ai-hub',
  icon: Brain,
  description: 'Central hub for all AI features',
  isHub: true
}

const aiNavigation = [
  {
    name: 'AI Assistant',
    href: '/ai-chat',
    icon: Bot,
    description: 'Chat with AI banking assistant',
    badge: 'New'
  },
  {
    name: 'Financial Insights',
    href: '/ai-insights',
    icon: Sparkles,
    description: 'AI-powered financial analysis'
  },
  {
    name: 'AI Perception',
    href: '/ai-perception',
    icon: Eye,
    description: 'See how AI understands you'
  },
  {
    name: 'Audit Logs',
    href: '/ai-logs',
    icon: FileText,
    description: 'View AI decision trail'
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const { isLoading } = useLoading()
  const { user } = useUser()
  const [aiMenuExpanded, setAiMenuExpanded] = useState(true)

  // Auto-expand AI menu if on an AI page
  const isAIPage = aiNavigation.some(item => pathname === item.href)
  if (isAIPage && !aiMenuExpanded) {
    setAiMenuExpanded(true)
  }

  const handleHover = (href: string) => {
    if (user?.id && pathname !== href) {
      dataPrefetchService.prefetchForRoute(href, user.id)
    }
  }

  return (
    <div className="flex h-full w-64 flex-col bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="ml-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            EthicalBank
          </span>
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="px-6 py-2 border-b border-neutral-200 dark:border-neutral-800 bg-blue-50 dark:bg-blue-950/20">
          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="font-medium">Loading page...</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {/* Main Navigation */}
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onMouseEnter={() => handleHover(item.href)}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
                isLoading && isActive && 'opacity-75'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive
                    ? 'text-blue-500 dark:text-blue-400'
                    : 'text-neutral-400 group-hover:text-neutral-500 dark:text-neutral-500 dark:group-hover:text-neutral-400',
                  isLoading && pathname === item.href && 'animate-pulse'
                )}
              />
              {item.name}
              {isLoading && pathname === item.href && (
                <Loader2 className="ml-auto h-4 w-4 animate-spin text-blue-500" />
              )}
            </Link>
          )
        })}

        {/* AI Section Divider */}
        <div className="pt-4 pb-2">
          <div className="h-px bg-neutral-200 dark:bg-neutral-800" />
        </div>

        {/* AI Hub - Main Entry Point */}
        <Link
          href={aiHubItem.href}
          onMouseEnter={() => handleHover(aiHubItem.href)}
          className={cn(
            'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
            pathname === aiHubItem.href
              ? 'bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 dark:from-purple-950 dark:to-blue-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
              : 'text-neutral-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:from-purple-950 dark:hover:to-blue-950 dark:hover:text-neutral-100'
          )}
        >
          <Brain
            className={cn(
              'mr-3 h-5 w-5 flex-shrink-0',
              pathname === aiHubItem.href
                ? 'text-purple-500 dark:text-purple-400'
                : 'text-neutral-400 group-hover:text-purple-500 dark:text-neutral-500 dark:group-hover:text-purple-400'
            )}
          />
          <span className="flex-1">{aiHubItem.name}</span>
          <Sparkles className="h-4 w-4 text-purple-500 dark:text-purple-400" />
        </Link>

        {/* AI Menu Toggle */}
        <button
          onClick={() => setAiMenuExpanded(!aiMenuExpanded)}
          className={cn(
            'group flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors',
            isAIPage && pathname !== aiHubItem.href
              ? 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
              : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
          )}
        >
          <div className="w-8 flex justify-center mr-1">
            {aiMenuExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
          <span className="flex-1 text-left text-xs font-semibold uppercase tracking-wider">AI Features</span>
          {isAIPage && pathname !== aiHubItem.href && !aiMenuExpanded && (
            <div className="ml-2 h-2 w-2 rounded-full bg-purple-500" />
          )}
        </button>

        {/* AI Sub-Navigation */}
        {aiMenuExpanded && (
          <div className="ml-2 space-y-1 border-l-2 border-purple-200 dark:border-purple-800">
            {aiNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onMouseEnter={() => handleHover(item.href)}
                  className={cn(
                    'group flex items-center pl-8 pr-3 py-2 text-sm font-medium rounded-md transition-colors relative',
                    isActive
                      ? 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
                    isLoading && isActive && 'opacity-75'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-4 w-4 flex-shrink-0',
                      isActive
                        ? 'text-purple-500 dark:text-purple-400'
                        : 'text-neutral-400 group-hover:text-neutral-500 dark:text-neutral-500 dark:group-hover:text-neutral-400',
                      isLoading && pathname === item.href && 'animate-pulse'
                    )}
                  />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs font-semibold rounded bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                      {item.badge}
                    </span>
                  )}
                  {isLoading && pathname === item.href && (
                    <Loader2 className="ml-auto h-4 w-4 animate-spin text-purple-500" />
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </nav>

      {/* Trust Score Widget */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="rounded-lg bg-green-50 dark:bg-green-950 p-3">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="ml-2 text-sm font-medium text-green-900 dark:text-green-100">
              Trust Score
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-green-900 dark:text-green-100">95%</span>
              <span className="text-xs text-green-600 dark:text-green-400">Excellent</span>
            </div>
            <div className="mt-1 h-1 bg-green-200 dark:bg-green-900 rounded-full">
              <div className="h-1 bg-green-500 rounded-full" style={{ width: '95%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
