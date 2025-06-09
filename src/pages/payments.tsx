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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [matchedPayments, setMatchedPayments] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

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
    // Mock data - gerçek uygulamada API'den gelecek
    const mockPayments = [
      {
        id: 1,
        athleteName: "Ahmet Yılmaz",
        parentName: "Mehmet Yılmaz",
        amount: 350,
        dueDate: "2024-06-15",
        paymentDate: "2024-06-10",
        status: "Ödendi",
        method: "Kredi Kartı",
        sport: "Basketbol",
        invoiceNumber: "INV-2024-001",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face"
      },
      {
        id: 2,
        athleteName: "Elif Demir",
        parentName: "Ayşe Demir",
        amount: 300,
        dueDate: "2024-06-15",
        paymentDate: null,
        status: "Gecikmiş",
        method: null,
        sport: "Yüzme",
        invoiceNumber: "INV-2024-002",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face"
      },
      {
        id: 3,
        athleteName: "Can Özkan",
        parentName: "Ali Özkan",
        amount: 400,
        dueDate: "2024-06-20",
        paymentDate: null,
        status: "Bekliyor",
        method: null,
        sport: "Futbol",
        invoiceNumber: "INV-2024-003",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
      },
      {
        id: 4,
        athleteName: "Zeynep Kaya",
        parentName: "Fatma Kaya",
        amount: 320,
        dueDate: "2024-06-18",
        paymentDate: "2024-06-16",
        status: "Ödendi",
        method: "Nakit",
        sport: "Hentbol",
        invoiceNumber: "INV-2024-004",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face"
      },
      {
        id: 5,
        athleteName: "Emre Şahin",
        parentName: "Hasan Şahin",
        amount: 380,
        dueDate: "2024-06-25",
        paymentDate: null,
        status: "Bekliyor",
        method: null,
        sport: "Voleybol",
        invoiceNumber: "INV-2024-005",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face"
      }
    ];

    // localStorage'dan mevcut ödemeleri yükle
    const existingPayments = JSON.parse(localStorage.getItem('payments') || '[]');
    const allPayments = existingPayments.length > 0 ? existingPayments : mockPayments;
    
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

    try {
      // Simüle edilmiş Excel işleme
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      // 2 saniye bekle (gerçek Excel işleme simülasyonu)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock Excel verisi - gerçek uygulamada Excel dosyası parse edilecek
      const mockExcelData = [
        {
          date: "2024-06-10",
          amount: 350,
          description: "MEHMET YILMAZ BASKETBOL AIDATI",
          reference: "TRF123456789"
        },
        {
          date: "2024-06-16", 
          amount: 320,
          description: "FATMA KAYA HENTBOL AIDATI",
          reference: "TRF987654321"
        },
        {
          date: "2024-06-12",
          amount: 280,
          description: "ALI OZKAN FUTBOL AIDATI", 
          reference: "TRF456789123"
        }
      ];

      // Ödeme eşleştirme algoritması
      const matches: any[] = [];
      for (const excelRow of mockExcelData) {
        const matchedPayment = payments.find(payment => {
          // İsim eşleştirmesi (açıklamada veli adı geçiyor mu?)
          const parentNameMatch = excelRow.description.toLowerCase().includes(
            payment.parentName.toLowerCase().replace(' ', '')
          );
          
          // Tutar eşleştirmesi (±10 TL tolerans)
          const amountMatch = Math.abs(excelRow.amount - payment.amount) <= 10;
          
          // Ödenmemiş olması gerekiyor
          const unpaidMatch = payment.status !== "Ödendi";
          
          return parentNameMatch && amountMatch && unpaidMatch;
        });

        if (matchedPayment) {
          matches.push({
            excelData: excelRow,
            payment: matchedPayment,
            confidence: 95, // Eşleşme güven skoru
            status: 'matched'
          });
        } else {
          matches.push({
            excelData: excelRow,
            payment: null,
            confidence: 0,
            status: 'unmatched'
          });
        }
      }

      setMatchedPayments(matches);
      toast.success(`Excel dosyası işlendi! ${matches.filter(m => m.status === 'matched').length} ödeme eşleştirildi.`);
      
    } catch (error) {
      toast.error("Excel dosyası işlenirken hata oluştu");
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmMatches = () => {
    const confirmedMatches = matchedPayments.filter(match => match.status === 'matched');
    
    // Ödemeleri güncelle
    const updatedPayments = payments.map(payment => {
      const match = confirmedMatches.find(m => m.payment?.id === payment.id);
      if (match) {
        return {
          ...payment,
          status: "Ödendi",
          paymentDate: match.excelData.date,
          method: "Havale/EFT",
          reference: match.excelData.reference
        };
      }
      return payment;
    });

    setPayments(updatedPayments);
    localStorage.setItem('payments', JSON.stringify(updatedPayments));
    
    toast.success(`${confirmedMatches.length} ödeme başarıyla güncellendi!`);
    setIsUploadDialogOpen(false);
    setMatchedPayments([]);
    setUploadedFile(null);
    setUploadProgress(0);
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
      
      // If no stored athletes, use comprehensive mock data with all required fields for e-invoice
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
            studentBirthDate: '2010-05-15',
            parentRelation: 'baba'
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
            studentBirthDate: '2011-08-22',
            parentRelation: 'anne'
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
            studentBirthDate: '2009-12-10',
            parentRelation: 'baba'
          },
          { 
            id: 4, 
            studentName: 'Elif', 
            studentSurname: 'Kaya',
            studentTcNo: '45678901234',
            parentName: 'Zeynep', 
            parentSurname: 'Kaya',
            parentTcNo: '65432109876',
            parentPhone: '05554444444',
            parentEmail: 'zeynep.kaya@email.com',
            address: 'Güneş Mahallesi, Çiçek Sokak No:12/4',
            city: 'Antalya',
            district: 'Muratpaşa',
            postalCode: '07100',
            selectedSports: ['Voleybol'],
            studentBirthDate: '2012-03-18',
            parentRelation: 'anne'
          },
          { 
            id: 5, 
            studentName: 'Murat', 
            studentSurname: 'Şen',
            studentTcNo: '56789012345',
            parentName: 'Hasan', 
            parentSurname: 'Şen',
            parentTcNo: '54321098765',
            parentPhone: '05553333333',
            parentEmail: 'hasan.sen@email.com',
            address: 'Kültür Mahallesi, Eğitim Caddesi No:30/6',
            city: 'Bursa',
            district: 'Nilüfer',
            postalCode: '16110',
            selectedSports: ['Hentbol'],
            studentBirthDate: '2010-11-05',
            parentRelation: 'baba'
          }
        ];
      }
      
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      const invoiceData = activeStudents.map((student: any, index: number) => {
        const sports = student.selectedSports || student.sportsBranches || ['Genel'];
        const amount = sports.length * 350; // 350 TL per sport
        const invoiceNumber = `${currentYear}${String(currentMonth).padStart(2, '0')}${String(index + 1).padStart(4, '0')}`;
        const dueDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
        
        return {
          'BELGE_TUR': 'FATURA',
          'BELGE_NO': invoiceNumber,
          'BELGE_TARIH': currentDate.toLocaleDateString('tr-TR'),
          'VADE_TARIH': dueDate.toLocaleDateString('tr-TR'),
          'ALICI_VKN_TCKN': student.parentTcNo || '11111111111',
          'ALICI_UNVAN': `${student.parentName || ''} ${student.parentSurname || ''}`.trim(),
          'ALICI_ADRES': student.address || 'Adres bilgisi eksik',
          'ALICI_SEHIR': student.city || 'İstanbul',
          'ALICI_ILCE': student.district || 'Merkez',
          'ALICI_POSTA_KODU': student.postalCode || '34000',
          'ALICI_ULKE': 'TÜRKİYE',
          'ALICI_TEL': student.parentPhone || student.phone || '',
          'ALICI_EMAIL': student.parentEmail || '',
          'KALEM_HIZMET_ADI': `${sports.join(', ')} Spor Eğitimi Aidatı`,
          'KALEM_MIKTAR': '1',
          'KALEM_BIRIM': 'ADET',
          'KALEM_BIRIM_FIYAT': amount.toString(),
          'KALEM_KDV_ORAN': '18',
          'KALEM_KDV_TUTAR': (amount * 0.18).toFixed(2),
          'KALEM_TOPLAM': (amount * 1.18).toFixed(2),
          'TOPLAM_TUTAR': amount.toString(),
          'TOPLAM_KDV': (amount * 0.18).toFixed(2),
          'GENEL_TOPLAM': (amount * 1.18).toFixed(2),
          'PARA_BIRIMI': 'TRY',
          'SPORCU_ADI': `${student.studentName || ''} ${student.studentSurname || ''}`.trim(),
          'SPORCU_TC': student.studentTcNo || '',
          'SPORCU_DOGUM_TARIH': student.studentBirthDate || '',
          'SPOR_DALI': sports.join(', '),
          'AIDAT_DONEMI': `${currentYear}-${String(currentMonth).padStart(2, '0')}`,
          'ODEME_DURUMU': 'BEKLIYOR',
          'ACIKLAMA': `${currentYear} yılı ${String(currentMonth).padStart(2, '0')} ayı spor eğitimi aidatı`,
          'VELI_YAKINLIK': student.parentRelation || 'veli',
          'KAYIT_TARIH': currentDate.toLocaleDateString('tr-TR'),
          'DURUM': 'AKTİF'
        };
      });

      if (invoiceData.length === 0) {
        toast.error("Fatura oluşturulacak aktif sporcu bulunamadı!");
        return;
      }

      // CSV formatını doğru şekilde oluştur - her başlık ayrı sütünda olacak
      const headers = Object.keys(invoiceData[0]);
      
      // Tüm değerleri tırnak içine alarak CSV formatını oluştur
      const csvRows = [];
      
      // Header satırını oluştur (her başlığı tırnak içinde)
      csvRows.push(headers.map(header => `"${header}"`).join(','));
      
      // Data satırlarını oluştur (her değeri tırnak içinde)
      invoiceData.forEach(row => {
        const rowValues = headers.map(header => {
          const value = row[header as keyof typeof row];
          // Tüm değerleri string'e çevir ve tırnak içine al
          return `"${String(value || '')}"`;
        });
        csvRows.push(rowValues.join(','));
      });
      
      // Tüm CSV içeriğini birleştir
      const csvContent = csvRows.join('\n');

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

      toast.success(`${invoiceData.length} e-fatura Excel formatında indirildi! (${fileName})`);
      setIsInvoiceDialogOpen(false);
      
    } catch (error) {
      console.error('Fatura oluşturma hatası:', error);
      toast.error("Fatura oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
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
                  <DollarSign className="h-8 w-8 text-blue-600" />
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
                        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline">
                              <Upload className="h-4 w-4 mr-2" />
                              Excel Extre Yükle
                            </Button>
                          </DialogTrigger>
                        </Dialog>

                        <Button variant="outline">
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
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sporcu seçin" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {payments.map(payment => (
                                      <SelectItem key={payment.id} value={payment.id.toString()}>
                                        {payment.athleteName}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="amount">Tutar (₺)</Label>
                                <Input id="amount" type="number" placeholder="350" />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="method">Ödeme Yöntemi</Label>
                                <Select>
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
                                <Input id="paymentDate" type="date" />
                              </div>
                            </div>
                            
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                İptal
                              </Button>
                              <Button onClick={() => setIsAddDialogOpen(false)}>
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
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Receipt className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
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
                      <div className="flex gap-4">
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
                        
                        <Button variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Excel Şablonu İndir
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
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
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
                                            <span className="text-sm text-green-600">Eşleştirildi (%{match.confidence})</span>
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
                                </div>
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
                            Eşleştirmeleri Onayla
                          </Button>
                        </div>
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