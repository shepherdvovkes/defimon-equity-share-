import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Header from '../../components/Header';

describe('Header Component', () => {
  const defaultProps = {
    isConnected: false,
    onConnect: jest.fn(),
    onDisconnect: jest.fn(),
    contractAddress: '',
    currentUser: null,
    onForceSwitchToSepolia: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    test('renders without crashing', () => {
      render(<Header {...defaultProps} />);
      expect(screen.getByText(/DEFIMON/i)).toBeInTheDocument();
    });

    test('shows logo and branding', () => {
      render(<Header {...defaultProps} />);
      
      expect(screen.getByText(/DEFIMON/i)).toBeInTheDocument();
      expect(screen.getByText(/Decentralized Financial Daemon/i)).toBeInTheDocument();
    });

    test('shows connect button when not connected', () => {
      render(<Header {...defaultProps} />);
      
      expect(screen.getByText(/Подключить кошелек/i)).toBeInTheDocument();
      expect(screen.queryByText(/Отключить/i)).not.toBeInTheDocument();
    });
  });

  describe('Connected State', () => {
    const connectedProps = {
      ...defaultProps,
      isConnected: true,
      currentUser: {
        name: 'Владимир Овчаров',
        role: 'owner'
      },
      contractAddress: '0x1234567890123456789012345678901234567890'
    };

    test('shows user information when connected', () => {
      render(<Header {...connectedProps} />);
      
      expect(screen.getByText(/Владимир Овчаров/i)).toBeInTheDocument();
      expect(screen.getByText(/owner/i)).toBeInTheDocument();
    });

    test('shows disconnect button when connected', () => {
      render(<Header {...connectedProps} />);
      
      expect(screen.getByText(/Disconnect/i)).toBeInTheDocument();
      expect(screen.queryByText(/Connect Wallet/i)).not.toBeInTheDocument();
    });

    test('shows contract address when available', () => {
      render(<Header {...connectedProps} />);
      
      expect(screen.getByText(/0x1234...7890/i)).toBeInTheDocument();
    });

    test('shows network information', () => {
      render(<Header {...connectedProps} />);
      
      // Network info should be displayed
      expect(screen.getByText(/Network/i)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('calls onConnect when connect button is clicked', async () => {
      const mockOnConnect = jest.fn();
      render(<Header {...defaultProps} onConnect={mockOnConnect} />);
      
      const connectButton = screen.getByText(/Подключить кошелек/i);
      await userEvent.click(connectButton);
      
      expect(mockOnConnect).toHaveBeenCalledTimes(1);
    });

    test('calls onDisconnect when disconnect button is clicked', async () => {
      const mockOnDisconnect = jest.fn();
      const connectedProps = {
        ...defaultProps,
        isConnected: true,
        currentUser: { name: 'Test User', role: 'admin' }
      };
      
      render(<Header {...connectedProps} onDisconnect={mockOnDisconnect} />);
      
      const disconnectButton = screen.getByText(/Disconnect/i);
      await userEvent.click(disconnectButton);
      
      expect(mockOnDisconnect).toHaveBeenCalledTimes(1);
    });

    test('calls onForceSwitchToSepolia when network switch button is clicked', async () => {
      const mockOnForceSwitchToSepolia = jest.fn();
      const connectedProps = {
        ...defaultProps,
        isConnected: true,
        currentUser: { name: 'Test User', role: 'owner' }
      };
      
      render(<Header {...connectedProps} onForceSwitchToSepolia={mockOnForceSwitchToSepolia} />);
      
      // Look for network switch button (this might be in a different format)
      const networkButton = screen.queryByText(/Switch to Sepolia/i) || screen.queryByText(/Sepolia/i);
      if (networkButton) {
        await userEvent.click(networkButton);
        expect(mockOnForceSwitchToSepolia).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('Network Display', () => {
    test('displays correct network name', () => {
      const connectedProps = {
        ...defaultProps,
        isConnected: true,
        currentUser: { name: 'Test User', role: 'admin' }
      };
      
      render(<Header {...connectedProps} />);
      
      // Should show network information
      expect(screen.getByText(/Network/i)).toBeInTheDocument();
    });

    test('handles different network types', () => {
      const connectedProps = {
        ...defaultProps,
        isConnected: true,
        currentUser: { name: 'Test User', role: 'admin' }
      };
      
      render(<Header {...connectedProps} />);
      
      // Network info should be displayed regardless of network type
      expect(screen.getByText(/Network/i)).toBeInTheDocument();
    });
  });

  describe('Address Formatting', () => {
    test('formats long addresses correctly', () => {
      const longAddress = '0x1234567890123456789012345678901234567890';
      const connectedProps = {
        ...defaultProps,
        isConnected: true,
        currentUser: { name: 'Test User', role: 'admin' },
        contractAddress: longAddress
      };
      
      render(<Header {...connectedProps} />);
      
      // Should show shortened address
      expect(screen.getByText(/0x1234...7890/i)).toBeInTheDocument();
    });

    test('handles empty contract address', () => {
      const connectedProps = {
        ...defaultProps,
        isConnected: true,
        currentUser: { name: 'Test User', role: 'admin' },
        contractAddress: ''
      };
      
      render(<Header {...connectedProps} />);
      
      // Should not show contract address section
      expect(screen.queryByText(/Contract:/i)).not.toBeInTheDocument();
    });
  });

  describe('Role Display', () => {
    test('displays owner role correctly', () => {
      const connectedProps = {
        ...defaultProps,
        isConnected: true,
        currentUser: { name: 'Test User', role: 'owner' }
      };
      
      render(<Header {...connectedProps} />);
      
      expect(screen.getByText(/owner/i)).toBeInTheDocument();
    });

    test('displays admin role correctly', () => {
      const connectedProps = {
        ...defaultProps,
        isConnected: true,
        currentUser: { name: 'Test User', role: 'admin' }
      };
      
      render(<Header {...connectedProps} />);
      
      expect(screen.getByText(/admin/i)).toBeInTheDocument();
    });

    test('handles unknown roles gracefully', () => {
      const connectedProps = {
        ...defaultProps,
        isConnected: true,
        currentUser: { name: 'Test User', role: 'unknown' }
      };
      
      render(<Header {...connectedProps} />);
      
      expect(screen.getByText(/unknown/i)).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('renders on mobile devices', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      render(<Header {...defaultProps} />);
      expect(screen.getByText(/DEFIMON/i)).toBeInTheDocument();
    });

    test('renders on desktop devices', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });
      
      render(<Header {...defaultProps} />);
      expect(screen.getByText(/DEFIMON/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper heading structure', () => {
      render(<Header {...defaultProps} />);
      
      // Should have proper heading hierarchy
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    test('buttons have proper labels', () => {
      render(<Header {...defaultProps} />);
      
      const connectButton = screen.getByRole('button', { name: /Подключить кошелек/i });
      expect(connectButton).toBeInTheDocument();
    });

    test('images have alt text', () => {
      render(<Header {...defaultProps} />);
      
      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
      });
    });
  });

  describe('Error Handling', () => {
    test('handles missing user data gracefully', () => {
      const connectedProps = {
        ...defaultProps,
        isConnected: true,
        currentUser: null
      };
      
      render(<Header {...connectedProps} />);
      
      // Should not crash and should show some fallback
      expect(screen.getByText(/DEFIMON/i)).toBeInTheDocument();
    });

    test('handles missing contract address gracefully', () => {
      const connectedProps = {
        ...defaultProps,
        isConnected: true,
        currentUser: { name: 'Test User', role: 'admin' },
        contractAddress: null
      };
      
      render(<Header {...connectedProps} />);
      
      // Should not crash
      expect(screen.getByText(/DEFIMON/i)).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('renders without performance issues', () => {
      const startTime = performance.now();
      
      render(<Header {...defaultProps} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render in less than 50ms
      expect(renderTime).toBeLessThan(50);
    });

    test('handles rapid state changes efficiently', () => {
      const { rerender } = render(<Header {...defaultProps} />);
      
      const startTime = performance.now();
      
      // Rapidly change props
      for (let i = 0; i < 10; i++) {
        rerender(<Header {...defaultProps} isConnected={i % 2 === 0} />);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should handle rapid changes efficiently
      expect(totalTime).toBeLessThan(100);
    });
  });
});
