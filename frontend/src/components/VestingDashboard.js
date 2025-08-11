import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';
import { FaRocket, FaCheckCircle, FaChartBar, FaUsers } from 'react-icons/fa';

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DashboardSection = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 25px;
`;

const SectionTitle = styled.h4`
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const VestingCard = styled.div`
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const VestingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const ParticipantName = styled.h5`
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
`;

const VestingStatus = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  
  &.active {
    background: #d4edda;
    color: #155724;
  }
  
  &.inactive {
    background: #f8d7da;
    color: #721c24;
  }
  
  &.leaver {
    background: #fff3cd;
    color: #856404;
  }
`;

const VestingInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
`;

const InfoItem = styled.div`
  text-align: center;
`;

const InfoLabel = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
`;

const InfoValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin: 15px 0;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const Button = styled.button`
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SummaryCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 10px;
  padding: 25px;
  margin-bottom: 20px;
`;

const SummaryTitle = styled.h3`
  margin: 0 0 15px 0;
  font-size: 20px;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;

const SummaryItem = styled.div`
  text-align: center;
`;

const SummaryValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 5px;
`;

const SummaryLabel = styled.div`
  font-size: 14px;
  opacity: 0.9;
`;

function VestingDashboard({ contract, participants, onRefresh, onStatusUpdate, isVestingStarted }) {
  const [vestingData, setVestingData] = useState([]);
  const [summary, setSummary] = useState({
    totalParticipants: 0,
    totalAllocated: '0',
    totalClaimed: '0',
    totalVested: '0'
  });

  const formatTime = (seconds) => {
    if (seconds === 0) return 'Завершен';
    
    const years = Math.floor(seconds / (365 * 24 * 60 * 60));
    const months = Math.floor((seconds % (365 * 24 * 60 * 60)) / (30 * 24 * 60 * 60));
    const days = Math.floor((seconds % (30 * 24 * 60 * 60)) / (24 * 60 * 60));
    
    if (years > 0) return `${years}г ${months}м`;
    if (months > 0) return `${months}м ${days}д`;
    return `${days}д`;
  };

  const calculateVestingData = useCallback(async () => {
    try {
      const vestingInfo = [];
      
      for (const participant of participants) {
        const vestedBalance = await contract.getVestedBalance(participant.address);
        // Используем для вычисления прогресса вестинга
        ethers.parseEther(participant.totalAllocation);
        // Используем для проверки возможности клейма
        ethers.parseEther(participant.claimedAmount);
        
        let vestingProgress = 0;
        let timeRemaining = 0;
        
        if (participant.vestingStartTime > 0) {
          const currentTime = Math.floor(Date.now() / 1000);
          const timeElapsed = currentTime - participant.vestingStartTime;
          const cliffPeriod = 365 * 24 * 60 * 60; // 1 год в секундах
          const vestingPeriod = 4 * 365 * 24 * 60 * 60; // 4 года в секундах
          
          if (timeElapsed >= cliffPeriod) {
            const vestingTime = Math.min(timeElapsed - cliffPeriod, vestingPeriod - cliffPeriod);
            vestingProgress = Math.min((vestingTime / (vestingPeriod - cliffPeriod)) * 100, 100);
            timeRemaining = Math.max(0, vestingPeriod - timeElapsed);
          }
        }
        
        vestingInfo.push({
          ...participant,
          vestedBalance: ethers.formatEther(vestedBalance),
          vestingProgress: Math.round(vestingProgress),
          timeRemaining: formatTime(timeRemaining),
          canClaim: parseFloat(ethers.formatEther(vestedBalance)) > parseFloat(participant.claimedAmount)
        });
      }
      
      setVestingData(vestingInfo);
    } catch (error) {
      console.error('Ошибка расчета данных вестинга:', error);
    }
  }, [contract, participants]);

  const calculateSummary = useCallback(() => {
    const totalParticipants = participants.filter(p => p.isActive && !p.isLeaver).length;
    const totalAllocated = participants.reduce((sum, p) => sum + parseFloat(p.totalAllocation), 0);
    const totalClaimed = participants.reduce((sum, p) => sum + parseFloat(p.claimedAmount), 0);
    const totalVested = vestingData.reduce((sum, p) => sum + parseFloat(p.vestedBalance), 0);
    
    setSummary({
      totalParticipants,
      totalAllocated: totalAllocated.toFixed(2),
      totalClaimed: totalClaimed.toFixed(2),
      totalVested: totalVested.toFixed(2)
    });
  }, [participants, vestingData]);

  useEffect(() => {
    if (contract && participants.length > 0) {
      calculateVestingData();
      calculateSummary();
    }
  }, [contract, participants, calculateVestingData, calculateSummary]);

  const claimTokens = async (participant) => {
    try {
      onStatusUpdate('info', 'Обработка транзакции...');
      
      const tx = await contract.claimVestedTokens();
      await tx.wait();
      
      onStatusUpdate('success', `Токены успешно получены!`);
      onRefresh();
      
    } catch (error) {
      onStatusUpdate('error', `Ошибка получения токенов: ${error.message}`);
    }
  };

  const startVesting = async () => {
    try {
      onStatusUpdate('info', 'Запуск вестинга...');
      
      const tx = await contract.startVesting();
      await tx.wait();
      
      onStatusUpdate('success', 'Вестинг успешно запущен!');
      onRefresh();
      
    } catch (error) {
      onStatusUpdate('error', `Ошибка запуска вестинга: ${error.message}`);
    }
  };

  if (!contract) {
    return <div>Контракт не загружен</div>;
  }

  return (
    <DashboardContainer>
      <div>
        <SummaryCard>
          <SummaryTitle>
            <FaChartBar style={{ marginRight: '8px' }} />
            Общая статистика
          </SummaryTitle>
          <SummaryGrid>
            <SummaryItem>
              <SummaryValue>{summary.totalParticipants}</SummaryValue>
              <SummaryLabel>Активных участников</SummaryLabel>
            </SummaryItem>
            <SummaryItem>
              <SummaryValue>{summary.totalAllocated}M</SummaryValue>
              <SummaryLabel>Распределено токенов</SummaryLabel>
            </SummaryItem>
            <SummaryItem>
              <SummaryValue>{summary.totalClaimed}M</SummaryValue>
              <SummaryLabel>Получено токенов</SummaryLabel>
            </SummaryItem>
            <SummaryItem>
              <SummaryValue>{summary.totalVested}M</SummaryValue>
              <SummaryLabel>Доступно для получения</SummaryLabel>
            </SummaryItem>
          </SummaryGrid>
        </SummaryCard>

        <DashboardSection>
          <SectionTitle>
            <FaRocket style={{ marginRight: '8px' }} />
            Управление вестингом
          </SectionTitle>
          
          {!isVestingStarted ? (
            <Button onClick={startVesting}>
              Запустить вестинг для всех участников
            </Button>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#28a745' }}>
              <FaCheckCircle style={{ marginRight: '8px' }} />
              Вестинг уже запущен
            </div>
          )}
        </DashboardSection>
      </div>

      <DashboardSection>
        <SectionTitle>
          <FaUsers style={{ marginRight: '8px' }} />
          Статус вестинга участников
        </SectionTitle>
        
        {vestingData.length === 0 ? (
          <p>Участники не найдены</p>
        ) : (
          vestingData.map((participant, index) => (
            <VestingCard key={index}>
              <VestingHeader>
                <ParticipantName>
                  {participant.firstName} {participant.lastName}
                </ParticipantName>
                <VestingStatus className={participant.isLeaver ? 'leaver' : participant.isActive ? 'active' : 'inactive'}>
                  {participant.isLeaver ? 'Покинул' : participant.isActive ? 'Активен' : 'Неактивен'}
                </VestingStatus>
              </VestingHeader>
              
              <VestingInfo>
                <InfoItem>
                  <InfoLabel>Общая доля</InfoLabel>
                  <InfoValue>{participant.totalAllocation}M</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Получено</InfoLabel>
                  <InfoValue>{participant.claimedAmount}M</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Доступно</InfoLabel>
                  <InfoValue>{participant.vestedBalance}M</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Осталось времени</InfoLabel>
                  <InfoValue>{participant.timeRemaining}</InfoValue>
                </InfoItem>
              </VestingInfo>
              
              {participant.vestingStartTime > 0 && (
                <>
                  <ProgressBar>
                    <ProgressFill progress={participant.vestingProgress} />
                  </ProgressBar>
                  <div style={{ textAlign: 'center', fontSize: '12px', color: '#666', marginBottom: '15px' }}>
                    Прогресс вестинга: {participant.vestingProgress}%
                  </div>
                </>
              )}
              
              {participant.canClaim && participant.isActive && !participant.isLeaver && (
                <Button onClick={() => claimTokens(participant)}>
                  Получить доступные токены
                </Button>
              )}
              
              {!participant.canClaim && participant.isActive && !participant.isLeaver && (
                <div style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}>
                  {participant.vestingStartTime === 0 
                    ? 'Вестинг не запущен' 
                    : 'Нет доступных токенов для получения'
                  }
                </div>
              )}
            </VestingCard>
          ))
        )}
      </DashboardSection>
    </DashboardContainer>
  );
}

export default VestingDashboard;
