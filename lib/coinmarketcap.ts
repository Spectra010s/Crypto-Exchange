// CoinMarketCap API integration
const CMC_API_KEY = process.env.NEXT_PUBLIC_CMC_API_KEY || "your-coinmarketcap-api-key"
const CMC_BASE_URL = "https://pro-api.coinmarketcap.com/v1"

export interface CoinData {
  id: number
  name: string
  symbol: string
  quote: {
    USD: {
      price: number
      percent_change_24h: number
      market_cap: number
      volume_24h: number
    }
  }
}

export interface CMCResponse {
  data: CoinData[]
  status: {
    timestamp: string
    error_code: number
    error_message: string | null
  }
}

// Mock data for development - replace with real API calls
export const mockCoinData: CoinData[] = [
  {
    id: 1,
    name: "Bitcoin",
    symbol: "BTC",
    quote: {
      USD: {
        price: 43250.5,
        percent_change_24h: 2.45,
        market_cap: 847000000000,
        volume_24h: 15000000000,
      },
    },
  },
  {
    id: 1027,
    name: "Ethereum",
    symbol: "ETH",
    quote: {
      USD: {
        price: 2680.75,
        percent_change_24h: -1.23,
        market_cap: 322000000000,
        volume_24h: 8500000000,
      },
    },
  },
  {
    id: 1839,
    name: "BNB",
    symbol: "BNB",
    quote: {
      USD: {
        price: 315.2,
        percent_change_24h: 4.67,
        market_cap: 47000000000,
        volume_24h: 1200000000,
      },
    },
  },
  {
    id: 5426,
    name: "Solana",
    symbol: "SOL",
    quote: {
      USD: {
        price: 98.45,
        percent_change_24h: 8.92,
        market_cap: 43000000000,
        volume_24h: 2100000000,
      },
    },
  },
  {
    id: 2010,
    name: "Cardano",
    symbol: "ADA",
    quote: {
      USD: {
        price: 0.52,
        percent_change_24h: -3.15,
        market_cap: 18000000000,
        volume_24h: 450000000,
      },
    },
  },
]

export async function fetchCryptocurrencies(limit = 10): Promise<CoinData[]> {
  // For development, return mock data
  // In production, uncomment the real API call below
  return mockCoinData.slice(0, limit)

  /* Real API call - uncomment when ready to use
  try {
    const response = await fetch(`${CMC_BASE_URL}/cryptocurrency/listings/latest?limit=${limit}`, {
      headers: {
        'X-CMC_PRO_API_KEY': CMC_API_KEY,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: CMCResponse = await response.json()
    return data.data
  } catch (error) {
    console.error('Error fetching cryptocurrency data:', error)
    return mockCoinData.slice(0, limit) // Fallback to mock data
  }
  */
}

export async function fetchCryptocurrencyById(id: number): Promise<CoinData | null> {
  // For development, return mock data
  const coin = mockCoinData.find((coin) => coin.id === id)
  return coin || null

  /* Real API call - uncomment when ready to use
  try {
    const response = await fetch(`${CMC_BASE_URL}/cryptocurrency/quotes/latest?id=${id}`, {
      headers: {
        'X-CMC_PRO_API_KEY': CMC_API_KEY,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.data[id] || null
  } catch (error) {
    console.error('Error fetching cryptocurrency data:', error)
    return null
  }
  */
}
