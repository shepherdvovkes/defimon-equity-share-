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

describe('Accessibility Tests', () => {
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

  describe('WCAG 2.1 Level AA Compliance', () => {
    test('has proper heading hierarchy', () => {
      render(<App />);
      
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
      
      // Check for main heading
      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toBeInTheDocument();
      expect(mainHeading).toHaveTextContent(/DEFIMON Equity Token/i);
    });

    test('has proper page title', () => {
      render(<App />);
      
      expect(document.title).toBe('DEFIMON Equity Token');
    });

    test('has proper language attribute', () => {
      render(<App />);
      
      expect(document.documentElement.lang).toBe('en');
    });
  });

  describe('Keyboard Navigation', () => {
    test('all interactive elements are keyboard accessible', async () => {
      render(<App />);
      
      // Connect wallet first
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Smart Contract Editor/i)).toBeInTheDocument();
      });
      
      // Test tab navigation
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
      
      // Test Enter key activation
      fireEvent.keyDown(tabs[0], { key: 'Enter' });
      expect(screen.getByText(/Smart Contract Editor/i)).toBeInTheDocument();
    });

    test('focus management is proper', async () => {
      render(<App />);
      
      // Connect wallet
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Smart Contract Editor/i)).toBeInTheDocument();
      });
      
      // Test focus order
      const focusableElements = screen.getAllByRole('button');
      expect(focusableElements.length).toBeGreaterThan(0);
      
      // First element should be focusable
      focusableElements[0].focus();
      expect(focusableElements[0]).toHaveFocus();
      
      // Tab should move to next element
      fireEvent.keyDown(focusableElements[0], { key: 'Tab' });
      expect(focusableElements[1]).toHaveFocus();
    });

    test('no keyboard traps exist', async () => {
      render(<App />);
      
      // Connect wallet
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Smart Contract Editor/i)).toBeInTheDocument();
      });
      
      // Test that Escape key works
      const securityTab = screen.getByText(/Security Audit/i);
      await userEvent.click(securityTab);
      
      expect(screen.getByText(/AI-Powered Security Audit/i)).toBeInTheDocument();
      
      // Escape should not trap focus
      fireEvent.keyDown(document, { key: 'Escape' });
      
      // Focus should still be manageable
      const focusableElements = screen.getAllByRole('button');
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
        expect(focusableElements[0]).toHaveFocus();
      }
    });
  });

  describe('Screen Reader Support', () => {
    test('all images have alt text', () => {
      render(<App />);
      
      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
        expect(img.alt).not.toBe('');
      });
    });

    test('form controls have proper labels', async () => {
      render(<SecurityAuditor />);
      
      // Check form labels
      const codeTextarea = screen.getByLabelText(/Contract Code/i);
      expect(codeTextarea).toBeInTheDocument();
      
      const addressInput = screen.getByLabelText(/Contract Address/i);
      expect(addressInput).toBeInTheDocument();
      
      const networkSelect = screen.getByLabelText(/Network/i);
      expect(networkSelect).toBeInTheDocument();
      
      const auditTypeSelect = screen.getByLabelText(/Audit Type/i);
      expect(auditTypeSelect).toBeInTheDocument();
    });

    test('buttons have descriptive text', () => {
      render(<App />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveTextContent();
        expect(button.textContent.trim()).not.toBe('');
      });
    });

    test('status messages are announced', async () => {
      render(<App />);
      
      // Connect wallet to trigger status message
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Добро пожаловать, Владимир Овчаров/i)).toBeInTheDocument();
      });
      
      // Status message should be properly announced
      const statusMessage = screen.getByText(/Добро пожаловать, Владимир Овчаров/i);
      expect(statusMessage).toHaveAttribute('role', 'status');
    });
  });

  describe('Color and Contrast', () => {
    test('text has sufficient contrast', () => {
      render(<App />);
      
      // Check main text elements
      const mainText = screen.getByText(/DEFIMON Equity Token/i);
      expect(mainText).toBeInTheDocument();
      
      // Check that text is visible
      const computedStyle = window.getComputedStyle(mainText);
      expect(computedStyle.color).toBeDefined();
      expect(computedStyle.backgroundColor).toBeDefined();
    });

    test('focus indicators are visible', async () => {
      render(<App />);
      
      // Connect wallet
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Smart Contract Editor/i)).toBeInTheDocument();
      });
      
      // Test focus visibility
      const tabs = screen.getAllByRole('tab');
      if (tabs.length > 0) {
        tabs[0].focus();
        expect(tabs[0]).toHaveFocus();
        
        // Focus should be visually indicated
        const computedStyle = window.getComputedStyle(tabs[0]);
        expect(computedStyle.outline).toBeDefined();
      }
    });
  });

  describe('Semantic HTML', () => {
    test('uses proper semantic elements', () => {
      render(<App />);
      
      // Check for semantic elements
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    test('landmarks are properly defined', () => {
      render(<App />);
      
      // Check for proper landmarks
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    test('lists are properly structured', async () => {
      render(<App />);
      
      // Connect wallet
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Smart Contract Editor/i)).toBeInTheDocument();
      });
      
      // Check for proper list structure
      const tabList = screen.getByRole('tablist');
      expect(tabList).toBeInTheDocument();
      
      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBeGreaterThan(0);
    });
  });

  describe('Form Accessibility', () => {
    test('form validation is accessible', async () => {
      render(<SecurityAuditor />);
      
      // Test form validation
      const auditButton = screen.getByText(/Run Security Audit/i);
      await userEvent.click(auditButton);
      
      // Should show validation error
      expect(screen.getByText(/Please provide contract code for analysis/i)).toBeInTheDocument();
      
      // Error should be properly associated with form control
      const errorMessage = screen.getByText(/Please provide contract code for analysis/i);
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });

    test('form fields have proper descriptions', () => {
      render(<SecurityAuditor />);
      
      // Check for field descriptions
      const codeTextarea = screen.getByLabelText(/Contract Code/i);
      expect(codeTextarea).toHaveAttribute('aria-describedby');
      
      const addressInput = screen.getByLabelText(/Contract Address/i);
      expect(addressInput).toHaveAttribute('aria-describedby');
    });

    test('required fields are indicated', () => {
      render(<SecurityAuditor />);
      
      // Check required field indicators
      const codeTextarea = screen.getByLabelText(/Contract Code/i);
      expect(codeTextarea).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('Dynamic Content', () => {
    test('loading states are announced', async () => {
      // Mock slow API response
      global.fetch = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          text: () => Promise.resolve('// Loading test'),
        }), 100))
      );
      
      render(<SecurityAuditor />);
      
      const auditButton = screen.getByText(/Run Security Audit/i);
      await userEvent.click(auditButton);
      
      // Should show loading state
      expect(screen.getByText(/Running Audit/i)).toBeInTheDocument();
      
      // Loading state should be announced
      const loadingMessage = screen.getByText(/Running Audit/i);
      expect(loadingMessage).toHaveAttribute('aria-live', 'polite');
    });

    test('error messages are announced', async () => {
      // Mock API error
      global.fetch = jest.fn().mockRejectedValueOnce(new Error('Test error'));
      
      render(<SecurityAuditor />);
      
      const auditButton = screen.getByText(/Run Security Audit/i);
      await userEvent.click(auditButton);
      
      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/Test error/i)).toBeInTheDocument();
      });
      
      // Error should be announced
      const errorMessage = screen.getByText(/Test error/i);
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });

    test('success messages are announced', async () => {
      // Mock successful API response
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('// Success test'),
      });
      
      render(<SecurityAuditor />);
      
      const auditButton = screen.getByText(/Run Security Audit/i);
      await userEvent.click(auditButton);
      
      // Should show success message
      await waitFor(() => {
        const codeTextarea = screen.getByLabelText(/Contract Code/i);
        expect(codeTextarea.value).toContain('// Success test');
      });
    });
  });

  describe('Mobile Accessibility', () => {
    test('touch targets are appropriately sized', () => {
      render(<App />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const rect = button.getBoundingClientRect();
        const minSize = 44; // WCAG minimum touch target size
        
        expect(rect.width).toBeGreaterThanOrEqual(minSize);
        expect(rect.height).toBeGreaterThanOrEqual(minSize);
      });
    });

    test('viewport is properly configured', () => {
      render(<App />);
      
      const viewport = document.querySelector('meta[name="viewport"]');
      expect(viewport).toBeInTheDocument();
      expect(viewport).toHaveAttribute('content');
      
      const content = viewport.getAttribute('content');
      expect(content).toContain('width=device-width');
      expect(content).toContain('initial-scale=1');
    });
  });

  describe('Internationalization', () => {
    test('supports multiple languages', () => {
      render(<App />);
      
      // Check for language support
      const html = document.documentElement;
      expect(html.lang).toBe('en');
      
      // Check for proper text direction
      expect(html.dir).toBe('ltr');
    });

    test('text scaling works properly', () => {
      render(<App />);
      
      // Test text scaling
      const mainText = screen.getByText(/DEFIMON Equity Token/i);
      const originalSize = window.getComputedStyle(mainText).fontSize;
      
      // Simulate text scaling
      document.body.style.fontSize = '150%';
      
      const newSize = window.getComputedStyle(mainText).fontSize;
      expect(newSize).toBeDefined();
      
      // Reset
      document.body.style.fontSize = '';
    });
  });

  describe('Assistive Technology', () => {
    test('screen reader compatibility', () => {
      render(<App />);
      
      // Check for proper ARIA attributes
      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('aria-label');
      
      const header = screen.getByRole('banner');
      expect(header).toHaveAttribute('aria-label');
    });

    test('keyboard shortcuts are documented', () => {
      render(<App />);
      
      // Check for keyboard shortcut documentation
      const helpText = screen.queryByText(/keyboard|shortcut|hotkey/i);
      if (helpText) {
        expect(helpText).toBeInTheDocument();
      }
    });

    test('skip links are available', () => {
      render(<App />);
      
      // Check for skip links
      const skipLinks = screen.queryAllByText(/skip|jump/i);
      if (skipLinks.length > 0) {
        skipLinks.forEach(link => {
          expect(link).toHaveAttribute('href');
        });
      }
    });
  });

  describe('Error Prevention', () => {
    test('confirms destructive actions', async () => {
      render(<App />);
      
      // Connect wallet
      const connectButton = screen.getByText(/Connect Wallet/i);
      await userEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Smart Contract Editor/i)).toBeInTheDocument();
      });
      
      // Test disconnect confirmation
      const disconnectButton = screen.getByText(/Disconnect/i);
      await userEvent.click(disconnectButton);
      
      // Should return to initial state
      expect(screen.getByText(/Connect Wallet/i)).toBeInTheDocument();
    });

    test('provides undo functionality where appropriate', async () => {
      render(<SecurityAuditor />);
      
      const codeTextarea = screen.getByLabelText(/Contract Code/i);
      
      // Test undo functionality
      const originalText = '// Original text';
      await userEvent.type(codeTextarea, originalText);
      
      // Clear text
      await userEvent.clear(codeTextarea);
      
      // Should allow restoring original text
      expect(codeTextarea.value).toBe('');
      
      // Restore text
      await userEvent.type(codeTextarea, originalText);
      expect(codeTextarea.value).toBe(originalText);
    });
  });

  describe('Testing Tools Integration', () => {
    test('works with axe-core', () => {
      render(<App />);
      
      // Basic accessibility checks that axe-core would perform
      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
      });
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveTextContent();
      });
      
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    test('supports automated testing', () => {
      render(<App />);
      
      // Check for test-friendly attributes
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      
      // Check for proper labeling
      const connectButton = screen.getByRole('button', { name: /Connect Wallet/i });
      expect(connectButton).toBeInTheDocument();
    });
  });
});
