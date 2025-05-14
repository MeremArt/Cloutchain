"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff, Lock, Mail, Phone } from "lucide-react";
import Image from "next/image";
import usecivicAuth from "@/app/hook/useCivicAuth";

export default function Register() {
  const router = useRouter();
  const {
    isLoading: isAuthLoading,
    isAuthenticated,
    registerWithCredentials,
    loginWithCivic,
  } = usecivicAuth();

  const [formData, setFormData] = useState({
    email: "",
    tiktokUsername: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCivicLoading, setIsCivicLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard/profile");
    }
  }, [isAuthenticated, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCivicAuth = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!agreeToTerms) {
      toast.error("Please agree to the terms and conditions first");
      return;
    }

    setIsCivicLoading(true);

    try {
      await loginWithCivic();
      // The auth hook will handle redirecting after successful login/registration
    } catch (error) {
      console.error("Civic auth error:", error);
    } finally {
      setIsCivicLoading(false);
    }
  };

  const validatePassword = () => {
    if (formData.password.length < 8) {
      return "Password must be at least 8 characters";
    }
    return null;
  };

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return "Please enter a valid email address";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Don't proceed if Civic Auth is loading
    if (isCivicLoading) return;

    // Validate form inputs
    const emailError = validateEmail();
    if (emailError) {
      toast.error(emailError);
      return;
    }

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

    try {
      const success = await registerWithCredentials(
        formData.email,
        formData.tiktokUsername,
        formData.password
      );

      if (success) {
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
      }
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

            {/* Terms and conditions - MOVED TO TOP */}
            <div className="flex items-start my-4">
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

            {/* Civic Auth Button */}
            <div className="mb-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCivicAuth}
                className="w-full bg-black text-white p-4 rounded-lg border border-gray-300 shadow-sm transition-all font-medium font-monserrat hover:bg-gray-800"
                type="button"
                disabled={isCivicLoading || isLoading || isAuthLoading}
              >
                {isCivicLoading ? "Connecting..." : "Sign up with Civic Auth"}
              </motion.button>

              {isCivicLoading && (
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
                    disabled={isLoading || isCivicLoading || isAuthLoading}
                  />
                </div>
              </div>

              {/* TikTok username field */}
              <div>
                <label className="block text-gray-700 font-montserrat font-bold mb-2">
                  TikTok Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="tiktokUsername"
                    placeholder="Enter your  Social ID"
                    value={formData.tiktokUsername}
                    onChange={handleInputChange}
                    className="w-full p-3 pl-12 border font-montserrat border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    required
                    disabled={isLoading || isCivicLoading || isAuthLoading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 font-medium font-nunito">
                  Your TikTok username (without @)
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
                    disabled={isLoading || isCivicLoading || isAuthLoading}
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer p-1"
                    disabled={isLoading || isCivicLoading || isAuthLoading}
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

              {/* Submit button */}
              <motion.button
                whileHover={
                  !isLoading && !isCivicLoading && !isAuthLoading
                    ? { scale: 1.02 }
                    : {}
                }
                whileTap={
                  !isLoading && !isCivicLoading && !isAuthLoading
                    ? { scale: 0.98 }
                    : {}
                }
                type="submit"
                className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-lg shadow-lg transition-all font-medium mt-6
                  ${
                    isLoading || isCivicLoading || isAuthLoading
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl"
                  }`}
                disabled={isLoading || isCivicLoading || isAuthLoading}
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
          </div>
        </motion.div>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}
