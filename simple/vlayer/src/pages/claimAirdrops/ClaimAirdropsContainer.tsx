import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useNavigate } from "react-router";
import { ClaimAirdropsForm } from "./ClaimAirdropsForm";

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

export const ClaimAirdropsContainer = () => {
    const { address } = useAccount();
    const navigate = useNavigate();
    const [userTokenId, setUserTokenId] = useState<string>("");
    const [claimableCampaigns, setClaimableCampaigns] = useState<Campaign[]>([]);
    const [selectedCampaigns, setSelectedCampaigns] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState(false);

    // Read claimable campaigns when tokenId is provided
    const { data: claimableData, isLoading: isLoadingCampaigns } = useReadContract({
        address: import.meta.env.VITE_CAMPAIGN_MANAGER_ADDRESS as `0x${string}`,
        abi: [
            {
                inputs: [{ name: "tokenId", type: "uint256" }],
                name: "getClaimableCampaigns",
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
        functionName: "getClaimableCampaigns",
        args: userTokenId ? [BigInt(userTokenId)] : undefined,
        query: {
            enabled: !!userTokenId && userTokenId !== "",
        },
    });

    const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    // Update claimable campaigns when data changes
    useEffect(() => {
        if (claimableData) {
            const [campaigns] = claimableData as [Campaign[], bigint[]];
            setClaimableCampaigns(campaigns);
        }
    }, [claimableData]);

    // Handle transaction success
    useEffect(() => {
        if (isSuccess && hash) {
            setIsLoading(false);
            navigate(`/success?txHash=${hash}&claimedCount=${selectedCampaigns.size}`);
        }
    }, [isSuccess, hash, navigate, selectedCampaigns.size]);

    const handleTokenIdChange = (tokenId: string) => {
        setUserTokenId(tokenId);
        setSelectedCampaigns(new Set());
    };

    const handleCampaignSelect = (campaignIndex: number, selected: boolean) => {
        const newSelected = new Set(selectedCampaigns);
        if (selected) {
            newSelected.add(campaignIndex);
        } else {
            newSelected.delete(campaignIndex);
        }
        setSelectedCampaigns(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedCampaigns.size === claimableCampaigns.length) {
            setSelectedCampaigns(new Set());
        } else {
            setSelectedCampaigns(new Set(Array.from({ length: claimableCampaigns.length }, (_, i) => i)));
        }
    };

    const handleClaimSelected = async () => {
        if (!address || selectedCampaigns.size === 0 || !userTokenId) {
            return;
        }

        setIsLoading(true);

        try {
            const selectedCampaignIds = Array.from(selectedCampaigns).map(index =>
                claimableCampaigns[index].id
            );

            if (selectedCampaignIds.length === 1) {
                // Single claim
                writeContract({
                    address: import.meta.env.VITE_CAMPAIGN_MANAGER_ADDRESS as `0x${string}`,
                    abi: [
                        {
                            inputs: [
                                { name: "campaignId", type: "uint256" },
                                { name: "tokenId", type: "uint256" },
                            ],
                            name: "claimReward",
                            outputs: [],
                            stateMutability: "nonpayable",
                            type: "function",
                        },
                    ],
                    functionName: "claimReward",
                    args: [selectedCampaignIds[0], BigInt(userTokenId)],
                });
            } else {
                // Batch claim
                writeContract({
                    address: import.meta.env.VITE_CAMPAIGN_MANAGER_ADDRESS as `0x${string}`,
                    abi: [
                        {
                            inputs: [
                                { name: "campaignIds", type: "uint256[]" },
                                { name: "tokenId", type: "uint256" },
                            ],
                            name: "batchClaimRewards",
                            outputs: [],
                            stateMutability: "nonpayable",
                            type: "function",
                        },
                    ],
                    functionName: "batchClaimRewards",
                    args: [selectedCampaignIds, BigInt(userTokenId)],
                });
            }
        } catch (error) {
            console.error("Error claiming rewards:", error);
            setIsLoading(false);
        }
    };

    return (
        <ClaimAirdropsForm
            userTokenId={userTokenId}
            claimableCampaigns={claimableCampaigns}
            selectedCampaigns={selectedCampaigns}
            isLoadingCampaigns={isLoadingCampaigns}
            isSubmitting={isLoading || isPending || isConfirming}
            error={writeError?.message}
            isConnected={!!address}
            onTokenIdChange={handleTokenIdChange}
            onCampaignSelect={handleCampaignSelect}
            onSelectAll={handleSelectAll}
            onClaimSelected={handleClaimSelected}
        />
    );
}; 