import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { useReadContract, usePublicClient } from "wagmi";
import { formatEther } from "viem";
import { ChevronLeftIcon, ClockIcon, CurrencyDollarIcon, UsersIcon, GlobeAltIcon, CalendarIcon } from "@heroicons/react/24/outline";

interface CampaignStats {
    totalCampaigns: bigint;
    activeCampaigns: bigint;
    totalFundsLocked: bigint;
}

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

const campaignAbi = [
    {
        inputs: [{ name: "campaignId", type: "uint256" }],
        name: "getCampaign",
        outputs: [{
            name: "", type: "tuple", components: [
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
        }],
        stateMutability: "view",
        type: "function",
    }
] as const;

export const CampaignsPage: React.FC = () => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loadingCampaigns, setLoadingCampaigns] = useState(false);
    const publicClient = usePublicClient();

    const { data: statsData, isLoading, error } = useReadContract({
        address: import.meta.env.VITE_CAMPAIGN_MANAGER_ADDRESS as `0x${string}`,
        abi: [
            {
                inputs: [],
                name: "getCampaignStats",
                outputs: [
                    {
                        name: "", type: "tuple", components: [
                            { name: "totalCampaigns", type: "uint256" },
                            { name: "activeCampaigns", type: "uint256" },
                            { name: "totalFundsLocked", type: "uint256" },
                        ]
                    }
                ],
                stateMutability: "view",
                type: "function",
            },
        ],
        functionName: "getCampaignStats",
    });

    const stats = statsData as CampaignStats | undefined;

    // Fetch real campaigns from the blockchain
    useEffect(() => {
        const fetchRealCampaigns = async () => {
            if (!stats || Number(stats.totalCampaigns) === 0 || !publicClient) return;

            setLoadingCampaigns(true);
            const fetchedCampaigns: Campaign[] = [];

            try {
                // Fetch each campaign individually using the public client
                for (let i = 1; i <= Number(stats.totalCampaigns); i++) {
                    try {
                        const result = await publicClient.readContract({
                            address: import.meta.env.VITE_CAMPAIGN_MANAGER_ADDRESS as `0x${string}`,
                            abi: campaignAbi,
                            functionName: 'getCampaign',
                            args: [BigInt(i)],
                        });

                        // Check if campaign exists (id !== 0)
                        if (result && result.id !== 0n) {
                            fetchedCampaigns.push({
                                id: result.id,
                                creator: result.creator,
                                name: result.name,
                                description: result.description,
                                targetDomain: result.targetDomain,
                                tokenAddress: result.tokenAddress,
                                totalFunds: result.totalFunds,
                                distributedFunds: result.distributedFunds,
                                rewardPerNFT: result.rewardPerNFT,
                                isActive: result.isActive,
                                createdAt: result.createdAt,
                                expiresAt: result.expiresAt,
                            });
                        }
                    } catch (campaignError) {
                        console.error(`Error fetching campaign ${i}:`, campaignError);
                        // Continue with next campaign
                    }
                }

                setCampaigns(fetchedCampaigns);
            } catch (error) {
                console.error("Error fetching campaigns:", error);
            } finally {
                setLoadingCampaigns(false);
            }
        };

        fetchRealCampaigns();
    }, [stats, publicClient]);

    const formatTimeLeft = (expiresAt: bigint) => {
        const now = Math.floor(Date.now() / 1000);
        const timeLeft = Number(expiresAt) - now;

        if (timeLeft <= 0) return "Expired";

        const days = Math.floor(timeLeft / (24 * 60 * 60));
        const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((timeLeft % (60 * 60)) / 60);

        if (days > 0) return `${days}d ${hours}h left`;
        if (hours > 0) return `${hours}h ${minutes}m left`;
        return `${minutes}m left`;
    };

    const formatTokenType = (tokenAddress: string) => {
        return tokenAddress === "0x0000000000000000000000000000000000000000" ? "ETH" : "ERC20";
    };

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

    const formatFundsAmount = (funds: number, isETH: boolean) => {
        const tokenSymbol = isETH ? "ETH" : "tokens";

        // If amount is very small (less than 0.000001), use scientific notation
        if (funds < 0.000001 && funds > 0) {
            return `${funds.toExponential(2)} ${tokenSymbol}`;
        }

        // If amount is small but not tiny, show more decimals
        if (funds < 0.01) {
            return `${funds.toFixed(8)} ${tokenSymbol}`;
        }

        // For larger amounts, use fewer decimals
        return `${funds.toFixed(6)} ${tokenSymbol}`;
    };

    const activeCampaigns = campaigns.filter(campaign =>
        campaign.isActive && Number(campaign.expiresAt) > Math.floor(Date.now() / 1000)
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="flex">
                    <div className="flex-1 p-8 pr-4" style={{ maxWidth: 'calc(100vw - 400px)' }}>
                        <div className="flex items-center justify-center py-20">
                            <div className="loading loading-spinner loading-lg text-[#915bf8]"></div>
                            <span className="ml-4 text-lg">Loading campaigns...</span>
                        </div>
                    </div>
                    <div className="w-80 bg-white/50 backdrop-blur-sm border-l border-gray-200 p-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Platform Stats</h3>
                                    <p className="text-sm text-gray-500">Live campaign overview</p>
                                </div>
                            </div>
                            <div className="text-center py-8">
                                <div className="loading loading-spinner loading-md text-[#915bf8]"></div>
                                <p className="mt-2 text-sm text-gray-500">Loading stats...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="flex">
                    <div className="flex-1 p-8 pr-4" style={{ maxWidth: 'calc(100vw - 400px)' }}>
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
                    <div className="w-80 bg-white/50 backdrop-blur-sm border-l border-gray-200 p-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Platform Stats</h3>
                                    <p className="text-sm text-gray-500">Live campaign overview</p>
                                </div>
                            </div>
                            <div className="text-center py-8">
                                <div className="text-red-500">⚠️</div>
                                <p className="mt-2 text-sm text-gray-500">Error loading stats</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="flex">
                {/* Main Content Area */}
                <div className="flex-1 p-8 pr-4" style={{ maxWidth: 'calc(100vw - 400px)' }}>
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            to="/"
                            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                        >
                            <ChevronLeftIcon className="h-5 w-5 mr-2" />
                            Back to Home
                        </Link>

                        <h1 className="text-4xl xl:text-5xl font-bold text-gray-900 mb-4">
                            🎯 Live Campaigns
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed">
                            Explore all active airdrop campaigns with detailed information about rewards, domain restrictions, and expiration dates
                        </p>
                    </div>

                    {/* Loading Campaigns */}
                    {loadingCampaigns && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                            <div className="loading loading-spinner loading-lg text-[#915bf8]"></div>
                            <p className="mt-4 text-gray-600">Loading campaign details...</p>
                        </div>
                    )}

                    {/* Active Campaigns List */}
                    {!loadingCampaigns && activeCampaigns.length > 0 && (
                        <div className="space-y-6">
                            {activeCampaigns.map((campaign) => {
                                const isETH = campaign.tokenAddress === "0x0000000000000000000000000000000000000000";
                                const fundsLeft = Number(campaign.totalFunds - campaign.distributedFunds);
                                const fundsLeftInEth = fundsLeft / 1e18; // Convert from wei to ETH
                                const progressPercent = Number(campaign.totalFunds) > 0
                                    ? (Number(campaign.distributedFunds) / Number(campaign.totalFunds)) * 100
                                    : 0;

                                return (
                                    <div key={campaign.id.toString()} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
                                        {/* Campaign Header */}
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex-1 pr-6">
                                                <h3 className="text-2xl font-bold text-gray-900 mb-3">{campaign.name}</h3>
                                                <p className="text-gray-600 text-lg leading-relaxed">{campaign.description}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0 bg-green-50 p-4 rounded-xl">
                                                <div className="text-2xl font-bold text-green-600 mb-1">
                                                    {formatRewardAmount(campaign.rewardPerNFT, isETH)}
                                                </div>
                                                <div className="text-sm text-gray-500">per claim</div>
                                            </div>
                                        </div>

                                        {/* Campaign Details Grid */}
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-purple-100 rounded-lg">
                                                    <GlobeAltIcon className="h-5 w-5 text-purple-600" />
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-500">Target Domain</div>
                                                    <div className="font-semibold text-purple-600">@{campaign.targetDomain}</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-orange-100 rounded-lg">
                                                    <CalendarIcon className="h-5 w-5 text-orange-600" />
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-500">Expires</div>
                                                    <div className="font-semibold text-orange-600">{formatTimeLeft(campaign.expiresAt)}</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-500">Funds Left</div>
                                                    <div className="font-semibold text-blue-600">
                                                        {formatFundsAmount(fundsLeftInEth, isETH)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-green-100 rounded-lg">
                                                    <UsersIcon className="h-5 w-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-500">Token Type</div>
                                                    <div className="font-semibold text-green-600">{formatTokenType(campaign.tokenAddress)}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mb-4">
                                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                                <span>Campaign Progress</span>
                                                <span>{progressPercent.toFixed(1)}% distributed</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-[#915bf8] to-purple-600 h-2 rounded-full transition-all duration-500"
                                                    style={{ width: `${Math.min(progressPercent, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Creator Info */}
                                        <div className="text-sm text-gray-500">
                                            <span>Created by: </span>
                                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{campaign.creator.slice(0, 6)}...{campaign.creator.slice(-4)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* No Active Campaigns */}
                    {!loadingCampaigns && activeCampaigns.length === 0 && campaigns.length >= 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                            <div className="text-6xl mb-4">📊</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Active Campaigns</h3>
                            <p className="text-gray-700 mb-6">
                                There are currently no active campaigns. Be the first to create one!
                            </p>
                            <div className="flex gap-4 justify-center flex-wrap">
                                <Link
                                    to="/create-campaign"
                                    className="btn bg-[#915bf8] hover:bg-[#915bf8]/90 text-white px-8"
                                >
                                    Create Campaign
                                </Link>
                                <Link
                                    to="/claim-airdrops"
                                    className="btn bg-green-600 hover:bg-green-700 text-white px-8"
                                >
                                    Claim Rewards
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                <div className="w-80 bg-white/50 backdrop-blur-sm border-l border-gray-200 p-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Platform Stats</h3>
                                <p className="text-sm text-gray-500">Live campaign overview</p>
                            </div>
                        </div>

                        {stats ? (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-[#915bf8] mb-2">{stats.totalCampaigns.toString()}</div>
                                    <div className="text-sm font-medium text-gray-800">Total Campaigns</div>
                                    <div className="text-xs text-gray-500">All campaigns created</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-4xl font-bold text-green-600 mb-2">{activeCampaigns.length}</div>
                                    <div className="text-sm font-medium text-gray-800">Active Campaigns</div>
                                    <div className="text-xs text-gray-500">Currently running</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-4xl font-bold text-blue-600 mb-2">{formatFundsAmount(Number(stats.totalFundsLocked) / 1e18, true).split(' ')[0]}</div>
                                    <div className="text-sm font-medium text-gray-800">ETH Locked</div>
                                    <div className="text-xs text-gray-500">Total value locked</div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="loading loading-spinner loading-md text-[#915bf8]"></div>
                                <p className="mt-2 text-sm text-gray-500">Loading stats...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}; 