import proverSpec from "../out/EmailDomainProver.sol/EmailDomainProver";
import verifierSpec from "../out/EmailProofVerifier.sol/EmailDomainVerifier";

import {
  deployVlayerContracts,
  writeEnvVariables,
  getConfig,
} from "@vlayer/sdk/config";

import { execSync } from "child_process";

const config = getConfig();

console.log("🚀 Starting contract deployment...");

const { prover, verifier } = await deployVlayerContracts({
  proverSpec,
  verifierSpec,
  proverArgs: [],
  verifierArgs: [],
});

console.log("📝 Prover address:", prover);
console.log("📝 Verifier address:", verifier);

// Deploy CampaignManager contract automatically
console.log("🏗️  Deploying CampaignManager contract...");

let campaignManagerAddress = "";

try {
  // Check if forge is available
  try {
    execSync("forge --version", { stdio: "ignore" });
  } catch {
    throw new Error("Forge is not installed or not in PATH. Please install Foundry: https://book.getfoundry.sh/getting-started/installation");
  }

  // Build the contracts first
  console.log("🔨 Building contracts...");
  execSync("forge build", { cwd: "..", stdio: "inherit" });

  // Deploy CampaignManager with the verifier address
  console.log("🚀 Deploying CampaignManager...");
  const deployCommand = `forge script script/CampaignManager.s.sol --fork-url ${config.jsonRpcUrl} --private-key ${config.privateKey} --broadcast`;

  const deployResult = execSync(deployCommand, {
    cwd: "..",
    encoding: "utf-8",
    stdio: ["inherit", "pipe", "inherit"]
  });

  // Parse the deployment result to extract the contract address
  const lines = deployResult.split('\n');

  // Look for the deployment log in the output
  for (const line of lines) {
    if (line.includes("CampaignManager deployed at:")) {
      const match = line.match(/0x[a-fA-F0-9]{40}/);
      if (match) {
        campaignManagerAddress = match[0];
        break;
      }
    }
  }

  // If we couldn't find it in the logs, try to extract from transaction receipt
  if (!campaignManagerAddress) {
    for (const line of lines) {
      if (line.includes("Contract Address:") || line.includes("contractAddress")) {
        const match = line.match(/0x[a-fA-F0-9]{40}/);
        if (match) {
          campaignManagerAddress = match[0];
          break;
        }
      }
    }
  }

  if (!campaignManagerAddress) {
    throw new Error("Could not extract CampaignManager address from deployment output. Check the deployment logs above.");
  }

  console.log("✅ CampaignManager deployed at:", campaignManagerAddress);

} catch (error) {
  console.error("❌ Failed to deploy CampaignManager:", (error as Error).message);
  console.log("⚠️  Using fallback address for development...");
  console.log("   This means you'll be using an older contract that might not have all the latest functions.");
  campaignManagerAddress = "0xD2F3F79699D0Bbb5c3Ce24328cfAcb87b08e6DC5";

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

  console.log("🔄 Continuing with fallback address...");
  console.log("💡 To use the latest contract, ensure you have:");
  console.log("   - Foundry installed (curl -L https://foundry.paradigm.xyz | bash)");
  console.log("   - Private key with testnet ETH");
  console.log("   - Valid RPC URL");
  process.exit(0);
}

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

console.log("✅ All contracts deployed successfully!");
console.log("📝 Prover address:", prover);
console.log("📝 Verifier address:", verifier);
console.log("📝 Campaign Manager address:", campaignManagerAddress);
console.log("");
console.log("🚀 Ready to test campaign creation at: http://localhost:5173/create-campaign");
