// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import the AutID interface
import "./IAutID.sol";

contract RoleBasedGovernance {
    //Proposal data needed for voting
    struct Proposal {
        string metadataCID;
        uint256 startTime;
        uint256 endTime;
        uint256 yesVotes;
        uint256 noVotes;
    }

    //Mapping types
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public proposalVotes;
    mapping(uint256 => mapping(uint256 => uint256)) public proposalRoleWeights;
    mapping(address => uint256) public memberRoles;

    uint256 public proposalCount;

    // Add the AutID interface reference
    IAutID private autID;
    address private daoExpander;

    //confirm only members of daoexpander with certain role
    modifier onlyMemberWithRole(uint256 role) {
        // Retrieve the caller's AutID from the AutID contract
        uint256 autIDTokenId = autID.getAutIDByOwner(msg.sender);

        // Retrieve the caller's DAO membership data from the AutID contract
        IAutID.DAOMember memory daoMember = autID.getMembershipData(msg.sender, daoExpander);

        // Check if the caller is the owner of a valid AutID and has the required role in the specified DAO
        require(
            autIDTokenId != 0 && autIDTokenId != type(uint256).max && daoMember.isActive && daoMember.role == role,
            "RoleBasedGovernance: Caller does not have the required role in the specified DAO"
        );

        _;
    }

    //emit events to track proposal creation and voting
    event ProposalCreated(uint256 proposalId, string metadataCID, uint256 startTime, uint256 endTime);
    event VoteCast(uint256 proposalId, address voter, bool vote);

    //initialize the contract with the autid contract address and the daoexpander address
    constructor(address autIDContract, address daoExpanderAddress) {
        //weights for votes of each role
        uint8[3] memory roleWeights = [10, 21, 18];

        // Initialize the AutID interface with the deployed contract address
        autID = IAutID(autIDContract);
        daoExpander = daoExpanderAddress;

        //set the role weights for the proposal
        for (uint256 i = 0; i < roleWeights.length; i++) {
            proposalRoleWeights[0][i] = roleWeights[i];
        }
    }

    //create a proposal with the metadata cid, start time and end time
    function createProposal(
        string memory metadataCID,
        uint256 startTime,
        uint256 endTime
    ) external onlyMemberWithRole(1) {
        require(startTime < endTime, "RoleBasedGovernance: Invalid proposal duration");

        uint256 proposalId = proposalCount + 1;
        proposals[proposalId] = Proposal({
            metadataCID: metadataCID,
            startTime: startTime,
            endTime: endTime,
            yesVotes: 0,
            noVotes: 0
        });

        proposalCount++;

        emit ProposalCreated(proposalId, metadataCID, startTime, endTime);
    }

    // cast a vote for a proposal, confirm only votes within specified time frame are counted
    function vote(uint256 proposalId, bool voteValue) external onlyMemberWithRole(2) {
        Proposal storage proposal = proposals[proposalId];

        require(block.timestamp >= proposal.startTime, "RoleBasedGovernance: Voting has not started yet");
        require(block.timestamp <= proposal.endTime, "RoleBasedGovernance: Voting has ended");
        require(!proposalVotes[proposalId][msg.sender], "RoleBasedGovernance: Member has already voted");

        proposalVotes[proposalId][msg.sender] = true;

        if (voteValue) {
            proposal.yesVotes += proposalRoleWeights[0][memberRoles[msg.sender]];
        } else {
            proposal.noVotes += proposalRoleWeights[0][memberRoles[msg.sender]];
        }

        //emit event to track vote
        emit VoteCast(proposalId, msg.sender, voteValue);
    }

    function setMemberRole(address member, uint256 role) external onlyMemberWithRole(1) {
        memberRoles[member] = role;
    }
    
    //get proposal data for the specified proposal id
    function getProposal(uint256 proposalId)
        external
        view
        returns (
            string memory metadataCID,
            uint256 startTime,
            uint256 endTime,
            uint256 yesVotes,
            uint256 noVotes
        )
    {
        Proposal storage proposal = proposals[proposalId];

        return (
            proposal.metadataCID,
            proposal.startTime,
            proposal.endTime,
            proposal.yesVotes,
            proposal.noVotes
        );
    }

    // get all active proposal ids
    function getActiveProposalIDs() external view returns (uint256[] memory activeProposalIds) {
        uint256[] memory proposalIds = new uint256[](proposalCount);
        uint256 activeCount = 0;

        for (uint256 i = 1; i <= proposalCount; i++) {
            Proposal storage proposal = proposals[i];
            if (block.timestamp >= proposal.startTime && block.timestamp <= proposal.endTime) {
                proposalIds[activeCount] = i;
                activeCount++;
            }
        }

        activeProposalIds = new uint256[](activeCount);

        for (uint256 i = 0; i < activeCount; i++) {
            activeProposalIds[i] = proposalIds[i];
        }

        return activeProposalIds;
    }
}