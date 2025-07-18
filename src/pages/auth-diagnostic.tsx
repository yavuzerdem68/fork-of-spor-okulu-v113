import React, { useState, useEffect } from "react";
import Head from "next/head";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, RefreshCw, Trash2, UserPlus, Eye } from "lucide-react";
import Link from "next/link";
import { cloudAuthManager } from "@/lib/cloud-auth";

export default function AuthDiagnostic() {
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [newAdmin, setNewAdmin] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAuthData();
  }, []);

  const loadAuthData = () => {
    try {
      // Load users from localStorage
      const storedUsers = localStorage.getItem('users');
      const parsedUsers = storedUsers ? JSON.parse(storedUsers) : [];
      setUsers(parsedUsers);

      // Load current user
      const storedCurrentUser = localStorage.getItem('currentUser');
      const parsedCurrentUser = storedCurrentUser ? JSON.parse(storedCurrentUser) : null;
      setCurrentUser(parsedCurrentUser);
    } catch (error) {
      console.error('Error loading auth data:', error);
      setMessage("Veri yükleme hatası: " + error);
    }
  };

  const clearAllAuthData = () => {
    if (confirm("Tüm kimlik doğrulama verilerini silmek istediğinizden emin misiniz?")) {
      localStorage.removeItem('users');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
      setMessage("Tüm kimlik doğrulama verileri temizlendi");
      loadAuthData();
    }
  };

  const deleteUser = (email: string) => {
    if (confirm(`${email} kullanıcısını silmek istediğinizden emin misiniz?`)) {
      const updatedUsers = users.filter(user => user.email !== email);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      setMessage(`${email} kullanıcısı silindi`);
      loadAuthData();
    }
  };

  const createAdminUser = async () => {
    if (!newAdmin.email || !newAdmin.password) {
      setMessage("Email ve şifre gerekli");
      return;
    }

    setLoading(true);
    try {
      // Remove existing user with same email first
      const existingUsers = users.filter(user => user.email !== newAdmin.email);
      
      // Create new admin user
      const adminUser = {
        id: `user-${Date.now()}`,
        email: newAdmin.email,
        password: newAdmin.password,
        name: newAdmin.email.split('@')[0],
        surname: 'Admin',
        role: 'admin',
        created_at: new Date().toISOString(),
        metadata: { isCustom: true, createdBy: 'diagnostic' }
      };

      existingUsers.push(adminUser);
      localStorage.setItem('users', JSON.stringify(existingUsers));
      
      setMessage(`Admin kullanıcısı oluşturuldu: ${newAdmin.email}`);
      setNewAdmin({ email: "", password: "" });
      loadAuthData();
    } catch (error) {
      setMessage("Admin oluşturma hatası: " + error);
    }
    setLoading(false);
  };

  const testLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      await cloudAuthManager.signIn(email, password);
      setMessage(`${email} ile giriş başarılı!`);
      loadAuthData();
    } catch (error: any) {
      setMessage(`Giriş hatası: ${error.message}`);
    }
    setLoading(false);
  };

  const fixYavuzAccount = () => {
    const yavuzEmail = "yavuz@g7spor.org";
    const defaultPassword = "admin123";
    
    // Remove any existing yavuz accounts
    const filteredUsers = users.filter(user => user.email !== yavuzEmail);
    
    // Create fresh yavuz admin account
    const yavuzAdmin = {
      id: `user-${Date.now()}`,
      email: yavuzEmail,
      password: defaultPassword,
      name: 'Yavuz',
      surname: 'Admin',
      role: 'admin',
      created_at: new Date().toISOString(),
      metadata: { isCustom: true, fixedBy: 'diagnostic' }
    };

    filteredUsers.push(yavuzAdmin);
    localStorage.setItem('users', JSON.stringify(filteredUsers));
    
    setMessage(`${yavuzEmail} hesabı düzeltildi. Şifre: ${defaultPassword}`);
    loadAuthData();
  };

  return (
    <>
      <Head>
        <title>Kimlik Doğrulama Tanısı</title>
      </Head>

      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/cloud-login" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Giriş Sayfasına Dön
            </Link>
            <h1 className="text-2xl font-bold">Kimlik Doğrulama Tanısı</h1>
            <p className="text-muted-foreground">Giriş sorunlarını teşhis edin ve düzeltin</p>
          </div>

          {message && (
            <Alert className="mb-6">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList>
              <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
              <TabsTrigger value="current">Mevcut Oturum</TabsTrigger>
              <TabsTrigger value="tools">Araçlar</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Kayıtlı Kullanıcılar ({users.length})
                    <Button onClick={loadAuthData} size="sm" variant="outline">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Yenile
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {users.length === 0 ? (
                    <p className="text-muted-foreground">Kayıtlı kullanıcı bulunamadı</p>
                  ) : (
                    <div className="space-y-4">
                      {users.map((user, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{user.email}</p>
                              <p className="text-sm text-muted-foreground">
                                {user.name} {user.surname} - {user.role}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Oluşturulma: {new Date(user.created_at).toLocaleString('tr-TR')}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => testLogin(user.email, user.password)}
                                disabled={loading}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Test Et
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteUser(user.email)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="mt-2 text-xs bg-muted p-2 rounded">
                            <strong>Şifre:</strong> {user.password}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="current">
              <Card>
                <CardHeader>
                  <CardTitle>Mevcut Oturum</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentUser ? (
                    <div className="space-y-2">
                      <p><strong>Email:</strong> {currentUser.email}</p>
                      <p><strong>İsim:</strong> {currentUser.name} {currentUser.surname}</p>
                      <p><strong>Rol:</strong> {currentUser.role}</p>
                      <p><strong>Son Giriş:</strong> {currentUser.last_login ? new Date(currentUser.last_login).toLocaleString('tr-TR') : 'Bilinmiyor'}</p>
                      <div className="mt-4">
                        <Button
                          onClick={async () => {
                            await cloudAuthManager.signOut();
                            setMessage("Oturum kapatıldı");
                            loadAuthData();
                          }}
                          variant="outline"
                        >
                          Oturumu Kapat
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Aktif oturum bulunamadı</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tools">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Yavuz Hesabını Düzelt</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      yavuz@g7spor.org hesabını temizleyip yeniden oluşturur
                    </p>
                    <Button onClick={fixYavuzAccount} className="w-full">
                      Yavuz Hesabını Düzelt
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Yeni Admin Oluştur</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="admin-email">Email</Label>
                        <Input
                          id="admin-email"
                          type="email"
                          value={newAdmin.email}
                          onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                          placeholder="admin@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="admin-password">Şifre</Label>
                        <Input
                          id="admin-password"
                          type="text"
                          value={newAdmin.password}
                          onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                          placeholder="admin123"
                        />
                      </div>
                      <Button onClick={createAdminUser} disabled={loading} className="w-full">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Admin Oluştur
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-destructive">Tehlikeli İşlemler</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={clearAllAuthData} variant="destructive" className="w-full">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Tüm Kimlik Doğrulama Verilerini Temizle
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}