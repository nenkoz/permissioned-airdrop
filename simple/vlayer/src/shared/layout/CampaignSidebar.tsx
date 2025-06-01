import React from "react";
import { useReadContract } from "wagmi";
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

export const CampaignSidebar: React.FC = () => {
    const { data: campaignsData, isLoading } = useReadContract({
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

    const campaigns = campaignsData ? (campaignsData as [Campaign[], bigint[]])[0] : [];

    const formatTokenType = (tokenAddress: string) => {
        return tokenAddress === "0x0000000000000000000000000000000000000000" ? "ETH" : "ERC20";
    };

    const formatTimeLeft = (expiresAt: bigint) => {
        const now = Math.floor(Date.now() / 1000);
        const timeLeft = Number(expiresAt) - now;

        if (timeLeft <= 0) return "Expired";

        const days = Math.floor(timeLeft / (24 * 60 * 60));
        const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        return `${hours}h`;
    };

    const calculateClaimsCount = (campaign: Campaign) => {
        const rewardPerNFT = Number(formatEther(campaign.rewardPerNFT));
        const distributedFunds = Number(formatEther(campaign.distributedFunds));

        if (rewardPerNFT === 0) return 0;
        return Math.floor(distributedFunds / rewardPerNFT);
    };

    const calculateMaxClaims = (campaign: Campaign) => {
        const rewardPerNFT = Number(formatEther(campaign.rewardPerNFT));
        const totalFunds = Number(formatEther(campaign.totalFunds));

        if (rewardPerNFT === 0) return 0;
        return Math.floor(totalFunds / rewardPerNFT);
    };

    return (
        <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-lg overflow-y-auto z-10">
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                <h3 className="text-lg font-bold text-gray-900">🎯 Active Campaigns</h3>
                <p className="text-sm text-gray-600">Live airdrop campaigns</p>
            </div>

            <div className="p-4">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="loading loading-spinner loading-md text-[#915bf8]"></div>
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <div className="text-3xl mb-2">📭</div>
                        <p className="text-sm">No active campaigns</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {campaigns.map((campaign) => {
                            const claimsCount = calculateClaimsCount(campaign);
                            const maxClaims = calculateMaxClaims(campaign);
                            const timeLeft = formatTimeLeft(campaign.expiresAt);

                            return (
                                <div
                                    key={campaign.id.toString()}
                                    className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-lg p-4 border border-purple-100 hover:border-purple-200 transition-colors"
                                >
                                    <div className="mb-3">
                                        <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                                            {campaign.name}
                                        </h4>
                                        <p className="text-xs text-[#915bf8] font-mono mt-1">
                                            @{campaign.targetDomain}
                                        </p>
                                    </div>

                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Reward:</span>
                                            <span className="font-semibold text-green-600">
                                                {formatEther(campaign.rewardPerNFT)} {formatTokenType(campaign.tokenAddress)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Claims:</span>
                                            <span className="font-semibold text-blue-600">
                                                {claimsCount}/{maxClaims}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Expires:</span>
                                            <span className={`font-semibold ${timeLeft.includes('d') ? 'text-green-600' : 'text-orange-600'
                                                }`}>
                                                {timeLeft}
                                            </span>
                                        </div>

                                        {/* Progress bar */}
                                        <div className="mt-2">
                                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                <span>Progress</span>
                                                <span>{Math.round((claimsCount / maxClaims) * 100) || 0}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                <div
                                                    className="bg-[#915bf8] h-1.5 rounded-full transition-all"
                                                    style={{ width: `${Math.min((claimsCount / maxClaims) * 100, 100) || 0}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}; 