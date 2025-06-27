import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Zap, 
  Edit, 
  Trash2, 
  Users, 
  Trophy, 
  Phone, 
  Mail,
  Target,
  ArrowLeft,
  Eye,
  EyeOff,
  UserPlus,
  Save
} from "lucide-react";
import { useRouter } from "next/router";
import Link from "next/link";
import Header from "@/components/Header";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const sportsBranches = [
  "Basketbol", "Futbol", "Voleybol", "Hentbol", "Yüzme", 
  "Tenis", "Jimnastik", "Atletizm", "Satranç", "Zihin Oyunları", "Hareket Eğitimi"
];

const permissionModules = [
  { key: "athletes", name: "Sporcu Yönetimi", description: "Sporcu kayıtları ve bilgileri" },
  { key: "payments", name: "Ödeme Yönetimi", description: "Aidat ve fatura işlemleri" },
  { key: "trainings", name: "Antrenman Yönetimi", description: "Antrenman programları ve takvim" },
  { key: "attendance", name: "Yoklama Sistemi", description: "Devam durumu takibi" },
  { key: "messages", name: "Mesajlaşma", description: "WhatsApp ve iletişim" },
  { key: "media", name: "Medya Yönetimi", description: "Fotoğraf ve video paylaşımı" },
  { key: "reports", name: "Raporlar", description: "Analitik ve raporlama" },
  { key: "settings", name: "Sistem Ayarları", description: "Genel sistem konfigürasyonu" }
];

export default function Coaches() {
  const router = useRouter();
  const [coaches, setCoaches] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoach, setEditingCoach] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    specialization: "",
    experience: "",
    sportsBranches: [] as string[],
    permissions: {} as any
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCoaches = () => {
    const savedCoaches = JSON.parse(localStorage.getItem('coaches') || '[]');
    setCoaches(savedCoaches);
  };

  const loadAdminUsers = () => {
    try {
      const stored = localStorage.getItem("adminUsers");
      if (stored) {
        const parsedUsers = JSON.parse(stored);
        setAdminUsers(parsedUsers);
      }
    } catch (error) {
      console.error("Error loading admin users:", error);
    }
  };

  const saveAdminUsers = (users: any[]) => {
    try {
      localStorage.setItem("adminUsers", JSON.stringify(users));
      setAdminUsers(users);
    } catch (error) {
      console.error("Error saving admin users:", error);
      setError("Kullanıcı bilgileri kaydedilirken hata oluştu");
    }
  };

  // Sync coaches with admin users on load
  const syncCoachesWithAdminUsers = () => {
    try {
      const adminUsers = JSON.parse(localStorage.getItem("adminUsers") || '[]');
      const coaches = JSON.parse(localStorage.getItem('coaches') || '[]');
      
      // Find admin users with coach role that don't have coach records
      const coachAdminUsers = adminUsers.filter((user: any) => user.role === "coach");
      const existingCoachAdminIds = coaches.map((coach: any) => coach.adminUserId);
      
      const newCoaches = coachAdminUsers
        .filter((user: any) => !existingCoachAdminIds.includes(user.id))
        .map((user: any) => ({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          adminUserId: user.id,
          name: user.name,
          email: user.email,
          phone: "",
          specialization: "",
          experience: "",
          sportsBranches: [],
          trainingCount: 0,
          athleteCount: 0,
          createdAt: new Date().toISOString()
        }));
      
      if (newCoaches.length > 0) {
        const updatedCoaches = [...coaches, ...newCoaches];
        localStorage.setItem('coaches', JSON.stringify(updatedCoaches));
        setCoaches(updatedCoaches);
      }
    } catch (error) {
      console.error("Error syncing coaches with admin users:", error);
    }
  };

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "admin" && userRole !== "super_admin") {
      router.push("/login");
      return;
    }
    loadCoaches();
    loadAdminUsers();
    syncCoachesWithAdminUsers();
  }, [router]);

  const getDefaultCoachPermissions = () => {
    return {
      athletes: { view: true, create: false, edit: true, delete: false },
      payments: { view: false, create: false, edit: false, delete: false },
      trainings: { view: true, create: true, edit: true, delete: false },
      attendance: { view: true, create: true, edit: true, delete: false },
      messages: { view: true, create: true, edit: false, delete: false },
      media: { view: true, create: true, edit: false, delete: false },
      reports: { view: true, create: false, edit: false, delete: false },
      settings: { view: false, create: false, edit: false, delete: false }
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.name || !formData.email || !formData.phone) {
      setError("Lütfen tüm zorunlu alanları doldurun");
      return;
    }

    if (!formData.password && !editingCoach) {
      setError("Şifre gereklidir");
      return;
    }

    if (formData.sportsBranches.length === 0) {
      setError("En az bir spor branşı seçin");
      return;
    }

    // Check if email already exists in admin users
    const existingAdminUser = adminUsers.find(user => user.email === formData.email);
    if (existingAdminUser && (!editingCoach || existingAdminUser.id !== editingCoach.adminUserId)) {
      setError("Bu email adresi zaten kullanılıyor");
      return;
    }

    // Check if email already exists in coaches
    const existingCoach = coaches.find(coach => coach.email === formData.email);
    if (existingCoach && (!editingCoach || existingCoach.id !== editingCoach.id)) {
      setError("Bu email adresi zaten kullanılıyor");
      return;
    }

    if (editingCoach) {
      // Update existing coach
      const updatedCoaches = coaches.map(coach => 
        coach.id === editingCoach.id ? {
          ...coach,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          specialization: formData.specialization,
          experience: formData.experience,
          sportsBranches: formData.sportsBranches
        } : coach
      );

      // Update admin user if exists
      if (editingCoach.adminUserId) {
        const updatedAdminUsers = adminUsers.map(user => 
          user.id === editingCoach.adminUserId ? {
            ...user,
            name: formData.name,
            email: formData.email,
            ...(formData.password && { password: formData.password }),
            permissions: formData.permissions
          } : user
        );
        saveAdminUsers(updatedAdminUsers);
      }

      localStorage.setItem('coaches', JSON.stringify(updatedCoaches));
      setCoaches(updatedCoaches);
      setSuccess("Antrenör başarıyla güncellendi");
    } else {
      // Create new coach
      const newCoachId = Date.now().toString();
      const newAdminUserId = adminUsers.length > 0 ? Math.max(...adminUsers.map(u => u.id)) + 1 : 1;

      // Create admin user account
      const newAdminUser = {
        id: newAdminUserId,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "coach",
        permissions: formData.permissions || getDefaultCoachPermissions(),
        isActive: true,
        lastLogin: new Date().toISOString()
      };

      // Create coach record
      const newCoach = {
        id: newCoachId,
        adminUserId: newAdminUserId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        specialization: formData.specialization,
        experience: formData.experience,
        sportsBranches: formData.sportsBranches,
        trainingCount: 0,
        athleteCount: 0,
        createdAt: new Date().toISOString()
      };

      // Save both records
      const updatedAdminUsers = [...adminUsers, newAdminUser];
      const updatedCoaches = [...coaches, newCoach];

      saveAdminUsers(updatedAdminUsers);
      localStorage.setItem('coaches', JSON.stringify(updatedCoaches));
      setCoaches(updatedCoaches);
      setSuccess("Antrenör başarıyla eklendi ve giriş hesabı oluşturuldu");
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (coach: any) => {
    setEditingCoach(coach);
    
    // Find associated admin user
    const adminUser = adminUsers.find(user => user.id === coach.adminUserId);
    
    setFormData({
      name: coach.name,
      email: coach.email,
      password: "",
      phone: coach.phone,
      specialization: coach.specialization,
      experience: coach.experience,
      sportsBranches: coach.sportsBranches || [],
      permissions: adminUser?.permissions || getDefaultCoachPermissions()
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (coachId: string) => {
    if (confirm("Bu antrenörü silmek istediğinizden emin misiniz? Giriş hesabı da silinecektir.")) {
      const coachToDelete = coaches.find(coach => coach.id === coachId);
      
      // Remove coach
      const updatedCoaches = coaches.filter(coach => coach.id !== coachId);
      localStorage.setItem('coaches', JSON.stringify(updatedCoaches));
      setCoaches(updatedCoaches);

      // Remove associated admin user
      if (coachToDelete?.adminUserId) {
        const updatedAdminUsers = adminUsers.filter(user => user.id !== coachToDelete.adminUserId);
        saveAdminUsers(updatedAdminUsers);
      }

      setSuccess("Antrenör ve giriş hesabı başarıyla silindi");
    }
  };

  const toggleCoachStatus = (coachId: string) => {
    const coach = coaches.find(c => c.id === coachId);
    if (coach?.adminUserId) {
      const updatedAdminUsers = adminUsers.map(user => 
        user.id === coach.adminUserId ? { ...user, isActive: !user.isActive } : user
      );
      saveAdminUsers(updatedAdminUsers);
      setSuccess(`Antrenör ${updatedAdminUsers.find(u => u.id === coach.adminUserId)?.isActive ? 'aktif' : 'pasif'} edildi`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      specialization: "",
      experience: "",
      sportsBranches: [],
      permissions: getDefaultCoachPermissions()
    });
    setEditingCoach(null);
    setError("");
  };

  const handleSportsBranchChange = (branch: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        sportsBranches: [...prev.sportsBranches, branch]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        sportsBranches: prev.sportsBranches.filter(b => b !== branch)
      }));
    }
  };

  const handlePermissionChange = (module: string, action: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [action]: value
        }
      }
    }));
  };

  const getInitials = (name: string) => {
    const names = name.split(' ');
    return names.length > 1 
      ? `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
      : `${names[0].charAt(0)}${names[0].charAt(1) || ''}`.toUpperCase();
  };

  const getCoachStatus = (coach: any) => {
    const adminUser = adminUsers.find(user => user.id === coach.adminUserId);
    return adminUser?.isActive ?? true;
  };

  return (
    <>
      <Head>
        <title>Antrenör Yönetimi - SportsCRM</title>
        <meta name="description" content="Antrenörleri yönetin" />
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
                <Zap className="w-6 h-6 text-primary" />
                <h1 className="text-3xl font-bold">Antrenör Yönetimi</h1>
              </div>
              <p className="text-muted-foreground">
                Antrenörleri ekleyin, düzenleyin ve yönetin. Antrenman grupları antrenman sayfasından manuel olarak atanacaktır.
              </p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Antrenör
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingCoach ? "Antrenör Düzenle" : "Yeni Antrenör Ekle"}
                  </DialogTitle>
                  <DialogDescription>
                    Antrenör bilgilerini girin. Antrenman grupları daha sonra antrenman sayfasından atanacaktır.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Basic Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Ad Soyad *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Antrenör adı ve soyadı"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="password">
                        {editingCoach ? "Şifre (Değiştirmek için doldurun)" : "Şifre *"}
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          placeholder="••••••••"
                          required={!editingCoach}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefon *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="0555 123 45 67"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="specialization">Uzmanlık Alanı</Label>
                      <Input
                        id="specialization"
                        placeholder="Örn: Basketbol Antrenörü"
                        value={formData.specialization}
                        onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="experience">Deneyim</Label>
                      <Input
                        id="experience"
                        placeholder="Örn: 5 yıl"
                        value={formData.experience}
                        onChange={(e) => setFormData({...formData, experience: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Spor Branşları *</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto border rounded p-2">
                      {sportsBranches.map((branch) => (
                        <div key={branch} className="flex items-center space-x-2">
                          <Checkbox
                            id={`branch-${branch}`}
                            checked={formData.sportsBranches.includes(branch)}
                            onCheckedChange={(checked) => 
                              handleSportsBranchChange(branch, checked as boolean)
                            }
                          />
                          <Label htmlFor={`branch-${branch}`} className="text-sm">
                            {branch}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Permissions */}
                  <div>
                    <h4 className="font-semibold mb-4">Yetki Ayarları</h4>
                    <div className="space-y-4">
                      {permissionModules.map((module) => (
                        <Card key={module.key}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h5 className="font-medium">{module.name}</h5>
                                <p className="text-sm text-muted-foreground">{module.description}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-4 gap-4">
                              {["view", "create", "edit", "delete"].map((action) => (
                                <div key={action} className="flex items-center space-x-2">
                                  <Switch
                                    checked={formData.permissions[module.key]?.[action] || false}
                                    onCheckedChange={(checked) => handlePermissionChange(module.key, action, checked)}
                                  />
                                  <Label className="text-sm capitalize">
                                    {action === "view" ? "Görüntüle" : 
                                     action === "create" ? "Oluştur" : 
                                     action === "edit" ? "Düzenle" : "Sil"}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    İptal
                  </Button>
                  <Button onClick={handleSubmit}>
                    <Save className="w-4 h-4 mr-2" />
                    {editingCoach ? "Güncelle" : "Antrenör Ekle"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Toplam Antrenör</p>
                    <p className="text-2xl font-bold">{coaches.length}</p>
                  </div>
                  <Zap className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Aktif Branş</p>
                    <p className="text-2xl font-bold">
                      {Array.from(new Set(coaches.flatMap(c => c.sportsBranches || []))).length}
                    </p>
                  </div>
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Toplam Antrenman</p>
                    <p className="text-2xl font-bold">
                      {coaches.reduce((total, coach) => total + (coach.trainingCount || 0), 0)}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Coaches Table */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Antrenörler</span>
                </CardTitle>
                <CardDescription>
                  Tüm antrenörleri görüntüleyin ve yönetin. Antrenman grupları antrenman sayfasından atanacaktır.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {coaches.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Antrenör</TableHead>
                        <TableHead>İletişim</TableHead>
                        <TableHead>Spor Branşları</TableHead>
                        <TableHead>Antrenman/Sporcu</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead>İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coaches.map((coach) => (
                        <TableRow key={coach.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarFallback>
                                  {getInitials(coach.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{coach.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {coach.specialization}
                                </p>
                                {coach.experience && (
                                  <p className="text-xs text-muted-foreground">
                                    {coach.experience} deneyim
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1 text-sm">
                                <Mail className="w-3 h-3" />
                                <span>{coach.email}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-sm">
                                <Phone className="w-3 h-3" />
                                <span>{coach.phone}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {coach.sportsBranches?.map((branch: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {branch}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm">
                                <span className="font-medium">{coach.trainingCount || 0}</span> antrenman
                              </div>
                              <div className="text-sm text-muted-foreground">
                                <span className="font-medium">{coach.athleteCount || 0}</span> sporcu
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={getCoachStatus(coach)}
                                onCheckedChange={() => toggleCoachStatus(coach.id)}
                              />
                              <span className="text-sm">
                                {getCoachStatus(coach) ? "Aktif" : "Pasif"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(coach)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(coach.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Henüz antrenör eklenmemiş</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => {
                        resetForm();
                        setIsDialogOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      İlk Antrenörü Ekle
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}