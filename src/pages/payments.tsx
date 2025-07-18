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
import { 
  normalizeTurkish, 
  calculateTurkishSimilarity, 
  findTurkishMatches, 
  TurkishMatchingMemory,
  type ManualMatch 
} from '@/lib/turkish-matching';
import { 
  calculateVatBreakdown, 
  formatCurrency, 
  VAT_RATE_OPTIONS,
  roundToWholeNumber 
} from '@/lib/vat-utils';
import { DuplicatePreventionSystem } from '@/lib/duplicate-prevention';

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

// Parse Turkish amount format - Improved version
const parseAmount = (amountStr: string | number): number => {
  if (!amountStr && amountStr !== 0) return 0;
  
  try {
    // Handle numeric values directly
    if (typeof amountStr === 'number') {
      return amountStr < 0 ? 0 : amountStr;
    }
    
    let cleanAmount = amountStr.toString().trim();
    
    // Skip empty values
    if (!cleanAmount || cleanAmount.length === 0) {
      return 0;
    }
    
    // Remove currency symbols, spaces, and other non-numeric characters except . , -
    cleanAmount = cleanAmount.replace(/[₺\s\u00A0]/g, '');
    
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
    
    // Skip if it contains letters (likely text, not amount)
    if (/[a-zA-ZçğıöşüÇĞIİÖŞÜ]/.test(cleanAmount)) {
      console.log(`Skipping text content: ${amountStr}`);
      return 0;
    }
    
    // Handle Turkish format: 2.100,00 (thousands separator with decimal)
    if (cleanAmount.includes('.') && cleanAmount.includes(',')) {
      // Find the last comma (decimal separator)
      const lastCommaIndex = cleanAmount.lastIndexOf(',');
      const beforeComma = cleanAmount.substring(0, lastCommaIndex);
      const afterComma = cleanAmount.substring(lastCommaIndex + 1);
      
      // Check if after comma has 2 digits (decimal part)
      if (afterComma.length <= 2 && /^\d+$/.test(afterComma)) {
        const parsed = parseFloat(beforeComma.replace(/\./g, '') + '.' + afterComma);
        return isNaN(parsed) || parsed < 0 ? 0 : parsed;
      }
    }
    // Handle format with comma as decimal: 1234,56
    else if (cleanAmount.includes(',') && !cleanAmount.includes('.')) {
      const parts = cleanAmount.split(',');
      if (parts.length === 2 && parts[1].length <= 2) {
        const parsed = parseFloat(parts[0] + '.' + parts[1]);
        return isNaN(parsed) || parsed < 0 ? 0 : parsed;
      }
    }
    // Handle format with dot as decimal or thousands separator
    else if (cleanAmount.includes('.') && !cleanAmount.includes(',')) {
      const parts = cleanAmount.split('.');
      if (parts.length === 2) {
        // If last part has 2 digits, treat as decimal
        if (parts[1].length <= 2) {
          const parsed = parseFloat(cleanAmount);
          return isNaN(parsed) || parsed < 0 ? 0 : parsed;
        } else {
          // Treat as thousands separator
          const parsed = parseFloat(cleanAmount.replace(/\./g, ''));
          return isNaN(parsed) || parsed < 0 ? 0 : parsed;
        }
      } else if (parts.length > 2) {
        // Multiple dots, treat as thousands separators
        const parsed = parseFloat(cleanAmount.replace(/\./g, ''));
        return isNaN(parsed) || parsed < 0 ? 0 : parsed;
      }
    }
    
    // Handle integer: 1234
    const parsed = parseFloat(cleanAmount);
    return isNaN(parsed) || parsed < 0 ? 0 : parsed;
    
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
  paymentType?: string;
}

interface MatchResult {
  excelRow: ExcelRow;
  athleteId: string | null;
  athleteName: string;
  parentName: string;
  similarity: number;
  isManual: boolean;
  isSiblingPayment?: boolean;
  siblingIds?: string[];
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

  // Account dialog states
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<any>(null);
  const [accountEntries, setAccountEntries] = useState<any[]>([]);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    month: new Date().toISOString().slice(0, 7),
    description: '',
    amountExcludingVat: '',
    vatRate: '20',
    amountIncludingVat: '',
    unitCode: 'Ay',
    type: 'debit'
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
    // Load ALL athletes (including passive ones) for payment matching
    const storedAthletes = JSON.parse(localStorage.getItem('students') || '[]');
    // FIXED: Include ALL athletes for payment matching, not just active ones
    setAthletes(storedAthletes);
    
    // Load existing payments
    const existingPayments = JSON.parse(localStorage.getItem('payments') || '[]');
    
    // Generate payments from athlete account entries based on balance
    // Only generate for ACTIVE athletes, but keep ALL athletes for matching
    const generatedPayments: any[] = [];
    const activeAthletes = storedAthletes.filter((athlete: any) => athlete.status === 'Aktif' || !athlete.status);
    
    activeAthletes.forEach((athlete: any) => {
      const accountEntries = JSON.parse(localStorage.getItem(`account_${athlete.id}`) || '[]');
      
      // Calculate balance (debit - credit) with proper number handling
      const balance = accountEntries.reduce((total: number, entry: any) => {
        const amount = parseFloat(String(entry.amountIncludingVat || 0).replace(',', '.')) || 0;
        return entry.type === 'debit' 
          ? total + amount
          : total - amount;
      }, 0);
      
      // Round to 2 decimal places to avoid floating point errors
      const roundedBalance = Math.round(balance * 100) / 100;
      
      // Only create payment entry if there's a positive balance (debt)
      if (roundedBalance > 0) {
        // Check if payment already exists for this athlete
        const paymentExists = existingPayments.some((payment: any) => 
          payment.athleteId === athlete.id && payment.isGenerated
        );
        
        if (!paymentExists) {
          // Find the latest debit entry to determine due date
          const debitEntries = accountEntries.filter((entry: any) => entry.type === 'debit');
          const latestDebit = debitEntries.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
          
          let dueDate = new Date();
          if (latestDebit && latestDebit.dueDate) {
            dueDate = new Date(latestDebit.dueDate);
          } else if (latestDebit) {
            dueDate = new Date(latestDebit.date);
            dueDate.setMonth(dueDate.getMonth() + 1); // Due date is 1 month after charge date
          }
          
          const isOverdue = new Date() > dueDate;
          
          generatedPayments.push({
            id: `generated_${athlete.id}_balance`,
            athleteId: athlete.id,
            athleteName: `${athlete.studentName} ${athlete.studentSurname}`,
            parentName: `${athlete.parentName} ${athlete.parentSurname}`,
            amount: roundedBalance,
            method: '',
            paymentDate: null,
            status: isOverdue ? "Gecikmiş" : "Bekliyor",
            sport: athlete.sportsBranches?.[0] || athlete.selectedSports?.[0] || 'Genel',
            invoiceNumber: `BAL-${athlete.id}`,
            dueDate: dueDate.toISOString().split('T')[0],
            description: `Toplam Borç Bakiyesi`,
            accountEntryId: null,
            isGenerated: true
          });
        }
      }
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

  // Helper function for proper amount formatting
  const formatAmount = (amount: number): number => {
    return Math.round(amount * 100) / 100;
  };

  const totalAmount = formatAmount(payments.reduce((sum, payment) => sum + payment.amount, 0));
  const paidAmount = formatAmount(payments.filter(p => p.status === "Ödendi").reduce((sum, payment) => sum + payment.amount, 0));
  const pendingAmount = formatAmount(payments.filter(p => p.status === "Bekliyor").reduce((sum, payment) => sum + payment.amount, 0));
  const overdueAmount = formatAmount(payments.filter(p => p.status === "Gecikmiş").reduce((sum, payment) => sum + payment.amount, 0));

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
    if (!uploadedFile) {
      toast.error("Lütfen önce bir dosya seçin");
      return;
    }

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

      // Read Excel file with better error handling
      let arrayBuffer: ArrayBuffer;
      try {
        arrayBuffer = await uploadedFile.arrayBuffer();
      } catch (error) {
        clearInterval(interval);
        throw new Error("Dosya okunamadı. Dosyanın bozuk olmadığından emin olun.");
      }

      let workbook: any;
      try {
        workbook = XLSX.read(arrayBuffer, { 
          type: 'array',
          cellDates: true,
          cellNF: false,
          cellText: false
        });
      } catch (error) {
        clearInterval(interval);
        throw new Error("Excel dosyası geçersiz. Lütfen .xlsx veya .xls formatında bir dosya seçin.");
      }
      
      // Check if workbook has sheets
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        clearInterval(interval);
        throw new Error("Excel dosyasında sayfa bulunamadı.");
      }

      // Get first worksheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      if (!worksheet) {
        clearInterval(interval);
        throw new Error("Excel sayfası okunamadı.");
      }

      // Convert to JSON with better options
      let jsonData: any[][];
      try {
        jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: '',
          blankrows: false
        });
      } catch (error) {
        clearInterval(interval);
        throw new Error("Excel verisi işlenemedi.");
      }
      
      clearInterval(interval);
      setUploadProgress(100);

      // Process Excel data with column header detection
      const parsedData: ExcelRow[] = [];
      
      console.log(`Processing ${jsonData.length} rows from Excel...`);
      
      if (jsonData.length < 2) {
        throw new Error("Excel dosyasında yeterli veri bulunamadı. En az başlık satırı ve bir veri satırı olmalı.");
      }

      // Find column indices by header names
      const headerRow = jsonData[0] as any[];
      let dateColumnIndex = -1;
      let amountColumnIndex = -1;
      let descriptionColumnIndex = -1;
      let transactionTypeColumnIndex = -1;
      let referenceColumnIndex = -1;

      console.log('Header row:', headerRow);

      // Search for column headers
      for (let i = 0; i < headerRow.length; i++) {
        const header = headerRow[i];
        if (!header || typeof header !== 'string') continue;
        
        const normalizedHeader = normalizeTurkish(header.toLowerCase());
        const originalHeader = header.toString().toUpperCase();
        
        console.log(`Column ${i}: "${header}" -> normalized: "${normalizedHeader}"`);
        
        // Date column patterns
        if ((normalizedHeader.includes('tarih') && !normalizedHeader.includes('islem')) || 
            normalizedHeader.includes('date') ||
            originalHeader === 'İŞLEM TARİHİ' ||
            originalHeader === 'ISLEM TARIHI' ||
            originalHeader === 'TARİH') {
          dateColumnIndex = i;
          console.log(`Date column found at index ${i}: ${header}`);
        }
        
        // Amount column patterns
        if (normalizedHeader.includes('tutar') || 
            normalizedHeader.includes('miktar') || 
            normalizedHeader.includes('amount') || 
            normalizedHeader.includes('para') ||
            originalHeader === 'TUTAR' ||
            originalHeader === 'MİKTAR') {
          amountColumnIndex = i;
          console.log(`Amount column found at index ${i}: ${header}`);
        }
        
        // Description column
        if (normalizedHeader.includes('aciklama') || 
            normalizedHeader.includes('description') ||
            originalHeader === 'AÇIKLAMA' ||
            originalHeader === 'ACIKLAMA') {
          descriptionColumnIndex = i;
          console.log(`Description column found at index ${i}: ${header}`);
        }
        
        // Transaction type column
        if ((normalizedHeader.includes('islem') && !normalizedHeader.includes('tarih')) || 
            normalizedHeader.includes('transaction') || 
            normalizedHeader.includes('type') || 
            normalizedHeader.includes('tip') ||
            originalHeader === 'İŞLEM' ||
            originalHeader === 'ISLEM') {
          transactionTypeColumnIndex = i;
          console.log(`Transaction type column found at index ${i}: ${header}`);
        }
        
        // Reference column patterns
        if (normalizedHeader.includes('referans') || 
            normalizedHeader.includes('ref') || 
            normalizedHeader.includes('reference') || 
            normalizedHeader.includes('no') ||
            originalHeader === 'REFERANS' ||
            originalHeader === 'REF') {
          referenceColumnIndex = i;
          console.log(`Reference column found at index ${i}: ${header}`);
        }
      }

      console.log('Column indices found:', {
        date: dateColumnIndex,
        amount: amountColumnIndex,
        description: descriptionColumnIndex,
        transactionType: transactionTypeColumnIndex,
        reference: referenceColumnIndex
      });

      // Process data rows
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i] as any[];
        
        // Skip completely empty rows
        if (!row || row.length === 0 || !row.some(cell => cell !== null && cell !== undefined && cell !== '')) {
          continue;
        }
        
        // Extract data using column indices
        let date = '';
        let amount = 0;
        let description = '';
        let transactionType = '';
        let reference = '';
        
        // Extract date
        if (dateColumnIndex >= 0 && row[dateColumnIndex]) {
          const dateCell = row[dateColumnIndex];
          if (dateCell instanceof Date) {
            date = dateCell.toLocaleDateString('tr-TR');
          } else if (typeof dateCell === 'string') {
            const parsedDate = parseTurkishDate(dateCell.trim());
            if (parsedDate) {
              date = dateCell.trim();
            }
          }
        }
        
        // Extract amount
        if (amountColumnIndex >= 0 && row[amountColumnIndex]) {
          amount = parseAmount(row[amountColumnIndex]);
        }
        
        // Extract description from "Açıklama" column
        if (descriptionColumnIndex >= 0 && row[descriptionColumnIndex]) {
          const descCell = row[descriptionColumnIndex];
          if (typeof descCell === 'string' && descCell.trim().length > 0) {
            description = descCell.trim();
          }
        }
        
        // Extract transaction type from "İşlem" column
        if (transactionTypeColumnIndex >= 0 && row[transactionTypeColumnIndex]) {
          const typeCell = row[transactionTypeColumnIndex];
          if (typeof typeCell === 'string' && typeCell.trim().length > 0) {
            transactionType = typeCell.trim();
          }
        }
        
        // Extract reference
        if (referenceColumnIndex >= 0 && row[referenceColumnIndex]) {
          const refCell = row[referenceColumnIndex];
          if (typeof refCell === 'string' && refCell.trim().length > 0) {
            reference = refCell.trim();
          }
        }
        
        // If specific columns not found, fall back to old logic for compatibility
        if (!description && (descriptionColumnIndex < 0 || transactionTypeColumnIndex < 0)) {
          // Fallback: collect all text cells as potential descriptions
          const allDescriptions: string[] = [];
          
          for (let j = 0; j < row.length; j++) {
            const cell = row[j];
            if (cell === null || cell === undefined || cell === '') continue;
            
            if (typeof cell === 'string') {
              const cellTrimmed = cell.trim();
              
              if (cellTrimmed.length >= 3 && 
                  !parseTurkishDate(cellTrimmed) && 
                  parseAmount(cellTrimmed) === 0) {
                
                const isNotDescription = 
                  /^[A-Z0-9]{6,}$/i.test(cellTrimmed) || 
                  /^\d+$/.test(cellTrimmed) || 
                  cellTrimmed.length < 5 || 
                  /^(TL|₺|\$|EUR|USD)$/i.test(cellTrimmed) || 
                  /^(DEBIT|CREDIT|DR|CR|FAST|HAVALE|EFT)$/i.test(cellTrimmed);
                
                if (!isNotDescription) {
                  allDescriptions.push(cellTrimmed);
                }
              }
            }
          }
          
          if (allDescriptions.length > 0) {
            allDescriptions.sort((a, b) => b.length - a.length);
            description = allDescriptions[0];
          }
        }
        
        // Generate reference if not found
        if (!reference) {
          reference = `REF${Date.now()}_${i}`;
        }
        
        // Validate and add row if we have essential data
        if (date && amount > 0) {
          // Use a fallback description if none found
          if (!description || description.length < 3) {
            description = `Ödeme - Satır ${i + 1}`;
          }
          
          parsedData.push({
            date: date,
            amount: amount,
            description: description,
            reference: reference,
            rowIndex: i + 1,
            paymentType: transactionType
          });
          
          console.log(`Row ${i + 1}: Date=${date}, Amount=${amount}, Description=${description}, TransactionType=${transactionType}`);
        } else {
          console.log(`Row ${i + 1} skipped: Date=${date}, Amount=${amount}, Description=${description}`);
        }
      }

      if (parsedData.length === 0) {
        throw new Error("Excel dosyasında geçerli ödeme verisi bulunamadı. Dosyanın tarih, tutar ve açıklama sütunları içerdiğinden emin olun.");
      }

      setExcelData(parsedData);
      setStep('review');
      
      toast.success(`Excel dosyası başarıyla işlendi! ${parsedData.length} ödeme kaydı bulundu.`);
      
    } catch (error: any) {
      console.error('Excel processing error:', error);
      const errorMessage = error.message || "Excel dosyası işlenirken bilinmeyen bir hata oluştu.";
      toast.error(errorMessage);
      
      // Reset on error
      setExcelData([]);
      setStep('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 3: Find matches using Turkish-aware matching system
  const findMatches = () => {
    console.log('\n🇹🇷 STARTING TURKISH-AWARE MATCHING PROCESS');
    
    // Use the new Turkish matching system
    const results = findTurkishMatches(excelData, athletes);
    
    // Convert results to MatchResult format
    const matchResults: MatchResult[] = results.map(result => ({
      excelRow: result.excelRow,
      athleteId: result.athleteId,
      athleteName: result.athleteName,
      parentName: result.parentName,
      similarity: result.similarity,
      isManual: result.isManual || false,
      isSiblingPayment: result.isSiblingPayment || false,
      siblingIds: result.siblingIds
    }));
    
    setMatchResults(matchResults);
    setStep('confirm');
    
    // Count different types of matches
    const historicalMatches = matchResults.filter(r => r.similarity === 100 && !r.isManual).length;
    const highConfidenceMatches = matchResults.filter(r => r.similarity >= 85 && r.similarity < 100).length;
    const mediumConfidenceMatches = matchResults.filter(r => r.similarity >= 70 && r.similarity < 85).length;
    const lowConfidenceMatches = matchResults.filter(r => r.similarity > 0 && r.similarity < 70).length;
    const noMatches = matchResults.filter(r => r.similarity === 0).length;
    
    // Show Turkish-aware success message
    if (noMatches > 0) {
      toast.success(
        `🇹🇷 Türkçe Karakter Destekli Eşleştirme Tamamlandı!\n\n` +
        `✅ Güvenilir: ${historicalMatches + highConfidenceMatches}\n` +
        `⚠️ Manuel kontrol gerekli: ${mediumConfidenceMatches + lowConfidenceMatches}\n` +
        `❌ Eşleşmedi: ${noMatches} (eski sporcu ödemeleri olabilir)\n\n` +
        `🔤 Türkçe karakterler (İ,ı,ç,Ç,ğ,Ğ,Ü,ü) doğru işlendi!`,
        { duration: 10000 }
      );
    } else {
      toast.success(
        `🇹🇷 Türkçe Karakter Destekli Eşleştirme Başarılı!\n\n` +
        `✅ ${historicalMatches + highConfidenceMatches} güvenilir eşleştirme bulundu\n` +
        `🔤 Türkçe karakterler doğru işlendi!`,
        { duration: 6000 }
      );
    }
  };

  // Manual match update - ENHANCED WITH TURKISH MEMORY
  const updateManualMatch = (index: number, athleteId: string) => {
    const athlete = athletes.find(a => a.id.toString() === athleteId);
    if (!athlete) return;
    
    const result = matchResults[index];
    const athleteName = `${athlete.studentName || ''} ${athlete.studentSurname || ''}`.trim();
    const parentName = `${athlete.parentName || ''} ${athlete.parentSurname || ''}`.trim();
    
    // Save this manual match to Turkish matching memory for future use
    TurkishMatchingMemory.saveManualMatch(
      result.excelRow.description,
      athleteId,
      athleteName,
      parentName,
      false, // Not a sibling payment initially
      undefined
    );
    
    const updatedResults = [...matchResults];
    updatedResults[index] = {
      ...updatedResults[index],
      athleteId: athleteId,
      athleteName: athleteName,
      parentName: parentName,
      similarity: 100,
      isManual: true,
      isSiblingPayment: false, // Reset sibling payment flag
      siblingIds: undefined // Clear sibling IDs
    };
    
    setMatchResults(updatedResults);
    toast.success(
      `🇹🇷 Manuel eşleştirme yapıldı ve hatırlandı!\n\n` +
      `✅ ${athlete.studentName} ${athlete.studentSurname}\n` +
      `🧠 Bu eşleştirme gelecek aylar için kaydedildi`,
      { duration: 5000 }
    );
  };

  // IMPROVED SIBLING SYSTEM - ACTIVE ATHLETES ONLY
  const findSiblings = (athleteId: string) => {
    const athlete = athletes.find(a => a.id.toString() === athleteId);
    if (!athlete) {
      console.log('❌ Athlete not found for ID:', athleteId);
      return [];
    }
    
    console.log('\n=== IMPROVED SIBLING SEARCH - ACTIVE ONLY ===');
    console.log('🎯 Target Athlete:', athlete.studentName, athlete.studentSurname);
    
    // CRITICAL FIX: Only search among ACTIVE athletes
    const activeAthletes = athletes.filter(a => {
      const status = a.status?.toLowerCase();
      return !status || status === 'aktif' || status === 'active';
    });
    
    console.log(`📊 Searching among ${activeAthletes.length} ACTIVE athletes (out of ${athletes.length} total)`);
    
    // Get parent identifiers - ULTRA STRICT - FIXED FIELD NAMES
    const targetParentPhone = athlete.parentPhone ? athlete.parentPhone.toString().replace(/\D/g, '') : '';
    const targetParentTc = athlete.parentTcNo || athlete.parentTc ? (athlete.parentTcNo || athlete.parentTc).toString().replace(/\D/g, '') : '';
    
    console.log('📋 Target Parent Data:');
    console.log('  - Phone:', targetParentPhone ? targetParentPhone.substring(0, 3) + '***' + targetParentPhone.substring(targetParentPhone.length - 2) : 'MISSING');
    console.log('  - TC:', targetParentTc ? targetParentTc.substring(0, 3) + '***' + targetParentTc.substring(targetParentTc.length - 2) : 'MISSING');
    
    // We need at least one strong identifier
    if (!targetParentPhone && !targetParentTc) {
      console.log('❌ NO PARENT IDENTIFIERS - Cannot find siblings');
      return [];
    }
    
    // Find siblings with EXACT matching only - ACTIVE ATHLETES ONLY
    const siblings = activeAthletes.filter(candidate => {
      // Skip self
      if (candidate.id === athlete.id) return false;
      
      // Get candidate parent data
      const candidateParentPhone = candidate.parentPhone ? candidate.parentPhone.toString().replace(/\D/g, '') : '';
      const candidateParentTc = candidate.parentTcNo || candidate.parentTc ? (candidate.parentTcNo || candidate.parentTc).toString().replace(/\D/g, '') : '';
      
      console.log(`\n🔍 Checking ACTIVE: ${candidate.studentName} ${candidate.studentSurname}`);
      console.log('  Parent Data:');
      console.log('    - Phone:', candidateParentPhone ? candidateParentPhone.substring(0, 3) + '***' + candidateParentPhone.substring(candidateParentPhone.length - 2) : 'MISSING');
      console.log('    - TC:', candidateParentTc ? candidateParentTc.substring(0, 3) + '***' + candidateParentTc.substring(candidateParentTc.length - 2) : 'MISSING');
      
      // ULTRA STRICT EXACT MATCHING
      let isSibling = false;
      
      // Rule 1: EXACT TC match (if both have TC)
      if (targetParentTc && candidateParentTc && targetParentTc === candidateParentTc) {
        isSibling = true;
        console.log(`    ✅ TC EXACT MATCH`);
      }
      // Rule 2: EXACT phone match (if both have phone)
      else if (targetParentPhone && candidateParentPhone && targetParentPhone === candidateParentPhone) {
        isSibling = true;
        console.log(`    ✅ PHONE EXACT MATCH`);
      }
      else {
        console.log(`    ❌ NO EXACT MATCH`);
      }
      
      console.log(`  🎯 DECISION: ${isSibling ? '✅ ACTIVE SIBLING' : '❌ NOT SIBLING'}`);
      
      return isSibling;
    });
    
    console.log(`\n🎉 ACTIVE SIBLING SEARCH COMPLETE`);
    console.log(`✅ Found ${siblings.length} confirmed ACTIVE siblings for ${athlete.studentName} ${athlete.studentSurname}:`);
    siblings.forEach((s, index) => {
      console.log(`  ${index + 1}. ${s.studentName} ${s.studentSurname} (Parent: ${s.parentName} ${s.parentSurname}) - STATUS: ${s.status || 'ACTIVE'}`);
    });
    
    return siblings;
  };

  // ULTRA SIMPLE SIBLING DIALOG
  const showSiblingDialog = (index: number) => {
    const result = matchResults[index];
    if (!result.athleteId) {
      toast.error("⚠️ Önce bir sporcu seçin");
      return;
    }

    console.log('\n=== ULTRA SIMPLE SIBLING PAYMENT CHECK ===');
    console.log('🎯 Selected athlete ID:', result.athleteId);
    
    const selectedAthlete = athletes.find(a => a.id.toString() === result.athleteId);
    if (!selectedAthlete) {
      toast.error("❌ Seçilen sporcu bulunamadı");
      return;
    }
    
    console.log('🎯 Selected athlete:', selectedAthlete.studentName, selectedAthlete.studentSurname);
    
    // Find siblings with ULTRA SIMPLE matching
    const siblings = findSiblings(result.athleteId);
    console.log('🔍 Found siblings count:', siblings.length);
    
    if (siblings.length === 0) {
      // Show simple error message
      toast.error(
        `❌ ${selectedAthlete.studentName} ${selectedAthlete.studentSurname} için kardeş bulunamadı!\n\n` +
        `Kardeş ödemesi için AYNI telefon numarası veya TC kimlik numarasına sahip başka aktif sporcular olmalı.`,
        { duration: 8000 }
      );
      return;
    }

    // Prepare sibling data
    const allSiblings = [selectedAthlete, ...siblings];
    const totalAmount = result.excelRow.amount;
    const amountPerSibling = Math.round((totalAmount / allSiblings.length) * 100) / 100;
    
    // Create simple sibling list for confirmation
    const siblingDetails = allSiblings.map((s, idx) => {
      const sport = s.selectedSports?.[0] || s.sportsBranches?.[0] || 'Genel';
      return `${idx + 1}. ${s.studentName} ${s.studentSurname} (${sport})`;
    }).join('\n');
    
    console.log('👨‍👩‍👧‍👦 All siblings for payment split:');
    allSiblings.forEach((s, idx) => {
      console.log(`  ${idx + 1}. ${s.studentName} ${s.studentSurname} - ID: ${s.id}`);
    });
    
    // ULTRA SIMPLE confirmation dialog
    const confirmationMessage = 
      `🚨 KARDEŞ ÖDEMESİ BÖLÜNECEK! 🚨\n\n` +
      `💰 Toplam Tutar: ₺${totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n` +
      `👥 Kardeş Sayısı: ${allSiblings.length} sporcu\n` +
      `💵 Her sporcu için: ₺${amountPerSibling.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\n` +
      `👨‍👩‍👧‍👦 KARDEŞLER:\n${siblingDetails}\n\n` +
      `⚠️ Bu işlem geri alınamaz!\n\n` +
      `✅ Devam etmek istediğinizden EMİN misiniz?`;

    const confirmed = confirm(confirmationMessage);

    if (confirmed) {
      // Update match result with sibling payment data
      const updatedResults = [...matchResults];
      updatedResults[index] = {
        ...updatedResults[index],
        isSiblingPayment: true,
        siblingIds: allSiblings.map(s => s.id.toString()),
        athleteName: allSiblings.map(s => `${s.studentName} ${s.studentSurname}`).join(' + '),
        parentName: `${selectedAthlete.parentName} ${selectedAthlete.parentSurname} (${allSiblings.length} kardeş)`
      };
      
      setMatchResults(updatedResults);
      
      // Success notification
      toast.success(
        `✅ KARDEŞ ÖDEMESİ AKTİF!\n\n` +
        `👥 ${allSiblings.length} kardeş için ödeme bölündü\n` +
        `💵 Her sporcu: ₺${amountPerSibling.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        { duration: 6000 }
      );
      
      console.log('✅ Sibling payment activated successfully!');
      console.log('💰 Amount per sibling:', amountPerSibling);
      console.log('👥 Sibling IDs:', allSiblings.map(s => s.id));
    } else {
      console.log('❌ Sibling payment cancelled by user');
      toast.info("Kardeş ödemesi iptal edildi");
    }
  };

  // Cancel sibling payment
  const cancelSiblingPayment = (index: number) => {
    const result = matchResults[index];
    if (!result.athleteId) return;

    const athlete = athletes.find(a => a.id.toString() === result.athleteId);
    if (!athlete) return;

    const updatedResults = [...matchResults];
    updatedResults[index] = {
      ...updatedResults[index],
      isSiblingPayment: false,
      siblingIds: undefined,
      athleteName: `${athlete.studentName || ''} ${athlete.studentSurname || ''}`.trim()
    };
    
    setMatchResults(updatedResults);
    toast.success("Kardeş ödemesi iptal edildi");
  };

  // Step 4: Confirm and save matches - ENHANCED DUPLICATE PREVENTION
  const confirmMatches = async () => {
    const validMatches = matchResults.filter(result => result.athleteId);
    
    if (validMatches.length === 0) {
      toast.error("Onaylanacak eşleştirme bulunamadı!");
      return;
    }

    setIsProcessing(true);
    
    try {
      // Get existing payments from localStorage (not from state to avoid stale data)
      const existingPayments = JSON.parse(localStorage.getItem('payments') || '[]');
      let processedCount = 0;
      let duplicateCount = 0;
      
      // Load and update payment matching history
      const matchingHistory = JSON.parse(localStorage.getItem('paymentMatchingHistory') || '{}');
      
      // ENHANCED DUPLICATE PREVENTION - Multiple layers of checking
      const existingPaymentKeys = new Set();
      const existingAccountEntryKeys = new Set();
      
      // Build comprehensive duplicate detection keys
      existingPayments.forEach((payment: any) => {
        // Reference-based key (most reliable for bank imports)
        if (payment.reference) {
          existingPaymentKeys.add(`REF_${payment.athleteId}_${payment.reference}_${payment.amount}`);
        }
        
        // Date + Amount + Athlete key (catches same-day duplicates)
        if (payment.paymentDate) {
          existingPaymentKeys.add(`DATE_${payment.athleteId}_${payment.paymentDate}_${payment.amount}`);
        }
        
        // Description-based key (catches similar descriptions)
        if (payment.description) {
          const normalizedDesc = normalizeTurkish(payment.description);
          existingPaymentKeys.add(`DESC_${payment.athleteId}_${normalizedDesc}_${payment.amount}`);
        }
      });
      
      // Also check account entries for duplicates
      athletes.forEach((athlete: any) => {
        const accountEntries = JSON.parse(localStorage.getItem(`account_${athlete.id}`) || '[]');
        accountEntries.forEach((entry: any) => {
          if (entry.description && entry.type === 'credit') {
            const normalizedDesc = normalizeTurkish(entry.description);
            existingAccountEntryKeys.add(`ACCOUNT_${athlete.id}_${entry.date.split('T')[0]}_${entry.amountIncludingVat}_${normalizedDesc}`);
          }
        });
      });
      
      console.log(`🔍 DUPLICATE PREVENTION: Found ${existingPaymentKeys.size} existing payment keys and ${existingAccountEntryKeys.size} account entry keys`);
      
      for (const match of validMatches) {
        const parsedDate = parseTurkishDate(match.excelRow.date);
        const paymentDate = parsedDate ? parsedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        const entryDate = parsedDate ? parsedDate.toISOString() : new Date().toISOString();
        const displayDate = parsedDate ? parsedDate.toLocaleDateString('tr-TR') : match.excelRow.date;
        
        // Save this match to Turkish matching memory for future use
        TurkishMatchingMemory.saveManualMatch(
          match.excelRow.description,
          match.athleteId!,
          match.athleteName,
          match.parentName,
          match.isSiblingPayment || false,
          match.siblingIds
        );
        
        // Also save to old format for backward compatibility
        const normalizedDescription = normalizeTurkish(match.excelRow.description);
        matchingHistory[normalizedDescription] = {
          athleteId: match.athleteId,
          athleteName: match.athleteName,
          parentName: match.parentName,
          isSiblingPayment: match.isSiblingPayment || false,
          siblingIds: match.siblingIds || [],
          lastUsed: new Date().toISOString(),
          usageCount: (matchingHistory[normalizedDescription]?.usageCount || 0) + 1
        };
        
        if (match.isSiblingPayment && match.siblingIds && match.siblingIds.length > 1) {
          // Handle sibling payments - split equally
          const amountPerSibling = Math.round((match.excelRow.amount / match.siblingIds.length) * 100) / 100;
          
          for (const siblingId of match.siblingIds) {
            const athlete = athletes.find(a => a.id.toString() === siblingId);
            if (!athlete) continue;
            
            // ENHANCED DUPLICATE CHECK - Multiple keys
            const refKey = `REF_${siblingId}_${match.excelRow.reference}_${amountPerSibling}`;
            const dateKey = `DATE_${siblingId}_${paymentDate}_${amountPerSibling}`;
            const descKey = `DESC_${siblingId}_${normalizedDescription}_${amountPerSibling}`;
            const accountKey = `ACCOUNT_${siblingId}_${paymentDate}_${amountPerSibling}_${normalizedDescription}`;
            
            if (existingPaymentKeys.has(refKey) || 
                existingPaymentKeys.has(dateKey) || 
                existingPaymentKeys.has(descKey) ||
                existingAccountEntryKeys.has(accountKey)) {
              console.log(`❌ DUPLICATE SIBLING PAYMENT DETECTED: ${athlete.studentName} ${athlete.studentSurname} - ₺${amountPerSibling} - ${match.excelRow.reference}`);
              duplicateCount++;
              continue;
            }
            
            // Create payment record for each sibling
            const newPayment = {
              id: `sibling_${siblingId}_${Date.now()}_${Math.random()}`,
              athleteId: athlete.id,
              athleteName: `${athlete.studentName || ''} ${athlete.studentSurname || ''}`.trim(),
              parentName: `${athlete.parentName || ''} ${athlete.parentSurname || ''}`.trim(),
              amount: amountPerSibling,
              status: "Ödendi",
              paymentDate: paymentDate,
              method: "Havale/EFT",
              reference: match.excelRow.reference,
              sport: athlete.selectedSports?.[0] || athlete.sportsBranches?.[0] || 'Genel',
              invoiceNumber: `SIBLING-${Date.now()}-${athlete.id}`,
              dueDate: paymentDate,
              description: `Kardeş ödemesi (${match.siblingIds.length} sporcu) - ${match.excelRow.description}`,
              isGenerated: false,
              isSiblingPayment: true,
              isPaid: true
            };
            
            existingPayments.push(newPayment);
            
            // Add all keys to prevent future duplicates
            existingPaymentKeys.add(refKey);
            existingPaymentKeys.add(dateKey);
            existingPaymentKeys.add(descKey);
            
            // Add to athlete's account
            const existingEntries = JSON.parse(localStorage.getItem(`account_${athlete.id}`) || '[]');
            const paymentEntry = {
              id: Date.now() + Math.random(),
              date: entryDate,
              month: entryDate.slice(0, 7),
              description: `Kardeş Ödemesi (${match.siblingIds.length} sporcu) - ${displayDate} - ₺${amountPerSibling} - Ref: ${match.excelRow.reference}`,
              amountExcludingVat: amountPerSibling,
              vatRate: 0,
              vatAmount: 0,
              amountIncludingVat: amountPerSibling,
              unitCode: 'Adet',
              type: 'credit'
            };
            
            existingEntries.push(paymentEntry);
            localStorage.setItem(`account_${athlete.id}`, JSON.stringify(existingEntries));
            
            // Add account entry key to prevent duplicates
            existingAccountEntryKeys.add(accountKey);
            
            processedCount++;
            console.log(`✅ SIBLING PAYMENT ADDED: ${athlete.studentName} ${athlete.studentSurname} - ₺${amountPerSibling}`);
          }
        } else {
          // Handle single athlete payment
          const athlete = athletes.find(a => a.id.toString() === match.athleteId);
          if (!athlete) continue;
          
          // ENHANCED DUPLICATE CHECK - Multiple keys
          const refKey = `REF_${match.athleteId}_${match.excelRow.reference}_${match.excelRow.amount}`;
          const dateKey = `DATE_${match.athleteId}_${paymentDate}_${match.excelRow.amount}`;
          const descKey = `DESC_${match.athleteId}_${normalizedDescription}_${match.excelRow.amount}`;
          const accountKey = `ACCOUNT_${match.athleteId}_${paymentDate}_${match.excelRow.amount}_${normalizedDescription}`;
          
          if (existingPaymentKeys.has(refKey) || 
              existingPaymentKeys.has(dateKey) || 
              existingPaymentKeys.has(descKey) ||
              existingAccountEntryKeys.has(accountKey)) {
            console.log(`❌ DUPLICATE SINGLE PAYMENT DETECTED: ${athlete.studentName} ${athlete.studentSurname} - ₺${match.excelRow.amount} - ${match.excelRow.reference}`);
            duplicateCount++;
            continue;
          }
          
          // Try to update existing payment first
          const existingPaymentIndex = existingPayments.findIndex((p: any) => 
            p.athleteId.toString() === match.athleteId && 
            p.status !== "Ödendi" &&
            Math.abs(p.amount - match.excelRow.amount) <= 50 // Allow some tolerance
          );
          
          if (existingPaymentIndex !== -1) {
            // Update existing payment
            existingPayments[existingPaymentIndex].status = "Ödendi";
            existingPayments[existingPaymentIndex].paymentDate = paymentDate;
            existingPayments[existingPaymentIndex].method = "Havale/EFT";
            existingPayments[existingPaymentIndex].reference = match.excelRow.reference;
            existingPayments[existingPaymentIndex].isPaid = true;
            console.log(`✅ EXISTING PAYMENT UPDATED: ${athlete.studentName} ${athlete.studentSurname} - ₺${match.excelRow.amount}`);
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
              isGenerated: false,
              isPaid: true
            };
            
            existingPayments.push(newPayment);
            console.log(`✅ NEW PAYMENT ADDED: ${athlete.studentName} ${athlete.studentSurname} - ₺${match.excelRow.amount}`);
          }
          
          // Add all keys to prevent future duplicates
          existingPaymentKeys.add(refKey);
          existingPaymentKeys.add(dateKey);
          existingPaymentKeys.add(descKey);
          
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
          
          // Add account entry key to prevent duplicates
          existingAccountEntryKeys.add(accountKey);
          
          processedCount++;
        }
      }
      
      // Save updated matching history
      localStorage.setItem('paymentMatchingHistory', JSON.stringify(matchingHistory));
      
      // Save updated payments to localStorage
      localStorage.setItem('payments', JSON.stringify(existingPayments));
      
      // Reset states
      setIsUploadDialogOpen(false);
      setUploadedFile(null);
      setUploadProgress(0);
      setExcelData([]);
      setMatchResults([]);
      setStep('upload');
      
      // Enhanced success message with duplicate info
      if (duplicateCount > 0) {
        toast.success(
          `✅ ${processedCount} ödeme başarıyla kaydedildi!\n` +
          `⚠️ ${duplicateCount} mükerrer ödeme atlandı (daha önce kaydedilmiş)\n` +
          `🧠 Eşleştirmeler gelecek aylar için hatırlandı.`,
          { duration: 8000 }
        );
      } else {
        toast.success(`✅ ${processedCount} ödeme başarıyla kaydedildi! Eşleştirmeler gelecek aylar için hatırlandı.`);
      }
      
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

  // Get available athletes for manual matching - FIXED: Include ALL athletes (active and passive)
  const getAvailableAthletes = () => {
    return athletes
      .map(athlete => ({
        id: athlete.id,
        name: `${athlete.studentName || ''} ${athlete.studentSurname || ''}`.trim(),
        parentName: `${athlete.parentName || ''} ${athlete.parentSurname || ''}`.trim(),
        sport: athlete.selectedSports?.[0] || athlete.sportsBranches?.[0] || 'Genel',
        status: athlete.status || 'Aktif'
      }))
      .sort((a, b) => {
        // Sort by status first (Active first), then by name
        if (a.status !== b.status) {
          return a.status === 'Aktif' ? -1 : 1;
        }
        return a.name.localeCompare(b.name, 'tr-TR');
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

    // MÜKERRER KONTROL
    const duplicateCheck = DuplicatePreventionSystem.checkPaymentDuplicate({
      athleteId: newPayment.athleteId,
      amount: parseFloat(newPayment.amount),
      date: newPayment.paymentDate,
      method: newPayment.method,
      description: newPayment.description
    });

    if (duplicateCheck.isDuplicate) {
      const confirmOverride = confirm(
        `⚠️ MÜKERRER ÖDEME TESPİT EDİLDİ!\n\n` +
        `Sebep: ${duplicateCheck.reason}\n\n` +
        `Mevcut ödeme:\n` +
        `- Sporcu: ${duplicateCheck.existingPayment?.athleteName}\n` +
        `- Tutar: ₺${duplicateCheck.existingPayment?.amount}\n` +
        `- Tarih: ${duplicateCheck.existingPayment?.paymentDate}\n\n` +
        `Yine de kaydetmek istediğinizden emin misiniz?`
      );
      
      if (!confirmOverride) {
        toast.error("Ödeme kaydı iptal edildi - Mükerrer giriş önlendi");
        return;
      }
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

  // Account dialog functions - ENHANCED WITH DIAGNOSTICS
  const loadAccountEntries = (athleteId: string) => {
    console.log(`🔍 DIAGNOSTIC: Loading account entries for athlete ID: ${athleteId}`);
    
    // Get all localStorage keys to check what exists
    const allKeys = Object.keys(localStorage);
    const accountKeys = allKeys.filter(key => key.startsWith('account_'));
    console.log(`📊 DIAGNOSTIC: Found ${accountKeys.length} account keys in localStorage:`, accountKeys);
    
    // Check if this specific athlete has account data
    const accountKey = `account_${athleteId}`;
    const hasAccountData = localStorage.getItem(accountKey);
    console.log(`🎯 DIAGNOSTIC: Account key "${accountKey}" exists:`, !!hasAccountData);
    
    if (hasAccountData) {
      try {
        const entries = JSON.parse(hasAccountData);
        console.log(`✅ DIAGNOSTIC: Successfully loaded ${entries.length} entries for athlete ${athleteId}:`, entries);
        setAccountEntries(entries);
        
        // Additional diagnostics
        const debitEntries = entries.filter((e: any) => e.type === 'debit');
        const creditEntries = entries.filter((e: any) => e.type === 'credit');
        const totalDebit = debitEntries.reduce((sum: number, e: any) => sum + (parseFloat(e.amountIncludingVat) || 0), 0);
        const totalCredit = creditEntries.reduce((sum: number, e: any) => sum + (parseFloat(e.amountIncludingVat) || 0), 0);
        const balance = totalDebit - totalCredit;
        
        console.log(`💰 DIAGNOSTIC: Account summary for athlete ${athleteId}:`);
        console.log(`  - Debit entries: ${debitEntries.length} (Total: ₺${totalDebit})`);
        console.log(`  - Credit entries: ${creditEntries.length} (Total: ₺${totalCredit})`);
        console.log(`  - Balance: ₺${balance}`);
        
        // Check for bulk payment entries
        const bulkPaymentEntries = entries.filter((e: any) => 
          e.description && (
            e.description.includes('Toplu') || 
            e.description.includes('Bulk') ||
            e.description.includes('EFT/Havale') ||
            e.description.includes('Kardeş')
          )
        );
        console.log(`📦 DIAGNOSTIC: Found ${bulkPaymentEntries.length} bulk/bank payment entries:`, bulkPaymentEntries);
        
      } catch (error) {
        console.error(`❌ DIAGNOSTIC: Error parsing account data for athlete ${athleteId}:`, error);
        setAccountEntries([]);
      }
    } else {
      console.log(`⚠️ DIAGNOSTIC: No account data found for athlete ${athleteId}`);
      setAccountEntries([]);
    }
  };

  const openAccountDialog = (athlete: any) => {
    console.log(`🚀 DIAGNOSTIC: Opening account dialog for athlete:`, {
      id: athlete.id,
      name: `${athlete.studentName} ${athlete.studentSurname}`,
      status: athlete.status,
      parentName: `${athlete.parentName} ${athlete.parentSurname}`
    });
    
    setSelectedAthlete(athlete);
    loadAccountEntries(athlete.id);
    setIsAccountDialogOpen(true);
  };

  // EMERGENCY DIAGNOSTIC FUNCTION
  const runEmergencyDiagnostic = () => {
    console.log('\n🚨 EMERGENCY DIAGNOSTIC STARTING 🚨');
    
    // Get all athletes
    const allAthletes = JSON.parse(localStorage.getItem('students') || '[]');
    console.log(`👥 Total athletes in system: ${allAthletes.length}`);
    
    // Get all account keys
    const allKeys = Object.keys(localStorage);
    const accountKeys = allKeys.filter(key => key.startsWith('account_'));
    console.log(`📊 Total account keys found: ${accountKeys.length}`);
    
    // Check each athlete's account status
    const diagnosticResults = allAthletes.map((athlete: any) => {
      const accountKey = `account_${athlete.id}`;
      const hasAccountData = localStorage.getItem(accountKey);
      
      let accountSummary = {
        hasData: false,
        entryCount: 0,
        debitCount: 0,
        creditCount: 0,
        balance: 0,
        bulkPaymentCount: 0
      };
      
      if (hasAccountData) {
        try {
          const entries = JSON.parse(hasAccountData);
          const debitEntries = entries.filter((e: any) => e.type === 'debit');
          const creditEntries = entries.filter((e: any) => e.type === 'credit');
          const totalDebit = debitEntries.reduce((sum: number, e: any) => sum + (parseFloat(e.amountIncludingVat) || 0), 0);
          const totalCredit = creditEntries.reduce((sum: number, e: any) => sum + (parseFloat(e.amountIncludingVat) || 0), 0);
          const bulkPaymentEntries = entries.filter((e: any) => 
            e.description && (
              e.description.includes('Toplu') || 
              e.description.includes('Bulk') ||
              e.description.includes('EFT/Havale') ||
              e.description.includes('Kardeş')
            )
          );
          
          accountSummary = {
            hasData: true,
            entryCount: entries.length,
            debitCount: debitEntries.length,
            creditCount: creditEntries.length,
            balance: totalDebit - totalCredit,
            bulkPaymentCount: bulkPaymentEntries.length
          };
        } catch (error) {
          console.error(`Error parsing account data for athlete ${athlete.id}:`, error);
        }
      }
      
      return {
        id: athlete.id,
        name: `${athlete.studentName} ${athlete.studentSurname}`,
        status: athlete.status || 'Aktif',
        parentName: `${athlete.parentName} ${athlete.parentSurname}`,
        account: accountSummary
      };
    });
    
    // Sort by athletes with account data first, then by balance
    diagnosticResults.sort((a, b) => {
      if (a.account.hasData !== b.account.hasData) {
        return a.account.hasData ? -1 : 1;
      }
      return b.account.balance - a.account.balance;
    });
    
    console.log('\n📋 COMPLETE DIAGNOSTIC RESULTS:');
    console.log('=====================================');
    
    diagnosticResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.name} (ID: ${result.id}) - Status: ${result.status}`);
      console.log(`   Parent: ${result.parentName}`);
      if (result.account.hasData) {
        console.log(`   ✅ Account Data: ${result.account.entryCount} entries`);
        console.log(`   💰 Balance: ₺${result.account.balance.toFixed(2)}`);
        console.log(`   📦 Bulk Payments: ${result.account.bulkPaymentCount}`);
        console.log(`   📊 Debit: ${result.account.debitCount}, Credit: ${result.account.creditCount}`);
      } else {
        console.log(`   ❌ No Account Data Found`);
      }
      console.log('   ---');
    });
    
    // Find problematic athletes (have account data but no bulk payments showing)
    const problematicAthletes = diagnosticResults.filter(result => 
      result.account.hasData && 
      result.account.entryCount > 0 && 
      result.account.bulkPaymentCount === 0 &&
      result.account.creditCount === 0
    );
    
    console.log(`\n🚨 PROBLEMATIC ATHLETES (${problematicAthletes.length}):`);
    console.log('These athletes have account entries but no bulk/bank payments:');
    problematicAthletes.forEach(athlete => {
      console.log(`- ${athlete.name} (ID: ${athlete.id}) - ${athlete.account.entryCount} entries, ₺${athlete.account.balance.toFixed(2)} balance`);
    });
    
    // Show summary
    const athletesWithData = diagnosticResults.filter(r => r.account.hasData).length;
    const athletesWithBalance = diagnosticResults.filter(r => r.account.balance > 0).length;
    const athletesWithBulkPayments = diagnosticResults.filter(r => r.account.bulkPaymentCount > 0).length;
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`- Total Athletes: ${allAthletes.length}`);
    console.log(`- Athletes with Account Data: ${athletesWithData}`);
    console.log(`- Athletes with Positive Balance: ${athletesWithBalance}`);
    console.log(`- Athletes with Bulk/Bank Payments: ${athletesWithBulkPayments}`);
    console.log(`- Problematic Athletes: ${problematicAthletes.length}`);
    
    // Show toast with summary
    toast.success(
      `🔍 ACİL TESHİS TAMAMLANDI!\n\n` +
      `📊 Toplam Sporcu: ${allAthletes.length}\n` +
      `✅ Cari Hesabı Olan: ${athletesWithData}\n` +
      `💰 Borcu Olan: ${athletesWithBalance}\n` +
      `📦 Toplu Ödeme Kaydı Olan: ${athletesWithBulkPayments}\n` +
      `🚨 Sorunlu Sporcu: ${problematicAthletes.length}\n\n` +
      `Detaylar konsol logunda!`,
      { duration: 15000 }
    );
    
    return diagnosticResults;
  };

  const saveAccountEntry = () => {
    if (!selectedAthlete || !newEntry.description || !newEntry.amountExcludingVat) {
      return;
    }

    const amountExcluding = parseFloat(newEntry.amountExcludingVat);
    const vatRate = parseFloat(newEntry.vatRate);
    
    // CRITICAL FIX: No VAT for credit (alacak) entries
    const vatAmount = newEntry.type === 'credit' ? 0 : (amountExcluding * vatRate) / 100;
    const amountIncludingVat = amountExcluding + vatAmount;

    // CARİ HESAP MÜKERRER KONTROL
    const duplicateCheck = DuplicatePreventionSystem.checkAccountEntryDuplicate(selectedAthlete.id, {
      athleteId: selectedAthlete.id,
      amount: amountIncludingVat,
      month: newEntry.month,
      description: newEntry.description,
      type: newEntry.type as 'debit' | 'credit'
    });

    if (duplicateCheck.isDuplicate) {
      const confirmOverride = confirm(
        `⚠️ MÜKERRER CARİ HESAP KAYDI TESPİT EDİLDİ!\n\n` +
        `Sebep: ${duplicateCheck.reason}\n\n` +
        `Mevcut kayıt:\n` +
        `- Ay: ${duplicateCheck.existingEntry?.month}\n` +
        `- Açıklama: ${duplicateCheck.existingEntry?.description}\n` +
        `- Tutar: ₺${duplicateCheck.existingEntry?.amountIncludingVat}\n\n` +
        `Yine de kaydetmek istediğinizden emin misiniz?`
      );
      
      if (!confirmOverride) {
        toast.error("Cari hesap kaydı iptal edildi - Mükerrer giriş önlendi");
        return;
      }
    }

    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      month: newEntry.month,
      description: newEntry.description,
      amountExcludingVat: Math.round(amountExcluding * 100) / 100,
      vatRate: vatRate,
      vatAmount: vatAmount,
      amountIncludingVat: amountIncludingVat,
      unitCode: newEntry.unitCode,
      type: newEntry.type
    };

    const updatedEntries = [...accountEntries, entry];
    setAccountEntries(updatedEntries);
    localStorage.setItem(`account_${selectedAthlete.id}`, JSON.stringify(updatedEntries));

    // Reset form
    setNewEntry({
      month: new Date().toISOString().slice(0, 7),
      description: '',
      amountExcludingVat: '',
      vatRate: '20',
      amountIncludingVat: '',
      unitCode: 'Ay',
      type: 'debit'
    });
  };

  const calculateVatAmount = (excludingVat: string, vatRate: string) => {
    const excluding = parseFloat(excludingVat) || 0;
    const rate = parseFloat(vatRate) || 0;
    
    // CRITICAL FIX: No VAT for credit (alacak) entries
    const vatAmount = newEntry.type === 'credit' ? 0 : (excluding * rate) / 100;
    const amountIncludingVat = excluding + vatAmount;
    
    setNewEntry(prev => ({
      ...prev,
      amountExcludingVat: excludingVat,
      vatRate: newEntry.type === 'credit' ? '0' : vatRate,
      amountIncludingVat: amountIncludingVat.toFixed(2)
    }));
  };

  const getTotalBalance = () => {
    return accountEntries.reduce((total, entry) => {
      return entry.type === 'debit' 
        ? total + entry.amountIncludingVat 
        : total - entry.amountIncludingVat;
    }, 0);
  };

  // Edit account entry functions
  const startEditEntry = (entry: any) => {
    setEditingEntry({
      ...entry,
      month: entry.month,
      description: entry.description,
      amountExcludingVat: entry.amountExcludingVat.toString(),
      vatRate: entry.vatRate.toString(),
      amountIncludingVat: entry.amountIncludingVat.toString(),
      unitCode: entry.unitCode || 'Ay',
      type: entry.type
    });
    setIsEditDialogOpen(true);
  };

  const saveEditedEntry = () => {
    if (!selectedAthlete || !editingEntry || !editingEntry.description || !editingEntry.amountExcludingVat) {
      toast.error("Lütfen tüm zorunlu alanları doldurun");
      return;
    }

    const amountExcluding = parseFloat(editingEntry.amountExcludingVat);
    const vatRate = parseFloat(editingEntry.vatRate);
    
    // CRITICAL FIX: No VAT for credit (alacak) entries
    const vatAmount = editingEntry.type === 'credit' ? 0 : (amountExcluding * vatRate) / 100;
    const amountIncludingVat = amountExcluding + vatAmount;

    const updatedEntry = {
      ...editingEntry,
      amountExcludingVat: Math.round(amountExcluding * 100) / 100,
      vatRate: vatRate,
      vatAmount: vatAmount,
      amountIncludingVat: amountIncludingVat,
      unitCode: editingEntry.unitCode
    };

    const updatedEntries = accountEntries.map(entry => 
      entry.id === editingEntry.id ? updatedEntry : entry
    );
    
    setAccountEntries(updatedEntries);
    localStorage.setItem(`account_${selectedAthlete.id}`, JSON.stringify(updatedEntries));
    
    setIsEditDialogOpen(false);
    setEditingEntry(null);
    toast.success("Cari hesap kaydı güncellendi");
    
    // Reload payments to reflect balance changes
    loadPayments();
  };

  const deleteAccountEntry = (entryId: number) => {
    if (!selectedAthlete) return;

    const entryToDelete = accountEntries.find(entry => entry.id === entryId);
    if (!entryToDelete) return;

    const confirmDelete = confirm(
      `Bu cari hesap kaydını silmek istediğinizden emin misiniz?\n\n` +
      `Açıklama: ${entryToDelete.description}\n` +
      `Tutar: ₺${entryToDelete.amountIncludingVat}\n` +
      `Tür: ${entryToDelete.type === 'debit' ? 'Borç' : 'Alacak'}\n\n` +
      `Bu işlem geri alınamaz!`
    );

    if (confirmDelete) {
      const updatedEntries = accountEntries.filter(entry => entry.id !== entryId);
      setAccountEntries(updatedEntries);
      localStorage.setItem(`account_${selectedAthlete.id}`, JSON.stringify(updatedEntries));
      toast.success("Cari hesap kaydı silindi");
      
      // Reload payments to reflect balance changes
      loadPayments();
    }
  };

  const calculateEditVatAmount = (excludingVat: string, vatRate: string) => {
    const excluding = parseFloat(excludingVat) || 0;
    const rate = parseFloat(vatRate) || 0;
    
    // CRITICAL FIX: No VAT for credit (alacak) entries
    const vatAmount = editingEntry?.type === 'credit' ? 0 : (excluding * rate) / 100;
    const amountIncludingVat = excluding + vatAmount;
    
    setEditingEntry(prev => prev ? ({
      ...prev,
      amountExcludingVat: excludingVat,
      vatRate: editingEntry?.type === 'credit' ? '0' : vatRate,
      amountIncludingVat: amountIncludingVat.toFixed(2)
    }) : null);
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
              {/* Clear fields button removed as requested */}
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
                        <Button variant="outline" onClick={runEmergencyDiagnostic} className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          ACİL TESHİS
                        </Button>

                        <Button variant="outline" onClick={exportPaymentsToExcel}>
                          <Download className="h-4 w-4 mr-2" />
                          Excel Dışa Aktar
                        </Button>

                        <Button variant="outline" onClick={() => setIsUploadDialogOpen(true)}>
                          <Upload className="h-4 w-4 mr-2" />
                          Excel Yükle
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
                              <TableCell className="font-medium">₺{formatAmount(payment.amount).toLocaleString()}</TableCell>
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
                                    title="Görüntüle"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => {
                                      // Find the athlete and open account dialog directly
                                      const athlete = athletes.find(a => a.id.toString() === payment.athleteId.toString());
                                      if (athlete) {
                                        openAccountDialog(athlete);
                                      } else {
                                        toast.error("Sporcu bulunamadı");
                                      }
                                    }}
                                    title="İzleme - Cari Hesap"
                                  >
                                    <FileText className="h-4 w-4" />
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
                                    title="Düzenle"
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

          {/* Excel Upload Dialog - COMPLETELY REWRITTEN */}
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
                  Bankadan aldığınız Excel extre dosyasını yükleyerek ödemeleri BULLETPROOF algoritma ile eşleştirin
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
                        {excelData.length} ödeme kaydı bulundu. Devam etmek için "BULLETPROOF Eşleştirmeyi Başlat" butonuna tıklayın.
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
                              <TableHead>Ödeme Tipi</TableHead>
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
                                <TableCell>
                                  {row.paymentType ? (
                                    <Badge variant="outline" className="text-xs">
                                      {row.paymentType}
                                    </Badge>
                                  ) : (
                                    <span className="text-muted-foreground text-xs">-</span>
                                  )}
                                </TableCell>
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
                            BULLETPROOF Eşleştirmeyi Başlat
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step 3: Confirm Matches - COMPLETELY REWRITTEN */}
                {step === 'confirm' && matchResults.length > 0 && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>BULLETPROOF Eşleştirme Sonuçları</CardTitle>
                        <CardDescription>
                          Eşleştirmeleri kontrol edin ve onaylayın. Manuel düzeltme yapabilirsiniz.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {matchResults.map((result, index) => (
                            <Card key={index} className={`border ${
                              result.isSiblingPayment ? 'border-purple-300 bg-purple-50' :
                              result.similarity >= 90 ? 'border-green-200 bg-green-50' : 
                              result.similarity >= 70 ? 'border-yellow-200 bg-yellow-50' : 
                              'border-red-200 bg-red-50'
                            }`}>
                              <CardContent className="p-4">
                                {/* Sibling Payment Banner */}
                                {result.isSiblingPayment && (
                                  <div className="mb-4 p-3 bg-purple-100 border border-purple-300 rounded-lg">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        <Users className="h-5 w-5 text-purple-600" />
                                        <span className="font-bold text-purple-800">
                                          KARDEŞ ÖDEMESİ - {result.siblingIds?.length || 0} SPORCU
                                        </span>
                                        <Badge className="bg-purple-600 text-white">
                                          ₺{(result.excelRow.amount / (result.siblingIds?.length || 1)).toFixed(2)} / sporcu
                                        </Badge>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => cancelSiblingPayment(index)}
                                        className="text-purple-700 border-purple-300"
                                      >
                                        <X className="h-4 w-4 mr-1" />
                                        İptal Et
                                      </Button>
                                    </div>
                                  </div>
                                )}

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
                                    <Label className="text-sm font-medium text-muted-foreground">BULLETPROOF Eşleştirme:</Label>
                                    <div className="mt-1">
                                      {result.athleteId ? (
                                        <div>
                                          <div className="flex items-center space-x-2">
                                            <p className="font-medium">{result.athleteName}</p>
                                            <Badge variant="outline" className={`text-xs ${
                                              result.similarity >= 90 ? 'bg-green-100 text-green-800' :
                                              result.similarity >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                              'bg-red-100 text-red-800'
                                            }`}>
                                              %{result.similarity} {result.isManual ? '(Manuel)' : '(BULLETPROOF)'}
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
                                
                                {/* Manual Matching - ULTRA SIMPLE */}
                                <div className="mt-4 pt-4 border-t">
                                  <div className="flex flex-col md:flex-row gap-4">
                                    {/* Athlete Selection */}
                                    <div className="flex-1">
                                      <Label className="text-sm font-medium">Sporcu Seçimi:</Label>
                                      <Select 
                                        value={result.athleteId || ""} 
                                        onValueChange={(value) => updateManualMatch(index, value)}
                                      >
                                        <SelectTrigger className="mt-2">
                                          <SelectValue placeholder="Sporcu seçin..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {getAvailableAthletes().map(athlete => (
                                            <SelectItem 
                                              key={athlete.id} 
                                              value={athlete.id.toString()}
                                            >
                                              <div className="flex flex-col">
                                                <div className="flex items-center space-x-2">
                                                  <span className="font-medium">{athlete.name}</span>
                                                  {athlete.status === 'Pasif' && (
                                                    <span className="text-xs bg-red-100 text-red-800 px-1 py-0.5 rounded">
                                                      PASİF
                                                    </span>
                                                  )}
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                  {athlete.parentName} - {athlete.sport}
                                                </span>
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    
                                    {/* Sibling Toggle - ULTRA SIMPLE VERSION */}
                                    {result.athleteId && (
                                      <div className="flex flex-col justify-end">
                                        {(() => {
                                          const siblings = findSiblings(result.athleteId);
                                          if (siblings.length > 0) {
                                            const selectedAthlete = athletes.find(a => a.id.toString() === result.athleteId);
                                            const totalSiblings = selectedAthlete ? siblings.length + 1 : siblings.length;
                                            
                                            return (
                                              <Button
                                                size="sm"
                                                variant={result.isSiblingPayment ? "destructive" : "default"}
                                                onClick={() => result.isSiblingPayment ? cancelSiblingPayment(index) : showSiblingDialog(index)}
                                                className={result.isSiblingPayment ? 
                                                  "bg-red-600 hover:bg-red-700" : 
                                                  "bg-purple-600 hover:bg-purple-700"
                                                }
                                              >
                                                <Users className="h-4 w-4 mr-2" />
                                                {result.isSiblingPayment ? 
                                                  "Kardeş Ödemesini İptal Et" : 
                                                  `${totalSiblings} Kardeşe Böl`
                                                }
                                              </Button>
                                            );
                                          }
                                          return null;
                                        })()}
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Show sibling list if enabled */}
                                  {result.isSiblingPayment && result.siblingIds && (
                                    <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                      <div className="flex items-center space-x-2 mb-3">
                                        <Users className="h-5 w-5 text-purple-600" />
                                        <span className="font-bold text-purple-800">
                                          Kardeş Ödemesi - {result.siblingIds.length} Sporcu
                                        </span>
                                        <Badge className="bg-purple-600 text-white">
                                          ₺{(result.excelRow.amount / result.siblingIds.length).toFixed(2)} / sporcu
                                        </Badge>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {result.siblingIds.map((athleteId, idx) => {
                                          const athlete = athletes.find(a => a.id.toString() === athleteId);
                                          return athlete ? (
                                            <div key={athleteId} className="flex items-center space-x-2 p-2 bg-white rounded border">
                                              <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                                {idx + 1}
                                              </div>
                                              <span className="text-sm font-medium">
                                                {athlete.studentName} {athlete.studentSurname}
                                              </span>
                                            </div>
                                          ) : null;
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

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

          {/* Account Dialog */}
          <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Cari Hesap</span>
                </DialogTitle>
                <DialogDescription>
                  {selectedAthlete && `${selectedAthlete.studentName} ${selectedAthlete.studentSurname} - Cari Hesap Hareketleri`}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Balance Summary */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Toplam Bakiye</p>
                        <p className={`text-2xl font-bold ${getTotalBalance() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ₺{Math.round(getTotalBalance() * 100) / 100}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Toplam Hareket</p>
                        <p className="text-lg font-medium">{accountEntries.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Add New Entry */}
                <Card>
                  <CardHeader>
                    <CardTitle>Yeni Hareket Ekle</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="month">Ay</Label>
                        <Input
                          id="month"
                          type="month"
                          value={newEntry.month}
                          onChange={(e) => setNewEntry(prev => ({ ...prev, month: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Açıklama</Label>
                        <Input
                          id="description"
                          placeholder="Örn: Haziran Aidatı"
                          value={newEntry.description}
                          onChange={(e) => setNewEntry(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="type">İşlem Türü</Label>
                        <Select value={newEntry.type} onValueChange={(value) => setNewEntry(prev => ({ ...prev, type: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="debit">Borç</SelectItem>
                            <SelectItem value="credit">Alacak</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="amountExcludingVat">Tutar (KDV Hariç)</Label>
                        <Input
                          id="amountExcludingVat"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={newEntry.amountExcludingVat}
                          onChange={(e) => calculateVatAmount(e.target.value, newEntry.vatRate)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="vatRate">KDV Oranı (%)</Label>
                        <Select value={newEntry.vatRate} onValueChange={(value) => calculateVatAmount(newEntry.amountExcludingVat, value)}>
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
                      <div>
                        <Label htmlFor="amountIncludingVat">Toplam (KDV Dahil)</Label>
                        <Input
                          id="amountIncludingVat"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={newEntry.amountIncludingVat}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button onClick={saveAccountEntry}>
                        <Plus className="h-4 w-4 mr-2" />
                        Hareket Ekle
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Entries Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Cari Hesap Hareketleri</CardTitle>
                    <CardDescription>
                      Hareketler tarihe göre kronolojik sıralanmıştır (En yeni üstte)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {accountEntries.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tarih</TableHead>
                            <TableHead>Ay</TableHead>
                            <TableHead>Açıklama</TableHead>
                            <TableHead>Tür</TableHead>
                            <TableHead>Tutar (KDV Hariç)</TableHead>
                            <TableHead>KDV</TableHead>
                            <TableHead>Toplam</TableHead>
                            <TableHead>Bakiye</TableHead>
                            <TableHead>İşlemler</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(() => {
                            // FIXED: Sort entries chronologically (newest first) and calculate running balance
                            const sortedEntries = [...accountEntries].sort((a, b) => {
                              const dateA = new Date(a.date);
                              const dateB = new Date(b.date);
                              return dateB.getTime() - dateA.getTime(); // Newest first
                            });
                            
                            // Calculate running balance for each entry (from oldest to newest for calculation)
                            const entriesWithBalance = [...sortedEntries].reverse().map((entry, index, reversedArray) => {
                              // Calculate balance up to this point
                              const balance = reversedArray.slice(0, index + 1).reduce((total, e) => {
                                const amount = parseFloat(String(e.amountIncludingVat || 0).replace(',', '.')) || 0;
                                return e.type === 'debit' 
                                  ? total + amount
                                  : total - amount;
                              }, 0);
                              
                              return {
                                ...entry,
                                runningBalance: Math.round(balance * 100) / 100
                              };
                            }).reverse(); // Reverse back to newest first for display
                            
                            return entriesWithBalance.map((entry) => (
                              <TableRow key={entry.id}>
                                <TableCell className="font-medium">
                                  {new Date(entry.date).toLocaleDateString('tr-TR')}
                                </TableCell>
                                <TableCell>
                                  {new Date(entry.month + '-01').toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
                                </TableCell>
                                <TableCell className="max-w-xs">
                                  <div className="truncate" title={entry.description}>
                                    {entry.description}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={entry.type === 'debit' ? 'destructive' : 'default'}>
                                    {entry.type === 'debit' ? 'Borç' : 'Alacak'}
                                  </Badge>
                                </TableCell>
                                <TableCell>₺{Math.round(entry.amountExcludingVat * 100) / 100}</TableCell>
                                <TableCell>₺{Math.round(entry.vatAmount * 100) / 100} (%{entry.vatRate})</TableCell>
                                <TableCell className={entry.type === 'debit' ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                                  {entry.type === 'debit' ? '+' : '-'}₺{Math.round(entry.amountIncludingVat * 100) / 100}
                                </TableCell>
                                <TableCell className={`font-bold ${entry.runningBalance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  ₺{Math.abs(entry.runningBalance).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  <div className="text-xs text-muted-foreground">
                                    {entry.runningBalance >= 0 ? 'Borç' : 'Alacak'}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => startEditEntry(entry)}
                                      title="Düzenle"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => deleteAccountEntry(entry.id)}
                                      title="Sil"
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ));
                          })()}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Henüz cari hesap hareketi bulunmuyor</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsAccountDialogOpen(false)}>
                  Kapat
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Account Entry Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Cari Hesap Kaydını Düzenle</DialogTitle>
                <DialogDescription>
                  Cari hesap kaydının bilgilerini güncelleyin
                </DialogDescription>
              </DialogHeader>

              {editingEntry && (
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-month">Ay</Label>
                      <Input
                        id="edit-month"
                        type="month"
                        value={editingEntry.month}
                        onChange={(e) => setEditingEntry(prev => prev ? ({ ...prev, month: e.target.value }) : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-type">İşlem Türü</Label>
                      <Select 
                        value={editingEntry.type} 
                        onValueChange={(value) => setEditingEntry(prev => prev ? ({ ...prev, type: value }) : null)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="debit">Borç</SelectItem>
                          <SelectItem value="credit">Alacak</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="edit-description">Açıklama</Label>
                    <Input
                      id="edit-description"
                      placeholder="Örn: Haziran Aidatı"
                      value={editingEntry.description}
                      onChange={(e) => setEditingEntry(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="edit-amountExcludingVat">Tutar (KDV Hariç)</Label>
                      <Input
                        id="edit-amountExcludingVat"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={editingEntry.amountExcludingVat}
                        onChange={(e) => calculateEditVatAmount(e.target.value, editingEntry.vatRate)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-vatRate">KDV Oranı (%)</Label>
                      <Select 
                        value={editingEntry.vatRate} 
                        onValueChange={(value) => calculateEditVatAmount(editingEntry.amountExcludingVat, value)}
                      >
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
                    <div>
                      <Label htmlFor="edit-amountIncludingVat">Toplam (KDV Dahil)</Label>
                      <Input
                        id="edit-amountIncludingVat"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={editingEntry.amountIncludingVat}
                        readOnly
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="edit-unitCode">Birim</Label>
                    <Input
                      id="edit-unitCode"
                      placeholder="Ay"
                      value={editingEntry.unitCode}
                      onChange={(e) => setEditingEntry(prev => prev ? ({ ...prev, unitCode: e.target.value }) : null)}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingEntry(null);
                }}>
                  İptal
                </Button>
                <Button onClick={saveEditedEntry}>
                  <Check className="h-4 w-4 mr-2" />
                  Güncelle
                </Button>
              </div>
            </DialogContent>
          </Dialog>

        </div>
      </div>
    </>
  );
}