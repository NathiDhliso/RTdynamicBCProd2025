import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface HealthData {
  status: string;
  message: string;
  timestamp: string;
}

interface EnvData {
  nodeEnv?: string;
  port?: number;
  frontendUrl?: string;
  awsRegion?: string;
  fromEmail?: string;
  businessEmail?: string;
  sendConfirmation?: string;
  hasAwsAccessKey?: boolean;
  hasAwsSecretKey?: boolean;
  timestamp?: string;
  [key: string]: unknown;
}

interface DebugInfo {
  apiUrl: string;
  healthStatus: 'loading' | 'success' | 'error';
  healthData?: HealthData;
  envStatus: 'loading' | 'success' | 'error';
  envData?: EnvData;
  error?: string;
}

const DebugPanel: React.FC = () => {
  // Sanitize API URL to prevent mixed content errors
  const rawApiUrl =
  import.meta.env.DEV
    ? (import.meta.env.VITE_API_URL || 'http://localhost:3001')
    : (import.meta.env.VITE_API_URL || '');
  const sanitizedApiUrl = (typeof window !== 'undefined' && window.location.protocol === 'https:' && rawApiUrl.startsWith('http://'))
    ? rawApiUrl.replace('http://', 'https://')
    : rawApiUrl;

  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    apiUrl: sanitizedApiUrl,
    healthStatus: 'loading',
    envStatus: 'loading'
  });
  const [isVisible, setIsVisible] = useState(false);

  const testConnectivity = async () => {
    const apiUrl = debugInfo.apiUrl;
    
    // Test contact endpoint (Lambda)
    try {
      setDebugInfo(prev => ({ ...prev, healthStatus: 'loading' }));
      const contactResponse = await fetch(`${apiUrl}/api/contact`, {
        method: 'OPTIONS', // CORS preflight test
        headers: { 'Content-Type': 'application/json' }
      });
      
      const healthData = {
        status: contactResponse.ok ? 'healthy' : 'error',
        message: contactResponse.ok ? 'Lambda contact endpoint accessible' : 'Contact endpoint failed',
        timestamp: new Date().toISOString(),
        statusCode: contactResponse.status
      };
      
      setDebugInfo(prev => ({ 
        ...prev, 
        healthStatus: contactResponse.ok ? 'success' : 'error', 
        healthData 
      }));
    } catch (error) {
      setDebugInfo(prev => ({ 
        ...prev, 
        healthStatus: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }

    // Test questionnaire endpoint (Lambda)
    try {
      setDebugInfo(prev => ({ ...prev, envStatus: 'loading' }));
      const questionnaireResponse = await fetch(`${apiUrl}/api/questionnaire`, {
        method: 'OPTIONS', // CORS preflight test
        headers: { 'Content-Type': 'application/json' }
      });
      
      const envData = {
        backend: 'AWS Lambda + SAM',
        architecture: 'Serverless',
        contactEndpoint: `${apiUrl}/api/contact`,
        questionnaireEndpoint: `${apiUrl}/api/questionnaire`,
        contactStatus: 'Available',
        questionnaireStatus: questionnaireResponse.ok ? 'Available' : 'Error',
        emailService: 'AWS SES',
        timestamp: new Date().toISOString(),
        region: 'us-east-1',
        environment: 'production'
      };
      
      setDebugInfo(prev => ({ 
        ...prev, 
        envStatus: questionnaireResponse.ok ? 'success' : 'error', 
        envData 
      }));
    } catch (error) {
      setDebugInfo(prev => ({ 
        ...prev, 
        envStatus: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors z-50"
      >
        Debug API
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-800">API Debug Panel</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-3 text-sm">
        <div>
          <strong>API URL:</strong>
          <div className="font-mono text-xs bg-gray-100 p-1 rounded mt-1">
            {debugInfo.apiUrl}
          </div>
        </div>
        
        <button
          onClick={testConnectivity}
          className="w-full bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 transition-colors"
        >
          Test Connectivity
        </button>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span>Contact API:</span>
            {debugInfo.healthStatus === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
            {debugInfo.healthStatus === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
            {debugInfo.healthStatus === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
          </div>
          
          <div className="flex items-center gap-2">
            <span>Questionnaire API:</span>
            {debugInfo.envStatus === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
            {debugInfo.envStatus === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
            {debugInfo.envStatus === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
          </div>
        </div>
        
        {debugInfo.error && (
          <div className="text-red-600 text-xs bg-red-50 p-2 rounded">
            <strong>Error:</strong> {debugInfo.error}
          </div>
        )}
        
        {debugInfo.envData && (
          <details className="text-xs">
            <summary className="cursor-pointer font-medium">Lambda Backend Details</summary>
            <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">
              {JSON.stringify(debugInfo.envData, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default DebugPanel;