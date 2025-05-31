"use client"

import { useState, useMemo } from "react";
import InputField from "./ui/InputField";
import { chainsToSender, senderAbi, erc20Abi } from "@/constants";
import { useChainId, useConfig, useAccount, useWriteContract } from "wagmi";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { calculateTotal } from "@/utils";

export default function AirdropForm() {
    const [tokenAddress, setTokenAddress] = useState("");
    const [recipients, setRecipients] = useState("");
    const [amounts, setAmounts] = useState("");
    const chainId = useChainId();
    const config = useConfig();
    const account = useAccount();
    const total: number = useMemo(() => calculateTotal(amounts), [amounts]);
    const { data: hash, isPending, writeContractAsync } = useWriteContract();

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

        if (approvedAmount < total) {
            const approvalHash = await writeContractAsync({
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "approve",
                args: [senderAddress as `0x${string}`, BigInt(total)]
            })
            const approvalReceipt = await waitForTransactionReceipt(config, { hash: approvalHash });
            console.log("Approval confirmed: ", approvalReceipt);

            await writeContractAsync({
                abi: senderAbi,
                address: senderAddress as `0x${string}`,
                functionName: "airdropERC20",
                args: [
                    tokenAddress as `0x${string}`,
                    recipients.split(/[\n,]+/).map(addr => addr.trim() as `0x${string}`),
                    amounts.split(/[\n,]+/).map(amount => amount.trim()).filter(amount => amount !== ''),
                    BigInt(total)
                ]
            })
        }
        else {
            await writeContractAsync({
                abi: senderAbi,
                address: senderAddress as `0x${string}`,
                functionName: "airdropERC20",
                args: [
                    tokenAddress as `0x${string}`,
                    recipients.split(/[\n,]+/).map(addr => addr.trim() as `0x${string}`),
                    amounts.split(/[\n,]+/).map(amount => amount.trim()).filter(amount => amount !== ''),
                    BigInt(total)
                ]
            })
        }
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