# WhatsApp Entegrasyonu Rehberi - SportsCRM

Bu rehber, SportsCRM sistemine WhatsApp entegrasyonu nasıl yapılacağını detaylı olarak açıklar.

## 📱 WhatsApp Entegrasyon Seçenekleri

### 1. WhatsApp Business API (Önerilen)
**En profesyonel ve güvenilir çözüm**

#### Avantajları:
- ✅ Resmi WhatsApp API
- ✅ Toplu mesaj gönderimi
- ✅ Otomatik mesajlar
- ✅ Mesaj şablonları
- ✅ Webhook desteği
- ✅ Yüksek güvenilirlik

#### Gereksinimler:
- WhatsApp Business hesabı
- Facebook Business Manager hesabı
- Onaylanmış telefon numarası
- SSL sertifikalı domain

#### Kurulum Adımları:

1. **Facebook Business Manager'da Uygulama Oluşturma**
   ```
   1. business.facebook.com adresine gidin
   2. "Uygulama Oluştur" > "İşletme" seçin
   3. Uygulama adını girin (örn: "SportsCRM WhatsApp")
   4. WhatsApp ürününü ekleyin
   ```

2. **Telefon Numarası Doğrulama**
   ```
   1. WhatsApp Business API > Başlarken bölümüne gidin
   2. Telefon numaranızı ekleyin ve doğrulayın
   3. İki faktörlü kimlik doğrulamayı etkinleştirin
   ```

3. **Webhook Kurulumu**
   ```javascript
   // webhook endpoint örneği (Node.js)
   app.post('/webhook/whatsapp', (req, res) => {
     const { entry } = req.body;
     
     entry.forEach(item => {
       const changes = item.changes;
       changes.forEach(change => {
         if (change.field === 'messages') {
           const messages = change.value.messages;
           messages.forEach(message => {
             // Gelen mesajı işle
             handleIncomingMessage(message);
           });
         }
       });
     });
     
     res.status(200).send('OK');
   });
   ```

4. **Mesaj Gönderme Fonksiyonu**
   ```javascript
   async function sendWhatsAppMessage(phoneNumber, message, templateName = null) {
     const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
     const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
     
     const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
     
     const payload = {
       messaging_product: "whatsapp",
       to: phoneNumber,
       type: templateName ? "template" : "text",
     };
     
     if (templateName) {
       payload.template = {
         name: templateName,
         language: { code: "tr" }
       };
     } else {
       payload.text = { body: message };
     }
     
     try {
       const response = await fetch(url, {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${accessToken}`,
           'Content-Type': 'application/json'
         },
         body: JSON.stringify(payload)
       });
       
       return await response.json();
     } catch (error) {
       console.error('WhatsApp mesaj gönderme hatası:', error);
       throw error;
     }
   }
   ```

### 2. WhatsApp Web API (Alternatif)
**Daha basit ama sınırlı çözüm**

#### Popüler Kütüphaneler:
- `whatsapp-web.js` (Node.js)
- `pywhatkit` (Python)
- `selenium-whatsapp` (Çoklu dil)

#### Örnek Kurulum (whatsapp-web.js):
```javascript
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('WhatsApp Client hazır!');
});

// Mesaj gönderme
async function sendMessage(phoneNumber, message) {
    const chatId = phoneNumber + '@c.us';
    await client.sendMessage(chatId, message);
}

client.initialize();
```

## 🔧 SportsCRM'e Entegrasyon

### 1. Ortam Değişkenleri Ayarlama

Aşağıdaki ortam değişkenlerini sisteminize ekleyin:

```bash
# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token_here

# WhatsApp Web API (alternatif)
WHATSAPP_SESSION_PATH=./whatsapp_session
```

### 2. Mesaj Şablonları Oluşturma

WhatsApp Business API için mesaj şablonları:

```javascript
const messageTemplates = {
  // Yoklama bildirimi
  attendance_notification: {
    name: "attendance_notification",
    language: "tr",
    components: [
      {
        type: "body",
        parameters: [
          { type: "text", text: "{{student_name}}" },
          { type: "text", text: "{{training_date}}" },
          { type: "text", text: "{{sport_branch}}" }
        ]
      }
    ]
  },
  
  // Ödeme hatırlatması
  payment_reminder: {
    name: "payment_reminder",
    language: "tr",
    components: [
      {
        type: "body",
        parameters: [
          { type: "text", text: "{{parent_name}}" },
          { type: "text", text: "{{student_name}}" },
          { type: "text", text: "{{amount}}" },
          { type: "text", text: "{{due_date}}" }
        ]
      }
    ]
  },
  
  // Antrenman iptali
  training_cancellation: {
    name: "training_cancellation",
    language: "tr",
    components: [
      {
        type: "body",
        parameters: [
          { type: "text", text: "{{training_date}}" },
          { type: "text", text: "{{training_time}}" },
          { type: "text", text: "{{sport_branch}}" },
          { type: "text", text: "{{reason}}" }
        ]
      }
    ]
  }
};
```

### 3. Otomatik Mesajlaşma Fonksiyonları

```javascript
// Yoklama bildirimi gönderme
async function sendAttendanceNotification(studentId, trainingId, isAbsent) {
  try {
    const student = await getStudentById(studentId);
    const training = await getTrainingById(trainingId);
    const parent = await getParentByStudentId(studentId);
    
    if (isAbsent && parent.phoneNumber) {
      const message = `Merhaba ${parent.name},

${student.name} ${student.surname} adlı öğrenciniz ${training.date} tarihli ${training.sportBranch} antrenmanına katılmamıştır.

Herhangi bir sorunuz varsa bizimle iletişime geçebilirsiniz.

${getSchoolName()} Spor Okulu`;

      await sendWhatsAppMessage(parent.phoneNumber, message);
      
      // Mesaj kaydını veritabanına kaydet
      await saveMessageLog({
        recipientId: parent.id,
        studentId: studentId,
        messageType: 'attendance_notification',
        content: message,
        sentAt: new Date(),
        status: 'sent'
      });
    }
  } catch (error) {
    console.error('Yoklama bildirimi gönderme hatası:', error);
  }
}

// Ödeme hatırlatması gönderme
async function sendPaymentReminder(studentId, amount, dueDate) {
  try {
    const student = await getStudentById(studentId);
    const parent = await getParentByStudentId(studentId);
    
    if (parent.phoneNumber) {
      const message = `Merhaba ${parent.name},

${student.name} ${student.surname} adlı öğrencinizin ${amount} TL tutarındaki aidatının son ödeme tarihi ${dueDate} tarihidir.

Ödemenizi zamanında yapmanızı rica ederiz.

Ödeme bilgileri için: ${getSchoolPhone()}

${getSchoolName()} Spor Okulu`;

      await sendWhatsAppMessage(parent.phoneNumber, message);
      
      await saveMessageLog({
        recipientId: parent.id,
        studentId: studentId,
        messageType: 'payment_reminder',
        content: message,
        sentAt: new Date(),
        status: 'sent'
      });
    }
  } catch (error) {
    console.error('Ödeme hatırlatması gönderme hatası:', error);
  }
}

// Toplu mesaj gönderme
async function sendBulkMessage(recipientIds, message, messageType = 'general') {
  const results = [];
  
  for (const recipientId of recipientIds) {
    try {
      const parent = await getParentById(recipientId);
      
      if (parent.phoneNumber) {
        await sendWhatsAppMessage(parent.phoneNumber, message);
        
        await saveMessageLog({
          recipientId: recipientId,
          messageType: messageType,
          content: message,
          sentAt: new Date(),
          status: 'sent'
        });
        
        results.push({ recipientId, status: 'success' });
      }
    } catch (error) {
      console.error(`Mesaj gönderme hatası (${recipientId}):`, error);
      results.push({ recipientId, status: 'failed', error: error.message });
    }
    
    // Rate limiting için bekleme
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
}
```

### 4. Medya Paylaşımı

```javascript
// Fotoğraf/video paylaşımı
async function shareMediaWithParents(mediaId, recipientIds, caption = '') {
  try {
    const media = await getMediaById(mediaId);
    const mediaUrl = getMediaUrl(media.filePath);
    
    for (const recipientId of recipientIds) {
      const parent = await getParentById(recipientId);
      
      if (parent.phoneNumber) {
        await sendWhatsAppMedia(parent.phoneNumber, mediaUrl, media.type, caption);
        
        await saveMessageLog({
          recipientId: recipientId,
          messageType: 'media_share',
          content: `Medya paylaşıldı: ${media.title}`,
          mediaId: mediaId,
          sentAt: new Date(),
          status: 'sent'
        });
      }
    }
  } catch (error) {
    console.error('Medya paylaşım hatası:', error);
  }
}

async function sendWhatsAppMedia(phoneNumber, mediaUrl, mediaType, caption) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  
  const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
  
  const payload = {
    messaging_product: "whatsapp",
    to: phoneNumber,
    type: mediaType === 'video' ? 'video' : 'image',
  };
  
  if (mediaType === 'video') {
    payload.video = {
      link: mediaUrl,
      caption: caption
    };
  } else {
    payload.image = {
      link: mediaUrl,
      caption: caption
    };
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  return await response.json();
}
```

## 📋 Kullanım Senaryoları

### 1. Otomatik Yoklama Bildirimleri
```javascript
// Yoklama alındıktan sonra otomatik çalışır
async function processAttendance(trainingId, attendanceData) {
  for (const record of attendanceData) {
    if (record.status === 'absent') {
      await sendAttendanceNotification(record.studentId, trainingId, true);
    }
  }
}
```

### 2. Ödeme Hatırlatmaları
```javascript
// Günlük çalışan cron job
async function dailyPaymentReminders() {
  const overduePayments = await getOverduePayments();
  
  for (const payment of overduePayments) {
    await sendPaymentReminder(
      payment.studentId, 
      payment.amount, 
      payment.dueDate
    );
  }
}
```

### 3. Antrenman Duyuruları
```javascript
// Antrenman oluşturulduğunda
async function notifyTrainingSchedule(trainingId) {
  const training = await getTrainingById(trainingId);
  const students = await getStudentsByTraining(trainingId);
  const parentIds = students.map(s => s.parentId);
  
  const message = `🏃‍♂️ Yeni Antrenman Duyurusu

📅 Tarih: ${training.date}
⏰ Saat: ${training.time}
🏀 Branş: ${training.sportBranch}
📍 Yer: ${training.location}

Antrenmanımıza katılımınızı bekliyoruz!

${getSchoolName()}`;

  await sendBulkMessage(parentIds, message, 'training_announcement');
}
```

## 🔒 Güvenlik ve Gizlilik

### 1. Veri Koruma
- Telefon numaralarını şifreli saklayın
- KVKK uyumluluğu sağlayın
- Mesaj loglarını güvenli tutun

### 2. İzin Yönetimi
```javascript
// Veli izin kontrolü
async function checkParentConsent(parentId, messageType) {
  const parent = await getParentById(parentId);
  return parent.whatsappConsent && 
         parent.consentTypes.includes(messageType);
}

// Mesaj gönderiminden önce izin kontrolü
async function sendMessageWithConsent(parentId, message, messageType) {
  const hasConsent = await checkParentConsent(parentId, messageType);
  
  if (hasConsent) {
    const parent = await getParentById(parentId);
    await sendWhatsAppMessage(parent.phoneNumber, message);
  } else {
    console.log(`İzin yok: ${parentId} - ${messageType}`);
  }
}
```

### 3. Rate Limiting
```javascript
// Mesaj gönderim sınırlaması
const rateLimiter = {
  requests: new Map(),
  
  async checkLimit(phoneNumber) {
    const now = Date.now();
    const requests = this.requests.get(phoneNumber) || [];
    
    // Son 1 dakikadaki istekleri filtrele
    const recentRequests = requests.filter(time => now - time < 60000);
    
    if (recentRequests.length >= 10) { // Dakikada max 10 mesaj
      throw new Error('Rate limit aşıldı');
    }
    
    recentRequests.push(now);
    this.requests.set(phoneNumber, recentRequests);
  }
};
```

## 📊 Raporlama ve İzleme

### 1. Mesaj İstatistikleri
```javascript
// Mesaj başarı oranları
async function getMessageStats(dateRange) {
  const stats = await db.query(`
    SELECT 
      messageType,
      COUNT(*) as total,
      SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as successful,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
    FROM message_logs 
    WHERE sentAt BETWEEN ? AND ?
    GROUP BY messageType
  `, [dateRange.start, dateRange.end]);
  
  return stats;
}
```

### 2. Webhook İzleme
```javascript
// Mesaj durumu güncellemeleri
app.post('/webhook/whatsapp/status', (req, res) => {
  const { entry } = req.body;
  
  entry.forEach(item => {
    const changes = item.changes;
    changes.forEach(change => {
      if (change.field === 'message_status') {
        const statuses = change.value.statuses;
        statuses.forEach(async status => {
          await updateMessageStatus(status.id, status.status);
        });
      }
    });
  });
  
  res.status(200).send('OK');
});
```

## 🚀 Kurulum ve Test

### 1. Test Ortamı Kurulumu
```bash
# Gerekli paketleri yükle
npm install whatsapp-web.js qrcode-terminal

# Test scripti çalıştır
node test-whatsapp.js
```

### 2. Prodüksiyon Dağıtımı
```bash
# PM2 ile servis başlatma
pm2 start whatsapp-service.js --name "whatsapp-service"

# Nginx proxy ayarları
# /etc/nginx/sites-available/sportscrm
server {
    location /webhook/whatsapp {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📞 Destek ve Sorun Giderme

### Yaygın Sorunlar:
1. **Mesaj gönderilmiyor**: Access token ve telefon numarası ID'sini kontrol edin
2. **Webhook çalışmıyor**: SSL sertifikası ve URL doğruluğunu kontrol edin
3. **Rate limit hatası**: Mesaj gönderim sıklığını azaltın
4. **Template onaylanmıyor**: Facebook Business Manager'da template durumunu kontrol edin

### Destek Kaynakları:
- [WhatsApp Business API Dokümantasyonu](https://developers.facebook.com/docs/whatsapp)
- [WhatsApp Web.js GitHub](https://github.com/pedroslopez/whatsapp-web.js)
- [Facebook Business Manager](https://business.facebook.com)

---

Bu rehber, SportsCRM sisteminize WhatsApp entegrasyonu için kapsamlı bir başlangıç noktası sağlar. Özel ihtiyaçlarınıza göre kodu uyarlayabilir ve genişletebilirsiniz.