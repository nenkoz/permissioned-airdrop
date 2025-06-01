// Layout.js
import { Outlet, useLocation } from "react-router";
import { Modal } from "./Modal";
import { CampaignSidebar } from "./CampaignSidebar";

export const Layout = () => {
  const location = useLocation();
  const isCreateCampaign = location.pathname === "/create-campaign";
  const isClaimAirdrops = location.pathname === "/claim-airdrops";

  // Use full-width layout for create campaign and claim airdrops pages
  if (isCreateCampaign || isClaimAirdrops) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 relative">
        <div className="pr-80"> {/* Add right padding for sidebar */}
          <Outlet />
        </div>
        <CampaignSidebar />
      </div>
    );
  }

  // Use modal layout for other pages with matching background
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 relative">
      <div className="pr-80"> {/* Add right padding for sidebar */}
        <Modal>
          <Outlet />
        </Modal>
      </div>
      <CampaignSidebar />
    </div>
  );
};
