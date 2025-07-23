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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { AuthForm } from "@/components/auth/auth-form"
import { AuthProvider, useAuth } from "@/hooks/use-auth"
import { fetchCryptocurrencies, type CoinData } from "@/lib/coinmarketcap"
import { useToast } from "@/hooks/use-toast"

// Mock transactions data
const transactions = [
  { id: 1, type: "buy", coin: "BTC", amount: 0.025, value: 1081.25, date: "2024-01-15" },
  { id: 2, type: "sell", coin: "ETH", amount: 1.5, value: 4021.13, date: "2024-01-14" },
  { id: 3, type: "buy", coin: "SOL", amount: 25, value: 2461.25, date: "2024-01-13" },
  { id: 4, type: "send", coin: "BTC", amount: 0.01, value: 432.5, date: "2024-01-12" },
]

function CryptoExchangeApp() {
  const { user, loading, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("home")
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [marketData, setMarketData] = useState<CoinData[]>([])
  const [loadingMarketData, setLoadingMarketData] = useState(true)
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm onAuthSuccess={() => {}} />
  }

  const HomeScreen = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-3xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user.displayName || user.email?.split("@")[0]}!</h1>
        <p className="text-purple-100 mb-4">Ready to trade today?</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-200 text-sm">Portfolio Value</p>
            <p className="text-3xl font-bold">$24,567.89</p>
          </div>
          <div className="text-right">
            <p className="text-purple-200 text-sm">24h Change</p>
            <p className="text-xl font-semibold text-green-300">+$1,234.56</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <ArrowDownLeft className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-green-800">Buy Crypto</h3>
            <p className="text-sm text-green-600 mt-1">Start investing</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <ArrowUpRight className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-red-800">Sell Crypto</h3>
            <p className="text-sm text-red-600 mt-1">Take profits</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Market Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">+5.2%</p>
              <p className="text-sm text-gray-600">24h Gain</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">12</p>
              <p className="text-sm text-gray-600">Holdings</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">$2.1K</p>
              <p className="text-sm text-gray-600">Available</p>
            </div>
          </div>
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
            <Card key={i} className="border-0 shadow-lg">
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
            <Card key={coin.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-purple-600">{coin.symbol.charAt(0)}</span>
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
      <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <CardContent className="p-6">
          <p className="text-purple-200 mb-2">Total Balance</p>
          <p className="text-4xl font-bold mb-4">{balanceVisible ? "$24,567.89" : "••••••••"}</p>
          <div className="flex space-x-3">
            <Button className="flex-1 bg-white text-purple-600 hover:bg-gray-100">
              <Plus className="w-4 h-4 mr-2" />
              Add Funds
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-white text-white hover:bg-white hover:text-purple-600 bg-transparent"
            >
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === "buy" ? "bg-green-100" : tx.type === "sell" ? "bg-red-100" : "bg-blue-100"
                  }`}
                >
                  {tx.type === "buy" ? (
                    <ArrowDownLeft
                      className={`w-5 h-5 ${
                        tx.type === "buy" ? "text-green-600" : tx.type === "sell" ? "text-red-600" : "text-blue-600"
                      }`}
                    />
                  ) : tx.type === "sell" ? (
                    <ArrowUpRight className="w-5 h-5 text-red-600" />
                  ) : (
                    <Send className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="font-semibold capitalize">
                    {tx.type} {tx.coin}
                  </p>
                  <p className="text-sm text-gray-600">{tx.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {tx.amount} {tx.coin}
                </p>
                <p className="text-sm text-gray-600">${tx.value.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )

  const ProfileScreen = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Avatar className="w-24 h-24 mx-auto mb-4">
          <AvatarImage src={user.photoURL || "/placeholder.svg?height=96&width=96"} />
          <AvatarFallback className="text-2xl bg-purple-100 text-purple-600">
            {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-bold">{user.displayName || "User"}</h1>
        <p className="text-gray-600">{user.email}</p>
        <Badge className="mt-2 bg-purple-100 text-purple-700">Verified</Badge>
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start p-4 h-auto">
              <Settings className="w-5 h-5 mr-3 text-gray-600" />
              <div className="text-left">
                <p className="font-medium">Account Settings</p>
                <p className="text-sm text-gray-600">Manage your account preferences</p>
              </div>
            </Button>

            <Button variant="ghost" className="w-full justify-start p-4 h-auto">
              <Shield className="w-5 h-5 mr-3 text-gray-600" />
              <div className="text-left">
                <p className="font-medium">Security</p>
                <p className="text-sm text-gray-600">Two-factor authentication, passwords</p>
              </div>
            </Button>

            <Button variant="ghost" className="w-full justify-start p-4 h-auto">
              <Bell className="w-5 h-5 mr-3 text-gray-600" />
              <div className="text-left">
                <p className="font-medium">Notifications</p>
                <p className="text-sm text-gray-600">Push notifications, email alerts</p>
              </div>
            </Button>

            <Button variant="ghost" className="w-full justify-start p-4 h-auto">
              <HelpCircle className="w-5 h-5 mr-3 text-gray-600" />
              <div className="text-left">
                <p className="font-medium">Help & Support</p>
                <p className="text-sm text-gray-600">Get help and contact support</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        className="w-full text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
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
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Main Content */}
      <div className="pb-20 px-4 pt-6">
        <div className="transition-all duration-300 ease-in-out">{renderScreen()}</div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200">
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
