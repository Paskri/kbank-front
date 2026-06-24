import './globals.css'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import AppShell from '@/components/app-shell'
import { ActiveClientProvider } from '@/context/ActiveClientContext'
import type { Client } from '@/types/client'
import { Toaster } from '@/components/ui/sonner'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Kbank',
  description: "La banque comme vous ne l'avez jamais vue",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const clients: Client[] = []
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Toaster position="top-right" />
        <ActiveClientProvider initialClients={clients}>
          <AppShell>{children}</AppShell>
        </ActiveClientProvider>
      </body>
    </html>
  )
}
