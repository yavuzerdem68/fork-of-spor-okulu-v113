import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  Trophy, 
  Clock, 
  Target,
  UserCheck,
  UserX,
  Phone,
  Mail,
  LogOut,
  Zap,
  Activity
} from "lucide-react";
import { useRouter } from "next/router";
import Link from "next/link";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function CoachDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [myStudents, setMyStudents] = useState<any[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<any[]>([]);
  const [myTrainings, setMyTrainings] = useState<any[]>([]);
  const [todayTrainings, setTodayTrainings] = useState<any[]>([]);

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "coach") {
      router.push("/login");
      return;
    }

    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    setCurrentUser(user);

    // Load students assigned to this coach's training groups
    loadMyStudents(user);
    loadTodayAttendance(user);
    loadMyTrainings(user);
  }, [router]);

  const loadMyStudents = (coach: any) => {
    const allStudents = JSON.parse(localStorage.getItem('students') || '[]');
    
    // Filter students who are in coach's training groups or sports branches
    const myStudents = allStudents.filter((student: any) => {
      // Check if student is in any of the coach's training groups
      if (coach.trainingGroups?.length > 0 && student.trainingGroups?.length > 0) {
        const hasMatchingGroup = coach.trainingGroups.some((group: string) => 
          student.trainingGroups.includes(group)
        );
        if (hasMatchingGroup) return true;
      }
      
      // Check if student plays any of the coach's sports branches
      if (coach.sportsBranches?.length > 0 && student.sportsBranches?.length > 0) {
        const hasMatchingSport = coach.sportsBranches.some((branch: string) => 
          student.sportsBranches.includes(branch)
        );
        if (hasMatchingSport) return true;
      }
      
      // Also check selectedSports field (alternative field name)
      if (coach.sportsBranches?.length > 0 && student.selectedSports?.length > 0) {
        const hasMatchingSport = coach.sportsBranches.some((branch: string) => 
          student.selectedSports.includes(branch)
        );
        if (hasMatchingSport) return true;
      }
      
      return false;
    });
    
    console.log('Coach:', coach);
    console.log('All students:', allStudents);
    console.log('Coach students:', myStudents);
    
    setMyStudents(myStudents);
  };

  const loadMyTrainings = (coach: any) => {
    const allTrainings = JSON.parse(localStorage.getItem('trainings') || '[]');
    const today = new Date();
    const currentDate = today.toISOString().split('T')[0];
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDayName = dayNames[dayOfWeek];
    
    const coachName = `${coach.name || ''} ${coach.surname || ''}`.trim();
    
    // Filter trainings assigned to this coach
    const coachTrainings = allTrainings.filter((training: any) => {
      return training.coach === coachName;
    });
    
    // Filter today's trainings
    const todaysTrainings = coachTrainings.filter((training: any) => {
      // Check single-day trainings
      if (training.date === currentDate) {
        return true;
      }
      
      // Check date range trainings
      if (training.startDate) {
        const startDate = new Date(training.startDate);
        const endDate = training.endDate ? new Date(training.endDate) : startDate;
        
        // Check if current date is within training period
        if (today >= startDate && today <= endDate) {
          // If it's a recurring training, check if today is one of the recurring days
          if (training.isRecurring && training.recurringDays && training.recurringDays.length > 0) {
            return training.recurringDays.includes(currentDayName);
          } else {
            // Non-recurring training within date range
            return true;
          }
        }
      }
      
      return false;
    });
    
    // Sort by time
    todaysTrainings.sort((a: any, b: any) => (a.startTime || '').localeCompare(b.startTime || ''));
    
    setMyTrainings(coachTrainings);
    setTodayTrainings(todaysTrainings);
  };

  const loadTodayAttendance = (coach: any) => {
    const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
    const today = new Date().toISOString().split('T')[0];
    const coachName = `${coach.name || ''} ${coach.surname || ''}`.trim();
    
    // Get today's attendance records for this coach's trainings
    const todayRecords = attendance.filter((record: any) => {
      if (record.date !== today) return false;
      
      // Check if this attendance record belongs to coach's training
      const allTrainings = JSON.parse(localStorage.getItem('trainings') || '[]');
      const training = allTrainings.find((t: any) => t.id === record.trainingId);
      
      return training && training.coach === coachName;
    });
    
    // Flatten the attendance records to show individual students
    const flattenedRecords: any[] = [];
    todayRecords.forEach((record: any) => {
      if (record.students && Array.isArray(record.students)) {
        record.students.forEach((student: any) => {
          flattenedRecords.push({
            ...student,
            trainingId: record.trainingId,
            date: record.date,
            studentName: `${student.name || ''} ${student.surname || ''}`.trim(),
            status: student.present === true ? 'present' : student.present === false ? 'absent' : 'not_taken'
          });
        });
      }
    });
    
    setTodayAttendance(flattenedRecords);
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("currentUser");
    router.push("/login");
  };

  const getInitials = (name: string, surname: string) => {
    return `${name?.charAt(0) || ''}${surname?.charAt(0) || ''}`.toUpperCase();
  };

  const presentStudents = todayAttendance.filter(record => record.status === 'present').length;
  const absentStudents = todayAttendance.filter(record => record.status === 'absent').length;

  if (!currentUser) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <>
      <Head>
        <title>Antrenör Paneli - SportsCRM</title>
        <meta name="description" content="Antrenör yönetim paneli" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-8 w-8 text-primary" />
                  <span className="text-2xl font-bold text-primary">SportsCRM</span>
                </div>
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <Zap className="w-3 h-3" />
                  <span>Antrenör</span>
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="font-medium">{currentUser.name} {currentUser.surname}</p>
                  <p className="text-sm text-muted-foreground">{currentUser.specialization}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Çıkış
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold mb-2">
              Hoş geldiniz, {currentUser.name} {currentUser.surname}
            </h1>
            <p className="text-muted-foreground">
              Antrenman gruplarınızı ve sporcularınızı yönetin
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Toplam Sporcu</p>
                    <p className="text-2xl font-bold">{myStudents.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bugünkü Antrenmanlar</p>
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
                    <p className="text-sm font-medium text-muted-foreground">Bugün Katılan</p>
                    <p className="text-2xl font-bold text-green-600">{presentStudents}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Toplam Antrenmanlar</p>
                    <p className="text-2xl font-bold">{myTrainings.length}</p>
                  </div>
                  <Target className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <Tabs defaultValue="trainings" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="trainings">Antrenmanlarım</TabsTrigger>
                <TabsTrigger value="students">Sporcularım</TabsTrigger>
                <TabsTrigger value="attendance">Yoklama</TabsTrigger>
                <TabsTrigger value="messages">Mesajlar</TabsTrigger>
                <TabsTrigger value="profile">Profil</TabsTrigger>
              </TabsList>

              {/* My Trainings */}
              <TabsContent value="trainings">
                <div className="space-y-6">
                  {/* Today's Trainings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Clock className="w-5 h-5" />
                        <span>Bugünkü Antrenmanlarım</span>
                      </CardTitle>
                      <CardDescription>
                        Bugün yapacağınız antrenmanlar ve yoklama durumu
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {todayTrainings.length > 0 ? (
                        <div className="space-y-4">
                          {todayTrainings.map((training) => (
                            <Card key={training.id} className="border-l-4 border-l-primary">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-4 mb-2">
                                      <div className="flex items-center space-x-2">
                                        <Clock className="w-4 h-4 text-primary" />
                                        <span className="font-semibold">{training.startTime} - {training.endTime}</span>
                                      </div>
                                      <Badge variant="outline">{training.sport}</Badge>
                                    </div>
                                    
                                    <h4 className="font-semibold mb-2">{training.title}</h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                      <div>
                                        <span className="text-muted-foreground">Lokasyon:</span>
                                        <p className="font-medium">{training.location}</p>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Grup:</span>
                                        <p className="font-medium">{training.trainingGroup || training.ageGroup}</p>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Katılımcı:</span>
                                        <p className="font-medium">{training.assignedAthletes?.length || 0} sporcu</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex flex-col space-y-2">
                                    <Link href="/attendance">
                                      <Button size="sm">
                                        <UserCheck className="w-4 h-4 mr-2" />
                                        Yoklama Al
                                      </Button>
                                    </Link>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">Bugün için planlanmış antrenman bulunmuyor</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* All My Trainings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5" />
                        <span>Tüm Antrenmanlarım</span>
                      </CardTitle>
                      <CardDescription>
                        Size atanmış tüm antrenman programları
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {myTrainings.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Antrenman</TableHead>
                              <TableHead>Tarih & Saat</TableHead>
                              <TableHead>Lokasyon</TableHead>
                              <TableHead>Katılımcı</TableHead>
                              <TableHead>Durum</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {myTrainings.map((training) => (
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
                                  <div>
                                    <p className="text-sm font-medium">
                                      {training.startDate ? new Date(training.startDate).toLocaleDateString('tr-TR') : 
                                       training.date ? new Date(training.date).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {training.startTime} - {training.endTime}
                                    </p>
                                    {training.isRecurring && training.recurringDays && (
                                      <p className="text-xs text-blue-600">
                                        Tekrarlanan: {training.recurringDays.length} gün
                                      </p>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>{training.location}</TableCell>
                                <TableCell>
                                  <div className="text-center">
                                    <p className="text-sm font-medium">
                                      {training.assignedAthletes?.length || 0}/{training.maxParticipants}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={training.status === 'Aktif' ? 'default' : 'secondary'}>
                                    {training.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-8">
                          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">Henüz size atanmış antrenman bulunmuyor</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* My Students */}
              <TabsContent value="students">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>Sporcularım</span>
                    </CardTitle>
                    <CardDescription>
                      Antrenman gruplarınızdaki sporcuları görüntüleyin ve yönetin
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {myStudents.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Sporcu</TableHead>
                            <TableHead>Branş</TableHead>
                            <TableHead>Antrenman Grubu</TableHead>
                            <TableHead>Veli İletişim</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {myStudents.map((student, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <Avatar>
                                    <AvatarFallback>
                                      {getInitials(student.studentName, student.studentSurname)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{student.studentName} {student.studentSurname}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {student.studentAge} yaş
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {student.sportsBranches?.map((branch: string, idx: number) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {branch}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {student.trainingGroups?.map((group: string, idx: number) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {group}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline">
                                    <Phone className="w-4 h-4 mr-1" />
                                    {student.parentPhone}
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Mail className="w-4 h-4 mr-1" />
                                    İletişim
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Henüz atanmış sporcu bulunmuyor</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Attendance */}
              <TabsContent value="attendance">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5" />
                      <span>Yoklama Yönetimi</span>
                    </CardTitle>
                    <CardDescription>
                      Antrenman gruplarınızın yoklama durumunu görüntüleyin
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Bugünkü Yoklama</h3>
                        <Badge variant="outline">
                          {new Date().toLocaleDateString('tr-TR')}
                        </Badge>
                      </div>
                      
                      {todayAttendance.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Sporcu</TableHead>
                              <TableHead>Antrenman Grubu</TableHead>
                              <TableHead>Durum</TableHead>
                              <TableHead>Saat</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {todayAttendance.map((record, index) => (
                              <TableRow key={index}>
                                <TableCell>{record.studentName}</TableCell>
                                <TableCell>
                                  <Badge variant="secondary">{record.trainingGroup}</Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    variant={record.status === 'present' ? 'default' : 'destructive'}
                                  >
                                    {record.status === 'present' ? 'Katıldı' : 'Katılmadı'}
                                  </Badge>
                                </TableCell>
                                <TableCell>{record.time || '--:--'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-8">
                          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">Bugün için yoklama kaydı bulunmuyor</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Messages */}
              <TabsContent value="messages">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageSquare className="w-5 h-5" />
                      <span>Mesajlaşma</span>
                    </CardTitle>
                    <CardDescription>
                      Sporcularınızın velileri ile iletişim kurun
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Henüz mesaj bulunmuyor</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Sporcularınızın velileri ile mesajlaşma burada görünecektir
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Profile */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="w-5 h-5" />
                      <span>Profil Bilgileri</span>
                    </CardTitle>
                    <CardDescription>
                      Antrenör bilgilerinizi görüntüleyin
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-medium mb-4">Kişisel Bilgiler</h3>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-muted-foreground">Ad Soyad</p>
                              <p className="font-medium">{currentUser.name} {currentUser.surname}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Email</p>
                              <p className="font-medium">{currentUser.email}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Telefon</p>
                              <p className="font-medium">{currentUser.phone}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Uzmanlık</p>
                              <p className="font-medium">{currentUser.specialization}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Deneyim</p>
                              <p className="font-medium">{currentUser.experience}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-medium mb-4">Antrenman Bilgileri</h3>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-muted-foreground">Spor Branşları</p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {currentUser.sportsBranches?.map((branch: string, index: number) => (
                                  <Badge key={index} variant="outline">{branch}</Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Antrenman Grupları</p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {currentUser.trainingGroups?.map((group: string, index: number) => (
                                  <Badge key={index} variant="secondary">{group}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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