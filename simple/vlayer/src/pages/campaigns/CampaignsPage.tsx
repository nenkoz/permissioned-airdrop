import React from "react";
import { Link } from "react-router";
import { useReadContract } from "wagmi";
import { formatEther } from "viem";
import { ChevronLeftIcon, ClockIcon, CurrencyDollarIcon, UsersIcon } from "@heroicons/react/24/outline";

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

const CampaignCard: React.FC<{ campaign: Campaign; campaignId: number }> = ({ campaign, campaignId }) => {
    const isETH = campaign.tokenAddress === "0x0000000000000000000000000000000000000000";
    const remainingFunds = campaign.totalFunds - campaign.distributedFunds;
    const progressPercentage = campaign.totalFunds > 0n
        ? Number((campaign.distributedFunds * 100n) / campaign.totalFunds)
        : 0;

    const timeLeft = Number(campaign.expiresAt) * 1000 - Date.now();
    const daysLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24)));

    const formatAddress = (address: string) =>
        `${address.slice(0, 6)}...${address.slice(-4)}`;

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{campaign.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{campaign.description}</p>
                    <div className="flex items-center gap-2 text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full w-fit">
                        <span>@{campaign.targetDomain}</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                        {isETH ? `${formatEther(campaign.rewardPerNFT)} ETH` : `${formatEther(campaign.rewardPerNFT)} tokens`}
                    </div>
                    <div className="text-sm text-gray-500">per NFT</div>
                </div>
            </div>

            <div className="space-y-4">
                {/* Progress Bar */}
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Distribution Progress</span>
                        <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <CurrencyDollarIcon className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                        <div className="text-sm text-gray-600">Remaining</div>
                        <div className="font-semibold text-blue-700">
                            {isETH ? `${formatEther(remainingFunds)}` : formatEther(remainingFunds)}
                        </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                        <UsersIcon className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                        <div className="text-sm text-gray-600">Claims</div>
                        <div className="font-semibold text-purple-700">
                            {campaign.totalFunds > 0n
                                ? Number(campaign.distributedFunds / campaign.rewardPerNFT)
                                : 0}
                        </div>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-3 text-center">
                        <ClockIcon className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                        <div className="text-sm text-gray-600">Days Left</div>
                        <div className="font-semibold text-orange-700">
                            {daysLeft}
                        </div>
                    </div>
                </div>

                {/* Campaign Details */}
                <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Campaign ID:</span>
                        <span className="font-mono">#{campaignId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Creator:</span>
                        <span className="font-mono">{formatAddress(campaign.creator)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Pool:</span>
                        <span className="font-semibold">
                            {isETH ? `${formatEther(campaign.totalFunds)} ETH` : `${formatEther(campaign.totalFunds)} tokens`}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Expires:</span>
                        <span>{new Date(Number(campaign.expiresAt) * 1000).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const CampaignsPage: React.FC = () => {
    const { data: campaignsData, isLoading, error } = useReadContract({
        address: import.meta.env.VITE_CAMPAIGN_MANAGER_ADDRESS as `0x${string}`,
        abi: [
            {
                inputs: [],
                name: "getAllActiveCampaigns",
                outputs: [
                    {
                        name: "", type: "tuple[]", components: [
                            { name: "id", type: "uint256" },
                            { name: "creator", type: "address" },
                            { name: "name", type: "string" },
                            { name: "description", type: "string" },
                            { name: "targetDomain", type: "string" },
                            { name: "tokenAddress", type: "address" },
                            { name: "totalFunds", type: "uint256" },
                            { name: "distributedFunds", type: "uint256" },
                            { name: "rewardPerNFT", type: "uint256" },
                            { name: "isActive", type: "bool" },
                            { name: "createdAt", type: "uint256" },
                            { name: "expiresAt", type: "uint256" },
                        ]
                    },
                    { name: "", type: "uint256[]" }
                ],
                stateMutability: "view",
                type: "function",
            },
        ],
        functionName: "getAllActiveCampaigns",
    });

    const campaigns = campaignsData?.[0] as Campaign[] | undefined;
    const campaignIds = campaignsData?.[1] as bigint[] | undefined;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center py-20">
                        <div className="loading loading-spinner loading-lg text-[#915bf8]"></div>
                        <span className="ml-4 text-lg">Loading campaigns...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Failed to Load Campaigns</h2>
                        <p className="text-gray-600 mb-6">There was an error loading the campaign data.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn bg-[#915bf8] hover:bg-[#915bf8]/90 text-white"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to="/"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ChevronLeftIcon className="h-5 w-5 mr-2" />
                        Back to Home
                    </Link>

                    <div className="text-center">
                        <h1 className="text-4xl xl:text-5xl font-bold text-gray-900 mb-4">
                            🎯 Live Campaigns
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Explore all active airdrop campaigns and their detailed statistics
                        </p>
                    </div>
                </div>

                {/* Campaigns Grid */}
                {campaigns && campaigns.length > 0 ? (
                    <>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-[#915bf8] mb-2">
                                        {campaigns.length}
                                    </div>
                                    <div className="text-gray-600">Active Campaigns</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-green-600 mb-2">
                                        {campaigns.reduce((acc, campaign) => {
                                            return acc + (campaign.totalFunds > 0n
                                                ? Number(campaign.distributedFunds / campaign.rewardPerNFT)
                                                : 0);
                                        }, 0)}
                                    </div>
                                    <div className="text-gray-600">Total Claims</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-blue-600 mb-2">
                                        {campaigns.reduce((acc, campaign) => {
                                            return acc + Number(formatEther(campaign.totalFunds - campaign.distributedFunds));
                                        }, 0).toFixed(4)}
                                    </div>
                                    <div className="text-gray-600">ETH Available</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {campaigns.map((campaign, index) => (
                                <CampaignCard
                                    key={index}
                                    campaign={campaign}
                                    campaignId={campaignIds ? Number(campaignIds[index]) : index + 1}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-6">🎭</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">No Active Campaigns</h2>
                        <p className="text-gray-600 mb-8">
                            There are currently no active campaigns running. Be the first to create one!
                        </p>
                        <Link
                            to="/create-campaign"
                            className="btn bg-[#915bf8] hover:bg-[#915bf8]/90 text-white text-lg px-8"
                        >
                            Create Campaign
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}; 