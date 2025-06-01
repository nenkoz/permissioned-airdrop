import React from "react";
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-2xl mx-auto">
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title text-3xl font-bold text-center mb-6">
                            Create Airdrop Campaign
                        </h2>
                        <p className="text-center text-gray-600 mb-8">
                            Create a campaign to distribute tokens to holders of domain-specific NFTs
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Campaign Name */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">Campaign Name</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., CoinDesk Team Airdrop"
                                    className="input input-bordered w-full"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">Description</span>
                                </label>
                                <textarea
                                    placeholder="Describe your campaign..."
                                    className="textarea textarea-bordered h-24"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange("description", e.target.value)}
                                    required
                                />
                            </div>

                            {/* Target Domain */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">Target Email Domain</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., coindesk.com"
                                    className="input input-bordered w-full"
                                    value={formData.targetDomain}
                                    onChange={(e) => handleInputChange("targetDomain", e.target.value)}
                                    required
                                />
                                <label className="label">
                                    <span className="label-text-alt">Only NFT holders from this domain can claim rewards</span>
                                </label>
                            </div>

                            {/* Token Type Selection */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">Reward Token</span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={formData.tokenAddress}
                                    onChange={(e) => handleInputChange("tokenAddress", e.target.value)}
                                >
                                    <option value="0x0000000000000000000000000000000000000000">ETH</option>
                                    <option value="">Custom ERC20 Token</option>
                                </select>
                            </div>

                            {/* Custom Token Address */}
                            {formData.tokenAddress === "" && (
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold">Token Contract Address</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="0x..."
                                        className="input input-bordered w-full"
                                        value={formData.tokenAddress}
                                        onChange={(e) => handleInputChange("tokenAddress", e.target.value)}
                                        required
                                    />
                                </div>
                            )}

                            {/* Reward per NFT */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">
                                        Reward per NFT ({isETHCampaign ? "ETH" : "Tokens"})
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    step="0.001"
                                    placeholder="0.1"
                                    className="input input-bordered w-full"
                                    value={formData.rewardPerNFT}
                                    onChange={(e) => handleInputChange("rewardPerNFT", e.target.value)}
                                    required
                                />
                            </div>

                            {/* Campaign Duration */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">Campaign Duration (Days)</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="7"
                                    className="input input-bordered w-full"
                                    value={formData.duration}
                                    onChange={(e) => handleInputChange("duration", e.target.value)}
                                    required
                                />
                            </div>

                            {/* Initial Funding */}
                            {isETHCampaign && (
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold">Initial Funding (ETH)</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.001"
                                        placeholder="1.0"
                                        className="input input-bordered w-full"
                                        value={formData.initialFunding}
                                        onChange={(e) => handleInputChange("initialFunding", e.target.value)}
                                        required
                                    />
                                    <label className="label">
                                        <span className="label-text-alt">
                                            Minimum required to cover gas and platform fees (2.5%)
                                        </span>
                                    </label>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="form-control mt-8">
                                {!isConnected ? (
                                    <div className="alert alert-warning">
                                        <span>Please connect your wallet to continue</span>
                                    </div>
                                ) : (
                                    <button
                                        type="submit"
                                        className={`btn btn-primary btn-lg ${isSubmitting ? "loading" : ""}`}
                                        disabled={isSubmitting || !isConnected}
                                    >
                                        {isSubmitting ? "Creating Campaign..." : "Create Campaign"}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    <div className="card bg-base-100 shadow">
                        <div className="card-body">
                            <h3 className="card-title text-lg">How it works</h3>
                            <p className="text-sm">
                                Users with email addresses from your target domain can mint NFTs using vlayer email proofs.
                                Then they can claim rewards from your campaign.
                            </p>
                        </div>
                    </div>

                    <div className="card bg-base-100 shadow">
                        <div className="card-body">
                            <h3 className="card-title text-lg">Platform Fee</h3>
                            <p className="text-sm">
                                A 2.5% platform fee is applied to all funding.
                                Unused funds can be withdrawn after the campaign ends.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 