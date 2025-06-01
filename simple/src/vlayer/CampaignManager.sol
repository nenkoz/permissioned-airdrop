// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import {IERC20} from "@openzeppelin-contracts-5.0.1/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin-contracts-5.0.1/token/ERC721/IERC721.sol";
import {ReentrancyGuard} from "@openzeppelin-contracts-5.0.1/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin-contracts-5.0.1/access/Ownable.sol";
import {EmailDomainVerifier} from "./EmailProofVerifier.sol";

contract CampaignManager is ReentrancyGuard, Ownable {
    struct Campaign {
        uint256 id;
        address creator;
        string name;
        string description;
        string targetDomain;
        address tokenAddress; // Address of ERC20 token to distribute (0x0 for ETH)
        uint256 totalFunds;
        uint256 distributedFunds;
        uint256 rewardPerNFT;
        bool isActive;
        uint256 createdAt;
        uint256 expiresAt;
    }

    struct CampaignStats {
        uint256 totalCampaigns;
        uint256 activeCampaigns;
        uint256 totalFundsLocked;
    }

    uint256 public nextCampaignId = 1;
    mapping(uint256 => Campaign) public campaigns;
    mapping(string => uint256[]) public domainToCampaigns; // domain -> campaign IDs
    mapping(uint256 => mapping(uint256 => bool)) public nftClaimed; // campaignId -> tokenId -> claimed

    address public nftContractAddress;
    uint256 public platformFeePercentage = 250; // 2.5% in basis points
    address public feeRecipient;

    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed creator,
        string name,
        string targetDomain,
        address tokenAddress,
        uint256 totalFunds,
        uint256 rewardPerNFT
    );

    event CampaignFunded(
        uint256 indexed campaignId,
        address indexed funder,
        uint256 amount
    );

    event RewardClaimed(
        uint256 indexed campaignId,
        address indexed claimer,
        uint256 indexed tokenId,
        uint256 amount
    );

    event CampaignStatusChanged(uint256 indexed campaignId, bool isActive);

    modifier onlyCampaignCreator(uint256 campaignId) {
        require(
            campaigns[campaignId].creator == msg.sender,
            "Not campaign creator"
        );
        _;
    }

    modifier campaignExists(uint256 campaignId) {
        require(campaigns[campaignId].id != 0, "Campaign does not exist");
        _;
    }

    modifier campaignActive(uint256 campaignId) {
        Campaign memory campaign = campaigns[campaignId];
        require(campaign.isActive, "Campaign is not active");
        require(block.timestamp <= campaign.expiresAt, "Campaign has expired");
        _;
    }

    constructor(
        address _nftContractAddress,
        address _feeRecipient
    ) Ownable(msg.sender) {
        nftContractAddress = _nftContractAddress;
        feeRecipient = _feeRecipient;
    }

    function createCampaign(
        string memory _name,
        string memory _description,
        string memory _targetDomain,
        address _tokenAddress,
        uint256 _rewardPerNFT,
        uint256 _duration
    ) external payable nonReentrant returns (uint256) {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(
            bytes(_targetDomain).length > 0,
            "Target domain cannot be empty"
        );
        require(_rewardPerNFT > 0, "Reward per NFT must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");

        uint256 campaignId = nextCampaignId++;
        uint256 expiresAt = block.timestamp + _duration;

        Campaign storage campaign = campaigns[campaignId];
        campaign.id = campaignId;
        campaign.creator = msg.sender;
        campaign.name = _name;
        campaign.description = _description;
        campaign.targetDomain = _targetDomain;
        campaign.tokenAddress = _tokenAddress;
        campaign.rewardPerNFT = _rewardPerNFT;
        campaign.isActive = true;
        campaign.createdAt = block.timestamp;
        campaign.expiresAt = expiresAt;

        // Add campaign to domain mapping
        domainToCampaigns[_targetDomain].push(campaignId);

        // Handle initial funding
        if (_tokenAddress == address(0)) {
            // ETH campaign
            require(msg.value > 0, "Must send ETH for ETH campaign");
            uint256 platformFee = (msg.value * platformFeePercentage) / 10000;
            uint256 netAmount = msg.value - platformFee;

            campaign.totalFunds = netAmount;

            // Transfer platform fee
            if (platformFee > 0) {
                payable(feeRecipient).transfer(platformFee);
            }
        } else {
            // ERC20 campaign
            require(msg.value == 0, "Do not send ETH for ERC20 campaign");
            // For ERC20, we expect the creator to approve and then call fundCampaign separately
        }

        emit CampaignCreated(
            campaignId,
            msg.sender,
            _name,
            _targetDomain,
            _tokenAddress,
            campaign.totalFunds,
            _rewardPerNFT
        );

        return campaignId;
    }

    function fundCampaign(
        uint256 campaignId,
        uint256 amount
    )
        external
        payable
        nonReentrant
        campaignExists(campaignId)
        campaignActive(campaignId)
    {
        Campaign storage campaign = campaigns[campaignId];

        if (campaign.tokenAddress == address(0)) {
            // ETH funding
            require(msg.value > 0, "Must send ETH");
            uint256 platformFee = (msg.value * platformFeePercentage) / 10000;
            uint256 netAmount = msg.value - platformFee;

            campaign.totalFunds += netAmount;

            if (platformFee > 0) {
                payable(feeRecipient).transfer(platformFee);
            }

            emit CampaignFunded(campaignId, msg.sender, netAmount);
        } else {
            // ERC20 funding
            require(msg.value == 0, "Do not send ETH for ERC20 funding");
            require(amount > 0, "Amount must be greater than 0");

            IERC20 token = IERC20(campaign.tokenAddress);
            uint256 platformFee = (amount * platformFeePercentage) / 10000;
            uint256 netAmount = amount - platformFee;

            // Transfer tokens from sender
            require(
                token.transferFrom(msg.sender, address(this), netAmount),
                "Token transfer failed"
            );
            if (platformFee > 0) {
                require(
                    token.transferFrom(msg.sender, feeRecipient, platformFee),
                    "Fee transfer failed"
                );
            }

            campaign.totalFunds += netAmount;

            emit CampaignFunded(campaignId, msg.sender, netAmount);
        }
    }

    function claimReward(
        uint256 campaignId,
        uint256 tokenId
    )
        external
        nonReentrant
        campaignExists(campaignId)
        campaignActive(campaignId)
    {
        _claimReward(campaignId, tokenId);
    }

    function batchClaimRewards(
        uint256[] calldata campaignIds,
        uint256 tokenId
    ) external nonReentrant {
        require(campaignIds.length > 0, "No campaigns provided");
        require(campaignIds.length <= 50, "Too many campaigns"); // Reasonable gas limit

        // Verify NFT ownership once
        IERC721 nftContract = IERC721(nftContractAddress);
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not NFT owner");

        // Get the domain for this NFT once
        EmailDomainVerifier emailVerifier = EmailDomainVerifier(
            nftContractAddress
        );
        string memory nftDomain = emailVerifier.getTokenDomain(tokenId);

        uint256 totalETHReward = 0;
        address[] memory erc20Tokens = new address[](campaignIds.length);
        uint256[] memory erc20Amounts = new uint256[](campaignIds.length);
        uint256 erc20Count = 0;

        for (uint256 i = 0; i < campaignIds.length; i++) {
            uint256 campaignId = campaignIds[i];

            // Check campaign exists
            require(campaigns[campaignId].id != 0, "Campaign does not exist");

            Campaign storage campaign = campaigns[campaignId];

            // Skip if campaign is not active or expired
            if (!campaign.isActive || block.timestamp > campaign.expiresAt) {
                continue;
            }

            // Skip if already claimed
            if (nftClaimed[campaignId][tokenId]) {
                continue;
            }

            // Skip if insufficient funds
            if (
                campaign.totalFunds <
                campaign.distributedFunds + campaign.rewardPerNFT
            ) {
                continue;
            }

            // Skip if NFT is not from target domain
            if (
                keccak256(abi.encodePacked(nftDomain)) !=
                keccak256(abi.encodePacked(campaign.targetDomain))
            ) {
                continue;
            }

            // Mark as claimed and update distributed funds
            nftClaimed[campaignId][tokenId] = true;
            campaign.distributedFunds += campaign.rewardPerNFT;

            // Accumulate rewards by token type
            if (campaign.tokenAddress == address(0)) {
                totalETHReward += campaign.rewardPerNFT;
            } else {
                // Check if we already have this token
                bool tokenFound = false;
                for (uint256 j = 0; j < erc20Count; j++) {
                    if (erc20Tokens[j] == campaign.tokenAddress) {
                        erc20Amounts[j] += campaign.rewardPerNFT;
                        tokenFound = true;
                        break;
                    }
                }

                if (!tokenFound) {
                    erc20Tokens[erc20Count] = campaign.tokenAddress;
                    erc20Amounts[erc20Count] = campaign.rewardPerNFT;
                    erc20Count++;
                }
            }

            emit RewardClaimed(
                campaignId,
                msg.sender,
                tokenId,
                campaign.rewardPerNFT
            );
        }

        // Transfer all ETH rewards at once
        if (totalETHReward > 0) {
            payable(msg.sender).transfer(totalETHReward);
        }

        // Transfer all ERC20 rewards by token type
        for (uint256 i = 0; i < erc20Count; i++) {
            if (erc20Amounts[i] > 0) {
                IERC20 token = IERC20(erc20Tokens[i]);
                require(
                    token.transfer(msg.sender, erc20Amounts[i]),
                    "Token transfer failed"
                );
            }
        }
    }

    function _claimReward(uint256 campaignId, uint256 tokenId) internal {
        Campaign storage campaign = campaigns[campaignId];

        // Verify NFT ownership
        IERC721 nftContract = IERC721(nftContractAddress);
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not NFT owner");

        // Check if already claimed
        require(!nftClaimed[campaignId][tokenId], "Reward already claimed");

        // Check if there are sufficient funds
        require(
            campaign.totalFunds >=
                campaign.distributedFunds + campaign.rewardPerNFT,
            "Insufficient funds"
        );

        // Verify that the NFT corresponds to the campaign's target domain
        EmailDomainVerifier emailVerifier = EmailDomainVerifier(
            nftContractAddress
        );
        require(
            emailVerifier.isTokenFromDomain(tokenId, campaign.targetDomain),
            "NFT not from target domain"
        );

        // Mark as claimed
        nftClaimed[campaignId][tokenId] = true;
        campaign.distributedFunds += campaign.rewardPerNFT;

        // Transfer reward
        if (campaign.tokenAddress == address(0)) {
            // ETH reward
            payable(msg.sender).transfer(campaign.rewardPerNFT);
        } else {
            // ERC20 reward
            IERC20 token = IERC20(campaign.tokenAddress);
            require(
                token.transfer(msg.sender, campaign.rewardPerNFT),
                "Token transfer failed"
            );
        }

        emit RewardClaimed(
            campaignId,
            msg.sender,
            tokenId,
            campaign.rewardPerNFT
        );
    }

    function toggleCampaignStatus(
        uint256 campaignId
    ) external onlyCampaignCreator(campaignId) campaignExists(campaignId) {
        campaigns[campaignId].isActive = !campaigns[campaignId].isActive;
        emit CampaignStatusChanged(campaignId, campaigns[campaignId].isActive);
    }

    function withdrawUnusedFunds(
        uint256 campaignId
    )
        external
        onlyCampaignCreator(campaignId)
        campaignExists(campaignId)
        nonReentrant
    {
        Campaign storage campaign = campaigns[campaignId];
        require(
            !campaign.isActive || block.timestamp > campaign.expiresAt,
            "Campaign still active"
        );

        uint256 unusedFunds = campaign.totalFunds - campaign.distributedFunds;
        require(unusedFunds > 0, "No unused funds");

        campaign.totalFunds = campaign.distributedFunds;

        if (campaign.tokenAddress == address(0)) {
            // ETH withdrawal
            payable(msg.sender).transfer(unusedFunds);
        } else {
            // ERC20 withdrawal
            IERC20 token = IERC20(campaign.tokenAddress);
            require(
                token.transfer(msg.sender, unusedFunds),
                "Token transfer failed"
            );
        }
    }

    // View functions
    function getCampaign(
        uint256 campaignId
    ) external view returns (Campaign memory) {
        return campaigns[campaignId];
    }

    function getCampaignsForDomain(
        string memory domain
    ) external view returns (uint256[] memory) {
        return domainToCampaigns[domain];
    }

    function getActiveCampaignsForDomain(
        string memory domain
    ) external view returns (Campaign[] memory) {
        uint256[] memory campaignIds = domainToCampaigns[domain];
        uint256 activeCount = 0;

        // Count active campaigns
        for (uint256 i = 0; i < campaignIds.length; i++) {
            Campaign memory campaign = campaigns[campaignIds[i]];
            if (campaign.isActive && block.timestamp <= campaign.expiresAt) {
                activeCount++;
            }
        }

        // Create array of active campaigns
        Campaign[] memory activeCampaigns = new Campaign[](activeCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < campaignIds.length; i++) {
            Campaign memory campaign = campaigns[campaignIds[i]];
            if (campaign.isActive && block.timestamp <= campaign.expiresAt) {
                activeCampaigns[currentIndex] = campaign;
                currentIndex++;
            }
        }

        return activeCampaigns;
    }

    function getCampaignStats() external view returns (CampaignStats memory) {
        uint256 totalCampaigns = nextCampaignId - 1;
        uint256 activeCampaigns = 0;
        uint256 totalFundsLocked = 0;

        for (uint256 i = 1; i < nextCampaignId; i++) {
            Campaign memory campaign = campaigns[i];
            if (campaign.isActive && block.timestamp <= campaign.expiresAt) {
                activeCampaigns++;
                totalFundsLocked += (campaign.totalFunds -
                    campaign.distributedFunds);
            }
        }

        return
            CampaignStats({
                totalCampaigns: totalCampaigns,
                activeCampaigns: activeCampaigns,
                totalFundsLocked: totalFundsLocked
            });
    }

    function isNFTClaimedForCampaign(
        uint256 campaignId,
        uint256 tokenId
    ) external view returns (bool) {
        return nftClaimed[campaignId][tokenId];
    }

    function getClaimableCampaigns(
        uint256 tokenId
    ) external view returns (Campaign[] memory, uint256[] memory) {
        // First verify the token exists and get its domain
        IERC721 nftContract = IERC721(nftContractAddress);
        require(
            nftContract.ownerOf(tokenId) != address(0),
            "Token does not exist"
        );

        EmailDomainVerifier emailVerifier = EmailDomainVerifier(
            nftContractAddress
        );
        string memory nftDomain = emailVerifier.getTokenDomain(tokenId);

        // Get all campaigns for this domain
        uint256[] memory domainCampaigns = domainToCampaigns[nftDomain];

        // Count claimable campaigns
        uint256 claimableCount = 0;
        for (uint256 i = 0; i < domainCampaigns.length; i++) {
            uint256 campaignId = domainCampaigns[i];
            Campaign memory campaign = campaigns[campaignId];

            // Check if campaign is active, not expired, not claimed, and has funds
            if (
                campaign.isActive &&
                block.timestamp <= campaign.expiresAt &&
                !nftClaimed[campaignId][tokenId] &&
                campaign.totalFunds >=
                campaign.distributedFunds + campaign.rewardPerNFT
            ) {
                claimableCount++;
            }
        }

        // Create arrays for claimable campaigns
        Campaign[] memory claimableCampaigns = new Campaign[](claimableCount);
        uint256[] memory claimableCampaignIds = new uint256[](claimableCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < domainCampaigns.length; i++) {
            uint256 campaignId = domainCampaigns[i];
            Campaign memory campaign = campaigns[campaignId];

            if (
                campaign.isActive &&
                block.timestamp <= campaign.expiresAt &&
                !nftClaimed[campaignId][tokenId] &&
                campaign.totalFunds >=
                campaign.distributedFunds + campaign.rewardPerNFT
            ) {
                claimableCampaigns[currentIndex] = campaign;
                claimableCampaignIds[currentIndex] = campaignId;
                currentIndex++;
            }
        }

        return (claimableCampaigns, claimableCampaignIds);
    }

    function getAllActiveCampaigns()
        external
        view
        returns (Campaign[] memory, uint256[] memory)
    {
        // Count active campaigns
        uint256 activeCount = 0;
        for (uint256 i = 1; i < nextCampaignId; i++) {
            Campaign memory campaign = campaigns[i];
            if (campaign.isActive && block.timestamp <= campaign.expiresAt) {
                activeCount++;
            }
        }

        // Create arrays for active campaigns
        Campaign[] memory activeCampaigns = new Campaign[](activeCount);
        uint256[] memory activeCampaignIds = new uint256[](activeCount);
        uint256 currentIndex = 0;

        for (uint256 i = 1; i < nextCampaignId; i++) {
            Campaign memory campaign = campaigns[i];
            if (campaign.isActive && block.timestamp <= campaign.expiresAt) {
                activeCampaigns[currentIndex] = campaign;
                activeCampaignIds[currentIndex] = i;
                currentIndex++;
            }
        }

        return (activeCampaigns, activeCampaignIds);
    }

    // Admin functions
    function updatePlatformFee(uint256 _newFeePercentage) external onlyOwner {
        require(_newFeePercentage <= 1000, "Fee cannot exceed 10%"); // Max 10%
        platformFeePercentage = _newFeePercentage;
    }

    function updateFeeRecipient(address _newFeeRecipient) external onlyOwner {
        require(_newFeeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _newFeeRecipient;
    }

    function updateNFTContract(address _newNFTContract) external onlyOwner {
        require(_newNFTContract != address(0), "Invalid NFT contract");
        nftContractAddress = _newNFTContract;
    }
}
