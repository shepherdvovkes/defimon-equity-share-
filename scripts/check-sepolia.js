const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking Sepolia testnet connection...");

  try {
    // Проверяем подключение к Sepolia
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
    
    console.log("✅ Sepolia connection successful!");
    console.log("\n💡 Next steps:");
    console.log("1. Connect MetaMask to Sepolia testnet");
    console.log("2. Ensure you have test ETH in your wallet");
    console.log("3. Use the frontend to deploy and interact with contracts");
    
  } catch (error) {
    console.error("❌ Failed to connect to Sepolia:", error.message);
    console.log("\n💡 Make sure you have:");
    console.log("1. Valid SEPOLIA_URL in .env file");
    console.log("2. Active internet connection");
    console.log("3. Valid Infura API key");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
