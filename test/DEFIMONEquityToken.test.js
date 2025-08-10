const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("DEFIMONEquityToken", function () {
  let equityToken;
  let owner;
  let participant1;
  let participant2;
  let participant3;
  let nonParticipant;

  const TOTAL_SUPPLY = ethers.parseEther("10000000"); // 10M токенов
  const PROJECT_VALUATION = 10_000_000; // $10M
  const VESTING_PERIOD = 4 * 365 * 24 * 60 * 60; // 4 года
  const CLIFF_PERIOD = 1 * 365 * 24 * 60 * 60; // 1 год
  const CLIFF_PERCENTAGE = 25; // 25%

  beforeEach(async function () {
    [owner, participant1, participant2, participant3, nonParticipant] = await ethers.getSigners();
    
    const DEFIMONEquityToken = await ethers.getContractFactory("DEFIMONEquityToken");
    equityToken = await DEFIMONEquityToken.deploy(owner.address);
  });

  describe("Deployment", function () {
    it("Should deploy with correct initial values", async function () {
      expect(await equityToken.name()).to.equal("DEFIMON Equity Token");
      expect(await equityToken.symbol()).to.equal("DFX");
      expect(await equityToken.totalSupply()).to.equal(TOTAL_SUPPLY);
      expect(await equityToken.getProjectValuation()).to.equal(PROJECT_VALUATION);
      expect(await equityToken.owner()).to.equal(owner.address);
      expect(await equityToken.balanceOf(equityToken.target)).to.equal(TOTAL_SUPPLY);
    });

    it("Should have correct token price", async function () {
      const tokenPrice = await equityToken.getTokenPrice();
      expect(tokenPrice).to.equal(ethers.parseEther("1")); // $1 per token
    });
  });

  describe("Adding Participants", function () {
    it("Should add participants correctly", async function () {
      await equityToken.addParticipant("Иван", "Иванов", participant1.address, 40);
      await equityToken.addParticipant("Петр", "Петров", participant2.address, 35);
      await equityToken.addParticipant("Сергей", "Сергеев", participant3.address, 25);

      expect(await equityToken.getParticipantCount()).to.equal(3);
      
      const [firstName, lastName, wallet, totalAllocation] = await equityToken.getParticipantInfo(participant1.address);
      expect(firstName).to.equal("Иван");
      expect(lastName).to.equal("Иванов");
      expect(wallet).to.equal(participant1.address);
      expect(totalAllocation).to.equal(ethers.parseEther("4000000")); // 40% of 10M
    });

    it("Should validate allocation percentages", async function () {
      await equityToken.addParticipant("Иван", "Иванов", participant1.address, 40);
      await equityToken.addParticipant("Петр", "Петров", participant2.address, 35);
      
      // Попытка добавить участника с долей, превышающей 100%
      await expect(
        equityToken.addParticipant("Сергей", "Сергеев", participant3.address, 30)
      ).to.be.revertedWith("Total allocation exceeds supply");
    });

    it("Should prevent duplicate participants", async function () {
      await equityToken.addParticipant("Иван", "Иванов", participant1.address, 40);
      
      await expect(
        equityToken.addParticipant("Иван", "Иванов", participant1.address, 60)
      ).to.be.revertedWith("Participant already exists");
    });

    it("Should only allow owner to add participants", async function () {
      await expect(
        equityToken.connect(participant1).addParticipant("Иван", "Иванов", participant1.address, 40)
      ).to.be.revertedWithCustomError(equityToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Vesting Logic", function () {
    beforeEach(async function () {
      await equityToken.addParticipant("Иван", "Иванов", participant1.address, 40);
      await equityToken.addParticipant("Петр", "Петров", participant2.address, 35);
      await equityToken.addParticipant("Сергей", "Сергеев", participant3.address, 25);
    });

    it("Should start vesting correctly", async function () {
      const startTime = await time.latest();
      await equityToken.startVesting();
      
      const [,,, , , vestingStartTime] = await equityToken.getParticipantInfo(participant1.address);
      expect(vestingStartTime).to.be.gt(0);
    });

    it("Should calculate vested balance correctly after cliff", async function () {
      await equityToken.startVesting();
      
      // Перематываем время на 1 год + 1 день (после клиффа)
      await time.increase(CLIFF_PERIOD + 24 * 60 * 60);
      
      const vestedBalance = await equityToken.getVestedBalance(participant1.address);
      const expectedVested = ethers.parseEther("1000000"); // 25% of 4M tokens
      
      // Проверяем, что разница не превышает 10000 токенов (из-за точности вычислений)
      expect(vestedBalance).to.be.closeTo(expectedVested, ethers.parseEther("10000"));
    });

    it("Should calculate vested balance correctly during vesting", async function () {
      await equityToken.startVesting();
      
      // Перематываем время на 2 года (1 год клифф + 1 год вестинга)
      await time.increase(2 * 365 * 24 * 60 * 60);
      
      const vestedBalance = await equityToken.getVestedBalance(participant1.address);
      // 25% после клиффа + 25% за первый год вестинга = 50%
      const expectedVested = ethers.parseEther("2000000"); // 50% of 4M tokens
      
      expect(vestedBalance).to.equal(expectedVested);
    });

    it("Should complete vesting after full period", async function () {
      await equityToken.startVesting();
      
      // Перематываем время на 4 года + 1 день
      await time.increase(VESTING_PERIOD + 24 * 60 * 60);
      
      const vestedBalance = await equityToken.getVestedBalance(participant1.address);
      const expectedVested = ethers.parseEther("4000000"); // 100% of 4M tokens
      
      expect(vestedBalance).to.equal(expectedVested);
    });

    it("Should not allow claiming before cliff", async function () {
      await equityToken.startVesting();
      
      // Перематываем время на 6 месяцев (до клиффа)
      await time.increase(6 * 30 * 24 * 60 * 60);
      
      await expect(
        equityToken.connect(participant1).claimVestedTokens()
      ).to.be.revertedWith("No tokens available for claim");
    });
  });

  describe("Claiming Tokens", function () {
    beforeEach(async function () {
      await equityToken.addParticipant("Иван", "Иванов", participant1.address, 40);
      await equityToken.startVesting();
    });

    it("Should allow claiming vested tokens", async function () {
      // Перематываем время после клиффа
      await time.increase(CLIFF_PERIOD + 24 * 60 * 60);
      
      const vestedBalance = await equityToken.getVestedBalance(participant1.address);
      expect(vestedBalance).to.be.gt(0);
      
      const initialBalance = await equityToken.balanceOf(participant1.address);
      await equityToken.connect(participant1).claimVestedTokens();
      const finalBalance = await equityToken.balanceOf(participant1.address);
      
      // Проверяем, что разница близка к ожидаемой (из-за точности вычислений)
      expect(finalBalance - initialBalance).to.be.closeTo(vestedBalance, ethers.parseEther("10000"));
    });

    it("Should not allow claiming twice", async function () {
      // Перематываем время после клиффа
      await time.increase(CLIFF_PERIOD + 24 * 60 * 60);
      
      // Первый клейм
      await equityToken.connect(participant1).claimVestedTokens();
      
      // Проверяем, что второй клейм не даст токенов
      const vestedBalance = await equityToken.getVestedBalance(participant1.address);
      expect(vestedBalance).to.equal(0);
      
      // Второй клейм должен пройти успешно, но не дать токенов
      await equityToken.connect(participant1).claimVestedTokens();
      
      // Проверяем, что баланс не изменился значительно
      const finalBalance = await equityToken.balanceOf(participant1.address);
      const expectedBalance = ethers.parseEther("1000000"); // 25% of 4M tokens
      expect(finalBalance).to.be.closeTo(expectedBalance, ethers.parseEther("10000"));
    });

    it("Should only allow participants to claim", async function () {
      await time.increase(CLIFF_PERIOD + 24 * 60 * 60);
      
      await expect(
        equityToken.connect(nonParticipant).claimVestedTokens()
      ).to.be.revertedWith("Not a participant");
    });
  });

  describe("Participant Management", function () {
    beforeEach(async function () {
      await equityToken.addParticipant("Иван", "Иванов", participant1.address, 40);
      await equityToken.addParticipant("Петр", "Петров", participant2.address, 35);
      await equityToken.addParticipant("Сергей", "Сергеев", participant3.address, 25);
    });

    it("Should allow owner to change participant status", async function () {
      await equityToken.setParticipantStatus(participant1.address, false, true);
      
      const [,,,,,, isActive, isLeaver] = await equityToken.getParticipantInfo(participant1.address);
      expect(isActive).to.be.false;
      expect(isLeaver).to.be.true;
    });

    it("Should prevent leavers from claiming tokens", async function () {
      await equityToken.startVesting();
      await time.increase(CLIFF_PERIOD + 24 * 60 * 60);
      
      // Устанавливаем статус "покинул проект"
      await equityToken.setParticipantStatus(participant1.address, false, true);
      
      // Проверяем, что токены недоступны
      const vestedBalance = await equityToken.getVestedBalance(participant1.address);
      expect(vestedBalance).to.equal(0);
      
      // Проверяем, что клейм заблокирован из-за неактивного статуса
      await expect(
        equityToken.connect(participant1).claimVestedTokens()
      ).to.be.revertedWith("Participant is not active");
    });

    it("Should only allow owner to change participant status", async function () {
      await expect(
        equityToken.connect(participant1).setParticipantStatus(participant2.address, false, true)
      ).to.be.revertedWithCustomError(equityToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Token Transfers", function () {
    it("Should prevent direct transfers", async function () {
      await equityToken.addParticipant("Иван", "Иванов", participant1.address, 40);
      await equityToken.startVesting();
      await time.increase(CLIFF_PERIOD + 24 * 60 * 60);
      
      // Участник получает токены через клейм
      await equityToken.connect(participant1).claimVestedTokens();
      
      // Попытка прямого перевода должна быть заблокирована
      await expect(
        equityToken.connect(participant1).transfer(participant2.address, ethers.parseEther("1000"))
      ).to.be.revertedWith("Direct transfers not allowed. Use claimVestedTokens()");
    });
  });

  describe("Project Valuation", function () {
    it("Should allow owner to update project valuation", async function () {
      const newValuation = 20_000_000; // $20M
      await equityToken.updateProjectValuation(newValuation);
      
      expect(await equityToken.getProjectValuation()).to.equal(newValuation);
      
      // Проверяем новую стоимость токена
      const tokenPrice = await equityToken.getTokenPrice();
      expect(tokenPrice).to.equal(ethers.parseEther("2")); // $2 per token
    });

    it("Should only allow owner to update valuation", async function () {
      await expect(
        equityToken.connect(participant1).updateProjectValuation(20_000_000)
      ).to.be.revertedWithCustomError(equityToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero address correctly", async function () {
      await expect(
        equityToken.addParticipant("Test", "Test", ethers.ZeroAddress, 40)
      ).to.be.revertedWith("Invalid wallet address");
    });

    it("Should prevent adding participants with zero allocation", async function () {
      await expect(
        equityToken.addParticipant("Test", "Test", participant1.address, 0)
      ).to.be.revertedWith("Invalid allocation percentage");
    });

    it("Should prevent starting vesting without participants", async function () {
      await expect(
        equityToken.startVesting()
      ).to.be.revertedWith("No participants added");
    });
  });
});
