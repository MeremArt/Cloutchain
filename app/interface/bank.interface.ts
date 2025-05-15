// app/interface/bank.interface.ts

import { UserData } from "./user.interface";

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
}

export interface BankWithdrawalOptions {
  amount: string;
  userData: UserData | null;
  bankDetails: BankDetails;
}
