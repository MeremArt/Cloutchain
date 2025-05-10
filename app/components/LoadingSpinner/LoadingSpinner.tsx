import React from "react";
import { LoadingSpinnerProps } from "@/app/interface/loader.interface";

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading bank accounts...",
  className = "border-primary",
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div
          className={`animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4 ${className}`}
        ></div>
        <p className="text-gray-400">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
