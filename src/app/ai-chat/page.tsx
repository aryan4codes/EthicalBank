'use client'

import { AppLayout } from '@/components/app-layout'
import { AIChatbot } from '@/components/AIChatbot'

export default function AIChatPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            AI Banking Assistant
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Ask me anything about your banking - loans, accounts, transactions, offers, and more!
          </p>
        </div>
        <AIChatbot />
      </div>
    </AppLayout>
  )
}
