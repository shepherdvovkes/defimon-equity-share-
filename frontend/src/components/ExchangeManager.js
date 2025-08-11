import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';
import { FaExchangeAlt, FaChartLine, FaCoins, FaPlus, FaMinus, FaExchangeAlt as FaSwap } from 'react-icons/fa';

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

const Card = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  margin: 10px 0;
`;

function ExchangeManager({ contract, onStatusUpdate, isOwner }) {
  const [loading, setLoading] = useState(false);
  const [exchangeData, setExchangeData] = useState({
    liquidity: '0',
    price: '0',
    volume: '0'
  });

  const loadExchangeData = useCallback(async () => {
    try {
      setLoading(true);
      // Здесь должна быть логика загрузки данных обмена
      // Пока что используем заглушки
      setExchangeData({
        liquidity: '1000000',
        price: '0.50',
        volume: '50000'
      });
    } catch (error) {
      onStatusUpdate('error', `Ошибка загрузки данных обмена: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [onStatusUpdate]);

  useEffect(() => {
    if (contract) {
      loadExchangeData();
    }
  }, [contract, loadExchangeData]);

  const addLiquidity = async () => {
    try {
      setLoading(true);
      onStatusUpdate('success', 'Функция добавления ликвидности будет реализована');
    } catch (error) {
      onStatusUpdate('error', `Ошибка добавления ликвидности: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const removeLiquidity = async () => {
    try {
      setLoading(true);
      onStatusUpdate('success', 'Функция удаления ликвидности будет реализована');
    } catch (error) {
      onStatusUpdate('error', `Ошибка удаления ликвидности: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const swapTokens = async () => {
    try {
      setLoading(true);
      onStatusUpdate('success', 'Функция обмена токенов будет реализована');
    } catch (error) {
      onStatusUpdate('error', `Ошибка обмена токенов: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Section>
        <h3>
          <FaExchangeAlt style={{ marginRight: '8px' }} />
          Exchange System
        </h3>
        <p>Управление обменной системой и ликвидностью токенов.</p>
      </Section>

      <Section>
        <h4>
          <FaChartLine style={{ marginRight: '8px' }} />
          Exchange Statistics
        </h4>
        {loading ? (
          <p>Loading exchange data...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <Card>
              <h5>Total Liquidity</h5>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                {ethers.formatEther(exchangeData.liquidity)} DEFIMON
              </p>
            </Card>
            <Card>
              <h5>Current Price</h5>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                ${exchangeData.price}
              </p>
            </Card>
            <Card>
              <h5>24h Volume</h5>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
                {ethers.formatEther(exchangeData.volume)} DEFIMON
              </p>
            </Card>
          </div>
        )}
      </Section>

      <Section>
        <h4>
          <FaCoins style={{ marginRight: '8px' }} />
          Exchange Actions
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <Button onClick={addLiquidity} disabled={loading}>
            Add Liquidity
          </Button>
          <Button onClick={removeLiquidity} disabled={loading}>
            Remove Liquidity
          </Button>
          <Button onClick={swapTokens} disabled={loading}>
            Swap Tokens
          </Button>
        </div>
      </Section>
    </Container>
  );
}

export default ExchangeManager;
