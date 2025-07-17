# SportsCRM Bulut Kurulum Rehberi

## 🚀 5 Dakikada Kurulum

### 1. Supabase Hesabı (Ücretsiz Database)

1. [supabase.com](https://supabase.com) → "Start your project"
2. GitHub ile giriş yap
3. "New Project" → Proje adı: `sports-crm`
4. Güçlü şifre oluştur → "Create new project"
5. Sol menü → "SQL Editor" → Aşağıdaki kodu yapıştır:

```sql
-- Temel tablolar
CREATE TABLE athletes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active'
);

CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  athlete_id UUID REFERENCES athletes(id),
  amount DECIMAL NOT NULL,
  payment_date DATE NOT NULL,
  description TEXT
);

-- Güvenlik ayarları
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users" ON athletes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON payments FOR ALL USING (auth.role() = 'authenticated');
```

6. "Settings" → "API" → Bu bilgileri not et:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public key**: `eyJ...` ile başlayan anahtar

### 2. Vercel'de Yayınlama (Ücretsiz Hosting)

1. [vercel.com](https://vercel.com) → GitHub ile giriş
2. "New Project" → GitHub repository'nizi seçin
3. **Environment Variables** ekle:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_MODE=cloud
NEXTAUTH_SECRET=random-secret-key-123
```

4. "Deploy" → 2-3 dakika bekle → Hazır! 🎉

### 3. İlk Kullanım

1. Sitenizi açın → "Giriş Yap"
2. "Varsayılan Admin Oluştur" butonuna tıkla
3. **admin@sportscr.com** / **admin123** ile giriş yap
4. Şifreyi değiştir → Kullanmaya başla!

## 📱 Özellikler

✅ **Sporcu Yönetimi**: Kayıt, güncelleme, arama  
✅ **Ödeme Takibi**: Aidat, ödeme geçmişi  
✅ **Excel Desteği**: Toplu veri aktarımı  
✅ **Mobil Uyumlu**: Telefon/tablet desteği  
✅ **Güvenli**: Şifreli veri saklama  
✅ **Ücretsiz**: Küçük spor okulları için  

## 🔧 Hızlı Kurulum Komutu

Proje klasöründe:

```bash
node setup-cloud.js
npm run build:cloud
npm run deploy:vercel
```

## 💡 İpuçları

- **Yedekleme**: Supabase otomatik yedek alır
- **Güvenlik**: Admin şifresini mutlaka değiştirin
- **Kapasite**: 500MB database ücretsiz (binlerce sporcu)
- **Hız**: Türkiye'den hızlı erişim için EU region seçin

## 🆘 Sorun mu var?

1. **Bağlantı hatası**: Environment variables'ları kontrol et
2. **Giriş sorunu**: "Varsayılan Admin Oluştur" butonunu kullan
3. **Yavaş**: Supabase region'ı EU olarak değiştir

---

**Tebrikler!** SportsCRM sisteminiz artık bulutta çalışıyor. Herhangi bir yerden erişebilir, verileriniz güvende saklanır.