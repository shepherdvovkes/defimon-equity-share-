// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock window.ethereum for MetaMask testing
const mockEthereum = {
  isMetaMask: true,
  request: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
  selectedAddress: null,
  networkVersion: '11155111', // Sepolia
  chainId: '0xaa36a7',
  isConnected: () => true,
};

// Mock window.ethereum
Object.defineProperty(window, 'ethereum', {
  value: mockEthereum,
  writable: true,
});

// Mock ethers.js
jest.mock('ethers', () => ({
  ethers: {
    BrowserProvider: jest.fn(() => ({
      getSigner: jest.fn(() => ({
        getAddress: jest.fn(() => Promise.resolve('0x1234567890123456789012345678901234567890')),
        signMessage: jest.fn(() => Promise.resolve('0xsignature')),
      })),
      getNetwork: jest.fn(() => Promise.resolve({ chainId: 11155111n, name: 'Sepolia' })),
    })),
    Contract: jest.fn(() => ({
      // Mock contract methods
      participants: jest.fn(() => Promise.resolve([])),
      isVestingStarted: jest.fn(() => Promise.resolve(false)),
      owner: jest.fn(() => Promise.resolve('0x1234567890123456789012345678901234567890')),
      addParticipant: jest.fn(() => Promise.resolve({ wait: jest.fn() })),
      startVesting: jest.fn(() => Promise.resolve({ wait: jest.fn() })),
      claimTokens: jest.fn(() => Promise.resolve({ wait: jest.fn() })),
    })),
    parseEther: jest.fn((value) => value),
    formatEther: jest.fn((value) => value),
  },
}));

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    post: jest.fn(),
    get: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
  post: jest.fn(),
  get: jest.fn(),
}));

// Mock styled-components
jest.mock('styled-components', () => {
  const styled = (tag) => {
    return (strings, ...args) => {
      return ({ children, ...props }) => {
        const { className, ...restProps } = props;
        // Create a simple component that renders the tag
        const StyledComponent = (componentProps) => {
          const { children: childContent, ...rest } = componentProps;
          const Tag = tag;
          return <Tag className={className} {...restProps} {...rest}>{childContent}</Tag>;
        };
        return <StyledComponent>{children}</StyledComponent>;
      };
    };
  };
  
  // Add all HTML elements
  const elements = ['div', 'button', 'input', 'textarea', 'header', 'h1', 'h2', 'h3', 'h4', 'p', 'span', 'img', 'form', 'label', 'select', 'option', 'ul', 'li', 'table', 'thead', 'tbody', 'tr', 'th', 'td'];
  
  elements.forEach(element => {
    styled[element] = styled(element);
  });
  
  return styled;
});

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaRocket: 'FaRocket',
  FaUsers: 'FaUsers',
  FaChartLine: 'FaChartLine',
  FaSignature: 'FaSignature',
  FaExchangeAlt: 'FaExchangeAlt',
  FaDollarSign: 'FaDollarSign',
  FaCode: 'FaCode',
  FaShieldAlt: 'FaShieldAlt',
  FaCheckCircle: 'FaCheckCircle',
  FaFileAlt: 'FaFileAlt',
  FaTimesCircle: 'FaTimesCircle',
  FaInfoCircle: 'FaInfoCircle',
  FaClock: 'FaClock',
  FaUserPlus: 'FaUserPlus',
  FaTrash: 'FaTrash',
  FaEdit: 'FaEdit',
  FaSave: 'FaSave',
  FaTimes: 'FaTimes',
  FaExclamationTriangle: 'FaExclamationTriangle',
  FaDownload: 'FaDownload',
  FaEye: 'FaEye',
  FaCog: 'FaCog',
  FaPlay: 'FaPlay',
}));

// Mock console methods in tests
global.console = {
  ...console,
  // Uncomment to ignore a specific log level
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-url');

// Mock window.URL.revokeObjectURL
global.URL.revokeObjectURL = jest.fn();

// Mock fetch
global.fetch = jest.fn();

// Setup test environment
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset ethereum mock
  mockEthereum.request.mockClear();
  mockEthereum.on.mockClear();
  mockEthereum.removeListener.mockClear();
  
  // Reset fetch mock
  global.fetch.mockClear();
  
  // Reset URL mocks
  global.URL.createObjectURL.mockClear();
  global.URL.revokeObjectURL.mockClear();
});

// Global test utilities
global.testUtils = {
  mockEthereum,
  createMockContract: (methods = {}) => ({
    participants: jest.fn(() => Promise.resolve([])),
    isVestingStarted: jest.fn(() => Promise.resolve(false)),
    owner: jest.fn(() => Promise.resolve('0x1234567890123456789012345678901234567890')),
    addParticipant: jest.fn(() => Promise.resolve({ wait: jest.fn() })),
    startVesting: jest.fn(() => Promise.resolve({ wait: jest.fn() })),
    claimTokens: jest.fn(() => Promise.resolve({ wait: jest.fn() })),
    ...methods,
  }),
  createMockSigner: () => ({
    getAddress: jest.fn(() => Promise.resolve('0x1234567890123456789012345678901234567890')),
    signMessage: jest.fn(() => Promise.resolve('0xsignature')),
  }),
  createMockProvider: () => ({
    getSigner: jest.fn(() => Promise.resolve(global.testUtils.createMockSigner())),
    getNetwork: jest.fn(() => Promise.resolve({ chainId: 11155111n, name: 'Sepolia' })),
  }),
};
