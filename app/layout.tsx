import type { Metadata } from "next";
import { Nunito, Orbitron, Montserrat } from "next/font/google";
import "./globals.css";
import AppWalletProvider from "./wallet/AppWalletProvider";
// import ContextProvider from "@/context";
// import AppCivicAuthProvider from "./wallet/AppWalletProvider";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-nunito",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["700"], // you can adjust the weight as needed
  variable: "--font-orbitron",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Cloutchain",
  description: "Bet on the Attention Economy",
  openGraph: {
    images: [
      {
        url: "https://res.cloudinary.com/dtfvdjvyr/image/upload/v1740208254/Screenshot_2025-02-22_at_08.09.20_pj2tzr.png",
        width: 1200,
        height: 630,
        alt: "Cloutchain Logo",
      },
    ],
  },
  twitter: {
    title: "Cloutchain",
    description: "Bet on the Attention Economy",
    images: [
      {
        url: "https://res.cloudinary.com/dtfvdjvyr/image/upload/v1740208254/Screenshot_2025-02-22_at_08.09.20_pj2tzr.png",
        alt: "Cloutchain Logo",
      },
    ],
    creator: "",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const CIVIC_CLIENT_ID = process.env.NEXT_PUBLIC_CIVIC_CLIENT_ID || "";
  return (
    <html lang="en">
      <body
        className={`${nunito.className} ${orbitron.className}  ${montserrat.className} antialiased`}
      >
        <AppWalletProvider>{children}</AppWalletProvider>
      </body>
    </html>
  );
}
