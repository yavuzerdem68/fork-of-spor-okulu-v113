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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  UserCheck, 
  Search,
  Download,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Timer,
  Percent,
  ArrowLeft,
  MessageCircle,
  Calendar
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

export default function Attendance() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [todayTrainings, setTodayTrainings] = useState<any[]>([]);
  const [selectedTraining, setSelectedTraining] = useState<any>(null);
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

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

    loadTodayTrainings(selectedDate, role, user ? JSON.parse(user) : null);
  }, [router, selectedDate]);

  const loadTodayTrainings = (date: string, role: string, user: any) => {
    // Mock data - gerçek uygulamada API'den gelecek
    const allTrainings = [
      {
        id: 1,
        title: "U14 Basketbol Antrenmanı",
        sport: "Basketbol",
        coach: "Mehmet Özkan",
        coachId: "coach1",
        startTime: "09:00",
        endTime: "10:30",
        location: "Spor Salonu A",
        date: date,
        trainingGroup: "U14 Basketbol",
        students: [
          { id: 1, name: "Ahmet Yılmaz", surname: "Yılmaz", parentPhone: "0532 123 4567", present: null },
          { id: 2, name: "Elif Demir", surname: "Demir", parentPhone: "0532 234 5678", present: null },
          { id: 3, name: "Can Özkan", surname: "Özkan", parentPhone: "0532 345 6789", present: null },
          { id: 4, name: "Zeynep Kaya", surname: "Kaya", parentPhone: "0532 456 7890", present: null },
          { id: 5, name: "Emre Şahin", surname: "Şahin", parentPhone: "0532 567 8901", present: null }
        ]
      },
      {
        id: 2,
        title: "Yetişkin Yüzme Kursu",
        sport: "Yüzme",
        coach: "Ayşe Kaya",
        coachId: "coach2",
        startTime: "14:00",
        endTime: "15:00",
        location: "Yüzme Havuzu",
        date: date,
        trainingGroup: "Yetişkin Yüzme",
        students: [
          { id: 6, name: "Fatma Arslan", surname: "Arslan", parentPhone: "0532 678 9012", present: null },
          { id: 7, name: "Mustafa Çelik", surname: "Çelik", parentPhone: "0532 789 0123", present: null },
          { id: 8, name: "Selin Yıldız", surname: "Yıldız", parentPhone: "0532 890 1234", present: null }
        ]
      },
      {
        id: 3,
        title: "U16 Futbol Takım Antrenmanı",
        sport: "Futbol",
        coach: "Ali Demir",
        coachId: "coach3",
        startTime: "16:00",
        endTime: "17:30",
        location: "Futbol Sahası",
        date: date,
        trainingGroup: "U16 Futbol",
        students: [
          { id: 9, name: "Burak Kılıç", surname: "Kılıç", parentPhone: "0532 901 2345", present: null },
          { id: 10, name: "Deniz Acar", surname: "Acar", parentPhone: "0532 012 3456", present: null },
          { id: 11, name: "Ege Polat", surname: "Polat", parentPhone: "0532 123 4567", present: null },
          { id: 12, name: "Furkan Güneş", surname: "Güneş", parentPhone: "0532 234 5678", present: null }
        ]
      },
      {
        id: 4,
        title: "Hentbol Temel Eğitimi",
        sport: "Hentbol",
        coach: "Mehmet Özkan",
        coachId: "coach1",
        startTime: "18:00",
        endTime: "19:00",
        location: "Spor Salonu B",
        date: date,
        trainingGroup: "Hentbol Başlangıç",
        students: [
          { id: 13, name: "Gizem Öztürk", surname: "Öztürk", parentPhone: "0532 345 6789", present: null },
          { id: 14, name: "Hakan Yavuz", surname: "Yavuz", parentPhone: "0532 456 7890", present: null }
        ]
      }
    ];

    let trainingsToShow = allTrainings;

    // Eğer kullanıcı antrenör ise, sadece kendi antrenmanlarını göster
    if (role === 'coach' && user) {
      trainingsToShow = allTrainings.filter(training => training.coachId === user.id);
    }

    // Saate göre sırala
    trainingsToShow.sort((a, b) => a.startTime.localeCompare(b.startTime));

    setTodayTrainings(trainingsToShow);
  };

  const openAttendanceDialog = (training: any) => {
    setSelectedTraining(training);
    setAttendanceData(training.students.map((student: any) => ({ ...student })));
    setIsAttendanceDialogOpen(true);
  };

  const handleAttendanceChange = (studentId: number, present: boolean) => {
    setAttendanceData(prev => 
      prev.map(student => 
        student.id === studentId ? { ...student, present } : student
      )
    );
  };

  const saveAttendance = async () => {
    if (!selectedTraining) return;

    try {
      // Yoklama verilerini kaydet
      const attendanceRecord = {
        trainingId: selectedTraining.id,
        date: selectedDate,
        students: attendanceData,
        savedAt: new Date().toISOString(),
        savedBy: currentUser?.id || 'admin'
      };

      // localStorage'a kaydet (gerçek uygulamada API'ye gönderilecek)
      const existingAttendance = JSON.parse(localStorage.getItem('attendance') || '[]');
      
      // Aynı antrenman için önceki kaydı varsa güncelle, yoksa yeni ekle
      const existingIndex = existingAttendance.findIndex(
        (record: any) => record.trainingId === selectedTraining.id && record.date === selectedDate
      );

      if (existingIndex >= 0) {
        existingAttendance[existingIndex] = attendanceRecord;
      } else {
        existingAttendance.push(attendanceRecord);
      }

      localStorage.setItem('attendance', JSON.stringify(existingAttendance));

      // Devamsızlık bildirimleri gönder
      const absentStudents = attendanceData.filter(student => student.present === false);
      
      if (absentStudents.length > 0) {
        await sendAbsenceNotifications(absentStudents, selectedTraining);
      }

      toast.success(`Yoklama kaydedildi! ${absentStudents.length} devamsız öğrenci için WhatsApp bildirimi gönderildi.`);
      setIsAttendanceDialogOpen(false);
      
      // Antrenman listesini güncelle
      loadTodayTrainings(selectedDate, userRole!, currentUser);
      
    } catch (error) {
      toast.error("Yoklama kaydedilirken bir hata oluştu.");
    }
  };

  const sendAbsenceNotifications = async (absentStudents: any[], training: any) => {
    // WhatsApp bildirimi gönderme simülasyonu
    for (const student of absentStudents) {
      const message = `Merhaba, ${student.name} ${student.surname} bugün saat ${training.startTime}'da ${training.title} antrenmanına katılmamıştır. Bilginize sunarız.`;
      
      // Gerçek uygulamada WhatsApp API'si kullanılacak
      console.log(`WhatsApp mesajı gönderildi: ${student.parentPhone} - ${message}`);
      
      // Kısa bir gecikme ekle (gerçek API çağrısını simüle etmek için)
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  const getAttendanceStats = () => {
    const totalStudents = todayTrainings.reduce((sum, training) => sum + training.students.length, 0);
    const attendedTrainings = todayTrainings.filter(training => 
      training.students.some((student: any) => student.present !== null)
    );
    
    let totalPresent = 0;
    let totalAbsent = 0;
    
    attendedTrainings.forEach(training => {
      training.students.forEach((student: any) => {
        if (student.present === true) totalPresent++;
        if (student.present === false) totalAbsent++;
      });
    });

    return { totalStudents, totalPresent, totalAbsent, attendedTrainings: attendedTrainings.length };
  };

  const stats = getAttendanceStats();

  const getInitials = (name: string, surname: string) => {
    return `${name?.charAt(0) || ''}${surname?.charAt(0) || ''}`.toUpperCase();
  };

  const filteredTrainings = todayTrainings.filter(training =>
    training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    training.coach.toLowerCase().includes(searchTerm.toLowerCase()) ||
    training.sport.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>Yoklama - SportsCRM</title>
        <meta name="description" content="Yoklama sistemi ve devamsızlık takibi" />
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
                <UserCheck className="w-6 h-6 text-primary" />
                <h1 className="text-3xl font-bold">Yoklama Sistemi</h1>
              </div>
              <p className="text-muted-foreground">
                {userRole === 'coach' 
                  ? 'Antrenmanlarınızın yoklamasını alın' 
                  : 'Tüm antrenmanların yoklamasını yönetin'
                }
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-40"
                />
              </div>
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
                    <p className="text-sm font-medium text-muted-foreground">Toplam Antrenman</p>
                    <p className="text-2xl font-bold">{todayTrainings.length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Toplam Sporcu</p>
                    <p className="text-2xl font-bold">{stats.totalStudents}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Katılan</p>
                    <p className="text-2xl font-bold text-green-600">{stats.totalPresent}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Katılmayan</p>
                    <p className="text-2xl font-bold text-red-600">{stats.totalAbsent}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Search */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input 
                      placeholder="Antrenman, antrenör veya spor branşı ara..." 
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Badge variant="outline">
                    {new Date(selectedDate).toLocaleDateString('tr-TR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Today's Trainings */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <Card>
              <CardHeader>
                <CardTitle>
                  {new Date(selectedDate).toDateString() === new Date().toDateString() 
                    ? 'Bugünkü Antrenmanlar' 
                    : 'Seçilen Gün Antrenmanları'
                  } ({filteredTrainings.length})
                </CardTitle>
                <CardDescription>
                  Saatlere göre sıralanmış antrenman listesi ve yoklama durumu
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredTrainings.length > 0 ? (
                  <div className="space-y-4">
                    {filteredTrainings.map((training) => {
                      const presentCount = training.students.filter((s: any) => s.present === true).length;
                      const absentCount = training.students.filter((s: any) => s.present === false).length;
                      const notTakenCount = training.students.filter((s: any) => s.present === null).length;
                      const isCompleted = notTakenCount === 0;
                      
                      return (
                        <Card key={training.id} className="border-l-4 border-l-primary">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-4 mb-3">
                                  <div className="flex items-center space-x-2">
                                    <Timer className="w-5 h-5 text-primary" />
                                    <span className="font-semibold text-lg">{training.startTime} - {training.endTime}</span>
                                  </div>
                                  <Badge variant="outline">{training.sport}</Badge>
                                  {isCompleted && (
                                    <Badge className="bg-green-100 text-green-800 border-green-200">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Tamamlandı
                                    </Badge>
                                  )}
                                </div>
                                
                                <h3 className="text-xl font-semibold mb-2">{training.title}</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Antrenör:</span>
                                    <p className="font-medium">{training.coach}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Lokasyon:</span>
                                    <p className="font-medium">{training.location}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Grup:</span>
                                    <p className="font-medium">{training.trainingGroup}</p>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-6 mt-4">
                                  <div className="flex items-center space-x-2">
                                    <Users className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm">Toplam: {training.students.length}</span>
                                  </div>
                                  {presentCount > 0 && (
                                    <div className="flex items-center space-x-2">
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                      <span className="text-sm text-green-600">Katılan: {presentCount}</span>
                                    </div>
                                  )}
                                  {absentCount > 0 && (
                                    <div className="flex items-center space-x-2">
                                      <XCircle className="w-4 h-4 text-red-600" />
                                      <span className="text-sm text-red-600">Katılmayan: {absentCount}</span>
                                    </div>
                                  )}
                                  {notTakenCount > 0 && (
                                    <div className="flex items-center space-x-2">
                                      <AlertCircle className="w-4 h-4 text-orange-600" />
                                      <span className="text-sm text-orange-600">Bekliyor: {notTakenCount}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Progress Bar */}
                                {(presentCount > 0 || absentCount > 0) && (
                                  <div className="mt-3">
                                    <div className="w-full bg-muted rounded-full h-2">
                                      <div 
                                        className="bg-green-600 h-2 rounded-full" 
                                        style={{ width: `${(presentCount / training.students.length) * 100}%` }}
                                      ></div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Katılım Oranı: {Math.round((presentCount / training.students.length) * 100)}%
                                    </p>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex flex-col space-y-2">
                                <Button 
                                  onClick={() => openAttendanceDialog(training)}
                                  variant={isCompleted ? "outline" : "default"}
                                >
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  {isCompleted ? 'Yoklamayı Düzenle' : 'Yoklama Al'}
                                </Button>
                                
                                {isCompleted && (
                                  <Button variant="outline" size="sm">
                                    <Download className="w-4 h-4 mr-2" />
                                    Rapor
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {new Date(selectedDate).toDateString() === new Date().toDateString() 
                        ? 'Bugün için planlanmış antrenman bulunmuyor' 
                        : 'Seçilen gün için antrenman bulunmuyor'
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Attendance Dialog */}
          <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Yoklama Alma</DialogTitle>
                <DialogDescription>
                  {selectedTraining?.title} - {selectedTraining?.startTime} - {selectedTraining?.endTime}
                </DialogDescription>
              </DialogHeader>
              
              {selectedTraining && (
                <div className="space-y-6">
                  {/* Training Info */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Spor:</span>
                          <p className="font-medium">{selectedTraining.sport}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Antrenör:</span>
                          <p className="font-medium">{selectedTraining.coach}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Lokasyon:</span>
                          <p className="font-medium">{selectedTraining.location}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Grup:</span>
                          <p className="font-medium">{selectedTraining.trainingGroup}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Students List */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Sporcu Listesi ({attendanceData.length})</h4>
                    
                    <div className="grid gap-3">
                      {attendanceData.map((student) => (
                        <Card key={student.id} className="border">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Avatar>
                                  <AvatarFallback>
                                    {getInitials(student.name, student.surname)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{student.name} {student.surname}</p>
                                  <p className="text-sm text-muted-foreground">{student.parentPhone}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-6">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox 
                                      id={`present-${student.id}`}
                                      checked={student.present === true}
                                      onCheckedChange={(checked) => 
                                        handleAttendanceChange(student.id, checked as boolean)
                                      }
                                    />
                                    <Label htmlFor={`present-${student.id}`} className="text-sm font-medium text-green-600">
                                      Katıldı
                                    </Label>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    <Checkbox 
                                      id={`absent-${student.id}`}
                                      checked={student.present === false}
                                      onCheckedChange={(checked) => 
                                        handleAttendanceChange(student.id, !(checked as boolean))
                                      }
                                    />
                                    <Label htmlFor={`absent-${student.id}`} className="text-sm font-medium text-red-600">
                                      Katılmadı
                                    </Label>
                                  </div>
                                </div>
                                
                                <div className="w-8">
                                  {student.present === true && <CheckCircle className="h-5 w-5 text-green-600" />}
                                  {student.present === false && <XCircle className="h-5 w-5 text-red-600" />}
                                  {student.present === null && <AlertCircle className="h-5 w-5 text-orange-600" />}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-6 text-sm">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>Katılan: {attendanceData.filter(s => s.present === true).length}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <XCircle className="w-4 h-4 text-red-600" />
                            <span>Katılmayan: {attendanceData.filter(s => s.present === false).length}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 text-orange-600" />
                            <span>Bekliyor: {attendanceData.filter(s => s.present === null).length}</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button variant="outline" onClick={() => setIsAttendanceDialogOpen(false)}>
                            İptal
                          </Button>
                          <Button onClick={saveAttendance}>
                            <Send className="w-4 h-4 mr-2" />
                            Yoklamayı Kaydet
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}