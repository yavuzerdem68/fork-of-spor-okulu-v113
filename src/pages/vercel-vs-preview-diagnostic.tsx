import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Cloud, Monitor, Users, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface AdminUser {
  email: string;
  password: string;
  plainTextPassword?: string;
  role: string;
  createdAt: string;
  lastLogin?: string;
}

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export default function VercelVsPreviewDiagnosticPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [showPasswords, setShowPasswords] = useState(false);
  const [environment, setEnvironment] = useState<string>('unknown');

  useEffect(() => {
    // Detect environment
    const hostname = window.location.hostname;
    if (hostname.includes('vercel.app')) {
      setEnvironment('vercel');
    } else if (hostname.includes('preview.co.dev')) {
      setEnvironment('preview');
    } else if (hostname.includes('localhost')) {
      setEnvironment('local');
    } else {
      setEnvironment('unknown');
    }

    // Load admin users from localStorage
    loadAdminUsers();
  }, []);

  const loadAdminUsers = () => {
    try {
      const stored = localStorage.getItem('adminUsers');
      if (stored) {
        const users = JSON.parse(stored);
        setAdminUsers(Array.isArray(users) ? users : []);
      } else {
        setAdminUsers([]);
      }
    } catch (error) {
      console.error('Error loading admin users:', error);
      setAdminUsers([]);
    }
  };

  const addResult = (result: DiagnosticResult) => {
    setResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const checkEnvironmentInfo = () => {
    setLoading(true);
    clearResults();

    addResult({
      test: 'Environment Detection',
      status: 'success',
      message: 'Detecting current environment...'
    });

    const hostname = window.location.hostname;
    const url = window.location.href;
    const userAgent = navigator.userAgent;
    const timestamp = new Date().toISOString();

    addResult({
      test: 'Environment Detection',
      status: 'success',
      message: `Environment detected: ${environment}`,
      details: {
        hostname,
        url,
        environment,
        userAgent,
        timestamp,
        localStorage: {
          available: typeof Storage !== 'undefined',
          adminUsersCount: adminUsers.length
        }
      }
    });

    setLoading(false);
  };

  const checkAdminUsers = () => {
    setLoading(true);

    addResult({
      test: 'Admin Users Check',
      status: 'success',
      message: 'Checking admin users in localStorage...'
    });

    try {
      const stored = localStorage.getItem('adminUsers');
      const users = stored ? JSON.parse(stored) : [];
      
      if (users.length === 0) {
        addResult({
          test: 'Admin Users Check',
          status: 'warning',
          message: 'No admin users found in localStorage',
          details: {
            adminUsersExists: false,
            count: 0,
            rawData: stored
          }
        });
      } else {
        addResult({
          test: 'Admin Users Check',
          status: 'success',
          message: `Found ${users.length} admin user(s) in localStorage`,
          details: {
            adminUsersExists: true,
            count: users.length,
            users: users.map((user: AdminUser) => ({
              email: user.email,
              role: user.role,
              createdAt: user.createdAt,
              hasPlainTextPassword: !!user.plainTextPassword,
              passwordLength: user.password?.length || 0
            }))
          }
        });
      }

      setAdminUsers(users);
    } catch (error) {
      addResult({
        test: 'Admin Users Check',
        status: 'error',
        message: 'Error checking admin users',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setLoading(false);
  };

  const checkPasswordFormats = () => {
    setLoading(true);

    addResult({
      test: 'Password Format Analysis',
      status: 'success',
      message: 'Analyzing password formats...'
    });

    try {
      const stored = localStorage.getItem('adminUsers');
      const users = stored ? JSON.parse(stored) : [];
      
      if (users.length === 0) {
        addResult({
          test: 'Password Format Analysis',
          status: 'warning',
          message: 'No admin users to analyze',
          details: { reason: 'No users found' }
        });
      } else {
        const analysis = users.map((user: AdminUser) => {
          const hashedPassword = user.password || '';
          const plainTextPassword = user.plainTextPassword || '';
          
          return {
            email: user.email,
            hashedPasswordLength: hashedPassword.length,
            hashedPasswordFormat: hashedPassword.startsWith('$2') ? 'bcrypt' : 'unknown',
            hasPlainTextPassword: !!plainTextPassword,
            plainTextPasswordLength: plainTextPassword.length,
            createdAt: user.createdAt,
            isDefaultAdmin: user.email === 'admin@sportscr.com'
          };
        });

        addResult({
          test: 'Password Format Analysis',
          status: 'success',
          message: 'Password format analysis completed',
          details: {
            totalUsers: users.length,
            analysis
          }
        });
      }
    } catch (error) {
      addResult({
        test: 'Password Format Analysis',
        status: 'error',
        message: 'Error analyzing password formats',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setLoading(false);
  };

  const compareWithVercel = () => {
    setLoading(true);

    addResult({
      test: 'Vercel vs Preview Comparison',
      status: 'success',
      message: 'Comparing current environment with expected behavior...'
    });

    const currentEnv = environment;
    const expectedBehavior = {
      vercel: {
        description: 'Production Vercel deployment',
        expectedAdminPassword: 'Complex hashed password from previous deployment',
        expectedBehavior: 'Should show complex password until updated'
      },
      preview: {
        description: 'Preview.co.dev deployment',
        expectedAdminPassword: 'Simple password from latest code changes',
        expectedBehavior: 'Should show simple password from updated login system'
      },
      local: {
        description: 'Local development environment',
        expectedAdminPassword: 'Depends on local localStorage state',
        expectedBehavior: 'Varies based on local data'
      }
    };

    const current = expectedBehavior[currentEnv as keyof typeof expectedBehavior] || expectedBehavior.local;

    addResult({
      test: 'Vercel vs Preview Comparison',
      status: currentEnv === 'preview' ? 'success' : 'warning',
      message: `Current environment: ${currentEnv}`,
      details: {
        currentEnvironment: currentEnv,
        ...current,
        adminUsersInStorage: adminUsers.length,
        recommendation: currentEnv === 'vercel' 
          ? 'Vercel deployment needs to be updated with latest code changes'
          : currentEnv === 'preview'
          ? 'Preview environment should have latest changes'
          : 'Local environment state varies'
      }
    });

    setLoading(false);
  };

  const runAllDiagnostics = async () => {
    checkEnvironmentInfo();
    await new Promise(resolve => setTimeout(resolve, 500));
    checkAdminUsers();
    await new Promise(resolve => setTimeout(resolve, 500));
    checkPasswordFormats();
    await new Promise(resolve => setTimeout(resolve, 500));
    compareWithVercel();
    toast.success('All diagnostics completed');
  };

  const createDefaultAdmin = () => {
    const defaultAdmin: AdminUser = {
      email: 'admin@sportscr.com',
      password: '$2b$10$rGHQqHqHqHqHqHqHqHqHqOeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK', // Hashed version of 'admin123'
      plainTextPassword: 'admin123',
      role: 'admin',
      createdAt: new Date().toISOString()
    };

    const updatedUsers = [defaultAdmin];
    localStorage.setItem('adminUsers', JSON.stringify(updatedUsers));
    setAdminUsers(updatedUsers);
    loadAdminUsers();
    
    toast.success('Default admin user created with simple password');
  };

  const clearAllAdminUsers = () => {
    localStorage.removeItem('adminUsers');
    setAdminUsers([]);
    toast.success('All admin users cleared');
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

  const getEnvironmentIcon = () => {
    switch (environment) {
      case 'vercel':
        return <Cloud className="w-5 h-5 text-blue-500" />;
      case 'preview':
        return <Monitor className="w-5 h-5 text-green-500" />;
      case 'local':
        return <Monitor className="w-5 h-5 text-gray-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        {getEnvironmentIcon()}
        <div>
          <h1 className="text-3xl font-bold">Vercel vs Preview Diagnostic</h1>
          <p className="text-muted-foreground">
            Vercel ve Preview ortamları arasındaki farkları analiz edin
          </p>
        </div>
      </div>

      {/* Environment Status */}
      <Alert>
        <div className="flex items-center space-x-2">
          {getEnvironmentIcon()}
          <AlertDescription>
            <strong>Mevcut Ortam:</strong> {environment.toUpperCase()} 
            {environment === 'vercel' && ' (Production Deployment)'}
            {environment === 'preview' && ' (Preview Deployment)'}
            {environment === 'local' && ' (Local Development)'}
          </AlertDescription>
        </div>
      </Alert>

      {/* Current Admin Users */}
      {adminUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Mevcut Admin Kullanıcıları</span>
              <Button
                onClick={() => setShowPasswords(!showPasswords)}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showPasswords ? 'Şifreleri Gizle' : 'Şifreleri Göster'}</span>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {adminUsers.map((user, index) => (
                <div key={index} className="p-3 border rounded-md">
                  <div className="grid md:grid-cols-2 gap-2 text-sm">
                    <div><strong>Email:</strong> {user.email}</div>
                    <div><strong>Role:</strong> {user.role}</div>
                    <div><strong>Created:</strong> {new Date(user.createdAt).toLocaleString('tr-TR')}</div>
                    <div><strong>Password Type:</strong> {user.plainTextPassword ? 'Simple' : 'Complex'}</div>
                    {showPasswords && (
                      <>
                        <div className="md:col-span-2">
                          <strong>Actual Password:</strong> 
                          <code className="ml-2 p-1 bg-muted rounded">
                            {user.plainTextPassword || 'Not available'}
                          </code>
                        </div>
                        <div className="md:col-span-2">
                          <strong>Hashed Password:</strong> 
                          <code className="ml-2 p-1 bg-muted rounded text-xs">
                            {user.password?.substring(0, 50)}...
                          </code>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diagnostic Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Tanılama Kontrolleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={checkEnvironmentInfo}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <Monitor className="w-4 h-4" />
              <span>Ortam Bilgisi</span>
            </Button>
            
            <Button
              onClick={checkAdminUsers}
              disabled={loading}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>Admin Kullanıcılar</span>
            </Button>
            
            <Button
              onClick={checkPasswordFormats}
              disabled={loading}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>Şifre Analizi</span>
            </Button>
            
            <Button
              onClick={runAllDiagnostics}
              disabled={loading}
              variant="default"
              className="flex items-center space-x-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{loading ? 'Çalışıyor...' : 'Tüm Testler'}</span>
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <Button
              onClick={createDefaultAdmin}
              variant="secondary"
              className="flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>Basit Admin Oluştur</span>
            </Button>
            
            <Button
              onClick={clearAllAdminUsers}
              variant="destructive"
              className="flex items-center space-x-2"
            >
              <XCircle className="w-4 h-4" />
              <span>Tüm Adminleri Temizle</span>
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
                      </div>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>Vercel vs Preview Farkı Açıklaması</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-3">
            <p><strong>Sorun:</strong> Yeni preview ortamında admin şifresi basit görünüyor, ancak Vercel deployment'ında hala karmaşık şifre var.</p>
            
            <p><strong>Sebep:</strong> Her deployment ortamının kendi localStorage'ı var:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>Preview.co.dev:</strong> Yeni kod değişiklikleri ile temiz localStorage</li>
              <li><strong>Vercel.app:</strong> Eski deployment'dan kalan localStorage verisi</li>
              <li><strong>Local:</strong> Geliştirme ortamındaki localStorage</li>
            </ul>
            
            <p><strong>Çözüm:</strong> Vercel deployment'ını güncellemek için:</p>
            <ol className="list-decimal list-inside ml-4 space-y-1">
              <li>GitHub repository'ye kod değişikliklerini push edin</li>
              <li>Vercel otomatik olarak yeni deployment yapacak</li>
              <li>Yeni deployment'da localStorage temizlenecek ve yeni admin sistemi çalışacak</li>
            </ol>
          </div>
          
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <strong>Not:</strong> Her deployment ortamının localStorage'ı bağımsızdır. 
              Kod değişiklikleri tüm ortamlarda aynı olsa bile, localStorage verileri farklı olabilir.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}