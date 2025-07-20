import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Trash2, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { gitHubSyncManager } from '@/lib/github-sync-manager';

interface SyncStatus {
  lastSync: string | null;
  isAutoSyncActive: boolean;
  isEnabled: boolean;
  errorCount: number;
}

export default function GitHubSyncFixPage() {
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [envStatus, setEnvStatus] = useState<any>(null);

  const checkStatus = async () => {
    setLoading(true);
    
    try {
      // Get sync manager status
      const status = gitHubSyncManager.getSyncStatus();
      setSyncStatus(status);
      
      // Check environment variables
      const envResponse = await fetch('/api/debug-env');
      const envResult = await envResponse.json();
      setEnvStatus(envResult);
      
    } catch (error) {
      console.error('Failed to check status:', error);
      toast.error('Durum kontrolü başarısız oldu');
    } finally {
      setLoading(false);
    }
  };

  const resetSyncErrors = () => {
    gitHubSyncManager.resetSyncErrors();
    toast.success('GitHub sync hataları sıfırlandı');
    checkStatus();
  };

  const clearSyncData = () => {
    if (typeof window !== 'undefined') {
      // Clear all GitHub sync related localStorage keys
      const keysToRemove = [
        'github_full_sync',
        'github_last_sync',
        'github_sync_lock',
        'github_sync_errors'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      toast.success('GitHub sync verileri temizlendi');
      checkStatus();
    }
  };

  const stopAutoSync = () => {
    gitHubSyncManager.stopAutoSync();
    toast.success('Otomatik sync durduruldu');
    checkStatus();
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const getStatusIcon = (isGood: boolean) => {
    return isGood ? 
      <CheckCircle className="w-5 h-5 text-green-500" /> : 
      <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusBadge = (isGood: boolean, text: string) => {
    return (
      <Badge variant={isGood ? "default" : "destructive"}>
        {text}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">GitHub Sync Döngü Sorunu Çözümü</h1>
          <p className="text-muted-foreground">
            GitHub senkronizasyon döngüsünü tespit edin ve düzeltin
          </p>
        </div>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Hızlı Çözümler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={checkStatus}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Durumu Kontrol Et</span>
            </Button>
            
            <Button
              onClick={resetSyncErrors}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Hataları Sıfırla</span>
            </Button>
            
            <Button
              onClick={clearSyncData}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Sync Verilerini Temizle</span>
            </Button>
            
            <Button
              onClick={stopAutoSync}
              variant="destructive"
              className="flex items-center space-x-2"
            >
              <XCircle className="w-4 h-4" />
              <span>Otomatik Sync'i Durdur</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Display */}
      {syncStatus && (
        <Card>
          <CardHeader>
            <CardTitle>GitHub Sync Durumu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span>Sync Aktif:</span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(syncStatus.isEnabled)}
                  {getStatusBadge(syncStatus.isEnabled, syncStatus.isEnabled ? 'Aktif' : 'Devre Dışı')}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Otomatik Sync:</span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(syncStatus.isAutoSyncActive)}
                  {getStatusBadge(syncStatus.isAutoSyncActive, syncStatus.isAutoSyncActive ? 'Çalışıyor' : 'Durduruldu')}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Hata Sayısı:</span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(syncStatus.errorCount === 0)}
                  <Badge variant={syncStatus.errorCount === 0 ? "default" : "destructive"}>
                    {syncStatus.errorCount}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Son Sync:</span>
                <span className="text-sm text-muted-foreground">
                  {syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleString('tr-TR') : 'Hiç'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Environment Status */}
      {envStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Ortam Değişkenleri Durumu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between">
                <span>GITHUB_TOKEN:</span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(envStatus.GITHUB_TOKEN === 'SET')}
                  {getStatusBadge(envStatus.GITHUB_TOKEN === 'SET', envStatus.GITHUB_TOKEN)}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>GITHUB_OWNER:</span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(envStatus.GITHUB_OWNER === 'SET')}
                  {getStatusBadge(envStatus.GITHUB_OWNER === 'SET', envStatus.GITHUB_OWNER)}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>GITHUB_REPO:</span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(envStatus.GITHUB_REPO === 'SET')}
                  {getStatusBadge(envStatus.GITHUB_REPO === 'SET', envStatus.GITHUB_REPO)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Problem Analysis */}
      {syncStatus && envStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Sorun Analizi ve Öneriler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Environment variables not set */}
            {(envStatus.GITHUB_TOKEN !== 'SET' || envStatus.GITHUB_OWNER !== 'SET' || envStatus.GITHUB_REPO !== 'SET') && (
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  <strong>Ortam Değişkenleri Eksik:</strong> GitHub entegrasyonu için gerekli ortam değişkenleri ayarlanmamış. 
                  Bu durumda GitHub sync otomatik olarak devre dışı bırakılır ve döngü sorunu çözülür.
                </AlertDescription>
              </Alert>
            )}

            {/* Too many errors */}
            {syncStatus.errorCount >= 5 && (
              <Alert>
                <XCircle className="w-4 h-4" />
                <AlertDescription>
                  <strong>Çok Fazla Hata:</strong> GitHub sync {syncStatus.errorCount} hata nedeniyle devre dışı bırakıldı. 
                  "Hataları Sıfırla" butonuna tıklayarak sync'i yeniden etkinleştirebilirsiniz.
                </AlertDescription>
              </Alert>
            )}

            {/* Auto sync running but errors present */}
            {syncStatus.isAutoSyncActive && syncStatus.errorCount > 0 && (
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  <strong>Otomatik Sync Aktif Ancak Hatalar Var:</strong> Otomatik sync çalışıyor ancak hatalar mevcut. 
                  Bu döngü sorununa neden olabilir. "Otomatik Sync'i Durdur" butonunu kullanın.
                </AlertDescription>
              </Alert>
            )}

            {/* All good */}
            {syncStatus.isEnabled && syncStatus.errorCount === 0 && 
             envStatus.GITHUB_TOKEN === 'SET' && envStatus.GITHUB_OWNER === 'SET' && envStatus.GITHUB_REPO === 'SET' && (
              <Alert>
                <CheckCircle className="w-4 h-4" />
                <AlertDescription>
                  <strong>Her Şey Normal:</strong> GitHub sync düzgün çalışıyor ve döngü sorunu yok.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Döngü Sorunu Çözüm Adımları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-3">
            <div className="p-3 bg-muted rounded-md">
              <p className="font-medium mb-2">1. Hızlı Çözüm (Önerilen):</p>
              <p>• "Otomatik Sync'i Durdur" butonuna tıklayın</p>
              <p>• "Sync Verilerini Temizle" butonuna tıklayın</p>
              <p>• Sayfayı yenileyin</p>
            </div>
            
            <div className="p-3 bg-muted rounded-md">
              <p className="font-medium mb-2">2. Ortam Değişkenleri Sorunu:</p>
              <p>• Eğer GitHub ortam değişkenleri eksikse, sistem otomatik olarak sync'i devre dışı bırakır</p>
              <p>• Bu normal bir durumdur ve döngü sorununu çözer</p>
            </div>
            
            <div className="p-3 bg-muted rounded-md">
              <p className="font-medium mb-2">3. Kalıcı Çözüm:</p>
              <p>• GitHub entegrasyonunu tamamen kullanmak istemiyorsanız ortam değişkenlerini ayarlamayın</p>
              <p>• Kullanmak istiyorsanız doğru GitHub Token, Owner ve Repo bilgilerini ayarlayın</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}