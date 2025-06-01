import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { CreateCampaignForm } from "./CreateCampaignForm";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";

export interface CampaignFormData {
    name: string;
    description: string;
    targetDomain: string;
    tokenAddress: string;
    rewardPerNFT: string;
    duration: string;
    initialFunding: string;
}

export const CreateCampaignContainer = () => {
    const { address } = useAccount();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<CampaignFormData>({
        name: "",
        description: "",
        targetDomain: "",
        tokenAddress: "0x0000000000000000000000000000000000000000", // Default to ETH
        rewardPerNFT: "",
        duration: "7", // Default 7 days
        initialFunding: "",
    });

    const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({
        hash,
    });

    // Debug environment variables
    useEffect(() => {
        console.log("Campaign Manager Address:", import.meta.env.VITE_CAMPAIGN_MANAGER_ADDRESS);
        console.log("Chain Name:", import.meta.env.VITE_CHAIN_NAME);
        console.log("RPC URL:", import.meta.env.VITE_JSON_RPC_URL);
    }, []);

    // Handle transaction completion
    useEffect(() => {
        if (isSuccess) {
            setIsSubmitting(false);
            console.log("Campaign created successfully! Hash:", hash);
            navigate("/success");
        }
    }, [isSuccess, hash, navigate]);

    // Handle errors
    useEffect(() => {
        if (writeError || receiptError) {
            const errorMsg = writeError?.message || receiptError?.message || "Transaction failed";
            console.error("Transaction error:", errorMsg);
            setError(errorMsg);
            setIsSubmitting(false);
        }
    }, [writeError, receiptError]);

    const handleSubmit = async (data: CampaignFormData) => {
        if (!address) {
            alert("Please connect your wallet first");
            return;
        }

        const campaignManagerAddress = import.meta.env.VITE_CAMPAIGN_MANAGER_ADDRESS;
        if (!campaignManagerAddress) {
            alert("Campaign Manager contract address not configured");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const durationInSeconds = parseInt(data.duration) * 24 * 60 * 60; // Convert days to seconds
            const rewardAmount = parseEther(data.rewardPerNFT);
            const isETHCampaign = data.tokenAddress === "0x0000000000000000000000000000000000000000";

            console.log("Creating campaign with:", {
                name: data.name,
                description: data.description,
                targetDomain: data.targetDomain,
                tokenAddress: data.tokenAddress,
                rewardAmount: rewardAmount.toString(),
                duration: durationInSeconds,
                initialFunding: data.initialFunding,
                isETHCampaign,
                campaignManagerAddress
            });

            const args: [string, string, string, `0x${string}`, bigint, bigint] = [
                data.name,
                data.description,
                data.targetDomain,
                data.tokenAddress as `0x${string}`,
                rewardAmount,
                BigInt(durationInSeconds),
            ];

            writeContract({
                address: campaignManagerAddress as `0x${string}`,
                abi: [
                    {
                        inputs: [
                            { name: "_name", type: "string" },
                            { name: "_description", type: "string" },
                            { name: "_targetDomain", type: "string" },
                            { name: "_tokenAddress", type: "address" },
                            { name: "_rewardPerNFT", type: "uint256" },
                            { name: "_duration", type: "uint256" },
                        ],
                        name: "createCampaign",
                        outputs: [{ name: "", type: "uint256" }],
                        stateMutability: "payable",
                        type: "function",
                    },
                ],
                functionName: "createCampaign",
                args,
                value: isETHCampaign ? parseEther(data.initialFunding) : 0n,
            });
        } catch (error) {
            console.error("Error preparing transaction:", error);
            const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
            setError(errorMsg);
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <CreateCampaignForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting || isPending || isConfirming}
                isConnected={!!address}
            />
            {error && (
                <div className="fixed bottom-4 right-4 alert alert-error max-w-md">
                    <span>Error: {error}</span>
                    <button onClick={() => setError(null)} className="btn btn-sm btn-ghost">×</button>
                </div>
            )}
        </>
    );
}; 