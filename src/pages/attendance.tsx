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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  UserCheck, 
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
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  CalendarDays,
  Timer,
  Target,
  Activity,
  UserX,
  Percent
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

// Mock data
const attendanceRecords = [
  {
    id: 1,
    trainingId: 1,
    trainingTitle: "U14 Basketbol Antrenmanı",
    date: "2024-06-07",
    time: "16:00",
    sport: "Basketbol",
    coach: "Mehmet Özkan",
    totalStudents: 20,
    presentStudents: 18,
    absentStudents: 2,
    status: "Tamamlandı"
  },
  {
    id: 2,
    trainingId: 2,
    trainingTitle: "Yetişkin Yüzme Kursu",
    date: "2024-06-07",
    time: "18:00",
    sport: "Yüzme",
    coach: "Ayşe Kaya",
    totalStudents: 15,
    presentStudents: 12,
    absentStudents: 3,
    status: "Tamamlandı"
  },
  {
    id: 3,
    trainingId: 3,
    trainingTitle: "U16 Futbol Takım Antrenmanı",
    date: "2024-06-08",
    time: "09:00",
    sport: "Futbol",
    coach: "Ali Demir",
    totalStudents: 25,
    presentStudents: 22,
    absentStudents: 3,
    status: "Devam Ediyor"
  }
];

const studentAttendance = [
  {
    id: 1,
    name: "Ahmet Yılmaz",
    sport: "Basketbol",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
    attendanceRate: 95,
    totalSessions: 20,
    presentSessions: 19,
    absentSessions: 1,
    lastAttendance: "2024-06-07",
    status: "Aktif"
  },
  {
    id: 2,
    name: "Elif Demir",
    sport: "Yüzme",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face",
    attendanceRate: 80,
    totalSessions: 15,
    presentSessions: 12,
    absentSessions: 3,
    lastAttendance: "2024-06-05",
    status: "Aktif"
  },
  {
    id: 3,
    name: "Can Özkan",
    sport: "Futbol",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
    attendanceRate: 88,
    totalSessions: 25,
    presentSessions: 22,
    absentSessions: 3,
    lastAttendance: "2024-06-08",
    status: "Aktif"
  },
  {
    id: 4,
    name: "Zeynep Kaya",
    sport: "Hentbol",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face",
    attendanceRate: 70,
    totalSessions: 20,
    presentSessions: 14,
    absentSessions: 6,
    lastAttendance: "2024-06-06",
    status: "Risk"
  }
];

const todayTraining = {
  id: 1,
  title: "U14 Basketbol Antrenmanı",
  sport: "Basketbol",
  coach: "Mehmet Özkan",
  time: "16:00 - 17:30",
  location: "Spor Salonu A",
  students: [
    { id: 1, name: "Ahmet Yılmaz", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face", present: true },
    { id: 2, name: "Elif Demir", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face", present: true },
    { id: 3, name: "Can Özkan", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face", present: false },
    { id: 4, name: "Zeynep Kaya", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face", present: true },
    { id: 5, name: "Emre Şahin", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face", present: true }
  ]
};

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Sporcular", href: "/athletes" },
  { icon: CreditCard, label: "Ödemeler", href: "/payments" },
  { icon: Calendar, label: "Antrenmanlar", href: "/trainings" },
  { icon: UserCheck, label: "Yoklama", href: "/attendance", active: true },
  { icon: MessageCircle, label: "Mesajlar", href: "/messages" },
  { icon: Camera, label: "Medya", href: "/media" },
  { icon: FileText, label: "Raporlar", href: "/reports" },
  { icon: Settings, label: "Ayarlar", href: "/settings" }
];

export default function Attendance() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [attendanceData, setAttendanceData] = useState(todayTraining.students);

  const filteredStudents = studentAttendance.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = selectedSport === "all" || student.sport === selectedSport;
    
    return matchesSearch && matchesSport;
  });

  const totalAttendanceRate = Math.round(
    studentAttendance.reduce((sum, student) => sum + student.attendanceRate, 0) / studentAttendance.length
  );

  const presentToday = attendanceData.filter(s => s.present).length;
  const absentToday = attendanceData.filter(s => s.present === false).length;

  const getAttendanceRateBadge = (rate: number) => {
    if (rate >= 90) return <Badge className="bg-green-100 text-green-800 border-green-200">Mükemmel</Badge>;
    if (rate >= 80) return <Badge className="bg-blue-100 text-blue-800 border-blue-200">İyi</Badge>;
    if (rate >= 70) return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Orta</Badge>;
    return <Badge variant="destructive">Risk</Badge>;
  };

  const handleAttendanceChange = (studentId: number, present: boolean) => {
    setAttendanceData(prev => 
      prev.map(student => 
        student.id === studentId ? { ...student, present } : student
      )
    );
  };

  const saveAttendance = () => {
    // Yoklama kaydetme işlemi
    console.log("Attendance saved:", attendanceData);
    setIsAttendanceDialogOpen(false);
  };

  return (
    <>
      <Head>
        <title>Yoklama - SportsCRM</title>
        <meta name="description" content="Yoklama sistemi ve devamsızlık takibi" />
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
                <h1 className="text-2xl font-bold text-foreground">Yoklama Sistemi</h1>
                <p className="text-muted-foreground">Devamsızlık takibi ve yoklama yönetimi</p>
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
                        <p className="text-sm font-medium text-muted-foreground">Genel Devam Oranı</p>
                        <p className="text-2xl font-bold">{totalAttendanceRate}%</p>
                      </div>
                      <Percent className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Bugün Katılan</p>
                        <p className="text-2xl font-bold text-green-600">{presentToday}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Bugün Katılmayan</p>
                        <p className="text-2xl font-bold text-red-600">{absentToday}</p>
                      </div>
                      <XCircle className="h-8 w-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Risk Altında</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {studentAttendance.filter(s => s.attendanceRate < 80).length}
                        </p>
                      </div>
                      <AlertCircle className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="take-attendance" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="take-attendance">Yoklama Al</TabsTrigger>
                  <TabsTrigger value="attendance-records">Yoklama Kayıtları</TabsTrigger>
                  <TabsTrigger value="student-stats">Sporcu İstatistikleri</TabsTrigger>
                </TabsList>

                <TabsContent value="take-attendance" className="space-y-6">
                  {/* Today's Training */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Bugünkü Antrenman Yoklaması</CardTitle>
                          <CardDescription>
                            {todayTraining.title} - {todayTraining.time}
                          </CardDescription>
                        </div>
                        <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
                          <DialogTrigger asChild>
                            <Button>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Yoklama Al
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Yoklama Alma</DialogTitle>
                              <DialogDescription>
                                {todayTraining.title} - {todayTraining.time}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
                              {attendanceData.map((student) => (
                                <div key={student.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                                  <Avatar>
                                    <AvatarImage src={student.avatar} />
                                    <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                  </Avatar>
                                  
                                  <div className="flex-1">
                                    <p className="font-medium">{student.name}</p>
                                  </div>
                                  
                                  <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                      <Checkbox 
                                        id={`present-${student.id}`}
                                        checked={student.present}
                                        onCheckedChange={(checked) => 
                                          handleAttendanceChange(student.id, checked as boolean)
                                        }
                                      />
                                      <Label htmlFor={`present-${student.id}`} className="text-sm">
                                        Katıldı
                                      </Label>
                                    </div>
                                    
                                    {student.present ? (
                                      <CheckCircle className="h-5 w-5 text-green-600" />
                                    ) : (
                                      <XCircle className="h-5 w-5 text-red-600" />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <div className="flex justify-between items-center pt-4 border-t">
                              <div className="text-sm text-muted-foreground">
                                Katılan: {attendanceData.filter(s => s.present).length} / {attendanceData.length}
                              </div>
                              <div className="flex space-x-2">
                                <Button variant="outline" onClick={() => setIsAttendanceDialogOpen(false)}>
                                  İptal
                                </Button>
                                <Button onClick={saveAttendance}>
                                  Yoklamayı Kaydet
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3">Antrenman Bilgileri</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Spor:</span>
                              <Badge variant="outline">{todayTraining.sport}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Antrenör:</span>
                              <span>{todayTraining.coach}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Lokasyon:</span>
                              <span>{todayTraining.location}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Toplam Sporcu:</span>
                              <span>{attendanceData.length}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-3">Katılım Durumu</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm">Katılan</span>
                              </div>
                              <span className="font-medium text-green-600">{presentToday}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <XCircle className="h-4 w-4 text-red-600" />
                                <span className="text-sm">Katılmayan</span>
                              </div>
                              <span className="font-medium text-red-600">{absentToday}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 mt-3">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${(presentToday / attendanceData.length) * 100}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-muted-foreground text-center">
                              Katılım Oranı: {Math.round((presentToday / attendanceData.length) * 100)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Hızlı İşlemler</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button variant="outline" className="h-20 flex flex-col space-y-2">
                          <Send className="h-6 w-6" />
                          <span className="text-sm">Devamsızlık Bildirimi</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col space-y-2">
                          <Download className="h-6 w-6" />
                          <span className="text-sm">Rapor İndir</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col space-y-2">
                          <MessageCircle className="h-6 w-6" />
                          <span className="text-sm">Toplu Mesaj</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="attendance-records" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Yoklama Kayıtları</CardTitle>
                      <CardDescription>
                        Geçmiş antrenman yoklama kayıtları
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Antrenman</TableHead>
                            <TableHead>Tarih & Saat</TableHead>
                            <TableHead>Antrenör</TableHead>
                            <TableHead>Toplam</TableHead>
                            <TableHead>Katılan</TableHead>
                            <TableHead>Katılmayan</TableHead>
                            <TableHead>Oran</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead>İşlemler</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {attendanceRecords.map((record) => (
                            <TableRow key={record.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{record.trainingTitle}</p>
                                  <Badge variant="outline" className="text-xs">{record.sport}</Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="text-sm">{new Date(record.date).toLocaleDateString('tr-TR')}</p>
                                  <p className="text-xs text-muted-foreground">{record.time}</p>
                                </div>
                              </TableCell>
                              <TableCell>{record.coach}</TableCell>
                              <TableCell>{record.totalStudents}</TableCell>
                              <TableCell>
                                <span className="text-green-600 font-medium">{record.presentStudents}</span>
                              </TableCell>
                              <TableCell>
                                <span className="text-red-600 font-medium">{record.absentStudents}</span>
                              </TableCell>
                              <TableCell>
                                <span className="font-medium">
                                  {Math.round((record.presentStudents / record.totalStudents) * 100)}%
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge variant={record.status === "Tamamlandı" ? "default" : "secondary"}>
                                  {record.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Download className="h-4 w-4" />
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

                <TabsContent value="student-stats" className="space-y-6">
                  {/* Filters */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex flex-col md:flex-row gap-4 flex-1">
                          <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input 
                              placeholder="Sporcu adı ara..." 
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
                              <SelectItem value="Basketbol">Basketbol</SelectItem>
                              <SelectItem value="Futbol">Futbol</SelectItem>
                              <SelectItem value="Yüzme">Yüzme</SelectItem>
                              <SelectItem value="Hentbol">Hentbol</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <Button variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Rapor İndir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Student Statistics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Sporcu Devam İstatistikleri ({filteredStudents.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Sporcu</TableHead>
                            <TableHead>Spor Branşı</TableHead>
                            <TableHead>Toplam Antrenman</TableHead>
                            <TableHead>Katıldığı</TableHead>
                            <TableHead>Katılmadığı</TableHead>
                            <TableHead>Devam Oranı</TableHead>
                            <TableHead>Son Katılım</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead>İşlemler</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredStudents.map((student) => (
                            <TableRow key={student.id}>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <Avatar>
                                    <AvatarImage src={student.avatar} />
                                    <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">{student.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{student.sport}</Badge>
                              </TableCell>
                              <TableCell>{student.totalSessions}</TableCell>
                              <TableCell>
                                <span className="text-green-600 font-medium">{student.presentSessions}</span>
                              </TableCell>
                              <TableCell>
                                <span className="text-red-600 font-medium">{student.absentSessions}</span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">{student.attendanceRate}%</span>
                                  <div className="w-16 bg-muted rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full ${
                                        student.attendanceRate >= 90 ? 'bg-green-600' :
                                        student.attendanceRate >= 80 ? 'bg-blue-600' :
                                        student.attendanceRate >= 70 ? 'bg-orange-600' : 'bg-red-600'
                                      }`}
                                      style={{ width: `${student.attendanceRate}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {new Date(student.lastAttendance).toLocaleDateString('tr-TR')}
                              </TableCell>
                              <TableCell>
                                {getAttendanceRateBadge(student.attendanceRate)}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Send className="h-4 w-4" />
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
              </Tabs>
            </motion.div>
          </main>
        </div>
      </div>
    </>
  );
}