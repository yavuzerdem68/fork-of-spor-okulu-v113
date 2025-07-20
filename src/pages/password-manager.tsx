import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { simplePasswordStorage } from '@/lib/simple-password-storage';
import { simpleAuthManager } from '@/lib/simple-auth';
import { CheckCircle, XCircle, Upload, Download, Users, Clock, Github } from 'lucide-react';

export default function PasswordManager() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<any>(null);

  useEffect(() => {
    // Sadece admin kullanıcıları bu sayfaya erişebilir
    const currentUser = simpleAuthManager.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/login');
      return;
    }

    updatePasswordStatus();
  }, [router]);

  const updatePasswordStatus = () => {
    const status = simplePasswordStorage.getPasswordStatus();
    setPasswordStatus(status);
  };

  const handleSaveToGitHub = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await simplePasswordStorage.savePasswordsToGitHub();
      
      if (result.success) {
        simplePasswordStorage.updateLastSaveTime();
        setMessage({ type: 'success', text: result.message });
        updatePasswordStatus();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Beklenmeyen hata: ${error}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadFromGitHub = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await simplePasswordStorage.loadPasswordsFromGitHub();
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message + ' - Sayfa yenileniyor...' });
        updatePasswordStatus();
        
        // Sayfayı yenile ki yeni şifreler geçerli olsun
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Beklenmeyen hata: ${error}` });
    } finally {
      setIsLoading(false);
    }
  };

  if (!passwordStatus) {
    return <div className="flex items-center justify-center min-h-screen">Yükleniyor...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Şifre Yöneticisi</h1>
        <p className="text-muted-foreground">
          Tüm admin şifrelerinizi GitHub'da güvenle saklayın ve her yerden erişin
        </p>
      </div>

      {message && (
        <Alert className={`mb-6 ${message.type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
          <AlertDescription className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Durum Kartı */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Mevcut Durum
            </CardTitle>
            <CardDescription>
              Yerel ve GitHub şifre durumu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Yerel Kullanıcılar:</span>
              <Badge variant="secondary">{passwordStatus.localUsers} kullanıcı</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>GitHub Bağlantısı:</span>
              {passwordStatus.hasGitHubConfig ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Aktif
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  Pasif
                </Badge>
              )}
            </div>

            {passwordStatus.lastSave && (
              <div className="flex items-center justify-between">
                <span>Son Kaydetme:</span>
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(passwordStatus.lastSave).toLocaleString('tr-TR')}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* İşlemler Kartı */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              GitHub İşlemleri
            </CardTitle>
            <CardDescription>
              Şifrelerinizi GitHub'a kaydedin veya yükleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleSaveToGitHub}
              disabled={isLoading}
              className="w-full"
              variant="default"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isLoading ? 'Kaydediliyor...' : 'GitHub\'a Kaydet'}
            </Button>

            <Button 
              onClick={handleLoadFromGitHub}
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              {isLoading ? 'Yükleniyor...' : 'GitHub\'dan Yükle'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      {/* Kullanım Talimatları */}
      <Card>
        <CardHeader>
          <CardTitle>Nasıl Kullanılır?</CardTitle>
          <CardDescription>
            Basit şifre depolama sistemi kullanım rehberi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">1. Şifreleri Kaydetme</h4>
              <p className="text-sm text-muted-foreground">
                "GitHub'a Kaydet" butonuna tıklayarak mevcut tüm admin şifrelerinizi GitHub'a yedekleyin.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">2. Şifreleri Yükleme</h4>
              <p className="text-sm text-muted-foreground">
                Yeni bir bilgisayardan "GitHub'dan Yükle" butonuna tıklayarak şifrelerinizi geri alın.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">3. Otomatik Senkronizasyon</h4>
              <p className="text-sm text-muted-foreground">
                Karmaşık senkronizasyon yok. Sadece manuel kaydetme ve yükleme.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">4. Güvenlik</h4>
              <p className="text-sm text-muted-foreground">
                Şifreler GitHub private repository'nizde güvenle saklanır.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 text-center">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/dashboard')}
        >
          Ana Sayfaya Dön
        </Button>
      </div>
    </div>
  );
}