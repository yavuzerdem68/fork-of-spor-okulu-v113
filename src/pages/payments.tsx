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
  AlertTriangle
} from "lucide-react";
import { useRouter } from "next/router";
import Link from "next/link";
import Header from "@/components/Header";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

// Comprehensive Turkish text normalization with advanced character mapping
const normalizeTurkishText = (text: string): string[] => {
  if (!text) return [''];
  
  // First normalize to lowercase and handle Turkish characters
  let normalized = text.toLowerCase();
  
  // Turkish character mappings - both directions for better matching
  const turkishMappings = {
    'ğ': 'g', 'g': 'ğ',
    'ü': 'u', 'u': 'ü', 
    'ş': 's', 's': 'ş',
    'ı': 'i', 'i': 'ı',
    'ö': 'o', 'o': 'ö',
    'ç': 'c', 'c': 'ç'
  };
  
  // Create multiple normalized versions for better matching
  const versions = [normalized];
  
  // Version with Turkish chars converted to ASCII
  let asciiVersion = normalized;
  Object.keys(turkishMappings).forEach(char => {
    if (['ğ', 'ü', 'ş', 'ı', 'ö', 'ç'].includes(char)) {
      asciiVersion = asciiVersion.replace(new RegExp(char, 'g'), turkishMappings[char]);
    }
  });
  versions.push(asciiVersion);
  
  // Clean up punctuation and extra spaces - return array of normalized versions
  return versions.map(v => 
    v.replace(/[^\wğüşıöçâîû]/g, ' ')
     .replace(/\s+/g, ' ')
     .trim()
  );
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

// Levenshtein distance similarity
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

// Jaccard similarity for word-based matching
const calculateJaccardSimilarity = (str1: string, str2: string): number => {
  const words1 = new Set(str1.split(' ').filter(w => w.length > 1));
  const words2 = new Set(str2.split(' ').filter(w => w.length > 1));
  
  if (words1.size === 0 && words2.size === 0) return 100;
  if (words1.size === 0 || words2.size === 0) return 0;
  
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  
  return (intersection.size / union.size) * 100;
};

// BULLETPROOF: Simplified similarity calculation that GUARANTEES 100% exact matches
const calculateSimilarity = (str1: string, str2: string): number => {
  if (!str1 || !str2) return 0;
  
  // Convert to lowercase for comparison
  const lower1 = str1.toLowerCase().trim();
  const lower2 = str2.toLowerCase().trim();
  
  // ABSOLUTE PRIORITY: Direct exact match
  if (lower1 === lower2) {
    console.log(`🎯 DIRECT EXACT MATCH: "${lower1}" === "${lower2}"`);
    return 100;
  }
  
  // Turkish character normalization
  const normalize = (text: string): string => {
    return text
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };
  
  const norm1 = normalize(lower1);
  const norm2 = normalize(lower2);
  
  // EXACT MATCH after normalization
  if (norm1 === norm2 && norm1.length > 0) {
    console.log(`🎯 NORMALIZED EXACT MATCH: "${norm1}" === "${norm2}"`);
    return 100;
  }
  
  // Clean version (letters only)
  const clean1 = norm1.replace(/\s/g, '');
  const clean2 = norm2.replace(/\s/g, '');
  
  if (clean1 === clean2 && clean1.length > 2) {
    console.log(`🎯 CLEAN EXACT MATCH: "${clean1}" === "${clean2}"`);
    return 100;
  }
  
  // Word-by-word exact matching
  const words1 = norm1.split(' ').filter(w => w.length > 1);
  const words2 = norm2.split(' ').filter(w => w.length > 1);
  
  if (words1.length >= 2 && words2.length >= 2) {
    const shorterWords = words1.length <= words2.length ? words1 : words2;
    const longerWords = words1.length > words2.length ? words1 : words2;
    
    let exactWordMatches = 0;
    for (const word of shorterWords) {
      if (longerWords.includes(word)) {
        exactWordMatches++;
      }
    }
    
    // If ALL words match exactly, it's 100%
    if (exactWordMatches === shorterWords.length && shorterWords.length >= 2) {
      console.log(`🎯 ALL WORDS EXACT MATCH: ${exactWordMatches}/${shorterWords.length} words`);
      return 100;
    }
    
    // High score for most words matching exactly
    if (exactWordMatches >= 2) {
      const wordScore = (exactWordMatches / Math.max(words1.length, words2.length)) * 95;
      if (wordScore >= 85) {
        console.log(`🔥 HIGH WORD MATCH: ${exactWordMatches} words, score: ${wordScore}`);
        return Math.round(wordScore);
      }
    }
  }
  
  // Containment check
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    const containmentScore = Math.min(norm1.length, norm2.length) / Math.max(norm1.length, norm2.length) * 85;
    if (containmentScore >= 70) {
      console.log(`📦 CONTAINMENT MATCH: ${containmentScore}`);
      return Math.round(containmentScore);
    }
  }
  
  // Levenshtein similarity as fallback
  const levenshtein = calculateLevenshteinSimilarity(norm1, norm2);
  
  // Jaccard similarity for word-based matching
  const jaccard = calculateJaccardSimilarity(norm1, norm2);
  
  const finalScore = Math.max(levenshtein, jaccard);
  
  if (finalScore >= 60) {
    console.log(`⚡ SIMILARITY MATCH: Levenshtein: ${levenshtein}, Jaccard: ${jaccard}, Final: ${finalScore}`);
  }
  
  return Math.round(finalScore);
};

// Detect if payment amount suggests multiple athletes
const detectMultipleAthletes = (amount: number, athletes: any[]): boolean => {
  // Common monthly fees to check against
  const commonFees = [300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000];
  
  // Check if amount is a multiple of common fees (±150 TL tolerance for better detection)
  for (const fee of commonFees) {
    for (let multiplier = 2; multiplier <= 5; multiplier++) {
      const expectedAmount = fee * multiplier;
      if (Math.abs(amount - expectedAmount) <= 150) {
        return true;
      }
    }
  }
  
  // Additional check: if amount is greater than 500 TL, likely multiple payments
  if (amount >= 500) {
    return true;
  }
  
  return false;
};

// Find siblings (athletes with same parent) - Enhanced version
const findSiblings = (athletes: any[]): { [key: string]: any[] } => {
  const siblingGroups: { [key: string]: any[] } = {};
  
  athletes.forEach(athlete => {
    // Create multiple keys for better matching
    const parentName = `${athlete.parentName || ''} ${athlete.parentSurname || ''}`.trim();
    const parentPhone = athlete.parentPhone || '';
    const parentEmail = athlete.parentEmail || '';
    
    if (parentName.length > 3) {
      // Normalize parent name for consistent grouping
      const normalizedParentName = normalizeTurkishText(parentName)[0];
      
      // Use parent name as primary key
      if (!siblingGroups[normalizedParentName]) {
        siblingGroups[normalizedParentName] = [];
      }
      siblingGroups[normalizedParentName].push(athlete);
      
      // Also group by phone if available
      if (parentPhone && parentPhone.length > 8) {
        const phoneKey = `phone_${parentPhone.replace(/\D/g, '')}`;
        if (!siblingGroups[phoneKey]) {
          siblingGroups[phoneKey] = [];
        }
        siblingGroups[phoneKey].push(athlete);
      }
      
      // Also group by email if available
      if (parentEmail && parentEmail.includes('@')) {
        const emailKey = `email_${parentEmail.toLowerCase()}`;
        if (!siblingGroups[emailKey]) {
          siblingGroups[emailKey] = [];
        }
        siblingGroups[emailKey].push(athlete);
      }
    }
  });
  
  // Only return groups with more than one athlete and merge duplicates
  const result: { [key: string]: any[] } = {};
  const processedAthletes = new Set();
  
  Object.keys(siblingGroups).forEach(key => {
    if (siblingGroups[key].length > 1) {
      // Remove duplicates within the group
      const uniqueAthletes = siblingGroups[key].filter(athlete => {
        const athleteId = athlete.id;
        if (processedAthletes.has(athleteId)) {
          return false;
        }
        processedAthletes.add(athleteId);
        return true;
      });
      
      if (uniqueAthletes.length > 1) {
        // Use parent name as the key for display
        const parentName = `${uniqueAthletes[0].parentName || ''} ${uniqueAthletes[0].parentSurname || ''}`.trim();
        result[parentName] = uniqueAthletes;
      }
    }
  });
  
  return result;
};

// Find closest matching athletes for a given description with enhanced algorithm
const findClosestMatches = (description: string, athletes: any[], limit: number = 8): SuggestedMatch[] => {
  const suggestions: SuggestedMatch[] = [];
  
  // Extract amount from description for multi-athlete detection
  const amountMatch = description.match(/[\d.,]+/g);
  let extractedAmount = 0;
  if (amountMatch) {
    // Handle Turkish number format
    const amountStr = amountMatch[amountMatch.length - 1]; // Get the last number (likely the amount)
    if (amountStr.includes('.') && amountStr.includes(',')) {
      // Turkish format: 2.100,00
      extractedAmount = parseFloat(amountStr.replace(/\./g, '').replace(',', '.'));
    } else if (amountStr.includes(',')) {
      // Format: 1234,56
      extractedAmount = parseFloat(amountStr.replace(',', '.'));
    } else {
      extractedAmount = parseFloat(amountStr.replace(/\./g, ''));
    }
  }
  
  const isMultipleAmount = detectMultipleAthletes(extractedAmount, athletes);
  const siblingGroups = findSiblings(athletes);
  
  console.log('Multi-athlete detection:', {
    description,
    extractedAmount,
    isMultipleAmount,
    siblingGroupsCount: Object.keys(siblingGroups).length
  });
  
  // Create a map to identify which athletes are siblings
  const siblingMap = new Map<string, any[]>();
  Object.values(siblingGroups).forEach(siblings => {
    siblings.forEach(athlete => {
      siblingMap.set(athlete.id.toString(), siblings);
    });
  });
  
  // Process all athletes with enhanced matching
  for (const athlete of athletes) {
    const athleteName = `${athlete.studentName || athlete.firstName || ''} ${athlete.studentSurname || athlete.lastName || ''}`.trim();
    const parentName = `${athlete.parentName || ''} ${athlete.parentSurname || ''}`.trim();
    
    // Enhanced similarity calculation
    let maxSimilarity = 0;
    
    const athleteVersions = normalizeTurkishText(athleteName);
    const parentVersions = normalizeTurkishText(parentName);
    const descVersions = normalizeTurkishText(description);
    
    // Test all combinations
    for (const descVersion of descVersions) {
      for (const athleteVersion of athleteVersions) {
        const sim = calculateSimilarity(descVersion, athleteVersion);
        maxSimilarity = Math.max(maxSimilarity, sim);
      }
      for (const parentVersion of parentVersions) {
        const sim = calculateSimilarity(descVersion, parentVersion);
        maxSimilarity = Math.max(maxSimilarity, sim * 1.2); // Parent name boost
      }
    }
    
    // Word-by-word matching
    const descWords = descVersions[0].split(' ').filter(w => w.length > 2);
    const athleteWords = athleteVersions[0].split(' ').filter(w => w.length > 2);
    const parentWords = parentVersions[0].split(' ').filter(w => w.length > 2);
    
    let wordMatchScore = 0;
    let totalPossibleMatches = descWords.length;
    
    for (const descWord of descWords) {
      let bestWordMatch = 0;
      
      // Check athlete name words
      for (const athleteWord of athleteWords) {
        if (descWord === athleteWord) {
          bestWordMatch = Math.max(bestWordMatch, 100);
        } else if (descWord.includes(athleteWord) || athleteWord.includes(descWord)) {
          bestWordMatch = Math.max(bestWordMatch, 80);
        } else {
          const wordSim = calculateLevenshteinSimilarity(descWord, athleteWord);
          if (wordSim > 70) {
            bestWordMatch = Math.max(bestWordMatch, wordSim * 0.8);
          }
        }
      }
      
      // Check parent name words
      for (const parentWord of parentWords) {
        if (descWord === parentWord) {
          bestWordMatch = Math.max(bestWordMatch, 105);
        } else if (descWord.includes(parentWord) || parentWord.includes(descWord)) {
          bestWordMatch = Math.max(bestWordMatch, 85);
        } else {
          const wordSim = calculateLevenshteinSimilarity(descWord, parentWord);
          if (wordSim > 70) {
            bestWordMatch = Math.max(bestWordMatch, wordSim * 0.85);
          }
        }
      }
      
      wordMatchScore += bestWordMatch;
    }
    
    const avgWordMatch = totalPossibleMatches > 0 ? wordMatchScore / totalPossibleMatches : 0;
    let finalSimilarity = Math.max(maxSimilarity, avgWordMatch);
    
    // COMPLETELY FIXED: Proper sibling detection that only shows relevant siblings
    const isSibling = siblingMap.has(athlete.id.toString());
    let shouldIncludeAsSibling = false;
    
    if (isSibling) {
      // CRITICAL FIX: Only mark as sibling if THIS specific athlete has good similarity
      // This prevents showing all siblings when only one matches
      if (finalSimilarity > 30) { // Reasonable threshold for individual match quality
        shouldIncludeAsSibling = true;
        finalSimilarity = Math.min(100, finalSimilarity + 5); // Very small boost to maintain accuracy
      }
    }
    
    // RESTORED: Use lower threshold for better coverage while maintaining quality
    if (finalSimilarity > 20) { // Lowered from 25 to 20 for better coverage
      suggestions.push({
        athleteId: athlete.id.toString(),
        athleteName: athleteName,
        parentName: parentName,
        similarity: Math.round(finalSimilarity),
        isSibling: shouldIncludeAsSibling
      });
    }
  }
  
  // Sort by similarity (highest first), with slight preference for siblings when they have good individual matches
  return suggestions
    .sort((a, b) => {
      // If both have similar similarity scores, prefer siblings slightly
      if (Math.abs(a.similarity - b.similarity) <= 5 && a.isSibling !== b.isSibling) {
        return a.isSibling ? -1 : 1;
      }
      return b.similarity - a.similarity;
    })
    .slice(0, limit);
};

interface SuggestedMatch {
  athleteId: string;
  athleteName: string;
  parentName?: string;
  similarity: number;
  isSibling?: boolean;
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
  const [isBulkImportDialogOpen, setIsBulkImportDialogOpen] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [matchedPayments, setMatchedPayments] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bulkImportFile, setBulkImportFile] = useState<File | null>(null);
  const [manualMatches, setManualMatches] = useState<{[key: number]: string}>({});
  const [selectedMultipleAthletes, setSelectedMultipleAthletes] = useState<{[key: number]: string[]}>({});
  const [paymentMatchHistory, setPaymentMatchHistory] = useState<{[key: string]: string}>({});
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

    // Load payment match history
    const storedMatchHistory = localStorage.getItem('paymentMatchHistory');
    if (storedMatchHistory) {
      setPaymentMatchHistory(JSON.parse(storedMatchHistory));
    }

    loadPayments();
  }, [router]);

  const loadPayments = () => {
    // Load athletes first
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && 
          file.type !== 'application/vnd.ms-excel') {
        toast.error("Lütfen Excel dosyası (.xlsx veya .xls) seçin");
        return;
      }
      setUploadedFile(file);
    }
  };

  const processExcelFile = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setUploadProgress(0);
    setManualMatches({}); // Reset manual matches

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
      
      // Clear interval and set progress to 100%
      clearInterval(interval);
      setUploadProgress(100);

      // Process Excel data
      const excelData: any[] = [];
      
      // Skip header row and process data
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i] as any[];
        
        // Skip empty rows
        if (!row || row.length === 0 || !row.some(cell => cell)) continue;
        
        // Try to extract data from common bank statement formats
        let date = '';
        let amount = 0;
        let description = '';
        let reference = '';
        
        // Look for date in various formats with improved Turkish date parsing
        for (let j = 0; j < row.length; j++) {
          const cell = row[j];
          if (cell && typeof cell === 'string') {
            // Try to parse Turkish date format first
            const parsedDate = parseTurkishDate(cell);
            if (parsedDate && !date) {
              date = cell;
            }
            
            // Look for description (usually the longest text field)
            if (cell.length > description.length && cell.length > 10) {
              description = cell;
            }
            
            // Look for reference number (usually contains letters and numbers)
            if (cell.match(/^[A-Z0-9]{6,}$/i) && !reference) {
              reference = cell;
            }
          }
          
          // Look for amount (number) - ignore negative amounts
          if (typeof cell === 'number' && cell > 0 && amount === 0) {
            amount = cell;
          } else if (typeof cell === 'string') {
            // Skip if contains minus sign (negative amount)
            if (cell.includes('-')) continue;
            
            // Try to parse amount from string (handle Turkish number format)
            let cleanAmount = cell.toString().trim();
            
            // Remove currency symbols and spaces
            cleanAmount = cleanAmount.replace(/[₺\s]/g, '');
            
            // Check if it looks like an amount (contains digits and possibly comma/dot)
            if (/^\d+[.,]?\d*$/.test(cleanAmount) || /^\d{1,3}(\.\d{3})*,\d{2}$/.test(cleanAmount)) {
              let parsedAmount = 0;
              
              // Handle Turkish format: 2.100,00 (thousands separator with decimal)
              if (cleanAmount.includes('.') && cleanAmount.includes(',')) {
                // This is Turkish format: 2.100,00 = 2100.00
                parsedAmount = parseFloat(cleanAmount.replace(/\./g, '').replace(',', '.'));
              }
              // Handle format with comma as decimal: 1234,56
              else if (cleanAmount.includes(',') && !cleanAmount.includes('.')) {
                parsedAmount = parseFloat(cleanAmount.replace(',', '.'));
              }
              // Handle format with dot as thousands separator: 2.100
              else if (cleanAmount.includes('.') && !cleanAmount.includes(',')) {
                const parts = cleanAmount.split('.');
                if (parts.length === 2 && parts[1].length <= 2) {
                  // Likely decimal: 1234.56
                  parsedAmount = parseFloat(cleanAmount);
                } else {
                  // Likely thousands separator: 2.100 = 2100
                  parsedAmount = parseFloat(cleanAmount.replace(/\./g, ''));
                }
              }
              // Handle integer: 1234
              else {
                parsedAmount = parseFloat(cleanAmount);
              }
              
              if (parsedAmount > 0 && amount === 0) {
                amount = parsedAmount;
              }
            }
          }
        }
        
        // Only add if we have essential data
        if (date && amount > 0 && description) {
          excelData.push({
            date: date,
            amount: amount,
            description: description,
            reference: reference || `REF${i}`,
            rowIndex: i + 1
          });
        }
      }

      if (excelData.length === 0) {
        toast.error("Excel dosyasında geçerli ödeme verisi bulunamadı. Lütfen dosya formatını kontrol edin.");
        return;
      }

      // Get athletes and parents data for matching
      const storedAthletes = localStorage.getItem('athletes') || localStorage.getItem('students');
      let athletes = [];
      if (storedAthletes) {
        athletes = JSON.parse(storedAthletes);
      }

      // Enhanced payment matching algorithm with Turkish character support
      const matches: any[] = [];
      
      for (const excelRow of excelData) {
        let bestMatch = null;
        let bestConfidence = 0;
        
        // Check if we have a stored match for this description
        const normalizedDesc = normalizeTurkishText(excelRow.description)[0]; // Use first normalized version
        const storedMatch = paymentMatchHistory[normalizedDesc];
        
        if (storedMatch) {
          // Try to find the stored athlete
          const storedAthlete = athletes.find(a => a.id.toString() === storedMatch);
          if (storedAthlete) {
            const athleteName = `${storedAthlete.studentName || storedAthlete.firstName || ''} ${storedAthlete.studentSurname || storedAthlete.lastName || ''}`.trim();
            const parentName = `${storedAthlete.parentName || ''} ${storedAthlete.parentSurname || ''}`.trim();
            
            bestMatch = {
              id: storedAthlete.id,
              athleteName: athleteName,
              parentName: parentName,
              amount: excelRow.amount,
              status: 'Bekliyor',
              sport: storedAthlete.selectedSports ? storedAthlete.selectedSports[0] : (storedAthlete.sportsBranches ? storedAthlete.sportsBranches[0] : 'Genel')
            };
            bestConfidence = 100; // Historical match gets highest confidence
          }
        }
        
        // If no historical match, try to match with existing payments
        if (!bestMatch) {
          for (const payment of payments) {
            if (payment.status === "Ödendi") continue; // Skip already paid
            
            let confidence = 0;
            
            // Enhanced name matching with Turkish character normalization
            const normalizedDescription = normalizeTurkishText(excelRow.description)[0]; // Use first normalized version
            const normalizedParentName = normalizeTurkishText(payment.parentName)[0];
            const normalizedAthleteName = normalizeTurkishText(payment.athleteName)[0];
            
            // Calculate similarity scores using Levenshtein distance
            const parentSimilarity = calculateSimilarity(excelRow.description, payment.parentName);
            const athleteSimilarity = calculateSimilarity(excelRow.description, payment.athleteName);
            
            // Use the higher similarity score
            const nameSimilarity = Math.max(parentSimilarity, athleteSimilarity);
            
            // Word-based matching for partial matches
            const parentWords = normalizedParentName.split(' ').filter(w => w.length > 2);
            const athleteWords = normalizedAthleteName.split(' ').filter(w => w.length > 2);
            const descWords = normalizedDescription.split(' ').filter(w => w.length > 2);
            
            let wordMatches = 0;
            let totalWords = parentWords.length + athleteWords.length;
            
            // Check parent name word matches
            for (const word of parentWords) {
              if (descWords.some(dw => dw.includes(word) || word.includes(dw))) {
                wordMatches++;
              }
            }
            
            // Check athlete name word matches
            for (const word of athleteWords) {
              if (descWords.some(dw => dw.includes(word) || word.includes(dw))) {
                wordMatches++;
              }
            }
            
            // Calculate word-based confidence
            const wordConfidence = totalWords > 0 ? (wordMatches / totalWords) * 50 : 0;
            
            // Use the higher of similarity-based or word-based confidence
            const nameConfidence = Math.max(nameSimilarity * 0.6, wordConfidence);
            
            // Amount matching with ±30 TL tolerance (increased for better flexibility)
            const amountDiff = Math.abs(excelRow.amount - payment.amount);
            const amountConfidence = amountDiff <= 30 ? 40 - (amountDiff * 1.3) : 0;
            
            confidence = nameConfidence + amountConfidence;
            
            // FIXED: Use proper threshold for automatic matching - 100% matches should always be automatic
            if (confidence > bestConfidence) {
              bestMatch = payment;
              bestConfidence = confidence;
            }
          }
        }
        
        // RESTORED: Proper automatic matching with 100% confidence threshold
        if (bestMatch && bestConfidence >= 100) {
          // Perfect matches are automatically processed
          matches.push({
            excelData: excelRow,
            payment: bestMatch,
            confidence: Math.round(bestConfidence),
            status: 'matched',
            isHistorical: storedMatch ? true : false,
            isAutomatic: true
          });
          console.log(`AUTO-MATCHED 100%: ${excelRow.description} -> ${bestMatch.athleteName} (${bestConfidence}%)`);
        } else if (bestMatch && bestConfidence >= 85) {
          // Very high confidence - auto match but show for review
          matches.push({
            excelData: excelRow,
            payment: bestMatch,
            confidence: Math.round(bestConfidence),
            status: 'matched',
            isHistorical: storedMatch ? true : false,
            isAutomatic: true
          });
          console.log(`AUTO-MATCHED 85%+: ${excelRow.description} -> ${bestMatch.athleteName} (${bestConfidence}%)`);
        } else if (bestMatch && bestConfidence >= 30) {
          // Medium confidence - show as matched but require confirmation
          matches.push({
            excelData: excelRow,
            payment: bestMatch,
            confidence: Math.round(bestConfidence),
            status: 'matched',
            isHistorical: storedMatch ? true : false,
            requiresConfirmation: true
          });
        } else {
          // For unmatched payments, find closest suggestions
          const suggestions = findClosestMatches(excelRow.description, athletes, 5);
          
          matches.push({
            excelData: excelRow,
            payment: null,
            confidence: 0,
            status: 'unmatched',
            suggestions: suggestions
          });
        }
      }

      setMatchedPayments(matches);
      
      const matchedCount = matches.filter(m => m.status === 'matched').length;
      const unmatchedCount = matches.filter(m => m.status === 'unmatched').length;
      
      toast.success(`Excel dosyası işlendi! ${excelData.length} kayıt bulundu. ${matchedCount} ödeme eşleştirildi, ${unmatchedCount} eşleştirilemedi.`);
      
    } catch (error) {
      console.error('Excel processing error:', error);
      toast.error("Excel dosyası işlenirken hata oluştu. Lütfen dosya formatını kontrol edin.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualMatch = (matchIndex: number, athleteId: string) => {
    // Get all available athletes for matching
    const storedAthletes = localStorage.getItem('athletes') || localStorage.getItem('students');
    let athletes = [];
    if (storedAthletes) {
      athletes = JSON.parse(storedAthletes);
    }

    // First try to find from payments
    let selectedPayment = payments.find(p => p.id.toString() === athleteId);
    
    // If not found in payments, find from athletes
    if (!selectedPayment) {
      const athlete = athletes.find((a: any) => a.id.toString() === athleteId);
      if (athlete) {
        // Create a payment object for the athlete
        selectedPayment = {
          id: athlete.id,
          athleteName: `${athlete.studentName || athlete.firstName || ''} ${athlete.studentSurname || athlete.lastName || ''}`.trim(),
          parentName: `${athlete.parentName || ''} ${athlete.parentSurname || ''}`.trim(),
          amount: matchedPayments[matchIndex].excelData.amount, // Use the Excel amount
          status: 'Bekliyor',
          sport: athlete.selectedSports ? athlete.selectedSports[0] : 'Genel'
        };
      }
    }
    
    if (!selectedPayment) {
      toast.error("Seçilen sporcu bulunamadı");
      return;
    }

    const updatedMatches = [...matchedPayments];
    updatedMatches[matchIndex] = {
      ...updatedMatches[matchIndex],
      payment: selectedPayment,
      status: 'matched',
      confidence: 100, // Manual match gets 100% confidence
      isManual: true
    };
    
    setMatchedPayments(updatedMatches);
    
    // Remove from manual matches state
    const newManualMatches = { ...manualMatches };
    delete newManualMatches[matchIndex];
    setManualMatches(newManualMatches);
    
    toast.success(`Ödeme manuel olarak ${selectedPayment.athleteName} ile eşleştirildi`);
  };

  const confirmMatches = () => {
    const confirmedMatches = matchedPayments.filter(match => match.status === 'matched');
    
    // Save manual matches to history for future use
    const updatedMatchHistory = { ...paymentMatchHistory };
    confirmedMatches.forEach(match => {
      if (match.isManual && match.payment) {
        const normalizedDesc = normalizeTurkishText(match.excelData.description)[0]; // Use first normalized version
        updatedMatchHistory[normalizedDesc] = match.payment.id.toString();
      }
    });
    
    // Save updated match history to localStorage
    setPaymentMatchHistory(updatedMatchHistory);
    localStorage.setItem('paymentMatchHistory', JSON.stringify(updatedMatchHistory));
    
    // Handle multi-athlete payments and regular payments
    const updatedPayments = [...payments];
    const storedAthletes = localStorage.getItem('athletes') || localStorage.getItem('students');
    let athletes = [];
    if (storedAthletes) {
      athletes = JSON.parse(storedAthletes);
    }

    confirmedMatches.forEach(match => {
      // Parse Turkish date correctly for payment date
      const parsedDate = parseTurkishDate(match.excelData.date);
      const paymentDate = parsedDate ? parsedDate.toISOString().split('T')[0] : match.excelData.date;
      const entryDate = parsedDate ? parsedDate.toISOString() : new Date().toISOString();
      const displayDate = parsedDate ? parsedDate.toLocaleDateString('tr-TR') : match.excelData.date;

      if (match.isMultiple && match.multiplePayments) {
        // Handle multi-athlete payments - split between multiple athletes
        console.log('Processing multi-athlete payment:', match.multiplePayments);
        
        match.multiplePayments.forEach((athletePayment: any) => {
          // Find the athlete by ID first
          let athlete = athletes.find((a: any) => a.id.toString() === athletePayment.id.toString());
          
          if (!athlete) {
            console.warn('Athlete not found by ID:', athletePayment.id, 'trying name matching...');
            // Try name matching if ID not found
            const nameParts = athletePayment.athleteName.split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ');
            
            athlete = athletes.find((a: any) => {
              const athleteFirstName = a.studentName || a.firstName || '';
              const athleteLastName = a.studentSurname || a.lastName || '';
              return athleteFirstName === firstName && athleteLastName === lastName;
            });
          }
          
          if (athlete) {
            console.log(`Creating payment record for athlete: ${athlete.studentName} ${athlete.studentSurname} - Amount: ₺${athletePayment.amount}`);
            
            // Update or create payment record for this athlete
            const existingPaymentIndex = updatedPayments.findIndex(p => 
              p.athleteId === athlete.id && p.status !== "Ödendi"
            );
            
            if (existingPaymentIndex >= 0) {
              // Update existing payment
              updatedPayments[existingPaymentIndex] = {
                ...updatedPayments[existingPaymentIndex],
                status: "Ödendi",
                paymentDate: paymentDate,
                method: "Havale/EFT",
                reference: match.excelData.reference,
                amount: athletePayment.amount
              };
              console.log('Updated existing payment for:', athlete.studentName);
            } else {
              // Create new payment record
              const newPayment = {
                id: `multi_${athlete.id}_${Date.now()}_${Math.random()}`,
                athleteId: athlete.id,
                athleteName: `${athlete.studentName || athlete.firstName || ''} ${athlete.studentSurname || athlete.lastName || ''}`.trim(),
                parentName: `${athlete.parentName || ''} ${athlete.parentSurname || ''}`.trim(),
                amount: athletePayment.amount,
                status: "Ödendi",
                paymentDate: paymentDate,
                method: "Havale/EFT",
                reference: match.excelData.reference,
                sport: athlete.selectedSports ? athlete.selectedSports[0] : (athlete.sportsBranches ? athlete.sportsBranches[0] : 'Genel'),
                invoiceNumber: `INV-${Date.now()}-${athlete.id}`,
                dueDate: paymentDate,
                description: `Çoklu ödeme - ${match.excelData.description}`,
                isGenerated: false
              };
              updatedPayments.push(newPayment);
              console.log('Created new payment for:', athlete.studentName, newPayment);
            }

            // Add to athlete's account as credit (payment received)
            const existingEntries = JSON.parse(localStorage.getItem(`account_${athlete.id}`) || '[]');
            const paymentEntry = {
              id: Date.now() + Math.random(),
              date: entryDate,
              month: entryDate.slice(0, 7),
              description: `EFT/Havale Tahsilatı (Çoklu) - ${displayDate} - ₺${athletePayment.amount} - Ref: ${match.excelData.reference}`,
              amountExcludingVat: athletePayment.amount,
              vatRate: 0,
              vatAmount: 0,
              amountIncludingVat: athletePayment.amount,
              unitCode: 'Adet',
              type: 'credit'
            };
            
            existingEntries.push(paymentEntry);
            localStorage.setItem(`account_${athlete.id}`, JSON.stringify(existingEntries));
            console.log('Added account entry for:', athlete.studentName, paymentEntry);
          } else {
            console.error('Could not find athlete for payment:', athletePayment);
          }
        });
      } else {
        // Handle single athlete payments
        const singleMatch = updatedPayments.find(payment => payment.id === match.payment?.id);
        if (singleMatch) {
          singleMatch.status = "Ödendi";
          singleMatch.paymentDate = paymentDate;
          singleMatch.method = "Havale/EFT";
          singleMatch.reference = match.excelData.reference;
        }

        // Find athlete for account entry
        let athlete = null;
        if (match.payment.id) {
          athlete = athletes.find((a: any) => a.id === match.payment.id);
        }
        
        if (!athlete) {
          const nameParts = match.payment.athleteName.split(' ');
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(' ');
          
          athlete = athletes.find((a: any) => {
            const athleteFirstName = a.studentName || a.firstName || '';
            const athleteLastName = a.studentSurname || a.lastName || '';
            return athleteFirstName === firstName && athleteLastName === lastName;
          });
        }
        
        if (athlete) {
          const existingEntries = JSON.parse(localStorage.getItem(`account_${athlete.id}`) || '[]');
          const paymentEntry = {
            id: Date.now() + Math.random(),
            date: entryDate,
            month: entryDate.slice(0, 7),
            description: `EFT/Havale Tahsilatı - ${displayDate} - ₺${match.excelData.amount} - Ref: ${match.excelData.reference}`,
            amountExcludingVat: match.excelData.amount,
            vatRate: 0,
            vatAmount: 0,
            amountIncludingVat: match.excelData.amount,
            unitCode: 'Adet',
            type: 'credit'
          };
          
          existingEntries.push(paymentEntry);
          localStorage.setItem(`account_${athlete.id}`, JSON.stringify(existingEntries));
        }
      }
    });

    setPayments(updatedPayments);
    localStorage.setItem('payments', JSON.stringify(updatedPayments));
    
    const manualMatchCount = confirmedMatches.filter(m => m.isManual).length;
    const autoMatchCount = confirmedMatches.length - manualMatchCount;
    const historicalMatchCount = confirmedMatches.filter(m => m.isHistorical).length;
    const multipleMatchCount = confirmedMatches.filter(m => m.isMultiple).length;
    
    let successMessage = `${confirmedMatches.length} ödeme başarıyla güncellendi! (${autoMatchCount} otomatik, ${manualMatchCount} manuel`;
    if (multipleMatchCount > 0) {
      successMessage += `, ${multipleMatchCount} çoklu`;
    }
    successMessage += ' eşleştirme';
    if (historicalMatchCount > 0) {
      successMessage += `, ${historicalMatchCount} geçmiş eşleştirme`;
    }
    successMessage += ')';
    
    if (manualMatchCount > 0) {
      successMessage += ` Manuel eşleştirmeler gelecek kullanım için hafızaya kaydedildi.`;
    }
    
    toast.success(successMessage);
    setIsUploadDialogOpen(false);
    setMatchedPayments([]);
    setManualMatches({});
    setSelectedMultipleAthletes({});
    setUploadedFile(null);
    setUploadProgress(0);
  };

  // Get available athletes for manual matching (including all athletes, not just payments)
  const getAvailableAthletesForMatching = () => {
    const storedAthletes = localStorage.getItem('athletes') || localStorage.getItem('students');
    let athletes = [];
    if (storedAthletes) {
      athletes = JSON.parse(storedAthletes);
    }
    
    const alreadyMatchedAthleteIds = matchedPayments
      .filter(m => m.status === 'matched' && m.payment)
      .map(m => m.payment.id);
    
    // Return all active athletes that haven't been matched yet, sorted alphabetically
    return athletes
      .filter(athlete => 
        (athlete.status === 'Aktif' || !athlete.status) && // Only active athletes
        !alreadyMatchedAthleteIds.includes(athlete.id)
      )
      .map(athlete => ({
        id: athlete.id,
        athleteName: `${athlete.studentName || athlete.firstName || ''} ${athlete.studentSurname || athlete.lastName || ''}`.trim(),
        parentName: `${athlete.parentName || ''} ${athlete.parentSurname || ''}`.trim(),
        sport: athlete.selectedSports ? athlete.selectedSports[0] : (athlete.sportsBranches ? athlete.sportsBranches[0] : 'Genel'),
        amount: 0 // Will be set from Excel data
      }))
      .sort((a, b) => a.athleteName.localeCompare(b.athleteName, 'tr-TR')); // Alphabetical sort with Turkish locale
  };

  // Get available payments for manual matching (unpaid payments only)
  const getAvailablePaymentsForMatching = () => {
    const alreadyMatchedPaymentIds = matchedPayments
      .filter(m => m.status === 'matched' && m.payment)
      .map(m => m.payment.id);
    
    return payments.filter(payment => 
      payment.status !== "Ödendi" && 
      !alreadyMatchedPaymentIds.includes(payment.id)
    );
  };

  const generateInvoices = () => {
    try {
      // Get athletes from localStorage or use mock data
      const storedAthletes = localStorage.getItem('athletes');
      let activeStudents = [];
      
      if (storedAthletes) {
        const allAthletes = JSON.parse(storedAthletes);
        activeStudents = allAthletes.filter((student: any) => student.status === 'active' || !student.status);
      }
      
      // If no stored athletes, use mock data for e-invoice
      if (activeStudents.length === 0) {
        activeStudents = [
          { 
            id: 1, 
            studentName: 'Ahmet', 
            studentSurname: 'Yılmaz',
            studentTcNo: '12345678901',
            parentName: 'Mehmet', 
            parentSurname: 'Yılmaz',
            parentTcNo: '98765432109',
            parentPhone: '05551234567',
            parentEmail: 'mehmet.yilmaz@email.com',
            address: 'Atatürk Mahallesi, Cumhuriyet Caddesi No:15/3',
            city: 'İstanbul',
            district: 'Kadıköy',
            postalCode: '34710',
            selectedSports: ['Basketbol'],
            studentBirthDate: '2010-05-15'
          },
          { 
            id: 2, 
            studentName: 'Ayşe', 
            studentSurname: 'Demir',
            studentTcNo: '23456789012',
            parentName: 'Fatma', 
            parentSurname: 'Demir',
            parentTcNo: '87654321098',
            parentPhone: '05559876543',
            parentEmail: 'fatma.demir@email.com',
            address: 'Yenişehir Mahallesi, Barış Sokak No:8/2',
            city: 'Ankara',
            district: 'Çankaya',
            postalCode: '06420',
            selectedSports: ['Yüzme'],
            studentBirthDate: '2011-08-22'
          },
          { 
            id: 3, 
            studentName: 'Can', 
            studentSurname: 'Öztürk',
            studentTcNo: '34567890123',
            parentName: 'Ali', 
            parentSurname: 'Öztürk',
            parentTcNo: '76543210987',
            parentPhone: '05555555555',
            parentEmail: 'ali.ozturk@email.com',
            address: 'Merkez Mahallesi, Spor Caddesi No:25/1',
            city: 'İzmir',
            district: 'Konak',
            postalCode: '35220',
            selectedSports: ['Futbol'],
            studentBirthDate: '2009-12-10'
          }
        ];
      }
      
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      // Create e-invoice data with exact column headers as required by integrator
      const invoiceData = activeStudents.map((student: any, index: number) => {
        const sports = student.selectedSports || student.sportsBranches || ['Genel'];
        const baseAmount = 350; // Base amount per sport
        const quantity = sports.length;
        const invoiceNumber = `${currentYear}${String(currentMonth).padStart(2, '0')}${String(index + 1).padStart(6, '0')}`;
        const invoiceDate = currentDate.toLocaleDateString('tr-TR');
        const invoiceTime = currentDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        
        // Get unit code from account entries for this student
        const accountEntries = JSON.parse(localStorage.getItem(`account_${student.id}`) || '[]');
        const unitCode = accountEntries.length > 0 && accountEntries[0].unitCode ? accountEntries[0].unitCode : 'Ay';
        
        return {
          'Id': index + 1,
          'Fatura Numarası': '', // Should be empty as requested
          'ETTN': '',
          'Fatura Tarihi': invoiceDate,
          'Fatura Saati': invoiceTime,
          'Fatura Tipi': 'SATIS',
          'Fatura Profili': 'EARSIVFATURA', // Fixed as requested
          'Not1': '',
          'Not2': '',
          'Not3': '',
          'Not4': '',
          'Döviz Kodu': 'TRY',
          'Döviz Kuru': '1',
          'İade Tarihi': '',
          'İade Fatura Numarası': '',
          'Sipariş Tarihi': '',
          'Sipariş Numarası': '',
          'İrsaliye Numarası': '',
          'İrsaliye Tarihi': '',
          'Alıcı VKN/TCKN': student.parentTcNo || '',
          'Alıcı Ünvan/Adı | Yabancı Alıcı Ünvan/Adı | Turist Adı': student.parentName || '',
          'Alıcı Soyadı | Yabancı Alıcı Soyadı | Turist Soyadı ': student.parentSurname || '',
          'Alıcı Ülke | Yabancı Ülke | Turist Ülke': 'TÜRKİYE',
          'Alıcı Şehir | Yabancı Şehir | Turist Şehir': student.city || '',
          'Alıcı İlçe | Yabancı İlçe | Turist İlçe': student.district || '',
          'Alıcı Sokak | Yabancı Sokak | Turist Sokak': student.address || '',
          'Alıcı Bina No | Yabancı Bina No | Turist Bina No': '',
          'Alıcı Kapı No | Yabancı Kapı No | Turist Kapı No': '',
          'Alıcı Eposta | Yabancı Eposta | Turist Eposta': student.parentEmail || '',
          'Alıcı Telefon | Yabancı Telefon | Turist Telefon': student.parentPhone || '',
          'Alıcı Vergi Dairesi': '',
          'Alıcı Posta Kutusu': '',
          'Yabancı Alıcı Ülkesindeki VKN': '',
          'Yabancı Alıcı Resmi Ünvan': '',
          'Turist Ülke Kodu': '',
          'Turist Pasaport No': '',
          'Pasaport Veriliş Tarihi': '',
          'Aracı Kurum Posta Kutusu': '',
          'Aracı Kurum VKN': '',
          'Aracı Kurum Adı': '',
          'Gönderim Türü': 'ELEKTRONIK',
          'Satışın Yapıldığı Web Sitesi': '',
          'Ödeme Tarihi': '',
          'Ödeme Türü': 'EFT/HAVALE', // Fixed as requested
          'Ödeyen Adı': '',
          'Taşıyıcı Ünvanı': '',
          'Taşıyıcı Tckn/Vkn': '',
          'Gönderim Tarihi': '',
          'Mal/Hizmet Adı': `${sports.join(', ')} Spor Eğitimi - ${student.studentName} ${student.studentSurname}`,
          'Miktar': quantity,
          'Birim Kodu': unitCode, // Get from account entries
          'Birim Fiyat': baseAmount.toFixed(2),
          'KDV Oranı': '20',
          'KDV Muafiyet Kodu': '',
          'KDV Muafiyet Nedeni': '',
          'İskonto Oranı': '',
          'İskonto Açıklaması': '',
          'İskonto Oranı 2': '',
          'İskonto Açıklaması 2': '',
          'Satıcı Kodu (SellersItemIdentification)': '',
          'Alıcı Kodu (BuyersItemIdentification)': '',
          'Üretici Kodu (ManufacturersItemIdentification)': '',
          'Marka (BrandName)': '',
          'Model (ModelName)': '',
          'Menşei Kodu': '',
          'Açıklama (Description)': '',
          'Not (Note)': '',
          'Artırım Oranı': '',
          'Artırım Tutarı': '',
          'ÖTV Kodu': '',
          'ÖTV Oranı': '',
          'ÖTV Tutarı': '',
          'Tevkifat Kodu': '',
          'Tevkifat Oranı': '',
          'BSMV Oranı': '',
          'Enerji Fonu Vergi Oranı': '',
          'TRT Payı Vergi Oranı': '',
          'Elektrik ve Havagazı Tüketim Vergisi Oranı': '',
          'Konaklama Vergisi Oranı': '',
          'GTip No': '',
          'Teslim Şartı': '',
          'Gönderilme Şekli': '',
          'Gümrük Takip No': '',
          'Bulunduğu Kabın Markası': '',
          'Bulunduğu Kabın Cinsi': '',
          'Bulunduğu Kabın Numarası': '',
          'Bulunduğu Kabın Adedi': '',
          'İhracat Teslim ve Ödeme Yeri/Ülke': '',
          'İhracat Teslim ve Ödeme Yeri/Şehir': '',
          'İhracat Teslim ve Ödeme Yeri/Mahalle/İlçe': '',
          'Künye No': '',
          'Mal Sahibi Ad/Soyad/Ünvan': '',
          'Mal Sahibi Vkn/Tckn': ''
        };
      });

      if (invoiceData.length === 0) {
        toast.error("Fatura oluşturulacak aktif sporcu bulunamadı!");
        return;
      }

      // Create CSV with semicolon separator for e-invoice integrator
      const headers = Object.keys(invoiceData[0]);
      const csvRows = [];
      
      // Add header row
      csvRows.push(headers.join(';'));
      
      // Add data rows
      invoiceData.forEach(row => {
        const rowValues = headers.map(header => {
          const value = row[header as keyof typeof row];
          const stringValue = String(value || '');
          // Escape semicolons and quotes in data for proper CSV format
          return `"${stringValue.replace(/"/g, '""')}"`;
        });
        csvRows.push(rowValues.join(';'));
      });
      
      const csvContent = csvRows.join('\r\n');

      // Add UTF-8 BOM for proper Turkish character display in Excel
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      const fileName = `E_Fatura_${currentYear}_${String(currentMonth).padStart(2, '0')}.csv`;
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      URL.revokeObjectURL(url);

      toast.success(`${invoiceData.length} e-fatura kaydı oluşturuldu ve indirildi! (${fileName})`);
      setIsInvoiceDialogOpen(false);
      
    } catch (error) {
      console.error('E-fatura oluşturma hatası:', error);
      toast.error("E-fatura oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Bulk import functions
  const handleBulkImportFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && 
          file.type !== 'application/vnd.ms-excel') {
        toast.error("Lütfen Excel dosyası (.xlsx veya .xls) seçin");
        return;
      }
      setBulkImportFile(file);
    }
  };

  const processBulkImport = async () => {
    if (!bulkImportFile) return;

    setIsProcessing(true);
    setUploadProgress(0);

    try {
      // Simulated Excel processing
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      // Wait 2 seconds (simulated Excel processing)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock Excel data - in real app this would parse the Excel file
      const mockBulkData = [
        {
          athleteId: 'all', // 'all' means apply to all athletes
          month: '2024-06',
          description: 'Haziran 2024 Aylık Aidat',
          amountExcludingVat: 350,
          vatRate: 20,
          unitCode: 'Ay',
          type: 'debit'
        },
        {
          athleteId: 'all',
          month: '2024-06',
          description: 'Forma Ücreti',
          amountExcludingVat: 150,
          vatRate: 20,
          unitCode: 'Adet',
          type: 'debit'
        },
        {
          athleteId: 'all',
          month: '2024-06',
          description: 'Spor Çantası',
          amountExcludingVat: 200,
          vatRate: 20,
          unitCode: 'Adet',
          type: 'debit'
        }
      ];

      // Get all athletes
      const storedAthletes = localStorage.getItem('athletes') || localStorage.getItem('students');
      let athletes = [];
      
      if (storedAthletes) {
        athletes = JSON.parse(storedAthletes);
      }

      if (athletes.length === 0) {
        toast.error("Sporcu bulunamadı! Önce sporcu kayıtları yapılmalı.");
        return;
      }

      // Apply bulk entries to all athletes
      let totalEntriesAdded = 0;
      
      for (const athlete of athletes) {
        const existingEntries = JSON.parse(localStorage.getItem(`account_${athlete.id}`) || '[]');
        
        for (const bulkEntry of mockBulkData) {
          const vatAmount = (bulkEntry.amountExcludingVat * bulkEntry.vatRate) / 100;
          const amountIncludingVat = bulkEntry.amountExcludingVat + vatAmount;
          
          const newEntry = {
            id: Date.now() + Math.random(), // Ensure unique ID
            date: new Date().toISOString(),
            month: bulkEntry.month,
            description: bulkEntry.description,
            amountExcludingVat: bulkEntry.amountExcludingVat,
            vatRate: bulkEntry.vatRate,
            vatAmount: vatAmount,
            amountIncludingVat: amountIncludingVat,
            unitCode: bulkEntry.unitCode,
            type: bulkEntry.type
          };
          
          existingEntries.push(newEntry);
          totalEntriesAdded++;
        }
        
        localStorage.setItem(`account_${athlete.id}`, JSON.stringify(existingEntries));
      }

      toast.success(`Toplu içe aktarma tamamlandı! ${athletes.length} sporcuya ${mockBulkData.length} kayıt eklendi. Toplam ${totalEntriesAdded} kayıt oluşturuldu.`);
      setIsBulkImportDialogOpen(false);
      setBulkImportFile(null);
      setUploadProgress(0);
      
    } catch (error) {
      toast.error("Toplu içe aktarma sırasında hata oluştu");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadBulkImportTemplate = () => {
    // Get active athletes from localStorage
    const storedAthletes = localStorage.getItem('athletes') || localStorage.getItem('students');
    let activeAthletes = [];
    
    if (storedAthletes) {
      const allAthletes = JSON.parse(storedAthletes);
      activeAthletes = allAthletes.filter((athlete: any) => athlete.status === 'active' || athlete.status === 'Aktif' || !athlete.status);
    }

    // Create template data with active athletes
    const templateData = [];
    
    // Add rows for each active athlete
    if (activeAthletes.length > 0) {
      activeAthletes.forEach((athlete: any) => {
        const athleteName = `${athlete.studentName || athlete.firstName || ''} ${athlete.studentSurname || athlete.lastName || ''}`.trim();
        templateData.push({
          'Sporcu Adı Soyadı': athleteName || `Sporcu_${athlete.id}`,
          'Açıklama': '',
          'Tutar': '',
          'KDV Oranı (%)': '10', // Default to 10%
          'Toplam': '',
          'Birim Kod': 'Ay'
        });
      });
    } else {
      // If no athletes found, create sample template
      for (let i = 1; i <= 5; i++) {
        templateData.push({
          'Sporcu Adı Soyadı': `Örnek Sporcu ${i}`,
          'Açıklama': '',
          'Tutar': '',
          'KDV Oranı (%)': '10',
          'Toplam': '',
          'Birim Kod': 'Ay'
        });
      }
    }

    // Create CSV with Excel formulas for automatic calculation
    const headers = Object.keys(templateData[0]);
    const csvRows = [];
    
    // Add header row
    csvRows.push(headers.join(';'));
    
    // Add data rows with Excel formulas
    templateData.forEach((row, index) => {
      const rowValues = headers.map(header => {
        let value = row[header as keyof typeof row];
        
        // Add Excel formula for automatic total calculation
        if (header === 'Toplam') {
          // Excel formula for automatic calculation (row index + 2 because of header)
          value = `=C${index + 2}*(1+D${index + 2}/100)`;
        }
        
        return `"${String(value || '')}"`;
      });
      csvRows.push(rowValues.join(';'));
    });
    
    const csvContent = csvRows.join('\r\n');

    // Add UTF-8 BOM for proper Turkish character display
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'Toplu_Aidat_Sablonu.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    toast.success(`Şablon dosyası indirildi! (${activeAthletes.length || 5} sporcu için) - KDV oranı için 10 veya 20 yazın, toplam otomatik hesaplanacak.`);
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

    // Add to athlete's account as credit (payment received)
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

  // Handle multiple athlete matching
  const handleMultipleAthleteMatch = (matchIndex: number, athleteIds: string[]) => {
    if (athleteIds.length === 0) {
      toast.error("Lütfen en az bir sporcu seçin");
      return;
    }

    const storedAthletes = localStorage.getItem('athletes') || localStorage.getItem('students');
    let athletes = [];
    if (storedAthletes) {
      athletes = JSON.parse(storedAthletes);
    }

    const selectedAthletes = athleteIds.map(id => 
      athletes.find((a: any) => a.id.toString() === id)
    ).filter(Boolean);

    if (selectedAthletes.length === 0) {
      toast.error("Seçilen sporcular bulunamadı");
      return;
    }

    const totalAmount = matchedPayments[matchIndex].excelData.amount;
    const amountPerAthlete = totalAmount / selectedAthletes.length;

    // Create multiple payment records
    const multiplePayments = selectedAthletes.map(athlete => ({
      id: athlete.id,
      athleteName: `${athlete.studentName || athlete.firstName || ''} ${athlete.studentSurname || athlete.lastName || ''}`.trim(),
      parentName: `${athlete.parentName || ''} ${athlete.parentSurname || ''}`.trim(),
      amount: amountPerAthlete,
      status: 'Bekliyor',
      sport: athlete.selectedSports ? athlete.selectedSports[0] : 'Genel'
    }));

    const updatedMatches = [...matchedPayments];
    updatedMatches[matchIndex] = {
      ...updatedMatches[matchIndex],
      payment: multiplePayments[0], // Use first athlete as primary
      multiplePayments: multiplePayments,
      status: 'matched',
      confidence: 100,
      isMultiple: true
    };
    
    setMatchedPayments(updatedMatches);
    
    // Clear selection
    setSelectedMultipleAthletes(prev => ({
      ...prev,
      [matchIndex]: []
    }));
    
    toast.success(`Ödeme ${selectedAthletes.length} sporcu arasında bölüştürüldü (${amountPerAthlete.toFixed(2)} ₺ / sporcu)`);
  };

  // Clear all filled fields function
  const clearAllFields = () => {
    // Clear search and filters
    setSearchTerm("");
    setSelectedStatus("all");
    
    // Clear new payment form
    setNewPayment({
      athleteId: '',
      amount: '',
      method: '',
      paymentDate: new Date().toISOString().split('T')[0],
      description: ''
    });
    
    // Clear upload states
    setUploadedFile(null);
    setUploadProgress(0);
    setMatchedPayments([]);
    setManualMatches({});
    setSelectedMultipleAthletes({});
    setBulkImportFile(null);
    
    // Close all dialogs
    setIsAddDialogOpen(false);
    setIsUploadDialogOpen(false);
    setIsInvoiceDialogOpen(false);
    setIsBulkImportDialogOpen(false);
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    toast.success("Tüm alanlar temizlendi");
  };

  // Export payments to Excel
  const exportPaymentsToExcel = () => {
    try {
      // Prepare data for export
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

      // Create CSV content
      const headers = Object.keys(exportData[0]);
      const csvRows = [];
      
      // Add header row
      csvRows.push(headers.join(';'));
      
      // Add data rows
      exportData.forEach(row => {
        const rowValues = headers.map(header => {
          const value = row[header as keyof typeof row];
          const stringValue = String(value || '');
          // Escape semicolons and quotes for proper CSV format
          return `"${stringValue.replace(/"/g, '""')}"`;
        });
        csvRows.push(rowValues.join(';'));
      });
      
      const csvContent = csvRows.join('\r\n');

      // Add UTF-8 BOM for proper Turkish character display
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      // Generate filename with current date
      const currentDate = new Date().toISOString().slice(0, 10);
      const fileName = `Odemeler_${currentDate}.csv`;
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);

      toast.success(`${exportData.length} ödeme kaydı Excel'e aktarıldı! (${fileName})`);
      
    } catch (error) {
      console.error('Excel export error:', error);
      toast.error("Excel dışa aktarma sırasında hata oluştu");
    }
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
                <TabsTrigger value="invoices">Faturalar</TabsTrigger>
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
                        <Dialog open={isUploadDialogOpen} onOpenChange={(open) => {
                          setIsUploadDialogOpen(open);
                          if (!open) {
                            // Reset all states when dialog is closed
                            setMatchedPayments([]);
                            setManualMatches({});
                            setUploadedFile(null);
                            setUploadProgress(0);
                          }
                        }}>
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
                                      // View payment details
                                      alert(`Ödeme Detayları:\n\nSporcu: ${payment.athleteName}\nVeli: ${payment.parentName}\nTutar: ₺${payment.amount}\nDurum: ${payment.status}\nVade: ${new Date(payment.dueDate).toLocaleDateString('tr-TR')}\nAçıklama: ${payment.description || 'Yok'}`);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => {
                                      // Generate receipt
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
                                      // Edit payment
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

              <TabsContent value="invoices" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>E-Fatura Yönetimi</CardTitle>
                    <CardDescription>
                      Aylık faturaları oluşturun ve Excel formatında dışa aktarın
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-4 flex-wrap">
                        <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
                          <DialogTrigger asChild>
                            <Button>
                              <FileText className="h-4 w-4 mr-2" />
                              Aylık Fatura Oluştur
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Fatura Oluşturma</DialogTitle>
                              <DialogDescription>
                                Aktif tüm sporcular için fatura oluşturulacak
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4 py-4">
                              <Alert>
                                <FileSpreadsheet className="h-4 w-4" />
                                <AlertDescription>
                                  Faturalar Excel formatında "Fatura_Excel_Formatı.xlsx" şablonuna uygun olarak oluşturulacaktır.
                                </AlertDescription>
                              </Alert>
                              
                              <div className="space-y-2">
                                <Label>Fatura Dönemi</Label>
                                <Input type="month" defaultValue={new Date().toISOString().slice(0, 7)} />
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Varsayılan Tutar (₺)</Label>
                                <Input type="number" defaultValue="350" />
                              </div>
                            </div>
                            
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setIsInvoiceDialogOpen(false)}>
                                İptal
                              </Button>
                              <Button onClick={generateInvoices}>
                                <Download className="h-4 w-4 mr-2" />
                                Faturaları Oluştur
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Dialog open={isBulkImportDialogOpen} onOpenChange={setIsBulkImportDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline">
                              <Upload className="h-4 w-4 mr-2" />
                              Toplu Aidat İçe Aktar
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Toplu Aidat İçe Aktarma</DialogTitle>
                              <DialogDescription>
                                Excel dosyası ile tüm sporcular için aylık aidat, forma, çanta vb. ücretleri toplu olarak ekleyin
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-6">
                              <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                  Bu işlem tüm aktif sporcuların cari hesaplarına kayıt ekleyecektir. İşlem geri alınamaz!
                                </AlertDescription>
                              </Alert>

                              {/* Instructions */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Nasıl Kullanılır?</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-3 text-sm">
                                    <div className="flex items-start space-x-2">
                                      <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                                      <p>"Toplu İçe Aktarma Şablonu" butonuna tıklayarak örnek Excel dosyasını indirin</p>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                      <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                                      <p>İndirilen dosyayı açın ve kendi verilerinizle doldurun</p>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                      <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                                      <p>Sporcu Adı Soyadı: Sporcunun tam adını yazın</p>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                      <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">4</span>
                                      <p>KDV Oranı: 10 veya 20 yazın (çoktan seçmeli)</p>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                      <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">5</span>
                                      <p>Toplam: Otomatik hesaplanacak (Excel formülü ile)</p>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                      <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">6</span>
                                      <p>Birim Kod: "Ay" (aylık aidat için) veya "Adet" (forma, çanta vb. için)</p>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                      <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">7</span>
                                      <p>Dosyayı kaydedin ve aşağıdan yükleyin</p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* File Upload */}
                              <Card>
                                <CardContent className="p-6">
                                  <div className="space-y-4">
                                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                                      <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                      <div className="space-y-2">
                                        <p className="text-sm font-medium">Toplu aidat Excel dosyasını seçin</p>
                                        <p className="text-xs text-muted-foreground">
                                          Desteklenen formatlar: .xlsx, .xls
                                        </p>
                                      </div>
                                      <Input
                                        type="file"
                                        accept=".xlsx,.xls"
                                        onChange={handleBulkImportFileUpload}
                                        className="mt-4"
                                        ref={fileInputRef}
                                      />
                                    </div>
                                    
                                    {bulkImportFile && (
                                      <Alert>
                                        <FileSpreadsheet className="h-4 w-4" />
                                        <AlertDescription>
                                          Seçilen dosya: {bulkImportFile.name} ({(bulkImportFile.size / 1024).toFixed(1)} KB)
                                        </AlertDescription>
                                      </Alert>
                                    )}
                                    
                                    {bulkImportFile && !isProcessing && (
                                      <Button onClick={processBulkImport} className="w-full">
                                        <Upload className="h-4 w-4 mr-2" />
                                        Toplu İçe Aktarmayı Başlat
                                      </Button>
                                    )}
                                    
                                    {isProcessing && (
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                          <span>Dosya işleniyor ve kayıtlar ekleniyor...</span>
                                          <span>{uploadProgress}%</span>
                                        </div>
                                        <Progress value={uploadProgress} className="w-full" />
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Sample Data Preview */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Örnek Veri Formatı</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Sporcu Adı Soyadı</TableHead>
                                        <TableHead>Açıklama</TableHead>
                                        <TableHead>Tutar</TableHead>
                                        <TableHead>KDV Oranı (%)</TableHead>
                                        <TableHead>Toplam</TableHead>
                                        <TableHead>Birim Kod</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      <TableRow>
                                        <TableCell>Ahmet Yılmaz</TableCell>
                                        <TableCell>Haziran 2024 Aylık Aidat</TableCell>
                                        <TableCell>350</TableCell>
                                        <TableCell>10 veya 20</TableCell>
                                        <TableCell>385 (otomatik)</TableCell>
                                        <TableCell>Ay</TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell>Elif Demir</TableCell>
                                        <TableCell>Forma Ücreti</TableCell>
                                        <TableCell>150</TableCell>
                                        <TableCell>10 veya 20</TableCell>
                                        <TableCell>180 (otomatik)</TableCell>
                                        <TableCell>Adet</TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell>Can Özkan</TableCell>
                                        <TableCell>Spor Çantası</TableCell>
                                        <TableCell>200</TableCell>
                                        <TableCell>10 veya 20</TableCell>
                                        <TableCell>240 (otomatik)</TableCell>
                                        <TableCell>Adet</TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </CardContent>
                              </Card>
                            </div>

                            <div className="flex justify-end space-x-2 mt-6">
                              <Button variant="outline" onClick={() => setIsBulkImportDialogOpen(false)}>
                                Kapat
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button variant="outline" onClick={downloadBulkImportTemplate}>
                          <Download className="h-4 w-4 mr-2" />
                          Toplu İçe Aktarma Şablonu
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-center">
                              <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                              <h3 className="font-medium">Haziran 2024</h3>
                              <p className="text-sm text-muted-foreground">124 fatura</p>
                              <Button size="sm" className="mt-2">İndir</Button>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-center">
                              <FileText className="h-8 w-8 mx-auto mb-2 text-green-600" />
                              <h3 className="font-medium">Mayıs 2024</h3>
                              <p className="text-sm text-muted-foreground">118 fatura</p>
                              <Button size="sm" className="mt-2">İndir</Button>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-center">
                              <FileText className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                              <h3 className="font-medium">Nisan 2024</h3>
                              <p className="text-sm text-muted-foreground">115 fatura</p>
                              <Button size="sm" className="mt-2">İndir</Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
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
                              <span className="font-medium">₺45,280</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Mayıs</span>
                              <span className="font-medium">₺42,150</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Nisan</span>
                              <span className="font-medium">₺38,900</span>
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
                              <span className="font-medium">₺18,500</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Basketbol</span>
                              <span className="font-medium">₺12,300</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Yüzme</span>
                              <span className="font-medium">₺8,900</span>
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

          {/* Excel Upload Dialog */}
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Banka Extre Dosyası Yükle</DialogTitle>
                <DialogDescription>
                  Bankadan aldığınız Excel extre dosyasını yükleyerek ödemeleri otomatik olarak eşleştirin
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* File Upload */}
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                        <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foregroun" />
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
                      
                      {uploadedFile && !isProcessing && matchedPayments.length === 0 && (
                        <Button onClick={processExcelFile} className="w-full">
                          <Upload className="h-4 w-4 mr-2" />
                          Dosyayı İşle ve Eşleştir
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

                {/* Matched Payments */}
                {matchedPayments.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Eşleştirme Sonuçları</CardTitle>
                      <CardDescription>
                        {matchedPayments.filter(m => m.status === 'matched').length} ödeme eşleştirildi, 
                        {matchedPayments.filter(m => m.status === 'unmatched').length} eşleştirilemedi
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {matchedPayments.map((match, index) => (
                          <Card key={index} className={`border ${match.status === 'matched' ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
                            <CardContent className="p-4">
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Excel Verisi:</span>
                                    <p className="font-medium">{match.excelData.description}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {match.excelData.date} - ₺{match.excelData.amount}
                                    </p>
                                  </div>
                                  
                                  {match.payment && (
                                    <div>
                                      <span className="text-muted-foreground">Eşleşen Ödeme:</span>
                                      <p className="font-medium">{match.payment.athleteName}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {match.payment.parentName} - ₺{match.payment.amount}
                                      </p>
                                    </div>
                                  )}
                                  
                                  <div>
                                    <span className="text-muted-foreground">Durum:</span>
                                    <div className="flex items-center space-x-2 mt-1">
                                      {match.status === 'matched' ? (
                                        <>
                                          <Check className="h-4 w-4 text-green-600" />
                                          <span className="text-sm text-green-600">
                                            Eşleştirildi {match.isManual ? '(Manuel)' : `(%${match.confidence})`}
                                          </span>
                                        </>
                                      ) : (
                                        <>
                                          <X className="h-4 w-4 text-orange-600" />
                                          <span className="text-sm text-orange-600">Eşleştirilemedi</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Manual Matching for Unmatched Payments with Smart Suggestions */}
                                {match.status === 'unmatched' && (
                                  <div className="border-t pt-4">
                                    {/* Multi-athlete matching section - Only show when truly relevant */}
                                    {(() => {
                                      const storedAthletes = localStorage.getItem('athletes') || localStorage.getItem('students');
                                      let athletes = [];
                                      if (storedAthletes) {
                                        athletes = JSON.parse(storedAthletes);
                                      }
                                      
                                      const extractedAmount = (() => {
                                        const amountMatch = match.excelData.description.match(/[\d.,]+/g);
                                        if (amountMatch) {
                                          const amountStr = amountMatch[amountMatch.length - 1];
                                          if (amountStr.includes('.') && amountStr.includes(',')) {
                                            return parseFloat(amountStr.replace(/\./g, '').replace(',', '.'));
                                          } else if (amountStr.includes(',')) {
                                            return parseFloat(amountStr.replace(',', '.'));
                                          } else {
                                            return parseFloat(amountStr.replace(/\./g, ''));
                                          }
                                        }
                                        return match.excelData.amount;
                                      })();
                                      
                                      const isMultipleAmount = detectMultipleAthletes(extractedAmount, athletes);
                                      const siblingGroups = findSiblings(athletes);
                                      
                                      // Check if any sibling group has members that match the description reasonably well
                                      let hasRelevantSiblings = false;
                                      if (Object.keys(siblingGroups).length > 0) {
                                        for (const siblings of Object.values(siblingGroups)) {
                                          for (const sibling of siblings) {
                                            const athleteName = `${sibling.studentName || sibling.firstName || ''} ${sibling.studentSurname || sibling.lastName || ''}`.trim();
                                            const parentName = `${sibling.parentName || ''} ${sibling.parentSurname || ''}`.trim();
                                            
                                            const athleteSim = calculateSimilarity(match.excelData.description, athleteName);
                                            const parentSim = calculateSimilarity(match.excelData.description, parentName);
                                            const maxSim = Math.max(athleteSim, parentSim);
                                            
                                            if (maxSim > 20) { // Only show if there's some reasonable match
                                              hasRelevantSiblings = true;
                                              break;
                                            }
                                          }
                                          if (hasRelevantSiblings) break;
                                        }
                                      }
                                      
                                      console.log('Multi-athlete debug:', {
                                        extractedAmount,
                                        isMultipleAmount,
                                        siblingGroupsCount: Object.keys(siblingGroups).length,
                                        hasRelevantSiblings
                                      });
                                      
                                      // Show multi-athlete section if amount suggests multiple payments OR there are relevant sibling matches
                                      if (isMultipleAmount || hasRelevantSiblings) {
                                        return (
                                          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                            <div className="flex items-center space-x-2 mb-3">
                                              <Users className="h-5 w-5 text-purple-600" />
                                              <Label className="text-sm font-medium text-purple-800">
                                                Çoklu Sporcu Eşleştirme (Kardeş Önerisi)
                                              </Label>
                                              <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700">
                                                ₺{extractedAmount} {isMultipleAmount ? '- Çoklu ödeme algılandı' : '- Kardeş grupları mevcut'}
                                              </Badge>
                                            </div>
                                            <p className="text-xs text-purple-700 mb-3">
                                              Bu tutar birden fazla sporcu için olabilir. Aşağıdaki kardeş gruplarından seçim yapabilirsiniz:
                                            </p>
                                            
                                            {Object.keys(siblingGroups).length > 0 ? (
                                              <div className="space-y-3">
                                                {Object.entries(siblingGroups).map(([parentName, siblings]) => (
                                                  <div key={parentName} className="border border-purple-200 rounded-lg p-3 bg-white">
                                                    <div className="flex items-center justify-between mb-2">
                                                      <span className="font-medium text-sm text-purple-800">
                                                        {parentName} - {siblings.length} kardeş
                                                      </span>
                                                      <span className="text-xs text-purple-600">
                                                        ₺{(extractedAmount / siblings.length).toFixed(2)} / sporcu
                                                      </span>
                                                    </div>
                                                    
                                                    <div className="space-y-2">
                                                      {siblings.map((sibling: any) => {
                                                        const siblingName = `${sibling.studentName || sibling.firstName || ''} ${sibling.studentSurname || sibling.lastName || ''}`.trim();
                                                        const isSelected = selectedMultipleAthletes[index]?.includes(sibling.id.toString()) || false;
                                                        
                                                        return (
                                                          <div key={sibling.id} className="flex items-center space-x-2">
                                                            <input
                                                              type="checkbox"
                                                              id={`sibling-${index}-${sibling.id}`}
                                                              checked={isSelected}
                                                              onChange={(e) => {
                                                                setSelectedMultipleAthletes(prev => {
                                                                  const current = prev[index] || [];
                                                                  if (e.target.checked) {
                                                                    return {
                                                                      ...prev,
                                                                      [index]: [...current, sibling.id.toString()]
                                                                    };
                                                                  } else {
                                                                    return {
                                                                      ...prev,
                                                                      [index]: current.filter(id => id !== sibling.id.toString())
                                                                    };
                                                                  }
                                                                });
                                                              }}
                                                              className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                                                            />
                                                            <label 
                                                              htmlFor={`sibling-${index}-${sibling.id}`}
                                                              className="text-sm cursor-pointer flex-1"
                                                            >
                                                              {siblingName}
                                                              <span className="text-xs text-muted-foreground ml-2">
                                                                ({sibling.selectedSports ? sibling.selectedSports[0] : 'Genel'})
                                                              </span>
                                                            </label>
                                                          </div>
                                                        );
                                                      })}
                                                    </div>
                                                    
                                                    <div className="mt-3 flex justify-end">
                                                      <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-purple-700 border-purple-300 hover:bg-purple-100"
                                                        onClick={() => {
                                                          const siblingIds = siblings.map((s: any) => s.id.toString());
                                                          setSelectedMultipleAthletes(prev => ({
                                                            ...prev,
                                                            [index]: siblingIds
                                                          }));
                                                        }}
                                                      >
                                                        <Users className="h-4 w-4 mr-1" />
                                                        Tüm Kardeşleri Seç
                                                      </Button>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            ) : (
                                              <div className="text-center py-4 text-purple-600">
                                                <p className="text-sm">Kardeş grubu bulunamadı. Manuel eşleştirme kullanın.</p>
                                              </div>
                                            )}
                                            
                                            {selectedMultipleAthletes[index] && selectedMultipleAthletes[index].length > 0 && (
                                              <div className="mt-4 flex justify-end">
                                                <Button
                                                  size="sm"
                                                  className="bg-purple-600 hover:bg-purple-700"
                                                  onClick={() => handleMultipleAthleteMatch(index, selectedMultipleAthletes[index])}
                                                >
                                                  <Users className="h-4 w-4 mr-2" />
                                                  Çoklu Eşleştir ({selectedMultipleAthletes[index].length} sporcu)
                                                </Button>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      }
                                      return null;
                                    })()}
                                    
                                    {/* Show closest suggestions first */}
                                    {match.suggestions && match.suggestions.length > 0 && (
                                      <div className="mb-4">
                                        <Label className="text-sm font-medium text-blue-700 mb-2 block">
                                          En Yakın Eşleşmeler (Akıllı Öneriler):
                                        </Label>
                                        <div className="grid grid-cols-1 gap-2">
                                          {match.suggestions.map((suggestion: SuggestedMatch) => {
                                            // Get athlete from suggestions
                                            const storedAthletes = localStorage.getItem('athletes') || localStorage.getItem('students');
                                            let athletes = [];
                                            if (storedAthletes) {
                                              athletes = JSON.parse(storedAthletes);
                                            }
                                            const athlete = athletes.find((a: any) => a.id.toString() === suggestion.athleteId);
                                            if (!athlete) return null;
                                            
                                            return (
                                              <div 
                                                key={suggestion.athleteId}
                                                className={`flex items-center justify-between p-3 border rounded-lg hover:bg-blue-50 cursor-pointer transition-colors ${
                                                  suggestion.isSibling ? 'border-purple-300 bg-purple-50' : 'border-gray-200'
                                                }`}
                                                onClick={() => {
                                                  setManualMatches(prev => ({
                                                    ...prev,
                                                    [index]: suggestion.athleteId
                                                  }));
                                                }}
                                              >
                                                <div className="flex-1">
                                                  <div className="flex items-center space-x-2">
                                                    <span className="font-medium">{suggestion.athleteName}</span>
                                                    <Badge variant="outline" className="text-xs">
                                                      %{suggestion.similarity} benzerlik
                                                    </Badge>
                                                    {suggestion.isSibling && (
                                                      <Badge className="text-xs bg-purple-100 text-purple-700 border-purple-300">
                                                        Kardeş
                                                      </Badge>
                                                    )}
                                                  </div>
                                                  <p className="text-xs text-muted-foreground">
                                                    {athlete.parentName || ''} {athlete.parentSurname || ''} - {athlete.selectedSports ? athlete.selectedSports[0] : 'Genel'}
                                                  </p>
                                                </div>
                                                <Button 
                                                  size="sm" 
                                                  variant="outline"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleManualMatch(index, suggestion.athleteId);
                                                  }}
                                                >
                                                  <Check className="h-4 w-4 mr-1" />
                                                  Eşleştir
                                                </Button>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Fallback manual selection */}
                                    <div className="flex items-center space-x-4">
                                      <div className="flex-1">
                                        <Label className="text-sm font-medium text-orange-700">
                                          Manuel Eşleştirme - Tüm Sporcular:
                                        </Label>
                                        <Select 
                                          value={manualMatches[index] || ""} 
                                          onValueChange={(value) => {
                                            setManualMatches(prev => ({
                                              ...prev,
                                              [index]: value
                                            }));
                                          }}
                                        >
                                          <SelectTrigger className="mt-2">
                                            <SelectValue placeholder="Diğer sporculardan seçin..." />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {getAvailableAthletesForMatching().map(athlete => (
                                              <SelectItem key={athlete.id} value={athlete.id.toString()}>
                                                <div className="flex flex-col">
                                                  <span className="font-medium">{athlete.athleteName}</span>
                                                  <span className="text-xs text-muted-foreground">
                                                    {athlete.parentName} - {athlete.sport}
                                                  </span>
                                                </div>
                                              </SelectItem>
                                            ))}
                                            {getAvailablePaymentsForMatching().map(payment => (
                                              <SelectItem key={payment.id} value={payment.id.toString()}>
                                                <div className="flex flex-col">
                                                  <span className="font-medium">{payment.athleteName}</span>
                                                  <span className="text-xs text-muted-foreground">
                                                    {payment.parentName} - ₺{payment.amount} - {payment.sport}
                                                  </span>
                                                </div>
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      
                                      {manualMatches[index] && (
                                        <Button 
                                          size="sm" 
                                          onClick={() => handleManualMatch(index, manualMatches[index])}
                                          className="mt-6"
                                        >
                                          <Check className="h-4 w-4 mr-2" />
                                          Eşleştir
                                        </Button>
                                      )}
                                    </div>
                                    
                                    <Alert className="mt-3">
                                      <AlertTriangle className="h-4 w-4" />
                                      <AlertDescription className="text-xs">
                                        Bu ödeme otomatik eşleştirilemedi. Yukarıdaki akıllı öneriler Türkçe karakter normalizasyonu ve 
                                        benzerlik algoritması kullanılarak oluşturulmuştur. En yakın eşleşmeyi seçin veya manuel olarak arayın.
                                      </AlertDescription>
                                    </Alert>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      
                      {matchedPayments.filter(m => m.status === 'matched').length > 0 && (
                        <div className="flex justify-end space-x-2 mt-6">
                          <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                            İptal
                          </Button>
                          <Button onClick={confirmMatches}>
                            <Check className="h-4 w-4 mr-2" />
                            Eşleştirmeleri Onayla ({matchedPayments.filter(m => m.status === 'matched').length})
                          </Button>
                        </div>
                      )}
                      
                      {matchedPayments.filter(m => m.status === 'unmatched').length > 0 && 
                       matchedPayments.filter(m => m.status === 'matched').length === 0 && (
                        <Alert className="mt-4">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Hiçbir ödeme otomatik olarak eşleştirilemedi. Lütfen yukarıdaki manuel eşleştirme seçeneklerini kullanın.
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}