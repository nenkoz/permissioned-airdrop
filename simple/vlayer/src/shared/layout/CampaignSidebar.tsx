import React from "react";
import { useReadContract } from "wagmi";

interface CampaignStats {
    totalCampaigns: bigint;
    activeCampaigns: bigint;
    totalFundsLocked: bigint;
}

export const CampaignStatsCard: React.FC = () => {
    const { data: statsData, isLoading } = useReadContract({
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

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900">🎯 Platform Stats</h3>
                <p className="text-gray-600">Live campaign overview</p>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="loading loading-spinner loading-lg text-[#915bf8]"></div>
                </div>
            ) : stats ? (
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-lg p-6 border border-purple-100">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-[#915bf8] mb-2">
                                {stats.totalCampaigns.toString()}
                            </div>
                            <div className="text-base text-gray-700 font-medium">Total Campaigns</div>
                            <div className="text-sm text-gray-500 mt-1">All campaigns created</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-100">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600 mb-2">
                                {stats.activeCampaigns.toString()}
                            </div>
                            <div className="text-base text-gray-700 font-medium">Active Campaigns</div>
                            <div className="text-sm text-gray-500 mt-1">Currently running</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-100">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600 mb-2">
                                {(Number(stats.totalFundsLocked) / 1e18).toFixed(4)}
                            </div>
                            <div className="text-base text-gray-700 font-medium">ETH Locked</div>
                            <div className="text-sm text-gray-500 mt-1">Total value locked</div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">⚠️</div>
                    <p className="text-lg font-medium">Unable to load stats</p>
                    <p className="text-sm mt-2">Please check your connection</p>
                </div>
            )}
        </div>
    );
}; 