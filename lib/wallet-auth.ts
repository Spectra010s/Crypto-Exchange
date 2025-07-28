import { ethers } from "ethers";
import { findUserByWalletAddress, createUser, updateUser } from "./database";

export interface WalletAuthData {
  address: string;
  signature: string;
  message: string;
  chainId: number;
}

export async function authenticateWallet(authData: WalletAuthData) {
  try {
    // Recover the address from the signature
    const recoveredAddress = ethers.verifyMessage(
      authData.message,
      authData.signature
    );

    if (recoveredAddress.toLowerCase() !== authData.address.toLowerCase()) {
      throw new Error("Invalid signature");
    }

    // Check if wallet is already registered
    const existingUser = await findUserByWalletAddress(authData.address);

    if (existingUser) {
      // User exists, return user data
      return {
        user: existingUser,
        isNewUser: false,
      };
    } else {
      // Create new user with wallet
      const newUser = await createUser({
        walletAddress: authData.address,
        walletType: getWalletTypeFromChainId(authData.chainId),
        displayName: `Wallet_${authData.address.slice(0, 6)}`,
      });

      return {
        user: newUser,
        isNewUser: true,
      };
    }
  } catch (error) {
    console.error("Wallet authentication error:", error);
    throw error;
  }
}

export function getWalletTypeFromChainId(chainId: number): string {
  switch (chainId) {
    case 1: // Ethereum Mainnet
      return "ethereum";
    case 137: // Polygon
      return "polygon";
    case 42161: // Arbitrum
      return "arbitrum";
    case 10: // Optimism
      return "optimism";
    case 8453: // Base
      return "base";
    case 56: // BSC
      return "bsc";
    case 43114: // Avalanche
      return "avalanche";
    default:
      return "ethereum";
  }
}

export function generateWalletAuthMessage(
  address: string,
  nonce: string
): string {
  return `Sign this message to authenticate with Biaz.\n\nAddress: ${address}\nNonce: ${nonce}\n\nThis signature will be used to verify your wallet ownership.`;
}

export async function linkWalletToUser(
  userId: number,
  walletData: WalletAuthData
) {
  try {
    // Verify signature
    const recoveredAddress = ethers.verifyMessage(
      walletData.message,
      walletData.signature
    );

    if (recoveredAddress.toLowerCase() !== walletData.address.toLowerCase()) {
      throw new Error("Invalid signature");
    }

    // Check if wallet is already linked to another user
    const existingUser = await findUserByWalletAddress(walletData.address);
    if (existingUser && existingUser.id !== userId) {
      throw new Error("Wallet is already linked to another account");
    }

    // Update user with wallet
    await updateUser(userId, {
      walletAddress: walletData.address,
      walletType: getWalletTypeFromChainId(walletData.chainId),
    });

    return true;
  } catch (error) {
    console.error("Link wallet error:", error);
    throw error;
  }
}

export async function unlinkWalletFromUser(userId: number) {
  try {
    await updateUser(userId, {
      walletAddress: null,
      walletType: null,
    });
    return true;
  } catch (error) {
    console.error("Unlink wallet error:", error);
    throw error;
  }
}
