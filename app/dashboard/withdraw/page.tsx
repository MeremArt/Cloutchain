"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Wallet,
  DollarSign,
  RefreshCw,
  Building,
  AlertCircle,
  Send,
  Copy,
  Check,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useWallet } from "@solana/wallet-adapter-react";
import useWalletDeepLink from "@/app/components/DeepLink/DeepLink";
import { API_ENDPOINTS } from "../../../config/api";
import { HermesClient } from "@pythnetwork/hermes-client";
import { UserData } from "@/app/interface/user.interface";
import { WithdrawalMethod } from "@/app/interface/user.interface";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";

import { BalanceData } from "@/app/interface/user.interface";
import SonicBalanceDisplay from "@/app/components/SonicBalanceDisplay/SonicBalanceDisplay";
//  price feed ID when available
const SONIC_PRICE_FEED_ID =
  "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";
import SonicPriceDisplay from "@/app/components/SonicPriceDisplay/SonicPriceDisplay";
import { useUser } from "@civic/auth-web3/react";
const WithdrawalPage = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [bankDetails, setBankDetails] = useState({
    accountName: "",
    accountNumber: "",
    bankName: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [withdrawalReference, setWithdrawalReference] = useState<string | null>(
    null
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { publicKey, connected, wallet, signTransaction } = useWallet();
  // Exchange rates
  const [sonicPrice, setSonicPrice] = useState(0.33); // Default fallback price
  const [priceTimestamp, setPriceTimestamp] = useState<Date | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [usdToNgnRate, setUsdToNgnRate] = useState(1575);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const { initiateDeepLink } = useWalletDeepLink();
  const userContext = useUser();
  const { user } = userContext;
  const solana = "solana" in userContext ? userContext.solana : null;
  // Min and max withdrawal
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
  const WITHDRAWAL_FEE_PERCENT = 0.1; // 1.5%
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
  const withdrawalMethods: WithdrawalMethod[] = [
    {
      id: "bank",
      name: "Bank Transfer",
      icon: <Building className="w-5 h-5" />,
      description: "Withdraw to your Nigerian bank account",
    },
    {
      id: "wallet",
      name: "Wallet Transfer",
      icon: <Wallet className="w-5 h-5" />,
      description: "Withdraw to your crypto wallet",
    },
  ];
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

  useEffect(() => {
    const storedData = localStorage.getItem("userData");
    if (storedData) {
      setUserData(JSON.parse(storedData));
    }
  }, []);
  const handleProceedWithdrawal = () => {
    if (!validateWithdrawal()) return;
    setShowConfirmation(true);
  };
  const SOLANA_RPC_URL =
    process.env.SOLANA_RPC_URL ||
    "https://dry-misty-surf.solana-mainnet.quiknode.pro/3f5a226933e73f33db5ce840c220268713b4419f";

  const processWalletWithdrawal = async () => {
    if (!connected || !publicKey || !signTransaction) {
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

    // Save transaction signature as reference
    setWithdrawalReference(signature);
    toast.success(`Successfully sent ${amount} SOL to your wallet!`);

    // Additional API call to update backend records (if needed)
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
  };

  const processBankWithdrawal = async () => {
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
        throw new Error(
          errorData.message || "Failed to process bank withdrawal"
        );
      } else {
        const errorText = await response.text();
        console.error("Non-JSON error response:", errorText);
        throw new Error("Server error - received non-JSON response");
      }
    }

    const data = await response.json();
    setWithdrawalReference(data.reference);
    toast.success("Bank withdrawal request submitted successfully");
  };
  const processWithdrawal = async () => {
    if (!validateWithdrawal()) return;

    // Track initial balance for verification
    const initialBalance = balanceData?.balances.sol || 0;
    setIsProcessing(true);

    try {
      // Handle different withdrawal methods
      if (selectedMethod === "bank") {
        // Process bank withdrawal through API
        await processBankWithdrawal();
      } else if (selectedMethod === "wallet" && publicKey) {
        // Process wallet withdrawal using direct Solana transaction
        await processWalletWithdrawal();
      }

      // After successful withdrawal, reset form and fetch new balance
      setAmount("");
      setSelectedMethod(null);
      setBankDetails({
        accountName: "",
        accountNumber: "",
        bankName: "",
      });
      setShowConfirmation(false);
      fetchBalance();
    } catch (error) {
      console.error("Error processing withdrawal:", error);

      if (
        error instanceof Error &&
        error.message.includes("Transaction error")
      ) {
        // Wait a moment for the blockchain to update
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // Fetch new balance
        await fetchBalance();

        // Compare old and new balances
        const newBalance = balanceData?.balances.sol || 0;

        if (newBalance < initialBalance) {
          // Balance decreased, transaction likely succeeded
          toast.success(
            "Your withdrawal appears to have succeeded! Your balance has been updated."
          );

          // Show success UI instead of error
          setWithdrawalReference("Transaction completed");
          return;
        }
      }

      toast.error(error instanceof Error ? error.message : "Withdrawal failed");
    } finally {
      setIsProcessing(false);
    }
  };
  // Fetch live Sonic price from Pyth Network
  // Fetch Sonic price from Pyth Network
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

  // Implementation of fetchDirectSolanaBalance

  // Implementation of fetchTikTokBalance

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

  const calculateNGNValue = (sonicAmount: number) => {
    return sonicAmount * SONIC_TO_NGN_RATE;
  };

  const calculateFee = (sonicAmount: number) => {
    return (sonicAmount * WITHDRAWAL_FEE_PERCENT) / 100;
  };

  const calculateNetAmount = (sonicAmount: number) => {
    const fee = calculateFee(sonicAmount);
    return sonicAmount - fee;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and decimal point
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setAmount(value);
  };

  const handleMaxAmount = () => {
    if (balanceData && balanceData.balances.sol > 0) {
      setAmount(balanceData.balances.sol.toString());
    }
  };

  const handleWithdrawalMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const handleBankDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBankDetails({
      ...bankDetails,
      [name]: value,
    });
  };

  const validateWithdrawal = () => {
    const amountValue = parseFloat(amount);

    if (!amountValue || isNaN(amountValue)) {
      toast.error("Please enter a valid amount");
      return false;
    }

    if (amountValue < MIN_WITHDRAWAL) {
      toast.error(
        `Minimum withdrawal is ${MIN_WITHDRAWAL} SOL (≈₦${MIN_WITHDRAWAL_NGN.toLocaleString()})`
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

  const handleCopyReference = () => {
    if (withdrawalReference) {
      navigator.clipboard.writeText(withdrawalReference);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      toast.success("Reference copied to clipboard");
    }
  };

  const amountValue = parseFloat(amount) || 0;
  const ngnValue = calculateNGNValue(amountValue);
  const feeAmount = calculateFee(amountValue);
  const netAmount = calculateNetAmount(amountValue);
  const netNGNValue = calculateNGNValue(netAmount);

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
        {/* Withdrawal Form */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-6">
            Withdraw Funds
          </h3>

          {withdrawalReference ? (
            <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-3">
                <Check className="w-5 h-5 text-green-400 mr-2" />
                <h4 className="text-green-400 font-medium">
                  Withdrawal Successful
                </h4>
              </div>
              <p className="text-gray-300 mb-3">
                Your withdrawal request has been submitted successfully. Please
                save your reference number.
              </p>
              <div className="bg-gray-800 p-3 rounded flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm">Reference:</span>
                <div className="flex items-center">
                  <span className="text-white font-mono">
                    {withdrawalReference}
                  </span>
                  <button
                    onClick={handleCopyReference}
                    className="ml-2 p-1 hover:bg-gray-700 rounded"
                  >
                    {copySuccess ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-gray-800 p-3 rounded flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm">Amount:</span>
                <span className="text-white">{amount} $SOL</span>
              </div>

              <div className="bg-gray-800 p-3 rounded flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm">Status:</span>
                <span className="px-2 py-1 bg-yellow-700/30 text-yellow-400 rounded text-xs">
                  Pending
                </span>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => setWithdrawalReference(null)}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors"
                >
                  Make Another Withdrawal
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Amount Input */}
              <div className="mb-6">
                <label className="block text-gray-400 mb-2 text-sm">
                  Amount to Withdraw
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-yellow-400" />
                  </div>
                  <input
                    type="text"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="Enter amount"
                    className="w-full pl-10 pr-20 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      onClick={handleMaxAmount}
                      className="px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-xs text-white transition-colors"
                    >
                      MAX
                    </button>
                  </div>
                </div>
                {amountValue > 0 && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-400">
                      ≈ ₦{ngnValue.toLocaleString()}
                    </span>
                    {amountValue < MIN_WITHDRAWAL && (
                      <span className="text-sm text-red-400">
                        Minimum: {MIN_WITHDRAWAL} $SOL
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Fee and Amount Received */}
              {amountValue > 0 && (
                <div className="bg-gray-700 p-4 rounded-lg mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">
                      Fee ({WITHDRAWAL_FEE_PERCENT}%):
                    </span>
                    <span className="text-sm text-white">
                      {feeAmount.toFixed(2)} $SOL
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">
                      You will receive:
                    </span>
                    <div className="text-right">
                      <div className="text-white font-semibold">
                        {netAmount.toFixed(2)} $SOL
                      </div>
                      <div className="text-xs text-gray-400">
                        ≈ ₦{netNGNValue.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Withdrawal Methods */}
              <div className="mb-6">
                <label className="block text-gray-400 mb-2 text-sm">
                  Select Withdrawal Method
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {withdrawalMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => handleWithdrawalMethodSelect(method.id)}
                      className={`p-4 rounded-lg text-left transition-colors ${
                        selectedMethod === method.id
                          ? "bg-yellow-500/20 border border-yellow-500"
                          : "bg-gray-700 border border-gray-600 hover:bg-gray-600"
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        <div
                          className={`${
                            selectedMethod === method.id
                              ? "text-yellow-400"
                              : "text-gray-400"
                          } mr-2`}
                        >
                          {method.icon}
                        </div>
                        <span
                          className={`font-medium ${
                            selectedMethod === method.id
                              ? "text-yellow-400"
                              : "text-white"
                          }`}
                        >
                          {method.name}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        {method.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bank Details (for bank transfer) */}
              {selectedMethod === "bank" && (
                <div className="bg-gray-700 p-4 rounded-lg mb-6">
                  <h4 className="text-white mb-3">Bank Details</h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Bank Name
                      </label>
                      <select
                        name="bankName"
                        value={bankDetails.bankName}
                        onChange={(e) =>
                          setBankDetails({
                            ...bankDetails,
                            bankName: e.target.value,
                          })
                        }
                        className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      >
                        <option value="">Select a bank</option>
                        <option value="access">Access Bank</option>
                        <option value="gtbank">GTBank</option>
                        <option value="firstbank">First Bank</option>
                        <option value="zenith">Zenith Bank</option>
                        <option value="uba">UBA</option>
                        <option value="sterling">Sterling Bank</option>
                        <option value="kuda">Kuda Bank</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Account Number
                      </label>
                      <input
                        type="text"
                        name="accountNumber"
                        value={bankDetails.accountNumber}
                        onChange={handleBankDetailsChange}
                        placeholder="Enter 10-digit account number"
                        maxLength={10}
                        className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Account Name
                      </label>
                      <input
                        type="text"
                        name="accountName"
                        value={bankDetails.accountName}
                        onChange={handleBankDetailsChange}
                        placeholder="Enter account name"
                        className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Wallet Connect (for wallet transfer) */}
              {selectedMethod === "wallet" && (
                <div className="bg-gray-700 p-4 rounded-lg mb-6">
                  <h4 className="text-white mb-3">Wallet Transfer</h4>

                  {connected ? (
                    <div className="bg-green-900/30 border border-green-700 rounded p-3 flex items-center">
                      <Check className="w-5 h-5 text-green-400 mr-2" />
                      <span className="text-green-400">Wallet connected</span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-400 mb-3">
                        Connect your wallet to receive $SOL tokens directly.
                      </p>
                      <button
                        onClick={handleConnectWallet}
                        className="flex items-center justify-center w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium rounded-lg transition-colors"
                      >
                        <Wallet className="w-5 h-5 mr-2" />
                        Connect Wallet
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Information Notes */}
              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-400 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-blue-400 text-sm font-medium mb-1">
                      Important Information
                    </h4>
                    <ul className="text-sm text-gray-300 space-y-1 list-disc pl-4">
                      <li>
                        Minimum withdrawal amount: {MIN_WITHDRAWAL} $SOL (≈₦
                        {MIN_WITHDRAWAL_NGN.toLocaleString()})
                      </li>
                      <li>Processing time: 1-24 hours</li>
                      <li>
                        A {WITHDRAWAL_FEE_PERCENT}% fee applies to all
                        withdrawals
                      </li>
                      <li>
                        Bank transfers are available for Nigerian banks only
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleProceedWithdrawal}
                disabled={!amount || parseFloat(amount) <= 0 || !selectedMethod}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Withdrawal
              </button>
            </>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-4">
              Confirm Withdrawal
            </h3>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-400">Amount:</span>
                  <span className="text-white">{amount} $SOL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Value:</span>
                  <span className="text-white">
                    ₦{ngnValue.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-400">
                    Fee ({WITHDRAWAL_FEE_PERCENT}%):
                  </span>
                  <span className="text-white">
                    {feeAmount.toFixed(2)} $SOL
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">
                    You&apos;ll receive:
                  </span>
                  <div className="text-right">
                    <div className="text-white">
                      {netAmount.toFixed(2)} $SOL
                    </div>
                    <div className="text-xs text-gray-400">
                      ≈ ₦{netNGNValue.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {selectedMethod === "bank" && (
                <div className="bg-gray-700 p-3 rounded-lg">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">Bank:</span>
                    <span className="text-white capitalize">
                      {bankDetails.bankName}
                    </span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">Account:</span>
                    <span className="text-white">
                      {bankDetails.accountNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Name:</span>
                    <span className="text-white">
                      {bankDetails.accountName}
                    </span>
                  </div>
                </div>
              )}

              {selectedMethod === "wallet" && (
                <div className="bg-gray-700 p-3 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Destination:</span>
                    <span className="text-white">Connected Wallet</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={processWithdrawal}
                disabled={isProcessing}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Confirm
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-center" />
    </div>
  );
};

export default WithdrawalPage;
