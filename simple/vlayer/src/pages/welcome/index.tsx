import { Link } from "react-router";
import { getStepPath } from "../../app/router/steps";
import { StepKind } from "../../app/router/types";
import { CampaignStatsCard } from "../../shared/layout/CampaignSidebar";

export const WelcomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Centered Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl xl:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
            Domain Airdropper
          </h1>
          <p className="text-base xl:text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            The professional platform for domain-verified NFT airdrops. Mint domain NFTs, create targeted campaigns, and claim rewards seamlessly.
          </p>
        </div>

        {/* Equal Height Sections */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Left Section - Main Content */}
          <div className="xl:col-span-2 flex flex-col">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 flex-1 flex flex-col">
              {/* Platform Actions */}
              <div className="mb-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                    Choose Your Action
                  </h2>
                  <div className="w-20 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto rounded-full"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link
                    to={`/${getStepPath(StepKind.connectWallet)}`}
                    data-testid="start-page-button"
                    className="group relative overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 hover:from-purple-700 hover:via-purple-800 hover:to-purple-900 text-white font-bold py-5 px-4 rounded-2xl text-center transition-all duration-500 hover:scale-105 hover:shadow-2xl min-h-[120px] border border-purple-500/20"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-500 filter drop-shadow-lg">🎯</div>
                      <div className="text-base font-bold mb-1">Mint Domain NFT</div>
                      <div className="text-xs opacity-90 leading-relaxed">Verify email domain</div>
                    </div>
                  </Link>

                  <Link
                    to={`/${getStepPath(StepKind.createCampaign)}`}
                    className="group relative overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white font-bold py-5 px-4 rounded-2xl text-center transition-all duration-500 hover:scale-105 hover:shadow-2xl min-h-[120px] border border-blue-500/20"
                    data-testid="create-campaign-button"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-500 filter drop-shadow-lg">📢</div>
                      <div className="text-base font-bold mb-1">Create Campaign</div>
                      <div className="text-xs opacity-90 leading-relaxed">Launch airdrops</div>
                    </div>
                  </Link>

                  <Link
                    to={`/${getStepPath(StepKind.claimAirdrops)}`}
                    className="group relative overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-green-600 via-green-700 to-green-800 hover:from-green-700 hover:via-green-800 hover:to-green-900 text-white font-bold py-5 px-4 rounded-2xl text-center transition-all duration-500 hover:scale-105 hover:shadow-2xl min-h-[120px] border border-green-500/20"
                    data-testid="claim-airdrops-button"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-500 filter drop-shadow-lg">💰</div>
                      <div className="text-base font-bold mb-1">Claim Rewards</div>
                      <div className="text-xs opacity-90 leading-relaxed">Get your airdrops</div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* How it works - Takes remaining space */}
              <div className="flex-1 pt-4 border-t border-gray-200">
                <div className="text-center mb-5">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                    How Domain Airdropper Works
                  </h3>
                  <div className="w-28 h-0.5 bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 mx-auto rounded-full"></div>
                  <p className="text-gray-600 mt-2 text-xs">Seamless domain verification and reward distribution</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
                  <div className="group relative text-center bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 rounded-2xl p-4 border border-purple-200/50 hover:border-purple-300 transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-500">1</div>
                      <h4 className="text-base font-bold text-gray-900 mb-2">Domain Verification</h4>
                      <p className="text-gray-700 leading-relaxed text-xs">
                        Prove ownership of your email domain by minting a unique NFT
                      </p>
                    </div>
                  </div>
                  <div className="group relative text-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 rounded-2xl p-4 border border-blue-200/50 hover:border-blue-300 transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-500">2</div>
                      <h4 className="text-base font-bold text-gray-900 mb-2">Targeted Campaigns</h4>
                      <p className="text-gray-700 leading-relaxed text-xs">
                        Create airdrop campaigns targeting specific email domains
                      </p>
                    </div>
                  </div>
                  <div className="group relative text-center bg-gradient-to-br from-green-50 via-green-100 to-green-50 rounded-2xl p-4 border border-green-200/50 hover:border-green-300 transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-500">3</div>
                      <h4 className="text-base font-bold text-gray-900 mb-2">Seamless Claims</h4>
                      <p className="text-gray-700 leading-relaxed text-xs">
                        Automatically discover and claim rewards from campaigns
                      </p>
                    </div>
                  </div>
                </div>

                {/* Latest Campaign Section */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="text-center mb-4">
                    <h4 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-1">
                      Latest Campaign
                    </h4>
                    <div className="w-20 h-0.5 bg-gradient-to-r from-purple-600 to-green-600 mx-auto rounded-full"></div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h5 className="text-lg font-bold text-gray-900 mb-1">gmail</h5>
                        <p className="text-sm text-gray-600">gmail desc</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">0.00000110 ETH</div>
                        <div className="text-xs text-gray-500">per claim</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <span className="text-purple-600 mr-1">🌐</span>
                          <span className="text-xs text-gray-500">Target Domain</span>
                        </div>
                        <div className="text-sm font-semibold text-purple-600">@gmail.com</div>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <span className="text-orange-600 mr-1">⏰</span>
                          <span className="text-xs text-gray-500">Expires</span>
                        </div>
                        <div className="text-sm font-semibold text-orange-600">6d 23h left</div>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <span className="text-blue-600 mr-1">💰</span>
                          <span className="text-xs text-gray-500">Funds Left</span>
                        </div>
                        <div className="text-sm font-semibold text-blue-600">0.00000322 ETH</div>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <span className="text-green-600 mr-1">🪙</span>
                          <span className="text-xs text-gray-500">Token Type</span>
                        </div>
                        <div className="text-sm font-semibold text-green-600">ETH</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>Campaign Progress</span>
                      <span>0.0% distributed</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Created by: <span className="font-mono">0xb6ad...8CA3</span>
                      </div>
                      <Link
                        to="/campaigns"
                        className="text-xs bg-purple-600 text-white px-3 py-1 rounded-full hover:bg-purple-700 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Campaign Stats */}
          <div className="flex flex-col">
            <div className="flex-1">
              <CampaignStatsCard />
            </div>

            {/* Additional Professional Touch */}
            <div className="mt-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 text-white">
              <div className="text-center">
                <div className="mb-3">
                  <div className="flex justify-center items-center mb-3">
                    <img
                      src="/img/vlayer-logo.png"
                      alt="vlayer logo"
                      className="h-12 w-auto object-contain"
                      onError={(e) => {
                        // Fallback if logo not found
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = `
                          <div class="text-2xl mb-2">⚡</div>
                          <div class="text-xl font-bold text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text">
                            vlayer
                          </div>
                        `;
                      }}
                    />
                  </div>
                </div>
                <h3 className="text-base font-bold mb-2">Blockchain Infrastructure</h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  Built on vlayer's innovative blockchain infrastructure with Blockscout explorer integration for complete transparency
                </p>
                <div className="space-y-2">
                  <Link
                    to="/campaigns"
                    className="inline-block bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors w-full"
                  >
                    View Live Campaigns
                  </Link>
                  <div className="flex items-center justify-center text-xs text-gray-400">
                    <span className="mr-1">🔍</span>
                    Powered by Blockscout Explorer
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
