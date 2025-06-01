import { Link, useSearchParams } from "react-router";
import { truncateHashOrAddr } from "../../shared/lib/utils";
import { useAccount } from "wagmi";

export const SuccessContainer = () => {
  const [searchParams] = useSearchParams();
  const txHash = searchParams.get("txHash");
  const domain = searchParams.get("domain");
  const recipient = searchParams.get("recipient");
  const campaignName = searchParams.get("campaignName");
  const account = useAccount();

  // Determine if this is a campaign creation or NFT minting
  const isCampaignCreation = !!campaignName;

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
        ) : (
          <Link to="/" id="nextButton" data-testid="start-page-button">
            Start again
          </Link>
        )}
      </div>
    </>
  );
};
