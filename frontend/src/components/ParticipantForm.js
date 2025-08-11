import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';
import { FaUserPlus, FaUsers, FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

const FormContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormSection = styled.div`
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
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  margin-top: 10px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ParticipantsList = styled.div`
  margin-top: 20px;
`;

const ParticipantCard = styled.div`
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const ParticipantHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const ParticipantName = styled.h5`
  margin: 0;
  color: #333;
  font-size: 16px;
`;

const ParticipantStatus = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
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

const ParticipantDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  font-size: 14px;
`;

const DetailItem = styled.div`
  .label {
    color: #666;
    font-weight: 500;
    margin-bottom: 5px;
  }
  
  .value {
    color: #333;
    font-weight: 600;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.activate {
    background: #28a745;
    color: white;
    
    &:hover {
      background: #218838;
    }
  }
  
  &.deactivate {
    background: #dc3545;
    color: white;
    
    &:hover {
      background: #c82333;
    }
  }
  
  &.leaver {
    background: #ffc107;
    color: #212529;
    
    &:hover {
      background: #e0a800;
    }
  }
`;



const ProgressBar = styled.div`
  background: #e9ecef;
  border-radius: 10px;
  height: 20px;
  margin: 15px 0;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  background: linear-gradient(45deg, #667eea, #764ba2);
  height: 100%;
  width: ${props => props.percentage}%;
  transition: width 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 600;
`;

function ParticipantForm({ contract, participants, onParticipantAdded, onStatusUpdate, isVestingStarted }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    wallet: '',
    allocation: ''
  });
  const [totalAllocation, setTotalAllocation] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [isManaging, setIsManaging] = useState(false);

  // Вычисляем общую распределенную долю
  useEffect(() => {
    const total = participants.reduce((sum, p) => sum + parseFloat(p.totalAllocation), 0);
    setTotalAllocation(total);
  }, [participants]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Добавление участника
  const addParticipant = async (e) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.wallet.trim() || !formData.allocation.trim()) {
      onStatusUpdate('error', 'Заполните все поля');
      return;
    }

    const allocation = parseFloat(formData.allocation);
    if (isNaN(allocation) || allocation <= 0 || allocation > 100) {
      onStatusUpdate('error', 'Доля должна быть числом от 1 до 100');
      return;
    }

    if (totalAllocation + allocation > 100) {
      onStatusUpdate('error', `Общая доля превысит 100%. Доступно: ${(100 - totalAllocation).toFixed(2)}%`);
      return;
    }

    if (!ethers.isAddress(formData.wallet.trim())) {
      onStatusUpdate('error', 'Неверный формат адреса Ethereum');
      return;
    }

    try {
      setIsAdding(true);
      onStatusUpdate('info', 'Добавляем участника...');

      const tx = await contract.addParticipant(
        formData.firstName.trim(),
        formData.lastName.trim(),
        formData.wallet.trim(),
        allocation
      );

      onStatusUpdate('info', 'Ожидаем подтверждения транзакции...');
      await tx.wait();

      onStatusUpdate('success', 'Участник успешно добавлен!');
      setFormData({ firstName: '', lastName: '', wallet: '', allocation: '' });
      onParticipantAdded();

    } catch (error) {
      console.error('Ошибка добавления участника:', error);
      onStatusUpdate('error', `Ошибка: ${error.message}`);
    } finally {
      setIsAdding(false);
    }
  };

  // Запуск вестинга
  const startVesting = async () => {
    try {
      setIsManaging(true);
      onStatusUpdate('info', 'Запускаем вестинг...');

      const tx = await contract.startVesting();
      onStatusUpdate('info', 'Ожидаем подтверждения транзакции...');
      await tx.wait();

      onStatusUpdate('success', 'Вестинг успешно запущен!');
      onParticipantAdded();

    } catch (error) {
      console.error('Ошибка запуска вестинга:', error);
      onStatusUpdate('error', `Ошибка: ${error.message}`);
    } finally {
      setIsManaging(false);
    }
  };

  // Изменение статуса участника
  const changeParticipantStatus = async (address, isActive, isLeaver) => {
    try {
      setIsManaging(true);
      onStatusUpdate('info', 'Изменяем статус участника...');

      const tx = await contract.setParticipantStatus(address, isActive, isLeaver);
      onStatusUpdate('info', 'Ожидаем подтверждения транзакции...');
      await tx.wait();

      onStatusUpdate('success', 'Статус участника изменен!');
      onParticipantAdded();

    } catch (error) {
      console.error('Ошибка изменения статуса:', error);
      onStatusUpdate('error', `Ошибка: ${error.message}`);
    } finally {
      setIsManaging(false);
    }
  };

  const getStatusText = (isActive, isLeaver) => {
    if (isLeaver) return 'Покинул проект';
    if (isActive) return 'Активен';
    return 'Неактивен';
  };

  const getStatusClass = (isActive, isLeaver) => {
    if (isLeaver) return 'leaver';
    if (isActive) return 'active';
    return 'inactive';
  };

  return (
    <FormContainer>
      {/* Форма добавления участника */}
      <FormSection>
        <SectionTitle>👤 Добавить участника</SectionTitle>
        
        <form onSubmit={addParticipant}>
          <FormGroup>
            <Label>Имя:</Label>
            <Input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Иван"
              disabled={isAdding}
            />
          </FormGroup>

          <FormGroup>
            <Label>Фамилия:</Label>
            <Input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Иванов"
              disabled={isAdding}
            />
          </FormGroup>

          <FormGroup>
            <Label>Адрес кошелька:</Label>
            <Input
              type="text"
              name="wallet"
              value={formData.wallet}
              onChange={handleInputChange}
              placeholder="0x..."
              disabled={isAdding}
            />
          </FormGroup>

          <FormGroup>
            <Label>Доля (%):</Label>
            <Input
              type="number"
              name="allocation"
              value={formData.allocation}
              onChange={handleInputChange}
              placeholder="40"
              min="0.01"
              max="100"
              step="0.01"
              disabled={isAdding}
            />
          </FormGroup>

          <Button type="submit" disabled={isAdding}>
            {isAdding ? 'Добавление...' : '➕ Добавить участника'}
          </Button>
        </form>

        {/* Прогресс распределения */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>Распределено: {totalAllocation.toFixed(2)}%</span>
            <span style={{ fontSize: '14px', color: '#666' }}>Осталось: {(100 - totalAllocation).toFixed(2)}%</span>
          </div>
          <ProgressBar>
            <ProgressFill percentage={totalAllocation} />
          </ProgressBar>
        </div>

        {/* Запуск вестинга */}
        {participants.length > 0 && !isVestingStarted && (
          <div style={{ marginTop: '20px' }}>
            <Button 
              onClick={startVesting} 
              disabled={isManaging || totalAllocation < 100}
              style={{ 
                background: totalAllocation < 100 ? '#6c757d' : 'linear-gradient(45deg, #28a745, #20c997)',
                marginTop: '10px'
              }}
            >
              {isManaging ? 'Запуск...' : (
                <>
                  <FaUserPlus style={{ marginRight: '8px' }} />
                  Запустить вестинг
                </>
              )}
            </Button>
            {totalAllocation < 100 && (
              <p style={{ fontSize: '12px', color: '#666', marginTop: '5px', textAlign: 'center' }}>
                Для запуска вестинга необходимо распределить 100% долей
              </p>
            )}
          </div>
        )}
      </FormSection>

      {/* Список участников */}
      <FormSection>
        <SectionTitle>
          <FaUsers style={{ marginRight: '8px' }} />
          Список участников ({participants.length})
        </SectionTitle>
        
        {participants.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', marginTop: '20px' }}>
            Участники еще не добавлены
          </p>
        ) : (
          <ParticipantsList>
            {participants.map((participant, index) => (
              <ParticipantCard key={index}>
                <ParticipantHeader>
                  <ParticipantName>
                    {participant.firstName} {participant.lastName}
                  </ParticipantName>
                  <ParticipantStatus className={getStatusClass(participant.isActive, participant.isLeaver)}>
                    {getStatusText(participant.isActive, participant.isLeaver)}
                  </ParticipantStatus>
                </ParticipantHeader>

                <ParticipantDetails>
                  <DetailItem>
                    <div className="label">Кошелек:</div>
                    <div className="value">{participant.address.slice(0, 6)}...{participant.address.slice(-4)}</div>
                  </DetailItem>
                  <DetailItem>
                    <div className="label">Доля:</div>
                    <div className="value">{participant.totalAllocation} DFX</div>
                  </DetailItem>
                  <DetailItem>
                    <div className="label">Получено:</div>
                    <div className="value">{participant.claimedAmount} DFX</div>
                  </DetailItem>
                  <DetailItem>
                    <div className="label">Доступно:</div>
                    <div className="value">{participant.vestedBalance} DFX</div>
                  </DetailItem>
                </ParticipantDetails>

                {!isVestingStarted && (
                  <ActionButtons>
                    {participant.isActive && !participant.isLeaver ? (
                      <>
                        <ActionButton 
                          className="deactivate"
                          onClick={() => changeParticipantStatus(participant.address, false, false)}
                          disabled={isManaging}
                        >
                          Деактивировать
                        </ActionButton>
                        <ActionButton 
                          className="leaver"
                          onClick={() => changeParticipantStatus(participant.address, false, true)}
                          disabled={isManaging}
                        >
                          Покинул проект
                        </ActionButton>
                      </>
                    ) : (
                      <ActionButton 
                        className="activate"
                        onClick={() => changeParticipantStatus(participant.address, true, false)}
                        disabled={isManaging}
                      >
                        Активировать
                      </ActionButton>
                    )}
                  </ActionButtons>
                )}
              </ParticipantCard>
            ))}
          </ParticipantsList>
        )}
      </FormSection>
    </FormContainer>
  );
}

export default ParticipantForm;
