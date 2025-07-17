import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Database,
  AlertTriangle,
  Trash2,
  RefreshCw,
  ArrowLeft,
  Shield,
  HardDrive,
  Users,
  CreditCard,
  FileText,
  Settings,
  History,
  Download,
  Upload
} from "lucide-react";
import { useRouter } from "next/router";
import Link from "next/link";
import Header from "@/components/Header";
import { toast } from "sonner";

interface LocalStorageItem {
  key: string;
  size: number;
  type: 'system' | 'user-data' | 'settings' | 'cache';
  description: string;
  critical: boolean;
  selected: boolean;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

export default function CompleteDataReset() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [localStorageItems, setLocalStorageItems] = useState<LocalStorageItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalSize: 0,
    selectedItems: 0,
    selectedSize: 0
  });

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    
    if (!role || role !== "admin") {
      router.push("/login");
      return;
    }

    setUserRole(role);
    analyzeLocalStorage();
  }, [router]);

  const getItemType = (key: string): 'system' | 'user-data' | 'settings' | 'cache' => {
    if (key.includes('students') || key.includes('payments') || key.startsWith('account_')) {
      return 'user-data';
    }
    if (key.includes('settings') || key.includes('config') || key.includes('wordpress') || key.includes('userRole') || key.includes('currentUser')) {
      return 'system';
    }
    if (key.includes('history') || key.includes('matching') || key.includes('memory') || key.includes('cache')) {
      return 'cache';
    }
    return 'settings';
  };

  const getItemDescription = (key: string): string => {
    const descriptions: { [key: string]: string } = {
      'students': 'Sporcu kayıtları (Ana veri)',
      'payments': 'Ödeme kayıtları',
      'userRole': 'Kullanıcı yetki bilgisi',
      'currentUser': 'Aktif kullanıcı bilgisi',
      'paymentMatchingHistory': 'Ödeme eşleştirme geçmişi',
      'turkishMatchingMemory': 'Türkçe eşleştirme hafızası',
      'wordpress-settings': 'WordPress bağlantı ayarları',
      'theme': 'Tema ayarları',
      'language': 'Dil ayarları'
    };

    // Account entries
    if (key.startsWith('account_')) {
      const athleteId = key.replace('account_', '');
      return `Sporcu cari hesap kayıtları (ID: ${athleteId})`;
    }

    return descriptions[key] || `Bilinmeyen veri: ${key}`;
  };

  const isCriticalItem = (key: string): boolean => {
    return ['userRole', 'currentUser'].includes(key);
  };

  const analyzeLocalStorage = () => {
    setIsAnalyzing(true);
    
    try {
      const items: LocalStorageItem[] = [];
      let totalSize = 0;

      // Get all localStorage keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;

        const value = localStorage.getItem(key) || '';
        const size = new Blob([value]).size;
        totalSize += size;

        const type = getItemType(key);
        const description = getItemDescription(key);
        const critical = isCriticalItem(key);

        items.push({
          key,
          size,
          type,
          description,
          critical,
          selected: !critical // Don't select critical items by default
        });
      }

      // Sort by type and size
      items.sort((a, b) => {
        if (a.type !== b.type) {
          const typeOrder = { 'user-data': 0, 'cache': 1, 'settings': 2, 'system': 3 };
          return typeOrder[a.type] - typeOrder[b.type];
        }
        return b.size - a.size;
      });

      setLocalStorageItems(items);
      
      const selectedItems = items.filter(item => item.selected);
      const selectedSize = selectedItems.reduce((sum, item) => sum + item.size, 0);

      setStats({
        totalItems: items.length,
        totalSize,
        selectedItems: selectedItems.length,
        selectedSize
      });

      toast.success(`${items.length} localStorage öğesi analiz edildi`);
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error("localStorage analizi sırasında hata oluştu");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleItemSelection = (index: number) => {
    const updatedItems = [...localStorageItems];
    updatedItems[index].selected = !updatedItems[index].selected;
    setLocalStorageItems(updatedItems);
    updateStats(updatedItems);
  };

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    const updatedItems = localStorageItems.map(item => ({
      ...item,
      selected: newSelectAll && !item.critical // Don't select critical items even with select all
    }));
    
    setLocalStorageItems(updatedItems);
    updateStats(updatedItems);
  };

  const selectByType = (type: 'system' | 'user-data' | 'settings' | 'cache') => {
    const updatedItems = localStorageItems.map(item => ({
      ...item,
      selected: item.type === type && !item.critical
    }));
    
    setLocalStorageItems(updatedItems);
    updateStats(updatedItems);
    toast.success(`${type} türündeki öğeler seçildi`);
  };

  const updateStats = (items: LocalStorageItem[]) => {
    const selectedItems = items.filter(item => item.selected);
    const selectedSize = selectedItems.reduce((sum, item) => sum + item.size, 0);

    setStats(prev => ({
      ...prev,
      selectedItems: selectedItems.length,
      selectedSize
    }));
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user-data':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'system':
        return <Shield className="h-4 w-4 text-red-600" />;
      case 'settings':
        return <Settings className="h-4 w-4 text-green-600" />;
      case 'cache':
        return <History className="h-4 w-4 text-orange-600" />;
      default:
        return <HardDrive className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'user-data':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Kullanıcı Verisi</Badge>;
      case 'system':
        return <Badge variant="destructive">Sistem</Badge>;
      case 'settings':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Ayarlar</Badge>;
      case 'cache':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Önbellek</Badge>;
      default:
        return <Badge variant="outline">Diğer</Badge>;
    }
  };

  const exportData = () => {
    try {
      const exportData: { [key: string]: any } = {};
      
      localStorageItems.forEach(item => {
        if (item.selected) {
          const value = localStorage.getItem(item.key);
          if (value) {
            try {
              exportData[item.key] = JSON.parse(value);
            } catch {
              exportData[item.key] = value;
            }
          }
        }
      });

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `sportscrm-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      
      toast.success("Veriler başarıyla dışa aktarıldı");
      
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Veri dışa aktarma sırasında hata oluştu");
    }
  };

  const clearSelectedData = () => {
    const selectedItems = localStorageItems.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
      toast.error("Temizlenecek öğe seçilmedi");
      return;
    }

    const criticalSelected = selectedItems.some(item => item.critical);
    
    let confirmMessage = `${selectedItems.length} localStorage öğesini silmek istediğinizden emin misiniz?\n\n`;
    
    if (criticalSelected) {
      confirmMessage += "⚠️ UYARI: Sistem kritik verileri de seçilmiş!\n";
      confirmMessage += "Bu veriler silinirse uygulamaya tekrar giriş yapmanız gerekebilir.\n\n";
    }
    
    confirmMessage += "Bu işlem GERİ ALINAMAZ!\n\n";
    confirmMessage += "Devam etmeden önce önemli verilerinizi yedeklediğinizden emin olun.";

    const confirmed = confirm(confirmMessage);
    
    if (!confirmed) return;

    // Double confirmation for critical data
    if (criticalSelected) {
      const doubleConfirmed = confirm(
        "⚠️ SON UYARI ⚠️\n\n" +
        "Sistem kritik verileri silinecek!\n" +
        "Bu işlemden sonra uygulamaya tekrar giriş yapmanız gerekecek.\n\n" +
        "GERÇEKTEN devam etmek istediğinizden emin misiniz?"
      );
      
      if (!doubleConfirmed) return;
    }

    setIsClearing(true);

    try {
      let clearedCount = 0;
      let clearedSize = 0;

      selectedItems.forEach(item => {
        localStorage.removeItem(item.key);
        clearedCount++;
        clearedSize += item.size;
      });

      // Update the list
      const remainingItems = localStorageItems.filter(item => !item.selected);
      setLocalStorageItems(remainingItems);
      
      setStats({
        totalItems: remainingItems.length,
        totalSize: stats.totalSize - clearedSize,
        selectedItems: 0,
        selectedSize: 0
      });

      toast.success(
        `✅ Temizleme Tamamlandı!\n\n` +
        `🗑️ ${clearedCount} öğe silindi\n` +
        `💾 ${formatSize(clearedSize)} alan boşaltıldı`
      );

      // If critical data was cleared, redirect to login
      if (criticalSelected) {
        setTimeout(() => {
          toast.info("Sistem verileri temizlendi. Giriş sayfasına yönlendiriliyorsunuz...");
          router.push("/login");
        }, 2000);
      }

    } catch (error) {
      console.error('Clear error:', error);
      toast.error("Veri temizleme sırasında hata oluştu");
    } finally {
      setIsClearing(false);
    }
  };

  const quickResetUserData = () => {
    const confirmed = confirm(
      "🚨 HIZLI KULLANICI VERİSİ TEMİZLEME 🚨\n\n" +
      "Bu işlem şunları silecek:\n" +
      "• Tüm sporcu kayıtları\n" +
      "• Tüm ödeme kayıtları\n" +
      "• Tüm cari hesap kayıtları\n" +
      "• Ödeme eşleştirme geçmişi\n\n" +
      "Sistem ayarları ve giriş bilgileri korunacak.\n\n" +
      "Bu işlem GERİ ALINAMAZ!\n" +
      "Devam etmek istediğinizden emin misiniz?"
    );

    if (!confirmed) return;

    setIsClearing(true);

    try {
      const userDataKeys = [
        'students',
        'payments',
        'paymentMatchingHistory',
        'turkishMatchingMemory'
      ];

      // Remove account entries
      const accountKeys = Object.keys(localStorage).filter(key => key.startsWith('account_'));
      
      let clearedCount = 0;
      
      // Clear main user data
      userDataKeys.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          clearedCount++;
        }
      });

      // Clear account entries
      accountKeys.forEach(key => {
        localStorage.removeItem(key);
        clearedCount++;
      });

      toast.success(
        `✅ Kullanıcı Verisi Temizlendi!\n\n` +
        `🗑️ ${clearedCount} öğe silindi\n` +
        `🔄 Sayfa yenileniyor...`
      );

      // Refresh the page to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Quick reset error:', error);
      toast.error("Hızlı temizleme sırasında hata oluştu");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <>
      <Head>
        <title>Komple Veri Sıfırlama - SportsCRM</title>
        <meta name="description" content="LocalStorage verilerini tamamen temizle" />
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
                <Database className="w-6 h-6 text-red-600" />
                <h1 className="text-3xl font-bold">Komple Veri Sıfırlama</h1>
              </div>
              <p className="text-muted-foreground">LocalStorage verilerini seçerek temizleyin</p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={analyzeLocalStorage} 
                disabled={isAnalyzing}
                variant="outline"
              >
                {isAnalyzing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <HardDrive className="h-4 w-4 mr-2" />
                )}
                Yeniden Analiz Et
              </Button>
              
              <Button 
                onClick={quickResetUserData}
                disabled={isClearing}
                variant="destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Hızlı Kullanıcı Verisi Temizle
              </Button>
            </div>
          </motion.div>

          {/* Warning Alert */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-8">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>⚠️ UYARI:</strong> Bu sayfa localStorage verilerini kalıcı olarak siler. 
                İşlem geri alınamaz! Önemli verilerinizi silmeden önce mutlaka yedekleyin.
              </AlertDescription>
            </Alert>
          </motion.div>

          {/* Stats Cards */}
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
                    <p className="text-sm font-medium text-muted-foreground">Toplam Öğe</p>
                    <p className="text-2xl font-bold">{stats.totalItems}</p>
                  </div>
                  <HardDrive className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Toplam Boyut</p>
                    <p className="text-2xl font-bold">{formatSize(stats.totalSize)}</p>
                  </div>
                  <Database className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Seçili Öğe</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.selectedItems}</p>
                  </div>
                  <Trash2 className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Silinecek Boyut</p>
                    <p className="text-2xl font-bold text-red-600">{formatSize(stats.selectedSize)}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Hızlı İşlemler</CardTitle>
                <CardDescription>
                  Yaygın temizleme işlemleri için hızlı butonlar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={toggleSelectAll}
                    disabled={isClearing}
                  >
                    {selectAll ? 'Tümünü Kaldır' : 'Tümünü Seç (Kritik Hariç)'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => selectByType('user-data')}
                    disabled={isClearing}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Kullanıcı Verisi Seç
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => selectByType('cache')}
                    disabled={isClearing}
                  >
                    <History className="h-4 w-4 mr-2" />
                    Önbellek Seç
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => selectByType('settings')}
                    disabled={isClearing}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Ayarlar Seç
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={exportData}
                    disabled={isClearing || stats.selectedItems === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Seçilenleri Dışa Aktar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Data Table */}
          {localStorageItems.length > 0 && (
            <motion.div variants={fadeInUp} initial="initial" animate="animate">
              <Card>
                <CardHeader>
                  <CardTitle>LocalStorage Öğeleri ({localStorageItems.length})</CardTitle>
                  <CardDescription>
                    Temizlemek istediğiniz öğeleri seçin. Kırmızı işaretli öğeler sistem kritik verilerdir.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Seç</TableHead>
                        <TableHead>Anahtar</TableHead>
                        <TableHead>Tür</TableHead>
                        <TableHead>Açıklama</TableHead>
                        <TableHead>Boyut</TableHead>
                        <TableHead>Durum</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {localStorageItems.map((item, index) => (
                        <TableRow key={item.key} className={item.critical ? 'bg-red-50' : ''}>
                          <TableCell>
                            <Checkbox
                              checked={item.selected}
                              onCheckedChange={() => toggleItemSelection(index)}
                              disabled={isClearing}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getTypeIcon(item.type)}
                              <code className="text-sm bg-muted px-2 py-1 rounded">
                                {item.key}
                              </code>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getTypeBadge(item.type)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{item.description}</p>
                              {item.critical && (
                                <p className="text-xs text-red-600 font-medium">
                                  ⚠️ Sistem kritik verisi
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {formatSize(item.size)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {item.selected ? (
                              <Badge variant="destructive">Silinecek</Badge>
                            ) : (
                              <Badge variant="outline">Korunacak</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Action Buttons */}
          {localStorageItems.length > 0 && (
            <motion.div 
              variants={fadeInUp} 
              initial="initial" 
              animate="animate" 
              className="mt-8 flex justify-center"
            >
              <Button
                onClick={clearSelectedData}
                disabled={isClearing || stats.selectedItems === 0}
                variant="destructive"
                size="lg"
              >
                {isClearing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                {stats.selectedItems} Öğeyi Kalıcı Olarak Sil ({formatSize(stats.selectedSize)})
              </Button>
            </motion.div>
          )}

          {/* Instructions */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Kullanım Kılavuzu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <p className="font-medium">Veri Türlerini Anlayın</p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Kullanıcı Verisi:</strong> Sporcu, ödeme kayıtları<br/>
                        <strong>Önbellek:</strong> Eşleştirme geçmişi, geçici veriler<br/>
                        <strong>Ayarlar:</strong> Tema, dil ayarları<br/>
                        <strong>Sistem:</strong> Giriş bilgileri (kritik!)
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <p className="font-medium">Yedekleme Yapın</p>
                      <p className="text-sm text-muted-foreground">
                        Önemli verileri silmeden önce "Seçilenleri Dışa Aktar" ile yedekleyin.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <p className="font-medium">Dikkatli Seçim Yapın</p>
                      <p className="text-sm text-muted-foreground">
                        Sistem kritik verileri (kırmızı arka plan) silinirse tekrar giriş yapmanız gerekir.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}