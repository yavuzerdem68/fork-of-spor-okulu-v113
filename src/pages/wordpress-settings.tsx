import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Settings, Database, Shield } from 'lucide-react';

interface WordPressSettings {
  siteUrl: string;
  username: string;
  password: string;
}

export default function WordPressSettings() {
  const [settings, setSettings] = useState<WordPressSettings>({
    siteUrl: 'https://www.g7spor.org',
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('wordpress-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        setIsSaved(true);
      } catch (error) {
        console.error('Error loading WordPress settings:', error);
      }
    }
  }, []);

  const handleInputChange = (field: keyof WordPressSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setTestResult(null);
  };

  const testConnection = async () => {
    if (!settings.username || !settings.password) {
      setTestResult({
        success: false,
        message: 'Lütfen kullanıcı adı ve şifre girin'
      });
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      const response = await fetch(`${settings.siteUrl}/wp-json/wp/v2/users/me`, {
        headers: {
          'Authorization': `Basic ${btoa(`${settings.username}:${settings.password}`)}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setTestResult({
          success: true,
          message: `Bağlantı başarılı! Hoş geldiniz, ${userData.name}`
        });
      } else {
        setTestResult({
          success: false,
          message: `Bağlantı hatası: ${response.status} ${response.statusText}`
        });
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: `Bağlantı hatası: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = () => {
    try {
      localStorage.setItem('wordpress-settings', JSON.stringify(settings));
      setIsSaved(true);
      setTestResult({
        success: true,
        message: 'Ayarlar başarıyla kaydedildi'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Ayarlar kaydedilirken hata oluştu'
      });
    }
  };

  const clearSettings = () => {
    localStorage.removeItem('wordpress-settings');
    setSettings({
      siteUrl: 'https://www.g7spor.org',
      username: '',
      password: ''
    });
    setIsSaved(false);
    setTestResult(null);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          WordPress Entegrasyonu
        </h1>
        <p className="text-muted-foreground mt-2">
          WordPress sitenizle veri senkronizasyonu için gerekli ayarları yapın
        </p>
      </div>

      <div className="grid gap-6">
        {/* Connection Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Bağlantı Ayarları
            </CardTitle>
            <CardDescription>
              WordPress sitenizin API bilgilerini girin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteUrl">WordPress Site URL</Label>
              <Input
                id="siteUrl"
                type="url"
                value={settings.siteUrl}
                onChange={(e) => handleInputChange('siteUrl', e.target.value)}
                placeholder="https://www.g7spor.org"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Kullanıcı Adı</Label>
              <Input
                id="username"
                type="text"
                value={settings.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="WordPress admin kullanıcı adınız"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Application Password</Label>
              <Input
                id="password"
                type="password"
                value={settings.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="WordPress Application Password"
              />
              <p className="text-sm text-muted-foreground">
                WordPress wp-admin panelinden oluşturduğunuz Application Password'ü girin
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={testConnection} 
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? 'Test Ediliyor...' : 'Bağlantıyı Test Et'}
              </Button>
              <Button onClick={saveSettings} disabled={!settings.username || !settings.password}>
                Ayarları Kaydet
              </Button>
              <Button onClick={clearSettings} variant="destructive" size="sm">
                Temizle
              </Button>
            </div>

            {testResult && (
              <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <div className="flex items-center gap-2">
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={testResult.success ? 'text-green-800' : 'text-red-800'}>
                    {testResult.message}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            {isSaved && (
              <Alert className="border-blue-200 bg-blue-50">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Ayarlar kaydedildi. Artık WordPress ile veri senkronizasyonu aktif.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Kurulum Talimatları
            </CardTitle>
            <CardDescription>
              WordPress sitenizde gerekli ayarları yapmak için bu adımları takip edin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold">1. Application Password Oluşturma</h4>
                <p className="text-sm text-muted-foreground">
                  WordPress wp-admin → Kullanıcılar → Profil → Application Passwords bölümünden 
                  "Spor Okulu CRM" adında yeni bir şifre oluşturun.
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold">2. Gerekli Eklentiler</h4>
                <p className="text-sm text-muted-foreground">
                  WordPress'e şu eklentileri kurun: Custom Post Type UI, Advanced Custom Fields
                </p>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold">3. Custom Post Types</h4>
                <p className="text-sm text-muted-foreground">
                  "spor_athletes" ve "spor_data" adında iki custom post type oluşturun ve 
                  "Show in REST" seçeneğini aktif edin.
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold">4. Güvenlik</h4>
                <p className="text-sm text-muted-foreground">
                  Oluşturulan post type'ların "Public" seçeneğini kapalı tutun. 
                  Veriler sadece API üzerinden erişilebilir olacak.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Information */}
        <Card>
          <CardHeader>
            <CardTitle>Sistem Durumu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className={`text-2xl font-bold ${isSaved ? 'text-green-600' : 'text-gray-400'}`}>
                  {isSaved ? '✓' : '○'}
                </div>
                <p className="text-sm">Ayarlar Kaydedildi</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className={`text-2xl font-bold ${testResult?.success ? 'text-green-600' : 'text-gray-400'}`}>
                  {testResult?.success ? '✓' : '○'}
                </div>
                <p className="text-sm">Bağlantı Test Edildi</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  ⚡
                </div>
                <p className="text-sm">Sistem Hazır</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}