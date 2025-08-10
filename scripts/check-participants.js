const { ethers } = require("hardhat");

async function main() {
  console.log("Checking participants in DEFIMON Equity Token...");

  // Адрес контракта (замените на ваш)
  const contractAddress = "0x..."; // Вставьте адрес вашего контракта

  try {
    // Получаем подписанта
    const [deployer] = await ethers.getSigners();
    console.log("Using account:", deployer.address);

    // Получаем экземпляр контракта
    const DEFIMONEquityToken = await ethers.getContractFactory("DEFIMONEquityToken");
    const contract = DEFIMONEquityToken.attach(contractAddress);

    // Получаем количество участников
    const participantCount = await contract.getParticipantCount();
    console.log("\nTotal participants:", participantCount);

    // Получаем информацию о каждом участнике
    for (let i = 0; i < participantCount; i++) {
      const participant = await contract.getParticipantByIndex(i);
      const address = participant[0];
      const firstName = participant[1];
      const lastName = participant[2];
      const totalAllocation = participant[3];
      const claimedAmount = participant[4];
      const isActive = participant[5];
      const isLeaver = participant[6];
      const vestingStartTime = participant[7];

      console.log(`\nParticipant ${i + 1}:`);
      console.log(`  Address: ${address}`);
      console.log(`  Name: ${firstName} ${lastName}`);
      console.log(`  Total Allocation: ${ethers.formatEther(totalAllocation)} DFX`);
      console.log(`  Claimed Amount: ${ethers.formatEther(claimedAmount)} DFX`);
      console.log(`  Is Active: ${isActive}`);
      console.log(`  Is Leaver: ${isLeaver}`);
      console.log(`  Vesting Start Time: ${new Date(Number(vestingStartTime) * 1000).toLocaleString()}`);
    }

  } catch (error) {
    console.error("Error checking participants:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
