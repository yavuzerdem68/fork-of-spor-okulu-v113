import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  Upload, 
  Download, 
  RefreshCw, 
  User, 
  Shield,
  ArrowLeft,
  FileText,
  Users,
  CreditCard
} from "lucide-react";
import { useRouter } from "next/router";
import { simpleAuthManager } from "@/lib/simple-auth";
import { persistentStorageManager } from "@/lib/persistent-storage";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

export default function DataRecovery() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [backupData, setBackupData] = useState("");
  const [dataStats, setDataStats] = useState({
    athletes: 0,
    payments: 0,
    trainings: 0,
    users: 0
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        await simpleAuthManager.initialize();
        const user = simpleAuthManager.getCurrentUser();
        
        if (!user || user.role !== "admin") {
          router.push("/login");
          return;
        }
        
        setCurrentUser(user);
        loadDataStats();
      } catch (error) {
        console.error('Auth initialization error:', error);
        router.push("/login");
      }
    };

    initAuth();
  }, [router]);

  const loadDataStats = () => {
    const athletes = JSON.parse(localStorage.getItem('students') || '[]');
    const trainings = JSON.parse(localStorage.getItem('trainings') || '[]');
    const users = simpleAuthManager.getAllUsers();
    
    // Count payments across all athletes
    let totalPayments = 0;
    athletes.forEach((athlete: any) => {
      const accountEntries = JSON.parse(localStorage.getItem(`account_${athlete.id}`) || '[]');
      totalPayments += accountEntries.length;
    });

    setDataStats({
      athletes: athletes.length,
      payments: totalPayments,
      trainings: trainings.length,
      users: users.length
    });
  };

  const fixUserAccount = async () => {
    setLoading(true);
    setMessage("");

    try {
      // Get current user from simple auth
      const user = simpleAuthManager.getCurrentUser();
      if (!user) {
        throw new Error("Kullanıcı bulunamadı");
      }

      // Check if the user is the correct one (yavuz@g7spor.org)
      if (user.email !== "yavuz@g7spor.org") {
        // Update the user's email and name to the correct ones
        await simpleAuthManager.updateUser(user.id, {
          email: "yavuz@g7spor.org",
          name: "Yavuz",
          surname: "Admin"
        });

        // Re-initialize to get updated user
        await simpleAuthManager.initialize();
        const updatedUser = simpleAuthManager.getCurrentUser();
        setCurrentUser(updatedUser);

        setMessage("Kullanıcı bilgileri başarıyla düzeltildi! Yavuz Admin olarak giriş yapıyorsunuz.");
        setMessageType("success");
      } else {
        setMessage("Kullanıcı bilgileri zaten doğru görünüyor.");
        setMessageType("info");
      }
    } catch (error: any) {
      setMessage(`Kullanıcı düzeltme hatası: ${error.message}`);
      setMessageType("error");
    }

    setLoading(false);
  };

  const createFullBackup = async () => {
    setLoading(true);
    setMessage("");

    try {
      // Use the persistent storage manager to create backup
      const backupJson = await persistentStorageManager.exportBackup();
      setBackupData(backupJson);

      // Create download
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `spor-okulu-yedek-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage("Tam yedek başarıyla oluşturuldu ve indirildi! Otomatik yedekleme de aktif.");
      setMessageType("success");
    } catch (error: any) {
      setMessage(`Yedekleme hatası: ${error.message}`);
      setMessageType("error");
    }

    setLoading(false);
  };

  const restoreFromBackup = async () => {
    if (!backupData.trim()) {
      setMessage("Lütfen yedek verisini yapıştırın");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Use the persistent storage manager to import backup
      await persistentStorageManager.importBackup(backupData);
      
      // Re-initialize authentication after restore
      await simpleAuthManager.initialize();
      await simpleAuthManager.initializeDefaultUsers();
      
      // Update current user
      const user = simpleAuthManager.getCurrentUser();
      setCurrentUser(user);

      // Reload stats
      loadDataStats();

      const parsedData = JSON.parse(backupData);
      setMessage(`Yedek başarıyla geri yüklendi! ${parsedData.data.students?.length || 0} sporcu, ${Object.keys(parsedData.data.payments || {}).length} ödeme kaydı geri yüklendi. Otomatik yedekleme aktif.`);
      setMessageType("success");
      
      // Clear the backup data field
      setBackupData("");
      
    } catch (error: any) {
      setMessage(`Geri yükleme hatası: ${error.message}`);
      setMessageType("error");
    }

    setLoading(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setBackupData(content);
      setMessage("Yedek dosyası yüklendi. 'Yedekten Geri Yükle' butonuna tıklayın.");
      setMessageType("info");
    };
    reader.readAsText(file);
  };

  const resetToDefaults = async () => {
    if (!confirm("Bu işlem tüm verileri silecek ve varsayılan ayarlara dönecektir. Emin misiniz?")) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Clear all localStorage data
      const keysToKeep = ['theme']; // Keep theme preference
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });

      // Clear auth data and recreate default admin
      simpleAuthManager.clearAllData();
      await simpleAuthManager.createDefaultAdmin();

      // Re-initialize auth
      await simpleAuthManager.initialize();
      const user = simpleAuthManager.getCurrentUser();
      setCurrentUser(user);

      // Reload stats
      loadDataStats();

      setMessage("Sistem başarıyla sıfırlandı! Varsayılan yönetici hesabı (yavuz@g7spor.org / 444125yA/) oluşturuldu.");
      setMessageType("success");
    } catch (error: any) {
      setMessage(`Sıfırlama hatası: ${error.message}`);
      setMessageType("error");
    }

    setLoading(false);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Veri Kurtarma - SportsCRM</title>
        <meta name="description" content="Veri kurtarma ve sistem onarımı" />
      </Head>

      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <motion.div 
            className="mb-8"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <div className="flex items-center space-x-4 mb-4">
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard'a Dön
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Veri Kurtarma ve Sistem Onarımı</h1>
            <p className="text-muted-foreground">
              Kayıp verileri geri yükleyin ve sistem sorunlarını çözün
            </p>
          </motion.div>

          {/* Current Status */}
          <motion.div 
            className="mb-8"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Mevcut Veri Durumu</span>
                </CardTitle>
                <CardDescription>
                  Sistemdeki mevcut veri miktarları
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-accent/50 rounded-lg">
                    <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{dataStats.athletes}</p>
                    <p className="text-sm text-muted-foreground">Sporcu</p>
                  </div>
                  <div className="text-center p-4 bg-accent/50 rounded-lg">
                    <CreditCard className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{dataStats.payments}</p>
                    <p className="text-sm text-muted-foreground">Ödeme Kaydı</p>
                  </div>
                  <div className="text-center p-4 bg-accent/50 rounded-lg">
                    <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{dataStats.trainings}</p>
                    <p className="text-sm text-muted-foreground">Antrenman</p>
                  </div>
                  <div className="text-center p-4 bg-accent/50 rounded-lg">
                    <Shield className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{dataStats.users}</p>
                    <p className="text-sm text-muted-foreground">Kullanıcı</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Current User Info */}
          <motion.div 
            className="mb-8"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Mevcut Kullanıcı Bilgileri</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="font-medium">{currentUser.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Ad Soyad</Label>
                    <p className="font-medium">{currentUser.name} {currentUser.surname}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Rol</Label>
                    <p className="font-medium">{currentUser.role}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button onClick={fixUserAccount} disabled={loading}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Kullanıcı Bilgilerini Düzelt
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Message Display */}
          {message && (
            <motion.div 
              className="mb-8"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
            >
              <Alert variant={messageType === "error" ? "destructive" : "default"}>
                {messageType === "success" ? (
                  <CheckCircle className="h-4 w-4" />
                ) : messageType === "error" ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Backup Section */}
            <motion.div 
              variants={fadeInUp}
              initial="initial"
              animate="animate"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Download className="h-5 w-5" />
                    <span>Veri Yedekleme</span>
                  </CardTitle>
                  <CardDescription>
                    Mevcut tüm verileri yedekleyin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={createFullBackup} disabled={loading} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Tam Yedek Oluştur ve İndir
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Bu işlem tüm sporcular, ödemeler, antrenmanlar ve kullanıcı verilerini içeren 
                    bir JSON dosyası oluşturacak ve bilgisayarınıza indirecektir.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Restore Section */}
            <motion.div 
              variants={fadeInUp}
              initial="initial"
              animate="animate"
            >
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
                  <div>
                    <Label htmlFor="backup-file">Yedek Dosyası Seç</Label>
                    <Input
                      id="backup-file"
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="backup-data">Veya Yedek Verisini Yapıştırın</Label>
                    <Textarea
                      id="backup-data"
                      placeholder="Yedek JSON verisini buraya yapıştırın..."
                      value={backupData}
                      onChange={(e) => setBackupData(e.target.value)}
                      rows={6}
                      className="mt-1"
                    />
                  </div>
                  <Button onClick={restoreFromBackup} disabled={loading || !backupData.trim()} className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Yedekten Geri Yükle
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Emergency Reset */}
          <motion.div 
            className="mt-8"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Acil Durum Sıfırlama</span>
                </CardTitle>
                <CardDescription>
                  Tüm verileri sil ve sistemi varsayılan ayarlara döndür
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Dikkat:</strong> Bu işlem geri alınamaz! Tüm sporcu, ödeme, antrenman ve kullanıcı verileri silinecektir.
                    Sadece varsayılan yönetici hesabı (yavuz@g7spor.org / 444125yA/) kalacaktır.
                  </AlertDescription>
                </Alert>
                <Button 
                  onClick={resetToDefaults} 
                  disabled={loading} 
                  variant="destructive"
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sistemi Tamamen Sıfırla
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Instructions */}
          <motion.div 
            className="mt-8"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <Card>
              <CardHeader>
                <CardTitle>Kullanım Talimatları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Veri Kaybı Durumunda:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Eğer daha önce yedek aldıysanız, "Veri Geri Yükleme" bölümünden yedek dosyanızı seçin</li>
                    <li>Yedek dosyası yoksa, "Acil Durum Sıfırlama" ile temiz bir başlangıç yapabilirsiniz</li>
                    <li>Veriler geri yüklendikten sonra mutlaka yeni bir yedek alın</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Kullanıcı Bilgileri Yanlışsa:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>"Kullanıcı Bilgilerini Düzelt" butonuna tıklayın</li>
                    <li>Bu işlem kullanıcı bilgilerinizi yavuz@g7spor.org olarak düzeltecektir</li>
                    <li>Gerekirse çıkış yapıp tekrar giriş yapın</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Düzenli Yedekleme:</h4>
                  <p className="text-sm text-muted-foreground">
                    Veri kaybını önlemek için haftada bir "Tam Yedek Oluştur" butonunu kullanarak 
                    verilerinizi bilgisayarınıza indirin ve güvenli bir yerde saklayın.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}