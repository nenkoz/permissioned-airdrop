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

interface UserNFT {
    tokenId: bigint;
    domain: string;
    claimableCampaigns: Campaign[];
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
    // Auto-discovery props
    autoDiscoveryMode: boolean;
    userNFTs: UserNFT[];
    isAutoDiscovering: boolean;
    totalClaimableRewards: { eth: number; tokens: Map<string, number> };
    onAutoDiscoveryToggle: (enabled: boolean) => void;
    onAutoDiscover: () => void;
    onAutoClaimAll: () => void;
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
    // Auto-discovery props
    autoDiscoveryMode,
    userNFTs,
    isAutoDiscovering,
    totalClaimableRewards,
    onAutoDiscoveryToggle,
    onAutoDiscover,
    onAutoClaimAll,
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
                        {autoDiscoveryMode
                            ? "Automatically discover all your eligible NFTs and claimable rewards"
                            : "Enter your NFT Token ID to see available airdrops"
                        }
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 pb-6">
                {/* Mode Toggle */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Claim Mode</h3>
                        <div className="flex items-center gap-3">
                            <span className={`text-sm ${!autoDiscoveryMode ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                                Manual
                            </span>
                            <input
                                type="checkbox"
                                className="toggle toggle-primary"
                                checked={autoDiscoveryMode}
                                onChange={(e) => onAutoDiscoveryToggle(e.target.checked)}
                            />
                            <span className={`text-sm ${autoDiscoveryMode ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                                🤖 Auto-Discovery
                            </span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600">
                        {autoDiscoveryMode
                            ? "Automatically find all your NFTs and discover claimable rewards using vlayer's blockchain reading capabilities"
                            : "Manually enter your NFT token ID to claim rewards from specific campaigns"
                        }
                    </p>
                </div>

                {autoDiscoveryMode ? (
                    /* Auto-Discovery Mode */
                    <>
                        {/* Auto-Discovery Controls */}
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl shadow-sm border border-purple-200 p-6 mb-6">
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">🤖 Automated NFT Discovery</h3>
                                <p className="text-gray-600 mb-4">
                                    Using vlayer's blockchain reading capabilities to scan all your NFTs and find claimable rewards
                                </p>
                                {!isAutoDiscovering && userNFTs.length === 0 && (
                                    <button
                                        onClick={onAutoDiscover}
                                        disabled={!isConnected}
                                        className="btn bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8"
                                    >
                                        {!isConnected ? "Connect Wallet First" : "🔍 Discover My Rewards"}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Auto-Discovery Loading */}
                        {isAutoDiscovering && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
                                <div className="text-center">
                                    <div className="loading loading-spinner loading-lg text-purple-600 mb-4"></div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Scanning Your NFTs...</h3>
                                    <p className="text-gray-600">
                                        Checking token ownership and scanning for claimable campaigns.<br />
                                        This process uses vlayer's blockchain reading capabilities to discover all your rewards.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Auto-Discovery Results */}
                        {!isAutoDiscovering && userNFTs.length > 0 && (
                            <>
                                {/* Summary */}
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-sm border border-green-200 p-6 mb-6">
                                    <div className="text-center">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">🎉 Rewards Found!</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div>
                                                <div className="text-2xl font-bold text-purple-600">{userNFTs.length}</div>
                                                <div className="text-sm text-gray-600">Eligible NFTs</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {userNFTs.reduce((total, nft) => total + nft.claimableCampaigns.length, 0)}
                                                </div>
                                                <div className="text-sm text-gray-600">Claimable Campaigns</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-green-600">
                                                    {totalClaimableRewards.eth.toFixed(4)} ETH
                                                </div>
                                                <div className="text-sm text-gray-600">Total ETH Rewards</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={onAutoClaimAll}
                                            disabled={isSubmitting}
                                            className="btn bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8"
                                        >
                                            {isSubmitting ? "Claiming..." : "🚀 Claim All Rewards"}
                                        </button>
                                    </div>
                                </div>

                                {/* NFT Details */}
                                <div className="space-y-4">
                                    {userNFTs.map((nft, index) => (
                                        <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        NFT #{nft.tokenId.toString()} - @{nft.domain}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                        {nft.claimableCampaigns.length} claimable campaign{nft.claimableCampaigns.length === 1 ? '' : 's'}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-green-600">
                                                        {nft.claimableCampaigns.reduce((total, campaign) => {
                                                            const amount = Number(campaign.rewardPerNFT) / 1e18;
                                                            return total + (campaign.tokenAddress === "0x0000000000000000000000000000000000000000" ? amount : 0);
                                                        }, 0).toFixed(6)} ETH
                                                    </div>
                                                    <div className="text-xs text-gray-500">Total Rewards</div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                {nft.claimableCampaigns.map((campaign, campaignIndex) => {
                                                    const isETH = campaign.tokenAddress === "0x0000000000000000000000000000000000000000";
                                                    return (
                                                        <div key={campaignIndex} className="bg-gray-50 rounded-lg p-3">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <h5 className="font-semibold text-gray-900">{campaign.name}</h5>
                                                                    <p className="text-xs text-gray-600">{campaign.description}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="font-bold text-green-600">
                                                                        {formatRewardAmount(campaign.rewardPerNFT, isETH)}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">{formatTokenType(campaign.tokenAddress)}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* No Rewards Found */}
                        {!isAutoDiscovering && userNFTs.length === 0 && isConnected && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                                <div className="text-6xl mb-4">😔</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No Claimable Rewards Found</h3>
                                <p className="text-gray-600 mb-4">
                                    We couldn't find any NFTs in your wallet with claimable rewards. Try creating a domain NFT first!
                                </p>
                                <Link to="/connect-wallet" className="btn bg-purple-600 text-white">
                                    Mint Domain NFT
                                </Link>
                            </div>
                        )}
                    </>
                ) : (
                    /* Manual Mode */
                    <>
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
                                        <span className="loading loading-spinner loading-sm"></span>
                                    ) : (
                                        `Claim Selected (${totalSelectedRewards.toFixed(6)} ETH)`
                                    )}
                                </button>
                            </>
                        ) : userTokenId ? (
                            <div className="text-center py-8">
                                <div className="text-4xl mb-4">📭</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Claimable Campaigns</h3>
                                <p className="text-gray-600">
                                    No active campaigns found for this NFT token. Check back later or verify your token ID.
                                </p>
                            </div>
                        ) : null}
                    </>
                )}

                {/* Error Display */}
                {error && (
                    <div className="alert alert-error mt-4">
                        <span>{error}</span>
                    </div>
                )}
            </div>
        </div>
    );
}; 