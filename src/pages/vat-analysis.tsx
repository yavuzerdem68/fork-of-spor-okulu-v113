import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calculator,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  FileText,
  Settings,
  Zap
} from "lucide-react";
import { useRouter } from "next/router";
import Link from "next/link";
import Header from "@/components/Header";
import { toast } from "sonner";
import { 
  calculateVatBreakdown, 
  formatCurrency, 
  VAT_RATE_OPTIONS,
  roundToWholeNumber,
  calculateReverseVat,
  calculateTotalVat
} from '@/lib/vat-utils';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

interface VatAnalysisResult {
  originalAmount: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  roundedVatAmount: number;
  roundedTotalAmount: number;
  hasDecimalIssue: boolean;
  recommendation: string;
}

export default function VatAnalysis() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [testAmount, setTestAmount] = useState('350.00');
  const [testVatRate, setTestVatRate] = useState('20');
  const [analysisResults, setAnalysisResults] = useState<VatAnalysisResult[]>([]);
  const [systemAnalysis, setSystemAnalysis] = useState<any>(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    
    if (!role || role !== "admin") {
      router.push("/login");
      return;
    }

    setUserRole(role);
    analyzeSystemData();
  }, [router]);

  const analyzeSystemData = () => {
    console.log('🔍 KDV Analizi Başlatılıyor...');
    
    // Load all athletes and their account entries
    const storedAthletes = JSON.parse(localStorage.getItem('students') || '[]');
    const allEntries: any[] = [];
    const problematicEntries: any[] = [];
    
    storedAthletes.forEach((athlete: any) => {
      const accountEntries = JSON.parse(localStorage.getItem(`account_${athlete.id}`) || '[]');
      accountEntries.forEach((entry: any) => {
        const entryWithAthlete = {
          ...entry,
          athleteId: athlete.id,
          athleteName: `${athlete.studentName} ${athlete.studentSurname}`
        };
        allEntries.push(entryWithAthlete);
        
        // Check for decimal issues
        const hasDecimalIssue = (entry.amountIncludingVat % 1 !== 0) || 
                               (entry.vatAmount % 1 !== 0 && entry.vatAmount % 0.01 !== 0);
        
        if (hasDecimalIssue) {
          problematicEntries.push(entryWithAthlete);
        }
      });
    });

    // Analyze VAT calculations
    const vatAnalysis = {
      totalEntries: allEntries.length,
      entriesWithVat: allEntries.filter(e => e.vatRate > 0).length,
      problematicEntries: problematicEntries.length,
      totalVatAmount: allEntries.reduce((sum, e) => sum + (e.vatAmount || 0), 0),
      totalAmountExcludingVat: allEntries.reduce((sum, e) => sum + (e.amountExcludingVat || 0), 0),
      totalAmountIncludingVat: allEntries.reduce((sum, e) => sum + (e.amountIncludingVat || 0), 0),
      problematicEntries: problematicEntries,
      vatRateDistribution: {}
    };

    // Calculate VAT rate distribution
    const vatRates: { [key: string]: number } = {};
    allEntries.forEach(entry => {
      const rate = entry.vatRate || 0;
      vatRates[rate] = (vatRates[rate] || 0) + 1;
    });
    vatAnalysis.vatRateDistribution = vatRates;

    setSystemAnalysis(vatAnalysis);
    
    console.log('📊 KDV Analizi Tamamlandı:', vatAnalysis);
  };

  const performVatTest = () => {
    const amount = parseFloat(testAmount);
    const rate = parseFloat(testVatRate);
    
    if (isNaN(amount) || isNaN(rate)) {
      toast.error("Lütfen geçerli tutar ve KDV oranı girin");
      return;
    }

    // Test different scenarios
    const scenarios = [
      { amount, rate, description: "Girilen Değerler" },
      { amount: 350, rate: 20, description: "Standart Aidat (₺350 + %20 KDV)" },
      { amount: 299.99, rate: 20, description: "Küsüratlı Tutar Test" },
      { amount: 333.33, rate: 20, description: "Tekrarlayan Ondalık Test" },
      { amount: 416.67, rate: 20, description: "Karmaşık Ondalık Test" },
    ];

    const results: VatAnalysisResult[] = scenarios.map(scenario => {
      const { vatAmount, amountIncludingVat } = calculateVatBreakdown(scenario.amount, scenario.rate);
      
      // Calculate without rounding for comparison
      const rawVatAmount = (scenario.amount * scenario.rate) / 100;
      const rawTotalAmount = scenario.amount + rawVatAmount;
      
      const hasDecimalIssue = (amountIncludingVat % 1 !== 0) || 
                             (vatAmount % 0.01 !== 0);
      
      let recommendation = "✅ KDV hesaplaması doğru";
      if (hasDecimalIssue) {
        recommendation = "⚠️ Küsüratlı sonuç - yuvarlama gerekli";
      }
      if (Math.abs(rawVatAmount - vatAmount) > 0.01) {
        recommendation = "🔧 Yuvarlama uygulandı";
      }

      return {
        originalAmount: scenario.amount,
        vatRate: scenario.rate,
        vatAmount: rawVatAmount,
        totalAmount: rawTotalAmount,
        roundedVatAmount: vatAmount,
        roundedTotalAmount: amountIncludingVat,
        hasDecimalIssue,
        recommendation
      };
    });

    setAnalysisResults(results);
    toast.success("KDV analizi tamamlandı!");
  };

  const fixAllVatIssues = () => {
    if (!systemAnalysis || systemAnalysis.problematicEntries.length === 0) {
      toast.info("Düzeltilecek KDV sorunu bulunamadı");
      return;
    }

    let fixedCount = 0;
    const athleteUpdates: { [key: string]: any[] } = {};

    systemAnalysis.problematicEntries.forEach((entry: any) => {
      const { vatAmount, amountIncludingVat } = calculateVatBreakdown(
        entry.amountExcludingVat, 
        entry.vatRate
      );

      // Update the entry with properly rounded values
      const fixedEntry = {
        ...entry,
        vatAmount: vatAmount,
        amountIncludingVat: amountIncludingVat
      };

      if (!athleteUpdates[entry.athleteId]) {
        athleteUpdates[entry.athleteId] = JSON.parse(
          localStorage.getItem(`account_${entry.athleteId}`) || '[]'
        );
      }

      // Find and update the entry
      const entryIndex = athleteUpdates[entry.athleteId].findIndex(e => e.id === entry.id);
      if (entryIndex !== -1) {
        athleteUpdates[entry.athleteId][entryIndex] = fixedEntry;
        fixedCount++;
      }
    });

    // Save all updates
    Object.keys(athleteUpdates).forEach(athleteId => {
      localStorage.setItem(`account_${athleteId}`, JSON.stringify(athleteUpdates[athleteId]));
    });

    toast.success(`${fixedCount} KDV hesaplaması düzeltildi!`);
    
    // Re-analyze after fixes
    analyzeSystemData();
  };

  const exportVatReport = () => {
    if (!systemAnalysis) {
      toast.error("Önce sistem analizi yapılmalı");
      return;
    }

    const reportData = {
      analysisDate: new Date().toISOString(),
      summary: {
        totalEntries: systemAnalysis.totalEntries,
        entriesWithVat: systemAnalysis.entriesWithVat,
        problematicEntries: systemAnalysis.problematicEntries,
        totalVatAmount: systemAnalysis.totalVatAmount,
        totalAmountExcludingVat: systemAnalysis.totalAmountExcludingVat,
        totalAmountIncludingVat: systemAnalysis.totalAmountIncludingVat
      },
      vatRateDistribution: systemAnalysis.vatRateDistribution,
      problematicEntries: systemAnalysis.problematicEntries.map((entry: any) => ({
        athleteName: entry.athleteName,
        description: entry.description,
        amountExcludingVat: entry.amountExcludingVat,
        vatRate: entry.vatRate,
        vatAmount: entry.vatAmount,
        amountIncludingVat: entry.amountIncludingVat,
        date: entry.date
      }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KDV_Analiz_Raporu_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("KDV analiz raporu indirildi!");
  };

  return (
    <>
      <Head>
        <title>KDV Analizi - SportsCRM</title>
        <meta name="description" content="KDV hesaplama analizi ve düzeltme araçları" />
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
                <Calculator className="w-6 h-6 text-primary" />
                <h1 className="text-3xl font-bold">KDV Analizi</h1>
              </div>
              <p className="text-muted-foreground">KDV hesaplama analizi ve küsürat düzeltme araçları</p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportVatReport}>
                <FileText className="h-4 w-4 mr-2" />
                Rapor İndir
              </Button>
              {systemAnalysis && systemAnalysis.problematicEntries > 0 && (
                <Button onClick={fixAllVatIssues} className="bg-orange-600 hover:bg-orange-700">
                  <Zap className="h-4 w-4 mr-2" />
                  Tüm KDV Sorunlarını Düzelt
                </Button>
              )}
            </div>
          </motion.div>

          {/* System Analysis Summary */}
          {systemAnalysis && (
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
                      <p className="text-2xl font-bold">{systemAnalysis.totalEntries}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">KDV'li Kayıt</p>
                      <p className="text-2xl font-bold text-green-600">{systemAnalysis.entriesWithVat}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Sorunlu Kayıt</p>
                      <p className="text-2xl font-bold text-orange-600">{systemAnalysis.problematicEntries}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Toplam KDV</p>
                      <p className="text-2xl font-bold">{formatCurrency(systemAnalysis.totalVatAmount)}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Main Content */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <Tabs defaultValue="test" className="space-y-6">
              <TabsList>
                <TabsTrigger value="test">KDV Testi</TabsTrigger>
                <TabsTrigger value="analysis">Sistem Analizi</TabsTrigger>
                <TabsTrigger value="problems">Sorunlu Kayıtlar</TabsTrigger>
                <TabsTrigger value="settings">KDV Ayarları</TabsTrigger>
              </TabsList>

              {/* VAT Test Tab */}
              <TabsContent value="test" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>KDV Hesaplama Testi</CardTitle>
                    <CardDescription>
                      Farklı tutarlar için KDV hesaplamalarını test edin ve küsürat sorunlarını tespit edin
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <Label htmlFor="testAmount">Test Tutarı (KDV Hariç)</Label>
                        <Input
                          id="testAmount"
                          type="number"
                          step="0.01"
                          placeholder="350.00"
                          value={testAmount}
                          onChange={(e) => setTestAmount(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="testVatRate">KDV Oranı (%)</Label>
                        <Select value={testVatRate} onValueChange={setTestVatRate}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {VAT_RATE_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value.toString()}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button onClick={performVatTest} className="w-full">
                          <Calculator className="h-4 w-4 mr-2" />
                          KDV Testini Çalıştır
                        </Button>
                      </div>
                    </div>

                    {analysisResults.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Test Sonuçları</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Senaryo</TableHead>
                              <TableHead>KDV Hariç</TableHead>
                              <TableHead>KDV Oranı</TableHead>
                              <TableHead>Ham KDV</TableHead>
                              <TableHead>Yuvarlanmış KDV</TableHead>
                              <TableHead>Ham Toplam</TableHead>
                              <TableHead>Yuvarlanmış Toplam</TableHead>
                              <TableHead>Durum</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {analysisResults.map((result, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">Test {index + 1}</TableCell>
                                <TableCell>{formatCurrency(result.originalAmount)}</TableCell>
                                <TableCell>%{result.vatRate}</TableCell>
                                <TableCell>{formatCurrency(result.vatAmount)}</TableCell>
                                <TableCell className="font-medium">{formatCurrency(result.roundedVatAmount)}</TableCell>
                                <TableCell>{formatCurrency(result.totalAmount)}</TableCell>
                                <TableCell className="font-medium">{formatCurrency(result.roundedTotalAmount)}</TableCell>
                                <TableCell>
                                  <Badge variant={result.hasDecimalIssue ? "destructive" : "default"}>
                                    {result.recommendation}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* System Analysis Tab */}
              <TabsContent value="analysis" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sistem KDV Analizi</CardTitle>
                    <CardDescription>
                      Sistemdeki tüm KDV hesaplamalarının analizi
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {systemAnalysis ? (
                      <div className="space-y-6">
                        {/* VAT Rate Distribution */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">KDV Oranı Dağılımı</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(systemAnalysis.vatRateDistribution).map(([rate, count]) => (
                              <Card key={rate}>
                                <CardContent className="p-4 text-center">
                                  <p className="text-2xl font-bold">%{rate}</p>
                                  <p className="text-sm text-muted-foreground">{count} kayıt</p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>

                        {/* Financial Summary */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Mali Özet</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                              <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground">KDV Hariç Toplam</p>
                                <p className="text-xl font-bold">{formatCurrency(systemAnalysis.totalAmountExcludingVat)}</p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground">Toplam KDV</p>
                                <p className="text-xl font-bold text-orange-600">{formatCurrency(systemAnalysis.totalVatAmount)}</p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground">KDV Dahil Toplam</p>
                                <p className="text-xl font-bold text-green-600">{formatCurrency(systemAnalysis.totalAmountIncludingVat)}</p>
                              </CardContent>
                            </Card>
                          </div>
                        </div>

                        {/* Health Check */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Sistem Sağlık Kontrolü</h3>
                          <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                              {systemAnalysis.problematicEntries === 0 
                                ? "✅ Tüm KDV hesaplamaları doğru! Küsürat sorunu bulunmadı."
                                : `⚠️ ${systemAnalysis.problematicEntries} kayıtta küsürat sorunu tespit edildi. Düzeltme önerilir.`
                              }
                            </AlertDescription>
                          </Alert>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Sistem analizi yükleniyor...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Problems Tab */}
              <TabsContent value="problems" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sorunlu KDV Kayıtları</CardTitle>
                    <CardDescription>
                      Küsüratlı KDV hesaplamaları olan kayıtlar
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {systemAnalysis && systemAnalysis.problematicEntries.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Sporcu</TableHead>
                            <TableHead>Açıklama</TableHead>
                            <TableHead>KDV Hariç</TableHead>
                            <TableHead>KDV Oranı</TableHead>
                            <TableHead>Mevcut KDV</TableHead>
                            <TableHead>Doğru KDV</TableHead>
                            <TableHead>Mevcut Toplam</TableHead>
                            <TableHead>Doğru Toplam</TableHead>
                            <TableHead>Tarih</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {systemAnalysis.problematicEntries.map((entry: any, index: number) => {
                            const { vatAmount: correctVat, amountIncludingVat: correctTotal } = 
                              calculateVatBreakdown(entry.amountExcludingVat, entry.vatRate);
                            
                            return (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{entry.athleteName}</TableCell>
                                <TableCell>{entry.description}</TableCell>
                                <TableCell>{formatCurrency(entry.amountExcludingVat)}</TableCell>
                                <TableCell>%{entry.vatRate}</TableCell>
                                <TableCell className="text-red-600">{formatCurrency(entry.vatAmount)}</TableCell>
                                <TableCell className="text-green-600">{formatCurrency(correctVat)}</TableCell>
                                <TableCell className="text-red-600">{formatCurrency(entry.amountIncludingVat)}</TableCell>
                                <TableCell className="text-green-600">{formatCurrency(correctTotal)}</TableCell>
                                <TableCell>{new Date(entry.date).toLocaleDateString('tr-TR')}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                        <p className="text-muted-foreground">Sorunlu KDV kaydı bulunamadı!</p>
                        <p className="text-sm text-muted-foreground mt-2">Tüm KDV hesaplamaları doğru görünüyor.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>KDV Ayarları</CardTitle>
                    <CardDescription>
                      KDV hesaplama ve yuvarlama ayarları
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Mevcut KDV Oranları</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {VAT_RATE_OPTIONS.map(option => (
                            <Card key={option.value}>
                              <CardContent className="p-4 text-center">
                                <p className="text-xl font-bold">%{option.value}</p>
                                <p className="text-sm text-muted-foreground">{option.label}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4">Yuvarlama Kuralları</h3>
                        <Alert>
                          <Settings className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Türk Vergi Mevzuatına Uygun Yuvarlama:</strong>
                            <br />• KDV tutarları kuruş cinsinden yuvarlanır (2 ondalık basamak)
                            <br />• Toplam tutarlar kuruş cinsinden yuvarlanır
                            <br />• Yuvarlama işlemi matematiksel kurallara göre yapılır (0.5 ve üzeri yukarı)
                          </AlertDescription>
                        </Alert>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4">Sistem Durumu</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <span>KDV Hesaplama Motoru</span>
                            <Badge className="bg-green-600">Aktif</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <span>Otomatik Yuvarlama</span>
                            <Badge className="bg-green-600">Aktif</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <span>Türkçe Para Formatı</span>
                            <Badge className="bg-green-600">Aktif</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </>
  );
}