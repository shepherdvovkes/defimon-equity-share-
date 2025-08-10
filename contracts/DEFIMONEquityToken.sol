// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title DEFIMON Equity Token
 * @dev ERC-20 токен с механизмом вестинга для распределения долей между основателями
 * @author DEFIMON Team
 */
contract DEFIMONEquityToken is ERC20, Ownable, ReentrancyGuard {


    // Структура участника
    struct Participant {
        string firstName;
        string lastName;
        address wallet;
        uint256 totalAllocation;      // Общая доля в токенах
        uint256 claimedAmount;        // Уже полученные токены
        uint256 vestingStartTime;     // Время начала вестинга
        uint256 cliffDuration;        // Длительность клиффа (в секундах)
        uint256 vestingDuration;      // Общая длительность вестинга (в секундах)
        bool isActive;                // Активен ли участник
        bool isLeaver;                // Покинул ли проект
    }

    // Константы
    uint256 public constant TOTAL_SUPPLY = 10_000_000 * 10**18; // 10M токенов с 18 десятичными знаками
    uint256 public constant VESTING_PERIOD = 4 * 365 * 24 * 60 * 60; // 4 года в секундах
    uint256 public constant CLIFF_PERIOD = 1 * 365 * 24 * 60 * 60;   // 1 год в секундах
    uint256 public constant CLIFF_PERCENTAGE = 25; // 25% токенов размораживается после клиффа

    // Переменные состояния
    mapping(address => Participant) public participants;
    address[] public participantAddresses;
    uint256 public totalAllocatedTokens;
    uint256 public projectValuation = 10_000_000; // $10M в долларах

    // События
    event ParticipantAdded(address indexed wallet, string firstName, string lastName, uint256 allocation);
    event TokensClaimed(address indexed participant, uint256 amount);
    event ParticipantStatusChanged(address indexed participant, bool isActive, bool isLeaver);
    event VestingStarted(uint256 startTime);

    // Модификаторы
    modifier onlyParticipant() {
        require(participants[msg.sender].wallet != address(0), "Not a participant");
        require(participants[msg.sender].isActive, "Participant is not active");
        require(!participants[msg.sender].isLeaver, "Participant has left the project");
        _;
    }

    modifier onlyActiveParticipant(address participant) {
        require(participants[participant].wallet != address(0), "Not a participant");
        require(participants[participant].isActive, "Participant is not active");
        _;
    }

    /**
     * @dev Конструктор контракта
     * @param _owner Адрес владельца контракта
     */
    constructor(address _owner) ERC20("DEFIMON Equity Token", "DFX") Ownable(_owner) {
        _mint(address(this), TOTAL_SUPPLY);
    }

    /**
     * @dev Добавление участника в систему
     * @param _firstName Имя участника
     * @param _lastName Фамилия участника
     * @param _wallet Адрес кошелька участника
     * @param _allocationPercentage Процент доли (например, 40 для 40%)
     */
    function addParticipant(
        string memory _firstName,
        string memory _lastName,
        address _wallet,
        uint256 _allocationPercentage
    ) external onlyOwner {
        require(_wallet != address(0), "Invalid wallet address");
        require(_allocationPercentage > 0 && _allocationPercentage <= 100, "Invalid allocation percentage");
        require(participants[_wallet].wallet == address(0), "Participant already exists");

        uint256 allocation = TOTAL_SUPPLY * _allocationPercentage / 100;
        require(totalAllocatedTokens + allocation <= TOTAL_SUPPLY, "Total allocation exceeds supply");

        participants[_wallet] = Participant({
            firstName: _firstName,
            lastName: _lastName,
            wallet: _wallet,
            totalAllocation: allocation,
            claimedAmount: 0,
            vestingStartTime: 0, // Будет установлено при старте вестинга
            cliffDuration: CLIFF_PERIOD,
            vestingDuration: VESTING_PERIOD,
            isActive: true,
            isLeaver: false
        });

        participantAddresses.push(_wallet);
        totalAllocatedTokens = totalAllocatedTokens + allocation;

        emit ParticipantAdded(_wallet, _firstName, _lastName, allocation);
    }

    /**
     * @dev Запуск вестинга для всех участников
     */
    function startVesting() external onlyOwner {
        require(participantAddresses.length > 0, "No participants added");
        
        uint256 startTime = block.timestamp;
        
        for (uint i = 0; i < participantAddresses.length; i++) {
            address participantAddr = participantAddresses[i];
            if (participants[participantAddr].isActive) {
                participants[participantAddr].vestingStartTime = startTime;
            }
        }

        emit VestingStarted(startTime);
    }

    /**
     * @dev Получение размороженных токенов участником
     */
    function claimVestedTokens() external nonReentrant onlyParticipant {
        uint256 claimableAmount = getVestedBalance(msg.sender);
        require(claimableAmount > 0, "No tokens available for claim");

        participants[msg.sender].claimedAmount = participants[msg.sender].claimedAmount + claimableAmount;
        _transfer(address(this), msg.sender, claimableAmount);

        emit TokensClaimed(msg.sender, claimableAmount);
    }

    /**
     * @dev Получение баланса размороженных токенов для участника
     * @param _participant Адрес участника
     * @return Количество доступных для получения токенов
     */
    function getVestedBalance(address _participant) public view returns (uint256) {
        Participant storage participant = participants[_participant];
        
        if (participant.wallet == address(0) || !participant.isActive || participant.isLeaver) {
            return 0;
        }

        if (participant.vestingStartTime == 0) {
            return 0; // Вестинг еще не начался
        }

        uint256 timeElapsed = block.timestamp - participant.vestingStartTime;
        
        // Если не прошел клифф, токены недоступны
        if (timeElapsed < participant.cliffDuration) {
            return 0;
        }

        // Вычисляем общее количество размороженных токенов
        uint256 totalVested;
        
        if (timeElapsed >= participant.vestingDuration) {
            // Вестинг завершен - все токены разморожены
            totalVested = participant.totalAllocation;
        } else {
            // Вычисляем прогресс вестинга
            uint256 vestingProgress = timeElapsed - participant.cliffDuration;
            uint256 remainingVestingTime = participant.vestingDuration - participant.cliffDuration;
            
            // 25% после клиффа + пропорциональная часть оставшихся 75%
            uint256 cliffTokens = participant.totalAllocation * CLIFF_PERCENTAGE / 100;
            uint256 remainingTokens = participant.totalAllocation - cliffTokens;
            uint256 progressiveTokens = remainingTokens * vestingProgress / remainingVestingTime;
            
            totalVested = cliffTokens + progressiveTokens;
        }

        // Возвращаем разницу между размороженными и уже полученными токенами
        if (totalVested > participant.claimedAmount) {
            return totalVested - participant.claimedAmount;
        }
        
        return 0;
    }

    /**
     * @dev Изменение статуса участника (только для владельца)
     * @param _participant Адрес участника
     * @param _isActive Активен ли участник
     * @param _isLeaver Покинул ли проект
     */
    function setParticipantStatus(
        address _participant,
        bool _isActive,
        bool _isLeaver
    ) external onlyOwner onlyActiveParticipant(_participant) {
        participants[_participant].isActive = _isActive;
        participants[_participant].isLeaver = _isLeaver;

        emit ParticipantStatusChanged(_participant, _isActive, _isLeaver);
    }

    /**
     * @dev Получение информации об участнике
     * @param _participant Адрес участника
     * @return firstName Имя
     * @return lastName Фамилия
     * @return wallet Адрес кошелька
     * @return totalAllocation Общая доля
     * @return claimedAmount Полученные токены
     * @return vestingStartTime Время начала вестинга
     * @return isActive Активен ли
     * @return isLeaver Покинул ли проект
     */
    function getParticipantInfo(address _participant) external view returns (
        string memory firstName,
        string memory lastName,
        address wallet,
        uint256 totalAllocation,
        uint256 claimedAmount,
        uint256 vestingStartTime,
        bool isActive,
        bool isLeaver
    ) {
        Participant storage participant = participants[_participant];
        return (
            participant.firstName,
            participant.lastName,
            participant.wallet,
            participant.totalAllocation,
            participant.claimedAmount,
            participant.vestingStartTime,
            participant.isActive,
            participant.isLeaver
        );
    }

    /**
     * @dev Получение списка всех адресов участников
     * @return Массив адресов участников
     */
    function getAllParticipantAddresses() external view returns (address[] memory) {
        return participantAddresses;
    }

    /**
     * @dev Получение общего количества участников
     * @return Количество участников
     */
    function getParticipantCount() external view returns (uint256) {
        return participantAddresses.length;
    }

    /**
     * @dev Получение оставшихся нераспределенных токенов
     * @return Количество нераспределенных токенов
     */
    function getRemainingTokens() external view returns (uint256) {
        return TOTAL_SUPPLY - totalAllocatedTokens;
    }

    /**
     * @dev Получение текущей оценки проекта
     * @return Оценка в долларах
     */
    function getProjectValuation() external view returns (uint256) {
        return projectValuation;
    }

    /**
     * @dev Обновление оценки проекта (только для владельца)
     * @param _newValuation Новая оценка в долларах
     */
    function updateProjectValuation(uint256 _newValuation) external onlyOwner {
        require(_newValuation > 0, "Valuation must be positive");
        projectValuation = _newValuation;
    }

    /**
     * @dev Получение стоимости одного токена
     * @return Стоимость токена в долларах (с 18 десятичными знаками)
     */
    function getTokenPrice() external view returns (uint256) {
        return projectValuation * 10**18 / (TOTAL_SUPPLY / 10**18);
    }

    // Override функции ERC20 для предотвращения прямых переводов
    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        require(false, "Direct transfers not allowed. Use claimVestedTokens()");
        return false;
    }

    function transferFrom(address from, address to, uint256 amount) public virtual override returns (bool) {
        require(false, "Direct transfers not allowed. Use claimVestedTokens()");
        return false;
    }
}
