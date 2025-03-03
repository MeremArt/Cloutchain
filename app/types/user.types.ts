export interface UserData {
  id: string;
  email: string;
  tiktokUsername: string;
  walletAddress: string;
}

export interface HeaderProps {
  onToggleSidebar: () => void;
  userData: UserData | null;
}

export interface BalanceData {
  phoneNumber: string;
  walletAddress: string;
  balances: {
    sol: number;
    sonic: number;
  };
  tokenAccount: {
    address: string;
    exists: boolean;
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
