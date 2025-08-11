import axios from 'axios';

class SecurityAuditService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    this.openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY;
  }

  /**
   * Perform a comprehensive security audit of the smart contract
   */
  async auditSmartContract(contractCode, contractAddress, network) {
    try {
      const auditPrompt = this.generateAuditPrompt(contractCode, contractAddress, network);
      
      const response = await axios.post('/api/security/audit', {
        prompt: auditPrompt,
        contractCode,
        contractAddress,
        network
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Security audit failed:', error);
      throw new Error('Failed to perform security audit');
    }
  }

  /**
   * Generate a comprehensive audit prompt for OpenAI
   */
  generateAuditPrompt(contractCode, contractAddress, network) {
    return `Please perform a comprehensive security audit of the following Solidity smart contract. 

Contract Address: ${contractAddress}
Network: ${network}

Please analyze the contract for the following security vulnerabilities and provide detailed recommendations:

1. **Reentrancy Attacks**: Check for potential reentrancy vulnerabilities
2. **Access Control Issues**: Verify proper access control mechanisms
3. **Integer Overflow/Underflow**: Check for arithmetic vulnerabilities
4. **Gas Optimization**: Identify gas optimization opportunities
5. **Logic Flaws**: Analyze business logic for potential exploits
6. **External Calls**: Review external contract interactions
7. **State Management**: Check for state consistency issues
8. **Input Validation**: Verify proper input sanitization
9. **Emergency Functions**: Check for pause/emergency mechanisms
10. **Upgradeability**: Assess upgrade patterns if applicable

Contract Code:
${contractCode}

Please provide:
- A risk assessment (Low/Medium/High/Critical)
- Specific vulnerability descriptions
- Code examples of issues found
- Recommended fixes with code examples
- Overall security score (1-10)
- Compliance with security best practices
- Gas optimization suggestions
- Testing recommendations`;
  }

  /**
   * Perform a focused audit on specific vulnerability types
   */
  async focusedAudit(contractCode, vulnerabilityType) {
    const focusedPrompt = `Focus specifically on ${vulnerabilityType} vulnerabilities in this Solidity contract:

${contractCode}

Provide detailed analysis of ${vulnerabilityType} risks, specific examples, and mitigation strategies.`;

    try {
      const response = await axios.post('/api/security/focused-audit', {
        prompt: focusedPrompt,
        vulnerabilityType,
        contractCode
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Focused audit failed:', error);
      throw new Error(`Failed to perform ${vulnerabilityType} audit`);
    }
  }

  /**
   * Generate security report in different formats
   */
  async generateSecurityReport(auditResults, format = 'markdown') {
    try {
      const response = await axios.post('/api/security/report', {
        auditResults,
        format
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Report generation failed:', error);
      throw new Error('Failed to generate security report');
    }
  }

  /**
   * Check contract against known vulnerability databases
   */
  async checkKnownVulnerabilities(contractAddress, network) {
    try {
      const response = await axios.get(`/api/security/vulnerabilities`, {
        params: { contractAddress, network },
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Vulnerability check failed:', error);
      throw new Error('Failed to check known vulnerabilities');
    }
  }

  /**
   * Perform automated security testing recommendations
   */
  async generateTestRecommendations(contractCode) {
    const testPrompt = `Based on this Solidity contract, generate comprehensive testing recommendations:

${contractCode}

Include:
- Unit test scenarios
- Integration test cases
- Security test vectors
- Fuzzing test parameters
- Formal verification suggestions
- Test coverage recommendations`;

    try {
      const response = await axios.post('/api/security/test-recommendations', {
        prompt: testPrompt,
        contractCode
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Test recommendations failed:', error);
      throw new Error('Failed to generate test recommendations');
    }
  }
}

export default SecurityAuditService;
