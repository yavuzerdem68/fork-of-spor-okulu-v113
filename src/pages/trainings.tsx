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
import { Checkbox } from "@/components/ui/checkbox";
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
  Users,
  UserPlus,
  Trash2
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
  "Judo", "Boks", "Güreş", "Halter", "Bisiklet", "Kayak", "Buz Pateni", "Eskrim", "Hareket Eğitimi"
];

// Load coaches from localStorage
const loadCoaches = () => {
  const storedCoaches = localStorage.getItem('coaches');
  return storedCoaches ? JSON.parse(storedCoaches) : [];
};

// Load athletes from localStorage
const loadAthletes = () => {
  const storedAthletes = localStorage.getItem('students');
  return storedAthletes ? JSON.parse(storedAthletes).filter((athlete: any) => athlete.status === 'Aktif' || !athlete.status) : [];
};

// Load training locations from system settings
const loadTrainingLocations = () => {
  const settings = localStorage.getItem('systemSettings');
  if (settings) {
    const parsedSettings = JSON.parse(settings);
    return parsedSettings.trainingLocations || ['Ana Salon', 'Yan Salon', 'Dış Saha'];
  }
  return ['Ana Salon', 'Yan Salon', 'Dış Saha'];
};
const ageGroups = ["U8", "U10", "U12", "U14", "U16", "U18", "Yetişkin"];
const levels = ["Başlangıç", "Orta", "İleri"];

export default function Trainings() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [trainings, setTrainings] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [trainingLocations, setTrainingLocations] = useState<string[]>([]);
  const [selectedTraining, setSelectedTraining] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    sport: "",
    coach: "",
    location: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    maxParticipants: "",
    ageGroup: "",
    level: "",
    description: "",
    assignedAthletes: [] as string[],
    isRecurring: false,
    recurringDays: [] as string[]
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
    setAthletes(loadAthletes());
    setTrainingLocations(loadTrainingLocations());
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
  const totalParticipants = trainings.reduce((sum, t) => sum + (t.assignedAthletes?.length || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.title || !formData.sport || !formData.coach || !formData.location || 
        !formData.startDate || !formData.startTime || !formData.endTime || !formData.maxParticipants) {
      setError("Lütfen tüm zorunlu alanları doldurun");
      return;
    }

    if (formData.endDate && formData.endDate < formData.startDate) {
      setError("Bitiş tarihi başlangıç tarihinden önce olamaz");
      return;
    }

    const newTraining = {
      id: Date.now().toString(),
      title: formData.title,
      sport: formData.sport,
      coach: formData.coach,
      location: formData.location,
      startDate: formData.startDate,
      endDate: formData.endDate || formData.startDate,
      date: formData.startDate, // Keep for backward compatibility
      startTime: formData.startTime,
      endTime: formData.endTime,
      maxParticipants: parseInt(formData.maxParticipants),
      participants: formData.assignedAthletes.length,
      ageGroup: formData.ageGroup || "Genel",
      level: formData.level || "Başlangıç",
      description: formData.description,
      assignedAthletes: formData.assignedAthletes,
      isRecurring: formData.isRecurring,
      recurringDays: formData.recurringDays,
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

  const handleEdit = (training: any) => {
    setSelectedTraining(training);
    setFormData({
      title: training.title,
      sport: training.sport,
      coach: training.coach,
      location: training.location,
      startDate: training.startDate || training.date,
      endDate: training.endDate || '',
      startTime: training.startTime,
      endTime: training.endTime,
      maxParticipants: training.maxParticipants.toString(),
      ageGroup: training.ageGroup,
      level: training.level,
      description: training.description,
      assignedAthletes: training.assignedAthletes || [],
      isRecurring: training.isRecurring || false,
      recurringDays: training.recurringDays || []
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedTraining) return;

    // Validation
    if (!formData.title || !formData.sport || !formData.coach || !formData.location || 
        !formData.startDate || !formData.startTime || !formData.endTime || !formData.maxParticipants) {
      setError("Lütfen tüm zorunlu alanları doldurun");
      return;
    }

    if (formData.endDate && formData.endDate < formData.startDate) {
      setError("Bitiş tarihi başlangıç tarihinden önce olamaz");
      return;
    }

    const updatedTraining = {
      ...selectedTraining,
      title: formData.title,
      sport: formData.sport,
      coach: formData.coach,
      location: formData.location,
      startDate: formData.startDate,
      endDate: formData.endDate || formData.startDate,
      date: formData.startDate, // Keep for backward compatibility
      startTime: formData.startTime,
      endTime: formData.endTime,
      maxParticipants: parseInt(formData.maxParticipants),
      participants: formData.assignedAthletes.length,
      ageGroup: formData.ageGroup,
      level: formData.level,
      description: formData.description,
      assignedAthletes: formData.assignedAthletes,
      isRecurring: formData.isRecurring,
      recurringDays: formData.recurringDays,
      updatedAt: new Date().toISOString()
    };

    const updatedTrainings = trainings.map(t => 
      t.id === selectedTraining.id ? updatedTraining : t
    );
    
    setTrainings(updatedTrainings);
    localStorage.setItem('trainings', JSON.stringify(updatedTrainings));
    
    setSuccess("Antrenman başarıyla güncellendi");
    resetForm();
    setIsEditDialogOpen(false);
    setSelectedTraining(null);
  };

  const handleView = (training: any) => {
    setSelectedTraining(training);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (training: any) => {
    if (confirm(`"${training.title}" antrenmanını silmek istediğinizden emin misiniz?`)) {
      const updatedTrainings = trainings.filter(t => t.id !== training.id);
      setTrainings(updatedTrainings);
      localStorage.setItem('trainings', JSON.stringify(updatedTrainings));
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      sport: "",
      coach: "",
      location: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      maxParticipants: "",
      ageGroup: "",
      level: "",
      description: "",
      assignedAthletes: [],
      isRecurring: false,
      recurringDays: []
    });
    setError("");
    setSuccess("");
  };

  const handleAthleteToggle = (athleteId: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        assignedAthletes: [...prev.assignedAthletes, athleteId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        assignedAthletes: prev.assignedAthletes.filter(id => id !== athleteId)
      }));
    }
  };

  const getFilteredAthletes = () => {
    if (!formData.sport || formData.sport === "") return athletes;
    
    // First filter by sport branch
    let filteredAthletes = athletes.filter(athlete => 
      athlete.sportsBranches?.includes(formData.sport) || 
      athlete.selectedSports?.includes(formData.sport)
    );

    // If age group is selected, filter by age compatibility
    if (formData.ageGroup && formData.ageGroup !== "") {
      filteredAthletes = filteredAthletes.filter(athlete => {
        const athleteAge = parseInt(athlete.studentAge) || 0;
        
        // Age group compatibility logic
        switch (formData.ageGroup) {
          case "U8":
            return athleteAge <= 8;
          case "U10":
            return athleteAge <= 10;
          case "U12":
            return athleteAge <= 12;
          case "U14":
            return athleteAge <= 14;
          case "U16":
            return athleteAge <= 16;
          case "U18":
            return athleteAge <= 18;
          case "Yetişkin":
            return athleteAge >= 18;
          default:
            return true; // "Genel" or other cases
        }
      });
    }

    // Exclude athletes who are already assigned to other trainings of the same sport but different age groups
    if (formData.ageGroup && formData.ageGroup !== "") {
      const otherTrainings = trainings.filter(training => 
        training.sport === formData.sport && 
        training.ageGroup !== formData.ageGroup &&
        training.id !== selectedTraining?.id // Exclude current training when editing
      );

      const assignedAthleteIds = new Set();
      otherTrainings.forEach(training => {
        if (training.assignedAthletes) {
          training.assignedAthletes.forEach((athleteId: string) => {
            assignedAthleteIds.add(athleteId);
          });
        }
      });

      filteredAthletes = filteredAthletes.filter(athlete => 
        !assignedAthleteIds.has(athlete.id.toString())
      );
    }

    return filteredAthletes;
  };

  const getAthleteById = (id: string) => {
    return athletes.find(athlete => athlete.id.toString() === id);
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
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Yeni Antrenman Programı</DialogTitle>
                                <DialogDescription>
                                  Antrenman detaylarını girin ve sporcuları atayın
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
                                    <Select value={formData.sport} onValueChange={(value) => setFormData({...formData, sport: value, assignedAthletes: []})}>
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
                                          const coachSports = coach.sportsBranches || [];
                                          return (
                                            <SelectItem key={coach.id || index} value={coachName}>
                                              <div className="flex flex-col">
                                                <span className="font-medium">{coachName}</span>
                                                <span className="text-xs text-muted-foreground">
                                                  {coachSports.join(', ') || 'Genel'}
                                                </span>
                                              </div>
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
                                        {trainingLocations.map(location => (
                                          <SelectItem key={location} value={location}>{location}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="startDate">Başlangıç Tarihi *</Label>
                                    <Input 
                                      id="startDate" 
                                      type="date"
                                      value={formData.startDate}
                                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                      required
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="endDate">Bitiş Tarihi (Opsiyonel)</Label>
                                    <Input 
                                      id="endDate" 
                                      type="date"
                                      value={formData.endDate}
                                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                                      placeholder="Uzun süreli antrenmanlar için"
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

                                  {/* Tekrarlanan Antrenman Günleri */}
                                  <div className="col-span-2 space-y-4">
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        id="isRecurring"
                                        checked={formData.isRecurring}
                                        onChange={(e) => setFormData({...formData, isRecurring: e.target.checked, recurringDays: []})}
                                        className="rounded"
                                      />
                                      <Label htmlFor="isRecurring" className="font-medium">
                                        Tekrarlanan Antrenman (Haftalık)
                                      </Label>
                                    </div>
                                    
                                    {formData.isRecurring && (
                                      <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
                                        <Label className="text-sm font-medium">Antrenman Günleri:</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                          {[
                                            { key: 'monday', label: 'Pazartesi' },
                                            { key: 'tuesday', label: 'Salı' },
                                            { key: 'wednesday', label: 'Çarşamba' },
                                            { key: 'thursday', label: 'Perşembe' },
                                            { key: 'friday', label: 'Cuma' },
                                            { key: 'saturday', label: 'Cumartesi' },
                                            { key: 'sunday', label: 'Pazar' }
                                          ].map((day) => (
                                            <div key={day.key} className="flex items-center space-x-2">
                                              <input
                                                type="checkbox"
                                                id={`day-${day.key}`}
                                                checked={formData.recurringDays.includes(day.key)}
                                                onChange={(e) => {
                                                  if (e.target.checked) {
                                                    setFormData(prev => ({
                                                      ...prev,
                                                      recurringDays: [...prev.recurringDays, day.key]
                                                    }));
                                                  } else {
                                                    setFormData(prev => ({
                                                      ...prev,
                                                      recurringDays: prev.recurringDays.filter(d => d !== day.key)
                                                    }));
                                                  }
                                                }}
                                                className="rounded"
                                              />
                                              <Label htmlFor={`day-${day.key}`} className="text-sm">
                                                {day.label}
                                              </Label>
                                            </div>
                                          ))}
                                        </div>
                                        {formData.recurringDays.length === 0 && (
                                          <p className="text-sm text-muted-foreground">
                                            En az bir gün seçmelisiniz
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Athlete Assignment */}
                                {formData.sport && (
                                  <div className="space-y-4 border-t pt-4">
                                    <div className="flex items-center space-x-2">
                                      <UserPlus className="h-5 w-5 text-primary" />
                                      <Label className="text-lg font-medium">Sporcu Ataması</Label>
                                      <Badge variant="outline">
                                        {formData.assignedAthletes.length} sporcu seçildi
                                      </Badge>
                                    </div>
                                    
                                    <div className="max-h-64 overflow-y-auto border rounded-lg p-4">
                                      {getFilteredAthletes().length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          {getFilteredAthletes().map((athlete) => (
                                            <div key={athlete.id} className="flex items-center space-x-3 p-2 border rounded hover:bg-muted/50">
                                              <Checkbox
                                                id={`athlete-${athlete.id}`}
                                                checked={formData.assignedAthletes.includes(athlete.id.toString())}
                                                onCheckedChange={(checked) => 
                                                  handleAthleteToggle(athlete.id.toString(), checked as boolean)
                                                }
                                              />
                                              <Avatar className="h-8 w-8">
                                                <AvatarFallback className="text-xs">
                                                  {`${athlete.studentName?.charAt(0) || ''}${athlete.studentSurname?.charAt(0) || ''}`}
                                                </AvatarFallback>
                                              </Avatar>
                                              <div className="flex-1">
                                                <p className="text-sm font-medium">
                                                  {athlete.studentName} {athlete.studentSurname}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                  {athlete.studentAge} yaş - {athlete.parentName} {athlete.parentSurname}
                                                </p>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="text-center py-8">
                                          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                          <p className="text-muted-foreground">
                                            {formData.sport} branşında sporcu bulunamadı
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                <div className="flex justify-end space-x-2 pt-4">
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
                                        {training.coach.split(' ').map((n: string) => n[0]).join('')}
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
                                      {training.assignedAthletes?.length || 0}/{training.maxParticipants}
                                    </p>
                                    <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                                      <div 
                                        className="bg-primary h-1.5 rounded-full" 
                                        style={{ width: `${((training.assignedAthletes?.length || 0) / training.maxParticipants) * 100}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>{getLevelBadge(training.level)}</TableCell>
                                <TableCell>{getStatusBadge(training.status)}</TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleView(training)}
                                      title="Görüntüle"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleEdit(training)}
                                      title="Düzenle"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleDelete(training)}
                                      title="Sil"
                                    >
                                      <Trash2 className="h-4 w-4" />
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
                                        ? coach.split(' ').map((n: string) => n[0]).join('') 
                                        : `${coach.name || ''} ${coach.surname || ''}`.split(' ').map((n: string) => n[0]).join('')
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
                                      }).reduce((sum, t) => sum + (t.assignedAthletes?.length || 0), 0)}
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

          {/* View Training Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Antrenman Detayları - {selectedTraining?.title}</span>
                </DialogTitle>
              </DialogHeader>

              {selectedTraining && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Antrenman Bilgileri</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Başlık:</span>
                          <span className="font-medium">{selectedTraining.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Spor Branşı:</span>
                          <Badge variant="outline">{selectedTraining.sport}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Antrenör:</span>
                          <span className="font-medium">{selectedTraining.coach}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Lokasyon:</span>
                          <span className="font-medium">{selectedTraining.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tarih:</span>
                          <span className="font-medium">{new Date(selectedTraining.date).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Saat:</span>
                          <span className="font-medium">{selectedTraining.startTime} - {selectedTraining.endTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Seviye:</span>
                          {getLevelBadge(selectedTraining.level)}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Durum:</span>
                          {getStatusBadge(selectedTraining.status)}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Katılımcı Bilgileri</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Atanan Sporcu:</span>
                            <span className="font-medium">{selectedTraining.assignedAthletes?.length || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Maksimum Kapasite:</span>
                            <span className="font-medium">{selectedTraining.maxParticipants}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Yaş Grubu:</span>
                            <Badge variant="secondary">{selectedTraining.ageGroup}</Badge>
                          </div>
                        </div>

                        {selectedTraining.assignedAthletes && selectedTraining.assignedAthletes.length > 0 && (
                          <div className="mt-4">
                            <Label className="text-sm font-medium">Atanan Sporcular:</Label>
                            <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                              {selectedTraining.assignedAthletes.map((athleteId: string) => {
                                const athlete = getAthleteById(athleteId);
                                if (!athlete) return null;
                                return (
                                  <div key={athleteId} className="flex items-center space-x-2 p-2 bg-muted rounded">
                                    <Avatar className="h-6 w-6">
                                      <AvatarFallback className="text-xs">
                                        {`${athlete.studentName?.charAt(0) || ''}${athlete.studentSurname?.charAt(0) || ''}`}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm">{athlete.studentName} {athlete.studentSurname}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {selectedTraining.description && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Açıklama</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{selectedTraining.description}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Kapat
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Training Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Edit className="h-5 w-5" />
                  <span>Antrenman Düzenle - {selectedTraining?.title}</span>
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleUpdate}>
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
                    <Label htmlFor="edit-title">Antrenman Başlığı *</Label>
                    <Input 
                      id="edit-title" 
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-sport">Spor Branşı *</Label>
                    <Select value={formData.sport} onValueChange={(value) => setFormData({...formData, sport: value, assignedAthletes: []})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sports.map(sport => (
                          <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-coach">Antrenör *</Label>
                    <Select value={formData.coach} onValueChange={(value) => setFormData({...formData, coach: value})}>
                      <SelectTrigger>
                        <SelectValue />
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
                    <Label htmlFor="edit-location">Lokasyon *</Label>
                    <Select value={formData.location} onValueChange={(value) => setFormData({...formData, location: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {trainingLocations.map(location => (
                          <SelectItem key={location} value={location}>{location}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-startDate">Başlangıç Tarihi *</Label>
                    <Input 
                      id="edit-startDate" 
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-endDate">Bitiş Tarihi (Opsiyonel)</Label>
                    <Input 
                      id="edit-endDate" 
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      placeholder="Uzun süreli antrenmanlar için"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-startTime">Başlangıç Saati *</Label>
                    <Input 
                      id="edit-startTime" 
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-endTime">Bitiş Saati *</Label>
                    <Input 
                      id="edit-endTime" 
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-maxParticipants">Maksimum Katılımcı *</Label>
                    <Input 
                      id="edit-maxParticipants" 
                      type="number" 
                      value={formData.maxParticipants}
                      onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-ageGroup">Yaş Grubu</Label>
                    <Select value={formData.ageGroup} onValueChange={(value) => setFormData({...formData, ageGroup: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ageGroups.map(age => (
                          <SelectItem key={age} value={age}>{age}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-level">Seviye</Label>
                    <Select value={formData.level} onValueChange={(value) => setFormData({...formData, level: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {levels.map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="edit-description">Açıklama</Label>
                    <Textarea 
                      id="edit-description" 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  {/* Tekrarlanan Antrenman Günleri - Edit */}
                  <div className="col-span-2 space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="edit-isRecurring"
                        checked={formData.isRecurring}
                        onChange={(e) => setFormData({...formData, isRecurring: e.target.checked, recurringDays: []})}
                        className="rounded"
                      />
                      <Label htmlFor="edit-isRecurring" className="font-medium">
                        Tekrarlanan Antrenman (Haftalık)
                      </Label>
                    </div>
                    
                    {formData.isRecurring && (
                      <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
                        <Label className="text-sm font-medium">Antrenman Günleri:</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { key: 'monday', label: 'Pazartesi' },
                            { key: 'tuesday', label: 'Salı' },
                            { key: 'wednesday', label: 'Çarşamba' },
                            { key: 'thursday', label: 'Perşembe' },
                            { key: 'friday', label: 'Cuma' },
                            { key: 'saturday', label: 'Cumartesi' },
                            { key: 'sunday', label: 'Pazar' }
                          ].map((day) => (
                            <div key={day.key} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`edit-day-${day.key}`}
                                checked={formData.recurringDays.includes(day.key)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData(prev => ({
                                      ...prev,
                                      recurringDays: [...prev.recurringDays, day.key]
                                    }));
                                  } else {
                                    setFormData(prev => ({
                                      ...prev,
                                      recurringDays: prev.recurringDays.filter(d => d !== day.key)
                                    }));
                                  }
                                }}
                                className="rounded"
                              />
                              <Label htmlFor={`edit-day-${day.key}`} className="text-sm">
                                {day.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                        {formData.recurringDays.length === 0 && (
                          <p className="text-sm text-muted-foreground">
                            En az bir gün seçmelisiniz
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Athlete Assignment for Edit */}
                {formData.sport && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center space-x-2">
                      <UserPlus className="h-5 w-5 text-primary" />
                      <Label className="text-lg font-medium">Sporcu Ataması</Label>
                      <Badge variant="outline">
                        {formData.assignedAthletes.length} sporcu seçildi
                      </Badge>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto border rounded-lg p-4">
                      {getFilteredAthletes().length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {getFilteredAthletes().map((athlete) => (
                            <div key={athlete.id} className="flex items-center space-x-3 p-2 border rounded hover:bg-muted/50">
                              <Checkbox
                                id={`edit-athlete-${athlete.id}`}
                                checked={formData.assignedAthletes.includes(athlete.id.toString())}
                                onCheckedChange={(checked) => 
                                  handleAthleteToggle(athlete.id.toString(), checked as boolean)
                                }
                              />
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {`${athlete.studentName?.charAt(0) || ''}${athlete.studentSurname?.charAt(0) || ''}`}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  {athlete.studentName} {athlete.studentSurname}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {athlete.studentAge} yaş - {athlete.parentName} {athlete.parentSurname}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            {formData.sport} branşında sporcu bulunamadı
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedTraining(null);
                    resetForm();
                  }}>
                    İptal
                  </Button>
                  <Button type="submit">
                    Güncelle
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}