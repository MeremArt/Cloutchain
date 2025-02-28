"use client";
import { solanaWeb3JsAdapter, projectId, networks } from "../config";
import { createAppKit } from "@reown/appkit/react";
import React, { type ReactNode } from "react";

// Set up metadata
const metadata = {
  name: "Cloutchain",
  description: "next-reown-appkit",
  url: "https://github.com/0xonerb/next-reown-appkit-ssr", // origin must match your domain & subdomain
  icons: [
    "https://res.cloudinary.com/dtfvdjvyr/image/upload/v1735811850/pajj_coku5v.png",
  ],
};

// Create the modal
export const modal = createAppKit({
  adapters: [solanaWeb3JsAdapter],
  projectId: projectId || "",
  networks,
  metadata,
  themeMode: "dark",
  features: {
    analytics: false, // Optional - defaults to your Cloud configuration
    email: false,
    socials: false,
    allWallets: false,
    onramp: false,
    emailShowWallets: false,
  },
  themeVariables: {
    "--w3m-accent": "#E64A19",
  },
});

function ContextProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export default ContextProvider;
