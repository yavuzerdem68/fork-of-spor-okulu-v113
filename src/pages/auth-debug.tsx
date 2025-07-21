import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { simpleAuthManager } from '@/lib/simple-auth';
import { useRouter } from 'next/router';

export default function AuthDebug() {
  const router = useRouter();
  const [authState, setAuthState] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await simpleAuthManager.initialize();
        await simpleAuthManager.initializeDefaultUsers();
        
        const currentUser = simpleAuthManager.getCurrentUser();
        const allUsers = simpleAuthManager.getAllUsers();
        
        setAuthState({
          isAuthenticated: simpleAuthManager.isAuthenticated(),
          isAdmin: simpleAuthManager.isAdmin(),
          currentUser: currentUser,
          localStorage: {
            userRole: localStorage.getItem('userRole'),
            userEmail: localStorage.getItem('userEmail'),
            currentUser: localStorage.getItem('simple_auth_current_user')
          }
        });
        
        setUsers(allUsers);
      } catch (error) {
        console.error('Auth debug error:', error);
        setAuthState({ error: error.message });
      }
    };

    checkAuth();
  }, []);

  const handleLoginAsAdmin = async () => {
    try {
      await simpleAuthManager.signIn('yavuz@g7spor.org', '444125yA/');
      window.location.reload();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleGoToPasswordManager = () => {
    router.push('/password-manager');
  };

  if (!authState) {
    return <div className="flex items-center justify-center min-h-screen">Yükleniyor...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Kimlik Doğrulama Tanılama</h1>
        <p className="text-muted-foreground">
          Mevcut kimlik doğrulama durumunu kontrol edin
        </p>
      </div>

      <div className="grid gap-6">
        {/* Auth State */}
        <Card>
          <CardHeader>
            <CardTitle>Kimlik Doğrulama Durumu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Giriş Yapılmış:</span>
              <Badge variant={authState.isAuthenticated ? "default" : "destructive"}>
                {authState.isAuthenticated ? "Evet" : "Hayır"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Admin Yetkisi:</span>
              <Badge variant={authState.isAdmin ? "default" : "destructive"}>
                {authState.isAdmin ? "Evet" : "Hayır"}
              </Badge>
            </div>

            {authState.currentUser && (
              <div className="space-y-2">
                <h4 className="font-semibold">Mevcut Kullanıcı:</h4>
                <div className="bg-muted p-3 rounded">
                  <p><strong>Email:</strong> {authState.currentUser.email}</p>
                  <p><strong>İsim:</strong> {authState.currentUser.name} {authState.currentUser.surname}</p>
                  <p><strong>Rol:</strong> {authState.currentUser.role}</p>
                  <p><strong>ID:</strong> {authState.currentUser.id}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* LocalStorage State */}
        <Card>
          <CardHeader>
            <CardTitle>LocalStorage Durumu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p><strong>userRole:</strong> {authState.localStorage.userRole || 'Yok'}</p>
              <p><strong>userEmail:</strong> {authState.localStorage.userEmail || 'Yok'}</p>
              <p><strong>currentUser:</strong> {authState.localStorage.currentUser ? 'Var' : 'Yok'}</p>
            </div>
          </CardContent>
        </Card>

        {/* All Users */}
        <Card>
          <CardHeader>
            <CardTitle>Tüm Kullanıcılar ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {users.map((user, index) => (
                <div key={user.id} className="bg-muted p-3 rounded">
                  <p><strong>#{index + 1}:</strong> {user.email} - {user.role}</p>
                  <p className="text-sm text-muted-foreground">
                    {user.name} {user.surname} (ID: {user.id})
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>İşlemler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleLoginAsAdmin} className="w-full">
              Admin Olarak Giriş Yap (yavuz@g7spor.org)
            </Button>
            
            <Button onClick={handleGoToPasswordManager} variant="outline" className="w-full">
              Şifre Yöneticisine Git
            </Button>
            
            <Button onClick={() => router.push('/login')} variant="ghost" className="w-full">
              Login Sayfasına Git
            </Button>
          </CardContent>
        </Card>

        {authState.error && (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Hata</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">{authState.error}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}