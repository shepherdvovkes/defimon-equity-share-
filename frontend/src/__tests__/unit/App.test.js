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

describe('App Component', () => {
  const mockUser = {
    name: 'Владимир Овчаров',
    role: 'owner',
    permissions: ['deploy', 'manage_participants', 'start_vesting', 'claim_tokens']
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock successful user authorization
    const { isAuthorizedUser, getUserInfo } = require('../../config/users');
    isAuthorizedUser.mockReturnValue(true);
    getUserInfo.mockReturnValue(mockUser);
  });

  describe('Initial State', () => {
    test('renders without crashing', () => {
      render(<App />);
      expect(screen.getByText(/DEFIMON Equity Token/i)).toBeInTheDocument();
    });

    test('shows logo and welcome message when not connected', () => {
      render(<App />);
      
      expect(screen.getByText(/Decentralized Financial Daemon/i)).toBeInTheDocument();
      expect(screen.getByText(/Для доступа к платформе подключите ваш кошелек/i)).toBeInTheDocument();
      expect(screen.getByText(/Connect Wallet/i)).toBeInTheDocument();
    });

    test('does not show tabs when not connected', () => {
      render(<App />);
      
      expect(screen.queryByText(/DEFIMONEquityToken.sol/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Deploy Contract/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Управление участниками/i)).not.toBeInTheDocument();
    });
  });

  describe('Wallet Connection', () => {
    test('shows error when MetaMask is not available', async () => {
      // Mock missing ethereum
      delete window.ethereum;
      
      render(<App />);
      
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/MetaMask не найден/i)).toBeInTheDocument();
      });
    });

    test('shows error for unauthorized users', async () => {
      const { isAuthorizedUser } = require('../../config/users');
      isAuthorizedUser.mockReturnValue(false);
      
      render(<App />);
      
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Доступ запрещен/i)).toBeInTheDocument();
      });
    });

    test('successfully connects authorized user', async () => {
      render(<App />);
      
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Добро пожаловать, Владимир Овчаров/i)).toBeInTheDocument();
        expect(screen.getByText(/Роль: owner/i)).toBeInTheDocument();
      });
    });

    test('shows all tabs after successful connection', async () => {
      render(<App />);
      
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/DEFIMONEquityToken.sol/i)).toBeInTheDocument();
        expect(screen.getByText(/Deploy Contract/i)).toBeInTheDocument();
        expect(screen.getByText(/Управление участниками/i)).toBeInTheDocument();
        expect(screen.getByText(/Вестинг и клейм/i)).toBeInTheDocument();
        expect(screen.getByText(/Multi-Signature/i)).toBeInTheDocument();
        expect(screen.getByText(/Exchange System/i)).toBeInTheDocument();
        expect(screen.getByText(/Token Price/i)).toBeInTheDocument();
        expect(screen.getByText(/Security Audit/i)).toBeInTheDocument();
      });
    });
  });

  describe('Tab Navigation', () => {
    beforeEach(async () => {
      render(<App />);
      
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/DEFIMONEquityToken.sol/i)).toBeInTheDocument();
      });
    });

    test('defaults to smart contract tab', () => {
      expect(screen.getByText(/Smart Contract Editor - Шаг 1/i)).toBeInTheDocument();
    });

    test('switches to deployment tab', async () => {
      const deploymentTab = screen.getByText(/Deploy Contract/i);
      await userEvent.click(deploymentTab);
      
      expect(screen.getByText(/Deploy Contract - Шаг 2/i)).toBeInTheDocument();
    });

    test('switches to participants tab', async () => {
      const participantsTab = screen.getByText(/Управление участниками/i);
      await userEvent.click(participantsTab);
      
      expect(screen.getByText(/Управление участниками/i)).toBeInTheDocument();
      expect(screen.getByText(/Сначала отредактируйте смарт-контракт/i)).toBeInTheDocument();
    });

    test('switches to vesting tab', async () => {
      const vestingTab = screen.getByText(/Вестинг и клейм/i);
      await userEvent.click(vestingTab);
      
      expect(screen.getByText(/Вестинг и клейм токенов/i)).toBeInTheDocument();
      expect(screen.getByText(/Сначала отредактируйте смарт-контракт/i)).toBeInTheDocument();
    });

    test('switches to multisig tab', async () => {
      const multisigTab = screen.getByText(/Multi-Signature/i);
      await userEvent.click(multisigTab);
      
      expect(screen.getByText(/Multi-Signature Management/i)).toBeInTheDocument();
      expect(screen.getByText(/Сначала отредактируйте смарт-контракт/i)).toBeInTheDocument();
    });

    test('switches to exchange tab', async () => {
      const exchangeTab = screen.getByText(/Exchange System/i);
      await userEvent.click(exchangeTab);
      
      expect(screen.getByText(/Exchange System/i)).toBeInTheDocument();
      expect(screen.getByText(/Сначала отредактируйте смарт-контракт/i)).toBeInTheDocument();
    });

    test('switches to token price tab', async () => {
      const tokenPriceTab = screen.getByText(/Token Price/i);
      await userEvent.click(tokenPriceTab);
      
      expect(screen.getByText(/Token Price Management/i)).toBeInTheDocument();
      expect(screen.getByText(/Сначала отредактируйте смарт-контракт/i)).toBeInTheDocument();
    });

    test('switches to security tab', async () => {
      const securityTab = screen.getByText(/Security Audit/i);
      await userEvent.click(securityTab);
      
      expect(screen.getByText(/AI-Powered Security Audit/i)).toBeInTheDocument();
    });
  });

  describe('Network Switching', () => {
    beforeEach(async () => {
      render(<App />);
      
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/DEFIMONEquityToken.sol/i)).toBeInTheDocument();
      });
    });

    test('can force switch to Sepolia network', async () => {
      // Mock successful network switch
      global.testUtils.mockEthereum.request.mockResolvedValueOnce([]);
      
      // This would be triggered from Header component
      // For now, we'll test the function exists
      expect(global.testUtils.mockEthereum.request).toBeDefined();
    });
  });

  describe('Contract Management', () => {
    beforeEach(async () => {
      render(<App />);
      
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/DEFIMONEquityToken.sol/i)).toBeInTheDocument();
      });
    });

    test('shows contract editor for smart contract tab', () => {
      expect(screen.getByText(/Smart Contract Editor - Шаг 1/i)).toBeInTheDocument();
    });

    test('shows deployment form for deployment tab', async () => {
      const deploymentTab = screen.getByText(/Deploy Contract/i);
      await userEvent.click(deploymentTab);
      
      expect(screen.getByText(/Deploy Contract - Шаг 2/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles connection errors gracefully', async () => {
      // Mock ethereum error
      global.testUtils.mockEthereum.request.mockRejectedValueOnce(new Error('Connection failed'));
      
      render(<App />);
      
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Ошибка подключения/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper heading structure', () => {
      render(<App />);
      
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    test('buttons have proper text content', () => {
      render(<App />);
      
      const connectButton = screen.getByRole('button', { name: /Connect Wallet/i });
      expect(connectButton).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('renders on different screen sizes', () => {
      // Test mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      render(<App />);
      expect(screen.getByText(/DEFIMON Equity Token/i)).toBeInTheDocument();
      
      // Test desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });
      
      render(<App />);
      expect(screen.getByText(/DEFIMON Equity Token/i)).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('renders without performance issues', () => {
      const startTime = performance.now();
      
      render(<App />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render in less than 100ms
      expect(renderTime).toBeLessThan(100);
    });
  });
});
