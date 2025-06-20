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
      // Handle DD/MM/YYYY or DD.MM.YYYY format from bulk uploads
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
      
      // Handle DD/MM/YYYY or DD.MM.YYYY format from bulk uploads
      if (birthDate.includes('/') || birthDate.includes('.')) {
        const separator = birthDate.includes('.') ? '.' : '/';
        const parts = birthDate.split(separator);
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

  // Generate username and password for parent
  const generateParentCredentials = (parentName: string, parentSurname: string, parentPhone: string) => {
    // Generate username from name and surname
    const cleanName = parentName.toLowerCase().replace(/[^a-z]/g, '');
    const cleanSurname = parentSurname.toLowerCase().replace(/[^a-z]/g, '');
    const phoneLastFour = parentPhone.slice(-4);
    const username = `${cleanName}${cleanSurname}${phoneLastFour}`;
    
    // Generate a simple password
    const password = `${cleanName.charAt(0).toUpperCase()}${cleanSurname.charAt(0).toUpperCase()}${phoneLastFour}`;
    
    return { username, password };
  };

  // Create parent user account
  const createParentUser = (athlete: any, credentials: any) => {
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Get existing parent users
    const existingParentUsers = JSON.parse(localStorage.getItem('parentUsers') || '[]');
    
    // Check if parent already exists (by phone or email)
    const existingParent = existingParentUsers.find((parent: any) => 
      parent.phone === athlete.parentPhone || parent.email === athlete.parentEmail
    );

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

          // Parse birth date - handle multiple formats including Excel date formats
          let parsedBirthDate = '';
          const birthDateField = studentData['Doğum Tarihi (DD.MM.YYYY)'] || studentData['Doğum Tarihi (DD/MM/YYYY)'] || studentData['Doğum Tarihi'];
          
          if (birthDateField) {
            const birthDateStr = birthDateField.toString().trim();
            console.log('Processing birth date:', birthDateStr, 'Type:', typeof birthDateField);
            
            // Handle Excel serial date numbers (Excel dates are stored as numbers)
            if (!isNaN(Number(birthDateStr)) && Number(birthDateStr) > 1000) {
              const serialNumber = Number(birthDateStr);
              console.log('Excel serial number detected:', serialNumber);
              
              // Excel serial date conversion (Excel epoch starts from 1900-01-01, but has a leap year bug)
              let excelDate;
              if (serialNumber > 59) {
                // After Feb 28, 1900 (Excel's leap year bug)
                excelDate = new Date((serialNumber - 25569) * 86400 * 1000);
              } else {
                excelDate = new Date((serialNumber - 25568) * 86400 * 1000);
              }
              
              if (!isNaN(excelDate.getTime()) && excelDate.getFullYear() > 1900 && excelDate.getFullYear() < 2030) {
                const day = excelDate.getDate().toString().padStart(2, '0');
                const month = (excelDate.getMonth() + 1).toString().padStart(2, '0');
                const year = excelDate.getFullYear().toString();
                parsedBirthDate = `${year}-${month}-${day}`;
                console.log('Converted Excel date to:', parsedBirthDate);
              }
            }
            // Handle DD.MM.YYYY or DD/MM/YYYY formats
            else if (birthDateStr.includes('.') || birthDateStr.includes('/')) {
              const separator = birthDateStr.includes('.') ? '.' : '/';
              const parts = birthDateStr.split(separator);
              console.log('Date parts:', parts);
              
              if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
                let day = parts[0].trim();
                let month = parts[1].trim();
                let year = parts[2].trim();
                
                // Handle 2-digit years
                if (year.length === 2) {
                  const currentYear = new Date().getFullYear();
                  const currentCentury = Math.floor(currentYear / 100) * 100;
                  const yearNum = parseInt(year);
                  
                  // If year is less than 30, assume it's 20xx, otherwise 19xx
                  if (yearNum <= 30) {
                    year = (currentCentury + yearNum).toString();
                  } else {
                    year = (currentCentury - 100 + yearNum).toString();
                  }
                }
                
                // Validate and format date parts
                const dayNum = parseInt(day);
                const monthNum = parseInt(month);
                const yearNum = parseInt(year);
                
                if (!isNaN(dayNum) && !isNaN(monthNum) && !isNaN(yearNum) &&
                    dayNum >= 1 && dayNum <= 31 &&
                    monthNum >= 1 && monthNum <= 12 &&
                    yearNum >= 1900 && yearNum <= 2030) {
                  
                  day = dayNum.toString().padStart(2, '0');
                  month = monthNum.toString().padStart(2, '0');
                  
                  // Convert DD.MM.YYYY or DD/MM/YYYY to YYYY-MM-DD
                  parsedBirthDate = `${year}-${month}-${day}`;
                  console.log('Converted date format to:', parsedBirthDate);
                }
              }
            }
            // Handle YYYY-MM-DD format
            else if (birthDateStr.includes('-') && birthDateStr.length === 10) {
              const dateParts = birthDateStr.split('-');
              if (dateParts.length === 3) {
                const year = parseInt(dateParts[0]);
                const month = parseInt(dateParts[1]);
                const day = parseInt(dateParts[2]);
                
                if (!isNaN(year) && !isNaN(month) && !isNaN(day) &&
                    year >= 1900 && year <= 2030 &&
                    month >= 1 && month <= 12 &&
                    day >= 1 && day <= 31) {
                  parsedBirthDate = birthDateStr;
                  console.log('Valid ISO date format:', parsedBirthDate);
                }
              }
            }
            // Handle other potential date formats
            else {
              // Try to parse as a regular date
              const testDate = new Date(birthDateStr);
              if (!isNaN(testDate.getTime()) && testDate.getFullYear() > 1900 && testDate.getFullYear() < 2030) {
                const day = testDate.getDate().toString().padStart(2, '0');
                const month = (testDate.getMonth() + 1).toString().padStart(2, '0');
                const year = testDate.getFullYear().toString();
                parsedBirthDate = `${year}-${month}-${day}`;
                console.log('Parsed as regular date:', parsedBirthDate);
              }
            }
            
            if (!parsedBirthDate) {
              console.warn('Could not parse birth date:', birthDateStr);
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

          // Check for duplicates based on name, surname and TC number with better matching
          const studentName = studentData['Öğrenci Adı']?.toString().trim().toLowerCase();
          const studentSurname = studentData['Öğrenci Soyadı']?.toString().trim().toLowerCase();
          const studentTcNo = studentData['TC Kimlik No']?.toString().trim();
          
          console.log('Checking for duplicates:', { studentName, studentSurname, studentTcNo });
          
          const existingStudentIndex = existingStudents.findIndex((student: any) => {
            // Check by TC number first (most reliable)
            if (studentTcNo && student.studentTcNo && 
                studentTcNo === student.studentTcNo.toString().trim()) {
              console.log('Duplicate found by TC:', studentTcNo);
              return true;
            }
            
            // Check by name and surname combination
            if (studentName && studentSurname && 
                student.studentName && student.studentSurname) {
              const existingName = student.studentName.toString().trim().toLowerCase();
              const existingSurname = student.studentSurname.toString().trim().toLowerCase();
              
              if (studentName === existingName && studentSurname === existingSurname) {
                console.log('Duplicate found by name:', studentName, studentSurname);
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