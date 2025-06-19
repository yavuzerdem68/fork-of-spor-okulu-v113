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
import { Textarea } from "@/components/ui/textarea";
import { 
  Activity, 
  Plus,
  Search,
  Download,
  Edit,
  Eye,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  Timer,
  Target,
  Award,
  Calendar,
  ArrowLeft,
  Users,
  Zap,
  Heart,
  Ruler,
  Weight,
  Clock,
  Trophy,
  Star,
  ChevronUp,
  ChevronDown,
  Minus
} from "lucide-react";
import { useRouter } from "next/router";
import Link from "next/link";
import Header from "@/components/Header";
import { toast } from "sonner";

// Performance metrics by sport
const performanceMetrics = {
  "Futbol": [
    { key: "speed_20m", name: "20m Sürat", unit: "saniye", type: "time", lower_better: true },
    { key: "speed_40m", name: "40m Sürat", unit: "saniye", type: "time", lower_better: true },
    { key: "vertical_jump", name: "Dikey Sıçrama", unit: "cm", type: "distance", lower_better: false },
    { key: "long_jump", name: "Uzun Atlama", unit: "cm", type: "distance", lower_better: false },
    { key: "agility_test", name: "Çeviklik Testi", unit: "saniye", type: "time", lower_better: true },
    { key: "endurance_12min", name: "12 Dakika Koşu", unit: "metre", type: "distance", lower_better: false },
    { key: "ball_control", name: "Top Kontrolü", unit: "puan", type: "score", lower_better: false },
    { key: "shooting_accuracy", name: "Şut Isabeti", unit: "%", type: "percentage", lower_better: false }
  ],
  "Basketbol": [
    { key: "speed_20m", name: "20m Sürat", unit: "saniye", type: "time", lower_better: true },
    { key: "vertical_jump", name: "Dikey Sıçrama", unit: "cm", type: "distance", lower_better: false },
    { key: "agility_test", name: "Çeviklik Testi", unit: "saniye", type: "time", lower_better: true },
    { key: "free_throw", name: "Serbest Atış", unit: "%", type: "percentage", lower_better: false },
    { key: "three_point", name: "3 Sayılık Atış", unit: "%", type: "percentage", lower_better: false },
    { key: "dribbling", name: "Dribling", unit: "puan", type: "score", lower_better: false },
    { key: "endurance_test", name: "Dayanıklılık", unit: "dakika", type: "time", lower_better: false },
    { key: "reaction_time", name: "Reaksiyon Zamanı", unit: "saniye", type: "time", lower_better: true }
  ],
  "Yüzme": [
    { key: "freestyle_50m", name: "50m Serbest", unit: "saniye", type: "time", lower_better: true },
    { key: "freestyle_100m", name: "100m Serbest", unit: "saniye", type: "time", lower_better: true },
    { key: "backstroke_50m", name: "50m Sırtüstü", unit: "saniye", type: "time", lower_better: true },
    { key: "breaststroke_50m", name: "50m Kurbağalama", unit: "saniye", type: "time", lower_better: true },
    { key: "butterfly_50m", name: "50m Kelebek", unit: "saniye", type: "time", lower_better: true },
    { key: "underwater_distance", name: "Suya Dalma Mesafesi", unit: "metre", type: "distance", lower_better: false },
    { key: "technique_score", name: "Teknik Puanı", unit: "puan", type: "score", lower_better: false },
    { key: "endurance_400m", name: "400m Dayanıklılık", unit: "saniye", type: "time", lower_better: true }
  ],
  "Atletizm": [
    { key: "speed_100m", name: "100m Koşu", unit: "saniye", type: "time", lower_better: true },
    { key: "speed_200m", name: "200m Koşu", unit: "saniye", type: "time", lower_better: true },
    { key: "long_jump", name: "Uzun Atlama", unit: "metre", type: "distance", lower_better: false },
    { key: "high_jump", name: "Yüksek Atlama", unit: "cm", type: "distance", lower_better: false },
    { key: "shot_put", name: "Gülle Atma", unit: "metre", type: "distance", lower_better: false },
    { key: "javelin", name: "Cirit Atma", unit: "metre", type: "distance", lower_better: false },
    { key: "endurance_1500m", name: "1500m Koşu", unit: "saniye", type: "time", lower_better: true },
    { key: "flexibility", name: "Esneklik", unit: "cm", type: "distance", lower_better: false }
  ],
  "Genel": [
    { key: "height", name: "Boy", unit: "cm", type: "measurement", lower_better: false },
    { key: "weight", name: "Kilo", unit: "kg", type: "measurement", lower_better: false },
    { key: "bmi", name: "BMI", unit: "kg/m²", type: "calculated", lower_better: false },
    { key: "body_fat", name: "Vücut Yağ Oranı", unit: "%", type: "percentage", lower_better: true },
    { key: "muscle_mass", name: "Kas Kütlesi", unit: "%", type: "percentage", lower_better: false },
    { key: "flexibility", name: "Esneklik", unit: "cm", type: "distance", lower_better: false },
    { key: "balance", name: "Denge", unit: "saniye", type: "time", lower_better: false },
    { key: "coordination", name: "Koordinasyon", unit: "puan", type: "score", lower_better: false }
  ]
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

export default function Performance() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [selectedAthlete, setSelectedAthlete] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [selectedAthleteForAdd, setSelectedAthleteForAdd] = useState("");
  const [selectedMetrics, setSelectedMetrics] = useState<any>({});
  const [measurementDate, setMeasurementDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("");

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

    loadData();
  }, [router]);

  const loadData = () => {
    // Load athletes
    const storedAthletes = JSON.parse(localStorage.getItem('students') || '[]');
    const activeAthletes = storedAthletes.filter((athlete: any) => athlete.status === 'Aktif' || !athlete.status);
    setAthletes(activeAthletes);
    
    // Load performance data
    const storedPerformance = JSON.parse(localStorage.getItem('performanceData') || '[]');
    setPerformanceData(storedPerformance);
  };

  const getAvailableMetrics = (athleteId: string) => {
    const athlete = athletes.find(a => a.id.toString() === athleteId);
    if (!athlete) return [];
    
    const primarySport = athlete.sportsBranches?.[0] || athlete.selectedSports?.[0] || 'Genel';
    return performanceMetrics[primarySport] || performanceMetrics['Genel'];
  };

  const handleMetricChange = (metricKey: string, value: string) => {
    setSelectedMetrics(prev => ({
      ...prev,
      [metricKey]: value
    }));
  };

  const savePerformanceData = () => {
    if (!selectedAthleteForAdd) {
      toast.error("Lütfen sporcu seçin");
      return;
    }

    const athlete = athletes.find(a => a.id.toString() === selectedAthleteForAdd);
    if (!athlete) {
      toast.error("Seçilen sporcu bulunamadı");
      return;
    }

    const metrics = getAvailableMetrics(selectedAthleteForAdd);
    const hasData = metrics.some(metric => selectedMetrics[metric.key]);

    if (!hasData) {
      toast.error("Lütfen en az bir ölçüm değeri girin");
      return;
    }

    // Calculate BMI if height and weight are provided
    let calculatedMetrics = { ...selectedMetrics };
    if (selectedMetrics.height && selectedMetrics.weight) {
      const heightInM = parseFloat(selectedMetrics.height) / 100;
      const weight = parseFloat(selectedMetrics.weight);
      const bmi = (weight / (heightInM * heightInM)).toFixed(1);
      calculatedMetrics.bmi = bmi;
    }

    const newPerformanceEntry = {
      id: Date.now(),
      athleteId: athlete.id,
      athleteName: `${athlete.studentName} ${athlete.studentSurname}`,
      sport: athlete.sportsBranches?.[0] || athlete.selectedSports?.[0] || 'Genel',
      date: measurementDate,
      metrics: calculatedMetrics,
      notes: notes,
      createdBy: currentUser?.username || 'admin',
      createdAt: new Date().toISOString()
    };

    const updatedPerformanceData = [...performanceData, newPerformanceEntry];
    setPerformanceData(updatedPerformanceData);
    localStorage.setItem('performanceData', JSON.stringify(updatedPerformanceData));

    // Reset form
    setSelectedAthleteForAdd("");
    setSelectedMetrics({});
    setMeasurementDate(new Date().toISOString().split('T')[0]);
    setNotes("");
    setIsAddDialogOpen(false);

    toast.success(`${athlete.studentName} ${athlete.studentSurname} için performans verisi kaydedildi`);
  };

  const getAthletePerformanceHistory = (athleteId: string) => {
    return performanceData
      .filter(entry => entry.athleteId.toString() === athleteId.toString())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getPerformanceTrend = (athleteId: string, metricKey: string) => {
    const history = getAthletePerformanceHistory(athleteId);
    const values = history
      .map(entry => entry.metrics[metricKey])
      .filter(value => value !== undefined && value !== "")
      .map(value => parseFloat(value))
      .filter(value => !isNaN(value));

    if (values.length < 2) return "stable";

    const latest = values[0];
    const previous = values[1];
    const metric = performanceMetrics['Genel'].find(m => m.key === metricKey) || 
                  Object.values(performanceMetrics).flat().find(m => m.key === metricKey);

    if (!metric) return "stable";

    const improvement = metric.lower_better ? latest < previous : latest > previous;
    const change = Math.abs(((latest - previous) / previous) * 100);

    if (change < 2) return "stable";
    return improvement ? "improving" : "declining";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <ChevronUp className="h-4 w-4 text-green-600" />;
      case "declining":
        return <ChevronDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "improving":
        return "text-green-600";
      case "declining":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const filteredAthletes = athletes.filter(athlete => {
    const matchesSearch = athlete.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         athlete.studentSurname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         athlete.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         athlete.parentSurname.toLowerCase().includes(searchTerm.toLowerCase());
    
    const athleteSport = athlete.sportsBranches?.[0] || athlete.selectedSports?.[0] || 'Genel';
    const matchesSport = selectedSport === "all" || athleteSport === selectedSport;
    
    return matchesSearch && matchesSport;
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatMetricValue = (value: any, metric: any) => {
    if (!value || value === "") return "-";
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;

    if (metric.type === "time") {
      return `${numValue.toFixed(2)} ${metric.unit}`;
    } else if (metric.type === "percentage") {
      return `${numValue.toFixed(1)}%`;
    } else {
      return `${numValue.toFixed(1)} ${metric.unit}`;
    }
  };

  const getLatestMetricValue = (athleteId: string, metricKey: string) => {
    const history = getAthletePerformanceHistory(athleteId);
    const latestEntry = history.find(entry => entry.metrics[metricKey]);
    return latestEntry?.metrics[metricKey] || "";
  };

  return (
    <>
      <Head>
        <title>Performans Takibi - SportsCRM</title>
        <meta name="description" content="Atletik performans ölçümü ve takibi" />
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
                <Activity className="w-6 h-6 text-primary" />
                <h1 className="text-3xl font-bold">Performans Takibi</h1>
              </div>
              <p className="text-muted-foreground">Atletik performans ölçümü ve gelişim takibi</p>
            </div>
            
            <div className="flex gap-2">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Performans Ölçümü Ekle
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Yeni Performans Ölçümü</DialogTitle>
                    <DialogDescription>
                      Sporcu için performans ölçümlerini kaydedin
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="athlete">Sporcu *</Label>
                        <Select value={selectedAthleteForAdd} onValueChange={setSelectedAthleteForAdd}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sporcu seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {athletes.map(athlete => (
                              <SelectItem key={athlete.id} value={athlete.id.toString()}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{athlete.studentName} {athlete.studentSurname}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {athlete.sportsBranches?.[0] || athlete.selectedSports?.[0] || 'Genel'}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="measurementDate">Ölçüm Tarihi *</Label>
                        <Input 
                          id="measurementDate" 
                          type="date" 
                          value={measurementDate}
                          onChange={(e) => setMeasurementDate(e.target.value)}
                        />
                      </div>
                    </div>

                    {selectedAthleteForAdd && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Performans Ölçümleri</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {getAvailableMetrics(selectedAthleteForAdd).map(metric => (
                            <div key={metric.key} className="space-y-2">
                              <Label htmlFor={metric.key}>
                                {metric.name}
                                <span className="text-xs text-muted-foreground ml-1">({metric.unit})</span>
                              </Label>
                              <Input
                                id={metric.key}
                                type="number"
                                step="0.01"
                                placeholder={`${metric.name} değeri`}
                                value={selectedMetrics[metric.key] || ""}
                                onChange={(e) => handleMetricChange(metric.key, e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notlar</Label>
                      <Textarea
                        id="notes"
                        placeholder="Ölçüm notları, gözlemler..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      İptal
                    </Button>
                    <Button onClick={savePerformanceData}>
                      Kaydet
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
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
                    <p className="text-sm font-medium text-muted-foreground">Toplam Sporcu</p>
                    <p className="text-2xl font-bold">{athletes.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Toplam Ölçüm</p>
                    <p className="text-2xl font-bold">{performanceData.length}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bu Ay</p>
                    <p className="text-2xl font-bold">
                      {performanceData.filter(entry => 
                        new Date(entry.date).getMonth() === new Date().getMonth() &&
                        new Date(entry.date).getFullYear() === new Date().getFullYear()
                      ).length}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Gelişen Sporcular</p>
                    <p className="text-2xl font-bold">
                      {athletes.filter(athlete => {
                        const history = getAthletePerformanceHistory(athlete.id);
                        return history.length >= 2;
                      }).length}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Filters */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-col md:flex-row gap-4 flex-1">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input 
                        placeholder="Sporcu ara..." 
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
                        {Object.keys(performanceMetrics).filter(sport => sport !== 'Genel').map(sport => (
                          <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Athletes Performance Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAthletes.map((athlete) => {
                const performanceHistory = getAthletePerformanceHistory(athlete.id);
                const latestEntry = performanceHistory[0];
                const sport = athlete.sportsBranches?.[0] || athlete.selectedSports?.[0] || 'Genel';
                const metrics = performanceMetrics[sport] || performanceMetrics['Genel'];

                return (
                  <Card key={athlete.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={athlete.photo || athlete.studentPhoto} />
                          <AvatarFallback>{getInitials(`${athlete.studentName} ${athlete.studentSurname}`)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{athlete.studentName} {athlete.studentSurname}</CardTitle>
                          <CardDescription>{sport}</CardDescription>
                        </div>
                        <Badge variant="outline">
                          {performanceHistory.length} ölçüm
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {latestEntry ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Son Ölçüm:</span>
                            <span>{new Date(latestEntry.date).toLocaleDateString('tr-TR')}</span>
                          </div>
                          
                          <div className="space-y-2">
                            {metrics.slice(0, 4).map(metric => {
                              const value = latestEntry.metrics[metric.key];
                              const trend = getPerformanceTrend(athlete.id, metric.key);
                              
                              return (
                                <div key={metric.key} className="flex items-center justify-between">
                                  <span className="text-sm font-medium">{metric.name}:</span>
                                  <div className="flex items-center space-x-1">
                                    <span className="text-sm">{formatMetricValue(value, metric)}</span>
                                    {getTrendIcon(trend)}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {performanceHistory.length > 1 && (
                            <div className="pt-2 border-t">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Gelişim Trendi:</span>
                                <div className="flex items-center space-x-1">
                                  {metrics.slice(0, 3).map(metric => {
                                    const trend = getPerformanceTrend(athlete.id, metric.key);
                                    return (
                                      <div key={metric.key} className={`flex items-center ${getTrendColor(trend)}`}>
                                        {getTrendIcon(trend)}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Henüz performans verisi yok</p>
                        </div>
                      )}
                      
                      <div className="flex gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedAthleteForAdd(athlete.id.toString());
                            setIsAddDialogOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Ölçüm Ekle
                        </Button>
                        {performanceHistory.length > 0 && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              // Show detailed performance history
                              const historyText = performanceHistory.map(entry => {
                                const date = new Date(entry.date).toLocaleDateString('tr-TR');
                                const metricsText = Object.entries(entry.metrics)
                                  .filter(([key, value]) => value)
                                  .map(([key, value]) => {
                                    const metric = metrics.find(m => m.key === key);
                                    return `${metric?.name || key}: ${formatMetricValue(value, metric)}`;
                                  })
                                  .join('\n');
                                return `${date}\n${metricsText}\n${entry.notes ? `Not: ${entry.notes}` : ''}\n---`;
                              }).join('\n');
                              
                              alert(`${athlete.studentName} ${athlete.studentSurname} - Performans Geçmişi\n\n${historyText}`);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredAthletes.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Sporcu bulunamadı</h3>
                  <p className="text-muted-foreground">Arama kriterlerinize uygun sporcu bulunmuyor.</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}