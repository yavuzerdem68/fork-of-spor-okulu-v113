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
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar, 
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Clock,
  Users,
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
  MapPin,
  Share,
  Copy,
  Send,
  CalendarDays,
  Timer,
  Target,
  Activity
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

// Mock data
const trainings = [
  {
    id: 1,
    sport: "Basketbol",
    title: "U14 Basketbol Antrenmanı",
    coach: "Mehmet Özkan",
    date: "2024-06-07",
    startTime: "16:00",
    endTime: "17:30",
    location: "Spor Salonu A",
    participants: 15,
    maxParticipants: 20,
    status: "Aktif",
    description: "Temel basketbol becerileri ve takım oyunu",
    ageGroup: "U14",
    level: "Başlangıç"
  },
  {
    id: 2,
    sport: "Yüzme",
    title: "Yetişkin Yüzme Kursu",
    coach: "Ayşe Kaya",
    date: "2024-06-07",
    startTime: "18:00",
    endTime: "19:00",
    location: "Yüzme Havuzu",
    participants: 12,
    maxParticipants: 15,
    status: "Aktif",
    description: "Serbest stil ve kurbağalama teknikleri",
    ageGroup: "Yetişkin",
    level: "Orta"
  },
  {
    id: 3,
    sport: "Futbol",
    title: "U16 Futbol Takım Antrenmanı",
    coach: "Ali Demir",
    date: "2024-06-08",
    startTime: "09:00",
    endTime: "10:30",
    location: "Futbol Sahası",
    participants: 22,
    maxParticipants: 25,
    status: "Aktif",
    description: "Taktik çalışması ve kondisyon",
    ageGroup: "U16",
    level: "İleri"
  },
  {
    id: 4,
    sport: "Hentbol",
    title: "Kadın Hentbol Antrenmanı",
    coach: "Fatma Şen",
    date: "2024-06-08",
    startTime: "19:00",
    endTime: "20:30",
    location: "Spor Salonu B",
    participants: 18,
    maxParticipants: 20,
    status: "Aktif",
    description: "Hücum stratejileri ve savunma",
    ageGroup: "Yetişkin",
    level: "İleri"
  },
  {
    id: 5,
    sport: "Voleybol",
    title: "U12 Voleybol Temel Eğitimi",
    coach: "Hasan Yıldız",
    date: "2024-06-09",
    startTime: "14:00",
    endTime: "15:00",
    location: "Spor Salonu A",
    participants: 10,
    maxParticipants: 16,
    status: "Planlandı",
    description: "Voleybol temel becerileri",
    ageGroup: "U12",
    level: "Başlangıç"
  }
];

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Sporcular", href: "/athletes" },
  { icon: CreditCard, label: "Ödemeler", href: "/payments" },
  { icon: Calendar, label: "Antrenmanlar", href: "/trainings", active: true },
  { icon: UserCheck, label: "Yoklama", href: "/attendance" },
  { icon: MessageCircle, label: "Mesajlar", href: "/messages" },
  { icon: Camera, label: "Medya", href: "/media" },
  { icon: FileText, label: "Raporlar", href: "/reports" },
  { icon: Settings, label: "Ayarlar", href: "/settings" }
];

const sports = ["Basketbol", "Futbol", "Voleybol", "Hentbol", "Yüzme", "Satranç", "Akıl ve Zeka Oyunları"];
const coaches = ["Mehmet Özkan", "Ayşe Kaya", "Ali Demir", "Fatma Şen", "Hasan Yıldız"];
const locations = ["Spor Salonu A", "Spor Salonu B", "Futbol Sahası", "Yüzme Havuzu", "Satranç Odası"];
const ageGroups = ["U8", "U10", "U12", "U14", "U16", "U18", "Yetişkin"];
const levels = ["Başlangıç", "Orta", "İleri"];

export default function Trainings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredTrainings = trainings.filter(training => {
    const matchesSearch = training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         training.coach.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         training.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = selectedSport === "all" || training.sport === selectedSport;
    const matchesStatus = selectedStatus === "all" || training.status === selectedStatus;
    
    return matchesSearch && matchesSport && matchesStatus;
  });

  const todayTrainings = trainings.filter(t => t.date === new Date().toISOString().split('T')[0]);
  const activeTrainings = trainings.filter(t => t.status === "Aktif");
  const totalParticipants = trainings.reduce((sum, t) => sum + t.participants, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Aktif":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Aktif</Badge>;
      case "Planlandı":
        return <Badge variant="outline">Planlandı</Badge>;
      case "Tamamlandı":
        return <Badge variant="secondary">Tamamlandı</Badge>;
      case "İptal":
        return <Badge variant="destructive">İptal</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "Başlangıç":
        return <Badge variant="outline" className="text-green-600 border-green-200">Başlangıç</Badge>;
      case "Orta":
        return <Badge variant="outline" className="text-orange-600 border-orange-200">Orta</Badge>;
      case "İleri":
        return <Badge variant="outline" className="text-red-600 border-red-200">İleri</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  return (
    <>
      <Head>
        <title>Antrenmanlar - SportsCRM</title>
        <meta name="description" content="Antrenman programları yönetimi" />
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
                <h1 className="text-2xl font-bold text-foreground">Antrenmanlar</h1>
                <p className="text-muted-foreground">Antrenman programları ve takvim yönetimi</p>
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
                        <p className="text-sm font-medium text-muted-foreground">Bugünkü Antrenmanlar</p>
                        <p className="text-2xl font-bold">{todayTrainings.length}</p>
                      </div>
                      <CalendarDays className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Aktif Antrenmanlar</p>
                        <p className="text-2xl font-bold">{activeTrainings.length}</p>
                      </div>
                      <Activity className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Toplam Katılımcı</p>
                        <p className="text-2xl font-bold">{totalParticipants}</p>
                      </div>
                      <Users className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Antrenör Sayısı</p>
                        <p className="text-2xl font-bold">{coaches.length}</p>
                      </div>
                      <Target className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="schedule" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="schedule">Program</TabsTrigger>
                  <TabsTrigger value="calendar">Takvim</TabsTrigger>
                  <TabsTrigger value="coaches">Antrenörler</TabsTrigger>
                </TabsList>

                <TabsContent value="schedule" className="space-y-6">
                  {/* Filters and Actions */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex flex-col md:flex-row gap-4 flex-1">
                          <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input 
                              placeholder="Antrenman, antrenör veya lokasyon ara..." 
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
                              <SelectItem value="Planlandı">Planlandı</SelectItem>
                              <SelectItem value="Tamamlandı">Tamamlandı</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline">
                            <Share className="h-4 w-4 mr-2" />
                            Programı Paylaş
                          </Button>
                          
                          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                              <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Yeni Antrenman
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Yeni Antrenman Programı</DialogTitle>
                                <DialogDescription>
                                  Antrenman detaylarını girin
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="grid grid-cols-2 gap-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="title">Antrenman Başlığı</Label>
                                  <Input id="title" placeholder="U14 Basketbol Antrenmanı" />
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
                                  <Label htmlFor="coach">Antrenör</Label>
                                  <Select>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Antrenör seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {coaches.map(coach => (
                                        <SelectItem key={coach} value={coach}>{coach}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="location">Lokasyon</Label>
                                  <Select>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Lokasyon seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {locations.map(location => (
                                        <SelectItem key={location} value={location}>{location}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="date">Tarih</Label>
                                  <Input id="date" type="date" />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="startTime">Başlangıç Saati</Label>
                                  <Input id="startTime" type="time" />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="endTime">Bitiş Saati</Label>
                                  <Input id="endTime" type="time" />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="maxParticipants">Maksimum Katılımcı</Label>
                                  <Input id="maxParticipants" type="number" placeholder="20" />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="ageGroup">Yaş Grubu</Label>
                                  <Select>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Yaş grubu seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {ageGroups.map(age => (
                                        <SelectItem key={age} value={age}>{age}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="level">Seviye</Label>
                                  <Select>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seviye seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {levels.map(level => (
                                        <SelectItem key={level} value={level}>{level}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="col-span-2 space-y-2">
                                  <Label htmlFor="description">Açıklama</Label>
                                  <Textarea id="description" placeholder="Antrenman içeriği ve hedefleri" />
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

                  {/* Trainings Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Antrenman Listesi ({filteredTrainings.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Antrenman</TableHead>
                            <TableHead>Antrenör</TableHead>
                            <TableHead>Tarih & Saat</TableHead>
                            <TableHead>Lokasyon</TableHead>
                            <TableHead>Katılımcı</TableHead>
                            <TableHead>Seviye</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead>İşlemler</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredTrainings.map((training) => (
                            <TableRow key={training.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{training.title}</p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Badge variant="outline">{training.sport}</Badge>
                                    <Badge variant="secondary" className="text-xs">{training.ageGroup}</Badge>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs">
                                      {training.coach.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{training.coach}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="text-sm font-medium">
                                    {new Date(training.date).toLocaleDateString('tr-TR')}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {training.startTime} - {training.endTime}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm">{training.location}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-center">
                                  <p className="text-sm font-medium">
                                    {training.participants}/{training.maxParticipants}
                                  </p>
                                  <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                                    <div 
                                      className="bg-primary h-1.5 rounded-full" 
                                      style={{ width: `${(training.participants / training.maxParticipants) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{getLevelBadge(training.level)}</TableCell>
                              <TableCell>{getStatusBadge(training.status)}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Copy className="h-4 w-4" />
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

                <TabsContent value="calendar" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Antrenman Takvimi</CardTitle>
                      <CardDescription>
                        Haftalık ve aylık antrenman programı görünümü
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Input 
                            type="date" 
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-48"
                          />
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Haftalık</Button>
                            <Button variant="outline" size="sm">Aylık</Button>
                            <Button size="sm">Bugün</Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-7 gap-4">
                          {['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'].map((day, index) => (
                            <Card key={day} className="min-h-[200px]">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">{day}</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                {trainings.slice(0, 2).map((training, i) => (
                                  <div key={i} className="p-2 bg-primary/10 rounded text-xs">
                                    <p className="font-medium">{training.startTime}</p>
                                    <p className="text-muted-foreground">{training.sport}</p>
                                  </div>
                                ))}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="coaches" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Antrenör Yönetimi</CardTitle>
                      <CardDescription>
                        Antrenör bilgileri ve program atamaları
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {coaches.map((coach, index) => (
                          <Card key={coach}>
                            <CardContent className="p-6">
                              <div className="flex items-center space-x-4 mb-4">
                                <Avatar>
                                  <AvatarFallback>{coach.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-medium">{coach}</h3>
                                  <p className="text-sm text-muted-foreground">Antrenör</p>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Aktif Antrenmanlar:</span>
                                  <span className="font-medium">
                                    {trainings.filter(t => t.coach === coach && t.status === "Aktif").length}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Toplam Sporcu:</span>
                                  <span className="font-medium">
                                    {trainings.filter(t => t.coach === coach).reduce((sum, t) => sum + t.participants, 0)}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex gap-2 mt-4">
                                <Button size="sm" variant="outline" className="flex-1">
                                  <Eye className="h-3 w-3 mr-1" />
                                  Detay
                                </Button>
                                <Button size="sm" variant="outline" className="flex-1">
                                  <Send className="h-3 w-3 mr-1" />
                                  Mesaj
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
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