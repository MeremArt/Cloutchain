/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  User,
  Mail,
  Phone,
  Wallet,
  DollarSign,
  RefreshCw,
  Gift,
  LogIn,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { UserData } from "@/app/interface/user.interface";
import { BalanceData } from "@/app/interface/user.interface";
import { API_ENDPOINTS } from "../../../config/api";
import { useUser } from "@civic/auth-web3/react";

export default function ProfilePage() {
  const userContext = useUser();
  const { user } = userContext;
  const solana = "solana" in userContext ? userContext.solana : null;
  const [userData, setUserData] = useState<UserData | null>(null);
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [loginMethod, setLoginMethod] = useState<
    "civic" | "traditional" | null
  >(null);

  // Determine which profile data to use based on login method
  const profileData = useMemo(() => {
    return loginMethod === "civic"
      ? {
          email: user?.email || "No email available",
          walletAddress: solana?.address || "",
          tiktokUsername: userData?.tiktokUsername || user?.username || "", // Try to use username from Civic if available
          id: user?.id || "",
        }
      : {
          email: userData?.email || "No email available",
          walletAddress: userData?.walletAddress || "",
          tiktokUsername: userData?.tiktokUsername || "",
          id: userData?.id || "",
        };
  }, [
    loginMethod,
    user?.email,
    user?.id,
    user?.username,
    solana?.address,
    userData,
  ]);

  // Initialization effect - runs once and on specific user data changes
  useEffect(() => {
    // Get user data from localStorage
    const storedData = localStorage.getItem("userData");
    if (storedData) {
      setUserData(JSON.parse(storedData));
    }

    // Determine login method from localStorage
    const storedLoginMethod = localStorage.getItem("loginMethod");
    if (storedLoginMethod === "civic") {
      setLoginMethod("civic");
    } else if (localStorage.getItem("jwt")) {
      setLoginMethod("traditional");
    } else if (user && solana?.address) {
      // Fallback detection if localStorage method isn't set
      setLoginMethod("civic");
      // Store for future reference
      localStorage.setItem("loginMethod", "civic");
    }
  }, [user, solana?.address]);

  // Handle Civic user data storage - separate effect to avoid circular dependencies
  useEffect(() => {
    // Only run this logic when we have confirmed Civic login and user data
    if (loginMethod === "civic" && user && solana?.address) {
      // Check if we need to update stored data
      const shouldUpdateStorage =
        !userData ||
        !userData.tiktokUsername ||
        userData.walletAddress !== solana.address;

      if (shouldUpdateStorage) {
        const civicUserData = {
          id: user.id || "",
          email: user.email || "",
          tiktokUsername: user.username || user.email?.split("@")[0] || "", // Use username or first part of email
          walletAddress: solana?.address || "",
        };

        localStorage.setItem("userData", JSON.stringify(civicUserData));
        setUserData(civicUserData);
      }
    }
  }, [loginMethod, user, solana?.address, userData]);

  // Fetch wallet balance directly for Civic Auth users
  const fetchDirectSolanaBalance = useCallback(async () => {
    if (!profileData.walletAddress) {
      toast.error("Wallet address not available");
      return;
    }

    setIsLoadingBalance(true);
    try {
      console.log("Fetching balance for wallet:", profileData.walletAddress);

      // Use the correct endpoint from your API_ENDPOINTS configuration
      const response = await fetch(
        `${API_ENDPOINTS.WALLETS.GET_BALANCE}${profileData.walletAddress}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch balance: ${response.status}`);
      }

      const data = await response.json();
      console.log("Balance data received:", data);

      // Set the balance data with the expected format
      setBalanceData({
        balances: {
          sol: data.balance || 0,
        },
      });

      toast.success("Balance updated");
    } catch (error) {
      console.error("Error fetching Solana balance:", error);
      toast.error("Failed to fetch wallet balance");

      // Set a default balance to avoid UI issues
      setBalanceData({
        balances: {
          sol: 0,
        },
      });
    } finally {
      setIsLoadingBalance(false);
    }
  }, [profileData.walletAddress]);

  // Original fetchBalance function (for TikTok username based lookup)
  const fetchTikTokBalance = useCallback(async () => {
    if (!profileData.tiktokUsername) {
      toast.error("TikTok username not available");
      return;
    }

    setIsLoadingBalance(true);
    try {
      console.log(
        "Fetching balance for TikTok username:",
        profileData.tiktokUsername
      );

      const response = await fetch(
        `${API_ENDPOINTS.PROFILE.BALANCE}${profileData.tiktokUsername}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch balance: ${response.status}`);
      }

      const data = await response.json();
      console.log("TikTok balance data received:", data);

      setBalanceData(data);
      toast.success("Balance updated");
    } catch (error) {
      console.error("Error fetching balance:", error);
      toast.error("Failed to fetch balance");

      // Set a default balance to avoid UI issues
      setBalanceData({
        balances: {
          sol: 0,
        },
      });
    } finally {
      setIsLoadingBalance(false);
    }
  }, [profileData.tiktokUsername]);

  // Combined fetch balance function that decides which method to use
  const fetchBalance = useCallback(async () => {
    console.log("Fetch balance called. Login method:", loginMethod);
    console.log("Wallet address:", profileData.walletAddress);
    console.log("TikTok username:", profileData.tiktokUsername);

    if (loginMethod === "civic" && profileData.walletAddress) {
      await fetchDirectSolanaBalance();
    } else if (profileData.tiktokUsername) {
      await fetchTikTokBalance();
    } else {
      toast.error("No wallet address or TikTok username available");
    }
  }, [
    loginMethod,
    profileData.walletAddress,
    profileData.tiktokUsername,
    fetchDirectSolanaBalance,
    fetchTikTokBalance,
  ]);

  useEffect(() => {
    // Only fetch balance if we have the necessary info
    if (
      (loginMethod === "civic" && profileData.walletAddress) ||
      profileData.tiktokUsername
    ) {
      fetchBalance();
    }
  }, [
    fetchBalance,
    loginMethod,
    profileData.walletAddress,
    profileData.tiktokUsername,
  ]);

  const copySolanaLink = () => {
    if (loginMethod === "civic" && profileData.walletAddress) {
      // For Civic Auth wallet users, check if the address looks like a valid Solana wallet
      // and use it directly in the id parameter
      if (profileData.walletAddress && profileData.walletAddress.length >= 32) {
        const solanaLink = `https://www.cloutchain.xyz/gift?id=${profileData.walletAddress}`;
        navigator.clipboard.writeText(solanaLink);
        toast.success("Solana gift link copied!");
        console.log("Generated smart gift link with wallet in id:", solanaLink);
      } else {
        toast.error("Invalid wallet address format");
      }
    } else if (profileData.tiktokUsername) {
      // For traditional users with a TikTok username
      const solanaLink = `https://www.cloutchain.xyz/gift?id=${profileData.tiktokUsername}`;
      navigator.clipboard.writeText(solanaLink);
      toast.success("Solana gift link copied!");
      console.log("Generated gift link with TikTok username:", solanaLink);
    } else {
      toast.error("No valid gift link can be generated");
    }
  };

  const copyWalletAddress = () => {
    if (profileData.walletAddress) {
      navigator.clipboard.writeText(profileData.walletAddress);
      toast.success("Wallet address copied!");
    } else {
      toast.error("No wallet address available");
    }
  };

  // Format wallet address for display
  const formatWalletAddress = (address: string | any[]) => {
    if (!address) return "No wallet connected";
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">My Profile</h1>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Balance Cards */}
        <div className="md:col-span-3 grid gap-4 md:grid-cols-2">
          {/* Available Balance */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <DollarSign className="w-6 h-6 text-yellow-400 mr-2" />
                <h3 className="text-lg font-semibold font-orbitron text-white">
                  Available Balance
                </h3>
              </div>
              <button
                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                onClick={fetchBalance}
                disabled={isLoadingBalance}
              >
                <RefreshCw
                  className={`w-5 h-5 text-gray-400 ${
                    isLoadingBalance ? "animate-spin" : ""
                  }`}
                />
              </button>
            </div>
            <div className="text-3xl font-bold font-orbitron text-white">
              {balanceData ? balanceData.balances.sol.toFixed(2) : "0.00"} $SOL
            </div>
          </div>

          {/* Pending Balance */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <DollarSign className="w-6 h-6 text-orange-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">
                Pending Balance
              </h3>
            </div>
            <div className="text-3xl font-bold text-white">{0}</div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="md:col-span-3">
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            {userData ? (
              <div className="space-y-6">
                {/* Profile Header */}
                <div className="flex items-start space-x-6">
                  <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                    {user?.picture ? (
                      <img
                        src={user.picture}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <User className="w-10 h-10 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      @{profileData.tiktokUsername || "No Username"}
                    </h2>
                    <div className="flex items-center space-x-2">
                      <p className="text-gray-400 text-sm">
                        User ID: {profileData.id}
                      </p>
                      <div className="bg-gray-700 rounded-full px-2 py-1 flex items-center">
                        <LogIn className="w-3 h-3 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-400">
                          {loginMethod === "civic"
                            ? "Civic Auth"
                            : "Traditional"}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={copySolanaLink}
                      className="flex items-center mt-2 text-yellow-400 hover:text-yellow-300 transition-colors text-sm bg-gray-700 px-2 py-1 rounded"
                    >
                      <Gift className="w-4 h-4 mr-1" />
                      <span>Copy Solana Gift Link</span>
                    </button>
                  </div>
                </div>

                {/* Profile Details Grid */}
                <div className="grid gap-4 mt-6">
                  {/* Email */}
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-yellow-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-400">Email</p>
                        <p className="text-white">{profileData.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* TikTok Username */}
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 text-yellow-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-400">Social handle</p>
                        <p className="text-white">
                          {userData.tiktokUsername || "Not connected"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Wallet */}
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <Wallet className="w-5 h-5 text-yellow-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-400">Wallet Address</p>
                        <p className="text-white font-mono">
                          {formatWalletAddress(profileData.walletAddress)}
                        </p>
                        {profileData.walletAddress && (
                          <button
                            onClick={copyWalletAddress}
                            className="text-xs text-yellow-400 hover:text-yellow-300 mt-1"
                          >
                            Copy full address
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <User className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p>No user data found</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}
