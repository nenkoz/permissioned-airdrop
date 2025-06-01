import { Link, useSearchParams } from "react-router";
import { truncateHashOrAddr } from "../../shared/lib/utils";
import { useAccount } from "wagmi";
import { getBlockscoutTxUrl, openBlockscoutLink } from "../../shared/utils/blockscout";

export const SuccessContainer = () => {
  const [searchParams] = useSearchParams();
  const txHash = searchParams.get("txHash");
  const domain = searchParams.get("domain");
  const recipient = searchParams.get("recipient");
  const campaignName = searchParams.get("campaignName");
  const claimedCount = searchParams.get("claimedCount");
  const account = useAccount();

  // Determine the type of success
  const isCampaignCreation = !!campaignName;
  const isAirdropClaim = !!claimedCount;

  return (
    <>
      <div className="desc in">
        {isCampaignCreation ? (
          <>
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-2xl font-bold text-green-600 mb-2">Campaign Created Successfully!</h1>
              <p className="text-lg">
                Your airdrop campaign <b>"{campaignName}"</b> has been created and is now live.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Users with verified email domains can now claim rewards from your campaign.
              </p>
            </div>
          </>
        ) : isAirdropClaim ? (
          <>
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">💰</div>
              <h1 className="text-2xl font-bold text-green-600 mb-2">Airdrops Claimed Successfully!</h1>
              <p className="text-lg">
                You have successfully claimed rewards from <b>{claimedCount}</b> campaign{claimedCount !== "1" ? "s" : ""}.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Your rewards have been transferred to your wallet.
              </p>
            </div>
          </>
        ) : (
          <>
            Your <b>{domain}</b> NFT was minted to {truncateHashOrAddr(recipient)}
          </>
        )}

        {/* Enhanced Blockscout Integration */}
        {txHash && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">🔍 View Transaction Details</h3>
              <p className="text-sm text-gray-600">
                Verify your transaction on Blockscout - the most comprehensive blockchain explorer
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => openBlockscoutLink(getBlockscoutTxUrl(txHash))}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <span>🔍</span>
                View on Blockscout
              </button>

              <button
                onClick={() => window.open('https://eth-sepolia.blockscout.com', '_blank')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <span>🌐</span>
                Explore Blockscout
              </button>
            </div>

            <div className="text-center mt-3">
              <p className="text-xs text-gray-500">
                🛡️ Powered by Blockscout - Open source, transparent blockchain exploration
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col items-center gap-4">
        {isCampaignCreation ? (
          <>
            <Link
              to="/create-campaign"
              className="btn btn-primary"
              data-testid="create-another-campaign-button"
            >
              Create Another Campaign
            </Link>
            <Link
              to="/"
              className="btn btn-secondary"
              data-testid="start-page-button"
            >
              Back to Home
            </Link>
          </>
        ) : isAirdropClaim ? (
          <>
            <Link
              to="/claim-airdrops"
              className="btn btn-primary"
              data-testid="claim-more-airdrops-button"
            >
              Claim More Airdrops
            </Link>
            <Link
              to="/"
              className="btn btn-secondary"
              data-testid="start-page-button"
            >
              Back to Home
            </Link>
          </>
        ) : (
          <Link to="/" id="nextButton" data-testid="start-page-button">
            Start again
          </Link>
        )}
      </div>
    </>
  );
};
