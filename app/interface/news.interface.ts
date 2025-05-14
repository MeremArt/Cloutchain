/* eslint-disable @typescript-eslint/no-explicit-any */
export interface NewsItem {
  urlToImage: any;
  id: number | string;
  source: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
  category: string;
  author: string;
}

export interface TrendingPost {
  id: number;
  author: string;
  handle: string;
  content: string;
  likes: number;
  retweets: number;
  timePosted: string;
  timeLeft: string;
  hasMedia: boolean;
  mediaType: "video" | "image" | "audio";
  engagement: number;
  engagementChange: number;
}

export interface Creator {
  id: number;
  name: string;
  platform: string;
  followers: number;
  engagement: number;
  change: number;
}
