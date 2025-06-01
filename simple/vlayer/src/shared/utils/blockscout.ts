// Blockscout Integration Utilities
// Using Blockscout as our primary blockchain explorer for enhanced transparency

const BLOCKSCOUT_BASE_URL = "https://eth-sepolia.blockscout.com"; // Sepolia testnet

/**
 * Generate Blockscout URL for viewing a transaction
 * @param txHash - Transaction hash
 * @returns Blockscout transaction URL
 */
export const getBlockscoutTxUrl = (txHash: string): string => {
    return `${BLOCKSCOUT_BASE_URL}/tx/${txHash}`;
};

/**
 * Generate Blockscout URL for viewing a contract
 * @param contractAddress - Contract address
 * @returns Blockscout contract URL
 */
export const getBlockscoutContractUrl = (contractAddress: string): string => {
    return `${BLOCKSCOUT_BASE_URL}/address/${contractAddress}`;
};

/**
 * Generate Blockscout URL for viewing an address
 * @param address - Wallet or contract address
 * @returns Blockscout address URL
 */
export const getBlockscoutAddressUrl = (address: string): string => {
    return `${BLOCKSCOUT_BASE_URL}/address/${address}`;
};

/**
 * Generate Blockscout URL for viewing a token
 * @param tokenAddress - Token contract address
 * @returns Blockscout token URL
 */
export const getBlockscoutTokenUrl = (tokenAddress: string): string => {
    return `${BLOCKSCOUT_BASE_URL}/token/${tokenAddress}`;
};

/**
 * Generate Blockscout API URL for contract verification
 * @param contractAddress - Contract address
 * @returns Blockscout API URL for verification status
 */
export const getBlockscoutApiUrl = (contractAddress: string): string => {
    return `${BLOCKSCOUT_BASE_URL}/api/v2/smart-contracts/${contractAddress}`;
};

/**
 * Shortened address format for display
 * @param address - Full address
 * @returns Shortened address (0x1234...5678)
 */
export const shortenAddress = (address: string): string => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Open Blockscout link in new tab
 * @param url - Blockscout URL to open
 */
export const openBlockscoutLink = (url: string): void => {
    window.open(url, '_blank', 'noopener,noreferrer');
}; 