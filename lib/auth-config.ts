// Custom Authentication Configuration
// This replaces Firebase with a comprehensive auth system

export interface User {
  id: string;
  email?: string;
  phone?: string;
  username?: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  passkeyEnabled: boolean;
  biometricEnabled: boolean;
  walletAddress?: string;
  walletType?: "ethereum" | "solana" | "sui" | "cosmos";
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export interface LoginMethod {
  type: "email" | "phone" | "username" | "wallet" | "passkey" | "biometric";
  identifier: string;
  verified: boolean;
}

export interface WalletInfo {
  address: string;
  type: "ethereum" | "solana" | "sui" | "cosmos";
  chain: string;
  isImported: boolean;
  hasBackup: boolean;
}

// SMS Provider Configuration
export const SMS_CONFIG = {
  provider: "twilio", // or 'vonage', 'africa_talking'
  accountSid: process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID,
  authToken: process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN,
  fromNumber: process.env.NEXT_PUBLIC_TWILIO_FROM_NUMBER,
};

// Email Provider Configuration
export const EMAIL_CONFIG = {
  provider: "resend", // or 'sendgrid', 'nodemailer'
  apiKey: process.env.NEXT_PUBLIC_RESEND_API_KEY,
  fromEmail: process.env.NEXT_PUBLIC_FROM_EMAIL || "noreply@biaz.com",
};

// WebAuthn/Passkey Configuration
export const WEBAUTHN_CONFIG = {
  rpName: "Biaz Crypto Exchange",
  rpID: process.env.NEXT_PUBLIC_DOMAIN || "localhost",
  origin: process.env.NEXT_PUBLIC_ORIGIN || "http://localhost:3000",
};

// Wallet Configuration
export const WALLET_CONFIG = {
  supportedChains: [
    {
      name: "Ethereum",
      id: "ethereum",
      symbol: "ETH",
      rpcUrl: "https://mainnet.infura.io/v3/your-project-id",
      explorer: "https://etherscan.io",
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    },
    {
      name: "Polygon",
      id: "polygon",
      symbol: "MATIC",
      rpcUrl: "https://polygon-rpc.com",
      explorer: "https://polygonscan.com",
      nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    },
    {
      name: "Solana",
      id: "solana",
      symbol: "SOL",
      rpcUrl: "https://api.mainnet-beta.solana.com",
      explorer: "https://solscan.io",
      nativeCurrency: { name: "Solana", symbol: "SOL", decimals: 9 },
    },
    {
      name: "Sui",
      id: "sui",
      symbol: "SUI",
      rpcUrl: "https://fullnode.mainnet.sui.io",
      explorer: "https://suiexplorer.com",
      nativeCurrency: { name: "Sui", symbol: "SUI", decimals: 9 },
    },
    {
      name: "Cosmos",
      id: "cosmos",
      symbol: "ATOM",
      rpcUrl: "https://rpc.cosmos.network",
      explorer: "https://www.mintscan.io/cosmos",
      nativeCurrency: { name: "Atom", symbol: "ATOM", decimals: 6 },
    },
  ],
};

// Database Schema (for reference)
export const USER_SCHEMA = {
  users: {
    id: "string (primary key)",
    email: "string (unique, optional)",
    phone: "string (unique, optional)",
    username: "string (unique, optional)",
    passwordHash: "string (optional)",
    displayName: "string (optional)",
    photoURL: "string (optional)",
    emailVerified: "boolean",
    phoneVerified: "boolean",
    passkeyEnabled: "boolean",
    biometricEnabled: "boolean",
    walletAddress: "string (optional)",
    walletType: "string (optional)",
    createdAt: "timestamp",
    updatedAt: "timestamp",
  },
  loginMethods: {
    userId: "string (foreign key)",
    type: "string (email|phone|username|wallet|passkey)",
    identifier: "string",
    verified: "boolean",
    createdAt: "timestamp",
  },
  wallets: {
    userId: "string (foreign key)",
    address: "string",
    type: "string (ethereum|solana|sui|cosmos)",
    chain: "string",
    isImported: "boolean",
    hasBackup: "boolean",
    encryptedPrivateKey: "string (encrypted)",
    createdAt: "timestamp",
  },
  passkeys: {
    userId: "string (foreign key)",
    credentialId: "string",
    publicKey: "string",
    signCount: "number",
    createdAt: "timestamp",
  },
  sessions: {
    id: "string (primary key)",
    userId: "string (foreign key)",
    token: "string",
    expiresAt: "timestamp",
    createdAt: "timestamp",
  },
};

// API Endpoints (for reference)
export const API_ENDPOINTS = {
  // Authentication
  register: "/api/auth/register",
  login: "/api/auth/login",
  logout: "/api/auth/logout",
  refresh: "/api/auth/refresh",

  // Verification
  sendEmailVerification: "/api/auth/verify/email/send",
  verifyEmail: "/api/auth/verify/email/confirm",
  sendSMSVerification: "/api/auth/verify/sms/send",
  verifySMS: "/api/auth/verify/sms/confirm",

  // Password
  forgotPassword: "/api/auth/password/forgot",
  resetPassword: "/api/auth/password/reset",
  changePassword: "/api/auth/password/change",

  // Username
  checkUsername: "/api/auth/username/check",
  updateUsername: "/api/auth/username/update",

  // Passkeys/WebAuthn
  registerPasskey: "/api/auth/passkey/register",
  authenticatePasskey: "/api/auth/passkey/authenticate",

  // Wallet
  createWallet: "/api/wallet/create",
  importWallet: "/api/wallet/import",
  backupWallet: "/api/wallet/backup",
  getWalletInfo: "/api/wallet/info",

  // Profile
  updateProfile: "/api/user/profile",
  uploadPhoto: "/api/user/photo",

  // Recovery
  initiateRecovery: "/api/auth/recovery/initiate",
  completeRecovery: "/api/auth/recovery/complete",
};

export default {
  SMS_CONFIG,
  EMAIL_CONFIG,
  WEBAUTHN_CONFIG,
  WALLET_CONFIG,
  USER_SCHEMA,
  API_ENDPOINTS,
};
 