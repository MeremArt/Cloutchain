"use client";

import { useState, useEffect, useCallback } from "react";
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
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { API_ENDPOINTS } from "../../../config/api";
import { HermesClient } from "@pythnetwork/hermes-client";
import { UserData } from "@/app/types/user.types";
import { WithdrawalMethod } from "@/app/types/user.types";
import { BalanceData } from "@/app/types/user.types";
import SonicBalanceDisplay from "@/app/components/SonicBalanceDisplay/SonicBalanceDisplay";
// Replace with Sonic's actual price feed ID when available
const SONIC_PRICE_FEED_ID =
  "0xb2748e718cf3a75b0ca099cb467aea6aa8f7d960b381b3970769b5a2d6be26dc";
import SonicPriceDisplay from "@/app/components/SonicPriceDisplay/SonicPriceDisplay";

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

  // Exchange rates
  const [sonicPrice, setSonicPrice] = useState(0.33); // Default fallback price
  const [priceTimestamp, setPriceTimestamp] = useState<Date | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [usdToNgnRate, setUsdToNgnRate] = useState(1475);

  // Min and max withdrawal
  // Derived values
  const SONIC_TO_USD_RATE = sonicPrice;
  const USD_TO_NGN_RATE = usdToNgnRate;
  const SONIC_TO_NGN_RATE = SONIC_TO_USD_RATE * USD_TO_NGN_RATE;

  // Min and max withdrawal
  const MIN_WITHDRAWAL = 10; // 10 SONIC
  const MIN_WITHDRAWAL_NGN = MIN_WITHDRAWAL * SONIC_TO_NGN_RATE;

  // Withdrawal Fee
  const WITHDRAWAL_FEE_PERCENT = 1.5; // 1.5%

  const { open } = useAppKit();
  const { isConnected } = useAppKitAccount();

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
    const storedData = localStorage.getItem("userData");
    if (storedData) {
      setUserData(JSON.parse(storedData));
    }
  }, []);

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
  const fetchBalance = useCallback(async () => {
    if (!userData || !userData.tiktokUsername) {
      toast.error("User data not available");
      return;
    }

    setIsLoadingBalance(true);
    try {
      const response = await fetch(
        `${API_ENDPOINTS.PROFILE.BALANCE}${userData.tiktokUsername}`
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
  }, [userData]);

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
    if (balanceData && balanceData.balances.sonic > 0) {
      setAmount(balanceData.balances.sonic.toString());
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

  const handleConnectWallet = () => {
    open();
  };

  const validateWithdrawal = () => {
    const amountValue = parseFloat(amount);

    if (!amountValue || isNaN(amountValue)) {
      toast.error("Please enter a valid amount");
      return false;
    }

    if (amountValue < MIN_WITHDRAWAL) {
      toast.error(
        `Minimum withdrawal is ${MIN_WITHDRAWAL} SONIC (≈₦${MIN_WITHDRAWAL_NGN.toLocaleString()})`
      );
      return false;
    }

    if (!balanceData || amountValue > balanceData.balances.sonic) {
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

    if (selectedMethod === "wallet" && !isConnected) {
      toast.error("Please connect your wallet first");
      return false;
    }

    return true;
  };

  const handleProceedWithdrawal = () => {
    if (!validateWithdrawal()) return;
    setShowConfirmation(true);
  };

  const processWithdrawal = async () => {
    if (!validateWithdrawal()) return;

    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate a random reference number
      const reference = `SON-${Date.now().toString().slice(-8)}-${Math.floor(
        Math.random() * 1000
      )}`;
      setWithdrawalReference(reference);

      toast.success("Withdrawal request submitted successfully");
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
      toast.error("Failed to process withdrawal");
    } finally {
      setIsProcessing(false);
    }
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
                <span className="text-white">{amount} $SONIC</span>
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
                        Minimum: {MIN_WITHDRAWAL} $SONIC
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
                      {feeAmount.toFixed(2)} $SONIC
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">
                      You will receive:
                    </span>
                    <div className="text-right">
                      <div className="text-white font-semibold">
                        {netAmount.toFixed(2)} $SONIC
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

                  {isConnected ? (
                    <div className="bg-green-900/30 border border-green-700 rounded p-3 flex items-center">
                      <Check className="w-5 h-5 text-green-400 mr-2" />
                      <span className="text-green-400">Wallet connected</span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-400 mb-3">
                        Connect your wallet to receive $SONIC tokens directly.
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
                        Minimum withdrawal amount: {MIN_WITHDRAWAL} $SONIC (≈₦
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
                  <span className="text-white">{amount} $SONIC</span>
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
                    {feeAmount.toFixed(2)} $SONIC
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">
                    You&apos;ll receive:
                  </span>
                  <div className="text-right">
                    <div className="text-white">
                      {netAmount.toFixed(2)} $SONIC
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
