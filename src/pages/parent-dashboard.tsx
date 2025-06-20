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
  Bell,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ChevronUp,
  ChevronDown,
  Minus,
  Ruler,
  Weight,
  Timer
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

export default function ParentDashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);

  useEffect(() => {
    // Check if user is logged in and has parent role
    const role = localStorage.getItem("userRole");
    const email = localStorage.getItem("userEmail");
    const storedUser = localStorage.getItem("currentUser");
    
    if (role !== "parent") {
      router.push("/login");
      return;
    }
    
    setUserEmail(email || "");
    
    // Try to get current user from localStorage first
    let currentParent = null;
    if (storedUser) {
      try {
        currentParent = JSON.parse(storedUser);
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
    
    // If no stored user, try to find by email in parentUsers
    if (!currentParent && email) {
      const parentUsers = JSON.parse(localStorage.getItem('parentUsers') || '[]');
      currentParent = parentUsers.find((parent: any) => parent.email === email);
    }
    
    if (currentParent) {
      setCurrentUser(currentParent);
      loadChildrenData(currentParent);
    } else {
      console.log('No parent user found. Email:', email, 'Stored user:', storedUser);
    }
  }, [router]);

  const loadChildrenData = (parent: any) => {
    // Load all students and filter by parent's linked athletes
    const allStudents = JSON.parse(localStorage.getItem('students') || '[]');
    
    // Multiple ways to match parent with children:
    // 1. Direct linkedAthletes array
    // 2. Email match
    // 3. Phone match
    // 4. Name match (for cases where email/phone might be different)
    const parentChildren = allStudents.filter((student: any) => {
      // Check linkedAthletes array
      if (parent.linkedAthletes?.includes(student.id)) {
        return true;
      }
      
      // Check email match
      if (student.parentEmail && parent.email && 
          student.parentEmail.toLowerCase() === parent.email.toLowerCase()) {
        return true;
      }
      
      // Check phone match (remove spaces and special characters)
      if (student.parentPhone && parent.phone) {
        const studentPhone = student.parentPhone.replace(/\s+/g, '').replace(/[^\d]/g, '');
        const parentPhone = parent.phone.replace(/\s+/g, '').replace(/[^\d]/g, '');
        if (studentPhone === parentPhone) {
          return true;
        }
      }
      
      // Check name match (first name + last name)
      if (student.parentName && student.parentSurname && 
          parent.firstName && parent.lastName) {
        const studentParentName = `${student.parentName} ${student.parentSurname}`.toLowerCase();
        const parentName = `${parent.firstName} ${parent.lastName}`.toLowerCase();
        if (studentParentName === parentName) {
          return true;
        }
      }
      
      return false;
    });
    
    console.log('Parent:', parent);
    console.log('All students:', allStudents);
    console.log('Matched children:', parentChildren);
    
    setChildren(parentChildren);
    
    // Load related data for these children
    loadPaymentsData(parentChildren);
    loadAttendanceData(parentChildren);
    loadScheduleData(parentChildren);
    loadMediaData(parentChildren);
    loadPerformanceData(parentChildren);
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
    const childrenAttendance: any[] = [];
    
    // Process attendance records and extract individual student records
    allAttendance.forEach((record: any) => {
      if (record.students && Array.isArray(record.students)) {
        record.students.forEach((student: any) => {
          const studentFullName = `${student.name || ''} ${student.surname || ''}`.trim();
          const matchingChild = children.find(child => 
            studentFullName === `${child.studentName} ${child.studentSurname}` ||
            student.id === child.id
          );
          
          if (matchingChild) {
            childrenAttendance.push({
              id: `${record.trainingId}_${student.id}_${record.date}`,
              studentName: studentFullName,
              studentId: student.id,
              date: record.date,
              status: student.present === true ? 'present' : student.present === false ? 'absent' : 'not_taken',
              trainingId: record.trainingId,
              sport: record.sport || 'Genel',
              trainingGroup: record.trainingGroup || 'Genel'
            });
          }
        });
      } else {
        // Handle old format attendance records
        const matchingChild = children.find(child => 
          record.studentName === `${child.studentName} ${child.studentSurname}` ||
          record.studentId === child.id
        );
        
        if (matchingChild) {
          childrenAttendance.push(record);
        }
      }
    });
    
    setAttendance(childrenAttendance);
  };

  const loadScheduleData = (children: any[]) => {
    const allTrainings = JSON.parse(localStorage.getItem('trainings') || '[]');
    const childrenSchedule: any[] = [];
    const today = new Date();
    const currentDate = today.toISOString().split('T')[0];
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDayName = dayNames[dayOfWeek];
    
    children.forEach(child => {
      // Find trainings where this child is assigned
      const childTrainings = allTrainings.filter((training: any) => {
        // Check if child is directly assigned to this training
        if (training.assignedAthletes && training.assignedAthletes.includes(child.id.toString())) {
          return true;
        }
        
        // Check if child's sport matches training sport
        if (child.sportsBranches?.includes(training.sport)) {
          return true;
        }
        
        return false;
      });
      
      childTrainings.forEach((training: any) => {
        // Check if training is active for today or in the future
        let isActiveTraining = false;
        let displayDay = 'Belirtilmemiş';
        let displayTime = training.startTime && training.endTime 
          ? `${training.startTime} - ${training.endTime}` 
          : 'Belirtilmemiş';
        
        // Handle single-day trainings
        if (training.date && !training.endDate) {
          const trainingDate = new Date(training.date);
          if (trainingDate >= today || training.date === currentDate) {
            isActiveTraining = true;
            displayDay = trainingDate.toLocaleDateString('tr-TR', { weekday: 'long' });
          }
        }
        
        // Handle date range trainings
        if (training.startDate) {
          const startDate = new Date(training.startDate);
          const endDate = training.endDate ? new Date(training.endDate) : startDate;
          
          // Check if current date is within training period
          if (today >= startDate && today <= endDate) {
            // If it's a recurring training, check if today is one of the recurring days
            if (training.isRecurring && training.recurringDays && training.recurringDays.length > 0) {
              if (training.recurringDays.includes(currentDayName)) {
                isActiveTraining = true;
                displayDay = today.toLocaleDateString('tr-TR', { weekday: 'long' });
              }
            } else {
              // Non-recurring training within date range
              isActiveTraining = true;
              displayDay = today.toLocaleDateString('tr-TR', { weekday: 'long' });
            }
          }
          
          // Also show future trainings
          if (startDate > today) {
            isActiveTraining = true;
            if (training.isRecurring && training.recurringDays && training.recurringDays.length > 0) {
              // Show all recurring days
              training.recurringDays.forEach((dayName: string) => {
                const dayIndex = dayNames.indexOf(dayName);
                const dayNameTurkish = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'][dayIndex];
                
                childrenSchedule.push({
                  id: `${child.id}_${training.id}_${dayName}`,
                  childName: `${child.studentName} ${child.studentSurname}`,
                  sport: training.sport,
                  day: dayNameTurkish,
                  time: displayTime,
                  coach: training.coach || 'Belirtilmemiş',
                  location: training.location || 'Belirtilmemiş',
                  trainingGroup: training.trainingGroup || training.ageGroup || 'Genel',
                  status: training.status || 'Aktif'
                });
              });
              return; // Skip the single entry below
            } else {
              displayDay = startDate.toLocaleDateString('tr-TR', { weekday: 'long' });
            }
          }
        }
        
        if (isActiveTraining) {
          childrenSchedule.push({
            id: `${child.id}_${training.id}`,
            childName: `${child.studentName} ${child.studentSurname}`,
            sport: training.sport,
            day: displayDay,
            time: displayTime,
            coach: training.coach || 'Belirtilmemiş',
            location: training.location || 'Belirtilmemiş',
            trainingGroup: training.trainingGroup || training.ageGroup || 'Genel',
            status: training.status || 'Aktif'
          });
        }
      });
    });
    
    // Sort by day and time
    childrenSchedule.sort((a, b) => {
      const dayOrder = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
      const dayA = dayOrder.indexOf(a.day);
      const dayB = dayOrder.indexOf(b.day);
      
      if (dayA !== dayB) {
        return dayA - dayB;
      }
      
      return a.time.localeCompare(b.time);
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

  const loadPerformanceData = (children: any[]) => {
    const allPerformanceData = JSON.parse(localStorage.getItem('performanceData') || '[]');
    const childrenPerformance = allPerformanceData.filter((entry: any) => 
      children.some(child => 
        entry.athleteId.toString() === child.id.toString() ||
        entry.athleteName === `${child.studentName} ${child.studentSurname}`
      )
    );
    setPerformanceData(childrenPerformance);
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

  // Performance helper functions
  const getChildPerformanceData = (childId: string) => {
    return performanceData
      .filter(entry => entry.athleteId.toString() === childId.toString())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const formatMetricValue = (value: any, metricName: string) => {
    if (!value || value === "") return "-";
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;

    // Determine unit based on metric name
    if (metricName.includes("Sürat") || metricName.includes("Koşu") || metricName.includes("Dayanıklılık")) {
      return `${numValue.toFixed(2)} sn`;
    } else if (metricName.includes("Sıçrama") || metricName.includes("Atlama") || metricName.includes("Boy") || metricName.includes("Mesafe")) {
      return `${numValue.toFixed(1)} cm`;
    } else if (metricName.includes("Kilo") || metricName.includes("Atma")) {
      return `${numValue.toFixed(1)} kg`;
    } else if (metricName.includes("Atış") || metricName.includes("İsabet") || metricName.includes("Yağ") || metricName.includes("Kas")) {
      return `${numValue.toFixed(1)}%`;
    } else if (metricName.includes("BMI")) {
      return `${numValue.toFixed(1)} kg/m²`;
    } else {
      return `${numValue.toFixed(1)}`;
    }
  };

  const getPerformanceTrend = (childId: string, metricKey: string) => {
    const childData = getChildPerformanceData(childId);
    const values = childData
      .map(entry => entry.metrics[metricKey])
      .filter(value => value !== undefined && value !== "")
      .map(value => parseFloat(value))
      .filter(value => !isNaN(value));

    if (values.length < 2) return "stable";

    const latest = values[0];
    const previous = values[1];
    
    // For time-based metrics (lower is better)
    const timeMetrics = ["speed_20m", "speed_40m", "agility_test", "freestyle_50m", "freestyle_100m", "backstroke_50m", "breaststroke_50m", "butterfly_50m", "speed_100m", "speed_200m", "endurance_1500m", "endurance_400m", "reaction_time"];
    const isTimeBased = timeMetrics.includes(metricKey) || metricKey.includes("speed") || metricKey.includes("time");
    
    const improvement = isTimeBased ? latest < previous : latest > previous;
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
              <TabsList className="grid w-full grid-cols-6">
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
                <TabsTrigger value="performance" className="flex items-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span>Performans</span>
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

              {/* Performance Tab */}
              <TabsContent value="performance">
                <Card>
                  <CardHeader>
                    <CardTitle>Atletik Performans</CardTitle>
                    <CardDescription>Çocuklarınızın atletik performans gelişimini takip edin</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {children.length > 0 ? (
                      <div className="space-y-8">
                        {children.map((child) => {
                          const childPerformanceData = getChildPerformanceData(child.id);
                          const latestEntry = childPerformanceData[0];
                          
                          return (
                            <div key={child.id} className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-sm font-bold text-primary">
                                      {getInitials(child.studentName, child.studentSurname)}
                                    </span>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">{child.studentName} {child.studentSurname}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {child.sportsBranches?.[0] || 'Genel'} • {childPerformanceData.length} ölçüm
                                    </p>
                                  </div>
                                </div>
                                {latestEntry && (
                                  <Badge variant="outline">
                                    Son ölçüm: {new Date(latestEntry.date).toLocaleDateString('tr-TR')}
                                  </Badge>
                                )}
                              </div>

                              {latestEntry ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {Object.entries(latestEntry.metrics)
                                    .filter(([key, value]) => value && value !== "")
                                    .slice(0, 6)
                                    .map(([metricKey, value]) => {
                                      const trend = getPerformanceTrend(child.id, metricKey);
                                      
                                      // Convert metric key to readable name
                                      const metricNames: { [key: string]: string } = {
                                        height: "Boy",
                                        weight: "Kilo", 
                                        bmi: "BMI",
                                        speed_20m: "20m Sürat",
                                        speed_40m: "40m Sürat",
                                        vertical_jump: "Dikey Sıçrama",
                                        long_jump: "Uzun Atlama",
                                        agility_test: "Çeviklik Testi",
                                        endurance_12min: "12 Dakika Koşu",
                                        ball_control: "Top Kontrolü",
                                        shooting_accuracy: "Şut İsabeti",
                                        free_throw: "Serbest Atış",
                                        three_point: "3 Sayılık Atış",
                                        dribbling: "Dribling",
                                        freestyle_50m: "50m Serbest",
                                        freestyle_100m: "100m Serbest",
                                        backstroke_50m: "50m Sırtüstü",
                                        breaststroke_50m: "50m Kurbağalama",
                                        butterfly_50m: "50m Kelebek",
                                        speed_100m: "100m Koşu",
                                        speed_200m: "200m Koşu",
                                        high_jump: "Yüksek Atlama",
                                        shot_put: "Gülle Atma",
                                        javelin: "Cirit Atma",
                                        endurance_1500m: "1500m Koşu",
                                        flexibility: "Esneklik",
                                        body_fat: "Vücut Yağ Oranı",
                                        muscle_mass: "Kas Kütlesi",
                                        balance: "Denge",
                                        coordination: "Koordinasyon"
                                      };
                                      
                                      const metricName = metricNames[metricKey] || metricKey;
                                      
                                      return (
                                        <Card key={metricKey} className="p-4">
                                          <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">{metricName}</span>
                                            {getTrendIcon(trend)}
                                          </div>
                                          <div className="text-lg font-bold">
                                            {formatMetricValue(value, metricName)}
                                          </div>
                                          <div className={`text-xs ${getTrendColor(trend)}`}>
                                            {trend === "improving" ? "Gelişiyor" : 
                                             trend === "declining" ? "Düşüyor" : "Stabil"}
                                          </div>
                                        </Card>
                                      );
                                    })}
                                </div>
                              ) : (
                                <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                                  <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                  <p className="text-sm text-muted-foreground">Henüz performans verisi yok</p>
                                </div>
                              )}

                              {childPerformanceData.length > 1 && (
                                <div className="mt-4">
                                  <h5 className="font-medium mb-3">Performans Geçmişi</h5>
                                  <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {childPerformanceData.slice(1, 6).map((entry, index) => (
                                      <div key={entry.id} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                                        <span>{new Date(entry.date).toLocaleDateString('tr-TR')}</span>
                                        <span className="text-muted-foreground">
                                          {Object.keys(entry.metrics).length} ölçüm
                                        </span>
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          onClick={() => {
                                            const metricsText = Object.entries(entry.metrics)
                                              .filter(([key, value]) => value)
                                              .map(([key, value]) => {
                                                const metricNames: { [key: string]: string } = {
                                                  height: "Boy", weight: "Kilo", bmi: "BMI",
                                                  speed_20m: "20m Sürat", speed_40m: "40m Sürat",
                                                  vertical_jump: "Dikey Sıçrama", long_jump: "Uzun Atlama"
                                                };
                                                const metricName = metricNames[key] || key;
                                                return `${metricName}: ${formatMetricValue(value, metricName)}`;
                                              })
                                              .join('\n');
                                            
                                            alert(`${child.studentName} ${child.studentSurname} - ${new Date(entry.date).toLocaleDateString('tr-TR')}\n\n${metricsText}\n\n${entry.notes ? `Not: ${entry.notes}` : ''}`);
                                          }}
                                        >
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {child !== children[children.length - 1] && (
                                <div className="border-b border-muted-foreground/20 mt-6"></div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Henüz kayıtlı çocuk bulunmuyor</p>
                      </div>
                    )}
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