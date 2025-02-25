"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link"; // Add this import
import React, { ReactNode, useEffect, useState } from "react";
import { Menu, X, Loader } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface DashboardLayoutProps {
  children: ReactNode;
}
interface UserData {
  email: string;
  referralCode: string;
  role: string;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const baseMenuItems = [
    { label: "Profile", icon: "👤", href: "/dashboard/profile" },
    { label: "Bank account", icon: "🏦", href: "/dashboard/bankaccount" },
    { label: "Wallet", icon: "💰", href: "/dashboard/wallet" },
    { label: "Card", icon: "💳", href: "/dashboard/card" },
    { label: "Referral links", icon: "🔗", href: "/dashboard/referrals" },
    { label: "Tx pool", icon: "🏷️", href: "/dashboard/pool" },
    { label: "Transaction History", icon: "📊", href: "/dashboard/history" },
  ];
  const getMenuItems = () => {
    if (userData?.role === "MERCHANT") {
      return [
        ...baseMenuItems,
        { label: "Claim", icon: "💎", href: "/dashboard/claim" },
      ];
    }
    return baseMenuItems;
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // const token = localStorage.getItem("jwt");
        const storedUserData = localStorage.getItem("userData");
        // if (!token) {
        //   toast.error("Please log in to continue", {
        //     position: "top-right",
        //     style: {
        //       background: "#333",
        //       color: "#fff",
        //     },
        //   });
        //   router.push("/login");
        // }
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          setUserData(parsedUserData);
          // Debug log
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error("Authentication error:", error);
        toast.error("Please log in to continue", {
          duration: 5000,
          position: "top-right",
          style: {
            background: "#333",
            color: "#fff",
          },
        });
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("userData"); // Also remove user data if you're storing it
    toast.success("Successfully logged out", {
      duration: 3000,
      position: "top-right",
      style: {
        background: "#333",
        color: "#fff",
      },
    });
    router.push("/");
  };

  const handleMenuClick = (href: string) => {
    if (pathname === href) {
      toast("You are already here!", {
        icon: "👋",
        style: {
          background: "#333",
          color: "#fff",
        },
      });
      return;
    }
    setIsSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <Loader className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    //add provider here & remove from app layout
    <div className="flex h-screen bg-gray-900">
      <Toaster
        toastOptions={{
          duration: 3000,
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gray-800 z-40 flex items-center px-4">
        <button
          className="p-2 rounded-md text-white hover:bg-gray-700 transition-colors duration-200"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="ml-4 text-white font-semibold">paj.cash</span>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative
          w-64 h-screen
          transform transition-transform duration-200 ease-in-out
          ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
          bg-gray-800 text-white
          overflow-y-auto
          z-40 lg:z-0
          ${isSidebarOpen ? "mt-0" : "mt-16 lg:mt-0"}
        `}
      >
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <img
              src="https://res.cloudinary.com/dtfvdjvyr/image/upload/v1735749093/pajj_x0kiv1.png"
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h2 className="text-lg font-semibold">paj.cash</h2>
              <p className="text-sm text-gray-400">Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="mt-4 px-2">
          {getMenuItems().map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => handleMenuClick(item.href)}
              className={`
                flex items-center gap-3 px-4 py-2 mt-2 text-sm rounded-lg
                transition-colors duration-200
                ${
                  pathname === item.href
                    ? "bg-orange-600"
                    : "hover:bg-white hover:text-black"
                }
              `}
            >
              <span className="w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="px-2 mt-8">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 w-full text-sm rounded-lg text-white hover:bg-red-600 transition-colors duration-200"
          >
            <span className="w-5 text-center">🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-8 mt-16 lg:mt-0">
        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
