# Biaz - Crypto Exchange App

A modern, mobile-first cryptocurrency exchange application built with Next.js, React, and TypeScript.

## Features

- 🔐 **Secure Authentication** - Custom auth system with email, phone, username, and passkey support
- 💰 **Multi-Wallet Support** - Connect Ethereum and Solana wallets (no API keys needed)
- 📊 **Real-time Market Data** - Live cryptocurrency prices via CoinGecko API
- 🎨 **Modern UI/UX** - Mobile-first design with dark/light themes
- 🔔 **Push Notifications** - Real-time alerts for transactions and price changes
- 🛡️ **Security Features** - Passkey authentication, biometric login
- 📱 **Mobile Optimized** - Touch-friendly interface with responsive design

## Environment Setup

### 1. Create Environment File

Create a `.env.local` file in the root directory:

   ```bash
cp env.example .env.local
```

### 2. Configure Environment Variables

Edit `.env.local` with your actual API keys:

```env
# Database Configuration (Required)
DATABASE_URL=postgresql://postgres:[password]@[project].supabase.co:5432/postgres

# JWT Secret (Required)
JWT_SECRET=your-super-secret-jwt-key-here-minimum-64-characters-long

# SMS Provider - Twilio (Required)
NEXT_PUBLIC_TWILIO_ACCOUNT_SID=your_twilio_account_sid
NEXT_PUBLIC_TWILIO_AUTH_TOKEN=your_twilio_auth_token
NEXT_PUBLIC_TWILIO_FROM_NUMBER=+1234567890

# Email Provider - Resend (Required)
NEXT_PUBLIC_RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_FROM_EMAIL=onboarding@resend.dev

# File Storage - Cloudinary (Required)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
NEXT_PUBLIC_CLOUDINARY_API_SECRET=your_api_secret

# CoinGecko API (Optional - has free tier)
NEXT_PUBLIC_COINGECKO_API_KEY=your_coingecko_api_key_here

# WalletConnect (Already configured - no API key needed)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=c4f79cc821944d9680842e34466bfbd9
```

### 3. Get API Keys

#### Firebase Setup (Required)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password, Phone, Google)
4. Enable Firestore Database
5. Copy your config from Project Settings

#### CoinGecko API (Optional)

1. Go to [CoinGecko API](https://www.coingecko.com/en/api)
2. Sign up for a free API key
3. Add your key to `NEXT_PUBLIC_COINGECKO_API_KEY`

#### Wallet Connections (No API Keys Needed)

- **MetaMask**: Works without any API keys
- **Phantom**: Works without any API keys
- **WalletConnect**: Already configured
- **Other wallets**: Work directly with user's installed wallets

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Security Best Practices

### Repository Privacy

- **Public Repo**: Use `.env.local` (already in `.gitignore`) - this file won't be uploaded
- **Private Repo**: You can use either `.env.local` or `.env` files
- **Deployment**: Set environment variables in your hosting platform (Vercel, Netlify, etc.)

### Environment Variables

- Files starting with `.env.local` are automatically ignored by Git
- Never commit actual API keys to your repository
- Use different keys for development and production

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository
2. Add environment variables in Vercel dashboard
3. Deploy automatically

### Other Platforms

- Set environment variables in your hosting platform
- Ensure all `NEXT_PUBLIC_*` variables are configured

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Authentication**: Custom auth system with JWT
- **Database**: Firestore
- **Web3**: Wagmi, Viem, Solana Web3.js (no API keys needed)
- **APIs**: CoinGecko (optional), WalletConnect (pre-configured)
- **Deployment**: Vercel-ready

## Features Overview

### Authentication

- Email/Password sign-up and sign-in
- Phone number verification (simulated for demo)
- Google OAuth integration
- Username uniqueness validation
- Password reset functionality

### Wallet Integration (No API Keys Required)

- **MetaMask**: Direct connection, no API needed
- **Phantom**: Direct connection, no API needed
- **WalletConnect**: Pre-configured, no API needed
- **Other wallets**: Work with user's installed wallets
- Multi-chain support (Ethereum, Solana, Polygon, etc.)
- Real-time balance tracking
- Transaction history
- NFT/Collectibles display

### Security

- Passkey authentication
- Biometric login setup
- Secure password management

### User Experience

- Mobile-first responsive design
- Dark/light theme support
- Push notifications
- Real-time market data
- WhatsApp integration for trading

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
