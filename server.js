const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('frontend/build'));

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Security audit endpoints
app.post('/api/security/audit', async (req, res) => {
  try {
    const { contractCode, contractAddress, network } = req.body;
    
    if (!contractCode) {
      return res.status(400).json({ error: 'Contract code is required' });
    }

    const prompt = `Please perform a comprehensive security audit of the following Solidity smart contract. 

Contract Address: ${contractAddress || 'Not provided'}
Network: ${network || 'Not specified'}

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

Please provide a structured response with:
- Risk assessment (Low/Medium/High/Critical)
- Specific vulnerability descriptions with code examples
- Recommended fixes with code examples
- Overall security score (1-10)
- Compliance with security best practices
- Gas optimization suggestions
- Testing recommendations

Format your response as JSON with the following structure:
{
  "riskAssessment": "string",
  "securityScore": number,
  "vulnerabilities": [
    {
      "severity": "string",
      "title": "string",
      "description": "string",
      "codeExample": "string",
      "recommendation": "string"
    }
  ],
  "analysis": "string",
  "recommendations": "string",
  "gasOptimization": "string",
  "testingRecommendations": "string"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a senior smart contract security auditor with expertise in Solidity, EVM, and DeFi security. Provide detailed, actionable security analysis."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 4000,
    });

    const response = completion.choices[0].message.content;
    
    // Try to parse JSON response, fallback to text if parsing fails
    let auditResults;
    try {
      auditResults = JSON.parse(response);
    } catch (e) {
      // If JSON parsing fails, create a structured response from text
      auditResults = {
        riskAssessment: "Analysis Complete",
        securityScore: 7,
        analysis: response,
        vulnerabilities: [],
        recommendations: "See detailed analysis above",
        gasOptimization: "Review gas usage patterns in the analysis",
        testingRecommendations: "Implement comprehensive testing based on identified risks"
      };
    }

    // Add metadata
    auditResults.timestamp = new Date().toISOString();
    auditResults.contractAddress = contractAddress;
    auditResults.network = network;
    auditResults.auditType = 'comprehensive';

    res.json(auditResults);
  } catch (error) {
    console.error('Security audit error:', error);
    res.status(500).json({ 
      error: 'Security audit failed', 
      details: error.message 
    });
  }
});

app.post('/api/security/focused-audit', async (req, res) => {
  try {
    const { contractCode, vulnerabilityType } = req.body;
    
    if (!contractCode || !vulnerabilityType) {
      return res.status(400).json({ error: 'Contract code and vulnerability type are required' });
    }

    const vulnerabilityDescriptions = {
      'reentrancy': 'reentrancy attacks and recursive call vulnerabilities',
      'access-control': 'access control mechanisms and permission management',
      'integer-overflow': 'integer overflow/underflow and arithmetic vulnerabilities',
      'gas-optimization': 'gas optimization opportunities and efficiency improvements',
      'logic-flaws': 'business logic flaws and potential exploits',
      'external-calls': 'external contract interactions and call safety'
    };

    const prompt = `Focus specifically on ${vulnerabilityDescriptions[vulnerabilityType]} in this Solidity contract:

${contractCode}

Provide detailed analysis of ${vulnerabilityType} risks, specific examples with code snippets, and mitigation strategies.

Format your response as JSON with the following structure:
{
  "vulnerabilityType": "${vulnerabilityType}",
  "riskLevel": "string",
  "findings": [
    {
      "severity": "string",
      "title": "string",
      "description": "string",
      "codeExample": "string",
      "recommendation": "string"
    }
  ],
  "analysis": "string",
  "mitigationStrategies": "string"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a specialized smart contract security auditor focusing on specific vulnerability types. Provide detailed, technical analysis with code examples."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 3000,
    });

    const response = completion.choices[0].message.content;
    
    let auditResults;
    try {
      auditResults = JSON.parse(response);
    } catch (e) {
      auditResults = {
        vulnerabilityType,
        riskLevel: "Analysis Complete",
        findings: [],
        analysis: response,
        mitigationStrategies: "See detailed analysis above"
      };
    }

    auditResults.timestamp = new Date().toISOString();
    auditResults.auditType = 'focused';

    res.json(auditResults);
  } catch (error) {
    console.error('Focused audit error:', error);
    res.status(500).json({ 
      error: 'Focused audit failed', 
      details: error.message 
    });
  }
});

app.post('/api/security/report', async (req, res) => {
  try {
    const { auditResults, format } = req.body;
    
    if (!auditResults) {
      return res.status(400).json({ error: 'Audit results are required' });
    }

    const prompt = `Generate a comprehensive security audit report based on the following results:

${JSON.stringify(auditResults, null, 2)}

Please format the report in ${format === 'markdown' ? 'Markdown' : 'plain text'} format with:
- Executive Summary
- Risk Assessment
- Detailed Findings
- Recommendations
- Action Items
- Appendices`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional security report writer. Create clear, structured, and actionable security audit reports."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 3000,
    });

    const report = completion.choices[0].message.content;
    res.json({ report, format });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ 
      error: 'Report generation failed', 
      details: error.message 
    });
  }
});

app.get('/api/security/vulnerabilities', async (req, res) => {
  try {
    const { contractAddress, network } = req.query;
    
    if (!contractAddress) {
      return res.status(400).json({ error: 'Contract address is required' });
    }

    // This would typically integrate with vulnerability databases
    // For now, we'll use OpenAI to analyze the contract address
    const prompt = `Analyze the contract address ${contractAddress} on ${network || 'Ethereum'} network for known vulnerabilities and security patterns.

Provide information about:
- Common vulnerabilities for this type of contract
- Historical security incidents
- Best practices for this contract pattern
- Recommendations for additional security measures

Format as JSON with:
{
  "contractAddress": "${contractAddress}",
  "network": "${network || 'Ethereum'}",
  "knownVulnerabilities": ["array of vulnerability types"],
  "securityPatterns": "string",
  "recommendations": "string"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a blockchain security researcher with knowledge of known vulnerabilities and security patterns."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 2000,
    });

    const response = completion.choices[0].message.content;
    
    let vulnerabilities;
    try {
      vulnerabilities = JSON.parse(response);
    } catch (e) {
      vulnerabilities = {
        contractAddress,
        network: network || 'Ethereum',
        knownVulnerabilities: [],
        securityPatterns: "Analysis complete",
        recommendations: response
      };
    }

    res.json(vulnerabilities);
  } catch (error) {
    console.error('Vulnerability check error:', error);
    res.status(500).json({ 
      error: 'Vulnerability check failed', 
      details: error.message 
    });
  }
});

app.post('/api/security/test-recommendations', async (req, res) => {
  try {
    const { contractCode } = req.body;
    
    if (!contractCode) {
      return res.status(400).json({ error: 'Contract code is required' });
    }

    const prompt = `Based on this Solidity contract, generate comprehensive testing recommendations:

${contractCode}

Include:
- Unit test scenarios with specific test cases
- Integration test cases
- Security test vectors
- Fuzzing test parameters
- Formal verification suggestions
- Test coverage recommendations
- Specific test functions to implement

Format as a comprehensive testing guide with code examples.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a smart contract testing expert. Provide detailed, actionable testing recommendations with code examples."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 3000,
    });

    const recommendations = completion.choices[0].message.content;
    res.json({ recommendations });
  } catch (error) {
    console.error('Test recommendations error:', error);
    res.status(500).json({ 
      error: 'Test recommendations failed', 
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    openaiConfigured: !!process.env.OPENAI_API_KEY
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Security Audit Server running on port ${PORT}`);
  console.log(`OpenAI API configured: ${!!process.env.OPENAI_API_KEY}`);
});
