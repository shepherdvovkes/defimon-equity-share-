import React, { useState } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';
import DEFIMONEquityToken from '../contracts/DEFIMONEquityToken.json';
import { CONTRACT_ADDRESS, NETWORK_NAME, NETWORK_RPC, CHAIN_ID } from '../contracts/deployment-info';
import { FaRocket, FaFileAlt, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaChartBar, FaClock } from 'react-icons/fa';

const DeploymentContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DeploymentCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h3`
  color: #333;
  margin: 0 0 20px 0;
  font-size: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
  }

  &.error {
    border-color: #e74c3c;
  }
`;

const Button = styled.button`
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  margin-top: 10px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const InfoBox = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
`;

const InfoTitle = styled.h4`
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
`;

const InfoItem = styled.div`
  text-align: center;
  padding: 15px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
`;

const InfoValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 5px;
`;

const InfoLabel = styled.div`
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 10px;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

function ContractDeployment({ onContractDeployed, onStatusUpdate, isConnected, signer }) {
  const [contractAddress, setContractAddress] = useState(CONTRACT_ADDRESS);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState('');

  // Функция для отображения статуса с иконкой
  const renderStatusWithIcon = (status) => {
    if (status.includes('Начинаем деплой')) {
      return (
        <span>
          <FaRocket style={{ marginRight: '8px', color: '#007bff' }} />
          {status}
        </span>
      );
    } else if (status.includes('Деплоим контракт')) {
      return (
        <span>
          <FaFileAlt style={{ marginRight: '8px', color: '#28a745' }} />
          {status}
        </span>
      );
    } else if (status.includes('Ожидаем подтверждения')) {
      return (
        <span>
          <FaClock style={{ marginRight: '8px', color: '#ffc107' }} />
          {status}
        </span>
      );
    } else if (status.includes('успешно развернут')) {
      return (
        <span>
          <FaCheckCircle style={{ marginRight: '8px', color: '#28a745' }} />
          {status}
        </span>
      );
    } else if (status.includes('Ошибка деплоя')) {
      return (
        <span>
          <FaTimesCircle style={{ marginRight: '8px', color: '#dc3545' }} />
          {status}
        </span>
      );
    }
    return status;
  };

  // Деплой нового контракта
  const deployContract = async () => {
    if (!isConnected || !signer) {
      onStatusUpdate('error', 'Сначала подключите кошелек');
      return;
    }

    try {
      setIsDeploying(true);
      setDeploymentStatus('Начинаем деплой контракта...');

      const factory = new ethers.ContractFactory(
        DEFIMONEquityToken.abi,
        DEFIMONEquityToken.bytecode,
        signer
      );

      setDeploymentStatus('Деплоим контракт в блокчейн...');
      const contract = await factory.deploy(await signer.getAddress());
      
      setDeploymentStatus('Ожидаем подтверждения транзакции...');
      await contract.waitForDeployment();

      const address = await contract.getAddress();
      setContractAddress(address);
      setDeploymentStatus('Контракт успешно развернут!');
      
      onStatusUpdate('success', `Контракт развернут по адресу: ${address}`);
      
      // Автоматически загружаем контракт
      setTimeout(() => {
        onContractDeployed(address);
      }, 1000);

    } catch (error) {
      console.error('Ошибка деплоя:', error);
      setDeploymentStatus('Ошибка деплоя');
      onStatusUpdate('error', `Ошибка деплоя: ${error.message}`);
    } finally {
      setIsDeploying(false);
    }
  };

  // Загрузка существующего контракта
  const loadExistingContract = async () => {
    if (!contractAddress.trim()) {
      onStatusUpdate('error', 'Введите адрес контракта');
      return;
    }

    if (!ethers.isAddress(contractAddress.trim())) {
      onStatusUpdate('error', 'Неверный формат адреса Ethereum');
      return;
    }

    try {
      setIsLoading(true);
      onStatusUpdate('info', 'Загружаем контракт...');
      
      // Проверяем, что контракт существует
      const code = await signer.provider.getCode(contractAddress.trim());
      if (code === '0x') {
        throw new Error('Контракт не найден по указанному адресу');
      }

      // Загружаем контракт
      onContractDeployed(contractAddress.trim());
      
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      onStatusUpdate('error', `Ошибка загрузки: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DeploymentContainer>
      {/* Деплой нового контракта */}
      <DeploymentCard>
        <CardTitle>
          <FaRocket style={{ marginRight: '8px' }} />
          Деплой нового контракта
        </CardTitle>
        
        <InfoBox>
          <InfoTitle>
            <FaChartBar style={{ marginRight: '8px' }} />
            Параметры токена
          </InfoTitle>
          <InfoGrid>
            <InfoItem>
              <InfoValue>10,000,000</InfoValue>
              <InfoLabel>Общий выпуск</InfoLabel>
            </InfoItem>
            <InfoItem>
              <InfoValue>$10M</InfoValue>
              <InfoLabel>Оценка проекта</InfoLabel>
            </InfoItem>
            <InfoItem>
              <InfoValue>4 года</InfoValue>
              <InfoLabel>Период вестинга</InfoLabel>
            </InfoItem>
            <InfoItem>
              <InfoValue>1 год</InfoValue>
              <InfoLabel>Клифф</InfoLabel>
            </InfoItem>
          </InfoGrid>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
            Токен: <strong>DEFIMON Equity Token (DFX)</strong><br/>
            Стандарт: <strong>ERC-20</strong><br/>
            Вестинг: <strong>25% после клиффа, затем ежемесячно</strong>
          </p>
        </InfoBox>

        <Button 
          onClick={deployContract} 
          disabled={isDeploying}
          style={{ 
            background: 'linear-gradient(45deg, #007bff, #0056b3)',
            marginTop: '20px'
          }}
        >
          {isDeploying ? 'Развертывание...' : (
            <>
              <FaRocket style={{ marginRight: '8px' }} />
              Развернуть контракт
            </>
          )}
        </Button>

        <StatusMessage className={deploymentStatus.includes('Ошибка') ? 'error' : 'info'}>
          {renderStatusWithIcon(deploymentStatus)}
        </StatusMessage>
      </DeploymentCard>

      {/* Загрузка существующего контракта */}
      <DeploymentCard>
        <CardTitle>
          <FaFileAlt style={{ marginRight: '8px' }} />
          Загрузить существующий контракт
        </CardTitle>
        
        <FormGroup>
          <Label>Адрес контракта:</Label>
          <Input
            type="text"
            placeholder="0x..."
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            disabled={isLoading}
          />
        </FormGroup>

        <Button 
          onClick={loadExistingContract} 
          disabled={isLoading || !isConnected || !contractAddress.trim()}
        >
          {isLoading ? (
            <>
              <LoadingSpinner />
              Загрузка...
            </>
          ) : (
            <>
              <FaFileAlt style={{ marginRight: '8px' }} />
              Загрузить контракт
            </>
          )}
        </Button>

        <InfoBox>
          <InfoTitle>
            <FaInfoCircle style={{ marginRight: '8px' }} />
            Информация
          </InfoTitle>
          <p>Для загрузки существующего контракта введите его адрес в поле выше и нажмите "Загрузить контракт".</p>
        </InfoBox>

        <InfoBox>
          <InfoTitle>
            <FaInfoCircle style={{ marginRight: '8px' }} />
            Network Information
          </InfoTitle>
          <p><strong>Network:</strong> {NETWORK_NAME}</p>
          <p><strong>Chain ID:</strong> {CHAIN_ID}</p>
          <p><strong>RPC URL:</strong> {NETWORK_RPC}</p>
        </InfoBox>
      </DeploymentCard>
    </DeploymentContainer>
  );
}

export default ContractDeployment;
