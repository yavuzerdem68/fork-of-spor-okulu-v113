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
  paymentType?: string; // Added for transaction type from "İşlem" column
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

  // Step 2: Process Excel file (parse only, no matching yet) - Fixed version with column header detection
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
      let descriptionColumnIndex = -1; // "Açıklama" column for athlete/parent names
      let transactionTypeColumnIndex = -1; // "İşlem" column for payment type
      let referenceColumnIndex = -1;

      console.log('Header row:', headerRow);

      // Search for column headers (case-insensitive, Turkish character friendly)
      // Use separate loops to avoid else-if conflicts and be more specific
      for (let i = 0; i < headerRow.length; i++) {
        const header = headerRow[i];
        if (!header || typeof header !== 'string') continue;
        
        const normalizedHeader = normalizeTurkish(header.toLowerCase());
        const originalHeader = header.toString().toUpperCase();
        
        console.log(`Column ${i}: "${header}" -> normalized: "${normalizedHeader}"`);
        
        // Date column patterns - be more specific to avoid conflicts
        if ((normalizedHeader.includes('tarih') && !normalizedHeader.includes('islem')) || 
            normalizedHeader.includes('date') ||
            originalHeader === 'İŞLEM TARİHİ' ||
            originalHeader === 'ISLEM TARIHI' ||
            originalHeader === 'TARİH') {
          dateColumnIndex = i;
          console.log(`Date column found at index ${i}: ${header}`);
        }
      }
      
      for (let i = 0; i < headerRow.length; i++) {
        const header = headerRow[i];
        if (!header || typeof header !== 'string') continue;
        
        const normalizedHeader = normalizeTurkish(header.toLowerCase());
        const originalHeader = header.toString().toUpperCase();
        
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
      }
      
      for (let i = 0; i < headerRow.length; i++) {
        const header = headerRow[i];
        if (!header || typeof header !== 'string') continue;
        
        const normalizedHeader = normalizeTurkish(header.toLowerCase());
        const originalHeader = header.toString().toUpperCase();
        
        // Description column - specifically look for "Açıklama"
        if (normalizedHeader.includes('aciklama') || 
            normalizedHeader.includes('description') ||
            originalHeader === 'AÇIKLAMA' ||
            originalHeader === 'ACIKLAMA') {
          descriptionColumnIndex = i;
          console.log(`Description column found at index ${i}: ${header}`);
        }
      }
      
      for (let i = 0; i < headerRow.length; i++) {
        const header = headerRow[i];
        if (!header || typeof header !== 'string') continue;
        
        const normalizedHeader = normalizeTurkish(header.toLowerCase());
        const originalHeader = header.toString().toUpperCase();
        
        // Transaction type column - specifically look for "İşlem" but not "İşlem Tarihi"
        if ((normalizedHeader.includes('islem') && !normalizedHeader.includes('tarih')) || 
            normalizedHeader.includes('transaction') || 
            normalizedHeader.includes('type') || 
            normalizedHeader.includes('tip') ||
            originalHeader === 'İŞLEM' ||
            originalHeader === 'ISLEM') {
          transactionTypeColumnIndex = i;
          console.log(`Transaction type column found at index ${i}: ${header}`);
        }
      }
      
      for (let i = 0; i < headerRow.length; i++) {
        const header = headerRow[i];
        if (!header || typeof header !== 'string') continue;
        
        const normalizedHeader = normalizeTurkish(header.toLowerCase());
        const originalHeader = header.toString().toUpperCase();
        
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

      // Validate that we found the essential columns
      if (dateColumnIndex === -1) {
        console.warn('Date column not found. Available headers:', headerRow);
        // Don't throw error, continue with fallback logic
      }
      
      if (amountColumnIndex === -1) {
        console.warn('Amount column not found. Available headers:', headerRow);
        // Don't throw error, continue with fallback logic
      }
      
      if (descriptionColumnIndex === -1) {
        console.warn('Description column not found. Available headers:', headerRow);
        // Don't throw error, continue with fallback logic
      }

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
        
        // Extract description from "Açıklama" column - this should contain athlete/parent names
        if (descriptionColumnIndex >= 0 && row[descriptionColumnIndex]) {
          const descCell = row[descriptionColumnIndex];
          if (typeof descCell === 'string' && descCell.trim().length > 0) {
            description = descCell.trim();
          }
        }
        
        // Extract transaction type from "İşlem" column - this should contain payment type (FAST, Havale, etc.)
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
          
          // Create enhanced description that includes transaction type if available
          let enhancedDescription = description;
          if (transactionType) {
            enhancedDescription = `${description} (${transactionType})`;
          }
          
          parsedData.push({
            date: date,
            amount: amount,
            description: description, // Use clean description for matching
            reference: reference,
            rowIndex: i + 1,
            paymentType: transactionType // Store payment type separately
          });
          
          console.log(`Row ${i + 1}: Date=${date}, Amount=${amount}, Description=${enhancedDescription}, TransactionType=${transactionType}`);
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

  // Get available athletes for manual matching - with siblings at the end
  const getAvailableAthletes = (currentAthleteId?: string) => {
    const allAthletes = athletes
      .filter(athlete => athlete.status === 'Aktif' || !athlete.status)
      .map(athlete => ({
        id: athlete.id,
        name: `${athlete.studentName || ''} ${athlete.studentSurname || ''}`.trim(),
        parentName: `${athlete.parentName || ''} ${athlete.parentSurname || ''}`.trim(),
        sport: athlete.selectedSports?.[0] || athlete.sportsBranches?.[0] || 'Genel',
        isSibling: false
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'tr-TR'));

    // If we have a current athlete, find siblings and mark them
    if (currentAthleteId) {
      const siblings = findSiblings(currentAthleteId);
      const siblingIds = new Set(siblings.map(s => s.id.toString()));
      
      // Mark siblings and move them to the end
      const regularAthletes = allAthletes.filter(a => !siblingIds.has(a.id.toString()));
      const siblingAthletes = allAthletes
        .filter(a => siblingIds.has(a.id.toString()))
        .map(a => ({ ...a, isSibling: true }));
      
      return [...regularAthletes, ...siblingAthletes];
    }

    return allAthletes;
  };

  // Find siblings (athletes with same parent)
  const findSiblings = (athleteId: string) => {
    const athlete = athletes.find(a => a.id.toString() === athleteId);
    if (!athlete) return [];
    
    const parentName = `${athlete.parentName || ''} ${athlete.parentSurname || ''}`.trim();
    const parentPhone = athlete.parentPhone && typeof athlete.parentPhone === 'string' ? athlete.parentPhone.trim() : '';
    const parentEmail = athlete.parentEmail && typeof athlete.parentEmail === 'string' ? athlete.parentEmail.trim() : '';
    
    if (!parentName && !parentPhone && !parentEmail) return [];
    
    return athletes.filter(a => {
      if (a.id === athlete.id) return false;
      
      const aParentName = `${a.parentName || ''} ${a.parentSurname || ''}`.trim();
      const aParentPhone = a.parentPhone && typeof a.parentPhone === 'string' ? a.parentPhone.trim() : '';
      const aParentEmail = a.parentEmail && typeof a.parentEmail === 'string' ? a.parentEmail.trim() : '';
      
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
                                          {getAvailableAthletes(result.athleteId || undefined).map(athlete => (
                                            <SelectItem 
                                              key={athlete.id} 
                                              value={athlete.id.toString()}
                                              className={athlete.isSibling ? "bg-purple-50 border-l-4 border-l-purple-400" : ""}
                                            >
                                              <div className="flex flex-col">
                                                <div className="flex items-center space-x-2">
                                                  <span className={`font-medium ${athlete.isSibling ? 'text-purple-800' : ''}`}>
                                                    {athlete.name}
                                                  </span>
                                                  {athlete.isSibling && (
                                                    <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 text-xs">
                                                      Kardeş
                                                    </Badge>
                                                  )}
                                                </div>
                                                <span className={`text-xs ${athlete.isSibling ? 'text-purple-600' : 'text-muted-foreground'}`}>
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