// src/config/api.ts

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const API_ENDPOINTS = {
  // auth related endpoints
  AUTH: {
    SIGNUP: `${API_BASE_URL}/api/auth/register`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    ME: `${API_BASE_URL}/auth/me`,
    CONNECT_WALLET: `${API_BASE_URL}/auth/connect-wallet`,
  },
  PROFILE: {
    BALANCE: `${API_BASE_URL}/api/transactions/balance/`,
    HISTORY: `${API_BASE_URL}/profile/transactions/`,
    UPDATE_TIKTOK: `${API_BASE_URL}/auth/update-tiktok-username`,
  },
  TRANSACTIONS: {
    SEND: `${API_BASE_URL}/transactions/send`,
    STATUS: `${API_BASE_URL}/transactions/status/`,
    HISTORY: `${API_BASE_URL}/transaction`,
  },
  WALLETS: {
    CHECK_TOKEN: `${API_BASE_URL}/wallets/token-account/`,
    CREATE_TOKEN: `${API_BASE_URL}/wallets/create-token/`,
    GET_BALANCE: `${API_BASE_URL}/api/transactions/wallets/balance/`,
  },
  BANK: {
    FETCH: `${API_BASE_URL}/bank-account`,
    LIST: `${API_BASE_URL}/bank`,
    ACCOUNTS: `${API_BASE_URL}/bank-account`,
    VALIDATE: (bankId: string, accountNumber: string) =>
      `${API_BASE_URL}/bank-account/confirm?bankId=${bankId}&accountNumber=${accountNumber}`,
    DELETE: (accountNumber: string) =>
      `${API_BASE_URL}/bank-account/${accountNumber}`,
  },

  // Wallet related endpoints
  WITHDRAWALS: {
    WALLET: `${API_BASE_URL}/api/withdrawals/wallet`,
    BANK: `${API_BASE_URL}/wallet`,
  },

  // Add other endpoint categories as needed
} as const;

// API response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Common headers function
export const getAuthHeaders = (jwt?: string) => {
  const token = jwt || localStorage.getItem("jwt");
  return {
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  };
};

// Common API error handler
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Server responded with error
    return error.response.data?.message || "Server error occurred";
  } else if (error.request) {
    // Request made but no response
    return "No response from server";
  } else {
    // Other errors
    return error.message || "An unexpected error occurred";
  }
};
