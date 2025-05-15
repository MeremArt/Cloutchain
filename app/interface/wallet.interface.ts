/* eslint-disable @typescript-eslint/no-explicit-any */
// app/interface/wallet.interface.ts

import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { UserData } from "./user.interface";

// This interface needs to match what comes from @solana/wallet-adapter-react
export interface WalletInfo {
  publicKey: PublicKey;
  // Updated signature to support both Transaction and VersionedTransaction types
  signTransaction: <T extends Transaction | VersionedTransaction>(
    transaction: T
  ) => Promise<T>;
  connected?: boolean;
}

export interface WalletWithdrawalOptions {
  amount: string;
  userData: UserData | null;
  walletInfo: WalletInfo;
}

export interface WithdrawalOptions {
  method: string | null;
  amount: string;
  userData: UserData | null;
  bankDetails?: any; // Will be imported from bank.interface
  walletInfo?: WalletInfo;
  onSuccess?: (reference: string) => void;
  onError?: (error: Error) => Promise<void> | void;
  onComplete?: () => void;
}
