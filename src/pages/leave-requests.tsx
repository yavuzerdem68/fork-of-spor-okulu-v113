import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Trophy,
  Home,
  Users,
  CreditCard,
  FileText,
  MessageCircle,
  Camera,
  UserCheck,
  Settings,
  LogOut,
  Eye,
  Download,
  CalendarDays
} from "lucide-react";
import { useRouter } from "next/router";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

// Mock leave requests data
const leaveRequests = [
  {
    id: 1,
    studentName: "Ahmet Yılmaz",
    parentName: "Mehmet Yılmaz",
    sport: "Basketbol",
    startDate: "2024-12-25",
    endDate: "2024-12-30",
    reason: "Aile tatili",
    description: "Yılbaşı tatili için 5 günlük izin talebi",
    status: "pending",
    requestDate: "2024-12-20",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face"
  },
  {
    id: 2,
    studentName: "Elif Demir",
    parentName: "Ayşe Demir",
    sport: "Yüzme",
    startDate: "2024-12-22",
    endDate: "2024-12-22",
    reason: "Sağlık sorunu",
    description: "Doktor kontrolü için tek günlük izin",
    status: "approved",
    requestDate: "2024-12-21",
    approvedBy: "Dr. Ahmet Kaya",
    approvedDate: "2024-12-21",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face"
  },
  {
    id: 3,
    studentName: "Can Özkan",
    parentName: "Ali Özkan",
    sport: "Futbol",
    startDate: "2024-12-28",
    endDate: "2025-01-02",
    reason: "Aile ziyareti",
    description: "Büyükanne ziyareti için izin talebi",
    status: "rejected",
    requestDate: "2024-12-19",
    rejectedBy: "Mehmet Antrenör",
    rejectedDate: "2024-12-20",
    rejectionReason: "Önemli antrenman dönemi",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
  }
];

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Sporcular", href: "/athletes" },
  { icon: CreditCard, label: "Ödemeler", href: "/payments" },
  { icon: Calendar, label: "Antrenmanlar", href: "/trainings" },
  { icon: UserCheck, label: "Yoklama", href: "/attendance" },
  { icon: CalendarDays, label: "İzin Talepleri", href: "/leave-requests", active: true },
  { icon: MessageCircle, label: "Mesajlar", href: "/messages" },
  { icon: Camera, label: "Medya", href: "/media" },
  { icon: FileText, label: "Raporlar", href: "/reports" },
  { icon: Settings, label: "Ayarlar", href: "/settings" }
];

const leaveReasons = [
  "Sağlık sorunu",
  "Aile tatili",
  "Aile ziyareti",
  "Okul etkinliği",
  "Diğer"
];

export default function LeaveRequests() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const [newRequest, setNewRequest] = useState({
    studentName: "",
    parentName: "",
    sport: "",
    startDate: "",
    endDate: "",
    reason: "",
    description: ""
  });

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "admin") {
      router.push("/login");
      return;
    }
  }, [router]);

  const filteredRequests = leaveRequests.filter(request => {
    const matchesSearch = request.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Bekliyor</Badge>;
      case "approved":
        return <Badge variant="default" className="bg-green-100 text-green-800">Onaylandı</Badge>;
      case "rejected":
        return <Badge variant="destructive">Reddedildi</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleApprove = (requestId: number) => {
    // Mock approval logic
    console.log("Approving request:", requestId);
  };

  const handleReject = (requestId: number) => {
    // Mock rejection logic
    console.log("Rejecting request:", requestId);
  };

  const handleAddRequest = () => {
    // Mock add request logic
    console.log("Adding new request:", newRequest);
    setIsAddDialogOpen(false);
    setNewRequest({
      studentName: "",
      parentName: "",
      sport: "",
      startDate: "",
      endDate: "",
      reason: "",
      description: ""
    });
  };

  const viewDetails = (request: any) => {
    setSelectedRequest(request);
    setIsDetailDialogOpen(true);
  };

  return (
    <>
      <Head>
        <title>İzin Talepleri - SportsCRM</title>
        <meta name="description" content="Sporcu izin talepleri yönetimi" />
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
                <h1 className="text-2xl font-bold text-foreground">İzin Talepleri</h1>
                <p className="text-muted-foreground">Sporcu izin taleplerini yönetin</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Rapor İndir
                </Button>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Yeni İzin Talebi
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Yeni İzin Talebi</DialogTitle>
                      <DialogDescription>
                        Sporcu için yeni izin talebi oluşturun
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="studentName">Sporcu Adı</Label>
                        <Input
                          id="studentName"
                          value={newRequest.studentName}
                          onChange={(e) => setNewRequest(prev => ({ ...prev, studentName: e.target.value }))}
                          placeholder="Sporcu adını girin"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="parentName">Veli Adı</Label>
                        <Input
                          id="parentName"
                          value={newRequest.parentName}
                          onChange={(e) => setNewRequest(prev => ({ ...prev, parentName: e.target.value }))}
                          placeholder="Veli adını girin"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="sport">Spor Branşı</Label>
                        <Select value={newRequest.sport} onValueChange={(value) => setNewRequest(prev => ({ ...prev, sport: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Branş seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Basketbol">Basketbol</SelectItem>
                            <SelectItem value="Futbol">Futbol</SelectItem>
                            <SelectItem value="Yüzme">Yüzme</SelectItem>
                            <SelectItem value="Voleybol">Voleybol</SelectItem>
                            <SelectItem value="Hentbol">Hentbol</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="reason">İzin Nedeni</Label>
                        <Select value={newRequest.reason} onValueChange={(value) => setNewRequest(prev => ({ ...prev, reason: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Neden seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {leaveReasons.map(reason => (
                              <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Başlangıç Tarihi</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={newRequest.startDate}
                          onChange={(e) => setNewRequest(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="endDate">Bitiş Tarihi</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={newRequest.endDate}
                          onChange={(e) => setNewRequest(prev => ({ ...prev, endDate: e.target.value }))}
                        />
                      </div>
                      
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="description">Açıklama</Label>
                        <Textarea
                          id="description"
                          value={newRequest.description}
                          onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="İzin talebi hakkında detaylı açıklama"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        İptal
                      </Button>
                      <Button onClick={handleAddRequest}>
                        Talebi Oluştur
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
                        <p className="text-sm font-medium text-muted-foreground">Toplam Talep</p>
                        <p className="text-2xl font-bold">{leaveRequests.length}</p>
                      </div>
                      <CalendarDays className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Bekleyen</p>
                        <p className="text-2xl font-bold">{leaveRequests.filter(r => r.status === 'pending').length}</p>
                      </div>
                      <AlertCircle className="h-8 w-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Onaylanan</p>
                        <p className="text-2xl font-bold">{leaveRequests.filter(r => r.status === 'approved').length}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Reddedilen</p>
                        <p className="text-2xl font-bold">{leaveRequests.filter(r => r.status === 'rejected').length}</p>
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
                          placeholder="Sporcu veya veli adı ara..." 
                          className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Durum Filtresi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tüm Durumlar</SelectItem>
                          <SelectItem value="pending">Bekleyen</SelectItem>
                          <SelectItem value="approved">Onaylanan</SelectItem>
                          <SelectItem value="rejected">Reddedilen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Requests Table */}
              <Card>
                <CardHeader>
                  <CardTitle>İzin Talepleri ({filteredRequests.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sporcu</TableHead>
                        <TableHead>Veli</TableHead>
                        <TableHead>Branş</TableHead>
                        <TableHead>İzin Tarihi</TableHead>
                        <TableHead>Neden</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead>Talep Tarihi</TableHead>
                        <TableHead>İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={request.avatar} />
                                <AvatarFallback>{request.studentName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{request.studentName}</span>
                            </div>
                          </TableCell>
                          <TableCell>{request.parentName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{request.sport}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{new Date(request.startDate).toLocaleDateString('tr-TR')}</div>
                              {request.startDate !== request.endDate && (
                                <div className="text-muted-foreground">
                                  - {new Date(request.endDate).toLocaleDateString('tr-TR')}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{request.reason}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(request.status)}
                              {getStatusBadge(request.status)}
                            </div>
                          </TableCell>
                          <TableCell>{new Date(request.requestDate).toLocaleDateString('tr-TR')}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" onClick={() => viewDetails(request)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              {request.status === 'pending' && (
                                <>
                                  <Button variant="ghost" size="sm" onClick={() => handleApprove(request.id)}>
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleReject(request.id)}>
                                    <XCircle className="h-4 w-4 text-red-600" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          </main>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>İzin Talebi Detayları</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Sporcu</Label>
                  <p className="font-medium">{selectedRequest.studentName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Veli</Label>
                  <p className="font-medium">{selectedRequest.parentName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Spor Branşı</Label>
                  <p className="font-medium">{selectedRequest.sport}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">İzin Nedeni</Label>
                  <p className="font-medium">{selectedRequest.reason}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Başlangıç Tarihi</Label>
                  <p className="font-medium">{new Date(selectedRequest.startDate).toLocaleDateString('tr-TR')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Bitiş Tarihi</Label>
                  <p className="font-medium">{new Date(selectedRequest.endDate).toLocaleDateString('tr-TR')}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Açıklama</Label>
                <p className="mt-1 p-3 bg-muted rounded-lg">{selectedRequest.description}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Durum</Label>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusIcon(selectedRequest.status)}
                  {getStatusBadge(selectedRequest.status)}
                </div>
              </div>
              
              {selectedRequest.status === 'approved' && selectedRequest.approvedBy && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Onaylayan</Label>
                    <p className="font-medium">{selectedRequest.approvedBy}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Onay Tarihi</Label>
                    <p className="font-medium">{new Date(selectedRequest.approvedDate).toLocaleDateString('tr-TR')}</p>
                  </div>
                </div>
              )}
              
              {selectedRequest.status === 'rejected' && selectedRequest.rejectedBy && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Reddeden</Label>
                      <p className="font-medium">{selectedRequest.rejectedBy}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Red Tarihi</Label>
                      <p className="font-medium">{new Date(selectedRequest.rejectedDate).toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Red Nedeni</Label>
                    <p className="mt-1 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                      {selectedRequest.rejectionReason}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Kapat
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}