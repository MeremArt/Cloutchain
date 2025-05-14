export interface UserData {
  id: string;
  email?: string;
  tiktokUsername: string;
  walletAddress: string;
  tokenAccountAddress?: string;
  role?: string;
  // Civic Auth specific fields
  isCivicAuth?: boolean;
  name?: string;
  picture?: string;
  sub?: string; // Subject identifier (unique ID from Civic)
  iss?: string; // Issuer
  aud?: string; // Audience
  exp?: number; // Expiration time
  iat?: number; // Issued at time
}

export interface HeaderProps {
  onToggleSidebar: () => void;
  userData: UserData | null;
}

export interface BalanceData {
  balances: {
    sol: number;
  };
  // Optional fields for compatibility with existing code
  phoneNumber?: string;
  walletAddress?: string;
  tokenAccount?: {
    address?: string;
    exists?: boolean;
  };
}

export interface SonicPriceDisplayProps {
  sonicToUsdRate: number;
  usdToNgnRate: number;
  priceTimestamp: Date | null;
  isLoadingPrice: boolean;
  onRefresh: () => void;
}

export interface WithdrawalMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

export interface SonicBalanceDisplayProps {
  balanceData: BalanceData | null;
  sonicToUsdRate: number;
  isLoadingBalance: boolean;
  onRefresh: () => void;
  calculateNGNValue: (amount: number) => number;
}
