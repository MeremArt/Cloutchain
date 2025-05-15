import toast from "react-hot-toast";
import { API_ENDPOINTS } from "@/config/api";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";

const SOLANA_RPC_URL =
  process.env.SOLANA_RPC_URL ||
  "https://dry-misty-surf.solana-mainnet.quiknode.pro/3f5a226933e73f33db5ce840c220268713b4419f";

/**
 * Processes a wallet withdrawal using Solana
 * @param {Object} params - The parameters for processing the withdrawal
 * @param {string} params.amount - The amount to withdraw
 * @param {Object} params.userData - User data containing wallet address
 * @param {Object} params.publicKey - The public key of the connected wallet
 * @param {Function} params.signTransaction - Function to sign a transaction
 * @returns {Promise<string>} - Transaction signature
 */
export const processWalletWithdrawal = async ({
  amount,
  userData,
  publicKey,
  signTransaction,
}) => {
  if (!publicKey || !signTransaction) {
    throw new Error("Wallet is not properly connected");
  }

  if (!userData?.walletAddress) {
    throw new Error("Destination wallet address not available");
  }

  const amountValue = parseFloat(amount);
  if (isNaN(amountValue) || amountValue <= 0) {
    throw new Error("Please enter a valid amount");
  }

  // Create Solana connection
  if (!SOLANA_RPC_URL) {
    throw new Error("SOLANA_RPC_URL is not defined");
  }

  const connection = new Connection(SOLANA_RPC_URL);

  // Convert amount to lamports (SOL uses 9 decimals)
  const lamports = Math.floor(amountValue * Math.pow(10, 9));

  // Create a simple native SOL transfer instruction
  const senderPublicKey = publicKey;
  const recipientPublicKey = new PublicKey(userData.walletAddress);

  // For native SOL transfers, use SystemProgram.transfer
  const transferInstruction = SystemProgram.transfer({
    fromPubkey: senderPublicKey,
    toPubkey: recipientPublicKey,
    lamports: lamports,
  });

  // Create transaction and add the transfer instruction
  const transaction = new Transaction().add(transferInstruction);

  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = senderPublicKey;

  // Sign and send transaction
  const signedTransaction = await signTransaction(transaction);
  const signature = await connection.sendRawTransaction(
    signedTransaction.serialize()
  );

  // Wait for confirmation
  await connection.confirmTransaction(signature, "confirmed");

  // Additional API call to update backend records
  try {
    const withdrawalData = {
      tiktokUsername: userData?.tiktokUsername,
      amount: parseFloat(amount),
      destinationWallet: userData.walletAddress,
      transactionId: signature,
    };

    const authToken =
      localStorage.getItem("jwt") || localStorage.getItem("token");

    await fetch(API_ENDPOINTS.WITHDRAWALS.WALLET, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(withdrawalData),
    });
  } catch (apiError) {
    // If API call fails but transaction succeeded, just log the error
    console.error("Error updating backend records:", apiError);
  }

  return signature;
};

/**
 * Processes a bank withdrawal request
 * @param {Object} params - Parameters for the bank withdrawal
 * @param {string} params.amount - Amount to withdraw
 * @param {Object} params.userData - User data containing tiktokUsername
 * @param {Object} params.bankDetails - Bank account details for withdrawal
 * @returns {Promise<Object>} - Response data with reference
 */
interface UserData {
  tiktokUsername: string;
  [key: string]: any; // Add this if userData may have additional properties
}

export const processBankWithdrawal = async ({
  amount,
  userData,
  bankDetails,
}: {
  amount: string;
  userData: UserData;
  bankDetails: object;
}): Promise<object> => {
  // Prepare request data for bank withdrawal
  const withdrawalData = {
    tiktokUsername: userData?.tiktokUsername,
    amount: parseFloat(amount),
    bankDetails: bankDetails,
  };

  console.log("Sending bank withdrawal request:", withdrawalData);
  console.log("API endpoint:", API_ENDPOINTS.WITHDRAWALS.BANK);

  // Get auth token
  const authToken =
    localStorage.getItem("jwt") || localStorage.getItem("token");

  // Make API call to bank withdrawal endpoint
  const response = await fetch(API_ENDPOINTS.WITHDRAWALS.BANK, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(withdrawalData),
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to process bank withdrawal");
    } else {
      const errorText = await response.text();
      console.error("Non-JSON error response:", errorText);
      throw new Error("Server error - received non-JSON response");
    }
  }

  return await response.json();
};

/**
 * Calculate the NGN value from SONIC amount
 * @param {number} sonicAmount - Amount in SONIC
 * @param {number} sonicToNgnRate - Conversion rate from SONIC to NGN
 * @returns {number} - Value in NGN
 */
export const calculateNGNValue = (
  sonicAmount: number,
  sonicToNgnRate: number
) => {
  return sonicAmount * sonicToNgnRate;
};

/**
 * Calculate fee amount based on SONIC amount
 * @param {number} sonicAmount - Amount in SONIC
 * @param {number} feePercent - Fee percentage
 * @returns {number} - Fee amount in SONIC
 */
export const calculateFee = (
  sonicAmount: number,
  feePercent: number
): number => {
  return (sonicAmount * feePercent) / 100;
};

/**
 * Calculate net amount after fees
 * @param {number} sonicAmount - Amount in SONIC
 * @param {number} feePercent - Fee percentage
 * @returns {number} - Net amount in SONIC after fees
 */
export const calculateNetAmount = (
  sonicAmount: number,
  feePercent: number
): number => {
  const fee = calculateFee(sonicAmount, feePercent);
  return sonicAmount - fee;
};

/**
 * Validates a withdrawal request
 * @param {Object} params - Parameters for validation
 * @param {string} params.amount - Amount to withdraw
 * @param {Object} params.balanceData - User's balance data
 * @param {string} params.selectedMethod - Selected withdrawal method
 * @param {Object} params.bankDetails - Bank details if bank transfer selected
 * @param {boolean} params.connected - Wallet connection status if wallet transfer selected
 * @param {number} params.minWithdrawal - Minimum withdrawal amount
 * @param {number} params.minWithdrawalNgn - Minimum withdrawal amount in NGN
 * @returns {boolean} - Whether the withdrawal is valid
 */
interface BankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
}

export const validateWithdrawal = ({
  amount,
  balanceData,
  selectedMethod,
  bankDetails,
  connected,
  minWithdrawal,
  minWithdrawalNgn,
}: {
  amount: string;
  balanceData: object;
  selectedMethod: string;
  bankDetails: BankDetails;
  connected: boolean;
  minWithdrawal: number;
  minWithdrawalNgn: number;
}): boolean => {
  const amountValue = parseFloat(amount);

  if (!amountValue || isNaN(amountValue)) {
    toast.error("Please enter a valid amount");
    return false;
  }

  if (amountValue < minWithdrawal) {
    toast.error(
      `Minimum withdrawal is ${minWithdrawal} SONIC (≈₦${minWithdrawalNgn.toLocaleString()})`
    );
    return false;
  }

  if (!balanceData || amountValue > balanceData.balances.sol) {
    toast.error("Insufficient balance");
    return false;
  }

  if (selectedMethod === "bank") {
    if (
      !bankDetails.accountName ||
      !bankDetails.accountNumber ||
      !bankDetails.bankName
    ) {
      toast.error("Please fill in all bank details");
      return false;
    }

    if (bankDetails.accountNumber.length < 10) {
      toast.error("Please enter a valid account number");
      return false;
    }
  }

  if (selectedMethod === "wallet" && !connected) {
    toast.error("Please connect your wallet to proceed");
    return false;
  }

  return true;
};
