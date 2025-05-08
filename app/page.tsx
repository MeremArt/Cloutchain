"use client";
import Link from "next/link";
import React, { useState } from "react";
import Logo from "./components/Logo/Logo";
import SocialCard from "./components/SocialCard/SocialCard";

const LandingPage: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="w-full min-h-screen bg-[#0f0f0f] relative overflow-hidden">
      {/* Background Blurs */}
      <div className="absolute w-[440px] h-[440px] bg-[#87daba] rounded-full blur-[150px] top-[0%] left-[90%] opacity-[50%] md:block hidden" />
      <div className="absolute w-[225px] h-[225px] bg-[#5fcddc] rounded-full blur-[100px] top-[5%] bottom-[0%] left-[5%] opacity-[0.3]" />
      <div className="absolute w-[225px] h-[225px] bg-[#F24FFF] rounded-full blur-[100px] top-[5%] right-[0%] bottom-[20%] left-[0.5%] opacity-[0.5] md:block hidden" />
      <div className="absolute w-[225px] h-[225px] bg-[#87DABA] rounded-full blur-[100px] top-[5%] right-[0%] bottom-[20%] left-[5%] opacity-[0.2]" />

      {/* Navigation */}
      <nav className="flex justify-between items-center py-4 md:py-8 px-4 md:px-16">
        {/* Logo */}
        <div className="grid grid-cols-4 gap-[2px]">
          <Logo />
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex flex-col justify-center items-center z-20"
          onClick={toggleMenu}
        >
          <span
            className={`block w-6 h-0.5 bg-white mb-1.5 transition-transform ${
              menuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          ></span>
          <span
            className={`block w-6 h-0.5 bg-white mb-1.5 transition-opacity ${
              menuOpen ? "opacity-0" : "opacity-100"
            }`}
          ></span>
          <span
            className={`block w-6 h-0.5 bg-white transition-transform ${
              menuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          ></span>
        </button>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-12">
          <a
            href="#about"
            className="text-[#f5f5f5] font-nunito font-semibold text-[18px] no-underline hover:opacity-80"
          >
            About Us
          </a>
          <a
            href="#community"
            className="text-[#f5f5f5] font-nunito font-semibold text-[18px] no-underline hover:opacity-80"
          >
            Community
          </a>
          <a
            href="#guide"
            className="text-[#f5f5f5] font-nunito font-semibold text-[18px] no-underline hover:opacity-80"
          >
            Guide
          </a>
          <a
            href="#socials"
            className="text-[#f5f5f5] font-nunito font-semibold text-[18px] no-underline hover:opacity-80"
          >
            Socials
          </a>
          <Link href="/signup">
            <button className="bg-[#fffd55] rounded-[12px] px-4 py-3 font-nunito font-bold text-[22px] text-[#0f0f0f] cursor-pointer hover:scale-105 transition-transform">
              Sign up
            </button>
          </Link>
        </div>

        {/* Mobile Menu Overlay */}
        <div
          className={`fixed inset-0 bg-[#0f0f0f] z-10 flex flex-col items-center justify-center gap-8 transition-opacity duration-300 ${
            menuOpen ? "opacity-95 visible" : "opacity-0 invisible"
          } md:hidden`}
        >
          <a
            href="#about"
            className="text-[#f5f5f5] font-nunito font-semibold text-[24px] no-underline"
            onClick={() => setMenuOpen(false)}
          >
            About Us
          </a>
          <a
            href="#community"
            className="text-[#f5f5f5] font-nunito font-semibold text-[24px] no-underline"
            onClick={() => setMenuOpen(false)}
          >
            Community
          </a>
          <a
            href="#guide"
            className="text-[#f5f5f5] font-nunito font-semibold text-[24px] no-underline"
            onClick={() => setMenuOpen(false)}
          >
            Guide
          </a>
          <a
            href="#socials"
            className="text-[#f5f5f5] font-nunito font-semibold text-[24px] no-underline"
            onClick={() => setMenuOpen(false)}
          >
            Socials
          </a>
          <Link href="/signup" onClick={() => setMenuOpen(false)}>
            <button className="bg-[#fffd55] rounded-[12px] px-6 py-3 mt-4 font-nunito font-bold text-[22px] text-[#0f0f0f] cursor-pointer">
              Sign up
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col items-center text-center px-4 md:px-8 pt-8 md:pt-0 relative z-1">
        <h1 className="font-orbitron font-bold text-[36px] md:text-[64px] leading-[1.2] md:leading-[76.8px] text-[#f5f5f5] mb-4 tracking-[1.28px]">
          Where <span className="text-[#fffd55]">Trends</span> become <br />{" "}
          Tradable
        </h1>
        <p className="font-nunito font-normal text-[16px] md:text-[20px] leading-[1.6] md:leading-[36px] text-[#f5f5f5] mb-6">
          Turn Your Clout Into Cash with CloutChain, Powered by Solana.
        </p>
        <Link href="/login">
          <button className="bg-[#fffd55] rounded-[12px] py-3 px-8 font-nunito font-bold text-[18px] md:text-[22px] text-[#0f0f0f] cursor-pointer hover:scale-105 transition-transform">
            Get Started
          </button>
        </Link>
      </div>

      {/* Carousel Section */}
      <div className="w-full overflow-hidden mt-8 md:mt-0">
        <SocialCard />
      </div>
    </div>
  );
};

export default LandingPage;
