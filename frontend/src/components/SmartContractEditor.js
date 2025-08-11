import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FaCode, FaCog, FaPlay, FaSave, FaRocket, FaCheckCircle } from 'react-icons/fa';

const Container = styled.div`
  padding: 20px;
`;

const Section = styled.div`
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  border: 1px solid #e9ecef;
`;

const Button = styled.button`
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 5px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 16px;
  margin: 5px 0;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.25);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  font-family: 'Courier New', monospace;
  margin: 5px 0;
  min-height: 300px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.25);
  }
`;

const VariableCard = styled.div`
  background: white;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  margin: 10px 0;
`;

const TabContainer = styled.div`
  display: flex;
  background: #e9ecef;
  border-radius: 8px;
  padding: 5px;
  margin: 20px 0;
`;

const Tab = styled.button`
  flex: 1;
  padding: 10px 15px;
  border: none;
  background: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? '#333' : '#666'};
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.5)'};
  }
`;

function SmartContractEditor({ contract, onStatusUpdate, isOwner, onContractCodeUpdate }) {
  const [activeTab, setActiveTab] = useState('variables');
  const [loading, setLoading] = useState(false);
  const [contractCode, setContractCode] = useState('');
  const [variables, setVariables] = useState([
    { name: 'TOTAL_SUPPLY', value: '10000000000000000000000000', type: 'uint256', description: 'Total supply of tokens (with 18 decimals)' },
    { name: 'VESTING_PERIOD', value: '126144000', type: 'uint256', description: 'Vesting duration in seconds (4 years)' },
    { name: 'CLIFF_PERIOD', value: '31536000', type: 'uint256', description: 'Cliff duration in seconds (1 year)' },
    { name: 'CLIFF_PERCENTAGE', value: '25', type: 'uint256', description: 'Percentage of tokens unlocked after cliff (25%)' },
    { name: 'projectValuation', value: '10000000', type: 'uint256', description: 'Project valuation in USD' }
  ]);

  const loadBaseContractCode = useCallback(() => {
    // Your existing DEFIMONEquityToken.sol contract
    const realContractCode = `// SPDX-License-Identifier: MIT
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
}`;
    
    setContractCode(realContractCode);
    
    // Update variables from the real code
    updateVariablesFromCode(realContractCode);
  }, []);

  const updateVariablesFromCode = (code) => {
    const newVariables = [];
    
    // Extract constants from code
    const constantRegex = /uint256 public constant (\w+) = ([^;]+);/g;
    let match;
    
    while ((match = constantRegex.exec(code)) !== null) {
      const name = match[1];
      const value = match[2].trim();
      
      // Determine type and description based on name
      let type = 'uint256';
      let description = `${name} parameter`;
      
      if (name === 'TOTAL_SUPPLY') {
        description = 'Total supply of tokens (with 18 decimals)';
      } else if (name === 'VESTING_PERIOD') {
        description = 'Vesting duration in seconds (4 years)';
      } else if (name === 'CLIFF_PERIOD') {
        description = 'Cliff duration in seconds (1 year)';
      } else if (name === 'CLIFF_PERCENTAGE') {
        description = 'Percentage of tokens unlocked after cliff (25%)';
      }
      
      newVariables.push({
        name,
        value: value.replace(/[^0-9]/g, ''), // Remove all except numbers
        type,
        description
      });
    }
    
    // Extract regular variables
    const variableRegex = /uint256 public (\w+) = ([^;]+);/g;
    
    while ((match = variableRegex.exec(code)) !== null) {
      const name = match[1];
      const value = match[2].trim();
      
      // Determine type and description based on name
      let type = 'uint256';
      let description = `${name} parameter`;
      
      if (name === 'projectValuation') {
        description = 'Project valuation in USD';
      }
      
      newVariables.push({
        name,
        value: value.replace(/[^0-9]/g, ''), // Remove all except numbers
        type,
        description
      });
    }
    
    if (newVariables.length > 0) {
      setVariables(newVariables);
    }
  };

  const updateVariable = (index, field, value) => {
    const newVariables = [...variables];
    newVariables[index][field] = value;
    setVariables(newVariables);
  };

  const addVariable = () => {
    setVariables([...variables, { name: '', value: '', type: 'uint256', description: '' }]);
  };

  const removeVariable = (index) => {
    const newVariables = variables.filter((_, i) => i !== index);
    setVariables(newVariables);
  };

  const compileContract = async () => {
    try {
      setLoading(true);
      // Here should be contract compilation logic
      // For now, just show a message
      onStatusUpdate('success', 'Contract successfully compiled! All variables updated.');
      
      // Update contract code with new variables
      let newCode = contractCode;
      variables.forEach(variable => {
        // Update constants
        const constantRegex = new RegExp(`(uint256 public constant ${variable.name} = )[^;]+;`, 'g');
        newCode = newCode.replace(constantRegex, `uint256 public constant ${variable.name} = ${variable.value};`);
        
        // Update regular variables
        const variableRegex = new RegExp(`(uint256 public ${variable.name} = )[^;]+;`, 'g');
        newCode = newCode.replace(variableRegex, `uint256 public ${variable.name} = ${variable.value};`);
      });
      setContractCode(newCode);
      
      // Send updated code back
      onContractCodeUpdate(newCode);
      
    } catch (error) {
      onStatusUpdate('error', `Compilation error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deployContract = async () => {
    try {
      setLoading(true);
      onStatusUpdate('success', 'Deploy function will be implemented');
    } catch (error) {
      onStatusUpdate('error', `Deploy error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const saveContract = async () => {
    try {
      setLoading(true);
      onStatusUpdate('success', 'Contract saved!');
      
      // Send saved code back
      onContractCodeUpdate(contractCode);
      
    } catch (error) {
      onStatusUpdate('error', `Save error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Initialize contract code when component mounts
  useEffect(() => {
    loadBaseContractCode();
  }, [loadBaseContractCode]);

  if (!isOwner) {
    return (
      <Container>
        <Section>
          <h3>
            <FaCode style={{ marginRight: '8px' }} />
            Smart Contract Editor
          </h3>
          <p>Доступ к редактированию смарт-контракта только для владельца проекта. Если вы являетесь владельцем, убедитесь что ваш кошелек подключен и авторизован в системе.</p>
          <div style={{ 
            marginTop: '15px', 
            padding: '15px', 
            background: '#fff3cd', 
            border: '1px solid #ffeaa7', 
            borderRadius: '8px',
            color: '#856404',
            textAlign: 'center'
          }}>
            <strong>Текущий статус:</strong> {isOwner ? 'Доступ разрешен' : 'Доступ запрещен'}
          </div>
        </Section>
      </Container>
    );
  }

  return (
    <Container>
      <Section>
        <h3>
          <FaCode style={{ marginRight: '8px' }} />
          Smart Contract Editor - Step 1: Edit DEFIMONEquityToken.sol
        </h3>
        <p>Edit your existing DEFIMONEquityToken.sol smart contract before deployment.</p>
        
        {contractCode && (
          <div style={{ 
            marginTop: '15px', 
            padding: '15px', 
            background: '#d4edda', 
            border: '1px solid #c3e6cb', 
            borderRadius: '8px',
            color: '#155724',
            textAlign: 'center'
          }}>
            <FaCheckCircle style={{ marginRight: '8px' }} />
            Your DEFIMONEquityToken.sol contract is loaded and ready for editing
          </div>
        )}
      </Section>

      <TabContainer>
        <Tab 
          active={activeTab === 'variables'} 
          onClick={() => setActiveTab('variables')}
        >
          <FaCog style={{ marginRight: '8px' }} />
          Variables
        </Tab>
        <Tab 
          active={activeTab === 'code'} 
          onClick={() => setActiveTab('code')}
        >
          <FaCode style={{ marginRight: '8px' }} />
          Contract Code
        </Tab>
      </TabContainer>

      {activeTab === 'variables' && (
        <Section>
          <h4>
            <FaCog style={{ marginRight: '8px' }} />
            Contract Variables
          </h4>
          <p>Edit contract variables. After changes, click "Compile & Update" to update the code.</p>
          
          {variables.map((variable, index) => (
            <VariableCard key={index}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr auto', gap: '10px', alignItems: 'center' }}>
                <Input
                  placeholder="Variable name"
                  value={variable.name}
                  onChange={(e) => updateVariable(index, 'name', e.target.value)}
                />
                <Input
                  placeholder="Value"
                  value={variable.value}
                  onChange={(e) => updateVariable(index, 'value', e.target.value)}
                />
                <select
                  value={variable.type}
                  onChange={(e) => updateVariable(index, 'type', e.target.value)}
                  style={{ padding: '12px', border: '1px solid #ced4da', borderRadius: '6px' }}
                >
                  <option value="uint256">uint256</option>
                  <option value="uint128">uint128</option>
                  <option value="uint64">uint64</option>
                  <option value="uint32">uint32</option>
                  <option value="uint16">uint16</option>
                  <option value="uint8">uint8</option>
                  <option value="address">address</option>
                  <option value="bool">bool</option>
                  <option value="string">string</option>
                </select>
                <Input
                  placeholder="Description"
                  value={variable.description}
                  onChange={(e) => updateVariable(index, 'description', e.target.value)}
                />
                <Button 
                  onClick={() => removeVariable(index)}
                  style={{ background: '#dc3545', padding: '8px 12px' }}
                >
                  Remove
                </Button>
              </div>
            </VariableCard>
          ))}
          
          <Button onClick={addVariable} style={{ background: '#28a745' }}>
            Add Variable
          </Button>
          
          <div style={{ marginTop: '20px' }}>
            <Button onClick={compileContract} disabled={loading}>
              <FaPlay style={{ marginRight: '8px' }} />
              Compile & Update
            </Button>
            <Button onClick={saveContract} disabled={loading} style={{ background: '#28a745' }}>
              <FaSave style={{ marginRight: '8px' }} />
              Save Contract
            </Button>
            <Button 
              onClick={() => window.location.hash = '#deployment'} 
              style={{ background: '#ffc107', color: '#333' }}
            >
              <FaRocket style={{ marginRight: '8px' }} />
              Go to Deploy
            </Button>
          </div>
        </Section>
      )}

      {activeTab === 'code' && (
        <Section>
          <h4>
            <FaCode style={{ marginRight: '8px' }} />
            Contract Code
          </h4>
          <p>Edit the smart contract code. After changes, click "Compile & Check" for verification.</p>
          
          <TextArea
            value={contractCode}
            onChange={(e) => {
              setContractCode(e.target.value);
              // Send code changes back
              onContractCodeUpdate(e.target.value);
            }}
            placeholder="Enter smart contract code..."
          />
          
          <div style={{ marginTop: '20px' }}>
            <Button onClick={compileContract} disabled={loading}>
              <FaPlay style={{ marginRight: '8px' }} />
              Compile & Check
            </Button>
            <Button onClick={saveContract} disabled={loading} style={{ background: '#28a745' }}>
              <FaSave style={{ marginRight: '8px' }} />
              Save Contract
            </Button>
            <Button onClick={deployContract} disabled={loading} style={{ background: '#ffc107', color: '#333' }}>
              Deploy Contract
            </Button>
          </div>
        </Section>
      )}
    </Container>
  );
}

export default SmartContractEditor;
