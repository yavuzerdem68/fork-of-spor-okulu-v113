import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Github, Settings, Database, Wifi } from 'lucide-react';
import { toast } from 'sonner';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export default function GitHubDiagnosticPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);

  const addResult = (result: DiagnosticResult) => {
    setResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const runDiagnostics = async () => {
    setLoading(true);
    clearResults();

    // Test 1: Environment Variables Check
    addResult({
      test: 'Environment Variables',
      status: 'success',
      message: 'Checking environment variables...'
    });

    try {
      const debugResponse = await fetch('/api/debug-github');
      const debugResult = await debugResponse.json();
      
      if (debugResult.success) {
        const { envCheck, githubApiTest } = debugResult;
        
        if (envCheck.GITHUB_TOKEN && envCheck.GITHUB_OWNER && envCheck.GITHUB_REPO) {
          addResult({
            test: 'Environment Variables',
            status: 'success',
            message: 'All GitHub environment variables are configured',
            details: {
              tokenLength: envCheck.GITHUB_TOKEN_LENGTH,
              owner: envCheck.GITHUB_OWNER_VALUE,
              repo: envCheck.GITHUB_REPO_VALUE,
              environment: debugResult.environment
            }
          });
        } else {
          addResult({
            test: 'Environment Variables',
            status: 'error',
            message: 'Some GitHub environment variables are missing',
            details: envCheck
          });
        }

        // Add GitHub API connectivity test result
        if (githubApiTest) {
          if (githubApiTest.accessible) {
            addResult({
              test: 'GitHub Repository Access',
              status: 'success',
              message: 'Successfully connected to GitHub repository',
              details: githubApiTest
            });
          } else {
            addResult({
              test: 'GitHub Repository Access',
              status: 'error',
              message: 'Failed to access GitHub repository',
              details: githubApiTest
            });
          }
        }
      } else {
        addResult({
          test: 'Environment Variables',
          status: 'error',
          message: 'Failed to check environment variables',
          details: debugResult.error
        });
      }
    } catch (error) {
      addResult({
        test: 'Environment Variables',
        status: 'error',
        message: 'Failed to check environment variables',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 2: GitHub API Connection
    addResult({
      test: 'GitHub API Connection',
      status: 'success',
      message: 'Testing GitHub API connection...'
    });

    try {
      const testData = {
        timestamp: new Date().toISOString(),
        test: 'api-connection',
        source: 'Diagnostic Tool'
      };

      const apiResponse = await fetch('/api/save-to-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataType: 'diagnostic',
          data: testData,
          fileName: `diagnostic-${Date.now()}.json`
        })
      });

      const apiResult = await apiResponse.json();
      
      if (apiResult.success) {
        addResult({
          test: 'GitHub API Connection',
          status: 'success',
          message: 'Successfully connected to GitHub API',
          details: {
            filePath: apiResult.filePath,
            githubUrl: apiResult.githubUrl
          }
        });
      } else {
        addResult({
          test: 'GitHub API Connection',
          status: 'error',
          message: 'GitHub API connection failed',
          details: apiResult.error || apiResult.message
        });
      }
    } catch (error) {
      addResult({
        test: 'GitHub API Connection',
        status: 'error',
        message: 'GitHub API request failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 3: Data Serialization
    addResult({
      test: 'Data Serialization',
      status: 'success',
      message: 'Testing data serialization...'
    });

    try {
      const complexData = {
        studentName: 'Test Öğrenci',
        studentSurname: 'Diagnostic',
        studentTcNo: '12345678901',
        parentName: 'Test Veli',
        sportsBranches: ['Basketbol', 'Futbol'],
        timestamp: new Date().toISOString(),
        specialCharacters: 'çğıöşüÇĞIÖŞÜ',
        numbers: [1, 2, 3, 4, 5],
        nested: {
          level1: {
            level2: 'deep data'
          }
        }
      };

      const serialized = JSON.stringify(complexData, null, 2);
      const base64 = Buffer.from(serialized).toString('base64');
      const decoded = Buffer.from(base64, 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded);

      if (parsed.studentName === complexData.studentName) {
        addResult({
          test: 'Data Serialization',
          status: 'success',
          message: 'Data serialization working correctly'
        });
      } else {
        addResult({
          test: 'Data Serialization',
          status: 'error',
          message: 'Data serialization failed',
          details: 'Data corruption during serialization'
        });
      }
    } catch (error) {
      addResult({
        test: 'Data Serialization',
        status: 'error',
        message: 'Data serialization error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 4: Real Athlete Data Save
    addResult({
      test: 'Real Data Save',
      status: 'success',
      message: 'Testing real athlete data save...'
    });

    try {
      const realAthleteData = {
        id: `diagnostic-${Date.now()}`,
        studentName: 'Diagnostic',
        studentSurname: 'Test Sporcusu',
        studentTcNo: '12345678901',
        studentBirthDate: '2010-01-01',
        studentAge: '14',
        studentGender: 'erkek',
        sportsBranches: ['Basketbol'],
        parentName: 'Test',
        parentSurname: 'Veli',
        parentTcNo: '98765432109',
        parentPhone: '+90555123456',
        parentEmail: 'test@example.com',
        address: 'Test Adresi',
        city: 'İstanbul',
        district: 'Test İlçe',
        status: 'Aktif',
        registrationDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        source: 'Diagnostic Tool'
      };

      const saveResponse = await fetch('/api/save-to-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataType: 'athletes',
          data: realAthleteData,
          fileName: `diagnostic-athlete-${Date.now()}.json`
        })
      });

      const saveResult = await saveResponse.json();
      
      if (saveResult.success) {
        addResult({
          test: 'Real Data Save',
          status: 'success',
          message: 'Real athlete data saved successfully',
          details: {
            filePath: saveResult.filePath,
            githubUrl: saveResult.githubUrl
          }
        });
      } else {
        addResult({
          test: 'Real Data Save',
          status: 'error',
          message: 'Real data save failed',
          details: saveResult.error || saveResult.message
        });
      }
    } catch (error) {
      addResult({
        test: 'Real Data Save',
        status: 'error',
        message: 'Real data save error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 5: Network and CORS
    addResult({
      test: 'Network & CORS',
      status: 'success',
      message: 'Testing network connectivity...'
    });

    try {
      const networkResponse = await fetch('https://api.github.com', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (networkResponse.ok) {
        addResult({
          test: 'Network & CORS',
          status: 'success',
          message: 'Network connectivity to GitHub is working'
        });
      } else {
        addResult({
          test: 'Network & CORS',
          status: 'warning',
          message: 'GitHub API accessible but returned non-200 status',
          details: `Status: ${networkResponse.status}`
        });
      }
    } catch (error) {
      addResult({
        test: 'Network & CORS',
        status: 'error',
        message: 'Network connectivity issue',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setLoading(false);
    toast.success('Diagnostic tests completed');
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
        <Settings className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">GitHub Entegrasyon Tanılaması</h1>
          <p className="text-muted-foreground">
            GitHub veri kaydetme işlevselliğini test edin ve sorunları tespit edin
          </p>
        </div>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Tanılama Kontrolleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button
              onClick={runDiagnostics}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <Database className="w-4 h-4" />
              <span>{loading ? 'Testler Çalışıyor...' : 'Tanılama Testlerini Çalıştır'}</span>
            </Button>
            
            {results.length > 0 && (
              <Button
                onClick={clearResults}
                variant="outline"
                disabled={loading}
              >
                Sonuçları Temizle
              </Button>
            )}
          </div>
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
                      </div>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Özet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {results.filter(r => r.status === 'success').length}
                </div>
                <div className="text-sm text-muted-foreground">Başarılı</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {results.filter(r => r.status === 'warning').length}
                </div>
                <div className="text-sm text-muted-foreground">Uyarı</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {results.filter(r => r.status === 'error').length}
                </div>
                <div className="text-sm text-muted-foreground">Hata</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Tanılama Testleri Hakkında</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p><strong>Environment Variables:</strong> GitHub Token, Owner ve Repo bilgilerinin doğru ayarlanıp ayarlanmadığını kontrol eder.</p>
            <p><strong>GitHub API Connection:</strong> GitHub API'ye bağlanabilme ve dosya oluşturma yeteneğini test eder.</p>
            <p><strong>Data Serialization:</strong> Türkçe karakterler ve karmaşık veri yapılarının doğru işlenip işlenmediğini kontrol eder.</p>
            <p><strong>Real Data Save:</strong> Gerçek sporcu verisi formatında bir test kaydı oluşturur.</p>
            <p><strong>Network & CORS:</strong> Ağ bağlantısı ve CORS ayarlarını kontrol eder.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}