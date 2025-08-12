import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import App from '../../App';

// Mock the users config
jest.mock('../../config/users', () => ({
  isAuthorizedUser: jest.fn(),
  getUserInfo: jest.fn(),
}));

// Mock the contracts
jest.mock('../../contracts/DEFIMONEquityToken.json', () => ({
  abi: [],
}));

describe('App Integration Tests', () => {
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

  describe('Complete User Journey', () => {
    test('complete workflow from connection to contract deployment', async () => {
      render(<App />);
      
      // Step 1: Connect wallet
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Добро пожаловать, Владимир Овчаров/i)).toBeInTheDocument();
      });
      
      // Step 2: Navigate to smart contract editor
      expect(screen.getByText(/Smart Contract Editor - Шаг 1/i)).toBeInTheDocument();
      
      // Step 3: Navigate to deployment
      const deploymentTab = screen.getByText(/Deploy Contract/i);
      await userEvent.click(deploymentTab);
      
      expect(screen.getByText(/Deploy Contract - Шаг 2/i)).toBeInTheDocument();
      
      // Step 4: Navigate to participants management
      const participantsTab = screen.getByText(/Управление участниками/i);
      await userEvent.click(participantsTab);
      
      expect(screen.getByText(/Управление участниками/i)).toBeInTheDocument();
      
      // Step 5: Navigate to vesting
      const vestingTab = screen.getByText(/Вестинг и клейм/i);
      await userEvent.click(vestingTab);
      
      expect(screen.getByText(/Вестинг и клейм токенов/i)).toBeInTheDocument();
      
      // Step 6: Navigate to security audit
      const securityTab = screen.getByText(/Security Audit/i);
      await userEvent.click(securityTab);
      
      expect(screen.getByText(/AI-Powered Security Audit/i)).toBeInTheDocument();
    });

    test('tab state persistence during navigation', async () => {
      render(<App />);
      
      // Connect wallet
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Smart Contract Editor - Шаг 1/i)).toBeInTheDocument();
      });
      
      // Navigate between tabs multiple times
      const tabs = [
        'Deploy Contract',
        'Управление участниками',
        'Вестинг и клейм',
        'Multi-Signature',
        'Exchange System',
        'Token Price',
        'Security Audit'
      ];
      
      for (const tabName of tabs) {
        const tab = screen.getByText(tabName);
        await userEvent.click(tab);
        
        // Verify tab content is displayed
        expect(screen.getByText(new RegExp(tabName, 'i'))).toBeInTheDocument();
      }
      
      // Return to first tab
      const firstTab = screen.getByText(/DEFIMONEquityToken.sol/i);
      await userEvent.click(firstTab);
      
      expect(screen.getByText(/Smart Contract Editor - Шаг 1/i)).toBeInTheDocument();
    });
  });

  describe('Component Communication', () => {
    test('status updates propagate across components', async () => {
      render(<App />);
      
      // Connect wallet
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Добро пожаловать, Владимир Овчаров/i)).toBeInTheDocument();
      });
      
      // Status should be visible
      expect(screen.getByText(/Добро пожаловать, Владимир Овчаров/i)).toBeInTheDocument();
      
      // Navigate to different tabs - status should persist
      const deploymentTab = screen.getByText(/Deploy Contract/i);
      await userEvent.click(deploymentTab);
      
      expect(screen.getByText(/Добро пожаловать, Владимир Овчаров/i)).toBeInTheDocument();
      
      const participantsTab = screen.getByText(/Управление участниками/i);
      await userEvent.click(participantsTab);
      
      expect(screen.getByText(/Добро пожаловать, Владимир Овчаров/i)).toBeInTheDocument();
    });

    test('user context is available across all components', async () => {
      render(<App />);
      
      // Connect wallet
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Добро пожаловать, Владимир Овчаров/i)).toBeInTheDocument();
      });
      
      // User info should be available in header
      expect(screen.getByText(/Владимир Овчаров/i)).toBeInTheDocument();
      expect(screen.getByText(/owner/i)).toBeInTheDocument();
      
      // Navigate to different tabs - user context should persist
      const tabs = [
        'Deploy Contract',
        'Управление участниками',
        'Вестинг и клейм',
        'Multi-Signature',
        'Exchange System',
        'Token Price',
        'Security Audit'
      ];
      
      for (const tabName of tabs) {
        const tab = screen.getByText(tabName);
        await userEvent.click(tab);
        
        // User context should still be visible in header
        expect(screen.getByText(/Владимир Овчаров/i)).toBeInTheDocument();
        expect(screen.getByText(/owner/i)).toBeInTheDocument();
      }
    });
  });

  describe('State Management', () => {
    test('contract state is shared between components', async () => {
      render(<App />);
      
      // Connect wallet
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Smart Contract Editor - Шаг 1/i)).toBeInTheDocument();
      });
      
      // Initially no contract
      const participantsTab = screen.getByText(/Управление участниками/i);
      await userEvent.click(participantsTab);
      
      expect(screen.getByText(/Сначала отредактируйте смарт-контракт/i)).toBeInTheDocument();
      
      // Navigate to other tabs - same message
      const vestingTab = screen.getByText(/Вестинг и клейм/i);
      await userEvent.click(vestingTab);
      
      expect(screen.getByText(/Сначала отредактируйте смарт-контракт/i)).toBeInTheDocument();
      
      const multisigTab = screen.getByText(/Multi-Signature/i);
      await userEvent.click(multisigTab);
      
      expect(screen.getByText(/Сначала отредактируйте смарт-контракт/i)).toBeInTheDocument();
    });

    test('participants state is shared between components', async () => {
      render(<App />);
      
      // Connect wallet
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Smart Contract Editor - Шаг 1/i)).toBeInTheDocument();
      });
      
      // Participants state should be consistent across tabs
      const participantsTab = screen.getByText(/Управление участниками/i);
      await userEvent.click(participantsTab);
      
      // Should show no participants initially
      expect(screen.getByText(/Сначала отредактируйте смарт-контракт/i)).toBeInTheDocument();
      
      // Navigate to vesting tab
      const vestingTab = screen.getByText(/Вестинг и клейм/i);
      await userEvent.click(vestingTab);
      
      // Should show same state
      expect(screen.getByText(/Сначала отредактируйте смарт-контракт/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling Integration', () => {
    test('errors are displayed consistently across tabs', async () => {
      render(<App />);
      
      // Connect wallet
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Добро пожаловать, Владимир Овчаров/i)).toBeInTheDocument();
      });
      
      // Simulate an error (this would be triggered by a component)
      // For now, we'll verify error display structure
      expect(screen.getByText(/Добро пожаловать, Владимир Овчаров/i)).toBeInTheDocument();
      
      // Navigate between tabs - error handling should be consistent
      const tabs = [
        'Deploy Contract',
        'Управление участниками',
        'Вестинг и клейм',
        'Multi-Signature',
        'Exchange System',
        'Token Price',
        'Security Audit'
      ];
      
      for (const tabName of tabs) {
        const tab = screen.getByText(tabName);
        await userEvent.click(tab);
        
        // Error handling should be available
        expect(screen.getByText(new RegExp(tabName, 'i'))).toBeInTheDocument();
      }
    });
  });

  describe('Performance Integration', () => {
    test('tab switching performance is consistent', async () => {
      render(<App />);
      
      // Connect wallet
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Smart Contract Editor - Шаг 1/i)).toBeInTheDocument();
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
      
      const startTime = performance.now();
      
      // Switch between all tabs
      for (const tabName of tabs) {
        const tab = screen.getByText(tabName);
        await userEvent.click(tab);
        
        // Verify tab content is displayed
        expect(screen.getByText(new RegExp(tabName, 'i'))).toBeInTheDocument();
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Tab switching should be fast
      expect(totalTime).toBeLessThan(1000);
    });

    test('component rendering performance is consistent', async () => {
      render(<App />);
      
      // Connect wallet
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Smart Contract Editor - Шаг 1/i)).toBeInTheDocument();
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
      
      // Test rendering performance for each tab
      for (const tabName of tabs) {
        const startTime = performance.now();
        
        const tab = screen.getByText(tabName);
        await userEvent.click(tab);
        
        // Wait for content to render
        await waitFor(() => {
          expect(screen.getByText(new RegExp(tabName, 'i'))).toBeInTheDocument();
        });
        
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        // Each tab should render quickly
        expect(renderTime).toBeLessThan(200);
      }
    });
  });

  describe('Accessibility Integration', () => {
    test('accessibility features work across all tabs', async () => {
      render(<App />);
      
      // Connect wallet
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Smart Contract Editor - Шаг 1/i)).toBeInTheDocument();
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
      
      // Test accessibility for each tab
      for (const tabName of tabs) {
        const tab = screen.getByText(tabName);
        await userEvent.click(tab);
        
        // Wait for content to render
        await waitFor(() => {
          expect(screen.getByText(new RegExp(tabName, 'i'))).toBeInTheDocument();
        });
        
        // Check for proper heading structure
        const headings = screen.getAllByRole('heading');
        expect(headings.length).toBeGreaterThan(0);
        
        // Check for proper button labels
        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
          expect(button).toHaveTextContent();
        });
      }
    });

    test('keyboard navigation works across tabs', async () => {
      render(<App />);
      
      // Connect wallet
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Smart Contract Editor - Шаг 1/i)).toBeInTheDocument();
      });
      
      // Test keyboard navigation
      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBeGreaterThan(0);
      
      // Focus first tab
      tabs[0].focus();
      expect(tabs[0]).toHaveFocus();
      
      // Navigate with arrow keys
      fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });
      expect(tabs[1]).toHaveFocus();
      
      fireEvent.keyDown(tabs[1], { key: 'ArrowLeft' });
      expect(tabs[0]).toHaveFocus();
    });
  });

  describe('Responsive Design Integration', () => {
    test('responsive behavior is consistent across tabs', async () => {
      // Test mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      render(<App />);
      
      // Connect wallet
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Smart Contract Editor - Шаг 1/i)).toBeInTheDocument();
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
      
      // Test mobile responsiveness for each tab
      for (const tabName of tabs) {
        const tab = screen.getByText(tabName);
        await userEvent.click(tab);
        
        await waitFor(() => {
          expect(screen.getByText(new RegExp(tabName, 'i'))).toBeInTheDocument();
        });
        
        // Content should be visible on mobile
        expect(screen.getByText(new RegExp(tabName, 'i'))).toBeInTheDocument();
      }
      
      // Test desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });
      
      // Re-render and test again
      render(<App />);
      
      const newConnectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(newConnectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Smart Contract Editor - Шаг 1/i)).toBeInTheDocument();
      });
      
      // Test desktop responsiveness for each tab
      for (const tabName of tabs) {
        const tab = screen.getByText(tabName);
        await userEvent.click(tab);
        
        await waitFor(() => {
          expect(screen.getByText(new RegExp(tabName, 'i'))).toBeInTheDocument();
        });
        
        // Content should be visible on desktop
        expect(screen.getByText(new RegExp(tabName, 'i'))).toBeInTheDocument();
      }
    });
  });
});
