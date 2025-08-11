import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes timeout for AI analysis
});

// Request interceptor to add auth headers
api.interceptors.request.use((config) => {
  const openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY;
  if (openaiApiKey) {
    config.headers.Authorization = `Bearer ${openaiApiKey}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('OpenAI API key is invalid or expired');
    } else if (error.response?.status === 429) {
      console.error('OpenAI API rate limit exceeded');
    } else if (error.response?.status >= 500) {
      console.error('OpenAI API server error');
    }
    return Promise.reject(error);
  }
);

export const securityApi = {
  /**
   * Perform comprehensive security audit
   */
  async performAudit(contractCode, contractAddress, network) {
    try {
      const response = await api.post('/api/security/audit', {
        contractCode,
        contractAddress,
        network,
        timestamp: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      throw new Error(`Audit failed: ${error.response?.data?.message || error.message}`);
    }
  },

  /**
   * Perform focused vulnerability audit
   */
  async performFocusedAudit(contractCode, vulnerabilityType) {
    try {
      const response = await api.post('/api/security/focused-audit', {
        contractCode,
        vulnerabilityType,
        timestamp: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      throw new Error(`Focused audit failed: ${error.response?.data?.message || error.message}`);
    }
  },

  /**
   * Generate security report
   */
  async generateReport(auditResults, format = 'markdown') {
    try {
      const response = await api.post('/api/security/report', {
        auditResults,
        format,
        timestamp: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      throw new Error(`Report generation failed: ${error.response?.data?.message || error.message}`);
    }
  },

  /**
   * Check known vulnerabilities
   */
  async checkKnownVulnerabilities(contractAddress, network) {
    try {
      const response = await api.get('/api/security/vulnerabilities', {
        params: { contractAddress, network },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Vulnerability check failed: ${error.response?.data?.message || error.message}`);
    }
  },

  /**
   * Generate test recommendations
   */
  async generateTestRecommendations(contractCode) {
    try {
      const response = await api.post('/api/security/test-recommendations', {
        contractCode,
        timestamp: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      throw new Error(`Test recommendations failed: ${error.response?.data?.message || error.message}`);
    }
  },

  /**
   * Get audit history
   */
  async getAuditHistory(limit = 10) {
    try {
      const response = await api.get('/api/security/history', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch audit history: ${error.response?.data?.message || error.message}`);
    }
  },

  /**
   * Save audit results
   */
  async saveAuditResults(auditResults) {
    try {
      const response = await api.post('/api/security/save', {
        ...auditResults,
        timestamp: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to save audit results: ${error.response?.data?.message || error.message}`);
    }
  },
};

export default securityApi;
