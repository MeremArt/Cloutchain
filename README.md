## Overview

CloutChain is a decentralized Web3 platform that empowers content creators—especially on TikTok—to monetize their influence via instant tipping in the proprietary `$SOL` token on Solana. Creators generate a personalized tip–link (e.g. `cloutchain.com/@username`), share it with their audience, and receive real‑time on‑chain tips via Solana wallets or credit cards ([GitHub][1]). The platform also supports traditional email/password auth alongside Civic Auth Web3 integration and plans to enable fiat withdrawals through merchant systems (coming soon) and direct token transfers to wallets.

## Key Features

- **Tip‑Link Generation**
  Each creator gets a unique vanity URL (`/@[handle]`) that fans visit to send `$SONIC` tips instantly ([GitHub][1]).
- **Traditional & Civic Auth**
  Supports email/password sign‑up plus seamless blockchain‑wallet auth via Civic Auth Web3, provisioning an embedded Solana wallet for each creator ([GitHub][1]).
- **Instant On‑Chain Tipping**
  Fans can tip using Phantom, Solflare, or credit‑card on‑ramps powered by Crossmint/MoonPay, with real‑time notifications via Firebase ([GitHub][1]).
- **Global Cash‑Out (Coming Soon)**
  Withdraw `$SONIC` to local currency through integrated merchant systems (e.g., MoonPay, M‑Pesa), turning on‑chain earnings into spendable fiat ([GitHub][1]).
- **Direct Wallet Transfers**
  Move tokens between Solana wallets (ERC‑20‑style SPL transfers) using `@solana/web3.js` and `@solana/spl‑token` adapters ([GitHub][1]).
- **Live‑Stream Overlays**
  Generate time‑sensitive QR codes and tip codes for live videos, refreshing every 15 minutes to secure transactions ([GitHub][1]).
- **Treasury‑Backed Stability**
  Built‑in buyback and burn mechanisms for `$SONIC` to maintain token value integrity ([GitHub][1]).

## Tech Stack

- **Frontend**: React 18, TypeScript, Next.js, Tailwind CSS ([GitHub][1])
- **Blockchain & Wallets**: `@solana/web3.js`, Solana Wallet Adapter, Viem (via Civic Auth) ([GitHub][1])
- **Payments**: Solana Pay, Crossmint (credit‑card on‑ramp), MoonPay ([GitHub][1])
- **Real‑Time**: Firebase Realtime Database for tipping events & notifications ([GitHub][1])
- **QR Codes**: `react-qr-code` for overlay generation ([GitHub][1])
- **Testing**: Jest, Cypress ([GitHub][1])

## Installation & Setup

1. **Clone the repo**

   ```bash
   git clone https://github.com/MeremArt/Cloutchain.git
   cd Cloutchain
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment**
   Copy and edit the example file:

   ```bash
   cp .env.example .env
   ```

   - `NEXT_PUBLIC_SOLANA_NETWORK` (e.g., `devnet` or `mainnet-beta`)
   - `NEXT_PUBLIC_CLOUTCHAIN_API_KEY`
   - `NEXT_PUBLIC_TREASURY_ADDRESS`
   - `NEXT_PUBLIC_MOONPAY_KEY` ([GitHub][1])

4. **Run locally**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication Flow

### Traditional Email/Password

- User registers with email and password.
- Backend issues a JSON Web Token (JWT) stored in an HTTP‑only cookie.

### Civic Auth Web3

1. **Sign‑In with Web3**: User selects wallet (Phantom, Solflare) in the modal.
2. **Wallet Provisioning**: If no wallet exists, `createWallet()` generates one and encrypts key material via Civic ([GitHub][1]).
3. **Session Management**: Civic’s middleware validates sessions at the Edge, redirecting unauthenticated users to login pages automatically.

## Tip Link Generation

1. Creator logs in and navigates to their dashboard.
2. Click “Generate Tip Link” to create or refresh their unique URL (`/[username]`).
3. Share the link in social profiles—fans access it to see the live tipping interface.

## Withdrawals & Transfers

### To Local Currency (Merchant System)

- **Coming Soon**: Integration with MoonPay, M‑Pesa, etc.
- Creator will select “Cash Out,” enter amount, and choose a payment method.
- Funds settle in local currency within 1–3 business days.

### Wallet‑to‑Wallet Transfers

- User initiates a transfer by specifying recipient address and amount.
- The frontend builds a Solana transaction (`SystemProgram.transfer` ) for SOL and signs via the wallet adapter.
- Transaction is sent and confirmed (`sendAndConfirmTransaction`) before UI updates.

## Roadmap

- **Merchant Payouts**: Fiat withdrawals via multiple processors.
- **Analytics Dashboard**: Real‑time graphs showing tipping trends.
- **Multi‑Chain Support**: Extend beyond Solana to Ethereum L2s.
- **Mobile SDK**: Embed CloutChain tipping into third‑party apps.

## Contributing

1. Fork the repo and create your feature branch.
2. Write unit tests for new code (Jest/Cypress).
3. Submit a pull request against `main`.
4. Ensure all checks pass (CI/CD on GitHub Actions).
