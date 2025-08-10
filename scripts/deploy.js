const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment of DEFIMON Equity Token...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Получаем фабрику контракта
  const DEFIMONEquityToken = await ethers.getContractFactory("DEFIMONEquityToken");
  
  // Деплоим контракт
  const contract = await DEFIMONEquityToken.deploy(deployer.address);
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("DEFIMONEquityToken deployed to:", contractAddress);

  // Получаем информацию о контракте
  const totalSupply = await contract.totalSupply();
  const owner = await contract.owner();

  console.log("\nContract Information:");
  console.log("Total Supply:", ethers.formatEther(totalSupply));
  console.log("Owner:", owner);

  console.log("\nNext steps:");
  console.log("1. Verify the contract on Etherscan");
  console.log("2. Set up vesting schedules for participants");
  console.log("3. Test the contract functionality");

  // Сохраняем информацию о деплое
  const deploymentInfo = {
    contract: "DEFIMONEquityToken",
    address: contractAddress,
    network: "hardhat",
    deployer: deployer.address,
    totalSupply: ethers.formatEther(totalSupply),
    owner: owner,
    deploymentTime: new Date().toISOString()
  };

  const fs = require('fs');
  fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("\nDeployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
