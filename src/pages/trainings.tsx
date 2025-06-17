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
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar, 
  Plus,
  Search,
  Edit,
  Eye,
  MapPin,
  Share,
  Copy,
  Send,
  CalendarDays,
  Target,
  Activity,
  ArrowLeft,
  Users
} from "lucide-react";
import { useRouter } from "next/router";
import Link from "next/link";
import Header from "@/components/Header";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

// Load trainings from localStorage
const loadTrainings = () => {
  const storedTrainings = localStorage.getItem('trainings');
  return storedTrainings ? JSON.parse(storedTrainings) : [];
};

const sports = [
  "Basketbol", "Hentbol", "Yüzme", "Akıl ve Zeka Oyunları", "Satranç", "Futbol", "Voleybol",
  "Tenis", "Badminton", "Masa Tenisi", "Atletizm", "Jimnastik", "Karate", "Taekwondo",
  "Judo", "Boks", "Güreş", "Halter", "Bisiklet", "Kayak", "Buz Pateni", "Eskrim"
];

// Load coaches from localStorage
const loadCoaches = () => {
  const storedCoaches = localStorage.getItem('coaches');
  return storedCoaches ? JSON.parse(storedCoaches) : [];
};

const locations = ["Spor Salonu A", "Spor Salonu B", "Futbol Sahası", "Yüzme Havuzu", "Satranç Odası"];
const ageGroups = ["U8", "U10", "U12", "U14", "U16", "U18", "Yetişkin"];
const levels = ["Başlangıç", "Orta", "İleri"];

export default function Trainings() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [trainings, setTrainings] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    sport: "",
    coach: "",
    location: "",
    date: "",
    startTime: "",
    endTime: "",
    maxParticipants: "",
    ageGroup: "",
    level: "",
    description: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    
    if (!role || (role !== "admin" && role !== "coach")) {
      router.push("/login");
      return;
    }

    setUserRole(role);
    setTrainings(loadTrainings());
    setCoaches(loadCoaches());
  }, [router]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.title || !formData.sport || !formData.coach || !formData.location || 
        !formData.date || !formData.startTime || !formData.endTime || !formData.maxParticipants) {
      setError("Lütfen tüm zorunlu alanları doldurun");
      return;
    }

    const newTraining = {
      id: Date.now().toString(),
      title: formData.title,
      sport: formData.sport,
      coach: formData.coach,
      location: formData.location,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      maxParticipants: parseInt(formData.maxParticipants),
      participants: 0,
      ageGroup: formData.ageGroup || "Genel",
      level: formData.level || "Başlangıç",
      description: formData.description,
      status: "Aktif",
      createdAt: new Date().toISOString()
    };

    const updatedTrainings = [...trainings, newTraining];
    setTrainings(updatedTrainings);
    localStorage.setItem('trainings', JSON.stringify(updatedTrainings));
    
    setSuccess("Antrenman başarıyla eklendi");
    resetForm();
    setIsAddDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      sport: "",
      coach: "",
      location: "",
      date: "",
      startTime: "",
      endTime: "",
      maxParticipants: "",
      ageGroup: "",
      level: "",
      description: ""
    });
    setError("");
  };

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
                <Calendar className="w-6 h-6 text-primary" />
                <h1 className="text-3xl font-bold">Antrenmanlar</h1>
              </div>
              <p className="text-muted-foreground">Antrenman programları ve takvim yönetimi</p>
            </div>
          </motion.div>

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
                              
                              <form onSubmit={handleSubmit}>
                                {error && (
                                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-sm text-red-600">{error}</p>
                                  </div>
                                )}
                                
                                {success && (
                                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                                    <p className="text-sm text-green-600">{success}</p>
                                  </div>
                                )}

                                <div className="grid grid-cols-2 gap-4 py-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="title">Antrenman Başlığı *</Label>
                                    <Input 
                                      id="title" 
                                      placeholder="U14 Basketbol Antrenmanı"
                                      value={formData.title}
                                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                                      required
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="sport">Spor Branşı *</Label>
                                    <Select value={formData.sport} onValueChange={(value) => setFormData({...formData, sport: value})}>
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
                                    <Label htmlFor="coach">Antrenör *</Label>
                                    <Select value={formData.coach} onValueChange={(value) => setFormData({...formData, coach: value})}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Antrenör seçin" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {coaches.map((coach, index) => {
                                          const coachName = typeof coach === 'string' 
                                            ? coach 
                                            : `${coach.name || ''} ${coach.surname || ''}`.trim();
                                          return (
                                            <SelectItem key={coach.id || index} value={coachName}>
                                              {coachName}
                                            </SelectItem>
                                          );
                                        })}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="location">Lokasyon *</Label>
                                    <Select value={formData.location} onValueChange={(value) => setFormData({...formData, location: value})}>
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
                                    <Label htmlFor="date">Tarih *</Label>
                                    <Input 
                                      id="date" 
                                      type="date"
                                      value={formData.date}
                                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                                      required
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="startTime">Başlangıç Saati *</Label>
                                    <Input 
                                      id="startTime" 
                                      type="time"
                                      value={formData.startTime}
                                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                                      required
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="endTime">Bitiş Saati *</Label>
                                    <Input 
                                      id="endTime" 
                                      type="time"
                                      value={formData.endTime}
                                      onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                                      required
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="maxParticipants">Maksimum Katılımcı *</Label>
                                    <Input 
                                      id="maxParticipants" 
                                      type="number" 
                                      placeholder="20"
                                      value={formData.maxParticipants}
                                      onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
                                      required
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="ageGroup">Yaş Grubu</Label>
                                    <Select value={formData.ageGroup} onValueChange={(value) => setFormData({...formData, ageGroup: value})}>
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
                                    <Select value={formData.level} onValueChange={(value) => setFormData({...formData, level: value})}>
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
                                    <Textarea 
                                      id="description" 
                                      placeholder="Antrenman içeriği ve hedefleri"
                                      value={formData.description}
                                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    />
                                  </div>
                                </div>
                                
                                <div className="flex justify-end space-x-2">
                                  <Button type="button" variant="outline" onClick={() => {
                                    setIsAddDialogOpen(false);
                                    resetForm();
                                  }}>
                                    İptal
                                  </Button>
                                  <Button type="submit">
                                    Kaydet
                                  </Button>
                                </div>
                              </form>
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
                      {filteredTrainings.length > 0 ? (
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
                      ) : (
                        <div className="text-center py-8">
                          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">Henüz antrenman programı bulunmuyor</p>
                        </div>
                      )}
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
                      {coaches.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {coaches.map((coach, index) => (
                            <Card key={coach.id || index}>
                              <CardContent className="p-6">
                                <div className="flex items-center space-x-4 mb-4">
                                  <Avatar>
                                    <AvatarFallback>
                                      {typeof coach === 'string' 
                                        ? coach.split(' ').map(n => n[0]).join('') 
                                        : `${coach.name || ''} ${coach.surname || ''}`.split(' ').map(n => n[0]).join('')
                                      }
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h3 className="font-medium">
                                      {typeof coach === 'string' 
                                        ? coach 
                                        : `${coach.name || ''} ${coach.surname || ''}`.trim()
                                      }
                                    </h3>
                                    <p className="text-sm text-muted-foreground">Antrenör</p>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>Aktif Antrenmanlar:</span>
                                    <span className="font-medium">
                                      {trainings.filter(t => {
                                        const coachName = typeof coach === 'string' 
                                          ? coach 
                                          : `${coach.name || ''} ${coach.surname || ''}`.trim();
                                        return t.coach === coachName && t.status === "Aktif";
                                      }).length}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Toplam Sporcu:</span>
                                    <span className="font-medium">
                                      {trainings.filter(t => {
                                        const coachName = typeof coach === 'string' 
                                          ? coach 
                                          : `${coach.name || ''} ${coach.surname || ''}`.trim();
                                        return t.coach === coachName;
                                      }).reduce((sum, t) => sum + (t.participants || 0), 0)}
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
                      ) : (
                        <div className="text-center py-8">
                          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">Henüz antrenör kaydı bulunmuyor</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
          </motion.div>
        </div>
      </div>
    </>
  );
}