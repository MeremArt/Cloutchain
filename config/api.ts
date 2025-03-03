// src/config/api.ts

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const API_ENDPOINTS = {
  // auth related endpoints
  AUTH: {
    SIGNUP: `${API_BASE_URL}/api/auth/**`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
  },
  PROFILE: {
    BALANCE: `${API_BASE_URL}/api/transactions/balance/`,
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
  WALLET: {
    ACCOUNTS: `${API_BASE_URL}/wallet`,
    BASE: `${API_BASE_URL}/wallet`,
    VALIDATE: `${API_BASE_URL}/wallet/validate`,
  },

  TRANSACTION: {
    HISTORY: `${API_BASE_URL}/transaction`,
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
