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

interface UserNFT {
    tokenId: bigint;
    domain: string;
    claimableCampaigns: Campaign[];
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
    },
    {
        inputs: [{ name: "owner", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ name: "tokenId", type: "uint256" }],
        name: "ownerOf",
        outputs: [{ name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "currentTokenId",
        outputs: [{ name: "", type: "uint256" }],
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

    // New states for automated discovery
    const [userNFTs, setUserNFTs] = useState<UserNFT[]>([]);
    const [isAutoDiscovering, setIsAutoDiscovering] = useState(false);
    const [autoDiscoveryMode, setAutoDiscoveryMode] = useState<boolean>(false);
    const [totalClaimableRewards, setTotalClaimableRewards] = useState<{ eth: number, tokens: Map<string, number> }>({ eth: 0, tokens: new Map() });

    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    useEffect(() => {
        if (isSuccess && hash) {
            const claimedCount = autoDiscoveryMode
                ? userNFTs.reduce((total, nft) => total + nft.claimableCampaigns.length, 0)
                : selectedCampaigns.size;
            navigate(`/success?txHash=${hash}&claimedCount=${claimedCount}`);
        }
    }, [isSuccess, hash, navigate, selectedCampaigns.size, autoDiscoveryMode, userNFTs]);

    // Auto-discover all user NFTs and their claimable campaigns
    const autoDiscoverClaimableRewards = async () => {
        if (!address || !publicClient) return;

        setIsAutoDiscovering(true);
        setError("");

        try {
            // 1. Get user's NFT balance to see if they have any NFTs
            const balance = await publicClient.readContract({
                address: import.meta.env.VITE_VERIFIER_ADDRESS as `0x${string}`,
                abi: nftAbi,
                functionName: "balanceOf",
                args: [address],
            });

            console.log("User NFT balance:", balance.toString());

            if (balance === 0n) {
                setUserNFTs([]);
                setIsAutoDiscovering(false);
                return;
            }

            // 2. Get the current token ID (highest minted token)
            const currentTokenId = await publicClient.readContract({
                address: import.meta.env.VITE_VERIFIER_ADDRESS as `0x${string}`,
                abi: nftAbi,
                functionName: "currentTokenId",
                args: [],
            });

            console.log("Current token ID:", currentTokenId.toString());

            // 3. Check ownership of all tokens from 1 to currentTokenId
            const userTokenIds: bigint[] = [];
            for (let tokenId = 1n; tokenId <= currentTokenId; tokenId++) {
                try {
                    const owner = await publicClient.readContract({
                        address: import.meta.env.VITE_VERIFIER_ADDRESS as `0x${string}`,
                        abi: nftAbi,
                        functionName: "ownerOf",
                        args: [tokenId],
                    });

                    // Check if this user owns this token
                    if (owner.toLowerCase() === address.toLowerCase()) {
                        userTokenIds.push(tokenId);
                    }
                } catch (err) {
                    // Token might not exist or be burned, skip it
                    console.log(`Token ${tokenId} doesn't exist or error checking ownership:`, err);
                }
            }

            console.log("User owned token IDs:", userTokenIds);

            // 4. For each owned NFT, get domain and claimable campaigns
            const nftsWithCampaigns: UserNFT[] = [];
            let totalETH = 0;
            const totalTokens = new Map<string, number>();

            for (const tokenId of userTokenIds) {
                try {
                    // Get token domain
                    const tokenDomain = await publicClient.readContract({
                        address: import.meta.env.VITE_VERIFIER_ADDRESS as `0x${string}`,
                        abi: nftAbi,
                        functionName: "getTokenDomain",
                        args: [tokenId],
                    });

                    // Get campaigns for this domain
                    const campaignIds = await publicClient.readContract({
                        address: import.meta.env.VITE_CAMPAIGN_MANAGER_ADDRESS as `0x${string}`,
                        abi: campaignManagerAbi,
                        functionName: "getCampaignsForDomain",
                        args: [tokenDomain],
                    });

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
                                args: [campaignId, tokenId],
                            });

                            // Check if campaign is claimable
                            const now = Math.floor(Date.now() / 1000);
                            const isActive = campaign.isActive;
                            const notExpired = Number(campaign.expiresAt) > now;
                            const hasFunds = campaign.totalFunds > campaign.distributedFunds + campaign.rewardPerNFT;
                            const notClaimed = !alreadyClaimed;

                            if (isActive && notExpired && hasFunds && notClaimed) {
                                const campaignData = {
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
                                };

                                claimable.push(campaignData);

                                // Calculate total rewards
                                const rewardAmount = Number(campaign.rewardPerNFT) / 1e18;
                                if (campaign.tokenAddress === "0x0000000000000000000000000000000000000000") {
                                    totalETH += rewardAmount;
                                } else {
                                    const current = totalTokens.get(campaign.tokenAddress) || 0;
                                    totalTokens.set(campaign.tokenAddress, current + rewardAmount);
                                }
                            }
                        } catch (err) {
                            console.error(`Error fetching campaign ${campaignId}:`, err);
                        }
                    }

                    if (claimable.length > 0) {
                        nftsWithCampaigns.push({
                            tokenId,
                            domain: tokenDomain,
                            claimableCampaigns: claimable,
                        });
                    }

                } catch (err) {
                    console.error(`Error processing token ${tokenId}:`, err);
                }
            }

            setUserNFTs(nftsWithCampaigns);
            setTotalClaimableRewards({ eth: totalETH, tokens: totalTokens });
            console.log("Auto-discovered NFTs with claimable campaigns:", nftsWithCampaigns);

        } catch (error) {
            console.error("Error auto-discovering claimable rewards:", error);
            setError(`Error auto-discovering rewards: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsAutoDiscovering(false);
        }
    };

    // Auto-discover on wallet connection
    useEffect(() => {
        if (address && publicClient && autoDiscoveryMode) {
            autoDiscoverClaimableRewards();
        }
    }, [address, publicClient, autoDiscoveryMode]);

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

    // Auto-claim all rewards from all eligible NFTs
    const handleAutoClaimAll = async () => {
        if (!address || userNFTs.length === 0) return;

        setIsLoading(true);
        setError("");

        try {
            // Prepare batch claims for all NFTs
            const allClaims: { campaignIds: bigint[], tokenId: bigint }[] = [];

            for (const nft of userNFTs) {
                if (nft.claimableCampaigns.length > 0) {
                    allClaims.push({
                        campaignIds: nft.claimableCampaigns.map(c => c.id),
                        tokenId: nft.tokenId
                    });
                }
            }

            // For now, we'll claim for each NFT separately
            // This could be optimized with a multi-NFT batch claim function
            for (const claim of allClaims) {
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
                    args: [claim.campaignIds, claim.tokenId],
                });

                // For multiple NFTs, we'd need to handle this differently
                // For now, just handle the first one
                break;
            }
        } catch (error) {
            console.error("Error auto-claiming rewards:", error);
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
            // New auto-discovery props
            autoDiscoveryMode={autoDiscoveryMode}
            userNFTs={userNFTs}
            isAutoDiscovering={isAutoDiscovering}
            totalClaimableRewards={totalClaimableRewards}
            onAutoDiscoveryToggle={setAutoDiscoveryMode}
            onAutoDiscover={autoDiscoverClaimableRewards}
            onAutoClaimAll={handleAutoClaimAll}
        />
    );
}; 