"use client";
import React, { useState, useEffect } from "react";
import {
  Twitter,
  TrendingUp,
  ArrowLeft,
  Search,
  Plus,
  MessageSquare,
  RefreshCw,
  Check,
  AlertTriangle,
  ChevronUp,
  Rocket,
  User,
  BarChart2,
} from "lucide-react";
import Link from "next/link";

// Tweet type definition
interface Tweet {
  id: string;
  author: string;
  authorUsername: string;
  profileImageUrl: string;
  text: string;
  createdAt: Date;
  currentLikes: number;
  currentRetweets: number;
  currentComments: number;
  currentViews: number;
  status: "pending" | "approved" | "rejected";
  submittedBy: string;
  submittedAt: Date;
}

// Twitter user type
interface TwitterUser {
  id: string;
  username: string;
  name: string;
  profileImage: string;
}

const SubmissionDashboard = () => {
  // State management
  const [urlToSubmit, setUrlToSubmit] = useState<string>("");
  const [submittedTweets, setSubmittedTweets] = useState<Tweet[]>([]);
  const [trendingTweets, setTrendingTweets] = useState<Tweet[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<
    "submitted" | "trending" | "search"
  >("submitted");
  const [twitterUser, setTwitterUser] = useState<TwitterUser | null>(null);
  const [isTwitterConnected, setIsTwitterConnected] = useState<boolean>(false);
  const [statsData, setStatsData] = useState({
    totalSubmissions: 0,
    approvedSubmissions: 0,
    pendingSubmissions: 0,
    rejectedSubmissions: 0,
    popularCategories: [
      { name: "Crypto", count: 32 },
      { name: "Tech", count: 28 },
      { name: "Politics", count: 17 },
      { name: "Entertainment", count: 14 },
      { name: "Sports", count: 11 },
    ],
  });

  // Mock the tweets data
  useEffect(() => {
    // Mock submitted tweets
    const mockSubmittedTweets: Tweet[] = [
      {
        id: "1458123456789012345",
        author: "Elon Musk",
        authorUsername: "elonmusk",
        profileImageUrl: "/placeholder/elonmusk.jpg",
        text: "Thinking of launching a satellite that can transmit memes directly to your brain...",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        currentLikes: 124500,
        currentRetweets: 28900,
        currentComments: 13200,
        currentViews: 4250000,
        status: "approved",
        submittedBy: "cryptotrader",
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      },
      {
        id: "1458987654321012345",
        author: "Vitalik Buterin",
        authorUsername: "VitalikButerin",
        profileImageUrl: "/placeholder/vitalik.jpg",
        text: "Scaling solutions aren't just about tech, but also about social coordination and economics...",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        currentLikes: 45200,
        currentRetweets: 9800,
        currentComments: 3200,
        currentViews: 1250000,
        status: "pending",
        submittedBy: "cryptotrader",
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      },
      {
        id: "1458567891234567890",
        author: "Naval",
        authorUsername: "naval",
        profileImageUrl: "/placeholder/naval.jpg",
        text: "The internet enables permissionless innovation—create without asking for permission...",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
        currentLikes: 78300,
        currentRetweets: 24100,
        currentComments: 3400,
        currentViews: 2150000,
        status: "rejected",
        submittedBy: "cryptotrader",
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 9), // 9 hours ago
      },
    ];

    setSubmittedTweets(mockSubmittedTweets);

    // Set trending tweets (different from submitted tweets)
    const mockTrendingTweets: Tweet[] = [
      {
        id: "1458111111111111111",
        author: "Sam Altman",
        authorUsername: "sama",
        profileImageUrl: "/placeholder/sama.jpg",
        text: "AI will create more jobs than it displaces. The real challenge is managing the transition period...",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1 hour ago
        currentLikes: 87600,
        currentRetweets: 15400,
        currentComments: 5200,
        currentViews: 2850000,
        status: "approved",
        submittedBy: "system",
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 1.5), // 1.5 hours ago
      },
      {
        id: "1458222222222222222",
        author: "Brian Armstrong",
        authorUsername: "brian_armstrong",
        profileImageUrl: "/placeholder/brian.jpg",
        text: "The future of finance is decentralized. We're just beginning to see what's possible with blockchain technology...",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
        currentLikes: 63200,
        currentRetweets: 12300,
        currentComments: 4100,
        currentViews: 1950000,
        status: "approved",
        submittedBy: "system",
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 3.5), // 3.5 hours ago
      },
    ];

    setTrendingTweets(mockTrendingTweets);

    // Set Twitter user (assuming connected)
    setTwitterUser({
      id: "12345",
      username: "cryptotrader",
      name: "Crypto Trader",
      profileImage: "/placeholder/user.jpg",
    });

    setIsTwitterConnected(true);

    // Update stats
    setStatsData({
      totalSubmissions: mockSubmittedTweets.length,
      approvedSubmissions: mockSubmittedTweets.filter(
        (t) => t.status === "approved"
      ).length,
      pendingSubmissions: mockSubmittedTweets.filter(
        (t) => t.status === "pending"
      ).length,
      rejectedSubmissions: mockSubmittedTweets.filter(
        (t) => t.status === "rejected"
      ).length,
      popularCategories: [
        { name: "Crypto", count: 32 },
        { name: "Tech", count: 28 },
        { name: "Politics", count: 17 },
        { name: "Entertainment", count: 14 },
        { name: "Sports", count: 11 },
      ],
    });
  }, []);

  // Connect Twitter account
  const connectTwitterAccount = async () => {
    try {
      // Simulate API call
      setIsTwitterConnected(false);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsTwitterConnected(true);
      setTwitterUser({
        id: "12345",
        username: "cryptotrader",
        name: "Crypto Trader",
        profileImage: "/placeholder/user.jpg",
      });
    } catch (error) {
      console.error("Error connecting Twitter account:", error);
    }
  };

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

      const tweetId = matches[1];

      // In a real app, you would call your API to fetch the tweet data
      // For now, we'll create a mock tweet
      const newSubmittedTweet: Tweet = {
        id: tweetId,
        author: "User Submitted",
        authorUsername: "user_submitted",
        profileImageUrl: "/placeholder/avatar.jpg",
        text: "This is a user submitted tweet for prediction markets...",
        createdAt: new Date(),
        currentLikes: 5200,
        currentRetweets: 1200,
        currentComments: 800,
        currentViews: 42000,
        status: "pending",
        submittedBy: twitterUser?.username || "unknown",
        submittedAt: new Date(),
      };

      setSubmittedTweets((prev) => [newSubmittedTweet, ...prev]);
      setUrlToSubmit("");
      setSubmitSuccess(true);

      // Update stats
      setStatsData((prev) => ({
        ...prev,
        totalSubmissions: prev.totalSubmissions + 1,
        pendingSubmissions: prev.pendingSubmissions + 1,
      }));
    } catch (error) {
      console.error("Error submitting tweet:", error);
      setSubmitError("Failed to submit tweet. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    // Simulate search API call
    // In a real app, this would search the Twitter API
    setCurrentTab("search");
  };

  // Render user header
  const renderUserHeader = () => (
    <div className="flex justify-between items-center mb-6 bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to App</span>
        </Link>
      </div>

      {isTwitterConnected && twitterUser ? (
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-white text-sm">{twitterUser.name}</p>
            <p className="text-gray-400 text-xs">@{twitterUser.username}</p>
          </div>
          <div className="bg-blue-500 h-8 w-8 rounded-full overflow-hidden">
            <img
              src={twitterUser.profileImage}
              alt={twitterUser.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      ) : (
        <button
          onClick={connectTwitterAccount}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1.5 rounded-lg flex items-center gap-2"
        >
          <Twitter className="w-4 h-4" />
          <span>Connect Twitter</span>
        </button>
      )}
    </div>
  );

  // Render submission form
  const renderSubmissionForm = () => (
    <div className="mb-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-green-400" />
          Submit Tweet for Prediction Market
        </h2>

        <p className="text-gray-300 mb-6">
          Found an interesting tweet that might go viral or flop? Submit it to
          TrendStake and let users bet on its performance!
        </p>

        <div className="mb-6">
          <label className="block text-gray-300 text-sm mb-2">Tweet URL</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="https://twitter.com/username/status/123456789"
              value={urlToSubmit}
              onChange={(e) => setUrlToSubmit(e.target.value)}
              disabled={isSubmitting || !isTwitterConnected}
              className="flex-1 bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={handleSubmitTweet}
              disabled={!urlToSubmit || isSubmitting || !isTwitterConnected}
              className={`px-4 py-2 rounded-lg font-medium min-w-24 ${
                !urlToSubmit || isSubmitting || !isTwitterConnected
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </span>
              ) : (
                <span>Submit</span>
              )}
            </button>
          </div>

          {!isTwitterConnected && (
            <p className="mt-2 text-yellow-500 text-sm flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              <span>Connect your Twitter account to submit tweets</span>
            </p>
          )}

          {submitError && (
            <p className="mt-2 text-red-500 text-sm flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              <span>{submitError}</span>
            </p>
          )}

          {submitSuccess && (
            <p className="mt-2 text-green-500 text-sm flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>
                Tweet submitted successfully! It will be reviewed shortly.
              </span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-700 p-4 rounded-lg flex items-center">
            <div className="w-10 h-10 rounded-full bg-green-500 bg-opacity-20 flex items-center justify-center mr-3">
              <Rocket className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Find Potential</p>
              <p className="text-gray-400 text-xs">
                Spot tweets before they go viral
              </p>
            </div>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-500 bg-opacity-20 flex items-center justify-center mr-3">
              <BarChart2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Create Markets</p>
              <p className="text-gray-400 text-xs">
                Enable predictions on any tweet
              </p>
            </div>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg flex items-center">
            <div className="w-10 h-10 rounded-full bg-purple-500 bg-opacity-20 flex items-center justify-center mr-3">
              <ChevronUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Earn Rewards</p>
              <p className="text-gray-400 text-xs">
                Get bonuses for popular submissions
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-white font-medium mb-3">Submission Guidelines</h3>
          <ul className="text-gray-300 text-sm space-y-2">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span>Tweet must be public and less than 48 hours old</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span>
                Content should be interesting and have potential for engagement
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span>No offensive, illegal, or harmful content</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span>Submissions are reviewed for quality and relevance</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Render tabs navigation
  const renderTabsNav = () => (
    <div className="mb-4 border-b border-gray-700">
      <div className="flex space-x-8">
        <button
          className={`py-3 px-1 relative ${
            currentTab === "submitted"
              ? "text-blue-400 font-medium"
              : "text-gray-400 hover:text-gray-300"
          }`}
          onClick={() => setCurrentTab("submitted")}
        >
          Your Submissions
          {currentTab === "submitted" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"></span>
          )}
        </button>

        <button
          className={`py-3 px-1 relative ${
            currentTab === "trending"
              ? "text-blue-400 font-medium"
              : "text-gray-400 hover:text-gray-300"
          }`}
          onClick={() => setCurrentTab("trending")}
        >
          Trending Tweets
          {currentTab === "trending" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"></span>
          )}
        </button>

        {currentTab === "search" && (
          <button className="py-3 px-1 relative text-blue-400 font-medium">
            Search Results
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"></span>
          </button>
        )}
      </div>
    </div>
  );

  // Render tweet list
  const renderTweetList = (tweets: Tweet[]) => (
    <div className="space-y-4">
      {tweets.length === 0 ? (
        <div className="bg-gray-800 p-6 rounded-lg text-center">
          <p className="text-gray-400">No tweets found</p>
        </div>
      ) : (
        tweets.map((tweet) => (
          <div
            key={tweet.id}
            className="bg-gray-800 p-4 rounded-lg border border-gray-700"
          >
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                  <img
                    src={tweet.profileImageUrl}
                    alt={tweet.author}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/placeholder/avatar.jpg";
                    }}
                  />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <div className="text-white font-medium truncate">
                    {tweet.author}
                  </div>
                  <div className="text-gray-500 text-sm">
                    @{tweet.authorUsername}
                  </div>
                </div>

                <p className="text-gray-300 mt-1 line-clamp-2">{tweet.text}</p>

                <div className="flex gap-4 mt-2 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <span>❤️</span>
                    <span>{tweet.currentLikes.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🔄</span>
                    <span>{tweet.currentRetweets.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>💬</span>
                    <span>{tweet.currentComments.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>👁️</span>
                    <span>{tweet.currentViews.toLocaleString()}</span>
                  </div>
                </div>

                {currentTab === "submitted" && (
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700">
                    <div className="text-xs text-gray-400">
                      Submitted{" "}
                      {new Date(tweet.submittedAt).toLocaleDateString()}
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs ${
                        tweet.status === "approved"
                          ? "bg-green-500 bg-opacity-20 text-green-400"
                          : tweet.status === "pending"
                          ? "bg-yellow-500 bg-opacity-20 text-yellow-400"
                          : "bg-red-500 bg-opacity-20 text-red-400"
                      }`}
                    >
                      {tweet.status.charAt(0).toUpperCase() +
                        tweet.status.slice(1)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  // Render submissions stats
  const renderSubmissionStats = () => (
    <div className="mb-6 bg-gray-800 rounded-lg p-4">
      <h3 className="text-white font-medium mb-3">Your Submission Stats</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-gray-700 p-3 rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Total Submissions</div>
          <div className="text-lg font-medium text-white">
            {statsData.totalSubmissions}
          </div>
        </div>

        <div className="bg-gray-700 p-3 rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Approved</div>
          <div className="text-lg font-medium text-green-400">
            {statsData.approvedSubmissions}
          </div>
        </div>

        <div className="bg-gray-700 p-3 rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Pending</div>
          <div className="text-lg font-medium text-yellow-400">
            {statsData.pendingSubmissions}
          </div>
        </div>

        <div className="bg-gray-700 p-3 rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Rejected</div>
          <div className="text-lg font-medium text-red-400">
            {statsData.rejectedSubmissions}
          </div>
        </div>
      </div>

      <div>
        <div className="text-sm text-gray-300 mb-2">Popular Categories</div>
        <div className="flex flex-wrap gap-2">
          {statsData.popularCategories.map((category) => (
            <div
              key={category.name}
              className="bg-gray-700 px-2 py-1 rounded-full text-xs text-white"
            >
              {category.name} ({category.count})
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render search bar
  const renderSearchBar = () => (
    <div className="mb-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search Twitter for potential prediction tweets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>

        <button
          type="submit"
          disabled={!searchQuery.trim()}
          className={`px-4 py-2 rounded-lg font-medium ${
            !searchQuery.trim()
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          Search
        </button>
      </form>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-900 min-h-screen">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold flex items-center gap-2 text-white">
            <Twitter className="w-6 h-6 text-blue-400" />
            <span>TrendStake</span>
            <span className="text-gray-400 font-normal">
              {" "}
              / Tweet Submission
            </span>
          </h1>
        </div>

        {renderUserHeader()}
        {renderSubmissionForm()}
        {isTwitterConnected && renderSubmissionStats()}
        {renderSearchBar()}
        {renderTabsNav()}

        {currentTab === "submitted" && renderTweetList(submittedTweets)}
        {currentTab === "trending" && renderTweetList(trendingTweets)}
        {currentTab === "search" && renderTweetList([])}
      </div>
    </div>
  );
};

export default SubmissionDashboard;
