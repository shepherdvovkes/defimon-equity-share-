const { ethers } = require("hardhat");

async function main() {
  console.log("Adding participants to DEFIMON Equity Token...");

  // Адрес развернутого контракта
  const contractAddress = "0x..."; // Вставьте адрес вашего контракта

  try {
    // Получаем подписанта
    const [deployer] = await ethers.getSigners();
    console.log("Using account:", deployer.address);

    // Получаем экземпляр контракта
    const DEFIMONEquityToken = await ethers.getContractFactory("DEFIMONEquityToken");
    const contract = DEFIMONEquityToken.attach(contractAddress);

    // Список участников для добавления
    const participants = [
      {
        firstName: "John",
        lastName: "Doe",
        address: "0x...", // Вставьте адрес кошелька
        allocation: ethers.parseEther("1000000") // 1M токенов
      },
      {
        firstName: "Jane",
        lastName: "Smith",
        address: "0x...", // Вставьте адрес кошелька
        allocation: ethers.parseEther("800000") // 800K токенов
      },
      {
        firstName: "Bob",
        lastName: "Johnson",
        address: "0x...", // Вставьте адрес кошелька
        allocation: ethers.parseEther("600000") // 600K токенов
      }
    ];

    console.log("\nAdding participants...");

    // Добавляем участников
    for (const participant of participants) {
      try {
        const tx = await contract.addParticipant(
          participant.address,
          participant.firstName,
          participant.lastName,
          participant.allocation
        );
        await tx.wait();
        console.log(`   ${participant.firstName} ${participant.lastName} added successfully!`);
      } catch (error) {
        console.error(`   Error adding ${participant.firstName} ${participant.lastName}:`, error.message);
      }
    }

    // Запускаем вестинг
    console.log("\nStarting vesting...");
    try {
      const tx = await contract.startVesting();
      await tx.wait();
      console.log("Vesting started successfully!");
    } catch (error) {
      console.error("Error starting vesting:", error.message);
    }

    console.log("\nSetup completed!");

  } catch (error) {
    console.error("Script failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
