"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff, Lock, User } from "lucide-react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";
import Image from "next/image";
import { API_ENDPOINTS } from "../config/api";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    tiktokUsername: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Show loading toast
    const loadingToast = toast.loading("Logging in...");

    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, {
        tiktokUsername: formData.tiktokUsername,
        password: formData.password,
      });
      console.log("Sending login request with payload:", {
        tiktokUsername: formData.tiktokUsername,
        password: "[REDACTED]",
      });

      if (response.status !== 200) {
        throw new Error(response.data.message || "An error occurred");
      }

      const responseData = response.data;

      // Debug logging
      console.log("Sending login request with payload:", {
        tiktokUsername: formData.tiktokUsername,
        password: "[REDACTED]",
      });
      // Store the JWT in local storage
      localStorage.setItem("jwt", responseData.token);

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
        router.push("/dashboard");
      }, 500);
    } catch (error) {
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast);
      let errorMessage = "An error occurred";
      if (axios.isAxiosError(error)) {
        errorMessage =
          (error.response?.data?.message as string) || error.message;
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

  // if (isLoading) {
  //   return (
  //     <>
  //       <LoadingSpinner message="..." />
  //     </>
  //   );
  // }

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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-montserrat font-bold mb-2">
                  Tiktok Username
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
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 font-montserrat">
                  Format: +1234567890 or 1234567890
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-montserrat font-bold text-gray-700 ">
                    Password
                  </label>
                  {/* <Link
                    href=""
                    className="text-sm font-montserrat text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Forgot Password?
                  </Link> */}
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
                    disabled={isLoading}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Remember me
                </label>
              </div> */}

              <motion.button
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
                type="submit"
                className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-lg shadow-lg transition-all font-medium
                  ${
                    isLoading
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl"
                  }`}
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Sign In"}
              </motion.button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600  font-montserrat">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-medium  font-montserrat text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Create Account
                </Link>
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-gray-500 text-sm mb-4">
                Or continue with
              </p>
              <div className="flex justify-center space-x-4">
                <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 0C5.37 0 0 5.37 0 12C0 18.63 5.37 24 12 24C18.63 24 24 18.63 24 12C24 5.37 18.63 0 12 0Z"
                      fill="#EA4335"
                    />
                    <path
                      d="M12 0C5.37 0 0 5.37 0 12C0 18.63 5.37 24 12 24C18.63 24 24 18.63 24 12C24 5.37 18.63 0 12 0Z"
                      fill="#FBBB00"
                    />
                    <path
                      d="M12 0C5.37 0 0 5.37 0 12C0 18.63 5.37 24 12 24C18.63 24 24 18.63 24 12C24 5.37 18.63 0 12 0Z"
                      fill="#34A853"
                    />
                    <path
                      d="M12 0C5.37 0 0 5.37 0 12C0 18.63 5.37 24 12 24C18.63 24 24 18.63 24 12C24 5.37 18.63 0 12 0Z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 10V14.5H18.2C17.9 16 17.1 17.25 16 18.2L19.5 20.5C21.6 18.5 22.8 15.5 22.8 12C22.8 11.2 22.7 10.4 22.6 9.7L12 10Z"
                      fill="white"
                    />
                    <path
                      d="M5.5 14.2L4.7 14.8L2 17L2 17C3.1 20.8 7.1 23.5 12 23.5C15.2 23.5 17.8 22.4 19.5 20.5L16 18.2C15 18.9 13.7 19.3 12 19.3C9 19.3 6.5 17.3 5.7 14.7L5.5 14.2Z"
                      fill="white"
                    />
                    <path
                      d="M12 4.8C13.7 4.8 15.1 5.4 16.2 6.5L19.2 3.5C17.2 1.6 14.8 0.5 12 0.5C7.1 0.5 3.1 3.2 2 7L5.7 9.8C6.5 7 9 4.8 12 4.8Z"
                      fill="white"
                    />
                    <path
                      d="M12 24C18.6 24 24 18.6 24 12C24 5.4 18.6 0 12 0C5.4 0 0 5.4 0 12C0 18.6 5.4 24 12 24ZM5.3 14.7C5.1 14.1 5 13.6 5 13C5 12.4 5.1 11.9 5.3 11.3L2 8.5C1.1 9.8 0.5 11.4 0.5 13C0.5 14.6 1.1 16.2 2 17.5L5.3 14.7ZM12 19.5C9.5 19.5 7.2 18.3 5.8 16.4L2.5 19.2C4.3 22 8 23.9 12 23.9C15.7 23.9 18.8 22.6 21 20.5L18 18.3C16.8 19.1 15.1 19.5 12 19.5ZM23.5 13C23.5 12.2 23.4 11.4 23.3 10.7H12V14.9H18.2C17.8 16.4 16.3 18.2 14 19.1L17 21.3C20 19.2 23.5 16.5 23.5 13ZM12 0.5C7.6 0.5 3.8 3.1 2.1 6.8L5.4 9.6C6.8 6.9 9.3 5 12 5C14.1 5 15.8 5.9 17 7.1L20 4.1C18 1.7 15.2 0.5 12 0.5Z"
                      fill="#4285F4"
                    />
                  </svg>
                </button>
                <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M24 12.073C24 5.446 18.627 0.073 12 0.073C5.373 0.073 0 5.446 0 12.073C0 18.063 4.388 23.027 10.125 23.927V15.542H7.078V12.072H10.125V9.43C10.125 6.423 11.917 4.761 14.658 4.761C15.97 4.761 17.344 4.996 17.344 4.996V7.949H15.83C14.34 7.949 13.875 8.874 13.875 9.823V12.073H17.203L16.67 15.543H13.875V23.927C19.612 23.027 24 18.062 24 12.073Z"
                      fill="#1877F2"
                    />
                    <path
                      d="M16.671 15.543L17.204 12.073H13.876V9.823C13.876 8.874 14.341 7.949 15.831 7.949H17.345V4.996C17.345 4.996 15.971 4.761 14.659 4.761C11.918 4.761 10.126 6.423 10.126 9.43V12.073H7.079V15.543H10.126V23.927C10.731 24.023 11.359 24.073 12.001 24.073C12.643 24.073 13.271 24.022 13.876 23.927V15.543H16.671Z"
                      fill="white"
                    />
                  </svg>
                </button>
                <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M17.05 20.28C16.07 21.23 15 21.08 13.97 20.63C12.88 20.17 11.88 20.15 10.73 20.63C9.29 21.23 8.53 21.04 7.67 20.28C2.83 15.25 3.56 7.53 9.06 7.17C10.57 7.25 11.6 8.04 12.44 8.13C13.71 7.87 14.89 7.05 16.3 7.21C18.08 7.41 19.33 8.34 20.02 9.9C16.35 11.95 17.23 16.83 20.5 18.1C19.94 19.05 19.26 19.97 18.25 20.99C17.93 21.43 17.51 21.87 17.05 20.28V20.28ZM12.31 7.09C12.14 5.2 13.7 3.64 15.5 3.49C15.74 5.6 13.61 7.24 12.31 7.09Z"
                      fill="#000000"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}
