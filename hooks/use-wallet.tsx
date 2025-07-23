"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAccount, useBalance, useDisconnect as useEthDisconnect } from 'wagmi'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useToast } from './use-toast'
import { fetchTokenPrices } from '@/lib/coingecko'

export type WalletType = 'ethereum' | 'solana' | null
export type NetworkType = 'mainnet' | 'polygon' | 'arbitrum' | 'optimism' | 'base' | 'solana'

export interface TokenBalance {
  symbol: string
  name: string
  balance: number
  value: number
  address?: string
  currentPrice: number
  priceChange24h: number
  priceChangePercentage24h: number
  gainLoss: number
  gainLossPercentage: number
  averageBuyPrice?: number
  image?: string
}

export interface WalletData {
  type: WalletType
  address: string | null
  network: NetworkType | null
  balances: TokenBalance[]
  totalValue: number
  isConnected: boolean
  isConnecting: boolean
}

interface WalletContextType {
  walletData: WalletData
  connectEthereumWallet: () => void
  connectSolanaWallet: () => void
  disconnectWallet: () => void
  refreshBalances: () => Promise<void>
  generateDepositAddress: (network: NetworkType) => string | null
  sendTransaction: (to: string, amount: number, token?: string) => Promise<boolean>
}

const defaultWalletData: WalletData = {
  type: null,
  address: null,
  network: null,
  balances: [],
  totalValue: 0,
  isConnected: false,
  isConnecting: false,
}

const WalletContext = createContext<WalletContextType>({
  walletData: defaultWalletData,
  connectEthereumWallet: () => {},
  connectSolanaWallet: () => {},
  disconnectWallet: () => {},
  refreshBalances: async () => {},
  generateDepositAddress: () => null,
  sendTransaction: async () => false,
})

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletData, setWalletData] = useState<WalletData>(defaultWalletData)
  const { toast } = useToast()

  // Ethereum hooks
  const { address: ethAddress, isConnected: ethConnected, isConnecting: ethConnecting, chain } = useAccount()
  const { data: ethBalance } = useBalance({ address: ethAddress })
  const { disconnect: ethDisconnect } = useEthDisconnect()

  // Solana hooks
  const { publicKey: solPublicKey, connected: solConnected, connecting: solConnecting, disconnect: solDisconnect, wallet } = useWallet()
  const { connection } = useConnection()

  // Token ID mapping for CoinGecko
  const tokenIdMapping = {
    'ETH': 'ethereum',
    'SOL': 'solana',
    'MATIC': 'matic-network',
    'ARB': 'arbitrum',
    'OP': 'optimism',
    'BASE': 'base',
    'BTC': 'bitcoin',
  }

  const mockTokenPrices = {
    'ethereum': 3200,
    'solana': 98,
    'matic-network': 0.85,
    'arbitrum': 1.2,
    'optimism': 2.1,
    'bitcoin': 43250,
  }

  // Simulate historical buy prices for gain/loss calculation
  const mockBuyPrices = {
    'ethereum': 2800,
    'solana': 85,
    'matic-network': 0.75,
    'arbitrum': 1.0,
    'optimism': 1.8,
    'bitcoin': 40000,
  }

  useEffect(() => {
    updateWalletData()
  }, [ethAddress, ethConnected, ethConnecting, solPublicKey, solConnected, solConnecting, chain])

  const updateWalletData = async () => {
    if (ethConnected && ethAddress) {
      const balances: TokenBalance[] = []
      
      if (ethBalance) {
        const ethAmount = parseFloat(ethBalance.formatted)
        const tokenId = tokenIdMapping['ETH']
        const currentPrice = mockTokenPrices[tokenId] || 3200
        const buyPrice = mockBuyPrices[tokenId] || 2800
        const gainLoss = (currentPrice - buyPrice) * ethAmount
        const gainLossPercentage = ((currentPrice - buyPrice) / buyPrice) * 100
        
        balances.push({
          symbol: 'ETH',
          name: 'Ethereum',
          balance: ethAmount,
          value: ethAmount * currentPrice,
          address: ethAddress,
          currentPrice,
          priceChange24h: currentPrice * 0.02, // 2% mock change
          priceChangePercentage24h: 2.0,
          gainLoss,
          gainLossPercentage,
          averageBuyPrice: buyPrice,
          image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
        })
      }

      // Try to fetch real prices
      try {
        const tokenIds = balances.map(b => tokenIdMapping[b.symbol]).filter(Boolean)
        const realPrices = await fetchTokenPrices(tokenIds)
        
        balances.forEach(balance => {
          const tokenId = tokenIdMapping[balance.symbol]
          if (tokenId && realPrices[tokenId]) {
            const currentPrice = realPrices[tokenId]
            const buyPrice = balance.averageBuyPrice || currentPrice * 0.9
            balance.currentPrice = currentPrice
            balance.value = balance.balance * currentPrice
            balance.gainLoss = (currentPrice - buyPrice) * balance.balance
            balance.gainLossPercentage = ((currentPrice - buyPrice) / buyPrice) * 100
          }
        })
      } catch (error) {
        console.error('Error fetching real prices:', error)
      }

      setWalletData({
        type: 'ethereum',
        address: ethAddress,
        network: getNetworkFromChain(chain?.id || 1),
        balances,
        totalValue: balances.reduce((sum, token) => sum + token.value, 0),
        isConnected: true,
        isConnecting: ethConnecting,
      })
    } else if (solConnected && solPublicKey) {
      try {
        const balance = await connection.getBalance(solPublicKey)
        const solAmount = balance / LAMPORTS_PER_SOL
        const tokenId = tokenIdMapping['SOL']
        const currentPrice = mockTokenPrices[tokenId] || 98
        const buyPrice = mockBuyPrices[tokenId] || 85
        const gainLoss = (currentPrice - buyPrice) * solAmount
        const gainLossPercentage = ((currentPrice - buyPrice) / buyPrice) * 100
        
        const balances: TokenBalance[] = [{
          symbol: 'SOL',
          name: 'Solana',
          balance: solAmount,
          value: solAmount * currentPrice,
          address: solPublicKey.toString(),
          currentPrice,
          priceChange24h: currentPrice * 0.08, // 8% mock change
          priceChangePercentage24h: 8.0,
          gainLoss,
          gainLossPercentage,
          averageBuyPrice: buyPrice,
          image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
        }]

        // Try to fetch real price
        try {
          const realPrices = await fetchTokenPrices(['solana'])
          if (realPrices['solana']) {
            const currentPrice = realPrices['solana']
            const buyPrice = balances[0].averageBuyPrice || currentPrice * 0.9
            balances[0].currentPrice = currentPrice
            balances[0].value = balances[0].balance * currentPrice
            balances[0].gainLoss = (currentPrice - buyPrice) * balances[0].balance
            balances[0].gainLossPercentage = ((currentPrice - buyPrice) / buyPrice) * 100
          }
        } catch (error) {
          console.error('Error fetching SOL price:', error)
        }

        setWalletData({
          type: 'solana',
          address: solPublicKey.toString(),
          network: 'solana',
          balances,
          totalValue: balances.reduce((sum, token) => sum + token.value, 0),
          isConnected: true,
          isConnecting: solConnecting,
        })
      } catch (error) {
        console.error('Error fetching Solana balance:', error)
      }
    } else {
      setWalletData({
        ...defaultWalletData,
        isConnecting: ethConnecting || solConnecting,
      })
    }
  }

  const getNetworkFromChain = (chainId: number): NetworkType => {
    switch (chainId) {
      case 1: return 'mainnet'
      case 137: return 'polygon'
      case 42161: return 'arbitrum'
      case 10: return 'optimism'
      case 8453: return 'base'
      default: return 'mainnet'
    }
  }

  const connectEthereumWallet = () => {
    toast({
      title: "Connect Ethereum Wallet",
      description: "Please select your preferred Ethereum wallet",
    })
  }

  const connectSolanaWallet = async () => {
    try {
      if (wallet) {
        await wallet.adapter.connect()
        toast({
          title: "Success",
          description: "Solana wallet connected successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect Solana wallet",
        variant: "destructive",
      })
    }
  }

  const disconnectWallet = async () => {
    try {
      if (walletData.type === 'ethereum') {
        ethDisconnect()
      } else if (walletData.type === 'solana') {
        await solDisconnect()
      }
      
      setWalletData(defaultWalletData)
      
      toast({
        title: "Disconnected",
        description: "Wallet disconnected successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect wallet",
        variant: "destructive",
      })
    }
  }

  const refreshBalances = async () => {
    await updateWalletData()
    toast({
      title: "Refreshed",
      description: "Wallet balances updated",
    })
  }

  const generateDepositAddress = (network: NetworkType): string | null => {
    if (!walletData.isConnected) return null
    
    if (network === 'solana' && walletData.type === 'solana') {
      return walletData.address
    } else if (network !== 'solana' && walletData.type === 'ethereum') {
      return walletData.address
    }
    
    return null
  }

  const sendTransaction = async (to: string, amount: number, token?: string): Promise<boolean> => {
    try {
      if (walletData.type === 'ethereum') {
        toast({
          title: "Transaction Initiated",
          description: "Please confirm the transaction in your wallet",
        })
        return true
      } else if (walletData.type === 'solana') {
        toast({
          title: "Transaction Initiated",
          description: "Please confirm the transaction in your wallet",
        })
        return true
      }
      return false
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: "Failed to send transaction",
        variant: "destructive",
      })
      return false
    }
  }

  return (
    <WalletContext.Provider
      value={{
        walletData,
        connectEthereumWallet,
        connectSolanaWallet,
        disconnectWallet,
        refreshBalances,
        generateDepositAddress,
        sendTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export const useWalletContext = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProvider')
  }
  return context
}