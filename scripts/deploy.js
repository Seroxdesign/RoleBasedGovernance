const hre = require("hardhat");
const fs = require("fs");

async function main() {
  // Compile the contract
  await hre.run("compile");

  // Get the contract factory
  const RoleBasedGovernance = await hre.ethers.getContractFactory("RoleBasedGovernance");

  // Deploy the contract
  const contract = await RoleBasedGovernance.deploy([1, 2, 3], [10, 21, 33], );

  // Wait for the contract to be deployed
  await contract.deployed();

  // Log the contract address
  console.log("Contract deployed to:", contract.address);

  // Save the contract address to a file for easy reference
  fs.writeFileSync("contract-address.txt", contract.address);
}

// Run the deployment script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});