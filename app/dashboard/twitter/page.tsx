"use client";
import React, { useState } from "react";
import {
  Twitter,
  Timer,
  TrendingUp,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import Image from "next/image";
import { Tweet } from "@/app/interface/tweet.interface";
import { GameResult } from "@/app/interface/tweet.interface";
interface Metric {
  id: "likes" | "retweets" | "replies";
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const TwitterPredictionGame = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [selectedTweet, setSelectedTweet] = useState<Tweet | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<
    "likes" | "retweets" | "replies"
  >("likes");
  const [prediction, setPrediction] = useState<"above" | "below" | null>(null);
  const [wagerAmount, setWagerAmount] = useState<number>(0.1);
  const [gameActive, setGameActive] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showResult, setShowResult] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [result, setResult] = useState<GameResult>({
    won: false,
    finalCount: 0,
  });

  const availableTweets: Tweet[] = [
    {
      id: 1,
      author: "Elon Musk",
      handle: "@elonmusk",
      content: "Excited to announce the new Tesla Roadster...",
      currentLikes: 45000,
      currentRetweets: 12000,
      currentReplies: 8000,
      threshold: {
        likes: 100000,
        retweets: 25000,
        replies: 15000,
      },
      timeRemaining: 120,
      imageUrl: "/api/placeholder/400/200",
    },
  ];

  const metrics: Metric[] = [
    { id: "likes", label: "Likes", icon: TrendingUp },
    { id: "retweets", label: "Retweets", icon: RefreshCw },
    { id: "replies", label: "Replies", icon: MessageSquare },
  ];

  const wagerOptions: number[] = [0.1, 0.2, 0.5, 1, 2, 5];

  const handleTwitterConnect = (): void => {
    setIsConnected(true);
  };

  if (!isConnected) {
    return (
      <div className="w-full bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-white mb-2">
            <Twitter className="w-5 h-5 text-blue-400" />
            Twitter Prediction Game
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="absolute -inset-1 bg-blue-500 rounded-full blur opacity-25"></div>
              <Twitter className="w-16 h-16 text-blue-400 mx-auto relative" />
            </div>
            <h3 className="text-xl font-medium text-white">
              Connect Twitter to Play
            </h3>
            <p className="text-gray-400 max-w-sm">
              Connect your Twitter account to start predicting engagement
              metrics and earn rewards
            </p>
            <button
              onClick={handleTwitterConnect}
              className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Twitter className="w-5 h-5 relative" />
              <span className="relative">Connect Twitter</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-white mb-2">
          <Twitter className="w-5 h-5 text-blue-400" />
          Twitter Prediction Game
        </h2>

        {!gameActive ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {availableTweets.map((tweet) => (
                <div
                  key={tweet.id}
                  onClick={() => setSelectedTweet(tweet)}
                  className={`p-4 rounded-lg border transition-all ${
                    selectedTweet?.id === tweet.id
                      ? "border-blue-500 bg-gray-800"
                      : "border-gray-700 hover:border-gray-600 bg-gray-800"
                  }`}
                >
                  <div className="flex gap-4">
                    <Image
                      src={tweet.imageUrl}
                      alt=""
                      className="w-24 h-24 rounded object-cover"
                      width={50}
                      height={50}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white">
                          {tweet.author}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {tweet.handle}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">
                        {tweet.content}
                      </p>
                      <div className="flex gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {tweet.currentLikes.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <RefreshCw className="w-4 h-4" />
                          {tweet.currentRetweets.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {tweet.currentReplies.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Timer className="w-4 h-4" />
                          {tweet.timeRemaining}min
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedTweet && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Select Metric to Predict
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {metrics.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => setSelectedMetric(id)}
                        className={`p-3 rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                          selectedMetric === id
                            ? "bg-blue-500 text-white border-blue-500"
                            : "border-gray-700 hover:bg-gray-800 text-gray-300"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Will it reach{" "}
                    {selectedTweet.threshold[selectedMetric].toLocaleString()}{" "}
                    {selectedMetric}?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPrediction("above")}
                      className={`p-3 rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                        prediction === "above"
                          ? "bg-green-500 text-white"
                          : "border-gray-700 hover:bg-gray-800 text-gray-300"
                      }`}
                    >
                      <TrendingUp className="w-4 h-4" />
                      Above Threshold
                    </button>
                    <button
                      onClick={() => setPrediction("below")}
                      className={`p-3 rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                        prediction === "below"
                          ? "bg-red-500 text-white"
                          : "border-gray-700 hover:bg-gray-800 text-gray-300"
                      }`}
                    >
                      <TrendingUp className="w-4 h-4 rotate-180" />
                      Below Threshold
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Select Wager Amount
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {wagerOptions.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setWagerAmount(amount)}
                        className={`p-2 rounded-lg border transition-colors ${
                          wagerAmount === amount
                            ? "bg-blue-500 text-white"
                            : "border-gray-700 hover:bg-gray-800 text-gray-300"
                        }`}
                      >
                        {amount} SOL
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setGameActive(true)}
                  disabled={!prediction || !wagerAmount}
                  className="w-full py-3 px-4 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Start Prediction
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="text-4xl font-bold text-white">
              <Timer className="w-12 h-12 mx-auto mb-4 text-blue-400" />
              {/* Time display would go here */}
            </div>
          </div>
        )}
      </div>

      {showResult && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-800">
            {/* Result content */}
          </div>
        </div>
      )}
    </div>
  );
};

export default TwitterPredictionGame;
