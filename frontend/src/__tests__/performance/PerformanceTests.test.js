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

describe('Performance Tests', () => {
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

  describe('Component Rendering Performance', () => {
    test('App component renders within performance budget', () => {
      const startTime = performance.now();
      
      render(<App />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render in less than 100ms
      expect(renderTime).toBeLessThan(100);
      
      // Verify component rendered
      expect(screen.getByText(/DEFIMON Equity Token/i)).toBeInTheDocument();
    });

    test('Header component renders efficiently', () => {
      const startTime = performance.now();
      
      render(<App />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render in less than 50ms
      expect(renderTime).toBeLessThan(50);
      
      // Verify header content
      expect(screen.getByText(/DEFIMON/i)).toBeInTheDocument();
    });

    test('SecurityAuditor component renders quickly', () => {
      const startTime = performance.now();
      
      render(<SecurityAuditor />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render in less than 80ms
      expect(renderTime).toBeLessThan(80);
      
      // Verify component rendered
      expect(screen.getByText(/AI-Powered Security Audit/i)).toBeInTheDocument();
    });
  });

  describe('User Interaction Performance', () => {
    test('wallet connection is responsive', async () => {
      render(<App />);
      
      const connectButton = screen.getByText(/Connect Wallet/i);
      
      const startTime = performance.now();
      
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Добро пожаловать, Владимир Овчаров/i)).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      // Should respond within 200ms
      expect(responseTime).toBeLessThan(200);
    });

    test('tab switching is fast', async () => {
      render(<App />);
      
      // Connect wallet first
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Smart Contract Editor/i)).toBeInTheDocument();
      });
      
      const tabs = [
        'Deploy Contract',
        'Управление участниками',
        'Вестинг и клейм',
        'Multi-Signature',
        'Exchange System',
        'Token Price',
        'Security Audit'
      ];
      
      // Test tab switching performance
      for (const tabName of tabs) {
        const startTime = performance.now();
        
        const tab = screen.getByText(tabName);
        await userEvent.click(tab);
        
        // Wait for content to render
        await waitFor(() => {
          expect(screen.getByText(new RegExp(tabName, 'i'))).toBeInTheDocument();
        });
        
        const endTime = performance.now();
        const switchTime = endTime - startTime;
        
        // Each tab should switch within 150ms
        expect(switchTime).toBeLessThan(150);
      }
    });

    test('form input is responsive', async () => {
      render(<SecurityAuditor />);
      
      const codeTextarea = screen.getByLabelText(/Contract Code/i);
      
      const testInput = '// Test contract\ncontract Test {}';
      
      const startTime = performance.now();
      
      await userEvent.clear(codeTextarea);
      await userEvent.type(codeTextarea, testInput);
      
      const endTime = performance.now();
      const inputTime = endTime - startTime;
      
      // Input should be responsive within 100ms
      expect(inputTime).toBeLessThan(100);
      
      // Verify input was processed
      expect(codeTextarea.value).toBe(testInput);
    });
  });

  describe('Memory Usage Performance', () => {
    test('memory usage stays within limits', () => {
      // Get initial memory usage
      const initialMemory = performance.memory?.usedJSHeapSize || 0;
      
      render(<App />);
      
      // Get memory after render
      const afterRenderMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = afterRenderMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
      
      // Verify component rendered
      expect(screen.getByText(/DEFIMON Equity Token/i)).toBeInTheDocument();
    });

    test('handles large data efficiently', async () => {
      render(<SecurityAuditor />);
      
      const codeTextarea = screen.getByLabelText(/Contract Code/i);
      
      // Test with large contract code
      const largeCode = '// Large contract\n'.repeat(1000) + 'contract Large {}';
      
      const startTime = performance.now();
      
      await userEvent.clear(codeTextarea);
      await userEvent.type(codeTextarea, largeCode);
      
      const endTime = performance.now();
      const inputTime = endTime - startTime;
      
      // Should handle large input efficiently
      expect(inputTime).toBeLessThan(500);
      
      // Memory should not spike excessively
      const currentMemory = performance.memory?.usedJSHeapSize || 0;
      expect(currentMemory).toBeLessThan(50 * 1024 * 1024); // 50MB max
    });

    test('memory cleanup on component unmount', () => {
      const initialMemory = performance.memory?.usedJSHeapSize || 0;
      
      const { unmount } = render(<App />);
      
      // Get memory after render
      const afterRenderMemory = performance.memory?.usedJSHeapSize || 0;
      
      // Unmount component
      unmount();
      
      // Get memory after unmount
      const afterUnmountMemory = performance.memory?.usedJSHeapSize || 0;
      
      // Memory should decrease after unmount
      expect(afterUnmountMemory).toBeLessThanOrEqual(afterRenderMemory);
      
      // Memory should return close to initial state
      const memoryDifference = Math.abs(afterUnmountMemory - initialMemory);
      expect(memoryDifference).toBeLessThan(5 * 1024 * 1024); // 5MB tolerance
    });
  });

  describe('Network Performance', () => {
    test('API calls are optimized', async () => {
      // Mock fast API response
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('// Fast response'),
      });
      
      render(<SecurityAuditor />);
      
      const startTime = performance.now();
      
      // Wait for API call to complete
      await waitFor(() => {
        const codeTextarea = screen.getByLabelText(/Contract Code/i);
        expect(codeTextarea.value).toContain('// Fast response');
      });
      
      const endTime = performance.now();
      const apiTime = endTime - startTime;
      
      // API call should complete quickly
      expect(apiTime).toBeLessThan(300);
    });

    test('handles slow network gracefully', async () => {
      // Mock slow API response
      global.fetch = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          text: () => Promise.resolve('// Slow response'),
        }), 100))
      );
      
      render(<SecurityAuditor />);
      
      const startTime = performance.now();
      
      // Wait for API call to complete
      await waitFor(() => {
        const codeTextarea = screen.getByLabelText(/Contract Code/i);
        expect(codeTextarea.value).toContain('// Slow response');
      });
      
      const endTime = performance.now();
      const apiTime = endTime - startTime;
      
      // Should handle slow network within reasonable time
      expect(apiTime).toBeLessThan(500);
    });
  });

  describe('Animation and Transition Performance', () => {
    test('CSS transitions are smooth', () => {
      render(<App />);
      
      // Connect wallet to trigger transitions
      const connectButton = screen.getByText(/Connect Wallet/i);
      
      const startTime = performance.now();
      
      // Simulate rapid interactions to test transition performance
      for (let i = 0; i < 10; i++) {
        fireEvent.mouseEnter(connectButton);
        fireEvent.mouseLeave(connectButton);
      }
      
      const endTime = performance.now();
      const transitionTime = endTime - startTime;
      
      // Transitions should be smooth and fast
      expect(transitionTime).toBeLessThan(100);
    });

    test('hover effects are responsive', () => {
      render(<App />);
      
      const connectButton = screen.getByText(/Connect Wallet/i);
      
      const startTime = performance.now();
      
      // Test hover performance
      fireEvent.mouseEnter(connectButton);
      fireEvent.mouseLeave(connectButton);
      fireEvent.mouseEnter(connectButton);
      
      const endTime = performance.now();
      const hoverTime = endTime - startTime;
      
      // Hover effects should be instant
      expect(hoverTime).toBeLessThan(50);
    });
  });

  describe('Bundle Size Performance', () => {
    test('component imports are optimized', () => {
      const startTime = performance.now();
      
      // Import all components to test bundle loading
      const components = [
        require('../../components/Header'),
        require('../../components/SecurityAuditor'),
        require('../../components/ContractDeployment'),
        require('../../components/ParticipantForm'),
        require('../../components/VestingDashboard'),
        require('../../components/MultiSignatureManager'),
        require('../../components/ExchangeManager'),
        require('../../components/TokenPriceManager'),
        require('../../components/SmartContractEditor')
      ];
      
      const endTime = performance.now();
      const importTime = endTime - startTime;
      
      // Component imports should be fast
      expect(importTime).toBeLessThan(50);
      
      // All components should be available
      expect(components.length).toBe(9);
    });

    test('utility functions are efficient', () => {
      const startTime = performance.now();
      
      // Test utility functions performance
      const { isAuthorizedUser, getUserInfo } = require('../../config/users');
      
      // Perform multiple function calls
      for (let i = 0; i < 1000; i++) {
        isAuthorizedUser('0x1234567890123456789012345678901234567890');
        getUserInfo('0x1234567890123456789012345678901234567890');
      }
      
      const endTime = performance.now();
      const utilityTime = endTime - startTime;
      
      // Utility functions should be very fast
      expect(utilityTime).toBeLessThan(10);
    });
  });

  describe('State Management Performance', () => {
    test('state updates are fast', async () => {
      render(<App />);
      
      // Connect wallet to set up state
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Добро пожаловать, Владимир Овчаров/i)).toBeInTheDocument();
      });
      
      // Test state update performance
      const startTime = performance.now();
      
      // Trigger multiple state changes
      const tabs = ['Deploy Contract', 'Управление участниками', 'Вестинг и клейм'];
      
      for (const tabName of tabs) {
        const tab = screen.getByText(tabName);
        await userEvent.click(tab);
        
        await waitFor(() => {
          expect(screen.getByText(new RegExp(tabName, 'i'))).toBeInTheDocument();
        });
      }
      
      const endTime = performance.now();
      const stateUpdateTime = endTime - startTime;
      
      // State updates should be fast
      expect(stateUpdateTime).toBeLessThan(500);
    });

    test('re-renders are optimized', async () => {
      render(<App />);
      
      // Connect wallet
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Добро пожаловать, Владимир Овчаров/i)).toBeInTheDocument();
      });
      
      // Test re-render performance
      const startTime = performance.now();
      
      // Trigger multiple re-renders
      for (let i = 0; i < 20; i++) {
        const tab = screen.getByText(/Deploy Contract/i);
        await userEvent.click(tab);
        
        await waitFor(() => {
          expect(screen.getByText(/Deploy Contract - Шаг 2/i)).toBeInTheDocument();
        });
      }
      
      const endTime = performance.now();
      const reRenderTime = endTime - startTime;
      
      // Re-renders should be very fast
      expect(reRenderTime).toBeLessThan(1000);
    });
  });

  describe('Accessibility Performance', () => {
    test('screen reader performance is good', () => {
      render(<App />);
      
      const startTime = performance.now();
      
      // Simulate screen reader operations
      const headings = screen.getAllByRole('heading');
      const buttons = screen.getAllByRole('button');
      const images = screen.getAllByRole('img');
      
      const endTime = performance.now();
      const accessibilityTime = endTime - startTime;
      
      // Accessibility operations should be instant
      expect(accessibilityTime).toBeLessThan(10);
      
      // Should have proper accessibility elements
      expect(headings.length).toBeGreaterThan(0);
      expect(buttons.length).toBeGreaterThan(0);
    });

    test('keyboard navigation is responsive', async () => {
      render(<App />);
      
      // Connect wallet
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Smart Contract Editor/i)).toBeInTheDocument();
      });
      
      const startTime = performance.now();
      
      // Test keyboard navigation performance
      const tabs = screen.getAllByRole('tab');
      if (tabs.length > 0) {
        tabs[0].focus();
        
        // Navigate with keyboard
        for (let i = 0; i < 10; i++) {
          fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });
          fireEvent.keyDown(tabs[0], { key: 'ArrowLeft' });
        }
      }
      
      const endTime = performance.now();
      const keyboardTime = endTime - startTime;
      
      // Keyboard navigation should be instant
      expect(keyboardTime).toBeLessThan(50);
    });
  });

  describe('Mobile Performance', () => {
    test('mobile viewport performance is good', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      const startTime = performance.now();
      
      render(<App />);
      
      const endTime = performance.now();
      const mobileRenderTime = endTime - startTime;
      
      // Mobile rendering should be fast
      expect(mobileRenderTime).toBeLessThan(100);
      
      // Verify mobile content
      expect(screen.getByText(/DEFIMON Equity Token/i)).toBeInTheDocument();
    });

    test('touch interactions are responsive', async () => {
      render(<App />);
      
      // Connect wallet
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Smart Contract Editor/i)).toBeInTheDocument();
      });
      
      const startTime = performance.now();
      
      // Test touch interaction performance
      const tabs = ['Deploy Contract', 'Управление участниками', 'Вестинг и клейм'];
      
      for (const tabName of tabs) {
        const tab = screen.getByText(tabName);
        await userEvent.click(tab);
        
        await waitFor(() => {
          expect(screen.getByText(new RegExp(tabName, 'i'))).toBeInTheDocument();
        });
      }
      
      const endTime = performance.now();
      const touchTime = endTime - startTime;
      
      // Touch interactions should be fast
      expect(touchTime).toBeLessThan(300);
    });
  });

  describe('Performance Monitoring', () => {
    test('performance metrics are available', () => {
      // Check if performance API is available
      expect(performance).toBeDefined();
      expect(performance.now).toBeDefined();
      
      // Check if performance.memory is available (Chrome only)
      if (performance.memory) {
        expect(performance.memory.usedJSHeapSize).toBeDefined();
        expect(performance.memory.totalJSHeapSize).toBeDefined();
        expect(performance.memory.jsHeapSizeLimit).toBeDefined();
      }
    });

    test('performance budget is maintained', () => {
      const startTime = performance.now();
      
      render(<App />);
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Overall performance budget: 200ms
      expect(totalTime).toBeLessThan(200);
      
      // Verify component rendered
      expect(screen.getByText(/DEFIMON Equity Token/i)).toBeInTheDocument();
    });
  });
});
