"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useWallet } from "@solana/wallet-adapter-react";
import useWalletDeepLink from "@/app/components/DeepLink/DeepLink";
import { HermesClient } from "@pythnetwork/hermes-client";
import { UserData } from "@/app/interface/user.interface";
import { BalanceData } from "@/app/interface/user.interface";
import { API_ENDPOINTS } from "../../../config/api";
import SonicBalanceDisplay from "@/app/components/SonicBalanceDisplay/SonicBalanceDisplay";
import SonicPriceDisplay from "@/app/components/SonicPriceDisplay/SonicPriceDisplay";
import { useUser } from "@civic/auth-web3/react";
import WithdrawalForm from "@/app/components/WithdrawalForm/WithdrawalForm";

// Price feed ID when available
const SONIC_PRICE_FEED_ID =
  "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";

const WithdrawalPage = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [amount, setAmount] = useState("");

  // Exchange rates
  const [sonicPrice, setSonicPrice] = useState(0.33); // Default fallback price
  const [priceTimestamp, setPriceTimestamp] = useState<Date | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [usdToNgnRate, setUsdToNgnRate] = useState(1575);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { publicKey, connected, wallet, signTransaction } = useWallet();
  const { initiateDeepLink } = useWalletDeepLink();
  const userContext = useUser();
  const { user } = userContext;
  const solana = "solana" in userContext ? userContext.solana : null;

  // Derived values
  const SONIC_TO_USD_RATE = sonicPrice;
  const USD_TO_NGN_RATE = usdToNgnRate;
  const SONIC_TO_NGN_RATE = SONIC_TO_USD_RATE * USD_TO_NGN_RATE;
  const [loginMethod, setLoginMethod] = useState<
    "civic" | "traditional" | null
  >(null);

  // Min and max withdrawal
  const MIN_WITHDRAWAL = 0.0001; // 0.0001 SOL
  const MIN_WITHDRAWAL_NGN = MIN_WITHDRAWAL * SONIC_TO_NGN_RATE;

  // Withdrawal Fee
  const WITHDRAWAL_FEE_PERCENT = 0.1; // 0.1%

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

  // Fetch live Sonic price from Pyth Network
  const fetchSonicPrice = useCallback(async () => {
    setIsLoadingPrice(true);
    try {
      console.log("Fetching Sonic price from Pyth...");
      const priceServiceConnection = new HermesClient(
        "https://hermes.pyth.network/",
        {}
      );

      const priceUpdateData =
        await priceServiceConnection.getLatestPriceUpdates(
          [SONIC_PRICE_FEED_ID],
          { encoding: "base64" }
        );

      console.log("Pyth raw response:", priceUpdateData);

      if (
        priceUpdateData &&
        priceUpdateData.parsed &&
        priceUpdateData.parsed.length > 0
      ) {
        const pythData = priceUpdateData.parsed[0];
        console.log("Pyth parsed data:", pythData);

        // Extract price from the nested 'price' object
        if (pythData.price) {
          // Extract price and apply exponent
          const priceValue = Number(pythData.price.price);
          const exponent = Number(pythData.price.expo); // Note it's 'expo', not 'exponent'

          // Convert price using exponent (price * 10^exponent)
          const actualPrice = priceValue * Math.pow(10, exponent);
          console.log(
            `Sonic price calculation: ${priceValue} * 10^${exponent} = ${actualPrice}`
          );

          // Set price with reasonable bounds check
          if (actualPrice > 0 && actualPrice < 1000) {
            // Sanity check
            setSonicPrice(actualPrice);
            setPriceTimestamp(
              new Date(
                typeof pythData.price.publish_time === "number"
                  ? pythData.price.publish_time * 1000
                  : Date.now()
              )
            );
            console.log("Final Sonic price:", actualPrice);
          } else {
            console.warn(
              "Price outside reasonable range, using default:",
              actualPrice
            );
            setSonicPrice(0.33); // Default fallback
            setPriceTimestamp(new Date());
          }
        } else {
          throw new Error("Price data not found in Pyth response");
        }
      } else {
        throw new Error("Invalid price data from Pyth");
      }
    } catch (error) {
      console.error("Error fetching Sonic price:", error);
      // Fall back to default price
      setSonicPrice(0.33);
      setPriceTimestamp(new Date());
    } finally {
      setIsLoadingPrice(false);
    }
  }, []);

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

  const fetchBalance = useCallback(async () => {
    console.log("Fetch balance called. Login method:", loginMethod);
    console.log("Wallet address:", userData?.walletAddress);
    console.log("TikTok username:", userData?.tiktokUsername);

    if (loginMethod === "civic" && userData?.walletAddress) {
      await fetchDirectSolanaBalance();
    } else if (userData?.tiktokUsername) {
      await fetchTikTokBalance();
    } else {
      toast.error("No wallet address or TikTok username available");
    }
  }, [
    loginMethod,
    userData?.walletAddress,
    userData?.tiktokUsername,
    fetchDirectSolanaBalance,
    fetchTikTokBalance,
  ]);

  const fetchExchangeRate = useCallback(async () => {
    try {
      // Simulated exchange rate
      setUsdToNgnRate(1475);
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
    }
  }, []);

  useEffect(() => {
    const storedData = localStorage.getItem("userData");
    if (storedData) {
      setUserData(JSON.parse(storedData));
    }

    fetchSonicPrice();
    fetchExchangeRate();

    // Refresh price every 5 minutes
    const priceIntervalId = setInterval(fetchSonicPrice, 5 * 60 * 1000);

    return () => clearInterval(priceIntervalId);
  }, [fetchSonicPrice, fetchExchangeRate]);

  useEffect(() => {
    if (userData && userData.tiktokUsername) {
      fetchBalance();
    }
  }, [fetchBalance, userData]);

  const calculateNGNValue = (sonicAmount: number): number => {
    return sonicAmount * SONIC_TO_NGN_RATE;
  };

  const calculateFee = (sonicAmount: number): number => {
    return (sonicAmount * WITHDRAWAL_FEE_PERCENT) / 100;
  };

  const calculateNetAmount = (sonicAmount: number): number => {
    const fee = calculateFee(sonicAmount);
    return sonicAmount - fee;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Withdraw Funds</h1>

      <div className="grid gap-6">
        {/* Price Display Component */}
        <SonicPriceDisplay
          sonicToUsdRate={SONIC_TO_USD_RATE}
          usdToNgnRate={USD_TO_NGN_RATE}
          priceTimestamp={priceTimestamp}
          isLoadingPrice={isLoadingPrice}
          onRefresh={fetchSonicPrice}
        />

        {/* Balance Display Component */}
        <SonicBalanceDisplay
          balanceData={balanceData}
          sonicToUsdRate={SONIC_TO_USD_RATE}
          isLoadingBalance={isLoadingBalance}
          onRefresh={fetchBalance}
          calculateNGNValue={calculateNGNValue}
        />

        {/* Withdrawal Form Component */}
        <WithdrawalForm
          userData={userData}
          balanceData={balanceData}
          amount={amount}
          setAmount={setAmount}
          MIN_WITHDRAWAL={MIN_WITHDRAWAL}
          MIN_WITHDRAWAL_NGN={MIN_WITHDRAWAL_NGN}
          WITHDRAWAL_FEE_PERCENT={WITHDRAWAL_FEE_PERCENT}
          SONIC_TO_NGN_RATE={SONIC_TO_NGN_RATE}
          calculateNGNValue={calculateNGNValue}
          calculateFee={calculateFee}
          calculateNetAmount={calculateNetAmount}
          fetchBalance={fetchBalance}
          connected={connected}
          publicKey={publicKey}
          signTransaction={signTransaction}
          initiateDeepLink={initiateDeepLink}
        />
      </div>

      <Toaster position="top-center" />
    </div>
  );
};

export default WithdrawalPage;
