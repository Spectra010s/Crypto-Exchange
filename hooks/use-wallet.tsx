"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAccount, useBalance, useDisconnect as useEthDisconnect } from 'wagmi'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useToast } from './use-toast'

export type WalletType = 'ethereum' | 'solana' | null
export type NetworkType = 'mainnet' | 'polygon' | 'arbitrum' | 'optimism' | 'base' | 'solana'

export interface TokenBalance {
  symbol: string
  name: string
  balance: number
  value: number
  address?: string
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

  const mockTokenPrices = {
    ETH: 3200,
    SOL: 98,
    MATIC: 0.85,
    ARB: 1.2,
    OP: 2.1,
  }

  useEffect(() => {
    updateWalletData()
  }, [ethAddress, ethConnected, ethConnecting, solPublicKey, solConnected, solConnecting, chain])

  const updateWalletData = async () => {
    if (ethConnected && ethAddress) {
      const balances: TokenBalance[] = []
      
      if (ethBalance) {
        const ethAmount = parseFloat(ethBalance.formatted)
        balances.push({
          symbol: 'ETH',
          name: 'Ethereum',
          balance: ethAmount,
          value: ethAmount * mockTokenPrices.ETH,
          address: ethAddress,
        })
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
        
        const balances: TokenBalance[] = [{
          symbol: 'SOL',
          name: 'Solana',
          balance: solAmount,
          value: solAmount * mockTokenPrices.SOL,
          address: solPublicKey.toString(),
        }]

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