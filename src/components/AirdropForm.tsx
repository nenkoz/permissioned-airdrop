"use client"

import { useState, useMemo } from "react";
import InputField from "./ui/InputField";
import { chainsToSender, senderAbi, erc20Abi } from "@/constants";
import { useChainId, useConfig, useAccount } from "wagmi";
import { readContract } from "@wagmi/core";
import { calculateTotal } from "@/utils";

export default function AirdropForm() {
    const [tokenAddress, setTokenAddress] = useState("");
    const [recipients, setRecipients] = useState("");
    const [amounts, setAmounts] = useState("");
    const chainId = useChainId();
    const config = useConfig();
    const account = useAccount();
    const total: number = useMemo(() => calculateTotal(amounts), [amounts]);

    async function getApprovedAmount(senderAddress: string | null): Promise<number> {
        if (!senderAddress) {
            alert("Please use supported chain")
            return 0;
        }
        const response = await readContract(config, {
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: "allowance",
            args: [account.address, senderAddress as `0x${string}`]
        })
        return response as number;
    }

    async function handleSubmit() {
        const senderAddress = chainsToSender[chainId]["sender"];
        const approvedAmount = await getApprovedAmount(senderAddress);
        console.log(approvedAmount);
    }

    return (
        <div className="space-y-6 max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <InputField
                label="Token Address"
                placeholder="0x..."
                value={tokenAddress}
                type="text"
                onChange={(e) => setTokenAddress(e.target.value)}
            />
            <InputField
                label="Recipients"
                placeholder="0x2342, 0x1243, 0x1234"
                value={recipients}
                type="text"
                onChange={(e) => setRecipients(e.target.value)}
                large={true}
            />
            <InputField
                label="Amounts"
                placeholder="100, 110, 120"
                value={amounts}
                type="text"
                onChange={(e) => setAmounts(e.target.value)}
                large={true}
            />
            <button
                onClick={handleSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Submit Airdrop
            </button>
        </div>
    );
}