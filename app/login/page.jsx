"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff, Lock, User } from "lucide-react";
// eslint-disable-next-line
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";
import Image from "next/image";
import { userHasWallet } from "@civic/auth-web3";
import { UserButton, useUser } from "@civic/auth-web3/react";
import { API_ENDPOINTS } from "../../config/api";

export default function Login() {
  const userContext = useUser();
  const { user, isLoading: isCivicLoading, signIn } = userContext;

  const router = useRouter();

  const [formData, setFormData] = useState({
    tiktokUsername: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [civicButtonClicked, setCivicButtonClicked] = useState(false);

  // Handle Civic Auth logic
  useEffect(() => {
    // If user is authenticated with Civic
    // eslint-disable-next-line
    if (user && userHasWallet(user)) {
      // Store user data from Civic Auth
      if (user) {
        const civicUserData = {
          id: user.id || "",
          email: user.email || "",
          tiktokUsername: user.username || user.email?.split("@")[0] || "", // Use username or first part of email
          walletAddress: user.solana?.address || "",
        };

        localStorage.setItem("userData", JSON.stringify(civicUserData));
      }

      // Store login method in localStorage
      localStorage.setItem("loginMethod", "civic");

      // User is authenticated with a wallet, redirect to dashboard
      router.push("/dashboard/profile");
      // eslint-disable-next-line
    } else if (user && !userHasWallet(user)) {
      // User is authenticated but doesn't have a wallet, create one
      const createWallet = async () => {
        try {
          console.log("Setting up your wallet...");
          // Check if createWallet is available in the context
          if ("createWallet" in userContext) {
            await userContext.createWallet();
          }

          console.log("Wallet created successfully!");
          // Store login method in localStorage
          localStorage.setItem("loginMethod", "civic");

          router.push("/dashboard/profile");
        } catch (error) {
          console.error("Error creating wallet:", error);
          setCivicButtonClicked(false);
        }
      };
      createWallet();
    }
  }, [user, router, userContext]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCivicAuth = (e) => {
    e.preventDefault(); // Prevent any form submission
    setCivicButtonClicked(true);

    // Find and click the hidden Civic button
    const civicButton = document.querySelector(".civic-user-button");

    if (civicButton) {
      civicButton.click();
      signIn();
    } else {
      toast.error("Civic Auth not available");
      setCivicButtonClicked(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Don't proceed if Civic Auth is loading
    if (isCivicLoading) return;

    setIsLoading(true);

    // Show loading toast
    const loadingToast = toast.loading("Logging in...");

    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, {
        tiktokUsername: formData.tiktokUsername,
        password: formData.password,
      });

      if (response.status !== 200) {
        throw new Error(response.data.message || "An error occurred");
      }

      const responseData = response.data;

      // Store the JWT in local storage
      localStorage.setItem("jwt", responseData.token);

      // Store login method in localStorage
      localStorage.setItem("loginMethod", "traditional");

      if (!responseData.user) {
        console.error("Login failed, user data is missing:", responseData);
        toast.error("Login failed: user data is missing");
        return;
      }

      // Store user data
      localStorage.setItem(
        "userData",
        JSON.stringify({
          id: responseData.user.id,
          email: responseData.user.email,
          tiktokUsername: responseData.user.tiktokUsername,
          walletAddress: responseData.user.walletAddress,
        })
      );

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success("Successfully logged in!", {
        duration: 3000,
        style: {
          background: "#333",
          color: "#fff",
        },
      });

      setFormData({
        tiktokUsername: "",
        password: "",
      });

      // Small delay for better UX
      setTimeout(() => {
        router.push("/dashboard/profile");
      }, 500);
    } catch (error) {
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast);
      let errorMessage = "An error occurred";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        duration: 4000,
        style: {
          background: "#333",
          color: "#fff",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center min-h-screen relative overflow-hidden ">
      {/* Background gradients */}
      <div className="absolute w-[440px] h-[440px] bg-[#87daba] rounded-full blur-[150px] top-[0%] left-[90%] opacity-[50%] md:block hidden" />
      <div className="absolute w-[225px] h-[225px] bg-[#5fcddc] rounded-full blur-[100px] top-[5%] bottom-[0%] left-[5%] opacity-[0.3]" />
      <div className="absolute w-[225px] h-[225px] bg-[#F24FFF] rounded-full blur-[100px] top-[5%] right-[0%] bottom-[20%] left-[0.5%] opacity-[0.5]" />
      <div className="absolute w-[225px] h-[225px] bg-[#87DABA] rounded-full blur-[100px] top-[5%] right-[0%] bottom-[20%] left-[5%] opacity-[0.2]" />

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row bg-white rounded-xl shadow-lg overflow-hidden max-w-5xl mx-auto"
        >
          {/* Left side - Image */}
          <div className="lg:w-1/2 relative bg-gradient-to-br from-blue-500 to-purple-600 hidden lg:block">
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="text-center">
                <Image
                  src="https://res.cloudinary.com/dtfvdjvyr/image/upload/v1740060892/Group_7_xmjgul.png"
                  alt="Login illustration"
                  className="mx-auto mb-8 rounded-lg shadow-lg"
                  width={250}
                  height={250}
                />
                <h2 className="text-3xl font-orbitron font-bold text-white mb-4">
                  Welcome Back!
                </h2>
                <p className="text-white/90 text-lg font-orbitron">
                  Access your account and continue your journey with us.
                </p>
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 text-white/70 text-center text-sm">
              Bet on Attention, Profit from Virality
            </div>
          </div>

          {/* Right side - Login form */}
          <div className="lg:w-1/2 p-8 lg:p-12">
            <div className="mb-8 text-center lg:text-left">
              <h1 className="text-3xl font-orbitron font-bold text-gray-800 mb-2">
                Login
              </h1>
              <p className="text-gray-600 font-nunito">
                Sign in to your account to continue
              </p>
            </div>

            {/* Civic Auth Button Section - MOVED TO TOP */}
            <div className="mb-8 text-center">
              {/* Custom Civic Auth Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCivicAuth}
                className="w-full bg-black text-white p-4 rounded-lg border border-gray-300 shadow-sm transition-all font-medium font-monserrat hover:bg-gray-800"
                type="button"
                disabled={isCivicLoading || isLoading || civicButtonClicked}
              >
                {isCivicLoading || civicButtonClicked
                  ? "Connecting..."
                  : "Sign in with Civic Auth"}
              </motion.button>

              {/* Hidden original UserButton */}
              <div className="hidden">
                <UserButton className="civic-user-button" />
              </div>

              {(isCivicLoading || civicButtonClicked || user?.isLoading) && (
                <div className="mt-3 flex items-center justify-center text-sm text-gray-500">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-indigo-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Connecting wallet...
                </div>
              )}
            </div>

            <div className="relative flex items-center py-2 mb-6">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-sm">or</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Traditional login form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-montserrat font-bold mb-2">
                  Social ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="tiktokUsername"
                    placeholder="Enter your TikTok username"
                    value={formData.tiktokUsername}
                    onChange={handleInputChange}
                    className="w-full p-3 pl-12 border font-montserrat text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    required
                    disabled={isLoading || isCivicLoading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 font-montserrat">
                  Format: m.e.r.e.m.a.r..t
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-montserrat font-bold text-gray-700 ">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full p-3 pl-12 border font-montserrat text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    required
                    disabled={isLoading || isCivicLoading}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer p-1"
                    disabled={isLoading || isCivicLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={
                  !isLoading && !isCivicLoading ? { scale: 1.02 } : {}
                }
                whileTap={!isLoading && !isCivicLoading ? { scale: 0.98 } : {}}
                type="submit"
                className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-lg shadow-lg transition-all font-medium
                  ${
                    isLoading || isCivicLoading
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl"
                  }`}
                disabled={isLoading || isCivicLoading}
              >
                {isLoading ? "Logging in..." : "Sign In"}
              </motion.button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600 font-montserrat">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-medium font-montserrat text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}
