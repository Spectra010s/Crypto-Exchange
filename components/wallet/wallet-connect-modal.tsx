"use client"

import { useState } from "react"
import { useConnect } from "wagmi"
import { WalletReadyState } from "@solana/wallet-adapter-base"
import { useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, Smartphone, Globe, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface WalletConnectModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WalletConnectModal({ isOpen, onClose }: WalletConnectModalProps) {
  const [selectedTab, setSelectedTab] = useState<'ethereum' | 'solana'>('ethereum')
  const { toast } = useToast()

  // Ethereum wallet connections
  const { connectors, connect: connectEthereum, isPending } = useConnect()

  // Solana wallet connections
  const { wallets, select: selectSolana } = useWallet()

  const handleEthereumConnect = async (connector: any) => {
    try {
      await connectEthereum({ connector })
      onClose()
      toast({
        title: "Success",
        description: "Ethereum wallet connected successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect Ethereum wallet",
        variant: "destructive",
      })
    }
  }

  const handleSolanaConnect = async (walletName: string) => {
    try {
      selectSolana(walletName)
      onClose()
      toast({
        title: "Success",
        description: "Solana wallet selected successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect Solana wallet",
        variant: "destructive",
      })
    }
  }

  const getWalletIcon = (walletName: string) => {
    const name = walletName.toLowerCase()
    if (name.includes('metamask')) return '🦊'
    if (name.includes('coinbase')) return '🔵'
    if (name.includes('walletconnect')) return '🔗'
    if (name.includes('phantom')) return '👻'
    if (name.includes('solflare')) return '☀️'
    return '💼'
  }

  const getReadyStateText = (readyState: WalletReadyState) => {
    switch (readyState) {
      case WalletReadyState.Installed:
        return { text: "Installed", color: "bg-green-100 text-green-800" }
      case WalletReadyState.NotDetected:
        return { text: "Not Detected", color: "bg-gray-100 text-gray-800" }
      case WalletReadyState.Loadable:
        return { text: "Loadable", color: "bg-blue-100 text-blue-800" }
      case WalletReadyState.Unsupported:
        return { text: "Unsupported", color: "bg-red-100 text-red-800" }
      default:
        return { text: "Unknown", color: "bg-gray-100 text-gray-800" }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Connect Wallet
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Wallet Type Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant={selectedTab === 'ethereum' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1"
              onClick={() => setSelectedTab('ethereum')}
            >
              <Globe className="w-4 h-4 mr-2" />
              Ethereum
            </Button>
            <Button
              variant={selectedTab === 'solana' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1"
              onClick={() => setSelectedTab('solana')}
            >
              ☀️ Solana
            </Button>
          </div>

          {/* Ethereum Wallets */}
          {selectedTab === 'ethereum' && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Choose Ethereum Wallet</h3>
              {connectors.map((connector) => (
                <Card key={connector.uid} className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardContent className="p-3">
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-auto p-0"
                      onClick={() => handleEthereumConnect(connector)}
                      disabled={isPending}
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <span className="text-2xl">{getWalletIcon(connector.name)}</span>
                        <div className="flex-1 text-left">
                          <p className="font-medium">{connector.name}</p>
                          <p className="text-sm text-gray-500">
                            {connector.name === 'WalletConnect' && 'Scan QR code with your mobile wallet'}
                            {connector.name === 'MetaMask' && 'Connect using MetaMask browser extension'}
                            {connector.name === 'Coinbase Wallet' && 'Connect using Coinbase Wallet'}
                            {connector.name === 'Injected' && 'Connect using browser wallet'}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </div>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Solana Wallets */}
          {selectedTab === 'solana' && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Choose Solana Wallet</h3>
              {wallets.map((wallet) => {
                const readyState = getReadyStateText(wallet.readyState)
                return (
                  <Card key={wallet.adapter.name} className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <CardContent className="p-3">
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-auto p-0"
                        onClick={() => handleSolanaConnect(wallet.adapter.name)}
                        disabled={wallet.readyState === WalletReadyState.Unsupported}
                      >
                        <div className="flex items-center space-x-3 w-full">
                          <span className="text-2xl">{getWalletIcon(wallet.adapter.name)}</span>
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{wallet.adapter.name}</p>
                              <Badge variant="secondary" className={readyState.color}>
                                {readyState.text}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">
                              {wallet.adapter.name === 'Phantom' && 'Most popular Solana wallet'}
                              {wallet.adapter.name === 'Solflare' && 'Feature-rich Solana wallet'}
                              {wallet.adapter.name.includes('WalletConnect') && 'Connect with mobile app'}
                            </p>
                          </div>
                          {wallet.readyState === WalletReadyState.NotDetected ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                window.open(wallet.adapter.url, '_blank')
                              }}
                            >
                              Install
                            </Button>
                          ) : (
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          <div className="text-xs text-gray-500 text-center pt-2">
            By connecting a wallet, you agree to our Terms of Service and Privacy Policy
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}