"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Globe, Zap, Triangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface NetworkSelectorProps {
  currentNetwork?: string
  onNetworkChange?: (network: string) => void
}

const networks = [
  { id: "ethereum", name: "Ethereum", symbol: "ETH", icon: Globe, color: "bg-blue-500" },
  { id: "polygon", name: "Polygon", symbol: "MATIC", icon: Triangle, color: "bg-purple-500" },
  { id: "solana", name: "Solana", symbol: "SOL", icon: Zap, color: "bg-yellow-500" }
]

export function NetworkSelector({ currentNetwork = "ethereum", onNetworkChange }: NetworkSelectorProps) {
  const [selectedNetwork, setSelectedNetwork] = useState(currentNetwork)
  const { toast } = useToast()

  const handleNetworkSelect = (networkId: string) => {
    setSelectedNetwork(networkId)
    onNetworkChange?.(networkId)
    
    const network = networks.find(n => n.id === networkId)
    toast({
      title: "Network Changed",
      description: `Switched to ${network?.name}`,
    })
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-2">Select Network</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Choose your blockchain network
        </p>
      </div>

      <div className="space-y-3">
        {networks.map((network) => {
          const isSelected = selectedNetwork === network.id
          const IconComponent = network.icon
          
          return (
            <Card
              key={network.id}
              className={`cursor-pointer transition-all content-overlay ${
                isSelected ? "ring-2 ring-purple-500" : "hover:ring-1 hover:ring-purple-300"
              }`}
              onClick={() => handleNetworkSelect(network.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${network.color}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{network.name}</h3>
                      <Badge variant="secondary" className="text-xs">{network.symbol}</Badge>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <Check className="w-5 h-5 text-purple-500" />
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}