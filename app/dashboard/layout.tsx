/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@civic/auth-web3/react";

import Link from "next/link";

import React, { ReactNode, useEffect, useState } from "react";

import {
  X,
  Menu,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Twitter,
  Loader,
  Home,
  User,
  Wallet,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  CreditCard,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Link as LinkIcon,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Tag,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  BarChart,
  DoorOpen,
  Gem,
} from "lucide-react";
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
  const { signIn, signOut } = useUser();
  // Define base menu items with appropriate icons
  const baseMenuItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: User, label: "Profile", href: "/dashboard/profile" },
    { icon: Wallet, label: "Wallet", href: "/dashboard/withdraw" },
    // { icon: Twitter, label: "twiiter", href: "/dashboard/twitter" },

    // { icon: CreditCard, label: "Card", href: "/dashboard/submit" },
    // { icon: LinkIcon, label: "Referrals", href: "/dashboard/referrals" },
    // { icon: Tag, label: "Tx pool", href: "/dashboard/pool" },
    // { icon: BarChart, label: "History", href: "/dashboard/history" },
  ];

  const getMenuItems = () => {
    if (userData?.role === "MERCHANT") {
      return [
        ...baseMenuItems,
        { icon: Gem, label: "Claim", href: "/dashboard/claim" },
      ];
    }
    return baseMenuItems;
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUserData = localStorage.getItem("userData");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          setUserData(parsedUserData);
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
    localStorage.removeItem("userData");
    signOut();
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
    setIsSidebarOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <Loader className="h-8 w-8 animate-spin text-yellow-300" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
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
        <span className="ml-4 text-white font-semibold">Cloutchain</span>
      </div>

      {/* New Slim Sidebar */}
      <aside
        className={`
          fixed lg:relative
          w-16 h-screen
          transform transition-transform duration-200 ease-in-out
          ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
          bg-gray-900 border-r border-gray-800
          overflow-y-auto
          flex flex-col items-center py-4
          z-40 lg:z-0
          ${isSidebarOpen ? "mt-0" : "mt-16 lg:mt-0"}
        `}
      >
        {/* Logo */}
        <Link href="/">
          <div className="mb-8">
            <Image
              src="https://res.cloudinary.com/dtfvdjvyr/image/upload/v1740060892/Group_7_xmjgul.png"
              alt="Menu icon"
              width={34}
              height={34}
            />
          </div>
        </Link>

        {/* Navigation items */}
        <div className="grid grid-cols-1 gap-6">
          {getMenuItems().map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => handleMenuClick(item.href)}
              >
                <div className="flex flex-col items-center cursor-pointer">
                  <div
                    className={`p-2 ${
                      isActive ? "bg-gray-800" : "hover:bg-gray-800"
                    } rounded-lg`}
                  >
                    <IconComponent
                      className={`${
                        isActive ? "text-yellow-400" : "text-gray-400"
                      } w-5 h-5`}
                    />
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Logout Button */}
          <div
            onClick={handleLogout}
            className="flex flex-col items-center cursor-pointer pt-6"
          >
            <div className="p-2 bg-gray-800 hover:bg-red-600 rounded-lg transition-colors duration-200">
              <DoorOpen className="text-gray-400 hover:text-white w-5 h-5" />
            </div>
          </div>
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
