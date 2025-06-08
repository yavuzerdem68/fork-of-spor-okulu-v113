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
import { 
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  Plus,
  Search,
  Filter,
  Trophy,
  Home,
  Users,
  CreditCard,
  Calendar,
  MessageCircle,
  Camera,
  UserCheck,
  Settings,
  LogOut,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Shield,
  Heart,
  Award
} from "lucide-react";
import { useRouter } from "next/router";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

// Mock documents data
const documents = [
  {
    id: 1,
    studentName: "Ahmet Yılmaz",
    sport: "Basketbol",
    type: "health_report",
    title: "Sağlık Raporu",
    fileName: "ahmet_saglik_raporu.pdf",
    uploadDate: "2024-12-01",
    expiryDate: "2025-12-01",
    status: "valid",
    size: "2.3 MB",
    uploadedBy: "Mehmet Yılmaz (Veli)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face"
  },
  {
    id: 2,
    studentName: "Elif Demir",
    sport: "Yüzme",
    type: "license",
    title: "Sporcu Lisansı",
    fileName: "elif_lisans.pdf",
    uploadDate: "2024-11-15",
    expiryDate: "2025-11-15",
    status: "expiring_soon",
    size: "1.8 MB",
    uploadedBy: "Ayşe Demir (Veli)",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face"
  },
  {
    id: 3,
    studentName: "Can Özkan",
    sport: "Futbol",
    type: "insurance",
    title: "Sigorta Belgesi",
    fileName: "can_sigorta.pdf",
    uploadDate: "2024-10-20",
    expiryDate: "2024-12-20",
    status: "expired",
    size: "1.2 MB",
    uploadedBy: "Ali Özkan (Veli)",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
  },
  {
    id: 4,
    studentName: "Zeynep Kaya",
    sport: "Hentbol",
    type: "vaccination",
    title: "Aşı Kartı",
    fileName: "zeynep_asi_karti.pdf",
    uploadDate: "2024-12-10",
    expiryDate: null,
    status: "valid",
    size: "0.8 MB",
    uploadedBy: "Fatma Kaya (Veli)",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face"
  }
];

const documentTypes = [
  { value: "health_report", label: "Sağlık Raporu", icon: Heart, color: "text-red-600" },
  { value: "license", label: "Sporcu Lisansı", icon: Award, color: "text-blue-600" },
  { value: "insurance", label: "Sigorta Belgesi", icon: Shield, color: "text-green-600" },
  { value: "vaccination", label: "Aşı Kartı", icon: Heart, color: "text-purple-600" },
  { value: "identity", label: "Kimlik Belgesi", icon: FileText, color: "text-gray-600" },
  { value: "parent_consent", label: "Veli Onayı", icon: FileText, color: "text-orange-600" }
];

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Sporcular", href: "/athletes" },
  { icon: CreditCard, label: "Ödemeler", href: "/payments" },
  { icon: Calendar, label: "Antrenmanlar", href: "/trainings" },
  { icon: UserCheck, label: "Yoklama", href: "/attendance" },
  { icon: FileText, label: "Belgeler", href: "/documents", active: true },
  { icon: MessageCircle, label: "Mesajlar", href: "/messages" },
  { icon: Camera, label: "Medya", href: "/media" },
  { icon: Settings, label: "Ayarlar", href: "/settings" }
];

export default function Documents() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const [newDocument, setNewDocument] = useState({
    studentName: "",
    type: "",
    title: "",
    file: null as File | null,
    expiryDate: ""
  });

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "admin") {
      router.push("/login");
      return;
    }
  }, [router]);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || doc.type === typeFilter;
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "valid":
        return <Badge variant="default" className="bg-green-100 text-green-800">Geçerli</Badge>;
      case "expiring_soon":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Yakında Sona Eriyor</Badge>;
      case "expired":
        return <Badge variant="destructive">Süresi Dolmuş</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "valid":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "expiring_soon":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "expired":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getDocumentTypeInfo = (type: string) => {
    const docType = documentTypes.find(dt => dt.value === type);
    return docType || { label: type, icon: FileText, color: "text-gray-600" };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewDocument(prev => ({ ...prev, file }));
    }
  };

  const handleUploadDocument = () => {
    // Mock upload logic
    console.log("Uploading document:", newDocument);
    setIsUploadDialogOpen(false);
    setNewDocument({
      studentName: "",
      type: "",
      title: "",
      file: null,
      expiryDate: ""
    });
  };

  const viewDocument = (doc: any) => {
    setSelectedDocument(doc);
    setIsDetailDialogOpen(true);
  };

  const downloadDocument = (doc: any) => {
    // Mock download logic
    console.log("Downloading document:", doc.fileName);
  };

  const deleteDocument = (docId: number) => {
    // Mock delete logic
    console.log("Deleting document:", docId);
  };

  const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return "valid";
    
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysUntilExpiry < 0) return "expired";
    if (daysUntilExpiry <= 30) return "expiring_soon";
    return "valid";
  };

  return (
    <>
      <Head>
        <title>Belge Yönetimi - SportsCRM</title>
        <meta name="description" content="Sporcu belgeleri ve dokümanları yönetimi" />
      </Head>

      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <motion.aside 
          className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-card border-r border-border transition-all duration-300 flex flex-col`}
          initial={{ x: -100 }}
          animate={{ x: 0 }}
        >
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-primary" />
              {sidebarOpen && (
                <span className="text-xl font-bold text-primary">SportsCRM</span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {sidebarItems.map((item, index) => (
                <motion.li 
                  key={item.label}
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: index * 0.1 }}
                >
                  <a
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      item.active 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </a>
                </motion.li>
              ))}
            </ul>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" />
                <AvatarFallback>AY</AvatarFallback>
              </Avatar>
              {sidebarOpen && (
                <div className="flex-1">
                  <p className="text-sm font-medium">Ahmet Yönetici</p>
                  <p className="text-xs text-muted-foreground">Yönetici</p>
                </div>
              )}
              <Button variant="ghost" size="sm">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-card border-b border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Belge Yönetimi</h1>
                <p className="text-muted-foreground">Sporcu belgelerini ve dokümanlarını yönetin</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Toplu İndir
                </Button>
                <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Belge Yükle
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Yeni Belge Yükle</DialogTitle>
                      <DialogDescription>
                        Sporcu için yeni belge yükleyin
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="studentName">Sporcu Adı</Label>
                          <Input
                            id="studentName"
                            value={newDocument.studentName}
                            onChange={(e) => setNewDocument(prev => ({ ...prev, studentName: e.target.value }))}
                            placeholder="Sporcu adını girin"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="type">Belge Türü</Label>
                          <Select value={newDocument.type} onValueChange={(value) => setNewDocument(prev => ({ ...prev, type: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Belge türü seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              {documentTypes.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                  <div className="flex items-center space-x-2">
                                    <type.icon className={`h-4 w-4 ${type.color}`} />
                                    <span>{type.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="title">Belge Başlığı</Label>
                        <Input
                          id="title"
                          value={newDocument.title}
                          onChange={(e) => setNewDocument(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Belge başlığını girin"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="file">Dosya</Label>
                        <Input
                          id="file"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={handleFileUpload}
                        />
                        <p className="text-sm text-muted-foreground">
                          PDF, JPG, PNG, DOC veya DOCX formatında, maksimum 10MB
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Son Geçerlilik Tarihi (Opsiyonel)</Label>
                        <Input
                          id="expiryDate"
                          type="date"
                          value={newDocument.expiryDate}
                          onChange={(e) => setNewDocument(prev => ({ ...prev, expiryDate: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                        İptal
                      </Button>
                      <Button onClick={handleUploadDocument}>
                        Belgeyi Yükle
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Toplam Belge</p>
                        <p className="text-2xl font-bold">{documents.length}</p>
                      </div>
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Geçerli</p>
                        <p className="text-2xl font-bold">{documents.filter(d => d.status === 'valid').length}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Yakında Sona Eriyor</p>
                        <p className="text-2xl font-bold">{documents.filter(d => d.status === 'expiring_soon').length}</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Süresi Dolmuş</p>
                        <p className="text-2xl font-bold">{documents.filter(d => d.status === 'expired').length}</p>
                      </div>
                      <XCircle className="h-8 w-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-col md:flex-row gap-4 flex-1">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input 
                          placeholder="Sporcu adı veya belge ara..." 
                          className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Belge Türü" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tüm Türler</SelectItem>
                          {documentTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Durum" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tüm Durumlar</SelectItem>
                          <SelectItem value="valid">Geçerli</SelectItem>
                          <SelectItem value="expiring_soon">Yakında Sona Eriyor</SelectItem>
                          <SelectItem value="expired">Süresi Dolmuş</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Documents Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Belgeler ({filteredDocuments.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sporcu</TableHead>
                        <TableHead>Belge Türü</TableHead>
                        <TableHead>Başlık</TableHead>
                        <TableHead>Yükleme Tarihi</TableHead>
                        <TableHead>Son Geçerlilik</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead>Boyut</TableHead>
                        <TableHead>İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocuments.map((doc) => {
                        const typeInfo = getDocumentTypeInfo(doc.type);
                        return (
                          <TableRow key={doc.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar>
                                  <AvatarImage src={doc.avatar} />
                                  <AvatarFallback>{doc.studentName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <span className="font-medium">{doc.studentName}</span>
                                  <p className="text-sm text-muted-foreground">{doc.sport}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <typeInfo.icon className={`h-4 w-4 ${typeInfo.color}`} />
                                <span>{typeInfo.label}</span>
                              </div>
                            </TableCell>
                            <TableCell>{doc.title}</TableCell>
                            <TableCell>{new Date(doc.uploadDate).toLocaleDateString('tr-TR')}</TableCell>
                            <TableCell>
                              {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString('tr-TR') : 'Süresiz'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(doc.status)}
                                {getStatusBadge(doc.status)}
                              </div>
                            </TableCell>
                            <TableCell>{doc.size}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="sm" onClick={() => viewDocument(doc)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => downloadDocument(doc)}>
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => deleteDocument(doc.id)}>
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          </main>
        </div>
      </div>

      {/* Document Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Belge Detayları</DialogTitle>
          </DialogHeader>
          
          {selectedDocument && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Sporcu</Label>
                  <p className="font-medium">{selectedDocument.studentName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Spor Branşı</Label>
                  <p className="font-medium">{selectedDocument.sport}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Belge Türü</Label>
                  <div className="flex items-center space-x-2">
                    {(() => {
                      const typeInfo = getDocumentTypeInfo(selectedDocument.type);
                      return (
                        <>
                          <typeInfo.icon className={`h-4 w-4 ${typeInfo.color}`} />
                          <span className="font-medium">{typeInfo.label}</span>
                        </>
                      );
                    })()}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Dosya Adı</Label>
                  <p className="font-medium">{selectedDocument.fileName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Yükleme Tarihi</Label>
                  <p className="font-medium">{new Date(selectedDocument.uploadDate).toLocaleDateString('tr-TR')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Son Geçerlilik</Label>
                  <p className="font-medium">
                    {selectedDocument.expiryDate ? new Date(selectedDocument.expiryDate).toLocaleDateString('tr-TR') : 'Süresiz'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Dosya Boyutu</Label>
                  <p className="font-medium">{selectedDocument.size}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Yükleyen</Label>
                  <p className="font-medium">{selectedDocument.uploadedBy}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Durum</Label>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusIcon(selectedDocument.status)}
                  {getStatusBadge(selectedDocument.status)}
                </div>
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button onClick={() => downloadDocument(selectedDocument)}>
                  <Download className="h-4 w-4 mr-2" />
                  İndir
                </Button>
                <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                  Kapat
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}