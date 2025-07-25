// CoinGecko API integration
const COINGECKO_API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY || "";
const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

export interface CoinData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
}

export interface CoinGeckoResponse {
  [key: string]: CoinData;
}

// Fallback data for development - replace with real API calls in production
export const fallbackCoinData: CoinData[] = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "btc",
    current_price: 43250.5,
    price_change_percentage_24h: 2.45,
    market_cap: 847000000000,
    total_volume: 15000000000,
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "eth",
    current_price: 2680.75,
    price_change_percentage_24h: -1.23,
    market_cap: 322000000000,
    total_volume: 8500000000,
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
  },
  {
    id: "binancecoin",
    name: "BNB",
    symbol: "bnb",
    current_price: 315.2,
    price_change_percentage_24h: 4.67,
    market_cap: 47000000000,
    total_volume: 1200000000,
    image:
      "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
  },
  {
    id: "solana",
    name: "Solana",
    symbol: "sol",
    current_price: 98.45,
    price_change_percentage_24h: 8.92,
    market_cap: 43000000000,
    total_volume: 2100000000,
    image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
  },
  {
    id: "cardano",
    name: "Cardano",
    symbol: "ada",
    current_price: 0.52,
    price_change_percentage_24h: -3.15,
    market_cap: 18000000000,
    total_volume: 450000000,
    image: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
  },
];

export async function fetchCryptocurrencies(limit = 10): Promise<CoinData[]> {
  try {
    const headers: HeadersInit = {
      Accept: "application/json",
    };

    // Add API key if available
    if (COINGECKO_API_KEY) {
      headers["x-cg-demo-api-key"] = COINGECKO_API_KEY;
    }

    const response = await fetch(
      `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CoinData[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching cryptocurrency data:", error);
    return fallbackCoinData.slice(0, limit); // Fallback to fallback data
  }
}

export async function fetchCryptocurrencyById(
  id: string
): Promise<CoinData | null> {
  try {
    const headers: HeadersInit = {
      Accept: "application/json",
    };

    if (COINGECKO_API_KEY) {
      headers["x-cg-demo-api-key"] = COINGECKO_API_KEY;
    }

    const response = await fetch(
      `${COINGECKO_BASE_URL}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      name: data.name,
      symbol: data.symbol,
      current_price: data.market_data.current_price.usd,
      price_change_percentage_24h: data.market_data.price_change_percentage_24h,
      market_cap: data.market_data.market_cap.usd,
      total_volume: data.market_data.total_volume.usd,
      image: data.image.large,
    };
  } catch (error) {
    console.error("Error fetching cryptocurrency data:", error);
    const coin = fallbackCoinData.find((coin) => coin.id === id);
    return coin || null;
  }
}

// Get current prices for specific tokens
export async function fetchTokenPrices(
  tokenIds: string[]
): Promise<Record<string, number>> {
  try {
    const headers: HeadersInit = {
      Accept: "application/json",
    };

    if (COINGECKO_API_KEY) {
      headers["x-cg-demo-api-key"] = COINGECKO_API_KEY;
    }

    const response = await fetch(
      `${COINGECKO_BASE_URL}/simple/price?ids=${tokenIds.join(
        ","
      )}&vs_currencies=usd`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const prices: Record<string, number> = {};

    Object.keys(data).forEach((id) => {
      prices[id] = data[id].usd;
    });

    return prices;
  } catch (error) {
    console.error("Error fetching token prices:", error);
    // Fallback to fallback prices
    const fallbackPrices: Record<string, number> = {
      bitcoin: 43250.5,
      ethereum: 2680.75,
      solana: 98.45,
      "matic-network": 0.85,
      arbitrum: 1.2,
      optimism: 2.1,
    };
    return fallbackPrices;
  }
}
