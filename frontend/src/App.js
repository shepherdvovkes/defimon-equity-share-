import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';
import Header from './components/Header';
import ContractDeployment from './components/ContractDeployment';
import ParticipantForm from './components/ParticipantForm';
import VestingDashboard from './components/VestingDashboard';
import MultiSignatureManager from './components/MultiSignatureManager';
import ExchangeManager from './components/ExchangeManager';
import TokenPriceManager from './components/TokenPriceManager';
import SmartContractEditor from './components/SmartContractEditor';
import SecurityAuditor from './components/SecurityAuditor';
import { FaRocket, FaUsers, FaChartLine, FaSignature, FaExchangeAlt, FaDollarSign, FaCode, FaShieldAlt } from 'react-icons/fa';
import DEFIMONEquityToken from './contracts/DEFIMONEquityToken.json';
import { isAuthorizedUser, getUserInfo } from './config/users';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const TabContainer = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 5px;
  margin: 20px 0;
  backdrop-filter: blur(10px);
`;

const Tab = styled.button`
  flex: 1;
  padding: 15px 20px;
  border: none;
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 30px;
  margin: 20px 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
`;

const StatusMessage = styled.div`
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
  text-align: center;
  font-weight: 500;
  
  &.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }
  
  &.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
  
  &.info {
    background: #d1ecf1;
    color: #0c5460;
    border: 1px solid #bee5eb;
  }
`;

const ConnectButton = styled.button`
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

function App() {
  const [activeTab, setActiveTab] = useState('smartContract');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [contractAddress, setContractAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [participants, setParticipants] = useState([]);
  const [isVestingStarted, setIsVestingStarted] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [editedContractCode, setEditedContractCode] = useState('');

  // Подключение к MetaMask
  const connectWallet = useCallback(async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        // Проверяем, является ли адрес авторизованным пользователем
        if (isAuthorizedUser(address)) {
          const userInfo = getUserInfo(address);
          setCurrentUser(userInfo);
          
          // Debug logging
          console.log('Connected user info:', userInfo);
          console.log('User role:', userInfo.role);
          console.log('Is owner?', userInfo.role === 'owner');
          
          setProvider(provider);
          setSigner(signer);
          setIsConnected(true);
          
          setStatus({
            type: 'success',
            message: `Добро пожаловать, ${userInfo.name}! Кошелек успешно подключен. Роль: ${userInfo.role}`
          });
        } else {
          setStatus({
            type: 'error',
            message: 'Доступ запрещен. Ваш адрес не авторизован в системе.'
          });
          return;
        }
        
        // Слушаем изменения аккаунтов
        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length === 0) {
            setIsConnected(false);
            setSigner(null);
            setCurrentUser(null);
            setStatus({
              type: 'info',
              message: 'Кошелек отключен'
            });
          } else {
            connectWallet();
          }
        });
        
      } else {
        setStatus({
          type: 'error',
          message: 'MetaMask не найден! Пожалуйста, установите MetaMask.'
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: `Ошибка подключения: ${error.message}`
      });
    }
  }, []);

  // Загрузка контракта
  const loadContract = async (address) => {
    try {
      if (!provider || !signer) {
        throw new Error('Кошелек не подключен');
      }

      const contract = new ethers.Contract(address, DEFIMONEquityToken.abi, signer);
      setContract(contract);
      setContractAddress(address);
      
      // Проверяем, является ли текущий пользователь владельцем
      const owner = await contract.owner();
      const currentAddress = await signer.getAddress();
      const isOwnerValue = owner.toLowerCase() === currentAddress.toLowerCase();
      setIsOwner(isOwnerValue);
      
      // Загружаем участников
      await loadParticipants(contract);
      
      // Проверяем статус вестинга
      const participantCount = await contract.getParticipantCount();
      if (participantCount > 0) {
        const firstParticipant = await contract.getAllParticipantAddresses();
        if (firstParticipant.length > 0) {
          const [,,,,,, vestingStartTime] = await contract.getParticipantInfo(firstParticipant[0]);
          setIsVestingStarted(vestingStartTime > 0);
        }
      }
      
      setStatus({
        type: 'success',
        message: `Контракт загружен! ${isOwnerValue ? 'Вы являетесь владельцем.' : 'Вы не являетесь владельцем.'}`
      });
      
    } catch (error) {
      setStatus({
        type: 'error',
        message: `Ошибка загрузки контракта: ${error.message}`
      });
    }
  };

  // Загрузка участников
  const loadParticipants = async (contractInstance) => {
    try {
      await contractInstance.getParticipantCount(); // Получаем количество участников
      const addresses = await contractInstance.getAllParticipantAddresses();
      
      const participantsData = [];
      for (let i = 0; i < addresses.length; i++) {
        const info = await contractInstance.getParticipantInfo(addresses[i]);
        const vestedBalance = await contractInstance.getVestedBalance(addresses[i]);
        
        participantsData.push({
          address: addresses[i],
          firstName: info[0],
          lastName: info[1],
          totalAllocation: ethers.formatEther(info[3]),
          claimedAmount: ethers.formatEther(info[4]),
          vestingStartTime: info[5],
          isActive: info[6],
          isLeaver: info[7],
          vestedBalance: ethers.formatEther(vestedBalance)
        });
      }
      
      setParticipants(participantsData);
    } catch (error) {
      console.error('Ошибка загрузки участников:', error);
    }
  };

  // Обновление статуса
  const updateStatus = (type, message) => {
    setStatus({ type, message });
  };

  // Обновление участников
  const refreshParticipants = async () => {
    if (contract) {
      await loadParticipants(contract);
    }
  };

  // Обновление отредактированного кода контракта
  const updateEditedContractCode = (code) => {
    setEditedContractCode(code);
  };

  // Отключение кошелька
  const disconnectWallet = () => {
    setIsConnected(false);
    setSigner(null);
    setContract(null);
    setContractAddress('');
    setCurrentUser(null);
    setParticipants([]);
    setIsVestingStarted(false);
    setStatus({
      type: 'info',
      message: 'Кошелек отключен'
    });
  };

  // Принудительное переключение на Sepolia
  const forceSwitchToSepolia = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }], // Sepolia chainId
        });
        setStatus({
          type: 'success',
          message: 'Успешно переключились на Sepolia Testnet'
        });
      }
    } catch (error) {
      if (error.code === 4902) {
        // Chain not added, try to add it
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xaa36a7',
              chainName: 'Sepolia Testnet',
              nativeCurrency: {
                name: 'Sepolia Ether',
                symbol: 'SEP',
                decimals: 18
              },
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io/']
            }]
          });
        } catch (addError) {
          setStatus({
            type: 'error',
            message: 'Не удалось добавить Sepolia Testnet'
          });
        }
      } else {
        setStatus({
          type: 'error',
          message: 'Ошибка переключения сети'
        });
      }
    }
  };

  useEffect(() => {
    // Проверяем, есть ли уже подключенный кошелек
    if (typeof window.ethereum !== 'undefined' && window.ethereum.selectedAddress) {
      connectWallet();
    }
  }, [connectWallet]);

  return (
    <AppContainer>
      <Header 
        isConnected={isConnected}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
        contractAddress={contractAddress}
        currentUser={currentUser}
        onForceSwitchToSepolia={forceSwitchToSepolia}
      />
      
      <MainContent>
        {status.message && (
          <StatusMessage className={status.type}>
            {status.message}
          </StatusMessage>
        )}

        {!isConnected ? (
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ marginBottom: '30px' }}>
                <img 
                  src="/logo/logodefimonallwhite.jpg" 
                  alt="DEFIMON Logo" 
                  style={{ 
                    height: '180px', 
                    width: 'auto', 
                    marginBottom: '20px',
                    transform: 'scale(1.5)',
                    transformOrigin: 'center'
                  }}
                  onError={(e) => {
                    e.target.src = "/logo/logodefimononlydaemonwhite.jpeg";
                  }}
                />
                <h2 style={{ color: '#333', marginBottom: '20px', fontSize: '28px', fontWeight: '600' }}>
                  Decentralized Financial Daemon
                </h2>
              </div>
              <p style={{ fontSize: '18px', color: '#666', marginBottom: '30px' }}>
                Для доступа к платформе подключите ваш кошелек
              </p>
              <ConnectButton onClick={connectWallet}>
                <img 
                  src="https://cdn.iconscout.com/icon/free/png-256/metamask-2728406-2261817.png" 
                  alt="MetaMask" 
                  style={{ width: '20px', height: '20px', marginRight: '8px' }}
                />
                Connect Wallet
              </ConnectButton>
            </div>
          </Card>
        ) : (
          <>
            <TabContainer>
              <Tab 
                active={activeTab === 'smartContract'} 
                onClick={() => setActiveTab('smartContract')}
              >
                <FaCode style={{ marginRight: '8px' }} />
                DEFIMONEquityToken.sol
              </Tab>
              <Tab 
                active={activeTab === 'deployment'} 
                onClick={() => setActiveTab('deployment')}
              >
                <FaRocket style={{ marginRight: '8px' }} />
                Deploy Contract
              </Tab>
              <Tab 
                active={activeTab === 'participants'} 
                onClick={() => setActiveTab('participants')}
              >
                <FaUsers style={{ marginRight: '8px' }} />
                Управление участниками
              </Tab>
              <Tab 
                active={activeTab === 'vesting'} 
                onClick={() => setActiveTab('vesting')}
              >
                <FaChartLine style={{ marginRight: '8px' }} />
                Вестинг и клейм
              </Tab>
              <Tab 
                active={activeTab === 'multisig'} 
                onClick={() => setActiveTab('multisig')}
              >
                <FaSignature style={{ marginRight: '8px' }} />
                Multi-Signature
              </Tab>
              <Tab 
                active={activeTab === 'exchange'} 
                onClick={() => setActiveTab('exchange')}
              >
                <FaExchangeAlt style={{ marginRight: '8px' }} />
                Exchange System
              </Tab>
              <Tab 
                active={activeTab === 'tokenPrice'} 
                onClick={() => setActiveTab('tokenPrice')}
              >
                <FaDollarSign style={{ marginRight: '8px' }} />
                Token Price
              </Tab>
              <Tab 
                active={activeTab === 'security'} 
                onClick={() => setActiveTab('security')}
              >
                <FaShieldAlt style={{ marginRight: '8px' }} />
                Security Audit
              </Tab>
            </TabContainer>

            {activeTab === 'smartContract' && (
              <Card>
                <h2>
                  <FaCode style={{ marginRight: '8px' }} />
                  Smart Contract Editor - Шаг 1: Редактирование DEFIMONEquityToken.sol
                </h2>
                <SmartContractEditor 
                  contract={contract}
                  onStatusUpdate={updateStatus}
                  isOwner={currentUser && currentUser.role === 'owner'}
                  onContractCodeUpdate={updateEditedContractCode}
                />
              </Card>
            )}

            {activeTab === 'deployment' && (
              <Card>
                <h2>
                  <FaRocket style={{ marginRight: '8px' }} />
                  Deploy Contract - Шаг 2: Развертывание DEFIMONEquityToken
                </h2>
                <ContractDeployment 
                  onContractDeployed={loadContract}
                  onStatusUpdate={updateStatus}
                  isConnected={isConnected}
                  signer={signer}
                  editedContractCode={editedContractCode}
                />
              </Card>
            )}

            {activeTab === 'participants' && (
              <Card>
                <h2>
                  <FaUsers style={{ marginRight: '8px' }} />
                  Управление участниками
                </h2>
                {contract ? (
                  <ParticipantForm 
                    contract={contract}
                    participants={participants}
                    onParticipantAdded={refreshParticipants}
                    onStatusUpdate={updateStatus}
                    isVestingStarted={isVestingStarted}
                  />
                ) : (
                  <p>Сначала отредактируйте смарт-контракт DEFIMONEquityToken.sol на вкладке "DEFIMONEquityToken.sol", затем разверните его на вкладке "Deploy Contract"</p>
                )}
              </Card>
            )}

            {activeTab === 'vesting' && (
              <Card>
                <h2>
                  <FaChartLine style={{ marginRight: '8px' }} />
                  Вестинг и клейм токенов
                </h2>
                {contract ? (
                  <VestingDashboard 
                    contract={contract}
                    participants={participants}
                    onRefresh={refreshParticipants}
                    onStatusUpdate={updateStatus}
                    isVestingStarted={isVestingStarted}
                  />
                ) : (
                  <p>Сначала отредактируйте смарт-контракт DEFIMONEquityToken.sol на вкладке "DEFIMONEquityToken.sol", затем разверните его на вкладке "Deploy Contract"</p>
                )}
              </Card>
            )}

            {activeTab === 'multisig' && (
              <Card>
                <h2>
                  <FaSignature style={{ marginRight: '8px' }} />
                  Multi-Signature Management
                </h2>
                {contract ? (
                  <MultiSignatureManager 
                    contract={contract}
                    onStatusUpdate={updateStatus}
                    isOwner={isOwner}
                  />
                ) : (
                  <p>Сначала отредактируйте смарт-контракт DEFIMONEquityToken.sol на вкладке "DEFIMONEquityToken.sol", затем разверните его на вкладке "Deploy Contract"</p>
                )}
              </Card>
            )}

            {activeTab === 'exchange' && (
              <Card>
                <h2>
                  <FaExchangeAlt style={{ marginRight: '8px' }} />
                  Exchange System
                </h2>
                {contract ? (
                  <ExchangeManager 
                    contract={contract}
                    onStatusUpdate={updateStatus}
                    isOwner={isOwner}
                  />
                ) : (
                  <p>Сначала отредактируйте смарт-контракт DEFIMONEquityToken.sol на вкладке "DEFIMONEquityToken.sol", затем разверните его на вкладке "Deploy Contract"</p>
                )}
              </Card>
            )}

            {activeTab === 'tokenPrice' && (
              <Card>
                <h2>
                  <FaDollarSign style={{ marginRight: '8px' }} />
                  Token Price Management
                </h2>
                {contract ? (
                  <TokenPriceManager 
                    contract={contract}
                    onStatusUpdate={updateStatus}
                    isOwner={isOwner}
                  />
                ) : (
                  <p>Сначала отредактируйте смарт-контракт DEFIMONEquityToken.sol на вкладке "DEFIMONEquityToken.sol", затем разверните его на вкладке "Deploy Contract"</p>
                )}
              </Card>
            )}

            {activeTab === 'security' && (
              <Card>
                <h2>
                  <FaShieldAlt style={{ marginRight: '8px' }} />
                  AI-Powered Security Audit
                </h2>
                <SecurityAuditor />
              </Card>
            )}
          </>
        )}
      </MainContent>
    </AppContainer>
  );
}

export default App;
