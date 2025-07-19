import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, AlertTriangle, Github, Key, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export default function GitHubTokenFixPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [newToken, setNewToken] = useState('');

  const addResult = (result: DiagnosticResult) => {
    setResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const checkCurrentGitHubConfig = async () => {
    setLoading(true);
    clearResults();

    addResult({
      test: 'GitHub Configuration Check',
      status: 'success',
      message: 'Checking current GitHub configuration...'
    });

    try {
      const debugResponse = await fetch('/api/debug-github');
      const debugResult = await debugResponse.json();
      
      if (debugResult.success) {
        const { envCheck, githubApiTest } = debugResult;
        
        addResult({
          test: 'Environment Variables',
          status: envCheck.GITHUB_TOKEN && envCheck.GITHUB_OWNER && envCheck.GITHUB_REPO ? 'success' : 'error',
          message: envCheck.GITHUB_TOKEN && envCheck.GITHUB_OWNER && envCheck.GITHUB_REPO 
            ? 'All GitHub environment variables are configured' 
            : 'Some GitHub environment variables are missing',
          details: {
            tokenExists: envCheck.GITHUB_TOKEN,
            tokenLength: envCheck.GITHUB_TOKEN_LENGTH,
            owner: envCheck.GITHUB_OWNER_VALUE,
            repo: envCheck.GITHUB_REPO_VALUE,
            environment: debugResult.environment
          }
        });

        if (githubApiTest) {
          addResult({
            test: 'GitHub API Access',
            status: githubApiTest.accessible ? 'success' : 'error',
            message: githubApiTest.accessible 
              ? 'GitHub API is accessible' 
              : 'GitHub API access failed',
            details: githubApiTest
          });
        }
      } else {
        addResult({
          test: 'GitHub Configuration Check',
          status: 'error',
          message: 'Failed to check GitHub configuration',
          details: debugResult.error
        });
      }
    } catch (error) {
      addResult({
        test: 'GitHub Configuration Check',
        status: 'error',
        message: 'Failed to check GitHub configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setLoading(false);
  };

  const testGitHubPush = async () => {
    setLoading(true);
    
    addResult({
      test: 'GitHub Push Test',
      status: 'success',
      message: 'Testing GitHub push functionality...'
    });

    try {
      const testResponse = await fetch('/api/push-to-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commitMessage: 'Test commit from GitHub Token Fix page',
          branch: 'main'
        })
      });

      const testResult = await testResponse.json();
      
      if (testResult.success) {
        addResult({
          test: 'GitHub Push Test',
          status: 'success',
          message: 'GitHub push test successful',
          details: {
            commitSha: testResult.commitSha,
            commitUrl: testResult.commitUrl,
            branch: testResult.branch
          }
        });
      } else {
        addResult({
          test: 'GitHub Push Test',
          status: 'error',
          message: 'GitHub push test failed',
          details: testResult.error || testResult.message
        });
      }
    } catch (error) {
      addResult({
        test: 'GitHub Push Test',
        status: 'error',
        message: 'GitHub push test error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setLoading(false);
  };

  const runAllDiagnostics = async () => {
    await checkCurrentGitHubConfig();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testGitHubPush();
    toast.success('GitHub diagnostics completed');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Key className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">GitHub Token Düzeltme</h1>
          <p className="text-muted-foreground">
            GitHub token sorunlarını tespit edin ve çözün
          </p>
        </div>
      </div>

      {/* Current Status */}
      <Alert>
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>
          <strong>Mevcut Durum:</strong> API loglarında "Bad credentials" hatası görünüyor. 
          Bu GitHub token'ın geçersiz veya yanlış yapılandırıldığını gösteriyor.
        </AlertDescription>
      </Alert>

      {/* Diagnostic Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Tanılama Kontrolleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button
              onClick={checkCurrentGitHubConfig}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Mevcut Yapılandırma</span>
            </Button>
            
            <Button
              onClick={testGitHubPush}
              disabled={loading}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Github className="w-4 h-4" />
              <span>Push Testi</span>
            </Button>
            
            <Button
              onClick={runAllDiagnostics}
              disabled={loading}
              variant="default"
              className="flex items-center space-x-2"
            >
              <Key className="w-4 h-4" />
              <span>{loading ? 'Çalışıyor...' : 'Tüm Testler'}</span>
            </Button>
          </div>
          
          {results.length > 0 && (
            <div className="mt-4">
              <Button
                onClick={clearResults}
                variant="ghost"
                disabled={loading}
              >
                Sonuçları Temizle
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tanılama Sonuçları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.map((result, index) => (
              <Alert key={index} variant={getStatusColor(result.status) as any}>
                <div className="flex items-start space-x-3">
                  {getStatusIcon(result.status)}
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusColor(result.status) as any}>
                        {result.test}
                      </Badge>
                    </div>
                    
                    <AlertDescription>
                      {result.message}
                    </AlertDescription>
                    
                    {result.details && (
                      <div className="mt-2 p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium mb-1">Detaylar:</p>
                        <pre className="text-xs overflow-x-auto">
                          {typeof result.details === 'string' 
                            ? result.details 
                            : JSON.stringify(result.details, null, 2)
                          }
                        </pre>
                        
                        {result.details.commitUrl && (
                          <div className="mt-2">
                            <a 
                              href={result.details.commitUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm underline"
                            >
                              GitHub'da Commit'i Görüntüle →
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* GitHub Token Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Github className="w-5 h-5" />
            <span>GitHub Token Nasıl Oluşturulur</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-3">
            <p><strong>1. GitHub'a Giriş Yapın:</strong> github.com adresine gidin ve hesabınıza giriş yapın.</p>
            
            <p><strong>2. Settings'e Gidin:</strong> Sağ üst köşedeki profil fotoğrafınıza tıklayın ve "Settings" seçin.</p>
            
            <p><strong>3. Developer Settings:</strong> Sol menüden "Developer settings" seçin.</p>
            
            <p><strong>4. Personal Access Tokens:</strong> "Personal access tokens" → "Tokens (classic)" seçin.</p>
            
            <p><strong>5. Generate New Token:</strong> "Generate new token" → "Generate new token (classic)" seçin.</p>
            
            <p><strong>6. Token Ayarları:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>Note:</strong> "SportsCRM Auto Deploy" gibi açıklayıcı bir isim verin</li>
              <li><strong>Expiration:</strong> "No expiration" seçin (veya uzun bir süre)</li>
              <li><strong>Scopes:</strong> Şu izinleri seçin:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>✅ <code>repo</code> (Full control of private repositories)</li>
                  <li>✅ <code>workflow</code> (Update GitHub Action workflows)</li>
                </ul>
              </li>
            </ul>
            
            <p><strong>7. Token'ı Kopyalayın:</strong> Oluşturulan token'ı güvenli bir yere kopyalayın (bir daha göremezsiniz!).</p>
            
            <p><strong>8. Environment Variable Olarak Ayarlayın:</strong> Token'ı <code>GITHUB_TOKEN</code> environment variable'ı olarak ayarlayın.</p>
          </div>
          
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <strong>Önemli:</strong> GitHub token'ı oluşturduktan sonra bir daha göremezsiniz. 
              Mutlaka güvenli bir yere kaydedin ve environment variable olarak ayarlayın.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Environment Variables Info */}
      <Card>
        <CardHeader>
          <CardTitle>Gerekli Environment Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium mb-2">Şu environment variables'ların ayarlanması gerekiyor:</p>
              <ul className="text-sm space-y-1">
                <li><code>GITHUB_TOKEN</code> - GitHub Personal Access Token</li>
                <li><code>GITHUB_OWNER</code> - GitHub kullanıcı adınız veya organizasyon adı</li>
                <li><code>GITHUB_REPO</code> - Repository adı</li>
              </ul>
            </div>
            
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                Bu environment variables'lar hem local development hem de production deployment için ayarlanmalıdır.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}