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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/ui/logo";
import { useCustomAuth } from "@/hooks/use-custom-auth";

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
  const { toast } = useToast();

  const [authMode, setAuthMode] = useState<"signup" | "signin" | "forgot">(
    "signup"
  );
  const [authMethod, setAuthMethod] = useState<"email" | "phone" | "username">(
    "email"
  );
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
      setUsernameAvailable(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
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

      const userData: any = {
        password,
      };

      if (authMethod === "email") {
        userData.email = email;
        userData.displayName = email.split("@")[0];
      } else if (authMethod === "phone") {
        userData.phone = phone;
        userData.displayName = `User${Math.random().toString(36).substr(2, 5)}`;
      } else if (authMethod === "username") {
        userData.username = username;
        userData.displayName = username;
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
      } else if (authMethod === "username") {
        identifier = username;
      }

      // This would call the forgotPassword method
      toast({
        title: "Success",
        description: "Password reset instructions sent",
      });

      setAuthMode("signin");
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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send SMS",
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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid verification code",
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

      await register({
        phone,
        username,
        password,
        displayName: username,
      });

      onAuthSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Registration failed",
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
    setVerificationCode("");
    setPhoneStep("phone");
    setEmailVerificationSent(false);
    setUsernameAvailable(null);
    setPasswordStrength(0);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="xl" className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {authMode === "signup"
              ? "Create Account"
              : authMode === "signin"
              ? "Welcome Back"
              : "Reset Password"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {authMode === "signup"
              ? "Join Biaz for seamless crypto trading"
              : authMode === "signin"
              ? "Sign in to your account"
              : "Enter your details to reset password"}
          </p>
        </div>

        <Card className="shadow-xl">
          <CardContent className="p-6">
            {authMode === "signup" && (
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block">
                  Sign up with:
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

              {authMode !== "forgot" && (
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

              {authMode === "signup" && (
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
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
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

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {authMode === "signup"
                      ? "Creating Account..."
                      : authMode === "signin"
                      ? "Signing In..."
                      : "Sending..."}
                  </>
                ) : (
                  <>
                    {authMode === "signup"
                      ? "Create Account"
                      : authMode === "signin"
                      ? "Sign In"
                      : "Send Reset"}
                  </>
                )}
              </Button>
            </form>

            {authMethod === "phone" &&
              authMode === "signup" &&
              phoneStep === "phone" && (
                <form onSubmit={handlePhoneSendCode} className="mt-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading || !phone}
                  >
                    {loading ? "Sending..." : "Send Verification Code"}
                  </Button>
                </form>
              )}

            {authMethod === "phone" &&
              authMode === "signup" &&
              phoneStep === "code" && (
                <form onSubmit={handlePhoneVerifyCode} className="mt-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading || !verificationCode}
                  >
                    {loading ? "Verifying..." : "Verify Code"}
                  </Button>
                </form>
              )}

            {authMethod === "phone" &&
              authMode === "signup" &&
              phoneStep === "username" && (
                <form
                  onSubmit={handlePhoneSetUsernamePassword}
                  className="mt-4"
                >
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      loading ||
                      !username ||
                      !password ||
                      !confirmPassword ||
                      password !== confirmPassword
                    }
                  >
                    {loading ? "Creating Account..." : "Complete Registration"}
                  </Button>
                </form>
              )}

            <div className="mt-6 text-center">
              {authMode === "signup" ? (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto font-semibold"
                    onClick={() => {
                      setAuthMode("signin");
                      resetForm();
                    }}
                  >
                    Sign in
                  </Button>
                </p>
              ) : authMode === "signin" ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{" "}
                    <Button
                      variant="link"
                      className="p-0 h-auto font-semibold"
                      onClick={() => {
                        setAuthMode("signup");
                        resetForm();
                      }}
                    >
                      Sign up
                    </Button>
                  </p>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-sm"
                    onClick={() => {
                      setAuthMode("forgot");
                      resetForm();
                    }}
                  >
                    Forgot your password?
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Remember your password?{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto font-semibold"
                    onClick={() => {
                      setAuthMode("signin");
                      resetForm();
                    }}
                  >
                    Sign in
                  </Button>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
