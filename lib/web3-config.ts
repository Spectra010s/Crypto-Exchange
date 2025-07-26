import { createConfig, http } from "wagmi";
import { mainnet, polygon, arbitrum, optimism, base } from "wagmi/chains";
import { walletConnect, injected, coinbaseWallet } from "wagmi/connectors";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  WalletConnectWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";

// WalletConnect Project ID - you'll need to get this from https://cloud.walletconnect.com
export const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
  "c4f79cc821944d9680842e34466bfbd9";

// Ethereum/EVM Configuration
export const wagmiConfig = createConfig({
  chains: [mainnet, polygon, arbitrum, optimism, base],
  connectors: [
    walletConnect({ projectId }),
    injected(),
    coinbaseWallet({ appName: "Crypto Exchange" }),
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
  },
});

// Solana Configuration
export const network = WalletAdapterNetwork.Mainnet;
export const endpoint = clusterApiUrl(network);

export const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter({ network }),
  new WalletConnectWalletAdapter({
    network,
    options: {
      projectId,
    },
  }),
];

// Binance URLs for buy/sell
export const BINANCE_BUY_URL = "https://www.binance.com/en/buy-sell-crypto";
export const BINANCE_SELL_URL = "https://www.binance.com/en/trade/";

// RPC endpoints
export const ETHEREUM_RPC =
  process.env.NEXT_PUBLIC_ETHEREUM_RPC ||
  "https://eth-mainnet.g.alchemy.com/v2/your-api-key";
export const SOLANA_RPC =
  process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl(network);
