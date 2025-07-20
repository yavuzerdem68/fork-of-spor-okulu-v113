import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Trash2, Settings, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { gitHubSyncManager } from '@/lib/github-sync-manager';

export default function DisableGitHubSyncPage() {
  const [disabled, setDisabled] = useState(false);

  const completelyDisableSync = () => {
    if (typeof window !== 'undefined') {
      // Stop any running sync
      gitHubSyncManager.stopAutoSync();
      
      // Clear all GitHub sync related data
      const keysToRemove = [
        'github_full_sync',
        'github_last_sync',
        'github_sync_lock',
        'github_sync_errors',
        'github_init_lock'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Set maximum errors to permanently disable
      localStorage.setItem('github_sync_errors', '999');
      
      // Add a permanent disable flag
      localStorage.setItem('github_sync_permanently_disabled', 'true');
      
      setDisabled(true);
      toast.success('GitHub sync tamamen devre dışı bırakıldı');
    }
  };

  const enableSync = () => {
    if (typeof window !== 'undefined') {
      // Remove disable flag and reset errors
      localStorage.removeItem('github_sync_permanently_disabled');
      localStorage.removeItem('github_sync_errors');
      
      // Reset sync manager
      gitHubSyncManager.resetSyncErrors();
      
      setDisabled(false);
      toast.success('GitHub sync yeniden etkinleştirildi');
    }
  };

  const checkDisabledStatus = () => {
    if (typeof window !== 'undefined') {
      const isDisabled = localStorage.getItem('github_sync_permanently_disabled') === 'true';
      setDisabled(isDisabled);
      return isDisabled;
    }
    return false;
  };

  React.useEffect(() => {
    checkDisabledStatus();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">GitHub Sync'i Tamamen Devre Dışı Bırak</h1>
          <p className="text-muted-foreground">
            GitHub senkronizasyonunu kalıcı olarak devre dışı bırakın
          </p>
        </div>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle>Mevcut Durum</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3">
            {disabled ? (
              <>
                <XCircle className="w-6 h-6 text-red-500" />
                <span className="text-lg font-medium text-red-600">GitHub Sync Devre Dışı</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-6 h-6 text-green-500" />
                <span className="text-lg font-medium text-green-600">GitHub Sync Aktif</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Panel */}
      <Card>
        <CardHeader>
          <CardTitle>İşlemler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!disabled ? (
            <div className="space-y-4">
              <Alert>
                <Settings className="w-4 h-4" />
                <AlertDescription>
                  <strong>Uyarı:</strong> Bu işlem GitHub sync'i tamamen devre dışı bırakacak ve tüm sync verilerini temizleyecektir. 
                  Bu işlem sonrası GitHub'a otomatik veri yedekleme yapılmayacaktır.
                </AlertDescription>
              </Alert>
              
              <Button
                onClick={completelyDisableSync}
                variant="destructive"
                className="flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>GitHub Sync'i Tamamen Devre Dışı Bırak</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="w-4 h-4" />
                <AlertDescription>
                  <strong>GitHub Sync Devre Dışı:</strong> GitHub senkronizasyonu tamamen devre dışı bırakıldı. 
                  Artık hiçbir döngü sorunu yaşanmayacak ve console'da GitHub ile ilgili hata mesajları görünmeyecektir.
                </AlertDescription>
              </Alert>
              
              <Button
                onClick={enableSync}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>GitHub Sync'i Yeniden Etkinleştir</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle>Bilgilendirme</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-3">
            <div className="p-3 bg-muted rounded-md">
              <p className="font-medium mb-2">GitHub Sync Devre Dışı Bırakıldığında:</p>
              <p>• Tüm GitHub sync verileri temizlenir</p>
              <p>• Otomatik sync durdurulur</p>
              <p>• Console'da GitHub hata mesajları görünmez</p>
              <p>• Uygulama tamamen lokal olarak çalışır</p>
              <p>• Performans artabilir</p>
            </div>
            
            <div className="p-3 bg-muted rounded-md">
              <p className="font-medium mb-2">Dikkat Edilmesi Gerekenler:</p>
              <p>• Verileriniz sadece tarayıcınızda saklanacak</p>
              <p>• Tarayıcı verilerini temizlerseniz tüm veriler kaybolur</p>
              <p>• Farklı cihazlar arasında veri senkronizasyonu olmayacak</p>
              <p>• Manuel yedekleme yapmanız önerilir</p>
            </div>
            
            <div className="p-3 bg-muted rounded-md">
              <p className="font-medium mb-2">Yeniden Etkinleştirme:</p>
              <p>• İstediğiniz zaman GitHub sync'i yeniden etkinleştirebilirsiniz</p>
              <p>• Etkinleştirme için GitHub ortam değişkenlerinin ayarlanması gerekir</p>
              <p>• Önceki sync verileri geri yüklenmeyecektir</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}