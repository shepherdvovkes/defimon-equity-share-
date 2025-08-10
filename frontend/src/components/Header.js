import React from 'react';
import styled from 'styled-components';
import { FaCheckCircle, FaFileContract, FaLink } from 'react-icons/fa';

const HeaderContainer = styled.header`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 20px 0;
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

const LogoIcon = styled.div`
  width: 50px;
  height: 50px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  font-weight: bold;
`;

const LogoText = styled.div`
  h1 {
    margin: 0;
    color: white;
    font-size: 28px;
    font-weight: 700;
  }
  
  p {
    margin: 5px 0 0 0;
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
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
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 12px 20px;
  color: white;
  font-size: 14px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ContractInfo = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 12px 20px;
  color: white;
  font-size: 14px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 300px;
  word-break: break-all;
`;

const NetworkBadge = styled.span`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  margin-left: 10px;
`;

function Header({ isConnected, onConnect, contractAddress, currentUser }) {
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
          <LogoIcon>D</LogoIcon>
          <LogoText>
            <h1>DEFIMON</h1>
            <p>Equity Sharing Platform</p>
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
            </>
          )}
        </WalletSection>
      </HeaderContent>
    </HeaderContainer>
  );
}

export default Header;
