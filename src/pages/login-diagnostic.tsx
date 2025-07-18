import React, { useState, useEffect } from "react";
import Head from "next/head";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, User, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { hashPassword } from "@/utils/security";

export default function LoginDiagnostic() {
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  
  const [newUser, setNewUser] = useState({
    email: "yavuz@g7spor.org",
    password: "",
    name: "Yavuz",
    surname: "Yönetici"
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    try {
      const adminUsersData = JSON.parse(localStorage.getItem('adminUsers') || '[]');
      const usersData = JSON.parse(localStorage.getItem('users') || '[]');
      
      setAdminUsers(adminUsersData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Kullanıcı verileri yüklenirken hata oluştu');
    }
  };

  const createAdminUser = async () => {
    if (!newUser.email || !newUser.password) {
      setError('Email ve şifre gerekli');
      return;
    }

    try {
      // Check if user already exists
      const existingUser = adminUsers.find(u => u.email === newUser.email);
      if (existingUser) {
        setError('Bu email adresi zaten kullanılıyor');
        return;
      }

      // Hash password
      const hashedPassword = await hashPassword(newUser.password);

      // Create new admin user
      const newAdminUser = {
        id: Date.now(),
        name: newUser.name,
        surname: newUser.surname,
        email: newUser.email,
        password: hashedPassword,
        role: 'super_admin',
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
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      const updatedAdminUsers = [...adminUsers, newAdminUser];
      localStorage.setItem('adminUsers', JSON.stringify(updatedAdminUsers));
      
      setAdminUsers(updatedAdminUsers);
      setSuccess(`${newUser.email} başarıyla oluşturuldu!`);
      setNewUser({ email: "", password: "", name: "", surname: "" });
      
      setTimeout(() => setSuccess(""), 5000);
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Kullanıcı oluşturulurken hata oluştu');
    }
  };

  const deleteUser = (userId: number) => {
    const updatedAdminUsers = adminUsers.filter(u => u.id !== userId);
    localStorage.setItem('adminUsers', JSON.stringify(updatedAdminUsers));
    setAdminUsers(updatedAdminUsers);
    setSuccess('Kullanıcı silindi');
    setTimeout(() => setSuccess(""), 3000);
  };

  const resetPassword = async (userId: number, newPassword: string) => {
    if (!newPassword) {
      setError('Yeni şifre gerekli');
      return;
    }

    try {
      const hashedPassword = await hashPassword(newPassword);
      const updatedAdminUsers = adminUsers.map(u => 
        u.id === userId ? { ...u, password: hashedPassword } : u
      );
      localStorage.setItem('adminUsers', JSON.stringify(updatedAdminUsers));
      setAdminUsers(updatedAdminUsers);
      setSuccess('Şifre güncellendi');
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error('Error resetting password:', error);
      setError('Şifre güncellenirken hata oluştu');
    }
  };

  const clearAllData = () => {
    if (confirm('TÜM kullanıcı verilerini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
      localStorage.removeItem('adminUsers');
      localStorage.removeItem('users');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
      
      setAdminUsers([]);
      setUsers([]);
      setSuccess('Tüm kullanıcı verileri temizlendi');
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  return (
    <>
      <Head>
        <title>Giriş Tanılama - SportsCRM</title>
        <meta name="description" content="Giriş sorunlarını tanıla ve düzelt" />
      </Head>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Giriş Sayfasına Dön
              </Link>
              <h1 className="text-3xl font-bold text-primary flex items-center space-x-2">
                <User className="w-8 h-8" />
                <span>Giriş Tanılama</span>
              </h1>
              <p className="text-muted-foreground">Kullanıcı hesaplarını kontrol edin ve yönetin</p>
            </div>
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

          <div className="grid gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Hızlı İşlemler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button onClick={() => setShowPasswords(!showPasswords)}>
                    {showPasswords ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    {showPasswords ? 'Şifreleri Gizle' : 'Şifreleri Göster'}
                  </Button>
                  <Button variant="outline" onClick={loadUsers}>
                    Verileri Yenile
                  </Button>
                  <Button variant="destructive" onClick={clearAllData}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Tüm Verileri Temizle
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Create New Admin User */}
            <Card>
              <CardHeader>
                <CardTitle>Yeni Yönetici Kullanıcı Oluştur</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Şifre</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Ad</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ad"
                    />
                  </div>
                  <div>
                    <Label htmlFor="surname">Soyad</Label>
                    <Input
                      id="surname"
                      value={newUser.surname}
                      onChange={(e) => setNewUser(prev => ({ ...prev, surname: e.target.value }))}
                      placeholder="Soyad"
                    />
                  </div>
                </div>
                <Button onClick={createAdminUser}>
                  <Plus className="w-4 h-4 mr-2" />
                  Yönetici Kullanıcı Oluştur
                </Button>
              </CardContent>
            </Card>

            {/* Admin Users */}
            <Card>
              <CardHeader>
                <CardTitle>Yönetici Kullanıcıları ({adminUsers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {adminUsers.length === 0 ? (
                  <p className="text-muted-foreground">Hiç yönetici kullanıcı bulunamadı</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Ad Soyad</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Durum</TableHead>
                        {showPasswords && <TableHead>Şifre (Hash)</TableHead>}
                        <TableHead>Son Giriş</TableHead>
                        <TableHead>İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.id}</TableCell>
                          <TableCell>{user.name} {user.surname}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'super_admin' ? 'destructive' : 'default'}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.isActive ? 'default' : 'secondary'}>
                              {user.isActive ? 'Aktif' : 'Pasif'}
                            </Badge>
                          </TableCell>
                          {showPasswords && (
                            <TableCell className="font-mono text-xs max-w-32 truncate">
                              {user.password}
                            </TableCell>
                          )}
                          <TableCell>
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleString('tr-TR') : 'Hiç'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const newPassword = prompt('Yeni şifre:');
                                  if (newPassword) {
                                    resetPassword(user.id, newPassword);
                                  }
                                }}
                              >
                                Şifre Sıfırla
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteUser(user.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Cloud Users */}
            <Card>
              <CardHeader>
                <CardTitle>Cloud Kullanıcıları ({users.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <p className="text-muted-foreground">Hiç cloud kullanıcı bulunamadı</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Ad Soyad</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rol</TableHead>
                        {showPasswords && <TableHead>Şifre</TableHead>}
                        <TableHead>Oluşturulma</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.id}</TableCell>
                          <TableCell>{user.name} {user.surname}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge>{user.role}</Badge>
                          </TableCell>
                          {showPasswords && (
                            <TableCell className="font-mono text-xs">
                              {user.password}
                            </TableCell>
                          )}
                          <TableCell>
                            {user.created_at ? new Date(user.created_at).toLocaleString('tr-TR') : 'Bilinmiyor'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Environment Info */}
            <Card>
              <CardHeader>
                <CardTitle>Ortam Bilgileri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label>NODE_ENV</Label>
                    <p className="text-muted-foreground">{process.env.NODE_ENV || 'undefined'}</p>
                  </div>
                  <div>
                    <Label>NEXT_PUBLIC_CO_DEV_ENV</Label>
                    <p className="text-muted-foreground">{process.env.NEXT_PUBLIC_CO_DEV_ENV || 'undefined'}</p>
                  </div>
                  <div>
                    <Label>Supabase URL</Label>
                    <p className="text-muted-foreground">
                      {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Yapılandırılmış' : 'Yapılandırılmamış'}
                    </p>
                  </div>
                  <div>
                    <Label>WordPress URL</Label>
                    <p className="text-muted-foreground">
                      {process.env.NEXT_PUBLIC_WORDPRESS_URL ? 'Yapılandırılmış' : 'Yapılandırılmamış'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}