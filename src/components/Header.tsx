import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Shield, 
  Users, 
  Zap, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import Logo from './Logo';

const Header = () => {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const user = localStorage.getItem("currentUser");
    setUserRole(role);
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userEmail");
    router.push("/spor-okulu/login");
  };

  const getNavigationItems = () => {
    if (userRole === 'admin') {
      return [
        { label: 'Dashboard', path: '/spor-okulu/dashboard' },
        { label: 'Sporcular', path: '/spor-okulu/athletes' },
        { label: 'Antrenörler', path: '/spor-okulu/coaches' },
        { label: 'Antrenmanlar', path: '/spor-okulu/trainings' },
        { label: 'Yoklama', path: '/spor-okulu/attendance' },
        { label: 'Ödemeler', path: '/spor-okulu/payments' },
        { label: 'Performans', path: '/spor-okulu/performance' },
        { label: 'Raporlar', path: '/spor-okulu/reports' },
        { label: 'Ayarlar', path: '/spor-okulu/system-settings' }
      ];
    } else if (userRole === 'coach') {
      return [
        { label: 'Dashboard', path: '/spor-okulu/coach-dashboard' },
        { label: 'Sporcularım', path: '/spor-okulu/coach-dashboard' },
        { label: 'Performans', path: '/spor-okulu/performance' },
        { label: 'Yoklama', path: '/spor-okulu/coach-dashboard' },
        { label: 'Mesajlar', path: '/spor-okulu/coach-dashboard' }
      ];
    } else if (userRole === 'parent') {
      return [
        { label: 'Dashboard', path: '/spor-okulu/parent-dashboard' },
        { label: 'Ödemeler', path: '/spor-okulu/parent-dashboard' },
        { label: 'Performans', path: '/spor-okulu/parent-dashboard' }
      ];
    }
    return [];
  };

  const getRoleBadge = () => {
    if (userRole === 'admin') {
      return (
        <Badge variant="secondary" className="flex items-center space-x-1">
          <Shield className="w-3 h-3" />
          <span>Yönetici</span>
        </Badge>
      );
    } else if (userRole === 'coach') {
      return (
        <Badge variant="secondary" className="flex items-center space-x-1">
          <Zap className="w-3 h-3" />
          <span>Antrenör</span>
        </Badge>
      );
    } else if (userRole === 'parent') {
      return (
        <Badge variant="secondary" className="flex items-center space-x-1">
          <Users className="w-3 h-3" />
          <span>Veli</span>
        </Badge>
      );
    }
    return null;
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="cursor-pointer flex items-center space-x-2" onClick={() => router.push("/spor-okulu/")}>
              <Trophy className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">SportsCRM</span>
            </div>
            {getRoleBadge()}
          </div>

          {/* Desktop Navigation */}
          {userRole && (
            <div className="hidden md:flex items-center space-x-6">
              <nav className="flex items-center space-x-4">
                {navigationItems.map((item) => (
                  <Button
                    key={item.path}
                    variant={router.pathname === item.path ? "default" : "ghost"}
                    size="sm"
                    onClick={() => router.push(item.path)}
                  >
                    {item.label}
                  </Button>
                ))}
              </nav>
              
              <div className="flex items-center space-x-4">
                {currentUser && (
                  <div className="text-right">
                    <p className="font-medium text-sm">
                      {currentUser.name} {currentUser.surname}
                    </p>
                    {currentUser.specialization && (
                      <p className="text-xs text-muted-foreground">
                        {currentUser.specialization}
                      </p>
                    )}
                  </div>
                )}
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Çıkış
                </Button>
              </div>
            </div>
          )}

          {/* Mobile Menu Button */}
          {userRole && (
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          )}

          {/* Login Button for non-authenticated users */}
          {!userRole && (
            <Button onClick={() => router.push("/spor-okulu/login")}>
              Giriş Yap
            </Button>
          )}
        </div>

        {/* Mobile Navigation */}
        {userRole && isMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col space-y-2">
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  variant={router.pathname === item.path ? "default" : "ghost"}
                  size="sm"
                  className="justify-start"
                  onClick={() => {
                    router.push(item.path);
                    setIsMenuOpen(false);
                  }}
                >
                  {item.label}
                </Button>
              ))}
              <div className="pt-4 border-t">
                {currentUser && (
                  <div className="mb-4">
                    <p className="font-medium text-sm">
                      {currentUser.name} {currentUser.surname}
                    </p>
                    {currentUser.specialization && (
                      <p className="text-xs text-muted-foreground">
                        {currentUser.specialization}
                      </p>
                    )}
                  </div>
                )}
                <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
                  <LogOut className="w-4 h-4 mr-2" />
                  Çıkış
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;