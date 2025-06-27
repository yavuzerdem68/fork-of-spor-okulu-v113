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

const sports = [
  "Basketbol", "Hentbol", "Yüzme", "Akıl ve Zeka Oyunları", "Satranç", "Futbol", "Voleybol",
  "Tenis", "Badminton", "Masa Tenisi", "Atletizm", "Jimnastik", "Karate", "Taekwondo",
  "Judo", "Boks", "Güreş", "Halter", "Bisiklet", "Kayak", "Buz Pateni", "Eskrim", "Hareket Eğitimi"
];

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
  }, [router]);

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
    const regDate = new Date(a.registrationDate || a.createdAt);
    const thisMonth = new Date();
    return regDate.getMonth() === thisMonth.getMonth() && regDate.getFullYear() === thisMonth.getFullYear();
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
    const vatAmount = (amountExcluding * vatRate) / 100;
    const amountIncluding = amountExcluding + vatAmount;

    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      month: newEntry.month,
      description: newEntry.description,
      amountExcludingVat: amountExcluding,
      vatRate: vatRate,
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
    const vatAmount = (excluding * rate) / 100;
    const including = excluding + vatAmount;
    
    setNewEntry(prev => ({
      ...prev,
      amountExcludingVat: excludingVat,
      vatRate: vatRate,
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

  // Generate bulk fee template
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
      'Birim Kod': 'Ay'
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
      { wch: 12 }  // Birim Kod
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
    
    alert(`${activeAthletesList.length} sporcu için toplu aidat şablonu oluşturuldu! (${fileName})\n\nŞablonu doldurup tekrar yükleyebilirsiniz.`);
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

  // Download parent credentials as text file
  const downloadParentCredentials = () => {
    // Get fresh data from localStorage to ensure we have the latest information
    const allStudents = JSON.parse(localStorage.getItem('students') || '[]');
    const parentUsers = JSON.parse(localStorage.getItem('parentUsers') || '[]');
    
    if (parentUsers.length === 0) {
      if (allStudents.length === 0) {
        alert('Henüz sisteme sporcu kaydı yapılmamış!\n\nÖnce sporcu kayıtları oluşturun, ardından veli hesapları otomatik olarak oluşturulacaktır.');
        return;
      } else {
        // Offer to create parent accounts for existing athletes
        const shouldCreate = confirm(
          `Sistemde ${allStudents.length} sporcu kaydı var ancak henüz veli hesabı oluşturulmamış.\n\n` +
          'Mevcut sporcular için veli hesapları oluşturulsun mu?\n\n' +
          '✅ Evet: Tüm sporcular için veli hesapları oluşturulacak\n' +
          '❌ Hayır: İşlem iptal edilecek'
        );
        
        if (!shouldCreate) {
          return;
        }
        
        // Create parent accounts for all existing athletes
        let createdCount = 0;
        const createdParentUsers = [];
        
        for (const athlete of allStudents) {
          if (athlete.parentName && athlete.parentSurname && athlete.parentPhone) {
            try {
              const credentials = generateParentCredentials(
                athlete.parentName, 
                athlete.parentSurname, 
                athlete.parentPhone
              );
              
              const parentUser = createParentUser(athlete, credentials);
              createdParentUsers.push({
                athleteName: `${athlete.studentName} ${athlete.studentSurname}`,
                parentName: `${athlete.parentName} ${athlete.parentSurname}`,
                username: credentials.username,
                password: credentials.password,
                phone: athlete.parentPhone,
                email: athlete.parentEmail
              });
              createdCount++;
            } catch (error) {
              console.error('Error creating parent account for athlete:', athlete.studentName, error);
            }
          }
        }
        
        if (createdCount === 0) {
          alert('Veli hesabı oluşturulamadı!\n\nSporcuların veli bilgileri (ad, soyad, telefon) eksik olabilir.');
          return;
        }
        
        alert(`✅ ${createdCount} veli hesabı başarıyla oluşturuldu!\n\nŞimdi veli giriş bilgilerini indirebilirsiniz.`);
        
        // Continue with the download process
        const updatedParentUsers = JSON.parse(localStorage.getItem('parentUsers') || '[]');
        if (updatedParentUsers.length === 0) {
          alert('Veli hesapları oluşturulmasına rağmen bir hata oluştu. Lütfen tekrar deneyin.');
          return;
        }
      }
    }

    // Enhanced parent-athlete matching with more precise algorithms
    const updatedParentUsers = parentUsers.map((parent: any) => {
      // Find athletes that match this parent with improved matching logic
      const matchingAthletes = allStudents.filter((athlete: any) => {
        // Priority 1: Exact phone number match (most reliable)
        if (athlete.parentPhone && parent.phone) {
          const athletePhone = athlete.parentPhone.replace(/\D/g, '');
          const parentPhone = parent.phone.replace(/\D/g, '');
          
          // Handle different phone formats (+90, 0, direct)
          const normalizePhone = (phone: string) => {
            // Remove all non-digits
            let cleaned = phone.replace(/\D/g, '');
            // Remove leading 90 if present
            if (cleaned.startsWith('90') && cleaned.length === 12) {
              cleaned = cleaned.substring(2);
            }
            // Remove leading 0 if present
            if (cleaned.startsWith('0') && cleaned.length === 11) {
              cleaned = cleaned.substring(1);
            }
            return cleaned;
          };
          
          const normalizedAthletePhone = normalizePhone(athletePhone);
          const normalizedParentPhone = normalizePhone(parentPhone);
          
          if (normalizedAthletePhone === normalizedParentPhone && normalizedAthletePhone.length === 10) {
            return true;
          }
        }
        
        // Priority 2: Exact email match (case-insensitive)
        if (athlete.parentEmail && parent.email) {
          const athleteEmail = athlete.parentEmail.toLowerCase().trim();
          const parentEmail = parent.email.toLowerCase().trim();
          
          if (athleteEmail === parentEmail && athleteEmail.length > 5) {
            return true;
          }
        }
        
        // Priority 3: Combined name and phone partial match (for edge cases)
        if (athlete.parentName && athlete.parentSurname && parent.firstName && parent.lastName && 
            athlete.parentPhone && parent.phone) {
          
          const athleteFullName = `${athlete.parentName} ${athlete.parentSurname}`.toLowerCase().trim();
          const parentFullName = `${parent.firstName} ${parent.lastName}`.toLowerCase().trim();
          
          // Check if names are very similar (exact match)
          if (athleteFullName === parentFullName) {
            // Also check if phone numbers are similar (last 7 digits)
            const athletePhoneLast7 = athlete.parentPhone.replace(/\D/g, '').slice(-7);
            const parentPhoneLast7 = parent.phone.replace(/\D/g, '').slice(-7);
            
            if (athletePhoneLast7 === parentPhoneLast7 && athletePhoneLast7.length === 7) {
              return true;
            }
          }
        }
        
        return false;
      });

      if (matchingAthletes.length > 0) {
        // Update parent information with the latest athlete data from the first match
        const firstMatch = matchingAthletes[0];
        return {
          ...parent,
          firstName: firstMatch.parentName || parent.firstName,
          lastName: firstMatch.parentSurname || parent.lastName,
          phone: firstMatch.parentPhone || parent.phone,
          email: firstMatch.parentEmail || parent.email,
          linkedAthletes: matchingAthletes.map(a => a.id),
          updatedAt: new Date().toISOString()
        };
      }
      
      // If no matches found, keep the parent as is but clear linkedAthletes to avoid false matches
      return {
        ...parent,
        linkedAthletes: [],
        updatedAt: new Date().toISOString()
      };
    });

    // Filter out parents with no linked athletes to avoid confusion
    const activeParentUsers = updatedParentUsers.filter(parent => 
      parent.linkedAthletes && parent.linkedAthletes.length > 0
    );

    // Save the updated parent users back to localStorage
    localStorage.setItem('parentUsers', JSON.stringify(updatedParentUsers));

    if (activeParentUsers.length === 0) {
      alert('Aktif sporcu ile eşleşen veli hesabı bulunamadı!\n\nLütfen veli hesaplarının telefon numarası ve email adreslerinin sporcu kayıtlarıyla uyumlu olduğundan emin olun.');
      return;
    }

    const textContent = [
      '=== VELİ KULLANICI ADI VE ŞİFRELERİ ===',
      `Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}`,
      `Toplam Aktif Veli Sayısı: ${activeParentUsers.length}`,
      '',
      '--- DETAYLAR ---'
    ];

    activeParentUsers.forEach((parent: any, index: number) => {
      // Find all linked athletes for this parent using the updated linkedAthletes array
      const linkedAthletes = allStudents.filter(athlete => 
        parent.linkedAthletes && parent.linkedAthletes.includes(athlete.id)
      );
      
      const athleteNames = linkedAthletes.length > 0 ? 
        linkedAthletes.map(athlete => `${athlete.studentName} ${athlete.studentSurname}`).join(', ') : 
        'Eşleşme Hatası';

      textContent.push(
        `${index + 1}. ${parent.firstName} ${parent.lastName} (${athleteNames})`,
        `   Telefon: ${parent.phone}`,
        `   Email: ${parent.email}`,
        `   Kullanıcı Adı: ${parent.username}`,
        `   Şifre: ${parent.password}`,
        `   Bağlı Sporcu Sayısı: ${linkedAthletes.length}`,
        ''
      );
    });

    textContent.push(
      '--- NOTLAR ---',
      '• Bu liste sadece aktif sporcu ile eşleşen veli hesaplarını içerir',
      '• Eşleştirme telefon numarası ve email adresi ile yapılır',
      '• Veli bilgileri güncel sporcu verileriyle otomatik senkronize edilmiştir',
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

    alert(`${activeParentUsers.length} aktif veli hesabının giriş bilgileri text dosyası olarak indirildi!\n\n✅ Veli-sporcu eşleştirmesi doğrulandı\n📱 Telefon numarası ve email ile eşleştirme yapıldı\n🔄 Veli bilgileri güncel sporcu verileriyle senkronize edildi`);
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

  // Generate E-Invoice Export
  const generateEInvoiceExport = () => {
    try {
      // Get active athletes
      const activeAthletesList = athletes.filter(athlete => athlete.status === 'Aktif' || !athlete.status);
      
      if (activeAthletesList.length === 0) {
        alert('E-fatura oluşturulacak aktif sporcu bulunamadı!');
        return;
      }

      // Get bulk fee entries for the selected month to determine unit price
      const selectedMonthStr = selectedInvoiceMonth;
      let unitPrice = '350.00'; // Default price
      
      // Try to find unit price from bulk fee entries for this month
      activeAthletesList.forEach(athlete => {
        const accountEntries = JSON.parse(localStorage.getItem(`account_${athlete.id}`) || '[]');
        const monthEntry = accountEntries.find((entry: any) => 
          entry.month === selectedMonthStr && 
          entry.type === 'debit' && 
          entry.description.toLowerCase().includes('aidat')
        );
        if (monthEntry && monthEntry.amountExcludingVat) {
          unitPrice = monthEntry.amountExcludingVat.toString();
        }
      });

      const invoiceData: any[] = [];

      activeAthletesList.forEach((athlete, index) => {
        // Create the complete e-invoice row with all required columns in exact order
        const invoiceRow = {
          'Id': '',
          'Fatura Numarası': '',
          'ETTN': '',
          'Fatura Tarihi': '',
          'Fatura Saati': '',
          'Fatura Tipi': '',
          'Fatura Profili': '',
          'Döviz Kodu': '',
          'Alıcı VKN/TCKN': athlete.parentTcNo || '',
          'Alıcı Ünvan/Adı | Yabancı Alıcı Ünvan/Adı | Turist Adı': athlete.parentName || '',
          'Alıcı Soyadı | Yabancı Alıcı Soyadı | Turist Soyadı ': athlete.parentSurname || '',
          'Alıcı Ülke | Yabancı Ülke | Turist Ülke': 'Türkiye',
          'Alıcı Şehir | Yabancı Şehir | Turist Şehir': 'Kırklareli',
          'Alıcı İlçe | Yabancı İlçe | Turist İlçe': 'Lüleburgaz',
          'Alıcı Sokak | Yabancı Sokak | Turist Sokak': '',
          'Alıcı Bina No | Yabancı Bina No | Turist Bina No': '',
          'Alıcı Kapı No | Yabancı Kapı No | Turist Kapı No': '',
          'Alıcı Eposta | Yabancı Eposta | Turist Eposta': athlete.parentEmail || '',
          'Gönderim Türü': '',
          'Satışın Yapıldığı Web Sitesi': '',
          'Ödeme Tarihi': '',
          'Ödeme Türü': '',
          'Mal/Hizmet Adı': invoiceServiceDescription,
          'Miktar': '1',
          'Birim Kodu': invoiceUnitCode,
          ' Birim Fiyat ': unitPrice,
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
      alert(`E-arşiv fatura Excel dosyası oluşturuldu!\n\n✅ ${activeAthletesList.length} sporcu için fatura kaydı\n📅 Dönem: ${monthName}\n🏷️ Hizmet: ${invoiceServiceDescription}\n💰 Birim Fiyat: ₺${unitPrice} (KDV Hariç)\n💰 KDV Oranı: %${invoiceVatRate}\n📁 Dosya: ${fileName}`);
      
      // Close dialog
      setIsInvoiceExportDialogOpen(false);
      
    } catch (error) {
      console.error('E-fatura oluşturma hatası:', error);
      alert('E-fatura oluşturulurken bir hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    }
  };

  // Process bulk fee entry
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
      const currentMonth = new Date().toISOString().slice(0, 7);

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

          // Calculate VAT
          const vatAmount = (amountExcludingVat * vatRate) / 100;
          const amountIncludingVat = amountExcludingVat + vatAmount;

          // Create account entry
          const entry = {
            id: Date.now() + Math.random(),
            date: new Date().toISOString(),
            month: currentMonth,
            description: description,
            amountExcludingVat: amountExcludingVat,
            vatRate: vatRate,
            vatAmount: vatAmount,
            amountIncludingVat: amountIncludingVat,
            unitCode: unitCode,
            type: 'debit'
          };

          // Save to athlete's account
          const existingEntries = JSON.parse(localStorage.getItem(`account_${athlete.id}`) || '[]');
          const updatedEntries = [...existingEntries, entry];
          localStorage.setItem(`account_${athlete.id}`, JSON.stringify(updatedEntries));

          processedCount++;

        } catch (rowError) {
          console.error('Error processing fee row:', rowError);
          errorCount++;
        }
      }

      if (processedCount === 0) {
        alert('İşlenecek geçerli aidat kaydı bulunamadı!');
        return;
      }

      let message = `✅ Toplu aidat girişi tamamlandı!\n\n`;
      message += `📊 İşlem Özeti:\n`;
      message += `• İşlenen aidat kaydı: ${processedCount}\n`;
      if (errorCount > 0) {
        message += `• Hatalı kayıt: ${errorCount}\n`;
      }
      message += `• Dönem: ${new Date(currentMonth + '-01').toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}`;
      
      alert(message);
      
      setBulkFeeUploadFile(null);
      setIsBulkFeeDialogOpen(false);
    } catch (error) {
      console.error('Error processing bulk fee entry:', error);
      alert('Dosya işlenirken hata oluştu! Lütfen dosya formatını kontrol edin.\n\nHata: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
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

          // Simplified and robust birth date parsing for Turkish format (DD/MM/YYYY or DD.MM.YYYY)
          let parsedBirthDate = '';
          const birthDateField = studentData['Doğum Tarihi (DD.MM.YYYY)'] || studentData['Doğum Tarihi (DD/MM/YYYY)'] || studentData['Doğum Tarihi'];
          
          console.log('Raw birth date field:', birthDateField, 'Type:', typeof birthDateField);
          
          if (birthDateField !== undefined && birthDateField !== null && birthDateField !== '') {
            try {
              // Handle Excel serial date numbers first
              if (typeof birthDateField === 'number' && birthDateField > 25569) {
                console.log('Excel serial number detected:', birthDateField);
                
                // Convert Excel serial number to JavaScript Date
                // Excel serial date: days since 1900-01-01 (accounting for Excel's leap year bug)
                const excelDate = new Date((birthDateField - 25569) * 86400 * 1000);
                
                if (!isNaN(excelDate.getTime()) && excelDate.getFullYear() >= 1900 && excelDate.getFullYear() <= 2030) {
                  const year = excelDate.getFullYear();
                  const month = (excelDate.getMonth() + 1).toString().padStart(2, '0');
                  const day = excelDate.getDate().toString().padStart(2, '0');
                  parsedBirthDate = `${year}-${month}-${day}`;
                  console.log('Excel serial converted to:', parsedBirthDate);
                }
              }
              // Handle string dates
              else {
                const birthDateStr = birthDateField.toString().trim();
                console.log('Processing date string:', birthDateStr);
                
                if (birthDateStr && birthDateStr !== '0' && birthDateStr !== 'undefined') {
                  // Turkish format: DD/MM/YYYY or DD.MM.YYYY
                  const turkishMatch = birthDateStr.match(/^(\d{1,2})[\.\/](\d{1,2})[\.\/](\d{2,4})$/);
                  
                  if (turkishMatch) {
                    let day = parseInt(turkishMatch[1]);
                    let month = parseInt(turkishMatch[2]);
                    let year = parseInt(turkishMatch[3]);
                    
                    console.log('Turkish format parsed - Day:', day, 'Month:', month, 'Year:', year);
                    
                    // Handle 2-digit years
                    if (year < 100) {
                      year = year <= 30 ? 2000 + year : 1900 + year;
                    }
                    
                    // Validate date components
                    if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2030) {
                      // Create and validate the date
                      const testDate = new Date(year, month - 1, day);
                      
                      if (testDate.getFullYear() === year && 
                          testDate.getMonth() === month - 1 && 
                          testDate.getDate() === day) {
                        
                        parsedBirthDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                        console.log('SUCCESS: Turkish date converted to ISO:', parsedBirthDate);
                      } else {
                        console.log('Date validation failed');
                      }
                    } else {
                      console.log('Invalid date components:', { day, month, year });
                    }
                  }
                  // Compact formats: DDMMYYYY or DDMMYY
                  else if (birthDateStr.match(/^\d{6,8}$/)) {
                    console.log('Compact date format detected:', birthDateStr);
                    
                    let day, month, year;
                    
                    if (birthDateStr.length === 6) {
                      // DDMMYY
                      day = parseInt(birthDateStr.substring(0, 2));
                      month = parseInt(birthDateStr.substring(2, 4));
                      const yearShort = parseInt(birthDateStr.substring(4, 6));
                      year = yearShort <= 30 ? 2000 + yearShort : 1900 + yearShort;
                    } else if (birthDateStr.length === 8) {
                      // DDMMYYYY
                      day = parseInt(birthDateStr.substring(0, 2));
                      month = parseInt(birthDateStr.substring(2, 4));
                      year = parseInt(birthDateStr.substring(4, 8));
                    }
                    
                    if (day && month && year && 
                        day >= 1 && day <= 31 && 
                        month >= 1 && month <= 12 && 
                        year >= 1900 && year <= 2030) {
                      
                      const testDate = new Date(year, month - 1, day);
                      if (testDate.getFullYear() === year && 
                          testDate.getMonth() === month - 1 && 
                          testDate.getDate() === day) {
                        
                        parsedBirthDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                        console.log('SUCCESS: Compact date converted to ISO:', parsedBirthDate);
                      }
                    }
                  }
                  // ISO format: YYYY-MM-DD
                  else if (birthDateStr.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
                    console.log('ISO format detected:', birthDateStr);
                    const [year, month, day] = birthDateStr.split('-').map(num => parseInt(num));
                    
                    if (year >= 1900 && year <= 2030 && 
                        month >= 1 && month <= 12 && 
                        day >= 1 && day <= 31) {
                      
                      const testDate = new Date(year, month - 1, day);
                      if (testDate.getFullYear() === year && 
                          testDate.getMonth() === month - 1 && 
                          testDate.getDate() === day) {
                        
                        parsedBirthDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                        console.log('SUCCESS: ISO date validated:', parsedBirthDate);
                      }
                    }
                  }
                  else {
                    console.log('Unrecognized date format:', birthDateStr);
                  }
                }
              }
            } catch (error) {
              console.error('Error parsing birth date:', error);
            }
            
            if (!parsedBirthDate) {
              console.warn('FAILED to parse birth date:', birthDateField);
            } else {
              console.log('FINAL parsed birth date:', parsedBirthDate);
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

          // Enhanced duplicate detection with multiple criteria and improved accuracy
          const studentName = studentData['Öğrenci Adı']?.toString().trim();
          const studentSurname = studentData['Öğrenci Soyadı']?.toString().trim();
          const studentTcNo = studentData['TC Kimlik No']?.toString().trim();
          const parentName = studentData['Veli Adı']?.toString().trim();
          const parentSurname = studentData['Veli Soyadı']?.toString().trim();
          const parentPhoneForDuplicateCheck = studentData['Veli Telefon']?.toString().trim();
          const parentEmailForDuplicateCheck = studentData['Veli Email']?.toString().trim();
          
          console.log('Checking for duplicates:', { studentName, studentSurname, studentTcNo, parentName, parentSurname, parentPhoneForDuplicateCheck, parentEmailForDuplicateCheck });
          
          // Helper function to normalize Turkish text for comparison
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
              .replace(/[^\w\s]/g, '')
              .replace(/\s+/g, ' ')
              .trim();
          };
          
          // Helper function to calculate string similarity
          const calculateStringSimilarity = (str1: string, str2: string): number => {
            if (!str1 || !str2) return 0;
            const norm1 = normalizeTurkishText(str1);
            const norm2 = normalizeTurkishText(str2);
            
            if (norm1 === norm2) return 100;
            
            // Levenshtein distance for similarity
            const matrix = [];
            for (let i = 0; i <= norm2.length; i++) {
              matrix[i] = [i];
            }
            for (let j = 0; j <= norm1.length; j++) {
              matrix[0][j] = j;
            }
            for (let i = 1; i <= norm2.length; i++) {
              for (let j = 1; j <= norm1.length; j++) {
                if (norm2.charAt(i - 1) === norm1.charAt(j - 1)) {
                  matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                  matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                  );
                }
              }
            }
            
            const maxLength = Math.max(norm1.length, norm2.length);
            const similarity = ((maxLength - matrix[norm2.length][norm1.length]) / maxLength) * 100;
            return Math.round(similarity);
          };
          
          const existingStudentIndex = existingStudents.findIndex((student: any) => {
            // Priority 1: Check by TC number (most reliable) - must be exact match
            if (studentTcNo && student.studentTcNo && studentTcNo.length >= 10) {
              const normalizedNewTc = studentTcNo.replace(/\D/g, '');
              const normalizedExistingTc = student.studentTcNo.toString().replace(/\D/g, '');
              if (normalizedNewTc === normalizedExistingTc && normalizedNewTc.length >= 10) {
                console.log('DUPLICATE FOUND by TC number:', studentTcNo, '-> Existing student:', student.studentName, student.studentSurname);
                return true;
              }
            }
            
            // Priority 2: Check by exact name and surname match (Turkish-aware)
            if (studentName && studentSurname && student.studentName && student.studentSurname) {
              const newNameNorm = normalizeTurkishText(studentName);
              const newSurnameNorm = normalizeTurkishText(studentSurname);
              const existingNameNorm = normalizeTurkishText(student.studentName.toString());
              const existingSurnameNorm = normalizeTurkishText(student.studentSurname.toString());
              
              if (newNameNorm === existingNameNorm && newSurnameNorm === existingSurnameNorm) {
                console.log('DUPLICATE FOUND by exact name match:', studentName, studentSurname, '-> Existing student:', student.studentName, student.studentSurname);
                return true;
              }
            }
            
            // Priority 3: Check by parent email (exact match)
            if (parentEmailForDuplicateCheck && student.parentEmail && 
                parentEmailForDuplicateCheck.length > 5 && student.parentEmail.length > 5) {
              const newEmailNorm = parentEmailForDuplicateCheck.toLowerCase().trim();
              const existingEmailNorm = student.parentEmail.toString().toLowerCase().trim();
              
              if (newEmailNorm === existingEmailNorm) {
                console.log('DUPLICATE FOUND by parent email:', parentEmailForDuplicateCheck, '-> Existing student:', student.studentName, student.studentSurname);
                return true;
              }
            }
            
            // Priority 4: Check by parent phone number with high name similarity
            if (parentPhoneForDuplicateCheck && student.parentPhone && 
                studentName && studentSurname && student.studentName && student.studentSurname) {
              const normalizedNewPhone = parentPhoneForDuplicateCheck.replace(/\D/g, '').slice(-10);
              const normalizedExistingPhone = student.parentPhone.toString().replace(/\D/g, '').slice(-10);
              
              if (normalizedNewPhone === normalizedExistingPhone && normalizedNewPhone.length >= 10) {
                // Calculate name similarity
                const nameSimilarity = calculateStringSimilarity(studentName, student.studentName.toString());
                const surnameSimilarity = calculateStringSimilarity(studentSurname, student.studentSurname.toString());
                
                // Require high similarity (85%+) for phone-based matching
                if (nameSimilarity >= 85 && surnameSimilarity >= 85) {
                  console.log('DUPLICATE FOUND by parent phone and high name similarity:', 
                    parentPhoneForDuplicateCheck, studentName, studentSurname, 
                    `(${nameSimilarity}%/${surnameSimilarity}% similarity)`,
                    '-> Existing student:', student.studentName, student.studentSurname);
                  return true;
                }
              }
            }
            
            // Priority 5: Check by parent name combination with very high student name similarity
            if (parentName && parentSurname && student.parentName && student.parentSurname &&
                studentName && studentSurname && student.studentName && student.studentSurname) {
              
              const parentNameSimilarity = calculateStringSimilarity(parentName, student.parentName.toString());
              const parentSurnameSimilarity = calculateStringSimilarity(parentSurname, student.parentSurname.toString());
              
              // Require exact or very high parent name match
              if (parentNameSimilarity >= 95 && parentSurnameSimilarity >= 95) {
                const studentNameSimilarity = calculateStringSimilarity(studentName, student.studentName.toString());
                const studentSurnameSimilarity = calculateStringSimilarity(studentSurname, student.studentSurname.toString());
                
                // Require very high student name similarity (90%+) when parent names match
                if (studentNameSimilarity >= 90 && studentSurnameSimilarity >= 90) {
                  console.log('DUPLICATE FOUND by parent names and high student name similarity:', 
                    parentName, parentSurname, studentName, studentSurname,
                    `(Parent: ${parentNameSimilarity}%/${parentSurnameSimilarity}%, Student: ${studentNameSimilarity}%/${studentSurnameSimilarity}%)`,
                    '-> Existing student:', student.studentName, student.studentSurname);
                  return true;
                }
              }
            }
            
            // Priority 6: Check for very high overall similarity (potential typos)
            if (studentName && studentSurname && student.studentName && student.studentSurname &&
                parentName && parentSurname && student.parentName && student.parentSurname) {
              
              const studentNameSimilarity = calculateStringSimilarity(studentName, student.studentName.toString());
              const studentSurnameSimilarity = calculateStringSimilarity(studentSurname, student.studentSurname.toString());
              const parentNameSimilarity = calculateStringSimilarity(parentName, student.parentName.toString());
              const parentSurnameSimilarity = calculateStringSimilarity(parentSurname, student.parentSurname.toString());
              
              // Calculate overall similarity
              const overallSimilarity = (studentNameSimilarity + studentSurnameSimilarity + parentNameSimilarity + parentSurnameSimilarity) / 4;
              
              // Very high threshold (97%+) for overall similarity to catch typos
              if (overallSimilarity >= 97) {
                console.log('DUPLICATE FOUND by very high overall similarity:', 
                  studentName, studentSurname, parentName, parentSurname,
                  `(Overall: ${overallSimilarity.toFixed(1)}%)`,
                  '-> Existing student:', student.studentName, student.studentSurname);
                return true;
              }
            }
            
            return false;
          });

          if (existingStudentIndex !== -1) {
            // Merge duplicate - update existing student with new information
            const existingStudent = existingStudents[existingStudentIndex];
            console.log('Merging duplicate student:', existingStudent.studentName, existingStudent.studentSurname);
            
            const updatedStudent = {
              ...existingStudent,
              // Update fields if new data is provided and not empty
              studentTcNo: studentTcNo || existingStudent.studentTcNo,
              studentBirthDate: parsedBirthDate || existingStudent.studentBirthDate,
              studentAge: studentData['Yaş']?.toString().trim() || existingStudent.studentAge,
              studentGender: studentData['Cinsiyet']?.toString().trim() || existingStudent.studentGender,
              studentSchool: studentData['Okul']?.toString().trim() || existingStudent.studentSchool,
              studentClass: studentData['Sınıf']?.toString().trim() || existingStudent.studentClass,
              // Merge sports branches (combine existing and new, remove duplicates)
              sportsBranches: [...new Set([...(existingStudent.sportsBranches || []), ...sportsBranches])],
              // Update parent info if provided and not empty
              parentName: studentData['Veli Adı']?.toString().trim() || existingStudent.parentName,
              parentSurname: studentData['Veli Soyadı']?.toString().trim() || existingStudent.parentSurname,
              parentTcNo: studentData['Veli TC Kimlik No']?.toString().trim() || existingStudent.parentTcNo,
              parentPhone: parentPhone || existingStudent.parentPhone,
              parentEmail: studentData['Veli Email']?.toString().trim() || existingStudent.parentEmail,
              parentRelation: studentData['Yakınlık Derecesi']?.toString().trim() || existingStudent.parentRelation,
              updatedAt: new Date().toISOString()
            };
            
            // Update the existing student in the array
            existingStudents[existingStudentIndex] = updatedStudent;
            mergedCount++;
            console.log('Successfully merged student:', updatedStudent.studentName, updatedStudent.studentSurname);
            continue;
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

      // Combine existing students (with merged updates) and new students
      const updatedStudents = [...existingStudents, ...newStudents];

      if (newStudents.length === 0 && mergedCount === 0) {
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
      if (mergedCount > 0) {
        message += `• Birleştirilen mükerrer sporcu: ${mergedCount}\n`;
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
                                  Kayıt: {new Date(athlete.registrationDate || athlete.createdAt).toLocaleDateString('tr-TR')}
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
                        <li>• Mükerrer sporcular otomatik birleştirilir</li>
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
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5" />
                  <span>Toplu Aidat Girişi</span>
                </DialogTitle>
                <DialogDescription>
                  Excel dosyası ile birden fazla sporcu için aidat girişi yapın
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Template Download */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">1. Şablon İndir</CardTitle>
                    <CardDescription>
                      Önce Excel şablonunu indirin ve aidat bilgilerini doldurun
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={generateBulkFeeTemplate} variant="outline" className="w-full">
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Toplu Aidat Şablonunu İndir
                    </Button>
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Şablon Bilgileri:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Aktif sporcuların listesini içerir</li>
                        <li>• Açıklama, Tutar, KDV Oranı alanlarını doldurun</li>
                        <li>• Toplam otomatik hesaplanır</li>
                        <li>• Birim kodu varsayılan olarak "Ay" gelir</li>
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
                            if (file) setBulkFeeUploadFile(file);
                          }}
                          className="hidden"
                          id="bulk-fee-file"
                        />
                        <label htmlFor="bulk-fee-file" className="cursor-pointer">
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
                        <Button 
                          onClick={processBulkFeeEntry}
                          className="w-full"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Toplu Aidat Girişini İşle
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
                    setIsBulkFeeDialogOpen(false);
                    setBulkFeeUploadFile(null);
                  }}
                >
                  Kapat
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

                {/* Account Entries Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Cari Hesap Hareketleri</CardTitle>
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
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {accountEntries.map((entry) => (
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
                            </TableRow>
                          ))}
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