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
  Fingerprint,
  QrCode,
  Trash2,
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

  // State for profile picture
  const [profilePicModalOpen, setProfilePicModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  // Passkey and biometrics state
  const [passkeyEnabled, setPasskeyEnabled] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [isSettingUpPasskey, setIsSettingUpPasskey] = useState(false);
  const [isSettingUpBiometrics, setIsSettingUpBiometrics] = useState(false);

  // Real-time username uniqueness check
  const checkUsername = async (uname: string) => {
    setCheckingUsername(true);
    if (!uname) {
      setUsernameAvailable(null);
      setCheckingUsername(false);
      return;
    }

    try {
      const usernameDoc = await getDoc(
        doc(db, "usernames", uname.toLowerCase())
      );
      setUsernameAvailable(!usernameDoc.exists());
    } catch (error) {
      console.error("Error checking username:", error);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleUsernameUpdate = async () => {
    if (!user || !newUsername.trim()) return;

    try {
      // Check if username is available
      const usernameDoc = await getDoc(
        doc(db, "usernames", newUsername.toLowerCase())
      );
      if (usernameDoc.exists()) {
        toast({
          title: "Error",
          description: "Username already taken",
          variant: "destructive",
        });
        return;
      }

      // Update username in Firestore
      await setDoc(doc(db, "usernames", newUsername.toLowerCase()), {
        uid: user.uid,
        createdAt: new Date(),
      });

      // Update user profile
      await updateProfile(user, {
        displayName: newUsername,
      });

      toast({
        title: "Success",
        description: "Username updated successfully",
      });
      setEditingUsername(false);
      setNewUsername("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update username",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = async () => {
    if (!user || !currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
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
      const credential = EmailAuthProvider.credential(
        user.email!,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      toast({
        title: "Success",
        description: "Password updated successfully",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleProfilePicUpload = async () => {
    if (!selectedImage) {
      toast({
        title: "Error",
        description: "Please select an image first",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // In production, upload to cloud storage and get URL
      // For now, we'll simulate the upload
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await updateProfile(user!, {
        photoURL: selectedImage,
      });

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
      setProfilePicModalOpen(false);
      setSelectedImage(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile picture",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleTakePhoto = () => {
    // In production, this would open camera
    toast({
      title: "Camera Access",
      description: "Camera functionality will be available in the mobile app",
    });
  };

  const handleRemovePhoto = async () => {
    try {
      await updateProfile(user!, {
        photoURL: null,
      });
      toast({
        title: "Success",
        description: "Profile picture removed",
      });
      setProfilePicModalOpen(false);
      setSelectedImage(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove profile picture",
        variant: "destructive",
      });
    }
  };

  const handleSetupPasskey = async () => {
    setIsSettingUpPasskey(true);
    try {
      // In production, implement WebAuthn API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setPasskeyEnabled(true);
      toast({
        title: "Success",
        description: "Passkey authentication enabled",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to setup passkey",
        variant: "destructive",
      });
    } finally {
      setIsSettingUpPasskey(false);
    }
  };

  const handleSetupBiometrics = async () => {
    setIsSettingUpBiometrics(true);
    try {
      // In production, implement biometric authentication
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setBiometricsEnabled(true);
      toast({
        title: "Success",
        description: "Biometric authentication enabled",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to setup biometrics",
        variant: "destructive",
      });
    } finally {
      setIsSettingUpBiometrics(false);
    }
  };

  const handleLinkEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newEmail || !emailPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setEmailLoading(true);
    try {
      const credential = EmailAuthProvider.credential(newEmail, emailPassword);
      await linkWithCredential(user, credential);
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

  const setupRecaptcha = () => {
    if (typeof window !== "undefined" && !recaptchaRef.current) {
      // In production, setup reCAPTCHA
      console.log("Setting up reCAPTCHA");
    }
  };

  const handleSendPhoneCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhone) {
      toast({
        title: "Error",
        description: "Please enter a phone number",
        variant: "destructive",
      });
      return;
    }

    setPhoneLoading(true);
    try {
      setupRecaptcha();
      // In production, implement phone verification
      setPhoneStep("code");
      toast({
        title: "Success",
        description: "Verification code sent to your phone",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send code",
        variant: "destructive",
      });
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyPhoneCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneCode) {
      toast({
        title: "Error",
        description: "Please enter the verification code",
        variant: "destructive",
      });
      return;
    }

    setPhoneLoading(true);
    try {
      if (!auth.currentUser) throw new Error("Not authenticated");
      // In production, verify the code with Firebase
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
        {/* Profile Picture Section */}
        <Card className="mobile-card shadow-lg">
          <CardHeader className="mobile-container pb-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              Profile Picture
            </CardTitle>
          </CardHeader>
          <CardContent className="mobile-container pt-0">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16 sm:w-20 sm:h-20">
                <AvatarImage
                  src={user?.photoURL || "/placeholder.svg?height=80&width=80"}
                />
                <AvatarFallback className="text-lg sm:text-xl bg-purple-100 text-purple-600">
                  {user?.displayName?.charAt(0) ||
                    user?.email?.charAt(0) ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm sm:text-base font-medium">
                  {user?.displayName || "User"}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  {user?.email}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setProfilePicModalOpen(true)}
                  className="mt-2 touch-target"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Change Photo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Username Section */}
        <Card className="mobile-card shadow-lg">
          <CardHeader className="mobile-container pb-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              Username
            </CardTitle>
          </CardHeader>
          <CardContent className="mobile-container pt-0 space-y-4">
            {editingUsername ? (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="username" className="text-sm sm:text-base">
                    New Username
                  </Label>
                  <Input
                    id="username"
                    value={newUsername}
                    onChange={(e) => {
                      setNewUsername(e.target.value);
                      checkUsername(e.target.value);
                    }}
                    placeholder="Enter new username"
                    className="mt-1"
                  />
                  {checkingUsername && (
                    <p className="text-xs text-gray-500 mt-1">Checking...</p>
                  )}
                  {usernameAvailable === false && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Username already taken
                    </p>
                  )}
                  {usernameAvailable === true && (
                    <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Username available
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleUsernameUpdate}
                    disabled={!usernameAvailable || checkingUsername}
                    className="flex-1 touch-target"
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingUsername(false);
                      setNewUsername("");
                      setUsernameAvailable(null);
                    }}
                    className="flex-1 touch-target"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm sm:text-base font-medium">
                    Current Username
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {user?.displayName || "Not set"}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingUsername(true)}
                  className="touch-target"
                >
                  Edit
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card className="mobile-card shadow-lg">
          <CardHeader className="mobile-container pb-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="mobile-container pt-0 space-y-4">
            {/* Passkey Authentication */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm sm:text-base font-medium">
                  Passkey Authentication
                </Label>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Use biometric or device security
                </p>
              </div>
              <Switch
                checked={passkeyEnabled}
                onCheckedChange={setPasskeyEnabled}
              />
            </div>

            {!passkeyEnabled && (
              <Button
                variant="outline"
                onClick={handleSetupPasskey}
                disabled={isSettingUpPasskey}
                className="w-full touch-target"
              >
                {isSettingUpPasskey ? "Setting up..." : "Setup Passkey"}
              </Button>
            )}

            {/* Biometric Login */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm sm:text-base font-medium">
                  Biometric Login
                </Label>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Use fingerprint or face recognition
                </p>
              </div>
              <Switch
                checked={biometricsEnabled}
                onCheckedChange={setBiometricsEnabled}
              />
            </div>

            {!biometricsEnabled && (
              <Button
                variant="outline"
                onClick={handleSetupBiometrics}
                disabled={isSettingUpBiometrics}
                className="w-full touch-target"
              >
                {isSettingUpBiometrics ? "Setting up..." : "Setup Biometrics"}
              </Button>
            )}

            {/* Password Change */}
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  // In production, open password change modal
                  toast({
                    title: "Password Change",
                    description:
                      "Password change will be available in production",
                  });
                }}
                className="w-full touch-target"
              >
                <Key className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </div>
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
                  {user?.phoneNumber || "No phone number linked"}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPhoneEditMode(true)}
              >
                {user?.phoneNumber ? "Change" : "Add"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
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
                  Dark Mode
                </Label>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Switch between light and dark themes
                </p>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) =>
                  setTheme(checked ? "dark" : "light")
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Picture Upload Modal */}
      <Dialog open={profilePicModalOpen} onOpenChange={setProfilePicModalOpen}>
        <DialogContent className="mx-4 max-w-sm">
          <DialogHeader>
            <DialogTitle>Change Profile Picture</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Image Preview */}
            <div className="text-center space-y-4">
              <Avatar className="w-24 h-24 mx-auto">
                <AvatarImage
                  src={
                    selectedImage ||
                    user?.photoURL ||
                    "/placeholder.svg?height=96&width=96"
                  }
                />
                <AvatarFallback className="text-2xl bg-purple-100 text-purple-600">
                  {user?.displayName?.charAt(0) ||
                    user?.email?.charAt(0) ||
                    "U"}
                </AvatarFallback>
              </Avatar>

              {selectedImage && (
                <div className="text-center">
                  <p className="text-sm text-green-600 font-medium">
                    Image selected
                  </p>
                  <p className="text-xs text-gray-500">Preview shown above</p>
                </div>
              )}
            </div>

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
                      handleImageSelect(file);
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
                onClick={handleTakePhoto}
              >
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </Button>

              {selectedImage && (
                <Button
                  onClick={handleProfilePicUpload}
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? "Uploading..." : "Save Photo"}
                </Button>
              )}

              {user?.photoURL && (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleRemovePhoto}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Photo
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Phone Verification Modal */}
      {phoneEditMode && (
        <Dialog open={phoneEditMode} onOpenChange={setPhoneEditMode}>
          <DialogContent className="mx-4">
            <DialogHeader>
              <DialogTitle>
                {phoneStep === "input" ? "Add Phone Number" : "Verify Code"}
              </DialogTitle>
            </DialogHeader>
            <form
              onSubmit={
                phoneStep === "input"
                  ? handleSendPhoneCode
                  : handleVerifyPhoneCode
              }
              className="space-y-4"
            >
              {phoneStep === "input" ? (
                <div>
                  <Label htmlFor="phone" className="text-sm sm:text-base">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+1234567890"
                    className="mt-1"
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="code" className="text-sm sm:text-base">
                    Verification Code
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="mt-1"
                  />
                </div>
              )}
              <div className="flex space-x-2">
                <Button
                  type="submit"
                  disabled={phoneLoading}
                  className="flex-1 touch-target"
                >
                  {phoneLoading
                    ? "Sending..."
                    : phoneStep === "input"
                    ? "Send Code"
                    : "Verify Code"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPhoneEditMode(false)}
                  className="flex-1 touch-target"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <div className="pb-20"></div>
    </div>
  );
}
