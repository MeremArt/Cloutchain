import React from "react";
import { Bell, User, Menu } from "lucide-react";

interface UserData {
  id: string;
  email: string;
  phoneNumber: string;
  walletAddress: string;
  twitterId: string;
}

interface HeaderProps {
  onToggleSidebar: () => void;
  userData: UserData | null;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, userData }) => {
  return (
    <header className="h-16 bg-gray-900 flex items-center justify-between px-4 border-b border-gray-800">
      {/* Mobile menu button */}
      <button
        onClick={onToggleSidebar}
        className="text-gray-400 hover:text-white mr-4 md:hidden"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* User area */}
      <div className="flex items-center space-x-4 ml-auto">
        {/* Notifications */}
        <Bell className="text-blue-400 w-5 h-5 cursor-pointer hover:text-blue-300" />

        {/* User profile - collapsed on mobile */}
        <div className="flex items-center bg-gray-800 rounded-lg p-1">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <User className="text-white w-5 h-5" />
          </div>
          <div className="ml-2 mr-4 hidden sm:block">
            <div className="text-sm">
              {userData ? userData.twitterId : "Loading..."}
            </div>
            <div className="text-xs text-gray-400">
              {userData
                ? userData.walletAddress.slice(0, 6) +
                  "..." +
                  userData.walletAddress.slice(-4)
                : "..."}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
