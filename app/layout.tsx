import React from "react"
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { PWARegister } from '@/components/pwa-register'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  applicationName: 'Axelle a table',
  title: 'Menu de la semaine - Planificateur de repas',
  description: 'Planifiez vos repas de la semaine facilement, puis installez l\'app sur votre iPhone.',
  manifest: '/manifest.webmanifest',
  category: 'food',
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    title: 'Axelle a table',
    statusBarStyle: 'default',
  },
  icons: {
    icon: '/icon',
    apple: '/apple-icon',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f97316',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`font-sans antialiased`}>
        {children}
        <PWARegister />
        <Analytics />
      </body>
    </html>
  )
}
