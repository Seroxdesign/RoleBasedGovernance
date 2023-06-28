// Import the contract artifacts and assert library
const RoleBasedGovernance = artifacts.require('RoleBasedGovernance');
const truffleAssert = require('truffle-assertions');

contract('RoleBasedGovernance', (accounts) => {
  let governance;

  beforeEach(async () => {
    governance = await RoleBasedGovernance.new([10, 21, 18], [10, 21, 18], accounts[0]);
  });

  it('should create a proposal', async () => {
    const startTime = Math.floor(Date.now() / 1000);
    const endTime = startTime + 86400; // 1 day

    const result = await governance.createProposal('Proposal 1', startTime, endTime);
    const proposalId = result.logs[0].args.proposalId.toNumber();

    const proposal = await governance.proposals(proposalId);

    assert.equal(proposal.metadataCID, 'Proposal 1', 'Incorrect metadata CID');
    assert.equal(proposal.startTime.toNumber(), startTime, 'Incorrect start time');
    assert.equal(proposal.endTime.toNumber(), endTime, 'Incorrect end time');
    assert.equal(proposal.yesVotes.toNumber(), 0, 'Incorrect initial yes votes');
    assert.equal(proposal.noVotes.toNumber(), 0, 'Incorrect initial no votes');
  });

  it('should vote on a proposal', async () => {
    const startTime = Math.floor(Date.now() / 1000);
    const endTime = startTime + 86400; // 1 day

    await governance.createProposal('Proposal 1', startTime, endTime);
    const proposalId = await governance.proposalCount();

    const member1 = accounts[1];
    const member2 = accounts[2];

    await governance.setMemberRole(member1, 1);
    await governance.setMemberRole(member2, 2);

    await governance.vote(proposalId, true, { from: member1 });
    await governance.vote(proposalId, false, { from: member2 });

    const proposal = await governance.proposals(proposalId);

    assert.equal(proposal.yesVotes.toNumber(), 10, 'Incorrect yes votes');
    assert.equal(proposal.noVotes.toNumber(), 21, 'Incorrect no votes');
  });

  it('should get active proposal IDs', async () => {
    const startTime1 = Math.floor(Date.now() / 1000);
    const endTime1 = startTime1 + 86400; // 1 day

    const startTime2 = endTime1 + 86400; // 1 day
    const endTime2 = startTime2 + 86400; // 1 day

    await governance.createProposal('Proposal 1', startTime1, endTime1);
    await governance.createProposal('Proposal 2', startTime2, endTime2);

    const activeProposalIds = await governance.getActiveProposalIDs();

    assert.equal(activeProposalIds.length, 1, 'Incorrect number of active proposals');
    assert.equal(activeProposalIds[0].toNumber(), 1, 'Incorrect active proposal ID');
  });
});