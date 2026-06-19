/**
 * Shared Utilities and Central Data Store for Motechart Robotik
 */

// --- INITIAL DEFAULT DATA (FALLBACK) ---
export const INITIAL_BLOG_ARTICLES = [
  {
    id: 1,
    title: "Mengenal Arduino Uno dan Menulis Program Pertama",
    category: "arduino",
    date: "15 Mei 2026",
    author: "Tim Mentor Robotik",
    excerpt: "Langkah pertama Anda memasuki dunia mikroprosesor. Pelajari arsitektur Arduino Uno, instalasi IDE, dan cara membuat LED berkedip (Blink).",
    headerImage: "https://images.unsplash.com/photo-1608564697071-ddf911d81370?q=80&w=1200&auto=format&fit=crop",
    content: `### Pengenalan Arduino

Arduino Uno adalah papan mikrokontroler berbasis ATmega328P. Ini adalah papan sirkuit ramah pemula terpopuler di dunia yang digunakan untuk mengendalikan sensor, motor, dan lampu led. Menghubungkan dunia digital dengan dunia fisik sangat mudah dengan Arduino.

### Struktur Kode Arduino

Setiap program Arduino (disebut sketch) terdiri dari dua fungsi utama:

\`\`\`javascript
void setup() {
  // Dijalankan sekali saat Arduino menyala
  pinMode(13, OUTPUT);
}

void loop() {
  // Dijalankan berulang terus menerus
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}
\`\`\`

### Langkah Awal Memulai

1. Koneksikan Arduino Uno ke komputer via kabel USB tipe B.
2. Unduh dan instal Arduino IDE dari situs resmi.
3. Pilih port dan jenis papan di menu Alat -> Port.
4. Tulis kode program Blink sederhana di atas, lalu klik tombol Upload (panah kanan).
5. Selamat! Lampu indikator bawaan (LED 13) di papan Arduino Anda sekarang berkedip setiap 1 detik.`
  },
  {
    id: 2,
    title: "Panduan Lengkap Merakit Robot Line Follower Analog",
    category: "tutorial",
    date: "10 Mei 2026",
    author: "Faris Ramadhan (Ketua Divisi Robotika)",
    excerpt: "Panduan praktis merakit robot pengikut garis tanpa pemrograman. Memanfaatkan sensor LDR, komparator LM358, dan driver motor transistor.",
    headerImage: "https://images.unsplash.com/photo-1546776310-eef45dd6d63c?q=80&w=1200&auto=format&fit=crop",
    content: `### Konsep Dasar Robot Pengikut Garis

Robot Line Follower analog mendeteksi perbedaan kontras warna permukaan jalan (biasanya garis hitam di atas permukaan putih) menggunakan sensor cahaya dan mengendalikan motor secara langsung tanpa otak mikrokontroler. Ini adalah proyek fondasi mekanika dan elektronika dasar terbaik.

### Komponen yang Diperlukan

- Sensor Photodiode atau LDR (Light Dependent Resistor) 2 buah.
- IC Op-Amp Comparator LM358 sebagai pengolah logika pembanding tegangan.
- Transistor TIP41C atau MOSFET sebagai saklar driver motor DC.
- Sepasang Motor DC dengan Gearbox dan Roda.
- Casing/Chassis Akrilik dan Baterai Lithium 18650 2 Cell (7.4v).

### Bagaimana Cara Kerjanya?

Ketika sensor sebelah kiri mendeteksi permukaan hitam (garis lintasan), LDR menerima sedikit pantulan cahaya sehingga nilai resistansinya melonjak tinggi. IC pembanding mendeteksi perubahan ini dan memicu driver motor untuk memutar motor kanan lebih cepat, sehingga robot berbelok kembali to tengah garis lintasan. Sederhana, cepat, dan responsif!`
  },
  {
    id: 3,
    title: "Masa Depan IoT: Menghubungkan Robot dengan Internet via ESP32",
    category: "iot",
    date: "02 Mei 2026",
    author: "Zaskia Amalia (Alumni & Mahasiswa Teknik Elektro)",
    excerpt: "Bagaimana mengontrol pergerakan robot dari mana saja di seluruh dunia menggunakan protokol MQTT, ESP32, dan dashboard real-time.",
    headerImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
    content: `### Apa itu ESP32?

ESP32 adalah mikrokontroler berbiaya rendah dengan konsumsi daya rendah yang dilengkapi Wi-Fi terintegrasi dan modul Bluetooth dual-mode. Ini menjadikannya otak ideal untuk proyek Internet of Things (IoT) dan sistem robot nirkabel.

### Mengapa Menggunakan MQTT?

MQTT (Message Queuing Telemetry Transport) adalah protokol perpesanan standar ringan untuk IoT. Protokol ini menggunakan arsitektur publish/subscribe yang sangat hemat bandwidth, berlatensi rendah, dan sangat cocok untuk komunikasi waktu nyata robot dengan internet.

### Contoh Implementasi

Di ekstrakurikuler kami, kami membuat lengan robot industri mini yang dikendalikan dari jarak jauh melalui antarmuka web. Sensor giroskop di ponsel mengirim koordinat sudut via MQTT ke ESP32 di lengan robot, yang kemudian menerjemahkannya ke servo secara real-time dari jarak ratusan kilometer.`
  },
  {
    id: 4,
    title: "Strategi Menang Kompetisi Robotika Nasional",
    category: "kompetisi",
    date: "28 April 2026",
    author: "Drs. Eko Prasetyo (Pembina Ekstrakurikuler)",
    excerpt: "Tips dan rahasia sukses dari pembina ekskul robotik yang berhasil menyabet juara 1 tingkat nasional selama 3 tahun berturut-turut.",
    headerImage: "https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?q=80&w=1200&auto=format&fit=crop",
    content: `### 1. Desain Modular dan Kuat

Saat kompetisi, kerusakan fisik robot sering terjadi akibat tabrakan atau kesalahan navigasi. Desainlah robot secara modular sehingga jika salah satu sensor atau motor rusak, komponen tersebut bisa diganti dalam hitungan detik tanpa harus membongkar seluruh badan robot.

### 2. Manajemen Daya dan Baterai

Selalu gunakan baterai dengan arus keluaran tinggi (C-Rating tinggi) untuk motor servo berkinerja tinggi, dan pisahkan jalur catu daya untuk sensor/kontroler (menggunakan regulator terpisah) untuk menghindari 'reset' mikrokontroler saat motor menarik arus puncak.

### 3. Mentalitas dan Kerja Tim di Lapangan

Kompetisi robotik bukan hanya tentang teknologi terbaik, melainkan tentang adaptabilitas. Setiap arena kompetisi memiliki intensitas cahaya dan tekstur permukaan berbeda. Kunci kemenangan kami terletak pada kesiapan pemrogram melakukan kalibrasi ulang cepat dalam waktu 5 menit sebelum pertandingan dimulai!`
  }
];

export const INITIAL_PORTFOLIO_PROJECTS = [
  {
    id: 1,
    title: "Soccer Bot v2.0 - Striker Robot",
    category: "mekanik & elektronik",
    status: "Selesai",
    creators: "Tim R&D Kelas XI (Rian, Maya, Dika)",
    components: "Arduino Mega, Driver L298N, Modul Bluetooth HC-05, Motor DC High-Torque 12v, Solenoid Kicker",
    specs: "Kecepatan 1.2 m/s, Daya Tendang Solenoid 24v, Kontrol Nirkabel via Android App",
    headerImage: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?q=80&w=1200&auto=format&fit=crop",
    content: `### Robot Striker Lapangan Hijau

Soccer Bot v2.0 adalah robot striker bertenaga tinggi yang dikendalikan secara nirkabel untuk berkompetisi dalam ajang sepak bola robot tingkat provinsi.

### Proses Rancang Bangun

- **Desain Mekanik**: Menggunakan plat akrilik tebal 5mm dengan sasis melingkar tiga roda (omnidirectional wheels) untuk manuver gerakan 360 derajat instan.
- **Sistem Penendang (Kicker)**: Dilengkapi dengan solenoid 24v berpegas mekanik kuat yang mampu melontarkan bola tenis dengan kecepatan tinggi.
- **Elektronik**: Menggunakan motor driver L298N beraliran arus tinggi dan ditenagai oleh baterai Li-Po 3-cell 11.1V.

![Mekanika Soccer Bot](https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=600&auto=format&fit=crop)

### Hasil Uji Coba

Robot ini berhasil memenangkan juara 2 kategori robot olahraga tingkat regional berkat respon kontrol bluetooth yang sangat instan dan kekuatan tendangan solenoid yang memukau.`,
    code: `// Cuplikan Kontrol Solenoid & Motor DC Soccer Bot v2.0\n#define MOTOR_LEFT_F 5\n#define MOTOR_LEFT_B 6\n#define MOTOR_RIGHT_F 9\n#define MOTOR_RIGHT_B 10\n#define SOLENOID_PIN 12\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(MOTOR_LEFT_F, OUTPUT);\n  pinMode(MOTOR_LEFT_B, OUTPUT);\n  pinMode(MOTOR_RIGHT_F, OUTPUT);\n  pinMode(MOTOR_RIGHT_B, OUTPUT);\n  pinMode(SOLENOID_PIN, OUTPUT);\n}\n\nvoid loop() {\n  if (Serial.available() > 0) {\n    char val = Serial.read();\n    if (val == 'F') { // Maju\n      analogWrite(MOTOR_LEFT_F, 255);\n      analogWrite(MOTOR_RIGHT_F, 255);\n    } else if (val == 'K') { // TENDANG! (Solenoid)\n      digitalWrite(SOLENOID_PIN, HIGH);\n      delay(150);\n      digitalWrite(SOLENOID_PIN, LOW);\n    } else if (val == 'S') { // Berhenti\n      analogWrite(MOTOR_LEFT_F, 0);\n      analogWrite(MOTOR_RIGHT_F, 0);\n    }\n  }\n}`,
    schematic: `Gunakan pinout koneksi berikut untuk perakitan Soccer Bot:

- **VCC** -> Baterai Li-Po 11.1V (via Regulator 5V untuk Arduino)
- **GND** -> Ground Bersama
- **Motor Left F/B** -> PWM Pins D5, D6 (Koneksi ke L298N)
- **Motor Right F/B** -> PWM Pins D9, D10
- **Solenoid Pin** -> Digital Pin D12 (Memicu Relay Solenoid 24V)`,
    showCode: true
  },
  {
    id: 2,
    title: "Smart Agriculture Monitoring (IoT)",
    category: "iot",
    status: "Selesai",
    creators: "Tim IoT Kelas XII (Sarah, Kevin)",
    components: "ESP32, Sensor Kelembaban Tanah Soil Moisture v1.2, Sensor Suhu/Kelembaban DHT22, Pompa Air 5v Mini, LCD I2C",
    specs: "Konektivitas WiFi, Pengiriman Data Telemetri via MQTT, Kontrol Pompa Air Otomatis & Manual",
    headerImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop",
    content: `### Solusi IoT Pertanian Cerdas

Proyek Smart Agriculture Monitoring dirancang untuk membantu pemantauan dan penyiraman tanaman secara otomatis berbasis internet untuk efisiensi penggunaan air.

### Alur Sistem Kerja

1. **Pembacaan Sensor**: ESP32 membaca kelembaban tanah dan suhu/kelembaban udara setiap 1 detik.
2. **Koneksi Blynk Cloud**: Data telemetri dikirim secara real-time ke cloud server Blynk menggunakan WiFi terintegrasi.
3. **Kontrol Pompa Otomatis**: Jika kelembaban tanah berada di bawah nilai batas (tanah kering), relay memicu pompa air mini untuk menyiram secara otomatis.

![Modul Pertanian Cerdas](https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop)

### Manfaat Proyek

Sangat ideal untuk diaplikasikan pada perkebunan hidroponik sekolah, menghemat konsumsi energi, dan memastikan kesehatan tumbuh kembang tanaman terjaga 24 jam penuh.`,
    code: `// Cuplikan Koneksi IoT Blynk ESP32\n#include <WiFi.h>\n#include <WiFiClient.h>\n#include <BlynkSimpleEsp32.h>\n\nchar auth[] = "Your_Blynk_Auth_Token";\nchar ssid[] = "Wifi_Motechart_Robotik";\nchar pass[] = "motechart_wifi_pass";\n\n#define SOIL_PIN 34\n#define RELAY_PIN 23\n\nvoid setup() {\n  Blynk.begin(auth, ssid, pass);\n  pinMode(RELAY_PIN, OUTPUT);\n}\n\nvoid loop() {\n  Blynk.run();\n  int soilMoisture = analogRead(SOIL_PIN);\n  Blynk.virtualWrite(V1, soilMoisture);\n  \n  if (soilMoisture > 3000) { // Tanah kering\n    digitalWrite(RELAY_PIN, HIGH); // Pompa menyala\n  } else {\n    digitalWrite(RELAY_PIN, LOW);\n  }\n  delay(1000);\n}`,
    schematic: `Gunakan pinout ESP32 berikut untuk perakitan:

- **VCC** -> Adaptor Daya 5V / USB
- **GND** -> Ground Bersama
- **Sensor Soil** -> Pin Analog GPIO34
- **Relay Pompa** -> Pin Digital GPIO23 (Mengendalikan Pompa Air 5V)`,
    showCode: true
  },
  {
    id: 3,
    title: "Maze Solver Robot (Autonomous)",
    category: "pemrograman",
    status: "Pengembangan",
    creators: "Tim Kompetisi Kelas X & XI (Adit, Budi, Riri)",
    components: "Arduino Nano, Sensor Ultrasonik HC-SR04 3 unit, Sensor Gyroscope MPU6050, Motor Driver TB6612FNG, Micro Metal Gearmotor",
    specs: "Algoritma Pemecah Labirin Flood-Fill, Sensor Akurasi Jarak 1mm, Kecepatan Putar 90 Derajat Instan",
    headerImage: "https://images.unsplash.com/photo-1608564697071-ddf911d81370?q=80&w=1200&auto=format&fit=crop",
    content: `### Robot Otonom Pemecah Labirin

Maze Solver Robot dirancang untuk bernavigasi secara mandiri memecahkan labirin berliku dalam waktu sesingkat mungkin menggunakan logika penelusuran otonom.

### Integrasi Algoritma Cerdas

- **Sistem Penginderaan Jarak**: Memanfaatkan 3 sensor ultrasonik (kiri, depan, kanan) untuk memantau keberadaan dinding secara simultan.
- **Koreksi Sudut Gyroscope**: MPU6050 digunakan untuk menstabilkan robot agar tetap berjalan lurus dan berputar tepat 90 derajat.
- **Algoritma Flood-Fill**: Robot membuat pemetaan koordinat internal di dalam RAM mikrokontroler untuk mengingat jalur mati dan menemukan rute tercepat ke titik tengah.

![Desain Bodi Sasis Maze Solver](https://images.unsplash.com/photo-1546776310-eef45dd6d63c?q=80&w=600&auto=format&fit=crop)

### Status Saat Ini

Saat ini robot berada dalam fase optimasi PID motor agar pergerakan belokan bisa dilakukan dengan kecepatan sudut yang lebih agresif saat kompetisi tingkat nasional mendatang.`,
    code: `// Cuplikan Algoritma Pendeteksi Dinding & Koreksi MPU6050\n#define TRIG_LEFT 2\n#define ECHO_LEFT 3\n#define TRIG_FRONT 4\n#define ECHO_FRONT 5\n\nfloat getDistance(int trig, int echo) {\n  digitalWrite(trig, LOW);\n  delayMicroseconds(2);\n  digitalWrite(trig, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(trig, LOW);\n  long duration = pulseIn(echo, HIGH);\n  return duration * 0.034 / 2;\n}\n\nvoid setup() {\n  pinMode(TRIG_LEFT, OUTPUT);\n  pinMode(ECHO_LEFT, INPUT);\n  pinMode(TRIG_FRONT, OUTPUT);\n  pinMode(ECHO_FRONT, INPUT);\n}\n\nvoid loop() {\n  float distFront = getDistance(TRIG_FRONT, ECHO_FRONT);\n  float distLeft = getDistance(TRIG_LEFT, ECHO_LEFT);\n  \n  if (distFront < 10.0) {\n    if (distLeft > 15.0) {\n      belokKiri();\n    } else {\n      belokKanan();\n    }\n  } else {\n    majuLurusPID();\n  }\n}`,
    schematic: `Gunakan pinout Arduino Nano berikut:

- **Sensor Ultrasonik** -> Pin D2 & D3 (Kiri), D4 & D5 (Depan)
- **MPU6050 Gyro** -> Pin I2C A4 (SDA), A5 (SCL)
- **Motor Driver** -> Pin TB6612FNG Control`,
    showCode: true
  }
];

export const INITIAL_APPLICANTS = [
  {
    id: 'ROBO-826315',
    nama: 'Rian Hidayat',
    kelas: 'XI',
    email: 'rian.hidayat@gmail.com',
    noHp: '081234567890',
    laptop: 'Ya, Siap Digunakan',
    motivasi: 'Sangat tertarik dengan pengembangan robot berbasis Arduino dan optimasi kode C++.',
    tanggalDaftar: '2026-05-20',
    status: 'Diterima'
  },
  {
    id: 'ROBO-214953',
    nama: 'Maya Safitri',
    kelas: 'X',
    email: 'maya.safitri@gmail.com',
    noHp: '085712345678',
    laptop: 'Ya, Siap Digunakan',
    motivasi: 'Ingin mendalami bagaimana merakit sirkuit PCB dan menyolder sensor-sensor IoT.',
    tanggalDaftar: '2026-05-21',
    status: 'Pending'
  },
  {
    id: 'ROBO-539201',
    nama: 'Aditya Pratama',
    kelas: 'XII',
    email: 'aditya.pratama@gmail.com',
    noHp: '089912345678',
    laptop: 'Tidak (Gunakan Lab Ekskul)',
    motivasi: 'Ingin belajar merakit bodi fisik robot (desain 3D CAD dan pemotongan bahan akrilik).',
    tanggalDaftar: '2026-05-22',
    status: 'Pending'
  }
];

export const INITIAL_REG_SETTINGS = {
  isOpen: true,
  countdownTarget: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  customQuestions: [
    {
      id: 'q-1779445719',
      label: 'Apakah Anda memiliki pengalaman pemrograman sebelumnya?',
      type: 'select',
      options: ['Belum pernah', 'Dasar (HTML/CSS)', 'Menengah (C++/Arduino)', 'Mahir'],
      required: true
    }
  ],
  waTitle: 'Grup WhatsApp Resmi Calon Anggota',
  waDesc: 'Harap bergabung ke grup koordinasi calon anggota baru di bawah ini untuk mendapatkan info jadwal wawancara, tes masuk, dan demonstrasi alat robotika:',
  waLink: 'https://chat.whatsapp.com/mock-motechart-robotik'
};

export const INITIAL_LANDING_DATA = {
  heroTag: 'Ekstrakurikuler Unggulan',
  heroTitle: 'Rancang Masa Depanmu Bersama <span>Robotik</span>!',
  heroDesc: 'Eksplorasi kreativitas tanpa batas. Kembangkan keahlian mekanika tangguh, sirkuit elektronika cerdas, dan pemrograman algoritma tingkat tinggi untuk menciptakan robot-robot inovatif masa depan.',
  visiText: 'Menjadi pusat pengembangan teknologi robotika remaja yang unggul, adaptif, inovatif, dan berprestasi global berlandaskan kerja sama tim dan integritas sains.',
  misiList: [
    'Menyelenggarakan pelatihan terstruktur bidang mekanik, elektronika dasar, dan coding.',
    'Mendorong kreativitas dalam memecahkan masalah nyata berbasis Internet of Things (IoT).',
    'Mempersiapkan tim tangguh untuk berkompetisi di tingkat nasional dan internasional.',
    'Menghasilkan alumni berkarakter teknik yang siap bersaing di era otomatisasi global.'
  ],
  divMechDesc: 'Merancang struktur fisik robot, chassis akrilik, pemodelan 3D (CAD), 3D printing modeling, dan kestabilan pergerakan mekanis aerodinamis.',
  divElecDesc: 'Menyusun sirkuit sirkulasi daya, penyolderan sensor pintar, perakitan mikrokontroler (Arduino/ESP32), baterai sel, dan sistem aktuator driver.',
  divProgDesc: 'Menulis kode algoritma C++ dan Python, integrasi navigasi sensor otomatis, penyelarasan PID motor, hingga kendali jarak jauh IoT nirkabel.',
  achievements: [
    { juara: 'Juara 1 Nasional Kontes Robot Soccer', organizer: 'Kementerian Pendidikan & Kebudayaan', year: '2025' },
    { juara: 'Juara 2 Internasional ASEAN Line Follower', organizer: 'ASEAN Robotics Association', year: '2025' },
    { juara: 'Juara 1 Provinsi Lomba Karya Cipta IoT', organizer: 'Pemerintah Provinsi & Puspresnas', year: '2026' },
    { juara: 'Juara Umum Kompetisi Robotik Kreatif', organizer: 'Lembaga Ilmu Pengetahuan Indonesia', year: '2025' }
  ],
  footerTagline: 'Wadah pengembangan inovasi, otomatisasi, dan kreativitas teknologi robotika masa depan bagi para remaja unggul.',
  footerLocation: 'Lab Robotika, Gedung B Lantai 2',
  footerEmail: 'robotik@motechart.sch.id',
  footerInstagram: 'https://instagram.com',
  footerGithub: 'https://github.com',
  footerYoutube: 'https://youtube.com'
};


// --- LOCAL STORAGE DATA HELPERS (CMS PERSISTENCE WITH OBFUSCATION) ---
export function obfuscate(text) {
  try {
    const b64 = btoa(unescape(encodeURIComponent(text)));
    let result = '';
    for (let i = 0; i < b64.length; i++) {
      result += String.fromCharCode(b64.charCodeAt(i) ^ 18); // XOR key 18
    }
    return 'SEC_' + result;
  } catch (e) {
    return text;
  }
}

export function deobfuscate(text) {
  if (!text || typeof text !== 'string' || !text.startsWith('SEC_')) return null;
  try {
    const rawCipher = text.substring(4);
    let raw = '';
    for (let i = 0; i < rawCipher.length; i++) {
      raw += String.fromCharCode(rawCipher.charCodeAt(i) ^ 18);
    }
    return decodeURIComponent(escape(atob(raw)));
  } catch (e) {
    return null;
  }
}

export function loadData(key, fallbackData) {
  try {
    const rawData = localStorage.getItem(key);
    if (!rawData) {
      saveData(key, fallbackData, false);
      return fallbackData;
    }
    
    if (rawData.startsWith('SEC_')) {
      const dec = deobfuscate(rawData);
      if (dec) {
        return JSON.parse(dec);
      }
    }
    
    try {
      const parsed = JSON.parse(rawData);
      saveData(key, parsed, false);
      return parsed;
    } catch (e) {
      saveData(key, fallbackData, false);
      return fallbackData;
    }
  } catch (e) {
    console.error('LocalStorage load failed:', e);
    return fallbackData;
  }
}

export function saveData(key, data, syncToCloud = true) {
  try {
    const serialized = JSON.stringify(data);
    const encrypted = obfuscate(serialized);
    localStorage.setItem(key, encrypted);

    const currentUser = state.auth ? state.auth.currentUser : null;
    if (state.useFirebase && syncToCloud && currentUser) {
      if (key === 'robotik_reg_settings') {
        state.db.collection('settings').doc('registration').set(data)
          .then(() => console.log("Cloud Sync: Registration settings successfully updated!"))
          .catch(err => console.error("Cloud Sync Error: Settings sync failed:", err));
      } else if (key === 'robotik_landing') {
        state.db.collection('landing').doc('content').set(data)
          .then(() => console.log("Cloud Sync: Landing page content successfully updated!"))
          .catch(err => console.error("Cloud Sync Error: Landing content sync failed:", err));
      } else if (key === 'robotik_blog') {
        state.db.collection('blog').doc('articles').set({ articles: data })
          .then(() => console.log("Cloud Sync: Blog articles successfully updated!"))
          .catch(err => console.error("Cloud Sync Error: Blog articles sync failed:", err));
      } else if (key === 'robotik_portfolio') {
        state.db.collection('portfolio').doc('projects').set({ projects: data })
          .then(() => console.log("Cloud Sync: Portfolio projects successfully updated!"))
          .catch(err => console.error("Cloud Sync Error: Portfolio projects sync failed:", err));
      }
    }
  } catch (e) {
    console.error('LocalStorage save failed:', e);
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      customAlert('⚠️ Penyimpanan browser Anda penuh! Perubahan data tidak dapat disimpan secara permanen.');
    }
  }
}


// --- FIREBASE FIRESTORE SYNC & SEEDING ---
const firebaseConfig = {
  apiKey: "AIzaSyAQQctyhe_Z9HTiWQLt2MUuYeGMOCE1T5U",
  authDomain: "website-motechart.firebaseapp.com",
  projectId: "website-motechart",
  storageBucket: "website-motechart.firebasestorage.app",
  messagingSenderId: "469005681722",
  appId: "1:469005681722:web:d21d38dae2aa6ef5bfe103"
};

let db = null;
let auth = null;
let useFirebase = false;

if (typeof firebase !== 'undefined' && firebaseConfig.projectId !== 'PLACEHOLDER_PROJECT_ID') {
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    useFirebase = true;
    console.log("Motechart Cloud Engine: Firebase Firestore & Auth initialized successfully! ☁️");
  } catch (e) {
    console.error("Motechart Cloud Engine: Firebase initialization failed:", e);
  }
}


// --- CENTRAL DATA STATE OBJECT ---
export const state = {
  blogArticles: loadData('robotik_blog', INITIAL_BLOG_ARTICLES),
  portfolioProjects: loadData('robotik_portfolio', INITIAL_PORTFOLIO_PROJECTS),
  applicants: loadData('robotik_applicants', INITIAL_APPLICANTS),
  regSettings: loadData('robotik_reg_settings', INITIAL_REG_SETTINGS),
  landingData: loadData('robotik_landing', INITIAL_LANDING_DATA),
  soundMuted: false,
  useFirebase: useFirebase,
  db: db,
  auth: auth
};


// --- CLOUD FIREBASE SYNC HELPERS ---
export async function syncApplicantsFromFirestore() {
  if (!state.useFirebase) return;
  try {
    const snapshot = await state.db.collection('applicants').get();
    const fetched = [];
    snapshot.forEach(doc => {
      fetched.push(doc.data());
    });
    state.applicants = fetched;
    saveData('robotik_applicants', state.applicants, false);
    console.log(`Cloud sync completed: ${state.applicants.length} applicants loaded.`);
  } catch (e) {
    console.error("Firestore sync applicants failed:", e);
  }
}

export async function syncRegSettingsFromFirestore() {
  if (!state.useFirebase) return;
  try {
    const doc = await state.db.collection('settings').doc('registration').get();
    if (doc.exists) {
      state.regSettings = doc.data();
      saveData('robotik_reg_settings', state.regSettings, false);
      console.log("Cloud sync completed: Registration settings loaded.");
    } else {
      await state.db.collection('settings').doc('registration').set(state.regSettings);
      console.log("Firestore seeded with initial registration settings.");
    }
  } catch (e) {
    console.error("Firestore sync settings failed:", e);
  }
}

export async function syncLandingDataFromFirestore() {
  if (!state.useFirebase) return;
  try {
    const doc = await state.db.collection('landing').doc('content').get();
    if (doc.exists) {
      state.landingData = doc.data();
      saveData('robotik_landing', state.landingData, false);
      console.log("Cloud sync completed: Landing page data loaded.");
    } else {
      await state.db.collection('landing').doc('content').set(state.landingData);
      console.log("Firestore seeded with initial landing page content.");
    }
  } catch (e) {
    console.error("Firestore sync landing data failed:", e);
  }
}

export async function syncBlogFromFirestore() {
  if (!state.useFirebase) return;
  try {
    const doc = await state.db.collection('blog').doc('articles').get();
    if (doc.exists) {
      const cloudData = doc.data();
      state.blogArticles = cloudData.articles || [];
      saveData('robotik_blog', state.blogArticles, false);
      console.log("Cloud sync completed: Blog articles loaded.");
    } else {
      await state.db.collection('blog').doc('articles').set({ articles: state.blogArticles });
      console.log("Firestore seeded with initial blog articles.");
    }
  } catch (e) {
    console.error("Firestore sync blog failed:", e);
  }
}

export async function syncPortfolioFromFirestore() {
  if (!state.useFirebase) return;
  try {
    const doc = await state.db.collection('portfolio').doc('projects').get();
    if (doc.exists) {
      const cloudData = doc.data();
      state.portfolioProjects = cloudData.projects || [];
      saveData('robotik_portfolio', state.portfolioProjects, false);
      console.log("Cloud sync completed: Portfolio projects loaded.");
    } else {
      await state.db.collection('portfolio').doc('projects').set({ projects: state.portfolioProjects });
      console.log("Firestore seeded with initial portfolio projects.");
    }
  } catch (e) {
    console.error("Firestore sync portfolio failed:", e);
  }
}

let applicantsUnsubscribe = null;
export function setupRealTimeApplicantsSync(onUpdateCallback) {
  if (!state.useFirebase) return;
  if (applicantsUnsubscribe) return;
  
  try {
    applicantsUnsubscribe = state.db.collection('applicants').onSnapshot(snapshot => {
      const fetched = [];
      snapshot.forEach(doc => {
        fetched.push(doc.data());
      });
      state.applicants = fetched;
      saveData('robotik_applicants', state.applicants, false);
      console.log("Real-time applicants updated from Cloud Firestore!");
      if (typeof onUpdateCallback === 'function') {
        onUpdateCallback(state.applicants);
      }
    });
  } catch (e) {
    console.error("Failed to setup Firestore real-time listener:", e);
  }
}

export async function initializeCloudDataSync(callbacks = {}) {
  if (state.useFirebase) {
    console.log("Motechart Cloud Engine: Initiating data sync from Firebase Firestore...");
    await syncLandingDataFromFirestore();
    await syncRegSettingsFromFirestore();
    await syncApplicantsFromFirestore();
    await syncBlogFromFirestore();
    await syncPortfolioFromFirestore();
    
    if (typeof callbacks.onSyncComplete === 'function') {
      callbacks.onSyncComplete();
    }
  }
}


// --- WEB AUDIO AUDIO SYNTHESIZER ---
let audioCtx = null;
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

export function playRoboticSound(type) {
  if (state.soundMuted) return;
  
  try {
    initAudio();
    if (!audioCtx) return;

    const time = audioCtx.currentTime;
    
    switch (type) {
      case 'click': {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, time);
        osc.frequency.exponentialRampToValueAtTime(100, time + 0.06);
        gainNode.gain.setValueAtTime(0.08, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start(time);
        osc.stop(time + 0.07);
        break;
      }
      case 'hover': {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, time);
        osc.frequency.setValueAtTime(1800, time + 0.015);
        gainNode.gain.setValueAtTime(0.015, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start(time);
        osc.stop(time + 0.035);
        break;
      }
      case 'success': {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const noteTime = time + (idx * 0.08);
          const osc = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteTime);
          gainNode.gain.setValueAtTime(0.05, noteTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.08);
          osc.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          osc.start(noteTime);
          osc.stop(noteTime + 0.09);
        });
        break;
      }
      case 'error': {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, time);
        osc.frequency.linearRampToValueAtTime(80, time + 0.15);
        gainNode.gain.setValueAtTime(0.08, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.16);
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, time);
        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start(time);
        osc.stop(time + 0.17);
        break;
      }
    }
  } catch (e) {
    console.warn("Audio Context error:", e);
  }
}


// --- MARKDOWN & HTML UTILITIES ---
export function parseMarkdownToHtml(markdown) {
  if (!markdown) return '';

  // If content is already HTML, do not parse it as markdown, return as-is.
  if (markdown.trim().startsWith('<') || /<\/?[a-z][\s\S]*>/i.test(markdown)) {
    return markdown;
  }

  let escaped = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const codeBlocks = [];
  escaped = escaped.replace(/```([\s\S]*?)```/g, (match, code) => {
    let cleanCode = code;
    const matchLang = code.match(/^([a-zA-Z0-9+#-]+)\r?\n/);
    let lang = '';
    if (matchLang) {
      lang = matchLang[1];
      cleanCode = code.slice(matchLang[0].length);
    }
    const id = `__CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push(`<pre><code class="language-${lang}">${cleanCode.trim()}</code></pre>`);
    return id;
  });

  escaped = escaped.replace(/^\s*>\s+(.+)$/gm, '<blockquote>$1</blockquote>');
  escaped = escaped.replace(/^\s*####\s+(.+)$/gm, '<h4>$1</h4>');
  escaped = escaped.replace(/^\s*###\s+(.+)$/gm, '<h3>$1</h3>');
  escaped = escaped.replace(/^\s*##\s+(.+)$/gm, '<h2>$1</h2>');
  escaped = escaped.replace(/^\s*#\s+(.+)$/gm, '<h1>$1</h1>');

  escaped = escaped.replace(/^\s*[\-\*]\s+(.+)$/gm, '<li>$1</li>');
  escaped = escaped.replace(/(?:^\s*<li>.*?<\/li>\s*)+/gm, (match) => {
    return `<ul>\n${match}</ul>\n`;
  });

  escaped = escaped.replace(/^\s*\d+\.\s+(.+)$/gm, '<ol-item>$1</ol-item>');
  escaped = escaped.replace(/(?:^\s*<ol-item>.*?<\/ol-item>\s*)+/gm, (match) => {
    return `<ol>\n${match.replace(/<ol-item>/g, '<li>').replace(/<\/ol-item>/g, '</li>')}</ol>\n`;
  });

  const paragraphs = escaped.split(/\n\s*\n+/);
  const processed = paragraphs.map(p => {
    const trimmed = p.trim();
    if (!trimmed) return '';
    if (/^(<h[1-6]|<ul|<ol|<blockquote|<pre|<li>|__CODE_BLOCK_)/.test(trimmed)) {
      return trimmed;
    }
    return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
  });
  escaped = processed.join('\n\n');

  escaped = escaped.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
  escaped = escaped.replace(/__([^__]+)__/g, '<strong>$1</strong>');
  escaped = escaped.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
  escaped = escaped.replace(/_([^_]+)_/g, '<em>$1</em>');
  escaped = escaped.replace(/`([^`]+)`/g, '<code>$1</code>');
  escaped = escaped.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  escaped = escaped.replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="blog-img">');

  codeBlocks.forEach((block, idx) => {
    escaped = escaped.replace(`__CODE_BLOCK_${idx}__`, block);
  });

  return escaped;
}

export function sanitizeInput(text) {
  if (typeof text !== 'string') return text;
  try {
    // DOMParser-based sanitizer: parse as HTML, then extract only text content
    // This neutralizes all tags, event handlers, javascript: URIs, and script injection
    const doc = new DOMParser().parseFromString(text, 'text/html');
    return (doc.body.textContent || '').trim();
  } catch (e) {
    // Fallback: aggressive strip if DOMParser fails
    return text.replace(/<[^>]*>/g, '').replace(/on\w+\s*=/gi, '').trim();
  }
}

export function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Validates a URL string to ensure it uses a safe protocol (https:// or http://).
 * Returns the URL if safe, or an empty string if dangerous (e.g., javascript:, data:).
 */
export function sanitizeUrl(url) {
  if (typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  // Only allow http:// and https:// protocols
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // Allow safe base64 data URLs for images
  if (/^data:image\/(jpeg|png|gif|webp|svg\+xml);base64,/i.test(trimmed)) return trimmed;
  // Allow relative paths starting with ./ or /
  if (/^\.?\//.test(trimmed)) return trimmed;
  // Block everything else (javascript:, data: other than images, vbscript:, etc.)
  return '';
}

/**
 * Sanitizes CMS-provided HTML to allow ONLY <span> tags (for hero title accent).
 * Strips all other HTML tags and dangerous attributes.
 */
export function sanitizeHeroHtml(html) {
  if (typeof html !== 'string') return '';
  // Allow only <span> and </span> tags, escape everything else
  return html.replace(/<(?!\/?(span)\s*\/?>)[^>]*>/gi, (match) => escapeHtml(match));
}

// --- SECURE SESSION TOKEN MANAGEMENT ---



// --- LOGIN RATE LIMITER ---
const LOGIN_STORAGE_KEY = 'robotik_login_attempts';

/**
 * Returns the current login rate limit state.
 * @returns {{ attempts: number, lockoutUntil: number|null, isLocked: boolean, remainingMs: number }}
 */
export function getLoginRateLimit() {
  try {
    const data = JSON.parse(sessionStorage.getItem(LOGIN_STORAGE_KEY) || '{}');
    const attempts = data.attempts || 0;
    const lockoutUntil = data.lockoutUntil || null;
    const now = Date.now();
    if (lockoutUntil && now < lockoutUntil) {
      return { attempts, lockoutUntil, isLocked: true, remainingMs: lockoutUntil - now };
    }
    // If lockout expired, reset
    if (lockoutUntil && now >= lockoutUntil) {
      sessionStorage.removeItem(LOGIN_STORAGE_KEY);
      return { attempts: 0, lockoutUntil: null, isLocked: false, remainingMs: 0 };
    }
    return { attempts, lockoutUntil: null, isLocked: false, remainingMs: 0 };
  } catch (e) {
    return { attempts: 0, lockoutUntil: null, isLocked: false, remainingMs: 0 };
  }
}

/**
 * Records a failed login attempt and applies escalating lockout.
 * Lockout schedule: 5 attempts = 30s, 8 = 60s, 10 = 120s, 15+ = 300s
 */
export function recordFailedLogin() {
  const { attempts } = getLoginRateLimit();
  const newAttempts = attempts + 1;
  let lockoutMs = 0;
  if (newAttempts >= 15) lockoutMs = 300000;      // 5 minutes
  else if (newAttempts >= 10) lockoutMs = 120000;  // 2 minutes
  else if (newAttempts >= 8) lockoutMs = 60000;    // 1 minute
  else if (newAttempts >= 5) lockoutMs = 30000;    // 30 seconds

  const lockoutUntil = lockoutMs > 0 ? Date.now() + lockoutMs : null;
  sessionStorage.setItem(LOGIN_STORAGE_KEY, JSON.stringify({ attempts: newAttempts, lockoutUntil }));
  return { attempts: newAttempts, lockoutUntil, isLocked: !!lockoutUntil, lockoutMs };
}

/**
 * Resets the login rate limiter on successful login.
 */
export function resetLoginRateLimit() {
  sessionStorage.removeItem(LOGIN_STORAGE_KEY);
}

// --- FORM SUBMISSION RATE LIMITER ---
let lastFormSubmitTime = 0;
const FORM_COOLDOWN_MS = 5000; // 5 seconds between submissions

/**
 * Checks if a form submission is allowed (cooldown-based).
 * @returns {{ allowed: boolean, remainingMs: number }}
 */
export function checkFormRateLimit() {
  const now = Date.now();
  const elapsed = now - lastFormSubmitTime;
  if (elapsed < FORM_COOLDOWN_MS) {
    return { allowed: false, remainingMs: FORM_COOLDOWN_MS - elapsed };
  }
  return { allowed: true, remainingMs: 0 };
}

/**
 * Records a form submission timestamp.
 */
export function recordFormSubmission() {
  lastFormSubmitTime = Date.now();
}

// --- REAL-TIME SETTINGS & LANDING SYNC LISTENERS ---
let regSettingsUnsubscribe = null;
export function setupRealTimeRegSettingsSync(onUpdateCallback) {
  if (!state.useFirebase) return;
  if (regSettingsUnsubscribe) return;
  try {
    regSettingsUnsubscribe = state.db.collection('settings').doc('registration').onSnapshot(doc => {
      if (doc.exists) {
        state.regSettings = doc.data();
        saveData('robotik_reg_settings', state.regSettings, false);
        console.log("Real-time registration settings updated from Cloud Firestore!");
        if (typeof onUpdateCallback === 'function') {
          onUpdateCallback(state.regSettings);
        }
      }
    }, err => {
      console.warn("Firestore real-time settings listener failed:", err);
    });
  } catch (e) {
    console.error("Failed to setup Firestore real-time listener for reg settings:", e);
  }
}

let landingDataUnsubscribe = null;
export function setupRealTimeLandingDataSync(onUpdateCallback) {
  if (!state.useFirebase) return;
  if (landingDataUnsubscribe) return;
  try {
    landingDataUnsubscribe = state.db.collection('landing').doc('content').onSnapshot(doc => {
      if (doc.exists) {
        state.landingData = doc.data();
        saveData('robotik_landing', state.landingData, false);
        console.log("Real-time landing data updated from Cloud Firestore!");
        if (typeof onUpdateCallback === 'function') {
          onUpdateCallback(state.landingData);
        }
      }
    }, err => {
      console.warn("Firestore real-time landing data listener failed:", err);
    });
  } catch (e) {
    console.error("Failed to setup Firestore real-time listener for landing data:", e);
  }
}

let blogUnsubscribe = null;
export function setupRealTimeBlogSync(onUpdateCallback) {
  if (!state.useFirebase) return;
  if (blogUnsubscribe) return;
  try {
    blogUnsubscribe = state.db.collection('blog').doc('articles').onSnapshot(doc => {
      if (doc.exists) {
        state.blogArticles = doc.data().articles || [];
        saveData('robotik_blog', state.blogArticles, false);
        console.log("Real-time blog articles updated from Cloud Firestore!");
        if (typeof onUpdateCallback === 'function') {
          onUpdateCallback(state.blogArticles);
        }
      }
    }, err => {
      console.warn("Firestore real-time blog listener failed:", err);
    });
  } catch (e) {
    console.error("Failed to setup Firestore real-time listener for blog:", e);
  }
}

let portfolioUnsubscribe = null;
export function setupRealTimePortfolioSync(onUpdateCallback) {
  if (!state.useFirebase) return;
  if (portfolioUnsubscribe) return;
  try {
    portfolioUnsubscribe = state.db.collection('portfolio').doc('projects').onSnapshot(doc => {
      if (doc.exists) {
        state.portfolioProjects = doc.data().projects || [];
        saveData('robotik_portfolio', state.portfolioProjects, false);
        console.log("Real-time portfolio projects updated from Cloud Firestore!");
        if (typeof onUpdateCallback === 'function') {
          onUpdateCallback(state.portfolioProjects);
        }
      }
    }, err => {
      console.warn("Firestore real-time portfolio listener failed:", err);
    });
  } catch (e) {
    console.error("Failed to setup Firestore real-time listener for portfolio:", e);
  }
}

// --- CUSTOM DIALOG OVERLAYS (ALERT & CONFIRM) ---
function ensurePopupStyles() {
  if (!document.getElementById('custom-popup-styles')) {
    const style = document.createElement('style');
    style.id = 'custom-popup-styles';
    style.textContent = `
      .custom-popup-dialog {
        background: rgba(11, 17, 32, 0.98);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 16px;
        color: #ffffff;
        padding: 2rem;
        max-width: 440px;
        width: 90%;
        box-shadow: 0 24px 64px rgba(0, 0, 0, 0.7);
        overflow: hidden;
        outline: none;
        position: fixed;
        top: 50% !important;
        left: 50% !important;
        right: auto !important;
        bottom: auto !important;
        margin: 0 !important;
        transform: translate(-50%, -50%) scale(0.92) !important;
        opacity: 0;
        transition: opacity 0.3s, transform 0.3s, display 0.3s, overlay 0.3s;
        transition-behavior: allow-discrete;
        z-index: 99999;
      }
      .custom-popup-dialog[open] {
        opacity: 1 !important;
        transform: translate(-50%, -50%) scale(1) !important;
      }
      @starting-style {
        .custom-popup-dialog[open] {
          opacity: 0 !important;
          transform: translate(-50%, -50%) scale(0.92) !important;
        }
      }
      .custom-popup-dialog::backdrop {
        background: rgba(2, 6, 23, 0.8);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }
      .popup-content {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }
      .popup-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      .popup-icon {
        font-size: 1.75rem;
      }
      .popup-title {
        font-family: 'Outfit', sans-serif;
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0;
        letter-spacing: 0.02em;
        color: #FACC15;
      }
      .popup-message {
        font-family: 'Inter', sans-serif;
        font-size: 0.95rem;
        line-height: 1.6;
        color: #E2E8F0;
        margin: 0;
      }
      .popup-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 0.5rem;
      }
      .popup-actions .popup-btn {
        min-height: 42px;
        padding: 0.5rem 1.5rem;
        font-family: 'Inter', sans-serif;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        border-radius: 8px;
        border: 1px solid transparent;
        transition: all 0.2s ease;
      }
      .popup-actions .popup-btn-confirm {
        background: #FACC15;
        color: #0F172A;
      }
      .popup-actions .popup-btn-confirm:hover {
        background: #EAB308;
        transform: translateY(-1px);
        box-shadow: 0 0 12px rgba(250, 204, 21, 0.4);
      }
      .popup-actions .popup-btn-cancel {
        background: rgba(255, 255, 255, 0.08);
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.15);
      }
      .popup-actions .popup-btn-cancel:hover {
        background: rgba(255, 255, 255, 0.12);
        border-color: rgba(255, 255, 255, 0.3);
      }
    `;
    document.head.appendChild(style);
  }
}

export function customAlert(message) {
  return new Promise((resolve) => {
    ensurePopupStyles();
    
    let dialog = document.getElementById('custom-alert-dialog');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'custom-alert-dialog';
      dialog.className = 'custom-popup-dialog';
      dialog.innerHTML = `
        <div class="popup-content">
          <div class="popup-header">
            <span class="popup-icon">⚠️</span>
            <h3 class="popup-title">Pemberitahuan</h3>
          </div>
          <p class="popup-message"></p>
          <div class="popup-actions">
            <button class="popup-btn popup-btn-confirm popup-close-btn">OK</button>
          </div>
        </div>
      `;
      document.body.appendChild(dialog);
    }

    dialog.querySelector('.popup-message').textContent = message;
    
    const closeBtn = dialog.querySelector('.popup-close-btn');
    const handleClose = () => {
      dialog.close();
      closeBtn.removeEventListener('click', handleClose);
      resolve();
    };
    closeBtn.addEventListener('click', handleClose);
    
    dialog.showModal();
    document.body.classList.add('dialog-open');
    dialog.addEventListener('close', () => {
      document.body.classList.remove('dialog-open');
      resolve();
    }, { once: true });
  });
}

export function customConfirm(message) {
  return new Promise((resolve) => {
    ensurePopupStyles();

    let dialog = document.getElementById('custom-confirm-dialog');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'custom-confirm-dialog';
      dialog.className = 'custom-popup-dialog';
      dialog.innerHTML = `
        <div class="popup-content">
          <div class="popup-header">
            <span class="popup-icon">❓</span>
            <h3 class="popup-title" style="color: #06B6D4;">Konfirmasi</h3>
          </div>
          <p class="popup-message"></p>
          <div class="popup-actions">
            <button class="popup-btn popup-btn-cancel popup-cancel-btn">Batal</button>
            <button class="popup-btn popup-btn-confirm popup-confirm-btn">Ya, Setuju</button>
          </div>
        </div>
      `;
      document.body.appendChild(dialog);
    }

    dialog.querySelector('.popup-message').textContent = message;

    const cancelBtn = dialog.querySelector('.popup-cancel-btn');
    const confirmBtn = dialog.querySelector('.popup-confirm-btn');

    let resolved = false;

    const handleCancel = () => {
      if (resolved) return;
      resolved = true;
      dialog.close();
      resolve(false);
    };

    const handleConfirm = () => {
      if (resolved) return;
      resolved = true;
      dialog.close();
      resolve(true);
    };

    cancelBtn.onclick = handleCancel;
    confirmBtn.onclick = handleConfirm;

    dialog.showModal();
    document.body.classList.add('dialog-open');
    dialog.onclose = () => {
      document.body.classList.remove('dialog-open');
      if (!resolved) {
        resolved = true;
        resolve(false);
      }
    };
  });
}

