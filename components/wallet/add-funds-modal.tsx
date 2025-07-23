"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, QrCode, ExternalLink, Wallet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useWalletContext, NetworkType } from "@/hooks/use-wallet"

interface AddFundsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddFundsModal({ isOpen, onClose }: AddFundsModalProps) {
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>('mainnet')
  const { walletData, generateDepositAddress } = useWalletContext()
  const { toast } = useToast()

  const networks: { value: NetworkType; label: string; symbol: string; compatible: boolean }[] = [
    { value: 'mainnet', label: 'Ethereum', symbol: 'ETH', compatible: walletData.type === 'ethereum' },
    { value: 'polygon', label: 'Polygon', symbol: 'MATIC', compatible: walletData.type === 'ethereum' },
    { value: 'arbitrum', label: 'Arbitrum', symbol: 'ARB', compatible: walletData.type === 'ethereum' },
    { value: 'optimism', label: 'Optimism', symbol: 'OP', compatible: walletData.type === 'ethereum' },
    { value: 'base', label: 'Base', symbol: 'BASE', compatible: walletData.type === 'ethereum' },
    { value: 'solana', label: 'Solana', symbol: 'SOL', compatible: walletData.type === 'solana' },
  ]

  const availableNetworks = networks.filter(network => network.compatible)
  const depositAddress = generateDepositAddress(selectedNetwork)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    })
  }

  const generateQRCode = () => {
    if (depositAddress) {
      // In a real app, you'd generate a QR code here
      toast({
        title: "QR Code",
        description: "QR code generation would be implemented here",
      })
    }
  }

  const openInExplorer = () => {
    if (!depositAddress) return
    
    let explorerUrl = ''
    switch (selectedNetwork) {
      case 'mainnet':
        explorerUrl = `https://etherscan.io/address/${depositAddress}`
        break
      case 'polygon':
        explorerUrl = `https://polygonscan.com/address/${depositAddress}`
        break
      case 'arbitrum':
        explorerUrl = `https://arbiscan.io/address/${depositAddress}`
        break
      case 'optimism':
        explorerUrl = `https://optimistic.etherscan.io/address/${depositAddress}`
        break
      case 'base':
        explorerUrl = `https://basescan.org/address/${depositAddress}`
        break
      case 'solana':
        explorerUrl = `https://solscan.io/account/${depositAddress}`
        break
    }
    
    if (explorerUrl) {
      window.open(explorerUrl, '_blank')
    }
  }

  if (!walletData.isConnected) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Add Funds
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <Wallet className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Wallet Connected</h3>
            <p className="text-gray-600 mb-4">
              Please connect your wallet first to generate deposit addresses.
            </p>
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Add Funds
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Network Selection */}
          <div className="space-y-3">
            <Label>Select Network</Label>
            <div className="grid grid-cols-2 gap-2">
              {availableNetworks.map((network) => (
                <Button
                  key={network.value}
                  variant={selectedNetwork === network.value ? "default" : "outline"}
                  className="h-auto p-3"
                  onClick={() => setSelectedNetwork(network.value)}
                >
                  <div className="text-center">
                    <div className="font-medium">{network.label}</div>
                    <div className="text-xs opacity-70">{network.symbol}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Deposit Address */}
          {depositAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-2xl">
                    {selectedNetwork === 'solana' ? '☀️' : '🌐'}
                  </span>
                  Deposit Address
                  <Badge variant="secondary">{networks.find(n => n.value === selectedNetwork)?.label}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Your Deposit Address</Label>
                  <div className="flex gap-2">
                    <Input
                      id="address"
                      value={depositAddress}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(depositAddress)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={generateQRCode}
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    QR Code
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={openInExplorer}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Explorer
                  </Button>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="text-sm text-yellow-800">
                    <strong>⚠️ Important:</strong>
                    <ul className="mt-1 space-y-1 list-disc list-inside">
                      <li>Only send {networks.find(n => n.value === selectedNetwork)?.symbol} tokens to this address</li>
                      <li>Sending other tokens may result in permanent loss</li>
                      <li>Minimum deposit: 0.001 {networks.find(n => n.value === selectedNetwork)?.symbol}</li>
                      <li>Transactions require network confirmations</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Binance Quick Buy */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-900">Need to buy crypto?</h4>
                  <p className="text-sm text-blue-700">Purchase directly from Binance</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => window.open('https://www.binance.com/en/buy-sell-crypto', '_blank')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Buy Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}