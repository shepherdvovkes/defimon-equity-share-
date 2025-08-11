import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';
import { FaDollarSign, FaChartLine, FaCog } from 'react-icons/fa';

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

const Card = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  margin: 10px 0;
`;

const PriceDisplay = styled.div`
  text-align: center;
  padding: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 15px;
  margin: 20px 0;
`;

function TokenPriceManager({ contract, onStatusUpdate, isOwner }) {
  const [tokenData, setTokenData] = useState({
    currentPrice: '0.50',
    marketCap: '0',
    totalSupply: '0',
    circulatingSupply: '0'
  });
  const [loading, setLoading] = useState(false);
  const [newPrice, setNewPrice] = useState('');

  useEffect(() => {
    if (contract) {
      loadTokenData();
    }
  }, [contract]);

  const loadTokenData = async () => {
    try {
      setLoading(true);
      // Здесь должна быть логика загрузки данных токена
      // Пока что используем заглушки
      setTokenData({
        currentPrice: '0.50',
        marketCap: '5000000',
        totalSupply: '10000000',
        circulatingSupply: '8000000'
      });
    } catch (error) {
      onStatusUpdate('error', `Ошибка загрузки данных токена: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateTokenPrice = async () => {
    try {
      setLoading(true);
      if (!newPrice || parseFloat(newPrice) <= 0) {
        onStatusUpdate('error', 'Введите корректную цену');
        return;
      }
      onStatusUpdate('success', 'Функция обновления цены токена будет реализована');
      setNewPrice('');
    } catch (error) {
      onStatusUpdate('error', `Ошибка обновления цены: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const setPriceOracle = async () => {
    try {
      setLoading(true);
      onStatusUpdate('success', 'Функция настройки ценового оракула будет реализована');
    } catch (error) {
      onStatusUpdate('error', `Ошибка настройки оракула: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Section>
        <h3>
          <FaDollarSign style={{ marginRight: '8px' }} />
          Token Price Management
        </h3>
        <p>Управление ценой токенов и ценовыми оракулами.</p>
      </Section>

      <PriceDisplay>
        <h2>Current Token Price</h2>
        <div style={{ fontSize: '48px', fontWeight: 'bold', margin: '20px 0' }}>
          ${tokenData.currentPrice}
        </div>
        <p>DEFIMON Token</p>
      </PriceDisplay>

      <Section>
        <h4>
          <FaChartLine style={{ marginRight: '8px' }} />
          Token Statistics
        </h4>
        {loading ? (
          <p>Loading token data...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <Card>
              <h5>Market Cap</h5>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                ${(parseFloat(tokenData.marketCap) / 1000000).toFixed(2)}M
              </p>
            </Card>
            <Card>
              <h5>Total Supply</h5>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                {ethers.formatEther(tokenData.totalSupply)} DEFIMON
              </p>
            </Card>
            <Card>
              <h5>Circulating Supply</h5>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
                {ethers.formatEther(tokenData.circulatingSupply)} DEFIMON
              </p>
            </Card>
          </div>
        )}
      </Section>

      {isOwner && (
        <Section>
          <h4>
            <FaCog style={{ marginRight: '8px' }} />
            Price Management (Owner Only)
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            <Input
              type="number"
              placeholder="New price (USD)"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              step="0.01"
              min="0"
            />
            <Button onClick={updateTokenPrice} disabled={loading || !newPrice}>
              Update Price
            </Button>
            <Button onClick={setPriceOracle} disabled={loading}>
              Set Price Oracle
            </Button>
          </div>
        </Section>
      )}
    </Container>
  );
}

export default TokenPriceManager;
