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
      return connector ? "available" : "not-detected";
    } else if (wallet.type === "solana") {
      const solanaWallet = wallets.find(
        (w) =>
          w.adapter.name.toLowerCase().includes(wallet.id) ||
          w.adapter.name.toLowerCase().includes(wallet.name.toLowerCase())
      );
      if (solanaWallet) {
        switch (solanaWallet.readyState) {
          case WalletReadyState.Installed:
            return "available";
          case WalletReadyState.NotDetected:
            return "not-detected";
          case WalletReadyState.Loadable:
            return "available";
          case WalletReadyState.Unsupported:
            return "unsupported";
          default:
            return "unknown";
        }
      }
      return "not-detected";
    }
    return "unknown";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Available
          </Badge>
        );
      case "not-detected":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            Install Required
          </Badge>
        );
      case "unsupported":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Unsupported
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            Unknown
          </Badge>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Wallet className="w-6 h-6" />
            Connect Wallet
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Popular Wallets Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Popular Wallets
            </h3>
            <div className="space-y-2">
              {SUPPORTED_WALLETS.filter((w) => w.popular).map((wallet) => {
                const status = getWalletStatus(wallet);
                return (
                  <Card
                    key={wallet.id}
                    className="cursor-pointer hover:bg-gray-50 transition-all duration-200 border-2 hover:border-purple-200"
                  >
                    <CardContent className="p-4">
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-auto p-0"
                        onClick={() => handleWalletConnect(wallet)}
                        disabled={status === "unsupported" || isPending}
                      >
                        <div className="flex items-center space-x-3 w-full">
                          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl">
                            <span className="text-2xl">{wallet.icon}</span>
                          </div>
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-base">
                                {wallet.name}
                              </p>
                              {getStatusBadge(status)}
                            </div>
                            <p className="text-sm text-gray-600">
                              {wallet.description}
                            </p>
                          </div>
                          {status === "not-detected" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(wallet.url, "_blank");
                              }}
                              className="flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                              Install
                            </Button>
                          ) : status === "available" ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* All Wallets Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              All Wallets
            </h3>
            <div className="space-y-2">
              {SUPPORTED_WALLETS.filter((w) => !w.popular).map((wallet) => {
                const status = getWalletStatus(wallet);
                return (
                  <Card
                    key={wallet.id}
                    className="cursor-pointer hover:bg-gray-50 transition-all duration-200"
                  >
                    <CardContent className="p-3">
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-auto p-0"
                        onClick={() => handleWalletConnect(wallet)}
                        disabled={status === "unsupported" || isPending}
                      >
                        <div className="flex items-center space-x-3 w-full">
                          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
                            <span className="text-xl">{wallet.icon}</span>
                          </div>
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">
                                {wallet.name}
                              </p>
                              {getStatusBadge(status)}
                            </div>
                            <p className="text-xs text-gray-500">
                              {wallet.description}
                            </p>
                          </div>
                          {status === "not-detected" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(wallet.url, "_blank");
                              }}
                              className="text-xs"
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
                );
              })}
            </div>
          </div>

          <div className="text-xs text-gray-500 text-center pt-4 border-t">
            By connecting a wallet, you agree to our Terms of Service and
            Privacy Policy
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
