import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  CreditCard, 
  Calendar, 
  UserCheck, 
  Camera, 
  MessageCircle,
  Download,
  Eye,
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  LogOut,
  Bell
} from "lucide-react";
import { useRouter } from "next/router";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

=======

export default function ParentDashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);

  useEffect(() => {
    // Check if user is logged in and has parent role
    const role = localStorage.getItem("userRole");
    const email = localStorage.getItem("userEmail");
    
    if (role !== "parent") {
      router.push("/login");
      return;
    }
    
    setUserEmail(email || "");
    
    // Load parent user data
    const parentUsers = JSON.parse(localStorage.getItem('parentUsers') || '[]');
    const currentParent = parentUsers.find((parent: any) => parent.email === email);
    
    if (currentParent) {
      setCurrentUser(currentParent);
      loadChildrenData(currentParent);
    }
  }, [router]);

  const loadChildrenData = (parent: any) => {
    // Load all students and filter by parent's linked athletes
    const allStudents = JSON.parse(localStorage.getItem('students') || '[]');
    const parentChildren = allStudents.filter((student: any) => 
      parent.linkedAthletes?.includes(student.id) ||
      student.parentEmail === parent.email ||
      student.parentPhone === parent.phone
    );
    
    setChildren(parentChildren);
    
    // Load related data for these children
    loadPaymentsData(parentChildren);
    loadAttendanceData(parentChildren);
    loadScheduleData(parentChildren);
    loadMediaData(parentChildren);
  };

  const loadPaymentsData = (children: any[]) => {
    const allPayments: any[] = [];
    children.forEach(child => {
      const accountEntries = JSON.parse(localStorage.getItem(`account_${child.id}`) || '[]');
      accountEntries.forEach((entry: any) => {
        allPayments.push({
          id: entry.id,
          childName: `${child.studentName} ${child.studentSurname}`,
          month: entry.month,
          amount: entry.amountIncludingVat,
          status: entry.type === 'credit' ? 'paid' : 'pending',
          dueDate: entry.date,
          description: entry.description
        });
      });
    });
    setPayments(allPayments);
  };

  const loadAttendanceData = (children: any[]) => {
    const allAttendance = JSON.parse(localStorage.getItem('attendance') || '[]');
    const childrenAttendance = allAttendance.filter((record: any) => 
      children.some(child => 
        record.studentName === `${child.studentName} ${child.studentSurname}` ||
        record.studentId === child.id
      )
    );
    setAttendance(childrenAttendance);
  };

  const loadScheduleData = (children: any[]) => {
    const allTrainings = JSON.parse(localStorage.getItem('trainings') || '[]');
    const childrenSchedule: any[] = [];
    
    children.forEach(child => {
      child.sportsBranches?.forEach((sport: string) => {
        const relatedTrainings = allTrainings.filter((training: any) => 
          training.sport === sport || training.sportsBranches?.includes(sport)
        );
        
        relatedTrainings.forEach((training: any) => {
          childrenSchedule.push({
            id: `${child.id}_${training.id}`,
            childName: `${child.studentName} ${child.studentSurname}`,
            sport: sport,
            day: training.day || 'Belirtilmemiş',
            time: training.time || 'Belirtilmemiş',
            coach: training.coach || 'Belirtilmemiş'
          });
        });
      });
    });
    
    setSchedule(childrenSchedule);
  };

  const loadMediaData = (children: any[]) => {
    const allMedia = JSON.parse(localStorage.getItem('media') || '[]');
    const childrenMedia = allMedia.filter((mediaItem: any) => 
      children.some(child => 
        mediaItem.studentName === `${child.studentName} ${child.studentSurname}` ||
        mediaItem.studentId === child.id
      )
    );
    setMedia(childrenMedia);
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("currentUser");
    router.push("/");
  };

  const getAttendanceRate = (childName: string) => {
    const childAttendance = attendance.filter(a => 
      a.studentName === childName || 
      a.childName === childName
    );
    const presentCount = childAttendance.filter(a => a.status === "present").length;
    return childAttendance.length > 0 ? Math.round((presentCount / childAttendance.length) * 100) : 0;
  };

  const getPendingPayments = () => {
    return payments.filter(p => p.status === "pending");
  };

  const getInitials = (name: string, surname: string) => {
    return `${name?.charAt(0) || ''}${surname?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <>
      <Head>
        <title>Veli Paneli - SportsCRM</title>
        <meta name="description" content="Çocuklarınızın spor okulu bilgilerini takip edin" />
      </Head>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-primary">SportsCRM</span>
              <Badge variant="secondary">Veli Paneli</Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">{userEmail}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Çıkış
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-primary mb-2">Hoş Geldiniz!</h1>
            <p className="text-muted-foreground">Çocuklarınızın spor okulu bilgilerini buradan takip edebilirsiniz.</p>
          </motion.div>

          {/* Children Cards */}
          <motion.div 
            className="grid md:grid-cols-2 gap-6 mb-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {children.length > 0 ? children.map((child) => (
              <motion.div key={child.id} variants={fadeInUp}>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-bold text-primary">
                          {getInitials(child.studentName, child.studentSurname)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{child.studentName} {child.studentSurname}</h3>
                        <p className="text-sm text-muted-foreground">{child.studentClass} • {child.studentAge} yaş</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {child.sportsBranches?.map((sport: string) => (
                            <Badge key={sport} variant="outline" className="text-xs">
                              {sport}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {getAttendanceRate(`${child.studentName} ${child.studentSurname}`)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Devam Oranı</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )) : (
              <motion.div variants={fadeInUp} className="col-span-2">
                <Card>
                  <CardContent className="p-8 text-center">
                    <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Henüz kayıtlı çocuk bulunmuyor</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            className="grid md:grid-cols-4 gap-4 mb-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-8 h-8 text-blue-500" />
                    <div>
                      <div className="text-2xl font-bold">{getPendingPayments().length}</div>
                      <div className="text-xs text-muted-foreground">Bekleyen Ödeme</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-8 h-8 text-green-500" />
                    <div>
                      <div className="text-2xl font-bold">{schedule.length}</div>
                      <div className="text-xs text-muted-foreground">Haftalık Antrenman</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-8 h-8 text-orange-500" />
                    <div>
                      <div className="text-2xl font-bold">
                        {attendance.length > 0 ? Math.round(attendance.filter(a => a.status === "present").length / attendance.length * 100) : 0}%
                      </div>
                      <div className="text-xs text-muted-foreground">Genel Devam</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Camera className="w-8 h-8 text-purple-500" />
                    <div>
                      <div className="text-2xl font-bold">{media.length}</div>
                      <div className="text-xs text-muted-foreground">Yeni Medya</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Main Content Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Tabs defaultValue="payments" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="payments" className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Ödemeler</span>
                </TabsTrigger>
                <TabsTrigger value="schedule" className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Program</span>
                </TabsTrigger>
                <TabsTrigger value="attendance" className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4" />
                  <span>Devam</span>
                </TabsTrigger>
                <TabsTrigger value="media" className="flex items-center space-x-2">
                  <Camera className="w-4 h-4" />
                  <span>Medya</span>
                </TabsTrigger>
                <TabsTrigger value="messages" className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>Mesajlar</span>
                </TabsTrigger>
              </TabsList>

              {/* Payments Tab */}
              <TabsContent value="payments">
                <Card>
                  <CardHeader>
                    <CardTitle>Ödeme Durumu</CardTitle>
                    <CardDescription>Çocuklarınızın ödeme bilgilerini görüntüleyin</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Öğrenci</TableHead>
                          <TableHead>Dönem</TableHead>
                          <TableHead>Tutar</TableHead>
                          <TableHead>Son Ödeme</TableHead>
                          <TableHead>Durum</TableHead>
                          <TableHead>İşlem</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.length > 0 ? payments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-medium">{payment.childName}</TableCell>
                            <TableCell>{payment.month}</TableCell>
                            <TableCell>₺{payment.amount?.toFixed(2)}</TableCell>
                            <TableCell>{new Date(payment.dueDate).toLocaleDateString('tr-TR')}</TableCell>
                            <TableCell>
                              <Badge variant={payment.status === "paid" ? "default" : "destructive"}>
                                {payment.status === "paid" ? "Ödendi" : "Bekliyor"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Fatura
                              </Button>
                            </TableCell>
                          </TableRow>
                        )) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                              <p className="text-muted-foreground">Henüz ödeme kaydı bulunmuyor</p>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Schedule Tab */}
              <TabsContent value="schedule">
                <Card>
                  <CardHeader>
                    <CardTitle>Antrenman Programı</CardTitle>
                    <CardDescription>Çocuklarınızın haftalık antrenman programı</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Öğrenci</TableHead>
                          <TableHead>Spor</TableHead>
                          <TableHead>Gün</TableHead>
                          <TableHead>Saat</TableHead>
                          <TableHead>Antrenör</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {schedule.length > 0 ? schedule.map((scheduleItem) => (
                          <TableRow key={scheduleItem.id}>
                            <TableCell className="font-medium">{scheduleItem.childName}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{scheduleItem.sport}</Badge>
                            </TableCell>
                            <TableCell>{scheduleItem.day}</TableCell>
                            <TableCell>{scheduleItem.time}</TableCell>
                            <TableCell>{scheduleItem.coach}</TableCell>
                          </TableRow>
                        )) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                              <p className="text-muted-foreground">Henüz antrenman programı bulunmuyor</p>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Attendance Tab */}
              <TabsContent value="attendance">
                <Card>
                  <CardHeader>
                    <CardTitle>Devam Durumu</CardTitle>
                    <CardDescription>Çocuklarınızın antrenman devam durumu</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {children.length > 0 ? (
                      <>
                        <div className="space-y-6">
                          {children.map((child) => (
                            <div key={child.id} className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold">{child.studentName} {child.studentSurname}</h4>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-muted-foreground">Devam Oranı:</span>
                                  <Badge variant="outline">{getAttendanceRate(`${child.studentName} ${child.studentSurname}`)}%</Badge>
                                </div>
                              </div>
                              <Progress value={getAttendanceRate(`${child.studentName} ${child.studentSurname}`)} className="h-2" />
                            </div>
                          ))}
                        </div>

                        <div className="mt-8">
                          <h4 className="font-semibold mb-4">Son Devam Kayıtları</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Öğrenci</TableHead>
                                <TableHead>Spor</TableHead>
                                <TableHead>Tarih</TableHead>
                                <TableHead>Durum</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {attendance.length > 0 ? attendance.slice(0, 10).map((attendanceRecord) => (
                                <TableRow key={attendanceRecord.id}>
                                  <TableCell className="font-medium">{attendanceRecord.studentName}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline">{attendanceRecord.sport || attendanceRecord.trainingGroup}</Badge>
                                  </TableCell>
                                  <TableCell>{new Date(attendanceRecord.date).toLocaleDateString('tr-TR')}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-2">
                                      {attendanceRecord.status === "present" ? (
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                      ) : (
                                        <XCircle className="w-4 h-4 text-red-500" />
                                      )}
                                      <span>{attendanceRecord.status === "present" ? "Katıldı" : "Katılmadı"}</span>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )) : (
                                <TableRow>
                                  <TableCell colSpan={4} className="text-center py-8">
                                    <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">Henüz devam kaydı bulunmuyor</p>
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Henüz kayıtlı çocuk bulunmuyor</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Media Tab */}
              <TabsContent value="media">
                <Card>
                  <CardHeader>
                    <CardTitle>Medya Galerisi</CardTitle>
                    <CardDescription>Çocuklarınızın antrenman fotoğraf ve videoları</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {media.length > 0 ? (
                      <div className="grid md:grid-cols-3 gap-4">
                        {media.map((mediaItem) => (
                          <Card key={mediaItem.id}>
                            <CardContent className="p-4">
                              <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                                <Camera className="w-8 h-8 text-muted-foreground" />
                              </div>
                              <h4 className="font-medium mb-1">{mediaItem.title}</h4>
                              <p className="text-sm text-muted-foreground mb-2">{mediaItem.studentName}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  {new Date(mediaItem.date || mediaItem.createdAt).toLocaleDateString('tr-TR')}
                                </span>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4 mr-2" />
                                  Görüntüle
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Henüz medya içeriği bulunmuyor</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Messages Tab */}
              <TabsContent value="messages">
                <Card>
                  <CardHeader>
                    <CardTitle>Mesajlar</CardTitle>
                    <CardDescription>Spor okulundan gelen mesajlar ve duyurular</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Henüz mesaj bulunmuyor</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Spor okulundan gelen duyurular ve mesajlar burada görünecektir
                      </p>
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