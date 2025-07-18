import React, { useState, useEffect } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Plus,
  Search,
  Download,
  Edit,
  Trash2,
  Phone,
  Mail,
  UserCheck,
  Eye,
  UserPlus,
  ArrowLeft,
  CreditCard,
  Calculator,
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  X,
  UserX,
  Key,
  ToggleLeft,
  ToggleRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { useRouter } from "next/router";
import Link from "next/link";
import Header from "@/components/Header";
import NewAthleteForm from "@/components/NewAthleteForm";
import * as XLSX from 'xlsx';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

import { getSportsBranches } from "@/lib/sports-branches";

const sports = getSportsBranches();

export default function Athletes() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [filteredAthletes, setFilteredAthletes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortField, setSortField] = useState<'athlete' | 'parent' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [isBulkUploadDialogOpen, setIsBulkUploadDialogOpen] = useState(false);
  const [isBulkFeeDialogOpen, setIsBulkFeeDialogOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<any>(null);
  const [accountEntries, setAccountEntries] = useState<any[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [bulkFeeFile, setBulkFeeFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState<any[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedAthleteForStatus, setSelectedAthleteForStatus] = useState<any>(null);
  const [isParentAccountDialogOpen, setIsParentAccountDialogOpen] = useState(false);
  const [parentAccountsToCreate, setParentAccountsToCreate] = useState<any[]>([]);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAthleteForView, setSelectedAthleteForView] = useState<any>(null);
  const [selectedAthleteForEdit, setSelectedAthleteForEdit] = useState<any>(null);
  const [selectedAthleteForDelete, setSelectedAthleteForDelete] = useState<any>(null);
  const [isInvoiceExportDialogOpen, setIsInvoiceExportDialogOpen] = useState(false);
  const [selectedInvoiceMonth, setSelectedInvoiceMonth] = useState(new Date().toISOString().slice(0, 7));
  const [invoiceServiceDescription, setInvoiceServiceDescription] = useState('');
  const [invoiceUnitCode, setInvoiceUnitCode] = useState('Ay');
  const [invoiceVatRate, setInvoiceVatRate] = useState('20');
  const [bulkUploadFile, setBulkUploadFile] = useState<File | null>(null);
  const [bulkFeeUploadFile, setBulkFeeUploadFile] = useState<File | null>(null);
  const [bulkFeeUploadDate, setBulkFeeUploadDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Bulk payment entry states - synchronized with payments page
  const [bulkPayments, setBulkPayments] = useState<any[]>([]);
  const [bulkPaymentDate, setBulkPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingBulkPayment, setEditingBulkPayment] = useState<any>(null);
  const [isEditBulkDialogOpen, setIsEditBulkDialogOpen] = useState(false);
  
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
    
    if (!role || (role !== "admin" && role !== "coach")) {
      router.push("/login");
      return;
    }

    setUserRole(role);
    if (user) {
      setCurrentUser(JSON.parse(user));
    }

    loadAthletes(role, user ? JSON.parse(user) : null);

    // Check if there's an openAccount parameter in the URL
    if (router.query.openAccount) {
      const athleteId = router.query.openAccount as string;
      const athlete = JSON.parse(localStorage.getItem('students') || '[]').find((a: any) => a.id.toString() === athleteId);
      if (athlete) {
        setTimeout(() => {
          openAccountDialog(athlete);
        }, 500); // Small delay to ensure component is fully loaded
      }
    }
  }, [router, router.query.openAccount]);

  const loadAthletes = (role: string, user: any) => {
    // Load students from localStorage
    const allStudents = JSON.parse(localStorage.getItem('students') || '[]');
    
    let studentsToShow = allStudents;
    
    // If user is a coach, filter students based on their training groups and sports branches
    if (role === 'coach' && user) {
      studentsToShow = allStudents.filter((student: any) => {
        // Check if student is in any of the coach's training groups
        const isInTrainingGroup = user.trainingGroups?.some((group: string) => 
          student.trainingGroups?.includes(group)
        );
        
        // Check if student plays any of the coach's sports branches
        const isInSportsBranch = user.sportsBranches?.some((branch: string) => 
          student.sportsBranches?.includes(branch)
        );
        
        return isInTrainingGroup || isInSportsBranch;
      });
    }
    
    setAthletes(studentsToShow);
    setFilteredAthletes(studentsToShow);
  };

  useEffect(() => {
    const filtered = athletes.filter(athlete => {
      const matchesSearch = athlete.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           athlete.parentName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSport = selectedSport === "all" || athlete.sportsBranches?.includes(selectedSport);
      const matchesStatus = selectedStatus === "all" || athlete.status === selectedStatus;
      
      return matchesSearch && matchesSport && matchesStatus;
    });
    
    // Apply sorting based on selected field and direction
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'athlete') {
        const athleteNameA = `${a.studentName || ''} ${a.studentSurname || ''}`.trim().toLowerCase();
        const athleteNameB = `${b.studentName || ''} ${b.studentSurname || ''}`.trim().toLowerCase();
        comparison = athleteNameA.localeCompare(athleteNameB, 'tr');
      } else if (sortField === 'parent') {
        const parentNameA = `${a.parentName || ''} ${a.parentSurname || ''}`.trim().toLowerCase();
        const parentNameB = `${b.parentName || ''} ${b.parentSurname || ''}`.trim().toLowerCase();
        comparison = parentNameA.localeCompare(parentNameB, 'tr');
      } else {
        // Default sorting: athlete name first, then parent name
        const athleteNameA = `${a.studentName || ''} ${a.studentSurname || ''}`.trim().toLowerCase();
        const athleteNameB = `${b.studentName || ''} ${b.studentSurname || ''}`.trim().toLowerCase();
        
        if (athleteNameA !== athleteNameB) {
          comparison = athleteNameA.localeCompare(athleteNameB, 'tr');
        } else {
          // If athlete names are the same, sort by parent name
          const parentNameA = `${a.parentName || ''} ${a.parentSurname || ''}`.trim().toLowerCase();
          const parentNameB = `${b.parentName || ''} ${b.parentSurname || ''}`.trim().toLowerCase();
          comparison = parentNameA.localeCompare(parentNameB, 'tr');
        }
      }
      
      return sortDirection === 'desc' ? -comparison : comparison;
    });
    
    setFilteredAthletes(filtered);
  }, [searchTerm, selectedSport, selectedStatus, athletes, sortField, sortDirection]);

  const getInitials = (name: string, surname: string) => {
    return `${name?.charAt(0) || ''}${surname?.charAt(0) || ''}`.toUpperCase();
  };

  const formatBirthDate = (birthDate: string) => {
    if (!birthDate) return '-';
    
    try {
      // Handle ISO date format (YYYY-MM-DD) - convert to Turkish format
      if (birthDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = birthDate.split('-');
        return `${day}.${month}.${year}`;
      }
      
      // Handle DD/MM/YYYY or DD.MM.YYYY format - convert to DD.MM.YYYY
      if (birthDate.includes('/') || birthDate.includes('.')) {
        const separator = birthDate.includes('.') ? '.' : '/';
        const parts = birthDate.split(separator);
        if (parts.length === 3) {
          const [day, month, year] = parts;
          if (day && month && year && !isNaN(parseInt(day)) && !isNaN(parseInt(month)) && !isNaN(parseInt(year))) {
            return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`;
          }
        }
      }
      
      // Try to parse as a date and format
      const date = new Date(birthDate);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('tr-TR');
      }
      
      return birthDate;
    } catch (error) {
      console.error('Error formatting birth date:', error);
      return birthDate;
    }
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '-';
    
    try {
      let date;
      
      // Handle ISO date format (YYYY-MM-DD)
      if (birthDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = birthDate.split('-');
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
      // Handle DD/MM/YYYY or DD.MM.YYYY format
      else if (birthDate.includes('/') || birthDate.includes('.')) {
        const separator = birthDate.includes('.') ? '.' : '/';
        const parts = birthDate.split(separator);
        if (parts.length === 3) {
          const [day, month, year] = parts;
          if (day && month && year && !isNaN(parseInt(day)) && !isNaN(parseInt(month)) && !isNaN(parseInt(year))) {
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          }
        }
      }
      // Try to parse as a standard date
      else {
        date = new Date(birthDate);
      }
      
      if (!date || isNaN(date.getTime())) {
        return '-';
      }
      
      const today = new Date();
      let age = today.getFullYear() - date.getFullYear();
      const monthDiff = today.getMonth() - date.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
        age--;
      }
      
      return age >= 0 && age <= 100 ? age.toString() : '-';
    } catch (error) {
      console.error('Error calculating age:', error);
      return '-';
    }
  };

  const activeAthletes = athletes.filter(a => a.status === 'Aktif').length;
  const thisMonthRegistrations = athletes.filter(a => {
    try {
      const dateValue = a.registrationDate || a.createdAt;
      if (!dateValue || dateValue === 'Z' || typeof dateValue !== 'string') {
        return false;
      }
      const regDate = new Date(dateValue);
      if (isNaN(regDate.getTime())) {
        return false;
      }
      const thisMonth = new Date();
      return regDate.getMonth() === thisMonth.getMonth() && regDate.getFullYear() === thisMonth.getFullYear();
    } catch (error) {
      console.warn('Invalid date value in athlete registration:', a.registrationDate, a.createdAt);
      return false;
    }
  }).length;

  const loadAccountEntries = (athleteId: string) => {
    const entries = JSON.parse(localStorage.getItem(`account_${athleteId}`) || '[]');
    setAccountEntries(entries);
  };

  const saveAccountEntry = () => {
    if (!selectedAthlete || !newEntry.description || !newEntry.amountExcludingVat) {
      return;
    }

    const amountExcluding = parseFloat(newEntry.amountExcludingVat);
    const vatRate = parseFloat(newEntry.vatRate);
    
    // CRITICAL FIX: No VAT for credit (alacak) entries
    const vatAmount = newEntry.type === 'credit' ? 0 : (amountExcluding * vatRate) / 100;
    const amountIncluding = amountExcluding + vatAmount;

    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      month: newEntry.month,
      description: newEntry.description,
      amountExcludingVat: amountExcluding,
      vatRate: newEntry.type === 'credit' ? 0 : vatRate,
      vatAmount: vatAmount,
      amountIncludingVat: amountIncluding,
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

  const openAccountDialog = (athlete: any) => {
    setSelectedAthlete(athlete);
    loadAccountEntries(athlete.id);
    setIsAccountDialogOpen(true);
  };

  const calculateVatAmount = (excludingVat: string, vatRate: string) => {
    const excluding = parseFloat(excludingVat) || 0;
    const rate = parseFloat(vatRate) || 0;
    
    // CRITICAL FIX: No VAT for credit (alacak) entries
    const vatAmount = newEntry.type === 'credit' ? 0 : (excluding * rate) / 100;
    const including = excluding + vatAmount;
    
    setNewEntry(prev => ({
      ...prev,
      amountExcludingVat: excludingVat,
      vatRate: newEntry.type === 'credit' ? '0' : vatRate,
      amountIncludingVat: including.toFixed(2)
    }));
  };

  const getTotalBalance = () => {
    return accountEntries.reduce((total, entry) => {
      return entry.type === 'debit' 
        ? total + entry.amountIncludingVat 
        : total - entry.amountIncludingVat;
    }, 0);
  };

  // Export active athletes function
  const exportActiveAthletes = () => {
    const activeAthletesList = athletes.filter(athlete => athlete.status === 'Aktif' || !athlete.status);
    
    if (activeAthletesList.length === 0) {
      alert('Dışa aktarılacak aktif sporcu bulunamadı!');
      return;
    }

    const exportData = activeAthletesList.map((athlete, index) => ({
      'Sıra No': index + 1,
      'Sporcu Adı': athlete.studentName || '',
      'Sporcu Soyadı': athlete.studentSurname || '',
      'TC Kimlik No': athlete.studentTcNo || '',
      'Doğum Tarihi': athlete.studentBirthDate || '',
      'Yaş': athlete.studentAge || '',
      'Cinsiyet': athlete.studentGender || '',
      'Okul': athlete.studentSchool || '',
      'Sınıf': athlete.studentClass || '',
      'Spor Branşları': athlete.sportsBranches?.join(', ') || '',
      'Veli Adı': athlete.parentName || '',
      'Veli Soyadı': athlete.parentSurname || '',
      'Veli TC': athlete.parentTcNo || '',
      'Veli Telefon': athlete.parentPhone || '',
      'Veli Email': athlete.parentEmail || '',
      'Yakınlık': athlete.parentRelation || '',
      'Kayıt Tarihi': athlete.registrationDate ? new Date(athlete.registrationDate).toLocaleDateString('tr-TR') : '',
      'Durum': athlete.status || 'Aktif'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Aktif Sporcular');
    
    // Set column widths
    const colWidths = Object.keys(exportData[0]).map(() => ({ wch: 15 }));
    ws['!cols'] = colWidths;
    
    const fileName = `Aktif_Sporcular_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '_')}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    alert(`${activeAthletesList.length} aktif sporcu Excel dosyasına aktarıldı! (${fileName})`);
  };

  // Generate bulk fee template with date field
  const generateBulkFeeTemplate = () => {
    const activeAthletesList = athletes.filter(athlete => athlete.status === 'Aktif' || !athlete.status);
    
    if (activeAthletesList.length === 0) {
      alert('Şablon oluşturulacak aktif sporcu bulunamadı!');
      return;
    }

    const templateData = activeAthletesList.map(athlete => ({
      'Sporcu Adı Soyadı': `${athlete.studentName || ''} ${athlete.studentSurname || ''}`.trim(),
      'Açıklama': '',
      'Tutar': '',
      'KDV Oranı (%)': '10',
      'Toplam': '',
      'Birim Kod': 'Ay',
      'Tarih (DD/MM/YYYY)': new Date().toLocaleDateString('tr-TR')
    }));

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Toplu Aidat Şablonu');
    
    // Set column widths
    const colWidths = [
      { wch: 25 }, // Sporcu Adı Soyadı
      { wch: 30 }, // Açıklama
      { wch: 12 }, // Tutar
      { wch: 15 }, // KDV Oranı
      { wch: 12 }, // Toplam
      { wch: 12 }, // Birim Kod
      { wch: 18 }  // Tarih
    ];
    ws['!cols'] = colWidths;
    
    // Add formulas for automatic total calculation
    for (let row = 1; row <= activeAthletesList.length; row++) {
      const totalCell = XLSX.utils.encode_cell({ r: row, c: 4 }); // Toplam column
      ws[totalCell] = {
        f: `C${row + 1}*(1+D${row + 1}/100)`,
        t: 'n'
      };
    }
    
    const fileName = `Toplu_Aidat_Sablonu_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '_')}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    alert(`${activeAthletesList.length} sporcu için toplu aidat şablonu oluşturuldu! (${fileName})\n\n📋 Şablon Özellikleri:\n• Tarih alanı eklendi (DD/MM/YYYY formatında)\n• Her sporcu için ayrı tarih girilebilir\n• Varsayılan tarih: Bugün\n\nŞablonu doldurup tekrar yükleyebilirsiniz.`);
  };

  // Generate username and password for parent
  const generateParentCredentials = (parentName: string, parentSurname: string, parentPhone: string) => {
    // Clean and normalize Turkish characters for username generation
    const turkishToEnglish = (text: string) => {
      return text
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z]/g, '');
    };

    // Generate username from THIS parent's name and surname only
    const cleanName = turkishToEnglish(parentName.trim());
    const cleanSurname = turkishToEnglish(parentSurname.trim());
    const phoneLastFour = parentPhone.replace(/\D/g, '').slice(-4);
    const username = `${cleanName}${cleanSurname}${phoneLastFour}`;
    
    // Generate a simple password using the same parent's info
    const password = `${cleanName.charAt(0).toUpperCase()}${cleanSurname.charAt(0).toUpperCase()}${phoneLastFour}`;
    
    return { username, password };
  };

  // Create parent user account
  const createParentUser = (athlete: any, credentials: any) => {
    // Get existing parent users
    const existingParentUsers = JSON.parse(localStorage.getItem('parentUsers') || '[]');
    
    // Normalize phone numbers for comparison
    const normalizePhone = (phone: string) => {
      if (!phone) return '';
      let cleaned = phone.replace(/\D/g, '');
      if (cleaned.startsWith('90') && cleaned.length === 12) {
        cleaned = cleaned.substring(2);
      }
      if (cleaned.startsWith('0') && cleaned.length === 11) {
        cleaned = cleaned.substring(1);
      }
      return cleaned;
    };

    const athletePhoneNormalized = normalizePhone(athlete.parentPhone);
    const athleteEmailNormalized = athlete.parentEmail?.toLowerCase().trim();

    // Check if parent already exists (by phone or email)
    const existingParent = existingParentUsers.find((parent: any) => {
      const parentPhoneNormalized = normalizePhone(parent.phone);
      const parentEmailNormalized = parent.email?.toLowerCase().trim();
      
      return (athletePhoneNormalized && parentPhoneNormalized === athletePhoneNormalized) ||
             (athleteEmailNormalized && parentEmailNormalized === athleteEmailNormalized);
    });

    if (existingParent) {
      // Add athlete to existing parent's linked athletes if not already linked
      if (!existingParent.linkedAthletes.includes(athlete.id)) {
        existingParent.linkedAthletes.push(athlete.id);
        existingParent.updatedAt = new Date().toISOString();
      }
      
      // Update existing parent users
      const updatedParentUsers = existingParentUsers.map((parent: any) => 
        parent.id === existingParent.id ? existingParent : parent
      );
      localStorage.setItem('parentUsers', JSON.stringify(updatedParentUsers));
      
      return existingParent;
    } else {
      // Create new parent user with credentials generated from THIS athlete's parent info
      const parentUser = {
        id: Date.now() + Math.random(),
        username: credentials.username,
        password: credentials.password,
        firstName: athlete.parentName,
        lastName: athlete.parentSurname,
        phone: athlete.parentPhone,
        email: athlete.parentEmail,
        tcNo: athlete.parentTcNo,
        relation: athlete.parentRelation,
        linkedAthletes: [athlete.id],
        role: 'parent',
        isActive: true,
        isTemporaryPassword: true, // Flag to indicate password needs to be changed
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Create new parent user
      const updatedParentUsers = [...existingParentUsers, parentUser];
      localStorage.setItem('parentUsers', JSON.stringify(updatedParentUsers));
      
      return parentUser;
    }
  };

  // Bulk Upload Functions
  const generateBulkUploadTemplate = () => {
    const templateData = [
      {
        'Öğrenci Adı': 'Ahmet',
        'Öğrenci Soyadı': 'Yılmaz',
        'TC Kimlik No': '12345678901',
        'Doğum Tarihi (DD.MM.YYYY)': '15.03.2010',
        'Yaş': '14',
        'Cinsiyet': 'Erkek',
        'Spor Branşları (virgülle ayırın)': 'Basketbol, Futbol',
        'Veli Adı': 'Mehmet',
        'Veli Soyadı': 'Yılmaz',
        'Veli TC Kimlik No': '98765432109',
        'Veli Telefon': '05551234567',
        'Veli Email': 'mehmet.yilmaz@email.com',
        'Yakınlık Derecesi': 'Baba'
      },
      {
        'Öğrenci Adı': 'Elif',
        'Öğrenci Soyadı': 'Demir',
        'TC Kimlik No': '10987654321',
        'Doğum Tarihi (DD.MM.YYYY)': '22.07.2012',
        'Yaş': '12',
        'Cinsiyet': 'Kız',
        'Spor Branşları (virgülle ayırın)': 'Yüzme, Jimnastik',
        'Veli Adı': 'Ayşe',
        'Veli Soyadı': 'Demir',
        'Veli TC Kimlik No': '19876543210',
        'Veli Telefon': '05559876543',
        'Veli Email': 'ayse.demir@email.com',
        'Yakınlık Derecesi': 'Anne'
      },
      {
        'Öğrenci Adı': '',
        'Öğrenci Soyadı': '',
        'TC Kimlik No': '',
        'Doğum Tarihi (DD.MM.YYYY)': '',
        'Yaş': '',
        'Cinsiyet': '',
        'Spor Branşları (virgülle ayırın)': '',
        'Veli Adı': '',
        'Veli Soyadı': '',
        'Veli TC Kimlik No': '',
        'Veli Telefon': '',
        'Veli Email': '',
        'Yakınlık Derecesi': ''
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sporcu Toplu Yükleme Şablonu');
    
    // Set column widths
    const colWidths = Object.keys(templateData[0]).map(() => ({ wch: 20 }));
    ws['!cols'] = colWidths;
    
    // Format the birth date column as text to preserve DD.MM.YYYY format
    const birthDateColIndex = Object.keys(templateData[0]).indexOf('Doğum Tarihi (DD.MM.YYYY)');
    if (birthDateColIndex !== -1) {
      // Set column format to text for birth date column
      if (!ws['!cols']) ws['!cols'] = [];
      ws['!cols'][birthDateColIndex] = { wch: 20, z: '@' }; // '@' means text format
    }
    
    XLSX.writeFile(wb, 'Sporcu_Toplu_Yukleme_Sablonu.xlsx');
  };

  // Download parent credentials as text file with enhanced synchronization
  const downloadParentCredentials = () => {
    // Get fresh data from localStorage to ensure we have the latest information
    const allStudents = JSON.parse(localStorage.getItem('students') || '[]');
    let parentUsers = JSON.parse(localStorage.getItem('parentUsers') || '[]');
    
    // First, offer to completely rebuild parent accounts for data consistency
    const shouldRebuild = confirm(
      '🔄 VELİ HESAPLARI SENKRONİZASYONU\n\n' +
      'Veli giriş bilgilerinin doğru olması için veli hesaplarını mevcut sporcu verileriyle yeniden senkronize etmek önerilir.\n\n' +
      '✅ EVET: Veli hesapları güncel sporcu bilgileriyle yeniden oluşturulacak (Önerilen)\n' +
      '❌ HAYIR: Mevcut veli hesapları kullanılacak\n\n' +
      'Not: Bu işlem veli hesaplarını güncel sporcu bilgileriyle tamamen senkronize edecektir.'
    );

    if (shouldRebuild) {
      // Clear existing parent users and rebuild from scratch
      parentUsers = [];
      localStorage.setItem('parentUsers', JSON.stringify([]));
      
      console.log('Rebuilding parent accounts from current athlete data...');
      
      // Group athletes by parent (phone + email combination for accuracy)
      const parentGroups = new Map();
      
      allStudents.forEach((athlete: any) => {
        if (!athlete.parentName || !athlete.parentSurname || !athlete.parentPhone) {
          console.warn('Skipping athlete with incomplete parent info:', athlete.studentName);
          return;
        }
        
        // Create a unique key for each parent using normalized phone and email
        const normalizePhone = (phone: string) => {
          if (!phone) return '';
          let cleaned = phone.replace(/\D/g, '');
          if (cleaned.startsWith('90') && cleaned.length === 12) {
            cleaned = cleaned.substring(2);
          }
          if (cleaned.startsWith('0') && cleaned.length === 11) {
            cleaned = cleaned.substring(1);
          }
          return cleaned;
        };
        
        const normalizedPhone = normalizePhone(athlete.parentPhone);
        const normalizedEmail = (athlete.parentEmail || '').toLowerCase().trim();
        const parentKey = `${normalizedPhone}_${normalizedEmail}_${athlete.parentName.toLowerCase().trim()}_${athlete.parentSurname.toLowerCase().trim()}`;
        
        if (!parentGroups.has(parentKey)) {
          parentGroups.set(parentKey, {
            parentInfo: {
              name: athlete.parentName,
              surname: athlete.parentSurname,
              phone: athlete.parentPhone,
              email: athlete.parentEmail,
              tcNo: athlete.parentTcNo,
              relation: athlete.parentRelation
            },
            athletes: []
          });
        }
        
        parentGroups.get(parentKey).athletes.push(athlete);
      });
      
      console.log(`Found ${parentGroups.size} unique parents`);
      
      // Create parent accounts for each group
      let createdCount = 0;
      parentGroups.forEach((group, parentKey) => {
        try {
          const parentInfo = group.parentInfo;
          const athletes = group.athletes;
          
          // Generate credentials using the parent's information
          const credentials = generateParentCredentials(
            parentInfo.name,
            parentInfo.surname,
            parentInfo.phone
          );
          
          // Create parent user account
          const parentUser = {
            id: Date.now() + Math.random(),
            username: credentials.username,
            password: credentials.password,
            firstName: parentInfo.name,
            lastName: parentInfo.surname,
            phone: parentInfo.phone,
            email: parentInfo.email,
            tcNo: parentInfo.tcNo,
            relation: parentInfo.relation,
            linkedAthletes: athletes.map(a => a.id),
            role: 'parent',
            isActive: true,
            isTemporaryPassword: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          parentUsers.push(parentUser);
          createdCount++;
          
          console.log(`Created parent account for: ${parentInfo.name} ${parentInfo.surname} with ${athletes.length} athletes`);
          
        } catch (error) {
          console.error('Error creating parent account:', error);
        }
      });
      
      // Save the rebuilt parent users
      localStorage.setItem('parentUsers', JSON.stringify(parentUsers));
      
      if (createdCount === 0) {
        alert('❌ Veli hesabı oluşturulamadı!\n\nSporcuların veli bilgileri (ad, soyad, telefon) eksik olabilir.');
        return;
      }
      
      alert(`✅ VELİ HESAPLARI YENİDEN OLUŞTURULDU!\n\n📊 İstatistikler:\n• Oluşturulan veli hesabı: ${createdCount}\n• Toplam sporcu: ${allStudents.length}\n• Benzersiz veli: ${parentGroups.size}\n\n🔄 Tüm veli hesapları güncel sporcu bilgileriyle senkronize edildi.`);
    }
    
    // If no parent users exist after rebuild attempt
    if (parentUsers.length === 0) {
      if (allStudents.length === 0) {
        alert('❌ Henüz sisteme sporcu kaydı yapılmamış!\n\nÖnce sporcu kayıtları oluşturun, ardından veli hesapları otomatik olarak oluşturulacaktır.');
        return;
      } else {
        alert('❌ Veli hesabı bulunamadı!\n\nLütfen önce "Yeniden Senkronize Et" seçeneğini kullanarak veli hesaplarını oluşturun.');
        return;
      }
    }

    // Generate the credentials file
    const textContent = [
      '=== VELİ KULLANICI ADI VE ŞİFRELERİ ===',
      `Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}`,
      `Toplam Veli Hesabı: ${parentUsers.length}`,
      `Toplam Sporcu: ${allStudents.length}`,
      '',
      '--- DETAYLAR ---'
    ];

    parentUsers.forEach((parent: any, index: number) => {
      // Find all linked athletes for this parent
      const linkedAthletes = allStudents.filter(athlete => 
        parent.linkedAthletes && parent.linkedAthletes.includes(athlete.id)
      );
      
      const athleteNames = linkedAthletes.length > 0 ? 
        linkedAthletes.map(athlete => `${athlete.studentName} ${athlete.studentSurname}`).join(', ') : 
        'Sporcu Bulunamadı';

      textContent.push(
        `${index + 1}. ${parent.firstName} ${parent.lastName}`,
        `   Bağlı Sporcular: ${athleteNames}`,
        `   Telefon: ${parent.phone}`,
        `   Email: ${parent.email || 'Belirtilmemiş'}`,
        `   Kullanıcı Adı: ${parent.username}`,
        `   Şifre: ${parent.password}`,
        `   Bağlı Sporcu Sayısı: ${linkedAthletes.length}`,
        `   Hesap Durumu: ${parent.isActive ? 'Aktif' : 'Pasif'}`,
        ''
      );
    });

    textContent.push(
      '--- NOTLAR ---',
      '• Bu liste tüm veli hesaplarını içerir',
      '• Veli hesapları güncel sporcu verileriyle senkronize edilmiştir',
      '• Kullanıcı adı: VeliAdıVeliSoyadıTelefonSon4Hane formatındadır',
      '• Şifre: VeliAdıİlkHarfVeliSoyadıİlkHarfTelefonSon4Hane formatındadır',
      '• Veliler ilk girişte şifrelerini değiştirebilirler',
      `• Dosya oluşturulma tarihi: ${new Date().toLocaleString('tr-TR')}`,
      ''
    );

    const blob = new Blob([textContent.join('\n')], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `veli_kullanici_bilgileri_${new Date().toISOString().split('T')[0]}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`✅ ${parentUsers.length} veli hesabının giriş bilgileri başarıyla indirildi!\n\n📁 Dosya Adı: veli_kullanici_bilgileri_${new Date().toISOString().split('T')[0]}.txt\n\n🔄 Veli hesapları güncel sporcu verileriyle tam senkronizasyon halinde\n📱 Telefon ve email bilgileri doğrulandı\n🔐 Kullanıcı adı ve şifreler yeniden oluşturuldu`);
  };

  // Action button functions
  const openViewDialog = (athlete: any) => {
    setSelectedAthleteForView(athlete);
    setIsViewDialogOpen(true);
  };

  const openEditDialog = (athlete: any) => {
    setSelectedAthleteForEdit(athlete);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (athlete: any) => {
    setSelectedAthleteForDelete(athlete);
    setIsDeleteDialogOpen(true);
  };

  const deleteAthlete = () => {
    if (!selectedAthleteForDelete) return;

    const allStudents = JSON.parse(localStorage.getItem('students') || '[]');
    const updatedStudents = allStudents.filter((student: any) => 
      student.id !== selectedAthleteForDelete.id
    );
    
    localStorage.setItem('students', JSON.stringify(updatedStudents));
    
    // Also remove account entries
    localStorage.removeItem(`account_${selectedAthleteForDelete.id}`);
    
    loadAthletes(userRole!, currentUser);
    setIsDeleteDialogOpen(false);
    setSelectedAthleteForDelete(null);
    
    alert(`${selectedAthleteForDelete.studentName} ${selectedAthleteForDelete.studentSurname} adlı sporcu başarıyla silindi.`);
  };

  // Status change functions
  const openStatusDialog = (athlete: any) => {
    setSelectedAthleteForStatus(athlete);
    setIsStatusDialogOpen(true);
  };

  const changeAthleteStatus = (newStatus: string) => {
    if (!selectedAthleteForStatus) return;

    const allStudents = JSON.parse(localStorage.getItem('students') || '[]');
    const updatedStudents = allStudents.map((student: any) => 
      student.id === selectedAthleteForStatus.id 
        ? { ...student, status: newStatus, statusChangedAt: new Date().toISOString() }
        : student
    );
    
    localStorage.setItem('students', JSON.stringify(updatedStudents));
    loadAthletes(userRole!, currentUser);
    setIsStatusDialogOpen(false);
    setSelectedAthleteForStatus(null);
  };

  // Sorting function
  const handleSort = (field: 'athlete' | 'parent') => {
    if (sortField === field) {
      // If clicking the same field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a different field, set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon for table headers
  const getSortIcon = (field: 'athlete' | 'parent') => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  // Generate E-Invoice Export - EXACT format as specified by user
  const generateEInvoiceExport = () => {
    try {
      // Get athletes with bulk fee entries for the selected month
      const selectedMonthStr = selectedInvoiceMonth;
      const athletesWithFees: any[] = [];
      
      // Find athletes who have bulk fee entries for the selected month
      athletes.forEach(athlete => {
        if (athlete.status !== 'Aktif' && athlete.status !== undefined) return;
        
        const accountEntries = JSON.parse(localStorage.getItem(`account_${athlete.id}`) || '[]');
        const monthEntry = accountEntries.find((entry: any) => 
          entry.month === selectedMonthStr && 
          entry.type === 'debit'
        );
        
        if (monthEntry) {
          athletesWithFees.push({
            ...athlete,
            feeEntry: monthEntry
          });
        }
      });
      
      if (athletesWithFees.length === 0) {
        alert(`Seçilen dönem (${new Date(selectedMonthStr + '-01').toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}) için toplu aidat girişi yapılmış sporcu bulunamadı!\n\nÖnce "Toplu Aidat Girişi" ile seçilen döneme ait aidat kayıtlarını oluşturun.`);
        return;
      }

      // Create invoice data with EXACT headers as specified by user
      const invoiceData: any[] = [];

      athletesWithFees.forEach((athlete, index) => {
        const feeEntry = athlete.feeEntry;
        const unitPrice = feeEntry.amountExcludingVat.toFixed(2);
        
        // Get current date and time for invoice
        const now = new Date();
        const invoiceDate = now.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const invoiceTime = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        // Create invoice row with EXACT headers as specified
        const invoiceRow = {
          'Id': index + 1,
          'Fatura Numarası': '',
          'ETTN': '',
          'Fatura Tarihi': invoiceDate,
          'Fatura Saati': invoiceTime,
          'Fatura Tipi': 'SATIS',
          'Fatura Profili': 'EARSIVFATURA',
          'Döviz Kodu': 'TRY',
          'Alıcı VKN/TCKN': athlete.parentTcNo || '',
          'Alıcı Ünvan/Adı | Yabancı Alıcı Ünvan/Adı | Turist Adı': athlete.parentName || '',
          'Alıcı Soyadı | Yabancı Alıcı Soyadı | Turist Soyadı ': athlete.parentSurname || '',
          'Alıcı Ülke | Yabancı Ülke | Turist Ülke': 'Türkiye',
          'Alıcı Şehir | Yabancı Şehir | Turist Şehir': 'KIRKLARELİ',
          'Alıcı İlçe | Yabancı İlçe | Turist İlçe': 'LÜLEBURGAZ',
          'Alıcı Sokak | Yabancı Sokak | Turist Sokak': '',
          'Alıcı Bina No | Yabancı Bina No | Turist Bina No': '',
          'Alıcı Kapı No | Yabancı Kapı No | Turist Kapı No': '',
          'Alıcı Eposta | Yabancı Eposta | Turist Eposta': athlete.parentEmail || '',
          'Gönderim Türü': 'ELEKTRONİK',
          'Satışın Yapıldığı Web Sitesi': '',
          'Ödeme Tarihi': '',
          'Ödeme Türü': 'EFT/HAVALE',
          'Mal/Hizmet Adı': invoiceServiceDescription,
          'Miktar': '1',
          'Birim Kodu': invoiceUnitCode,
          ' Birim Fiyat ': ` ₺${unitPrice} `,
          'KDV Oranı': invoiceVatRate,
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

        invoiceData.push(invoiceRow);
      });

      // Create Excel file
      const ws = XLSX.utils.json_to_sheet(invoiceData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'E-Arşiv Fatura');
      
      // Set column widths for better readability
      const colWidths = Object.keys(invoiceData[0]).map(() => ({ wch: 15 }));
      ws['!cols'] = colWidths;
      
      // Generate filename with date and month
      const monthName = new Date(selectedInvoiceMonth + '-01').toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
      const fileName = `E_Arsiv_Fatura_${monthName.replace(' ', '_')}_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '_')}.xlsx`;
      
      // Download the file
      XLSX.writeFile(wb, fileName);
      
      // Show success message
      alert(`✅ E-arşiv fatura Excel dosyası oluşturuldu!\n\n📊 İstatistikler:\n• Fatura sayısı: ${athletesWithFees.length}\n• Dönem: ${monthName}\n• Hizmet: ${invoiceServiceDescription}\n• KDV Oranı: %${invoiceVatRate}\n• Birim Kodu: ${invoiceUnitCode}\n\n📁 Dosya: ${fileName}\n\n✅ Tüm başlıklar ve format tam olarak belirttiğiniz şekilde oluşturuldu.`);
      
      // Close dialog
      setIsInvoiceExportDialogOpen(false);
      
    } catch (error) {
      console.error('E-fatura oluşturma hatası:', error);
      alert('E-fatura oluşturulurken bir hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    }
  };

  // Process bulk fee entry with date support and duplicate prevention
  const processBulkFeeEntry = async () => {
    if (!bulkFeeUploadFile) return;

    try {
      const data = await bulkFeeUploadFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      console.log('Processing bulk fee data:', jsonData);
      
      if (jsonData.length === 0) {
        alert('Excel dosyasında işlenecek veri bulunamadı!');
        return;
      }

      let processedCount = 0;
      let errorCount = 0;
      let duplicateCount = 0;

      for (const row of jsonData) {
        try {
          const feeData = row as any;
          
          // Skip empty rows
          if (!feeData['Sporcu Adı Soyadı'] || !feeData['Tutar']) {
            continue;
          }

          // Find athlete by name
          const athleteName = feeData['Sporcu Adı Soyadı'].toString().trim();
          const athlete = athletes.find(a => 
            `${a.studentName} ${a.studentSurname}`.toLowerCase() === athleteName.toLowerCase()
          );

          if (!athlete) {
            console.warn(`Athlete not found: ${athleteName}`);
            errorCount++;
            continue;
          }

          // Parse fee data
          const description = feeData['Açıklama']?.toString() || 'Toplu Aidat Girişi';
          const amountExcludingVat = parseFloat(feeData['Tutar']) || 0;
          const vatRate = parseFloat(feeData['KDV Oranı (%)']) || 10;
          const unitCode = feeData['Birim Kod']?.toString() || 'Ay';

          if (amountExcludingVat <= 0) {
            console.warn(`Invalid amount for athlete: ${athleteName}`);
            errorCount++;
            continue;
          }

          // Parse date from Excel (supports DD/MM/YYYY, DD.MM.YYYY, and Excel serial dates)
          let entryDate = new Date(); // Default fallback
          let entryMonth = new Date().toISOString().slice(0, 7); // Default fallback
          let dueDate = new Date(); // Default fallback
          let dateParseSuccess = false;

          const dateField = feeData['Tarih (DD/MM/YYYY)'] || feeData['Tarih'];
          if (dateField) {
            try {
              const dateStr = dateField.toString().trim();
              console.log(`🔍 Processing date for ${athleteName}: "${dateStr}"`);
              
              // Check if it's an Excel serial date (numeric value)
              const numericValue = parseFloat(dateStr);
              if (!isNaN(numericValue) && numericValue > 1 && numericValue < 100000) {
                console.log(`📅 Detected Excel serial date for ${athleteName}: ${numericValue}`);
                
                // Convert Excel serial date to JavaScript Date
                // Excel serial date starts from January 1, 1900 (with leap year bug adjustment)
                const excelEpoch = new Date(1900, 0, 1); // January 1, 1900
                const daysSinceEpoch = numericValue - 1; // Excel counts from 1, not 0
                
                // Account for Excel's leap year bug (treats 1900 as leap year)
                const adjustedDays = numericValue > 59 ? daysSinceEpoch - 1 : daysSinceEpoch;
                
                entryDate = new Date(excelEpoch.getTime() + (adjustedDays * 24 * 60 * 60 * 1000));
                
                // Validate the converted date
                if (!isNaN(entryDate.getTime()) && entryDate.getFullYear() >= 1900 && entryDate.getFullYear() <= 2030) {
                  entryMonth = `${entryDate.getFullYear()}-${(entryDate.getMonth() + 1).toString().padStart(2, '0')}`;
                  dueDate = new Date(entryDate.getFullYear(), entryDate.getMonth() + 1, 0); // Last day of the month
                  dateParseSuccess = true;
                  
                  console.log(`✅ Excel serial date converted successfully for ${athleteName}: ${numericValue} -> ${entryDate.toLocaleDateString('tr-TR')} (Month: ${entryMonth})`);
                } else {
                  console.warn(`⚠️ Invalid Excel serial date conversion for ${athleteName}: ${numericValue}`);
                }
              } else {
                // Handle DD/MM/YYYY or DD.MM.YYYY format
                const turkishMatch = dateStr.match(/^(\d{1,2})[\.\/](\d{1,2})[\.\/](\d{2,4})$/);
                if (turkishMatch) {
                  let day = parseInt(turkishMatch[1]);
                  let month = parseInt(turkishMatch[2]);
                  let year = parseInt(turkishMatch[3]);
                  
                  // Handle 2-digit years
                  if (year < 100) {
                    year = year <= 30 ? 2000 + year : 1900 + year;
                  }
                  
                  if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2030) {
                    const testDate = new Date(year, month - 1, day);
                    if (testDate.getFullYear() === year && 
                        testDate.getMonth() === month - 1 && 
                        testDate.getDate() === day) {
                      entryDate = testDate;
                      entryMonth = `${year}-${month.toString().padStart(2, '0')}`;
                      
                      // Set due date to last day of the entry month
                      dueDate = new Date(year, month, 0); // Last day of the month
                      dateParseSuccess = true;
                      
                      console.log(`✅ Turkish date format parsed successfully for ${athleteName}: ${dateStr} -> ${entryDate.toLocaleDateString('tr-TR')} (Month: ${entryMonth})`);
                    }
                  }
                }
              }
              
              if (!dateParseSuccess) {
                console.warn(`⚠️ Date parsing failed for ${athleteName}: "${dateStr}" - using current date as fallback`);
              }
            } catch (error) {
              console.warn(`❌ Error parsing date for athlete ${athleteName}:`, error);
              // Use default date if parsing fails
            }
          } else {
            console.log(`ℹ️ No date field found for ${athleteName} - using current date`);
          }

          // Calculate VAT with proper rounding
          const vatAmount = Math.round((amountExcludingVat * vatRate) / 100 * 100) / 100;
          const amountIncludingVat = Math.round((amountExcludingVat + vatAmount) * 100) / 100;

          // Check for duplicates before creating entry
          const existingEntries = JSON.parse(localStorage.getItem(`account_${athlete.id}`) || '[]');
          const isDuplicate = existingEntries.some((entry: any) => 
            entry.month === entryMonth &&
            entry.description === description &&
            Math.abs(entry.amountIncludingVat - amountIncludingVat) < 0.01 &&
            entry.type === 'debit'
          );

          if (isDuplicate) {
            console.warn(`Duplicate entry detected for ${athleteName} in ${entryMonth}`);
            duplicateCount++;
            continue;
          }

          // Create account entry with parsed date - FIXED TO USE EXCEL DATE
          const entry = {
            id: Date.now() + Math.random(),
            date: entryDate.toISOString(), // Use Excel date
            month: entryMonth, // Use Excel month
            description: description,
            amountExcludingVat: amountExcludingVat,
            vatRate: vatRate,
            vatAmount: vatAmount,
            amountIncludingVat: amountIncludingVat,
            unitCode: unitCode,
            type: 'debit',
            dueDate: dueDate.toISOString()
          };

          // Save to athlete's account
          const updatedEntries = [...existingEntries, entry];
          localStorage.setItem(`account_${athlete.id}`, JSON.stringify(updatedEntries));

          processedCount++;

        } catch (rowError) {
          console.error('Error processing fee row:', rowError);
          errorCount++;
        }
      }

      if (processedCount === 0 && duplicateCount === 0) {
        alert('İşlenecek geçerli aidat kaydı bulunamadı!');
        return;
      }

      let message = `✅ Toplu aidat girişi tamamlandı!\n\n`;
      message += `📊 İşlem Özeti:\n`;
      message += `• İşlenen aidat kaydı: ${processedCount}\n`;
      if (duplicateCount > 0) {
        message += `• Mükerrer kayıt atlandı: ${duplicateCount}\n`;
      }
      if (errorCount > 0) {
        message += `• Hatalı kayıt: ${errorCount}\n`;
      }
      message += `• ✅ Tarih desteği: Excel'den gelen tarihler kullanıldı\n`;
      message += `• Format: DD/MM/YYYY veya DD.MM.YYYY desteklenir`;
      
      alert(message);
      
      setBulkFeeUploadFile(null);
      setIsBulkFeeDialogOpen(false);
    } catch (error) {
      console.error('Error processing bulk fee entry:', error);
      alert('Dosya işlenirken hata oluştu! Lütfen dosya formatını kontrol edin.\n\nHata: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    }
  };

  // Bulk payment functions - synchronized with payments page
  const paymentMethods = ["Kredi Kartı", "Nakit", "Havale/EFT", "Çek"];

  const addBulkPaymentEntry = () => {
    const newBulkEntry = {
      id: Date.now() + Math.random(),
      athleteId: '',
      athleteName: '',
      parentName: '',
      amount: '',
      description: '',
      sport: '',
      method: 'Nakit',
      isValid: false
    };
    setBulkPayments([...bulkPayments, newBulkEntry]);
  };

  const updateBulkPaymentEntry = (id: number, field: string, value: string) => {
    setBulkPayments(prev => prev.map(entry => {
      if (entry.id === id) {
        const updated = { ...entry, [field]: value };
        
        // If athlete is selected, auto-fill related fields
        if (field === 'athleteId' && value) {
          const athlete = athletes.find(a => a.id.toString() === value);
          if (athlete) {
            updated.athleteName = `${athlete.studentName} ${athlete.studentSurname}`;
            updated.parentName = `${athlete.parentName} ${athlete.parentSurname}`;
            updated.sport = athlete.selectedSports?.[0] || athlete.sportsBranches?.[0] || 'Genel';
          }
        }
        
        // Validate entry
        updated.isValid = updated.athleteId && updated.amount && parseFloat(updated.amount) > 0;
        
        return updated;
      }
      return entry;
    }));
  };

  const removeBulkPaymentEntry = (id: number) => {
    setBulkPayments(prev => prev.filter(entry => entry.id !== id));
  };

  const saveBulkPayments = async () => {
    const validEntries = bulkPayments.filter(entry => entry.isValid);
    
    if (validEntries.length === 0) {
      alert("Geçerli ödeme kaydı bulunamadı!");
      return;
    }

    if (!bulkPaymentDate) {
      alert("Lütfen ödeme tarihi seçin!");
      return;
    }

    try {
      const existingPayments = JSON.parse(localStorage.getItem('payments') || '[]');
      let processedCount = 0;

      for (const entry of validEntries) {
        const athlete = athletes.find(a => a.id.toString() === entry.athleteId);
        if (!athlete) continue;

        // Create payment record
        const newPayment = {
          id: `bulk_${entry.id}_${Date.now()}`,
          athleteId: athlete.id,
          athleteName: entry.athleteName,
          parentName: entry.parentName,
          amount: parseFloat(entry.amount),
          status: "Ödendi",
          paymentDate: bulkPaymentDate,
          method: entry.method,
          sport: entry.sport,
          invoiceNumber: `BULK-${Date.now()}-${athlete.id}`,
          dueDate: bulkPaymentDate,
          description: entry.description || `Toplu ödeme girişi - ${new Date(bulkPaymentDate).toLocaleDateString('tr-TR')}`,
          isGenerated: false,
          isBulkEntry: true,
          bulkEntryDate: new Date().toISOString()
        };

        existingPayments.push(newPayment);

        // Add to athlete's account as credit
        const existingEntries = JSON.parse(localStorage.getItem(`account_${athlete.id}`) || '[]');
        const paymentEntry = {
          id: Date.now() + Math.random(),
          date: new Date(bulkPaymentDate).toISOString(),
          month: bulkPaymentDate.slice(0, 7),
          description: `Toplu Ödeme - ${new Date(bulkPaymentDate).toLocaleDateString('tr-TR')} - ${entry.method} - ${entry.description || 'Toplu ödeme girişi'}`,
          amountExcludingVat: parseFloat(entry.amount),
          vatRate: 0,
          vatAmount: 0,
          amountIncludingVat: parseFloat(entry.amount),
          unitCode: 'Adet',
          type: 'credit'
        };
        
        existingEntries.push(paymentEntry);
        localStorage.setItem(`account_${athlete.id}`, JSON.stringify(existingEntries));
        processedCount++;
      }

      // Save updated payments
      localStorage.setItem('payments', JSON.stringify(existingPayments));

      // Reset form
      setBulkPayments([]);
      setBulkPaymentDate(new Date().toISOString().split('T')[0]);
      setIsBulkFeeDialogOpen(false);

      alert(`${processedCount} toplu ödeme kaydı başarıyla oluşturuldu!`);

    } catch (error) {
      console.error('Error saving bulk payments:', error);
      alert("Toplu ödemeler kaydedilirken hata oluştu");
    }
  };

  // Edit bulk payment functions
  const openEditBulkPayment = (payment: any) => {
    if (!payment.isBulkEntry) {
      alert("Bu ödeme toplu giriş ile oluşturulmamış, düzenlenemez!");
      return;
    }
    
    setEditingBulkPayment({
      id: payment.id,
      athleteId: payment.athleteId,
      athleteName: payment.athleteName,
      parentName: payment.parentName,
      amount: payment.amount.toString(),
      description: payment.description || '',
      method: payment.method || 'Nakit',
      paymentDate: payment.paymentDate,
      sport: payment.sport
    });
    setIsEditBulkDialogOpen(true);
  };

  const saveEditedBulkPayment = async () => {
    if (!editingBulkPayment) return;

    try {
      const existingPayments = JSON.parse(localStorage.getItem('payments') || '[]');
      const paymentIndex = existingPayments.findIndex((p: any) => p.id === editingBulkPayment.id);
      
      if (paymentIndex === -1) {
        alert("Düzenlenecek ödeme bulunamadı!");
        return;
      }

      const athlete = athletes.find(a => a.id.toString() === editingBulkPayment.athleteId);
      if (!athlete) {
        alert("Sporcu bulunamadı!");
        return;
      }

      // Update payment record
      const oldPayment = existingPayments[paymentIndex];
      const updatedPayment = {
        ...oldPayment,
        athleteId: athlete.id,
        athleteName: editingBulkPayment.athleteName,
        parentName: editingBulkPayment.parentName,
        amount: parseFloat(editingBulkPayment.amount),
        method: editingBulkPayment.method,
        paymentDate: editingBulkPayment.paymentDate,
        description: editingBulkPayment.description,
        sport: editingBulkPayment.sport,
        lastModified: new Date().toISOString()
      };

      existingPayments[paymentIndex] = updatedPayment;

      // Update athlete's account entry
      const existingEntries = JSON.parse(localStorage.getItem(`account_${athlete.id}`) || '[]');
      const entryIndex = existingEntries.findIndex((entry: any) => 
        entry.description.includes('Toplu Ödeme') && 
        Math.abs(entry.amountIncludingVat - oldPayment.amount) < 0.01
      );

      if (entryIndex !== -1) {
        existingEntries[entryIndex] = {
          ...existingEntries[entryIndex],
          date: new Date(editingBulkPayment.paymentDate).toISOString(),
          month: editingBulkPayment.paymentDate.slice(0, 7),
          description: `Toplu Ödeme (Düzenlendi) - ${new Date(editingBulkPayment.paymentDate).toLocaleDateString('tr-TR')} - ${editingBulkPayment.method} - ${editingBulkPayment.description || 'Toplu ödeme girişi'}`,
          amountExcludingVat: parseFloat(editingBulkPayment.amount),
          amountIncludingVat: parseFloat(editingBulkPayment.amount)
        };
        localStorage.setItem(`account_${athlete.id}`, JSON.stringify(existingEntries));
      }

      // Save updated payments
      localStorage.setItem('payments', JSON.stringify(existingPayments));

      setIsEditBulkDialogOpen(false);
      setEditingBulkPayment(null);

      alert("Toplu ödeme kaydı başarıyla güncellendi!");

    } catch (error) {
      console.error('Error updating bulk payment:', error);
      alert("Toplu ödeme güncellenirken hata oluştu");
    }
  };

  const deleteBulkPayment = async (payment: any) => {
    if (!payment.isBulkEntry) {
      alert("Bu ödeme toplu giriş ile oluşturulmamış, silinemez!");
      return;
    }

    const confirmed = confirm(`${payment.athleteName} için ${payment.amount} TL tutarındaki toplu ödeme kaydını silmek istediğinizden emin misiniz?`);
    
    if (!confirmed) return;

    try {
      const existingPayments = JSON.parse(localStorage.getItem('payments') || '[]');
      const filteredPayments = existingPayments.filter((p: any) => p.id !== payment.id);
      
      // Remove from athlete's account
      const existingEntries = JSON.parse(localStorage.getItem(`account_${payment.athleteId}`) || '[]');
      const filteredEntries = existingEntries.filter((entry: any) => 
        !(entry.description.includes('Toplu Ödeme') && Math.abs(entry.amountIncludingVat - payment.amount) < 0.01)
      );
      
      localStorage.setItem(`account_${payment.athleteId}`, JSON.stringify(filteredEntries));
      localStorage.setItem('payments', JSON.stringify(filteredPayments));

      alert("Toplu ödeme kaydı başarıyla silindi!");

    } catch (error) {
      console.error('Error deleting bulk payment:', error);
      alert("Toplu ödeme silinirken hata oluştu");
    }
  };

  // PDF Export Function for Current Account
  const exportAccountToPDF = (athlete: any, entries: any[]) => {
    if (!athlete || !entries || entries.length === 0) {
      alert('PDF oluşturmak için cari hesap hareketleri bulunmuyor!');
      return;
    }

    try {
      // Sort entries chronologically
      const sortedEntries = entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Calculate running balance for each entry
      const entriesWithBalance = sortedEntries.map((entry, index) => {
        const runningBalance = sortedEntries.slice(0, index + 1).reduce((balance, e) => {
          return e.type === 'debit' 
            ? balance + e.amountIncludingVat 
            : balance - e.amountIncludingVat;
        }, 0);
        
        return {
          ...entry,
          runningBalance: runningBalance
        };
      });

      // Create HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Cari Hesap Kartı - ${athlete.studentName} ${athlete.studentSurname}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              font-size: 12px;
              color: #333;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .company-name {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .document-title {
              font-size: 16px;
              font-weight: bold;
              color: #666;
            }
            .athlete-info { 
              margin-bottom: 20px; 
              background: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
            }
            .athlete-info h3 {
              margin: 0 0 10px 0;
              color: #333;
              font-size: 14px;
            }
            .info-row {
              display: flex;
              margin-bottom: 5px;
            }
            .info-label {
              font-weight: bold;
              width: 120px;
              color: #666;
            }
            .summary {
              margin-bottom: 20px;
              background: #e3f2fd;
              padding: 15px;
              border-radius: 5px;
              border-left: 4px solid #2196f3;
            }
            .summary h3 {
              margin: 0 0 10px 0;
              color: #1976d2;
              font-size: 14px;
            }
            .balance-positive { color: #d32f2f; font-weight: bold; }
            .balance-negative { color: #388e3c; font-weight: bold; }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 10px;
              font-size: 11px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left; 
            }
            th { 
              background-color: #f5f5f5; 
              font-weight: bold;
              color: #333;
            }
            .debit { color: #d32f2f; }
            .credit { color: #388e3c; }
            .amount { text-align: right; font-weight: bold; }
            .balance { text-align: right; font-weight: bold; }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 10px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 15px;
            }
            .page-break { page-break-before: always; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">SPOR OKULU YÖNETİM SİSTEMİ</div>
            <div class="document-title">CARİ HESAP KARTI</div>
          </div>
          
          <div class="athlete-info">
            <h3>SPORCU BİLGİLERİ</h3>
            <div class="info-row">
              <span class="info-label">Sporcu Adı:</span>
              <span>${athlete.studentName} ${athlete.studentSurname}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Veli Adı:</span>
              <span>${athlete.parentName} ${athlete.parentSurname}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Telefon:</span>
              <span>${athlete.parentPhone || '-'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span>${athlete.parentEmail || '-'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Spor Branşları:</span>
              <span>${athlete.sportsBranches?.join(', ') || '-'}</span>
            </div>
          </div>

          <div class="summary">
            <h3>ÖZET BİLGİLER</h3>
            <div class="info-row">
              <span class="info-label">Toplam Hareket:</span>
              <span>${entriesWithBalance.length} adet</span>
            </div>
            <div class="info-row">
              <span class="info-label">Toplam Borç:</span>
              <span class="debit">₺${entriesWithBalance.filter(e => e.type === 'debit').reduce((sum, e) => sum + e.amountIncludingVat, 0).toFixed(2)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Toplam Alacak:</span>
              <span class="credit">₺${entriesWithBalance.filter(e => e.type === 'credit').reduce((sum, e) => sum + e.amountIncludingVat, 0).toFixed(2)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Güncel Bakiye:</span>
              <span class="${entriesWithBalance[entriesWithBalance.length - 1]?.runningBalance >= 0 ? 'balance-positive' : 'balance-negative'}">
                ₺${entriesWithBalance[entriesWithBalance.length - 1]?.runningBalance.toFixed(2) || '0.00'}
                ${entriesWithBalance[entriesWithBalance.length - 1]?.runningBalance >= 0 ? ' (Borç)' : ' (Alacak)'}
              </span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 80px;">Tarih</th>
                <th style="width: 100px;">Dönem</th>
                <th>Açıklama</th>
                <th style="width: 60px;">Tür</th>
                <th style="width: 80px;">KDV Hariç</th>
                <th style="width: 60px;">KDV</th>
                <th style="width: 80px;">Toplam</th>
                <th style="width: 80px;">Bakiye</th>
              </tr>
            </thead>
            <tbody>
              ${entriesWithBalance.map(entry => `
                <tr>
                  <td>${new Date(entry.date).toLocaleDateString('tr-TR')}</td>
                  <td>${new Date(entry.month + '-01').toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}</td>
                  <td>${entry.description}</td>
                  <td class="${entry.type === 'debit' ? 'debit' : 'credit'}">
                    ${entry.type === 'debit' ? 'Borç' : 'Alacak'}
                  </td>
                  <td class="amount">₺${entry.amountExcludingVat.toFixed(2)}</td>
                  <td class="amount">₺${entry.vatAmount.toFixed(2)}</td>
                  <td class="amount ${entry.type === 'debit' ? 'debit' : 'credit'}">
                    ${entry.type === 'debit' ? '+' : '-'}₺${entry.amountIncludingVat.toFixed(2)}
                  </td>
                  <td class="balance ${entry.runningBalance >= 0 ? 'balance-positive' : 'balance-negative'}">
                    ₺${entry.runningBalance.toFixed(2)}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Bu belge ${new Date().toLocaleDateString('tr-TR')} tarihinde ${new Date().toLocaleTimeString('tr-TR')} saatinde oluşturulmuştur.</p>
            <p>Spor Okulu Yönetim Sistemi - Cari Hesap Kartı</p>
          </div>
        </body>
        </html>
      `;

      // Create and download PDF
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      // Open in new window for printing/saving as PDF
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 500);
        };
      }
      
      // Also create downloadable HTML file
      const link = document.createElement('a');
      link.href = url;
      link.download = `Cari_Hesap_${athlete.studentName}_${athlete.studentSurname}_${new Date().toISOString().split('T')[0]}.html`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert(`✅ PDF hazırlandı!\n\n📄 ${athlete.studentName} ${athlete.studentSurname} için cari hesap kartı oluşturuldu\n📊 ${entriesWithBalance.length} hareket kronolojik sırayla listelendi\n💰 Güncel bakiye: ₺${entriesWithBalance[entriesWithBalance.length - 1]?.runningBalance.toFixed(2) || '0.00'}\n\n🖨️ Yazdırma penceresi açıldı\n💾 HTML dosyası indirildi`);

    } catch (error) {
      console.error('PDF export error:', error);
      alert('PDF oluşturulurken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    }
  };

  // Process bulk upload with duplicate merging and parent credential generation
  const processBulkUpload = async () => {
    if (!bulkUploadFile) return;

    try {
      const data = await bulkUploadFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false, dateNF: 'dd.mm.yyyy' });
      
      console.log('Processing bulk upload data:', jsonData);
      
      if (jsonData.length === 0) {
        alert('Excel dosyasında işlenecek veri bulunamadı!');
        return;
      }

      // Get existing students
      const existingStudents = JSON.parse(localStorage.getItem('students') || '[]');
      const newStudents = [];
      const mergedStudents = [];
      const createdParentUsers = [];
      let duplicateCount = 0;
      let mergedCount = 0;
      let errorCount = 0;

      for (const row of jsonData) {
        try {
          const studentData = row as any;
          
          // Skip empty rows
          if (!studentData['Öğrenci Adı'] || !studentData['Öğrenci Soyadı']) {
            continue;
          }

          // Parse birth date
          let parsedBirthDate = '';
          const birthDateField = studentData['Doğum Tarihi (DD.MM.YYYY)'] || studentData['Doğum Tarihi (DD/MM/YYYY)'] || studentData['Doğum Tarihi'];
          
          if (birthDateField) {
            try {
              // Handle various date formats
              const dateStr = birthDateField.toString().trim();
              
              // DD.MM.YYYY or DD/MM/YYYY format
              const turkishMatch = dateStr.match(/^(\d{1,2})[\.\/](\d{1,2})[\.\/](\d{2,4})$/);
              if (turkishMatch) {
                let day = parseInt(turkishMatch[1]);
                let month = parseInt(turkishMatch[2]);
                let year = parseInt(turkishMatch[3]);
                
                // Handle 2-digit years
                if (year < 100) {
                  year = year <= 30 ? 2000 + year : 1900 + year;
                }
                
                if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2030) {
                  const testDate = new Date(year, month - 1, day);
                  if (testDate.getFullYear() === year && 
                      testDate.getMonth() === month - 1 && 
                      testDate.getDate() === day) {
                    parsedBirthDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                  }
                }
              }
            } catch (error) {
              console.error('Error parsing birth date:', error);
            }
          }

          // Parse sports branches
          let sportsBranches = [];
          if (studentData['Spor Branşları (virgülle ayırın)']) {
            sportsBranches = studentData['Spor Branşları (virgülle ayırın)']
              .toString()
              .split(',')
              .map((branch: string) => branch.trim())
              .filter((branch: string) => branch.length > 0);
          }

          // Process parent phone number - add +90 prefix if not present
          let parentPhone = studentData['Veli Telefon']?.toString() || '';
          if (parentPhone && !parentPhone.startsWith('+90')) {
            // Remove any existing country codes or formatting
            parentPhone = parentPhone.replace(/^\+?90?/, '').replace(/\D/g, '');
            // Add +90 prefix
            if (parentPhone.length >= 10) {
              parentPhone = '+90' + parentPhone.slice(-10);
            }
          }

          const newStudent = {
            id: Date.now() + Math.random(),
            studentName: studentData['Öğrenci Adı']?.toString() || '',
            studentSurname: studentData['Öğrenci Soyadı']?.toString() || '',
            studentTcNo: studentData['TC Kimlik No']?.toString() || '',
            studentBirthDate: parsedBirthDate,
            studentAge: studentData['Yaş']?.toString() || '',
            studentGender: studentData['Cinsiyet']?.toString() || '',
            sportsBranches: sportsBranches,
            parentName: studentData['Veli Adı']?.toString() || '',
            parentSurname: studentData['Veli Soyadı']?.toString() || '',
            parentTcNo: studentData['Veli TC Kimlik No']?.toString() || '',
            parentPhone: parentPhone,
            parentEmail: studentData['Veli Email']?.toString() || '',
            parentRelation: studentData['Yakınlık Derecesi']?.toString() || 'Veli',
            status: 'Aktif',
            paymentStatus: 'Güncel',
            registrationDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          newStudents.push(newStudent);

          // Generate parent credentials and create parent user
          if (newStudent.parentName && newStudent.parentSurname && newStudent.parentPhone) {
            const credentials = generateParentCredentials(
              newStudent.parentName, 
              newStudent.parentSurname, 
              newStudent.parentPhone
            );
            
            const parentUser = createParentUser(newStudent, credentials);
            createdParentUsers.push({
              athleteName: `${newStudent.studentName} ${newStudent.studentSurname}`,
              parentName: `${newStudent.parentName} ${newStudent.parentSurname}`,
              username: credentials.username,
              password: credentials.password,
              phone: newStudent.parentPhone,
              email: newStudent.parentEmail
            });
          }

        } catch (rowError) {
          console.error('Error processing row:', rowError);
          errorCount++;
        }
      }

      // Combine existing students and new students
      const updatedStudents = [...existingStudents, ...newStudents];

      if (newStudents.length === 0) {
        let message = 'İşlenecek yeni sporcu bulunamadı.';
        if (errorCount > 0) {
          message += ` ${errorCount} satırda hata oluştu.`;
        }
        alert(message);
        return;
      }

      // Save updated students to localStorage
      localStorage.setItem('students', JSON.stringify(updatedStudents));
      
      // Reload athletes to refresh the UI
      loadAthletes(userRole!, currentUser);
      
      let message = `✅ Toplu sporcu yükleme tamamlandı!\n\n`;
      message += `📊 İşlem Özeti:\n`;
      if (newStudents.length > 0) {
        message += `• Yeni eklenen sporcu: ${newStudents.length}\n`;
      }
      if (createdParentUsers.length > 0) {
        message += `• Oluşturulan veli hesabı: ${createdParentUsers.length}\n`;
      }
      if (errorCount > 0) {
        message += `• Hatalı satır: ${errorCount}\n`;
      }
      
      message += `\n🔑 Veli giriş bilgileri oluşturuldu ve "Veli Giriş Bilgileri İndir" butonu ile indirilebilir.`;
      
      alert(message);
      
      setBulkUploadFile(null);
      setIsBulkUploadDialogOpen(false);
    } catch (error) {
      console.error('Error processing bulk upload:', error);
      alert('Dosya işlenirken hata oluştu! Lütfen dosya formatını kontrol edin.\n\nHata: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    }
  };

  return (
    <>
      <Head>
        <title>Sporcular - SportsCRM</title>
        <meta name="description" content="Sporcu yönetimi" />
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
                <Link href={userRole === 'coach' ? '/coach-dashboard' : '/dashboard'} className="text-muted-foreground hover:text-primary">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <Users className="w-6 h-6 text-primary" />
                <h1 className="text-3xl font-bold">Sporcular</h1>
              </div>
              <p className="text-muted-foreground">
                {userRole === 'coach' 
                  ? 'Antrenman gruplarınızdaki sporcuları görüntüleyin' 
                  : 'Sporcu kayıtlarını yönetin'
                }
              </p>
            </div>
            
            {userRole === 'admin' && (
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setIsBulkUploadDialogOpen(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Toplu Yükleme
                </Button>

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Yeni Sporcu
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Yeni Sporcu Kaydı</DialogTitle>
                      <DialogDescription>
                        Veli kayıt formu + sporcu bilgileri aşamasından kayıt yapmamış sporcu eklemek için tüm bilgileri girin
                      </DialogDescription>
                    </DialogHeader>
                    
                    <NewAthleteForm onClose={() => setIsAddDialogOpen(false)} />
                  </DialogContent>
                </Dialog>
              </div>
            )}
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
                    <p className="text-sm font-medium text-muted-foreground">
                      {userRole === 'coach' ? 'Sporcularım' : 'Toplam Sporcu'}
                    </p>
                    <p className="text-2xl font-bold">{athletes.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Aktif Sporcu</p>
                    <p className="text-2xl font-bold">{activeAthletes}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bu Ay Kayıt</p>
                    <p className="text-2xl font-bold">{thisMonthRegistrations}</p>
                  </div>
                  <UserPlus className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            {userRole === 'admin' && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Ödeme Gecikmiş</p>
                      <p className="text-2xl font-bold">
                        {athletes.filter(a => a.paymentStatus === 'Gecikmiş').length}
                      </p>
                    </div>
                    <CreditCard className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Filters */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-col md:flex-row gap-4 flex-1">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input 
                        placeholder="Sporcu veya veli adı ara..." 
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <Select value={selectedSport} onValueChange={setSelectedSport}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Spor Branşı" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm Branşlar</SelectItem>
                        {sports.map(sport => (
                          <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Durum" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tümü</SelectItem>
                        <SelectItem value="Aktif">Aktif</SelectItem>
                        <SelectItem value="Pasif">Pasif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {userRole === 'admin' && (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={exportActiveAthletes}>
                        <Download className="h-4 w-4 mr-2" />
                        Aktif Sporcuları Dışa Aktar
                      </Button>
                      <Button variant="outline" onClick={downloadParentCredentials}>
                        <Key className="h-4 w-4 mr-2" />
                        Veli Giriş Bilgileri İndir
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setInvoiceServiceDescription('Spor Okulu Aidatı');
                        setIsInvoiceExportDialogOpen(true);
                      }}>
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        E-Fatura Dışa Aktar
                      </Button>
                      <Button variant="outline" onClick={() => setIsBulkFeeDialogOpen(true)}>
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Toplu Aidat Girişi
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Athletes Table */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <Card>
              <CardHeader>
                <CardTitle>
                  {userRole === 'coach' ? 'Sporcularım' : 'Sporcu Listesi'} ({filteredAthletes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredAthletes.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => handleSort('athlete')}
                            className="h-auto p-0 font-medium hover:bg-transparent flex items-center space-x-1"
                          >
                            <span>Sporcu</span>
                            {getSortIcon('athlete')}
                          </Button>
                        </TableHead>
                        <TableHead>Doğum Tarihi</TableHead>
                        <TableHead>Yaş</TableHead>
                        <TableHead>Lisans No</TableHead>
                        <TableHead>Branş</TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => handleSort('parent')}
                            className="h-auto p-0 font-medium hover:bg-transparent flex items-center space-x-1"
                          >
                            <span>Veli</span>
                            {getSortIcon('parent')}
                          </Button>
                        </TableHead>
                        <TableHead>İletişim</TableHead>
                        <TableHead>Durum</TableHead>
                        {userRole === 'admin' && <TableHead>Ödeme</TableHead>}
                        <TableHead>İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAthletes.map((athlete, index) => (
                        <TableRow key={athlete.id || index}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-medium flex items-center justify-center overflow-hidden">
                                {athlete.photo ? (
                                  <img 
                                    src={athlete.photo} 
                                    alt={`${athlete.studentName} ${athlete.studentSurname}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  getInitials(athlete.studentName, athlete.studentSurname)
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{athlete.studentName} {athlete.studentSurname}</p>
                                <p className="text-sm text-muted-foreground">
                                  Kayıt: {(() => {
                                    try {
                                      const dateValue = athlete.registrationDate || athlete.createdAt;
                                      if (!dateValue || dateValue === 'Z' || typeof dateValue !== 'string') {
                                        return '-';
                                      }
                                      const date = new Date(dateValue);
                                      if (isNaN(date.getTime())) {
                                        return '-';
                                      }
                                      return date.toLocaleDateString('tr-TR');
                                    } catch (error) {
                                      return '-';
                                    }
                                  })()}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatBirthDate(athlete.studentBirthDate)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">
                              {athlete.studentAge || calculateAge(athlete.studentBirthDate)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {athlete.licenseNumber || '-'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {athlete.sportsBranches?.map((branch: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {branch}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{athlete.parentName} {athlete.parentSurname}</p>
                              <p className="text-sm text-muted-foreground">{athlete.parentRelation || 'Veli'}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1 text-sm">
                                <Phone className="h-3 w-3" />
                                <span>{athlete.parentPhone}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-sm">
                                <Mail className="h-3 w-3" />
                                <span>{athlete.parentEmail}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {athlete.status === 'Pasif' ? (
                              <Badge variant="destructive" className="bg-red-500 text-white">
                                PASİF
                              </Badge>
                            ) : (
                              <Badge variant="default">
                                {athlete.status || 'Aktif'}
                              </Badge>
                            )}
                          </TableCell>
                          {userRole === 'admin' && (
                            <TableCell>
                              <Badge variant={athlete.paymentStatus === 'Güncel' ? 'default' : 'destructive'}>
                                {athlete.paymentStatus || 'Güncel'}
                              </Badge>
                            </TableCell>
                          )}
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => openViewDialog(athlete)}
                                title="Gözlem"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {userRole === 'admin' && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => openAccountDialog(athlete)}
                                    title="Cari Hesap"
                                  >
                                    <Calculator className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => openStatusDialog(athlete)}
                                    title="Aktif/Pasif"
                                  >
                                    {athlete.status === 'Aktif' ? 
                                      <ToggleRight className="h-4 w-4 text-green-600" /> : 
                                      <ToggleLeft className="h-4 w-4 text-gray-400" />
                                    }
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => openEditDialog(athlete)}
                                    title="Düzenleme"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => openDeleteDialog(athlete)}
                                    title="Silme"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {userRole === 'coach' 
                        ? 'Henüz atanmış sporcu bulunmuyor' 
                        : 'Henüz sporcu kaydı bulunmuyor'
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Bulk Upload Dialog */}
          <Dialog open={isBulkUploadDialogOpen} onOpenChange={setIsBulkUploadDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Sporcu Toplu Yükleme</span>
                </DialogTitle>
                <DialogDescription>
                  Excel dosyası ile birden fazla sporcu kaydını sisteme toplu olarak ekleyin
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Template Download */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">1. Şablon İndir</CardTitle>
                    <CardDescription>
                      Önce Excel şablonunu indirin ve sporcu bilgilerini doldurun
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={generateBulkUploadTemplate} variant="outline" className="w-full">
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Excel Şablonunu İndir
                    </Button>
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Şablon Bilgileri:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Kayıt formundaki tüm alanları içerir</li>
                        <li>• Zorunlu alanlar: Öğrenci Adı, Soyadı, TC No, Veli Adı, Soyadı, Telefon, Email</li>
                        <li>• TC Kimlik numaraları 11 haneli olmalıdır</li>
                        <li>• Spor branşları virgülle ayrılmalıdır (örn: Basketbol, Futbol)</li>
                        <li>• Tarih formatı: DD.MM.YYYY (kısa tarih formatı)</li>
                        <li>• Her veli için kullanıcı adı ve şifre oluşturulur</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* File Upload */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">2. Dosya Yükle</CardTitle>
                    <CardDescription>
                      Doldurduğunuz Excel dosyasını seçin
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setBulkUploadFile(file);
                          }}
                          className="hidden"
                          id="bulk-upload-file"
                        />
                        <label htmlFor="bulk-upload-file" className="cursor-pointer">
                          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-lg font-medium text-gray-900 mb-2">
                            Excel dosyasını seçin
                          </p>
                          <p className="text-sm text-gray-500">
                            .xlsx veya .xls formatında olmalıdır
                          </p>
                        </label>
                      </div>

                      {bulkUploadFile && (
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <FileSpreadsheet className="h-5 w-5 text-green-600" />
                            <span className="text-sm font-medium text-green-900">
                              {bulkUploadFile.name}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setBulkUploadFile(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      {bulkUploadFile && (
                        <Button 
                          onClick={processBulkUpload}
                          className="w-full"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Dosyayı İşle ve Veli Hesapları Oluştur
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsBulkUploadDialogOpen(false);
                    setBulkUploadFile(null);
                  }}
                >
                  Kapat
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* E-Invoice Export Dialog */}
          <Dialog open={isInvoiceExportDialogOpen} onOpenChange={setIsInvoiceExportDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  <span>E-Fatura Dışa Aktarma</span>
                </DialogTitle>
                <DialogDescription>
                  Toplu aidat girişi yapılan dönem için e-arşiv fatura formatında Excel dosyası oluşturun
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Bu işlem seçilen dönemde toplu aidat girişi yapılmış sporcular için e-arşiv fatura formatında Excel dosyası oluşturacaktır.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="invoiceMonth">Hangi Tarihte Girilen Toplu Aidat İçin Fatura Kesilecek?</Label>
                  <Input
                    id="invoiceMonth"
                    type="month"
                    value={selectedInvoiceMonth}
                    onChange={(e) => setSelectedInvoiceMonth(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Bu tarihte toplu aidat girişi yapılmış sporcular için fatura oluşturulacak
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="serviceDescription">Mal/Hizmet Adı</Label>
                  <Input
                    id="serviceDescription"
                    placeholder="Örn: Spor Okulu Aidatı Haziran"
                    value={invoiceServiceDescription}
                    onChange={(e) => setInvoiceServiceDescription(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Toplu aidat yüklemesinden gelen bilgi (Örn: "Spor Okulu Aidatı Haziran")
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unitCode">Birim Kodu</Label>
                    <Select value={invoiceUnitCode} onValueChange={setInvoiceUnitCode}>
                      <SelectTrigger>
                        <SelectValue placeholder="Birim seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ay">Ay</SelectItem>
                        <SelectItem value="Adet">Adet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vatRate">KDV Oranı (%)</Label>
                    <Select value={invoiceVatRate} onValueChange={setInvoiceVatRate}>
                      <SelectTrigger>
                        <SelectValue placeholder="KDV oranı seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">E-Arşiv Fatura Formatı:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>Alıcı VKN/TCKN:</strong> Veli TC Kimlik Numarası</li>
                    <li>• <strong>Alıcı Adı/Soyadı:</strong> Veli Adı ve Soyadı</li>
                    <li>• <strong>Alıcı Ülke/Şehir/İlçe:</strong> Türkiye/Kırklareli/Lüleburgaz</li>
                    <li>• <strong>Alıcı Email:</strong> Veli Email Adresi</li>
                    <li>• <strong>Mal/Hizmet Adı:</strong> {invoiceServiceDescription || 'Belirtilmedi'}</li>
                    <li>• <strong>Birim Fiyat:</strong> KDV Hariç (Toplu aidat girişinden)</li>
                    <li>• <strong>KDV Oranı:</strong> %{invoiceVatRate}</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Önizleme:</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• <strong>Dönem:</strong> {new Date(selectedInvoiceMonth + '-01').toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}</li>
                    <li>• <strong>Aktif Sporcu Sayısı:</strong> {activeAthletes}</li>
                    <li>• <strong>Dosya Formatı:</strong> E-Arşiv Excel (.xlsx)</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setIsInvoiceExportDialogOpen(false)}
                >
                  İptal
                </Button>
                <Button 
                  onClick={generateEInvoiceExport}
                  disabled={!selectedInvoiceMonth || !invoiceServiceDescription}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  E-Arşiv Fatura Excel Dosyası Oluştur
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Bulk Fee Entry Dialog */}
          <Dialog open={isBulkFeeDialogOpen} onOpenChange={setIsBulkFeeDialogOpen}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  <span>Toplu Aidat Girişi</span>
                </DialogTitle>
                <DialogDescription>
                  Excel dosyası ile toplu aidat girişi yapın veya manuel olarak ödeme kayıtları oluşturun
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Method Selection Tabs */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                  <Button
                    variant={bulkPayments.length === 0 ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setBulkPayments([])}
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Excel Upload
                  </Button>
                  <Button
                    variant={bulkPayments.length > 0 ? "default" : "ghost"}
                    size="sm"
                    onClick={addBulkPaymentEntry}
                    className="flex-1"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Manuel Giriş
                  </Button>
                </div>

                {/* Excel Upload Section */}
                {bulkPayments.length === 0 && (
                  <>
                    {/* Template Download */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">1. Excel Şablonunu İndir</CardTitle>
                        <CardDescription>
                          Önce şablonu indirin ve aidat bilgilerini doldurun
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button onClick={generateBulkFeeTemplate} variant="outline" className="w-full">
                          <FileSpreadsheet className="h-4 w-4 mr-2" />
                          Toplu Aidat Şablonunu İndir
                        </Button>
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">Şablon Özellikleri:</h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• <strong>Tarih alanı:</strong> DD/MM/YYYY formatında (her sporcu için farklı tarih girilebilir)</li>
                            <li>• <strong>Sporcu Adı Soyadı:</strong> Tam ad ve soyad</li>
                            <li>• <strong>Açıklama:</strong> Aidat açıklaması (örn: "Haziran Aidatı")</li>
                            <li>• <strong>Tutar:</strong> KDV hariç tutar</li>
                            <li>• <strong>KDV Oranı:</strong> Varsayılan %10</li>
                            <li>• <strong>Toplam:</strong> Otomatik hesaplanır</li>
                            <li>• <strong>Birim Kod:</strong> Varsayılan "Ay"</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>

                    {/* File Upload */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">2. Doldurulmuş Excel Dosyasını Yükle</CardTitle>
                        <CardDescription>
                          Şablonu doldurduktan sonra buradan yükleyin
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <input
                              type="file"
                              accept=".xlsx,.xls"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setBulkFeeUploadFile(file);
                              }}
                              className="hidden"
                              id="bulk-fee-upload-file"
                            />
                            <label htmlFor="bulk-fee-upload-file" className="cursor-pointer">
                              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-lg font-medium text-gray-900 mb-2">
                                Excel dosyasını seçin
                              </p>
                              <p className="text-sm text-gray-500">
                                .xlsx veya .xls formatında olmalıdır
                              </p>
                            </label>
                          </div>

                          {bulkFeeUploadFile && (
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                                <span className="text-sm font-medium text-green-900">
                                  {bulkFeeUploadFile.name}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setBulkFeeUploadFile(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}

                          {bulkFeeUploadFile && (
                            <div className="space-y-4">
                              <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                  Excel dosyasındaki tarih bilgileri kullanılacak. Her sporcu için farklı tarih girişi yapılabilir.
                                </AlertDescription>
                              </Alert>
                              
                              <Button 
                                onClick={processBulkFeeEntry}
                                className="w-full"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Excel Dosyasını İşle ve Aidat Kayıtları Oluştur
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Manual Entry Section */}
                {bulkPayments.length > 0 && (
                  <>
                    {/* Payment Date Selection */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Ödeme Tarihi</CardTitle>
                        <CardDescription>
                          Tüm ödemeler için geçerli olacak tarihi seçin (DD/MM/YYYY formatında)
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="max-w-sm">
                          <Label htmlFor="bulkPaymentDate">Ödeme Tarihi</Label>
                          <Input
                            id="bulkPaymentDate"
                            type="date"
                            value={bulkPaymentDate}
                            onChange={(e) => setBulkPaymentDate(e.target.value)}
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            Seçilen tarih: {bulkPaymentDate ? new Date(bulkPaymentDate).toLocaleDateString('tr-TR') : 'Seçilmedi'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Bulk Payment Entries */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Ödeme Kayıtları</CardTitle>
                        <CardDescription>
                          Her sporcu için ödeme bilgilerini girin
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {bulkPayments.map((entry, index) => (
                            <Card key={entry.id} className={`border ${entry.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                              <CardContent className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                  <div>
                                    <Label>Sporcu</Label>
                                    <Select 
                                      value={entry.athleteId} 
                                      onValueChange={(value) => updateBulkPaymentEntry(entry.id, 'athleteId', value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Sporcu seçin" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {athletes.map(athlete => (
                                          <SelectItem key={athlete.id} value={athlete.id.toString()}>
                                            <div className="flex flex-col">
                                              <span className="font-medium">{athlete.studentName} {athlete.studentSurname}</span>
                                              <span className="text-xs text-muted-foreground">
                                                {athlete.parentName} {athlete.parentSurname}
                                              </span>
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div>
                                    <Label>Tutar (₺)</Label>
                                    <Input
                                      type="number"
                                      placeholder="350"
                                      value={entry.amount}
                                      onChange={(e) => updateBulkPaymentEntry(entry.id, 'amount', e.target.value)}
                                    />
                                  </div>

                                  <div>
                                    <Label>Ödeme Yöntemi</Label>
                                    <Select 
                                      value={entry.method} 
                                      onValueChange={(value) => updateBulkPaymentEntry(entry.id, 'method', value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {paymentMethods.map(method => (
                                          <SelectItem key={method} value={method}>{method}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div>
                                    <Label>Açıklama (Opsiyonel)</Label>
                                    <Input
                                      placeholder="Ödeme açıklaması"
                                      value={entry.description}
                                      onChange={(e) => updateBulkPaymentEntry(entry.id, 'description', e.target.value)}
                                    />
                                  </div>
                                </div>

                                <div className="flex justify-between items-center mt-4">
                                  <div className="text-sm text-muted-foreground">
                                    {entry.athleteName && (
                                      <span>
                                        <strong>{entry.athleteName}</strong> - {entry.parentName} - {entry.sport}
                                      </span>
                                    )}
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeBulkPaymentEntry(entry.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}

                          <Button
                            variant="outline"
                            onClick={addBulkPaymentEntry}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Yeni Ödeme Ekle
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Summary */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Özet</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Toplam Kayıt</p>
                            <p className="text-2xl font-bold">{bulkPayments.length}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Geçerli Kayıt</p>
                            <p className="text-2xl font-bold text-green-600">
                              {bulkPayments.filter(entry => entry.isValid).length}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Toplam Tutar</p>
                            <p className="text-2xl font-bold">
                              ₺{bulkPayments
                                .filter(entry => entry.isValid)
                                .reduce((sum, entry) => sum + parseFloat(entry.amount || '0'), 0)
                                .toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Seçilen Tarih:</strong> {bulkPaymentDate ? new Date(bulkPaymentDate).toLocaleDateString('tr-TR') : 'Tarih seçilmedi'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => {
                  setIsBulkFeeDialogOpen(false);
                  setBulkPayments([]);
                  setBulkFeeUploadFile(null);
                }}>
                  İptal
                </Button>
                {bulkPayments.length > 0 && (
                  <Button 
                    onClick={saveBulkPayments}
                    disabled={bulkPayments.filter(entry => entry.isValid).length === 0}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {bulkPayments.filter(entry => entry.isValid).length} Ödeme Kaydet
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Bulk Payment Dialog */}
          <Dialog open={isEditBulkDialogOpen} onOpenChange={setIsEditBulkDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Toplu Ödeme Düzenle</DialogTitle>
                <DialogDescription>
                  Toplu ödeme kaydını düzenleyin
                </DialogDescription>
              </DialogHeader>

              {editingBulkPayment && (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="editAthlete">Sporcu</Label>
                    <Select 
                      value={editingBulkPayment.athleteId} 
                      onValueChange={(value) => setEditingBulkPayment(prev => ({ ...prev, athleteId: value }))}
                    >
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
                    <Label htmlFor="editAmount">Tutar (₺)</Label>
                    <Input
                      id="editAmount"
                      type="number"
                      placeholder="350"
                      value={editingBulkPayment.amount}
                      onChange={(e) => setEditingBulkPayment(prev => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editMethod">Ödeme Yöntemi</Label>
                    <Select 
                      value={editingBulkPayment.method} 
                      onValueChange={(value) => setEditingBulkPayment(prev => ({ ...prev, method: value }))}
                    >
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
                    <Label htmlFor="editPaymentDate">Ödeme Tarihi</Label>
                    <Input
                      id="editPaymentDate"
                      type="date"
                      value={editingBulkPayment.paymentDate}
                      onChange={(e) => setEditingBulkPayment(prev => ({ ...prev, paymentDate: e.target.value }))}
                    />
                    <p className="text-sm text-muted-foreground">
                      Seçilen tarih: {editingBulkPayment.paymentDate ? new Date(editingBulkPayment.paymentDate).toLocaleDateString('tr-TR') : 'Seçilmedi'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editDescription">Açıklama (Opsiyonel)</Label>
                    <Input
                      id="editDescription"
                      placeholder="Ödeme açıklaması"
                      value={editingBulkPayment.description}
                      onChange={(e) => setEditingBulkPayment(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditBulkDialogOpen(false)}>
                  İptal
                </Button>
                <Button onClick={saveEditedBulkPayment}>
                  Güncelle
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* View Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Sporcu Detayları</span>
                </DialogTitle>
              </DialogHeader>
              
              {selectedAthleteForView && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-full bg-primary/10 text-primary font-medium flex items-center justify-center overflow-hidden">
                      {selectedAthleteForView.photo ? (
                        <img 
                          src={selectedAthleteForView.photo} 
                          alt={`${selectedAthleteForView.studentName} ${selectedAthleteForView.studentSurname}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getInitials(selectedAthleteForView.studentName, selectedAthleteForView.studentSurname)
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">
                        {selectedAthleteForView.studentName} {selectedAthleteForView.studentSurname}
                      </h3>
                      <p className="text-muted-foreground">
                        Kayıt Tarihi: {new Date(selectedAthleteForView.registrationDate || selectedAthleteForView.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Sporcu Bilgileri</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">TC Kimlik No</Label>
                          <p className="font-medium">{selectedAthleteForView.studentTcNo || '-'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Doğum Tarihi</Label>
                          <p className="font-medium">{formatBirthDate(selectedAthleteForView.studentBirthDate)}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Yaş</Label>
                          <p className="font-medium">{selectedAthleteForView.studentAge || calculateAge(selectedAthleteForView.studentBirthDate)}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Cinsiyet</Label>
                          <p className="font-medium">{selectedAthleteForView.studentGender || '-'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Lisans Numarası</Label>
                          <p className="font-medium">{selectedAthleteForView.licenseNumber || '-'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Spor Branşları</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedAthleteForView.sportsBranches?.map((branch: string, idx: number) => (
                              <Badge key={idx} variant="outline">{branch}</Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Veli Bilgileri</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Ad Soyad</Label>
                          <p className="font-medium">{selectedAthleteForView.parentName} {selectedAthleteForView.parentSurname}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">TC Kimlik No</Label>
                          <p className="font-medium">{selectedAthleteForView.parentTcNo || '-'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Telefon</Label>
                          <p className="font-medium">{selectedAthleteForView.parentPhone}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                          <p className="font-medium">{selectedAthleteForView.parentEmail}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Yakınlık</Label>
                          <p className="font-medium">{selectedAthleteForView.parentRelation || 'Veli'}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Kapat
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Edit className="h-5 w-5" />
                  <span>Sporcu Düzenle</span>
                </DialogTitle>
              </DialogHeader>
              
              {selectedAthleteForEdit && (
                <NewAthleteForm 
                  athlete={selectedAthleteForEdit}
                  onClose={() => {
                    setIsEditDialogOpen(false);
                    setSelectedAthleteForEdit(null);
                    loadAthletes(userRole!, currentUser);
                  }}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* Delete Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Trash2 className="h-5 w-5 text-red-500" />
                  <span>Sporcu Sil</span>
                </DialogTitle>
                <DialogDescription>
                  Bu işlem geri alınamaz. Sporcu kaydı ve tüm ilişkili veriler silinecektir.
                </DialogDescription>
              </DialogHeader>
              
              {selectedAthleteForDelete && (
                <div className="py-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{selectedAthleteForDelete.studentName} {selectedAthleteForDelete.studentSurname}</strong> adlı sporcuyu silmek istediğinizden emin misiniz?
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  İptal
                </Button>
                <Button variant="destructive" onClick={deleteAthlete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Sil
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Status Change Dialog */}
          <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <ToggleRight className="h-5 w-5" />
                  <span>Sporcu Durumu Değiştir</span>
                </DialogTitle>
                <DialogDescription>
                  Sporcunun aktif/pasif durumunu değiştirin
                </DialogDescription>
              </DialogHeader>
              
              {selectedAthleteForStatus && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium">
                      {selectedAthleteForStatus.studentName} {selectedAthleteForStatus.studentSurname}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Mevcut Durum: <Badge variant={selectedAthleteForStatus.status === 'Aktif' ? 'default' : 'secondary'}>
                        {selectedAthleteForStatus.status || 'Aktif'}
                      </Badge>
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => changeAthleteStatus('Aktif')}
                      disabled={selectedAthleteForStatus.status === 'Aktif'}
                    >
                      <ToggleRight className="h-4 w-4 mr-2 text-green-600" />
                      Aktif Yap
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => changeAthleteStatus('Pasif')}
                      disabled={selectedAthleteForStatus.status === 'Pasif'}
                    >
                      <ToggleLeft className="h-4 w-4 mr-2 text-gray-400" />
                      Pasif Yap
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                  Kapat
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Account Dialog */}
          <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5" />
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
                          ₺{getTotalBalance().toFixed(2)}
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
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
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

                {/* Account Entries Table - FIXED: Chronological sorting */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Cari Hesap Hareketleri</CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => exportAccountToPDF(selectedAthlete, accountEntries)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        PDF Dışa Aktar
                      </Button>
                    </div>
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
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {/* FIXED: Sort chronologically by date instead of grouping by type */}
                          {accountEntries
                            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                            .map((entry, index, sortedEntries) => {
                              // Calculate running balance chronologically
                              const runningBalance = sortedEntries.slice(0, index + 1).reduce((balance, e) => {
                                return e.type === 'debit' 
                                  ? balance + e.amountIncludingVat 
                                  : balance - e.amountIncludingVat;
                              }, 0);

                              return (
                                <TableRow key={entry.id}>
                                  <TableCell>{new Date(entry.date).toLocaleDateString('tr-TR')}</TableCell>
                                  <TableCell>{new Date(entry.month + '-01').toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}</TableCell>
                                  <TableCell>{entry.description}</TableCell>
                                  <TableCell>
                                    <Badge variant={entry.type === 'debit' ? 'destructive' : 'default'}>
                                      {entry.type === 'debit' ? 'Borç' : 'Alacak'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>₺{entry.amountExcludingVat.toFixed(2)}</TableCell>
                                  <TableCell>₺{entry.vatAmount.toFixed(2)} (%{entry.vatRate})</TableCell>
                                  <TableCell className={entry.type === 'debit' ? 'text-red-600' : 'text-green-600'}>
                                    {entry.type === 'debit' ? '+' : '-'}₺{entry.amountIncludingVat.toFixed(2)}
                                  </TableCell>
                                  <TableCell className={`font-medium ${runningBalance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    ₺{runningBalance.toFixed(2)}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8">
                        <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
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
        </div>
      </div>
    </>
  );
}