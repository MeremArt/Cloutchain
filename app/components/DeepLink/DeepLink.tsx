import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

const useWalletDeepLink = () => {
  const { wallet, connect, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  const initiateDeepLink = async () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const targetUrl = "https://www.cloutchain.xyz";

    if (wallet && isMobile) {
      // Encode the target URL to redirect to after wallet connection
      const pajCashUrl = encodeURIComponent(targetUrl);
      let deepLinkUrl = "";

      if (wallet.adapter.name === "Phantom") {
        // For Phantom, we can use the dapp parameter to specify the URL to open in wallet browser
        deepLinkUrl = `phantom://browse/${pajCashUrl}`;
      } else if (wallet.adapter.name === "Solflare") {
        // For Solflare, use the dapp URL format
        deepLinkUrl = `solflare://dapp/${pajCashUrl}`;
      } else if (wallet.adapter.name === "Backpack") {
        // For Backpack
        deepLinkUrl = `backpack://browse?url=${pajCashUrl}`;
      }

      if (deepLinkUrl) {
        window.location.href = deepLinkUrl;
        return;
      }
    }

    try {
      if (wallet) {
        // If wallet is selected but not connected
        await connect();
      } else {
        // If no wallet is selected, open the wallet modal
        setVisible(true);
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };
  const handleDisconnect = () => {
    if (disconnect) {
      disconnect();
    }
  };

  return { initiateDeepLink, handleDisconnect };
};

export default useWalletDeepLink;
