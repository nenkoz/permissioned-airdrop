"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { zksync, anvil, mainnet } from "wagmi/chains";

export default getDefaultConfig({
    chains: [zksync, anvil, mainnet],
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    appName: "Permissioned Airdrop",
    ssr: false
});
