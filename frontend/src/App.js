import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';
import Header from './components/Header';
import ContractDeployment from './components/ContractDeployment';
import ParticipantForm from './components/ParticipantForm';
import VestingDashboard from './components/VestingDashboard';
import { FaRocket, FaUsers, FaChartLine } from 'react-icons/fa';
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
  const [activeTab, setActiveTab] = useState('deployment');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [contractAddress, setContractAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [participants, setParticipants] = useState([]);
  const [isVestingStarted, setIsVestingStarted] = useState(false);

  // Подключение к MetaMask
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        // Проверяем, является ли адрес авторизованным пользователем
        if (isAuthorizedUser(address)) {
          const userInfo = getUserInfo(address);
          setCurrentUser(userInfo);
          
          setProvider(provider);
          setSigner(signer);
          setIsConnected(true);
          
          setStatus({
            type: 'success',
            message: `Добро пожаловать, ${userInfo.name}! Кошелек успешно подключен.`
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
  };

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
      const isOwner = owner.toLowerCase() === currentAddress.toLowerCase();
      
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
        message: `Контракт загружен! ${isOwner ? 'Вы являетесь владельцем.' : 'Вы не являетесь владельцем.'}`
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
        contractAddress={contractAddress}
        currentUser={currentUser}
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
              <h2 style={{ color: '#667eea', marginBottom: '20px' }}>
                Добро пожаловать в DEFIMON Equity Token
              </h2>
              <p style={{ fontSize: '18px', color: '#666', marginBottom: '30px' }}>
                Для доступа к платформе подключите ваш кошелек
              </p>
              <ConnectButton onClick={connectWallet}>
                <FaLink style={{ marginRight: '8px' }} />
                Подключить кошелек
              </ConnectButton>
            </div>
          </Card>
        ) : (
          <>
            <TabContainer>
              <Tab 
                active={activeTab === 'deployment'} 
                onClick={() => setActiveTab('deployment')}
              >
                <FaRocket style={{ marginRight: '8px' }} />
                Деплой контракта
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
            </TabContainer>

            {activeTab === 'deployment' && (
              <ContractDeployment 
                onContractDeployed={loadContract}
                onStatusUpdate={updateStatus}
                isConnected={isConnected}
                signer={signer}
              />
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
                  <p>Сначала загрузите контракт на вкладке "Деплой контракта"</p>
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
                  <p>Сначала загрузите контракт на вкладке "Деплой контракта"</p>
                )}
              </Card>
            )}
          </>
        )}
      </MainContent>
    </AppContainer>
  );
}

export default App;
