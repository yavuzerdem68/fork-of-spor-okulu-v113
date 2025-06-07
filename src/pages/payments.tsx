import React, { useState } from "react";
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
import { 
  CreditCard, 
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Phone,
  Mail,
  Calendar,
  Trophy,
  Home,
  Users,
  FileText,
  MessageCircle,
  Camera,
  UserCheck,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Eye,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Receipt,
  Send
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

// Mock data
const payments = [
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

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Sporcular", href: "/athletes" },
  { icon: CreditCard, label: "Ödemeler", href: "/payments", active: true },
  { icon: Calendar, label: "Antrenmanlar", href: "/trainings" },
  { icon: UserCheck, label: "Yoklama", href: "/attendance" },
  { icon: MessageCircle, label: "Mesajlar", href: "/messages" },
  { icon: Camera, label: "Medya", href: "/media" },
  { icon: FileText, label: "Raporlar", href: "/reports" },
  { icon: Settings, label: "Ayarlar", href: "/settings" }
];

const paymentMethods = ["Kredi Kartı", "Nakit", "Havale/EFT", "Çek"];

export default function Payments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  return (
    <>
      <Head>
        <title>Ödemeler - SportsCRM</title>
        <meta name="description" content="Ödeme yönetimi" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
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
                <h1 className="text-2xl font-bold text-foreground">Ödemeler</h1>
                <p className="text-muted-foreground">Aidat ve ödeme takibi</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
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
              </div>

              {/* Tabs */}
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
                                    <AvatarFallback>{payment.athleteName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
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
                          <Button>
                            <FileText className="h-4 w-4 mr-2" />
                            Aylık Fatura Oluştur
                          </Button>
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
          </main>
        </div>
      </div>
    </>
  );
}