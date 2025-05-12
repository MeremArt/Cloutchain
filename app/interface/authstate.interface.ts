export interface AuthState {
  /**
   * Whether authentication is currently loading
   */
  isLoading: boolean;

  /**
   * Whether the user is authenticated
   */
  isAuthenticated: boolean;

  /**
   * Whether the user is authenticated using Civic Auth
   */
  isCivicAuth: boolean;

  /**
   * The user's wallet address (if available)
   */
  walletAddress?: string;

  /**
   * The user's email (if available)
   */
  email?: string;

  /**
   * The user's TikTok username (if available)
   */
  tiktokUsername?: string;

  /**
   * The user's ID in the backend system (if available)
   */
  userId?: string;
}
