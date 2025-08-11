import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FaSignature, FaUserCheck, FaUserTimes, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

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

const StatusMessage = styled.div`
  padding: 15px;
  border-radius: 8px;
  margin: 10px 0;
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
`;

function MultiSignatureManager({ contract, onStatusUpdate, isOwner }) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadProposals = useCallback(async () => {
    try {
      setLoading(true);
      // Здесь должна быть логика загрузки предложений
      // Пока что оставляем пустой массив
      setProposals([]);
    } catch (error) {
      onStatusUpdate('error', `Ошибка загрузки предложений: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [onStatusUpdate]);

  useEffect(() => {
    if (contract) {
      loadProposals();
    }
  }, [contract, loadProposals]);

  const createProposal = async () => {
    try {
      setLoading(true);
      onStatusUpdate('success', 'Функция создания предложения будет реализована');
    } catch (error) {
      onStatusUpdate('error', `Ошибка создания предложения: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const approveProposal = async (proposalId) => {
    try {
      setLoading(true);
      onStatusUpdate('success', 'Функция одобрения предложения будет реализована');
    } catch (error) {
      onStatusUpdate('error', `Ошибка одобрения предложения: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const executeProposal = async (proposalId) => {
    try {
      setLoading(true);
      onStatusUpdate('success', 'Функция выполнения предложения будет реализована');
    } catch (error) {
      onStatusUpdate('error', `Ошибка выполнения предложения: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Section>
        <h3>
          <FaSignature style={{ marginRight: '8px' }} />
          Multi-Signature Management
        </h3>
        <p>Управление мультиподписью для важных операций контракта.</p>
        
        {isOwner && (
          <Button onClick={createProposal} disabled={loading}>
            <FaUserCheck style={{ marginRight: '8px' }} />
            Create New Proposal
          </Button>
        )}
      </Section>

      <Section>
        <h4>Active Proposals</h4>
        {loading ? (
          <p>Loading proposals...</p>
        ) : proposals.length === 0 ? (
          <p>No active proposals found.</p>
        ) : (
          <div>
            {proposals.map((proposal, index) => (
              <div key={index} style={{ 
                padding: '15px', 
                margin: '10px 0', 
                background: 'white', 
                borderRadius: '8px',
                border: '1px solid #dee2e6'
              }}>
                <h5>Proposal #{proposal.id}</h5>
                <p>{proposal.description}</p>
                <div style={{ marginTop: '10px' }}>
                  <Button 
                    onClick={() => approveProposal(proposal.id)}
                    disabled={loading}
                    style={{ background: '#28a745' }}
                  >
                    <FaCheckCircle style={{ marginRight: '8px' }} />
                    Approve
                  </Button>
                  <Button 
                    onClick={() => executeProposal(proposal.id)}
                    disabled={loading}
                    style={{ background: '#007bff' }}
                  >
                    Execute
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </Container>
  );
}

export default MultiSignatureManager;
