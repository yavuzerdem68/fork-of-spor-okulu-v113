import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  CreditCard, 
  Plus,
  Search,
  Download,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Receipt,
  Send,
  Upload,
  FileSpreadsheet,
  ArrowLeft,
  Users,
  FileText,
  BarChart3,
  X,
  Check,
  AlertTriangle,
  UserPlus
} from "lucide-react";
import { useRouter } from "next/router";
import Link from "next/link";
import Header from "@/components/Header";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

// Turkish character normalization for better matching
const normalizeTurkishText = (text: string): string => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .trim();
};

// Parse Turkish date formats (DD/MM/YYYY, DD.MM.YYYY)
const parseTurkishDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  
  const cleanDateStr = dateStr.toString().trim();
  
  // Handle various Turkish date formats
  const patterns = [
    /(\d{1,2})[\.\/](\d{1,2})[\.\/](\d{4})/, // DD/MM/YYYY or DD.MM.YYYY
    /(\d{1,2})[\.\/](\d{1,2})[\.\/](\d{2})/, // DD/MM/YY or DD.MM.YY
    /(\d{4})[\.\/\-](\d{1,2})[\.\/\-](\d{1,2})/ // YYYY/MM/DD or YYYY-MM-DD
  ];
  
  for (const pattern of patterns) {
    const match = cleanDateStr.match(pattern);
    if (match) {
      let day, month, year;
      
      if (pattern === patterns[2]) { // YYYY/MM/DD format
        year = parseInt(match[1]);
        month = parseInt(match[2]) - 1; // JavaScript months are 0-indexed
        day = parseInt(match[3]);
      } else { // DD/MM/YYYY format (Turkish standard)
        day = parseInt(match[1]);
        month = parseInt(match[2]) - 1; // JavaScript months are 0-indexed
        year = parseInt(match[3]);
        
        // Handle 2-digit years
        if (year < 100) {
          year += year < 50 ? 2000 : 1900;
        }
      }
      
      // Validate date components before creating Date object
      if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 1900) {
        const date = new Date(year, month, day);
        
        // Double-check the date is valid
        if (date.getFullYear() === year && 
            date.getMonth() === month && 
            date.getDate() === day) {
          return date;
        }
      }
    }
  }
  
  return null;
};

// Calculate similarity between two strings using Levenshtein distance
const calculateSimilarity = (str1: string, str2: string): number => {
  const norm1 = normalizeTurkishText(str1);
  const norm2 = normalizeTurkishText(str2);
  
  if (norm1 === norm2) return 100;
  if (!norm1 || !norm2) return 0;
  
  const matrix = [];
  const len1 = norm1.length;
  const len2 = norm2.length;
  
  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  // Calculate Levenshtein distance
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = norm1[i - 1] === norm2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,     // deletion
        matrix[i][j - 1] + 1,     // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  const distance = matrix[len1][len2];
  const maxLength = Math.max(len1, len2);
  
  return maxLength === 0 ? 100 : Math.round((1 - distance / maxLength) * 100);
};

// Find closest matching athletes for a given description
const findClosestMatches = (description: string, athletes: any[], limit: number = 5): SuggestedMatch[] => {
  const suggestions: SuggestedMatch[] = [];
  
  for (const athlete of athletes) {
    const athleteName = `${athlete.studentName || athlete.firstName || ''} ${athlete.studentSurname || athlete.lastName || ''}`.trim();
    const parentName = `${athlete.parentName || ''} ${athlete.parentSurname || ''}`.trim();
    
    // Calculate similarity with athlete name
    const athleteSimilarity = calculateSimilarity(description, athleteName);
    
    // Calculate similarity with parent name
    const parentSimilarity = calculateSimilarity(description, parentName);
    
    // Use the higher similarity score
    const maxSimilarity = Math.max(athleteSimilarity, parentSimilarity);
    
    // Also check for partial word matches
    const descWords = normalizeTurkishText(description).split(' ');
    const athleteWords = normalizeTurkishText(athleteName).split(' ');
    const parentWords = normalizeTurkishText(parentName).split(' ');
    
    let wordMatchScore = 0;
    for (const descWord of descWords) {
      if (descWord.length > 2) { // Only consider words longer than 2 characters
        for (const athleteWord of athleteWords) {
          if (athleteWord.includes(descWord) || descWord.includes(athleteWord)) {
            wordMatchScore += 20;
          }
        }
        for (const parentWord of parentWords) {
          if (parentWord.includes(descWord) || descWord.includes(parentWord)) {
            wordMatchScore += 20;
          }
        }
      }
    }
    
    const finalSimilarity = Math.max(maxSimilarity, Math.min(wordMatchScore, 100));
    
    if (finalSimilarity > 20) { // Only include if similarity is above 20%
      suggestions.push({
        athleteId: athlete.id.toString(),
        athleteName: athleteName,
        similarity: finalSimilarity
      });
    }
  }
  
  // Sort by similarity (highest first) and return top matches
  return suggestions
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
};

interface SuggestedMatch {
  athleteId: string;
  athleteName: string;
  similarity: number;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

const paymentMethods = ["Kredi Kartı", "Nakit", "Havale/EFT", "Çek"];

export default function PaymentsMulti() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [matchedPayments, setMatchedPayments] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualMatches, setManualMatches] = useState<{[key: number]: string}>({});
  const [multipleMatches, setMultipleMatches] = useState<{[key: number]: string[]}>({});
  const [paymentMatchHistory, setPaymentMatchHistory] = useState<{[key: string]: string}>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect if payment amount suggests multiple athletes
  const detectMultipleAthletes = (amount: number, suggestions: SuggestedMatch[]) => {
    // Get typical monthly fee amounts from existing account entries
    const storedAthletes = localStorage.getItem('athletes') || localStorage.getItem('students');
    let athletes = [];
    if (storedAthletes) {
      athletes = JSON.parse(storedAthletes);
    }

    // Collect typical amounts from account entries
    const typicalAmounts: number[] = [];
    athletes.forEach((athlete: any) => {
      const accountEntries = JSON.parse(localStorage.getItem(`account_${athlete.id}`) || '[]');
      accountEntries.forEach((entry: any) => {
        if (entry.type === 'debit' && entry.amountIncludingVat > 0) {
          typicalAmounts.push(entry.amountIncludingVat);
        }
      });
    });

    // If no account entries, use common amounts
    if (typicalAmounts.length === 0) {
      typicalAmounts.push(350, 400, 450, 500, 600, 700, 800); // Common monthly fees
    }

    // Find the most common amount (mode)
    const amountCounts: {[key: number]: number} = {};
    typicalAmounts.forEach(amt => {
      const rounded = Math.round(amt / 50) * 50; // Round to nearest 50
      amountCounts[rounded] = (amountCounts[rounded] || 0) + 1;
    });

    const mostCommonAmount = Object.keys(amountCounts).reduce((a, b) => 
      amountCounts[parseInt(a)] > amountCounts[parseInt(b)] ? a : b
    );

    const baseAmount = parseInt(mostCommonAmount);
    
    // Check if the payment amount is a multiple of the base amount
    const ratio = amount / baseAmount;
    const isMultiple = ratio >= 1.8 && ratio <= 5 && Math.abs(ratio - Math.round(ratio)) < 0.3;
    
    if (isMultiple) {
      const suggestedCount = Math.round(ratio);
      return {
        isMultiple: true,
        suggestedCount,
        baseAmount,
        confidence: Math.max(0, 100 - Math.abs(ratio - suggestedCount) * 50)
      };
    }

    return { isMultiple: false };
  };

  // Find siblings (same parent) for multi-athlete matching suggestions
  const findSiblings = (parentName: string, parentSurname: string) => {
    const storedAthletes = localStorage.getItem('athletes') || localStorage.getItem('students');
    let athletes = [];
    if (storedAthletes) {
      athletes = JSON.parse(storedAthletes);
    }

    const normalizedParentName = normalizeTurkishText(`${parentName} ${parentSurname}`);
    
    return athletes.filter((athlete: any) => {
      const athleteParentName = normalizeTurkishText(`${athlete.parentName || ''} ${athlete.parentSurname || ''}`);
      return athleteParentName === normalizedParentName && (athlete.status === 'Aktif' || !athlete.status);
    }).map(athlete => ({
      id: athlete.id,
      athleteName: `${athlete.studentName || athlete.firstName || ''} ${athlete.studentSurname || athlete.lastName || ''}`.trim(),
      parentName: `${athlete.parentName || ''} ${athlete.parentSurname || ''}`.trim(),
      sport: athlete.selectedSports ? athlete.selectedSports[0] : 'Genel'
    }));
  };

  // Handle multiple athlete matching for a single payment
  const handleMultipleAthleteMatch = (matchIndex: number, athleteIds: string[]) => {
    if (athleteIds.length === 0) {
      toast.error("En az bir sporcu seçmelisiniz");
      return;
    }

    const storedAthletes = localStorage.getItem('athletes') || localStorage.getItem('students');
    let athletes = [];
    if (storedAthletes) {
      athletes = JSON.parse(storedAthletes);
    }

    const selectedAthletes = athleteIds.map(id => {
      const athlete = athletes.find((a: any) => a.id.toString() === id);
      if (athlete) {
        return {
          id: athlete.id,
          athleteName: `${athlete.studentName || athlete.firstName || ''} ${athlete.studentSurname || athlete.lastName || ''}`.trim(),
          parentName: `${athlete.parentName || ''} ${athlete.parentSurname || ''}`.trim(),
          sport: athlete.selectedSports ? athlete.selectedSports[0] : 'Genel'
        };
      }
      return null;
    }).filter(Boolean);

    if (selectedAthletes.length === 0) {
      toast.error("Seçilen sporcular bulunamadı");
      return;
    }

    // Calculate amount per athlete (equal distribution)
    const totalAmount = matchedPayments[matchIndex].excelData.amount;
    const amountPerAthlete = totalAmount / selectedAthletes.length;

    // Create multiple matches for each athlete
    const updatedMatches = [...matchedPayments];
    
    // Remove the original unmatched entry
    updatedMatches.splice(matchIndex, 1);
    
    // Add new matches for each athlete
    selectedAthletes.forEach((athlete, index) => {
      const newMatch = {
        excelData: {
          ...matchedPayments[matchIndex].excelData,
          amount: amountPerAthlete,
          description: `${matchedPayments[matchIndex].excelData.description} (${index + 1}/${selectedAthletes.length})`
        },
        payment: {
          id: athlete.id,
          athleteName: athlete.athleteName,
          parentName: athlete.parentName,
          amount: amountPerAthlete,
          status: 'Bekliyor',
          sport: athlete.sport
        },
        status: 'matched',
        confidence: 100,
        isManual: true,
        isMultiple: true,
        multipleIndex: index + 1,
        multipleTotal: selectedAthletes.length
      };
      
      // Insert at the original position + index
      updatedMatches.splice(matchIndex + index, 0, newMatch);
    });
    
    setMatchedPayments(updatedMatches);
    
    // Clear multiple matches state
    const newMultipleMatches = { ...multipleMatches };
    delete newMultipleMatches[matchIndex];
    setMultipleMatches(newMultipleMatches);
    
    toast.success(`Ödeme ${selectedAthletes.length} sporcuya bölünerek eşleştirildi (${selectedAthletes.map(a => a.athleteName).join(', ')})`);
  };

  return (
    <>
      <Head>
        <title>Çoklu Sporcu Eşleştirme - SportsCRM</title>
        <meta name="description" content="Birden fazla sporcu için ödeme eşleştirme" />
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
                <UserPlus className="w-6 h-6 text-primary" />
                <h1 className="text-3xl font-bold">Çoklu Sporcu Eşleştirme</h1>
              </div>
              <p className="text-muted-foreground">Birden fazla çocuğu olan veliler için ödeme eşleştirme</p>
            </div>
          </motion.div>

          {/* Demo Card */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <Card>
              <CardHeader>
                <CardTitle>Çoklu Sporcu Eşleştirme Özelliği</CardTitle>
                <CardDescription>
                  Bu özellik velilerin birden fazla çocuğu için tek seferde ödeme yapması durumunu ele alır
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Feature Explanation */}
                  <Alert>
                    <UserPlus className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Yeni Özellik:</strong> Artık bir ödemeyi birden fazla sporcuya bölebilir, 
                      aynı veliye ait kardeşleri otomatik olarak tespit edebilir ve ödeme tutarını 
                      analiz ederek çoklu sporcu ödemesi olup olmadığını anlayabilirsiniz.
                    </AlertDescription>
                  </Alert>

                  {/* Features List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <Users className="h-8 w-8 text-blue-600" />
                          <h3 className="font-semibold">Akıllı Kardeş Tespiti</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Aynı veli adına kayıtlı sporcuları otomatik olarak tespit eder ve 
                          çoklu eşleştirme için önerir.
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <Calculator className="h-8 w-8 text-green-600" />
                          <h3 className="font-semibold">Tutar Analizi</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Ödeme tutarını analiz ederek tipik aylık aidat miktarının 
                          katları olup olmadığını kontrol eder.
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <DollarSign className="h-8 w-8 text-purple-600" />
                          <h3 className="font-semibold">Eşit Bölüştürme</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Toplam ödeme tutarını seçilen sporcu sayısına eşit olarak 
                          böler ve her birine ayrı kayıt oluşturur.
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <CheckCircle className="h-8 w-8 text-orange-600" />
                          <h3 className="font-semibold">Çoklu Seçim</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Checkbox'lar ile birden fazla sporcu seçebilir ve 
                          tek seferde hepsini eşleştirebilirsiniz.
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Usage Example */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Kullanım Örneği</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="bg-muted p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Senaryo:</h4>
                          <p className="text-sm">
                            Mehmet Yılmaz, iki çocuğu (Ahmet ve Ayşe) için toplam 700 TL ödeme yapmış. 
                            Banka ekstresinde "Mehmet Yılmaz 700 TL" şeklinde görünüyor.
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
                            <span className="text-sm">Sistem 700 TL'nin tipik aidat (350 TL) x 2 olduğunu tespit eder</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
                            <span className="text-sm">Mehmet Yılmaz'ın çocuklarını (Ahmet, Ayşe) önerir</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
                            <span className="text-sm">İkisini de seçip "Çoklu Eşleştir" butonuna tıklarsınız</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</span>
                            <span className="text-sm">Sistem 700 TL'yi ikiye böler: Ahmet 350 TL, Ayşe 350 TL</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Implementation Status */}
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Geliştirme Durumu:</strong> Bu özellik ana payments.tsx dosyasına entegre edilmeyi bekliyor. 
                      Şu anda demo amaçlı ayrı bir sayfada gösterilmektedir.
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-center">
                    <Button asChild>
                      <Link href="/payments">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Ana Ödemeler Sayfasına Dön
                      </Link>
                    </Button>
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