# Crypto Exchange App

A comprehensive Web3 crypto exchange application built with Next.js 15.2.4 and modern blockchain technologies.

## 🚀 Features

### 🔐 Authentication
- **Firebase Auth**: Email/password and Google sign-in
- **Web3 Wallet Integration**: Support for multiple wallet types

### 💼 Multi-Chain Wallet Support
- **Ethereum**: MetaMask, WalletConnect, Coinbase Wallet
- **Solana**: Phantom, Solflare, WalletConnect
- **Multiple Networks**: Ethereum, Polygon, Arbitrum, Optimism, Base

### 💰 Core Functionality
- **Real Portfolio Tracking**: Shows actual wallet balances and values
- **Add Funds**: Generate deposit addresses for different networks
- **Send Transactions**: Send tokens with wallet integration
- **Market Data**: Real-time crypto prices (CoinMarketCap integration)
- **Buy/Sell Links**: Direct integration with Binance

### 🎨 Modern UI
- **Mobile-First**: Responsive design optimized for mobile
- **Beautiful Interface**: Modern gradients and animations
- **Dark/Light Mode**: Theme switching support
- **Toast Notifications**: User-friendly feedback

## 🛠 Tech Stack

- **Frontend**: Next.js 15.2.4, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Web3**: Wagmi, Viem, Solana Web3.js
- **Authentication**: Firebase Auth
- **State Management**: React Context + Hooks
- **Development**: ESLint, TypeScript strict mode

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd crypto-exchange-app
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```

3. **Configure your environment variables:**
   - Get a WalletConnect Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com)
   - (Optional) Get a CoinMarketCap API key for real market data
   - (Optional) Configure custom RPC endpoints

4. **Run the development server:**
   ```bash
   pnpm dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 🔧 Configuration

### Required Setup

1. **WalletConnect Project ID** (Required for wallet connections):
   - Visit [WalletConnect Cloud](https://cloud.walletconnect.com)
   - Create a new project
   - Copy the Project ID to `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

2. **CoinMarketCap API** (Optional for real market data):
   - Visit [CoinMarketCap API](https://coinmarketcap.com/api/)
   - Get a free API key
   - Add to `NEXT_PUBLIC_CMC_API_KEY`

### Wallet Support

The app supports these wallet types:

**Ethereum/EVM Networks:**
- MetaMask
- WalletConnect (mobile wallets)
- Coinbase Wallet
- Any injected wallet

**Solana:**
- Phantom
- Solflare  
- WalletConnect (mobile)

**Supported Networks:**
- Ethereum Mainnet
- Polygon
- Arbitrum
- Optimism
- Base
- Solana Mainnet

## 🎯 Usage

### Connecting Wallets
1. Click "Connect Wallet" anywhere in the app
2. Choose between Ethereum or Solana
3. Select your preferred wallet
4. Approve the connection

### Adding Funds
1. Go to Wallet tab
2. Click "Add Funds"
3. Select network
4. Copy the deposit address
5. Send crypto to that address

### Sending Transactions
1. Go to Wallet tab
2. Click "Send"
3. Select token to send
4. Enter recipient address and amount
5. Confirm in your wallet

### Trading
- **Buy**: Direct links to Binance for purchasing crypto
- **Sell**: Direct links to Binance trading pairs

## 📱 Mobile Experience

The app is optimized for mobile use with:
- Touch-friendly interface
- Mobile wallet integration
- Responsive design
- Native mobile wallet support

## 🔒 Security

- **No Private Keys**: App never stores private keys
- **Wallet Integration**: All transactions go through connected wallets
- **Address Validation**: Validates addresses before transactions
- **Secure Authentication**: Firebase Auth for user accounts

## 🚀 Deployment

### Build for Production
```bash
pnpm build
pnpm start
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables for Production
Make sure to set all environment variables in your deployment platform:
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `NEXT_PUBLIC_CMC_API_KEY` (optional)
- Firebase config variables (if overriding defaults)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the environment variables are set correctly
2. Ensure your wallet is installed and unlocked
3. Try refreshing the page
4. Check browser console for errors

For development issues, check that all dependencies are installed and you're using Node.js 18+.
