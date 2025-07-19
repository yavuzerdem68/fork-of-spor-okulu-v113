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
import { simpleAuthManager } from "@/lib/simple-auth";

export default function LoginDiagnostic() {
  const [allUsers, setAllUsers] = useState<any[]>([]);
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

  const loadUsers = async () => {
    try {
      await simpleAuthManager.initialize();
      await simpleAuthManager.initializeDefaultUsers();
      
      // Get all users from localStorage directly since getUsers is private
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('simple_auth_users');
        const users = stored ? JSON.parse(stored) : [];
        setAllUsers(users);
      }
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
      await simpleAuthManager.createCustomAdmin(newUser.email, newUser.password, newUser.name, newUser.surname);
      setSuccess(`${newUser.email} başarıyla oluşturuldu! Şifre: ${newUser.password}`);
      setNewUser({ email: "", password: "", name: "", surname: "" });
      
      // Reload users
      await loadUsers();
      
      setTimeout(() => setSuccess(""), 10000);
    } catch (error: any) {
      console.error('Error creating user:', error);
      setError(error.message || 'Kullanıcı oluşturulurken hata oluştu');
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await simpleAuthManager.deleteUser(userId);
      setSuccess('Kullanıcı silindi');
      await loadUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error: any) {
      setError(error.message || 'Kullanıcı silinirken hata oluştu');
    }
  };

  const resetPassword = async (userId: string, newPassword: string) => {
    if (!newPassword) {
      setError('Yeni şifre gerekli');
      return;
    }

    try {
      await simpleAuthManager.resetPassword(userId, newPassword);
      setSuccess(`Şifre güncellendi. Yeni şifre: ${newPassword}`);
      await loadUsers();
      setTimeout(() => setSuccess(""), 5000);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      setError(error.message || 'Şifre güncellenirken hata oluştu');
    }
  };

  const testLogin = async (user: any) => {
    const testPassword = prompt(`${user.email} için test şifresi girin:`);
    if (!testPassword) return;

    try {
      await simpleAuthManager.signIn(user.email, testPassword);
      setSuccess(`✅ Şifre doğru! ${user.email} ile giriş yapabilirsiniz.`);
      // Sign out after test
      await simpleAuthManager.signOut();
    } catch (error: any) {
      setError(`❌ Şifre yanlış! ${user.email} için girdiğiniz şifre hatalı.`);
    }
    
    setTimeout(() => {
      setSuccess("");
      setError("");
    }, 5000);
  };

  const clearAllData = () => {
    if (confirm('TÜM kullanıcı verilerini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
      simpleAuthManager.clearAllData();
      setAllUsers([]);
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

            {/* All Users */}
            <Card>
              <CardHeader>
                <CardTitle>Tüm Kullanıcılar ({allUsers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {allUsers.length === 0 ? (
                  <p className="text-muted-foreground">Hiç kullanıcı bulunamadı</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Ad Soyad</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Durum</TableHead>
                        {showPasswords && <TableHead>Şifre</TableHead>}
                        <TableHead>Son Giriş</TableHead>
                        <TableHead>İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.id}</TableCell>
                          <TableCell>{user.name} {user.surname}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'coach' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.isActive ? 'default' : 'secondary'}>
                              {user.isActive ? 'Aktif' : 'Pasif'}
                            </Badge>
                          </TableCell>
                          {showPasswords && (
                            <TableCell className="font-bold text-green-600">
                              {user.password}
                            </TableCell>
                          )}
                          <TableCell>
                            {user.last_login ? new Date(user.last_login).toLocaleString('tr-TR') : 'Hiç'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 flex-wrap">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => testLogin(user)}
                              >
                                Şifre Test Et
                              </Button>
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