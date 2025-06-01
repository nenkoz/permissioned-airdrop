// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {EmailDomainVerifier} from "../src/vlayer/EmailProofVerifier.sol";
import {EmailDomainProver} from "../src/vlayer/EmailDomainProver.sol";
import {CampaignManager} from "../src/vlayer/CampaignManager.sol";

contract CampaignManagerScript is Script {
    EmailDomainProver public prover;
    EmailDomainVerifier public verifier;
    CampaignManager public campaignManager;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        // Use the latest deployed verifier address from the vlayer deployment
        address verifierAddress = 0x0A0962164D43C564d9d53a63a836D6B027B183ac;
        console.log("Using deployed EmailDomainVerifier at:", verifierAddress);

        // Deploy campaign manager with verifier address and fee recipient
        address feeRecipient = msg.sender; // Use deployer as initial fee recipient
        campaignManager = new CampaignManager(verifierAddress, feeRecipient);
        console.log("CampaignManager deployed at:", address(campaignManager));

        vm.stopBroadcast();
    }
}
