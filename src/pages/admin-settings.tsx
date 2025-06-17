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
    if (role !== "admin") {
      router.push("/login");
      return;
    }

    // Load admin users
    loadAdminUsers();
  }, [router]);

  const getDefaultPermissions = (role: string) => {
    const defaultPerms = {
      athletes: { view: false, create: false, edit: false, delete: false },
      payments: { view: false, create: false, edit: false, delete: false },
      trainings: { view: false, create: false, edit: false, delete: false },
      attendance: { view: false, create: false, edit: false, delete: false },
      messages: { view: false, create: false, edit: false, delete: false },
      media: { view: false, create: false, edit: false, delete: false },
      reports: { view: false, create: false, edit: false, delete: false },
      settings: { view: false, create: false, edit: false, delete: false }
    };

    switch (role) {
      case "super_admin":
        Object.keys(defaultPerms).forEach(key => {
          defaultPerms[key as keyof typeof defaultPerms] = { view: true, create: true, edit: true, delete: true };
        });
        break;
      case "admin":
        Object.keys(defaultPerms).forEach(key => {
          if (key !== "settings") {
            defaultPerms[key as keyof typeof defaultPerms] = { view: true, create: true, edit: true, delete: false };
          }
        });
        break;
      case "coach":
        ["athletes", "trainings", "attendance", "messages", "media", "reports"].forEach(key => {
          defaultPerms[key as keyof typeof defaultPerms] = { view: true, create: true, edit: true, delete: false };
        });
        break;
      case "staff":
        ["athletes", "attendance"].forEach(key => {
          defaultPerms[key as keyof typeof defaultPerms] = { view: true, create: false, edit: false, delete: false };
        });
        break;
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
    if (isNewUser) {
      setNewUser(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [module]: {
            ...prev.permissions[module],
            [action]: value
          }
        }
      }));
    } else if (selectedUser) {
      setSelectedUser({
        ...selectedUser,
        permissions: {
          ...selectedUser.permissions,
          [module]: {
            ...selectedUser.permissions[module],
            [action]: value
          }
        }
      });
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

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      setError("Lütfen tüm alanları doldurun");
      setTimeout(() => setError(""), 3000);
      return;
    }

    // Check if email already exists
    if (adminUsers.some(user => user.email === newUser.email)) {
      setError("Bu email adresi zaten kullanılıyor");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const newId = adminUsers.length > 0 ? Math.max(...adminUsers.map(u => u.id)) + 1 : 1;
    const userToAdd = {
      ...newUser,
      id: newId,
      isActive: true,
      lastLogin: new Date().toISOString(),
      permissions: newUser.permissions || getDefaultPermissions(newUser.role)
    };

    const updatedUsers = [...adminUsers, userToAdd];
    saveAdminUsers(updatedUsers);
    setSuccess("Yeni kullanıcı başarıyla eklendi");
    setIsAddDialogOpen(false);
    setNewUser({ name: "", email: "", password: "", role: "staff", permissions: {} });
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleDeleteUser = (userId: number) => {
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
=======

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super_admin": return "bg-red-100 text-red-800";
      case "admin": return "bg-blue-100 text-blue-800";
      case "coach": return "bg-green-100 text-green-800";
      case "staff": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
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
                          onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="••••••••"
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
                                    checked={newUser.permissions[module.key]?.[action] || false}
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
                                      onClick={() => setSelectedUser(user)}
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
                                                          checked={selectedUser.permissions[module.key]?.[action] || false}
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
                  {roleOptions.map((role) => (
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
                            {permissionModules.map((module) => {
                              const defaultPerms = getDefaultPermissions(role.value);
                              const modulePerms = defaultPerms[module.key as keyof typeof defaultPerms];
                              const hasAnyPerm = Object.values(modulePerms).some(Boolean);
                              
                              if (!hasAnyPerm) return null;
                              
                              return (
                                <div key={module.key} className="flex items-center justify-between text-sm">
                                  <span>{module.name}</span>
                                  <div className="flex space-x-1">
                                    {modulePerms.view && <Badge variant="outline" className="text-xs">Görüntüle</Badge>}
                                    {modulePerms.create && <Badge variant="outline" className="text-xs">Oluştur</Badge>}
                                    {modulePerms.edit && <Badge variant="outline" className="text-xs">Düzenle</Badge>}
                                    {modulePerms.delete && <Badge variant="outline" className="text-xs">Sil</Badge>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </>
  );
}