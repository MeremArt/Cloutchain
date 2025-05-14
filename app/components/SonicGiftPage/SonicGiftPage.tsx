"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import useWalletDeepLink from "../DeepLink/DeepLink";

import { useWallet } from "@solana/wallet-adapter-react";
import { Wallet, DollarSign, QrCode, Send, Gift, Copy } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import { API_ENDPOINTS } from "../../../config/api";

import QRCode from "react-qr-code";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { UserData } from "@/app/interface/user.interface";

interface BalanceData {
  balances: {
    sol: number;
    [key: string]: number;
  };
}

// Solana token mint address (SPL token)
const SOLANA_TOKEN_MINT = new PublicKey(
  "So11111111111111111111111111111111111111112"
); // Native SOL token
const SOLANA_RPC_URL =
  process.env.SOLANA_RPC_URL ||
  "https://dry-misty-surf.solana-mainnet.quiknode.pro/3f5a226933e73f33db5ce840c220268713b4419f";

// Helper function to check if a string might be a wallet address
const isLikelyWalletAddress = (id: string): boolean => {
  // Solana addresses are 32-44 characters long and base58 encoded
  // This is a simple check - you might want to improve it
  return (
    id.length >= 32 &&
    id.length <= 44 &&
    /^[1-9A-HJ-NP-Za-km-z]+$/.test(id) &&
    !id.includes(".")
  );
};

export default function SolanaGiftPage() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id"); // This might be username OR address
  const walletAddress = searchParams.get("wallet"); // Explicit wallet parameter

  // Determine if the id parameter is a wallet address or username
  const [recipientType, setRecipientType] = useState<
    "username" | "wallet" | null
  >(null);
  const [recipientId, setRecipientId] = useState<string | null>(null);

  // AppKit hooks
  const { publicKey, connected, wallet, signTransaction } = useWallet();
  const [sentAmount, setSentAmount] = useState("");
  const { initiateDeepLink } = useWalletDeepLink();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [amount, setAmount] = useState("10");
  const [showQR, setShowQR] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [transactionSignature, setTransactionSignature] = useState<
    string | null
  >(null);

  // Predefined amounts for quick selection
  const predefinedAmounts = ["5", "10", "25", "50", "100", "Custom"];

  // Parse the parameters to determine recipient type
  useEffect(() => {
    // First check for explicit wallet parameter
    if (walletAddress) {
      console.log("Using explicit wallet parameter:", walletAddress);
      setRecipientType("wallet");
      setRecipientId(walletAddress);
    }
    // Then check if id parameter might be a wallet address
    else if (idParam && isLikelyWalletAddress(idParam)) {
      console.log("ID parameter appears to be a wallet address:", idParam);
      setRecipientType("wallet");
      setRecipientId(idParam);
    }
    // Otherwise, assume it's a username
    else if (idParam) {
      console.log("Using ID parameter as username:", idParam);
      setRecipientType("username");
      setRecipientId(idParam);
    }
    // No valid parameters found
    else {
      console.log("No valid recipient parameters found");
      setRecipientType(null);
      setRecipientId(null);
    }
  }, [idParam, walletAddress]);

  // Fetch user data based on determined recipient type
  useEffect(() => {
    if (!recipientId || !recipientType) {
      console.log("No recipient information available to fetch data");
      setIsLoadingUserData(false);
      return;
    }

    const fetchUserData = async () => {
      setIsLoadingUserData(true);

      try {
        console.log(`Fetching user data as ${recipientType}:`, recipientId);

        // Handle wallet address (direct or detected from id)
        if (recipientType === "wallet") {
          // Fetch balance using wallet endpoint
          try {
            const response = await fetch(
              `${API_ENDPOINTS.WALLETS.GET_BALANCE}${recipientId}`
            );

            if (response.ok) {
              const balanceInfo = await response.json();
              console.log("Wallet balance data:", balanceInfo);

              setBalanceData({
                balances: {
                  sol: balanceInfo.balance || 0,
                },
              });
            } else {
              console.warn("Wallet balance fetch failed:", response.status);
            }
          } catch (error) {
            console.error("Error fetching wallet balance:", error);
          }

          // Try to find registered user for this wallet
          try {
            const userResponse = await fetch(
              `/api/users/wallet/${recipientId}`
            );

            if (userResponse.ok) {
              const userData = await userResponse.json();
              console.log("Found registered user for wallet:", userData);

              setUserData({
                id: userData.id || recipientId.substring(0, 8),
                tiktokUsername: userData.tiktokUsername || "Cloutchain User",
                walletAddress: recipientId,
                email: userData.email || "",
              });
            } else {
              // Create minimal user profile for wallet
              console.log("No registered user found, creating basic profile");

              setUserData({
                id: recipientId.substring(0, 8),
                tiktokUsername: "Solana User",
                walletAddress: recipientId,
                email: "",
              });
            }
          } catch (error) {
            console.log(
              "Error finding user for wallet, using minimal profile:",
              error
            );
            setUserData({
              id: recipientId.substring(0, 8),
              tiktokUsername: "Solana User",
              walletAddress: recipientId,
              email: "",
            });
          }
        }
        // Handle username
        else if (recipientType === "username") {
          try {
            const response = await fetch(
              `${API_ENDPOINTS.PROFILE.BALANCE}${recipientId}`
            );

            if (!response.ok) {
              throw new Error(`Failed to fetch user data: ${response.status}`);
            }

            const data = await response.json();
            console.log("Username data:", data);

            // Update user data
            setUserData({
              id: data.id || recipientId,
              tiktokUsername: recipientId,
              walletAddress: data.walletAddress || "",
              email: data.email || "",
            });

            // Set balance data
            if (data.balances && data.balances.sol !== undefined) {
              setBalanceData({
                balances: {
                  sol: data.balances.sol,
                },
              });
            }
          } catch (error) {
            console.error("Error fetching data by username:", error);
            toast.error("Failed to load user data");
          }
        }
      } catch (error) {
        console.error("Error in fetchUserData:", error);
        toast.error("Failed to load recipient data");
      } finally {
        setIsLoadingUserData(false);
      }
    };

    fetchUserData();
  }, [recipientId, recipientType]);

  const handleConnectWallet = () => {
    try {
      initiateDeepLink();
      setDropdownVisible(true);
      // Track wallet connection attempt
    } catch (error) {
      if (error instanceof Error) {
        console.log("wallet_connect", error.message);
      }
    }
  };

  const handleSendSolana = async () => {
    if (!connected || !publicKey || !wallet) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!userData || !userData.walletAddress) {
      toast.error("Recipient wallet address not available");
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    try {
      setSentAmount(amount);

      if (!SOLANA_RPC_URL) {
        throw new Error("SOLANA_RPC_URL is not defined");
      }
      const connection = new Connection(SOLANA_RPC_URL);

      // Convert amount to lamports (or the token's smallest unit)
      // Solana uses 9 decimals
      const amountInSmallestUnit = amountValue * Math.pow(10, 9);

      // Get sender and recipient token account addresses
      const senderPublicKey = new PublicKey(publicKey);
      const recipientPublicKey = new PublicKey(userData.walletAddress);

      const senderTokenAccount = await getAssociatedTokenAddress(
        SOLANA_TOKEN_MINT,
        senderPublicKey
      );

      const recipientTokenAccount = await getAssociatedTokenAddress(
        SOLANA_TOKEN_MINT,
        recipientPublicKey
      );

      // Create transfer instruction
      const transferInstruction = createTransferInstruction(
        senderTokenAccount,
        recipientTokenAccount,
        senderPublicKey,
        BigInt(Math.floor(amountInSmallestUnit))
      );

      // Create transaction and add the transfer instruction
      const transaction = new Transaction().add(transferInstruction);

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = senderPublicKey;

      // Sign and send transaction using AppKit wallet provider
      if (!signTransaction) {
        throw new Error("Wallet does not support signing transactions");
      }
      const signedTransaction = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      // Wait for confirmation (optional)
      await connection.confirmTransaction(signature, "confirmed");

      // Save transaction signature for reference
      setTransactionSignature(signature);

      toast.success(
        `Successfully sent ${amount} $SOL to ${userData.tiktokUsername}!`
      );

      // Reset amount after successful send
      setAmount("10");

      // Refresh recipient's balance after sending
      if (recipientType === "username" && recipientId) {
        await fetchBalance(recipientId);
      } else if (userData.walletAddress) {
        await fetchWalletBalance(userData.walletAddress);
      }
    } catch (error) {
      console.error("Error sending SOL:", error);
      toast.error(
        error instanceof Error ? error.message : "Transaction failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBalance = async (username: string) => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.PROFILE.BALANCE}${username}`
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data: BalanceData = await response.json();
      setBalanceData(data);
    } catch (error) {
      console.error("Error fetching balance:", error);
      toast.error("Failed to fetch balance");
    }
  };

  const fetchWalletBalance = async (address: string) => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.WALLETS.GET_BALANCE}${address}`
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setBalanceData({
        balances: {
          sol: data.balance || 0,
        },
      });
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      toast.error("Failed to fetch balance");
    }
  };

  const handleCopyAddress = () => {
    if (userData?.walletAddress) {
      navigator.clipboard.writeText(userData.walletAddress);
      toast.success("Wallet address copied to clipboard!");
    }
  };

  const handleCopyTransactionSignature = () => {
    if (transactionSignature) {
      navigator.clipboard.writeText(transactionSignature);
      toast.success("Transaction signature copied!");
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and decimal point
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setAmount(value);
  };

  const generateQrValue = () => {
    if (!userData) return "";
    // Format as Solana Pay URL
    // Reference: https://docs.solanapay.com/spec
    return `solana:${
      userData.walletAddress
    }?amount=${amount}&spl-token=${SOLANA_TOKEN_MINT.toString()}&reference=${
      userData.id
    }&label=Solana%20Gift&message=Gift%20for%20${userData.tiktokUsername}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}

      <main className="container mx-auto p-6 max-w-2xl">
        {!recipientId ? (
          <div className="bg-gray-800 rounded-xl p-8 shadow-lg text-center">
            <div className="flex flex-col items-center">
              <Gift className="w-20 h-20 text-gray-600 mb-4" />
              <h3 className="text-xl font-medium mb-2">Invalid Link</h3>
              <p className="text-gray-400">
                This gift link is missing a recipient. Please ask for a valid
                gift link.
              </p>
              <Link
                href="/"
                className="mt-6 bg-yellow-500 text-gray-900 px-6 py-2 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
              >
                Go Back Home
              </Link>
            </div>
          </div>
        ) : isLoadingUserData ? (
          <div className="bg-gray-800 rounded-xl p-8 shadow-lg text-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="rounded-full bg-gray-700 h-20 w-20 mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
            <p className="mt-6 text-gray-400">Loading recipient details...</p>
          </div>
        ) : userData ? (
          <>
            {/* Recipient Card */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
              <h2 className="text-xl font-semibold mb-4 text-center">
                Gift $SOL to
              </h2>

              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
                  <Gift className="w-10 h-10 text-yellow-400" />
                </div>
              </div>

              <div className="text-center mb-4">
                <h3 className="text-lg font-medium">
                  @{userData.tiktokUsername}
                </h3>
                <div className="flex items-center justify-center mt-2">
                  <p className="text-sm text-gray-400 font-mono">
                    {userData.walletAddress.slice(0, 6)}...
                    {userData.walletAddress.slice(-4)}
                  </p>
                  <button
                    onClick={handleCopyAddress}
                    className="ml-2 text-yellow-400 hover:text-yellow-300"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {balanceData && (
                <div className="mt-4 bg-gray-700 p-4 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-2">
                    <DollarSign className="w-5 h-5 text-yellow-400 mr-1" />
                    <h4 className="text-sm font-medium text-gray-300">
                      Current Balance
                    </h4>
                  </div>
                  <p className="text-xl font-bold text-white">
                    {balanceData.balances.sol.toFixed(2)} $SOL
                  </p>
                </div>
              )}
            </div>

            {/* Wallet Status */}
            <div className="bg-gray-800 rounded-xl p-4 shadow-lg mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Wallet className="w-5 h-5 text-yellow-400 mr-2" />
                  <span className="text-sm">Wallet Status:</span>
                </div>
                <div className="flex items-center">
                  <span
                    className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      connected ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></span>
                  <span className="text-sm">
                    {connected ? "Connected" : "Not Connected"}
                  </span>
                </div>
              </div>

              {connected && publicKey && (
                <div className="mt-2 text-xs text-gray-400 flex items-center justify-between">
                  <span className="font-mono">
                    {publicKey.toString().slice(0, 10)}...
                    {publicKey.toString().slice(-6)}
                  </span>
                </div>
              )}
            </div>

            {/* Amount Selection */}
            {!showQR && (
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
                <h3 className="text-lg font-semibold mb-4">
                  Choose amount to send
                </h3>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {predefinedAmounts.map((presetAmount) => (
                    <button
                      key={presetAmount}
                      onClick={() =>
                        setAmount(presetAmount === "Custom" ? "" : presetAmount)
                      }
                      className={`py-2 px-4 rounded-lg transition-colors ${
                        amount === presetAmount
                          ? "bg-yellow-500 text-gray-900"
                          : "bg-gray-700 hover:bg-gray-600"
                      }`}
                    >
                      {presetAmount === "Custom"
                        ? presetAmount
                        : `${presetAmount} $SOL`}
                    </button>
                  ))}
                </div>

                {/* Custom amount input */}
                <div className="relative mb-6">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-yellow-400" />
                  </div>
                  <input
                    type="text"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="Enter amount"
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">$SOL</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowQR(true)}
                    className="flex items-center justify-center py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <QrCode className="w-5 h-5 mr-2" />
                    Show QR Code
                  </button>

                  <button
                    onClick={connected ? handleSendSolana : handleConnectWallet}
                    disabled={isLoading}
                    className="flex items-center justify-center py-3 px-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                    ) : (
                      <>
                        {connected ? (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Send $SOL
                          </>
                        ) : (
                          <>
                            <Wallet className="w-5 h-5 mr-2" />
                            Connect Wallet
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* QR Code Section */}
            {showQR && (
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg text-center">
                <h3 className="text-lg font-semibold mb-4">
                  Scan to send {amount} $SOL
                </h3>

                <div className="bg-white p-4 rounded-lg inline-block mb-6">
                  <QRCode
                    value={generateQrValue()}
                    size={256}
                    className="w-64 h-64"
                  />
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-400 mb-2">Wallet Address:</p>
                  <div className="flex items-center justify-center">
                    <p className="font-mono text-sm bg-gray-700 p-2 rounded">
                      {userData.walletAddress}
                    </p>
                    <button
                      onClick={handleCopyAddress}
                      className="ml-2 p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                    >
                      <Copy className="w-4 h-4 text-yellow-400" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setShowQR(false)}
                  className="py-3 px-6 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Back to payment options
                </button>
              </div>
            )}

            {/* Transaction Receipt (shown after successful transaction) */}
            {transactionSignature && (
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg mb-8 mt-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-green-900 rounded-full p-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>

                <h3 className="text-lg font-medium text-center mb-2">
                  Transaction Successful
                </h3>
                <p className="text-gray-400 text-center mb-4">
                  Your gift of {sentAmount} $SOL has been sent successfully!
                </p>

                <div className="bg-gray-700 p-3 rounded-lg mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Transaction:</span>
                    <div className="flex items-center">
                      <span className="text-sm font-mono text-gray-300 truncate max-w-xs">
                        {transactionSignature.slice(0, 10)}...
                        {transactionSignature.slice(-6)}
                      </span>
                      <button
                        onClick={handleCopyTransactionSignature}
                        className="ml-2 text-yellow-400 hover:text-yellow-300"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <a
                    href={`https://explorer.solana.com/tx/${transactionSignature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-400 hover:text-yellow-300 flex items-center text-sm"
                  >
                    <span>View on Solana Explorer</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-gray-800 rounded-xl p-8 shadow-lg text-center">
            <div className="flex flex-col items-center">
              <Gift className="w-20 h-20 text-gray-600 mb-4" />
              <h3 className="text-xl font-medium mb-2">User Not Found</h3>
              <p className="text-gray-400">
                Could not find a user with the provided ID
              </p>
              <Link
                href="/"
                className="mt-6 bg-yellow-500 text-gray-900 px-6 py-2 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
              >
                Go Back Home
              </Link>
            </div>
          </div>
        )}
      </main>

      <Toaster position="top-center" />
    </div>
  );
}
