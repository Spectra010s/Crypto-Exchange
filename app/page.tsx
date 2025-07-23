"use client"

import { useState, useEffect } from "react"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { AuthForm } from "@/components/auth/auth-form"
import { UsernameSetup } from "@/components/auth/username-setup"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { SettingsScreen } from "@/components/settings/settings-screen"
import { NetworkSelector } from "@/components/wallet/network-selector"
import { AuthProvider, useAuth } from "@/hooks/use-auth"
import { fetchCryptocurrencies, type CoinData } from "@/lib/coinmarketcap"
import { useToast } from "@/hooks/use-toast"
import { useWalletContext } from "@/hooks/use-wallet"
import { WalletConnectModal } from "@/components/wallet/wallet-connect-modal"
import { AddFundsModal } from "@/components/wallet/add-funds-modal"
import { SendTransactionModal } from "@/components/wallet/send-transaction-modal"
import { BINANCE_BUY_URL, BINANCE_SELL_URL } from "@/lib/web3-config"

// Mock transactions data
const transactions = [
  { id: 1, type: "buy", coin: "BTC", amount: 0.025, value: 1081.25, date: "2024-01-15" },
  { id: 2, type: "sell", coin: "ETH", amount: 1.5, value: 4021.13, date: "2024-01-14" },
  { id: 3, type: "buy", coin: "SOL", amount: 25, value: 2461.25, date: "2024-01-13" },
  { id: 4, type: "send", coin: "BTC", amount: 0.01, value: 432.5, date: "2024-01-12" },
]

function CryptoExchangeApp() {
  const { user, loading, logout } = useAuth()
  const { walletData, disconnectWallet, refreshBalances } = useWalletContext()
  const [activeTab, setActiveTab] = useState("home")
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [marketData, setMarketData] = useState<CoinData[]>([])
  const [loadingMarketData, setLoadingMarketData] = useState(true)
  const [walletModalOpen, setWalletModalOpen] = useState(false)
  const [addFundsModalOpen, setAddFundsModalOpen] = useState(false)
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [showUsernameSetup, setShowUsernameSetup] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showNetworkSelector, setShowNetworkSelector] = useState(false)
  const [selectedNetwork, setSelectedNetwork] = useState("ethereum")
  const { toast } = useToast()

  useEffect(() => {
    const loadMarketData = async () => {
      try {
        setLoadingMarketData(true)
        const data = await fetchCryptocurrencies(5)
        setMarketData(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load market data",
          variant: "destructive",
        })
      } finally {
        setLoadingMarketData(false)
      }
    }

    if (user) {
      loadMarketData()
      // Check if user needs to set up username
      if (!user.displayName) {
        setShowUsernameSetup(true)
      }
    }
  }, [user, toast])

  const handleLogout = async () => {
    try {
      await logout()
      toast({
        title: "Success",
        description: "Signed out successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center app-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 dark:text-purple-400 font-medium">Loading your crypto experience...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm onAuthSuccess={() => {}} />
  }

  if (showUsernameSetup) {
    return (
      <UsernameSetup 
        currentUser={user} 
        onComplete={() => setShowUsernameSetup(false)} 
      />
    )
  }

  if (showSettings) {
    return (
      <div className="max-w-md mx-auto min-h-screen app-background">
        <div className="p-4">
          <SettingsScreen 
            user={user}
            onBack={() => setShowSettings(false)}
            onEditUsername={() => {
              setShowSettings(false)
              setShowUsernameSetup(true)
            }}
          />
        </div>
      </div>
    )
  }

  if (showNetworkSelector) {
    return (
      <div className="max-w-md mx-auto min-h-screen app-background">
        <div className="p-4">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNetworkSelector(false)}
              className="h-10 w-10"
            >
              ←
            </Button>
            <h1 className="text-xl font-bold">Network Settings</h1>
          </div>
          <NetworkSelector 
            currentNetwork={selectedNetwork}
            onNetworkChange={(network) => {
              setSelectedNetwork(network)
              setTimeout(() => setShowNetworkSelector(false), 1000)
            }}
          />
        </div>
      </div>
    )
  }

  const HomeScreen = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl backdrop-blur-sm">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user.displayName ? `${user.displayName} (${user.email})` : user.email?.split("@")[0]}!
        </h1>
        <p className="text-purple-100 mb-4">
          {walletData.isConnected ? 'Your Web3 portfolio is ready!' : 'Connect your wallet to start trading!'}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-200 text-sm">Portfolio Value</p>
            <p className="text-3xl font-bold">
              {walletData.isConnected ? (
                balanceVisible ? `$${walletData.totalValue.toFixed(2)}` : "••••••••"
              ) : (
                "Connect Wallet"
              )}
            </p>
          </div>
          <div className="text-right">
            <p className="text-purple-200 text-sm">Wallet Status</p>
            <p className="text-xl font-semibold">
              {walletData.isConnected ? (
                <span className="text-green-300">✓ Connected</span>
              ) : (
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={() => setWalletModalOpen(true)}
                  className="text-purple-600"
                >
                  Connect Wallet
                </Button>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 cursor-pointer hover:shadow-xl transition-shadow content-overlay">
          <CardContent 
            className="p-6 text-center"
            onClick={() => window.open(BINANCE_BUY_URL, '_blank')}
          >
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <ArrowDownLeft className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-green-800">Buy Crypto</h3>
            <p className="text-sm text-green-600 mt-1 flex items-center justify-center gap-1">
              Via Binance <ExternalLink className="w-3 h-3" />
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 cursor-pointer hover:shadow-xl transition-shadow content-overlay">
          <CardContent 
            className="p-6 text-center"
            onClick={() => window.open(BINANCE_SELL_URL, '_blank')}
          >
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <ArrowUpRight className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-red-800">Sell Crypto</h3>
            <p className="text-sm text-red-600 mt-1 flex items-center justify-center gap-1">
              Via Binance <ExternalLink className="w-3 h-3" />
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card className="border-0 shadow-lg content-overlay">
        <CardHeader>
          <CardTitle className="text-lg">Wallet Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {walletData.isConnected ? (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-purple-600">{walletData.balances.length}</p>
                <p className="text-sm text-gray-600">Holdings</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {walletData.type === 'ethereum' ? '🌐' : '☀️'}
                </p>
                <p className="text-sm text-gray-600 capitalize">{walletData.type}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600 capitalize">{selectedNetwork}</p>
                <p className="text-sm text-gray-600">Network</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-4">Connect your wallet to see your portfolio</p>
              <Button onClick={() => setWalletModalOpen(true)}>
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const MarketScreen = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Markets</h1>
        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
          Live
        </Badge>
      </div>

      {loadingMarketData ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="border-0 shadow-lg content-overlay">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-12"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {marketData.map((coin) => (
            <Card key={coin.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 content-overlay">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-purple-600 dark:text-purple-400">{coin.symbol.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{coin.symbol}</h3>
                      <p className="text-sm text-gray-600">{coin.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${coin.quote.USD.price.toLocaleString()}</p>
                    <p
                      className={`text-sm ${coin.quote.USD.percent_change_24h >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {coin.quote.USD.percent_change_24h >= 0 ? "+" : ""}
                      {coin.quote.USD.percent_change_24h.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  const WalletScreen = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Wallet</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setBalanceVisible(!balanceVisible)}
          className="text-gray-600"
        >
          {balanceVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
        </Button>
      </div>

      {/* Balance Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-purple-200">Total Balance</p>
            {walletData.isConnected && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={refreshBalances}
                className="text-purple-200 hover:text-white hover:bg-purple-500"
              >
                🔄 Refresh
              </Button>
            )}
          </div>
          <p className="text-4xl font-bold mb-4">
            {walletData.isConnected ? (
              balanceVisible ? `$${walletData.totalValue.toFixed(2)}` : "••••••••"
            ) : (
              "Connect Wallet"
            )}
          </p>
          {walletData.isConnected && (
            <div className="text-sm text-purple-200 mb-4">
              <p>Wallet: {walletData.address?.slice(0, 6)}...{walletData.address?.slice(-4)}</p>
              <button 
                onClick={() => setShowNetworkSelector(true)}
                className="text-purple-200 hover:text-white underline"
              >
                Network: {selectedNetwork} ↗
              </button>
            </div>
          )}
          <div className="flex space-x-3">
            <Button 
              className="flex-1 bg-white text-purple-600 hover:bg-gray-100"
              onClick={() => setAddFundsModalOpen(true)}
              disabled={!walletData.isConnected}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Funds
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-white text-white hover:bg-white hover:text-purple-600 bg-transparent"
              onClick={() => setSendModalOpen(true)}
              disabled={!walletData.isConnected}
            >
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Holdings */}
      <Card className="border-0 shadow-lg content-overlay">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Your Holdings</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNetworkSelector(true)}
              className="text-purple-600 hover:text-purple-700 text-xs"
            >
              Switch Network
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {walletData.isConnected ? (
            walletData.balances.length > 0 ? (
              walletData.balances.map((balance) => (
                <div key={balance.symbol} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-100 dark:bg-purple-900/50">
                      <span className="text-xl">
                        {balance.symbol === 'ETH' ? '🌐' : 
                         balance.symbol === 'SOL' ? '☀️' : 
                         balance.symbol === 'MATIC' ? '🟣' : 
                         balance.symbol === 'ARB' ? '🔵' : 
                         balance.symbol === 'OP' ? '🔴' : '💎'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{balance.symbol}</p>
                      <p className="text-sm text-gray-600">{balance.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{balance.balance.toFixed(6)} {balance.symbol}</p>
                    <p className="text-sm text-gray-600">${balance.value.toFixed(2)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No tokens found</p>
                <Button 
                  onClick={() => setAddFundsModalOpen(true)}
                  size="sm"
                >
                  Add Funds
                </Button>
              </div>
            )
          ) : (
            <div className="text-center py-8">
              <Wallet className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">Connect your wallet to see holdings</p>
              <Button onClick={() => setWalletModalOpen(true)}>
                Connect Wallet
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const ProfileScreen = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Avatar className="w-24 h-24 mx-auto mb-4">
          <AvatarImage src={user.photoURL || "/placeholder.svg?height=96&width=96"} />
          <AvatarFallback className="text-2xl bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
            {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-bold">{user.displayName || user.email?.split("@")[0] || "User"}</h1>
        <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
        <div className="flex items-center gap-2 mt-2">
          <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">Verified</Badge>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowUsernameSetup(true)}
            className="text-xs"
          >
            Edit Username
          </Button>
        </div>
      </div>

      {/* Main Actions */}
      <Card className="border-0 shadow-lg content-overlay">
        <CardContent className="p-0">
          <div className="space-y-1">
            <Button 
              variant="ghost" 
              className="w-full justify-start p-4 h-auto"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-400" />
              <div className="text-left">
                <p className="font-medium">Settings</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Account, security, and preferences</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Actions */}
      {walletData.isConnected && (
        <Button
          variant="outline"
          className="w-full text-orange-600 border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-900/20 bg-transparent mb-3"
          onClick={disconnectWallet}
        >
          <Wallet className="w-5 h-5 mr-2" />
          Disconnect Wallet
        </Button>
      )}

      {/* Sign Out */}
      <Button
        variant="outline"
        className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 bg-transparent"
        onClick={handleLogout}
      >
        <LogOut className="w-5 h-5 mr-2" />
        Sign Out
      </Button>
    </div>
  )

  const renderScreen = () => {
    switch (activeTab) {
      case "home":
        return <HomeScreen />
      case "markets":
        return <MarketScreen />
      case "wallet":
        return <WalletScreen />
      case "profile":
        return <ProfileScreen />
      default:
        return <HomeScreen />
    }
  }

  return (
    <div className="max-w-md mx-auto min-h-screen app-background">
      {/* Header with theme toggle */}
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>
      
      {/* Main Content */}
      <div className="pb-20 px-4">
        <div className="transition-all duration-300 ease-in-out">{renderScreen()}</div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md content-overlay border-t border-gray-200 dark:border-gray-700 backdrop-blur-md">
        <div className="flex items-center justify-around py-2">
          {[
            { id: "home", icon: Home, label: "Home" },
            { id: "markets", icon: TrendingUp, label: "Markets" },
            { id: "wallet", icon: Wallet, label: "Wallet" },
            { id: "profile", icon: User, label: "Profile" },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              className={`flex flex-col items-center space-y-1 p-3 h-auto transition-all duration-200 ${
                activeTab === tab.id
                  ? "text-purple-600 bg-purple-50"
                  : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className={`w-6 h-6 ${activeTab === tab.id ? "text-purple-600" : ""}`} />
              <span className="text-xs font-medium">{tab.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Modals */}
      <WalletConnectModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
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
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CryptoExchangeApp />
    </AuthProvider>
  )
}
