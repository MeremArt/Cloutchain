"use client";
import React, { useState } from "react";
import {
  Twitter,
  RefreshCw,
  Check,
  AlertTriangle,
  Shield,
  Info,
  Sparkles,
  Rocket,
  BarChart2,
  Clock,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Zap,
} from "lucide-react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Link from "next/link";

// Stake config
const MINIMUM_STAKE = 0.5; // SOL
const RECOMMENDED_STAKE = 1.0; // SOL

const TweetSubmissionDashboard = () => {
  // State management
  const [urlToSubmit, setUrlToSubmit] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState<number>(RECOMMENDED_STAKE);
  const [userBalance, setUserBalance] = useState<number>(7.5); // Mock SOL balance
  const [showStakeInfo, setShowStakeInfo] = useState<boolean>(false);
  const [showTermsDetails, setShowTermsDetails] = useState<boolean>(false);
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [recentlyApproved, setRecentlyApproved] = useState([
    {
      id: "1234567890",
      author: "Naval",
      username: "naval",
      description: "Meditation is a skill that compounds over time.",
    },
    {
      id: "2345678901",
      author: "Vitalik Buterin",
      username: "VitalikButerin",
      description:
        "Layer 2 solutions are increasingly becoming the focus of Ethereum scaling.",
    },
  ]);

  // Handle URL submission
  const handleSubmitTweet = async () => {
    if (!urlToSubmit) return;

    // Basic validation for Twitter URL
    if (
      !urlToSubmit.includes("twitter.com") &&
      !urlToSubmit.includes("x.com")
    ) {
      setSubmitError("Please enter a valid Twitter/X URL");
      return;
    }

    // Check if user has agreed to terms
    if (!agreedToTerms) {
      setSubmitError("You must agree to the terms and conditions");
      return;
    }

    // Check if user has enough balance
    if (userBalance < stakeAmount) {
      setSubmitError("Insufficient SOL balance for staking");
      return;
    }

    // Extract tweet ID
    const matches = urlToSubmit.match(/status\/(\d+)/);
    if (!matches || !matches[1]) {
      setSubmitError("Could not extract tweet ID from URL");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitSuccess(null);
      setSubmitError(null);

      // Simulate API call to process the tweet
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Update user balance (subtract stake)
      setUserBalance((prev) => prev - stakeAmount);

      setUrlToSubmit("");
      setSubmitSuccess(true);
    } catch (error) {
      console.error("Error submitting tweet:", error);
      setSubmitError("Failed to submit tweet. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main submission form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-4 px-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  <span>Submit a Tweet for Prediction Market</span>
                </h2>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Tweet URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Twitter className="w-5 h-5 text-gray-500" />
                    </div>
                    <input
                      type="text"
                      placeholder="https://twitter.com/username/status/123456789"
                      value={urlToSubmit}
                      onChange={(e) => setUrlToSubmit(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-gray-300 text-sm font-medium">
                      Required Stake (SOL)
                    </label>
                    <button
                      onClick={() => setShowStakeInfo(!showStakeInfo)}
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1.5 text-sm"
                    >
                      <Info className="w-4 h-4" />
                      <span>{showStakeInfo ? "Hide info" : "Why stake?"}</span>
                    </button>
                  </div>

                  {showStakeInfo && (
                    <div className="bg-blue-900 bg-opacity-30 border border-blue-700 p-4 rounded-lg mb-4 text-sm text-blue-100">
                      <p className="mb-3 flex items-start gap-2">
                        <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-white">
                            Why is staking required?
                          </strong>
                          <br />
                          Staking helps ensure high-quality submissions and
                          prevents spam or manipulation. Your stake will be
                          returned after the prediction period ends if no
                          manipulation is detected.
                        </span>
                      </p>
                      <p className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-white">
                            When are stakes slashed?
                          </strong>
                          <br />
                          If manipulation is proven on your submitted tweet
                          (artificial engagement, bot activity, etc.), your
                          stake may be partially or fully slashed.
                        </span>
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <button
                      onClick={() => setStakeAmount(MINIMUM_STAKE)}
                      className={`py-3 px-3 rounded-lg text-sm font-medium transition duration-200 ${
                        stakeAmount === MINIMUM_STAKE
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      <div className="text-center">
                        <div className="mb-1 text-lg">{MINIMUM_STAKE} SOL</div>
                        <div className="text-xs opacity-80">Minimum</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setStakeAmount(RECOMMENDED_STAKE)}
                      className={`py-3 px-3 rounded-lg text-sm font-medium relative transition duration-200 ${
                        stakeAmount === RECOMMENDED_STAKE
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {stakeAmount !== RECOMMENDED_STAKE && (
                        <div className="absolute -top-2.5 left-0 right-0 flex justify-center">
                          <div className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                            Recommended
                          </div>
                        </div>
                      )}
                      <div className="text-center">
                        <div className="mb-1 text-lg">
                          {RECOMMENDED_STAKE} SOL
                        </div>
                        <div className="text-xs opacity-80">Standard</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setStakeAmount(2)}
                      className={`py-3 px-3 rounded-lg text-sm font-medium transition duration-200 ${
                        stakeAmount === 2
                          ? "bg-gradient-to-r from-indigo-600 to-purple-700 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      <div className="text-center">
                        <div className="mb-1 text-lg">2 SOL</div>
                        <div className="text-xs opacity-80">Premium</div>
                      </div>
                    </button>
                  </div>

                  <div className="flex justify-between items-center px-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-gray-300">
                        Lock period: 72 hours
                      </span>
                    </div>
                    <span className="text-sm text-gray-400">
                      Balance after stake:{" "}
                      <span
                        className={
                          userBalance - stakeAmount < 1
                            ? "text-red-400"
                            : "text-white"
                        }
                      >
                        {(userBalance - stakeAmount).toFixed(2)} SOL
                      </span>
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="bg-gray-700 rounded-lg border border-gray-600 overflow-hidden">
                    <div
                      className="p-4 flex justify-between items-center cursor-pointer"
                      onClick={() => setShowTermsDetails(!showTermsDetails)}
                    >
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-amber-400" />
                        <span className="font-medium text-white">
                          Stake Protection Terms
                        </span>
                      </div>
                      <button>
                        {showTermsDetails ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>

                    {showTermsDetails && (
                      <div className="px-4 pb-4 border-t border-gray-600 pt-3">
                        <p className="text-gray-300 text-sm mb-3">
                          By agreeing to these terms, you acknowledge that your
                          staked SOL may be subject to slashing under certain
                          conditions. Please read carefully:
                        </p>
                        <ul className="text-gray-300 text-sm space-y-2 mb-4">
                          <li className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                            <span>
                              Your stake will be slashed if you artificially
                              boost engagement metrics
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                            <span>
                              Submitting tweets you have control over is
                              considered manipulation
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                            <span>
                              Using bots or paid services to influence metrics
                              will result in slashing
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                            <span>
                              Disputed cases are reviewed by our decentralized
                              governance committee
                            </span>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-start">
                    <div className="flex items-center h-5 mt-0.5">
                      <input
                        id="terms"
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="h-4 w-4 text-blue-500 rounded focus:ring-blue-400 bg-gray-600 border-gray-500"
                      />
                    </div>
                    <label
                      htmlFor="terms"
                      className="ml-2 text-sm text-gray-300"
                    >
                      I understand and agree to the stake protection terms. I
                      confirm that I am not involved in any manipulation of this
                      tweet&apos;s engagement metrics.
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleSubmitTweet}
                  disabled={
                    !urlToSubmit ||
                    isSubmitting ||
                    !agreedToTerms ||
                    userBalance < stakeAmount
                  }
                  className={`w-full py-3 px-4 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition duration-200 ${
                    !urlToSubmit ||
                    isSubmitting ||
                    !agreedToTerms ||
                    userBalance < stakeAmount
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Processing Submission...</span>
                    </>
                  ) : (
                    <>
                      <Rocket className="w-5 h-5" />
                      <span>Submit Tweet & Stake {stakeAmount} SOL</span>
                    </>
                  )}
                </button>

                {submitError && (
                  <div className="mt-4 p-4 bg-red-500 bg-opacity-20 border border-red-500 text-red-300 rounded-lg flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}

                {submitSuccess && (
                  <div className="mt-4 p-4 bg-green-500 bg-opacity-20 border border-green-500 text-green-300 rounded-lg flex items-start gap-2">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-200 mb-1">
                        Tweet submitted successfully!
                      </p>
                      <p>
                        Your stake of {stakeAmount} SOL has been locked. It will
                        be returned when the prediction period ends if no
                        manipulation is detected.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar with stats and info */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-4 px-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <BarChart2 className="w-5 h-5" />
                  <span>Submission Stats</span>
                </h2>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">
                      Total Submitted
                    </div>
                    <div className="text-2xl font-bold text-white">24</div>
                  </div>

                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">
                      Approval Rate
                    </div>
                    <div className="text-2xl font-bold text-green-400">92%</div>
                  </div>

                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">
                      Currently Staked
                    </div>
                    <div className="text-2xl font-bold text-blue-400">
                      5.5 SOL
                    </div>
                  </div>

                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">
                      Rewards Earned
                    </div>
                    <div className="text-2xl font-bold text-purple-400">
                      1.2 SOL
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span>Top Performing Submissions</span>
                  </h3>

                  <div className="space-y-3">
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-blue-400 font-medium">
                          @elonmusk
                        </span>
                        <span className="text-green-400 text-sm">+230%</span>
                      </div>
                      <p className="text-gray-300 text-sm line-clamp-2">
                        Just landed on Mars. The view is breathtaking.
                      </p>
                    </div>

                    <div className="bg-gray-700 p-3 rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-blue-400 font-medium">
                          @VitalikButerin
                        </span>
                        <span className="text-green-400 text-sm">+175%</span>
                      </div>
                      <p className="text-gray-300 text-sm line-clamp-2">
                        Eth 2.0 is now officially Ethereum&apos;s future.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-teal-600 py-4 px-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span>Recently Approved</span>
                </h2>
              </div>

              <div className="p-6 space-y-4">
                {recentlyApproved.map((tweet) => (
                  <div
                    key={tweet.id}
                    className="border-b border-gray-700 pb-3 last:border-none last:pb-0"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-white font-medium">
                        {tweet.author}
                      </span>
                      <span className="text-gray-400 text-xs">
                        @{tweet.username}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">{tweet.description}</p>
                    <div className="mt-2 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs text-gray-400">
                        Ready for predictions
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TweetSubmissionDashboard;
