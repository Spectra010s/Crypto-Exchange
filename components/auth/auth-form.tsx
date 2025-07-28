/// <reference types="react" />
"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User as UserIcon,
  Phone,
  ArrowLeft,
  Globe,
  Wallet,
  Fingerprint,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/ui/logo";
import { useCustomAuth } from "@/hooks/use-custom-auth";
import { signIn, getSession } from "next-auth/react";
import { useWalletContext } from "@/hooks/use-wallet";

function getPasswordStrength(password: string) {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return strength;
}

function getPasswordStrengthText(strength: number) {
  switch (strength) {
    case 0:
    case 1:
      return { text: "Very Weak", color: "text-red-500" };
    case 2:
      return { text: "Weak", color: "text-orange-500" };
    case 3:
      return { text: "Fair", color: "text-yellow-500" };
    case 4:
      return { text: "Good", color: "text-blue-500" };
    case 5:
      return { text: "Strong", color: "text-green-500" };
    default:
      return { text: "Very Weak", color: "text-red-500" };
  }
}

interface AuthFormProps {
  onAuthSuccess: () => void;
}

export function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const {
    register,
    login,
    sendEmailVerification,
    verifyEmail,
    sendSMSVerification,
    verifySMS,
    checkUsername,
  } = useCustomAuth();
  const { walletData, connectEthereumWallet, connectSolanaWallet } =
    useWalletContext();
  const { toast } = useToast();

  const [authMode, setAuthMode] = useState<"signup" | "signin" | "forgot">(
    "signup"
  );
  const [authMethod, setAuthMethod] = useState<
    "email" | "phone" | "username" | "wallet" | "google"
  >("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneStep, setPhoneStep] = useState<"phone" | "code" | "username">(
    "phone"
  );
  const [verificationCode, setVerificationCode] = useState("");
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordStrength(getPasswordStrength(value));
  };

  const handleUsernameCheck = async (value: string) => {
    if (value.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    try {
      const available = await checkUsername(value);
      setUsernameAvailable(available);
    } catch (error) {
      setUsernameAvailable(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signIn("google", { callbackUrl: "/" });
      if (result?.error) {
        toast({
          title: "Error",
          description: "Google sign-in failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Google sign-in failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWalletSignIn = async () => {
    setLoading(true);
    try {
      // Connect wallet first
      await connectEthereumWallet();

      if (walletData.isConnected && walletData.address) {
        // Generate message for signature
        const message = `Sign this message to authenticate with Biaz.\n\nAddress: ${
          walletData.address
        }\nNonce: ${Date.now()}\n\nThis signature will be used to verify your wallet ownership.`;

        // Request signature from wallet
        const signature = await window.ethereum?.request({
          method: "personal_sign",
          params: [message, walletData.address],
        });

        if (signature) {
          // Send to backend for verification
          const response = await fetch("/api/auth/wallet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              address: walletData.address,
              signature,
              message,
              chainId: walletData.network === "ethereum" ? 1 : 137,
            }),
          });

          if (response.ok) {
            const result = await response.json();
            localStorage.setItem("auth_token", result.token);
            onAuthSuccess();
            toast({
              title: "Success",
              description: result.message,
            });
          } else {
            throw new Error("Wallet authentication failed");
          }
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Wallet sign-in failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMethod !== "wallet" && password !== confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive",
        });
        return;
      }

      if (authMethod !== "wallet" && passwordStrength < 3) {
        toast({
          title: "Error",
          description: "Password is too weak",
          variant: "destructive",
        });
        return;
      }

      const userData: any = {
        password,
      };

      if (authMethod === "email") {
        userData.email = email;
        userData.displayName = email.split("@")[0];
      } else if (authMethod === "phone") {
        userData.phone = phone;
        userData.displayName = `User${Math.random().toString(36).substr(2, 5)}`;
      }

      await register(userData);

      // Send verification if email
      if (authMethod === "email") {
        await sendEmailVerification(email);
        setEmailVerificationSent(true);
      }

      onAuthSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Sign up failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let identifier = "";
      let method: any = { type: "username", identifier: "", verified: true };

      if (authMethod === "email") {
        identifier = email;
        method = { type: "email", identifier: email, verified: true };
      } else if (authMethod === "phone") {
        identifier = phone;
        method = { type: "phone", identifier: phone, verified: true };
      } else if (authMethod === "username") {
        identifier = username;
        method = { type: "username", identifier: username, verified: true };
      }

      await login(method, password);
      onAuthSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Sign in failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let identifier = "";
      if (authMethod === "email") {
        identifier = email;
      } else if (authMethod === "phone") {
        identifier = phone;
      }

      // Implement forgot password logic
      toast({
        title: "Success",
        description: "Password reset instructions sent",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset instructions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sendSMSVerification(phone);
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
      setLoading(false);
    }
  };

  const handlePhoneVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await verifySMS(phone, verificationCode);
      setPhoneStep("username");
      toast({
        title: "Success",
        description: "Phone number verified",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSetUsernamePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (password !== confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive",
        });
        return;
      }

      if (passwordStrength < 3) {
        toast({
          title: "Error",
          description: "Password is too weak",
          variant: "destructive",
        });
        return;
      }

      const userData = {
        phone,
        username,
        password,
        displayName: username,
      };

      await register(userData);
      onAuthSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Sign up failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPhone("");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setEmailVerificationSent(false);
    setUsernameAvailable(null);
    setPasswordStrength(0);
    setPhoneStep("phone");
  };

  if (emailVerificationSent) {
    return (
      <div className="h-full full-viewport flex items-center justify-center">
        <Card className="shadow-xl max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <Mail className="w-12 h-12 mx-auto text-green-600 mb-4" />
            <h2 className="text-xl font-bold mb-2">Check your email</h2>
            <p className="text-gray-600 mb-4">
              We've sent a verification link to {email}
            </p>
            <Button
              onClick={() => {
                setEmailVerificationSent(false);
                resetForm();
              }}
              className="w-full"
            >
              Back to Sign Up
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full full-viewport flex items-center justify-center">
      <Card className="shadow-xl max-w-md w-full mx-4">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {authMode === "signup" ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription>
            {authMode === "signup"
              ? "Sign up to start trading cryptocurrencies"
              : "Sign in to access your account"}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          {/* Authentication Method Selection */}
          {authMode === "signup" && (
            <div className="mb-6">
              <Label className="text-sm font-medium mb-3 block">
                Sign up with:
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={authMethod === "email" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAuthMethod("email")}
                  className="text-xs"
                >
                  <Mail className="w-3 h-3 mr-1" />
                  Email
                </Button>
                <Button
                  type="button"
                  variant={authMethod === "phone" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAuthMethod("phone")}
                  className="text-xs"
                >
                  <Phone className="w-3 h-3 mr-1" />
                  Phone
                </Button>
              </div>
            </div>
          )}

          {authMode === "signin" && (
            <div className="mb-6">
              <Label className="text-sm font-medium mb-3 block">
                Sign in with:
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={authMethod === "email" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAuthMethod("email")}
                  className="text-xs"
                >
                  <Mail className="w-3 h-3 mr-1" />
                  Email
                </Button>
                <Button
                  type="button"
                  variant={authMethod === "phone" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAuthMethod("phone")}
                  className="text-xs"
                >
                  <Phone className="w-3 h-3 mr-1" />
                  Phone
                </Button>
                <Button
                  type="button"
                  variant={authMethod === "username" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAuthMethod("username")}
                  className="text-xs"
                >
                  <UserIcon className="w-3 h-3 mr-1" />
                  Username
                </Button>
              </div>
            </div>
          )}

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <Globe className="w-4 h-4 mr-2" />
              Continue with Google
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleWalletSignIn}
              disabled={loading}
            >
              <Wallet className="w-4 h-4 mr-2" />
              Continue with Wallet
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <form
            onSubmit={
              authMode === "signup"
                ? handleSignUp
                : authMode === "signin"
                ? handleSignIn
                : handleForgotPassword
            }
            className="space-y-4"
          >
            {authMethod === "email" && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}

            {authMethod === "phone" &&
              authMode === "signup" &&
              phoneStep === "phone" && (
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}

            {authMethod === "phone" &&
              authMode === "signup" &&
              phoneStep === "code" && (
                <div className="space-y-2">
                  <Label htmlFor="verification-code">Verification Code</Label>
                  <Input
                    id="verification-code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>
              )}

            {authMethod === "phone" &&
              authMode === "signup" &&
              phoneStep === "username" && (
                <div className="space-y-2">
                  <Label htmlFor="username">Choose Username</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        handleUsernameCheck(e.target.value);
                      }}
                      className="pl-10"
                      required
                    />
                  </div>
                  {usernameAvailable !== null && (
                    <p
                      className={`text-xs ${
                        usernameAvailable ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {usernameAvailable
                        ? "✓ Username available"
                        : "✗ Username taken"}
                    </p>
                  )}
                </div>
              )}

            {authMethod === "username" && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}

            {authMode !== "forgot" && authMethod !== "wallet" && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {authMode === "signup" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Password strength:</span>
                      <span
                        className={
                          getPasswordStrengthText(passwordStrength).color
                        }
                      >
                        {getPasswordStrengthText(passwordStrength).text}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className={`h-1 rounded-full transition-all ${
                          passwordStrength <= 1
                            ? "bg-red-500"
                            : passwordStrength === 2
                            ? "bg-orange-500"
                            : passwordStrength === 3
                            ? "bg-yellow-500"
                            : passwordStrength === 4
                            ? "bg-blue-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {authMode === "signup" && authMethod !== "wallet" && (
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Phone-specific buttons */}
            {authMethod === "phone" && authMode === "signup" && (
              <div className="space-y-2">
                {phoneStep === "phone" && (
                  <Button
                    type="button"
                    onClick={handlePhoneSendCode}
                    disabled={loading || !phone}
                    className="w-full"
                  >
                    Send Verification Code
                  </Button>
                )}
                {phoneStep === "code" && (
                  <Button
                    type="button"
                    onClick={handlePhoneVerifyCode}
                    disabled={loading || !verificationCode}
                    className="w-full"
                  >
                    Verify Code
                  </Button>
                )}
                {phoneStep === "username" && (
                  <Button
                    type="submit"
                    disabled={
                      loading || !username || !password || !confirmPassword
                    }
                    className="w-full"
                  >
                    Create Account
                  </Button>
                )}
              </div>
            )}

            {/* Regular form submission */}
            {!(authMethod === "phone" && authMode === "signup") && (
              <Button type="submit" disabled={loading} className="w-full">
                {loading
                  ? "Loading..."
                  : authMode === "signup"
                  ? "Create Account"
                  : "Sign In"}
              </Button>
            )}
          </form>

          {/* Mode switching */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {authMode === "signup"
                ? "Already have an account?"
                : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === "signup" ? "signin" : "signup");
                  resetForm();
                }}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                {authMode === "signup" ? "Sign In" : "Sign Up"}
              </button>
            </p>
            {authMode === "signin" && (
              <button
                type="button"
                onClick={() => setAuthMode("forgot")}
                className="text-sm text-purple-600 hover:text-purple-700 mt-2"
              >
                Forgot your password?
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
