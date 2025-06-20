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
      // Handle DD/MM/YYYY format from bulk uploads
      if (birthDate.includes('/')) {
        const parts = birthDate.split('/');
        if (parts.length === 3) {
          const [day, month, year] = parts;
          if (day && month && year && !isNaN(parseInt(day)) && !isNaN(parseInt(month)) && !isNaN(parseInt(year))) {
            return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
          }
        }
      }
      
      // Handle ISO date format
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
      
      // Handle DD/MM/YYYY format from bulk uploads
      if (birthDate.includes('/')) {
        const parts = birthDate.split('/');
        if (parts.length === 3) {
          const [day, month, year] = parts;
          if (day && month && year && !isNaN(parseInt(day)) && !isNaN(parseInt(month)) && !isNaN(parseInt(year))) {
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          }
        }
      } else {
        // Handle ISO date format
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
      
      return age >= 0 ? age.toString() : '-';
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

  // Bulk Upload Functions
  const generateBulkUploadTemplate = () => {
    const templateData = [
      {
        'Öğrenci Adı': 'Ahmet',
        'Öğrenci Soyadı': 'Yılmaz',
        'TC Kimlik No': '12345678901',
        'Doğum Tarihi (DD/MM/YYYY)': '15/03/2010',
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
        'Doğum Tarihi (DD/MM/YYYY)': '22/07/2012',
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
        'Doğum Tarihi (DD/MM/YYYY)': '',
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
    
    // Format the birth date column as text to preserve DD/MM/YYYY format
    const birthDateColIndex = Object.keys(templateData[0]).indexOf('Doğum Tarihi (DD/MM/YYYY)');
    if (birthDateColIndex !== -1) {
      // Set column format to text for birth date column
      if (!ws['!cols']) ws['!cols'] = [];
      ws['!cols'][birthDateColIndex] = { wch: 20, z: '@' }; // '@' means text format
    }
    
    XLSX.writeFile(wb, 'Sporcu_Toplu_Yukleme_Sablonu.xlsx');
  };

  // Download parent credentials as text file
  const downloadParentCredentials = () => {
    const parentUsers = JSON.parse(localStorage.getItem('parentUsers') || '[]');
    
    if (parentUsers.length === 0) {
      alert('Henüz oluşturulmuş veli hesabı bulunmuyor!');
      return;
    }

    const textContent = [
      '=== VELİ KULLANICI ADI VE ŞİFRELERİ ===',
      `Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}`,
      `Toplam Veli Sayısı: ${parentUsers.length}`,
      '',
      '--- DETAYLAR ---'
    ];

    parentUsers.forEach((parent: any, index: number) => {
      // Find linked athlete name
      const linkedAthlete = athletes.find(athlete => 
        parent.linkedAthletes && parent.linkedAthletes.includes(athlete.id)
      );
      const athleteName = linkedAthlete ? 
        `${linkedAthlete.studentName} ${linkedAthlete.studentSurname}` : 
        'Bilinmeyen Sporcu';

      textContent.push(
        `${index + 1}. ${parent.firstName} ${parent.lastName} (${athleteName})`,
        `   Telefon: ${parent.phone}`,
        `   Email: ${parent.email}`,
        `   Kullanıcı Adı: ${parent.username}`,
        `   Şifre: ${parent.password}`,
        ''
      );
    });

    const blob = new Blob([textContent.join('\n')], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `veli_kullanici_bilgileri_${new Date().toISOString().split('T')[0]}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`${parentUsers.length} veli hesabının giriş bilgileri text dosyası olarak indirildi!`);
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

      const invoiceData: any[] = [];

      activeAthletesList.forEach((athlete, index) => {
        // Create the complete e-invoice row with all required columns
        const invoiceRow = {
          'Id': index + 1,
          'Fatura Numarası': '', // Empty as requested
          'ETTN': '',
          'Fatura Tarihi': new Date().toLocaleDateString('tr-TR'),
          'Fatura Saati': new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          'Fatura Tipi': 'SATIS',
          'Fatura Profili': 'EARSIVFATURA',
          'Alıcı VKN/TCKN': athlete.parentTcNo || '',
          'Alıcı Ünvan/Adı | Yabancı Alıcı Ünvan/Adı | Turist Adı': athlete.parentName || '',
          'Alıcı Soyadı | Yabancı Alıcı Soyadı | Turist Soyadı ': athlete.parentSurname || '',
          'Alıcı Ülke | Yabancı Ülke | Turist Ülke': 'TÜRKİYE',
          'Alıcı Şehir | Yabancı Şehir | Turist Şehir': 'Kırklareli',
          'Alıcı İlçe | Yabancı İlçe | Turist İlçe': 'Lüleburgaz',
          'Alıcı Eposta | Yabancı Eposta | Turist Eposta': athlete.parentEmail || '',
          'Alıcı Telefon | Yabancı Telefon | Turist Telefon': athlete.parentPhone || '',
          'Mal/Hizmet Adı': invoiceServiceDescription,
          'Miktar': 1,
          'Birim Kodu': invoiceUnitCode,
          'Birim Fiyat': '350.00',
          'KDV Oranı': invoiceVatRate
        };

        invoiceData.push(invoiceRow);
      });

      // Create Excel file
      const ws = XLSX.utils.json_to_sheet(invoiceData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'E-Fatura');
      
      // Set column widths for better readability
      const colWidths = Object.keys(invoiceData[0]).map(() => ({ wch: 15 }));
      ws['!cols'] = colWidths;
      
      // Generate filename with date and month
      const monthName = new Date(selectedInvoiceMonth + '-01').toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
      const fileName = `E_Fatura_${monthName.replace(' ', '_')}_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '_')}.xlsx`;
      
      // Download the file
      XLSX.writeFile(wb, fileName);
      
      // Show success message
      alert(`E-fatura Excel dosyası oluşturuldu!\n\n✅ ${activeAthletesList.length} sporcu için fatura kaydı\n📅 Dönem: ${monthName}\n🏷️ Hizmet: ${invoiceServiceDescription}\n💰 KDV Oranı: %${invoiceVatRate}\n📁 Dosya: ${fileName}`);
      
      // Close dialog
      setIsInvoiceExportDialogOpen(false);
      
    } catch (error) {
      console.error('E-fatura oluşturma hatası:', error);
      alert('E-fatura oluşturulurken bir hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
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
                <h1 className="text-3xl font-bold">
                  {userRole === 'coach' ? 'Sporcularım' : 'Sporcular'}
                </h1>
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
                            <Badge variant={athlete.status === 'Aktif' ? 'default' : 'secondary'}>
                              {athlete.status || 'Aktif'}
                            </Badge>
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

          {/* View Athlete Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Sporcu Detayları - {selectedAthleteForView?.studentName} {selectedAthleteForView?.studentSurname}</span>
                </DialogTitle>
                <DialogDescription>
                  Sporcu bilgilerini görüntüleyin
                </DialogDescription>
              </DialogHeader>

              {selectedAthleteForView && (
                <div className="space-y-6">
                  {/* Athlete Photo Section */}
                  <div className="flex justify-center">
                    <div className="w-32 h-32 rounded-full bg-primary/10 text-primary font-medium flex items-center justify-center overflow-hidden border-4 border-primary/20">
                      {selectedAthleteForView.photo ? (
                        <img 
                          src={selectedAthleteForView.photo} 
                          alt={`${selectedAthleteForView.studentName} ${selectedAthleteForView.studentSurname}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl">
                          {getInitials(selectedAthleteForView.studentName, selectedAthleteForView.studentSurname)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sporcu Bilgileri */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Sporcu Bilgileri</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ad Soyad:</span>
                          <span className="font-medium">{selectedAthleteForView.studentName} {selectedAthleteForView.studentSurname}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">TC Kimlik No:</span>
                          <span className="font-medium">{selectedAthleteForView.studentTcNo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Doğum Tarihi:</span>
                          <span className="font-medium">{formatBirthDate(selectedAthleteForView.studentBirthDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Yaş:</span>
                          <span className="font-medium">{selectedAthleteForView.studentAge || calculateAge(selectedAthleteForView.studentBirthDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cinsiyet:</span>
                          <span className="font-medium">{selectedAthleteForView.studentGender || '-'}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Veli Bilgileri */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Veli Bilgileri</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ad Soyad:</span>
                          <span className="font-medium">{selectedAthleteForView.parentName} {selectedAthleteForView.parentSurname}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Telefon:</span>
                          <span className="font-medium">{selectedAthleteForView.parentPhone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-medium">{selectedAthleteForView.parentEmail}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Yakınlık:</span>
                          <span className="font-medium">{selectedAthleteForView.parentRelation || '-'}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Spor Bilgileri */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Spor Bilgileri</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <span className="text-muted-foreground">Spor Branşları:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedAthleteForView.sportsBranches?.map((branch: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {branch}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Sistem Bilgileri */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Sistem Bilgileri</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Durum:</span>
                          <Badge variant={selectedAthleteForView.status === 'Aktif' ? 'default' : 'secondary'}>
                            {selectedAthleteForView.status || 'Aktif'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ödeme Durumu:</span>
                          <Badge variant={selectedAthleteForView.paymentStatus === 'Güncel' ? 'default' : 'destructive'}>
                            {selectedAthleteForView.paymentStatus || 'Güncel'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Kayıt Tarihi:</span>
                          <span className="font-medium">
                            {new Date(selectedAthleteForView.registrationDate || selectedAthleteForView.createdAt).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Kapat
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Account Management Dialog */}
          <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5" />
                  <span>Cari Hesap - {selectedAthlete?.studentName} {selectedAthlete?.studentSurname}</span>
                </DialogTitle>
                <DialogDescription>
                  Sporcu için aylık aidat ve ödeme kayıtlarını yönetin
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Balance Summary */}
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Toplam Borç</p>
                        <p className="text-2xl font-bold text-red-600">
                          ₺{accountEntries.filter(e => e.type === 'debit').reduce((sum, e) => sum + e.amountIncludingVat, 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Toplam Alacak</p>
                        <p className="text-2xl font-bold text-green-600">
                          ₺{accountEntries.filter(e => e.type === 'credit').reduce((sum, e) => sum + e.amountIncludingVat, 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Net Bakiye</p>
                        <p className={`text-2xl font-bold ${getTotalBalance() >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ₺{Math.abs(getTotalBalance()).toFixed(2)} {getTotalBalance() >= 0 ? '(Borç)' : '(Alacak)'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* New Entry Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Yeni Kayıt Ekle</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="month">Ay/Yıl</Label>
                        <Input
                          id="month"
                          type="month"
                          value={newEntry.month}
                          onChange={(e) => setNewEntry(prev => ({ ...prev, month: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="type">İşlem Türü</Label>
                        <Select value={newEntry.type} onValueChange={(value) => setNewEntry(prev => ({ ...prev, type: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="debit">Borç (Aidat/Ücret)</SelectItem>
                            <SelectItem value="credit">Alacak (Ödeme)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="description">Açıklama</Label>
                        <Input
                          id="description"
                          placeholder="Örn: Haziran 2024 Basketbol Aidatı"
                          value={newEntry.description}
                          onChange={(e) => setNewEntry(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="amountExcludingVat">Tutar (KDV Hariç) ₺</Label>
                        <Input
                          id="amountExcludingVat"
                          type="number"
                          step="0.01"
                          placeholder="350.00"
                          value={newEntry.amountExcludingVat}
                          onChange={(e) => calculateVatAmount(e.target.value, newEntry.vatRate)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="vatRate">KDV Oranı (%)</Label>
                        <Select value={newEntry.vatRate} onValueChange={(value) => calculateVatAmount(newEntry.amountExcludingVat, value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">%10</SelectItem>
                            <SelectItem value="20">%20</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Toplam Tutar (KDV Dahil) ₺</Label>
                        <Input
                          value={newEntry.amountIncludingVat}
                          disabled
                          className="bg-muted font-bold"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <Button onClick={saveAccountEntry} disabled={!newEntry.description || !newEntry.amountExcludingVat}>
                        <Plus className="h-4 w-4 mr-2" />
                        Kayıt Ekle
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Entries Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Hesap Hareketleri</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {accountEntries.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tarih</TableHead>
                            <TableHead>Ay/Yıl</TableHead>
                            <TableHead>Açıklama</TableHead>
                            <TableHead>Tür</TableHead>
                            <TableHead>KDV Dahil</TableHead>
                            <TableHead>İşlemler</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {accountEntries.map((entry) => (
                            <TableRow key={entry.id}>
                              <TableCell>{new Date(entry.date).toLocaleDateString('tr-TR')}</TableCell>
                              <TableCell>{entry.month}</TableCell>
                              <TableCell>{entry.description}</TableCell>
                              <TableCell>
                                <Badge variant={entry.type === 'debit' ? 'destructive' : 'default'}>
                                  {entry.type === 'debit' ? 'Borç' : 'Alacak'}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-bold">₺{entry.amountIncludingVat.toFixed(2)}</TableCell>
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    const updatedEntries = accountEntries.filter(e => e.id !== entry.id);
                                    setAccountEntries(updatedEntries);
                                    localStorage.setItem(`account_${selectedAthlete.id}`, JSON.stringify(updatedEntries));
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8">
                        <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Henüz hesap hareketi bulunmuyor</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setIsAccountDialogOpen(false)}>
                  Kapat
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Status Change Dialog */}
          <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  {selectedAthleteForStatus?.status === 'Aktif' ? 
                    <UserX className="h-5 w-5 text-orange-600" /> : 
                    <UserCheck className="h-5 w-5 text-green-600" />
                  }
                  <span>Sporcu Durumu Değiştir</span>
                </DialogTitle>
                <DialogDescription>
                  {selectedAthleteForStatus?.studentName} {selectedAthleteForStatus?.studentSurname} adlı sporcunun durumunu değiştirin
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Mevcut Durum:</span>
                    <Badge variant={selectedAthleteForStatus?.status === 'Aktif' ? 'default' : 'secondary'}>
                      {selectedAthleteForStatus?.status || 'Aktif'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Sporcu durumunu değiştirmek istediğinizden emin misiniz?
                  </p>
                  
                  {selectedAthleteForStatus?.status === 'Aktif' ? (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Sporcu pasif duruma geçirilecek. Bu durumda sporcu antrenman listelerinde görünmeyecek ve yeni ödemeler alınamayacaktır.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Sporcu aktif duruma geçirilecek. Bu durumda sporcu tüm antrenman ve ödeme işlemlerine dahil olacaktır.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsStatusDialogOpen(false)}
                  >
                    İptal
                  </Button>
                  <Button 
                    onClick={() => changeAthleteStatus(selectedAthleteForStatus?.status === 'Aktif' ? 'Pasif' : 'Aktif')}
                    variant={selectedAthleteForStatus?.status === 'Aktif' ? 'destructive' : 'default'}
                  >
                    {selectedAthleteForStatus?.status === 'Aktif' ? 
                      <>
                        <UserX className="h-4 w-4 mr-2" />
                        Pasif Yap
                      </> : 
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Aktif Yap
                      </>
                    }
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Athlete Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Edit className="h-5 w-5" />
                  <span>Sporcu Düzenle - {selectedAthleteForEdit?.studentName} {selectedAthleteForEdit?.studentSurname}</span>
                </DialogTitle>
                <DialogDescription>
                  Sporcu bilgilerini düzenleyin
                </DialogDescription>
              </DialogHeader>

              {selectedAthleteForEdit && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sporcu Bilgileri */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Sporcu Bilgileri</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-student-name">Ad</Label>
                            <Input
                              id="edit-student-name"
                              value={selectedAthleteForEdit.studentName || ''}
                              onChange={(e) => setSelectedAthleteForEdit(prev => ({ ...prev, studentName: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-student-surname">Soyad</Label>
                            <Input
                              id="edit-student-surname"
                              value={selectedAthleteForEdit.studentSurname || ''}
                              onChange={(e) => setSelectedAthleteForEdit(prev => ({ ...prev, studentSurname: e.target.value }))}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="edit-student-tc">TC Kimlik No</Label>
                          <Input
                            id="edit-student-tc"
                            value={selectedAthleteForEdit.studentTcNo || ''}
                            onChange={(e) => setSelectedAthleteForEdit(prev => ({ ...prev, studentTcNo: e.target.value }))}
                            maxLength={11}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="edit-student-birth">Doğum Tarihi</Label>
                          <Input
                            id="edit-student-birth"
                            type="date"
                            value={selectedAthleteForEdit.studentBirthDate ? 
                              (selectedAthleteForEdit.studentBirthDate.includes('/') ? 
                                (() => {
                                  const [day, month, year] = selectedAthleteForEdit.studentBirthDate.split('/');
                                  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                                })() : 
                                selectedAthleteForEdit.studentBirthDate.split('T')[0]
                              ) : ''
                            }
                            onChange={(e) => setSelectedAthleteForEdit(prev => ({ ...prev, studentBirthDate: e.target.value }))}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="edit-student-gender">Cinsiyet</Label>
                          <Select 
                            value={selectedAthleteForEdit.studentGender || ''} 
                            onValueChange={(value) => setSelectedAthleteForEdit(prev => ({ ...prev, studentGender: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Cinsiyet seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Erkek">Erkek</SelectItem>
                              <SelectItem value="Kız">Kız</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Veli Bilgileri */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Veli Bilgileri</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-parent-name">Veli Adı</Label>
                            <Input
                              id="edit-parent-name"
                              value={selectedAthleteForEdit.parentName || ''}
                              onChange={(e) => setSelectedAthleteForEdit(prev => ({ ...prev, parentName: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-parent-surname">Veli Soyadı</Label>
                            <Input
                              id="edit-parent-surname"
                              value={selectedAthleteForEdit.parentSurname || ''}
                              onChange={(e) => setSelectedAthleteForEdit(prev => ({ ...prev, parentSurname: e.target.value }))}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="edit-parent-phone">Telefon</Label>
                          <Input
                            id="edit-parent-phone"
                            value={selectedAthleteForEdit.parentPhone || ''}
                            onChange={(e) => setSelectedAthleteForEdit(prev => ({ ...prev, parentPhone: e.target.value }))}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="edit-parent-email">Email</Label>
                          <Input
                            id="edit-parent-email"
                            type="email"
                            value={selectedAthleteForEdit.parentEmail || ''}
                            onChange={(e) => setSelectedAthleteForEdit(prev => ({ ...prev, parentEmail: e.target.value }))}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="edit-parent-relation">Yakınlık</Label>
                          <Select 
                            value={selectedAthleteForEdit.parentRelation || ''} 
                            onValueChange={(value) => setSelectedAthleteForEdit(prev => ({ ...prev, parentRelation: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Yakınlık seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Anne">Anne</SelectItem>
                              <SelectItem value="Baba">Baba</SelectItem>
                              <SelectItem value="Vasi">Vasi</SelectItem>
                              <SelectItem value="Büyükanne">Büyükanne</SelectItem>
                              <SelectItem value="Büyükbaba">Büyükbaba</SelectItem>
                              <SelectItem value="Diğer">Diğer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Spor Branşları */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Spor Branşları</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Selected Sports Display */}
                        {selectedAthleteForEdit.sportsBranches && selectedAthleteForEdit.sportsBranches.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {selectedAthleteForEdit.sportsBranches.map((sport: string, idx: number) => (
                              <Badge key={idx} variant="default" className="flex items-center gap-1">
                                {sport}
                                <X 
                                  className="h-3 w-3 cursor-pointer" 
                                  onClick={() => {
                                    const updatedSports = selectedAthleteForEdit.sportsBranches.filter((s: string) => s !== sport);
                                    setSelectedAthleteForEdit(prev => ({ ...prev, sportsBranches: updatedSports }));
                                  }}
                                />
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {/* Sports Selection */}
                        <div className="grid grid-cols-3 gap-3">
                          {sports.map((sport) => (
                            <div key={sport} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`edit-sport-${sport}`}
                                checked={selectedAthleteForEdit.sportsBranches?.includes(sport) || false}
                                onChange={(e) => {
                                  const currentSports = selectedAthleteForEdit.sportsBranches || [];
                                  if (e.target.checked) {
                                    setSelectedAthleteForEdit(prev => ({ 
                                      ...prev, 
                                      sportsBranches: [...currentSports, sport] 
                                    }));
                                  } else {
                                    setSelectedAthleteForEdit(prev => ({ 
                                      ...prev, 
                                      sportsBranches: currentSports.filter(s => s !== sport) 
                                    }));
                                  }
                                }}
                                className="rounded border-gray-300"
                              />
                              <Label htmlFor={`edit-sport-${sport}`} className="text-sm">{sport}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="flex justify-end space-x-2 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  İptal
                </Button>
                <Button 
                  onClick={() => {
                    if (!selectedAthleteForEdit) return;

                    // Update athlete in localStorage
                    const allStudents = JSON.parse(localStorage.getItem('students') || '[]');
                    const updatedStudents = allStudents.map((student: any) => 
                      student.id === selectedAthleteForEdit.id 
                        ? { 
                            ...student, 
                            ...selectedAthleteForEdit,
                            updatedAt: new Date().toISOString()
                          }
                        : student
                    );
                    
                    localStorage.setItem('students', JSON.stringify(updatedStudents));
                    
                    // Reload athletes to refresh the UI
                    loadAthletes(userRole!, currentUser);
                    
                    setIsEditDialogOpen(false);
                    setSelectedAthleteForEdit(null);
                    
                    alert(`${selectedAthleteForEdit.studentName} ${selectedAthleteForEdit.studentSurname} adlı sporcunun bilgileri başarıyla güncellendi.`);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Kaydet
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Athlete Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Trash2 className="h-5 w-5 text-red-600" />
                  <span>Sporcu Sil</span>
                </DialogTitle>
                <DialogDescription>
                  {selectedAthleteForDelete?.studentName} {selectedAthleteForDelete?.studentSurname} adlı sporcuyu silmek istediğinizden emin misiniz?
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Bu işlem geri alınamaz! Sporcu kaydı ve tüm ilişkili veriler (cari hesap, ödemeler vb.) silinecektir.
                  </AlertDescription>
                </Alert>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sporcu:</span>
                      <span className="font-medium">{selectedAthleteForDelete?.studentName} {selectedAthleteForDelete?.studentSurname}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Veli:</span>
                      <span className="font-medium">{selectedAthleteForDelete?.parentName} {selectedAthleteForDelete?.parentSurname}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kayıt Tarihi:</span>
                      <span className="font-medium">
                        {selectedAthleteForDelete && new Date(selectedAthleteForDelete.registrationDate || selectedAthleteForDelete.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDeleteDialogOpen(false)}
                  >
                    İptal
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={deleteAthlete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Sporcuyu Sil
                  </Button>
                </div>
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
                  Aktif sporcular için e-fatura formatında Excel dosyası oluşturun
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceMonth">Fatura Dönemi (Ay/Yıl)</Label>
                  <Input
                    id="invoiceMonth"
                    type="month"
                    value={selectedInvoiceMonth}
                    onChange={(e) => setSelectedInvoiceMonth(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="serviceDescription">Hizmet Açıklaması</Label>
                  <Input
                    id="serviceDescription"
                    placeholder="Örn: Spor Okulu Aidatı"
                    value={invoiceServiceDescription}
                    onChange={(e) => setInvoiceServiceDescription(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unitCode">Birim Kodu</Label>
                    <Select value={invoiceUnitCode} onValueChange={setInvoiceUnitCode}>
                      <SelectTrigger>
                        <SelectValue placeholder="Birim seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ay">Ay (Aylık aidat için)</SelectItem>
                        <SelectItem value="Adet">Adet (Forma, çanta vb. için)</SelectItem>
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
                        <SelectItem value="10">%10</SelectItem>
                        <SelectItem value="20">%20</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Önizleme:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>Dönem:</strong> {new Date(selectedInvoiceMonth + '-01').toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}</li>
                    <li>• <strong>Hizmet:</strong> {invoiceServiceDescription}</li>
                    <li>• <strong>Birim:</strong> {invoiceUnitCode}</li>
                    <li>• <strong>KDV Oranı:</strong> %{invoiceVatRate}</li>
                    <li>• <strong>Aktif Sporcu Sayısı:</strong> {activeAthletes}</li>
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
                  E-Fatura Excel Dosyası Oluştur
                </Button>
              </div>
            </DialogContent>
          </Dialog>

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
                        <li>• Tarih formatı: DD/MM/YYYY</li>
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
                          onClick={async () => {
                            try {
                              const data = await bulkUploadFile.arrayBuffer();
                              const workbook = XLSX.read(data, { type: 'array' });
                              const sheetName = workbook.SheetNames[0];
                              const worksheet = workbook.Sheets[sheetName];
                              const jsonData = XLSX.utils.sheet_to_json(worksheet);
                              
                              console.log('Processing bulk upload data:', jsonData);
                              
                              if (jsonData.length === 0) {
                                alert('Excel dosyasında işlenecek veri bulunamadı!');
                                return;
                              }

                              // Get existing students
                              const existingStudents = JSON.parse(localStorage.getItem('students') || '[]');
                              const newStudents = [];
                              let duplicateCount = 0;
                              let errorCount = 0;

                              for (const row of jsonData) {
                                try {
                                  const studentData = row as any;
                                  
                                  // Skip empty rows
                                  if (!studentData['Öğrenci Adı'] || !studentData['Öğrenci Soyadı']) {
                                    continue;
                                  }

                                  // Check for duplicates based on name and TC
                                  const isDuplicate = existingStudents.some((student: any) => 
                                    (student.studentName?.toLowerCase() === studentData['Öğrenci Adı']?.toString().toLowerCase() && 
                                     student.studentSurname?.toLowerCase() === studentData['Öğrenci Soyadı']?.toString().toLowerCase()) ||
                                    (studentData['TC Kimlik No'] && student.studentTcNo === studentData['TC Kimlik No']?.toString())
                                  );

                                  if (isDuplicate) {
                                    duplicateCount++;
                                    continue;
                                  }

                                  // Parse birth date
                                  let parsedBirthDate = '';
                                  if (studentData['Doğum Tarihi (DD/MM/YYYY)']) {
                                    const birthDateStr = studentData['Doğum Tarihi (DD/MM/YYYY)'].toString().trim();
                                    if (birthDateStr && birthDateStr.includes('/')) {
                                      const parts = birthDateStr.split('/');
                                      if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
                                        const day = parts[0].padStart(2, '0');
                                        const month = parts[1].padStart(2, '0');
                                        const year = parts[2];
                                        
                                        // Validate date parts
                                        if (year.length === 4 && !isNaN(parseInt(year)) && 
                                            !isNaN(parseInt(month)) && !isNaN(parseInt(day))) {
                                          // Convert DD/MM/YYYY to YYYY-MM-DD
                                          parsedBirthDate = `${year}-${month}-${day}`;
                                        }
                                      }
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
                                    parentPhone: studentData['Veli Telefon']?.toString() || '',
                                    parentEmail: studentData['Veli Email']?.toString() || '',
                                    parentRelation: studentData['Yakınlık Derecesi']?.toString() || 'Veli',
                                    status: 'Aktif',
                                    paymentStatus: 'Güncel',
                                    registrationDate: new Date().toISOString(),
                                    createdAt: new Date().toISOString(),
                                    updatedAt: new Date().toISOString()
                                  };

                                  newStudents.push(newStudent);
                                } catch (rowError) {
                                  console.error('Error processing row:', rowError);
                                  errorCount++;
                                }
                              }

                              if (newStudents.length === 0) {
                                let message = 'İşlenecek yeni sporcu bulunamadı.';
                                if (duplicateCount > 0) {
                                  message += ` ${duplicateCount} sporcu zaten sistemde mevcut.`;
                                }
                                if (errorCount > 0) {
                                  message += ` ${errorCount} satırda hata oluştu.`;
                                }
                                alert(message);
                                return;
                              }

                              // Save new students to localStorage
                              const updatedStudents = [...existingStudents, ...newStudents];
                              localStorage.setItem('students', JSON.stringify(updatedStudents));
                              
                              // Reload athletes to refresh the UI
                              loadAthletes(userRole!, currentUser);
                              
                              let message = `✅ ${newStudents.length} sporcu başarıyla sisteme eklendi!`;
                              if (duplicateCount > 0) {
                                message += `\n⚠️ ${duplicateCount} sporcu zaten sistemde mevcut olduğu için atlandı.`;
                              }
                              if (errorCount > 0) {
                                message += `\n❌ ${errorCount} satırda hata oluştu.`;
                              }
                              
                              alert(message);
                              
                              setBulkUploadFile(null);
                              setIsBulkUploadDialogOpen(false);
                            } catch (error) {
                              console.error('Error processing bulk upload:', error);
                              alert('Dosya işlenirken hata oluştu! Lütfen dosya formatını kontrol edin.\n\nHata: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
                            }
                          }}
                          className="w-full"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Dosyayı İşle
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

          {/* Bulk Fee Dialog */}
          <Dialog open={isBulkFeeDialogOpen} onOpenChange={setIsBulkFeeDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  <span>Toplu Aidat Girişi</span>
                </DialogTitle>
                <DialogDescription>
                  Excel dosyası ile tüm aktif sporcular için toplu aidat girişi yapın
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Bu işlem aktif sporcuların cari hesaplarına aidat kaydı ekleyecektir. Önce şablonu indirip doldurun.
                  </AlertDescription>
                </Alert>

                {/* Template Download */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">1. Şablon İndir ve Doldur</CardTitle>
                    <CardDescription>
                      Aktif sporcular için aidat şablonunu indirin
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
                        <li>• Sporcu Adı Soyadı: Otomatik doldurulur</li>
                        <li>• Açıklama: Aidat açıklaması (örn: "Haziran 2024 Aylık Aidat")</li>
                        <li>• Tutar: KDV hariç tutar</li>
                        <li>• KDV Oranı: 10 veya 20 seçin</li>
                        <li>• Toplam: Otomatik hesaplanır</li>
                        <li>• Birim Kod: "Ay" (aidat için) veya "Adet" (forma vb. için)</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* File Upload */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">2. Doldurulmuş Dosyayı Yükle</CardTitle>
                    <CardDescription>
                      Aidat bilgilerini doldurduğunuz Excel dosyasını seçin
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
                            Doldurulmuş Excel dosyasını seçin
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
                          onClick={async () => {
                            try {
                              setIsProcessing(true);
                              
                              const data = await bulkFeeUploadFile.arrayBuffer();
                              const workbook = XLSX.read(data, { type: 'array' });
                              const sheetName = workbook.SheetNames[0];
                              const worksheet = workbook.Sheets[sheetName];
                              const jsonData = XLSX.utils.sheet_to_json(worksheet);
                              
                              console.log('Processing bulk fee data:', jsonData);
                              
                              if (jsonData.length === 0) {
                                alert('Excel dosyasında işlenecek aidat kaydı bulunamadı!');
                                setIsProcessing(false);
                                return;
                              }

                              // Get all students
                              const allStudents = JSON.parse(localStorage.getItem('students') || '[]');
                              let processedCount = 0;
                              let errorCount = 0;
                              let notFoundCount = 0;
                              const errors: string[] = [];

                              for (const row of jsonData) {
                                try {
                                  const feeData = row as any;
                                  
                                  // Skip empty rows
                                  if (!feeData['Sporcu Adı Soyadı'] || !feeData['Açıklama'] || !feeData['Tutar']) {
                                    continue;
                                  }

                                  const athleteName = feeData['Sporcu Adı Soyadı'].toString().trim();
                                  const description = feeData['Açıklama'].toString().trim();
                                  const amount = parseFloat(feeData['Tutar'].toString()) || 0;
                                  const vatRate = parseFloat(feeData['KDV Oranı (%)'].toString()) || 10;
                                  const unitCode = feeData['Birim Kod']?.toString() || 'Ay';

                                  if (amount <= 0) {
                                    errors.push(`${athleteName}: Geçersiz tutar (${amount})`);
                                    errorCount++;
                                    continue;
                                  }

                                  // Find the athlete by name
                                  const athlete = allStudents.find((student: any) => {
                                    const studentFullName = `${student.studentName || ''} ${student.studentSurname || ''}`.trim();
                                    return studentFullName.toLowerCase() === athleteName.toLowerCase();
                                  });

                                  if (!athlete) {
                                    errors.push(`${athleteName}: Sporcu bulunamadı`);
                                    notFoundCount++;
                                    continue;
                                  }

                                  // Calculate VAT and total
                                  const vatAmount = (amount * vatRate) / 100;
                                  const totalAmount = amount + vatAmount;

                                  // Create fee entry
                                  const feeEntry = {
                                    id: Date.now() + Math.random(),
                                    date: new Date().toISOString(),
                                    month: new Date().toISOString().slice(0, 7), // Current month
                                    description: description,
                                    amountExcludingVat: amount,
                                    vatRate: vatRate,
                                    vatAmount: vatAmount,
                                    amountIncludingVat: totalAmount,
                                    unitCode: unitCode,
                                    type: 'debit' // Fee is a debit entry
                                  };

                                  // Get existing account entries for this athlete
                                  const existingEntries = JSON.parse(localStorage.getItem(`account_${athlete.id}`) || '[]');
                                  const updatedEntries = [...existingEntries, feeEntry];
                                  
                                  // Save updated entries
                                  localStorage.setItem(`account_${athlete.id}`, JSON.stringify(updatedEntries));
                                  
                                  processedCount++;
                                } catch (rowError) {
                                  console.error('Error processing fee row:', rowError);
                                  errorCount++;
                                  errors.push(`Satır işleme hatası: ${rowError instanceof Error ? rowError.message : 'Bilinmeyen hata'}`);
                                }
                              }

                              setIsProcessing(false);

                              // Show results
                              let resultMessage = `✅ Toplu aidat girişi tamamlandı!\n\n`;
                              resultMessage += `📊 İşlem Özeti:\n`;
                              resultMessage += `• Başarıyla işlenen: ${processedCount} aidat kaydı\n`;
                              
                              if (notFoundCount > 0) {
                                resultMessage += `• Sporcu bulunamayan: ${notFoundCount} kayıt\n`;
                              }
                              
                              if (errorCount > 0) {
                                resultMessage += `• Hatalı kayıt: ${errorCount} satır\n`;
                              }

                              if (errors.length > 0 && errors.length <= 10) {
                                resultMessage += `\n⚠️ Hatalar:\n${errors.slice(0, 10).join('\n')}`;
                              } else if (errors.length > 10) {
                                resultMessage += `\n⚠️ ${errors.length} hata oluştu (ilk 10 tanesi gösteriliyor):\n${errors.slice(0, 10).join('\n')}`;
                              }

                              alert(resultMessage);
                              
                              setBulkFeeUploadFile(null);
                              setIsBulkFeeDialogOpen(false);
                              
                              // Refresh the athletes list to show updated payment statuses
                              loadAthletes(userRole!, currentUser);
                              
                            } catch (error) {
                              console.error('Error processing bulk fee upload:', error);
                              setIsProcessing(false);
                              alert('Toplu aidat girişi sırasında hata oluştu!\n\nHata: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
                            }
                          }}
                          className="w-full"
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              İşleniyor...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Toplu Aidat Girişini Başlat
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Example Data */}
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
                          <TableCell>10</TableCell>
                          <TableCell>385 (otomatik)</TableCell>
                          <TableCell>Ay</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Elif Demir</TableCell>
                          <TableCell>Forma Ücreti</TableCell>
                          <TableCell>150</TableCell>
                          <TableCell>20</TableCell>
                          <TableCell>180 (otomatik)</TableCell>
                          <TableCell>Adet</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
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
        </div>
      </div>
    </>
  );
}