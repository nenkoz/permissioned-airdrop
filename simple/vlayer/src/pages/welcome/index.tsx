import { Link } from "react-router";
import { getStepPath } from "../../app/router/steps";
import { StepKind } from "../../app/router/types";

export const WelcomePage = () => {
  return (
    <div className="mt-5 flex flex-col items-center gap-4">
      <Link
        to={`/${getStepPath(StepKind.connectWallet)}`}
        id="nextButton"
        data-testid="start-page-button"
        className="btn btn-primary btn-lg"
      >
        Mint Domain NFT
      </Link>

      <div className="divider">OR</div>

      <Link
        to={`/${getStepPath(StepKind.createCampaign)}`}
        className="btn btn-secondary btn-lg"
        data-testid="create-campaign-button"
      >
        Create Airdrop Campaign
      </Link>

      <div className="divider">OR</div>

      <Link
        to={`/${getStepPath(StepKind.claimAirdrops)}`}
        className="btn btn-accent btn-lg"
        data-testid="claim-airdrops-button"
      >
        Claim Your Airdrops
      </Link>

      <p className="text-sm text-gray-600 text-center max-w-md mt-4">
        Mint an NFT with your email domain, create airdrop campaigns for domain holders, or claim rewards from existing campaigns
      </p>
    </div>
  );
};
