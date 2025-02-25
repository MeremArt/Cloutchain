import React, { useState, useEffect } from "react";

import { SocialMediaCardProps } from "@/app/types/socialcard.types";

const SocialMediaCard = ({
  platform,
  color,
  logo,
  hexCode,
  style,
}: SocialMediaCardProps) => {
  return (
    <div
      className="absolute transition-all duration-500 ease-in-out rounded-xl overflow-hidden shadow-lg"
      style={{
        backgroundColor: color,
        ...style,
      }}
    >
      <div className="absolute top-4 left-6 text-white font-bold">
        {platform}
      </div>
      <div className="absolute top-4 right-6 text-white opacity-80 text-sm">
        {hexCode}
      </div>
      <div className="flex items-center justify-center h-full">
        <div className="bg-white/20 p-6 rounded-xl w-36 h-36 flex items-center justify-center">
          {logo}
        </div>
      </div>
    </div>
  );
};

const SocialCard = () => {
  const [activeIndex, setActiveIndex] = useState(2);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isAutoplay, setIsAutoplay] = useState(true);

  const platforms = [
    {
      name: "Reddit",
      color: "#FF4500",
      hexCode: "#7254v",
      logo: (
        <svg viewBox="0 0 24 24" className="w-24 h-24 text-white">
          <path
            fill="currentColor"
            d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"
          />
        </svg>
      ),
    },
    {
      name: "Instagram",
      color: "#833AB4",
      hexCode: "#0234g",
      logo: (
        <div className="w-24 h-24 rounded-xl bg-gradient-to-tr from-yellow-500 via-pink-600 to-purple-800 p-4 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-white rounded-xl flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full absolute top-6 right-6"></div>
            <div className="w-8 h-8 border-4 border-white rounded-full"></div>
          </div>
        </div>
      ),
    },
    {
      name: "Twitter",
      color: "#14171A",
      hexCode: "#5234f",
      logo: (
        <svg viewBox="0 0 24 24" className="w-24 h-24 text-white">
          <path
            fill="currentColor"
            d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
          />
        </svg>
      ),
    },
    {
      name: "TikTok",
      color: "#69C9D0",
      hexCode: "#9224c",
      logo: (
        <svg viewBox="0 0 24 24" className="w-24 h-24">
          <path
            d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"
            fill="black"
          />
        </svg>
      ),
    },
    {
      name: "Snapchat",
      color: "#FFE818",
      hexCode: "#4334s",
      logo: (
        <svg viewBox="0 0 24 24" className="w-24 h-24">
          <path
            d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.36-.135-.553-.045-.195-.105-.42-.164-.575-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z"
            fill="black"
          />
        </svg>
      ),
    },
  ];

  //   const handlePrev = () => {
  //     setActiveIndex((prevIndex) =>
  //       prevIndex === 0 ? platforms.length - 1 : prevIndex - 1
  //     );
  //     setIsAutoplay(false);
  //   };

  //   const handleNext = () => {
  //     setActiveIndex((prevIndex) =>
  //       prevIndex === platforms.length - 1 ? 0 : prevIndex + 1
  //     );
  //     setIsAutoplay(false);
  //   };

  useEffect(() => {
    if (!isAutoplay) return;

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) =>
        prevIndex === platforms.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoplay, platforms.length]);

  // Calculate positions for each card to create a wheel-like, slanted arrangement
  const getCardPositions = (index: number) => {
    // Total number of platforms
    const count = platforms.length;

    // Calculate position relative to active index
    const position = (index - activeIndex + count) % count;

    // Card dimensions
    const cardWidth = 230;
    const cardHeight = 310;

    // For a wheel-like effect with slanting
    // Base values
    let xOffset = 0;
    let yOffset = 0;
    let zIndex = 5;
    let opacity = 1;
    let scale = 1;
    let rotateY = 0;
    const width = cardWidth;
    const height = cardHeight;

    switch (position) {
      case 0: // Center/active card
        xOffset = 0;
        yOffset = 0;
        zIndex = 50;
        scale = 1;
        rotateY = 0;
        break;
      case 1: // Right side, first card
        xOffset = cardWidth * 0.8;
        yOffset = -20;
        zIndex = 40;
        scale = 0.85;
        rotateY = 15;
        break;
      case 2: // Right side, second card
        xOffset = cardWidth * 1.4;
        yOffset = -40;
        zIndex = 30;
        opacity = 0.7;
        scale = 0.7;
        rotateY = 30;
        break;
      case count - 2: // Left side, second card
        xOffset = -cardWidth * 1.4;
        yOffset = -40;
        zIndex = 30;
        opacity = 0.7;
        scale = 0.7;
        rotateY = -30;
        break;
      case count - 1: // Left side, first card
        xOffset = -cardWidth * 0.8;
        yOffset = -20;
        zIndex = 40;
        scale = 0.85;
        rotateY = -15;
        break;
      default:
        // Hide other cards
        opacity = 0;
        zIndex = 0;
    }

    return {
      transform: `translateX(${xOffset}px) translateY(${yOffset}px) scale(${scale}) rotateY(${rotateY}deg)`,
      opacity,
      zIndex,
      width: `${width}px`,
      height: `${height}px`,
      perspective: "1000px",
      transformStyle: "preserve-3d" as React.CSSProperties["transformStyle"],
    };
  };

  return (
    <div className="w-full   rounded-xl overflow-hidden relative flex flex-col items-center justify-center">
      {/* Perspective container */}
      <div
        className="relative w-full h-96 flex items-center justify-center"
        style={{ perspective: "1200px" }}
      >
        {/* Carousel track */}
        <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
          {platforms.map((platform, index) => (
            <SocialMediaCard
              key={platform.name}
              platform={platform.name}
              color={platform.color}
              logo={platform.logo}
              hexCode={platform.hexCode}
              style={getCardPositions(index)}
            />
          ))}
        </div>
      </div>

      {/* <div className="mt-8 flex justify-center gap-2">
        {platforms.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all ${
              index === activeIndex ? "bg-white scale-125" : "bg-gray-400"
            }`}
            onClick={() => {
              setActiveIndex(index);
              setIsAutoplay(false);
            }}
          />
        ))}
      </div> */}

      {/* <button
        className="absolute left-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-full p-2 text-white"
        onClick={handlePrev}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        className="absolute right-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-full p-2 text-white"
        onClick={handleNext}
      >
        <ChevronRight className="w-6 h-6" />
      </button> */}
    </div>
  );
};

export default SocialCard;
