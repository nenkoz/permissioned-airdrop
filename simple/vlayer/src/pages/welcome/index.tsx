import { Link } from "react-router";
import { getStepPath } from "../../app/router/steps";
import { StepKind } from "../../app/router/types";
import { CampaignStatsCard } from "../../shared/layout/CampaignSidebar";

export const WelcomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          {/* Left column - Main content (spans 2 columns on xl screens) */}
          <div className="xl:col-span-2 space-y-8">
            {/* Header */}
            <div className="text-center xl:text-left">
              <h1 className="text-5xl xl:text-6xl font-bold text-gray-900 mb-6">
                Domain NFT Airdrops
              </h1>
              <p className="text-xl xl:text-2xl text-gray-600 max-w-3xl">
                Mint an NFT with your email domain, create airdrop campaigns, or claim rewards from existing campaigns
              </p>
            </div>

            {/* Main actions */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                  to={`/${getStepPath(StepKind.connectWallet)}`}
                  data-testid="start-page-button"
                  className="flex flex-col items-center justify-center bg-[#915bf8] hover:bg-[#915bf8]/90 text-white font-bold py-8 px-6 rounded-2xl text-center transition-all hover:scale-105 hover:shadow-lg min-h-[140px]"
                >
                  <div className="text-4xl mb-3">🎯</div>
                  <div className="text-lg font-bold mb-2">Mint Domain NFT</div>
                  <div className="text-sm opacity-90">Verify email ownership</div>
                </Link>

                <Link
                  to={`/${getStepPath(StepKind.createCampaign)}`}
                  className="flex flex-col items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-8 px-6 rounded-2xl text-center transition-all hover:scale-105 hover:shadow-lg min-h-[140px]"
                  data-testid="create-campaign-button"
                >
                  <div className="text-4xl mb-3">📢</div>
                  <div className="text-lg font-bold mb-2">Create Campaign</div>
                  <div className="text-sm opacity-90">Launch your airdrop</div>
                </Link>

                <Link
                  to={`/${getStepPath(StepKind.claimAirdrops)}`}
                  className="flex flex-col items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-8 px-6 rounded-2xl text-center transition-all hover:scale-105 hover:shadow-lg min-h-[140px]"
                  data-testid="claim-airdrops-button"
                >
                  <div className="text-4xl mb-3">💰</div>
                  <div className="text-lg font-bold mb-2">Claim Rewards</div>
                  <div className="text-sm opacity-90">Get your airdrops</div>
                </Link>
              </div>

              {/* How it works */}
              <div className="mt-12 pt-10 border-t border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">How it works</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#915bf8] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Mint Domain NFT</h4>
                    <p className="text-gray-600">
                      Verify your email domain (e.g., @coindesk.com) and mint an NFT that proves your association
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Create Campaigns</h4>
                    <p className="text-gray-600">
                      Set up airdrop campaigns targeting specific email domains with token rewards
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Claim Rewards</h4>
                    <p className="text-gray-600">
                      If you hold an NFT from a targeted domain, claim your rewards from active campaigns
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Campaign stats */}
          <div className="xl:sticky xl:top-8">
            <CampaignStatsCard />
          </div>
        </div>
      </div>
    </div>
  );
};
