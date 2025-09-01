// app/layout.tsx
import "./globals.css";
import { Nunito, Orbitron, Montserrat } from "next/font/google";

import AppWalletProvider from "./wallet/AppWalletProvider";
// import AppAmplifyProvider from "./provider/AppAmplifyProvider";
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-nunito",
});
const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-orbitron",
});
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
});

export const metadata = {
  title: "Cloutchain",
  description: "Bet on the Attention Economy",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${nunito.className} ${orbitron.className} ${montserrat.className} antialiased`}
      >
        <AppWalletProvider>
          <AppWalletProvider>{children}</AppWalletProvider>
        </AppWalletProvider>
      </body>
    </html>
  );
}
