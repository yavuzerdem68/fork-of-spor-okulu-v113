import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Home,
  Users,
  Zap,
  Calendar,
  UserCheck,
  CreditCard,
  Package,
  Trophy,
  Heart,
  BarChart3,
  MessageCircle,
  Camera,
  FileText,
  Settings,
  Shield,
  LogOut
} from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

interface SidebarProps {
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
  currentPath?: string;
}

export default function Sidebar({ sidebarOpen = true, setSidebarOpen, currentPath }: SidebarProps) {
  const router = useRouter();
  const [userRole, setUserRole] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const email = localStorage.getItem("userEmail");
    setUserRole(role || "");
    setUserEmail(email || "");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    // Masaüstü sürümü - direkt ana sayfaya yönlendir
    router.push("/");
  };

  // Masaüstü sürümü - basePath yok, direkt path'ler kullan
  const sidebarItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Users, label: "Sporcular", href: "/athletes" },
    { icon: Zap, label: "Antrenörler", href: "/coaches" },
    { icon: Calendar, label: "Antrenmanlar", href: "/trainings" },
    { icon: UserCheck, label: "Yoklama", href: "/attendance" },
    { icon: CreditCard, label: "Ödemeler", href: "/payments" },
    { icon: Package, label: "Stok ve Satış", href: "/inventory-sales" },
    { icon: Trophy, label: "Etkinlikler", href: "/events-tournaments" },
    { icon: BarChart3, label: "Performans", href: "/performance" },
    { icon: MessageCircle, label: "Mesajlar", href: "/messages" },
    { icon: Camera, label: "Medya", href: "/media" },
    { icon: FileText, label: "Raporlar", href: "/reports" },
    { icon: Settings, label: "Ayarlar", href: "/settings" },
    { icon: Shield, label: "Yönetici Ayarları", href: "/admin-settings" }
  ];

  const isActive = (href: string) => {
    if (currentPath) {
      return currentPath === href;
    }
    return router.pathname === href;
  };

  return (
    <motion.aside 
      className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-card border-r border-border transition-all duration-300 flex flex-col`}
      initial={{ x: -100 }}
      animate={{ x: 0 }}
    >
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-2">
          <Trophy className="h-8 w-8 text-primary" />
          {sidebarOpen && (
            <span className="text-xl font-bold text-primary">SportsCRM</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item, index) => (
            <motion.li 
              key={item.label}
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            </motion.li>
          ))}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" />
            <AvatarFallback>AY</AvatarFallback>
          </Avatar>
          {sidebarOpen && (
            <div className="flex-1">
              <p className="text-sm font-medium">Yönetici</p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.aside>
  );
}