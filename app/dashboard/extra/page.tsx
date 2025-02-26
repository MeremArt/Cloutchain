"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Metaplex } from "@metaplex-foundation/js";
import { BN, Program, web3, AnchorProvider } from "@project-serum/anchor";
import {
  Twitter,
  TrendingUp,
  Timer,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Award,
  AlertTriangle,
  ShareIcon,
  Plus,
  Search,
  Home,
  Activity,
  MessageSquare,
  User,
} from "lucide-react";
// import { IDL } from "./trendstake_idl";
// import { PROGRAM_ID } from "./constants";
// import Link from "next/link";

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
  likeThreshold: number;
  retweetThreshold: number;
  commentThreshold: number;
  viewThreshold: number;
  timeRemaining: number; // In seconds
}

// Prediction type
interface Prediction {
  tweetId: string;
  metricType: "Likes" | "Retweets" | "Comments" | "Views";
  direction: "above" | "below";
  amount: number;
  threshold: number;
  expiryTimestamp: number;
}

// NFT type
interface PredictionNFT {
  mint: string;
  name: string;
  image: string;
  attributes: {
    tweet: string;
    prediction: string;
    status: "Pending" | "Won" | "Lost";
  };
}

// User type
interface TwitterUser {
  id: string;
  username: string;
  name: string;
  profileImage: string;
}

const SECONDS_PER_HOUR = 3600;
const SOL_DECIMALS = 1000000000;

const TrendStakeApp = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, signTransaction } = wallet;

  // Assume user is already connected to wallet (no UI for connecting)
  const connected = true;

  // State management
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [selectedTweet, setSelectedTweet] = useState<Tweet | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<
    "Likes" | "Retweets" | "Comments" | "Views"
  >("Likes");
  const [prediction, setPrediction] = useState<"above" | "below" | null>(null);
  const [wagerAmount, setWagerAmount] = useState<number>(0.1);
  const [timeframe, setTimeframe] = useState<number>(24); // hours
  const [txStatus, setTxStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [userNfts, setUserNfts] = useState<PredictionNFT[]>([]);
  const [poolLiquidity, setPoolLiquidity] = useState<number>(0);
  const [userBalance, setUserBalance] = useState<number>(5.7);
  const [userPredictions, setUserPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<
    "trending" | "my-bets" | "submit" | "profile"
  >("trending");
  const [twitterUser, setTwitterUser] = useState<TwitterUser | null>(null);
  const [isTwitterConnected, setIsTwitterConnected] = useState<boolean>(false);
  const [urlToSubmit, setUrlToSubmit] = useState<string>("");
  const [submittedTweets, setSubmittedTweets] = useState<Tweet[]>([]);

  // Program setup
  const getProvider = useCallback(() => {
    if (!publicKey || !signTransaction) return null;
    return new AnchorProvider(
      connection,
      {
        publicKey,
        signTransaction,
      } as never,
      { commitment: "confirmed" }
    );
  }, [connection, publicKey, signTransaction]);

  const getProgram = useCallback(() => {
    const provider = getProvider();
    if (!provider) return null;
    // return new Program(provider);
  }, [getProvider]);

  // Fetch trending tweets
  useEffect(() => {
    const fetchTrendingTweets = async () => {
      try {
        setIsLoading(true);
        // In a real app, this would call your backend API that uses Twitter API
        const response = await fetch("/api/trending-tweets");
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const data = await response.json();

        // For demo purposes, let's simulate data
        const mockTweets: Tweet[] = [
          {
            id: "1458123456789012345",
            author: "Elon Musk",
            authorUsername: "elonmusk",
            profileImageUrl: "/placeholder/elonmusk.jpg",
            text: "Thinking of launching a satellite that can transmit memes directly to your brain...",
            createdAt: new Date(),
            currentLikes: 124500,
            currentRetweets: 28900,
            currentComments: 13200,
            currentViews: 4250000,
            likeThreshold: 150000,
            retweetThreshold: 35000,
            commentThreshold: 15000,
            viewThreshold: 5000000,
            timeRemaining: 24 * SECONDS_PER_HOUR,
          },
          {
            id: "1458987654321012345",
            author: "Vitalik Buterin",
            authorUsername: "VitalikButerin",
            profileImageUrl: "/placeholder/vitalik.jpg",
            text: "Scaling solutions aren't just about tech, but also about social coordination and economics...",
            createdAt: new Date(),
            currentLikes: 45200,
            currentRetweets: 9800,
            currentComments: 3200,
            currentViews: 1250000,
            likeThreshold: 60000,
            retweetThreshold: 12000,
            commentThreshold: 5000,
            viewThreshold: 2000000,
            timeRemaining: 24 * SECONDS_PER_HOUR,
          },
          {
            id: "1458567891234567890",
            author: "Naval",
            authorUsername: "naval",
            profileImageUrl: "/placeholder/naval.jpg",
            text: "The internet enables permissionless innovation—create without asking for permission...",
            createdAt: new Date(),
            currentLikes: 78300,
            currentRetweets: 24100,
            currentComments: 3400,
            currentViews: 2150000,
            likeThreshold: 100000,
            retweetThreshold: 30000,
            commentThreshold: 5000,
            viewThreshold: 3000000,
            timeRemaining: 24 * SECONDS_PER_HOUR,
          },
        ];

        setTweets(mockTweets);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching trending tweets:", error);
        setIsLoading(false);
      }
    };

    fetchTrendingTweets();
  }, []);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!publicKey) return;

      try {
        // Get SOL balance (already set to a fixed value)

        // Mock Twitter connected user
        if (isTwitterConnected) {
          setTwitterUser({
            id: "12345",
            username: "cryptotrader",
            name: "Crypto Trader",
            profileImage: "/placeholder/user.jpg",
          });
        }

        // Fetch user NFTs using Metaplex
        const metaplex = Metaplex.make(connection);
        const nfts = await metaplex.nfts().findAllByOwner({ owner: publicKey });

        // Filter to only include TrendStake NFTs
        const predictionNfts = nfts
          .filter((nft) => nft.name?.startsWith("TrendStake"))
          .map((nft) => ({
            mint: nft.address.toString(),
            name: nft.name || "Unknown Prediction",
            image: nft.json?.image || "/placeholder/nft.jpg",
            attributes: {
              tweet:
                nft.json?.attributes?.find(
                  (a: { trait_type?: string }) => a.trait_type === "Tweet"
                )?.value || "Unknown Tweet",
              prediction:
                nft.json?.attributes?.find(
                  (a: { trait_type?: string }) => a.trait_type === "Prediction"
                )?.value || "Unknown",
              status:
                (nft.json?.attributes?.find(
                  (a: { trait_type?: string }) => a.trait_type === "Status"
                )?.value as "Pending" | "Won" | "Lost") || "Pending",
            },
          }));

        setUserNfts(predictionNfts);

        // Mock User Predictions
        const mockPredictions: Prediction[] = [
          {
            tweetId: "1458123456789012345",
            metricType: "Likes",
            direction: "above",
            amount: 0.5,
            threshold: 150000,
            expiryTimestamp:
              Math.floor(Date.now() / 1000) + 12 * SECONDS_PER_HOUR,
          },
          {
            tweetId: "1458987654321012345",
            metricType: "Retweets",
            direction: "below",
            amount: 0.2,
            threshold: 12000,
            expiryTimestamp:
              Math.floor(Date.now() / 1000) + 2 * SECONDS_PER_HOUR,
          },
        ];

        setUserPredictions(mockPredictions);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [connection, publicKey, isTwitterConnected]);

  // Handle tweet selection
  const handleSelectTweet = (tweet: Tweet) => {
    setSelectedTweet(tweet);
    setPrediction(null); // Reset prediction when tweet changes
  };

  // Handle metric selection
  const handleSelectMetric = (
    metric: "Likes" | "Retweets" | "Comments" | "Views"
  ) => {
    setSelectedMetric(metric);
    setPrediction(null); // Reset prediction when metric changes
  };

  // Handle timeframe selection
  const handleSelectTimeframe = (hours: number) => {
    setTimeframe(hours);
  };

  // Calculate current metrics
  const getCurrentMetricValue = (tweet: Tweet | null, metric: string) => {
    if (!tweet) return 0;

    switch (metric) {
      case "Likes":
        return tweet.currentLikes;
      case "Retweets":
        return tweet.currentRetweets;
      case "Comments":
        return tweet.currentComments;
      case "Views":
        return tweet.currentViews;
      default:
        return 0;
    }
  };

  // Calculate threshold value
  const getThresholdValue = (tweet: Tweet | null, metric: string) => {
    if (!tweet) return 0;

    switch (metric) {
      case "Likes":
        return tweet.likeThreshold;
      case "Retweets":
        return tweet.retweetThreshold;
      case "Comments":
        return tweet.commentThreshold;
      case "Views":
        return tweet.viewThreshold;
      default:
        return 0;
    }
  };

  // Calculate dynamic odds
  const calculateOdds = (tweet: Tweet | null, metric: string) => {
    if (!tweet) return { above: 50, below: 50 };

    const currentValue = getCurrentMetricValue(tweet, metric);
    const threshold = getThresholdValue(tweet, metric);

    // This is a simplified odds calculation - real implementation would be more complex
    const percentToThreshold = (currentValue / threshold) * 100;

    if (percentToThreshold > 90) {
      return { above: 80, below: 20 };
    } else if (percentToThreshold > 70) {
      return { above: 65, below: 35 };
    } else if (percentToThreshold > 50) {
      return { above: 55, below: 45 };
    } else if (percentToThreshold > 30) {
      return { above: 40, below: 60 };
    } else {
      return { above: 25, below: 75 };
    }
  };

  // Handle placing a bet
  const handlePlaceBet = async () => {
    if (!publicKey || !selectedTweet || !prediction || wagerAmount <= 0) {
      return;
    }

    try {
      setTxStatus("processing");

      // Skip the Twitter connection check if already connected
      if (!isTwitterConnected) {
        setTxStatus("error");
        alert("Please connect your Twitter account first");
        setTimeout(() => setTxStatus("idle"), 3000);
        return;
      }

      const program = getProgram();
      if (!program) {
        throw new Error("Program not initialized");
      }

      // Current time plus timeframe in seconds
      const expiryTimestamp =
        Math.floor(Date.now() / 1000) + timeframe * SECONDS_PER_HOUR;

      // Calculate seeds for PDA
      const [predictionPDA] = await web3.PublicKey.findProgramAddress(
        [Buffer.from("prediction"), Buffer.from(selectedTweet.id)],
        program.programId
      );

      // Check if prediction already exists
      let predictionExists = false;
      try {
        await program.account.prediction.fetch(predictionPDA);
        predictionExists = true;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        // Prediction doesn't exist yet
      }

      // If prediction doesn't exist, initialize it first
      if (!predictionExists) {
        // Convert metric type to enum value
        const metricTypeValue = [
          "Likes",
          "Retweets",
          "Comments",
          "Views",
        ].indexOf(selectedMetric);

        await program.methods
          .initializePrediction(
            selectedTweet.id,
            metricTypeValue,
            new BN(getThresholdValue(selectedTweet, selectedMetric)),
            new BN(expiryTimestamp),
            new BN(0.01 * SOL_DECIMALS), // Minimum bet amount = 0.01 SOL
            5 // Fee percentage = 5%
          )
          .accounts({
            admin: publicKey,
            prediction: predictionPDA,
            // Other accounts would be defined here based on your context struct
          })
          .rpc();
      }

      // Calculate seeds for bet account PDA
      const [betAccountPDA] = await web3.PublicKey.findProgramAddress(
        [Buffer.from("bet"), predictionPDA.toBuffer(), publicKey.toBuffer()],
        program.programId
      );

      // Create NFT using Metaplex (simplified)
      const metaplex = Metaplex.make(connection);

      const { nft } = await metaplex.nfts().create({
        name: `TrendStake: ${selectedTweet.authorUsername}'s Tweet`,
        uri: "https://arweave.net/placeholder-metadata", // In a real app, you'd upload metadata to Arweave
        sellerFeeBasisPoints: 500, // 5% royalty
      });

      // Place the prediction
      await program.methods
        .placePrediction(
          new BN(wagerAmount * SOL_DECIMALS),
          prediction === "above"
        )
        .accounts({
          user: publicKey,
          prediction: predictionPDA,
          betAccount: betAccountPDA,
          nftMint: nft.address,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      // Update UI state
      setTxStatus("success");

      // Update user balance
      setUserBalance((prev) => prev - wagerAmount);

      // Add the new prediction to the user's list
      const newPrediction: Prediction = {
        tweetId: selectedTweet.id,
        metricType: selectedMetric,
        direction: prediction,
        amount: wagerAmount,
        threshold: getThresholdValue(selectedTweet, selectedMetric),
        expiryTimestamp: expiryTimestamp,
      };

      setUserPredictions([...userPredictions, newPrediction]);

      // Add the new NFT to the user's collection
      const newNft: PredictionNFT = {
        mint: nft.address.toString(),
        name: `TrendStake: ${selectedTweet.authorUsername}'s Tweet`,
        image: "/placeholder/nft.jpg", // In a real app, this would be the actual NFT image
        attributes: {
          tweet: selectedTweet.text,
          prediction: `${selectedMetric} will go ${prediction} ${getThresholdValue(
            selectedTweet,
            selectedMetric
          )}`,
          status: "Pending",
        },
      };

      setUserNfts([...userNfts, newNft]);

      // Reset state after successful bet
      setTimeout(() => {
        setTxStatus("idle");
        setPrediction(null);
        setWagerAmount(0.1);
      }, 3000);
    } catch (error) {
      console.error("Error placing bet:", error);
      setTxStatus("error");

      setTimeout(() => {
        setTxStatus("idle");
      }, 3000);
    }
  };

  // Connect Twitter Account
  const connectTwitterAccount = async () => {
    // In a real app, this would trigger Twitter OAuth
    try {
      // Simulate API call
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

  // Share prediction on Twitter
  const shareOnTwitter = (prediction: Prediction) => {
    const tweet = tweets.find((t) => t.id === prediction.tweetId);
    if (!tweet) return;

    const tweetText = encodeURIComponent(
      `I just predicted that this tweet will ${
        prediction.direction === "above" ? "exceed" : "stay below"
      } ${prediction.threshold.toLocaleString()} ${
        prediction.metricType
      } in the next ${timeframe} hours! Check it out on TrendStake! #TrendStake #PredictionMarkets`
    );

    const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=https://twitter.com/${tweet.authorUsername}/status/${tweet.id}`;

    window.open(twitterUrl, "_blank");
  };

  // Handle URL submission
  const handleSubmitTweet = () => {
    if (!urlToSubmit) return;

    // Basic validation for Twitter URL
    if (
      !urlToSubmit.includes("twitter.com") &&
      !urlToSubmit.includes("x.com")
    ) {
      alert("Please enter a valid Twitter/X URL");
      return;
    }

    // Extract tweet ID
    const matches = urlToSubmit.match(/status\/(\d+)/);
    if (!matches || !matches[1]) {
      alert("Could not extract tweet ID from URL");
      return;
    }

    const tweetId = matches[1];

    // In a real app, you would call your API to fetch the tweet data
    // For now, we'll create a mock tweet
    const mockSubmittedTweet: Tweet = {
      id: tweetId,
      author: "User Submitted",
      authorUsername: "user_submitted",
      profileImageUrl: "",
      text: "This is a user submitted tweet for prediction markets...",
      createdAt: new Date(),
      currentLikes: 5200,
      currentRetweets: 1200,
      currentComments: 800,
      currentViews: 42000,
      likeThreshold: 10000,
      retweetThreshold: 2000,
      commentThreshold: 1000,
      viewThreshold: 100000,
      timeRemaining: 24 * SECONDS_PER_HOUR,
    };

    setSubmittedTweets([mockSubmittedTweet, ...submittedTweets]);
    setUrlToSubmit("");
    alert("Tweet submitted for consideration!");
  };

  // Render user header
  const renderUserHeader = () => (
    <div className="flex justify-between items-center mb-6 bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center gap-4">
        <div className="bg-blue-500 h-10 w-10 rounded-full overflow-hidden">
          {isTwitterConnected && twitterUser ? (
            <img
              src={twitterUser.profileImage}
              alt={twitterUser.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        <div>
          {isTwitterConnected && twitterUser ? (
            <div>
              <p className="text-white font-medium">{twitterUser.name}</p>
              <p className="text-gray-400 text-sm">@{twitterUser.username}</p>
            </div>
          ) : (
            <button
              onClick={connectTwitterAccount}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-2"
            >
              <Twitter className="w-4 h-4" />
              <span>Connect Twitter</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-gray-700 px-3 py-1.5 rounded-lg flex items-center">
        <span className="text-white font-medium">
          {userBalance.toFixed(2)} SOL
        </span>
      </div>
    </div>
  );

  // Render trending tweets
  const renderTrendingTweets = () => (
    <div>
      <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-blue-400" />
        Trending Tweets
      </h2>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {tweets.map((tweet) => (
            <div
              key={tweet.id}
              className={`p-4 rounded-lg border transition cursor-pointer ${
                selectedTweet?.id === tweet.id
                  ? "bg-gray-800 border-blue-500"
                  : "bg-gray-900 border-gray-800 hover:border-gray-700"
              }`}
              onClick={() => handleSelectTweet(tweet)}
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

                  <p className="text-gray-300 mt-1 line-clamp-2">
                    {tweet.text}
                  </p>

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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render submitted tweets
  const renderSubmittedTweets = () => (
    <div>
      <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-green-400" />
        User Submitted Tweets
      </h2>

      <div className="space-y-3 mb-6">
        {submittedTweets.length === 0 ? (
          <div className="p-4 bg-gray-800 rounded-lg text-gray-400 text-center">
            No tweets have been submitted yet
          </div>
        ) : (
          submittedTweets.map((tweet) => (
            <div
              key={tweet.id}
              className={`p-4 rounded-lg border transition cursor-pointer bg-gray-900 border-gray-800 hover:border-gray-700`}
              onClick={() => handleSelectTweet(tweet)}
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

                  <p className="text-gray-300 mt-1 line-clamp-2">
                    {tweet.text}
                  </p>

                  <div className="flex gap-4 mt-2 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <span>❤️</span>
                      <span>{tweet.currentLikes.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>🔄</span>
                      <span>{tweet.currentRetweets.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Render prediction form
  const renderPredictionForm = () => {
    if (!selectedTweet) return null;

    const odds = calculateOdds(selectedTweet, selectedMetric);
    const currentValue = getCurrentMetricValue(selectedTweet, selectedMetric);
    const thresholdValue = getThresholdValue(selectedTweet, selectedMetric);

    return (
      <div className="mb-6 bg-gray-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-white mb-4">
          Place Your Prediction
        </h2>

        {/* Metric selection */}
        <div className="mb-4">
          <label className="block text-gray-400 mb-2 text-sm">
            Select Metric
          </label>
          <div className="grid grid-cols-4 gap-2">
            {["Likes", "Retweets", "Comments", "Views"].map((metric) => (
              <button
                key={metric}
                className={`py-2 px-3 rounded text-sm font-medium ${
                  selectedMetric === metric
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                onClick={() =>
                  handleSelectMetric(
                    metric as "Likes" | "Retweets" | "Comments" | "Views"
                  )
                }
              >
                {metric}
              </button>
            ))}
          </div>
        </div>

        {/* Timeframe selection */}
        <div className="mb-4">
          <label className="block text-gray-400 mb-2 text-sm">
            Prediction Timeframe
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[24, 48, 72].map((hours) => (
              <button
                key={hours}
                className={`py-2 px-3 rounded text-sm font-medium ${
                  timeframe === hours
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                onClick={() => handleSelectTimeframe(hours)}
              >
                {hours} hours
              </button>
            ))}
          </div>
        </div>

        {/* Current vs Threshold */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">
              Current {selectedMetric}
            </div>
            <div className="text-xl font-semibold text-white">
              {currentValue.toLocaleString()}
            </div>
          </div>

          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">
              Target {selectedMetric}
            </div>
            <div className="text-xl font-semibold text-white">
              {thresholdValue.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Odds display */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div
            className={`p-3 rounded-lg text-center cursor-pointer transition ${
              prediction === "above"
                ? "bg-green-500 bg-opacity-20 border border-green-500"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
            onClick={() => setPrediction("above")}
          >
            <div className="flex justify-center items-center gap-2 mb-1">
              <ChevronUp className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">Will Go Above</span>
            </div>
            <div className="text-xl font-semibold text-white">
              {odds.above}% odds
            </div>
          </div>

          <div
            className={`p-3 rounded-lg text-center cursor-pointer transition ${
              prediction === "below"
                ? "bg-red-500 bg-opacity-20 border border-red-500"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
            onClick={() => setPrediction("below")}
          >
            <div className="flex justify-center items-center gap-2 mb-1">
              <ChevronDown className="w-4 h-4 text-red-400" />
              <span className="text-sm text-gray-300">Will Stay Below</span>
            </div>
            <div className="text-xl font-semibold text-white">
              {odds.below}% odds
            </div>
          </div>
        </div>

        {/* Wager amount */}
        <div className="mb-4">
          <label className="block text-gray-400 mb-2 text-sm">
            Wager Amount (SOL)
          </label>
          <div className="flex gap-2">
            {[0.1, 0.5, 1, 2].map((amount) => (
              <button
                key={amount}
                className={`py-2 px-3 rounded text-sm font-medium ${
                  wagerAmount === amount
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                onClick={() => setWagerAmount(amount)}
              >
                {amount} SOL
              </button>
            ))}
          </div>
        </div>

        {/* Bet button */}
        <button
          className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
            isTwitterConnected && prediction
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-600 cursor-not-allowed"
          }`}
          disabled={
            !isTwitterConnected || !prediction || txStatus === "processing"
          }
          onClick={handlePlaceBet}
        >
          {txStatus === "processing" ? (
            <div className="flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </div>
          ) : isTwitterConnected ? (
            prediction ? (
              `Place ${wagerAmount} SOL bet that ${selectedMetric} will go ${prediction} ${thresholdValue.toLocaleString()}`
            ) : (
              "Select your prediction"
            )
          ) : (
            "Connect Twitter to bet"
          )}
        </button>

        {txStatus === "success" && (
          <div className="mt-3 p-3 bg-green-500 bg-opacity-20 border border-green-500 text-white rounded-lg text-center">
            Bet placed successfully! NFT has been minted to your wallet.
          </div>
        )}

        {txStatus === "error" && (
          <div className="mt-3 p-3 bg-red-500 bg-opacity-20 border border-red-500 text-white rounded-lg text-center">
            Error placing bet. Please try again.
          </div>
        )}
      </div>
    );
  };

  // Render user's NFT gallery
  const renderNftGallery = () => {
    if (userNfts.length === 0) return null;

    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-400" />
          Your Prediction NFTs
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {userNfts.map((nft) => (
            <div
              key={nft.mint}
              className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700"
            >
              <div className="h-32 bg-gray-700 relative overflow-hidden">
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder/nft.jpg";
                  }}
                />

                <div
                  className={`absolute top-2 right-2 py-1 px-2 rounded-full text-xs font-medium ${
                    nft.attributes.status === "Won"
                      ? "bg-green-500"
                      : nft.attributes.status === "Lost"
                      ? "bg-red-500"
                      : "bg-blue-500"
                  }`}
                >
                  {nft.attributes.status}
                </div>
              </div>

              <div className="p-3">
                <h3 className="text-white font-medium text-sm truncate">
                  {nft.name}
                </h3>
                <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                  {nft.attributes.prediction}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render active predictions
  const renderActivePredictions = () => {
    if (userPredictions.length === 0) return null;

    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Timer className="w-5 h-5 text-yellow-400" />
          Active Predictions
        </h2>

        <div className="space-y-3">
          {userPredictions.map((prediction, index) => {
            const now = Math.floor(Date.now() / 1000);
            const timeLeft = prediction.expiryTimestamp - now;
            const hoursLeft = Math.max(0, Math.floor(timeLeft / 3600));
            const minutesLeft = Math.max(0, Math.floor((timeLeft % 3600) / 60));

            return (
              <div
                key={index}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-white font-medium">
                      Tweet #{prediction.tweetId.slice(-5)}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {prediction.metricType} will go {prediction.direction}{" "}
                      {prediction.threshold.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-blue-500 bg-opacity-20 border border-blue-500 px-2 py-1 rounded text-blue-300 text-sm">
                    {prediction.amount} SOL
                  </div>
                </div>

                <div className="mt-3 flex justify-between items-center">
                  <div className="text-sm">
                    {timeLeft > 0 ? (
                      <span className="text-yellow-400 flex items-center gap-1">
                        <Timer className="w-4 h-4" />
                        {hoursLeft}h {minutesLeft}m remaining
                      </span>
                    ) : (
                      <span className="text-gray-400 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        Awaiting resolution
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => shareOnTwitter(prediction)}
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm"
                  >
                    <ShareIcon className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render submit tweet form
  const renderSubmitTweetForm = () => (
    <div className="mb-6 bg-gray-800 rounded-lg p-4">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Plus className="w-5 h-5 text-green-400" />
        Submit a Tweet for Predictions
      </h2>

      <p className="text-gray-300 mb-4">
        Have an interesting tweet you think will go viral? Submit it here and
        others can bet on its performance!
      </p>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Paste Twitter/X URL here..."
          value={urlToSubmit}
          onChange={(e) => setUrlToSubmit(e.target.value)}
          className="flex-1 bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleSubmitTweet}
          disabled={!urlToSubmit}
          className={`px-4 py-2 rounded-lg font-medium ${
            urlToSubmit
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          }`}
        >
          Submit
        </button>
      </div>

      <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
        <h3 className="text-white font-medium mb-2">
          Guidelines for submissions:
        </h3>
        <ul className="text-gray-300 text-sm space-y-1 list-disc pl-5">
          <li>Tweet must be public and accessible</li>
          <li>Tweet should be recent (less than 48h old)</li>
          <li>Tweet should have potential for virality</li>
          <li>
            Submitted tweets will be reviewed before being added to the platform
          </li>
        </ul>
      </div>
    </div>
  );

  // Render user profile page
  const renderProfilePage = () => (
    <div>
      <div className="mb-6 bg-gray-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-white mb-4">Your Profile</h2>

        {isTwitterConnected && twitterUser ? (
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gray-700 rounded-full overflow-hidden">
              <img
                src={twitterUser.profileImage}
                alt={twitterUser.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/placeholder/avatar.jpg";
                }}
              />
            </div>

            <div>
              <h3 className="text-white font-medium">{twitterUser.name}</h3>
              <p className="text-gray-400">@{twitterUser.username}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
              <Twitter className="w-8 h-8 text-gray-500" />
            </div>

            <p className="text-gray-400 text-center">
              Connect your Twitter account to share predictions and place bets
            </p>

            <button
              onClick={connectTwitterAccount}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Twitter className="w-5 h-5" />
              <span>Connect Twitter</span>
            </button>
          </div>
        )}

        <div className="border-t border-gray-700 pt-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900 p-3 rounded-lg">
              <p className="text-gray-400 text-sm">Account Balance</p>
              <p className="text-white font-medium text-xl">
                {userBalance.toFixed(2)} SOL
              </p>
            </div>

            <div className="bg-gray-900 p-3 rounded-lg">
              <p className="text-gray-400 text-sm">Active Predictions</p>
              <p className="text-white font-medium text-xl">
                {userPredictions.length}
              </p>
            </div>

            <div className="bg-gray-900 p-3 rounded-lg">
              <p className="text-gray-400 text-sm">Prediction NFTs</p>
              <p className="text-white font-medium text-xl">
                {userNfts.length}
              </p>
            </div>

            <div className="bg-gray-900 p-3 rounded-lg">
              <p className="text-gray-400 text-sm">Win Rate</p>
              <p className="text-white font-medium text-xl">
                {userNfts.filter((nft) => nft.attributes.status === "Won")
                  .length > 0
                  ? Math.round(
                      (userNfts.filter((nft) => nft.attributes.status === "Won")
                        .length /
                        userNfts.filter(
                          (nft) => nft.attributes.status !== "Pending"
                        ).length) *
                        100
                    )
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
      </div>

      {renderActivePredictions()}
      {renderNftGallery()}
    </div>
  );

  // Render navbar
  const renderNavbar = () => (
    <div className="bg-gray-800 p-2 rounded-lg sticky bottom-0 mb-4 md:mb-0">
      <div className="grid grid-cols-4 gap-2">
        <button
          className={`flex flex-col items-center justify-center p-2 rounded ${
            currentPage === "trending"
              ? "bg-blue-500 text-white"
              : "text-gray-400 hover:bg-gray-700"
          }`}
          onClick={() => setCurrentPage("trending")}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs mt-1">Home</span>
        </button>

        <button
          className={`flex flex-col items-center justify-center p-2 rounded ${
            currentPage === "my-bets"
              ? "bg-blue-500 text-white"
              : "text-gray-400 hover:bg-gray-700"
          }`}
          onClick={() => setCurrentPage("my-bets")}
        >
          <Activity className="w-5 h-5" />
          <span className="text-xs mt-1">My Bets</span>
        </button>

        <button
          className={`flex flex-col items-center justify-center p-2 rounded ${
            currentPage === "submit"
              ? "bg-blue-500 text-white"
              : "text-gray-400 hover:bg-gray-700"
          }`}
          onClick={() => setCurrentPage("submit")}
        >
          <Plus className="w-5 h-5" />
          <span className="text-xs mt-1">Submit</span>
        </button>

        <button
          className={`flex flex-col items-center justify-center p-2 rounded ${
            currentPage === "profile"
              ? "bg-blue-500 text-white"
              : "text-gray-400 hover:bg-gray-700"
          }`}
          onClick={() => setCurrentPage("profile")}
        >
          <User className="w-5 h-5" />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </div>
  );

  // Render main content based on current page
  const renderMainContent = () => {
    switch (currentPage) {
      case "trending":
        return (
          <div className="space-y-6">
            {renderTrendingTweets()}
            {selectedTweet && renderPredictionForm()}
          </div>
        );
      case "my-bets":
        return (
          <div className="space-y-6">
            {renderActivePredictions()}
            {renderNftGallery()}
          </div>
        );
      case "submit":
        return (
          <div className="space-y-6">
            {renderSubmitTweetForm()}
            {renderSubmittedTweets()}
          </div>
        );
      case "profile":
        return renderProfilePage();
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-900 min-h-screen">
      <div className="p-6 pb-24 md:pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold flex items-center gap-2 text-white">
            <Twitter className="w-6 h-6 text-blue-400" />
            TrendStake
          </h1>
        </div>

        {renderUserHeader()}
        {renderMainContent()}
      </div>

      {renderNavbar()}
    </div>
  );
};

export default TrendStakeApp;
