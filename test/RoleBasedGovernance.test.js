const RoleBasedGovernance = artifacts.require('RoleBasedGovernance');

contract('RoleBasedGovernance', (accounts) => {
  let governanceContract;

  const owner = '0x45751861f0101A857c1656eBCe3173AD249A4A60';
  const memberWithRole1 = [1, 2, 3];
  const memberWithRole2 = [10, 21, 33];
  const daoExpanderAddress = '0x45751861f0101A857c1656eBCe3173AD249A4A60';

  beforeEach(async () => {
    governanceContract = await RoleBasedGovernance.new([1, 2], [100, 200], daoExpanderAddress, {
      from: owner,
    });
  });

  it('should allow a member with role 1 to create a proposal', async () => {
    const metadataCID = 'proposal-metadata';
    const startTime = Math.floor(Date.now() / 1000); // Current timestamp
    const endTime = startTime + 3600; // 1 hour from the start time

    await governanceContract.createProposal(metadataCID, startTime, endTime, { from: memberWithRole1 });

    const proposal = await governanceContract.getProposal(1);

    assert.equal(proposal.metadataCID, metadataCID);
    assert.equal(proposal.startTime, startTime);
    assert.equal(proposal.endTime, endTime);
    assert.equal(proposal.yesVotes, 0);
    assert.equal(proposal.noVotes, 0);
  });

  it('should not allow a member without role 1 to create a proposal', async () => {
    const metadataCID = 'proposal-metadata';
    const startTime = Math.floor(Date.now() / 1000); // Current timestamp
    const endTime = startTime + 3600; // 1 hour from the start time

    try {
      await governanceContract.createProposal(metadataCID, startTime, endTime, { from: memberWithRole2 });
      assert.fail('Expected an exception');
    } catch (error) {
      assert.include(error.message, 'RoleBasedGovernance: Caller does not have the required role');
    }
  });

  // Add more test cases as needed
});