# Complete Setup Guide for Biaz Crypto Exchange

## 🚀 Quick Start

### 1. **Environment Setup**

Create a `.env.local` file with all required variables:

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production

# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# Email Service - Resend
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=onboarding@resend.dev

# SMS Service - Twilio
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# NextAuth Configuration
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret

# Cloudinary (for image storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Web3 Configuration
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-wallet-connect-project-id

# API Keys
NEXT_PUBLIC_COINGECKO_API_KEY=your-coingecko-api-key

# Environment
NODE_ENV=production
```

## 📧 **Email Service Setup (Resend)**

### Step 1: Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your domain or use the default domain

### Step 2: Get API Key

1. Go to API Keys section
2. Create a new API key
3. Copy the API key to your `.env.local`

### Step 3: Configure Sending Domain

```bash
# Add to your .env.local
RESEND_API_KEY=re_xxxxxxxxxxxx
FROM_EMAIL=onboarding@resend.dev
```

## 📱 **SMS Service Setup (Twilio)**

### Step 1: Create Twilio Account

1. Go to [twilio.com](https://twilio.com)
2. Sign up for a free account
3. Verify your phone number

### Step 2: Get Credentials

1. Go to Console Dashboard
2. Copy Account SID and Auth Token
3. Get a Twilio phone number

### Step 3: Configure Environment

```bash
# Add to your .env.local
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

## 🖼️ **Image Storage Setup (Cloudinary)**

### Step 1: Create Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Get your cloud name, API key, and secret

### Step 2: Configure Environment

```bash
# Add to your .env.local
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 🔐 **Google OAuth Setup**

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API

### Step 2: Create OAuth Credentials

1. Go to APIs & Services > Credentials
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-app.vercel.app/api/auth/callback/google` (production)

### Step 3: Configure Environment

```bash
# Add to your .env.local
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 🗄️ **Database Setup (Supabase)**

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for setup to complete

### Step 2: Get Connection String

1. Go to Settings > Database
2. Copy the connection string
3. Replace `[YOUR-PASSWORD]` with your database password

### Step 3: Configure Environment

```bash
# Add to your .env.local
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
```

### Step 4: Initialize Database

The database tables will be created automatically on first API call, or run:

```bash
# Add this to your deployment script
node -e "
const { initDatabase } = require('./lib/database');
initDatabase().then(() => console.log('Database initialized'));
"
```

## 🔗 **Wallet Connect Setup**

### Step 1: Create WalletConnect Project

1. Go to [cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Create a new project
3. Get your project ID

### Step 2: Configure Environment

```bash
# Add to your .env.local
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-project-id
```

## 🚀 **Deployment Setup**

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Build Project

```bash
npm run build
```

### Step 3: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Step 4: Configure Environment Variables

1. Go to your Vercel project dashboard
2. Go to Settings > Environment Variables
3. Add all the environment variables from your `.env.local`

## 🔧 **Authentication Flow**

### **Sign-up Options:**

1. **Email + Password** → Email verification sent
2. **Phone + Password** → SMS verification → Username setup
3. **Google OAuth** → Automatic account creation
4. **Wallet Authentication** → Automatic account creation

### **Sign-in Options:**

1. **Email + Password**
2. **Phone + Password**
3. **Username + Password**
4. **Google OAuth**
5. **Wallet Authentication**
6. **Passkey/Biometric** (if enabled)

## 🔐 **Security Features**

### **Passkey Authentication:**

- Uses WebAuthn standard
- Works with biometric authentication
- Secure credential storage

### **Biometric Authentication:**

- Fingerprint/Face recognition
- Device-based security
- Automatic setup after first login

### **Wallet Security:**

- Message signing verification
- Chain ID validation
- One wallet per user restriction

## 📱 **Mobile Features**

### **Biometric Login:**

- Automatic detection of device capabilities
- Secure credential storage
- Fallback to password authentication

### **Push Notifications:**

- Transaction alerts
- Price change notifications
- Security alerts

## 🔄 **Wallet Integration Logic**

### **If user signs up with wallet:**

- ✅ Wallet automatically linked
- ❌ No "Create Wallet" or "Import Wallet" options
- ✅ Can configure email/phone later
- ✅ Can set up passkeys/biometrics

### **If user signs up with email/phone:**

- ✅ Can create new wallet
- ✅ Can import existing wallet
- ✅ Can connect external wallets
- ✅ One wallet per user restriction

## 🛠️ **Settings Features**

### **Profile Management:**

- ✅ Change username
- ✅ Change password
- ✅ Change email
- ✅ Upload profile picture
- ✅ Enable/disable biometrics
- ✅ Setup passkeys

### **Security Settings:**

- ✅ Two-factor authentication
- ✅ Passkey management
- ✅ Biometric setup
- ✅ Wallet management

### **Notification Settings:**

- ✅ Push notifications
- ✅ Email notifications
- ✅ SMS notifications
- ✅ Transaction alerts

## 📞 **Support Integration**

### **WhatsApp Support:**

- Direct integration with WhatsApp Business
- Automatic message formatting
- Support ticket tracking

### **Email Support:**

- Professional email templates
- Auto-response system
- Ticket management

## 🚨 **Important Notes**

### **Production Checklist:**

- [ ] All environment variables configured
- [ ] Database initialized
- [ ] Email service tested
- [ ] SMS service tested
- [ ] Google OAuth working
- [ ] Wallet authentication working
- [ ] Passkey authentication working
- [ ] Image upload working
- [ ] All API routes responding
- [ ] Error handling implemented
- [ ] Rate limiting configured
- [ ] CORS configured
- [ ] SSL certificates valid

### **Security Considerations:**

- [ ] JWT secret is strong and unique
- [ ] Database connection is secure
- [ ] API keys are properly secured
- [ ] Rate limiting is implemented
- [ ] Input validation is comprehensive
- [ ] Error messages don't leak sensitive info

### **Performance Considerations:**

- [ ] Database queries are optimized
- [ ] Image compression is enabled
- [ ] CDN is configured
- [ ] Caching is implemented
- [ ] API responses are optimized

## 🆘 **Troubleshooting**

### **Common Issues:**

1. **Database Connection Failed:**

   - Check DATABASE_URL format
   - Verify Supabase credentials
   - Ensure database is accessible

2. **Email Not Sending:**

   - Verify Resend API key
   - Check domain verification
   - Test with Resend dashboard

3. **SMS Not Sending:**

   - Verify Twilio credentials
   - Check phone number format
   - Ensure sufficient credits

4. **Google OAuth Not Working:**

   - Verify client ID and secret
   - Check redirect URIs
   - Ensure Google+ API is enabled

5. **Wallet Authentication Failed:**

   - Check wallet connection
   - Verify message signing
   - Ensure correct chain ID

6. **Passkey Not Working:**
   - Check device compatibility
   - Verify HTTPS in production
   - Test with different browsers

## 📞 **Support**

For additional support:

- **WhatsApp:** +234 901 300 4266
- **Email:** spectra010s@gmail.com
- **Documentation:** Check the codebase comments

All features are now implemented and ready for production deployment!
