import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Database,
  AlertTriangle,
  CheckCircle,
  Trash2,
  RefreshCw,
  Users,
  ArrowLeft,
  Eye,
  Merge
} from "lucide-react";
import { useRouter } from "next/router";
import Link from "next/link";
import Header from "@/components/Header";
import { toast } from "sonner";

interface DuplicateGroup {
  key: string;
  athletes: any[];
  reason: string;
  severity: 'high' | 'medium' | 'low';
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

export default function DataCleanup() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({
    totalAthletes: 0,
    duplicateGroups: 0,
    affectedRecords: 0,
    cleanRecords: 0
  });

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    
    if (!role || role !== "admin") {
      router.push("/login");
      return;
    }

    setUserRole(role);
    loadData();
  }, [router]);

  const loadData = () => {
    const storedAthletes = JSON.parse(localStorage.getItem('students') || '[]');
    setAthletes(storedAthletes);
    
    setStats({
      totalAthletes: storedAthletes.length,
      duplicateGroups: 0,
      affectedRecords: 0,
      cleanRecords: storedAthletes.length
    });
  };

  const analyzeDuplicates = () => {
    setIsAnalyzing(true);
    
    try {
      const duplicates: DuplicateGroup[] = [];
      const processed = new Set<string>();
      
      console.log('🔍 Analyzing duplicates...');
      
      athletes.forEach((athlete, index) => {
        if (processed.has(athlete.id)) return;
        
        const potentialDuplicates = athletes.filter((other, otherIndex) => {
          if (otherIndex <= index || processed.has(other.id)) return false;
          
          // Check for exact TC match
          if (athlete.studentTcNo && other.studentTcNo && 
              athlete.studentTcNo === other.studentTcNo) {
            return true;
          }
          
          // Check for exact phone match
          if (athlete.parentPhone && other.parentPhone && 
              athlete.parentPhone === other.parentPhone) {
            return true;
          }
          
          // Check for exact name match
          const name1 = `${athlete.studentName || ''} ${athlete.studentSurname || ''}`.trim().toLowerCase();
          const name2 = `${other.studentName || ''} ${other.studentSurname || ''}`.trim().toLowerCase();
          if (name1 && name2 && name1 === name2) {
            return true;
          }
          
          return false;
        });
        
        if (potentialDuplicates.length > 0) {
          const group = [athlete, ...potentialDuplicates];
          
          // Determine reason and severity
          let reason = '';
          let severity: 'high' | 'medium' | 'low' = 'low';
          
          const hasSameTc = group.every(a => a.studentTcNo === athlete.studentTcNo);
          const hasSamePhone = group.every(a => a.parentPhone === athlete.parentPhone);
          const hasSameName = group.every(a => 
            `${a.studentName} ${a.studentSurname}`.toLowerCase() === 
            `${athlete.studentName} ${athlete.studentSurname}`.toLowerCase()
          );
          
          if (hasSameTc && hasSamePhone && hasSameName) {
            reason = 'Aynı TC, telefon ve isim';
            severity = 'high';
          } else if (hasSameTc) {
            reason = 'Aynı TC kimlik numarası';
            severity = 'high';
          } else if (hasSamePhone && hasSameName) {
            reason = 'Aynı telefon ve isim';
            severity = 'medium';
          } else if (hasSameName) {
            reason = 'Aynı isim';
            severity = 'low';
          } else {
            reason = 'Benzer bilgiler';
            severity = 'low';
          }
          
          duplicates.push({
            key: `${athlete.studentTcNo || athlete.parentPhone || athlete.id}`,
            athletes: group,
            reason,
            severity
          });
          
          // Mark all as processed
          group.forEach(a => processed.add(a.id));
        }
      });
      
      // Sort by severity
      duplicates.sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });
      
      setDuplicateGroups(duplicates);
      
      const affectedRecords = duplicates.reduce((sum, group) => sum + group.athletes.length, 0);
      setStats(prev => ({
        ...prev,
        duplicateGroups: duplicates.length,
        affectedRecords,
        cleanRecords: prev.totalAthletes - affectedRecords
      }));
      
      if (duplicates.length === 0) {
        toast.success("🎉 Harika! Hiç duplicate kayıt bulunamadı.");
      } else {
        toast.warning(`⚠️ ${duplicates.length} duplicate grup bulundu (${affectedRecords} kayıt etkileniyor)`);
      }
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error("Analiz sırasında hata oluştu");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const removeDuplicate = (groupIndex: number, athleteIndex: number) => {
    const group = duplicateGroups[groupIndex];
    const athleteToRemove = group.athletes[athleteIndex];
    
    const confirmed = confirm(
      `"${athleteToRemove.studentName} ${athleteToRemove.studentSurname}" kaydını silmek istediğinizden emin misiniz?\n\n` +
      `Bu işlem geri alınamaz!`
    );
    
    if (!confirmed) return;
    
    setIsProcessing(true);
    
    try {
      // Remove from localStorage
      const updatedAthletes = athletes.filter(a => a.id !== athleteToRemove.id);
      localStorage.setItem('students', JSON.stringify(updatedAthletes));
      
      // Remove account data
      localStorage.removeItem(`account_${athleteToRemove.id}`);
      
      // Remove from payments
      const payments = JSON.parse(localStorage.getItem('payments') || '[]');
      const updatedPayments = payments.filter((p: any) => p.athleteId !== athleteToRemove.id);
      localStorage.setItem('payments', JSON.stringify(updatedPayments));
      
      // Update local state
      setAthletes(updatedAthletes);
      
      // Update duplicate groups
      const updatedGroups = [...duplicateGroups];
      updatedGroups[groupIndex].athletes = updatedGroups[groupIndex].athletes.filter((_, idx) => idx !== athleteIndex);
      
      // Remove group if only one athlete left
      if (updatedGroups[groupIndex].athletes.length <= 1) {
        updatedGroups.splice(groupIndex, 1);
      }
      
      setDuplicateGroups(updatedGroups);
      
      toast.success(`${athleteToRemove.studentName} ${athleteToRemove.studentSurname} kaydı silindi`);
      
    } catch (error) {
      console.error('Remove error:', error);
      toast.error("Kayıt silinirken hata oluştu");
    } finally {
      setIsProcessing(false);
    }
  };

  const mergeAthletes = (groupIndex: number) => {
    const group = duplicateGroups[groupIndex];
    
    if (group.athletes.length < 2) return;
    
    const confirmed = confirm(
      `Bu ${group.athletes.length} kaydı birleştirmek istediğinizden emin misiniz?\n\n` +
      `En güncel kayıt korunacak, diğerleri silinecek.\n` +
      `Bu işlem geri alınamaz!`
    );
    
    if (!confirmed) return;
    
    setIsProcessing(true);
    
    try {
      // Find the most recent record
      const sortedByDate = [...group.athletes].sort((a, b) => 
        new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
      );
      
      const keepRecord = sortedByDate[0];
      const removeRecords = sortedByDate.slice(1);
      
      // Merge account data
      let mergedAccountEntries: any[] = [];
      
      for (const athlete of group.athletes) {
        const accountEntries = JSON.parse(localStorage.getItem(`account_${athlete.id}`) || '[]');
        mergedAccountEntries = [...mergedAccountEntries, ...accountEntries];
      }
      
      // Remove duplicates from account entries
      const uniqueAccountEntries = mergedAccountEntries.filter((entry, index, self) => 
        index === self.findIndex(e => 
          e.date === entry.date && 
          e.description === entry.description && 
          e.amountIncludingVat === entry.amountIncludingVat
        )
      );
      
      // Save merged account data
      localStorage.setItem(`account_${keepRecord.id}`, JSON.stringify(uniqueAccountEntries));
      
      // Remove old records
      const updatedAthletes = athletes.filter(a => !removeRecords.some(r => r.id === a.id));
      localStorage.setItem('students', JSON.stringify(updatedAthletes));
      
      // Clean up old account data
      removeRecords.forEach(athlete => {
        localStorage.removeItem(`account_${athlete.id}`);
      });
      
      // Update payments
      const payments = JSON.parse(localStorage.getItem('payments') || '[]');
      const updatedPayments = payments.map((p: any) => {
        if (removeRecords.some(r => r.id === p.athleteId)) {
          return { ...p, athleteId: keepRecord.id };
        }
        return p;
      });
      localStorage.setItem('payments', JSON.stringify(updatedPayments));
      
      // Update local state
      setAthletes(updatedAthletes);
      
      // Remove this group from duplicates
      const updatedGroups = duplicateGroups.filter((_, idx) => idx !== groupIndex);
      setDuplicateGroups(updatedGroups);
      
      toast.success(`${group.athletes.length} kayıt birleştirildi. ${keepRecord.studentName} ${keepRecord.studentSurname} kaydı korundu.`);
      
    } catch (error) {
      console.error('Merge error:', error);
      toast.error("Kayıtlar birleştirilirken hata oluştu");
    } finally {
      setIsProcessing(false);
    }
  };

  const getSeverityBadge = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">Yüksek Risk</Badge>;
      case 'medium':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Orta Risk</Badge>;
      case 'low':
        return <Badge variant="outline">Düşük Risk</Badge>;
    }
  };

  return (
    <>
      <Head>
        <title>Veri Temizleme - SportsCRM</title>
        <meta name="description" content="Duplicate kayıt temizleme" />
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
                <h1 className="text-3xl font-bold">Veri Temizleme</h1>
              </div>
              <p className="text-muted-foreground">Duplicate kayıtları tespit edin ve temizleyin</p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={analyzeDuplicates} 
                disabled={isAnalyzing}
                variant="outline"
              >
                {isAnalyzing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                Duplicate Analizi
              </Button>
            </div>
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
                    <p className="text-sm font-medium text-muted-foreground">Toplam Kayıt</p>
                    <p className="text-2xl font-bold">{stats.totalAthletes}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Duplicate Grup</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.duplicateGroups}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Etkilenen Kayıt</p>
                    <p className="text-2xl font-bold text-red-600">{stats.affectedRecords}</p>
                  </div>
                  <Trash2 className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Temiz Kayıt</p>
                    <p className="text-2xl font-bold text-green-600">{stats.cleanRecords}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Analysis Results */}
          {duplicateGroups.length > 0 && (
            <motion.div variants={fadeInUp} initial="initial" animate="animate">
              <Card>
                <CardHeader>
                  <CardTitle>Duplicate Kayıtlar ({duplicateGroups.length} grup)</CardTitle>
                  <CardDescription>
                    Aşağıdaki kayıtlar duplicate olarak tespit edildi. İnceleyip gerekli işlemleri yapın.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {duplicateGroups.map((group, groupIndex) => (
                      <Card key={group.key} className="border-l-4 border-l-orange-500">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium">Grup {groupIndex + 1}</h3>
                              {getSeverityBadge(group.severity)}
                              <Badge variant="outline">{group.reason}</Badge>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => mergeAthletes(groupIndex)}
                                disabled={isProcessing}
                              >
                                <Merge className="h-4 w-4 mr-1" />
                                Birleştir
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Sporcu</TableHead>
                                <TableHead>TC Kimlik</TableHead>
                                <TableHead>Veli</TableHead>
                                <TableHead>Telefon</TableHead>
                                <TableHead>Kayıt Tarihi</TableHead>
                                <TableHead>Güncelleme</TableHead>
                                <TableHead>İşlemler</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {group.athletes.map((athlete, athleteIndex) => (
                                <TableRow key={athlete.id}>
                                  <TableCell>
                                    <div>
                                      <p className="font-medium">{athlete.studentName} {athlete.studentSurname}</p>
                                      <p className="text-sm text-muted-foreground">ID: {athlete.id}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell>{athlete.studentTcNo || '-'}</TableCell>
                                  <TableCell>{athlete.parentName} {athlete.parentSurname}</TableCell>
                                  <TableCell>{athlete.parentPhone || '-'}</TableCell>
                                  <TableCell>
                                    {new Date(athlete.createdAt || athlete.registrationDate).toLocaleDateString('tr-TR')}
                                  </TableCell>
                                  <TableCell>
                                    {new Date(athlete.updatedAt || athlete.createdAt).toLocaleDateString('tr-TR')}
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => removeDuplicate(groupIndex, athleteIndex)}
                                      disabled={isProcessing}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* No Duplicates Message */}
          {duplicateGroups.length === 0 && stats.totalAthletes > 0 && (
            <motion.div variants={fadeInUp} initial="initial" animate="animate">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Harika!</strong> Hiç duplicate kayıt bulunamadı. Verileriniz temiz görünüyor.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Instructions */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Nasıl Kullanılır?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <p className="font-medium">Duplicate Analizi Çalıştırın</p>
                      <p className="text-sm text-muted-foreground">
                        "Duplicate Analizi" butonuna tıklayarak sistem otomatik olarak benzer kayıtları tespit eder.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <p className="font-medium">Sonuçları İnceleyin</p>
                      <p className="text-sm text-muted-foreground">
                        Tespit edilen duplicate grupları inceleyip hangi kayıtların gerçekten duplicate olduğunu kontrol edin.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <p className="font-medium">İşlem Yapın</p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Birleştir:</strong> Kayıtları otomatik birleştirir (en güncel kayıt korunur)<br/>
                        <strong>Sil:</strong> Tek tek kayıt siler
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