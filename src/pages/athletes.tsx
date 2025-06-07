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
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Trophy,
  Home,
  CreditCard,
  FileText,
  MessageCircle,
  Camera,
  UserCheck,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Eye,
  UserPlus
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

// Mock data
const athletes = [
  {
    id: 1,
    name: "Ahmet Yılmaz",
    age: 14,
    sport: "Basketbol",
    parentName: "Mehmet Yılmaz",
    parentPhone: "0532 123 4567",
    parentEmail: "mehmet@email.com",
    registrationDate: "2024-01-15",
    status: "Aktif",
    paymentStatus: "Güncel",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face"
  },
  {
    id: 2,
    name: "Elif Demir",
    age: 12,
    sport: "Yüzme",
    parentName: "Ayşe Demir",
    parentPhone: "0533 234 5678",
    parentEmail: "ayse@email.com",
    registrationDate: "2024-02-20",
    status: "Aktif",
    paymentStatus: "Gecikmiş",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face"
  },
  {
    id: 3,
    name: "Can Özkan",
    age: 16,
    sport: "Futbol",
    parentName: "Ali Özkan",
    parentPhone: "0534 345 6789",
    parentEmail: "ali@email.com",
    registrationDate: "2024-01-10",
    status: "Aktif",
    paymentStatus: "Güncel",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
  },
  {
    id: 4,
    name: "Zeynep Kaya",
    age: 13,
    sport: "Hentbol",
    parentName: "Fatma Kaya",
    parentPhone: "0535 456 7890",
    parentEmail: "fatma@email.com",
    registrationDate: "2024-03-05",
    status: "Pasif",
    paymentStatus: "Güncel",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face"
  },
  {
    id: 5,
    name: "Emre Şahin",
    age: 15,
    sport: "Voleybol",
    parentName: "Hasan Şahin",
    parentPhone: "0536 567 8901",
    parentEmail: "hasan@email.com",
    registrationDate: "2024-02-28",
    status: "Aktif",
    paymentStatus: "Güncel",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face"
  }
];

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Sporcular", href: "/athletes", active: true },
  { icon: CreditCard, label: "Ödemeler", href: "/payments" },
  { icon: Calendar, label: "Antrenmanlar", href: "/trainings" },
  { icon: UserCheck, label: "Yoklama", href: "/attendance" },
  { icon: MessageCircle, label: "Mesajlar", href: "/messages" },
  { icon: Camera, label: "Medya", href: "/media" },
  { icon: FileText, label: "Raporlar", href: "/reports" },
  { icon: Settings, label: "Ayarlar", href: "/settings" }
];

const sports = ["Basketbol", "Futbol", "Voleybol", "Hentbol", "Yüzme", "Satranç", "Akıl ve Zeka Oyunları"];

export default function Athletes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const filteredAthletes = athletes.filter(athlete => {
    const matchesSearch = athlete.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         athlete.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = selectedSport === "all" || athlete.sport === selectedSport;
    const matchesStatus = selectedStatus === "all" || athlete.status === selectedStatus;
    
    return matchesSearch && matchesSport && matchesStatus;
  });

  return (
    <>
      <Head>
        <title>Sporcular - SportsCRM</title>
        <meta name="description" content="Sporcu yönetimi" />
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
                <h1 className="text-2xl font-bold text-foreground">Sporcular</h1>
                <p className="text-muted-foreground">Sporcu kayıtlarını yönetin</p>
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
                        <p className="text-sm font-medium text-muted-foreground">Toplam Sporcu</p>
                        <p className="text-2xl font-bold">524</p>
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
                        <p className="text-2xl font-bold">487</p>
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
                        <p className="text-2xl font-bold">23</p>
                      </div>
                      <UserPlus className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Ödeme Gecikmiş</p>
                        <p className="text-2xl font-bold">12</p>
                      </div>
                      <CreditCard className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters and Actions */}
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
                    
                    <div className="flex gap-2">
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Dışa Aktar
                      </Button>
                      
                      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Yeni Sporcu
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Yeni Sporcu Kaydı</DialogTitle>
                            <DialogDescription>
                              Yeni sporcu bilgilerini girin
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Sporcu Adı Soyadı</Label>
                              <Input id="name" placeholder="Ahmet Yılmaz" />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="age">Yaş</Label>
                              <Input id="age" type="number" placeholder="14" />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="sport">Spor Branşı</Label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Branş seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                  {sports.map(sport => (
                                    <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="parentName">Veli Adı Soyadı</Label>
                              <Input id="parentName" placeholder="Mehmet Yılmaz" />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="parentPhone">Veli Telefon</Label>
                              <Input id="parentPhone" placeholder="0532 123 4567" />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="parentEmail">Veli E-posta</Label>
                              <Input id="parentEmail" type="email" placeholder="mehmet@email.com" />
                            </div>
                            
                            <div className="col-span-2 space-y-2">
                              <Label htmlFor="address">Adres</Label>
                              <Textarea id="address" placeholder="Tam adres bilgisi" />
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

              {/* Athletes Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Sporcu Listesi ({filteredAthletes.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sporcu</TableHead>
                        <TableHead>Yaş</TableHead>
                        <TableHead>Branş</TableHead>
                        <TableHead>Veli</TableHead>
                        <TableHead>İletişim</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead>Ödeme</TableHead>
                        <TableHead>İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAthletes.map((athlete) => (
                        <TableRow key={athlete.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={athlete.avatar} />
                                <AvatarFallback>{athlete.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{athlete.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Kayıt: {new Date(athlete.registrationDate).toLocaleDateString('tr-TR')}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{athlete.age}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{athlete.sport}</Badge>
                          </TableCell>
                          <TableCell>{athlete.parentName}</TableCell>
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
                              {athlete.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={athlete.paymentStatus === 'Güncel' ? 'default' : 'destructive'}>
                              {athlete.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
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
    </>
  );
}