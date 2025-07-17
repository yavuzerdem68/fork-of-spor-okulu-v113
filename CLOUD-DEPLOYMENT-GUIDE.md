# SportsCRM Cloud Deployment Rehberi

Bu rehber, SportsCRM sisteminin Vercel veya Google Cloud'da ücretsiz olarak nasıl deploy edileceğini açıklar.

## 🚀 Hızlı Başlangıç

### 1. Supabase Hesabı Oluşturma

1. [Supabase.com](https://supabase.com) adresine gidin
2. "Start your project" butonuna tıklayın
3. GitHub hesabınızla giriş yapın
4. "New Project" butonuna tıklayın
5. Proje adını girin (örn: "sports-crm")
6. Güçlü bir database şifresi oluşturun
7. Region olarak "West EU (Ireland)" seçin (Türkiye'ye en yakın)
8. "Create new project" butonuna tıklayın

### 2. Supabase Database Kurulumu

Proje oluşturulduktan sonra:

1. Sol menüden "SQL Editor" seçin
2. Aşağıdaki SQL kodunu çalıştırın:

```sql
-- Athletes table
CREATE TABLE athletes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  tc_no TEXT,
  birth_date DATE,
  phone TEXT,
  email TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  parent_email TEXT,
  address TEXT,
  sports_branch TEXT,
  level TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  metadata JSONB
);

-- Diagnostics table
CREATE TABLE diagnostics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  test_date DATE NOT NULL,
  height DECIMAL,
  weight DECIMAL,
  body_fat_percentage DECIMAL,
  muscle_mass DECIMAL,
  flexibility_score INTEGER,
  endurance_score INTEGER,
  strength_score INTEGER,
  speed_score INTEGER,
  agility_score INTEGER,
  balance_score INTEGER,
  coordination_score INTEGER,
  notes TEXT,
  metadata JSONB
);

-- Payments table
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT,
  description TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed', 'refunded')),
  metadata JSONB
);

-- Trainings table
CREATE TABLE trainings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  training_date DATE NOT NULL,
  duration_minutes INTEGER,
  sports_branch TEXT,
  level TEXT,
  max_participants INTEGER,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  metadata JSONB
);

-- Training attendance table
CREATE TABLE training_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  training_id UUID REFERENCES trainings(id) ON DELETE CASCADE,
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  attendance_status TEXT DEFAULT 'present' CHECK (attendance_status IN ('present', 'absent', 'late', 'excused')),
  notes TEXT,
  UNIQUE(training_id, athlete_id)
);

-- Create indexes for better performance
CREATE INDEX idx_athletes_status ON athletes(status);
CREATE INDEX idx_athletes_sports_branch ON athletes(sports_branch);
CREATE INDEX idx_diagnostics_athlete_id ON diagnostics(athlete_id);
CREATE INDEX idx_diagnostics_test_date ON diagnostics(test_date);
CREATE INDEX idx_payments_athlete_id ON payments(athlete_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_trainings_training_date ON trainings(training_date);
CREATE INDEX idx_trainings_status ON trainings(status);
CREATE INDEX idx_training_attendance_training_id ON training_attendance(training_id);
CREATE INDEX idx_training_attendance_athlete_id ON training_attendance(athlete_id);

-- Enable Row Level Security (RLS)
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_attendance ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Enable all operations for authenticated users" ON athletes
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON diagnostics
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON payments
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON trainings
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON training_attendance
  FOR ALL USING (auth.role() = 'authenticated');
```

### 3. Supabase Ayarlarını Alma

1. Supabase dashboard'da "Settings" > "API" seçin
2. Aşağıdaki bilgileri not edin:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: `eyJ...` ile başlayan uzun anahtar

### 4. Vercel'de Deployment

#### GitHub Repository Hazırlama

1. GitHub'da yeni bir repository oluşturun
2. Projeyi GitHub'a yükleyin:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/sports-crm.git
git push -u origin main
```

#### Vercel'de Deploy Etme

1. [Vercel.com](https://vercel.com) adresine gidin
2. GitHub hesabınızla giriş yapın
3. "New Project" butonuna tıklayın
4. Repository'nizi seçin
5. "Configure Project" sayfasında:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (varsayılan)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (varsayılan)

6. **Environment Variables** bölümüne aşağıdaki değerleri ekleyin:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_APP_MODE=cloud
NEXT_PUBLIC_CO_DEV_ENV=cloud
NEXTAUTH_SECRET=your-random-secret-key-here
NEXTAUTH_URL=https://your-project-name.vercel.app
```

7. "Deploy" butonuna tıklayın

### 5. Google Cloud Run'da Deployment (Alternatif)

#### Dockerfile Oluşturma

```dockerfile
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

#### Google Cloud'da Deploy

```bash
# Google Cloud CLI kurulumu sonrası
gcloud auth login
gcloud config set project your-project-id

# Container build ve deploy
gcloud run deploy sports-crm \
  --source . \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_SUPABASE_URL=your-supabase-url,NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key,NEXT_PUBLIC_APP_MODE=cloud
```

## 🔐 Kullanıcı Yönetimi

### Varsayılan Admin Hesabı

Sistem ilk çalıştırıldığında otomatik olarak varsayılan admin hesabı oluşturulur:

- **Email**: admin@sportscr.com
- **Şifre**: admin123

⚠️ **Güvenlik**: İlk girişten sonra mutlaka şifreyi değiştirin!

### Yeni Kullanıcı Ekleme

1. Admin hesabıyla giriş yapın
2. "Ayarlar" > "Kullanıcı Yönetimi" seçin
3. "Yeni Kullanıcı Ekle" butonuna tıklayın
4. Kullanıcı bilgilerini doldurun
5. Rol seçin (Admin, Antrenör, Veli)
6. "Kaydet" butonuna tıklayın

### Roller ve Yetkiler

- **Admin**: Tüm sistem erişimi, kullanıcı yönetimi
- **Antrenör**: Sporcu yönetimi, antrenman planları, performans takibi
- **Veli**: Sadece kendi çocuğunun bilgilerini görme

## 📊 Veri Yönetimi

### Veri Yedekleme

Supabase otomatik yedekleme yapar, ancak manuel yedek için:

1. Supabase dashboard > "Settings" > "Database"
2. "Backups" sekmesi
3. "Create backup" butonuna tıklayın

### Veri İçe/Dışa Aktarma

Sistem Excel dosyalarını destekler:

- **Sporcu listesi**: Excel'den toplu sporcu ekleme
- **Ödeme kayıtları**: Banka ekstresinden ödeme aktarma
- **Raporlar**: Tüm verileri Excel'e aktarma

## 🔧 Özelleştirme

### Tema ve Görünüm

`src/styles/globals.css` dosyasını düzenleyerek:
- Renk şeması değiştirme
- Logo değiştirme
- Yazı tipleri özelleştirme

### Spor Dalları

`src/lib/sports-branches.ts` dosyasından spor dallarını özelleştirebilirsiniz.

### E-posta Bildirimleri

Environment variables'a email ayarları ekleyerek:

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
```

## 🚨 Sorun Giderme

### Yaygın Hatalar

1. **Supabase bağlantı hatası**:
   - Environment variables'ları kontrol edin
   - Supabase projesinin aktif olduğundan emin olun

2. **Build hatası**:
   - `npm install` çalıştırın
   - Node.js versiyonunu kontrol edin (18+ gerekli)

3. **Authentication hatası**:
   - Supabase RLS politikalarını kontrol edin
   - JWT secret'ın doğru olduğundan emin olun

### Destek

Sorun yaşadığınızda:
1. Browser console'u kontrol edin
2. Vercel/Google Cloud loglarını inceleyin
3. Supabase logs'ları kontrol edin

## 💰 Maliyet Bilgileri

### Vercel (Önerilen)
- **Hobby Plan**: Ücretsiz
- **Limitler**: 100GB bandwidth/ay, 1000 serverless function çağrısı/gün
- **Yeterli**: Küçük-orta spor okulları için

### Google Cloud Run
- **Ücretsiz Tier**: 2 milyon istek/ay
- **Maliyet**: Kullanım başına ödeme
- **Yeterli**: Çoğu kullanım senaryosu için

### Supabase
- **Free Tier**: 500MB database, 50MB file storage
- **Limitler**: 50,000 monthly active users
- **Yeterli**: Çoğu spor okulu için

## 🔄 Güncelleme

Yeni versiyon çıktığında:

1. GitHub repository'yi güncelleyin
2. Vercel otomatik olarak yeniden deploy eder
3. Database migration'ları varsa Supabase'de çalıştırın

---

Bu rehber ile SportsCRM sisteminizi bulutta çalıştırabilir ve verilerinizi güvenli bir şekilde saklayabilirsiniz. Herhangi bir sorun yaşarsanız, lütfen dokümantasyonu tekrar inceleyin.