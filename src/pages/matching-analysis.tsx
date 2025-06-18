import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  TestTube,
  Bug,
  Zap,
  Users,
  Target,
  Brain,
  FileText,
  Settings
} from "lucide-react";
import { useRouter } from "next/router";
import Link from "next/link";
import Header from "@/components/Header";
import { toast } from "sonner";
import Image from "next/image";

// Import the same matching functions from payments.tsx for testing
const normalizeTurkishText = (text: string): string[] => {
  if (!text) return [''];
  
  let normalized = text.toLowerCase();
  
  const turkishMappings = {
    'ğ': 'g', 'g': 'ğ',
    'ü': 'u', 'u': 'ü', 
    'ş': 's', 's': 'ş',
    'ı': 'i', 'i': 'ı',
    'ö': 'o', 'o': 'ö',
    'ç': 'c', 'c': 'ç'
  };
  
  const versions = [normalized];
  
  let asciiVersion = normalized;
  Object.keys(turkishMappings).forEach(char => {
    if (['ğ', 'ü', 'ş', 'ı', 'ö', 'ç'].includes(char)) {
      asciiVersion = asciiVersion.replace(new RegExp(char, 'g'), turkishMappings[char]);
    }
  });
  versions.push(asciiVersion);
  
  return versions.map(v => 
    v.replace(/[^\wğüşıöçâîû]/g, ' ')
     .replace(/\s+/g, ' ')
     .trim()
  );
};

const calculateSimilarity = (str1: string, str2: string): number => {
  if (!str1 || !str2) return 0;
  
  const versions1 = normalizeTurkishText(str1);
  const versions2 = normalizeTurkishText(str2);
  
  let maxSimilarity = 0;
  
  for (const v1 of versions1) {
    for (const v2 of versions2) {
      if (v1 === v2) return 100;
      
      const clean1 = v1.replace(/\s+/g, '').replace(/[^\wğüşıöçâîû]/g, '');
      const clean2 = v2.replace(/\s+/g, '').replace(/[^\wğüşıöçâîû]/g, '');
      if (clean1 === clean2 && clean1.length > 0) return 100;
      
      if (v1.includes(v2) || v2.includes(v1)) {
        const containmentScore = Math.min(v1.length, v2.length) / Math.max(v1.length, v2.length) * 95;
        maxSimilarity = Math.max(maxSimilarity, containmentScore);
      }
      
      const words1 = v1.split(/\s+/).filter(w => w.length > 1);
      const words2 = v2.split(/\s+/).filter(w => w.length > 1);
      
      if (words1.length > 0 && words2.length > 0) {
        let exactWordMatches = 0;
        let totalWords = Math.max(words1.length, words2.length);
        
        for (const word1 of words1) {
          for (const word2 of words2) {
            if (word1 === word2) {
              exactWordMatches++;
              break;
            }
          }
        }
        
        if (exactWordMatches === totalWords && totalWords >= 2) {
          return 100;
        }
        
        const wordMatchScore = (exactWordMatches / totalWords) * 100;
        maxSimilarity = Math.max(maxSimilarity, wordMatchScore);
      }
      
      const levenshtein = calculateLevenshteinSimilarity(v1, v2);
      const jaccard = calculateJaccardSimilarity(v1, v2);
      const substring = calculateSubstringSimilarity(v1, v2);
      
      const combined = (levenshtein * 0.4) + (jaccard * 0.4) + (substring * 0.2);
      maxSimilarity = Math.max(maxSimilarity, combined);
    }
  }
  
  return maxSimilarity;
};

const calculateLevenshteinSimilarity = (str1: string, str2: string): number => {
  const len1 = str1.length;
  const len2 = str2.length;
  
  if (len1 === 0) return len2 === 0 ? 100 : 0;
  if (len2 === 0) return 0;
  
  const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null));
  
  for (let i = 0; i <= len1; i++) matrix[0][i] = i;
  for (let j = 0; j <= len2; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j - 1][i] + 1,
        matrix[j][i - 1] + 1,
        matrix[j - 1][i - 1] + cost
      );
    }
  }
  
  const maxLen = Math.max(len1, len2);
  return ((maxLen - matrix[len2][len1]) / maxLen) * 100;
};

const calculateJaccardSimilarity = (str1: string, str2: string): number => {
  const words1 = new Set(str1.split(' ').filter(w => w.length > 1));
  const words2 = new Set(str2.split(' ').filter(w => w.length > 1));
  
  if (words1.size === 0 && words2.size === 0) return 100;
  if (words1.size === 0 || words2.size === 0) return 0;
  
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  
  return (intersection.size / union.size) * 100;
};

const calculateSubstringSimilarity = (str1: string, str2: string): number => {
  if (str1.includes(str2) || str2.includes(str1)) return 85;
  
  let maxSubstring = 0;
  for (let i = 0; i < str1.length; i++) {
    for (let j = i + 2; j <= str1.length; j++) {
      const substring = str1.slice(i, j);
      if (str2.includes(substring)) {
        maxSubstring = Math.max(maxSubstring, substring.length);
      }
    }
  }
  
  return (maxSubstring / Math.max(str1.length, str2.length)) * 100;
};

export default function MatchingAnalysis() {
  const router = useRouter();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testInput1, setTestInput1] = useState("");
  const [testInput2, setTestInput2] = useState("");
  const [manualTestResult, setManualTestResult] = useState<number | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (!role || role !== "admin") {
      router.push("/login");
      return;
    }
  }, [router]);

  const runComprehensiveTests = () => {
    setIsRunningTests(true);
    
    // Test cases based on the issues described
    const testCases = [
      // Exact matches that should be 100%
      {
        description: "ömer kayra erdi",
        athleteName: "Ömer Kayra Erdi",
        parentName: "Mehmet Erdi",
        expectedSimilarity: 100,
        category: "Exact Match (Case Insensitive)"
      },
      {
        description: "AHMET YILMAZ",
        athleteName: "Ahmet Yılmaz",
        parentName: "Fatma Yılmaz",
        expectedSimilarity: 100,
        category: "Exact Match (Case + Turkish Chars)"
      },
      {
        description: "elif şahin",
        athleteName: "Elif Şahin",
        parentName: "Murat Şahin",
        expectedSimilarity: 100,
        category: "Exact Match (Turkish Characters)"
      },
      
      // Parent name matches
      {
        description: "mehmet erdi ödeme",
        athleteName: "Ömer Kayra Erdi",
        parentName: "Mehmet Erdi",
        expectedSimilarity: 90,
        category: "Parent Name Match"
      },
      {
        description: "fatma yilmaz aidat",
        athleteName: "Ahmet Yılmaz",
        parentName: "Fatma Yılmaz",
        expectedSimilarity: 90,
        category: "Parent Name Match (ASCII)"
      },
      
      // Partial matches
      {
        description: "kayra erdi spor",
        athleteName: "Ömer Kayra Erdi",
        parentName: "Mehmet Erdi",
        expectedSimilarity: 80,
        category: "Partial Name Match"
      },
      {
        description: "ahmet basketbol",
        athleteName: "Ahmet Yılmaz",
        parentName: "Fatma Yılmaz",
        expectedSimilarity: 70,
        category: "First Name Match"
      },
      
      // Turkish character variations
      {
        description: "omer kayra erdi",
        athleteName: "Ömer Kayra Erdi",
        parentName: "Mehmet Erdi",
        expectedSimilarity: 100,
        category: "Turkish Char Normalization"
      },
      {
        description: "ELIF SAHIN",
        athleteName: "Elif Şahin",
        parentName: "Murat Şahin",
        expectedSimilarity: 100,
        category: "Turkish Char + Case"
      },
      
      // Bank statement formats
      {
        description: "EFT GELEN HAVALE MEHMET ERDI 350.00 TL",
        athleteName: "Ömer Kayra Erdi",
        parentName: "Mehmet Erdi",
        expectedSimilarity: 85,
        category: "Bank Statement Format"
      },
      {
        description: "HAVALE FATMA YILMAZ SPOR OKULU AIDAT",
        athleteName: "Ahmet Yılmaz",
        parentName: "Fatma Yılmaz",
        expectedSimilarity: 85,
        category: "Bank Statement Format"
      },
      
      // Low similarity cases (should not match)
      {
        description: "can özkan",
        athleteName: "Ömer Kayra Erdi",
        parentName: "Mehmet Erdi",
        expectedSimilarity: 15,
        category: "Different Person (Should Not Match)"
      },
      {
        description: "zeynep demir",
        athleteName: "Ahmet Yılmaz",
        parentName: "Fatma Yılmaz",
        expectedSimilarity: 10,
        category: "Different Person (Should Not Match)"
      }
    ];

    const results = testCases.map(testCase => {
      const athleteSimilarity = calculateSimilarity(testCase.description, testCase.athleteName);
      const parentSimilarity = calculateSimilarity(testCase.description, testCase.parentName);
      const maxSimilarity = Math.max(athleteSimilarity, parentSimilarity * 1.2); // Parent boost
      
      const passed = Math.abs(maxSimilarity - testCase.expectedSimilarity) <= 15; // 15% tolerance
      
      return {
        ...testCase,
        actualSimilarity: Math.round(maxSimilarity),
        athleteSimilarity: Math.round(athleteSimilarity),
        parentSimilarity: Math.round(parentSimilarity),
        passed,
        details: {
          normalized1: normalizeTurkishText(testCase.description),
          normalized2: normalizeTurkishText(testCase.athleteName),
          normalized3: normalizeTurkishText(testCase.parentName)
        }
      };
    });

    setTestResults(results);
    setIsRunningTests(false);
    
    const passedTests = results.filter(r => r.passed).length;
    const totalTests = results.length;
    
    if (passedTests === totalTests) {
      toast.success(`Tüm testler başarılı! (${passedTests}/${totalTests})`);
    } else {
      toast.error(`${totalTests - passedTests} test başarısız! (${passedTests}/${totalTests} başarılı)`);
    }
  };

  const runManualTest = () => {
    if (!testInput1.trim() || !testInput2.trim()) {
      toast.error("Lütfen her iki alanı da doldurun");
      return;
    }
    
    const similarity = calculateSimilarity(testInput1, testInput2);
    setManualTestResult(Math.round(similarity));
    
    toast.success(`Benzerlik hesaplandı: %${Math.round(similarity)}`);
  };

  const getStatusIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    );
  };

  const getStatusBadge = (passed: boolean) => {
    return passed ? (
      <Badge className="bg-green-100 text-green-800 border-green-200">Başarılı</Badge>
    ) : (
      <Badge variant="destructive">Başarısız</Badge>
    );
  };

  return (
    <>
      <Head>
        <title>Eşleştirme Algoritması Analizi - SportsCRM</title>
        <meta name="description" content="Akıllı eşleştirme algoritması test ve analiz sayfası" />
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
                <Link href="/payments" className="text-muted-foreground hover:text-primary">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <Brain className="w-6 h-6 text-primary" />
                <h1 className="text-3xl font-bold">Eşleştirme Algoritması Analizi</h1>
              </div>
              <p className="text-muted-foreground">Akıllı eşleştirme algoritmasının test ve analiz sayfası</p>
            </div>
          </motion.div>

          {/* Screenshots Analysis */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Kullanıcı Geri Bildirimi Analizi</span>
                </CardTitle>
                <CardDescription>
                  Sağlanan ekran görüntüleri ve geri bildirimler üzerinden sorun analizi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Görsel 1</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <Image 
                        src="https://assets.co.dev/e522a9c1-d37e-4a9b-a7ec-bbeec7aa3e7a/1-174f09c.jpg" 
                        alt="Eşleştirme Problemi 1" 
                        width={300} 
                        height={200} 
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Görsel 2</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <Image 
                        src="https://assets.co.dev/e522a9c1-d37e-4a9b-a7ec-bbeec7aa3e7a/2-3424936.jpg" 
                        alt="Eşleştirme Problemi 2" 
                        width={300} 
                        height={200} 
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Görsel 3</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <Image 
                        src="https://assets.co.dev/e522a9c1-d37e-4a9b-a7ec-bbeec7aa3e7a/3-f243136.jpg" 
                        alt="Eşleştirme Problemi 3" 
                        width={300} 
                        height={200} 
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Görsel 4</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <Image 
                        src="https://assets.co.dev/e522a9c1-d37e-4a9b-a7ec-bbeec7aa3e7a/4-4131f96.jpg" 
                        alt="Eşleştirme Problemi 4" 
                        width={300} 
                        height={200} 
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Görsel 5</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <Image 
                        src="https://assets.co.dev/e522a9c1-d37e-4a9b-a7ec-bbeec7aa3e7a/5-358f1bd.jpg" 
                        alt="Eşleştirme Problemi 5" 
                        width={300} 
                        height={200} 
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                </div>

                <Alert className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Tespit Edilen Sorunlar:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>5 numaralı görsel hariç diğer kardeşler eşleşti ancak çoklu eşleştirme penceresinde tüm kardeşler gösteriliyor</li>
                      <li>Daha önce %100 eşleşen isimler artık %28 gibi düşük benzerlik gösteriyor</li>
                      <li>Otomatik eşleştirme sayısı 0'a düştü</li>
                      <li>Türkçe karakter normalizasyonu sorunu ("ömer kayra erdi" vs "Ömer Kayra Erdi")</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </motion.div>

          <Tabs defaultValue="tests" className="space-y-6">
            <TabsList>
              <TabsTrigger value="tests">Otomatik Testler</TabsTrigger>
              <TabsTrigger value="manual">Manuel Test</TabsTrigger>
              <TabsTrigger value="analysis">Algoritma Analizi</TabsTrigger>
              <TabsTrigger value="fixes">Önerilen Düzeltmeler</TabsTrigger>
            </TabsList>

            <TabsContent value="tests" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TestTube className="h-5 w-5" />
                    <span>Kapsamlı Algoritma Testleri</span>
                  </CardTitle>
                  <CardDescription>
                    Eşleştirme algoritmasının farklı senaryolarda performansını test edin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button 
                      onClick={runComprehensiveTests} 
                      disabled={isRunningTests}
                      className="w-full"
                    >
                      {isRunningTests ? (
                        <>
                          <Settings className="h-4 w-4 mr-2 animate-spin" />
                          Testler Çalışıyor...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Kapsamlı Test Paketi Çalıştır
                        </>
                      )}
                    </Button>

                    {testResults.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium">Test Sonuçları</h3>
                          <div className="flex space-x-2">
                            <Badge className="bg-green-100 text-green-800">
                              {testResults.filter(r => r.passed).length} Başarılı
                            </Badge>
                            <Badge variant="destructive">
                              {testResults.filter(r => !r.passed).length} Başarısız
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {testResults.map((result, index) => (
                            <Card key={index} className={`border ${result.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    {getStatusIcon(result.passed)}
                                    <span className="font-medium">{result.category}</span>
                                    {getStatusBadge(result.passed)}
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm font-medium">
                                      Beklenen: %{result.expectedSimilarity}
                                    </div>
                                    <div className={`text-sm ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                                      Gerçek: %{result.actualSimilarity}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Açıklama:</span>
                                    <p className="font-mono bg-gray-100 p-2 rounded text-xs">
                                      "{result.description}"
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Sporcu:</span>
                                    <p className="font-mono bg-gray-100 p-2 rounded text-xs">
                                      "{result.athleteName}"
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Benzerlik: %{result.athleteSimilarity}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Veli:</span>
                                    <p className="font-mono bg-gray-100 p-2 rounded text-xs">
                                      "{result.parentName}"
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Benzerlik: %{result.parentSimilarity}
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-3 text-xs text-muted-foreground">
                                  <details>
                                    <summary className="cursor-pointer hover:text-primary">
                                      Normalizasyon Detayları
                                    </summary>
                                    <div className="mt-2 space-y-1">
                                      <div>Açıklama normalize: {JSON.stringify(result.details.normalized1)}</div>
                                      <div>Sporcu normalize: {JSON.stringify(result.details.normalized2)}</div>
                                      <div>Veli normalize: {JSON.stringify(result.details.normalized3)}</div>
                                    </div>
                                  </details>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manual" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Search className="h-5 w-5" />
                    <span>Manuel Benzerlik Testi</span>
                  </CardTitle>
                  <CardDescription>
                    İki metin arasındaki benzerliği manuel olarak test edin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="test1">Metin 1 (Örn: Banka açıklaması)</Label>
                        <Input
                          id="test1"
                          placeholder="ömer kayra erdi"
                          value={testInput1}
                          onChange={(e) => setTestInput1(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="test2">Metin 2 (Örn: Sporcu/Veli adı)</Label>
                        <Input
                          id="test2"
                          placeholder="Ömer Kayra Erdi"
                          value={testInput2}
                          onChange={(e) => setTestInput2(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <Button onClick={runManualTest} className="w-full">
                      <Target className="h-4 w-4 mr-2" />
                      Benzerlik Hesapla
                    </Button>

                    {manualTestResult !== null && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-2">
                            <div className="text-lg font-bold">
                              Benzerlik Oranı: %{manualTestResult}
                            </div>
                            <div className="text-sm">
                              <strong>Normalizasyon Sonuçları:</strong>
                              <div className="mt-1 space-y-1 font-mono text-xs">
                                <div>Metin 1: {JSON.stringify(normalizeTurkishText(testInput1))}</div>
                                <div>Metin 2: {JSON.stringify(normalizeTurkishText(testInput2))}</div>
                              </div>
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <h4 className="font-medium">Örnek Test Senaryoları:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setTestInput1("ömer kayra erdi");
                            setTestInput2("Ömer Kayra Erdi");
                          }}
                        >
                          Türkçe Karakter + Büyük/Küçük Harf
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setTestInput1("EFT GELEN HAVALE MEHMET ERDI 350.00 TL");
                            setTestInput2("Mehmet Erdi");
                          }}
                        >
                          Banka Açıklaması vs Veli Adı
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setTestInput1("AHMET YILMAZ SPOR OKULU");
                            setTestInput2("Ahmet Yılmaz");
                          }}
                        >
                          Sporcu Adı + Ek Kelimeler
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setTestInput1("fatma yilmaz");
                            setTestInput2("Fatma Yılmaz");
                          }}
                        >
                          ASCII vs Türkçe Karakter
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5" />
                    <span>Algoritma Detay Analizi</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-3">Mevcut Algoritma Bileşenleri:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <h4 className="font-medium text-green-600 mb-2">✅ Çalışan Özellikler</h4>
                            <ul className="text-sm space-y-1">
                              <li>• Türkçe karakter normalizasyonu</li>
                              <li>• Levenshtein mesafe hesaplama</li>
                              <li>• Jaccard benzerlik</li>
                              <li>• Alt dize eşleştirme</li>
                              <li>• Kelime bazlı eşleştirme</li>
                              <li>• Veli adı için %20 bonus</li>
                            </ul>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="p-4">
                            <h4 className="font-medium text-red-600 mb-2">❌ Sorunlu Alanlar</h4>
                            <ul className="text-sm space-y-1">
                              <li>• Tam eşleşme algılama</li>
                              <li>• Büyük/küçük harf duyarlılığı</li>
                              <li>• Kardeş grubu filtreleme</li>
                              <li>• Eşik değer ayarları</li>
                              <li>• Çoklu sporcu önerisi</li>
                              <li>• Geçmiş eşleştirme hafızası</li>
                            </ul>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-3">Algoritma Akış Şeması:</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="space-y-2 text-sm font-mono">
                          <div>1. Metin normalizasyonu (Türkçe karakter + küçük harf)</div>
                          <div>2. Tam eşleşme kontrolü (normalize edilmiş)</div>
                          <div>3. Temizlenmiş metin eşleşme kontrolü</div>
                          <div>4. Alt dize içerme kontrolü</div>
                          <div>5. Kelime bazlı tam eşleşme</div>
                          <div>6. Levenshtein + Jaccard + Alt dize kombinasyonu</div>
                          <div>7. Veli adı için bonus uygulama</div>
                          <div>8. Eşik değer kontrolü (%15)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fixes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bug className="h-5 w-5" />
                    <span>Önerilen Düzeltmeler</span>
                  </CardTitle>
                  <CardDescription>
                    Tespit edilen sorunlar için önerilen çözümler
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Kritik Sorunlar ve Çözümleri:</strong>
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                      <Card className="border-red-200 bg-red-50">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-red-800 mb-2">🔴 Sorun 1: Tam Eşleşme Algılanamıyor</h4>
                          <p className="text-sm text-red-700 mb-3">
                            "ömer kayra erdi" ile "Ömer Kayra Erdi" %100 eşleşmeli ama %28 gösteriyor
                          </p>
                          <div className="bg-white p-3 rounded border">
                            <strong className="text-green-700">Çözüm:</strong>
                            <ul className="text-sm mt-1 space-y-1">
                              <li>• Normalizasyon fonksiyonunu güçlendir</li>
                              <li>• Tam eşleşme kontrolünü önceliklendir</li>
                              <li>• Büyük/küçük harf duyarsız karşılaştırma ekle</li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-orange-200 bg-orange-50">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-orange-800 mb-2">🟡 Sorun 2: Kardeş Grubu Filtreleme</h4>
                          <p className="text-sm text-orange-700 mb-3">
                            Eşleşen kardeşlerin penceresinde tüm kardeşler gösteriliyor
                          </p>
                          <div className="bg-white p-3 rounded border">
                            <strong className="text-green-700">Çözüm:</strong>
                            <ul className="text-sm mt-1 space-y-1">
                              <li>• Kardeş önerisini sadece ilgili eşleşmelerde göster</li>
                              <li>• Bireysel benzerlik eşiği uygula</li>
                              <li>• Kardeş grubu mantığını yeniden düzenle</li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-blue-800 mb-2">🔵 Sorun 3: Eşik Değer Ayarları</h4>
                          <p className="text-sm text-blue-700 mb-3">
                            Otomatik eşleştirme sayısı 0'a düştü, eşik çok yüksek olabilir
                          </p>
                          <div className="bg-white p-3 rounded border">
                            <strong className="text-green-700">Çözüm:</strong>
                            <ul className="text-sm mt-1 space-y-1">
                              <li>• Eşik değeri %15'ten %25'e çıkar</li>
                              <li>• Tam eşleşmeler için ayrı eşik kullan</li>
                              <li>• Dinamik eşik değer sistemi</li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-green-200 bg-green-50">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-green-800 mb-2">🟢 Önerilen İyileştirmeler</h4>
                          <div className="space-y-3">
                            <div>
                              <strong className="text-sm">1. Gelişmiş Normalizasyon:</strong>
                              <p className="text-xs text-muted-foreground">
                                Daha kapsamlı Türkçe karakter eşleme ve noktalama işareti temizleme
                              </p>
                            </div>
                            <div>
                              <strong className="text-sm">2. Akıllı Eşik Sistemi:</strong>
                              <p className="text-xs text-muted-foreground">
                                Tam eşleşme, kısmi eşleşme ve benzerlik için farklı eşik değerleri
                              </p>
                            </div>
                            <div>
                              <strong className="text-sm">3. Bağlamsal Analiz:</strong>
                              <p className="text-xs text-muted-foreground">
                                Banka açıklamalarındaki ek bilgileri (tutar, tarih) dikkate alma
                              </p>
                            </div>
                            <div>
                              <strong className="text-sm">4. Öğrenme Mekanizması:</strong>
                              <p className="text-xs text-muted-foreground">
                                Manuel eşleştirmelerden öğrenerek gelecek eşleştirmeleri iyileştirme
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}