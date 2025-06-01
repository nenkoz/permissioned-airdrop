export enum StepKind {
  welcome,
  connectWallet,
  sendEmail,
  collectEmail,
  mintNft,
  success,
  createCampaign,
  claimAirdrops,
  campaigns,
}

export type StepMeta = {
  path: string;
  kind: StepKind;
  title: string;
  description: string;
  headerIcon?: string;
  index: number;
  backUrl?: string;
};

export const stepsMeta: Record<StepKind, StepMeta> = {
  [StepKind.welcome]: {
    path: "",
    kind: StepKind.welcome,
    title: "Domain NFT",
    description:
      'Mint an NFT with your email domain. For example, if you work at Ethereum Foundation, you can mint "ethereum.org" NFT. This showcases Email Proofs.',
    headerIcon: "/img/email-welcome-img.svg",
    index: 0,
  },
  [StepKind.connectWallet]: {
    path: "connect-wallet",
    kind: StepKind.connectWallet,
    title: "Mail based NFT",
    description:
      "To proceed to the next step, please connect your wallet now by clicking the button below.",
    backUrl: "",
    index: 1,
  },
  [StepKind.sendEmail]: {
    path: "send-email",
    kind: StepKind.sendEmail,
    title: "Send Email",
    description:
      "Please copy the details provided below and use them to send the email.",
    backUrl: "/",
    index: 2,
  },
  [StepKind.collectEmail]: {
    path: "collect-email",
    kind: StepKind.collectEmail,
    title: "Waiting...",
    description:
      "Our mailbox is processing your email. Please wait a few seconds.",
    backUrl: "send-email",
    index: 2,
  },
  [StepKind.mintNft]: {
    path: "mint-nft",
    kind: StepKind.mintNft,
    title: "Mint NFT",
    description: "Your email is ready for proving and minting.",
    backUrl: "send-email",
    index: 3,
  },
  [StepKind.success]: {
    path: "success",
    kind: StepKind.success,
    title: "Success",
    description: "",
    headerIcon: "/img/success-icon.svg",
    index: 4,
  },
  [StepKind.createCampaign]: {
    path: "create-campaign",
    kind: StepKind.createCampaign,
    title: "Create Campaign",
    description: "Create an airdrop campaign for domain-specific NFT holders",
    index: 5,
  },
  [StepKind.claimAirdrops]: {
    path: "claim-airdrops",
    kind: StepKind.claimAirdrops,
    title: "Claim Airdrops",
    description: "Claim rewards from airdrop campaigns",
    index: 6,
  },
  [StepKind.campaigns]: {
    path: "campaigns",
    kind: StepKind.campaigns,
    title: "Live Campaigns",
    description: "View all active airdrop campaigns with detailed statistics",
    index: 7,
  },
};
