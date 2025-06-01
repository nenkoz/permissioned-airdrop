import React from "react";
import { Link } from "react-router";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { CampaignFormData } from "./CreateCampaignContainer";

interface CreateCampaignFormProps {
    formData: CampaignFormData;
    setFormData: (data: CampaignFormData) => void;
    onSubmit: (data: CampaignFormData) => void;
    isSubmitting: boolean;
    isConnected: boolean;
}

export const CreateCampaignForm: React.FC<CreateCampaignFormProps> = ({
    formData,
    setFormData,
    onSubmit,
    isSubmitting,
    isConnected,
}) => {
    const handleInputChange = (field: keyof CampaignFormData, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const isETHCampaign = formData.tokenAddress === "0x0000000000000000000000000000000000000000";

    return (
        <div className="min-h-screen">
            {/* Navigation */}
            <div className="max-w-4xl mx-auto pt-6 pb-4 px-6">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                    <span>Back to Home</span>
                </Link>
            </div>

            {/* Header */}
            <div className="max-w-4xl mx-auto mb-8 px-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-black mb-4">
                        Create Airdrop Campaign
                    </h1>
                    <p className="text-lg text-gray-500">
                        Distribute tokens to holders of domain-specific NFTs
                    </p>
                </div>
            </div>

            {/* Main Form */}
            <div className="max-w-4xl mx-auto px-6 pb-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Campaign Name */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold text-lg text-black">Campaign Name</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., CoinDesk Team Airdrop"
                                    className="input input-bordered input-lg w-full bg-purple-50/50 focus:border-[#915bf8] focus:outline-none focus:bg-white text-gray-900 placeholder-gray-500"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold text-lg text-black">Description</span>
                                </label>
                                <textarea
                                    placeholder="Describe your campaign..."
                                    className="textarea textarea-bordered h-32 text-base bg-purple-50/50 focus:border-[#915bf8] focus:outline-none focus:bg-white text-gray-900 placeholder-gray-500"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange("description", e.target.value)}
                                    required
                                />
                            </div>

                            {/* Target Domain */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold text-lg text-black">Target Email Domain</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., coindesk.com"
                                    className="input input-bordered input-lg w-full bg-purple-50/50 focus:border-[#915bf8] focus:outline-none focus:bg-white text-gray-900 placeholder-gray-500"
                                    value={formData.targetDomain}
                                    onChange={(e) => handleInputChange("targetDomain", e.target.value)}
                                    required
                                />
                                <label className="label">
                                    <span className="label-text-alt text-sm text-gray-500">Only NFT holders from this domain can claim rewards</span>
                                </label>
                            </div>

                            {/* Token Type and Reward */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold text-lg text-black">Reward Token</span>
                                    </label>
                                    <select
                                        className="select select-bordered select-lg w-full bg-purple-50/50 focus:border-[#915bf8] focus:outline-none focus:bg-white text-gray-900"
                                        value={formData.tokenAddress}
                                        onChange={(e) => handleInputChange("tokenAddress", e.target.value)}
                                    >
                                        <option value="0x0000000000000000000000000000000000000000">ETH</option>
                                        <option value="">Custom ERC20 Token</option>
                                    </select>
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold text-lg text-black">
                                            Reward per NFT ({isETHCampaign ? "ETH" : "Tokens"})
                                        </span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.001"
                                        placeholder="0.1"
                                        className="input input-bordered input-lg w-full bg-purple-50/50 focus:border-[#915bf8] focus:outline-none focus:bg-white text-gray-900 placeholder-gray-500"
                                        value={formData.rewardPerNFT}
                                        onChange={(e) => handleInputChange("rewardPerNFT", e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Custom Token Address */}
                            {formData.tokenAddress === "" && (
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold text-lg text-black">Token Contract Address</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="0x..."
                                        className="input input-bordered input-lg w-full bg-purple-50/50 focus:border-[#915bf8] focus:outline-none focus:bg-white text-gray-900 placeholder-gray-500"
                                        value={formData.tokenAddress}
                                        onChange={(e) => handleInputChange("tokenAddress", e.target.value)}
                                        required
                                    />
                                </div>
                            )}

                            {/* Duration and Funding */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold text-lg text-black">Campaign Duration (Days)</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="7"
                                        className="input input-bordered input-lg w-full bg-purple-50/50 focus:border-[#915bf8] focus:outline-none focus:bg-white text-gray-900 placeholder-gray-500"
                                        value={formData.duration}
                                        onChange={(e) => handleInputChange("duration", e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Initial Funding */}
                                {isETHCampaign && (
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold text-lg text-black">Initial Funding (ETH)</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            placeholder="1.0"
                                            className="input input-bordered input-lg w-full bg-purple-50/50 focus:border-[#915bf8] focus:outline-none focus:bg-white text-gray-900 placeholder-gray-500"
                                            value={formData.initialFunding}
                                            onChange={(e) => handleInputChange("initialFunding", e.target.value)}
                                            required
                                        />
                                        <label className="label">
                                            <span className="label-text-alt text-sm text-gray-500">
                                                Includes 2.5% platform fee
                                            </span>
                                        </label>
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="form-control pt-4">
                                {!isConnected ? (
                                    <div className="alert alert-warning bg-orange-50 border border-orange-200">
                                        <span className="text-orange-700">Please connect your wallet to continue</span>
                                    </div>
                                ) : (
                                    <button
                                        type="submit"
                                        className={`btn w-full px-4 bg-[#915bf8] rounded-lg border-none text-white hover:bg-[#915bf8]/80 hover:text-white text-lg h-14 ${isSubmitting ? "loading" : ""}`}
                                        disabled={isSubmitting || !isConnected}
                                    >
                                        {isSubmitting ? "Creating Campaign..." : "Create Campaign"}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}; 