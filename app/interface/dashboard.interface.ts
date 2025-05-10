import { ReactNode } from "react";
export interface UserData {
  email: string;
  referralCode: string;
  role: string;
}

export interface DashboardLayoutProps {
  children: ReactNode;
}
