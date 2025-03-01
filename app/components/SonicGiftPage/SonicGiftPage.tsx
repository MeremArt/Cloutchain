"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  useAppKit,
  useAppKitAccount,
  useAppKitProvider,
} from "@reown/appkit/react";
import {
  Wallet,
  DollarSign,
  QrCode,
  Send,
  Gift,
  Copy,
  ArrowLeft,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import { API_ENDPOINTS } from "../../../config/api";
import { Provider } from "@reown/appkit-adapter-solana/react";
import QRCode from "react-qr-code";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";

interface BalanceData {
  balances: {
    sonic: number;
    [key: string]: number;
  };
}

interface UserData {
  id: string;
  tiktokUsername: string;
  walletAddress: string;
  email?: string;
}

// Sonic token mint address on Solana (replace with actual token mint address)
const SONIC_TOKEN_MINT = new PublicKey(
  "SonicxvLud67EceaEzCLRnMTBqzYUUYNr93DBkBdDES"
); // Example SPL token mint
const SOLANA_RPC_URL =
  "https://dry-misty-surf.solana-mainnet.quiknode.pro/3f5a226933e73f33db5ce840c220268713b4419f";

export default function SonicGiftPage() {
  const searchParams = useSearchParams();
  const tiktokUsername = searchParams.get("id");

  // AppKit hooks
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>("solana");

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

  useEffect(() => {
    // Fetch user data by TikTok username
    const fetchUserData = async () => {
      if (!tiktokUsername) return;

      setIsLoadingUserData(true);
      try {
        // Use the appropriate endpoint to fetch user data by TikTok username
        const response = await fetch(
          `${API_ENDPOINTS.PROFILE.BALANCE}${tiktokUsername}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUserData(data);

        // Now fetch the user's balance
        await fetchBalance(tiktokUsername);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load recipient data");
      } finally {
        setIsLoadingUserData(false);
      }
    };

    if (tiktokUsername) {
      fetchUserData();
    } else {
      setIsLoadingUserData(false);
    }
  }, [tiktokUsername]);

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

  const handleConnectWallet = async () => {
    try {
      open();
    } catch (error) {
      console.error("Error opening AppKit:", error);
      toast.error("Failed to open wallet connection dialog");
    }
  };

  const handleSendSonic = async () => {
    if (!isConnected || !address || !walletProvider) {
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
      const connection = new Connection(SOLANA_RPC_URL);

      // Convert amount to lamports (or the token's smallest unit)
      // Assuming 9 decimals for SPL tokens - adjust if SONIC has different decimals
      const amountInSmallestUnit = amountValue * Math.pow(10, 9);

      // Get sender and recipient token account addresses
      const senderPublicKey = new PublicKey(address);
      const recipientPublicKey = new PublicKey(userData.walletAddress);

      const senderTokenAccount = await getAssociatedTokenAddress(
        SONIC_TOKEN_MINT,
        senderPublicKey
      );

      const recipientTokenAccount = await getAssociatedTokenAddress(
        SONIC_TOKEN_MINT,
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
      const signedTransaction = await walletProvider.signTransaction(
        transaction
      );
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      // Wait for confirmation (optional)
      await connection.confirmTransaction(signature, "confirmed");

      // Save transaction signature for reference
      setTransactionSignature(signature);

      toast.success(
        `Successfully sent ${amount} $SONIC to @${userData.tiktokUsername}!`
      );

      // Reset amount after successful send
      setAmount("10");

      // Refresh recipient's balance after sending
      await fetchBalance(userData.tiktokUsername);
    } catch (error) {
      console.error("Error sending SONIC:", error);
      toast.error(
        error instanceof Error ? error.message : "Transaction failed"
      );
    } finally {
      setIsLoading(false);
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
    }?amount=${amount}&spl-token=${SONIC_TOKEN_MINT.toString()}&reference=${
      userData.id
    }&label=Sonic%20Gift&message=Gift%20for%20${userData.tiktokUsername}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-bold text-xl">Back to Home</span>
          </Link>
          <div className="flex items-center">
            <Gift className="w-6 h-6 text-yellow-400 mr-2" />
            <h1 className="text-xl font-bold">SONIC Gift</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 max-w-2xl">
        {!tiktokUsername ? (
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
                Gift $SONIC to
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
                    {balanceData.balances.sonic.toFixed(2)} $SONIC
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
                      isConnected ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></span>
                  <span className="text-sm">
                    {isConnected ? "Connected" : "Not Connected"}
                  </span>
                </div>
              </div>

              {isConnected && address && (
                <div className="mt-2 text-xs text-gray-400 flex items-center justify-between">
                  <span className="font-mono">
                    {address.slice(0, 10)}...{address.slice(-6)}
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
                        : `${presetAmount} $SONIC`}
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
                    <span className="text-gray-400">$SONIC</span>
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
                    onClick={
                      isConnected ? handleSendSonic : handleConnectWallet
                    }
                    disabled={isLoading}
                    className="flex items-center justify-center py-3 px-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                    ) : (
                      <>
                        {isConnected ? (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Send $SONIC
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
                  Scan to send {amount} $SONIC
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
                  Your donation of {amount} $SONIC has been sent successfully!
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
