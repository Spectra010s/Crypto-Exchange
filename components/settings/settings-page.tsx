"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Settings, 
  Phone, 
  Shield, 
  Key, 
  Palette, 
  Bell, 
  User, 
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { useTheme } from "next-themes"

interface SettingsPageProps {
  onBack?: () => void
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  
  // State for various settings
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isPhoneVerified, setIsPhoneVerified] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [showVerificationInput, setShowVerificationInput] = useState(false)
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswords, setShowPasswords] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  
  // 2FA state
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const [isEnabling2FA, setIsEnabling2FA] = useState(false)
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [transactionAlerts, setTransactionAlerts] = useState(true)

  const handlePhoneVerification = async () => {
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Please enter a phone number",
        variant: "destructive",
      })
      return
    }

    setIsVerifying(true)
    try {
      // Simulate API call for phone verification
      await new Promise(resolve => setTimeout(resolve, 2000))
      setShowVerificationInput(true)
      toast({
        title: "Verification Code Sent",
        description: `Code sent to ${phoneNumber}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification code",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      toast({
        title: "Error",
        description: "Please enter the verification code",
        variant: "destructive",
      })
      return
    }

    try {
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsPhoneVerified(true)
      setShowVerificationInput(false)
      toast({
        title: "Success",
        description: "Phone number verified successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid verification code",
        variant: "destructive",
      })
    }
  }

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      })
      return
    }

    setIsChangingPassword(true)
    try {
      // Simulate password change API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast({
        title: "Success",
        description: "Password changed successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password",
        variant: "destructive",
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleEnable2FA = async () => {
    setIsEnabling2FA(true)
    try {
      // Simulate 2FA setup
      await new Promise(resolve => setTimeout(resolve, 1500))
      setQrCodeUrl("https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/CryptoExchange:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=CryptoExchange")
      toast({
        title: "2FA Setup",
        description: "Scan the QR code with your authenticator app",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to setup 2FA",
        variant: "destructive",
      })
    } finally {
      setIsEnabling2FA(false)
    }
  }

  const handleConfirm2FA = async () => {
    if (!twoFactorCode) {
      toast({
        title: "Error",
        description: "Please enter the 6-digit code",
        variant: "destructive",
      })
      return
    }

    try {
      // Simulate 2FA confirmation
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIs2FAEnabled(true)
      setQrCodeUrl("")
      setTwoFactorCode("")
      toast({
        title: "Success",
        description: "Two-factor authentication enabled",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid code. Please try again",
        variant: "destructive",
      })
    }
  }

  const handleDisable2FA = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIs2FAEnabled(false)
      toast({
        title: "Success",
        description: "Two-factor authentication disabled",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disable 2FA",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-2 mb-6">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="mr-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <Settings className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Email</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input value={user?.email || ""} readOnly className="bg-gray-50" />
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Verified
              </Badge>
            </div>
          </div>
          <div>
            <Label>Display Name</Label>
            <Input value={user?.displayName || "Not set"} className="mt-1" />
          </div>
        </CardContent>
      </Card>

      {/* Phone Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Phone Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Input 
              placeholder="+1 (555) 123-4567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isPhoneVerified}
            />
            {isPhoneVerified ? (
              <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Verified
              </Badge>
            ) : (
              <Button 
                onClick={handlePhoneVerification}
                disabled={isVerifying}
                size="sm"
              >
                {isVerifying ? "Sending..." : "Verify"}
              </Button>
            )}
          </div>
          
          {showVerificationInput && (
            <div className="flex items-center gap-2">
              <Input 
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
              <Button onClick={handleVerifyCode} size="sm">
                Confirm
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Theme</Label>
              <p className="text-sm text-gray-600">Choose between light and dark theme</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Light</span>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
              <span className="text-sm">Dark</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Current Password</Label>
            <div className="relative mt-1">
              <Input 
                type={showPasswords ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPasswords(!showPasswords)}
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div>
            <Label>New Password</Label>
            <Input 
              type={showPasswords ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label>Confirm New Password</Label>
            <Input 
              type={showPasswords ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <Button 
            onClick={handlePasswordChange}
            disabled={isChangingPassword}
            className="w-full"
          >
            {isChangingPassword ? "Changing Password..." : "Change Password"}
          </Button>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">2FA Status</Label>
              <p className="text-sm text-gray-600">
                {is2FAEnabled ? "Enhanced security is active" : "Add an extra layer of security"}
              </p>
            </div>
            <Badge variant={is2FAEnabled ? "default" : "secondary"}>
              {is2FAEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>

          {!is2FAEnabled ? (
            <div className="space-y-4">
              <Button 
                onClick={handleEnable2FA}
                disabled={isEnabling2FA}
                className="w-full"
              >
                {isEnabling2FA ? "Setting up..." : "Enable 2FA"}
              </Button>
              
              {qrCodeUrl && (
                <div className="text-center space-y-4">
                  <img src={qrCodeUrl} alt="2FA QR Code" className="mx-auto" />
                  <div>
                    <Label>Enter code from authenticator app</Label>
                    <div className="flex gap-2 mt-1">
                      <Input 
                        placeholder="123456"
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value)}
                        maxLength={6}
                      />
                      <Button onClick={handleConfirm2FA}>
                        Confirm
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button 
              variant="destructive" 
              onClick={handleDisable2FA}
              className="w-full"
            >
              Disable 2FA
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-sm text-gray-600">Receive updates via email</p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Push Notifications</Label>
              <p className="text-sm text-gray-600">Browser push notifications</p>
            </div>
            <Switch
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Transaction Alerts</Label>
              <p className="text-sm text-gray-600">Notifications for wallet activity</p>
            </div>
            <Switch
              checked={transactionAlerts}
              onCheckedChange={setTransactionAlerts}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}