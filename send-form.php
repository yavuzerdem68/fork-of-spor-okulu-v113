<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Method not allowed']);
    exit();
}

// Email configuration - BURAYA KENDİ BİLGİLERİNİZİ GİRİN
$EMAIL_HOST = 'smtp.gmail.com';
$EMAIL_PORT = 587;
$EMAIL_USERNAME = 'your-email@gmail.com'; // Buraya kendi Gmail adresinizi girin
$EMAIL_PASSWORD = 'your-app-password'; // Buraya Gmail uygulama şifrenizi girin
$EMAIL_FROM_NAME = 'Spor Okulu CRM';
$EMAIL_TO = 'admin@sporokulu.com'; // Buraya formların gönderileceği e-posta adresini girin

try {
    // Get JSON input
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!$data || !isset($data['formData'])) {
        throw new Exception('Form data is required');
    }

    $formData = $data['formData'];

    // Validate required fields
    $requiredFields = ['studentName', 'studentSurname', 'studentTcNo', 'parentName', 'parentSurname', 'parentTcNo', 'parentPhone', 'parentEmail'];
    foreach ($requiredFields as $field) {
        if (empty($formData[$field])) {
            throw new Exception("Required field missing: $field");
        }
    }

    // Calculate age if birth date is provided
    if (!empty($formData['studentBirthDate'])) {
        $birthDate = new DateTime($formData['studentBirthDate']);
        $today = new DateTime();
        $age = $today->diff($birthDate)->y;
        $formData['studentAge'] = $age;
    }

    // Add submission metadata
    $formData['submissionDate'] = date('c');
    $formData['formVersion'] = '1.0';

    // Create JSON file content
    $jsonContent = json_encode($formData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    $fileName = 'sporcu-kayit-' . 
                sanitizeFileName($formData['studentName']) . '-' . 
                sanitizeFileName($formData['studentSurname']) . '-' . 
                date('Y-m-d') . '.json';

    // Prepare email content
    $subject = 'Yeni Sporcu Kayıt Formu - ' . $formData['studentName'] . ' ' . $formData['studentSurname'];
    
    $htmlBody = '
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .info-row { margin: 10px 0; }
            .label { font-weight: bold; color: #555; }
            .value { margin-left: 10px; }
            .section { margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 5px; }
            .section-title { font-size: 18px; font-weight: bold; color: #3b82f6; margin-bottom: 10px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h2>Yeni Sporcu Kayıt Formu</h2>
        </div>
        <div class="content">
            <div class="section">
                <div class="section-title">Öğrenci Bilgileri</div>
                <div class="info-row">
                    <span class="label">Ad Soyad:</span>
                    <span class="value">' . htmlspecialchars($formData['studentName'] . ' ' . $formData['studentSurname']) . '</span>
                </div>
                <div class="info-row">
                    <span class="label">T.C. Kimlik No:</span>
                    <span class="value">' . htmlspecialchars($formData['studentTcNo']) . '</span>
                </div>
                <div class="info-row">
                    <span class="label">Doğum Tarihi:</span>
                    <span class="value">' . htmlspecialchars($formData['studentBirthDate'] ?? 'Belirtilmemiş') . '</span>
                </div>
                <div class="info-row">
                    <span class="label">Cinsiyet:</span>
                    <span class="value">' . htmlspecialchars($formData['studentGender'] ?? 'Belirtilmemiş') . '</span>
                </div>
                <div class="info-row">
                    <span class="label">Seçilen Sporlar:</span>
                    <span class="value">' . htmlspecialchars(implode(', ', $formData['selectedSports'] ?? [])) . '</span>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Veli Bilgileri</div>
                <div class="info-row">
                    <span class="label">Ad Soyad:</span>
                    <span class="value">' . htmlspecialchars($formData['parentName'] . ' ' . $formData['parentSurname']) . '</span>
                </div>
                <div class="info-row">
                    <span class="label">Telefon:</span>
                    <span class="value">' . htmlspecialchars($formData['parentPhone']) . '</span>
                </div>
                <div class="info-row">
                    <span class="label">E-posta:</span>
                    <span class="value">' . htmlspecialchars($formData['parentEmail']) . '</span>
                </div>
                <div class="info-row">
                    <span class="label">Yakınlık:</span>
                    <span class="value">' . htmlspecialchars($formData['parentRelation'] ?? 'Belirtilmemiş') . '</span>
                </div>
            </div>

            <div class="section">
                <div class="section-title">İletişim Bilgileri</div>
                <div class="info-row">
                    <span class="label">Adres:</span>
                    <span class="value">' . htmlspecialchars($formData['address'] ?? 'Belirtilmemiş') . '</span>
                </div>
                <div class="info-row">
                    <span class="label">Şehir:</span>
                    <span class="value">' . htmlspecialchars($formData['city'] ?? 'Belirtilmemiş') . '</span>
                </div>
                <div class="info-row">
                    <span class="label">İlçe:</span>
                    <span class="value">' . htmlspecialchars($formData['district'] ?? 'Belirtilmemiş') . '</span>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Gönderim Bilgileri</div>
                <div class="info-row">
                    <span class="label">Gönderim Tarihi:</span>
                    <span class="value">' . date('d.m.Y H:i:s') . '</span>
                </div>
                <div class="info-row">
                    <span class="label">Form Versiyonu:</span>
                    <span class="value">1.0</span>
                </div>
            </div>

            <hr style="margin: 30px 0;">
            <p><strong>Not:</strong> Detaylı form bilgileri ekteki JSON dosyasında bulunmaktadır.</p>
            <p>Bu dosyayı sistem entegrasyonu sayfasından yükleyerek sporcu kaydını tamamlayabilirsiniz.</p>
        </div>
    </body>
    </html>';

    // Send email using PHPMailer or basic mail function
    if (function_exists('mail') && !empty($EMAIL_TO)) {
        // Create boundary for multipart email
        $boundary = md5(time());
        
        // Headers
        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";
        $headers .= "From: $EMAIL_FROM_NAME <$EMAIL_USERNAME>\r\n";
        $headers .= "Reply-To: $EMAIL_USERNAME\r\n";
        
        // Email body
        $body = "--$boundary\r\n";
        $body .= "Content-Type: text/html; charset=UTF-8\r\n";
        $body .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
        $body .= $htmlBody . "\r\n";
        
        // JSON attachment
        $body .= "--$boundary\r\n";
        $body .= "Content-Type: application/json; name=\"$fileName\"\r\n";
        $body .= "Content-Disposition: attachment; filename=\"$fileName\"\r\n";
        $body .= "Content-Transfer-Encoding: base64\r\n\r\n";
        $body .= chunk_split(base64_encode($jsonContent)) . "\r\n";
        $body .= "--$boundary--";
        
        // Send email
        $mailSent = mail($EMAIL_TO, $subject, $body, $headers);
        
        if (!$mailSent) {
            throw new Exception('E-posta gönderilemedi. Lütfen sunucu ayarlarını kontrol edin.');
        }
    } else {
        throw new Exception('E-posta fonksiyonu bulunamadı veya alıcı adresi belirtilmemiş.');
    }

    // Return success response
    echo json_encode([
        'message' => 'Form başarıyla gönderildi!',
        'fileName' => $fileName,
        'success' => true
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'message' => 'E-posta gönderilirken bir hata oluştu: ' . $e->getMessage(),
        'success' => false
    ]);
}

// Helper function to sanitize file names
function sanitizeFileName($string) {
    // Replace Turkish characters
    $turkish = ['ç', 'ğ', 'ı', 'ö', 'ş', 'ü', 'Ç', 'Ğ', 'I', 'İ', 'Ö', 'Ş', 'Ü'];
    $english = ['c', 'g', 'i', 'o', 's', 'u', 'C', 'G', 'I', 'I', 'O', 'S', 'U'];
    $string = str_replace($turkish, $english, $string);
    
    // Remove special characters
    $string = preg_replace('/[^a-zA-Z0-9\-_]/', '', $string);
    
    return $string;
}
?>