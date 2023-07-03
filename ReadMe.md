# RoleBasedGovernance Contract README

## Contract Overview
The RoleBasedGovernance contract is designed to manage a governance system where proposals can be created and voted on by members with different roles. The voting power of a member is determined by their role, and the roles are assigned different weights. The contract interacts with an `AutID` contract that manages members' roles.

## Contract Dependencies
The contract has two dependencies: 
- An AutID contract that provides identity and role management for DAO members.
- A DAOExpander contract. 

The addresses of these contracts are required when deploying the RoleBasedGovernance contract.

## Getting Started
To get started with the project, clone the repository and install the dependencies:

```
git clone <repository-url>
cd <repository-dir>
npm install
```

Dependencies:
- Solidity version `0.8.0`
- Hardhat for task running and testing
- Truffle for deployment
- ethers.js for interacting with the Ethereum blockchain

## Testing
To run the tests, you can use the `test` task provided by Hardhat:

```
npx hardhat test
```

This will compile the contract and run the tests in the `test` directory.

## Deployment
To deploy the contract, you'll need to add a Truffle configuration file (`truffle-config.js`) if it does not exist and set up the appropriate networks. Below is a sample configuration for the Mumbai testnet:

```javascript
module.exports = {
  networks: {
    mumbai: {
      provider: () => new HDWalletProvider(mnemonic, `https://rpc-mumbai.maticvigil.com`),
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },
  },
  compilers: {
    solc: {
      version: "0.8.0",
    }
  }
};
```

You'll need to replace `mnemonic` with your own 12 word mnemonic. Be sure to keep this mnemonic safe and don't commit it to your version control system.

Next, deploy the contract using Truffle:

```
truffle migrate --network mumbai
```

## Interacting with the Contract
Once the contract is deployed, you can interact with it using ethers.js or any other library that can interact with Ethereum smart contracts. Here's an example of how to do it:

```javascript
const provider = new ethers.providers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com');
const contract = new ethers.Contract(contractAddress, contractAbi, provider);

// Read the current proposal count
let proposalCount = await contract.proposalCount();
console.log(`Current proposal count: ${proposalCount}`);

// Create a proposal
const signer = provider.getSigner(yourPrivateKey);
const contractWithSigner = contract.connect(signer);
const tx = await contractWithSigner.createProposal('Proposal metadata CID', startTime, endTime);
await tx.wait();
```

Please replace `contractAddress` and `contractAbi` with your deployed contract address and ABI respectively. Replace `yourPrivateKey` with the private key of the account that you want to sign transactions with. The `startTime` and `endTime` should be Unix timestamps representing the start and end times for the proposal. 

## About the Contract
The contract has a few key features and functions that are worth noting:

1. **Role-Based Permissions**: The contract has a set of permissions that are enforced based on the roles of members in the DAO.

2. **Proposal Creation and Voting**: The contract allows members with a certain role to create proposals and cast votes on them. Each proposal has a start and end time, and votes can only be cast during this time period.

3

. **Role-Based Vote Weighting**: Each role is assigned a certain weight, and the weight of a member's vote is based on their role.

4. **Active Proposal Queries**: The contract provides a function to get all active proposal IDs, allowing you to query for proposals that are currently open for voting. 

5. **Event Emissions**: The contract emits events when proposals are created and votes are cast, allowing off-chain services to listen for these events and react accordingly. 

Please refer to the Solidity source code for a full understanding of the contract's functionality.
