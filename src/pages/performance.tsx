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
import { Textarea } from "@/components/ui/textarea";
import { 
  TrendingUp, 
  Target, 
  Award, 
  BarChart3,
  Calendar,
  Trophy,
  Plus,
  Eye,
  Download,
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  Activity,
  Timer,
  Zap,
  Heart,
  Ruler,
  Weight,
  Clock,
  CheckCircle,
  AlertTriangle,
  LineChart,
  Save,
  X
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

// Athletic performance measurement categories
const performanceCategories = {
  physical: {
    name: "Fiziksel Performans",
    icon: Activity,
    color: "text-blue-600",
    measurements: [
      { key: "height", name: "Boy (cm)", unit: "cm", type: "number" },
      { key: "weight", name: "Kilo (kg)", unit: "kg", type: "number" },
      { key: "bodyFat", name: "Vücut Yağ Oranı (%)", unit: "%", type: "number" },
      { key: "muscleMass", name: "Kas Kütlesi (kg)", unit: "kg", type: "number" },
      { key: "flexibility", name: "Esneklik (cm)", unit: "cm", type: "number" },
      { key: "balance", name: "Denge (saniye)", unit: "sn", type: "number" }
    ]
  },
  cardiovascular: {
    name: "Kardiyovasküler",
    icon: Heart,
    color: "text-red-600",
    measurements: [
      { key: "restingHeartRate", name: "Dinlenim Nabzı (bpm)", unit: "bpm", type: "number" },
      { key: "maxHeartRate", name: "Maksimum Nabız (bpm)", unit: "bpm", type: "number" },
      { key: "vo2Max", name: "VO2 Max (ml/kg/min)", unit: "ml/kg/min", type: "number" },
      { key: "recoveryTime", name: "Toparlanma Süresi (dk)", unit: "dk", type: "number" },
      { key: "endurance", name: "Dayanıklılık Skoru (1-10)", unit: "/10", type: "number" }
    ]
  },
  strength: {
    name: "Kuvvet ve Güç",
    icon: Zap,
    color: "text-yellow-600",
    measurements: [
      { key: "benchPress", name: "Bench Press (kg)", unit: "kg", type: "number" },
      { key: "squat", name: "Squat (kg)", unit: "kg", type: "number" },
      { key: "deadlift", name: "Deadlift (kg)", unit: "kg", type: "number" },
      { key: "verticalJump", name: "Dikey Sıçrama (cm)", unit: "cm", type: "number" },
      { key: "gripStrength", name: "Kavrama Kuvveti (kg)", unit: "kg", type: "number" },
      { key: "pushUps", name: "Şınav (adet)", unit: "adet", type: "number" }
    ]
  },
  speed: {
    name: "Hız ve Çeviklik",
    icon: Timer,
    color: "text-green-600",
    measurements: [
      { key: "sprint100m", name: "100m Koşu (sn)", unit: "sn", type: "number" },
      { key: "sprint50m", name: "50m Koşu (sn)", unit: "sn", type: "number" },
      { key: "agilityTest", name: "Çeviklik Testi (sn)", unit: "sn", type: "number" },
      { key: "reactionTime", name: "Reaksiyon Süresi (ms)", unit: "ms", type: "number" },
      { key: "shuttleRun", name: "Mekik Koşusu (sn)", unit: "sn", type: "number" }
    ]
  },
  technical: {
    name: "Teknik Beceriler",
    icon: Target,
    color: "text-purple-600",
    measurements: [
      { key: "accuracy", name: "İsabet Oranı (%)", unit: "%", type: "number" },
      { key: "technique", name: "Teknik Skoru (1-10)", unit: "/10", type: "number" },
      { key: "coordination", name: "Koordinasyon (1-10)", unit: "/10", type: "number" },
      { key: "ballControl", name: "Top Kontrolü (1-10)", unit: "/10", type: "number" },
      { key: "gameUnderstanding", name: "Oyun Anlayışı (1-10)", unit: "/10", type: "number" }
    ]
  },
  mental: {
    name: "Mental Performans",
    icon: Trophy,
    color: "text-indigo-600",
    measurements: [
      { key: "concentration", name: "Konsantrasyon (1-10)", unit: "/10", type: "number" },
      { key: "motivation", name: "Motivasyon (1-10)", unit: "/10", type: "number" },
      { key: "confidence", name: "Özgüven (1-10)", unit: "/10", type: "number" },
      { key: "stressManagement", name: "Stres Yönetimi (1-10)", unit: "/10", type: "number" },
      { key: "teamwork", name: "Takım Çalışması (1-10)", unit: "/10", type: "number" }
    ]
  }
};

export default function Performance() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [isAddMeasurementDialogOpen, setIsAddMeasurementDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [measurementData, setMeasurementData] = useState<any>({});
  const [performanceHistory, setPerformanceHistory] = useState<any[]>([]);
  const [isViewHistoryDialogOpen, setIsViewHistoryDialogOpen] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState<any>(null);

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
    const allStudents = JSON.parse(localStorage.getItem('students') || '[]');
    
    let studentsToShow = allStudents.filter((student: any) => student.status === 'Aktif' || !student.status);
    
    // If user is a coach, filter students based on their training groups and sports branches
    if (role === 'coach' && user) {
      studentsToShow = studentsToShow.filter((student: any) => {
        const isInTrainingGroup = user.trainingGroups?.some((group: string) => 
          student.trainingGroups?.includes(group)
        );
        const isInSportsBranch = user.sportsBranches?.some((branch: string) => 
          student.sportsBranches?.includes(branch)
        );
        return isInTrainingGroup || isInSportsBranch;
      });
    }
    
    setAthletes(studentsToShow);
    if (studentsToShow.length > 0 && !selectedAthlete) {
      setSelectedAthlete(studentsToShow[0]);
      loadPerformanceHistory(studentsToShow[0].id);
    }
  };

  const loadPerformanceHistory = (athleteId: string) => {
    const history = JSON.parse(localStorage.getItem(`performance_${athleteId}`) || '[]');
    setPerformanceHistory(history.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const filteredAthletes = athletes.filter(athlete => {
    const matchesSearch = athlete.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         athlete.studentSurname?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = selectedSport === "all" || athlete.sportsBranches?.includes(selectedSport);
    
    return matchesSearch && matchesSport;
  });

  const getInitials = (name: string, surname: string) => {
    return `${name?.charAt(0) || ''}${surname?.charAt(0) || ''}`.toUpperCase();
  };

  const getPerformanceColor = (score: number, isReverse: boolean = false) => {
    if (isReverse) {
      // For measurements where lower is better (like sprint times)
      if (score <= 25) return "text-green-600";
      if (score <= 50) return "text-blue-600";
      if (score <= 75) return "text-yellow-600";
      return "text-red-600";
    } else {
      // For measurements where higher is better
      if (score >= 90) return "text-green-600";
      if (score >= 75) return "text-blue-600";
      if (score >= 60) return "text-yellow-600";
      return "text-red-600";
    }
  };

  const calculateOverallPerformance = (athleteId: string) => {
    const history = JSON.parse(localStorage.getItem(`performance_${athleteId}`) || '[]');
    if (history.length === 0) return 0;

    const latestMeasurements = history[0];
    const scores: number[] = [];

    Object.keys(performanceCategories).forEach(categoryKey => {
      const category = performanceCategories[categoryKey as keyof typeof performanceCategories];
      category.measurements.forEach(measurement => {
        const value = latestMeasurements.measurements?.[measurement.key];
        if (value !== undefined && value !== null && value !== '') {
          // Normalize score to 0-100 scale (simplified)
          let normalizedScore = 50; // Default middle score
          
          if (measurement.unit === '/10') {
            normalizedScore = (parseFloat(value) / 10) * 100;
          } else if (measurement.unit === '%') {
            normalizedScore = parseFloat(value);
          } else {
            // For other measurements, use a simplified scoring system
            normalizedScore = Math.min(100, Math.max(0, parseFloat(value) * 2));
          }
          
          scores.push(normalizedScore);
        }
      });
    });

    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  };

  const saveMeasurement = () => {
    if (!selectedAthlete || !selectedCategory || Object.keys(measurementData).length === 0) {
      toast.error("Lütfen tüm gerekli alanları doldurun");
      return;
    }

    const newMeasurement = {
      id: Date.now(),
      athleteId: selectedAthlete.id,
      date: new Date().toISOString(),
      category: selectedCategory,
      measurements: { ...measurementData },
      notes: measurementData.notes || '',
      measuredBy: currentUser?.username || 'admin',
      createdAt: new Date().toISOString()
    };

    const existingHistory = JSON.parse(localStorage.getItem(`performance_${selectedAthlete.id}`) || '[]');
    const updatedHistory = [newMeasurement, ...existingHistory];
    
    localStorage.setItem(`performance_${selectedAthlete.id}`, JSON.stringify(updatedHistory));
    
    // Update performance history state
    loadPerformanceHistory(selectedAthlete.id);
    
    // Reset form
    setMeasurementData({});
    setSelectedCategory("");
    setIsAddMeasurementDialogOpen(false);
    
    toast.success(`${selectedAthlete.studentName} ${selectedAthlete.studentSurname} için performans ölçümü kaydedildi`);
  };

  const deleteMeasurement = (measurementId: number) => {
    if (!selectedAthlete) return;
    
    const existingHistory = JSON.parse(localStorage.getItem(`performance_${selectedAthlete.id}`) || '[]');
    const updatedHistory = existingHistory.filter((m: any) => m.id !== measurementId);
    
    localStorage.setItem(`performance_${selectedAthlete.id}`, JSON.stringify(updatedHistory));
    loadPerformanceHistory(selectedAthlete.id);
    
    toast.success("Performans ölçümü silindi");
  };

  const exportPerformanceData = () => {
    if (!selectedAthlete) return;

    const history = JSON.parse(localStorage.getItem(`performance_${selectedAthlete.id}`) || '[]');
    
    if (history.length === 0) {
      toast.error("Dışa aktarılacak performans verisi bulunamadı");
      return;
    }

    const exportData = history.map((measurement: any) => {
      const row: any = {
        'Tarih': new Date(measurement.date).toLocaleDateString('tr-TR'),
        'Kategori': performanceCategories[measurement.category as keyof typeof performanceCategories]?.name || measurement.category,
        'Ölçen': measurement.measuredBy,
        'Notlar': measurement.notes || ''
      };

      // Add all measurements
      Object.entries(measurement.measurements || {}).forEach(([key, value]) => {
        if (key !== 'notes') {
          // Find the measurement definition
          let measurementDef: any = null;
          Object.values(performanceCategories).forEach(category => {
            const found = category.measurements.find(m => m.key === key);
            if (found) measurementDef = found;
          });
          
          if (measurementDef) {
            row[`${measurementDef.name}`] = `${value} ${measurementDef.unit}`;
          }
        }
      });

      return row;
    });

    // Create CSV content
    const headers = Object.keys(exportData[0]);
    const csvRows = [];
    csvRows.push(headers.join(';'));
    
    exportData.forEach(row => {
      const rowValues = headers.map(header => {
        const value = row[header];
        const stringValue = String(value || '');
        return `"${stringValue.replace(/"/g, '""')}"`;
      });
      csvRows.push(rowValues.join(';'));
    });
    
    const csvContent = csvRows.join('\r\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    const fileName = `${selectedAthlete.studentName}_${selectedAthlete.studentSurname}_Performans_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Performans verileri dışa aktarıldı! (${fileName})`);
  };

  const getLatestMeasurement = (athleteId: string, measurementKey: string) => {
    const history = JSON.parse(localStorage.getItem(`performance_${athleteId}`) || '[]');
    for (const measurement of history) {
      if (measurement.measurements?.[measurementKey] !== undefined) {
        return measurement.measurements[measurementKey];
      }
    }
    return null;
  };

  const getMeasurementTrend = (athleteId: string, measurementKey: string) => {
    const history = JSON.parse(localStorage.getItem(`performance_${athleteId}`) || '[]');
    const values = history
      .map((m: any) => m.measurements?.[measurementKey])
      .filter((v: any) => v !== undefined && v !== null && v !== '')
      .map((v: any) => parseFloat(v))
      .slice(0, 2); // Get last 2 measurements

    if (values.length < 2) return 'stable';
    
    const latest = values[0];
    const previous = values[1];
    
    if (latest > previous) return 'up';
    if (latest < previous) return 'down';
    return 'stable';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      default: return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <>
      <Head>
        <title>Atletik Performans Takibi - SportsCRM</title>
        <meta name="description" content="Sporcu performans ölçümü ve gelişim takibi" />
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
                <Activity className="w-6 h-6 text-primary" />
                <h1 className="text-3xl font-bold">Atletik Performans Takibi</h1>
              </div>
              <p className="text-muted-foreground">Sporcu gelişimini ölçün ve takip edin</p>
            </div>
            
            <div className="flex gap-2">
              {selectedAthlete && (
                <>
                  <Button variant="outline" onClick={exportPerformanceData}>
                    <Download className="h-4 w-4 mr-2" />
                    Verileri Dışa Aktar
                  </Button>
                  <Dialog open={isAddMeasurementDialogOpen} onOpenChange={setIsAddMeasurementDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Yeni Ölçüm
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </>
              )}
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Athletes List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Sporcular</CardTitle>
                  <CardDescription>
                    {userRole === 'coach' ? 'Antrenman gruplarınızdaki sporcular' : 'Tüm aktif sporcular'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Search and Filter */}
                    <div className="space-y-2">
                      <Input
                        placeholder="Sporcu ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Select value={selectedSport} onValueChange={setSelectedSport}>
                        <SelectTrigger>
                          <SelectValue placeholder="Spor branşı" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tüm Branşlar</SelectItem>
                          <SelectItem value="Basketbol">Basketbol</SelectItem>
                          <SelectItem value="Futbol">Futbol</SelectItem>
                          <SelectItem value="Yüzme">Yüzme</SelectItem>
                          <SelectItem value="Atletizm">Atletizm</SelectItem>
                          <SelectItem value="Voleybol">Voleybol</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Athletes List */}
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {filteredAthletes.map((athlete) => {
                        const overallScore = calculateOverallPerformance(athlete.id);
                        return (
                          <div
                            key={athlete.id}
                            onClick={() => {
                              setSelectedAthlete(athlete);
                              loadPerformanceHistory(athlete.id);
                            }}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                              selectedAthlete?.id === athlete.id 
                                ? 'bg-primary text-primary-foreground' 
                                : 'hover:bg-accent'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={athlete.photo} />
                                <AvatarFallback>
                                  {getInitials(athlete.studentName, athlete.studentSurname)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {athlete.studentName} {athlete.studentSurname}
                                </p>
                                <p className="text-xs opacity-70">
                                  {athlete.sportsBranches?.[0] || 'Genel'}
                                </p>
                              </div>
                              <div className={`text-sm font-bold ${getPerformanceColor(overallScore)}`}>
                                {overallScore}%
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Details */}
            <div className="lg:col-span-3">
              {selectedAthlete ? (
                <motion.div 
                  key={selectedAthlete.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Athlete Header */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={selectedAthlete.photo} />
                          <AvatarFallback>
                            {getInitials(selectedAthlete.studentName, selectedAthlete.studentSurname)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold">
                            {selectedAthlete.studentName} {selectedAthlete.studentSurname}
                          </h2>
                          <p className="text-muted-foreground">
                            {selectedAthlete.sportsBranches?.join(', ') || 'Genel'}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <Badge variant="outline">
                              Yaş: {selectedAthlete.studentAge}
                            </Badge>
                            <Badge variant="outline">
                              Genel Performans: {calculateOverallPerformance(selectedAthlete.id)}%
                            </Badge>
                            <Badge variant="outline">
                              Ölçüm Sayısı: {performanceHistory.length}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList>
                      <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
                      <TabsTrigger value="measurements">Ölçümler</TabsTrigger>
                      <TabsTrigger value="history">Geçmiş</TabsTrigger>
                      <TabsTrigger value="progress">Gelişim</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(performanceCategories).map(([categoryKey, category]) => {
                          const IconComponent = category.icon;
                          return (
                            <Card key={categoryKey}>
                              <CardHeader className="pb-3">
                                <CardTitle className="flex items-center space-x-2 text-lg">
                                  <IconComponent className={`h-5 w-5 ${category.color}`} />
                                  <span>{category.name}</span>
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  {category.measurements.slice(0, 3).map((measurement) => {
                                    const latestValue = getLatestMeasurement(selectedAthlete.id, measurement.key);
                                    const trend = getMeasurementTrend(selectedAthlete.id, measurement.key);
                                    
                                    return (
                                      <div key={measurement.key} className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                          {measurement.name}
                                        </span>
                                        <div className="flex items-center space-x-2">
                                          {latestValue !== null ? (
                                            <>
                                              <span className="font-medium">
                                                {latestValue} {measurement.unit}
                                              </span>
                                              {getTrendIcon(trend)}
                                            </>
                                          ) : (
                                            <span className="text-xs text-muted-foreground">
                                              Veri yok
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </TabsContent>

                    <TabsContent value="measurements">
                      <div className="grid md:grid-cols-2 gap-6">
                        {Object.entries(performanceCategories).map(([categoryKey, category]) => {
                          const IconComponent = category.icon;
                          return (
                            <Card key={categoryKey}>
                              <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                  <IconComponent className={`h-5 w-5 ${category.color}`} />
                                  <span>{category.name}</span>
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  {category.measurements.map((measurement) => {
                                    const latestValue = getLatestMeasurement(selectedAthlete.id, measurement.key);
                                    const trend = getMeasurementTrend(selectedAthlete.id, measurement.key);
                                    
                                    return (
                                      <div key={measurement.key} className="flex items-center justify-between p-2 rounded border">
                                        <div>
                                          <p className="font-medium text-sm">{measurement.name}</p>
                                          <p className="text-xs text-muted-foreground">{measurement.unit}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          {latestValue !== null ? (
                                            <>
                                              <span className="font-bold">
                                                {latestValue}
                                              </span>
                                              {getTrendIcon(trend)}
                                            </>
                                          ) : (
                                            <span className="text-xs text-muted-foreground">
                                              Henüz ölçüm yok
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </TabsContent>

                    <TabsContent value="history">
                      <Card>
                        <CardHeader>
                          <CardTitle>Performans Geçmişi</CardTitle>
                          <CardDescription>
                            Tüm performans ölçümlerinin kronolojik listesi
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {performanceHistory.length > 0 ? (
                            <div className="space-y-4">
                              {performanceHistory.map((measurement) => (
                                <Card key={measurement.id} className="border-l-4 border-l-primary">
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center space-x-2">
                                        <Badge variant="outline">
                                          {performanceCategories[measurement.category as keyof typeof performanceCategories]?.name || measurement.category}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">
                                          {new Date(measurement.date).toLocaleDateString('tr-TR')}
                                        </span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setSelectedMeasurement(measurement);
                                            setIsViewHistoryDialogOpen(true);
                                          }}
                                        >
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                        {userRole === 'admin' && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteMeasurement(measurement.id)}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                      {Object.entries(measurement.measurements || {}).slice(0, 4).map(([key, value]) => {
                                        if (key === 'notes') return null;
                                        
                                        // Find measurement definition
                                        let measurementDef: any = null;
                                        Object.values(performanceCategories).forEach(category => {
                                          const found = category.measurements.find(m => m.key === key);
                                          if (found) measurementDef = found;
                                        });
                                        
                                        return (
                                          <div key={key}>
                                            <span className="text-muted-foreground">
                                              {measurementDef?.name || key}:
                                            </span>
                                            <span className="font-medium ml-1">
                                              {value} {measurementDef?.unit || ''}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                    {measurement.notes && (
                                      <p className="text-sm text-muted-foreground mt-2 italic">
                                        "{measurement.notes}"
                                      </p>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-2">
                                      Ölçen: {measurement.measuredBy}
                                    </p>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                              <p className="text-muted-foreground">
                                Henüz performans ölçümü bulunmuyor
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="progress">
                      <Card>
                        <CardHeader>
                          <CardTitle>Gelişim Analizi</CardTitle>
                          <CardDescription>
                            Performans gelişiminin görsel analizi
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <LineChart className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                              <p className="text-muted-foreground">
                                Gelişim grafikleri burada görüntülenecek
                              </p>
                              <p className="text-sm text-muted-foreground mt-2">
                                En az 3 ölçüm gereklidir
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </motion.div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Performans verilerini görüntülemek için bir sporcu seçin
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Add Measurement Dialog */}
          <Dialog open={isAddMeasurementDialogOpen} onOpenChange={setIsAddMeasurementDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Yeni Performans Ölçümü</DialogTitle>
                <DialogDescription>
                  {selectedAthlete?.studentName} {selectedAthlete?.studentSurname} için performans ölçümü ekleyin
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Category Selection */}
                <div className="space-y-2">
                  <Label>Ölçüm Kategorisi</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(performanceCategories).map(([key, category]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center space-x-2">
                            <category.icon className={`h-4 w-4 ${category.color}`} />
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Measurements */}
                {selectedCategory && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        {React.createElement(performanceCategories[selectedCategory as keyof typeof performanceCategories].icon, {
                          className: `h-5 w-5 ${performanceCategories[selectedCategory as keyof typeof performanceCategories].color}`
                        })}
                        <span>{performanceCategories[selectedCategory as keyof typeof performanceCategories].name}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {performanceCategories[selectedCategory as keyof typeof performanceCategories].measurements.map((measurement) => (
                          <div key={measurement.key} className="space-y-2">
                            <Label htmlFor={measurement.key}>
                              {measurement.name} ({measurement.unit})
                            </Label>
                            <Input
                              id={measurement.key}
                              type={measurement.type}
                              placeholder={`Örn: 75`}
                              value={measurementData[measurement.key] || ''}
                              onChange={(e) => setMeasurementData(prev => ({
                                ...prev,
                                [measurement.key]: e.target.value
                              }))}
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notlar (Opsiyonel)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Ölçüm hakkında notlar, gözlemler..."
                    value={measurementData.notes || ''}
                    onChange={(e) => setMeasurementData(prev => ({
                      ...prev,
                      notes: e.target.value
                    }))}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddMeasurementDialogOpen(false)}>
                    <X className="h-4 w-4 mr-2" />
                    İptal
                  </Button>
                  <Button onClick={saveMeasurement}>
                    <Save className="h-4 w-4 mr-2" />
                    Ölçümü Kaydet
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* View History Dialog */}
          <Dialog open={isViewHistoryDialogOpen} onOpenChange={setIsViewHistoryDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Ölçüm Detayları</DialogTitle>
                <DialogDescription>
                  {selectedMeasurement && new Date(selectedMeasurement.date).toLocaleDateString('tr-TR')} tarihli ölçüm
                </DialogDescription>
              </DialogHeader>

              {selectedMeasurement && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Kategori:</span>
                      <p className="font-medium">
                        {performanceCategories[selectedMeasurement.category as keyof typeof performanceCategories]?.name || selectedMeasurement.category}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ölçen:</span>
                      <p className="font-medium">{selectedMeasurement.measuredBy}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Ölçüm Değerleri:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(selectedMeasurement.measurements || {}).map(([key, value]) => {
                        if (key === 'notes') return null;
                        
                        // Find measurement definition
                        let measurementDef: any = null;
                        Object.values(performanceCategories).forEach(category => {
                          const found = category.measurements.find(m => m.key === key);
                          if (found) measurementDef = found;
                        });
                        
                        return (
                          <div key={key} className="p-3 border rounded">
                            <p className="text-sm text-muted-foreground">
                              {measurementDef?.name || key}
                            </p>
                            <p className="font-bold">
                              {value} {measurementDef?.unit || ''}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {selectedMeasurement.notes && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Notlar:</h4>
                      <p className="text-sm text-muted-foreground italic p-3 bg-muted rounded">
                        "{selectedMeasurement.notes}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}