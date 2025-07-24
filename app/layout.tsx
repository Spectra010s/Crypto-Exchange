"use client"

import type React from "react"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Toaster } from "@/components/ui/toaster"
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { clusterApiUrl } from '@solana/web3.js'
import { ThemeProvider } from 'next-themes'
import { wagmiConfig, wallets, endpoint } from '@/lib/web3-config'
import { WalletProvider } from '@/hooks/use-wallet'
import './globals.css'

// Import wallet adapter CSS
require('@solana/wallet-adapter-react-ui/styles.css')

const queryClient = new QueryClient()

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
              <head>
          <title>Crypto Exchange App</title>
          <meta name="description" content="A modern crypto exchange application" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover" />
          
    <html lang="en" className="h-full">
      <head>
        <title>Biaz - Crypto Exchange</title>
        <meta name="description" content="Biaz - A modern crypto exchange application for seamless trading" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Biaz" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="icon" href="/favicon.ico" />
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className="h-full full-viewport overflow-hidden">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
              <ConnectionProvider endpoint={endpoint}>
                <SolanaWalletProvider wallets={wallets} autoConnect>
                  <WalletModalProvider>
                    <WalletProvider>
                      <div className="h-full full-viewport bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900 overflow-hidden">
                        {children}
                        <Toaster />
                      </div>
                    </WalletProvider>
                  </WalletModalProvider>
                </SolanaWalletProvider>
              </ConnectionProvider>
            </QueryClientProvider>
          </WagmiProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
