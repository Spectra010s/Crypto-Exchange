"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthState, LoginMethod, WalletInfo } from "@/lib/auth-config";
import { useToast } from "@/hooks/use-toast";

interface CustomAuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  loginMethods: LoginMethod[];
  walletInfo: WalletInfo | null;

  // Authentication methods
  register: (data: RegisterData) => Promise<void>;
  login: (method: LoginMethod, credential: string) => Promise<void>;
  logout: () => Promise<void>;

  // Verification methods
  sendEmailVerification: (email: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  sendSMSVerification: (phone: string) => Promise<void>;
  verifySMS: (phone: string, code: string) => Promise<void>;

  // Password methods
  forgotPassword: (identifier: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;

  // Username methods
  checkUsername: (username: string) => Promise<boolean>;
  updateUsername: (username: string) => Promise<void>;

  // Passkey methods
  registerPasskey: () => Promise<void>;
  authenticatePasskey: () => Promise<void>;

  // Wallet methods
  createWallet: (
    type: "ethereum" | "solana" | "sui" | "cosmos"
  ) => Promise<WalletInfo>;
  importWallet: (
    type: "ethereum" | "solana" | "sui" | "cosmos",
    privateKey: string
  ) => Promise<WalletInfo>;
  backupWallet: () => Promise<string>; // Returns seed phrase or private key

  // Profile methods
  updateProfile: (data: Partial<User>) => Promise<void>;
  uploadPhoto: (file: File) => Promise<void>;

  // Recovery methods
  initiateRecovery: (identifier: string) => Promise<void>;
  completeRecovery: (token: string, newPassword: string) => Promise<void>;
}

interface RegisterData {
  email?: string;
  phone?: string;
  username?: string;
  password?: string;
  displayName?: string;
}

const CustomAuthContext = createContext<CustomAuthContextType | undefined>(
  undefined
);

export function CustomAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });
  const [loginMethods, setLoginMethods] = useState<LoginMethod[]>([]);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const { toast } = useToast();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for existing session
        const token = localStorage.getItem("auth_token");
        if (token) {
          // Verify token with backend
          const response = await fetch("/api/auth/verify-session", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            const userData = await response.json();
            setAuthState({
              user: userData.user,
              loading: false,
              isAuthenticated: true,
            });
            setLoginMethods(userData.loginMethods || []);
            setWalletInfo(userData.walletInfo || null);
          } else {
            localStorage.removeItem("auth_token");
            setAuthState({
              user: null,
              loading: false,
              isAuthenticated: false,
            });
          }
        } else {
          setAuthState({
            user: null,
            loading: false,
            isAuthenticated: false,
          });
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setAuthState({
          user: null,
          loading: false,
          isAuthenticated: false,
        });
      }
    };

    initAuth();
  }, []);

  const register = async (data: RegisterData) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      const result = await response.json();
      localStorage.setItem("auth_token", result.token);

      setAuthState({
        user: result.user,
        loading: false,
        isAuthenticated: true,
      });

      toast({
        title: "Success",
        description: "Account created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Registration failed",
        variant: "destructive",
      });
      throw error;
    }
  };

  const login = async (method: LoginMethod, credential: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, credential }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      const result = await response.json();
      localStorage.setItem("auth_token", result.token);

      setAuthState({
        user: result.user,
        loading: false,
        isAuthenticated: true,
      });
      setLoginMethods(result.loginMethods || []);
      setWalletInfo(result.walletInfo || null);

      toast({
        title: "Success",
        description: "Logged in successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Login failed",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("auth_token");
      setAuthState({
        user: null,
        loading: false,
        isAuthenticated: false,
      });
      setLoginMethods([]);
      setWalletInfo(null);
    }
  };

  const sendEmailVerification = async (email: string) => {
    try {
      const response = await fetch("/api/auth/verify/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send verification email");
      }

      toast({
        title: "Success",
        description: "Verification email sent",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification email",
        variant: "destructive",
      });
      throw error;
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch("/api/auth/verify/email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Email verification failed");
      }

      // Update user state
      if (authState.user) {
        setAuthState((prev) => ({
          ...prev,
          user: { ...prev.user!, emailVerified: true },
        }));
      }

      toast({
        title: "Success",
        description: "Email verified successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Email verification failed",
        variant: "destructive",
      });
      throw error;
    }
  };

  const sendSMSVerification = async (phone: string) => {
    try {
      const response = await fetch("/api/auth/verify/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send SMS");
      }

      toast({
        title: "Success",
        description: "SMS verification code sent",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send SMS",
        variant: "destructive",
      });
      throw error;
    }
  };

  const verifySMS = async (phone: string, code: string) => {
    try {
      const response = await fetch("/api/auth/verify/sms/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "SMS verification failed");
      }

      // Update user state
      if (authState.user) {
        setAuthState((prev) => ({
          ...prev,
          user: { ...prev.user!, phoneVerified: true },
        }));
      }

      toast({
        title: "Success",
        description: "Phone number verified successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "SMS verification failed",
        variant: "destructive",
      });
      throw error;
    }
  };

  const forgotPassword = async (identifier: string) => {
    try {
      const response = await fetch("/api/auth/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send reset email");
      }

      toast({
        title: "Success",
        description: "Password reset email sent",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email",
        variant: "destructive",
      });
      throw error;
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      const response = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Password reset failed");
      }

      toast({
        title: "Success",
        description: "Password reset successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Password reset failed",
        variant: "destructive",
      });
      throw error;
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    try {
      const response = await fetch("/api/auth/password/change", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Password change failed");
      }

      toast({
        title: "Success",
        description: "Password changed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Password change failed",
        variant: "destructive",
      });
      throw error;
    }
  };

  const checkUsername = async (username: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `/api/auth/username/check?username=${encodeURIComponent(username)}`
      );
      const result = await response.json();
      return result.available;
    } catch (error) {
      console.error("Username check error:", error);
      return false;
    }
  };

  const updateUsername = async (username: string) => {
    try {
      const response = await fetch("/api/auth/username/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Username update failed");
      }

      // Update user state
      if (authState.user) {
        setAuthState((prev) => ({
          ...prev,
          user: { ...prev.user!, username },
        }));
      }

      toast({
        title: "Success",
        description: "Username updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Username update failed",
        variant: "destructive",
      });
      throw error;
    }
  };

  const registerPasskey = async () => {
    try {
      const response = await fetch("/api/auth/passkey/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Passkey registration failed");
      }

      const result = await response.json();

      // Trigger WebAuthn registration
      const credential = await navigator.credentials.create({
        publicKey: result.options,
      });

      // Send credential to server
      const confirmResponse = await fetch(
        "/api/auth/passkey/register/confirm",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify({ credential }),
        }
      );

      if (!confirmResponse.ok) {
        throw new Error("Passkey registration failed");
      }

      // Update user state
      if (authState.user) {
        setAuthState((prev) => ({
          ...prev,
          user: { ...prev.user!, passkeyEnabled: true },
        }));
      }

      toast({
        title: "Success",
        description: "Passkey registered successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Passkey registration failed",
        variant: "destructive",
      });
      throw error;
    }
  };

  const authenticatePasskey = async () => {
    try {
      const response = await fetch("/api/auth/passkey/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Passkey authentication failed");
      }

      const result = await response.json();

      // Trigger WebAuthn authentication
      const credential = await navigator.credentials.get({
        publicKey: result.options,
      });

      // Send credential to server
      const confirmResponse = await fetch(
        "/api/auth/passkey/authenticate/confirm",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential }),
        }
      );

      if (!confirmResponse.ok) {
        throw new Error("Passkey authentication failed");
      }

      const authResult = await confirmResponse.json();
      localStorage.setItem("auth_token", authResult.token);

      setAuthState({
        user: authResult.user,
        loading: false,
        isAuthenticated: true,
      });

      toast({
        title: "Success",
        description: "Authenticated with passkey",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Passkey authentication failed",
        variant: "destructive",
      });
      throw error;
    }
  };

  const createWallet = async (
    type: "ethereum" | "solana" | "sui" | "cosmos"
  ): Promise<WalletInfo> => {
    try {
      const response = await fetch("/api/wallet/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Wallet creation failed");
      }

      const walletInfo = await response.json();
      setWalletInfo(walletInfo);

      toast({
        title: "Success",
        description: "Wallet created successfully",
      });

      return walletInfo;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Wallet creation failed",
        variant: "destructive",
      });
      throw error;
    }
  };

  const importWallet = async (
    type: "ethereum" | "solana" | "sui" | "cosmos",
    privateKey: string
  ): Promise<WalletInfo> => {
    try {
      const response = await fetch("/api/wallet/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ type, privateKey }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Wallet import failed");
      }

      const walletInfo = await response.json();
      setWalletInfo(walletInfo);

      toast({
        title: "Success",
        description: "Wallet imported successfully",
      });

      return walletInfo;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Wallet import failed",
        variant: "destructive",
      });
      throw error;
    }
  };

  const backupWallet = async (): Promise<string> => {
    try {
      const response = await fetch("/api/wallet/backup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Wallet backup failed");
      }

      const result = await response.json();
      return result.backupData; // seed phrase or private key
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Wallet backup failed",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Profile update failed");
      }

      const updatedUser = await response.json();
      setAuthState((prev) => ({
        ...prev,
        user: updatedUser,
      }));

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Profile update failed",
        variant: "destructive",
      });
      throw error;
    }
  };

  const uploadPhoto = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch("/api/user/photo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Photo upload failed");
      }

      const result = await response.json();
      setAuthState((prev) => ({
        ...prev,
        user: { ...prev.user!, photoURL: result.photoURL },
      }));

      toast({
        title: "Success",
        description: "Photo uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Photo upload failed",
        variant: "destructive",
      });
      throw error;
    }
  };

  const initiateRecovery = async (identifier: string) => {
    try {
      const response = await fetch("/api/auth/recovery/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Recovery initiation failed");
      }

      toast({
        title: "Success",
        description: "Recovery process initiated",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Recovery initiation failed",
        variant: "destructive",
      });
      throw error;
    }
  };

  const completeRecovery = async (token: string, newPassword: string) => {
    try {
      const response = await fetch("/api/auth/recovery/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Recovery completion failed");
      }

      toast({
        title: "Success",
        description: "Account recovered successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Recovery completion failed",
        variant: "destructive",
      });
      throw error;
    }
  };

  const value: CustomAuthContextType = {
    user: authState.user,
    loading: authState.loading,
    isAuthenticated: authState.isAuthenticated,
    loginMethods,
    walletInfo,
    register,
    login,
    logout,
    sendEmailVerification,
    verifyEmail,
    sendSMSVerification,
    verifySMS,
    forgotPassword,
    resetPassword,
    changePassword,
    checkUsername,
    updateUsername,
    registerPasskey,
    authenticatePasskey,
    createWallet,
    importWallet,
    backupWallet,
    updateProfile,
    uploadPhoto,
    initiateRecovery,
    completeRecovery,
  };

  return (
    <CustomAuthContext.Provider value={value}>
      {children}
    </CustomAuthContext.Provider>
  );
}

export const useCustomAuth = () => {
  const context = useContext(CustomAuthContext);
  if (context === undefined) {
    throw new Error("useCustomAuth must be used within a CustomAuthProvider");
  }
  return context;
};
 