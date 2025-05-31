"use client"

import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";

export default function ClaimAirdropForm() {
    const [isGeneratingProof, setIsGeneratingProof] = useState(false);
    const [proof, setProof] = useState<string | null>(null);
    const [isEligible, setIsEligible] = useState<boolean | null>(null);
    const { address, isConnected } = useAccount();
    const { writeContractAsync, isPending } = useWriteContract();

    // This would integrate with vlayer SDK
    async function generateTwitterFollowProof() {
        setIsGeneratingProof(true);
        try {
            // TODO: Replace with actual vlayer web proof generation
            // const proof = await vlayer.generateWebProof({
            //     source: 'twitter',
            //     claim: 'follows',
            //     target: '@your_twitter_handle', // The Twitter account they need to follow
            //     userAddress: address
            // });

            // Mock proof for now
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate proof generation
            const mockProof = "mock_vlayer_proof_" + Date.now();
            setProof(mockProof);
            setIsEligible(true);
        } catch (error) {
            console.error("Failed to generate proof:", error);
            setIsEligible(false);
        } finally {
            setIsGeneratingProof(false);
        }
    }

    async function claimAirdrop() {
        if (!proof || !address) return;

        try {
            // Submit proof to smart contract for verification and claim
            // TODO: Implement actual contract call when contract ABI is ready
            /*
            await writeContractAsync({
                abi: airdropClaimAbi,
                address: AIRDROP_CONTRACT_ADDRESS,
                functionName: "claimWithTwitterProof",
                args: [proof, address]
            });
            */
            console.log("Would claim airdrop with proof:", proof);
        } catch (error) {
            console.error("Failed to claim airdrop:", error);
        }
    }

    if (!isConnected) {
        return (
            <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-200 text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Claim Your Airdrop
                </h2>
                <p className="text-gray-600 mb-4">
                    Connect your wallet to verify Twitter follow and claim tokens
                </p>
                <p className="text-sm text-gray-500">
                    Please connect your wallet using the button in the header
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
                Claim Your Airdrop
            </h2>

            <div className="space-y-4">
                {/* Step 1: Twitter Verification */}
                <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">
                        Step 1: Verify Twitter Follow
                    </h3>
                    <p className="text-sm text-blue-700 mb-3">
                        Prove you follow @your_twitter_handle to be eligible for the airdrop
                    </p>

                    {!proof && (
                        <button
                            onClick={generateTwitterFollowProof}
                            disabled={isGeneratingProof}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
                        >
                            {isGeneratingProof ? "Generating Proof..." : "Generate Twitter Proof"}
                        </button>
                    )}

                    {isGeneratingProof && (
                        <div className="mt-3 text-sm text-blue-600">
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                                <span>Verifying your Twitter follow status...</span>
                            </div>
                        </div>
                    )}

                    {proof && isEligible && (
                        <div className="mt-3 p-3 bg-green-100 rounded-md">
                            <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-green-800 font-medium">Twitter follow verified!</span>
                            </div>
                        </div>
                    )}

                    {proof && !isEligible && (
                        <div className="mt-3 p-3 bg-red-100 rounded-md">
                            <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="text-red-800 font-medium">Not eligible. Please follow @your_twitter_handle first.</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Step 2: Claim Tokens */}
                <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">
                        Step 2: Claim Your Tokens
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                        Submit your proof to claim your airdrop tokens
                    </p>

                    <button
                        onClick={claimAirdrop}
                        disabled={!proof || !isEligible || isPending}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
                    >
                        {isPending ? "Claiming..." : "Claim Airdrop"}
                    </button>
                </div>

                {/* Connected wallet info */}
                <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                        Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                    </p>
                </div>
            </div>
        </div>
    );
} 