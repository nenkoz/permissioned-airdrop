// Layout.js
import { Outlet, useLocation } from "react-router";
import { Modal } from "./Modal";

export const Layout = () => {
  const location = useLocation();
  const isCreateCampaign = location.pathname === "/create-campaign";
  const isClaimAirdrops = location.pathname === "/claim-airdrops";
  const isCampaigns = location.pathname === "/campaigns";
  const isWelcome = location.pathname === "/";

  // Use full-width layout for welcome, create campaign, claim airdrops, and campaigns pages
  if (isWelcome || isCreateCampaign || isClaimAirdrops || isCampaigns) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Outlet />
      </div>
    );
  }

  // Use modal layout for other pages with matching background
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Modal>
        <Outlet />
      </Modal>
    </div>
  );
};
