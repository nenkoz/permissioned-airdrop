"use client"

import { useState } from "react";
import InputField from "./ui/InputField";

export default function AirdropForm() {
    const [tokenAddress, setTokenAddress] = useState("");
    const [recipients, setRecipients] = useState("");
    const [amounts, setAmounts] = useState("");

    async function handleSubmit() {
        console.log(tokenAddress);
        console.log(recipients);
        console.log(amounts);
    }

    return (
        <div>
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
            <button onClick={handleSubmit}>
                Submit
            </button>
        </div>
    );
}