import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { useNavigate } from "react-router";
import { ClaimAirdropsForm } from "./ClaimAirdropsForm.tsx";

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

const campaignManagerAbi = [
    {
        inputs: [{ name: "domain", type: "string" }],
        name: "getCampaignsForDomain",
        outputs: [{ name: "", type: "uint256[]" }],
        stateMutability: "view",
        type: "function",
    },
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
    },
    {
        inputs: [{ name: "campaignId", type: "uint256" }, { name: "tokenId", type: "uint256" }],
        name: "isNFTClaimedForCampaign",
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
    }
] as const;

const nftAbi = [
    {
        inputs: [{ name: "tokenId", type: "uint256" }],
        name: "getTokenDomain",
        outputs: [{ name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
    }
] as const;

export const ClaimAirdropsContainer = () => {
    const { address } = useAccount();
    const navigate = useNavigate();
    const publicClient = usePublicClient();
    const [userTokenId, setUserTokenId] = useState<string>("");
    const [claimableCampaigns, setClaimableCampaigns] = useState<Campaign[]>([]);
    const [selectedCampaigns, setSelectedCampaigns] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);

    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    useEffect(() => {
        if (isSuccess && hash) {
            const claimedCount = selectedCampaigns.size;
            navigate(`/success?txHash=${hash}&claimedCount=${claimedCount}`);
        }
    }, [isSuccess, hash, navigate, selectedCampaigns.size]);

    const fetchClaimableCampaigns = async (tokenId: string) => {
        if (!tokenId || !publicClient) return;

        setIsLoadingCampaigns(true);
        setError("");

        try {
            // 1. Get the domain for this token ID
            const tokenDomain = await publicClient.readContract({
                address: import.meta.env.VITE_VERIFIER_ADDRESS as `0x${string}`,
                abi: nftAbi,
                functionName: "getTokenDomain",
                args: [BigInt(tokenId)],
            });

            console.log("Token domain:", tokenDomain);

            // 2. Get all campaign IDs for this domain
            const campaignIds = await publicClient.readContract({
                address: import.meta.env.VITE_CAMPAIGN_MANAGER_ADDRESS as `0x${string}`,
                abi: campaignManagerAbi,
                functionName: "getCampaignsForDomain",
                args: [tokenDomain],
            });

            console.log("Campaign IDs for domain:", campaignIds);

            if (!campaignIds || campaignIds.length === 0) {
                setClaimableCampaigns([]);
                setIsLoadingCampaigns(false);
                return;
            }

            // 3. Get details for each campaign and check if claimable
            const claimable: Campaign[] = [];

            for (const campaignId of campaignIds) {
                try {
                    // Get campaign details
                    const campaign = await publicClient.readContract({
                        address: import.meta.env.VITE_CAMPAIGN_MANAGER_ADDRESS as `0x${string}`,
                        abi: campaignManagerAbi,
                        functionName: "getCampaign",
                        args: [campaignId],
                    });

                    // Check if already claimed
                    const alreadyClaimed = await publicClient.readContract({
                        address: import.meta.env.VITE_CAMPAIGN_MANAGER_ADDRESS as `0x${string}`,
                        abi: campaignManagerAbi,
                        functionName: "isNFTClaimedForCampaign",
                        args: [campaignId, BigInt(tokenId)],
                    });

                    console.log(`Campaign ${campaignId}:`, { campaign, alreadyClaimed });

                    // Check if campaign is claimable
                    const now = Math.floor(Date.now() / 1000);
                    const isActive = campaign.isActive;
                    const notExpired = Number(campaign.expiresAt) > now;
                    const hasFunds = campaign.totalFunds > campaign.distributedFunds + campaign.rewardPerNFT;
                    const notClaimed = !alreadyClaimed;

                    if (isActive && notExpired && hasFunds && notClaimed) {
                        claimable.push({
                            id: campaign.id,
                            creator: campaign.creator,
                            name: campaign.name,
                            description: campaign.description,
                            targetDomain: campaign.targetDomain,
                            tokenAddress: campaign.tokenAddress,
                            totalFunds: campaign.totalFunds,
                            distributedFunds: campaign.distributedFunds,
                            rewardPerNFT: campaign.rewardPerNFT,
                            isActive: campaign.isActive,
                            createdAt: campaign.createdAt,
                            expiresAt: campaign.expiresAt,
                        });
                    }
                } catch (err) {
                    console.error(`Error fetching campaign ${campaignId}:`, err);
                }
            }

            setClaimableCampaigns(claimable);
            console.log("Claimable campaigns:", claimable);

        } catch (error) {
            console.error("Error fetching claimable campaigns:", error);
            setError(`Error loading campaigns: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoadingCampaigns(false);
        }
    };

    const handleTokenIdChange = (tokenId: string) => {
        setUserTokenId(tokenId);
        setClaimableCampaigns([]);
        setSelectedCampaigns(new Set());
        setError("");

        // Fetch campaigns when token ID is entered
        if (tokenId && tokenId.trim() !== "") {
            fetchClaimableCampaigns(tokenId.trim());
        }
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
        if (!address || selectedCampaigns.size === 0 || !userTokenId) return;

        setIsLoading(true);
        setError("");

        try {
            const selectedCampaignIds = Array.from(selectedCampaigns).map(index =>
                claimableCampaigns[index].id
            );

            writeContract({
                address: import.meta.env.VITE_CAMPAIGN_MANAGER_ADDRESS as `0x${string}`,
                abi: [
                    {
                        inputs: [
                            { name: "campaignIds", type: "uint256[]" },
                            { name: "tokenId", type: "uint256" }
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
        } catch (error) {
            console.error("Error claiming rewards:", error);
            setError(error instanceof Error ? error.message : "Unknown error occurred");
        } finally {
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
            error={error}
            isConnected={!!address}
            onTokenIdChange={handleTokenIdChange}
            onCampaignSelect={handleCampaignSelect}
            onSelectAll={handleSelectAll}
            onClaimSelected={handleClaimSelected}
        />
    );
}; 