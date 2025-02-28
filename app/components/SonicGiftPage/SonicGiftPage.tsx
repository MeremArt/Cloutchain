"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Wallet,
  DollarSign,
  QrCode,
  Send,
  Gift,
  ArrowLeft,
  Copy,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import { API_ENDPOINTS } from "@/app/config/api";

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

export default function SonicGiftPage() {
  const searchParams = useSearchParams();
  const tiktokUsername = searchParams.get("id");

  const [userData, setUserData] = useState<UserData | null>(null);
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [amount, setAmount] = useState("10");
  const [walletConnected, setWalletConnected] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);

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
    setIsLoading(true);
    try {
      // In reality, this would use Solana wallet adapter
      // For demo purposes, we'll simulate a connection
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setWalletConnected(true);
      toast.success("Wallet connected successfully!");
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Failed to connect wallet");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendSonic = async () => {
    if (!walletConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!userData || !userData.walletAddress) {
      toast.error("Recipient wallet address not available");
      return;
    }

    setIsLoading(true);
    try {
      // In reality, this would initiate a Solana transaction
      // For demo purposes, we'll simulate a transaction
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success(
        `Successfully sent ${amount} $SONIC to @${userData.tiktokUsername}!`
      );
      // Reset amount after successful send
      setAmount("10");
    } catch (error) {
      console.error("Error sending SONIC:", error);
      toast.error("Transaction failed");
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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and decimal point
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setAmount(value);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const generateQrValue = () => {
    if (!userData) return "";
    // Format as Solana Pay URL
    // Reference: https://docs.solanapay.com/spec
    return `solana:${userData.walletAddress}?amount=${amount}&spl-token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&reference=${userData.id}&label=Sonic%20Gift&message=Gift%20for%20${userData.tiktokUsername}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}

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
                Send $SONIC to
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
                      walletConnected ? handleSendSonic : handleConnectWallet
                    }
                    disabled={isLoading}
                    className="flex items-center justify-center py-3 px-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                    ) : (
                      <>
                        {walletConnected ? (
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
                  {/* In a real app, use a QR code library like react-qr-code */}
                  <div className="w-64 h-64 mx-auto bg-gray-200 flex items-center justify-center">
                    <QrCode className="w-48 h-48 text-gray-800" />
                    {/* This is a placeholder. In production, use:
                    <QRCode value={generateQrValue()} size={256} /> */}
                  </div>
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
