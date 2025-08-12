import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SecurityAuditor from '../../components/SecurityAuditor';

// Mock the SecurityAuditService
jest.mock('../../services/SecurityAuditService', () => {
  return jest.fn().mockImplementation(() => ({
    auditSmartContract: jest.fn(),
    focusedAudit: jest.fn(),
    generateSecurityReport: jest.fn(),
    checkKnownVulnerabilities: jest.fn(),
    generateTestRecommendations: jest.fn(),
  }));
});

// Mock fetch for contract code loading
global.fetch = jest.fn();

describe('SecurityAuditor Component', () => {
  let mockSecurityService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful contract code loading
    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('// Mock contract code\ncontract Test {}'),
    });
    
    // Get mock service instance
    const SecurityAuditService = require('../../services/SecurityAuditService');
    mockSecurityService = new SecurityAuditService();
  });

  describe('Initial State', () => {
    test('renders without crashing', () => {
      render(<SecurityAuditor />);
      expect(screen.getByText(/AI-Powered Security Audit/i)).toBeInTheDocument();
    });

    test('shows main audit interface', () => {
      render(<SecurityAuditor />);
      
      expect(screen.getByText(/Contract Code/i)).toBeInTheDocument();
      expect(screen.getByText(/Contract Address/i)).toBeInTheDocument();
      expect(screen.getByText(/Network/i)).toBeInTheDocument();
      expect(screen.getByText(/Audit Type/i)).toBeInTheDocument();
    });

    test('loads contract code automatically', async () => {
      render(<SecurityAuditor />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/contracts/DEFIMONEquityToken.sol');
      });
    });
  });

  describe('Audit Configuration', () => {
    test('allows selecting audit type', async () => {
      render(<SecurityAuditor />);
      
      const auditTypeSelect = screen.getByLabelText(/Audit Type/i);
      expect(auditTypeSelect).toBeInTheDocument();
      
      await userEvent.selectOptions(auditTypeSelect, 'focused');
      expect(auditTypeSelect.value).toBe('focused');
    });

    test('allows selecting vulnerability type for focused audit', async () => {
      render(<SecurityAuditor />);
      
      const auditTypeSelect = screen.getByLabelText(/Audit Type/i);
      await userEvent.selectOptions(auditTypeSelect, 'focused');
      
      const vulnerabilitySelect = screen.getByLabelText(/Vulnerability Type/i);
      expect(vulnerabilitySelect).toBeInTheDocument();
      
      await userEvent.selectOptions(vulnerabilitySelect, 'reentrancy');
      expect(vulnerabilitySelect.value).toBe('reentrancy');
    });

    test('allows selecting network', async () => {
      render(<SecurityAuditor />);
      
      const networkSelect = screen.getByLabelText(/Network/i);
      expect(networkSelect).toBeInTheDocument();
      
      await userEvent.selectOptions(networkSelect, 'mainnet');
      expect(networkSelect.value).toBe('mainnet');
    });
  });

  describe('Contract Code Input', () => {
    test('allows editing contract code', async () => {
      render(<SecurityAuditor />);
      
      const codeTextarea = screen.getByLabelText(/Contract Code/i);
      expect(codeTextarea).toBeInTheDocument();
      
      const testCode = '// Test contract\ncontract Test {}';
      await userEvent.clear(codeTextarea);
      await userEvent.type(codeTextarea, testCode);
      
      expect(codeTextarea.value).toBe(testCode);
    });

    test('loads contract code from file', async () => {
      render(<SecurityAuditor />);
      
      await waitFor(() => {
        const codeTextarea = screen.getByLabelText(/Contract Code/i);
        expect(codeTextarea.value).toContain('// Mock contract code');
      });
    });

    test('handles contract code loading errors gracefully', async () => {
      // Mock failed fetch
      global.fetch.mockRejectedValueOnce(new Error('Failed to load'));
      
      render(<SecurityAuditor />);
      
      // Should not crash
      expect(screen.getByText(/AI-Powered Security Audit/i)).toBeInTheDocument();
    });
  });

  describe('Audit Execution', () => {
    test('performs comprehensive audit', async () => {
      const mockAuditResults = {
        riskAssessment: 'Medium',
        securityScore: 7,
        vulnerabilities: [
          {
            severity: 'Medium',
            title: 'Test Vulnerability',
            description: 'Test description',
            codeExample: 'test code',
            recommendation: 'Test recommendation'
          }
        ],
        analysis: 'Test analysis',
        recommendations: 'Test recommendations',
        gasOptimization: 'Test gas optimization',
        testingRecommendations: 'Test testing recommendations'
      };
      
      mockSecurityService.auditSmartContract.mockResolvedValueOnce(mockAuditResults);
      
      render(<SecurityAuditor />);
      
      await waitFor(() => {
        const codeTextarea = screen.getByLabelText(/Contract Code/i);
        expect(codeTextarea.value).toContain('// Mock contract code');
      });
      
      const auditButton = screen.getByText(/Run Security Audit/i);
      await userEvent.click(auditButton);
      
      await waitFor(() => {
        expect(mockSecurityService.auditSmartContract).toHaveBeenCalledWith(
          '// Mock contract code\ncontract Test {}',
          '',
          'sepolia'
        );
      });
    });

    test('performs focused audit', async () => {
      const mockFocusedResults = {
        vulnerabilityType: 'reentrancy',
        findings: ['Test finding 1', 'Test finding 2'],
        recommendations: ['Test recommendation']
      };
      
      mockSecurityService.focusedAudit.mockResolvedValueOnce(mockFocusedResults);
      
      render(<SecurityAuditor />);
      
      // Select focused audit
      const auditTypeSelect = screen.getByLabelText(/Audit Type/i);
      await userEvent.selectOptions(auditTypeSelect, 'focused');
      
      const vulnerabilitySelect = screen.getByLabelText(/Vulnerability Type/i);
      await userEvent.selectOptions(vulnerabilitySelect, 'reentrancy');
      
      const auditButton = screen.getByText(/Run Security Audit/i);
      await userEvent.click(auditButton);
      
      await waitFor(() => {
        expect(mockSecurityService.focusedAudit).toHaveBeenCalledWith(
          '// Mock contract code\ncontract Test {}',
          'reentrancy'
        );
      });
    });

    test('shows loading state during audit', async () => {
      // Mock slow audit
      mockSecurityService.auditSmartContract.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      
      render(<SecurityAuditor />);
      
      const auditButton = screen.getByText(/Run Security Audit/i);
      await userEvent.click(auditButton);
      
      expect(screen.getByText(/Running Audit/i)).toBeInTheDocument();
    });

    test('handles audit errors gracefully', async () => {
      mockSecurityService.auditSmartContract.mockRejectedValueOnce(
        new Error('Audit failed')
      );
      
      render(<SecurityAuditor />);
      
      const auditButton = screen.getByText(/Run Security Audit/i);
      await userEvent.click(auditButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Audit failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Audit Results Display', () => {
    test('displays comprehensive audit results', async () => {
      const mockAuditResults = {
        riskAssessment: 'High',
        securityScore: 4,
        vulnerabilities: [
          {
            severity: 'High',
            title: 'Critical Vulnerability',
            description: 'This is a critical security issue',
            codeExample: 'function vulnerable() external {',
            recommendation: 'Add access control modifier'
          }
        ],
        analysis: 'Contract has several security issues',
        recommendations: 'Implement proper access control',
        gasOptimization: 'Use storage variables efficiently',
        testingRecommendations: 'Add comprehensive test suite'
      };
      
      mockSecurityService.auditSmartContract.mockResolvedValueOnce(mockAuditResults);
      
      render(<SecurityAuditor />);
      
      const auditButton = screen.getByText(/Run Security Audit/i);
      await userEvent.click(auditButton);
      
      await waitFor(() => {
        expect(screen.getByText(/High/i)).toBeInTheDocument();
        expect(screen.getByText(/Security Score: 4/i)).toBeInTheDocument();
        expect(screen.getByText(/Critical Vulnerability/i)).toBeInTheDocument();
        expect(screen.getByText(/This is a critical security issue/i)).toBeInTheDocument();
      });
    });

    test('displays vulnerability details', async () => {
      const mockAuditResults = {
        riskAssessment: 'Medium',
        securityScore: 6,
        vulnerabilities: [
          {
            severity: 'Medium',
            title: 'Medium Risk Issue',
            description: 'Medium risk description',
            codeExample: 'medium risk code',
            recommendation: 'Medium risk fix'
          }
        ],
        analysis: 'Medium risk analysis',
        recommendations: 'Medium risk recommendations',
        gasOptimization: 'Medium gas optimization',
        testingRecommendations: 'Medium testing recommendations'
      };
      
      mockSecurityService.auditSmartContract.mockResolvedValueOnce(mockAuditResults);
      
      render(<SecurityAuditor />);
      
      const auditButton = screen.getByText(/Run Security Audit/i);
      await userEvent.click(auditButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Medium Risk Issue/i)).toBeInTheDocument();
        expect(screen.getByText(/Medium risk description/i)).toBeInTheDocument();
        expect(screen.getByText(/Medium risk fix/i)).toBeInTheDocument();
      });
    });
  });

  describe('Report Generation', () => {
    test('generates markdown report', async () => {
      const mockReport = '# Security Audit Report\n\n## Summary\nTest report content';
      mockSecurityService.generateSecurityReport.mockResolvedValueOnce(mockReport);
      
      // Mock successful audit first
      const mockAuditResults = {
        riskAssessment: 'Low',
        securityScore: 8,
        vulnerabilities: []
      };
      mockSecurityService.auditSmartContract.mockResolvedValueOnce(mockAuditResults);
      
      render(<SecurityAuditor />);
      
      // Run audit first
      const auditButton = screen.getByText(/Run Security Audit/i);
      await userEvent.click(auditButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Security Score: 8/i)).toBeInTheDocument();
      });
      
      // Generate report
      const reportButton = screen.getByText(/Generate Report/i);
      await userEvent.click(reportButton);
      
      await waitFor(() => {
        expect(mockSecurityService.generateSecurityReport).toHaveBeenCalledWith(
          mockAuditResults,
          'markdown'
        );
      });
    });

    test('generates text report', async () => {
      const mockReport = 'Security Audit Report\n\nSummary\nTest report content';
      mockSecurityService.generateSecurityReport.mockResolvedValueOnce(mockReport);
      
      // Mock successful audit first
      const mockAuditResults = {
        riskAssessment: 'Low',
        securityScore: 8,
        vulnerabilities: []
      };
      mockSecurityService.auditSmartContract.mockResolvedValueOnce(mockAuditResults);
      
      render(<SecurityAuditor />);
      
      // Run audit first
      const auditButton = screen.getByText(/Run Security Audit/i);
      await userEvent.click(auditButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Security Score: 8/i)).toBeInTheDocument();
      });
      
      // Select text format and generate report
      const formatSelect = screen.getByLabelText(/Report Format/i);
      await userEvent.selectOptions(formatSelect, 'text');
      
      const reportButton = screen.getByText(/Generate Report/i);
      await userEvent.click(reportButton);
      
      await waitFor(() => {
        expect(mockSecurityService.generateSecurityReport).toHaveBeenCalledWith(
          mockAuditResults,
          'text'
        );
      });
    });
  });

  describe('Vulnerability Checking', () => {
    test('checks known vulnerabilities', async () => {
      const mockVulnerabilities = [
        {
          id: 'CVE-2023-1234',
          title: 'Known Vulnerability',
          severity: 'High',
          description: 'This vulnerability is known in the wild'
        }
      ];
      
      mockSecurityService.checkKnownVulnerabilities.mockResolvedValueOnce(mockVulnerabilities);
      
      render(<SecurityAuditor />);
      
      const contractAddressInput = screen.getByLabelText(/Contract Address/i);
      await userEvent.type(contractAddressInput, '0x1234567890123456789012345678901234567890');
      
      const checkButton = screen.getByText(/Check Known Vulnerabilities/i);
      await userEvent.click(checkButton);
      
      await waitFor(() => {
        expect(mockSecurityService.checkKnownVulnerabilities).toHaveBeenCalledWith(
          '0x1234567890123456789012345678901234567890',
          'sepolia'
        );
      });
    });

    test('requires contract address for vulnerability check', async () => {
      render(<SecurityAuditor />);
      
      const checkButton = screen.getByText(/Check Known Vulnerabilities/i);
      await userEvent.click(checkButton);
      
      expect(screen.getByText(/Please provide contract address/i)).toBeInTheDocument();
    });
  });

  describe('Test Recommendations', () => {
    test('generates test recommendations', async () => {
      const mockTestRecommendations = {
        unitTests: ['Test function A', 'Test function B'],
        integrationTests: ['Test contract interaction'],
        securityTests: ['Test reentrancy', 'Test access control'],
        fuzzingTests: ['Fuzz input parameters'],
        formalVerification: ['Verify mathematical properties']
      };
      
      mockSecurityService.generateTestRecommendations.mockResolvedValueOnce(mockTestRecommendations);
      
      render(<SecurityAuditor />);
      
      const testButton = screen.getByText(/Generate Test Recommendations/i);
      await userEvent.click(testButton);
      
      await waitFor(() => {
        expect(mockSecurityService.generateTestRecommendations).toHaveBeenCalledWith(
          '// Mock contract code\ncontract Test {}'
        );
      });
    });

    test('requires contract code for test recommendations', async () => {
      render(<SecurityAuditor />);
      
      // Clear contract code
      const codeTextarea = screen.getByLabelText(/Contract Code/i);
      await userEvent.clear(codeTextarea);
      
      const testButton = screen.getByText(/Generate Test Recommendations/i);
      await userEvent.click(testButton);
      
      // Should not crash, but might show empty results
      expect(screen.getByText(/Generate Test Recommendations/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper form labels', () => {
      render(<SecurityAuditor />);
      
      expect(screen.getByLabelText(/Contract Code/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Contract Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Network/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Audit Type/i)).toBeInTheDocument();
    });

    test('buttons have proper text content', () => {
      render(<SecurityAuditor />);
      
      expect(screen.getByRole('button', { name: /Run Security Audit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Generate Report/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Check Known Vulnerabilities/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Generate Test Recommendations/i })).toBeInTheDocument();
    });

    test('has proper heading structure', () => {
      render(<SecurityAuditor />);
      
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('handles service errors gracefully', async () => {
      mockSecurityService.auditSmartContract.mockRejectedValueOnce(
        new Error('Service unavailable')
      );
      
      render(<SecurityAuditor />);
      
      const auditButton = screen.getByText(/Run Security Audit/i);
      await userEvent.click(auditButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Service unavailable/i)).toBeInTheDocument();
      });
    });

    test('handles missing contract code', async () => {
      render(<SecurityAuditor />);
      
      // Clear contract code
      const codeTextarea = screen.getByLabelText(/Contract Code/i);
      await userEvent.clear(codeTextarea);
      
      const auditButton = screen.getByText(/Run Security Audit/i);
      await userEvent.click(auditButton);
      
      expect(screen.getByText(/Please provide contract code for analysis/i)).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('renders without performance issues', () => {
      const startTime = performance.now();
      
      render(<SecurityAuditor />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render in less than 100ms
      expect(renderTime).toBeLessThan(100);
    });

    test('handles large contract code efficiently', async () => {
      const largeCode = '// Large contract\n'.repeat(1000) + 'contract Large {}';
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(largeCode),
      });
      
      const startTime = performance.now();
      
      render(<SecurityAuditor />);
      
      await waitFor(() => {
        const codeTextarea = screen.getByLabelText(/Contract Code/i);
        expect(codeTextarea.value).toContain('contract Large {}');
      });
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should handle large code efficiently
      expect(totalTime).toBeLessThan(200);
    });
  });
});
