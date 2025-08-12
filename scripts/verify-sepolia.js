const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Contract verification helper for Sepolia...");

  // Проверяем наличие необходимых переменных окружения
  if (!process.env.ETHERSCAN_API_KEY || process.env.ETHERSCAN_API_KEY === "your_etherscan_api_key_here") {
    console.error("❌ ETHERSCAN_API_KEY not set in .env file");
    console.log("💡 Please check your .env file configuration");
    process.exit(1);
  }

  console.log("✅ Etherscan API key is configured");
  console.log("🔑 API Key:", process.env.ETHERSCAN_API_KEY.substring(0, 8) + "...");

  console.log("\n🎯 For contract verification:");
  console.log("1. Deploy your contract through the frontend with MetaMask");
  console.log("2. Copy the deployed contract address");
  console.log("3. Use the verification form in the frontend");
  console.log("4. Or manually verify on Etherscan Sepolia");
  
  console.log("\n🔗 Verification Resources:");
  console.log("- Etherscan Sepolia: https://sepolia.etherscan.io");
  console.log("- Hardhat Verify Plugin: npx hardhat verify --network sepolia");
  console.log("- Frontend Verification Tab: Available in the Security Auditor");
  
  console.log("\n💡 Note: This script provides verification guidance.");
  console.log("   Actual verification will be done through the frontend or Hardhat CLI.");

  // Проверяем, есть ли уже информация о деплое
  const fs = require('fs');
  if (fs.existsSync('deployment-info-sepolia.json')) {
    console.log("\n📋 Found existing deployment info:");
    const deploymentInfo = JSON.parse(fs.readFileSync('deployment-info-sepolia.json', 'utf8'));
    console.log("- Contract:", deploymentInfo.contract);
    console.log("- Address:", deploymentInfo.address);
    console.log("- Network:", deploymentInfo.network);
    console.log("- Deployer:", deploymentInfo.deployer);
    
    console.log("\n🔍 To verify this contract:");
    console.log(`npx hardhat verify --network sepolia ${deploymentInfo.address} ${deploymentInfo.owner}`);
  } else {
    console.log("\n📝 No deployment info found yet.");
    console.log("   Deploy a contract first to see verification commands.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
