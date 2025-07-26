"use client";

import { useState } from "react";
import { useConnect } from "wagmi";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  Smartphone,
  Globe,
  ExternalLink,
  Download,
  CheckCircle,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Define all supported wallets
const SUPPORTED_WALLETS = [
  {
    id: "metamask",
    name: "MetaMask",
    icon: "🦊",
    description: "Most popular Ethereum wallet",
    type: "ethereum",
    url: "https://metamask.io/download/",
    popular: true,
  },
  {
    id: "phantom",
    name: "Phantom",
    icon: "👻",
    description: "Most popular Solana wallet",
    type: "solana",
    url: "https://phantom.app/",
    popular: true,
  },
  {
    id: "zerion",
    name: "Zerion",
    icon: "🔷",
    description: "DeFi wallet for all chains",
    type: "ethereum",
    url: "https://zerion.io/",
    popular: false,
  },
  {
    id: "bitget",
    name: "Bitget Wallet",
    icon: "🟡",
    description: "Multi-chain wallet",
    type: "ethereum",
    url: "https://web3.bitget.com/",
    popular: false,
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    icon: "🔗",
    description: "Connect any mobile wallet",
    type: "both",
    url: "https://walletconnect.com/",
    popular: false,
  },
  {
    id: "solflare",
    name: "Solflare",
    icon: "☀️",
    description: "Feature-rich Solana wallet",
    type: "solana",
    url: "https://solflare.com/",
    popular: false,
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    icon: "🔵",
    description: "Secure crypto wallet",
    type: "ethereum",
    url: "https://wallet.coinbase.com/",
    popular: false,
  },
];

export function WalletConnectModal({
  isOpen,
  onClose,
}: WalletConnectModalProps) {
  const { toast } = useToast();

  // Ethereum wallet connections
  const { connectors, connect: connectEthereum, isPending } = useConnect();

  // Solana wallet connections
  const { wallets, select: selectSolana } = useWallet();

  const handleWalletConnect = async (wallet: any) => {
    try {
      if (wallet.type === "ethereum" || wallet.type === "both") {
        // Handle Ethereum wallet connection
        const connector = connectors.find(
          (c) =>
            c.name.toLowerCase().includes(wallet.id) ||
            c.name.toLowerCase().includes(wallet.name.toLowerCase())
        );
        if (connector) {
          await connectEthereum({ connector });
        } else {
          // Fallback for WalletConnect
          const wcConnector = connectors.find(
            (c) => c.name === "WalletConnect"
          );
          if (wcConnector) {
            await connectEthereum({ connector: wcConnector });
          }
        }
      } else if (wallet.type === "solana") {
        // Handle Solana wallet connection
        const solanaWallet = wallets.find(
          (w) =>
            w.adapter.name.toLowerCase().includes(wallet.id) ||
            w.adapter.name.toLowerCase().includes(wallet.name.toLowerCase())
        );
        if (solanaWallet) {
          selectSolana(solanaWallet.adapter.name);
        }
      }

      onClose();
      toast({
        title: "Success",
        description: `${wallet.name} connected successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to connect ${wallet.name}`,
        variant: "destructive",
      });
    }
  };

  const getWalletStatus = (wallet: any) => {
    if (wallet.type === "ethereum" || wallet.type === "both") {
      const connector = connectors.find(
        (c) =>
          c.name.toLowerCase().includes(wallet.id) ||
          c.name.toLowerCase().includes(wallet.name.toLowerCase())
      );
      return connector?.ready ? "available" : "unavailable";
    } else if (wallet.type === "solana") {
      const solanaWallet = wallets.find(
        (w) =>
          w.adapter.name.toLowerCase().includes(wallet.id) ||
          w.adapter.name.toLowerCase().includes(wallet.name.toLowerCase())
      );
      return solanaWallet?.adapter.readyState === WalletReadyState.Installed
        ? "available"
        : "unavailable";
    }
    return "unavailable";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return (
          <Badge variant="secondary" className="text-xs">
            Available
          </Badge>
        );
      case "unavailable":
        return (
          <Badge variant="outline" className="text-xs text-gray-500">
            Install
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mx-4 max-w-md max-h-[80vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              Connect Wallet
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {SUPPORTED_WALLETS.map((wallet) => {
            const status = getWalletStatus(wallet);
            return (
              <Card
                key={wallet.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleWalletConnect(wallet)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                        {wallet.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-sm">{wallet.name}</h3>
                          {wallet.popular && (
                            <Badge variant="secondary" className="text-xs">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {wallet.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(status)}
                      {status === "unavailable" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(wallet.url, "_blank");
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-gray-500 text-center">
            Don't have a wallet?{" "}
            <Button
              variant="link"
              className="text-xs p-0 h-auto"
              onClick={() =>
                window.open("https://metamask.io/download/", "_blank")
              }
            >
              Learn more
            </Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
