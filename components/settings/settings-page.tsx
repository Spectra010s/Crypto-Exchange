"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  ArrowLeft,
  Camera,
  Upload,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "next-themes";
import { auth, db } from "@/lib/firebase";
import {
  EmailAuthProvider,
  PhoneAuthProvider,
  linkWithCredential,
  updateProfile,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface SettingsPageProps {
  onBack?: () => void;
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  // State for various settings
  const [profilePicModalOpen, setProfilePicModalOpen] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Username editing state
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Add state for email linking
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailEditMode, setEmailEditMode] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  // Add state for phone linking
  const [newPhone, setNewPhone] = useState("");
  const [phoneEditMode, setPhoneEditMode] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneVerificationId, setPhoneVerificationId] = useState("");
  const [phoneStep, setPhoneStep] = useState<"input" | "code">("input");
  const recaptchaRef = useRef<any>(null);

  // Real-time username uniqueness check
  const checkUsername = async (uname: string) => {
    setCheckingUsername(true);
    if (!uname) {
      setUsernameAvailable(null);
      setCheckingUsername(false);
      return;
    }

    try {
      // Check username availability in Firestore
      const usernameDoc = await getDoc(
        doc(db, "usernames", uname.toLowerCase())
      );
      const isAvailable = !usernameDoc.exists();
      setUsernameAvailable(isAvailable);
    } catch (error) {
      console.error("Error checking username:", error);
      setUsernameAvailable(false);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleUsernameUpdate = async () => {
    if (!newUsername.trim()) {
      toast({
        title: "Error",
        description: "Username cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (usernameAvailable === false) {
      toast({
        title: "Error",
        description: "Username is already taken",
        variant: "destructive",
      });
      return;
    }

    if (newUsername.length < 3) {
      toast({
        title: "Error",
        description: "Username must be at least 3 characters long",
        variant: "destructive",
      });
      return;
    }

    if (newUsername.length > 20) {
      toast({
        title: "Error",
        description: "Username must be less than 20 characters",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update username in Firestore
      await setDoc(doc(db, "usernames", newUsername.toLowerCase()), {
        uid: user?.uid,
        createdAt: new Date(),
      });

      // Update user profile
      if (user) {
        await updateProfile(user, {
          displayName: newUsername,
        });
      }

      setEditingUsername(false);
      setNewUsername("");
      setUsernameAvailable(null);
      toast({
        title: "Success",
        description: "Username updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update username",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      // Change password using Firebase
      if (!auth.currentUser) throw new Error("Not authenticated");

      const credential = EmailAuthProvider.credential(
        auth.currentUser.email!,
        currentPassword
      );

      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({
        title: "Success",
        description: "Password changed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleEnable2FA = async () => {
    // In production, implement real 2FA setup
    // This would typically involve:
    // 1. Generate a secret key
    // 2. Create QR code for authenticator apps
    // 3. Verify the setup with a test code
    toast({
      title: "2FA Setup",
      description: "2FA setup will be available in production",
    });
  };

  const handleConfirm2FA = async () => {
    if (!twoFactorCode) {
      toast({
        title: "Error",
        description: "Please enter the 6-digit code",
        variant: "destructive",
      });
      return;
    }

    // In production, verify the 2FA code
    toast({
      title: "2FA Setup",
      description: "2FA verification will be available in production",
    });
  };

  const handleDisable2FA = async () => {
    // In production, disable 2FA
    toast({
      title: "2FA Setup",
      description: "2FA disable will be available in production",
    });
  };

  const handleProfilePicUpload = async () => {
    // In production, implement real profile picture upload
    toast({
      title: "Profile Picture",
      description: "Profile picture upload will be available in production",
    });
    setProfilePicModalOpen(false);
  };

  // Email linking handler
  const handleLinkEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailLoading(true);
    try {
      if (!auth.currentUser) throw new Error("Not authenticated");
      const credential = EmailAuthProvider.credential(newEmail, emailPassword);
      await linkWithCredential(auth.currentUser, credential);
      await updateProfile(auth.currentUser, { email: newEmail });
      toast({ title: "Success", description: "Email linked successfully" });
      setEmailEditMode(false);
      setNewEmail("");
      setEmailPassword("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to link email",
        variant: "destructive",
      });
    } finally {
      setEmailLoading(false);
    }
  };

  // Phone linking handlers
  const setupRecaptcha = () => {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new window.RecaptchaVerifier(
        "recaptcha-container-settings",
        { size: "invisible" },
        auth
      );
    }
    return recaptchaRef.current;
  };

  const handleSendPhoneCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneLoading(true);
    try {
      if (!newPhone) throw new Error("Enter a phone number");
      const appVerifier = setupRecaptcha();
      const provider = new PhoneAuthProvider(auth);
      const verificationId = await provider.verifyPhoneNumber(
        newPhone,
        appVerifier
      );
      setPhoneVerificationId(verificationId);
      setPhoneStep("code");
      toast({
        title: "SMS Sent",
        description: `A verification code was sent to ${newPhone}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send SMS",
        variant: "destructive",
      });
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyPhoneCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneLoading(true);
    try {
      if (!auth.currentUser) throw new Error("Not authenticated");
      const credential = PhoneAuthProvider.credential(
        phoneVerificationId,
        phoneCode
      );
      await linkWithCredential(auth.currentUser, credential);
      toast({ title: "Success", description: "Phone linked successfully" });
      setPhoneEditMode(false);
      setNewPhone("");
      setPhoneCode("");
      setPhoneStep("input");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to link phone",
        variant: "destructive",
      });
    } finally {
      setPhoneLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in h-full overflow-y-auto scrollbar-hide">
      <div className="flex items-center gap-2 mobile-container">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="mr-2 touch-target"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
        <h1 className="text-xl sm:text-2xl font-bold">Settings</h1>
      </div>

      <div className="mobile-container space-y-4 sm:space-y-6">
        {/* Account Information */}
        <Card className="mobile-card shadow-lg">
          <CardHeader className="mobile-container pb-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="mobile-container pt-0 space-y-4">
            {/* Profile Picture Section */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-16 h-16">
                  <AvatarImage
                    src={
                      user?.photoURL || "/placeholder.svg?height=64&width=64"
                    }
                  />
                  <AvatarFallback className="text-lg bg-purple-100 text-purple-600">
                    {user?.displayName?.charAt(0) ||
                      user?.email?.charAt(0) ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow-md"
                  onClick={() => setProfilePicModalOpen(true)}
                >
                  <Camera className="w-3 h-3" />
                </Button>
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm sm:text-base">
                  {user?.displayName || "User"}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Tap to change profile picture
                </p>
              </div>
            </div>

            <div>
              <Label className="text-sm sm:text-base">Email</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={user?.email || ""}
                  readOnly
                  className="bg-gray-50 text-sm sm:text-base"
                />
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 text-xs"
                >
                  Verified
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm sm:text-base">Display Name</Label>
              <Input
                value={user?.displayName || "Not set"}
                className="mt-1 text-sm sm:text-base"
              />
            </div>
          </CardContent>
        </Card>

        {/* Email */}
        <Card className="mobile-card shadow-lg">
          <CardHeader className="mobile-container pb-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              Username
            </CardTitle>
          </CardHeader>
          <CardContent className="mobile-container pt-0 space-y-4">
            <div>
              <Label className="text-sm sm:text-base">Current Username</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={user?.displayName || "Not set"}
                  readOnly
                  className="bg-gray-50 text-sm sm:text-base"
                />
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 text-xs"
                >
                  {user?.displayName || "Not set"}
                </Badge>
              </div>
            </div>
            {editingUsername ? (
              <form onSubmit={handleUsernameUpdate} className="space-y-2">
                <Input
                  type="text"
                  placeholder="New username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  onBlur={() => checkUsername(newUsername)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUsernameUpdate();
                    }
                  }}
                  className="text-sm sm:text-base"
                />
                <Badge
                  variant={
                    usernameAvailable === true ? "default" : "destructive"
                  }
                  className="text-xs"
                >
                  {usernameAvailable === true
                    ? "Username available"
                    : usernameAvailable === false
                    ? "Username is already taken"
                    : "Check username availability"}
                </Badge>
                <Button type="submit" disabled={checkingUsername}>
                  {checkingUsername ? "Checking..." : "Update Username"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingUsername(false)}
                >
                  Cancel
                </Button>
              </form>
            ) : (
              <Button onClick={() => setEditingUsername(true)}>
                Change Username
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Email */}
        <Card className="mobile-card shadow-lg">
          <CardHeader className="mobile-container pb-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              Email
            </CardTitle>
          </CardHeader>
          <CardContent className="mobile-container pt-0 space-y-4">
            {user?.email && (
              <div>
                Current: <span className="font-medium">{user.email}</span>
              </div>
            )}
            {emailEditMode ? (
              <form onSubmit={handleLinkEmail} className="space-y-2">
                <Input
                  type="email"
                  placeholder="New email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  required
                />
                <Button type="submit" disabled={emailLoading}>
                  {emailLoading ? "Linking..." : "Link Email"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEmailEditMode(false)}
                >
                  Cancel
                </Button>
              </form>
            ) : (
              <Button onClick={() => setEmailEditMode(true)}>
                {user?.email ? "Change Email" : "Add Email"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card className="mobile-card shadow-lg">
          <CardHeader className="mobile-container pb-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="mobile-container pt-0">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm sm:text-base font-medium">
                  Theme
                </Label>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Choose between light and dark theme
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm">Light</span>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) =>
                    setTheme(checked ? "dark" : "light")
                  }
                />
                <span className="text-xs sm:text-sm">Dark</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card className="mobile-card shadow-lg">
          <CardHeader className="mobile-container pb-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Key className="w-4 h-4 sm:w-5 sm:h-5" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="mobile-container pt-0 space-y-4">
            <div>
              <Label className="text-sm sm:text-base">Current Password</Label>
              <div className="relative mt-1">
                <Input
                  type={showPasswords ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="text-sm sm:text-base pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPasswords(!showPasswords)}
                >
                  {showPasswords ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm sm:text-base">New Password</Label>
              <Input
                type={showPasswords ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 text-sm sm:text-base"
              />
            </div>

            <div>
              <Label className="text-sm sm:text-base">
                Confirm New Password
              </Label>
              <Input
                type={showPasswords ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 text-sm sm:text-base"
              />
            </div>

            <Button
              onClick={handlePasswordChange}
              disabled={isChangingPassword}
              className="w-full touch-target"
            >
              {isChangingPassword ? "Changing Password..." : "Change Password"}
            </Button>
          </CardContent>
        </Card>
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
                  src={user?.photoURL || "/placeholder.svg?height=96&width=96"}
                />
                <AvatarFallback className="text-2xl bg-purple-100 text-purple-600">
                  {user?.displayName?.charAt(0) ||
                    user?.email?.charAt(0) ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleProfilePicUpload}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="pb-20"></div>
    </div>
  );
}
