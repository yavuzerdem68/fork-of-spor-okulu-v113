import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Download,
  Upload,
  Database,
  Shield,
  CheckCircle,
  AlertTriangle,
  FileText,
  Users,
  CreditCard,
  Settings,
  ArrowLeft,
  RefreshCw,
  Copy,
  FileDown,
  FileUp
} from "lucide-react";
import { useRouter } from "next/router";
import Link from "next/link";
import Header from "@/components/Header";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

export default function DataBackup() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [backupData, setBackupData] = useState<any>(null);
  const [backupStats, setBackupStats] = useState({
    students: 0,
    parentUsers: 0,
    accounts: 0,
    settings: 0
  });
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [backupStatus, setBackupStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [restoreStatus, setRestoreStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    
    if (!role || role !== "admin") {
      router.push("/login");
      return;
    }

    setUserRole(role);
    loadBackupStats();
  }, [router]);

  const loadBackupStats = () => {
    try {
      const students = JSON.parse(localStorage.getItem('students') || '[]');
      const parentUsers = JSON.parse(localStorage.getItem('parentUsers') || '[]');
      
      let accountCount = 0;
      let settingsCount = 0;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('account_')) {
          accountCount++;
        }
        if (key?.includes('settings') || key?.includes('config')) {
          settingsCount++;
        }
      }

      setBackupStats({
        students: students.length,
        parentUsers: parentUsers.length,
        accounts: accountCount,
        settings: settingsCount
      });
    } catch (error) {
      console.error('Backup stats loading error:', error);
    }
  };

  const createBackup = async () => {
    setIsBackingUp(true);
    setBackupProgress(0);
    setBackupStatus('idle');
    setStatusMessage('Yedekleme başlatılıyor...');

    try {
      // Step 1: Collect students data
      setBackupProgress(20);
      setStatusMessage('Sporcu verileri toplanıyor...');
      const students = JSON.parse(localStorage.getItem('students') || '[]');
      
      // Step 2: Collect parent users data
      setBackupProgress(40);
      setStatusMessage('Veli hesapları toplanıyor...');
      const parentUsers = JSON.parse(localStorage.getItem('parentUsers') || '[]');
      
      // Step 3: Collect account data
      setBackupProgress(60);
      setStatusMessage('Cari hesap verileri toplanıyor...');
      const accounts: any = {};
      const settings: any = {};
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('account_')) {
          accounts[key] = JSON.parse(localStorage.getItem(key) || '[]');
        }
        if (key?.includes('settings') || key?.includes('config')) {
          settings[key] = localStorage.getItem(key);
        }
      }
      
      // Step 4: Create backup object
      setBackupProgress(80);
      setStatusMessage('Yedek dosyası oluşturuluyor...');
      
      const backup = {
        timestamp: new Date().toISOString(),
        version: 'v1.0',
        source: 'SportsCRM Data Backup Tool',
        stats: {
          students: students.length,
          parentUsers: parentUsers.length,
          accounts: Object.keys(accounts).length,
          settings: Object.keys(settings).length
        },
        data: {
          students,
          parentUsers,
          accounts,
          settings
        }
      };

      setBackupData(backup);
      
      // Step 5: Complete
      setBackupProgress(100);
      setStatusMessage('Yedekleme tamamlandı!');
      setBackupStatus('success');
      
    } catch (error) {
      console.error('Backup creation error:', error);
      setBackupStatus('error');
      setStatusMessage('Yedekleme sırasında hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    } finally {
      setIsBackingUp(false);
    }
  };

  const downloadBackup = () => {
    if (!backupData) return;

    try {
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sportscrm_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      setStatusMessage('Yedek dosyası indirildi!');
    } catch (error) {
      console.error('Download error:', error);
      setStatusMessage('İndirme sırasında hata oluştu!');
    }
  };

  const copyBackupToClipboard = async () => {
    if (!backupData) return;

    try {
      await navigator.clipboard.writeText(JSON.stringify(backupData, null, 2));
      setStatusMessage('Yedek veriler panoya kopyalandı!');
    } catch (error) {
      console.error('Clipboard error:', error);
      setStatusMessage('Panoya kopyalama başarısız!');
    }
  };

  const restoreFromFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e: any) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e: any) {
          try {
            const backupData = JSON.parse(e.target.result);
            restoreData(backupData);
          } catch (error) {
            setRestoreStatus('error');
            setStatusMessage('Yedek dosyası okunamadı: ' + (error instanceof Error ? error.message : 'Geçersiz dosya formatı'));
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const restoreData = async (backupData: any) => {
    setIsRestoring(true);
    setRestoreProgress(0);
    setRestoreStatus('idle');
    setStatusMessage('Geri yükleme başlatılıyor...');

    try {
      // Validate backup data
      if (!backupData.data) {
        throw new Error('Geçersiz yedek dosyası formatı');
      }

      // Step 1: Restore students
      setRestoreProgress(25);
      setStatusMessage('Sporcu verileri geri yükleniyor...');
      if (backupData.data.students) {
        localStorage.setItem('students', JSON.stringify(backupData.data.students));
      }

      // Step 2: Restore parent users
      setRestoreProgress(50);
      setStatusMessage('Veli hesapları geri yükleniyor...');
      if (backupData.data.parentUsers) {
        localStorage.setItem('parentUsers', JSON.stringify(backupData.data.parentUsers));
      }

      // Step 3: Restore accounts
      setRestoreProgress(75);
      setStatusMessage('Cari hesap verileri geri yükleniyor...');
      if (backupData.data.accounts) {
        Object.keys(backupData.data.accounts).forEach(key => {
          localStorage.setItem(key, JSON.stringify(backupData.data.accounts[key]));
        });
      }

      // Step 4: Restore settings
      setRestoreProgress(90);
      setStatusMessage('Sistem ayarları geri yükleniyor...');
      if (backupData.data.settings) {
        Object.keys(backupData.data.settings).forEach(key => {
          localStorage.setItem(key, backupData.data.settings[key]);
        });
      }

      // Step 5: Complete
      setRestoreProgress(100);
      setStatusMessage('Geri yükleme tamamlandı! Sayfa yenileniyor...');
      setRestoreStatus('success');

      // Reload stats and page
      setTimeout(() => {
        loadBackupStats();
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Restore error:', error);
      setRestoreStatus('error');
      setStatusMessage('Geri yükleme sırasında hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    } finally {
      setIsRestoring(false);
    }
  };

  const clearAllData = () => {
    if (confirm('⚠️ TÜM VERİLERİ SİLME UYARISI\n\nBu işlem tüm sporcu kayıtlarını, cari hesap verilerini ve veli hesaplarını kalıcı olarak silecektir.\n\nBu işlem GERİ ALINAMAZ!\n\nDevam etmek istediğinizden emin misiniz?')) {
      if (confirm('Son uyarı! Tüm veriler silinecek. Yedekleme yaptığınızdan emin misiniz?\n\nEVET yazarak onaylayın.')) {
        try {
          // Clear specific data
          localStorage.removeItem('students');
          localStorage.removeItem('parentUsers');
          
          // Clear account data
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('account_')) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
          
          setStatusMessage('Tüm veriler silindi!');
          loadBackupStats();
          
          setTimeout(() => {
            window.location.reload();
          }, 1000);
          
        } catch (error) {
          console.error('Clear data error:', error);
          setStatusMessage('Veri silme sırasında hata oluştu!');
        }
      }
    }
  };

  return (
    <>
      <Head>
        <title>Veri Yedekleme - SportsCRM</title>
        <meta name="description" content="Veri yedekleme ve geri yükleme" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div 
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Link href="/dashboard" className="text-muted-foreground hover:text-primary">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <Database className="w-6 h-6 text-primary" />
                <h1 className="text-3xl font-bold">Veri Yedekleme</h1>
              </div>
              <p className="text-muted-foreground">
                Sistem verilerinizi yedekleyin ve geri yükleyin
              </p>
            </div>
            
            <Button variant="outline" onClick={loadBackupStats}>
              <RefreshCw className="w-4 h-4 mr-2" />
              İstatistikleri Yenile
            </Button>
          </motion.div>

          {/* Current Data Stats */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Sporcu Kayıtları</p>
                    <p className="text-2xl font-bold">{backupStats.students}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Veli Hesapları</p>
                    <p className="text-2xl font-bold">{backupStats.parentUsers}</p>
                  </div>
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cari Hesaplar</p>
                    <p className="text-2xl font-bold">{backupStats.accounts}</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Sistem Ayarları</p>
                    <p className="text-2xl font-bold">{backupStats.settings}</p>
                  </div>
                  <Settings className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Status Message */}
          {statusMessage && (
            <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-6">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{statusMessage}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Backup Section */}
            <motion.div variants={fadeInUp} initial="initial" animate="animate">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Download className="h-5 w-5" />
                    <span>Veri Yedekleme</span>
                  </CardTitle>
                  <CardDescription>
                    Mevcut tüm verilerinizi yedekleyin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isBackingUp && (
                    <div className="space-y-2">
                      <Progress value={backupProgress} className="w-full" />
                      <p className="text-sm text-muted-foreground">{statusMessage}</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Button 
                      onClick={createBackup} 
                      disabled={isBackingUp}
                      className="w-full"
                    >
                      <Database className="h-4 w-4 mr-2" />
                      {isBackingUp ? 'Yedekleniyor...' : 'Yedek Oluştur'}
                    </Button>

                    {backupData && backupStatus === 'success' && (
                      <div className="space-y-2">
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            Yedek başarıyla oluşturuldu! ({backupData.stats.students} sporcu, {backupData.stats.parentUsers} veli hesabı)
                          </AlertDescription>
                        </Alert>
                        
                        <div className="flex space-x-2">
                          <Button onClick={downloadBackup} variant="outline" className="flex-1">
                            <FileDown className="h-4 w-4 mr-2" />
                            JSON İndir
                          </Button>
                          <Button onClick={copyBackupToClipboard} variant="outline" className="flex-1">
                            <Copy className="h-4 w-4 mr-2" />
                            Kopyala
                          </Button>
                        </div>
                      </div>
                    )}

                    {backupStatus === 'error' && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-red-600">
                          {statusMessage}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Yedeklenen Veriler:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Tüm sporcu kayıtları ve bilgileri</li>
                      <li>• Veli hesapları ve giriş bilgileri</li>
                      <li>• Cari hesap hareketleri</li>
                      <li>• Sistem ayarları ve konfigürasyonlar</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Restore Section */}
            <motion.div variants={fadeInUp} initial="initial" animate="animate">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="h-5 w-5" />
                    <span>Veri Geri Yükleme</span>
                  </CardTitle>
                  <CardDescription>
                    Yedek dosyasından verileri geri yükleyin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isRestoring && (
                    <div className="space-y-2">
                      <Progress value={restoreProgress} className="w-full" />
                      <p className="text-sm text-muted-foreground">{statusMessage}</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Button 
                      onClick={restoreFromFile} 
                      disabled={isRestoring}
                      className="w-full"
                      variant="outline"
                    >
                      <FileUp className="h-4 w-4 mr-2" />
                      {isRestoring ? 'Geri Yükleniyor...' : 'Yedek Dosyası Seç'}
                    </Button>

                    {restoreStatus === 'success' && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription className="text-green-600">
                          Veriler başarıyla geri yüklendi! Sayfa yenileniyor...
                        </AlertDescription>
                      </Alert>
                    )}

                    {restoreStatus === 'error' && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-red-600">
                          {statusMessage}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Geri Yükleme Süreci:</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Yedek dosyası doğrulanır</li>
                      <li>• Mevcut veriler üzerine yazılır</li>
                      <li>• Sistem otomatik yenilenir</li>
                      <li>• Tüm veriler geri yüklenir</li>
                    </ul>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Uyarı:</strong> Geri yükleme işlemi mevcut tüm verilerin üzerine yazacaktır. 
                      İşlemden önce mevcut verilerinizi yedeklediğinizden emin olun.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Danger Zone */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mt-8">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Tehlikeli İşlemler</span>
                </CardTitle>
                <CardDescription>
                  Bu işlemler geri alınamaz. Dikkatli kullanın.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={clearAllData}
                  variant="destructive"
                  className="w-full"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Tüm Verileri Sil
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Bu işlem tüm sporcu kayıtlarını, cari hesap verilerini ve veli hesaplarını kalıcı olarak silecektir.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}