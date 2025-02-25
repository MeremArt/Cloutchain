"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Wallet,
  Twitter,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { UserData } from "@/app/types/user.types";
import { BalanceData } from "@/app/types/user.types";
import { API_ENDPOINTS } from "@/app/config/api";

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem("userData");
    if (storedData) {
      setUserData(JSON.parse(storedData));
    }
  }, []);

  const fetchBalance = async () => {
    if (!userData || !userData.phoneNumber) {
      toast.error("Phone number not available");
      return;
    }

    setIsLoadingBalance(true);
    try {
      // Include the user's phone number in the API request
      const response = await fetch(
        `${API_ENDPOINTS.PROFILE.BALANCE}${userData.phoneNumber}`
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data: BalanceData = await response.json();
      setBalanceData(data);
    } catch (error) {
      console.error("Error fetching balance:", error);
      toast.error("Failed to fetch balance");
    } finally {
      setIsLoadingBalance(false);
    }
  };

  useEffect(() => {
    // Only fetch balance if userData is available
    if (userData && userData.phoneNumber) {
      fetchBalance();
    }
  }, [userData]); // This will re-run when userData becomes available

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
              {balanceData ? balanceData.balances.sonic.toFixed(2) : "0.00"}{" "}
              $SONIC
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
            <div className="text-3xl font-bold text-white">
              {/* ${balanceData.pendingBalance.toFixed(2)} */}
            </div>
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
                    <User className="w-10 h-10 text-gray-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {userData.twitterId || "No Twitter ID"}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      User ID: {userData.id}
                    </p>
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
                        <p className="text-white">{userData.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 text-yellow-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-400">Phone Number</p>
                        <p className="text-white">{userData.phoneNumber}</p>
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
                          {userData.walletAddress.slice(0, 6)}...
                          {userData.walletAddress.slice(-4)}
                        </p>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              userData.walletAddress
                            );
                            toast.success("Wallet address copied!");
                          }}
                          className="text-xs text-yellow-400 hover:text-yellow-300 mt-1"
                        >
                          Copy full address
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Twitter */}
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <Twitter className="w-5 h-5 text-yellow-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-400">Twitter ID</p>
                        <p className="text-white">
                          {userData.twitterId || "Not connected"}
                        </p>
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
