import React from 'react';
import styled from 'styled-components';
import { FaCheckCircle, FaFileContract, FaLink, FaGlobe } from 'react-icons/fa';

const HeaderContainer = styled.header`
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 20px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const LogoImage = styled.img`
  height: 80px;
  width: auto;
  object-fit: contain;
`;

const LogoText = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  .defimon-title {
    margin: 0;
    color: #333;
    font-size: 24px;
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: 2px;
  }
  
  .subtitle {
    margin: 0;
    color: #333;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.2;
  }
`;

const WalletSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
`;

const ConnectButton = styled.button`
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 16px;
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

const WalletInfo = styled.div`
  background: #f8f9fa;
  border-radius: 10px;
  padding: 12px 20px;
  color: #333;
  font-size: 14px;
  border: 1px solid #e0e0e0;
`;

const ContractInfo = styled.div`
  background: #f8f9fa;
  border-radius: 10px;
  padding: 12px 20px;
  color: #333;
  font-size: 14px;
  border: 1px solid #e0e0e0;
  max-width: 300px;
  word-break: break-all;
`;

const NetworkBadge = styled.span`
  background: #e9ecef;
  color: #495057;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  margin-left: 10px;
`;

const SwitchToSepoliaButton = styled.button`
  background: linear-gradient(45deg, #28a745, #20c997);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 10px;

  &:hover {
    background: linear-gradient(45deg, #218838, #1ea085);
    transform: translateY(-1px);
  }
`;

const DisconnectButton = styled.button`
  background: rgba(220, 53, 69, 0.8);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(220, 53, 69, 1);
    transform: translateY(-1px);
  }
`;

function Header({ isConnected, onConnect, onDisconnect, contractAddress, currentUser, onForceSwitchToSepolia }) {
  const getNetworkName = () => {
    if (typeof window.ethereum !== 'undefined') {
      const chainId = window.ethereum.chainId;
      switch (chainId) {
        case '0x1':
          return 'Ethereum Mainnet';
        case '0xaa36a7':
          return 'Sepolia Testnet';
        case '0x89':
          return 'Polygon';
        case '0xa':
          return 'Optimism';
        default:
          return 'Unknown Network';
      }
    }
    return 'Unknown Network';
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo>
          <LogoImage 
            src="/logo/logodefimononlydaemonwhite.jpeg" 
            alt="DEFIMON Logo"
          />
          <LogoText>
            <h1 className="defimon-title">DEFIMON</h1>
            <p className="subtitle">Decentralized Financial Daemon</p>
          </LogoText>
        </Logo>

        <WalletSection>
          {!isConnected ? (
            <ConnectButton onClick={onConnect}>
              <FaLink style={{ marginRight: '8px' }} />
              Подключить кошелек
            </ConnectButton>
          ) : (
            <>
              <SwitchToSepoliaButton onClick={onForceSwitchToSepolia}>
                <FaGlobe style={{ marginRight: '8px' }} />
                Sepolia
              </SwitchToSepoliaButton>
              
              <WalletInfo>
                <FaCheckCircle style={{ marginRight: '8px', color: '#28a745' }} />
                {currentUser ? `${currentUser.name} (${currentUser.role})` : 'Кошелек подключен'}
                <NetworkBadge>{getNetworkName()}</NetworkBadge>
              </WalletInfo>
              
              {contractAddress && (
                <ContractInfo>
                  <FaFileContract style={{ marginRight: '8px' }} />
                  Контракт: {formatAddress(contractAddress)}
                </ContractInfo>
              )}
              
              <DisconnectButton onClick={onDisconnect}>
                Отключить
              </DisconnectButton>
            </>
          )}
        </WalletSection>
      </HeaderContent>
    </HeaderContainer>
  );
}

export default Header;
