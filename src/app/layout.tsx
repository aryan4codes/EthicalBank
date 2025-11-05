import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from '@clerk/nextjs'
import { AuthProvider } from '@/contexts/AuthContext'
import { LoadingProvider } from '@/contexts/LoadingContext'
import { PrefetchProvider } from '@/components/PrefetchProvider'
import ProfileCompletionCheck from '@/components/ProfileCompletionCheck'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'EthicalBank - Transparent AI-Powered Banking',
  description: 'A modern banking platform with ethical AI transparency and user consent management.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <AuthProvider>
            <LoadingProvider>
              <PrefetchProvider>
                <ThemeProvider
                  defaultTheme="light"
                  storageKey="ethical-bank-theme"
                >
                  <ProfileCompletionCheck>
                    {children}
                  </ProfileCompletionCheck>
                </ThemeProvider>
              </PrefetchProvider>
            </LoadingProvider>
          </AuthProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
