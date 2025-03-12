import React from "react";
import {
  TrendingUp,
  ArrowUp,
  Repeat,
  Heart,
  BarChart2,
  Clock,
} from "lucide-react";

const page = () => {
  const trendingTweets = [
    {
      id: 1,
      author: "KenyanTrends",
      handle: "@kenyan_trends",
      content:
        "Breaking: Government announces new economic policy that will affect all citizens #KenyaEconomy",
      likes: 1243,
      retweets: 532,
      timePosted: "12m",
      timeLeft: "32m",
      hasMedia: true,
      engagement: 89,
      engagementChange: 12,
    },
    {
      id: 2,
      author: "Kenya Sports",
      handle: "@kenya_sports",
      content:
        "Kenya's marathon team wins gold at the international championship! #KenyaWins #Marathon",
      likes: 2584,
      retweets: 1205,
      timePosted: "8m",
      timeLeft: "38m",
      hasMedia: true,
      engagement: 93,
      engagementChange: 17,
    },
    {
      id: 3,
      author: "Kenya Sports",
      handle: "@kenya_sports",
      content:
        "Kenya's marathon team wins gold at the international championship! #KenyaWins #Marathon",
      likes: 2584,
      retweets: 1205,
      timePosted: "8m",
      timeLeft: "38m",
      hasMedia: true,
      engagement: 93,
      engagementChange: 17,
    },
    {
      id: 4,
      author: "Tech Nairobi",
      handle: "@tech_nairobi",
      content:
        "New tech hub opening in Westlands next month, creating over 1000 jobs #TechKenya",
      likes: 945,
      retweets: 386,
      timePosted: "22m",
      timeLeft: "14m",
      hasMedia: true,
      engagement: 65,
      engagementChange: -3,
    },
  ];
  const hashtagLeaderboard = [
    { id: 1, tag: "Empress", posts: 15243, odds: 82, change: 14 },
    { id: 2, tag: "John Mwangi", posts: 8965, odds: 65, change: 7 },
    { id: 3, tag: "Aisha Kimani", posts: 7832, odds: 59, change: -2 },
    { id: 4, tag: "Kevin Otieno", posts: 6921, odds: 48, change: 9 },
    { id: 5, tag: "TechGuru254", posts: 5467, odds: 41, change: 5 },
    { id: 6, tag: "RallyKing", posts: 4832, odds: 36, change: 3 },
    { id: 7, tag: "KOT Legend", posts: 3943, odds: 32, change: -1 },
    { id: 8, tag: "MombasaVibes", posts: 3654, odds: 29, change: 0 },
    { id: 9, tag: "PoliticalAnalystKE", posts: 2987, odds: 24, change: -5 },
    { id: 10, tag: "FashionQueen", posts: 2654, odds: 18, change: 2 },
  ];

  return (
    <div className="bg-gray-900 p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Trending Feed</h1>
        <div className="flex items-center bg-gray-800 px-4 py-2 rounded-lg">
          <TrendingUp className="h-5 w-5 text-yellow-400 mr-2" />
          <span className="text-white font-medium">Real-time Updates</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trending Tweets Section - Takes up 2/3 of the space on large screens */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-800 rounded-xl p-4">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 text-yellow-400 mr-2" />
              Trending Tweets
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trendingTweets.map((tweet) => (
                <div
                  key={tweet.id}
                  className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
                >
                  {/* Tweet header */}
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-white">{tweet.author}</p>
                      <p className="text-gray-400 text-sm">
                        {tweet.handle} • {tweet.timePosted}
                      </p>
                    </div>
                    <div className="flex items-center bg-gray-600 px-2 py-1 rounded">
                      <span className="text-yellow-400 font-bold mr-1">
                        {tweet.engagement}
                      </span>
                      <ArrowUp
                        className={`h-4 w-4 ${
                          tweet.engagementChange > 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Tweet content */}
                  <p className="text-white mb-2">{tweet.content}</p>

                  {/* Tweet media */}
                  {tweet.hasMedia && (
                    <div className="w-full h-32 bg-gray-500 rounded-lg mb-3"></div>
                  )}

                  {/* Tweet metrics */}
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-4">
                      <span className="text-gray-400 flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        {tweet.likes}
                      </span>
                      <span className="text-gray-400 flex items-center">
                        <Repeat className="h-4 w-4 mr-1" />
                        {tweet.retweets}
                      </span>
                      <span className="text-gray-400 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {tweet.timeLeft}
                      </span>
                    </div>
                    <button className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full font-medium hover:bg-yellow-300 transition-colors">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hashtag Leaderboard Section - Takes up 1/3 of the space on large screens */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-xl p-4 h-full">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <BarChart2 className="h-5 w-5 text-yellow-400 mr-2" />
              Leaderboard
            </h2>

            <div className="space-y-3">
              {hashtagLeaderboard.map((hashtag, index) => (
                <div
                  key={hashtag.id}
                  className="flex items-center justify-between bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="bg-gray-600 text-gray-300 w-6 h-6 flex items-center justify-center rounded-full mr-3">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-white">{hashtag.tag}</p>
                      <p className="text-gray-400 text-xs">
                        {hashtag.posts.toLocaleString()} posts
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center">
                      <span className="text-white font-bold">
                        {hashtag.odds}%
                      </span>
                      {hashtag.change !== 0 && (
                        <ArrowUp
                          className={`h-4 w-4 ml-1 ${
                            hashtag.change > 0
                              ? "text-green-400"
                              : "text-red-400 transform rotate-180"
                          }`}
                        />
                      )}
                    </div>
                    {/* <button className="text-yellow-400 text-xs font-medium hover:underline">
                      Place Bet
                    </button> */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
