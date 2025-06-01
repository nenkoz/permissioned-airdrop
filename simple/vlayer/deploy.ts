import proverSpec from "../out/EmailDomainProver.sol/EmailDomainProver";
import verifierSpec from "../out/EmailProofVerifier.sol/EmailDomainVerifier";

import {
  deployVlayerContracts,
  writeEnvVariables,
  getConfig,
} from "@vlayer/sdk/config";

const config = getConfig();

const { prover, verifier } = await deployVlayerContracts({
  proverSpec,
  verifierSpec,
  proverArgs: [],
  verifierArgs: [],
});

// Use the latest deployed CampaignManager address that matches the current verifier
const campaignManagerAddress = "0xD2F3F79699D0Bbb5c3Ce24328cfAcb87b08e6DC5";

await writeEnvVariables(".env", {
  VITE_PROVER_ADDRESS: prover,
  VITE_VERIFIER_ADDRESS: verifier,
  VITE_CAMPAIGN_MANAGER_ADDRESS: campaignManagerAddress,
  VITE_CHAIN_NAME: config.chainName,
  VITE_PROVER_URL: config.proverUrl,
  VITE_JSON_RPC_URL: config.jsonRpcUrl,
  VITE_PRIVATE_KEY: config.privateKey,
  VITE_DNS_SERVICE_URL: config.dnsServiceUrl,
  VITE_VLAYER_API_TOKEN: config.token,
  VITE_EMAIL_SERVICE_URL: process.env.EMAIL_SERVICE_URL || "",
  VITE_GAS_LIMIT: config.gasLimit,
});

console.log("✅ Vlayer contracts deployed successfully!");
console.log("📝 Prover address:", prover);
console.log("📝 Verifier address:", verifier);
console.log("📝 Campaign Manager address:", campaignManagerAddress);
console.log("");
console.log("🚀 Ready to test campaign creation at: http://localhost:5173/create-campaign");
