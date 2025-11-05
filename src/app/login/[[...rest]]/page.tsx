'use client'

import { SignIn } from '@clerk/nextjs'
import { Shield } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome to EthicalBank
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Sign in to your account
          </p>
        </div>

        {/* Clerk SignIn Component */}
        <div className="flex justify-center">
          <SignIn
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-lg",
              },
            }}
            routing="path"
            path="/login"
            signUpUrl="/register"
            afterSignInUrl="/"
          />
        </div>

        {/* Features */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            🔒 Secured with end-to-end encryption<br/>
            🤖 AI-powered transparent banking<br/>
            🛡️ Your data, your control
          </p>
        </div>
      </div>
    </div>
  )
}

