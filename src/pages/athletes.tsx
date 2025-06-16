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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
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
  Calendar,
  TrendingUp,
  Minus,
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  X,
  UserX,
  Key,
  ToggleLeft,
  ToggleRight
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
  "Judo", "Boks", "Güreş", "Halter", "Bisiklet", "Kayak", "Buz Pateni", "Eskrim"
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [isBulkUploadDialogOpen, setIsBulkUploadDialogOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<any>(null);
  const [accountEntries, setAccountEntries] = useState<any[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState<any[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedAthleteForStatus, setSelectedAthleteForStatus] = useState<any>(null);
  const [isParentAccountDialogOpen, setIsParentAccountDialogOpen] = useState(false);
  const [parentAccountsToCreate, setParentAccountsToCreate] = useState<any[]>([]);
  const [newEntry, setNewEntry] = useState({
    month: new Date().toISOString().slice(0, 7),
    description: '',
    amountExcludingVat: '',
    vatRate: '20',
    amountIncludingVat: '',
    unitCode: 'Ay',
    type: 'debit' // debit (borç) or credit (alacak)
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
    setFilteredAthletes(filtered);
  }, [searchTerm, selectedSport, selectedStatus, athletes]);

  const getInitials = (name: string, surname: string) => {
    return `${name?.charAt(0) || ''}${surname?.charAt(0) || ''}`.toUpperCase();
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

  // Bulk Upload Functions
  const generateBulkUploadTemplate = () => {
    const templateData = [
      {
        // Öğrenci Bilgileri
        'Öğrenci Adı': '',
        'Öğrenci Soyadı': '',
        'TC Kimlik No': '',
        'Doğum Tarihi (DD/MM/YYYY)': '',
        'Cinsiyet (Erkek/Kız)': '',
        'Okul': '',
        'Sınıf': '',
        'Spor Branşları (virgülle ayırın)': '',
        
        // Fiziksel Bilgiler
        'Boy (cm)': '',
        'Kilo (kg)': '',
        'Kan Grubu': '',
        'Dominant El (Sağ/Sol/Her İkisi)': '',
        'Dominant Ayak (Sağ/Sol/Her İkisi)': '',
        'Tercih Edilen Pozisyon': '',
        
        // Veli Bilgileri
        'Veli Adı': '',
        'Veli Soyadı': '',
        'Veli TC Kimlik No': '',
        'Veli Telefon': '',
        'Veli Email': '',
        'Yakınlık Derecesi': '',
        'Veli Meslek': '',
        
        // İkinci Veli Bilgileri
        'İkinci Veli Adı': '',
        'İkinci Veli Soyadı': '',
        'İkinci Veli Telefon': '',
        'İkinci Veli Email': '',
        'İkinci Veli Yakınlık': '',
        
        // İletişim Bilgileri
        'Adres': '',
        'İl': '',
        'İlçe': '',
        'Posta Kodu': '',
        
        // Sağlık Bilgileri
        'Sağlık Sorunu (Evet/Hayır)': '',
        'Sağlık Sorunu Detayı': '',
        'Kullandığı İlaçlar': '',
        'Alerjiler': '',
        'Acil Durum Kişisi': '',
        'Acil Durum Telefonu': '',
        'Acil Durum Yakınlık': '',
        'Özel Diyet': '',
        
        // Sporcu Geçmişi
        'Önceki Kulüpler': '',
        'Başarılar': '',
        'Spor Hedefleri': '',
        'Motivasyon': '',
        
        // Diğer Bilgiler
        'Bizi Nasıl Duydunuz': '',
        'Önceki Spor Deneyimi': '',
        'Beklentiler': '',
        
        // Sistem Bilgileri
        'Durum (Aktif/Pasif)': 'Aktif',
        'Ödeme Durumu (Güncel/Gecikmiş)': 'Güncel',
        'Kayıt Tarihi (DD/MM/YYYY)': new Date().toLocaleDateString('tr-TR')
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sporcu Toplu Yükleme Şablonu');
    
    // Set column widths
    const colWidths = Object.keys(templateData[0]).map(() => ({ wch: 20 }));
    ws['!cols'] = colWidths;
    
    XLSX.writeFile(wb, 'Sporcu_Toplu_Yukleme_Sablonu.xlsx');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setUploadErrors([]);
      setUploadResults([]);
    }
  };

  const processExcelFile = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setUploadProgress(0);
    setUploadErrors([]);
    setUploadResults([]);

    try {
      const data = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const results: any[] = [];
      const errors: string[] = [];

      for (let i = 0; i < jsonData.length; i++) {
        const row: any = jsonData[i];
        setUploadProgress(((i + 1) / jsonData.length) * 100);

        try {
          // Validate required fields
          if (!row['Öğrenci Adı'] || !row['Öğrenci Soyadı'] || !row['TC Kimlik No'] || 
              !row['Veli Adı'] || !row['Veli Soyadı'] || !row['Veli Telefon'] || !row['Veli Email']) {
            errors.push(`Satır ${i + 2}: Zorunlu alanlar eksik`);
            continue;
          }

          // Validate TC numbers
          const studentTc = row['TC Kimlik No']?.toString().replace(/\D/g, '');
          const parentTc = row['Veli TC Kimlik No']?.toString().replace(/\D/g, '');
          
          if (studentTc?.length !== 11) {
            errors.push(`Satır ${i + 2}: Öğrenci TC Kimlik numarası 11 haneli olmalıdır`);
            continue;
          }
          
          if (parentTc && parentTc.length !== 11) {
            errors.push(`Satır ${i + 2}: Veli TC Kimlik numarası 11 haneli olmalıdır`);
            continue;
          }

          // Parse sports branches
          const sportsBranches = row['Spor Branşları (virgülle ayırın)']
            ?.split(',')
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0) || [];

          // Parse birth date
          let birthDate = '';
          if (row['Doğum Tarihi (DD/MM/YYYY)']) {
            const dateStr = row['Doğum Tarihi (DD/MM/YYYY)'].toString();
            const dateParts = dateStr.split('/');
            if (dateParts.length === 3) {
              birthDate = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
            }
          }

          // Parse registration date
          let registrationDate = new Date().toISOString();
          if (row['Kayıt Tarihi (DD/MM/YYYY)']) {
            const dateStr = row['Kayıt Tarihi (DD/MM/YYYY)'].toString();
            const dateParts = dateStr.split('/');
            if (dateParts.length === 3) {
              registrationDate = new Date(`${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`).toISOString();
            }
          }

          // Calculate age
          let age = '';
          if (birthDate) {
            const today = new Date();
            const birth = new Date(birthDate);
            age = (today.getFullYear() - birth.getFullYear()).toString();
          }

          const athleteData = {
            id: Date.now() + i,
            // Öğrenci Bilgileri
            studentName: row['Öğrenci Adı'],
            studentSurname: row['Öğrenci Soyadı'],
            studentTcNo: studentTc,
            studentBirthDate: birthDate,
            studentAge: age,
            studentGender: row['Cinsiyet (Erkek/Kız)'] || '',
            studentSchool: row['Okul'] || '',
            studentClass: row['Sınıf'] || '',
            sportsBranches: sportsBranches,
            selectedSports: sportsBranches,
            
            // Fiziksel Bilgiler
            studentHeight: row['Boy (cm)'] || '',
            studentWeight: row['Kilo (kg)'] || '',
            bloodType: row['Kan Grubu'] || '',
            dominantHand: row['Dominant El (Sağ/Sol/Her İkisi)'] || '',
            dominantFoot: row['Dominant Ayak (Sağ/Sol/Her İkisi)'] || '',
            sportsPosition: row['Tercih Edilen Pozisyon'] || '',
            
            // Veli Bilgileri
            parentName: row['Veli Adı'],
            parentSurname: row['Veli Soyadı'],
            parentTcNo: parentTc || '',
            parentPhone: row['Veli Telefon'],
            parentEmail: row['Veli Email'],
            parentRelation: row['Yakınlık Derecesi'] || '',
            parentOccupation: row['Veli Meslek'] || '',
            
            // İkinci Veli Bilgileri
            secondParentName: row['İkinci Veli Adı'] || '',
            secondParentSurname: row['İkinci Veli Soyadı'] || '',
            secondParentPhone: row['İkinci Veli Telefon'] || '',
            secondParentEmail: row['İkinci Veli Email'] || '',
            secondParentRelation: row['İkinci Veli Yakınlık'] || '',
            
            // İletişim Bilgileri
            address: row['Adres'] || '',
            city: row['İl'] || '',
            district: row['İlçe'] || '',
            postalCode: row['Posta Kodu'] || '',
            
            // Sağlık Bilgileri
            hasHealthIssues: row['Sağlık Sorunu (Evet/Hayır)'] || 'Hayır',
            healthIssuesDetail: row['Sağlık Sorunu Detayı'] || '',
            medications: row['Kullandığı İlaçlar'] || '',
            allergies: row['Alerjiler'] || '',
            emergencyContactName: row['Acil Durum Kişisi'] || '',
            emergencyContactPhone: row['Acil Durum Telefonu'] || '',
            emergencyContactRelation: row['Acil Durum Yakınlık'] || '',
            specialDiet: row['Özel Diyet'] || '',
            
            // Sporcu Geçmişi
            previousClubs: row['Önceki Kulüpler'] || '',
            achievements: row['Başarılar'] || '',
            sportsGoals: row['Spor Hedefleri'] || '',
            motivation: row['Motivasyon'] || '',
            
            // Diğer Bilgiler
            howDidYouHear: row['Bizi Nasıl Duydunuz'] || '',
            previousSportsExperience: row['Önceki Spor Deneyimi'] || '',
            expectations: row['Beklentiler'] || '',
            
            // Sistem Bilgileri
            status: row['Durum (Aktif/Pasif)'] || 'Aktif',
            paymentStatus: row['Ödeme Durumu (Güncel/Gecikmiş)'] || 'Güncel',
            registrationDate: registrationDate,
            createdAt: registrationDate,
            
            // Onaylar (default values for bulk upload)
            agreementAccepted: true,
            dataProcessingAccepted: true,
            photoVideoPermission: false
          };

          results.push(athleteData);
        } catch (error) {
          errors.push(`Satır ${i + 2}: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
        }
      }

      setUploadResults(results);
      setUploadErrors(errors);
      
    } catch (error) {
      setUploadErrors(['Excel dosyası işlenirken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata')]);
    } finally {
      setIsProcessing(false);
      setUploadProgress(100);
    }
  };

  const confirmBulkUpload = () => {
    if (uploadResults.length === 0) return;

    // Get existing students
    const existingStudents = JSON.parse(localStorage.getItem('students') || '[]');
    
    // Add new students
    const updatedStudents = [...existingStudents, ...uploadResults];
    localStorage.setItem('students', JSON.stringify(updatedStudents));
    
    // Check for parent accounts that need to be created
    const parentUsers = JSON.parse(localStorage.getItem('parentUsers') || '[]');
    const accountsToCreate: any[] = [];
    
    uploadResults.forEach(athlete => {
      // Check if parent account already exists
      const existingParent = parentUsers.find((parent: any) => 
        parent.email === athlete.parentEmail || 
        (parent.phone && parent.phone === athlete.parentPhone)
      );
      
      if (!existingParent) {
        accountsToCreate.push({
          athleteId: athlete.id,
          athleteName: `${athlete.studentName} ${athlete.studentSurname}`,
          parentName: athlete.parentName,
          parentSurname: athlete.parentSurname,
          parentEmail: athlete.parentEmail,
          parentPhone: athlete.parentPhone,
          parentTcNo: athlete.parentTcNo || '',
          parentRelation: athlete.parentRelation || ''
        });
      }
    });
    
    // If there are parent accounts to create, show the dialog
    if (accountsToCreate.length > 0) {
      setParentAccountsToCreate(accountsToCreate);
      setIsParentAccountDialogOpen(true);
    }
    
    // Reload athletes
    loadAthletes(userRole!, currentUser);
    
    // Reset upload state
    setUploadedFile(null);
    setUploadResults([]);
    setUploadErrors([]);
    setUploadProgress(0);
    setIsBulkUploadDialogOpen(false);
    
    // Show success message
    alert(`${uploadResults.length} sporcu başarıyla eklendi!${accountsToCreate.length > 0 ? ` ${accountsToCreate.length} veli için hesap oluşturma gerekiyor.` : ''}`);
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

  // Parent account creation functions
  const generateParentCredentials = (parentName: string, parentSurname: string, parentEmail: string) => {
    // Generate username from name and surname
    const baseUsername = `${parentName.toLowerCase()}${parentSurname.toLowerCase()}`.replace(/[^a-z]/g, '');
    
    // Generate a simple password (in real app, this should be more secure)
    const password = `${baseUsername}123`;
    
    return {
      username: baseUsername,
      password: password
    };
  };

  const createParentAccounts = () => {
    const parentUsers = JSON.parse(localStorage.getItem('parentUsers') || '[]');
    const newParentAccounts: any[] = [];
    
    parentAccountsToCreate.forEach(accountData => {
      const credentials = generateParentCredentials(
        accountData.parentName, 
        accountData.parentSurname, 
        accountData.parentEmail
      );
      
      const newParentUser = {
        id: Date.now() + Math.random(),
        firstName: accountData.parentName,
        lastName: accountData.parentSurname,
        email: accountData.parentEmail,
        phone: accountData.parentPhone,
        tcNo: accountData.parentTcNo,
        relation: accountData.parentRelation,
        username: credentials.username,
        password: credentials.password,
        role: 'parent',
        createdAt: new Date().toISOString(),
        isActive: true,
        createdBy: 'bulk_upload',
        linkedAthletes: [accountData.athleteId]
      };
      
      parentUsers.push(newParentUser);
      newParentAccounts.push({
        ...newParentUser,
        athleteName: accountData.athleteName
      });
    });
    
    localStorage.setItem('parentUsers', JSON.stringify(parentUsers));
    
    // Show success message with credentials
    const credentialsText = newParentAccounts.map(account => 
      `${account.firstName} ${account.lastName} (${account.athleteName}): Kullanıcı Adı: ${account.username}, Şifre: ${account.password}`
    ).join('\n');
    
    alert(`${newParentAccounts.length} veli hesabı oluşturuldu!\n\nGiriş Bilgileri:\n${credentialsText}\n\nBu bilgileri velilere iletin.`);
    
    setIsParentAccountDialogOpen(false);
    setParentAccountsToCreate([]);
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
                <Dialog open={isBulkUploadDialogOpen} onOpenChange={setIsBulkUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Toplu Yükleme
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <FileSpreadsheet className="h-5 w-5" />
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
                                onChange={handleFileUpload}
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

                            {uploadedFile && (
                              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center space-x-2">
                                  <FileSpreadsheet className="h-5 w-5 text-green-600" />
                                  <span className="text-sm font-medium text-green-900">
                                    {uploadedFile.name}
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setUploadedFile(null);
                                    setUploadResults([]);
                                    setUploadErrors([]);
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}

                            {uploadedFile && (
                              <Button 
                                onClick={processExcelFile} 
                                disabled={isProcessing}
                                className="w-full"
                              >
                                {isProcessing ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    İşleniyor...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Dosyayı İşle
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Progress */}
                      {isProcessing && (
                        <Card>
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>İşleniyor...</span>
                                <span>{Math.round(uploadProgress)}%</span>
                              </div>
                              <Progress value={uploadProgress} className="w-full" />
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Results */}
                      {(uploadResults.length > 0 || uploadErrors.length > 0) && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">3. Sonuçlar</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {uploadResults.length > 0 && (
                                <div className="p-4 bg-green-50 rounded-lg">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <span className="font-medium text-green-900">
                                      {uploadResults.length} sporcu başarıyla işlendi
                                    </span>
                                  </div>
                                  <div className="max-h-32 overflow-y-auto">
                                    {uploadResults.slice(0, 5).map((result, index) => (
                                      <div key={index} className="text-sm text-green-800">
                                        • {result.studentName} {result.studentSurname}
                                      </div>
                                    ))}
                                    {uploadResults.length > 5 && (
                                      <div className="text-sm text-green-700 mt-1">
                                        ... ve {uploadResults.length - 5} sporcu daha
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {uploadErrors.length > 0 && (
                                <div className="p-4 bg-red-50 rounded-lg">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                    <span className="font-medium text-red-900">
                                      {uploadErrors.length} hata bulundu
                                    </span>
                                  </div>
                                  <div className="max-h-32 overflow-y-auto space-y-1">
                                    {uploadErrors.map((error, index) => (
                                      <div key={index} className="text-sm text-red-800">
                                        • {error}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {uploadResults.length > 0 && (
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setUploadedFile(null);
                                      setUploadResults([]);
                                      setUploadErrors([]);
                                      setUploadProgress(0);
                                    }}
                                  >
                                    Temizle
                                  </Button>
                                  <Button onClick={confirmBulkUpload}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    {uploadResults.length} Sporcuyu Sisteme Ekle
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    <div className="flex justify-end space-x-2 mt-6">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsBulkUploadDialogOpen(false);
                          setUploadedFile(null);
                          setUploadResults([]);
                          setUploadErrors([]);
                          setUploadProgress(0);
                        }}
                      >
                        Kapat
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

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
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Dışa Aktar
                    </Button>
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
                        <TableHead>Sporcu</TableHead>
                        <TableHead>Yaş</TableHead>
                        <TableHead>Branş</TableHead>
                        <TableHead>Veli</TableHead>
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
                              <Avatar>
                                <AvatarFallback>
                                  {getInitials(athlete.studentName, athlete.studentSurname)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{athlete.studentName} {athlete.studentSurname}</p>
                                <p className="text-sm text-muted-foreground">
                                  Kayıt: {new Date(athlete.registrationDate || athlete.createdAt).toLocaleDateString('tr-TR')}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{athlete.studentAge}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {athlete.sportsBranches?.map((branch: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {branch}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>{athlete.parentName} {athlete.parentSurname}</TableCell>
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
                              <Button variant="ghost" size="sm">
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
                                    title="Durum Değiştir"
                                  >
                                    {athlete.status === 'Aktif' ? 
                                      <ToggleRight className="h-4 w-4 text-green-600" /> : 
                                      <ToggleLeft className="h-4 w-4 text-gray-400" />
                                    }
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
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
                        <Label>KDV Tutarı ₺</Label>
                        <Input
                          value={newEntry.amountExcludingVat && newEntry.vatRate ? 
                            ((parseFloat(newEntry.amountExcludingVat) * parseFloat(newEntry.vatRate)) / 100).toFixed(2) : '0.00'}
                          disabled
                          className="bg-muted"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="unitCode">Birim Kod</Label>
                        <Select value={newEntry.unitCode} onValueChange={(value) => setNewEntry(prev => ({ ...prev, unitCode: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Ay">Ay (Aylık aidat için)</SelectItem>
                            <SelectItem value="Adet">Adet (Forma, çanta vb. için)</SelectItem>
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
                            <TableHead>KDV Hariç</TableHead>
                            <TableHead>KDV</TableHead>
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
                              <TableCell>₺{entry.amountExcludingVat.toFixed(2)}</TableCell>
                              <TableCell>₺{entry.vatAmount.toFixed(2)} (%{entry.vatRate})</TableCell>
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

          {/* Parent Account Creation Dialog */}
          <Dialog open={isParentAccountDialogOpen} onOpenChange={setIsParentAccountDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5" />
                  <span>Veli Hesapları Oluştur</span>
                </DialogTitle>
                <DialogDescription>
                  Toplu yüklenen sporcuların velileri için sistem hesapları oluşturun
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {parentAccountsToCreate.length} veli için sistem hesabı oluşturulacak. Bu veliler sisteme giriş yaparak çocuklarının bilgilerini görüntüleyebilecekler.
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Oluşturulacak Hesaplar</CardTitle>
                    <CardDescription>
                      Aşağıdaki veliler için otomatik kullanıcı adı ve şifre oluşturulacak
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-64 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Veli Adı</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Telefon</TableHead>
                            <TableHead>Sporcu</TableHead>
                            <TableHead>Oluşturulacak Kullanıcı Adı</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {parentAccountsToCreate.map((account, index) => {
                            const credentials = generateParentCredentials(account.parentName, account.parentSurname, account.parentEmail);
                            return (
                              <TableRow key={index}>
                                <TableCell>{account.parentName} {account.parentSurname}</TableCell>
                                <TableCell>{account.parentEmail}</TableCell>
                                <TableCell>{account.parentPhone}</TableCell>
                                <TableCell>{account.athleteName}</TableCell>
                                <TableCell className="font-mono text-sm">{credentials.username}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Önemli Bilgiler</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>Kullanıcı adları veli adı ve soyadından otomatik oluşturulacak</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>Şifreler basit ve güvenli olacak (kullanıcıadı + 123)</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>Veliler sisteme giriş yaparak çocuklarının bilgilerini görüntüleyebilecek</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                        <span>Giriş bilgilerini velilere WhatsApp veya email ile iletmeyi unutmayın</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsParentAccountDialogOpen(false)}
                  >
                    İptal
                  </Button>
                  <Button onClick={createParentAccounts}>
                    <Key className="h-4 w-4 mr-2" />
                    {parentAccountsToCreate.length} Hesap Oluştur
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}