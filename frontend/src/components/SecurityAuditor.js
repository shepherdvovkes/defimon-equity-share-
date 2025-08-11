import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import SecurityAuditService from '../services/SecurityAuditService';
import { FaShieldAlt, FaExclamationTriangle, FaCheckCircle, FaDownload, FaEye } from 'react-icons/fa';

const SecurityAuditor = () => {
  const [contractCode, setContractCode] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [network, setNetwork] = useState('sepolia');
  const [auditResults, setAuditResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [auditType, setAuditType] = useState('comprehensive');
  const [vulnerabilityType, setVulnerabilityType] = useState('reentrancy');

  const securityService = new SecurityAuditService();

  // Load contract code from the deployed contract
  useEffect(() => {
    const loadContractCode = async () => {
      try {
        // You can load the contract code from your contracts directory or deployment info
        const response = await fetch('/contracts/DEFIMONEquityToken.sol');
        if (response.ok) {
          const code = await response.text();
          setContractCode(code);
        }
      } catch (err) {
        console.log('Could not load contract code automatically');
      }
    };

    loadContractCode();
  }, []);

  const handleAudit = async () => {
    if (!contractCode.trim()) {
      setError('Please provide contract code for analysis');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAuditResults(null);

    try {
      let results;
      
      if (auditType === 'comprehensive') {
        results = await securityService.auditSmartContract(contractCode, contractAddress, network);
      } else if (auditType === 'focused') {
        results = await securityService.focusedAudit(contractCode, vulnerabilityType);
      }

      setAuditResults(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async (format = 'markdown') => {
    if (!auditResults) return;

    try {
      const report = await securityService.generateSecurityReport(auditResults, format);
      
      // Create and download the report
      const blob = new Blob([report], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security-audit-report.${format === 'markdown' ? 'md' : 'txt'}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to generate report');
    }
  };

  const handleCheckVulnerabilities = async () => {
    if (!contractAddress) {
      setError('Please provide contract address');
      return;
    }

    setIsLoading(true);
    try {
      const vulnerabilities = await securityService.checkKnownVulnerabilities(contractAddress, network);
      setAuditResults({ ...auditResults, knownVulnerabilities: vulnerabilities });
    } catch (err) {
      setError('Failed to check known vulnerabilities');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateTests = async () => {
    if (!contractCode.trim()) return;

    setIsLoading(true);
    try {
      const testRecommendations = await securityService.generateTestRecommendations(contractCode);
      setAuditResults({ ...auditResults, testRecommendations });
    } catch (err) {
      setError('Failed to generate test recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'critical': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  return (
    <Container>
      <Header>
        <Title>
          <FaShieldAlt /> Security Auditor
        </Title>
        <Subtitle>AI-Powered Smart Contract Security Analysis</Subtitle>
      </Header>

      <Content>
        <InputSection>
          <FormGroup>
            <Label>Contract Code (Solidity)</Label>
            <CodeTextarea
              value={contractCode}
              onChange={(e) => setContractCode(e.target.value)}
              placeholder="Paste your Solidity contract code here..."
              rows={15}
            />
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label>Contract Address (Optional)</Label>
              <Input
                type="text"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="0x..."
              />
            </FormGroup>

            <FormGroup>
              <Label>Network</Label>
              <Select value={network} onChange={(e) => setNetwork(e.target.value)}>
                <option value="sepolia">Sepolia Testnet</option>
                <option value="mainnet">Ethereum Mainnet</option>
                <option value="polygon">Polygon</option>
                <option value="arbitrum">Arbitrum</option>
              </Select>
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>Audit Type</Label>
              <Select value={auditType} onChange={(e) => setAuditType(e.target.value)}>
                <option value="comprehensive">Comprehensive Audit</option>
                <option value="focused">Focused Audit</option>
              </Select>
            </FormGroup>

            {auditType === 'focused' && (
              <FormGroup>
                <Label>Vulnerability Type</Label>
                <Select value={vulnerabilityType} onChange={(e) => setVulnerabilityType(e.target.value)}>
                  <option value="reentrancy">Reentrancy</option>
                  <option value="access-control">Access Control</option>
                  <option value="integer-overflow">Integer Overflow</option>
                  <option value="gas-optimization">Gas Optimization</option>
                  <option value="logic-flaws">Logic Flaws</option>
                  <option value="external-calls">External Calls</option>
                </Select>
              </FormGroup>
            )}
          </FormRow>

          <ButtonGroup>
            <PrimaryButton onClick={handleAudit} disabled={isLoading}>
              {isLoading ? 'Analyzing...' : 'Start Security Audit'}
            </PrimaryButton>
            
            {contractAddress && (
              <SecondaryButton onClick={handleCheckVulnerabilities} disabled={isLoading}>
                Check Known Vulnerabilities
              </SecondaryButton>
            )}
            
            <SecondaryButton onClick={handleGenerateTests} disabled={isLoading}>
              Generate Test Recommendations
            </SecondaryButton>
          </ButtonGroup>
        </InputSection>

        {error && (
          <ErrorMessage>
            <FaExclamationTriangle /> {error}
          </ErrorMessage>
        )}

        {auditResults && (
          <ResultsSection>
            <ResultsHeader>
              <h3>Audit Results</h3>
              <ButtonGroup>
                <SecondaryButton onClick={() => handleGenerateReport('markdown')}>
                  <FaDownload /> Export Markdown
                </SecondaryButton>
                <SecondaryButton onClick={() => handleGenerateReport('text')}>
                  <FaDownload /> Export Text
                </SecondaryButton>
              </ButtonGroup>
            </ResultsHeader>

            <ResultsContent>
              {auditResults.riskAssessment && (
                <RiskAssessment>
                  <RiskBadge color={getRiskColor(auditResults.riskAssessment)}>
                    {auditResults.riskAssessment} Risk
                  </RiskBadge>
                  {auditResults.securityScore && (
                    <ScoreBadge>
                      Security Score: {auditResults.securityScore}/10
                    </ScoreBadge>
                  )}
                </RiskAssessment>
              )}

              {auditResults.vulnerabilities && (
                <VulnerabilitiesSection>
                  <h4>Identified Vulnerabilities</h4>
                  {auditResults.vulnerabilities.map((vuln, index) => (
                    <VulnerabilityCard key={index} severity={vuln.severity}>
                      <VulnHeader>
                        <span className="severity">{vuln.severity}</span>
                        <span className="title">{vuln.title}</span>
                      </VulnHeader>
                      <p>{vuln.description}</p>
                      {vuln.recommendation && (
                        <div className="recommendation">
                          <strong>Recommendation:</strong> {vuln.recommendation}
                        </div>
                      )}
                    </VulnerabilityCard>
                  ))}
                </VulnerabilitiesSection>
              )}

              {auditResults.analysis && (
                <AnalysisSection>
                  <h4>Detailed Analysis</h4>
                  <pre>{auditResults.analysis}</pre>
                </AnalysisSection>
              )}

              {auditResults.testRecommendations && (
                <TestSection>
                  <h4>Testing Recommendations</h4>
                  <pre>{auditResults.testRecommendations}</pre>
                </TestSection>
              )}
            </ResultsContent>
          </ResultsSection>
        )}
      </Content>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Inter', sans-serif;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 8px;
  
  svg {
    color: #3498db;
  }
`;

const Subtitle = styled.p`
  color: #7f8c8d;
  font-size: 1.1rem;
  margin: 0;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const InputSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
`;

const CodeTextarea = styled.textarea`
  width: 100%;
  padding: 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  margin-top: 20px;
`;

const PrimaryButton = styled.button`
  background: #3498db;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: #2980b9;
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  background: #ecf0f1;
  color: #2c3e50;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover:not(:disabled) {
    background: #d5dbdb;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c53030;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #fed7d7;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
`;

const ResultsSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 15px;
  
  h3 {
    margin: 0;
    color: #2c3e50;
  }
`;

const ResultsContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const RiskAssessment = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
`;

const RiskBadge = styled.span`
  background: ${props => props.color};
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
`;

const ScoreBadge = styled.span`
  background: #2c3e50;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
`;

const VulnerabilitiesSection = styled.div`
  h4 {
    color: #2c3e50;
    margin-bottom: 20px;
  }
`;

const VulnerabilityCard = styled.div`
  background: ${props => {
    switch (props.severity?.toLowerCase()) {
      case 'critical': return '#fee';
      case 'high': return '#fef5e7';
      case 'medium': return '#fef9e7';
      case 'low': return '#f0f9ff';
      default: return '#f8f9fa';
    }
  }};
  border: 1px solid ${props => {
    switch (props.severity?.toLowerCase()) {
      case 'critical': return '#fed7d7';
      case 'high': return '#fbd38d';
      case 'medium': return '#f6e05e';
      case 'low': return '#bee3f8';
      default: return '#e9ecef';
    }
  }};
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
  
  .severity {
    background: ${props => {
      switch (props.severity?.toLowerCase()) {
        case 'critical': return '#dc3545';
        case 'high': return '#fd7e14';
        case 'medium': return '#ffc107';
        case 'low': return '#28a745';
        default: return '#6c757d';
      }
    }};
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    margin-right: 12px;
  }
  
  .title {
    font-weight: 600;
    color: #2c3e50;
  }
  
  .recommendation {
    margin-top: 15px;
    padding: 15px;
    background: white;
    border-radius: 6px;
    border-left: 4px solid #3498db;
  }
`;

const VulnHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;

const AnalysisSection = styled.div`
  h4 {
    color: #2c3e50;
    margin-bottom: 20px;
  }
  
  pre {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    overflow-x: auto;
    white-space: pre-wrap;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 14px;
    line-height: 1.6;
  }
`;

const TestSection = styled.div`
  h4 {
    color: #2c3e50;
    margin-bottom: 20px;
  }
  
  pre {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    overflow-x: auto;
    white-space: pre-wrap;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 14px;
    line-height: 1.6;
  }
`;

export default SecurityAuditor;
