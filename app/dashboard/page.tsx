/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import creatorLeaderboard from "../components/creatorLeaderboard/creatorLeaderboard";
import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  ArrowUp,
  Repeat,
  Heart,
  BarChart2,
  Clock,
  Video,
  Image,
  Music,
  Zap,
  Newspaper,
  Globe,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { NewsItem, TrendingPost, Creator } from "../interface/news.interface";

const SocialMediaTrends = () => {
  const [loading, setLoading] = useState(false);
  const [loadingNews, setLoadingNews] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(
    new Date().toLocaleTimeString()
  );
  const [newsData, setNewsData] = useState<NewsItem[]>([]);

  // Define trending content data
  const trendingContent = [
    {
      id: 1,
      author: "ContentCreatorPro",
      handle: "@creator_pro",
      content:
        "Just dropped my guide on how to increase engagement by 200% with short-form video content #ContentCreation #SocialStrategy",
      likes: 2843,
      retweets: 932,
      timePosted: "34m",
      timeLeft: "2h",
      hasMedia: true,
      mediaType: "video",
      engagement: 95,
      engagementChange: 18,
    },
    {
      id: 2,
      author: "Social Media Today",
      handle: "@socialmediatoday",
      content:
        "Instagram announces new creator monetization tools - direct tipping and exclusive content features coming next month #CreatorEconomy",
      likes: 1584,
      retweets: 705,
      timePosted: "1h",
      timeLeft: "4h",
      hasMedia: true,
      mediaType: "image",
      engagement: 88,
      engagementChange: 12,
    },
    {
      id: 3,
      author: "TikTok Trends",
      handle: "@tiktok_trends",
      content:
        "This week's viral sound has generated over 1M new videos in 48 hours! Here's how creators are using it to boost reach #TikTokTips",
      likes: 3384,
      retweets: 1505,
      timePosted: "28m",
      timeLeft: "5h",
      hasMedia: true,
      mediaType: "audio",
      engagement: 97,
      engagementChange: 22,
    },
    {
      id: 4,
      author: "Digital Marketing Hub",
      handle: "@digmarkethub",
      content:
        "Algorithm update alert! LinkedIn is now prioritizing carousel posts with 5+ slides. Creators seeing 40% higher engagement #LinkedInStrategy",
      likes: 945,
      retweets: 586,
      timePosted: "52m",
      timeLeft: "3h",
      hasMedia: true,
      mediaType: "image",
      engagement: 75,
      engagementChange: -3,
    },
  ];

  // Helper function to assign relevant category based on title keywords
  const assignCategory = (title: any) => {
    const lowerTitle = title.toLowerCase();

    if (
      lowerTitle.includes("youtube") ||
      lowerTitle.includes("tiktok") ||
      lowerTitle.includes("instagram") ||
      lowerTitle.includes("facebook") ||
      lowerTitle.includes("linkedin") ||
      lowerTitle.includes("twitter") ||
      lowerTitle.includes("platform")
    ) {
      return "Platform Updates";
    } else if (
      lowerTitle.includes("content") ||
      lowerTitle.includes("creator") ||
      lowerTitle.includes("strategy") ||
      lowerTitle.includes("video") ||
      lowerTitle.includes("post")
    ) {
      return "Content Strategy";
    } else if (
      lowerTitle.includes("ai") ||
      lowerTitle.includes("algorithm") ||
      lowerTitle.includes("tech") ||
      lowerTitle.includes("tool")
    ) {
      return "Technology";
    } else if (
      lowerTitle.includes("market") ||
      lowerTitle.includes("brand") ||
      lowerTitle.includes("business") ||
      lowerTitle.includes("revenue") ||
      lowerTitle.includes("monetization")
    ) {
      return "Business";
    } else if (
      lowerTitle.includes("trend") ||
      lowerTitle.includes("viral") ||
      lowerTitle.includes("engagement") ||
      lowerTitle.includes("influencer")
    ) {
      return "Trends";
    } else {
      return "Digital Marketing"; // Default category
    }
  };

  // Fetch news from NewsAPI
  const fetchNewsData = useCallback(async () => {
    setLoadingNews(true);
    setError(null);
    const API_KEY = process.env.NEXT_PUBLIC_NEWS_ORG_API;

    try {
      // Fetch news related to social media and content creation
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=social+media+OR+content+creation+OR+influencer+OR+digital+marketing&sortBy=publishedAt&language=en&pageSize=4&apiKey=${API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch news: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== "ok") {
        throw new Error(data.message || "Failed to fetch news data");
      }

      // Transform the news articles into our format
      const transformedNews = data.articles.map(
        (article: any, index: number) => ({
          id: index + 1,
          source: article.source.name || "News Source",
          title: article.title || "Trending Article",
          summary: article.description || "Click to read the full story.",
          url: article.url || "#",
          publishedAt: article.publishedAt || new Date().toISOString(),
          category: assignCategory(article.title || ""),
          author: article.author || "Unknown",
          urlToImage: article.urlToImage || null,
        })
      );

      setNewsData(transformedNews);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error fetching news:", error);
      setError("Failed to load news data. Please try again later.");

      // No fallback data - we'll show the error message
    } finally {
      setLoadingNews(false);
    }
  }, []); // Add empty dependency array here

  useEffect(() => {
    fetchNewsData();
  }, [fetchNewsData]);

  const refreshData = () => {
    setLoading(true);
    fetchNewsData();
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-gray-900 p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">
          Content Creator Trends
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshData}
            className="flex items-center bg-blue-600 px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            disabled={loading || loadingNews}
          >
            <RefreshCw
              className={`h-4 w-4 text-white mr-2 ${
                loading || loadingNews ? "animate-spin" : ""
              }`}
            />
            <span className="text-white font-medium text-sm">Refresh</span>
          </button>
          <div className="flex items-center bg-gray-800 px-4 py-2 rounded-lg">
            <Zap className="h-5 w-5 text-yellow-400 mr-2" />
            <span className="text-white font-medium">
              Social Media Insights
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* News API Section */}
        <div className="lg:col-span-3">
          <div className="bg-gray-800 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <Newspaper className="h-5 w-5 text-yellow-400 mr-2" />
                Latest Content Creation News
              </h2>
              <div className="text-gray-400 text-sm">
                Updated: {lastUpdated}
              </div>
            </div>

            {error && (
              <div className="bg-red-900 bg-opacity-30 border border-red-700 text-white p-3 rounded-md mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                {error}
              </div>
            )}

            {loadingNews ? (
              <div className="flex justify-center items-center h-56">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {newsData.map((news) => (
                  <div
                    key={news.id}
                    className="bg-gray-700 rounded-lg overflow-hidden hover:bg-gray-600 transition-colors"
                  >
                    <div className="h-32 bg-gray-600 relative flex items-center justify-center">
                      {news.urlToImage ? (
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${news.urlToImage})`,
                            opacity: 0.7,
                          }}
                        ></div>
                      ) : (
                        <Globe className="h-8 w-8 text-gray-500" />
                      )}
                      <div className="absolute top-2 right-2 bg-gray-900 text-xs font-medium text-white px-2 py-1 rounded">
                        {news.category}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent h-16"></div>
                    </div>
                    <div className="p-3">
                      <div className="flex items-center mb-2">
                        <Globe className="h-3 w-3 text-blue-400 mr-1" />
                        <span className="text-blue-400 text-xs font-medium">
                          {news.source}
                        </span>
                        <span className="text-gray-400 text-xs ml-auto">
                          {new Date(news.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-sm mb-2 line-clamp-2">
                        {news.title}
                      </h3>
                      <p className="text-gray-400 text-xs mb-3 line-clamp-3">
                        {news.summary}
                      </p>
                      <a
                        href={news.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-gray-600 hover:bg-gray-500 text-white text-xs font-medium py-2 rounded transition-colors text-center"
                      >
                        Read Article
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Trending Content Section */}
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-gray-800 rounded-xl p-4 h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <TrendingUp className="h-5 w-5 text-green-400 mr-2" />
                Trending Content
              </h2>
              <div className="flex space-x-2">
                <span className="bg-gray-700 text-xs text-white px-2 py-1 rounded">
                  Last 24h
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {trendingContent.map((post) => (
                <div
                  key={post.id}
                  className="bg-gray-700 rounded-lg p-3 hover:bg-gray-600 transition-colors"
                >
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-gray-400">
                        {post.author.charAt(0)}
                      </div>
                      <div className="ml-2">
                        <div className="text-white text-sm font-medium">
                          {post.author}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {post.handle}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-gray-400 text-xs">
                        {post.timePosted}
                      </div>
                      <div className="flex items-center mt-1">
                        <Clock className="h-3 w-3 text-yellow-400 mr-1" />
                        <span className="text-yellow-400 text-xs">
                          {post.timeLeft} left in trend
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-white text-sm mb-3">{post.content}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 text-red-400 mr-1" />
                        <span className="text-gray-300 text-xs">
                          {post.likes.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Repeat className="h-4 w-4 text-green-400 mr-1" />
                        <span className="text-gray-300 text-xs">
                          {post.retweets.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      {post.hasMedia && (
                        <div className="flex items-center mr-3">
                          {post.mediaType === "video" && (
                            <Video className="h-4 w-4 text-blue-400" />
                          )}
                          {post.mediaType === "image" && (
                            <Image className="h-4 w-4 text-purple-400" />
                          )}
                          {post.mediaType === "audio" && (
                            <Music className="h-4 w-4 text-pink-400" />
                          )}
                        </div>
                      )}
                      <div className="flex items-center bg-gray-800 px-2 py-1 rounded">
                        <BarChart2 className="h-4 w-4 text-blue-400 mr-1" />
                        <span className="text-white text-xs font-medium">
                          {post.engagement}%
                        </span>
                        {post.engagementChange > 0 ? (
                          <ArrowUp className="h-3 w-3 text-green-400 ml-1" />
                        ) : post.engagementChange < 0 ? (
                          <ArrowUp className="h-3 w-3 text-red-400 ml-1 transform rotate-180" />
                        ) : null}
                        <span
                          className={`text-xs ml-1 ${
                            post.engagementChange > 0
                              ? "text-green-400"
                              : post.engagementChange < 0
                              ? "text-red-400"
                              : "text-gray-400"
                          }`}
                        >
                          {Math.abs(post.engagementChange)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Creator Leaderboard Section */}
        <div className="col-span-1">
          <div className="bg-gray-800 rounded-xl p-4 h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <BarChart2 className="h-5 w-5 text-purple-400 mr-2" />
                Creator Leaderboard
              </h2>
              <div className="flex space-x-2">
                <span className="bg-gray-700 text-xs text-white px-2 py-1 rounded">
                  By Engagement
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {creatorLeaderboard.map((creator) => (
                <div
                  key={creator.id}
                  className="bg-gray-700 rounded-lg p-2 flex items-center justify-between hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-2 mr-2 text-gray-400 text-xs font-medium">
                      {creator.id}.
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-gray-400 text-xs">
                      {creator.name.charAt(0)}
                    </div>
                    <div className="ml-2">
                      <div className="text-white text-xs font-medium">
                        {creator.name}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {creator.platform}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="text-gray-400 text-xs mr-3">
                      {(creator.followers / 1000000).toFixed(1)}M
                    </div>
                    <div className="flex items-center bg-gray-800 px-2 py-1 rounded">
                      <span className="text-white text-xs font-medium">
                        {creator.engagement}%
                      </span>
                      {creator.change > 0 ? (
                        <ArrowUp className="h-3 w-3 text-green-400 ml-1" />
                      ) : creator.change < 0 ? (
                        <ArrowUp className="h-3 w-3 text-red-400 ml-1 transform rotate-180" />
                      ) : null}
                      <span
                        className={`text-xs ml-1 ${
                          creator.change > 0
                            ? "text-green-400"
                            : creator.change < 0
                            ? "text-red-400"
                            : "text-gray-400"
                        }`}
                      >
                        {Math.abs(creator.change)}%
                      </span>
                    </div>
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

export default SocialMediaTrends;
