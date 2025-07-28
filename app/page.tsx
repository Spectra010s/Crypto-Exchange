"use client";

import { useState, useEffect } from "react";
import {
  Home,
  TrendingUp,
  Wallet,
  User,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Send,
  Eye,
  EyeOff,
  Settings,
  LogOut,
  Bell,
  Shield,
  HelpCircle,
  ExternalLink,
  Edit,
  MessageCircle,
  Mail,
  Phone,
  Camera,
  Upload,
  History,
  Image as ImageIcon,
  Globe,
  ChevronDown,
  QrCode,
  Key,
  Fingerprint,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AuthForm } from "@/components/auth/auth-form";
import { CustomAuthProvider, useCustomAuth } from "@/hooks/use-custom-auth";
import { fetchCryptocurrencies, type CoinData } from "@/lib/coingecko";
import { useToast } from "@/hooks/use-toast";
import { useWalletContext } from "@/hooks/use-wallet";
import { WalletManager } from "@/components/wallet/wallet-manager";
import { AddFundsModal } from "@/components/wallet/add-funds-modal";
import { SendTransactionModal } from "@/components/wallet/send-transaction-modal";
import { SettingsPage } from "@/components/settings/settings-page";
import { Logo } from "@/components/ui/logo";
import { BINANCE_BUY_URL, BINANCE_SELL_URL } from "@/lib/web3-config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Transaction data - in production, fetch from blockchain APIs
const transactions = [
  {
    id: 1,
    type: "buy",
    coin: "BTC",
    amount: 0.025,
    value: 1081.25,
    date: "2024-01-15",
  },
  {
    id: 2,
    type: "sell",
    coin: "ETH",
    amount: 1.5,
    value: 4021.13,
    date: "2024-01-14",
  },
  {
    id: 3,
    type: "buy",
    coin: "SOL",
    amount: 25,
    value: 2461.25,
    date: "2024-01-13",
  },
  {
    id: 4,
    type: "send",
    coin: "BTC",
    amount: 0.01,
    value: 432.5,
    date: "2024-01-12",
  },
];

function CryptoExchangeApp() {
  const { user, loading, logout, updateProfile } = useCustomAuth();
  const { walletData, disconnectWallet, refreshBalances } = useWalletContext();
  const [activeTab, setActiveTab] = useState("home");
  const [activeSubTab, setActiveSubTab] = useState("");
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [marketData, setMarketData] = useState<CoinData[]>([]);
  const [loadingMarketData, setLoadingMarketData] = useState(true);
  const [walletManagerOpen, setWalletManagerOpen] = useState(false);
  const [addFundsModalOpen, setAddFundsModalOpen] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [profilePicModalOpen, setProfilePicModalOpen] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [transactionNotifications, setTransactionNotifications] =
    useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadMarketData = async () => {
      try {
        setLoadingMarketData(true);
        const data = await fetchCryptocurrencies(5);
        setMarketData(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load market data",
          variant: "destructive",
        });
      } finally {
        setLoadingMarketData(false);
      }
    };

    if (user) {
      loadMarketData();
    }
  }, [user, toast]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const handleProfilePicUpload = async () => {
    // In production, implement real profile picture upload
    toast({
      title: "Profile Picture",
      description: "Profile picture upload will be available in production",
    });
    setProfilePicModalOpen(false);
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setPushNotifications(true);
        toast({
          title: "Success",
          description: "Push notifications enabled",
        });
      } else {
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings",
          variant: "destructive",
        });
      }
    }
  };

  // Add WhatsApp integration function
  const openWhatsApp = (action: "buy" | "sell") => {
    const phone = "09030700024";
    const message =
      action === "buy" ? "I want to buy crypto" : "I want to sell crypto";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="h-full full-viewport flex items-center justify-center">
        <div className="text-center space-y-4">
          <Logo size="xl" />
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-full full-viewport">
        <AuthForm onAuthSuccess={() => {}} />
      </div>
    );
  }

  const HomeScreen = () => (
    <div className="space-y-4 sm:space-y-6 animate-fade-in h-full overflow-y-auto scrollbar-hide">
      {/* Header with Logo */}
      <div className="flex items-center justify-between mobile-container pt-2">
        <Logo size="md" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setBalanceVisible(!balanceVisible)}
          className="text-gray-600 touch-target"
        >
          {balanceVisible ? (
            <Eye className="w-5 h-5" />
          ) : (
            <EyeOff className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Welcome Section - Mobile-First */}
      <Card className="mobile-card gradient-purple text-white shadow-lg mx-4">
        <CardContent className="mobile-container">
          <div className="space-y-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">
                Welcome back, {user.displayName || user.email?.split("@")[0]}!
              </h1>
              <p className="text-purple-100 text-sm sm:text-base mt-2">
                {walletData.isConnected
                  ? "Your Web3 portfolio is ready!"
                  : "Connect your wallet to start trading!"}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="flex-1">
                <p className="text-purple-200 text-xs sm:text-sm">
                  Portfolio Value
                </p>
                <p className="text-2xl sm:text-3xl font-bold mt-1">
                  {walletData.isConnected
                    ? balanceVisible
                      ? `$${walletData.totalValue.toFixed(2)}`
                      : "••••••••"
                    : "Connect Wallet"}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-purple-200 text-xs sm:text-sm">
                  Wallet Status
                </p>
                <div className="mt-1">
                  {walletData.isConnected ? (
                    <span className="text-green-300 text-sm sm:text-xl font-semibold">
                      ✓ Connected
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setWalletManagerOpen(true)}
                      className="text-purple-600 touch-target"
                    >
                      Create Wallet
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions - Mobile-First Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mx-4">
        <Card className="mobile-card hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardContent
            className="mobile-container text-center"
            onClick={() => openWhatsApp("buy")}
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 gradient-green rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <ArrowDownLeft className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <h3 className="font-semibold text-green-800 text-sm sm:text-base">
              Buy Crypto
            </h3>
          </CardContent>
        </Card>

        <Card className="mobile-card hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardContent
            className="mobile-container text-center"
            onClick={() => openWhatsApp("sell")}
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 gradient-red rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <h3 className="font-semibold text-red-800 text-sm sm:text-base">
              Sell Crypto
            </h3>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Overview - Mobile-Optimized */}
      <Card className="mobile-card shadow-lg mx-4">
        <CardHeader className="mobile-container pb-2">
          <CardTitle className="text-base sm:text-lg">
            Wallet Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="mobile-container pt-0">
          {walletData.isConnected ? (
            <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
              <div>
                <p className="text-xl sm:text-2xl font-bold text-purple-600">
                  {walletData.balances.length}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Holdings
                </p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {walletData.type === "ethereum" ? "🌐" : "☀️"}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 capitalize">
                  {walletData.type}
                </p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-blue-600 capitalize">
                  {walletData.network}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Network</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 sm:py-6">
              <p className="text-gray-500 mb-4 text-sm sm:text-base">
                Connect your wallet to see your portfolio
              </p>
              <Button
                onClick={() => setWalletManagerOpen(true)}
                className="touch-target"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Create Wallet
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="pb-20"></div>
    </div>
  );

  const MarketScreen = () => (
    <div className="space-y-4 sm:space-y-6 animate-fade-in h-full overflow-y-auto scrollbar-hide">
      <div className="flex items-center justify-between mobile-container">
        <h1 className="text-xl sm:text-2xl font-bold">Markets</h1>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="bg-purple-100 text-purple-700 text-xs sm:text-sm"
          >
            Live
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("https://coinmarketcap.com", "_blank")}
            className="text-xs px-2 py-1"
          >
            See More <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>

      {loadingMarketData ? (
        <div className="space-y-3 mobile-container">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="mobile-card">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-12 sm:w-16"></div>
                      <div className="h-2 sm:h-3 bg-gray-200 rounded animate-pulse w-16 sm:w-20"></div>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-16 sm:w-20"></div>
                    <div className="h-2 sm:h-3 bg-gray-200 rounded animate-pulse w-10 sm:w-12"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3 mobile-container">
          {marketData.map((coin) => (
            <Card
              key={coin.id}
              className="mobile-card hover:shadow-lg transition-all duration-300 animate-slide-up"
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden">
                      {coin.image ? (
                        <img
                          src={coin.image}
                          alt={coin.symbol}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                        />
                      ) : (
                        <span className="text-lg sm:text-xl font-bold text-purple-600">
                          {coin.symbol.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">
                        {coin.symbol.toUpperCase()}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {coin.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm sm:text-base">
                      ${coin.current_price.toLocaleString()}
                    </p>
                    <p
                      className={`text-xs sm:text-sm ${
                        coin.price_change_percentage_24h >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                      {coin.price_change_percentage_24h.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="pb-20"></div>
    </div>
  );

  const WalletScreen = () => (
    <div className="space-y-4 sm:space-y-6 animate-fade-in h-full overflow-y-auto scrollbar-hide">
      <div className="flex items-center justify-between mobile-container">
        <h1 className="text-xl sm:text-2xl font-bold">Wallet</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setBalanceVisible(!balanceVisible)}
          className="text-gray-600 touch-target"
        >
          {balanceVisible ? (
            <Eye className="w-5 h-5" />
          ) : (
            <EyeOff className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Network Selector */}
      {walletData.isConnected && (
        <div className="mobile-container">
          <Card className="mobile-card shadow-lg">
            <CardHeader className="mobile-container pb-2">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                Network
              </CardTitle>
            </CardHeader>
            <CardContent className="mobile-container pt-0">
              <Select defaultValue={walletData.network || "ethereum"}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ethereum">Ethereum</SelectItem>
                  <SelectItem value="polygon">Polygon</SelectItem>
                  <SelectItem value="arbitrum">Arbitrum</SelectItem>
                  <SelectItem value="optimism">Optimism</SelectItem>
                  <SelectItem value="base">Base</SelectItem>
                  <SelectItem value="solana">Solana</SelectItem>
                  <SelectItem value="bsc">Binance Smart Chain</SelectItem>
                  <SelectItem value="avalanche">Avalanche</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Balance Card - Mobile-Optimized */}
      <div className="mobile-container">
        <Card className="mobile-card gradient-purple text-white shadow-lg">
          <CardContent className="mobile-container">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-purple-200 text-sm">Total Balance</p>
                {walletData.isConnected && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={refreshBalances}
                    className="text-purple-200 hover:text-white hover:bg-purple-500 text-xs touch-target"
                  >
                    🔄 Refresh
                  </Button>
                )}
              </div>

              <p className="text-3xl sm:text-4xl font-bold">
                {walletData.isConnected
                  ? balanceVisible
                    ? `$${walletData.totalValue.toFixed(2)}`
                    : "••••••••"
                  : "Connect Wallet"}
              </p>

              {walletData.isConnected && (
                <div className="text-xs sm:text-sm text-purple-200 space-y-1">
                  <p>
                    Wallet: {walletData.address?.slice(0, 6)}...
                    {walletData.address?.slice(-4)}
                  </p>
                  <p>Network: {walletData.network}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Button
                  className="flex-1 bg-white text-purple-600 hover:bg-gray-100 touch-target"
                  onClick={() => setAddFundsModalOpen(true)}
                  disabled={!walletData.isConnected}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Funds
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-white text-white hover:bg-white hover:text-purple-600 bg-transparent touch-target"
                  onClick={() => setSendModalOpen(true)}
                  disabled={!walletData.isConnected}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Holdings - Mobile-Optimized */}
      <div className="mobile-container">
        <Card className="mobile-card shadow-lg">
          <CardHeader className="mobile-container pb-2">
            <CardTitle className="text-base sm:text-lg">
              Your Holdings
            </CardTitle>
          </CardHeader>
          <CardContent className="mobile-container pt-0 space-y-3">
            {walletData.isConnected ? (
              walletData.balances.length > 0 ? (
                walletData.balances.map((balance) => (
                  <div
                    key={balance.symbol}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 animate-slide-up"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-purple-100">
                        {balance.image ? (
                          <img
                            src={balance.image}
                            alt={balance.symbol}
                            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                          />
                        ) : (
                          <span className="text-sm sm:text-xl">
                            {balance.symbol === "ETH"
                              ? "🌐"
                              : balance.symbol === "SOL"
                              ? "☀️"
                              : balance.symbol === "MATIC"
                              ? "🟣"
                              : balance.symbol === "ARB"
                              ? "🔵"
                              : balance.symbol === "OP"
                              ? "🔴"
                              : "💎"}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm sm:text-base">
                          {balance.symbol}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {balance.name}
                        </p>
                        <div className="flex items-center gap-1 text-xs">
                          <span
                            className={
                              balance.gainLossPercentage >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {balance.gainLossPercentage >= 0 ? "+" : ""}
                            {balance.gainLossPercentage.toFixed(2)}%
                          </span>
                          <span className="text-gray-500">
                            ({balance.gainLoss >= 0 ? "+" : ""}$
                            {balance.gainLoss.toFixed(2)})
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-xs sm:text-sm">
                        {balance.balance.toFixed(6)} {balance.symbol}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        ${balance.value.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        ${balance.currentPrice.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-gray-500 mb-4 text-sm sm:text-base">
                    No tokens found
                  </p>
                  <Button
                    onClick={() => setAddFundsModalOpen(true)}
                    size="sm"
                    className="touch-target"
                  >
                    Add Funds
                  </Button>
                </div>
              )
            ) : (
              <div className="text-center py-6 sm:py-8">
                <Wallet className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4 text-sm sm:text-base">
                  Connect your wallet to see holdings
                </p>
                <Button
                  onClick={() => setWalletModalOpen(true)}
                  className="touch-target"
                >
                  Connect Wallet
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      {walletData.isConnected && (
        <div className="mobile-container">
          <Card className="mobile-card shadow-lg">
            <CardHeader className="mobile-container pb-2">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <History className="w-4 h-4 sm:w-5 sm:h-5" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="mobile-container pt-0 space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 animate-slide-up"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                        tx.type === "buy"
                          ? "bg-green-100"
                          : tx.type === "sell"
                          ? "bg-red-100"
                          : "bg-blue-100"
                      }`}
                    >
                      {tx.type === "buy" ? (
                        <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      ) : tx.type === "sell" ? (
                        <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                      ) : (
                        <Send className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm sm:text-base capitalize">
                        {tx.type}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {tx.coin}
                      </p>
                      <p className="text-xs text-gray-500">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-xs sm:text-sm">
                      {tx.amount} {tx.coin}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      ${tx.value.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full touch-target">
                View All Transactions
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* NFTs & Collectibles */}
      {walletData.isConnected && (
        <div className="mobile-container">
          <Card className="mobile-card shadow-lg">
            <CardHeader className="mobile-container pb-2">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                NFTs & Collectibles
              </CardTitle>
            </CardHeader>
            <CardContent className="mobile-container pt-0">
              <div className="space-y-4">
                {/* NFT Stats */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-purple-600">0</p>
                    <p className="text-xs text-gray-600">NFTs</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-blue-600">0</p>
                    <p className="text-xs text-gray-600">Collections</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-green-600">$0</p>
                    <p className="text-xs text-gray-600">Value</p>
                  </div>
                </div>

                {/* NFT Gallery Placeholder */}
              <div className="text-center py-6 sm:py-8">
                <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4 text-sm sm:text-base">
                  No NFTs found
                </p>
                  <p className="text-xs text-gray-400 mb-4">
                  NFTs will appear here when you own them
                </p>
                  <Button variant="outline" size="sm" className="touch-target">
                    <Globe className="w-4 h-4 mr-2" />
                    View on Explorer
                  </Button>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <Button variant="outline" className="w-full touch-target">
                    <Plus className="w-4 h-4 mr-2" />
                    Import NFT
                  </Button>
                  <Button variant="outline" className="w-full touch-target">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Browse NFT Marketplaces
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="pb-20"></div>
    </div>
  );

  // Security Screen
  const SecurityScreen = () => (
    <div className="space-y-4 sm:space-y-6 animate-fade-in h-full overflow-y-auto scrollbar-hide">
      <div className="flex items-center gap-2 mobile-container">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setActiveSubTab("")}
          className="mr-2 touch-target"
        >
          <ArrowUpRight className="w-5 h-5 rotate-180" />
        </Button>
        <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
        <h1 className="text-xl sm:text-2xl font-bold">Security</h1>
      </div>

      <div className="mobile-container space-y-4">
        {/* Passkey Authentication */}
        <Card className="mobile-card shadow-lg">
          <CardHeader className="mobile-container pb-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Fingerprint className="w-4 h-4 sm:w-5 sm:h-5" />
              Passkey Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="mobile-container pt-0 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm sm:text-base font-medium">
                  Passkey Status
                </Label>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Use biometric or device security
                </p>
              </div>
              <Switch defaultChecked={false} />
            </div>

            <Button variant="outline" className="w-full touch-target">
              <Plus className="w-4 h-4 mr-2" />
              Add Passkey
            </Button>
          </CardContent>
        </Card>

        {/* Phone Verification */}
        <Card className="mobile-card shadow-lg">
          <CardHeader className="mobile-container pb-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              Phone Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="mobile-container pt-0 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm sm:text-base font-medium">
                  Phone Number
                </Label>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {user.phoneNumber || "No phone number linked"}
                </p>
              </div>
              <Button size="sm" variant="outline">
                {user.phoneNumber ? "Change" : "Add"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Passkey */}
        <Card className="mobile-card shadow-lg">
          <CardHeader className="mobile-container pb-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Fingerprint className="w-4 h-4 sm:w-5 sm:h-5" />
              Passkey
            </CardTitle>
          </CardHeader>
          <CardContent className="mobile-container pt-0 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm sm:text-base font-medium">
                  Passkey Status
                </Label>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Use biometric or device security
                </p>
              </div>
              <Switch defaultChecked={false} />
            </div>

            <Button variant="outline" className="w-full touch-target">
              <Plus className="w-4 h-4 mr-2" />
              Add Passkey
            </Button>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card className="mobile-card shadow-lg">
          <CardHeader className="mobile-container pb-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Key className="w-4 h-4 sm:w-5 sm:h-5" />
              Password
            </CardTitle>
          </CardHeader>
          <CardContent className="mobile-container pt-0">
            <Button variant="outline" className="w-full touch-target">
              Change Password
            </Button>
          </CardContent>
        </Card>

        {/* Biometric Login */}
        <Card className="mobile-card shadow-lg">
          <CardHeader className="mobile-container pb-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Fingerprint className="w-4 h-4 sm:w-5 sm:h-5" />
              Biometric Login
            </CardTitle>
          </CardHeader>
          <CardContent className="mobile-container pt-0 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm sm:text-base font-medium">
                  Biometric Status
                </Label>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Use fingerprint or face recognition for login
                </p>
              </div>
              <Switch defaultChecked={false} />
            </div>

            <Button variant="outline" className="w-full touch-target">
              <Plus className="w-4 h-4 mr-2" />
              Setup Biometrics
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="pb-20"></div>
    </div>
  );

  // Notifications Screen
  const NotificationsScreen = () => (
    <div className="space-y-4 sm:space-y-6 animate-fade-in h-full overflow-y-auto scrollbar-hide">
      <div className="flex items-center gap-2 mobile-container">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setActiveSubTab("")}
          className="mr-2 touch-target"
        >
          <ArrowUpRight className="w-5 h-5 rotate-180" />
        </Button>
        <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
        <h1 className="text-xl sm:text-2xl font-bold">Notifications</h1>
      </div>

      <div className="mobile-container space-y-4">
        <Card className="mobile-card shadow-lg">
          <CardContent className="mobile-container space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm sm:text-base">
                  Push Notifications
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {pushNotifications
                    ? "Enabled in browser"
                    : "Tap to enable in your device"}
                </p>
              </div>
              <Button
                variant={pushNotifications ? "default" : "outline"}
                size="sm"
                onClick={requestNotificationPermission}
                disabled={pushNotifications}
                className="touch-target"
              >
                {pushNotifications ? "Enabled" : "Enable"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm sm:text-base">
                  Email Notifications
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Receive updates via email
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm sm:text-base">
                  Transaction Alerts
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Notifications for sending and receiving
                </p>
              </div>
              <Switch
                checked={transactionNotifications}
                onCheckedChange={setTransactionNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm sm:text-base">
                  Price Alerts
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Get notified of price changes
                </p>
              </div>
              <Switch defaultChecked={false} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm sm:text-base">
                  Security Alerts
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Login and security notifications
                </p>
              </div>
              <Switch defaultChecked={true} />
            </div>
          </CardContent>
        </Card>

        {/* Test Notification */}
        <Card className="mobile-card shadow-lg">
          <CardHeader className="mobile-container pb-2">
            <CardTitle className="text-base sm:text-lg">
              Test Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="mobile-container pt-0 space-y-3">
            <Button
              variant="outline"
              className="w-full touch-target"
              onClick={() => {
                if (pushNotifications) {
                  new Notification("Biaz", {
                    body: "This is a test notification from Biaz",
                    icon: "/placeholder-logo.png",
                  });
                }
                toast({
                  title: "Test Notification",
                  description: "Notification sent successfully",
                });
              }}
            >
              Send Test Notification
            </Button>
            <Button
              variant="outline"
              className="w-full touch-target"
              onClick={() => {
                toast({
                  title: "Transaction Notification",
                  description: "You received 0.001 BTC from wallet 0x1234...",
                });
              }}
            >
              Test Transaction Alert
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="pb-20"></div>
    </div>
  );

  // Help & Support Screen
  const HelpSupportScreen = () => (
    <div className="space-y-4 sm:space-y-6 animate-fade-in h-full overflow-y-auto scrollbar-hide">
      <div className="flex items-center gap-2 mobile-container">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setActiveSubTab("")}
          className="mr-2 touch-target"
        >
          <ArrowUpRight className="w-5 h-5 rotate-180" />
        </Button>
        <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        <h1 className="text-xl sm:text-2xl font-bold">Help & Support</h1>
      </div>

      <div className="mobile-container space-y-4">
        <Card className="mobile-card shadow-lg">
          <CardHeader className="mobile-container pb-2">
            <CardTitle className="text-base sm:text-lg">
              Contact Support
            </CardTitle>
          </CardHeader>
          <CardContent className="mobile-container space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start touch-target"
              onClick={() =>
                window.open("https://wa.me/2349013004266", "_blank")
              }
            >
              <MessageCircle className="w-5 h-5 mr-3 text-green-600" />
              <div className="text-left">
                <p className="font-medium text-sm sm:text-base">
                  WhatsApp Support
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  +234 901 300 4266
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start touch-target"
              onClick={() =>
                window.open("mailto:spectra010s@gmail.com", "_blank")
              }
            >
              <Mail className="w-5 h-5 mr-3 text-blue-600" />
              <div className="text-left">
                <p className="font-medium text-sm sm:text-base">
                  Email Support
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  spectra010s@gmail.com
                </p>
              </div>
            </Button>
          </CardContent>
        </Card>

        <Card className="mobile-card shadow-lg">
          <CardContent className="mobile-container space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start touch-target"
            >
              <div className="text-left">
                <p className="font-medium text-sm sm:text-base">FAQ</p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Frequently asked questions
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start touch-target"
            >
              <div className="text-left">
                <p className="font-medium text-sm sm:text-base">
                  Privacy Policy
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  How we protect your data
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start touch-target"
            >
              <div className="text-left">
                <p className="font-medium text-sm sm:text-base">
                  Terms of Service
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Usage terms and conditions
                </p>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="pb-20"></div>
    </div>
  );

  const ProfileScreen = () => (
    <div className="space-y-4 sm:space-y-6 animate-fade-in h-full overflow-y-auto scrollbar-hide">
      <div className="text-center space-y-4 mobile-container">
        <div className="relative">
          <Avatar className="w-20 h-20 sm:w-24 sm:h-24 mx-auto">
            <AvatarImage
              src={user.photoURL || "/placeholder.svg?height=96&width=96"}
            />
            <AvatarFallback className="text-xl sm:text-2xl bg-purple-100 text-purple-600">
              {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Username Display Only - No Editing */}
        <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold">
                {user.displayName || "User"}
              </h1>
          <p className="text-gray-500 text-sm">
            Username can be changed in Account Settings
          </p>
        </div>

        <p className="text-gray-600 text-sm sm:text-base">{user.email}</p>
        <Badge className="bg-purple-100 text-purple-700">Verified</Badge>
      </div>

      <Card className="mobile-card shadow-lg mx-4">
        <CardContent className="p-0">
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start p-4 h-auto touch-target"
              onClick={() => setActiveTab("settings")}
            >
              <Settings className="w-5 h-5 mr-3 text-gray-600" />
              <div className="text-left">
                <p className="font-medium text-sm sm:text-base">
                  Account Settings
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Manage your account preferences
                </p>
              </div>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start p-4 h-auto touch-target"
              onClick={() => setActiveSubTab("security")}
            >
              <Shield className="w-5 h-5 mr-3 text-gray-600" />
              <div className="text-left">
                <p className="font-medium text-sm sm:text-base">Security</p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Passkey authentication, biometrics
                </p>
              </div>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start p-4 h-auto touch-target"
              onClick={() => setActiveSubTab("notifications")}
            >
              <Bell className="w-5 h-5 mr-3 text-gray-600" />
              <div className="text-left">
                <p className="font-medium text-sm sm:text-base">
                  Notifications
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Push notifications, email alerts
                </p>
              </div>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start p-4 h-auto touch-target"
              onClick={() => setActiveSubTab("help")}
            >
              <HelpCircle className="w-5 h-5 mr-3 text-gray-600" />
              <div className="text-left">
                <p className="font-medium text-sm sm:text-base">
                  Help & Support
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Get help and contact support
                </p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {walletData.isConnected && (
        <Button
          variant="outline"
          className="w-full text-orange-600 border-orange-200 hover:bg-orange-50 bg-transparent mb-3 touch-target mx-4"
          onClick={disconnectWallet}
        >
          <Wallet className="w-5 h-5 mr-2" />
          Disconnect Wallet
        </Button>
      )}

      <Button
        variant="outline"
        className="w-full text-red-600 border-red-200 hover:bg-red-50 bg-transparent touch-target mx-4"
        onClick={handleLogout}
      >
        <LogOut className="w-5 h-5 mr-2" />
        Sign Out
      </Button>

      <div className="pb-20"></div>
    </div>
  );

  const renderScreen = () => {
    if (activeSubTab === "security") return <SecurityScreen />;
    if (activeSubTab === "notifications") return <NotificationsScreen />;
    if (activeSubTab === "help") return <HelpSupportScreen />;

    switch (activeTab) {
      case "home":
        return <HomeScreen />;
      case "markets":
        return <MarketScreen />;
      case "wallet":
        return <WalletScreen />;
      case "profile":
        return <ProfileScreen />;
      case "settings":
        return <SettingsPage onBack={() => setActiveTab("profile")} />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="h-full full-viewport flex flex-col max-w-md mx-auto bg-white/10 backdrop-blur-sm dark:bg-gray-900/10">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="h-full">{renderScreen()}</div>
      </div>

      {/* Bottom Navigation - Mobile-Optimized */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-md dark:bg-gray-900/95 border-t border-gray-200/50 dark:border-gray-700/50 safe-area-bottom">
        <div className="flex items-center justify-around py-2 px-2">
          {[
            { id: "home", icon: Home, label: "Home" },
            { id: "markets", icon: TrendingUp, label: "Markets" },
            { id: "wallet", icon: Wallet, label: "Wallet" },
            { id: "profile", icon: User, label: "Profile" },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              className={`flex flex-col items-center space-y-1 p-3 h-auto transition-all duration-200 touch-target min-w-0 flex-1 ${
                activeTab === tab.id
                  ? "text-purple-600 bg-purple-50 dark:bg-purple-900/20"
                  : "text-gray-600 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              }`}
              onClick={() => {
                setActiveTab(tab.id);
                setActiveSubTab("");
              }}
            >
              <tab.icon
                className={`w-5 h-5 sm:w-6 sm:h-6 ${
                  activeTab === tab.id ? "text-purple-600" : ""
                }`}
              />
              <span className="text-xs font-medium truncate">{tab.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Profile Picture Upload Modal */}
      <Dialog open={profilePicModalOpen} onOpenChange={setProfilePicModalOpen}>
        <DialogContent className="mx-4">
          <DialogHeader>
            <DialogTitle>Change Profile Picture</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center space-y-4">
              <Avatar className="w-24 h-24 mx-auto">
                <AvatarImage
                  src={user.photoURL || "/placeholder.svg?height=96&width=96"}
                />
                <AvatarFallback className="text-2xl bg-purple-100 text-purple-600">
                  {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          const result = e.target?.result as string;
                          // In a real app, you would upload this to your server
                          toast({
                            title: "Success",
                            description: "Profile picture updated successfully",
                          });
                          setProfilePicModalOpen(false);
                        };
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // In a real app, this would open camera
                    toast({
                      title: "Camera Access",
                      description:
                        "Camera functionality will be available in the mobile app",
                    });
                  }}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
                {user.photoURL && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: "Success",
                        description: "Profile picture removed",
                      });
                      setProfilePicModalOpen(false);
                    }}
                  >
                    Remove Photo
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modals */}
      <WalletManager
        isOpen={walletManagerOpen}
        onClose={() => setWalletManagerOpen(false)}
      />
      <AddFundsModal
        isOpen={addFundsModalOpen}
        onClose={() => setAddFundsModalOpen(false)}
      />
      <SendTransactionModal
        isOpen={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <CustomAuthProvider>
      <CryptoExchangeApp />
    </CustomAuthProvider>
  );
}
