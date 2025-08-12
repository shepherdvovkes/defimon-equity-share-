const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Sepolia deployment setup for MetaMask...");

  // Проверяем наличие необходимых переменных окружения
  if (!process.env.SEPOLIA_URL || process.env.SEPOLIA_URL.includes("YOUR_INFURA_PROJECT_ID")) {
    console.error("❌ SEPOLIA_URL not set correctly in .env file");
    console.log("💡 Please check your .env file configuration");
    process.exit(1);
  }

  try {
    // Создаем провайдер для Sepolia
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_URL);
    
    // Получаем информацию о сети
    const network = await provider.getNetwork();
    console.log("🌐 Network:", network.name);
    console.log("🔗 Chain ID:", network.chainId.toString());
    
    // Проверяем последний блок
    const latestBlock = await provider.getBlockNumber();
    console.log("📦 Latest Block:", latestBlock);
    
    // Проверяем gas price
    const gasPrice = await provider.getFeeData();
    console.log("⛽ Gas Price:", ethers.formatUnits(gasPrice.gasPrice, "gwei"), "gwei");
    
    console.log("\n✅ Sepolia network is accessible!");
    
    console.log("\n🎯 For deployment with MetaMask:");
    console.log("1. Start the frontend: cd frontend && npm start");
    console.log("2. Connect MetaMask to Sepolia testnet (Chain ID: 11155111)");
    console.log("3. Ensure you have test ETH in your MetaMask wallet");
    console.log("4. Use the 'Deploy' tab in the frontend to deploy contracts");
    
    console.log("\n🔗 Sepolia Testnet Info:");
    console.log("- Chain ID: 11155111");
    console.log("- RPC URL: https://sepolia.infura.io/v3/[YOUR_API_KEY]");
    console.log("- Explorer: https://sepolia.etherscan.io");
    console.log("- Faucet: https://sepoliafaucet.com/");
    
    console.log("\n💡 Note: This script only checks network connectivity.");
    console.log("   Actual deployment will be done through the frontend with MetaMask.");

  } catch (error) {
    console.error("❌ Network check failed:", error.message);
    console.log("\n💡 Common issues:");
    console.log("1. Check your Infura API key");
    console.log("2. Ensure active internet connection");
    console.log("3. Verify Sepolia network status");
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
