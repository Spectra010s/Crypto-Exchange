/// <reference types="react" />
"use client";

import React, { useState, useRef } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  EmailAuthProvider,
  linkWithCredential,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Phone,
  User as UserIcon,
  Globe,
  ArrowLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/ui/logo";

const COUNTRY_CODES = [
  { code: "+1", country: "US" },
  { code: "+44", country: "UK" },
  { code: "+234", country: "NG" },
  { code: "+91", country: "IN" },
  // Add more as needed
];

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

interface AuthFormProps {
  onAuthSuccess: () => void;
}

export function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0].code);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotUsername, setForgotUsername] = useState("");
  const [forgotStep, setForgotStep] = useState<"input" | "code" | "reset">(
    "input"
  );
  const [resetCode, setResetCode] = useState("");
  const [newForgotPassword, setNewForgotPassword] = useState("");
  const [confirmForgotPassword, setConfirmForgotPassword] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const { toast } = useToast();
  const [smsSent, setSmsSent] = useState(false);
  const [smsCode, setSmsCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const recaptchaRef = useRef<any>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const [checkingUsername, setCheckingUsername] = useState(false);
  // Add state for phone sign up step
  const [phoneStep, setPhoneStep] = useState<"phone" | "code" | "set">("phone");
  const [pendingPhoneUser, setPendingPhoneUser] = useState<any>(null);

  const passwordStrength = getPasswordStrength(password);
  const passwordStrengthText = [
    "Very Weak",
    "Weak",
    "Fair",
    "Good",
    "Strong",
    "Very Strong",
  ][passwordStrength];

  // Setup invisible reCAPTCHA for phone auth
  const setupRecaptcha = () => {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {},
        },
        auth
      );
    }
    return recaptchaRef.current;
  };

  // Phone sign up/sign in handler (step 1: send code)
  const handlePhoneSendCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const appVerifier = setupRecaptcha();
      const fullPhone = countryCode + phone;
      const confirmation = await signInWithPhoneNumber(
        auth,
        fullPhone,
        appVerifier
      );
      setConfirmationResult(confirmation);
      setSmsSent(true);
      setPhoneStep("code");
      toast({
        title: "SMS Sent",
        description: `A verification code was sent to ${fullPhone}`,
      });
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

  // Phone code verification handler (step 2: verify code)
  const handlePhoneVerifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!confirmationResult) return;
      const result = await confirmationResult.confirm(smsCode);
      setPendingPhoneUser(result.user);
      setPhoneStep("set"); // Now prompt for username/password
      setSmsSent(false);
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

  // Phone set username/password handler (step 3: set username/password)
  const handlePhoneSetUsernamePassword = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!pendingPhoneUser) return;
      if (usernameAvailable === false) {
        toast({
          title: "Error",
          description: "Username is already taken",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords don't match",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      // Link password credential to phone user
      const credential = EmailAuthProvider.credential(
        pendingPhoneUser.phoneNumber + "@phone.biaz",
        password
      );
      await linkWithCredential(pendingPhoneUser, credential);
      await updateProfile(pendingPhoneUser, { displayName: username });
      await setDoc(doc(db, "usernames", username), {
        uid: pendingPhoneUser.uid,
      });
      toast({ title: "Success", description: "Account created successfully" });
      onAuthSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to set password",
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
      if (!username.trim()) {
        toast({
          title: "Error",
          description: "Username is required",
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
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords don't match",
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
      if (authMethod === "email") {
        const userCred = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await userCred.user.updateProfile({ displayName: username });
        await sendEmailVerification(userCred.user);
        setVerificationSent(true);
        toast({
          title: "Verify Email",
          description: "A verification code has been sent to your email.",
        });
        await setDoc(doc(db, "usernames", username), {
          uid: userCred.user.uid,
        });
      } else {
        if (authMethod === "phone") {
        const userCred = await createUserWithPhoneAndPassword(
          auth,
          phone,
          password
        );
        await userCred.user.updateProfile({ displayName: username });
        await handlePhoneSendCode(userCred.user);
        handlePhoneVerifyCode(true);
        toast({
          title: "Verify Phone",
          description: `A verification code has been sent to ${countryCode}${phone}`,
        });
      }
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

  // Unified sign in handler
  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      let userCred;
      let id = email;
      // Try to detect if id is email, phone, or username
      if (/^\+?[0-9]{10,}$/.test(id)) {
        // Phone: use phone+password (simulate as email)
        id = id + "@phone.biaz";
      } else if (!id.includes("@")) {
        // Username: look up Firestore
        const docRef = doc(db, "usernames", id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) throw new Error("Username not found");
        // Get user by UID (need to fetch email/phone, here we assume email)
        // In production, you may need a cloud function or user profile collection
        throw new Error(
          "Username sign in requires backend support for email lookup"
        );
      }
      userCred = await signInWithEmailAndPassword(auth, id, password);
      toast({ title: "Success", description: "Signed in successfully" });
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
      // In production, check username/email match, then send code
      await sendPasswordResetEmail(auth, forgotEmail);
      setForgotStep("code");
      toast({
        title: "Check Email",
        description: "A reset code has been sent to your email.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (newForgotPassword !== confirmForgotPassword) {
        toast({
          title: "Error",
          description: "Passwords don't match",
          variant: "destructive",
        });
        return;
      }
      // In production, verify code and reset password
      toast({ title: "Success", description: "Password reset successfully" });
      setShowForgot(false);
      setForgotStep("input");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Real-time username uniqueness check
  const checkUsername = async (uname: string) => {
    setCheckingUsername(true);
    if (!uname) {
      setUsernameAvailable(null);
      setCheckingUsername(false);
      return;
    }
    const docRef = doc(db, "usernames", uname);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setUsernameAvailable(false);
    } else {
      setUsernameAvailable(true);
    }
    setCheckingUsername(false);
  };

  if (showForgot) {
    return (
      <div className="h-full full-viewport flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-blue-50 to-slate-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-slate-900/20">
        <Card className="w-full max-w-md mobile-card shadow-xl border-0">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="flex justify-center">
              <Logo size="xl" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Forgot Password
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Enter your email and username to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {forgotStep === "input" && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgotEmail">Email</Label>
                  <Input
                    id="forgotEmail"
                    type="email"
                    value={forgotEmail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setForgotEmail(e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="forgotUsername">Username</Label>
                  <Input
                    id="forgotUsername"
                    value={forgotUsername}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setForgotUsername(e.target.value)
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Loading..." : "Send Reset Code"}
                </Button>
                <Button
                  variant="link"
                  className="w-full"
                  onClick={() => setShowForgot(false)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>
              </form>
            )}
            {forgotStep === "code" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setForgotStep("reset");
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="resetCode">Reset Code</Label>
                  <Input
                    id="resetCode"
                    value={resetCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setResetCode(e.target.value)
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Verify Code
                </Button>
              </form>
            )}
            {forgotStep === "reset" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newForgotPassword">New Password</Label>
                  <Input
                    id="newForgotPassword"
                    type="password"
                    value={newForgotPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewForgotPassword(e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmForgotPassword">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmForgotPassword"
                    type="password"
                    value={confirmForgotPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setConfirmForgotPassword(e.target.value)
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Reset Password
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verificationSent) {
    return (
      <div className="h-full full-viewport flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-blue-50 to-slate-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-slate-900/20">
        <Card className="w-full max-w-md mobile-card shadow-xl border-0">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="flex justify-center">
              <Logo size="xl" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Verify {authMethod === "email" ? "Email" : "Phone"}
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Enter the verification code sent to your{" "}
              {authMethod === "email" ? "email" : "phone"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onAuthSuccess();
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="verificationCode">Verification Code</Label>
                <Input
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setVerificationCode(e.target.value)
                  }
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Verify
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (authMethod === "phone") {
    if (phoneStep === "phone") {
      return (
        <div className="h-full full-viewport flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-blue-50 to-slate-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-slate-900/20">
          <Card className="w-full max-w-md mobile-card shadow-xl border-0">
            <CardHeader className="text-center space-y-4 pb-6">
              <div className="flex justify-center">
                <Logo size="xl" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {isSignUp ? "Sign Up with Phone" : "Sign In with Phone"}
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Enter your phone number to receive a verification code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handlePhoneSendCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setCountryCode(
                          (e as React.ChangeEvent<HTMLSelectElement>).target
                            .value
                        )
                      }
                      className="h-12 rounded-md border px-2 bg-background"
                      title="Country code"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.country} {c.code}
                        </option>
                      ))}
                    </select>
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setPhone(
                            (e as React.ChangeEvent<HTMLInputElement>).target
                              .value
                          )
                        }
                        className="pl-10 h-12"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div id="recaptcha-container" />
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
                  disabled={loading}
                >
                  {loading
                    ? "Loading..."
                    : isSignUp
                    ? "Send Code"
                    : "Send Code"}
                </Button>
                <Button
                  variant="link"
                  className="w-full"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp
                    ? "Already have an account? Sign in"
                    : "Don't have an account? Sign up"}
                </Button>
                <Button
                  variant="link"
                  className="w-full"
                  onClick={() => setAuthMethod("email")}
                >
                  Use Email
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      );
    } else if (phoneStep === "code") {
      return (
        <div className="h-full full-viewport flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-blue-50 to-slate-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-slate-900/20">
          <Card className="w-full max-w-md mobile-card shadow-xl border-0">
            <CardHeader className="text-center space-y-4 pb-6">
              <div className="flex justify-center">
                <Logo size="xl" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Verify Phone
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Enter the verification code sent to your phone
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handlePhoneVerifyCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smsCode">Verification Code</Label>
                  <Input
                    id="smsCode"
                    value={smsCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSmsCode(
                        (e as React.ChangeEvent<HTMLInputElement>).target.value
                      )
                    }
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </Button>
                <Button
                  variant="link"
                  className="w-full"
                  onClick={() => {
                    setPhoneStep("phone");
                    setSmsCode("");
                  }}
                >
                  Back
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      );
    } else if (phoneStep === "set") {
      return (
        <div className="h-full full-viewport flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-blue-50 to-slate-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-slate-900/20">
          <Card className="w-full max-w-md mobile-card shadow-xl border-0">
            <CardHeader className="text-center space-y-4 pb-6">
              <div className="flex justify-center">
                <Logo size="xl" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Set Username & Password
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Choose a unique username and set your password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form
                onSubmit={handlePhoneSetUsernamePassword}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      value={username}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setUsername(
                          (e as React.ChangeEvent<HTMLInputElement>).target
                            .value
                        );
                        checkUsername(
                          (e as React.ChangeEvent<HTMLInputElement>).target
                            .value
                        );
                      }}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                  {checkingUsername && (
                    <p className="text-xs text-gray-500">
                      Checking username...
                    </p>
                  )}
                  {usernameAvailable === false && (
                    <p className="text-xs text-red-500">
                      Username is already taken.
                    </p>
                  )}
                  {usernameAvailable === true && (
                    <p className="text-xs text-green-600">
                      Username is available.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPassword(
                          (e as React.ChangeEvent<HTMLInputElement>).target
                            .value
                        )
                      }
                      className="pl-10 pr-10 h-12"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-12 w-12"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-xs mt-1">
                    <span>Password Strength:</span>
                    <span
                      className={`font-bold ${
                        passwordStrength < 3
                          ? "text-red-500"
                          : passwordStrength < 5
                          ? "text-yellow-500"
                          : "text-green-600"
                      }`}
                    >
                      {passwordStrengthText}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setConfirmPassword(
                          (e as React.ChangeEvent<HTMLInputElement>).target
                            .value
                        )
                      }
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                  {confirmPassword && (
                    <div
                      className={`text-xs mt-1 ${
                        password === confirmPassword
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {password === confirmPassword
                        ? "Passwords match"
                        : "Passwords do not match"}
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Account"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  return (
    <div className="h-full full-viewport flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-blue-50 to-slate-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-slate-900/20">
      <Card className="w-full max-w-md mobile-card shadow-xl border-0">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="flex justify-center">
            <Logo size="xl" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {isSignUp ? "Join Biaz" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              {isSignUp
                ? "Create your account to start trading crypto"
                : "Sign in to your account to continue"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center gap-2 mb-2">
            <Button
              variant={authMethod === "email" ? "default" : "outline"}
              size="sm"
              onClick={() => setAuthMethod("email")}
            >
              Email
            </Button>
            <Button
              variant={authMethod === "phone" ? "default" : "outline"}
              size="sm"
              onClick={() => setAuthMethod("phone")}
            >
              Phone
            </Button>
            {!isSignUp && (
              <Button
                variant={authMethod === "username" ? "default" : "outline"}
                size="sm"
                onClick={() => setAuthMethod("username")}
              >
                Username
              </Button>
            )}
          </div>
          <form
            onSubmit={isSignUp ? handleSignUp : handleSignIn}
            className="space-y-4"
          >
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    value={username}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setUsername(e.target.value);
                      checkUsername(e.target.value);
                    }}
                    className="pl-10 h-12"
                    required
                  />
                </div>
                {checkingUsername && (
                  <p className="text-xs text-gray-500">Checking username...</p>
                )}
                {usernameAvailable === false && (
                  <p className="text-xs text-red-500">
                    Username is already taken.
                  </p>
                )}
                {usernameAvailable === true && (
                  <p className="text-xs text-green-600">
                    Username is available.
                  </p>
                )}
              </div>
            )}
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEmail(e.target.value)
                    }
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>
            )}
            {authMethod === "phone" && (
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setCountryCode(e.target.value)
                    }
                    className="h-12 rounded-md border px-2 bg-background"
                    title="Country code"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.country} {c.code}
                      </option>
                    ))}
                  </select>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPhone(e.target.value)
                      }
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>
              </div>
            )}
            {authMethod === "username" && !isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    value={username}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setUsername(e.target.value)
                    }
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                  }
                  className="pl-10 pr-10 h-12"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-12 w-12"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {isSignUp && (
                <div className="flex items-center gap-2 text-xs mt-1">
                  <span>Password Strength:</span>
                  <span
                    className={`font-bold ${
                      passwordStrength < 3
                        ? "text-red-500"
                        : passwordStrength < 5
                        ? "text-yellow-500"
                        : "text-green-600"
                    }`}
                  >
                    {passwordStrengthText}
                  </span>
                </div>
              )}
            </div>
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setConfirmPassword(e.target.value)
                    }
                    className="pl-10 h-12"
                    required
                  />
                </div>
                {confirmPassword && (
                  <div
                    className={`text-xs mt-1 ${
                      password === confirmPassword
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {password === confirmPassword
                      ? "Passwords match"
                      : "Passwords do not match"}
                  </div>
                )}
              </div>
            )}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
              disabled={loading}
            >
              {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>
          {!isSignUp && (
            <div className="text-center">
              <Button
                variant="link"
                className="text-sm text-gray-600 hover:text-purple-600"
                onClick={() => setShowForgot(true)}
              >
                Forgot password?
              </Button>
            </div>
          )}
          <div className="text-center">
            <Button
              variant="link"
              className="text-sm text-gray-600 hover:text-purple-600"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
