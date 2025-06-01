import { Link, useSearchParams } from "react-router";
import { truncateHashOrAddr } from "../../shared/lib/utils";
import { useAccount } from "wagmi";

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

        {txHash && (
          <a
            href={`${account.chain?.blockExplorers?.default.url}/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
            className="text-violet-500 font-bold block mt-5 text-center"
          >
            View on block explorer
          </a>
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
