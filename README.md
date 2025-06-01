This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# 🎯 Permissioned Airdrop Platform

**Domain-based token distribution using vlayer email proofs and blockchain verification**

A comprehensive Web3 platform that enables **targeted airdrop campaigns** for users who can prove ownership of email addresses from specific domains (like @coindesk.com, @techcrunch.com, @company.com). Built with vlayer's zero-knowledge email verification technology and Blockscout integration for complete transparency.

## 🌟 What It Does

This platform solves the problem of **targeted marketing and community engagement** in Web3 by allowing:

- **Campaign Creators** to launch airdrops targeting specific email domains
- **Domain Holders** to prove their affiliation without revealing their email addresses
- **Automated Distribution** of tokens to verified domain members
- **Complete Transparency** through blockchain verification and Blockscout integration

## 🔄 How It Works

### 1. **Domain Verification & NFT Minting**
- Users send an email with their wallet address to the vlayer system
- vlayer generates a **zero-knowledge proof** of domain ownership without exposing the email
- Upon verification, users receive a **domain-specific NFT** as their credential
- Email addresses remain completely private throughout the process

### 2. **Campaign Creation**
- Campaign creators choose target email domains (e.g., "@coindesk.com")
- Set reward amounts, campaign duration, and fund the campaign with ETH or ERC20 tokens
- Platform takes a 2.5% fee from funded amounts
- Campaigns become immediately available for eligible users

### 3. **Reward Distribution**
- NFT holders can discover and claim rewards from campaigns targeting their domain
- Smart contracts automatically verify NFT ownership and domain matching
- Support for both single claims and batch claiming across multiple campaigns
- Anti-fraud protection ensures each NFT can only claim once per campaign

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   vlayer SDK     │    │  Smart Contracts │
│   (Next.js)     │◄──►│   (ZK Proofs)    │◄──►│   (Solidity)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Wallet        │    │   Email Proof    │    │   Blockscout    │
│   Integration   │    │   Generation     │    │   Explorer      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Core Components

#### **Smart Contracts**
- **`CampaignManager.sol`** - Handles campaign lifecycle, funding, and reward distribution
- **`EmailDomainProver.sol`** - vlayer prover for generating email domain proofs
- **`EmailProofVerifier.sol`** - Verifies proofs and mints domain NFTs

#### **Frontend Application**
- **Next.js + TypeScript** - Modern React application
- **Wagmi + RainbowKit** - Wallet connectivity and blockchain interactions
- **Tailwind CSS** - Responsive, modern UI design

#### **vlayer Integration**
- **Zero-Knowledge Proofs** - Privacy-preserving email verification
- **Domain Extraction** - Automatic parsing of email domains from proofs
- **NFT Minting** - Automatic credential generation upon successful verification

## 🛠️ Tech Stack

### **Blockchain & Smart Contracts**
- **Solidity** - Smart contract development
- **Foundry** - Development framework and testing
- **OpenZeppelin** - Security-audited contract libraries
- **Multi-chain Support** - Ethereum, Arbitrum, Optimism, Base, zkSync

### **Frontend**
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Wagmi** - React hooks for Ethereum
- **RainbowKit** - Wallet connection interface
- **Tailwind CSS** - Utility-first CSS framework

### **Privacy & Verification**
- **vlayer SDK** - Zero-knowledge email proof generation
- **Email Verification** - DKIM signature validation
- **Regex Parsing** - Automated domain extraction

### **Infrastructure**
- **Blockscout** - Blockchain explorer integration
- **IPFS** - Decentralized metadata storage
- **Multi-network deployment**

## 🚀 Features

### **For Campaign Creators**
- ✅ Target specific email domains for airdrops
- ✅ Support for both ETH and ERC20 token rewards
- ✅ Customizable campaign duration and rewards
- ✅ Real-time campaign analytics and fund management
- ✅ Withdraw unused funds after campaign expiration

### **For Domain Holders**
- ✅ Privacy-preserving domain verification via email proofs
- ✅ One-time NFT minting per email address
- ✅ Automatic discovery of eligible campaigns
- ✅ Batch claiming from multiple campaigns
- ✅ Transferable domain credentials (NFTs)

### **Platform Features**
- ✅ Complete transparency via Blockscout integration
- ✅ Gas-optimized batch operations
- ✅ Anti-fraud protection and duplicate prevention
- ✅ Multi-chain deployment support
- ✅ Real-time campaign statistics

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Git


## 🌐 Deployed Contracts

### **Mainnet Deployments**
> 🚧 Coming soon - contracts will be deployed to mainnet after thorough testing

### **Testnet Deployments**

#### **Optimism Sepolia**
- **CampaignManager**: `0x6663eeE85B88Fe6cA7B461D958aac4f08379f22c`
- **EmailDomainProver**: `0xb8478f3106fb097ef9208af799a69e4065aafbc8`
- **EmailDomainVerifier**: `0x688858bfb37bc272505a7b12d23bb7fd8940bcc0`
- **Blockscout**: https://optimism-sepolia.blockscout.com

## 🎮 Usage Guide

### **For Users (Domain Verification)**

1. **Connect Your Wallet**
   - Visit the platform and connect your Web3 wallet
   - Ensure you're on a supported network

2. **Verify Your Email Domain**
   - Click "Mint Domain NFT"
   - Send verification email with your wallet address
   - Wait for vlayer proof generation and NFT minting

3. **Claim Rewards**
   - Browse available campaigns targeting your domain
   - Claim rewards individually or batch claim from multiple campaigns

### **For Campaign Creators**

1. **Create Campaign**
   - Connect wallet and navigate to "Create Campaign"
   - Choose target domain, reward amount, and duration
   - Fund campaign with ETH or ERC20 tokens

2. **Manage Campaign**
   - Monitor campaign progress and claims
   - View detailed analytics on Blockscout
   - Withdraw unused funds after expiration

## 🔒 Security & Privacy

- **Zero-Knowledge Proofs**: Email addresses never leave your device
- **Smart Contract Security**: Built with OpenZeppelin audited libraries
- **Blockscout Verification**: All transactions publicly verifiable
- **Domain Ownership**: Cryptographically proven via DKIM signatures
- **Anti-Fraud**: Multiple layers of duplicate prevention

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Built with ❤️ using vlayer, powered by Blockscout transparency**
