"use client";

import { RefreshCw, Send } from "lucide-react";

interface ConfirmWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  isProcessing: boolean;
  onConfirm: () => void;
  amount: string;
  ngnValue: number;
  feeAmount: number;
  feePercent: number;
  netAmount: number;
  netNGNValue: number;
  selectedMethod: string | null;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}

const ConfirmWithdrawalModal = ({
  isOpen,
  onClose,
  isProcessing,
  onConfirm,
  amount,
  ngnValue,
  feeAmount,
  feePercent,
  netAmount,
  netNGNValue,
  selectedMethod,
  bankDetails,
}: ConfirmWithdrawalModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-white mb-4">
          Confirm Withdrawal
        </h3>

        <div className="space-y-4 mb-6">
          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-400">Amount:</span>
              <span className="text-white">{amount} $SOL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Value:</span>
              <span className="text-white">₦{ngnValue.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-400">
                Fee ({feePercent}%):
              </span>
              <span className="text-white">{feeAmount.toFixed(2)} $SOL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">
                You&apos;ll receive:
              </span>
              <div className="text-right">
                <div className="text-white">{netAmount.toFixed(2)} $SOL</div>
                <div className="text-xs text-gray-400">
                  ≈ ₦{netNGNValue.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {selectedMethod === "bank" && bankDetails && (
            <div className="bg-gray-700 p-3 rounded-lg">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-400">Bank:</span>
                <span className="text-white capitalize">
                  {bankDetails.bankName}
                </span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-400">Account:</span>
                <span className="text-white">{bankDetails.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Name:</span>
                <span className="text-white">{bankDetails.accountName}</span>
              </div>
            </div>
          )}

          {selectedMethod === "wallet" && (
            <div className="bg-gray-700 p-3 rounded-lg">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Destination:</span>
                <span className="text-white">Connected Wallet</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Confirm
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmWithdrawalModal;
