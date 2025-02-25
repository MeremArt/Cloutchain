export interface Tweet {
  id: number;
  author: string;
  handle: string;
  content: string;
  currentLikes: number;
  currentRetweets: number;
  currentReplies: number;
  threshold: {
    likes: number;
    retweets: number;
    replies: number;
  };
  timeRemaining: number;
  imageUrl: string;
}

export interface GameResult {
  won: boolean;
  finalCount: number;
}
