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
