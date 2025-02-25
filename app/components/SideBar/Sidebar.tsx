import React from "react";
import Link from "next/link";
import Image from "next/image";

import {
  Home,
  Circle,
  Hexagon,
  Youtube,
  Clock,
  Twitter,
  User,
} from "lucide-react";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const pathname = usePathname();

  // Navigation items with route paths
  const navItems = [
    { icon: Home, label: "Home", route: "/dashboard" },
    { icon: User, label: "Profile", route: "/dashboard/profile" },
    { icon: Twitter, label: "Search", route: "/dashboard/twitter" },
    { icon: Hexagon, label: "Live", route: "/dashboard/live" },
    { icon: Circle, label: "Tennis", route: "/dashboard/tennis" },
    { icon: Youtube, label: "Videos", route: "/dashboard/videos" },
  ];

  return (
    <div className="w-16 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-4">
      {/* Menu icon */}
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
        {navItems.map((item, index) => {
          const isActive = pathname === item.route;
          return (
            <Link key={index} href={item.route}>
              <div className="flex flex-col items-center cursor-pointer">
                <div
                  className={`p-2 ${
                    isActive ? "bg-gray-800" : "hover:bg-gray-800"
                  } rounded-lg`}
                >
                  <item.icon
                    className={`${
                      isActive ? "text-yellow-400" : "text-gray-400"
                    } w-5 h-5`}
                  />
                </div>
              </div>
            </Link>
          );
        })}

        {/* History button (highlighted) */}
        <Link href="/dashboard/history">
          <div className="flex flex-col items-center pt-6 cursor-pointer">
            <div
              className={`p-2 rounded-full ${
                pathname === "/dashboard/history"
                  ? "bg-yellow-400"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              <Clock
                className={`${
                  pathname === "/dashboard/history"
                    ? "text-gray-900"
                    : "text-gray-400"
                } w-5 h-5`}
              />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
