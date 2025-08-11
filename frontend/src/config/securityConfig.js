// Security Audit Configuration
export const SECURITY_CONFIG = {
  // OpenAI Configuration
  openai: {
    model: 'gpt-4',
    temperature: 0.1,
    maxTokens: 4000,
    timeout: 120000, // 2 minutes
  },

  // Security Check Categories
  vulnerabilityTypes: {
    reentrancy: {
      name: 'Reentrancy Attacks',
      description: 'Check for potential reentrancy vulnerabilities',
      severity: 'Critical',
      examples: [
        'External calls before state changes',
        'Recursive calls to contract functions',
        'Cross-function reentrancy'
      ]
    },
    accessControl: {
      name: 'Access Control Issues',
      description: 'Verify proper access control mechanisms',
      severity: 'High',
      examples: [
        'Missing access modifiers',
        'Incorrect role assignments',
        'Privilege escalation'
      ]
    },
    integerOverflow: {
      name: 'Integer Overflow/Underflow',
      description: 'Check for arithmetic vulnerabilities',
      severity: 'Medium',
      examples: [
        'Unchecked arithmetic operations',
        'Missing SafeMath usage',
        'Boundary condition checks'
      ]
    },
    gasOptimization: {
      name: 'Gas Optimization',
      description: 'Identify gas optimization opportunities',
      severity: 'Low',
      examples: [
        'Inefficient storage patterns',
        'Unnecessary external calls',
        'Loop optimizations'
      ]
    },
    logicFlaws: {
      name: 'Logic Flaws',
      description: 'Analyze business logic for potential exploits',
      severity: 'High',
      examples: [
        'Race conditions',
        'Order dependency',
        'Business rule violations'
      ]
    },
    externalCalls: {
      name: 'External Calls',
      description: 'Review external contract interactions',
      severity: 'Medium',
      examples: [
        'Unsafe external calls',
        'Missing return value checks',
        'Callback function security'
      ]
    }
  },

  // Risk Assessment Levels
  riskLevels: {
    critical: {
      color: '#dc3545',
      description: 'Immediate action required',
      priority: 1
    },
    high: {
      color: '#fd7e14',
      description: 'High priority fix needed',
      priority: 2
    },
    medium: {
      color: '#ffc107',
      description: 'Should be addressed soon',
      priority: 3
    },
    low: {
      color: '#28a745',
      description: 'Low priority improvement',
      priority: 4
    }
  },

  // Security Score Weights
  securityScoreWeights: {
    critical: 10,
    high: 7,
    medium: 4,
    low: 1
  },

  // Audit Templates
  auditTemplates: {
    comprehensive: {
      name: 'Comprehensive Security Audit',
      description: 'Full security analysis covering all vulnerability types',
      duration: '5-10 minutes',
      cost: 'High'
    },
    focused: {
      name: 'Focused Vulnerability Audit',
      description: 'Targeted analysis of specific vulnerability types',
      duration: '2-5 minutes',
      cost: 'Medium'
    },
    quick: {
      name: 'Quick Security Scan',
      description: 'Basic security check for common vulnerabilities',
      duration: '1-2 minutes',
      cost: 'Low'
    }
  },

  // Report Formats
  reportFormats: {
    markdown: {
      extension: 'md',
      mimeType: 'text/markdown',
      description: 'Markdown format for documentation'
    },
    text: {
      extension: 'txt',
      mimeType: 'text/plain',
      description: 'Plain text format'
    },
    json: {
      extension: 'json',
      mimeType: 'application/json',
      description: 'Structured JSON format'
    }
  },

  // Testing Recommendations
  testingCategories: {
    unit: {
      name: 'Unit Tests',
      description: 'Individual function testing',
      priority: 'High'
    },
    integration: {
      name: 'Integration Tests',
      description: 'Contract interaction testing',
      priority: 'High'
    },
    security: {
      name: 'Security Tests',
      description: 'Vulnerability-specific testing',
      priority: 'Critical'
    },
    fuzzing: {
      name: 'Fuzzing Tests',
      description: 'Random input testing',
      priority: 'Medium'
    },
    formal: {
      name: 'Formal Verification',
      description: 'Mathematical proof of correctness',
      priority: 'Low'
    }
  },

  // Gas Optimization Targets
  gasTargets: {
    deployment: {
      target: 2000000, // 2M gas
      warning: 3000000, // 3M gas
      critical: 5000000  // 5M gas
    },
    function: {
      target: 50000,    // 50K gas
      warning: 100000,  // 100K gas
      critical: 200000  // 200K gas
    }
  },

  // Security Best Practices
  bestPractices: [
    'Use OpenZeppelin contracts and libraries',
    'Implement proper access control',
    'Use SafeMath for arithmetic operations',
    'Validate all inputs and parameters',
    'Implement emergency pause functionality',
    'Use events for important state changes',
    'Avoid complex logic in fallback functions',
    'Implement proper error handling',
    'Use reentrancy guards where appropriate',
    'Regular security audits and updates'
  ],

  // Compliance Standards
  complianceStandards: {
    'ERC-20': 'Token standard compliance',
    'ERC-721': 'NFT standard compliance',
    'ERC-1155': 'Multi-token standard compliance',
    'EIP-165': 'Interface detection standard',
    'EIP-1820': 'Pseudo-introspection registry',
    'EIP-2535': 'Diamond proxy pattern'
  }
};

export default SECURITY_CONFIG;
