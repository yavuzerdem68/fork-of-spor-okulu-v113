import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, AlertTriangle, Github, Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { pushToGitHub, autoDeployPush, pushSpecificFiles } from '@/lib/github-push';

interface TestResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export default function GitHubPushTestPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [commitMessage, setCommitMessage] = useState('Test commit from SportsCRM');
  const [testFileContent, setTestFileContent] = useState(`# Test File

Bu dosya GitHub push fonksiyonunu test etmek için oluşturulmuştur.

**Oluşturulma Zamanı:** ${new Date().toLocaleString('tr-TR')}
**Test Türü:** Manual GitHub Push Test

## İçerik
- Türkçe karakter testi: çğıöşüÇĞIÖŞÜ
- Emoji testi: ✅ 🚀 📝 🔧
- Özel karakterler: @#$%^&*()

## Durum
Bu test başarılı olursa, otomatik GitHub push sistemi çalışıyor demektir.
`);

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setResults([]);
  };

  // Test 1: Basit deployment log push
  const testDeploymentLogPush = async () => {
    setLoading(true);
    addResult({
      test: 'Deployment Log Push',
      status: 'success',
      message: 'Testing deployment log push...'
    });

    try {
      const result = await autoDeployPush(commitMessage);
      
      if (result.success) {
        addResult({
          test: 'Deployment Log Push',
          status: 'success',
          message: 'Deployment log successfully pushed to GitHub',
          details: {
            commitSha: result.commitSha,
            commitUrl: result.commitUrl,
            branch: result.branch,
            filesCommitted: result.filesCommitted
          }
        });
      } else {
        addResult({
          test: 'Deployment Log Push',
          status: 'error',
          message: 'Deployment log push failed',
          details: result.error || result.message
        });
      }
    } catch (error) {
      addResult({
        test: 'Deployment Log Push',
        status: 'error',
        message: 'Deployment log push error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setLoading(false);
  };

  // Test 2: Özel dosya push
  const testSpecificFilePush = async () => {
    setLoading(true);
    addResult({
      test: 'Specific File Push',
      status: 'success',
      message: 'Testing specific file push...'
    });

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `test-files/github-push-test-${timestamp}.md`;
      
      const files = {
        [fileName]: testFileContent
      };

      const result = await pushSpecificFiles(files, commitMessage);
      
      if (result.success) {
        addResult({
          test: 'Specific File Push',
          status: 'success',
          message: 'Test file successfully pushed to GitHub',
          details: {
            fileName: fileName,
            commitSha: result.commitSha,
            commitUrl: result.commitUrl,
            branch: result.branch,
            filesCommitted: result.filesCommitted
          }
        });
      } else {
        addResult({
          test: 'Specific File Push',
          status: 'error',
          message: 'Test file push failed',
          details: result.error || result.message
        });
      }
    } catch (error) {
      addResult({
        test: 'Specific File Push',
        status: 'error',
        message: 'Test file push error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setLoading(false);
  };

  // Test 3: Çoklu dosya push
  const testMultipleFilesPush = async () => {
    setLoading(true);
    addResult({
      test: 'Multiple Files Push',
      status: 'success',
      message: 'Testing multiple files push...'
    });

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      const files = {
        [`test-files/multi-test-1-${timestamp}.md`]: `# Test File 1\n\nBu birinci test dosyasıdır.\nZaman: ${new Date().toLocaleString('tr-TR')}`,
        [`test-files/multi-test-2-${timestamp}.md`]: `# Test File 2\n\nBu ikinci test dosyasıdır.\nZaman: ${new Date().toLocaleString('tr-TR')}`,
        [`test-files/multi-test-config-${timestamp}.json`]: JSON.stringify({
          testName: 'Multiple Files Push Test',
          timestamp: new Date().toISOString(),
          files: 3,
          status: 'testing',
          turkishChars: 'çğıöşüÇĞIÖŞÜ'
        }, null, 2)
      };

      const result = await pushSpecificFiles(files, `${commitMessage} - Multiple files test`);
      
      if (result.success) {
        addResult({
          test: 'Multiple Files Push',
          status: 'success',
          message: 'Multiple test files successfully pushed to GitHub',
          details: {
            filesCount: Object.keys(files).length,
            commitSha: result.commitSha,
            commitUrl: result.commitUrl,
            branch: result.branch,
            filesCommitted: result.filesCommitted
          }
        });
      } else {
        addResult({
          test: 'Multiple Files Push',
          status: 'error',
          message: 'Multiple files push failed',
          details: result.error || result.message
        });
      }
    } catch (error) {
      addResult({
        test: 'Multiple Files Push',
        status: 'error',
        message: 'Multiple files push error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setLoading(false);
  };

  // Tüm testleri çalıştır
  const runAllTests = async () => {
    clearResults();
    await testDeploymentLogPush();
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 saniye bekle
    await testSpecificFilePush();
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 saniye bekle
    await testMultipleFilesPush();
    toast.success('Tüm GitHub push testleri tamamlandı');
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
        <Github className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">GitHub Push Test</h1>
          <p className="text-muted-foreground">
            Otomatik GitHub push fonksiyonlarını test edin
          </p>
        </div>
      </div>

      {/* Test Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Test Yapılandırması</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Commit Mesajı</label>
            <Input
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Test commit mesajını girin..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Test Dosyası İçeriği</label>
            <Textarea
              value={testFileContent}
              onChange={(e) => setTestFileContent(e.target.value)}
              rows={8}
              placeholder="Test dosyası içeriğini girin..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Test Kontrolleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={testDeploymentLogPush}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Deployment Log</span>
            </Button>
            
            <Button
              onClick={testSpecificFilePush}
              disabled={loading}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Tek Dosya</span>
            </Button>
            
            <Button
              onClick={testMultipleFilesPush}
              disabled={loading}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Çoklu Dosya</span>
            </Button>
            
            <Button
              onClick={runAllTests}
              disabled={loading}
              variant="default"
              className="flex items-center space-x-2"
            >
              <Github className="w-4 h-4" />
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
            <CardTitle>Test Sonuçları</CardTitle>
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

      {/* Summary */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Özeti</CardTitle>
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
            <span>GitHub Push Testleri Hakkında</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p><strong>Deployment Log:</strong> Otomatik deployment log dosyası oluşturur ve GitHub'a push eder.</p>
            <p><strong>Tek Dosya:</strong> Belirtilen içerikle tek bir test dosyası oluşturur ve push eder.</p>
            <p><strong>Çoklu Dosya:</strong> Birden fazla dosyayı aynı anda push eder (Markdown, JSON formatları).</p>
            <p><strong>Tüm Testler:</strong> Yukarıdaki tüm testleri sırayla çalıştırır.</p>
          </div>
          
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              Bu testler gerçek GitHub repository'nize dosya ekleyecektir. Test dosyaları <code>test-files/</code> ve <code>deployment-logs/</code> klasörlerinde oluşturulacaktır.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}