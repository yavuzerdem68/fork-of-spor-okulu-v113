<?php
/**
 * WordPress Sporcu Kayıt Formu
 * Shortcode: [sporcu_kayit_formu]
 */

// WordPress güvenlik kontrolü
if (!defined('ABSPATH')) {
    exit;
}

class SporcuKayitFormu {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_shortcode('sporcu_kayit_formu', array($this, 'render_form'));
        add_action('wp_ajax_sporcu_kayit_submit', array($this, 'handle_form_submission'));
        add_action('wp_ajax_nopriv_sporcu_kayit_submit', array($this, 'handle_form_submission'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
    }
    
    public function init() {
        // Veritabanı tablosu oluştur
        $this->create_database_table();
    }
    
    public function enqueue_scripts() {
        wp_enqueue_script('jquery');
        wp_enqueue_script('sporcu-kayit-js', plugin_dir_url(__FILE__) . 'sporcu-kayit.js', array('jquery'), '1.0', true);
        wp_enqueue_style('sporcu-kayit-css', plugin_dir_url(__FILE__) . 'sporcu-kayit.css', array(), '1.0');
        
        // AJAX için localize
        wp_localize_script('sporcu-kayit-js', 'sporcu_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('sporcu_kayit_nonce')
        ));
    }
    
    private function create_database_table() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sporcu_kayitlari';
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            student_name varchar(100) NOT NULL,
            student_surname varchar(100) NOT NULL,
            student_tc_no varchar(11) NOT NULL,
            student_birth_date date NOT NULL,
            student_gender varchar(10) NOT NULL,
            student_school varchar(200),
            student_class varchar(50),
            license_number varchar(100),
            sports_branches text,
            student_height int,
            student_weight int,
            blood_type varchar(10),
            dominant_hand varchar(20),
            dominant_foot varchar(20),
            sports_position varchar(100),
            parent_name varchar(100) NOT NULL,
            parent_surname varchar(100) NOT NULL,
            parent_tc_no varchar(11) NOT NULL,
            parent_phone varchar(20) NOT NULL,
            parent_email varchar(100) NOT NULL,
            parent_relation varchar(50) NOT NULL,
            parent_occupation varchar(100),
            second_parent_name varchar(100),
            second_parent_surname varchar(100),
            second_parent_phone varchar(20),
            second_parent_email varchar(100),
            second_parent_relation varchar(50),
            address text NOT NULL,
            city varchar(50) NOT NULL,
            district varchar(50) NOT NULL,
            postal_code varchar(10),
            has_health_issues varchar(10) NOT NULL,
            health_issues_detail text,
            medications text,
            allergies text,
            emergency_contact_name varchar(100) NOT NULL,
            emergency_contact_phone varchar(20) NOT NULL,
            emergency_contact_relation varchar(50) NOT NULL,
            special_diet text,
            previous_clubs text,
            achievements text,
            sports_goals text,
            motivation text,
            how_did_you_hear varchar(100),
            previous_sports_experience text,
            expectations text,
            photo_url varchar(500),
            agreement_accepted tinyint(1) NOT NULL DEFAULT 0,
            data_processing_accepted tinyint(1) NOT NULL DEFAULT 0,
            photo_video_permission tinyint(1) NOT NULL DEFAULT 0,
            registration_type varchar(20) NOT NULL DEFAULT 'parent',
            status varchar(20) NOT NULL DEFAULT 'pending',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY student_tc_no (student_tc_no)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    public function render_form($atts) {
        $atts = shortcode_atts(array(
            'title' => 'Spor Okulu Kayıt Formu',
            'show_adult_option' => 'true'
        ), $atts);
        
        ob_start();
        ?>
        
        <div id="sporcu-kayit-container" class="sporcu-kayit-wrapper">
            <!-- Başlık -->
            <div class="form-header">
                <h2 class="form-title"><?php echo esc_html($atts['title']); ?></h2>
                <p class="form-description">
                    Lütfen aşağıdaki formu eksiksiz doldurun. Kayıt işleminiz tamamlandıktan sonra 
                    size bilgilendirme e-postası gönderilecektir.
                </p>
            </div>

            <!-- Başarı Mesajı -->
            <div id="success-message" class="success-message" style="display: none;">
                <div class="success-icon">✅</div>
                <h3>Form Başarıyla Gönderildi!</h3>
                <p>Sporcu kayıt formunuz başarıyla alındı. En kısa sürede size dönüş yapılacaktır.</p>
                <button type="button" class="btn btn-primary" onclick="resetForm()">
                    Yeni Form Doldur
                </button>
            </div>

            <!-- Hata Mesajı -->
            <div id="error-message" class="error-message" style="display: none;">
                <div class="error-icon">❌</div>
                <p id="error-text"></p>
            </div>

            <?php if ($atts['show_adult_option'] === 'true'): ?>
            <!-- Kayıt Türü Seçimi -->
            <div id="registration-type-selection" class="registration-type-selection">
                <h3>Kayıt Türünü Seçin</h3>
                <div class="type-options">
                    <div class="type-option" onclick="selectRegistrationType('parent')">
                        <div class="type-icon">👥</div>
                        <h4>Velisi Olduğum Sporcu</h4>
                        <p>18 yaş altı çocuğunuz için kayıt yapın</p>
                        <ul>
                            <li>Veli bilgileri zorunlu</li>
                            <li>Çocuk için kayıt</li>
                            <li>Sağlık bilgileri</li>
                            <li>Okul bilgileri</li>
                        </ul>
                    </div>
                    <div class="type-option" onclick="selectRegistrationType('adult')">
                        <div class="type-icon">🎓</div>
                        <h4>Yetişkin Kayıt Formu</h4>
                        <p>18 yaş üstü bireysel kayıt</p>
                        <ul>
                            <li>Bireysel kayıt</li>
                            <li>Veli bilgisi gereksiz</li>
                            <li>Kişisel bilgiler</li>
                            <li>Spor geçmişi</li>
                        </ul>
                    </div>
                </div>
            </div>
            <?php endif; ?>

            <!-- Ana Form -->
            <form id="sporcu-kayit-form" class="sporcu-kayit-form" style="<?php echo $atts['show_adult_option'] === 'true' ? 'display: none;' : ''; ?>">
                <?php wp_nonce_field('sporcu_kayit_nonce', 'sporcu_kayit_nonce_field'); ?>
                <input type="hidden" id="registration_type" name="registration_type" value="parent">

                <!-- Kişisel Bilgiler -->
                <div class="form-section">
                    <h3 class="section-title">
                        <span class="section-icon">👤</span>
                        <span id="personal-info-title">Öğrenci Bilgileri</span>
                    </h3>

                    <!-- Fotoğraf Yükleme -->
                    <div class="photo-upload-section">
                        <div class="photo-preview-container">
                            <div id="photo-preview" class="photo-preview">
                                <span class="photo-placeholder">📷</span>
                            </div>
                            <div class="photo-info">
                                <strong>Sporcu Fotoğrafı</strong>
                                <small>Kayıt sırasında fotoğraf ekleyebilirsiniz (Opsiyonel)</small>
                            </div>
                        </div>
                        <div class="photo-buttons">
                            <input type="file" id="photo-input" accept="image/*" style="display: none;">
                            <button type="button" class="btn btn-outline" onclick="document.getElementById('photo-input').click()">
                                📤 Fotoğraf Seç
                            </button>
                            <button type="button" id="remove-photo-btn" class="btn btn-secondary" onclick="removePhoto()" style="display: none;">
                                ❌ Kaldır
                            </button>
                        </div>
                        <small class="photo-note">Desteklenen formatlar: JPG, PNG, GIF (Maksimum 5MB)</small>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="student_name">Ad <span class="required">*</span></label>
                            <input type="text" id="student_name" name="student_name" required>
                        </div>
                        <div class="form-group">
                            <label for="student_surname">Soyad <span class="required">*</span></label>
                            <input type="text" id="student_surname" name="student_surname" required>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="student_tc_no">T.C. Kimlik No <span class="required">*</span></label>
                            <input type="text" id="student_tc_no" name="student_tc_no" maxlength="11" placeholder="11 haneli TC kimlik numarası" required>
                            <div id="student-tc-error" class="error-text" style="display: none;"></div>
                        </div>
                        <div class="form-group">
                            <label for="student_birth_date">Doğum Tarihi <span class="required">*</span></label>
                            <input type="date" id="student_birth_date" name="student_birth_date" required>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Cinsiyet <span class="required">*</span></label>
                            <div class="radio-group">
                                <label class="radio-label">
                                    <input type="radio" name="student_gender" value="erkek" required>
                                    <span>Erkek</span>
                                </label>
                                <label class="radio-label" id="female-option">
                                    <input type="radio" name="student_gender" value="kız" required>
                                    <span>Kız</span>
                                </label>
                            </div>
                        </div>
                        <div class="form-group" id="student-class-group">
                            <label for="student_class">Sınıf</label>
                            <input type="text" id="student_class" name="student_class" placeholder="Örn: 5. Sınıf">
                        </div>
                        <div class="form-group" id="occupation-group" style="display: none;">
                            <label for="parent_occupation">Meslek</label>
                            <input type="text" id="parent_occupation" name="parent_occupation" placeholder="Meslek bilgisi">
                        </div>
                    </div>

                    <div class="form-group" id="student-school-group">
                        <label for="student_school">Okul</label>
                        <input type="text" id="student_school" name="student_school" placeholder="Öğrencinin devam ettiği okul">
                    </div>

                    <div class="form-group">
                        <label for="license_number">Lisans Numarası</label>
                        <input type="text" id="license_number" name="license_number" placeholder="Sporcu lisans numarası (opsiyonel)">
                    </div>

                    <!-- Spor Branşları -->
                    <div class="form-group">
                        <label>Katılmak İstediği Spor Branşları <span class="required">*</span> (Birden fazla seçebilirsiniz)</label>
                        <div id="selected-sports" class="selected-sports"></div>
                        <div class="sports-grid">
                            <?php
                            $sports = array(
                                "Basketbol", "Hentbol", "Yüzme", "Akıl ve Zeka Oyunları", "Satranç", "Futbol", "Voleybol",
                                "Tenis", "Badminton", "Masa Tenisi", "Atletizm", "Jimnastik", "Karate", "Taekwondo",
                                "Judo", "Boks", "Güreş", "Halter", "Bisiklet", "Kayak", "Buz Pateni", "Eskrim", "Hareket Eğitimi"
                            );
                            foreach ($sports as $sport): ?>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="sports_branches[]" value="<?php echo esc_attr($sport); ?>">
                                    <span><?php echo esc_html($sport); ?></span>
                                </label>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </div>

                <!-- Fiziksel Bilgiler -->
                <div class="form-section">
                    <h3 class="section-title">
                        <span class="section-icon">❤️</span>
                        Fiziksel Bilgiler
                    </h3>

                    <div class="form-row form-row-3">
                        <div class="form-group">
                            <label for="student_height">Boy (cm)</label>
                            <input type="number" id="student_height" name="student_height" placeholder="170">
                        </div>
                        <div class="form-group">
                            <label for="student_weight">Kilo (kg)</label>
                            <input type="number" id="student_weight" name="student_weight" placeholder="65">
                        </div>
                        <div class="form-group">
                            <label for="blood_type">Kan Grubu</label>
                            <select id="blood_type" name="blood_type">
                                <option value="">Kan grubu seçin</option>
                                <option value="A+">A Rh+</option>
                                <option value="A-">A Rh-</option>
                                <option value="B+">B Rh+</option>
                                <option value="B-">B Rh-</option>
                                <option value="AB+">AB Rh+</option>
                                <option value="AB-">AB Rh-</option>
                                <option value="0+">0 Rh+</option>
                                <option value="0-">0 Rh-</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-row form-row-3">
                        <div class="form-group">
                            <label for="dominant_hand">Dominant El</label>
                            <select id="dominant_hand" name="dominant_hand">
                                <option value="">Seçiniz</option>
                                <option value="sag">Sağ</option>
                                <option value="sol">Sol</option>
                                <option value="her-ikisi">Her İkisi</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="dominant_foot">Dominant Ayak</label>
                            <select id="dominant_foot" name="dominant_foot">
                                <option value="">Seçiniz</option>
                                <option value="sag">Sağ</option>
                                <option value="sol">Sol</option>
                                <option value="her-ikisi">Her İkisi</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="sports_position">Tercih Edilen Pozisyon</label>
                            <input type="text" id="sports_position" name="sports_position" placeholder="Örn: Kaleci, Forvet, Guard">
                        </div>
                    </div>
                </div>

                <!-- Veli Bilgileri (Sadece çocuk kayıt için) -->
                <div id="parent-info-section" class="form-section">
                    <h3 class="section-title">
                        <span class="section-icon">👥</span>
                        Veli Bilgileri
                    </h3>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="parent_name">Veli Adı <span class="required">*</span></label>
                            <input type="text" id="parent_name" name="parent_name" required>
                        </div>
                        <div class="form-group">
                            <label for="parent_surname">Veli Soyadı <span class="required">*</span></label>
                            <input type="text" id="parent_surname" name="parent_surname" required>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="parent_tc_no">Veli T.C. Kimlik No <span class="required">*</span></label>
                            <input type="text" id="parent_tc_no" name="parent_tc_no" maxlength="11" placeholder="11 haneli TC kimlik numarası" required>
                            <div id="parent-tc-error" class="error-text" style="display: none;"></div>
                        </div>
                        <div class="form-group">
                            <label for="parent_relation">Yakınlık Derecesi <span class="required">*</span></label>
                            <select id="parent_relation" name="parent_relation" required>
                                <option value="">Seçiniz</option>
                                <option value="anne">Anne</option>
                                <option value="baba">Baba</option>
                                <option value="vasi">Vasi</option>
                                <option value="büyükanne">Büyükanne</option>
                                <option value="büyükbaba">Büyükbaba</option>
                                <option value="diğer">Diğer</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-row form-row-3" id="parent-contact-row">
                        <div class="form-group">
                            <label for="parent_phone">Telefon Numarası <span class="required">*</span></label>
                            <input type="tel" id="parent_phone" name="parent_phone" placeholder="0555 123 45 67" required>
                        </div>
                        <div class="form-group">
                            <label for="parent_email">Email Adresi <span class="required">*</span></label>
                            <input type="email" id="parent_email" name="parent_email" placeholder="veli@example.com" required>
                        </div>
                        <div class="form-group" id="parent-occupation-group">
                            <label for="parent_occupation_field">Meslek</label>
                            <input type="text" id="parent_occupation_field" name="parent_occupation" placeholder="Meslek bilgisi">
                        </div>
                    </div>

                    <!-- İkinci Veli Bilgileri -->
                    <div class="second-parent-section">
                        <h4>İkinci Veli Bilgileri (Opsiyonel)</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="second_parent_name">İkinci Veli Adı</label>
                                <input type="text" id="second_parent_name" name="second_parent_name">
                            </div>
                            <div class="form-group">
                                <label for="second_parent_surname">İkinci Veli Soyadı</label>
                                <input type="text" id="second_parent_surname" name="second_parent_surname">
                            </div>
                        </div>

                        <div class="form-row form-row-3">
                            <div class="form-group">
                                <label for="second_parent_phone">Telefon Numarası</label>
                                <input type="tel" id="second_parent_phone" name="second_parent_phone" placeholder="0555 123 45 67">
                            </div>
                            <div class="form-group">
                                <label for="second_parent_email">Email Adresi</label>
                                <input type="email" id="second_parent_email" name="second_parent_email" placeholder="veli2@example.com">
                            </div>
                            <div class="form-group">
                                <label for="second_parent_relation">Yakınlık Derecesi</label>
                                <select id="second_parent_relation" name="second_parent_relation">
                                    <option value="">Seçiniz</option>
                                    <option value="anne">Anne</option>
                                    <option value="baba">Baba</option>
                                    <option value="vasi">Vasi</option>
                                    <option value="büyükanne">Büyükanne</option>
                                    <option value="büyükbaba">Büyükbaba</option>
                                    <option value="diğer">Diğer</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- İletişim Bilgileri -->
                <div class="form-section">
                    <h3 class="section-title">
                        <span class="section-icon">📍</span>
                        İletişim Bilgileri
                    </h3>

                    <div class="form-group">
                        <label for="address">Adres <span class="required">*</span></label>
                        <textarea id="address" name="address" placeholder="Tam adres bilgisi" required></textarea>
                    </div>

                    <div class="form-row form-row-3">
                        <div class="form-group">
                            <label for="city">İl <span class="required">*</span></label>
                            <select id="city" name="city" required>
                                <option value="">İl seçiniz</option>
                                <?php
                                $cities = array(
                                    "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin",
                                    "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale",
                                    "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum",
                                    "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta", "Mersin",
                                    "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir", "Kocaeli",
                                    "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş",
                                    "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas",
                                    "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak"
                                );
                                foreach ($cities as $city): ?>
                                    <option value="<?php echo esc_attr($city); ?>"><?php echo esc_html($city); ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="district">İlçe <span class="required">*</span></label>
                            <input type="text" id="district" name="district" placeholder="İlçe" required>
                        </div>
                        <div class="form-group">
                            <label for="postal_code">Posta Kodu</label>
                            <input type="text" id="postal_code" name="postal_code" placeholder="34000">
                        </div>
                    </div>
                </div>

                <!-- Sağlık Bilgileri -->
                <div class="form-section">
                    <h3 class="section-title">
                        <span class="section-icon">❤️</span>
                        Sağlık Bilgileri
                    </h3>

                    <div class="form-group">
                        <label>Kronik hastalık veya sağlık sorunu var mı? <span class="required">*</span></label>
                        <div class="radio-group">
                            <label class="radio-label">
                                <input type="radio" name="has_health_issues" value="evet" required onchange="toggleHealthDetails()">
                                <span>Evet</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="has_health_issues" value="hayır" required onchange="toggleHealthDetails()">
                                <span>Hayır</span>
                            </label>
                        </div>
                    </div>

                    <div id="health-details" class="form-group" style="display: none;">
                        <label for="health_issues_detail">Sağlık sorunu detayı</label>
                        <textarea id="health_issues_detail" name="health_issues_detail" placeholder="Lütfen detayları belirtin"></textarea>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="medications">Kullandığı İlaçlar</label>
                            <textarea id="medications" name="medications" placeholder="Varsa kullandığı ilaçları belirtin"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="allergies">Alerjiler</label>
                            <textarea id="allergies" name="allergies" placeholder="Bilinen alerjileri belirtin"></textarea>
                        </div>
                    </div>

                    <div class="form-row form-row-3">
                        <div class="form-group">
                            <label for="emergency_contact_name">Acil Durum İletişim Kişisi <span class="required">*</span></label>
                            <input type="text" id="emergency_contact_name" name="emergency_contact_name" placeholder="Ad Soyad" required>
                        </div>
                        <div class="form-group">
                            <label for="emergency_contact_phone">Acil Durum Telefonu <span class="required">*</span></label>
                            <input type="tel" id="emergency_contact_phone" name="emergency_contact_phone" placeholder="0555 123 45 67" required>
                        </div>
                        <div class="form-group">
                            <label for="emergency_contact_relation">Yakınlık Derecesi <span class="required">*</span></label>
                            <input type="text" id="emergency_contact_relation" name="emergency_contact_relation" placeholder="Anne, Baba, vb." required>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="special_diet">Özel Diyet İhtiyacı</label>
                        <textarea id="special_diet" name="special_diet" placeholder="Varsa özel diyet ihtiyaçlarını belirtin"></textarea>
                    </div>
                </div>

                <!-- Sporcu Geçmişi -->
                <div class="form-section">
                    <h3 class="section-title">
                        <span class="section-icon">🏆</span>
                        Sporcu Geçmişi ve Hedefler
                    </h3>

                    <div class="form-group">
                        <label for="previous_sports_experience">Daha Önce Spor Deneyimi Var mı?</label>
                        <textarea id="previous_sports_experience" name="previous_sports_experience" placeholder="Daha önce yaptığı sporlar, süre, seviye vb."></textarea>
                    </div>

                    <div class="form-group">
                        <label for="previous_clubs">Daha Önce Üye Olduğu Kulüpler</label>
                        <textarea id="previous_clubs" name="previous_clubs" placeholder="Varsa daha önce üye olduğu kulüpler"></textarea>
                    </div>

                    <div class="form-group">
                        <label for="achievements">Başarılar ve Ödüller</label>
                        <textarea id="achievements" name="achievements" placeholder="Varsa sporda elde ettiği başarılar"></textarea>
                    </div>

                    <div class="form-group">
                        <label for="sports_goals">Spordaki Hedefleri</label>
                        <textarea id="sports_goals" name="sports_goals" placeholder="Sporda ulaşmak istediği hedefler"></textarea>
                    </div>
                </div>

                <!-- Diğer Bilgiler -->
                <div class="form-section">
                    <h3 class="section-title">Diğer Bilgiler</h3>

                    <div class="form-group">
                        <label for="how_did_you_hear">Spor okulunu nasıl duydunuz?</label>
                        <select id="how_did_you_hear" name="how_did_you_hear">
                            <option value="">Seçiniz</option>
                            <option value="internet">İnternet</option>
                            <option value="sosyal-medya">Sosyal Medya</option>
                            <option value="arkadas-tavsiye">Arkadaş Tavsiyesi</option>
                            <option value="gazete-dergi">Gazete/Dergi</option>
                            <option value="okul">Okul</option>
                            <option value="diğer">Diğer</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="expectations">Spor okulundan beklentileriniz</label>
                        <textarea id="expectations" name="expectations" placeholder="Spor okulundan beklentilerinizi belirtin"></textarea>
                    </div>
                </div>

                <!-- Onaylar -->
                <div class="form-section">
                    <h3 class="section-title">Onaylar</h3>

                    <div class="form-group">
                        <label class="checkbox-label checkbox-required">
                            <input type="checkbox" name="agreement_accepted" value="1" required>
                            <span>Spor okulu kurallarını ve şartlarını okudum, kabul ediyorum. <span class="required">*</span></span>
                        </label>
                    </div>

                    <div class="form-group">
                        <label class="checkbox-label checkbox-required">
                            <input type="checkbox" name="data_processing_accepted" value="1" required>
                            <span>Kişisel verilerimin işlenmesine ve KVKK kapsamında kullanılmasına onay veriyorum. <span class="required">*</span></span>
                        </label>
                    </div>

                    <div class="form-group">
                        <label class="checkbox-label" id="photo-permission-label">
                            <input type="checkbox" name="photo_video_permission" value="1">
                            <span>Çocuğumun antrenman ve etkinliklerde çekilen fotoğraf/videolarının paylaşılmasına izin veriyorum.</span>
                        </label>
                    </div>
                </div>

                <!-- Gönder Butonu -->
                <div class="form-submit">
                    <button type="button" id="back-btn" class="btn btn-outline" onclick="goBackToSelection()" style="display: none;">
                        ← Geri Dön
                    </button>
                    <button type="submit" id="submit-btn" class="btn btn-primary btn-large">
                        <span id="submit-text">📨 Formu Gönder</span>
                    </button>
                </div>
            </form>
        </div>

        <style>
        .sporcu-kayit-wrapper {
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
        }

        .form-header {
            text-align: center;
            margin-bottom: 30px;
            padding: 30px;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
            border-radius: 12px;
        }

        .form-title {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
        }

        .form-description {
            color: #6b7280;
            font-size: 16px;
            margin: 0;
        }

        .registration-type-selection {
            margin-bottom: 30px;
            text-align: center;
        }

        .registration-type-selection h3 {
            margin-bottom: 20px;
            color: #1f2937;
        }

        .type-options {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 20px;
        }

        @media (max-width: 768px) {
            .type-options {
                grid-template-columns: 1fr;
            }
        }

        .type-option {
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 30px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: center;
        }

        .type-option:hover {
            border-color: #3b82f6;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }

        .type-icon {
            font-size: 48px;
            margin-bottom: 15px;
        }

        .type-option h4 {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 10px;
            color: #1f2937;
        }

        .type-option p {
            color: #6b7280;
            margin-bottom: 15px;
        }

        .type-option ul {
            list-style: none;
            padding: 0;
            margin: 0;
            text-align: left;
        }

        .type-option li {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 5px;
            padding-left: 15px;
            position: relative;
        }

        .type-option li:before {
            content: "•";
            color: #3b82f6;
            position: absolute;
            left: 0;
        }

        .form-section {
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            margin-bottom: 24px;
            padding: 30px;
        }

        .section-title {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #f3f4f6;
        }

        .section-icon {
            font-size: 24px;
        }

        .form-row {
            display: grid;
            gap: 20px;
            margin-bottom: 20px;
        }

        .form-row {
            grid-template-columns: 1fr 1fr;
        }

        .form-row-3 {
            grid-template-columns: 1fr 1fr 1fr;
        }

        @media (max-width: 768px) {
            .form-row,
            .form-row-3 {
                grid-template-columns: 1fr;
            }
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            font-weight: 500;
            color: #374151;
            margin-bottom: 6px;
        }

        .required {
            color: #ef4444;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            transition: border-color 0.2s;
            box-sizing: border-box;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-group textarea {
            resize: vertical;
            min-height: 80px;
        }

        .radio-group {
            display: flex;
            gap: 20px;
            margin-top: 8px;
        }

        .radio-label {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
        }

        .checkbox-label {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            cursor: pointer;
            margin-bottom: 15px;
        }

        .checkbox-label input[type="checkbox"] {
            width: auto;
            margin: 0;
        }

        .checkbox-required {
            padding: 15px;
            background: #f9fafb;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
        }

        .sports-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
            margin-top: 10px;
        }

        .selected-sports {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin: 10px 0;
        }

        .sport-badge {
            background: #3b82f6;
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .sport-badge .remove {
            cursor: pointer;
            font-weight: bold;
            padding: 0 4px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
        }

        .photo-upload-section {
            border: 2px dashed #d1d5db;
            border-radius: 8px;
            padding: 30px;
            text-align: center;
            margin-bottom: 20px;
            background: #f9fafb;
        }

        .photo-preview-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 20px;
        }

        .photo-preview {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            border: 2px solid #e5e7eb;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 15px;
            overflow: hidden;
            background: white;
        }

        .photo-preview img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .photo-placeholder {
            font-size: 36px;
            color: #9ca3af;
        }

        .photo-info {
            text-align: center;
        }

        .photo-info strong {
            display: block;
            margin-bottom: 5px;
        }

        .photo-info small {
            color: #6b7280;
        }

        .photo-buttons {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-bottom: 10px;
        }

        .photo-note {
            color: #6b7280;
            font-size: 12px;
        }

        .second-parent-section {
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
            margin-top: 20px;
        }

        .second-parent-section h4 {
            margin-bottom: 15px;
            color: #374151;
        }

        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            text-decoration: none;
        }

        .btn-primary {
            background: #3b82f6;
            color: white;
        }

        .btn-primary:hover {
            background: #2563eb;
        }

        .btn-primary:disabled {
            background: #9ca3af;
            cursor: not-allowed;
        }

        .btn-secondary {
            background: #6b7280;
            color: white;
        }

        .btn-secondary:hover {
            background: #4b5563;
        }

        .btn-outline {
            background: transparent;
            border: 1px solid #d1d5db;
            color: #374151;
        }

        .btn-outline:hover {
            background: #f9fafb;
        }

        .btn-large {
            padding: 16px 32px;
            font-size: 16px;
            min-width: 200px;
            justify-content: center;
        }

        .form-submit {
            text-align: center;
            margin-top: 30px;
            display: flex;
            gap: 15px;
            justify-content: center;
            align-items: center;
        }

        .success-message,
        .error-message {
            text-align: center;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 20px;
        }

        .success-message {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            color: #16a34a;
        }

        .error-message {
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
        }

        .success-icon,
        .error-icon {
            font-size: 48px;
            margin-bottom: 15px;
        }

        .success-message h3 {
            color: #16a34a;
            margin-bottom: 15px;
        }

        .error-text {
            color: #dc2626;
            font-size: 12px;
            margin-top: 4px;
        }

        .border-error {
            border-color: #dc2626 !important;
        }

        .loading {
            opacity: 0.6;
            pointer-events: none;
        }

        @media (max-width: 768px) {
            .sporcu-kayit-wrapper {
                padding: 10px;
            }
            
            .form-section {
                padding: 20px;
            }
            
            .form-submit {
                flex-direction: column;
            }
            
            .btn-large {
                width: 100%;
            }
        }
        </style>

        <script>
        let selectedSports = [];
        let selectedPhoto = null;
        let registrationType = 'parent';

        // Form başlatma
        jQuery(document).ready(function($) {
            setupTCValidation();
            setupPhotoUpload();
            setupSportsSelection();
            setupFormSubmission();
        });

        // Kayıt türü seçimi
        function selectRegistrationType(type) {
            registrationType = type;
            document.getElementById('registration_type').value = type;
            
            // UI güncellemeleri
            if (type === 'adult') {
                // Yetişkin formu için ayarlamalar
                document.getElementById('personal-info-title').textContent = 'Kişisel Bilgiler';
                document.getElementById('parent-info-section').style.display = 'none';
                document.getElementById('student-class-group').style.display = 'none';
                document.getElementById('student-school-group').style.display = 'none';
                document.getElementById('occupation-group').style.display = 'block';
                document.getElementById('female-option').innerHTML = '<input type="radio" name="student_gender" value="kadın" required><span>Kadın</span>';
                document.getElementById('photo-permission-label').innerHTML = '<input type="checkbox" name="photo_video_permission" value="1"><span>Antrenman ve etkinliklerde çekilen fotoğraf/videolarımın paylaşılmasına izin veriyorum.</span>';
                
                // Zorunlu alanları kaldır
                document.getElementById('parent_name').required = false;
                document.getElementById('parent_surname').required = false;
                document.getElementById('parent_tc_no').required = false;
                document.getElementById('parent_phone').required = false;
                document.getElementById('parent_email').required = false;
                document.getElementById('parent_relation').required = false;
            } else {
                // Çocuk formu için ayarlamalar
                document.getElementById('personal-info-title').textContent = 'Öğrenci Bilgileri';
                document.getElementById('parent-info-section').style.display = 'block';
                document.getElementById('student-class-group').style.display = 'block';
                document.getElementById('student-school-group').style.display = 'block';
                document.getElementById('occupation-group').style.display = 'none';
                document.getElementById('female-option').innerHTML = '<input type="radio" name="student_gender" value="kız" required><span>Kız</span>';
                document.getElementById('photo-permission-label').innerHTML = '<input type="checkbox" name="photo_video_permission" value="1"><span>Çocuğumun antrenman ve etkinliklerde çekilen fotoğraf/videolarının paylaşılmasına izin veriyorum.</span>';
                
                // Zorunlu alanları ekle
                document.getElementById('parent_name').required = true;
                document.getElementById('parent_surname').required = true;
                document.getElementById('parent_tc_no').required = true;
                document.getElementById('parent_phone').required = true;
                document.getElementById('parent_email').required = true;
                document.getElementById('parent_relation').required = true;
            }
            
            // Form göster, seçim gizle
            document.getElementById('registration-type-selection').style.display = 'none';
            document.getElementById('sporcu-kayit-form').style.display = 'block';
            document.getElementById('back-btn').style.display = 'inline-flex';
        }

        // Seçime geri dön
        function goBackToSelection() {
            document.getElementById('registration-type-selection').style.display = 'block';
            document.getElementById('sporcu-kayit-form').style.display = 'none';
            document.getElementById('back-btn').style.display = 'none';
        }

        // TC Kimlik No doğrulama
        function validateTCKimlikNo(tcNo) {
            if (!tcNo || tcNo.length !== 11) {
                return { isValid: false, error: "TC Kimlik No 11 haneli olmalıdır" };
            }

            if (!/^\d+$/.test(tcNo)) {
                return { isValid: false, error: "TC Kimlik No sadece rakam içermelidir" };
            }

            if (tcNo[0] === '0') {
                return { isValid: false, error: "TC Kimlik No 0 ile başlayamaz" };
            }

            // TC Kimlik No algoritması
            const digits = tcNo.split('').map(Number);
            const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
            const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
            
            const check1 = (oddSum * 7 - evenSum) % 10;
            const check2 = (oddSum + evenSum + digits[9]) % 10;

            if (check1 !== digits[9] || check2 !== digits[10]) {
                return { isValid: false, error: "Geçersiz TC Kimlik No" };
            }

            return { isValid: true };
        }

        // TC doğrulama kurulumu
        function setupTCValidation() {
            const studentTcInput = document.getElementById('student_tc_no');
            const parentTcInput = document.getElementById('parent_tc_no');

            studentTcInput.addEventListener('input', function() {
                this.value = this.value.replace(/\D/g, '').slice(0, 11);
                validateTCField('student_tc_no', 'student-tc-error');
            });

            parentTcInput.addEventListener('input', function() {
                this.value = this.value.replace(/\D/g, '').slice(0, 11);
                validateTCField('parent_tc_no', 'parent-tc-error');
            });
        }

        // TC alan doğrulama
        function validateTCField(fieldId, errorId) {
            const field = document.getElementById(fieldId);
            const errorDiv = document.getElementById(errorId);
            const validation = validateTCKimlikNo(field.value);

            if (field.value && !validation.isValid) {
                field.classList.add('border-error');
                errorDiv.textContent = validation.error;
                errorDiv.style.display = 'block';
            } else {
                field.classList.remove('border-error');
                errorDiv.style.display = 'none';
            }
        }

        // Fotoğraf yükleme kurulumu
        function setupPhotoUpload() {
            const photoInput = document.getElementById('photo-input');
            photoInput.addEventListener('change', handlePhotoUpload);
        }

        // Fotoğraf yükleme işlemi
        function handlePhotoUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            // Dosya boyutu kontrolü (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showError("Fotoğraf boyutu 5MB'dan küçük olmalıdır");
                return;
            }

            // Dosya türü kontrolü
            if (!file.type.startsWith('image/')) {
                showError("Lütfen geçerli bir resim dosyası seçin");
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                selectedPhoto = e.target.result;
                const preview = document.getElementById('photo-preview');
                preview.innerHTML = '<img src="' + selectedPhoto + '" alt="Sporcu Fotoğrafı">';
                document.getElementById('remove-photo-btn').style.display = 'inline-flex';
            };
            reader.readAsDataURL(file);
        }

        // Fotoğraf kaldırma
        function removePhoto() {
            selectedPhoto = null;
            document.getElementById('photo-input').value = '';
            document.getElementById('photo-preview').innerHTML = '<span class="photo-placeholder">📷</span>';
            document.getElementById('remove-photo-btn').style.display = 'none';
        }

        // Spor seçimi kurulumu
        function setupSportsSelection() {
            const checkboxes = document.querySelectorAll('input[name="sports_branches[]"]');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    handleSportSelection(this.value, this.checked);
                });
            });
        }

        // Spor seçimi işlemi
        function handleSportSelection(sport, checked) {
            if (checked) {
                if (!selectedSports.includes(sport)) {
                    selectedSports.push(sport);
                }
            } else {
                selectedSports = selectedSports.filter(s => s !== sport);
            }
            updateSelectedSportsDisplay();
        }

        // Seçili sporları göster
        function updateSelectedSportsDisplay() {
            const container = document.getElementById('selected-sports');
            container.innerHTML = '';
            
            selectedSports.forEach(sport => {
                const badge = document.createElement('div');
                badge.className = 'sport-badge';
                badge.innerHTML = sport + ' <span class="remove" onclick="removeSport(\'' + sport + '\')">×</span>';
                container.appendChild(badge);
            });
        }

        // Spor kaldırma
        function removeSport(sport) {
            selectedSports = selectedSports.filter(s => s !== sport);
            const checkbox = document.querySelector('input[value="' + sport + '"]');
            if (checkbox) checkbox.checked = false;
            updateSelectedSportsDisplay();
        }

        // Sağlık detayları göster/gizle
        function toggleHealthDetails() {
            const healthDetails = document.getElementById('health-details');
            const hasHealthIssues = document.querySelector('input[name="has_health_issues"]:checked');
            
            if (hasHealthIssues && hasHealthIssues.value === 'evet') {
                healthDetails.style.display = 'block';
            } else {
                healthDetails.style.display = 'none';
            }
        }

        // Hata göster
        function showError(message) {
            const errorDiv = document.getElementById('error-message');
            const errorText = document.getElementById('error-text');
            errorText.textContent = message;
            errorDiv.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Hata gizle
        function hideError() {
            document.getElementById('error-message').style.display = 'none';
        }

        // Başarı göster
        function showSuccess() {
            document.getElementById('sporcu-kayit-form').style.display = 'none';
            document.getElementById('success-message').style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Form sıfırla
        function resetForm() {
            document.getElementById('sporcu-kayit-form').reset();
            selectedSports = [];
            selectedPhoto = null;
            updateSelectedSportsDisplay();
            removePhoto();
            hideError();
            
            document.getElementById('success-message').style.display = 'none';
            document.getElementById('registration-type-selection').style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Form gönderimi kurulumu
        function setupFormSubmission() {
            const form = document.getElementById('sporcu-kayit-form');
            form.addEventListener('submit', handleFormSubmit);
        }

        // Form gönderimi
        function handleFormSubmit(event) {
            event.preventDefault();
            hideError();

            // TC doğrulama
            const studentTcValidation = validateTCKimlikNo(document.getElementById('student_tc_no').value);
            if (!studentTcValidation.isValid) {
                showError("Öğrenci TC Kimlik numarası geçersiz: " + studentTcValidation.error);
                return;
            }

            if (registrationType === 'parent') {
                const parentTcValidation = validateTCKimlikNo(document.getElementById('parent_tc_no').value);
                if (!parentTcValidation.isValid) {
                    showError("Veli TC Kimlik numarası geçersiz: " + parentTcValidation.error);
                    return;
                }
            }

            // Spor seçimi kontrolü
            if (selectedSports.length === 0) {
                showError("Lütfen en az bir spor branşı seçin");
                return;
            }

            // Loading durumu
            const submitBtn = document.getElementById('submit-btn');
            const submitText = document.getElementById('submit-text');
            const originalText = submitText.textContent;
            
            submitBtn.disabled = true;
            submitText.textContent = '📤 Form Gönderiliyor...';
            document.getElementById('sporcu-kayit-form').classList.add('loading');

            // Form verilerini topla
            const formData = new FormData(document.getElementById('sporcu-kayit-form'));
            formData.append('action', 'sporcu_kayit_submit');
            formData.append('selected_sports', JSON.stringify(selectedSports));
            if (selectedPhoto) {
                formData.append('photo_data', selectedPhoto);
            }

            // AJAX ile gönder
            jQuery.ajax({
                url: sporcu_ajax.ajax_url,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(response) {
                    if (response.success) {
                        showSuccess();
                    } else {
                        showError(response.data || 'Form gönderilirken bir hata oluştu');
                    }
                },
                error: function() {
                    showError('Form gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
                },
                complete: function() {
                    // Loading durumunu kaldır
                    submitBtn.disabled = false;
                    submitText.textContent = originalText;
                    document.getElementById('sporcu-kayit-form').classList.remove('loading');
                }
            });
        }
        </script>

        <?php
        return ob_get_clean();
    }
    
    public function handle_form_submission() {
        // Nonce kontrolü
        if (!wp_verify_nonce($_POST['sporcu_kayit_nonce_field'], 'sporcu_kayit_nonce')) {
            wp_die('Güvenlik kontrolü başarısız');
        }
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'sporcu_kayitlari';
        
        // Form verilerini al ve temizle
        $data = array();
        $fields = array(
            'student_name', 'student_surname', 'student_tc_no', 'student_birth_date', 'student_gender',
            'student_school', 'student_class', 'license_number', 'student_height', 'student_weight',
            'blood_type', 'dominant_hand', 'dominant_foot', 'sports_position', 'parent_name',
            'parent_surname', 'parent_tc_no', 'parent_phone', 'parent_email', 'parent_relation',
            'parent_occupation', 'second_parent_name', 'second_parent_surname', 'second_parent_phone',
            'second_parent_email', 'second_parent_relation', 'address', 'city', 'district',
            'postal_code', 'has_health_issues', 'health_issues_detail', 'medications', 'allergies',
            'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation',
            'special_diet', 'previous_clubs', 'achievements', 'sports_goals', 'motivation',
            'how_did_you_hear', 'previous_sports_experience', 'expectations', 'registration_type'
        );
        
        foreach ($fields as $field) {
            $data[$field] = sanitize_text_field($_POST[$field] ?? '');
        }
        
        // Spor branşları
        $selected_sports = json_decode(stripslashes($_POST['selected_sports'] ?? '[]'), true);
        $data['sports_branches'] = implode(',', array_map('sanitize_text_field', $selected_sports));
        
        // Onaylar
        $data['agreement_accepted'] = isset($_POST['agreement_accepted']) ? 1 : 0;
        $data['data_processing_accepted'] = isset($_POST['data_processing_accepted']) ? 1 : 0;
        $data['photo_video_permission'] = isset($_POST['photo_video_permission']) ? 1 : 0;
        
        // Fotoğraf işleme
        if (!empty($_POST['photo_data'])) {
            $photo_url = $this->save_photo($_POST['photo_data'], $data['student_tc_no']);
            $data['photo_url'] = $photo_url;
        }
        
        // Veritabanına kaydet
        $result = $wpdb->insert($table_name, $data);
        
        if ($result === false) {
            wp_send_json_error('Kayıt sırasında bir hata oluştu');
        }
        
        // E-posta gönder
        $this->send_notification_email($data);
        
        wp_send_json_success('Form başarıyla gönderildi');
    }
    
    private function save_photo($photo_data, $tc_no) {
        // Base64 fotoğrafı dosyaya kaydet
        $upload_dir = wp_upload_dir();
        $photo_dir = $upload_dir['basedir'] . '/sporcu-fotograflari/';
        
        if (!file_exists($photo_dir)) {
            wp_mkdir_p($photo_dir);
        }
        
        // Base64 verisini decode et
        $photo_data = str_replace('data:image/jpeg;base64,', '', $photo_data);
        $photo_data = str_replace('data:image/png;base64,', '', $photo_data);
        $photo_data = str_replace(' ', '+', $photo_data);
        $decoded_photo = base64_decode($photo_data);
        
        // Dosya adı oluştur
        $filename = 'sporcu-' . $tc_no . '-' . time() . '.jpg';
        $file_path = $photo_dir . $filename;
        
        // Dosyayı kaydet
        file_put_contents($file_path, $decoded_photo);
        
        // URL döndür
        return $upload_dir['baseurl'] . '/sporcu-fotograflari/' . $filename;
    }
    
    private function send_notification_email($data) {
        $to = get_option('admin_email');
        $subject = 'Yeni Sporcu Kayıt Formu - ' . $data['student_name'] . ' ' . $data['student_surname'];
        
        $message = "Yeni bir sporcu kayıt formu alındı:\n\n";
        $message .= "Öğrenci Adı: " . $data['student_name'] . " " . $data['student_surname'] . "\n";
        $message .= "TC Kimlik No: " . $data['student_tc_no'] . "\n";
        $message .= "Doğum Tarihi: " . $data['student_birth_date'] . "\n";
        $message .= "Cinsiyet: " . $data['student_gender'] . "\n";
        $message .= "Spor Branşları: " . $data['sports_branches'] . "\n";
        
        if ($data['registration_type'] === 'parent') {
            $message .= "\nVeli Bilgileri:\n";
            $message .= "Veli Adı: " . $data['parent_name'] . " " . $data['parent_surname'] . "\n";
            $message .= "Telefon: " . $data['parent_phone'] . "\n";
            $message .= "Email: " . $data['parent_email'] . "\n";
        }
        
        $message .= "\nAdres: " . $data['address'] . ", " . $data['district'] . "/" . $data['city'] . "\n";
        $message .= "Acil Durum İletişim: " . $data['emergency_contact_name'] . " - " . $data['emergency_contact_phone'] . "\n";
        
        $message .= "\nForm WordPress admin panelinden detaylı olarak görüntülenebilir.";
        
        wp_mail($to, $subject, $message);
    }
}

// Plugin'i başlat
new SporcuKayitFormu();

// Admin menüsü ekle
add_action('admin_menu', function() {
    add_menu_page(
        'Sporcu Kayıtları',
        'Sporcu Kayıtları',
        'manage_options',
        'sporcu-kayitlari',
        'sporcu_kayitlari_admin_page',
        'dashicons-groups',
        30
    );
});

// Admin sayfası
function sporcu_kayitlari_admin_page() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'sporcu_kayitlari';
    
    // Kayıtları getir
    $kayitlar = $wpdb->get_results("SELECT * FROM $table_name ORDER BY created_at DESC");
    
    ?>
    <div class="wrap">
        <h1>Sporcu Kayıtları</h1>
        
        <?php if (empty($kayitlar)): ?>
            <p>Henüz kayıt bulunmuyor.</p>
        <?php else: ?>
            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th>Ad Soyad</th>
                        <th>TC Kimlik No</th>
                        <th>Doğum Tarihi</th>
                        <th>Spor Branşları</th>
                        <th>Veli</th>
                        <th>Telefon</th>
                        <th>Kayıt Tarihi</th>
                        <th>İşlemler</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($kayitlar as $kayit): ?>
                        <tr>
                            <td><?php echo esc_html($kayit->student_name . ' ' . $kayit->student_surname); ?></td>
                            <td><?php echo esc_html($kayit->student_tc_no); ?></td>
                            <td><?php echo esc_html($kayit->student_birth_date); ?></td>
                            <td><?php echo esc_html($kayit->sports_branches); ?></td>
                            <td><?php echo esc_html($kayit->parent_name . ' ' . $kayit->parent_surname); ?></td>
                            <td><?php echo esc_html($kayit->parent_phone); ?></td>
                            <td><?php echo esc_html($kayit->created_at); ?></td>
                            <td>
                                <a href="?page=sporcu-kayitlari&action=view&id=<?php echo $kayit->id; ?>" class="button">Görüntüle</a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif; ?>
    </div>
    <?php
}
?>