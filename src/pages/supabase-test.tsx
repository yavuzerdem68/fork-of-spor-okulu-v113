import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { athleteService, auth, supabase } from '@/lib/supabase';
import type { Athlete } from '@/lib/supabase';

export default function SupabaseTest() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  // Test form data
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    tc_no: '',
    phone: '',
    email: '',
    sports_branch: 'Futbol',
    level: 'Başlangıç'
  });

  // Auth form data
  const [authData, setAuthData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    checkConnection();
    checkUser();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkConnection = async () => {
    try {
      setConnectionStatus('checking');
      const { data, error } = await supabase.from('athletes').select('count', { count: 'exact', head: true });
      
      if (error) {
        console.error('Connection error:', error);
        setConnectionStatus('error');
        setError(`Bağlantı hatası: ${error.message}`);
      } else {
        setConnectionStatus('connected');
        setSuccess('Supabase bağlantısı başarılı!');
      }
    } catch (err) {
      console.error('Connection test failed:', err);
      setConnectionStatus('error');
      setError('Supabase bağlantısı kurulamadı. Environment variables kontrol edin.');
    }
  };

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await auth.signUp(authData.email, authData.password);
      setSuccess('Kayıt başarılı! Email adresinizi kontrol edin.');
    } catch (err: any) {
      setError(`Kayıt hatası: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await auth.signIn(authData.email, authData.password);
      setSuccess('Giriş başarılı!');
    } catch (err: any) {
      setError(`Giriş hatası: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setSuccess('Çıkış yapıldı.');
      setAthletes([]);
    } catch (err: any) {
      setError(`Çıkış hatası: ${err.message}`);
    }
  };

  const loadAthletes = async () => {
    if (!user) {
      setError('Önce giriş yapmalısınız.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await athleteService.getAll();
      setAthletes(data);
      setSuccess(`${data.length} sporcu yüklendi.`);
    } catch (err: any) {
      setError(`Sporcular yüklenemedi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Önce giriş yapmalısınız.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const newAthlete = await athleteService.create({
        ...formData,
        status: 'active' as const
      });
      
      setAthletes(prev => [newAthlete, ...prev]);
      setSuccess('Sporcu başarıyla eklendi!');
      
      // Reset form
      setFormData({
        name: '',
        surname: '',
        tc_no: '',
        phone: '',
        email: '',
        sports_branch: 'Futbol',
        level: 'Başlangıç'
      });
    } catch (err: any) {
      setError(`Sporcu eklenemedi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteAthlete = async (id: string) => {
    if (!user) return;
    
    try {
      await athleteService.delete(id);
      setAthletes(prev => prev.filter(a => a.id !== id));
      setSuccess('Sporcu silindi.');
    } catch (err: any) {
      setError(`Silme hatası: ${err.message}`);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Supabase Test Sayfası</h1>
        <p className="text-muted-foreground">
          Supabase bağlantısını ve temel CRUD işlemlerini test edin
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Bağlantı Durumu
            <Badge variant={connectionStatus === 'connected' ? 'default' : connectionStatus === 'error' ? 'destructive' : 'secondary'}>
              {connectionStatus === 'connected' ? 'Bağlı' : connectionStatus === 'error' ? 'Hata' : 'Kontrol Ediliyor'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={checkConnection} disabled={loading}>
            Bağlantıyı Test Et
          </Button>
        </CardContent>
      </Card>

      {/* Auth Section */}
      <Card>
        <CardHeader>
          <CardTitle>Kimlik Doğrulama</CardTitle>
          <CardDescription>
            {user ? `Giriş yapıldı: ${user.email}` : 'Giriş yapılmadı'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!user ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={authData.email}
                    onChange={(e) => setAuthData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Şifre</Label>
                  <Input
                    id="password"
                    type="password"
                    value={authData.password}
                    onChange={(e) => setAuthData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSignIn} disabled={loading}>
                  Giriş Yap
                </Button>
                <Button onClick={handleSignUp} variant="outline" disabled={loading}>
                  Kayıt Ol
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Badge variant="default">{user.email}</Badge>
              <Button onClick={handleSignOut} variant="outline">
                Çıkış Yap
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {user && (
        <>
          {/* Add Athlete Form */}
          <Card>
            <CardHeader>
              <CardTitle>Sporcu Ekle</CardTitle>
              <CardDescription>Yeni sporcu kaydı oluşturun</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Ad</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="surname">Soyad</Label>
                    <Input
                      id="surname"
                      value={formData.surname}
                      onChange={(e) => setFormData(prev => ({ ...prev, surname: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="tc_no">TC No</Label>
                    <Input
                      id="tc_no"
                      value={formData.tc_no}
                      onChange={(e) => setFormData(prev => ({ ...prev, tc_no: e.target.value }))}
                      maxLength={11}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sports_branch">Spor Dalı</Label>
                    <Input
                      id="sports_branch"
                      value={formData.sports_branch}
                      onChange={(e) => setFormData(prev => ({ ...prev, sports_branch: e.target.value }))}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Ekleniyor...' : 'Sporcu Ekle'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Athletes List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Sporcular ({athletes.length})
                <Button onClick={loadAthletes} disabled={loading}>
                  Yenile
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {athletes.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Henüz sporcu kaydı yok. Yukarıdaki formu kullanarak sporcu ekleyin.
                </p>
              ) : (
                <div className="space-y-2">
                  {athletes.map((athlete) => (
                    <div key={athlete.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">
                          {athlete.name} {athlete.surname}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {athlete.sports_branch} • {athlete.level} • {athlete.status}
                        </div>
                        {athlete.tc_no && (
                          <div className="text-xs text-muted-foreground">
                            TC: {athlete.tc_no}
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => deleteAthlete(athlete.id)}
                        variant="destructive"
                        size="sm"
                      >
                        Sil
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}