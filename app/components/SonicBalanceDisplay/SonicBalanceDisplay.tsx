import { DollarSign, RefreshCw } from "lucide-react";

import { SonicBalanceDisplayProps } from "@/app/interface/user.interface";

// interface BalanceData {
//   balances: {
//     sonic: number;
//     [key: string]: number;
//   };
// }

const SonicBalanceDisplay = ({
  balanceData,
  sonicToUsdRate,
  isLoadingBalance,
  onRefresh,
  calculateNGNValue,
}: SonicBalanceDisplayProps) => {
  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <DollarSign className="w-6 h-6 text-yellow-400 mr-2" />
          <h3 className="text-lg font-semibold font-orbitron text-white">
            Available Balance
          </h3>
        </div>
        <button
          className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          onClick={onRefresh}
          disabled={isLoadingBalance}
        >
          <RefreshCw
            className={`w-5 h-5 text-gray-400 ${
              isLoadingBalance ? "animate-spin" : ""
            }`}
          />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-3xl font-bold font-orbitron text-white">
            {balanceData ? balanceData.balances.sonic.toFixed(2) : "0.00"}{" "}
            $SONIC
          </div>
          <div className="text-gray-400 mt-1">
            ≈ ₦
            {balanceData
              ? calculateNGNValue(balanceData.balances.sonic).toLocaleString()
              : "0.00"}
          </div>
        </div>

        <div className="bg-gray-700 p-3 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">USD Value</div>
            <div className="text-lg font-medium text-white">
              $
              {balanceData
                ? (balanceData.balances.sonic * sonicToUsdRate).toFixed(2)
                : "0.00"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SonicBalanceDisplay;
