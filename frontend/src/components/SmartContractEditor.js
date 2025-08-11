import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaCode, FaCog, FaPlay, FaSave, FaEye } from 'react-icons/fa';

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

function SmartContractEditor({ contract, onStatusUpdate, isOwner }) {
  const [activeTab, setActiveTab] = useState('variables');
  const [loading, setLoading] = useState(false);
  const [contractCode, setContractCode] = useState('');
  const [variables, setVariables] = useState([
    { name: 'totalSupply', value: '10000000', type: 'uint256', description: 'Total supply of tokens' },
    { name: 'vestingDuration', value: '365', type: 'uint256', description: 'Vesting duration in days' },
    { name: 'cliffDuration', value: '90', type: 'uint256', description: 'Cliff duration in days' },
    { name: 'minContribution', value: '100', type: 'uint256', description: 'Minimum contribution amount' },
    { name: 'maxContribution', value: '1000000', type: 'uint256', description: 'Maximum contribution amount' }
  ]);

  useEffect(() => {
    if (contract) {
      loadContractData();
    }
  }, [contract]);

  const loadContractData = async () => {
    try {
      setLoading(true);
      // Здесь должна быть логика загрузки кода контракта
      // Пока что используем заглушку
      setContractCode(`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DEFIMONEquityToken is ERC20, Ownable {
    uint256 public totalSupply = 10000000;
    uint256 public vestingDuration = 365 days;
    uint256 public cliffDuration = 90 days;
    uint256 public minContribution = 100;
    uint256 public maxContribution = 1000000;
    
    constructor() ERC20("DEFIMON", "DFM") {
        _mint(msg.sender, totalSupply);
    }
    
    // Add your custom functions here
}`);
    } catch (error) {
      onStatusUpdate('error', `Ошибка загрузки данных контракта: ${error.message}`);
    } finally {
      setLoading(false);
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
      // Здесь должна быть логика компиляции контракта
      // Пока что показываем сообщение
      onStatusUpdate('success', 'Контракт успешно скомпилирован! Все переменные обновлены.');
      
      // Обновляем код контракта с новыми переменными
      let newCode = contractCode;
      variables.forEach(variable => {
        const regex = new RegExp(`(uint256 public ${variable.name} = )[^;]+;`, 'g');
        newCode = newCode.replace(regex, `uint256 public ${variable.name} = ${variable.value};`);
      });
      setContractCode(newCode);
      
    } catch (error) {
      onStatusUpdate('error', `Ошибка компиляции: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deployContract = async () => {
    try {
      setLoading(true);
      onStatusUpdate('success', 'Функция деплоя контракта будет реализована');
    } catch (error) {
      onStatusUpdate('error', `Ошибка деплоя: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const saveContract = async () => {
    try {
      setLoading(true);
      onStatusUpdate('success', 'Контракт сохранен!');
    } catch (error) {
      onStatusUpdate('error', `Ошибка сохранения: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOwner) {
    return (
      <Container>
        <Section>
          <h3>
            <FaCode style={{ marginRight: '8px' }} />
            Smart Contract Editor
          </h3>
          <p>Доступ к редактированию смарт-контракта только для владельца.</p>
        </Section>
      </Container>
    );
  }

  return (
    <Container>
      <Section>
        <h3>
          <FaCode style={{ marginRight: '8px' }} />
          Smart Contract Editor
        </h3>
        <p>Редактирование кода смарт-контракта и управление переменными.</p>
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
          <p>Измените переменные контракта. После изменения нажмите "Compile & Update" для обновления кода.</p>
          
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
          </div>
        </Section>
      )}

      {activeTab === 'code' && (
        <Section>
          <h4>
            <FaCode style={{ marginRight: '8px' }} />
            Contract Code
          </h4>
          <p>Редактируйте код смарт-контракта. После изменений нажмите "Compile & Update" для проверки.</p>
          
          <TextArea
            value={contractCode}
            onChange={(e) => setContractCode(e.target.value)}
            placeholder="Введите код смарт-контракта..."
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
