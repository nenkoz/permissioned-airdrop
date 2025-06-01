import React from "react";
import { Link } from "react-router";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { formatEther } from "viem";

interface Campaign {
    id: bigint;
    creator: string;
    name: string;
    description: string;
    targetDomain: string;
    tokenAddress: string;
    totalFunds: bigint;
    distributedFunds: bigint;
    rewardPerNFT: bigint;
    isActive: boolean;
    createdAt: bigint;
    expiresAt: bigint;
}

interface ClaimAirdropsFormProps {
    userTokenId: string;
    claimableCampaigns: Campaign[];
    selectedCampaigns: Set<number>;
    isLoadingCampaigns: boolean;
    isSubmitting: boolean;
    error?: string;
    isConnected: boolean;
    onTokenIdChange: (tokenId: string) => void;
    onCampaignSelect: (campaignIndex: number, selected: boolean) => void;
    onSelectAll: () => void;
    onClaimSelected: () => void;
}

export const ClaimAirdropsForm: React.FC<ClaimAirdropsFormProps> = ({
    userTokenId,
    claimableCampaigns,
    selectedCampaigns,
    isLoadingCampaigns,
    isSubmitting,
    error,
    isConnected,
    onTokenIdChange,
    onCampaignSelect,
    onSelectAll,
    onClaimSelected,
}) => {
    const totalSelectedRewards = Array.from(selectedCampaigns).reduce((total, index) => {
        const campaign = claimableCampaigns[index];
        return total + (campaign ? Number(formatEther(campaign.rewardPerNFT)) : 0);
    }, 0);

    const formatRewardAmount = (rewardPerNFT: bigint, isETH: boolean) => {
        const amount = Number(rewardPerNFT) / 1e18;
        const tokenSymbol = isETH ? "ETH" : "tokens";

        // If amount is very small (less than 0.000001), use scientific notation
        if (amount < 0.000001 && amount > 0) {
            return `${amount.toExponential(2)} ${tokenSymbol}`;
        }

        // If amount is small but not tiny, show more decimals
        if (amount < 0.01) {
            return `${amount.toFixed(8)} ${tokenSymbol}`;
        }

        // For larger amounts, use fewer decimals
        return `${amount.toFixed(6)} ${tokenSymbol}`;
    };

    const formatTokenType = (tokenAddress: string) => {
        return tokenAddress === "0x0000000000000000000000000000000000000000" ? "ETH" : "ERC20";
    };

    const formatTimeLeft = (expiresAt: bigint) => {
        const now = Math.floor(Date.now() / 1000);
        const timeLeft = Number(expiresAt) - now;

        if (timeLeft <= 0) return "Expired";

        const days = Math.floor(timeLeft / (24 * 60 * 60));
        const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));

        if (days > 0) return `${days}d ${hours}h left`;
        return `${hours}h left`;
    };

    return (
        <div className="min-h-screen">
            {/* Navigation */}
            <div className="max-w-4xl mx-auto pt-6 pb-4 px-6">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                    <span>Back to Home</span>
                </Link>
            </div>

            {/* Header */}
            <div className="max-w-4xl mx-auto mb-8 px-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-black mb-4">
                        Claim Your Airdrops
                    </h1>
                    <p className="text-lg text-gray-500">
                        Enter your NFT Token ID to see available airdrops
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 pb-6">
                {/* Token ID Input */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold text-lg text-black">Your NFT Token ID</span>
                        </label>
                        <input
                            type="number"
                            placeholder="Enter your NFT token ID..."
                            className="input input-bordered input-lg w-full bg-purple-50/50 focus:border-[#915bf8] focus:outline-none focus:bg-white text-gray-900 placeholder-gray-500"
                            value={userTokenId}
                            onChange={(e) => onTokenIdChange(e.target.value)}
                        />
                        <label className="label">
                            <span className="label-text-alt text-sm text-gray-500">
                                Find your token ID in your wallet or from the NFT minting transaction
                            </span>
                        </label>
                    </div>
                </div>

                {/* Loading State */}
                {isLoadingCampaigns ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="loading loading-spinner loading-lg text-[#915bf8]"></div>
                        <span className="ml-4">Loading campaigns...</span>
                    </div>
                ) : claimableCampaigns.length > 0 ? (
                    <>
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Found {claimableCampaigns.length} claimable campaign{claimableCampaigns.length === 1 ? '' : 's'}
                            </p>
                            <button
                                type="button"
                                onClick={onSelectAll}
                                className="text-sm text-[#915bf8] hover:text-[#915bf8]/80"
                            >
                                {selectedCampaigns.size === claimableCampaigns.length ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {claimableCampaigns.map((campaign, index) => {
                                const isETH = campaign.tokenAddress === "0x0000000000000000000000000000000000000000";
                                const isSelected = selectedCampaigns.has(index);

                                return (
                                    <div
                                        key={index}
                                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${isSelected
                                            ? 'border-[#915bf8] bg-purple-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        onClick={() => onCampaignSelect(index, !isSelected)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
                                                <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
                                                <p className="text-sm text-purple-600 mt-1">@{campaign.targetDomain}</p>
                                            </div>
                                            <div className="text-right ml-4">
                                                <p className="font-bold text-green-600">
                                                    {formatRewardAmount(campaign.rewardPerNFT, isETH)}
                                                </p>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => onCampaignSelect(index, !isSelected)}
                                                    className="checkbox checkbox-sm checkbox-primary mt-2"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            onClick={onClaimSelected}
                            disabled={selectedCampaigns.size === 0 || isSubmitting}
                            className="btn bg-green-600 hover:bg-green-700 text-white w-full mt-4 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="loading loading-spinner loading-sm"></div>
                                    Processing...
                                </>
                            ) : (
                                `Claim Selected (${selectedCampaigns.size})`
                            )}
                        </button>
                    </>
                ) : userTokenId ? (
                    <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-4">🎉</div>
                        <p>No claimable campaigns found for token #{userTokenId}</p>
                        <p className="text-sm mt-2">Either no campaigns exist for your domain or you've already claimed all available rewards.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Step-by-step guide */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <div className="text-center mb-8">
                                <div className="text-6xl mb-4">🎁</div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Claim Your Airdrop Rewards</h2>
                                <p className="text-gray-600 text-lg">Follow these steps to claim your rewards from active campaigns</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Step 1 */}
                                <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">1</div>
                                        <h3 className="text-xl font-bold text-gray-900">Get Your NFT Token ID</h3>
                                    </div>
                                    <p className="text-gray-700 mb-4">You need an NFT minted with your email domain. If you don't have one:</p>
                                    <Link to="/mint-nft" className="btn bg-purple-600 hover:bg-purple-700 text-white text-sm">
                                        🎯 Mint Domain NFT
                                    </Link>
                                    <p className="text-sm text-gray-600 mt-3">
                                        Find your token ID in your wallet or from the NFT minting transaction
                                    </p>
                                </div>

                                {/* Step 2 */}
                                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">2</div>
                                        <h3 className="text-xl font-bold text-gray-900">Check Active Campaigns</h3>
                                    </div>
                                    <p className="text-gray-700 mb-4">See what campaigns are available for your email domain:</p>
                                    <Link to="/campaigns" className="btn bg-blue-600 hover:bg-blue-700 text-white text-sm">
                                        🎯 View Live Campaigns
                                    </Link>
                                    <p className="text-sm text-gray-600 mt-3">
                                        Look for campaigns targeting your email domain (e.g., @gmail.com, @university.edu)
                                    </p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="bg-green-50 rounded-xl p-6 border border-green-200 mt-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">3</div>
                                    <h3 className="text-xl font-bold text-gray-900">Enter Your Token ID Above</h3>
                                </div>
                                <p className="text-gray-700">
                                    Once you have your NFT token ID, enter it in the field above. The system will automatically find campaigns
                                    that match your email domain and show you available rewards to claim.
                                </p>
                            </div>
                        </div>

                        {/* Quick info about the system */}
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 How This Works</h3>
                            <div className="space-y-3 text-gray-700">
                                <p>• <strong>Domain-based airdrops:</strong> Campaigns target specific email domains (like @gmail.com or @company.com)</p>
                                <p>• <strong>NFT verification:</strong> Your NFT proves you own an email from the target domain</p>
                                <p>• <strong>Automatic matching:</strong> Enter your token ID and we'll find campaigns you're eligible for</p>
                                <p>• <strong>One-click claiming:</strong> Select campaigns and claim all rewards in one transaction</p>
                            </div>
                        </div>

                        {/* Current limitation note */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                            <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Current Limitation</h4>
                            <p className="text-yellow-800 text-sm">
                                Due to smart contract size optimizations, the automatic campaign discovery is currently simplified.
                                If you don't see campaigns after entering your token ID, check the campaigns page to see what's available
                                and contact campaign creators directly.
                            </p>
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="alert alert-error mt-4">
                        <span>Error: {error}</span>
                    </div>
                )}
            </div>
        </div>
    );
}; 