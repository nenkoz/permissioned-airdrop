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
                {isLoadingCampaigns && userTokenId && (
                    <div className="text-center py-8">
                        <div className="loading loading-spinner loading-lg text-[#915bf8]"></div>
                        <p className="mt-4 text-gray-500">Loading available campaigns...</p>
                    </div>
                )}

                {/* No Campaigns */}
                {!isLoadingCampaigns && userTokenId && claimableCampaigns.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                        <div className="text-6xl mb-4">🎯</div>
                        <h3 className="text-xl font-semibold mb-2">No Available Airdrops</h3>
                        <p className="text-gray-500">
                            There are currently no active campaigns available for your NFT token.
                        </p>
                    </div>
                )}

                {/* Campaigns List */}
                {claimableCampaigns.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        {/* Header with Select All */}
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-black">
                                Available Campaigns ({claimableCampaigns.length})
                            </h3>
                            <button
                                onClick={onSelectAll}
                                className="btn btn-sm btn-outline"
                            >
                                {selectedCampaigns.size === claimableCampaigns.length ? "Deselect All" : "Select All"}
                            </button>
                        </div>

                        {/* Campaigns */}
                        <div className="space-y-4 mb-6">
                            {claimableCampaigns.map((campaign, index) => (
                                <div
                                    key={campaign.id.toString()}
                                    className={`border rounded-lg p-4 transition-all ${selectedCampaigns.has(index)
                                        ? "border-[#915bf8] bg-purple-50/30"
                                        : "border-gray-200 hover:border-gray-300"
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 flex-1">
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-primary mt-1"
                                                checked={selectedCampaigns.has(index)}
                                                onChange={(e) => onCampaignSelect(index, e.target.checked)}
                                            />
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-lg">{campaign.name}</h4>
                                                <p className="text-gray-600 mb-2">{campaign.description}</p>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="font-medium">Domain:</span>
                                                        <div className="text-[#915bf8] font-mono">{campaign.targetDomain}</div>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Reward:</span>
                                                        <div className="text-green-600 font-semibold">
                                                            {formatEther(campaign.rewardPerNFT)} {formatTokenType(campaign.tokenAddress)}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Expires:</span>
                                                        <div className="text-orange-600">{formatTimeLeft(campaign.expiresAt)}</div>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Type:</span>
                                                        <div>{formatTokenType(campaign.tokenAddress)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary and Claim Button */}
                        {selectedCampaigns.size > 0 && (
                            <div className="border-t pt-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            {selectedCampaigns.size} campaign{selectedCampaigns.size !== 1 ? 's' : ''} selected
                                        </p>
                                        <p className="font-semibold">
                                            Total estimated rewards: ~{totalSelectedRewards.toFixed(4)} ETH*
                                        </p>
                                        <p className="text-xs text-gray-400">*Approximate for mixed token types</p>
                                    </div>
                                    {!isConnected ? (
                                        <div className="alert alert-warning bg-orange-50 border border-orange-200 max-w-xs">
                                            <span className="text-orange-700 text-sm">Connect your wallet to claim</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={onClaimSelected}
                                            disabled={isSubmitting}
                                            className={`btn px-8 bg-[#915bf8] rounded-lg border-none text-white hover:bg-[#915bf8]/80 hover:text-white ${isSubmitting ? "loading" : ""}`}
                                        >
                                            {isSubmitting
                                                ? "Claiming..."
                                                : `Claim ${selectedCampaigns.size > 1 ? "All" : "Reward"}`
                                            }
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
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