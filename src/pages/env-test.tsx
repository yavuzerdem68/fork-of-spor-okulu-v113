import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function EnvTestPage() {
  const [envData, setEnvData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkEnv = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug-env');
      const data = await response.json();
      setEnvData(data);
    } catch (error) {
      console.error('Error checking env:', error);
      setEnvData({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
    setLoading(false);
  };

  useEffect(() => {
    checkEnv();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Test</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Environment Check Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={checkEnv} disabled={loading} className="mb-4">
            {loading ? 'Checking...' : 'Refresh Check'}
          </Button>
          
          {envData && (
            <pre className="bg-muted p-4 rounded text-sm overflow-auto">
              {JSON.stringify(envData, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}