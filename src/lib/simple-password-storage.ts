/**
 * Basit Şifre Depolama Sistemi
 * Sadece şifreleri GitHub'da saklar, karmaşık senkronizasyon yok
 */

export interface PasswordData {
  timestamp: string;
  passwords: {
    adminUsers: Array<{
      username: string;
      password: string;
      email?: string;
      role: string;
    }>;
  };
}

export class SimplePasswordStorage {
  private static instance: SimplePasswordStorage;
  
  private constructor() {}

  static getInstance(): SimplePasswordStorage {
    if (!SimplePasswordStorage.instance) {
      SimplePasswordStorage.instance = new SimplePasswordStorage();
    }
    return SimplePasswordStorage.instance;
  }

  // GitHub'a şifreleri kaydet
  async savePasswordsToGitHub(): Promise<{ success: boolean; message: string }> {
    try {
      // Mevcut kullanıcıları al
      const users = JSON.parse(localStorage.getItem('simple_auth_users') || '[]');
      
      const passwordData: PasswordData = {
        timestamp: new Date().toISOString(),
        passwords: {
          adminUsers: users
        }
      };

      const response = await fetch('/api/save-passwords-github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData)
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('Şifreler GitHub\'a kaydedildi');
        return { success: true, message: 'Şifreler başarıyla kaydedildi' };
      } else {
        throw new Error(result.message || 'Kaydetme hatası');
      }
    } catch (error) {
      console.error('Şifre kaydetme hatası:', error);
      return { success: false, message: `Hata: ${error}` };
    }
  }

  // GitHub'dan şifreleri yükle
  async loadPasswordsFromGitHub(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('/api/load-passwords-github', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      
      if (result.success && result.data) {
        const passwordData: PasswordData = result.data;
        
        // Şifreleri localStorage'a yükle
        if (passwordData.passwords.adminUsers) {
          localStorage.setItem('simple_auth_users', JSON.stringify(passwordData.passwords.adminUsers));
          console.log('Şifreler GitHub\'dan yüklendi');
          return { success: true, message: 'Şifreler başarıyla yüklendi' };
        }
      } else if (response.status === 404) {
        return { success: false, message: 'GitHub\'da kayıtlı şifre bulunamadı' };
      } else {
        throw new Error(result.message || 'Yükleme hatası');
      }
      
      return { success: false, message: 'Veri bulunamadı' };
    } catch (error) {
      console.error('Şifre yükleme hatası:', error);
      return { success: false, message: `Hata: ${error}` };
    }
  }

  // Şifre durumunu kontrol et
  getPasswordStatus(): { 
    localUsers: number; 
    lastSave: string | null; 
    hasGitHubConfig: boolean;
  } {
    const users = JSON.parse(localStorage.getItem('simple_auth_users') || '[]');
    const lastSave = localStorage.getItem('password_last_save');
    
    return {
      localUsers: users.length,
      lastSave,
      hasGitHubConfig: true // GitHub env variables zaten var
    };
  }

  // Başarılı kaydetme sonrası timestamp güncelle
  updateLastSaveTime(): void {
    localStorage.setItem('password_last_save', new Date().toISOString());
  }
}

// Global instance
export const simplePasswordStorage = SimplePasswordStorage.getInstance();