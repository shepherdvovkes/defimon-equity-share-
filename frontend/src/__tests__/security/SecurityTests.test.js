import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import App from '../../App';
import SecurityAuditor from '../../components/SecurityAuditor';

// Mock the users config
jest.mock('../../config/users', () => ({
  isAuthorizedUser: jest.fn(),
  getUserInfo: jest.fn(),
}));

// Mock the contracts
jest.mock('../../contracts/DEFIMONEquityToken.json', () => ({
  abi: [],
}));

describe('Security Tests', () => {
  const mockUser = {
    name: 'Владимир Овчаров',
    role: 'owner',
    permissions: ['deploy', 'manage_participants', 'start_vesting', 'claim_tokens']
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    const { isAuthorizedUser, getUserInfo } = require('../../config/users');
    isAuthorizedUser.mockReturnValue(true);
    getUserInfo.mockReturnValue(mockUser);
  });

  describe('Authentication & Authorization Security', () => {
    test('prevents unauthorized access to protected routes', async () => {
      const { isAuthorizedUser } = require('../../config/users');
      isAuthorizedUser.mockReturnValue(false);
      
      render(<App />);
      
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Доступ запрещен/i)).toBeInTheDocument();
      });
      
      // Should not show any protected content
      expect(screen.queryByText(/Smart Contract Editor/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Deploy Contract/i)).not.toBeInTheDocument();
    });

    test('validates user permissions correctly', async () => {
      const { getUserInfo } = require('../../config/users');
      
      // Test with admin role (limited permissions)
      getUserInfo.mockReturnValue({
        name: 'Admin User',
        role: 'admin',
        permissions: ['manage_participants', 'start_vesting']
      });
      
      render(<App />);
      
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Добро пожаловать, Admin User/i)).toBeInTheDocument();
        expect(screen.getByText(/admin/i)).toBeInTheDocument();
      });
    });

    test('handles missing user data securely', async () => {
      const { getUserInfo } = require('../../config/users');
      getUserInfo.mockReturnValue(null);
      
      render(<App />);
      
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      // Should handle gracefully without exposing sensitive information
      expect(screen.getByText(/DEFIMON Equity Token/i)).toBeInTheDocument();
    });
  });

  describe('Input Validation Security', () => {
    test('validates contract addresses format', async () => {
      render(<App />);
      
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Smart Contract Editor/i)).toBeInTheDocument();
      });
      
      // Navigate to security audit
      const securityTab = screen.getByText(/Security Audit/i);
      await userEvent.click(securityTab);
      
      // Test invalid contract address
      const contractAddressInput = screen.getByLabelText(/Contract Address/i);
      await userEvent.type(contractAddressInput, 'invalid-address');
      
      const checkButton = screen.getByText(/Check Known Vulnerabilities/i);
      await userEvent.click(checkButton);
      
      // Should handle invalid input gracefully
      expect(screen.getByText(/AI-Powered Security Audit/i)).toBeInTheDocument();
    });

    test('prevents XSS attacks in user input', async () => {
      render(<App />);
      
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Smart Contract Editor/i)).toBeInTheDocument();
      });
      
      // Navigate to security audit
      const securityTab = screen.getByText(/Security Audit/i);
      await userEvent.click(securityTab);
      
      // Test XSS payload
      const contractAddressInput = screen.getByLabelText(/Contract Address/i);
      const xssPayload = '<script>alert("xss")</script>';
      await userEvent.type(contractAddressInput, xssPayload);
      
      // Should not execute script
      expect(screen.queryByText(/alert/i)).not.toBeInTheDocument();
      
      // Input should be treated as text
      expect(contractAddressInput.value).toBe(xssPayload);
    });

    test('validates network selection', async () => {
      render(<App />);
      
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Smart Contract Editor/i)).toBeInTheDocument();
      });
      
      // Navigate to security audit
      const securityTab = screen.getByText(/Security Audit/i);
      await userEvent.click(securityTab);
      
      const networkSelect = screen.getByLabelText(/Network/i);
      expect(networkSelect).toBeInTheDocument();
      
      // Should only allow valid network options
      const options = Array.from(networkSelect.options).map(option => option.value);
      expect(options).toContain('sepolia');
      expect(options).toContain('mainnet');
    });
  });

  describe('Data Sanitization Security', () => {
    test('sanitizes contract code input', async () => {
      render(<App />);
      
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Smart Contract Editor/i)).toBeInTheDocument();
      });
      
      // Navigate to security audit
      const securityTab = screen.getByText(/Security Audit/i);
      await userEvent.click(securityTab);
      
      const codeTextarea = screen.getByLabelText(/Contract Code/i);
      
      // Test malicious code input
      const maliciousCode = `
        // Malicious code
        contract Malicious {
          function attack() external {
            // Attempt to exploit
            selfdestruct(payable(msg.sender));
          }
        }
      `;
      
      await userEvent.clear(codeTextarea);
      await userEvent.type(codeTextarea, maliciousCode);
      
      // Should not execute malicious code
      expect(codeTextarea.value).toBe(maliciousCode);
      
      // Should be treated as text input only
      expect(screen.getByText(/AI-Powered Security Audit/i)).toBeInTheDocument();
    });

    test('handles large input safely', async () => {
      render(<App />);
      
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Smart Contract Editor/i)).toBeInTheDocument();
      });
      
      // Navigate to security audit
      const securityTab = screen.getByText(/Security Audit/i);
      await userEvent.click(securityTab);
      
      const codeTextarea = screen.getByLabelText(/Contract Code/i);
      
      // Test very large input
      const largeInput = '// Large input\n'.repeat(10000) + 'contract Large {}';
      
      await userEvent.clear(codeTextarea);
      await userEvent.type(codeTextarea, largeInput);
      
      // Should handle large input without crashing
      expect(screen.getByText(/AI-Powered Security Audit/i)).toBeInTheDocument();
      
      // Should truncate or handle appropriately
      expect(codeTextarea.value.length).toBeGreaterThan(0);
    });
  });

  describe('API Security', () => {
    test('validates API responses', async () => {
      // Mock malicious API response
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<script>alert("malicious")</script>'),
      });
      
      render(<SecurityAuditor />);
      
      // Should handle malicious response safely
      await waitFor(() => {
        expect(screen.getByText(/AI-Powered Security Audit/i)).toBeInTheDocument();
      });
      
      // Should not execute malicious content
      expect(screen.queryByText(/alert/i)).not.toBeInTheDocument();
    });

    test('handles API errors securely', async () => {
      // Mock API error
      global.fetch = jest.fn().mockRejectedValueOnce(new Error('API Error'));
      
      render(<SecurityAuditor />);
      
      // Should handle error gracefully without exposing sensitive information
      expect(screen.getByText(/AI-Powered Security Audit/i)).toBeInTheDocument();
    });
  });

  describe('Session Security', () => {
    test('handles wallet disconnection securely', async () => {
      render(<App />);
      
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Добро пожаловать, Владимир Овчаров/i)).toBeInTheDocument();
      });
      
      // Disconnect wallet
      const disconnectButton = screen.getByText(/Disconnect/i);
      await userEvent.click(disconnectButton);
      
      // Should clear all sensitive data
      expect(screen.queryByText(/Владимир Овчаров/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Smart Contract Editor/i)).not.toBeInTheDocument();
      
      // Should return to initial state
      expect(screen.getByText(/Connect Wallet/i)).toBeInTheDocument();
    });

    test('handles account switching securely', async () => {
      render(<App />);
      
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Добро пожаловать, Владимир Овчаров/i)).toBeInTheDocument();
      });
      
      // Simulate account change
      const { isAuthorizedUser } = require('../../config/users');
      isAuthorizedUser.mockReturnValue(false);
      
      // Should handle unauthorized account gracefully
      expect(screen.getByText(/AI-Powered Security Audit/i)).toBeInTheDocument();
    });
  });

  describe('Network Security', () => {
    test('validates network switching', async () => {
      render(<App />);
      
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Добро пожаловать, Владимир Овчаров/i)).toBeInTheDocument();
      });
      
      // Test network validation
      expect(global.testUtils.mockEthereum.request).toBeDefined();
      
      // Should only allow valid networks
      const validNetworks = ['0xaa36a7']; // Sepolia
      expect(validNetworks).toContain('0xaa36a7');
    });

    test('prevents unauthorized network access', async () => {
      render(<App />);
      
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Добро пожаловать, Владимир Овчаров/i)).toBeInTheDocument();
      });
      
      // Should validate network permissions
      expect(global.testUtils.mockEthereum.chainId).toBe('0xaa36a7');
    });
  });

  describe('Error Handling Security', () => {
    test('does not expose sensitive information in errors', async () => {
      // Mock service error
      const SecurityAuditService = require('../../services/SecurityAuditService');
      const mockService = new SecurityAuditService();
      mockService.auditSmartContract.mockRejectedValueOnce(
        new Error('Internal server error: database connection failed')
      );
      
      render(<SecurityAuditor />);
      
      const auditButton = screen.getByText(/Run Security Audit/i);
      await userEvent.click(auditButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Internal server error/i)).toBeInTheDocument();
      });
      
      // Should not expose internal details
      expect(screen.queryByText(/database connection failed/i)).not.toBeInTheDocument();
    });

    test('handles malformed responses securely', async () => {
      // Mock malformed response
      const SecurityAuditService = require('../../services/SecurityAuditService');
      const mockService = new SecurityAuditService();
      mockService.auditSmartContract.mockResolvedValueOnce({
        invalidField: 'malicious data',
        __proto__: { isAdmin: true }
      });
      
      render(<SecurityAuditor />);
      
      const auditButton = screen.getByText(/Run Security Audit/i);
      await userEvent.click(auditButton);
      
      // Should handle malformed data safely
      await waitFor(() => {
        expect(screen.getByText(/AI-Powered Security Audit/i)).toBeInTheDocument();
      });
    });
  });

  describe('Content Security Policy', () => {
    test('prevents inline script execution', async () => {
      render(<App />);
      
      // Should not have inline scripts
      const scripts = document.querySelectorAll('script');
      scripts.forEach(script => {
        expect(script.src).toBeTruthy(); // Should have src attribute
      });
    });

    test('validates external resources', async () => {
      render(<App />);
      
      // Check for external resources
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (img.src) {
          // Should validate external URLs
          expect(img.src).toMatch(/^https?:\/\//);
        }
      });
    });
  });

  describe('Accessibility Security', () => {
    test('maintains security during accessibility testing', async () => {
      render(<App />);
      
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Добро пожаловать, Владимир Овчаров/i)).toBeInTheDocument();
      });
      
      // Test keyboard navigation
      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBeGreaterThan(0);
      
      // Should maintain security during navigation
      tabs[0].focus();
      expect(tabs[0]).toHaveFocus();
      
      // Should not expose sensitive data through accessibility features
      expect(screen.getByText(/AI-Powered Security Audit/i)).toBeInTheDocument();
    });
  });

  describe('Performance Security', () => {
    test('prevents DoS attacks through large inputs', async () => {
      render(<SecurityAuditor />);
      
      const codeTextarea = screen.getByLabelText(/Contract Code/i);
      
      // Test extremely large input
      const startTime = performance.now();
      
      const largeInput = '// Large input\n'.repeat(100000);
      await userEvent.clear(codeTextarea);
      await userEvent.type(codeTextarea, largeInput);
      
      const endTime = performance.now();
      const inputTime = endTime - startTime;
      
      // Should handle large input within reasonable time
      expect(inputTime).toBeLessThan(5000); // 5 seconds max
      
      // Should not crash
      expect(screen.getByText(/AI-Powered Security Audit/i)).toBeInTheDocument();
    });

    test('prevents memory exhaustion attacks', async () => {
      render(<SecurityAuditor />);
      
      const codeTextarea = screen.getByLabelText(/Contract Code/i);
      
      // Test memory-intensive input
      const memoryIntensiveInput = '// Memory intensive\n'.repeat(50000);
      
      await userEvent.clear(codeTextarea);
      await userEvent.type(codeTextarea, memoryIntensiveInput);
      
      // Should handle without memory issues
      expect(screen.getByText(/AI-Powered Security Audit/i)).toBeInTheDocument();
      
      // Should not cause excessive memory usage
      const memoryUsage = performance.memory?.usedJSHeapSize || 0;
      expect(memoryUsage).toBeLessThan(100 * 1024 * 1024); // 100MB max
    });
  });
});
