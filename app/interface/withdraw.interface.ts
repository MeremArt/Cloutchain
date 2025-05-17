import { UserData } from "@/app/interface/user.interface";
import { BalanceData } from "@/app/interface/user.interface";
import { PublicKey, Transaction } from "@solana/web3.js";
export interface WithdrawalFormProps {
  userData: UserData | null;
  balanceData: BalanceData | null;
  amount: string;
  setAmount: (amount: string) => void;
  MIN_WITHDRAWAL: number;
  MIN_WITHDRAWAL_NGN: number;
  WITHDRAWAL_FEE_PERCENT: number;
  SONIC_TO_NGN_RATE: number;
  calculateNGNValue: (amount: number) => number;
  calculateFee: (amount: number) => number;
  calculateNetAmount: (amount: number) => number;
  fetchBalance: () => Promise<void>;
  connected: boolean;
  publicKey: PublicKey | null;
  signTransaction:
    | ((transaction: Transaction) => Promise<Transaction>)
    | undefined;
  initiateDeepLink: () => void;
}
