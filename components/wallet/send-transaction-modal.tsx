"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, Wallet, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useWalletContext } from "@/hooks/use-wallet"

interface SendTransactionModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SendTransactionModal({ isOpen, onClose }: SendTransactionModalProps) {
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [selectedToken, setSelectedToken] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { walletData, sendTransaction } = useWalletContext()
  const { toast } = useToast()

  const resetForm = () => {
    setRecipient("")
    setAmount("")
    setSelectedToken("")
  }

  const handleSend = async () => {
    if (!recipient || !amount || !selectedToken) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    const selectedBalance = walletData.balances.find(b => b.symbol === selectedToken)
    if (!selectedBalance || Number(amount) > selectedBalance.balance) {
      toast({
        title: "Insufficient Balance",
        description: `You don't have enough ${selectedToken}`,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const success = await sendTransaction(recipient, Number(amount), selectedToken)
      if (success) {
        toast({
          title: "Transaction Sent",
          description: `Successfully sent ${amount} ${selectedToken}`,
        })
        resetForm()
        onClose()
      }
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: "Failed to send transaction",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const validateAddress = (address: string) => {
    if (!address) return false
    
    if (walletData.type === 'ethereum') {
      // Basic Ethereum address validation
      return /^0x[a-fA-F0-9]{40}$/.test(address)
    } else if (walletData.type === 'solana') {
      // Basic Solana address validation (base58, 32-44 characters)
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
    }
    
    return false
  }

  const isValidAddress = validateAddress(recipient)
  const canSend = recipient && amount && selectedToken && isValidAddress && !isLoading

  if (!walletData.isConnected) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Send Transaction
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <Wallet className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Wallet Connected</h3>
            <p className="text-gray-600 mb-4">
              Please connect your wallet first to send transactions.
            </p>
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (walletData.balances.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Send Transaction
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <AlertTriangle className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Tokens Available</h3>
            <p className="text-gray-600 mb-4">
              You don't have any tokens to send. Add funds to your wallet first.
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
            <Send className="w-5 h-5" />
            Send Transaction
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Wallet Info */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Connected Wallet</h4>
                  <p className="text-sm text-gray-600 font-mono">
                    {walletData.address?.slice(0, 6)}...{walletData.address?.slice(-4)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Network</p>
                  <p className="font-medium capitalize">{walletData.network}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Token Selection */}
          <div className="space-y-2">
            <Label htmlFor="token">Select Token</Label>
            <Select value={selectedToken} onValueChange={setSelectedToken}>
              <SelectTrigger>
                <SelectValue placeholder="Choose token to send" />
              </SelectTrigger>
              <SelectContent>
                {walletData.balances.map((balance) => (
                  <SelectItem key={balance.symbol} value={balance.symbol}>
                    <div className="flex items-center justify-between w-full">
                      <span>{balance.symbol} - {balance.name}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {balance.balance.toFixed(6)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recipient Address */}
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              placeholder={
                walletData.type === 'ethereum' 
                  ? "0x..." 
                  : walletData.type === 'solana' 
                    ? "Solana address..." 
                    : "Recipient address..."
              }
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className={`font-mono ${recipient && !isValidAddress ? 'border-red-300' : ''}`}
            />
            {recipient && !isValidAddress && (
              <p className="text-sm text-red-600">
                Invalid {walletData.type} address format
              </p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="flex gap-2">
              <Input
                id="amount"
                type="number"
                step="any"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              {selectedToken && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const balance = walletData.balances.find(b => b.symbol === selectedToken)
                    if (balance) {
                      setAmount(balance.balance.toString())
                    }
                  }}
                >
                  Max
                </Button>
              )}
            </div>
            {selectedToken && (
              <p className="text-sm text-gray-600">
                Available: {walletData.balances.find(b => b.symbol === selectedToken)?.balance.toFixed(6)} {selectedToken}
              </p>
            )}
          </div>

          {/* Transaction Summary */}
          {amount && selectedToken && isValidAddress && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <h4 className="font-medium text-blue-900 mb-2">Transaction Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span>{amount} {selectedToken}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>To:</span>
                    <span className="font-mono">{recipient.slice(0, 6)}...{recipient.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Network:</span>
                    <span className="capitalize">{walletData.network}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Est. Gas Fee:</span>
                    <span>~$2-5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSend} 
              disabled={!canSend}
              className="flex-1"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </div>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-sm text-yellow-800">
              <strong>⚠️ Warning:</strong> Double-check the recipient address and amount. 
              Blockchain transactions are irreversible.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}