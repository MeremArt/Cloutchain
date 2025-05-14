import { DollarSign, RefreshCw } from "lucide-react";
import { SonicPriceDisplayProps } from "@/app/interface/user.interface";

const SonicPriceDisplay = ({
  sonicToUsdRate,
  usdToNgnRate,
  priceTimestamp,
  isLoadingPrice,
  onRefresh,
}: SonicPriceDisplayProps) => {
  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <DollarSign className="w-6 h-6 text-yellow-400 mr-2" />
          <h3 className="text-lg font-semibold text-white">$SOL Live Price</h3>
        </div>
        <button
          className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          onClick={onRefresh}
          disabled={isLoadingPrice}
        >
          <RefreshCw
            className={`w-5 h-5 text-gray-400 ${
              isLoadingPrice ? "animate-spin" : ""
            }`}
          />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-3xl font-bold text-white">
            ${sonicToUsdRate.toFixed(4)}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            {priceTimestamp
              ? `Last updated: ${priceTimestamp.toLocaleTimeString()}`
              : "Using default price"}
          </div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg flex flex-col justify-center">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-400">Exchange Rate:</span>
            <span className="text-sm text-white">
              1 $SOL = ${sonicToUsdRate.toFixed(4)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-400">NGN Rate:</span>
            <span className="text-sm text-white">
              $1 = ₦{usdToNgnRate.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SonicPriceDisplay;
