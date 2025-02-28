"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import { API_ENDPOINTS } from "../../config/api";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff, Lock, Mail, Phone } from "lucide-react";
import Image from "next/image";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    tiktokUsername: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validatePassword = () => {
    if (formData.password.length < 8) {
      return "Password must be at least 8 characters";
    }
    // if (formData.password !== formData.confirmPassword) {
    //   return "Passwords do not match";
    // }
    return null;
  };

  // const validatePhoneNumber = () => {
  //   const phoneRegex = /^\+?[0-9]{10,15}$/;
  //   if (!phoneRegex.test(formData.tiktokUsername)) {
  //     return "Please enter a valid phone number";
  //   }
  //   return null;
  // };

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return "Please enter a valid email address";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form inputs
    const emailError = validateEmail();
    if (emailError) {
      toast.error(emailError);
      return;
    }

    // const phoneError = validatePhoneNumber();
    // if (phoneError) {
    //   toast.error(phoneError);
    //   return;
    // }

    const passwordError = validatePassword();
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (!agreeToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    setIsLoading(true);
    // Show loading toast
    const loadingToast = toast.loading("Creating your account...");

    // let twitterIdToSend: string | null = formData.twitterId;
    // if (!twitterIdToSend || twitterIdToSend.trim() === "") {
    //   // Option 1: Send null instead of empty string
    //   twitterIdToSend = null;
    // }

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.SIGNUP, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          tiktokUsername: formData.tiktokUsername,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      const responseData = await response.json();

      // Store the JWT token
      localStorage.setItem("jwt", responseData.token);

      // Store user data
      localStorage.setItem(
        "userData",
        JSON.stringify({
          id: responseData.user.id,
          email: responseData.user.email,
          phoneNumber: responseData.user.phoneNumber,
          walletAddress: responseData.user.walletAddress,
          twitterId: responseData.user.twitterId,
        })
      );

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success("Account created successfully!", {
        duration: 3000,
        style: {
          background: "#333",
          color: "#fff",
        },
      });
      router.push("/dashboard");
      setFormData({
        email: "",
        tiktokUsername: "",
        password: "",
      });
      setAgreeToTerms(false);

      // Small delay for better UX
      setTimeout(() => {
        router.push("/dashboard/profile");
      }, 1000);
    } catch (error) {
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast);

      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        toast.error(
          "Unable to connect to server. Please check your connection.",
          {
            duration: 4000,
            style: {
              background: "#333",
              color: "#fff",
            },
          }
        );
      } else {
        toast.error(
          error instanceof Error ? error.message : "Registration failed",
          {
            duration: 4000,
            style: {
              background: "#333",
              color: "#fff",
            },
          }
        );
      }

      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = () => {
    const password = formData.password;
    if (!password) return 0;

    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    return score;
  };

  const renderPasswordStrength = () => {
    const strength = passwordStrength();
    const strengthLabels = ["Weak", "Fair", "Good", "Strong", "Very Strong"];
    const strengthColors = [
      "bg-red-500",
      "bg-orange-500",
      "bg-yellow-500",
      "bg-green-400",
      "bg-green-600",
    ];

    return (
      <div className="mt-2">
        <div className="flex gap-1 h-1 mb-1">
          {[0, 1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className={`h-full flex-1 rounded-full ${
                index < strength ? strengthColors[strength - 1] : "bg-gray-200"
              }`}
            ></div>
          ))}
        </div>
        {formData.password && (
          <p
            className={`text-xs ${
              strength <= 1
                ? "text-red-500"
                : strength === 2
                ? "text-orange-500"
                : strength === 3
                ? "text-yellow-600"
                : "text-green-600"
            }`}
          >
            {strengthLabels[strength - 1] || ""}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex items-center justify-center min-h-screen relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute w-[440px] h-[440px] bg-[#87daba] rounded-full blur-[150px] top-[0%] left-[90%] opacity-[50%] md:block hidden" />
      <div className="absolute w-[225px] h-[225px] bg-[#5fcddc] rounded-full blur-[100px] top-[5%] bottom-[0%] left-[5%] opacity-[0.3]" />
      <div className="absolute w-[225px] h-[225px] bg-[#F24FFF] rounded-full blur-[100px] top-[5%] right-[0%] bottom-[20%] left-[0.5%] opacity-[0.5]" />
      <div className="absolute w-[225px] h-[225px] bg-[#87DABA] rounded-full blur-[100px] top-[5%] right-[0%] bottom-[20%] left-[5%] opacity-[0.2]" />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row bg-white rounded-xl shadow-lg overflow-hidden max-w-5xl mx-auto"
        >
          {/* Left side - Image and information */}
          <div className="lg:w-1/2 relative bg-gradient-to-br from-indigo-600 to-purple-700 hidden lg:block">
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="text-center">
                <Image
                  src="https://res.cloudinary.com/dtfvdjvyr/image/upload/v1740060892/Group_7_xmjgul.png"
                  alt="Registration illustration"
                  className="mx-auto mb-8 rounded-lg shadow-lg"
                  width={250}
                  height={250}
                />
                <h2 className="text-3xl font-orbitron font-bold text-white mb-4">
                  Join our community
                </h2>
                <p className="text-white/90 text-lg font-orbitron">
                  Create an account to get started with our platform
                </p>
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 text-white/70 text-center text-sm">
              100% secure. Your data is protected and never shared.
            </div>
          </div>

          {/* Right side - Registration form */}
          <div className="lg:w-1/2 p-8 lg:p-10">
            <div className="mb-6 text-center lg:text-left">
              <h1 className="text-3xl font-bold text-gray-800 mb-2 font-orbitron">
                Create Account
              </h1>
              <p className="text-gray-600">
                Fill in your details to get started
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email field */}
              <div>
                <label className="block text-gray-700 font-montserrat font-bold mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 pl-12 border text-black font-montserrat border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Phone number field */}
              <div>
                <label className="block text-gray-700 font-montserrat font-bold mb-2">
                  Tiktok Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="tiktokUsername"
                    placeholder="Enter your TikTok username"
                    value={formData.tiktokUsername}
                    onChange={handleInputChange}
                    className="w-full p-3 pl-12 border font-montserrat border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    required
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 font-medium font-nunito">
                  Format: 1234567890
                </p>
              </div>

              {/* Password field */}
              <div>
                <label className="block text-gray-700 font-montserrat font-bold mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full p-3 pl-12 pr-12 border font-montserrat text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    required
                    disabled={isLoading}
                    minLength={8}
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
                {renderPasswordStrength()}
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters
                </p>
              </div>

              {/* Terms and conditions */}
              <div className="flex items-start mt-4">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={() => setAgreeToTerms(!agreeToTerms)}
                    className="h-4 w-4 text-indigo-600 font-nunito focus:ring-indigo-500 border-gray-300 rounded"
                    required
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="terms"
                    className="text-gray-600 font-montserrat font-bold"
                  >
                    I agree to the{" "}
                    <Link
                      href=""
                      className="text-indigo-600 hover:text-indigo-800 font-montserrat font-bold"
                    >
                      Terms and Conditions
                    </Link>{" "}
                    and{" "}
                    <Link
                      href=""
                      className="text-indigo-600 font-montserrat hover:text-indigo-800"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>

              {/* Submit button */}
              <motion.button
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
                type="submit"
                className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-lg shadow-lg transition-all font-medium mt-6
                  ${
                    isLoading
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl"
                  }`}
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Sign Up"}
              </motion.button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600 font-montserrat font-bold">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Log In
                </Link>
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-gray-500 text-sm mb-4">
                Or sign up with
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
