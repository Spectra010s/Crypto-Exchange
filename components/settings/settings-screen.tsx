"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  ArrowLeft, 
  User, 
  Shield, 
  Bell, 
  HelpCircle, 
  Moon, 
  Sun,
  ChevronRight,
  Lock,
  Key,
  Smartphone,
  Mail,
  Volume2,
  VolumeX
} from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useTheme } from "next-themes"

interface SettingsScreenProps {
  user: any
  onBack: () => void
  onEditUsername: () => void
}

export function SettingsScreen({ user, onBack, onEditUsername }: SettingsScreenProps) {
  const { theme } = useTheme()

  const settingsCategories = [
    {
      title: "Account",
      items: [
        {
          icon: User,
          title: "Profile Settings",
          description: "Edit username and profile information",
          action: onEditUsername
        },
        {
          icon: Mail,
          title: "Email Settings", 
          description: "Manage email preferences",
          badge: "Coming Soon"
        }
      ]
    },
    {
      title: "Security",
      items: [
        {
          icon: Shield,
          title: "Two-Factor Authentication",
          description: "Add extra security to your account",
          badge: "Recommended"
        },
        {
          icon: Lock,
          title: "Password",
          description: "Change your password",
        },
        {
          icon: Key,
          title: "API Keys",
          description: "Manage your API access",
          badge: "Advanced"
        }
      ]
    },
    {
      title: "Notifications", 
      items: [
        {
          icon: Bell,
          title: "Push Notifications",
          description: "Price alerts and transaction updates"
        },
        {
          icon: Mail,
          title: "Email Notifications", 
          description: "Weekly reports and security alerts"
        },
        {
          icon: Smartphone,
          title: "SMS Alerts",
          description: "Important security notifications",
          badge: "Premium"
        }
      ]
    },
    {
      title: "Preferences",
      items: [
        {
          icon: theme === "dark" ? Moon : Sun,
          title: "Theme",
          description: `Currently using ${theme} mode`,
          customAction: <ThemeToggle />
        },
        {
          icon: Volume2,
          title: "Sound Effects",
          description: "Transaction and notification sounds",
          badge: "On"
        }
      ]
    },
    {
      title: "Support",
      items: [
        {
          icon: HelpCircle,
          title: "Help Center",
          description: "FAQs and guides"
        },
        {
          icon: Mail,
          title: "Contact Support",
          description: "Get help from our team"
        }
      ]
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-10 w-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* User Info */}
      <Card className="content-overlay">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.photoURL || "/placeholder.svg"} />
              <AvatarFallback className="text-lg bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {user.displayName || user.email?.split("@")[0] || "User"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{user.email}</p>
              <Badge className="mt-1 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                Verified
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Categories */}
      {settingsCategories.map((category) => (
        <Card key={category.title} className="content-overlay">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{category.title}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              {category.items.map((item, index) => {
                const IconComponent = item.icon
                
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start p-4 h-auto hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    onClick={item.action}
                    disabled={item.badge === "Coming Soon"}
                  >
                    <IconComponent className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-400" />
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{item.title}</p>
                        <div className="flex items-center gap-2">
                          {item.badge && (
                            <Badge 
                              variant={item.badge === "Recommended" ? "default" : "secondary"}
                              className={`text-xs ${
                                item.badge === "Coming Soon" ? "bg-gray-200 text-gray-500" :
                                item.badge === "Recommended" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" :
                                item.badge === "Premium" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" :
                                ""
                              }`}
                            >
                              {item.badge}
                            </Badge>
                          )}
                          {item.customAction ? (
                            item.customAction
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}