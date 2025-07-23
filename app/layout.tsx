"use client"

import type React from "react"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { clusterApiUrl } from '@solana/web3.js'
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
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
              <ConnectionProvider endpoint={endpoint}>
                <SolanaWalletProvider wallets={wallets} autoConnect>
                  <WalletModalProvider>
                    <WalletProvider>
                      {children}
                      <Toaster />
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
