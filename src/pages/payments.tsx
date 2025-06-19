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
import { 
  CreditCard, 
  Plus,
  Search,
  Download,
  Edit,
  Trash2,
  Eye,
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
  RefreshCw
} from "lucide-react";
import { useRouter } from "next/router";
import Link from "next/link";
import Header from "@/components/Header";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

// Simple Turkish character normalization
const normalizeTurkish = (text: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

// Simple similarity calculation
const calculateSimilarity = (str1: string, str2: string): number => {
  if (!str1 || !str2) return 0;
  
  const norm1 = normalizeTurkish(str1);
  const norm2 = normalizeTurkish(str2);
  
  // Exact match
  if (norm1 === norm2) return 100;
  
  // Word-based matching
  const words1 = norm1.split(' ').filter(w => w.length > 1);
  const words2 = norm2.split(' ').filter(w => w.length > 1);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  let matchingWords = 0;
  for (const word1 of words1) {
    if (words2.includes(word1)) {
      matchingWords++;
    }
  }
  
  return Math.round((matchingWords / Math.max(words1.length, words2.length)) * 100);
};

// Parse Turkish date formats
const parseTurkishDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  
  const cleanDateStr = dateStr.toString().trim();
  const patterns = [
    /(\d{1,2})[\.\/](\d{1,2})[\.\/](\d{4})/, // DD/MM/YYYY or DD.MM.YYYY
    /(\d{4})[\.\/\-](\d{1,2})[\.\/\-](\d{1,2})/ // YYYY/MM/DD or YYYY-MM-DD
  ];
  
  for (const pattern of patterns) {
    const match = cleanDateStr.match(pattern);
    if (match) {
      let day, month, year;
      
      if (pattern === patterns[1]) { // YYYY/MM/DD format
        year = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        day = parseInt(match[3]);
      } else { // DD/MM/YYYY format
        day = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        year = parseInt(match[3]);
      }
      
      if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 1900) {
        const date = new Date(year, month, day);
        if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
          return date;
        }
      }
    }
  }
  
  return null;
};

// Parse Turkish amount format
const parseAmount = (amountStr: string): number => {
  if (!amountStr) return 0;
  
  try {
    let cleanAmount = amountStr.toString().trim();
    
    // Remove currency symbols and extra spaces
    cleanAmount = cleanAmount.replace(/[₺\s]/g, '');
    
    // Skip negative amounts - check for minus sign anywhere in the string
    if (cleanAmount.includes('-') || cleanAmount.startsWith('-')) {
      console.log(`Skipping negative amount: ${amountStr}`);
      return 0;
    }
    
    // Skip if it's clearly a date format (contains / or - with year patterns)
    const datePattern = /^\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4}$|^\d{2,4}[\/\.\-]\d{1,2}[\/\.\-]\d{1,2}$/;
    if (datePattern.test(cleanAmount)) {
      console.log(`Skipping date format: ${amountStr}`);
      return 0;
    }
    
    // Skip if it's empty after cleaning
    if (!cleanAmount || cleanAmount.length === 0) {
      return 0;
    }
    
    // Handle Turkish format: 2.100,00 (thousands separator with decimal)
    if (cleanAmount.includes('.') && cleanAmount.includes(',')) {
      const parsed = parseFloat(cleanAmount.replace(/\./g, '').replace(',', '.'));
      return isNaN(parsed) || parsed < 0 ? 0 : parsed;
    }
    // Handle format with comma as decimal: 1234,56
    else if (cleanAmount.includes(',') && !cleanAmount.includes('.')) {
      const parsed = parseFloat(cleanAmount.replace(',', '.'));
      return isNaN(parsed) || parsed < 0 ? 0 : parsed;
    }
    // Handle format with dot as thousands separator: 2.100
    else if (cleanAmount.includes('.') && !cleanAmount.includes(',')) {
      const parts = cleanAmount.split('.');
      if (parts.length === 2 && parts[1].length <= 2) {
        const parsed = parseFloat(cleanAmount); // Decimal: 1234.56
        return isNaN(parsed) || parsed < 0 ? 0 : parsed;
      } else {
        const parsed = parseFloat(cleanAmount.replace(/\./g, '')); // Thousands: 2.100
        return isNaN(parsed) || parsed < 0 ? 0 : parsed;
      }
    }
    // Handle integer: 1234
    else {
      const parsed = parseFloat(cleanAmount);
      return isNaN(parsed) || parsed < 0 ? 0 : parsed;
    }
  } catch (error) {
    console.error(`Error parsing amount "${amountStr}":`, error);
    return 0;
  }
};

interface ExcelRow {
  date: string;
  amount: number;
  description: string;
  reference: string;
  rowIndex: number;
}

interface MatchResult {
  excelRow: ExcelRow;
  athleteId: string | null;
  athleteName: string;
  parentName: string;
  similarity: number;
  isManual: boolean;
  multipleAthletes?: string[]; // For multi-athlete payments
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

const paymentMethods = ["Kredi Kartı", "Nakit", "Havale/EFT", "Çek"];

export default function Payments() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [athletes, setAthletes] = useState<any[]>([]);
  
  // Excel upload states
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [excelData, setExcelData] = useState<ExcelRow[]>([]);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [step, setStep] = useState<'upload' | 'review' | 'confirm'>('upload');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newPayment, setNewPayment] = useState({
    athleteId: '',
    amount: '',
    method: '',
    paymentDate: new Date().toISOString().split('T')[0],
    description: ''
  });

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const user = localStorage.getItem("currentUser");
    
    if (!role || role !== "admin") {
      router.push("/login");
      return;
    }

    setUserRole(role);
    if (user) {
      setCurrentUser(JSON.parse(user));
    }

    loadPayments();
  }, [router]);

  const loadPayments = () => {
    // Load athletes
    const storedAthletes = JSON.parse(localStorage.getItem('students') || '[]');
    const activeAthletes = storedAthletes.filter((athlete: any) => athlete.status === 'Aktif' || !athlete.status);
    setAthletes(activeAthletes);
    
    // Load existing payments
    const existingPayments = JSON.parse(localStorage.getItem('payments') || '[]');
    
    // Generate payments from athlete account entries (debit entries that haven't been paid)
    const generatedPayments: any[] = [];
    
    activeAthletes.forEach((athlete: any) => {
      const accountEntries = JSON.parse(localStorage.getItem(`account_${athlete.id}`) || '[]');
      
      // Find debit entries (charges) that don't have corresponding credit entries (payments)
      const debitEntries = accountEntries.filter((entry: any) => entry.type === 'debit');
      const creditEntries = accountEntries.filter((entry: any) => entry.type === 'credit');
      
      debitEntries.forEach((debitEntry: any) => {
        // Check if this debit has been paid (has corresponding credit)
        const isPaid = creditEntries.some((creditEntry: any) => 
          creditEntry.amountIncludingVat >= debitEntry.amountIncludingVat &&
          new Date(creditEntry.date) >= new Date(debitEntry.date)
        );
        
        // Check if payment already exists in existing payments
        const paymentExists = existingPayments.some((payment: any) => 
          payment.athleteId === athlete.id && 
          payment.description === debitEntry.description &&
          Math.abs(payment.amount - debitEntry.amountIncludingVat) < 0.01
        );
        
        if (!isPaid && !paymentExists) {
          // Create payment entry from debit
          const dueDate = new Date(debitEntry.date);
          dueDate.setMonth(dueDate.getMonth() + 1); // Due date is 1 month after charge date
          
          const isOverdue = new Date() > dueDate;
          
          generatedPayments.push({
            id: `generated_${athlete.id}_${debitEntry.id}`,
            athleteId: athlete.id,
            athleteName: `${athlete.studentName} ${athlete.studentSurname}`,
            parentName: `${athlete.parentName} ${athlete.parentSurname}`,
            amount: debitEntry.amountIncludingVat,
            method: '',
            paymentDate: null,
            status: isOverdue ? "Gecikmiş" : "Bekliyor",
            sport: athlete.sportsBranches?.[0] || athlete.selectedSports?.[0] || 'Genel',
            invoiceNumber: `INV-${debitEntry.id}`,
            dueDate: dueDate.toISOString().split('T')[0],
            description: debitEntry.description,
            accountEntryId: debitEntry.id,
            isGenerated: true
          });
        }
      });
    });
    
    // Combine existing payments with generated payments
    const allPayments = [...existingPayments, ...generatedPayments];
    setPayments(allPayments);
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.athleteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || payment.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const paidAmount = payments.filter(p => p.status === "Ödendi").reduce((sum, payment) => sum + payment.amount, 0);
  const pendingAmount = payments.filter(p => p.status === "Bekliyor").reduce((sum, payment) => sum + payment.amount, 0);
  const overdueAmount = payments.filter(p => p.status === "Gecikmiş").reduce((sum, payment) => sum + payment.amount, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Ödendi":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Ödendi</Badge>;
      case "Bekliyor":
        return <Badge variant="outline">Bekliyor</Badge>;
      case "Gecikmiş":
        return <Badge variant="destructive">Gecikmiş</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Step 1: Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && 
          file.type !== 'application/vnd.ms-excel') {
        toast.error("Lütfen Excel dosyası (.xlsx veya .xls) seçin");
        return;
      }
      setUploadedFile(file);
      setStep('upload');
      setExcelData([]);
      setMatchResults([]);
    }
  };

  // Step 2: Process Excel file (parse only, no matching yet)
  const processExcelFile = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setUploadProgress(0);

    try {
      // Progress simulation
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Read Excel file
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Get first worksheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      clearInterval(interval);
      setUploadProgress(100);

      // Process Excel data
      const parsedData: ExcelRow[] = [];
      
      // Skip header row and process data
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i] as any[];
        
        // Skip empty rows
        if (!row || row.length === 0 || !row.some(cell => cell)) continue;
        
        // Extract data from row
        let date = '';
        let amount = 0;
        let description = '';
        let reference = '';
        
        // Look for date, amount, description in the row
        for (let j = 0; j < row.length; j++) {
          const cell = row[j];
          if (cell && typeof cell === 'string') {
            // Try to parse date
            const parsedDate = parseTurkishDate(cell);
            if (parsedDate && !date) {
              date = cell;
            }
            
            // Look for description (usually the longest text field)
            if (cell.length > description.length && cell.length > 10) {
              description = cell;
            }
            
            // Look for reference number
            if (cell.match(/^[A-Z0-9]{6,}$/i) && !reference) {
              reference = cell;
            }
          }
          
          // Look for amount (number or string that can be parsed as amount)
          // But first check if it's not a date format
          if (typeof cell === 'number' && cell > 0 && amount === 0) {
            amount = cell;
          } else if (typeof cell === 'string' && cell.trim && cell.trim()) {
            try {
              // Check if the string looks like a date (contains / or - with year patterns)
              const datePattern = /^\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4}$|^\d{2,4}[\/\.\-]\d{1,2}[\/\.\-]\d{1,2}$/;
              if (!datePattern.test(cell.trim())) {
                const parsedAmount = parseAmount(cell);
                if (parsedAmount > 0 && amount === 0) {
                  amount = parsedAmount;
                }
              }
            } catch (error) {
              console.log(`Error parsing amount from cell: ${cell}`, error);
              // Continue processing other cells
            }
          }
        }
        
        // Only add if we have essential data
        if (date && amount > 0 && description) {
          parsedData.push({
            date: date,
            amount: amount,
            description: description,
            reference: reference || `REF${i}`,
            rowIndex: i + 1
          });
        }
      }

      if (parsedData.length === 0) {
        toast.error("Excel dosyasında geçerli ödeme verisi bulunamadı. Lütfen dosya formatını kontrol edin.");
        return;
      }

      setExcelData(parsedData);
      setStep('review');
      
      toast.success(`Excel dosyası başarıyla işlendi! ${parsedData.length} ödeme kaydı bulundu.`);
      
    } catch (error) {
      console.error('Excel processing error:', error);
      toast.error("Excel dosyası işlenirken hata oluştu. Lütfen dosya formatını kontrol edin.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 3: Find matches for each Excel row
  const findMatches = () => {
    const results: MatchResult[] = [];
    
    // Load payment matching history
    const matchingHistory = JSON.parse(localStorage.getItem('paymentMatchingHistory') || '{}');
    
    excelData.forEach(row => {
      let bestMatch: MatchResult = {
        excelRow: row,
        athleteId: null,
        athleteName: '',
        parentName: '',
        similarity: 0,
        isManual: false
      };
      
      // First, check if we have a historical match for this description
      const normalizedDescription = normalizeTurkish(row.description);
      const historicalMatch = matchingHistory[normalizedDescription];
      
      if (historicalMatch) {
        // Find the athlete from historical match
        const athlete = athletes.find(a => a.id.toString() === historicalMatch.athleteId);
        if (athlete) {
          bestMatch = {
            excelRow: row,
            athleteId: athlete.id.toString(),
            athleteName: `${athlete.studentName || ''} ${athlete.studentSurname || ''}`.trim(),
            parentName: `${athlete.parentName || ''} ${athlete.parentSurname || ''}`.trim(),
            similarity: 100, // Historical matches get 100% similarity
            isManual: false,
            multipleAthletes: historicalMatch.multipleAthletes
          };
          
          console.log(`Historical match found: ${bestMatch.athleteName} for "${row.description}"`);
        }
      } else {
        // Try to match with athletes using similarity
        athletes.forEach(athlete => {
          const athleteName = `${athlete.studentName || ''} ${athlete.studentSurname || ''}`.trim();
          const parentName = `${athlete.parentName || ''} ${athlete.parentSurname || ''}`.trim();
          
          if (!athleteName && !parentName) return;
          
          // Calculate similarity
          const athleteSimilarity = calculateSimilarity(row.description, athleteName);
          const parentSimilarity = calculateSimilarity(row.description, parentName);
          const maxSimilarity = Math.max(athleteSimilarity, parentSimilarity);
          
          if (maxSimilarity > bestMatch.similarity) {
            bestMatch = {
              excelRow: row,
              athleteId: athlete.id.toString(),
              athleteName: athleteName,
              parentName: parentName,
              similarity: maxSimilarity,
              isManual: false
            };
          }
        });
      }
      
      results.push(bestMatch);
    });
    
    setMatchResults(results);
    setStep('confirm');
    
    const historicalMatches = results.filter(r => r.similarity === 100 && !r.isManual).length;
    const highConfidenceMatches = results.filter(r => r.similarity >= 80 && r.similarity < 100).length;
    const mediumConfidenceMatches = results.filter(r => r.similarity >= 50 && r.similarity < 80).length;
    const lowConfidenceMatches = results.filter(r => r.similarity < 50).length;
    
    if (historicalMatches > 0) {
      toast.success(`Eşleştirme tamamlandı! ${historicalMatches} geçmiş eşleştirme otomatik uygulandı.`);
    }
    
    console.log(`Matching completed: Historical: ${historicalMatches}, High: ${highConfidenceMatches}, Medium: ${mediumConfidenceMatches}, Low: ${lowConfidenceMatches}`);
  };

  // Manual match update
  const updateManualMatch = (index: number, athleteId: string) => {
    const athlete = athletes.find(a => a.id.toString() === athleteId);
    if (!athlete) return;
    
    const updatedResults = [...matchResults];
    updatedResults[index] = {
      ...updatedResults[index],
      athleteId: athleteId,
      athleteName: `${athlete.studentName || ''} ${athlete.studentSurname || ''}`.trim(),
      parentName: `${athlete.parentName || ''} ${athlete.parentSurname || ''}`.trim(),
      similarity: 100, // Manual match gets 100%
      isManual: true
    };
    
    setMatchResults(updatedResults);
    toast.success(`Manuel eşleştirme yapıldı: ${athlete.studentName} ${athlete.studentSurname}`);
  };

  // Multi-athlete match
  const updateMultiAthleteMatch = (index: number, athleteIds: string[]) => {
    if (athleteIds.length === 0) return;
    
    const selectedAthletes = athleteIds.map(id => 
      athletes.find(a => a.id.toString() === id)
    ).filter(Boolean);
    
    if (selectedAthletes.length === 0) return;
    
    const updatedResults = [...matchResults];
    updatedResults[index] = {
      ...updatedResults[index],
      athleteId: selectedAthletes[0].id.toString(), // Primary athlete
      athleteName: selectedAthletes.map(a => `${a.studentName} ${a.studentSurname}`).join(', '),
      parentName: `${selectedAthletes[0].parentName || ''} ${selectedAthletes[0].parentSurname || ''}`.trim(),
      similarity: 100,
      isManual: true,
      multipleAthletes: athleteIds
    };
    
    setMatchResults(updatedResults);
    toast.success(`Çoklu eşleştirme yapıldı: ${selectedAthletes.length} sporcu`);
  };

  // Step 4: Confirm and save matches
  const confirmMatches = async () => {
    const validMatches = matchResults.filter(result => result.athleteId);
    
    if (validMatches.length === 0) {
      toast.error("Onaylanacak eşleştirme bulunamadı!");
      return;
    }

    setIsProcessing(true);
    
    try {
      const updatedPayments = [...payments];
      let processedCount = 0;
      
      // Load and update payment matching history
      const matchingHistory = JSON.parse(localStorage.getItem('paymentMatchingHistory') || '{}');
      
      // Check for existing payments to prevent duplicates
      const existingPaymentKeys = new Set();
      payments.forEach(payment => {
        if (payment.reference) {
          existingPaymentKeys.add(`${payment.athleteId}_${payment.reference}_${payment.amount}`);
        }
      });
      
      for (const match of validMatches) {
        const parsedDate = parseTurkishDate(match.excelRow.date);
        const paymentDate = parsedDate ? parsedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        const entryDate = parsedDate ? parsedDate.toISOString() : new Date().toISOString();
        const displayDate = parsedDate ? parsedDate.toLocaleDateString('tr-TR') : match.excelRow.date;
        
        // Save this match to history for future use
        const normalizedDescription = normalizeTurkish(match.excelRow.description);
        matchingHistory[normalizedDescription] = {
          athleteId: match.athleteId,
          athleteName: match.athleteName,
          parentName: match.parentName,
          multipleAthletes: match.multipleAthletes,
          lastUsed: new Date().toISOString(),
          usageCount: (matchingHistory[normalizedDescription]?.usageCount || 0) + 1
        };
        
        if (match.multipleAthletes && match.multipleAthletes.length > 1) {
          // Handle multi-athlete payments
          const amountPerAthlete = Math.round((match.excelRow.amount / match.multipleAthletes.length) * 100) / 100;
          
          for (const athleteId of match.multipleAthletes) {
            const athlete = athletes.find(a => a.id.toString() === athleteId);
            if (!athlete) continue;
            
            // Check for duplicate
            const paymentKey = `${athleteId}_${match.excelRow.reference}_${amountPerAthlete}`;
            if (existingPaymentKeys.has(paymentKey)) {
              console.log(`Skipping duplicate payment: ${paymentKey}`);
              continue;
            }
            
            // Create payment record
            const newPayment = {
              id: `multi_${athleteId}_${Date.now()}_${Math.random()}`,
              athleteId: athlete.id,
              athleteName: `${athlete.studentName || ''} ${athlete.studentSurname || ''}`.trim(),
              parentName: `${athlete.parentName || ''} ${athlete.parentSurname || ''}`.trim(),
              amount: amountPerAthlete,
              status: "Ödendi",
              paymentDate: paymentDate,
              method: "Havale/EFT",
              reference: match.excelRow.reference,
              sport: athlete.selectedSports?.[0] || athlete.sportsBranches?.[0] || 'Genel',
              invoiceNumber: `MULTI-${Date.now()}-${athlete.id}`,
              dueDate: paymentDate,
              description: `Çoklu ödeme (${match.multipleAthletes.length} sporcu) - ${match.excelRow.description}`,
              isGenerated: false
            };
            
            updatedPayments.push(newPayment);
            existingPaymentKeys.add(paymentKey);
            
            // Add to athlete's account
            const existingEntries = JSON.parse(localStorage.getItem(`account_${athlete.id}`) || '[]');
            const paymentEntry = {
              id: Date.now() + Math.random(),
              date: entryDate,
              month: entryDate.slice(0, 7),
              description: `EFT/Havale Tahsilatı (Çoklu ${match.multipleAthletes.length} sporcu) - ${displayDate} - ₺${amountPerAthlete} - Ref: ${match.excelRow.reference}`,
              amountExcludingVat: amountPerAthlete,
              vatRate: 0,
              vatAmount: 0,
              amountIncludingVat: amountPerAthlete,
              unitCode: 'Adet',
              type: 'credit'
            };
            
            existingEntries.push(paymentEntry);
            localStorage.setItem(`account_${athlete.id}`, JSON.stringify(existingEntries));
            processedCount++;
          }
        } else {
          // Handle single athlete payment
          const athlete = athletes.find(a => a.id.toString() === match.athleteId);
          if (!athlete) continue;
          
          // Check for duplicate
          const paymentKey = `${match.athleteId}_${match.excelRow.reference}_${match.excelRow.amount}`;
          if (existingPaymentKeys.has(paymentKey)) {
            console.log(`Skipping duplicate payment: ${paymentKey}`);
            continue;
          }
          
          // Try to update existing payment first
          const existingPayment = updatedPayments.find(p => 
            p.athleteId.toString() === match.athleteId && 
            p.status !== "Ödendi" &&
            Math.abs(p.amount - match.excelRow.amount) <= 50 // Allow some tolerance
          );
          
          if (existingPayment) {
            // Update existing payment
            existingPayment.status = "Ödendi";
            existingPayment.paymentDate = paymentDate;
            existingPayment.method = "Havale/EFT";
            existingPayment.reference = match.excelRow.reference;
          } else {
            // Create new payment record
            const newPayment = {
              id: `single_${match.athleteId}_${Date.now()}_${Math.random()}`,
              athleteId: athlete.id,
              athleteName: `${athlete.studentName || ''} ${athlete.studentSurname || ''}`.trim(),
              parentName: `${athlete.parentName || ''} ${athlete.parentSurname || ''}`.trim(),
              amount: match.excelRow.amount,
              status: "Ödendi",
              paymentDate: paymentDate,
              method: "Havale/EFT",
              reference: match.excelRow.reference,
              sport: athlete.selectedSports?.[0] || athlete.sportsBranches?.[0] || 'Genel',
              invoiceNumber: `SINGLE-${Date.now()}-${athlete.id}`,
              dueDate: paymentDate,
              description: `Tekil ödeme - ${match.excelRow.description}`,
              isGenerated: false
            };
            
            updatedPayments.push(newPayment);
          }
          
          existingPaymentKeys.add(paymentKey);
          
          // Add to athlete's account
          const existingEntries = JSON.parse(localStorage.getItem(`account_${athlete.id}`) || '[]');
          const paymentEntry = {
            id: Date.now() + Math.random(),
            date: entryDate,
            month: entryDate.slice(0, 7),
            description: `EFT/Havale Tahsilatı - ${displayDate} - ₺${match.excelRow.amount} - Ref: ${match.excelRow.reference}`,
            amountExcludingVat: match.excelRow.amount,
            vatRate: 0,
            vatAmount: 0,
            amountIncludingVat: match.excelRow.amount,
            unitCode: 'Adet',
            type: 'credit'
          };
          
          existingEntries.push(paymentEntry);
          localStorage.setItem(`account_${athlete.id}`, JSON.stringify(existingEntries));
          processedCount++;
        }
      }
      
      // Save updated matching history
      localStorage.setItem('paymentMatchingHistory', JSON.stringify(matchingHistory));
      
      // Save updated payments
      setPayments(updatedPayments);
      localStorage.setItem('payments', JSON.stringify(updatedPayments));
      
      // Reset states
      setIsUploadDialogOpen(false);
      setUploadedFile(null);
      setUploadProgress(0);
      setExcelData([]);
      setMatchResults([]);
      setStep('upload');
      
      toast.success(`${processedCount} ödeme başarıyla kaydedildi! Eşleştirmeler gelecek aylar için hatırlandı.`);
      
      // Reload payments to reflect changes
      loadPayments();
      
    } catch (error) {
      console.error('Error confirming matches:', error);
      toast.error("Ödemeler kaydedilirken hata oluştu");
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset upload process
  const resetUpload = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setExcelData([]);
    setMatchResults([]);
    setStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Get available athletes for manual matching
  const getAvailableAthletes = () => {
    return athletes
      .filter(athlete => athlete.status === 'Aktif' || !athlete.status)
      .map(athlete => ({
        id: athlete.id,
        name: `${athlete.studentName || ''} ${athlete.studentSurname || ''}`.trim(),
        parentName: `${athlete.parentName || ''} ${athlete.parentSurname || ''}`.trim(),
        sport: athlete.selectedSports?.[0] || athlete.sportsBranches?.[0] || 'Genel'
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'tr-TR'));
  };

  // Find siblings (athletes with same parent)
  const findSiblings = (athleteId: string) => {
    const athlete = athletes.find(a => a.id.toString() === athleteId);
    if (!athlete) return [];
    
    const parentName = `${athlete.parentName || ''} ${athlete.parentSurname || ''}`.trim();
    const parentPhone = athlete.parentPhone?.trim();
    const parentEmail = athlete.parentEmail?.trim();
    
    if (!parentName && !parentPhone && !parentEmail) return [];
    
    return athletes.filter(a => {
      if (a.id === athlete.id) return false;
      
      const aParentName = `${a.parentName || ''} ${a.parentSurname || ''}`.trim();
      const aParentPhone = a.parentPhone?.trim();
      const aParentEmail = a.parentEmail?.trim();
      
      // Match by parent name, phone, or email
      return (parentName && aParentName === parentName) ||
             (parentPhone && aParentPhone === parentPhone) ||
             (parentEmail && aParentEmail === parentEmail);
    });
  };

  // Save new payment function
  const saveNewPayment = () => {
    if (!newPayment.athleteId || !newPayment.amount || !newPayment.method) {
      toast.error("Lütfen tüm zorunlu alanları doldurun");
      return;
    }

    const selectedAthlete = athletes.find(a => a.id.toString() === newPayment.athleteId);
    if (!selectedAthlete) {
      toast.error("Seçilen sporcu bulunamadı");
      return;
    }

    const payment = {
      id: Date.now(),
      athleteId: selectedAthlete.id,
      athleteName: `${selectedAthlete.studentName} ${selectedAthlete.studentSurname}`,
      parentName: `${selectedAthlete.parentName} ${selectedAthlete.parentSurname}`,
      amount: parseFloat(newPayment.amount),
      method: newPayment.method,
      paymentDate: newPayment.paymentDate,
      status: "Ödendi",
      sport: selectedAthlete.sportsBranches?.[0] || 'Genel',
      invoiceNumber: `INV-${Date.now()}`,
      dueDate: newPayment.paymentDate,
      description: newPayment.description || `${newPayment.method} ile ödeme`
    };

    const updatedPayments = [...payments, payment];
    setPayments(updatedPayments);
    localStorage.setItem('payments', JSON.stringify(updatedPayments));

    // Add to athlete's account as credit
    const existingEntries = JSON.parse(localStorage.getItem(`account_${selectedAthlete.id}`) || '[]');
    const paymentEntry = {
      id: Date.now() + Math.random(),
      date: new Date(newPayment.paymentDate).toISOString(),
      month: newPayment.paymentDate.slice(0, 7),
      description: `${newPayment.method} ile ödeme - ${newPayment.description || 'Manuel ödeme kaydı'}`,
      amountExcludingVat: parseFloat(newPayment.amount),
      vatRate: 0,
      vatAmount: 0,
      amountIncludingVat: parseFloat(newPayment.amount),
      unitCode: 'Adet',
      type: 'credit'
    };
    
    existingEntries.push(paymentEntry);
    localStorage.setItem(`account_${selectedAthlete.id}`, JSON.stringify(existingEntries));

    // Reset form
    setNewPayment({
      athleteId: '',
      amount: '',
      method: '',
      paymentDate: new Date().toISOString().split('T')[0],
      description: ''
    });

    setIsAddDialogOpen(false);
    toast.success(`${selectedAthlete.studentName} ${selectedAthlete.studentSurname} için ödeme kaydı oluşturuldu`);
  };

  // Clear all fields function
  const clearAllFields = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setNewPayment({
      athleteId: '',
      amount: '',
      method: '',
      paymentDate: new Date().toISOString().split('T')[0],
      description: ''
    });
    resetUpload();
    setIsAddDialogOpen(false);
    setIsUploadDialogOpen(false);
    setIsInvoiceDialogOpen(false);
    toast.success("Tüm alanlar temizlendi");
  };

  // Export payments to Excel
  const exportPaymentsToExcel = () => {
    try {
      const exportData = filteredPayments.map(payment => ({
        'Sporcu Adı Soyadı': payment.athleteName,
        'Veli Adı Soyadı': payment.parentName,
        'Spor Branşı': payment.sport,
        'Tutar (₺)': payment.amount,
        'Ödeme Durumu': payment.status,
        'Vade Tarihi': new Date(payment.dueDate).toLocaleDateString('tr-TR'),
        'Ödeme Tarihi': payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('tr-TR') : 'Ödenmedi',
        'Ödeme Yöntemi': payment.method || 'Belirtilmemiş',
        'Fatura Numarası': payment.invoiceNumber,
        'Açıklama': payment.description || ''
      }));

      if (exportData.length === 0) {
        toast.error("Dışa aktarılacak ödeme kaydı bulunamadı");
        return;
      }

      const headers = Object.keys(exportData[0]);
      const csvRows = [];
      csvRows.push(headers.join(';'));
      
      exportData.forEach(row => {
        const rowValues = headers.map(header => {
          const value = row[header as keyof typeof row];
          const stringValue = String(value || '');
          return `"${stringValue.replace(/"/g, '""')}"`;
        });
        csvRows.push(rowValues.join(';'));
      });
      
      const csvContent = csvRows.join('\r\n');
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      const currentDate = new Date().toISOString().slice(0, 10);
      const fileName = `Odemeler_${currentDate}.csv`;
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`${exportData.length} ödeme kaydı Excel'e aktarıldı! (${fileName})`);
      
    } catch (error) {
      console.error('Excel export error:', error);
      toast.error("Excel dışa aktarma sırasında hata oluştu");
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <>
      <Head>
        <title>Ödemeler - SportsCRM</title>
        <meta name="description" content="Ödeme yönetimi" />
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
                <CreditCard className="w-6 h-6 text-primary" />
                <h1 className="text-3xl font-bold">Ödemeler</h1>
              </div>
              <p className="text-muted-foreground">Aidat ve ödeme takibi</p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearAllFields}>
                <X className="h-4 w-4 mr-2" />
                Alanları Temizle
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
                    <p className="text-sm font-medium text-muted-foreground">Toplam Tutar</p>
                    <p className="text-2xl font-bold">₺{totalAmount.toLocaleString()}</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tahsil Edilen</p>
                    <p className="text-2xl font-bold text-green-600">₺{paidAmount.toLocaleString()}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bekleyen</p>
                    <p className="text-2xl font-bold text-orange-600">₺{pendingAmount.toLocaleString()}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Gecikmiş</p>
                    <p className="text-2xl font-bold text-red-600">₺{overdueAmount.toLocaleString()}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabs */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <Tabs defaultValue="payments" className="space-y-6">
              <TabsList>
                <TabsTrigger value="payments">Ödemeler</TabsTrigger>
                <TabsTrigger value="reports">Raporlar</TabsTrigger>
              </TabsList>

              <TabsContent value="payments" className="space-y-6">
                {/* Filters and Actions */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                      <div className="flex flex-col md:flex-row gap-4 flex-1">
                        <div className="relative flex-1 max-w-sm">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input 
                            placeholder="Sporcu, veli veya fatura ara..." 
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Ödeme Durumu" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tüm Durumlar</SelectItem>
                            <SelectItem value="Ödendi">Ödendi</SelectItem>
                            <SelectItem value="Bekliyor">Bekliyor</SelectItem>
                            <SelectItem value="Gecikmiş">Gecikmiş</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex gap-2">
                        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline">
                              <Upload className="h-4 w-4 mr-2" />
                              Excel Extre Yükle
                            </Button>
                          </DialogTrigger>
                        </Dialog>

                        <Button variant="outline" onClick={exportPaymentsToExcel}>
                          <Download className="h-4 w-4 mr-2" />
                          Excel Dışa Aktar
                        </Button>
                        
                        <Button variant="outline">
                          <Send className="h-4 w-4 mr-2" />
                          Toplu Hatırlatma
                        </Button>
                        
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                          <DialogTrigger asChild>
                            <Button>
                              <Plus className="h-4 w-4 mr-2" />
                              Ödeme Kaydet
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Yeni Ödeme Kaydı</DialogTitle>
                              <DialogDescription>
                                Ödeme bilgilerini girin
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="athlete">Sporcu</Label>
                                <Select value={newPayment.athleteId} onValueChange={(value) => setNewPayment(prev => ({ ...prev, athleteId: value }))}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sporcu seçin" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {athletes.map(athlete => (
                                      <SelectItem key={athlete.id} value={athlete.id.toString()}>
                                        <div className="flex flex-col">
                                          <span className="font-medium">{athlete.studentName} {athlete.studentSurname}</span>
                                          <span className="text-xs text-muted-foreground">
                                            {athlete.parentName} {athlete.parentSurname} - {athlete.sportsBranches?.[0] || 'Genel'}
                                          </span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="amount">Tutar (₺)</Label>
                                <Input 
                                  id="amount" 
                                  type="number" 
                                  placeholder="350" 
                                  value={newPayment.amount}
                                  onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="method">Ödeme Yöntemi</Label>
                                <Select value={newPayment.method} onValueChange={(value) => setNewPayment(prev => ({ ...prev, method: value }))}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Yöntem seçin" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {paymentMethods.map(method => (
                                      <SelectItem key={method} value={method}>{method}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="paymentDate">Ödeme Tarihi</Label>
                                <Input 
                                  id="paymentDate" 
                                  type="date" 
                                  value={newPayment.paymentDate}
                                  onChange={(e) => setNewPayment(prev => ({ ...prev, paymentDate: e.target.value }))}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="description">Açıklama (Opsiyonel)</Label>
                                <Input 
                                  id="description" 
                                  placeholder="Ödeme açıklaması" 
                                  value={newPayment.description}
                                  onChange={(e) => setNewPayment(prev => ({ ...prev, description: e.target.value }))}
                                />
                              </div>
                            </div>
                            
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                İptal
                              </Button>
                              <Button onClick={saveNewPayment}>
                                Kaydet
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payments Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ödeme Listesi ({filteredPayments.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {filteredPayments.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Sporcu</TableHead>
                            <TableHead>Veli</TableHead>
                            <TableHead>Tutar</TableHead>
                            <TableHead>Vade Tarihi</TableHead>
                            <TableHead>Ödeme Tarihi</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead>Yöntem</TableHead>
                            <TableHead>Fatura No</TableHead>
                            <TableHead>İşlemler</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredPayments.map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <Avatar>
                                    <AvatarImage src={payment.avatar} />
                                    <AvatarFallback>{getInitials(payment.athleteName)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{payment.athleteName}</p>
                                    <p className="text-sm text-muted-foreground">{payment.sport}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{payment.parentName}</TableCell>
                              <TableCell className="font-medium">₺{payment.amount}</TableCell>
                              <TableCell>{new Date(payment.dueDate).toLocaleDateString('tr-TR')}</TableCell>
                              <TableCell>
                                {payment.paymentDate 
                                  ? new Date(payment.paymentDate).toLocaleDateString('tr-TR')
                                  : "-"
                                }
                              </TableCell>
                              <TableCell>{getStatusBadge(payment.status)}</TableCell>
                              <TableCell>{payment.method || "-"}</TableCell>
                              <TableCell>
                                <code className="text-xs bg-muted px-2 py-1 rounded">
                                  {payment.invoiceNumber}
                                </code>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => {
                                      alert(`Ödeme Detayları:\n\nSporcu: ${payment.athleteName}\nVeli: ${payment.parentName}\nTutar: ₺${payment.amount}\nDurum: ${payment.status}\nVade: ${new Date(payment.dueDate).toLocaleDateString('tr-TR')}\nAçıklama: ${payment.description || 'Yok'}`);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => {
                                      const receiptData = `ÖDEME MAKBUZu\n\nSporcu: ${payment.athleteName}\nVeli: ${payment.parentName}\nTutar: ₺${payment.amount}\nTarih: ${payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('tr-TR') : 'Ödenmedi'}\nYöntem: ${payment.method || 'Belirtilmemiş'}\nFatura No: ${payment.invoiceNumber}`;
                                      
                                      const blob = new Blob([receiptData], { type: 'text/plain;charset=utf-8' });
                                      const url = URL.createObjectURL(blob);
                                      const link = document.createElement('a');
                                      link.href = url;
                                      link.download = `Makbuz_${payment.invoiceNumber}.txt`;
                                      link.click();
                                      URL.revokeObjectURL(url);
                                    }}
                                  >
                                    <Receipt className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => {
                                      const newAmount = prompt(`${payment.athleteName} için yeni tutar girin:`, payment.amount.toString());
                                      if (newAmount && !isNaN(parseFloat(newAmount))) {
                                        const updatedPayments = payments.map(p => 
                                          p.id === payment.id 
                                            ? { ...p, amount: parseFloat(newAmount) }
                                            : p
                                        );
                                        setPayments(updatedPayments);
                                        localStorage.setItem('payments', JSON.stringify(updatedPayments));
                                        toast.success('Ödeme tutarı güncellendi');
                                      }
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8">
                        <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Henüz ödeme kaydı bulunmuyor</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reports" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Ödeme Raporları</CardTitle>
                    <CardDescription>
                      Detaylı ödeme analizleri ve raporlar
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium">Aylık Gelir Trendi</h3>
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Haziran</span>
                              <span className="font-medium">₺{Math.round(paidAmount * 0.4).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Mayıs</span>
                              <span className="font-medium">₺{Math.round(paidAmount * 0.35).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Nisan</span>
                              <span className="font-medium">₺{Math.round(paidAmount * 0.25).toLocaleString()}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium">Branş Bazında Gelir</h3>
                            <BarChart3 className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Futbol</span>
                              <span className="font-medium">₺{Math.round(paidAmount * 0.4).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Basketbol</span>
                              <span className="font-medium">₺{Math.round(paidAmount * 0.35).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Yüzme</span>
                              <span className="font-medium">₺{Math.round(paidAmount * 0.25).toLocaleString()}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Excel Upload Dialog - Completely Rebuilt */}
          <Dialog open={isUploadDialogOpen} onOpenChange={(open) => {
            setIsUploadDialogOpen(open);
            if (!open) {
              resetUpload();
            }
          }}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Banka Extre Dosyası Yükle</DialogTitle>
                <DialogDescription>
                  Bankadan aldığınız Excel extre dosyasını yükleyerek ödemeleri güvenli şekilde eşleştirin
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Step Indicator */}
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <div className={`flex items-center space-x-2 ${step === 'upload' ? 'text-primary' : step === 'review' || step === 'confirm' ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'upload' ? 'bg-primary text-primary-foreground' : step === 'review' || step === 'confirm' ? 'bg-green-600 text-white' : 'bg-muted'}`}>
                      1
                    </div>
                    <span className="text-sm font-medium">Dosya Yükle</span>
                  </div>
                  <div className="w-8 h-px bg-muted"></div>
                  <div className={`flex items-center space-x-2 ${step === 'review' ? 'text-primary' : step === 'confirm' ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'review' ? 'bg-primary text-primary-foreground' : step === 'confirm' ? 'bg-green-600 text-white' : 'bg-muted'}`}>
                      2
                    </div>
                    <span className="text-sm font-medium">İnceleme</span>
                  </div>
                  <div className="w-8 h-px bg-muted"></div>
                  <div className={`flex items-center space-x-2 ${step === 'confirm' ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'confirm' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      3
                    </div>
                    <span className="text-sm font-medium">Onay</span>
                  </div>
                </div>

                {/* Step 1: File Upload */}
                {step === 'upload' && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                          <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Excel dosyasını seçin</p>
                            <p className="text-xs text-muted-foreground">
                              Desteklenen formatlar: .xlsx, .xls
                            </p>
                          </div>
                          <Input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileUpload}
                            className="mt-4"
                            ref={fileInputRef}
                          />
                        </div>
                        
                        {uploadedFile && (
                          <Alert>
                            <FileSpreadsheet className="h-4 w-4" />
                            <AlertDescription>
                              Seçilen dosya: {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        {uploadedFile && !isProcessing && (
                          <Button onClick={processExcelFile} className="w-full">
                            <Upload className="h-4 w-4 mr-2" />
                            Dosyayı İşle
                          </Button>
                        )}
                        
                        {isProcessing && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Dosya işleniyor...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <Progress value={uploadProgress} className="w-full" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step 2: Review Excel Data */}
                {step === 'review' && excelData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Excel Verisi İnceleme</CardTitle>
                      <CardDescription>
                        {excelData.length} ödeme kaydı bulundu. Devam etmek için "Eşleştirmeyi Başlat" butonuna tıklayın.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Satır</TableHead>
                              <TableHead>Tarih</TableHead>
                              <TableHead>Tutar</TableHead>
                              <TableHead>Açıklama</TableHead>
                              <TableHead>Referans</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {excelData.slice(0, 10).map((row, index) => (
                              <TableRow key={index}>
                                <TableCell>{row.rowIndex}</TableCell>
                                <TableCell>{row.date}</TableCell>
                                <TableCell className="font-medium">₺{row.amount.toLocaleString()}</TableCell>
                                <TableCell className="max-w-xs truncate">{row.description}</TableCell>
                                <TableCell>{row.reference}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        
                        {excelData.length > 10 && (
                          <p className="text-sm text-muted-foreground text-center">
                            ... ve {excelData.length - 10} kayıt daha
                          </p>
                        )}
                        
                        <div className="flex justify-between">
                          <Button variant="outline" onClick={resetUpload}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Geri
                          </Button>
                          <Button onClick={findMatches}>
                            <Search className="h-4 w-4 mr-2" />
                            Eşleştirmeyi Başlat
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step 3: Confirm Matches */}
                {step === 'confirm' && matchResults.length > 0 && (
                  <div className="space-y-6">
                    {/* Regular Matches */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Eşleştirme Sonuçları</CardTitle>
                        <CardDescription>
                          Eşleştirmeleri kontrol edin ve onaylayın. Manuel düzeltme yapabilirsiniz.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {matchResults
                            .filter(result => !result.multipleAthletes || result.multipleAthletes.length <= 1)
                            .map((result, index) => (
                            <Card key={index} className={`border ${result.similarity >= 80 ? 'border-green-200 bg-green-50' : result.similarity >= 50 ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50'}`}>
                              <CardContent className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Excel Data */}
                                  <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Excel Verisi:</Label>
                                    <div className="mt-1">
                                      <p className="font-medium">{result.excelRow.description}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {result.excelRow.date} - ₺{result.excelRow.amount.toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {/* Match Result */}
                                  <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Eşleştirme:</Label>
                                    <div className="mt-1">
                                      {result.athleteId ? (
                                        <div>
                                          <div className="flex items-center space-x-2">
                                            <p className="font-medium">{result.athleteName}</p>
                                            <Badge variant="outline" className="text-xs">
                                              %{result.similarity} {result.isManual ? '(Manuel)' : '(Otomatik)'}
                                            </Badge>
                                          </div>
                                          <p className="text-sm text-muted-foreground">{result.parentName}</p>
                                        </div>
                                      ) : (
                                        <p className="text-sm text-red-600">Eşleştirilemedi</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Manual Matching Options */}
                                <div className="mt-4 pt-4 border-t">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Single Athlete Selection */}
                                    <div>
                                      <Label className="text-sm font-medium">Tekil Eşleştirme:</Label>
                                      <Select 
                                        value={result.athleteId || ""} 
                                        onValueChange={(value) => updateManualMatch(index, value)}
                                      >
                                        <SelectTrigger className="mt-2">
                                          <SelectValue placeholder="Sporcu seçin..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {getAvailableAthletes().map(athlete => (
                                            <SelectItem key={athlete.id} value={athlete.id.toString()}>
                                              <div className="flex flex-col">
                                                <span className="font-medium">{athlete.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                  {athlete.parentName} - {athlete.sport}
                                                </span>
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    
                                    {/* Multi-Athlete Selection */}
                                    <div>
                                      <Label className="text-sm font-medium">Çoklu Eşleştirme (Kardeşler):</Label>
                                      {result.athleteId && (
                                        <div className="mt-2">
                                          {(() => {
                                            const siblings = findSiblings(result.athleteId);
                                            if (siblings.length > 0) {
                                              const allSiblings = [
                                                athletes.find(a => a.id.toString() === result.athleteId),
                                                ...siblings
                                              ].filter(Boolean);
                                              
                                              return (
                                                <div className="space-y-2">
                                                  <p className="text-xs text-muted-foreground">
                                                    {allSiblings.length} kardeş bulundu (₺{(result.excelRow.amount / allSiblings.length).toFixed(2)} / sporcu)
                                                  </p>
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => updateMultiAthleteMatch(index, allSiblings.map(a => a.id.toString()))}
                                                  >
                                                    <Users className="h-4 w-4 mr-2" />
                                                    Tüm Kardeşlere Böl
                                                  </Button>
                                                </div>
                                              );
                                            } else {
                                              return (
                                                <p className="text-xs text-muted-foreground mt-2">
                                                  Kardeş bulunamadı
                                                </p>
                                              );
                                            }
                                          })()}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Sibling Matches Section - Separated and Highlighted */}
                    {matchResults.filter(result => result.multipleAthletes && result.multipleAthletes.length > 1).length > 0 && (
                      <Card className="border-purple-200 bg-purple-50">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2 text-purple-800">
                            <Users className="h-5 w-5" />
                            <span>Kardeş Eşleştirmeleri</span>
                          </CardTitle>
                          <CardDescription className="text-purple-700">
                            Bu ödemeler birden fazla kardeş için yapılmış ve tutarlar eşit olarak bölünecek.
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {matchResults
                              .filter(result => result.multipleAthletes && result.multipleAthletes.length > 1)
                              .map((result, index) => (
                              <Card key={index} className="border-purple-300 bg-white">
                                <CardContent className="p-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Excel Data */}
                                    <div>
                                      <Label className="text-sm font-medium text-purple-700">Excel Verisi:</Label>
                                      <div className="mt-1">
                                        <p className="font-medium">{result.excelRow.description}</p>
                                        <p className="text-sm text-muted-foreground">
                                          {result.excelRow.date} - ₺{result.excelRow.amount.toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    {/* Match Result */}
                                    <div>
                                      <Label className="text-sm font-medium text-purple-700">Kardeş Eşleştirmesi:</Label>
                                      <div className="mt-1">
                                        <div className="flex items-center space-x-2">
                                          <p className="font-medium text-purple-800">{result.athleteName}</p>
                                          <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                                            {result.multipleAthletes?.length} Kardeş
                                          </Badge>
                                        </div>
                                        <p className="text-sm text-purple-600">
                                          Her sporcu: ₺{(result.excelRow.amount / (result.multipleAthletes?.length || 1)).toFixed(2)}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Sibling Details */}
                                  <div className="mt-4 pt-4 border-t border-purple-200">
                                    <Label className="text-sm font-medium text-purple-700">Kardeş Listesi:</Label>
                                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {result.multipleAthletes?.map(athleteId => {
                                        const athlete = athletes.find(a => a.id.toString() === athleteId);
                                        return athlete ? (
                                          <div key={athleteId} className="flex items-center space-x-2 p-2 bg-purple-100 rounded">
                                            <Users className="h-4 w-4 text-purple-600" />
                                            <span className="text-sm font-medium text-purple-800">
                                              {athlete.studentName} {athlete.studentSurname}
                                            </span>
                                          </div>
                                        ) : null;
                                      })}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-between pt-4">
                      <Button variant="outline" onClick={() => setStep('review')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Geri
                      </Button>
                      <div className="space-x-2">
                        <Button variant="outline" onClick={resetUpload}>
                          <X className="h-4 w-4 mr-2" />
                          İptal
                        </Button>
                        <Button onClick={confirmMatches} disabled={isProcessing}>
                          {isProcessing ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 mr-2" />
                          )}
                          Eşleştirmeleri Onayla ({matchResults.filter(r => r.athleteId).length})
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}