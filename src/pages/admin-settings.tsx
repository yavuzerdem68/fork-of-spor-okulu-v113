import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Settings, 
  Users, 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  ArrowLeft,
  UserPlus,
  Key,
  Eye,
  EyeOff
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { hashPassword, validatePasswordStrength, sanitizeInput } from "@/utils/security";
import { SessionManager } from "@/utils/security";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

// Default admin users data (only used for initial setup)
const defaultAdminUsers = [
  {
    id: 1,
    name: "Ahmet Yönetici",
    email: "admin@sportscr.com",
    role: "super_admin",
    permissions: {
      athletes: { view: true, create: true, edit: true, delete: true },
      payments: { view: true, create: true, edit: true, delete: true },
      trainings: { view: true, create: true, edit: true, delete: true },
      attendance: { view: true, create: true, edit: true, delete: true },
      messages: { view: true, create: true, edit: true, delete: true },
      media: { view: true, create: true, edit: true, delete: true },
      reports: { view: true, create: true, edit: true, delete: true },
      settings: { view: true, create: true, edit: true, delete: true }
    },
    isActive: true,
    lastLogin: "2024-12-20T10:30:00Z"
  },
  {
    id: 2,
    name: "Mehmet Asistan",
    email: "asistan@sportscr.com",
    role: "admin",
    permissions: {
      athletes: { view: true, create: true, edit: true, delete: false },
      payments: { view: true, create: false, edit: false, delete: false },
      trainings: { view: true, create: true, edit: true, delete: false },
      attendance: { view: true, create: true, edit: true, delete: false },
      messages: { view: true, create: true, edit: false, delete: false },
      media: { view: true, create: true, edit: true, delete: false },
      reports: { view: true, create: false, edit: false, delete: false },
      settings: { view: false, create: false, edit: false, delete: false }
    },
    isActive: true,
    lastLogin: "2024-12-19T15:45:00Z"
  },
  {
    id: 3,
    name: "Ayşe Antrenör",
    email: "antrenor@sportscr.com",
    role: "coach",
    permissions: {
      athletes: { view: true, create: false, edit: true, delete: false },
      payments: { view: false, create: false, edit: false, delete: false },
      trainings: { view: true, create: true, edit: true, delete: false },
      attendance: { view: true, create: true, edit: true, delete: false },
      messages: { view: true, create: true, edit: false, delete: false },
      media: { view: true, create: true, edit: false, delete: false },
      reports: { view: true, create: false, edit: false, delete: false },
      settings: { view: false, create: false, edit: false, delete: false }
    },
    isActive: true,
    lastLogin: "2024-12-20T08:15:00Z"
  }
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

const roleOptions = [
  { value: "super_admin", label: "Süper Yönetici", description: "Tüm yetkilere sahip" },
  { value: "admin", label: "Yönetici", description: "Sınırlı yönetim yetkileri" },
  { value: "coach", label: "Antrenör", description: "Antrenman ve sporcu yönetimi" },
  { value: "staff", label: "Personel", description: "Temel işlemler" }
];

export default function AdminSettings() {
  const router = useRouter();
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff",
    permissions: {} as any
  });
  const [passwordStrength, setPasswordStrength] = useState({ isValid: false, score: 0, feedback: [] });
  const [isPasswordChangeOpen, setIsPasswordChangeOpen] = useState(false);
  const [passwordChange, setPasswordChange] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newPasswordStrength, setNewPasswordStrength] = useState({ isValid: false, score: 0, feedback: [] });

  // Load admin users from localStorage
  const loadAdminUsers = () => {
    try {
      const stored = localStorage.getItem("adminUsers");
      if (stored) {
        const parsedUsers = JSON.parse(stored);
        setAdminUsers(parsedUsers);
      } else {
        // First time setup - use default users
        setAdminUsers(defaultAdminUsers);
        localStorage.setItem("adminUsers", JSON.stringify(defaultAdminUsers));
      }
    } catch (error) {
      console.error("Error loading admin users:", error);
      setAdminUsers(defaultAdminUsers);
    }
  };

  // Save admin users to localStorage
  const saveAdminUsers = (users: any[]) => {
    try {
      localStorage.setItem("adminUsers", JSON.stringify(users));
      setAdminUsers(users);
    } catch (error) {
      console.error("Error saving admin users:", error);
      setError("Kullanıcı bilgileri kaydedilirken hata oluştu");
    }
  };

  useEffect(() => {
    // Check if user is logged in and has admin role
    const role = localStorage.getItem("userRole");
    if (!role || (role !== "admin" && role !== "super_admin")) {
      router.push("/login");
      return;
    }

    // Load admin users
    loadAdminUsers();
  }, [router]);

  const getDefaultPermissions = (role: string) => {
    // Initialize with proper structure - ensure all modules are defined
    const defaultPerms: any = {};
    
    try {
      // Validate role parameter first
      if (!role || typeof role !== 'string') {
        console.warn('Invalid role provided to getDefaultPermissions:', role);
        role = 'staff'; // Default to staff role
      }

      // Initialize all permission modules with default false values
      if (Array.isArray(permissionModules)) {
        permissionModules.forEach(module => {
          if (module && module.key && typeof module.key === 'string') {
            defaultPerms[module.key] = { 
              view: false, 
              create: false, 
              edit: false, 
              delete: false 
            };
          }
        });
      }

      // Ensure all expected modules exist
      const expectedModules = ["athletes", "payments", "trainings", "attendance", "messages", "media", "reports", "settings"];
      expectedModules.forEach(moduleKey => {
        if (!defaultPerms[moduleKey]) {
          defaultPerms[moduleKey] = { view: false, create: false, edit: false, delete: false };
        }
      });

      // Set permissions based on role
      switch (role) {
        case "super_admin":
          Object.keys(defaultPerms).forEach(key => {
            if (defaultPerms[key] && typeof defaultPerms[key] === 'object') {
              defaultPerms[key] = { view: true, create: true, edit: true, delete: true };
            }
          });
          break;
        case "admin":
          Object.keys(defaultPerms).forEach(key => {
            if (defaultPerms[key] && typeof defaultPerms[key] === 'object' && key !== "settings") {
              defaultPerms[key] = { view: true, create: true, edit: true, delete: false };
            }
          });
          break;
        case "coach":
          ["athletes", "trainings", "attendance", "messages", "media", "reports"].forEach(key => {
            if (defaultPerms[key] && typeof defaultPerms[key] === 'object') {
              defaultPerms[key] = { view: true, create: true, edit: true, delete: false };
            }
          });
          break;
        case "staff":
          ["athletes", "attendance"].forEach(key => {
            if (defaultPerms[key] && typeof defaultPerms[key] === 'object') {
              defaultPerms[key] = { view: true, create: false, edit: false, delete: false };
            }
          });
          break;
        default:
          console.warn('Unknown role provided to getDefaultPermissions:', role);
          // Keep all permissions as false for unknown roles
          break;
      }
    } catch (error) {
      console.error("Error in getDefaultPermissions:", error);
      // Return a safe default structure
      const safeDefault: any = {};
      ["athletes", "payments", "trainings", "attendance", "messages", "media", "reports", "settings"].forEach(key => {
        safeDefault[key] = { view: false, create: false, edit: false, delete: false };
      });
      return safeDefault;
    }

    return defaultPerms;
  };

  const handleRoleChange = (role: string, isNewUser = false) => {
    const permissions = getDefaultPermissions(role);
    
    if (isNewUser) {
      setNewUser(prev => ({ ...prev, role, permissions }));
    } else if (selectedUser) {
      setSelectedUser({ ...selectedUser, role, permissions });
    }
  };

  const handlePermissionChange = (module: string, action: string, value: boolean, isNewUser = false) => {
    try {
      // Validate inputs
      if (!module || typeof module !== 'string' || !action || typeof action !== 'string') {
        console.warn('Invalid parameters for handlePermissionChange:', { module, action, value, isNewUser });
        return;
      }

      if (isNewUser) {
        setNewUser(prev => {
          try {
            // Ensure permissions object exists and is valid
            const currentPermissions = (prev && prev.permissions && typeof prev.permissions === 'object') ? prev.permissions : {};
            const modulePermissions = (currentPermissions[module] && typeof currentPermissions[module] === 'object') 
              ? currentPermissions[module] 
              : { view: false, create: false, edit: false, delete: false };
            
            return {
              ...prev,
              permissions: {
                ...currentPermissions,
                [module]: {
                  ...modulePermissions,
                  [action]: Boolean(value)
                }
              }
            };
          } catch (error) {
            console.error('Error updating new user permissions:', error);
            return prev; // Return unchanged state on error
          }
        });
      } else if (selectedUser && typeof selectedUser === 'object') {
        try {
          // Ensure permissions object exists and is valid
          const currentPermissions = (selectedUser.permissions && typeof selectedUser.permissions === 'object') ? selectedUser.permissions : {};
          const modulePermissions = (currentPermissions[module] && typeof currentPermissions[module] === 'object') 
            ? currentPermissions[module] 
            : { view: false, create: false, edit: false, delete: false };
          
          setSelectedUser({
            ...selectedUser,
            permissions: {
              ...currentPermissions,
              [module]: {
                ...modulePermissions,
                [action]: Boolean(value)
              }
            }
          });
        } catch (error) {
          console.error('Error updating selected user permissions:', error);
        }
      }
    } catch (error) {
      console.error('Error in handlePermissionChange:', error);
    }
  };

  const handleSaveUser = () => {
    if (selectedUser) {
      const updatedUsers = adminUsers.map(user => 
        user.id === selectedUser.id ? selectedUser : user
      );
      saveAdminUsers(updatedUsers);
      setSuccess("Kullanıcı başarıyla güncellendi");
      setIsEditDialogOpen(false);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleAddUser = async () => {
    // Sanitize inputs
    const sanitizedName = sanitizeInput(newUser.name.trim(), 100);
    const sanitizedEmail = sanitizeInput(newUser.email.trim(), 100);

    if (!sanitizedName || !sanitizedEmail || !newUser.password) {
      setError("Lütfen tüm alanları doldurun");
      setTimeout(() => setError(""), 3000);
      return;
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(newUser.password);
    if (!passwordValidation.isValid) {
      setError(`Şifre güvenlik gereksinimlerini karşılamıyor: ${passwordValidation.feedback.join(', ')}`);
      setTimeout(() => setError(""), 3000);
      return;
    }

    // Check if email already exists
    if (adminUsers.some(user => user.email === sanitizedEmail)) {
      setError("Bu email adresi zaten kullanılıyor");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      // Hash password
      const hashedPassword = await hashPassword(newUser.password);

      const newId = adminUsers.length > 0 ? Math.max(...adminUsers.map(u => u.id)) + 1 : 1;
      const userToAdd = {
        id: newId,
        name: sanitizedName,
        email: sanitizedEmail,
        password: hashedPassword,
        role: newUser.role,
        permissions: newUser.permissions || getDefaultPermissions(newUser.role),
        isActive: true,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!).id : 'system'
      };

      const updatedUsers = [...adminUsers, userToAdd];
      saveAdminUsers(updatedUsers);

      // If role is coach, also create a coach record
      if (newUser.role === "coach") {
        const coaches = JSON.parse(localStorage.getItem('coaches') || '[]');
        const newCoach = {
          id: Date.now().toString(),
          adminUserId: newId,
          name: sanitizedName,
          email: sanitizedEmail,
          phone: "", // Will need to be filled later in coaches module
          specialization: "",
          experience: "",
          sportsBranches: [],
          trainingCount: 0,
          athleteCount: 0,
          createdAt: new Date().toISOString()
        };
        coaches.push(newCoach);
        localStorage.setItem('coaches', JSON.stringify(coaches));
      }

      setSuccess("Yeni kullanıcı başarıyla eklendi");
      setIsAddDialogOpen(false);
      setNewUser({ name: "", email: "", password: "", role: "staff", permissions: {} });
      setPasswordStrength({ isValid: false, score: 0, feedback: [] });
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error('Error creating user:', error);
      setError("Kullanıcı oluşturulurken hata oluştu");
      setTimeout(() => setError(""), 3000);
    }
  };

  // Handle password change with validation
  const handlePasswordChange = (password: string) => {
    setNewUser(prev => ({ ...prev, password }));
    const validation = validatePasswordStrength(password);
    setPasswordStrength(validation);
  };

  const handleDeleteUser = (userId: number) => {
    const userToDelete = adminUsers.find(user => user.id === userId);
    
    // If deleting a coach, also remove from coaches module
    if (userToDelete?.role === "coach") {
      const coaches = JSON.parse(localStorage.getItem('coaches') || '[]');
      const updatedCoaches = coaches.filter((coach: any) => coach.adminUserId !== userId);
      localStorage.setItem('coaches', JSON.stringify(updatedCoaches));
    }
    
    const updatedUsers = adminUsers.filter(user => user.id !== userId);
    saveAdminUsers(updatedUsers);
    setSuccess("Kullanıcı başarıyla silindi");
    setTimeout(() => setSuccess(""), 3000);
  };

  const toggleUserStatus = (userId: number) => {
    const updatedUsers = adminUsers.map(user => 
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    );
    saveAdminUsers(updatedUsers);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super_admin": return "bg-red-100 text-red-800";
      case "admin": return "bg-blue-100 text-blue-800";
      case "coach": return "bg-green-100 text-green-800";
      case "staff": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Handle new password change validation
  const handleNewPasswordChange = (password: string) => {
    setPasswordChange(prev => ({ ...prev, newPassword: password }));
    const validation = validatePasswordStrength(password);
    setNewPasswordStrength(validation);
  };

  // Handle password change for current user
  const handleChangePassword = async () => {
    if (!passwordChange.currentPassword || !passwordChange.newPassword || !passwordChange.confirmPassword) {
      setError("Lütfen tüm şifre alanlarını doldurun");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      setError("Yeni şifreler eşleşmiyor");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (!newPasswordStrength.isValid) {
      setError(`Yeni şifre güvenlik gereksinimlerini karşılamıyor: ${newPasswordStrength.feedback.join(', ')}`);
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      // Get current user
      const currentUserData = localStorage.getItem('currentUser');
      if (!currentUserData) {
        setError("Kullanıcı bilgisi bulunamadı");
        setTimeout(() => setError(""), 3000);
        return;
      }

      const currentUser = JSON.parse(currentUserData);
      
      // For cloud auth, we need to update the users storage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: any) => u.email === currentUser.email);
      
      if (userIndex === -1) {
        setError("Kullanıcı bulunamadı");
        setTimeout(() => setError(""), 3000);
        return;
      }

      // Verify current password (in a real app, you'd hash and compare)
      if (users[userIndex].password !== passwordChange.currentPassword) {
        setError("Mevcut şifre yanlış");
        setTimeout(() => setError(""), 3000);
        return;
      }

      // Update password
      users[userIndex].password = passwordChange.newPassword;
      localStorage.setItem('users', JSON.stringify(users));

      // Also update admin users if this user is an admin
      const adminUserIndex = adminUsers.findIndex(u => u.email === currentUser.email);
      if (adminUserIndex !== -1) {
        const hashedPassword = await hashPassword(passwordChange.newPassword);
        const updatedAdminUsers = [...adminUsers];
        updatedAdminUsers[adminUserIndex].password = hashedPassword;
        saveAdminUsers(updatedAdminUsers);
      }

      setSuccess("Şifre başarıyla değiştirildi");
      setIsPasswordChangeOpen(false);
      setPasswordChange({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setNewPasswordStrength({ isValid: false, score: 0, feedback: [] });
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error('Password change error:', error);
      setError("Şifre değiştirirken hata oluştu");
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <>
      <Head>
        <title>Yönetici Ayarları - SportsCRM</title>
        <meta name="description" content="Yönetici kullanıcıları ve yetkileri yönetin" />
      </Head>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard'a Dön
              </Link>
              <h1 className="text-3xl font-bold text-primary flex items-center space-x-2">
                <Settings className="w-8 h-8" />
                <span>Yönetici Ayarları</span>
              </h1>
              <p className="text-muted-foreground">Sistem kullanıcılarını ve yetkilerini yönetin</p>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Yeni Kullanıcı
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Yeni Kullanıcı Ekle</DialogTitle>
                  <DialogDescription>
                    Sisteme yeni bir yönetici kullanıcı ekleyin ve yetkilerini belirleyin
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="new-name">Ad Soyad</Label>
                      <Input
                        id="new-name"
                        value={newUser.name}
                        onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Kullanıcı adı"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-email">Email</Label>
                      <Input
                        id="new-email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="new-password">Şifre</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showPassword ? "text" : "password"}
                          value={newUser.password}
                          onChange={(e) => handlePasswordChange(e.target.value)}
                          placeholder="••••••••"
                          className={passwordStrength.score < 4 && newUser.password ? "border-red-500" : ""}
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
                      
                      {/* Password strength indicator */}
                      {newUser.password && (
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  passwordStrength.score <= 2 ? 'bg-red-500' :
                                  passwordStrength.score <= 4 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                              />
                            </div>
                            <span className={`text-xs font-medium ${
                              passwordStrength.score <= 2 ? 'text-red-600' :
                              passwordStrength.score <= 4 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {passwordStrength.score <= 2 ? 'Zayıf' :
                               passwordStrength.score <= 4 ? 'Orta' : 'Güçlü'}
                            </span>
                          </div>
                          
                          {passwordStrength.feedback.length > 0 && (
                            <div className="text-xs text-red-600 space-y-1">
                              {passwordStrength.feedback.map((feedback, index) => (
                                <div key={index}>• {feedback}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="new-role">Rol</Label>
                      <Select value={newUser.role} onValueChange={(value) => handleRoleChange(value, true)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              <div>
                                <div className="font-medium">{role.label}</div>
                                <div className="text-xs text-muted-foreground">{role.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                                    checked={(() => {
                                      try {
                                        return (newUser.permissions && 
                                               newUser.permissions[module.key] && 
                                               typeof newUser.permissions[module.key] === 'object' &&
                                               newUser.permissions[module.key][action]) || false;
                                      } catch (error) {
                                        console.error('Error accessing newUser permissions:', error);
                                        return false;
                                      }
                                    })()}
                                    onCheckedChange={(checked) => handlePermissionChange(module.key, action, checked, true)}
                                  />
                                  <Label className="text-sm capitalize">{action === "view" ? "Görüntüle" : action === "create" ? "Oluştur" : action === "edit" ? "Düzenle" : "Sil"}</Label>
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
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    İptal
                  </Button>
                  <Button onClick={handleAddUser}>
                    <Save className="w-4 h-4 mr-2" />
                    Kullanıcı Ekle
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {success && (
            <Alert className="mb-6">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mb-6" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <Tabs defaultValue="users" className="space-y-6">
              <TabsList>
                <TabsTrigger value="users" className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Kullanıcılar</span>
                </TabsTrigger>
                <TabsTrigger value="roles" className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Roller</span>
                </TabsTrigger>
                <TabsTrigger value="account" className="flex items-center space-x-2">
                  <Key className="w-4 h-4" />
                  <span>Hesap Ayarları</span>
                </TabsTrigger>
              </TabsList>

              {/* Users Tab */}
              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <CardTitle>Sistem Kullanıcıları</CardTitle>
                    <CardDescription>Tüm yönetici kullanıcıları ve yetkileri</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Kullanıcı</TableHead>
                          <TableHead>Rol</TableHead>
                          <TableHead>Son Giriş</TableHead>
                          <TableHead>Durum</TableHead>
                          <TableHead>İşlemler</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adminUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getRoleBadgeColor(user.role)}>
                                {roleOptions.find(r => r.value === user.role)?.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(user.lastLogin).toLocaleDateString('tr-TR')}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={user.isActive}
                                  onCheckedChange={() => toggleUserStatus(user.id)}
                                />
                                <span className="text-sm">
                                  {user.isActive ? "Aktif" : "Pasif"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Dialog open={isEditDialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                                  setIsEditDialogOpen(open);
                                  if (!open) setSelectedUser(null);
                                }}>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedUser(user);
                                        setIsEditDialogOpen(true);
                                      }}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle>Kullanıcı Düzenle</DialogTitle>
                                      <DialogDescription>
                                        {selectedUser?.name} kullanıcısının bilgilerini ve yetkilerini düzenleyin
                                      </DialogDescription>
                                    </DialogHeader>

                                    {selectedUser && (
                                      <div className="space-y-6">
                                        {/* Basic Info */}
                                        <div className="grid md:grid-cols-2 gap-4">
                                          <div>
                                            <Label htmlFor="edit-name">Ad Soyad</Label>
                                            <Input
                                              id="edit-name"
                                              value={selectedUser.name}
                                              onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                                            />
                                          </div>
                                          <div>
                                            <Label htmlFor="edit-email">Email</Label>
                                            <Input
                                              id="edit-email"
                                              type="email"
                                              value={selectedUser.email}
                                              onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                                            />
                                          </div>
                                        </div>

                                        <div>
                                          <Label htmlFor="edit-role">Rol</Label>
                                          <Select value={selectedUser.role} onValueChange={(value) => handleRoleChange(value)}>
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {roleOptions.map((role) => (
                                                <SelectItem key={role.value} value={role.value}>
                                                  <div>
                                                    <div className="font-medium">{role.label}</div>
                                                    <div className="text-xs text-muted-foreground">{role.description}</div>
                                                  </div>
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
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
                                                          checked={(() => {
                                                            try {
                                                              return (selectedUser && 
                                                                     selectedUser.permissions && 
                                                                     selectedUser.permissions[module.key] && 
                                                                     typeof selectedUser.permissions[module.key] === 'object' &&
                                                                     selectedUser.permissions[module.key][action]) || false;
                                                            } catch (error) {
                                                              console.error('Error accessing selectedUser permissions:', error);
                                                              return false;
                                                            }
                                                          })()}
                                                          onCheckedChange={(checked) => handlePermissionChange(module.key, action, checked)}
                                                        />
                                                        <Label className="text-sm capitalize">{action === "view" ? "Görüntüle" : action === "create" ? "Oluştur" : action === "edit" ? "Düzenle" : "Sil"}</Label>
                                                      </div>
                                                    ))}
                                                  </div>
                                                </CardContent>
                                              </Card>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                        İptal
                                      </Button>
                                      <Button onClick={handleSaveUser}>
                                        <Save className="w-4 h-4 mr-2" />
                                        Kaydet
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>

                                {user.role !== "super_admin" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Roles Tab */}
              <TabsContent value="roles">
                <div className="grid md:grid-cols-2 gap-6">
                  {roleOptions.map((role) => {
                    try {
                      return (
                        <Card key={role.value}>
                          <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                              <Badge className={getRoleBadgeColor(role.value)}>
                                {role.label}
                              </Badge>
                            </CardTitle>
                            <CardDescription>{role.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <h4 className="font-medium text-sm">Varsayılan Yetkiler:</h4>
                              <div className="space-y-2">
                                {(() => {
                                  try {
                                    const defaultPerms = getDefaultPermissions(role.value);
                                    
                                    if (!defaultPerms || typeof defaultPerms !== 'object') {
                                      return <p className="text-xs text-muted-foreground">Yetki bilgisi yüklenemedi</p>;
                                    }

                                    const moduleElements = permissionModules
                                      .map((module) => {
                                        try {
                                          // Safely access module permissions
                                          const modulePerms = defaultPerms[module.key];
                                          
                                          if (!modulePerms || typeof modulePerms !== 'object') {
                                            return null;
                                          }

                                          // Create safe permission object
                                          const safeModulePerms = {
                                            view: Boolean(modulePerms.view),
                                            create: Boolean(modulePerms.create),
                                            edit: Boolean(modulePerms.edit),
                                            delete: Boolean(modulePerms.delete)
                                          };
                                          
                                          const hasAnyPerm = Object.values(safeModulePerms).some(Boolean);
                                          
                                          if (!hasAnyPerm) return null;
                                          
                                          return (
                                            <div key={module.key} className="flex items-center justify-between text-sm">
                                              <span>{module.name}</span>
                                              <div className="flex space-x-1">
                                                {safeModulePerms.view && <Badge variant="outline" className="text-xs">Görüntüle</Badge>}
                                                {safeModulePerms.create && <Badge variant="outline" className="text-xs">Oluştur</Badge>}
                                                {safeModulePerms.edit && <Badge variant="outline" className="text-xs">Düzenle</Badge>}
                                                {safeModulePerms.delete && <Badge variant="outline" className="text-xs">Sil</Badge>}
                                              </div>
                                            </div>
                                          );
                                        } catch (moduleError) {
                                          console.error(`Error rendering module ${module.key}:`, moduleError);
                                          return null;
                                        }
                                      })
                                      .filter(Boolean); // Remove null elements

                                    return moduleElements.length > 0 ? moduleElements : (
                                      <p className="text-xs text-muted-foreground">Bu rol için yetki tanımlanmamış</p>
                                    );
                                  } catch (permError) {
                                    console.error(`Error getting permissions for role ${role.value}:`, permError);
                                    return <p className="text-xs text-red-500">Yetki bilgisi yüklenirken hata oluştu</p>;
                                  }
                                })()}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    } catch (roleError) {
                      console.error(`Error rendering role ${role.value}:`, roleError);
                      return (
                        <Card key={role.value}>
                          <CardContent className="p-4">
                            <p className="text-sm text-red-500">Bu rol yüklenirken hata oluştu</p>
                          </CardContent>
                        </Card>
                      );
                    }
                  })}
                </div>
              </TabsContent>

              {/* Account Settings Tab */}
              <TabsContent value="account">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Current User Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Hesap Bilgileri</CardTitle>
                      <CardDescription>Mevcut kullanıcı bilgileriniz</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const currentUserData = localStorage.getItem('currentUser');
                        const currentUser = currentUserData ? JSON.parse(currentUserData) : null;
                        
                        if (!currentUser) {
                          return <p className="text-muted-foreground">Kullanıcı bilgisi bulunamadı</p>;
                        }

                        return (
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium">Ad Soyad</Label>
                              <p className="text-sm text-muted-foreground">{currentUser.name || 'Belirtilmemiş'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Email</Label>
                              <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Rol</Label>
                              <Badge className={getRoleBadgeColor(currentUser.role)}>
                                {roleOptions.find(r => r.value === currentUser.role)?.label || currentUser.role}
                              </Badge>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Son Giriş</Label>
                              <p className="text-sm text-muted-foreground">
                                {currentUser.last_login ? new Date(currentUser.last_login).toLocaleString('tr-TR') : 'Bilinmiyor'}
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>

                  {/* Password Change */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Şifre Değiştir</CardTitle>
                      <CardDescription>Hesap güvenliğiniz için şifrenizi güncelleyin</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Dialog open={isPasswordChangeOpen} onOpenChange={setIsPasswordChangeOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full">
                            <Key className="w-4 h-4 mr-2" />
                            Şifre Değiştir
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Şifre Değiştir</DialogTitle>
                            <DialogDescription>
                              Güvenliğiniz için mevcut şifrenizi doğrulayın ve yeni şifrenizi belirleyin
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="current-password">Mevcut Şifre</Label>
                              <div className="relative">
                                <Input
                                  id="current-password"
                                  type={showCurrentPassword ? "text" : "password"}
                                  value={passwordChange.currentPassword}
                                  onChange={(e) => setPasswordChange(prev => ({ ...prev, currentPassword: e.target.value }))}
                                  placeholder="••••••••"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="new-password">Yeni Şifre</Label>
                              <div className="relative">
                                <Input
                                  id="new-password"
                                  type={showNewPassword ? "text" : "password"}
                                  value={passwordChange.newPassword}
                                  onChange={(e) => handleNewPasswordChange(e.target.value)}
                                  placeholder="••••••••"
                                  className={newPasswordStrength.score < 4 && passwordChange.newPassword ? "border-red-500" : ""}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                              
                              {/* Password strength indicator */}
                              {passwordChange.newPassword && (
                                <div className="mt-2 space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                      <div 
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                          newPasswordStrength.score <= 2 ? 'bg-red-500' :
                                          newPasswordStrength.score <= 4 ? 'bg-yellow-500' : 'bg-green-500'
                                        }`}
                                        style={{ width: `${(newPasswordStrength.score / 6) * 100}%` }}
                                      />
                                    </div>
                                    <span className={`text-xs font-medium ${
                                      newPasswordStrength.score <= 2 ? 'text-red-600' :
                                      newPasswordStrength.score <= 4 ? 'text-yellow-600' : 'text-green-600'
                                    }`}>
                                      {newPasswordStrength.score <= 2 ? 'Zayıf' :
                                       newPasswordStrength.score <= 4 ? 'Orta' : 'Güçlü'}
                                    </span>
                                  </div>
                                  
                                  {newPasswordStrength.feedback.length > 0 && (
                                    <div className="text-xs text-red-600 space-y-1">
                                      {newPasswordStrength.feedback.map((feedback, index) => (
                                        <div key={index}>• {feedback}</div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            <div>
                              <Label htmlFor="confirm-password">Yeni Şifre Tekrar</Label>
                              <Input
                                id="confirm-password"
                                type={showNewPassword ? "text" : "password"}
                                value={passwordChange.confirmPassword}
                                onChange={(e) => setPasswordChange(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                placeholder="••••••••"
                                className={passwordChange.newPassword && passwordChange.confirmPassword && passwordChange.newPassword !== passwordChange.confirmPassword ? "border-red-500" : ""}
                              />
                              {passwordChange.newPassword && passwordChange.confirmPassword && passwordChange.newPassword !== passwordChange.confirmPassword && (
                                <p className="text-xs text-red-600 mt-1">Şifreler eşleşmiyor</p>
                              )}
                            </div>
                          </div>

                          <DialogFooter>
                            <Button variant="outline" onClick={() => {
                              setIsPasswordChangeOpen(false);
                              setPasswordChange({ currentPassword: "", newPassword: "", confirmPassword: "" });
                              setNewPasswordStrength({ isValid: false, score: 0, feedback: [] });
                            }}>
                              İptal
                            </Button>
                            <Button onClick={handleChangePassword}>
                              <Save className="w-4 h-4 mr-2" />
                              Şifre Değiştir
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <div className="mt-4 text-sm text-muted-foreground">
                        <h4 className="font-medium mb-2">Güvenlik İpuçları:</h4>
                        <ul className="space-y-1 text-xs">
                          <li>• En az 8 karakter kullanın</li>
                          <li>• Büyük ve küçük harf karışımı</li>
                          <li>• Sayı ve özel karakter ekleyin</li>
                          <li>• Kişisel bilgilerinizi kullanmayın</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </>
  );
}