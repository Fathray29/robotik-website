/**
 * Robotik Extracurricular Website - Main Application Logic (CMS Integrated)
 * Implements client-side routing, Web Audio API synthesis for robotic sound FX,
 * Blog filters, Portfolio details, Multi-step Registration Form, and LocalStorage CMS.
 */

// --- INITIAL DEFAULT DATA (FALLBACK) ---
const INITIAL_BLOG_ARTICLES = [
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

Ketika sensor sebelah kiri mendeteksi permukaan hitam (garis lintasan), LDR menerima sedikit pantulan cahaya sehingga nilai resistansinya melonjak tinggi. IC pembanding mendeteksi perubahan ini dan memicu driver motor untuk memutar motor kanan lebih cepat, sehingga robot berbelok kembali ke tengah garis lintasan. Sederhana, cepat, dan responsif!`
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

const INITIAL_PORTFOLIO_PROJECTS = [
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
    code: `// Cuplikan Kontrol Solenoid & Motor DC Soccer Bot v2.0\n#define MOTOR_LEFT_F 5\n#define MOTOR_LEFT_B 6\n#define MOTOR_RIGHT_F 9\n#define MOTOR_RIGHT_B 10\n#define SOLENOID_PIN 12\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(MOTOR_LEFT_F, OUTPUT);\n  pinMode(MOTOR_LEFT_B, OUTPUT);\n  pinMode(MOTOR_RIGHT_F, OUTPUT);\n  pinMode(MOTOR_RIGHT_B, OUTPUT);\n  pinMode(SOLENOID_PIN, OUTPUT);\n}\n\nvoid loop() {\n  if (Serial.available() > 0) {\n    char val = Serial.read();\n    if (val == 'F') { // Maju\n      analogWrite(MOTOR_LEFT_F, 255);\n      analogWrite(MOTOR_RIGHT_F, 255);\n    } else if (val == 'K') { // TENDANG! (Solenoid)\n      digitalWrite(SOLENOID_PIN, HIGH);\n      delay(150);\n      digitalWrite(SOLENOID_PIN, LOW);\n    } else if (val == 'S') { // Berhenti\n      analogWrite(MOTOR_LEFT_F, 0);\n      analogWrite(MOTOR_RIGHT_F, 0);\n    }\n  }\n}`
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
    code: `// Cuplikan Koneksi IoT Blynk ESP32\n#include <WiFi.h>\n#include <WiFiClient.h>\n#include <BlynkSimpleEsp32.h>\n\nchar auth[] = "Your_Blynk_Auth_Token";\nchar ssid[] = "Wifi_Motechart_Robotik";\nchar pass[] = "motechart_wifi_pass";\n\n#define SOIL_PIN 34\n#define RELAY_PIN 23\n\nvoid setup() {\n  Blynk.begin(auth, ssid, pass);\n  pinMode(RELAY_PIN, OUTPUT);\n}\n\nvoid loop() {\n  Blynk.run();\n  int soilMoisture = analogRead(SOIL_PIN);\n  Blynk.virtualWrite(V1, soilMoisture);\n  \n  if (soilMoisture > 3000) { // Tanah kering\n    digitalWrite(RELAY_PIN, HIGH); // Pompa menyala\n  } else {\n    digitalWrite(RELAY_PIN, LOW);\n  }\n  delay(1000);\n}`
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
    code: `// Cuplikan Algoritma Pendeteksi Dinding & Koreksi MPU6050\n#define TRIG_LEFT 2\n#define ECHO_LEFT 3\n#define TRIG_FRONT 4\n#define ECHO_FRONT 5\n\nfloat getDistance(int trig, int echo) {\n  digitalWrite(trig, LOW);\n  delayMicroseconds(2);\n  digitalWrite(trig, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(trig, LOW);\n  long duration = pulseIn(echo, HIGH);\n  return duration * 0.034 / 2;\n}\n\nvoid setup() {\n  pinMode(TRIG_LEFT, OUTPUT);\n  pinMode(ECHO_LEFT, INPUT);\n  pinMode(TRIG_FRONT, OUTPUT);\n  pinMode(ECHO_FRONT, INPUT);\n}\n\nvoid loop() {\n  float distFront = getDistance(TRIG_FRONT, ECHO_FRONT);\n  float distLeft = getDistance(TRIG_LEFT, ECHO_LEFT);\n  \n  if (distFront < 10.0) {\n    if (distLeft > 15.0) {\n      belokKiri();\n    } else {\n      belokKanan();\n    }\n  } else {\n    majuLurusPID();\n  }\n}`
  }
];

const INITIAL_APPLICANTS = [
  {
    id: 'ROBO-826315',
    nama: 'Rian Hidayat',
    kelas: 'XI',
    nisn: '0087654321',
    noHp: '081234567890',
    laptop: 'Ya',
    divisi: ['Programming & Algoritma', 'Mechanics & Desain 3D'],
    motivasi: 'Sangat tertarik dengan pengembangan robot berbasis Arduino dan optimasi kode C++.',
    tanggalDaftar: '2026-05-20',
    status: 'Diterima'
  },
  {
    id: 'ROBO-214953',
    nama: 'Maya Safitri',
    kelas: 'X',
    nisn: '0098765432',
    noHp: '085712345678',
    laptop: 'Ya',
    divisi: ['Electronics & IoT'],
    motivasi: 'Ingin mendalami bagaimana merakit sirkuit PCB dan menyolder sensor-sensor IoT.',
    tanggalDaftar: '2026-05-21',
    status: 'Pending'
  },
  {
    id: 'ROBO-539201',
    nama: 'Aditya Pratama',
    kelas: 'XII',
    nisn: '0076543210',
    noHp: '089912345678',
    laptop: 'Tidak',
    divisi: ['Mechanics & Desain 3D'],
    motivasi: 'Ingin belajar merakit bodi fisik robot (desain 3D CAD dan pemotongan bahan akrilik).',
    tanggalDaftar: '2026-05-22',
    status: 'Pending'
  }
];

const INITIAL_REG_SETTINGS = {
  isOpen: true,
  countdownTarget: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // 3 hari dari sekarang
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

// --- LOCAL STORAGE DATA HELPERS (CMS PERSISTENCE WITH ENCRYPTION) ---
function obfuscate(text) {
  try {
    // Simple custom XOR bitwise obfuscation + base64 encoding to prevent plaintext exposure in localStorage
    const b64 = btoa(unescape(encodeURIComponent(text)));
    let result = '';
    for (let i = 0; i < b64.length; i++) {
      result += String.fromCharCode(b64.charCodeAt(i) ^ 18); // XOR with key 18
    }
    return 'SEC_' + result;
  } catch (e) {
    return text;
  }
}

function deobfuscate(text) {
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

function loadData(key, fallbackData) {
  try {
    const rawData = localStorage.getItem(key);
    if (!rawData) {
      saveData(key, fallbackData, false);
      return fallbackData;
    }
    
    // Attempt to deobfuscate if it's secured
    if (rawData.startsWith('SEC_')) {
      const dec = deobfuscate(rawData);
      if (dec) {
        return JSON.parse(dec);
      }
    }
    
    // Fallback: If it's legacy plaintext JSON, parse it, encrypt it, and save it
    try {
      const parsed = JSON.parse(rawData);
      // Transparently migrate legacy data to secure format
      saveData(key, parsed, false);
      return parsed;
    } catch (e) {
      // If it's corrupted, save fallback and return it
      saveData(key, fallbackData, false);
      return fallbackData;
    }
  } catch (e) {
    console.error('LocalStorage load failed:', e);
    return fallbackData;
  }
}

function saveData(key, data, syncToCloud = true) {
  try {
    const serialized = JSON.stringify(data);
    const encrypted = obfuscate(serialized);
    localStorage.setItem(key, encrypted);

    // Centered, transparent synchronization with Cloud Firestore
    if (useFirebase && syncToCloud) {
      if (key === 'robotik_reg_settings') {
        db.collection('settings').doc('registration').set(data)
          .then(() => console.log("Cloud Sync: Registration settings successfully updated!"))
          .catch(err => console.error("Cloud Sync Error: Settings sync failed:", err));
      } else if (key === 'robotik_landing') {
        db.collection('landing').doc('content').set(data)
          .then(() => console.log("Cloud Sync: Landing page content successfully updated!"))
          .catch(err => console.error("Cloud Sync Error: Landing content sync failed:", err));
      }
    }
  } catch (e) {
    console.error('LocalStorage save failed:', e);
    // Graceful error notification if storage is full
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      alert('⚠️ Penyimpanan browser Anda penuh! Perubahan data tidak dapat disimpan secara permanen. Silakan bersihkan riwayat peramban.');
    }
  }
}

// --- CLOUD FIREBASE CONFIGURATION (DUAL-MODE HYBRID PERSISTENCE ENGINE) ---
const firebaseConfig = {
  apiKey: "AIzaSyAQQctyhe_Z9HTiWQLt2MUuYeGMOCE1T5U",
  authDomain: "website-motechart.firebaseapp.com",
  projectId: "website-motechart",
  storageBucket: "website-motechart.firebasestorage.app",
  messagingSenderId: "469005681722",
  appId: "1:469005681722:web:d21d38dae2aa6ef5bfe103"
};

let db = null;
let useFirebase = false;

if (typeof firebase !== 'undefined' && firebaseConfig.projectId !== 'PLACEHOLDER_PROJECT_ID') {
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    useFirebase = true;
    console.log("Motechart Cloud Engine: Firebase Firestore initialized successfully! ☁️");
  } catch (e) {
    console.error("Motechart Cloud Engine: Firebase initialization failed:", e);
  }
}

let blogArticles = loadData('robotik_blog', INITIAL_BLOG_ARTICLES);
// Proactively merge new fields and migrate legacy HTML content from default initial data
let blogModified = false;
blogArticles = blogArticles.map(article => {
  const initial = INITIAL_BLOG_ARTICLES.find(a => a.id === article.id);
  if (initial) {
    let changed = false;
    if (article.headerImage === undefined && initial.headerImage !== undefined) {
      article.headerImage = initial.headerImage;
      changed = true;
    }
    // Migrate legacy HTML or content without headings to rich Markdown
    if (article.content && (article.content.includes('<p>') || !article.content.includes('###'))) {
      article.content = initial.content;
      changed = true;
    }
    if (changed) blogModified = true;
  }
  return article;
});
if (blogModified) {
  saveData('robotik_blog', blogArticles);
}

let portfolioProjects = loadData('robotik_portfolio', INITIAL_PORTFOLIO_PROJECTS);
// Proactively merge new fields and migrate legacy content from default initial data
let portfolioModified = false;
portfolioProjects = portfolioProjects.map(proj => {
  const initial = INITIAL_PORTFOLIO_PROJECTS.find(p => p.id === proj.id);
  if (initial) {
    let changed = false;
    if (proj.headerImage === undefined && initial.headerImage !== undefined) {
      proj.headerImage = initial.headerImage;
      changed = true;
    }
    if (proj.content === undefined && initial.content !== undefined) {
      proj.content = initial.content;
      changed = true;
    }
    // Migrate legacy HTML or content without headings to rich Markdown
    if (proj.content && (proj.content.includes('<p>') || !proj.content.includes('###'))) {
      proj.content = initial.content;
      changed = true;
    }
    if (changed) portfolioModified = true;
  }
  return proj;
});
if (portfolioModified) {
  saveData('robotik_portfolio', portfolioProjects);
}

let applicants = loadData('robotik_applicants', INITIAL_APPLICANTS);
let regSettings = loadData('robotik_reg_settings', INITIAL_REG_SETTINGS);

// --- FIREBASE FIRESTORE SYNC & SEEDING HELPERS ---
async function syncApplicantsFromFirestore() {
  if (!useFirebase) return;
  try {
    const snapshot = await db.collection('applicants').get();
    const fetched = [];
    snapshot.forEach(doc => {
      fetched.push(doc.data());
    });
    applicants = fetched;
    saveData('robotik_applicants', applicants, false); // Cache locally, do not sync to cloud
    console.log(`Cloud sync completed: ${applicants.length} applicants loaded.`);
  } catch (e) {
    console.error("Firestore sync applicants failed:", e);
  }
}

async function syncRegSettingsFromFirestore() {
  if (!useFirebase) return;
  try {
    const doc = await db.collection('settings').doc('registration').get();
    if (doc.exists) {
      regSettings = doc.data();
      saveData('robotik_reg_settings', regSettings, false); // Cache locally, do not sync to cloud
      console.log("Cloud sync completed: Registration settings loaded.");
    } else {
      // Seed initial settings to Firestore
      await db.collection('settings').doc('registration').set(regSettings);
      console.log("Firestore seeded with initial registration settings.");
    }
  } catch (e) {
    console.error("Firestore sync settings failed:", e);
  }
}

async function syncLandingDataFromFirestore() {
  if (!useFirebase) return;
  try {
    const doc = await db.collection('landing').doc('content').get();
    if (doc.exists) {
      landingData = doc.data();
      saveData('robotik_landing', landingData, false); // Cache locally, do not sync to cloud
      console.log("Cloud sync completed: Landing page data loaded.");
    } else {
      // Seed initial landing data to Firestore
      await db.collection('landing').doc('content').set(landingData);
      console.log("Firestore seeded with initial landing page content.");
    }
  } catch (e) {
    console.error("Firestore sync landing data failed:", e);
  }
}

let applicantsUnsubscribe = null;
function setupRealTimeApplicantsSync() {
  if (!useFirebase) return;
  if (applicantsUnsubscribe) return;
  
  try {
    applicantsUnsubscribe = db.collection('applicants').onSnapshot(snapshot => {
      const fetched = [];
      snapshot.forEach(doc => {
        fetched.push(doc.data());
      });
      applicants = fetched;
      saveData('robotik_applicants', applicants, false); // Cache locally, do not sync to cloud
      console.log("Real-time applicants updated from Cloud Firestore!");
      const panelSection = document.getElementById('admin-panel-section');
      if (panelSection && panelSection.style.display !== 'none') {
        renderAdminApplicantsTable();
      }
    });
  } catch (e) {
    console.error("Failed to setup Firestore real-time listener:", e);
  }
}

const INITIAL_LANDING_DATA = {
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
  divMechDesc: 'Merancang struktur fisik robot, penghubung gear, chassis akrilik, 3D printing modeling, dan kestabilan pergerakan mekanis aerodinamis.',
  divElecDesc: 'Menyusun sirkuit sirkulasi daya, penyolderan sensor pintar, perakitan mikrokontroler (Arduino/ESP32), baterai sel, dan sistem aktuator driver.',
  divProgDesc: 'Menulis kode algoritma C++ dan Python, integrasi navigasi sensor otomatis, penyelarasan PID motor, hingga kendali jarak jauh IoT nirkabel.',
  achievements: [
    { title: 'Juara 1 Nasional Kontes Robot Soccer Indonesia', year: '2025' },
    { title: 'Juara 2 Internasional ASEAN Line Follower Championship', year: '2025' },
    { title: 'Juara 1 Provinsi Lomba Karya Cipta IoT Smart City', year: '2026' },
    { title: 'Juara Umum Kompetisi Robotik Kreatif Nasional', year: '2025' }
  ]
};

let landingData = loadData('robotik_landing', INITIAL_LANDING_DATA);

// Defensive check: if loaded data is an empty object or lacks critical fields, re-seed from INITIAL objects
if (!landingData || !landingData.heroTitle || !landingData.achievements) {
  landingData = JSON.parse(JSON.stringify(INITIAL_LANDING_DATA));
  saveData('robotik_landing', landingData, false);
}

if (!regSettings || typeof regSettings.isOpen === 'undefined' || !regSettings.customQuestions) {
  regSettings = JSON.parse(JSON.stringify(INITIAL_REG_SETTINGS));
  saveData('robotik_reg_settings', regSettings, false);
}

// Backfill WhatsApp settings if they don't exist
if (!regSettings.waTitle) {
  regSettings.waTitle = INITIAL_REG_SETTINGS.waTitle;
  regSettings.waDesc = INITIAL_REG_SETTINGS.waDesc;
  regSettings.waLink = INITIAL_REG_SETTINGS.waLink;
  saveData('robotik_reg_settings', regSettings, false);
}

let countdownInterval = null;


// --- SYNTHESIZED WEB AUDIO FEEDBACK ---
let audioCtx = null;
let soundMuted = false;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playRoboticSound(type) {
  if (soundMuted) return;
  
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

// --- CLIENT-SIDE ROUTER ---
function setupRouter() {
  const navLinks = document.querySelectorAll('.nav-link');
  const views = document.querySelectorAll('.page-view');

  function navigateTo(targetViewId, scrollUp = true) {
    const activeView = document.querySelector('.page-view.active');
    if (activeView && activeView.id === targetViewId) return;

    // Secure verification hook for admin dashboard
    if (targetViewId === 'view-admin') {
      const isLogged = sessionStorage.getItem('robotik_admin_logged') === 'true';
      const loginSection = document.getElementById('admin-login-section');
      const panelSection = document.getElementById('admin-panel-section');
      
      if (isLogged) {
        loginSection.style.display = 'none';
        panelSection.style.display = 'block';
        renderAdminBlogTable();
        renderAdminPortfolioTable();
        renderAdminApplicantsTable();
        if (typeof renderAdminQuestionsTable === 'function') {
          renderAdminQuestionsTable();
        }
        const statusToggle = document.getElementById('reg-status-toggle');
        const countdownTargetInput = document.getElementById('reg-countdown-target');
        if (statusToggle && countdownTargetInput) {
          statusToggle.value = regSettings.isOpen ? 'open' : 'closed';
          countdownTargetInput.value = regSettings.countdownTarget || '';
        }
      } else {
        loginSection.style.display = 'block';
        panelSection.style.display = 'none';
      }
    }

    const performTransition = () => {
      views.forEach(v => v.classList.remove('active'));
      navLinks.forEach(l => l.classList.remove('active'));

      const targetView = document.getElementById(targetViewId);
      if (targetView) {
        targetView.classList.add('active');
        window.history.pushState(null, '', `#${targetViewId.replace('view-', '')}`);

        const correspondingLink = document.querySelector(`.nav-link[data-target="${targetViewId}"]`);
        if (correspondingLink) {
          correspondingLink.classList.add('active');
        }

        const heading = targetView.querySelector('h1, h2');
        if (heading) {
          heading.setAttribute('tabindex', '-1');
          heading.focus();
        }
        
        if (scrollUp) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };

    if (document.startViewTransition) {
      document.startViewTransition(performTransition);
    } else {
      performTransition();
    }
    
    playRoboticSound('click');
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-target');
      navigateTo(target);
    });
    link.addEventListener('mouseenter', () => playRoboticSound('hover'));
  });

  window.addEventListener('load', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(`view-${hash}`)) {
      navigateTo(`view-${hash}`, false);
    }
  });

  window.addEventListener('popstate', () => {
    const hash = window.location.hash.replace('#', '') || 'home';
    if (document.getElementById(`view-${hash}`)) {
      navigateTo(`view-${hash}`, false);
    }
  });

  window.appNavigate = navigateTo;
}

// --- PUBLIC BLOG PAGE CONTROLLER ---
let activeCategory = 'all';
let searchQuery = '';

function renderPublicArticles() {
  const blogContainer = document.getElementById('blog-grid');
  if (!blogContainer) return;

  const filtered = blogArticles.filter(article => {
    const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery) ||
                          article.excerpt.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    blogContainer.innerHTML = `
      <div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <path d="M12 2v3M8 3l1 2M16 3l-1 2M12 15h.01" stroke-linecap="round"/>
        </svg>
        <p>Tidak ada artikel robotika yang cocok dengan kriteria pencarian Anda.</p>
      </div>
    `;
    return;
  }

  blogContainer.innerHTML = filtered.map(article => `
    <article class="glass-card blog-card" style="view-transition-name: article-card-${article.id}">
      <div class="blog-card-badge">${article.category.toUpperCase()}</div>
      <div class="blog-card-content">
        <div class="blog-card-meta">${article.date || 'Tgl Hilang'} | Oleh: ${article.author || 'Tim Robotik'}</div>
        <h3 class="blog-card-title">${article.title}</h3>
        <p class="blog-card-excerpt">${article.excerpt}</p>
        <button class="btn btn-secondary btn-sm read-more-btn" data-id="${article.id}">
          Baca Selengkapnya
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: 6px;">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    </article>
  `).join('');

  document.querySelectorAll('.read-more-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'));
      openArticleDetail(id);
    });
    btn.addEventListener('mouseenter', () => playRoboticSound('hover'));
  });
}

// --- LIGHTWEIGHT EMBEDDED MARKDOWN TO HTML PARSER ---
function parseMarkdownToHtml(markdown) {
  if (!markdown) return '';

  // 1. Escape HTML strings for security
  let escaped = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 2. Extract code blocks ```lang ... ``` to placeholders
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

  // 3. Blockquotes
  escaped = escaped.replace(/^\s*>\s+(.+)$/gm, '<blockquote>$1</blockquote>');

  // 4. Headers
  escaped = escaped.replace(/^\s*####\s+(.+)$/gm, '<h4>$1</h4>');
  escaped = escaped.replace(/^\s*###\s+(.+)$/gm, '<h3>$1</h3>');
  escaped = escaped.replace(/^\s*##\s+(.+)$/gm, '<h2>$1</h2>');
  escaped = escaped.replace(/^\s*#\s+(.+)$/gm, '<h1>$1</h1>');

  // 5. Unordered lists: convert lines starting with - or *
  escaped = escaped.replace(/^\s*[\-\*]\s+(.+)$/gm, '<li>$1</li>');
  escaped = escaped.replace(/(?:^\s*<li>.*?<\/li>\s*)+/gm, (match) => {
    return `<ul>\n${match}</ul>\n`;
  });

  // 6. Ordered lists: convert lines starting with numbers
  escaped = escaped.replace(/^\s*\d+\.\s+(.+)$/gm, '<ol-item>$1</ol-item>');
  escaped = escaped.replace(/(?:^\s*<ol-item>.*?<\/ol-item>\s*)+/gm, (match) => {
    return `<ol>\n${match.replace(/<ol-item>/g, '<li>').replace(/<\/ol-item>/g, '</li>')}</ol>\n`;
  });

  // 7. Paragraphs: split by double newlines or more
  const paragraphs = escaped.split(/\n\s*\n+/);
  const processed = paragraphs.map(p => {
    const trimmed = p.trim();
    if (!trimmed) return '';
    // If it's already an HTML block tag, don't wrap in <p>
    if (/^(<h[1-6]|<ul|<ol|<blockquote|<pre|<li>|__CODE_BLOCK_)/.test(trimmed)) {
      return trimmed;
    }
    return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
  });
  escaped = processed.join('\n\n');

  // 8. Inline formatting
  // Bold: **text** or __text__
  escaped = escaped.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
  escaped = escaped.replace(/__([^__]+)__/g, '<strong>$1</strong>');

  // Italic: *text* or _text_
  escaped = escaped.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
  escaped = escaped.replace(/_([^_]+)_/g, '<em>$1</em>');

  // Inline code: `code`
  escaped = escaped.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Links: [text](url)
  escaped = escaped.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Images: ![alt](url)
  escaped = escaped.replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="blog-img">');

  // 9. Restore code blocks
  codeBlocks.forEach((block, idx) => {
    escaped = escaped.replace(`__CODE_BLOCK_${idx}__`, block);
  });

  return escaped;
}

// --- DYNAMIC TABLE OF CONTENTS GENERATOR ---
function generateTableOfContents(dialogElement) {
  const richText = dialogElement.querySelector('.dialog-rich-text');
  const tocContainer = dialogElement.querySelector('.dialog-toc-container');
  const tocList = dialogElement.querySelector('.toc-list');
  if (!richText || !tocContainer || !tocList) return;

  // Find all headings (h2 and h3) inside the rich text
  const headings = richText.querySelectorAll('h2, h3');
  if (headings.length === 0) {
    tocContainer.style.display = 'none';
    return;
  }

  // Clear previous list
  tocList.innerHTML = '';
  tocContainer.style.display = 'block';

  headings.forEach((heading, index) => {
    // Generate unique ID
    const headingId = `heading-${index}`;
    heading.setAttribute('id', headingId);
    heading.style.scrollMarginTop = '2rem'; // ensure scrolling has padding

    // Create TOC item
    const li = document.createElement('li');
    li.style.paddingLeft = heading.tagName === 'H3' ? '0.75rem' : '0';
    
    const a = document.createElement('a');
    a.href = `#${headingId}`;
    a.textContent = heading.textContent.replace(/[🤖💻🛠️📋🔗📷]/g, '').trim(); // strip emojis for cleaner menu
    a.style.color = heading.tagName === 'H3' ? 'var(--text-muted)' : 'var(--text-light)';
    a.style.textDecoration = 'none';
    a.style.transition = 'var(--transition-smooth)';
    a.style.display = 'block';
    a.style.lineHeight = '1.3';
    
    // Add active tracking state
    a.addEventListener('click', (e) => {
      e.preventDefault();
      playRoboticSound('click');
      
      // Smooth scroll inside dialog
      heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Set active visual state
      tocList.querySelectorAll('a').forEach(link => {
        link.style.color = link.parentNode.style.paddingLeft ? 'var(--text-muted)' : 'var(--text-light)';
        link.style.fontWeight = 'normal';
      });
      a.style.color = 'var(--accent-cyan)';
      a.style.fontWeight = 'bold';
    });

    a.addEventListener('mouseenter', () => {
      a.style.color = 'var(--accent-cyan)';
    });
    a.addEventListener('mouseleave', () => {
      if (a.style.fontWeight !== 'bold') {
        a.style.color = heading.tagName === 'H3' ? 'var(--text-muted)' : 'var(--text-light)';
      }
    });

    li.appendChild(a);
    tocList.appendChild(li);
  });
}

function openArticleDetail(id) {
  const article = blogArticles.find(a => String(a.id) === String(id));
  if (!article) return;

  playRoboticSound('click');
  const detailDialog = document.getElementById('blog-detail-dialog');
  
  const bgStyle = article.headerImage ? `style="background-image: url('${article.headerImage}')"` : '';
  const bannerClass = article.headerImage ? 'dialog-header-banner' : 'dialog-header-banner no-image';

  detailDialog.innerHTML = `
    <div class="dialog-close-bar floating">
      <button type="button" class="btn-close" aria-label="Tutup Detail Artikel">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    
    <div class="${bannerClass}" ${bgStyle}></div>
    
    <div class="dialog-body-container">
      <div class="dialog-title-card">
        <div class="dialog-meta">${article.date || ''} | Oleh: ${article.author || 'Tim Robotik'}</div>
        <h2 class="dialog-title" style="margin-top: 0.5rem; margin-bottom: 0.75rem; color: var(--text-white); font-size: 2.25rem;">${article.title}</h2>
        <div class="dialog-badge">${article.category.toUpperCase()}</div>
      </div>
      
      <div class="dialog-grid-container">
        <!-- Table of Contents Sidebar -->
        <aside class="dialog-toc-container">
          <div class="dialog-toc-sticky">
            <h4>Daftar Isi 📖</h4>
            <ul class="toc-list"></ul>
          </div>
        </aside>

        <!-- Main Content Area -->
        <div class="dialog-content-area">
          <div class="dialog-rich-text">
            ${parseMarkdownToHtml(article.content)}
          </div>
        </div>
      </div>
    </div>
  `;

  // Bind close click event
  const closeBtn = detailDialog.querySelector('.btn-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      playRoboticSound('click');
      detailDialog.close();
      document.body.classList.remove('dialog-open');
    });
  }

  // Generate interactive Table of Contents
  generateTableOfContents(detailDialog);

  detailDialog.showModal();
  document.body.classList.add('dialog-open');
}

function setupBlog() {
  const searchInput = document.getElementById('blog-search');
  const categoryFilters = document.querySelectorAll('.blog-filter-btn');
  const detailDialog = document.getElementById('blog-detail-dialog');
  const closeDialogBtn = document.getElementById('close-dialog-btn');

  function closeArticleDetail() {
    playRoboticSound('click');
    detailDialog.close();
    document.body.classList.remove('dialog-open');
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase();
      renderPublicArticles();
    });
  }

  categoryFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-category');
      playRoboticSound('click');
      renderPublicArticles();
    });
    btn.addEventListener('mouseenter', () => playRoboticSound('hover'));
  });

  if (closeDialogBtn) closeDialogBtn.addEventListener('click', closeArticleDetail);
  if (detailDialog) {
    detailDialog.addEventListener('cancel', () => {
      document.body.classList.remove('dialog-open');
    });
    detailDialog.addEventListener('click', (e) => {
      const rect = detailDialog.getBoundingClientRect();
      const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
      if (!isInDialog) {
        closeArticleDetail();
      }
    });
  }

  renderPublicArticles();
}

// --- PUBLIC PORTFOLIO PAGE CONTROLLER ---
function renderPublicPortfolio() {
  const portfolioContainer = document.getElementById('portfolio-grid');
  if (!portfolioContainer) return;

  portfolioContainer.innerHTML = portfolioProjects.map(proj => {
    const cardBg = proj.headerImage ? `style="background-image: linear-gradient(rgba(11, 17, 32, 0.75), rgba(11, 17, 32, 0.95)), url('${proj.headerImage}'); background-size: cover; background-position: center;"` : '';
    return `
      <div class="glass-card portfolio-card" ${cardBg}>
        <div class="portfolio-header">
          <span class="portfolio-badge badge-${proj.status === 'Selesai' ? 'success' : 'progress'}">${proj.status}</span>
          <span class="portfolio-category">${proj.category.toUpperCase()}</span>
        </div>
        <h3 class="portfolio-title">${proj.title}</h3>
        <div class="portfolio-meta">
          <strong>Pembuat:</strong> ${proj.creators}
        </div>
        <div class="portfolio-meta">
          <strong>Komponen:</strong> ${proj.components}
        </div>
        <div class="portfolio-meta">
          <strong>Spesifikasi:</strong> ${proj.specs}
        </div>
        
        <button class="btn btn-outline-cyan btn-sm btn-block view-project-detail-btn" data-id="${proj.id}" style="margin-top: 1.5rem;">
          Lihat Proyek & Kode Arduino 🛠️
        </button>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.view-project-detail-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'));
      openPortfolioDetail(id);
    });
    btn.addEventListener('mouseenter', () => playRoboticSound('hover'));
  });
}

function openPortfolioDetail(id) {
  const proj = portfolioProjects.find(p => String(p.id) === String(id));
  if (!proj) return;

  playRoboticSound('click');
  const detailDialog = document.getElementById('portfolio-detail-dialog');
  
  const bgStyle = proj.headerImage ? `style="background-image: url('${proj.headerImage}')"` : '';
  const bannerClass = proj.headerImage ? 'dialog-header-banner' : 'dialog-header-banner no-image';

  detailDialog.innerHTML = `
    <div class="dialog-close-bar floating">
      <button type="button" class="btn-close" aria-label="Tutup Detail Proyek">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    
    <div class="${bannerClass}" ${bgStyle}></div>
    
    <div class="dialog-body-container">
      <div class="dialog-title-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
          <span class="portfolio-badge badge-${proj.status === 'Selesai' ? 'success' : 'progress'}">${proj.status}</span>
          <span class="portfolio-category" style="color: var(--accent-cyan); font-weight: bold; letter-spacing: 1.2px;">${proj.category.toUpperCase()}</span>
        </div>
        <h2 class="dialog-title" style="margin-top: 0.5rem; margin-bottom: 1.5rem; color: var(--text-white); font-size: 2.25rem;">${proj.title}</h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 1.5rem;">
          <div>
            <strong style="color: var(--accent-yellow); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 0.25rem;">Pembuat Siswa</strong>
            <span style="font-size: 0.95rem; color: var(--text-light);">${proj.creators}</span>
          </div>
          <div>
            <strong style="color: var(--accent-yellow); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 0.25rem;">Komponen Utama</strong>
            <span style="font-size: 0.95rem; color: var(--text-light);">${proj.components}</span>
          </div>
          <div>
            <strong style="color: var(--accent-yellow); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 0.25rem;">Spesifikasi Fisik</strong>
            <span style="font-size: 0.95rem; color: var(--text-light);">${proj.specs}</span>
          </div>
        </div>
      </div>
      
      <div class="dialog-grid-container">
        <!-- Table of Contents Sidebar -->
        <aside class="dialog-toc-container">
          <div class="dialog-toc-sticky">
            <h4>Daftar Isi 📖</h4>
            <ul class="toc-list"></ul>
          </div>
        </aside>

        <!-- Main Content Area -->
        <div class="dialog-content-area">
          <div class="dialog-rich-text">
            <h3 style="color: var(--accent-cyan); font-size: 1.5rem; margin-bottom: 1.25rem;">Deskripsi Detail Proyek 🤖</h3>
            ${parseMarkdownToHtml(proj.content || '*Belum ada deskripsi mendalam.*')}
            
            <h3 style="margin-top: 3.5rem; margin-bottom: 1.25rem; color: var(--accent-cyan); font-size: 1.5rem;">Skema & Kode Pemrograman Robot 💻</h3>
            
            <div class="code-viewer-container open" style="display: block; max-height: none; margin-top: 1.5rem; background: #020617; border: 1px solid var(--border-glass); border-radius: var(--radius-md); overflow: hidden; position: relative;">
              <button class="btn-copy-code" id="btn-copy-arduino-code" title="Salin Kode Arduino">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span>Salin</span>
              </button>
              <div class="viewer-tabs" style="display: flex; background: rgba(255,255,255,0.03); border-bottom: 1px solid var(--border-glass);">
                <button class="viewer-tab active" data-tab="code" style="flex: 1; background: transparent; border: none; border-bottom: 2px solid transparent; padding: 1rem; color: var(--text-muted); font-family: var(--font-heading); font-weight: 600; cursor: pointer; text-align: center; transition: var(--transition-smooth);">Arduino C++ Code</button>
                <button class="viewer-tab" data-tab="schematic" style="flex: 1; background: transparent; border: none; border-bottom: 2px solid transparent; padding: 1rem; color: var(--text-muted); font-family: var(--font-heading); font-weight: 600; cursor: pointer; text-align: center; transition: var(--transition-smooth);">Fisik & Koneksi</button>
              </div>
              <div class="viewer-content active" data-content="code" style="padding: 1.5rem; display: block; overflow-y: auto;">
                <pre style="margin: 0;"><code style="font-family: monospace; font-size: 0.9rem; color: #a7f3d0; white-space: pre-wrap;">${escapeHtml(proj.code)}</code></pre>
              </div>
              <div class="viewer-content" data-content="schematic" style="padding: 1.5rem; display: none; overflow-y: auto;">
                <div class="schematic-mock" style="display: flex; gap: 1.5rem; align-items: flex-start;">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FACC15" stroke-width="1.5" style="flex-shrink: 0;">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <circle cx="8" cy="10" r="2" />
                    <circle cx="16" cy="10" r="2" />
                    <path d="M6 16h12" />
                  </svg>
                  <div class="schematic-info">
                    <h4 style="color: var(--accent-yellow); font-size: 1.15rem; margin-bottom: 0.5rem; font-family: var(--font-heading);">Diagram Sirkuit & Pinout Robot</h4>
                    <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1rem;">Gunakan pinout koneksi mikroprosesor berikut untuk perakitan fisik:</p>
                    <ul style="color: var(--text-muted); padding-left: 1.25rem; font-size: 0.95rem; display: flex; flex-direction: column; gap: 0.5rem;">
                      <li><strong>VCC</strong> -> Baterai Li-Ion 7.4V (via Regulator Tegangan LM7805)</li>
                      <li><strong>GND</strong> -> Ground Bersama (Baterai & Papan Controller)</li>
                      <li><strong>Sensor I/O</strong> -> Analog Pins A0, A1, A2 (Kiri, Tengah, Kanan)</li>
                      <li><strong>Motor Driver EnA/EnB</strong> -> PWM Pins D5, D6 (Pemicu Kecepatan Motor)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Bind close click event
  const closeBtn = detailDialog.querySelector('.btn-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      playRoboticSound('click');
      detailDialog.close();
      document.body.classList.remove('dialog-open');
    });
  }

  // Bind copy code button click & tab show/hide
  const copyBtn = detailDialog.querySelector('#btn-copy-arduino-code');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(proj.code).then(() => {
        playRoboticSound('success');
        copyBtn.classList.add('success');
        const btnText = copyBtn.querySelector('span');
        const btnSvg = copyBtn.querySelector('svg');
        
        if (btnText) btnText.textContent = 'Tersalin! ✔️';
        if (btnSvg) {
          btnSvg.setAttribute('viewBox', '0 0 24 24');
          btnSvg.innerHTML = '<polyline points="20 6 9 17 4 12"></polyline>';
        }
        
        setTimeout(() => {
          copyBtn.classList.remove('success');
          if (btnText) btnText.textContent = 'Salin';
          if (btnSvg) {
            btnSvg.setAttribute('viewBox', '0 0 24 24');
            btnSvg.innerHTML = `
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            `;
          }
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy code: ', err);
        playRoboticSound('error');
      });
    });
  }

  // Bind tab click event inside full-screen modal
  const tabs = detailDialog.querySelectorAll('.viewer-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      playRoboticSound('click');
      const targetTab = tab.getAttribute('data-tab');
      
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      if (copyBtn) {
        if (targetTab === 'code') {
          copyBtn.style.display = 'inline-flex';
        } else {
          copyBtn.style.display = 'none';
        }
      }
      
      detailDialog.querySelectorAll('.viewer-content').forEach(content => {
        if (content.getAttribute('data-content') === targetTab) {
          content.style.display = 'block';
        } else {
          content.style.display = 'none';
        }
      });
    });
  });

  // Generate interactive Table of Contents
  generateTableOfContents(detailDialog);

  detailDialog.showModal();
  document.body.classList.add('dialog-open');
}

function setupPortfolio() {
  const detailDialog = document.getElementById('portfolio-detail-dialog');
  if (detailDialog) {
    detailDialog.addEventListener('cancel', () => {
      document.body.classList.remove('dialog-open');
    });
    detailDialog.addEventListener('click', (e) => {
      const rect = detailDialog.getBoundingClientRect();
      const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
      if (!isInDialog) {
        playRoboticSound('click');
        detailDialog.close();
        document.body.classList.remove('dialog-open');
      }
    });
  }

  renderPublicPortfolio();
}

function sanitizeInput(text) {
  if (typeof text !== 'string') return text;
  // Rigorously strip any HTML tags to prevent XSS injections
  return text.replace(/<[^>]*>/g, '').trim();
}

function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// --- MULTI-STEP REGISTRATION FORM ---
function setupRegistrationForm() {
  const form = document.getElementById('robotics-reg-form');
  if (!form) return;

  const steps = document.querySelectorAll('.form-step-content');
  const stepIndicators = document.querySelectorAll('.step-track');
  const btnNext1 = document.getElementById('btn-next-1');
  const btnNext2 = document.getElementById('btn-next-2');
  const btnPrev2 = document.getElementById('btn-prev-2');
  const btnPrev3 = document.getElementById('btn-prev-3');
  const formContainer = document.getElementById('reg-form-container');
  const successCard = document.getElementById('reg-success-card');

  let currentStep = 1;

  const validationRules = {
    'nama_lengkap': {
      required: true,
      pattern: /^[a-zA-Z\s]{2,50}$/,
      errorMessage: 'Nama lengkap wajib diisi (minimal 2 huruf, hanya huruf alfabet dan spasi).'
    },
    'nisn': {
      required: true,
      pattern: /^\d{10}$/,
      errorMessage: 'NISN harus berupa 10 digit angka numerik.'
    },
    'no_hp': {
      required: true,
      pattern: /^(08|\+62)[0-9]{8,12}$/,
      errorMessage: 'Nomor WhatsApp tidak valid (format Indonesia: dimulai 08 atau +62, panjang 10-14 digit numerik).'
    },
    'motivasi': {
      required: true,
      minlength: 10,
      errorMessage: 'Berikan motivasi yang jelas (minimal 10 karakter).'
    }
  };

  Object.keys(validationRules).forEach(fieldId => {
    const input = document.getElementById(fieldId);
    if (!input) return;

    input.addEventListener('blur', () => {
      validateField(input);
    });

    input.addEventListener('input', () => {
      clearFieldError(input);
      if (fieldId === 'motivasi') {
        const charCount = document.getElementById('char-count');
        if (charCount) {
          const charsLeft = 10 - input.value.length;
          if (charsLeft > 0) {
            charCount.textContent = `(${charsLeft} karakter lagi)`;
            charCount.style.color = 'var(--text-muted)';
          } else {
            charCount.textContent = '(Persyaratan terpenuhi)';
            charCount.style.color = '#FACC15';
          }
        }
      }
    });
  });

  const motivasiInput = document.getElementById('motivasi');

  function validateField(input) {
    const rule = validationRules[input.id];
    if (!rule) return true;

    let isValid = true;
    const value = input.value.trim();

    if (rule.required && !value) {
      isValid = false;
    } else if (rule.pattern && !rule.pattern.test(value)) {
      isValid = false;
    } else if (rule.minlength && value.length < rule.minlength) {
      isValid = false;
    }

    if (!isValid) {
      showFieldError(input, rule.errorMessage);
      return false;
    } else {
      clearFieldError(input);
      return true;
    }
  }

  function showFieldError(input, message) {
    const group = input.closest('.form-group');
    group.classList.add('has-error');
    
    let errorSpan = group.querySelector('.error-message');
    if (!errorSpan) {
      errorSpan = document.createElement('span');
      errorSpan.className = 'error-message';
      group.appendChild(errorSpan);
    }
    errorSpan.textContent = message;
    errorSpan.setAttribute('aria-live', 'assertive');
  }

  function clearFieldError(input) {
    const group = input.closest('.form-group');
    group.classList.remove('has-error');
    const errorSpan = group.querySelector('.error-message');
    if (errorSpan) {
      group.removeChild(errorSpan);
    }
  }

  function validateStep(stepNum) {
    let stepValid = true;
    
    if (stepNum === 1) {
      const f1 = document.getElementById('nama_lengkap');
      const f2 = document.getElementById('nisn');
      const f3 = document.getElementById('no_hp');
      
      const v1 = validateField(f1);
      const v2 = validateField(f2);
      const v3 = validateField(f3);
      
      stepValid = v1 && v2 && v3;
    } else if (stepNum === 2) {
      const motivasi = document.getElementById('motivasi');
      const vMotiv = validateField(motivasi);
      
      stepValid = vMotiv;

      // Validasi pertanyaan kustom yang wajib diisi (required)
      let customValid = true;
      if (regSettings.customQuestions) {
        regSettings.customQuestions.forEach(q => {
          if (q.required) {
            if (q.type === 'text' || q.type === 'select') {
              const input = document.getElementById(q.id);
              if (input && !input.value.trim()) {
                customValid = false;
                const group = input.closest('.form-group');
                group.classList.add('has-error');
                let errorSpan = group.querySelector('.error-message');
                if (!errorSpan) {
                  errorSpan = document.createElement('span');
                  errorSpan.className = 'error-message';
                  group.appendChild(errorSpan);
                }
                errorSpan.textContent = 'Pertanyaan wajib diisi.';
              } else if (input) {
                const group = input.closest('.form-group');
                group.classList.remove('has-error');
                const errorSpan = group.querySelector('.error-message');
                if (errorSpan) group.removeChild(errorSpan);
              }
            } else if (q.type === 'radio') {
              const checkedRadio = document.querySelector(`input[name="${q.id}"]:checked`);
              if (!checkedRadio) {
                customValid = false;
                const firstRadio = document.getElementById(`${q.id}-0`);
                const radioContainer = firstRadio ? firstRadio.closest('.form-group') : null;
                if (radioContainer) {
                  radioContainer.classList.add('has-error');
                  let errorSpan = radioContainer.querySelector('.error-message');
                  if (!errorSpan) {
                    errorSpan = document.createElement('span');
                    errorSpan.className = 'error-message';
                    radioContainer.appendChild(errorSpan);
                  }
                  errorSpan.textContent = 'Pilih salah satu jawaban.';
                }
              } else {
                const firstRadio = document.getElementById(`${q.id}-0`);
                const radioContainer = firstRadio ? firstRadio.closest('.form-group') : null;
                if (radioContainer) {
                  radioContainer.classList.remove('has-error');
                  const errorSpan = radioContainer.querySelector('.error-message');
                  if (errorSpan) radioContainer.removeChild(errorSpan);
                }
              }
            }
          }
        });
      }
      stepValid = stepValid && customValid;
    }

    if (!stepValid) {
      playRoboticSound('error');
    }
    return stepValid;
  }

  function renderStep(stepNum) {
    steps.forEach(s => s.classList.remove('active'));
    document.getElementById(`form-step-${stepNum}`).classList.add('active');

    stepIndicators.forEach((ind, idx) => {
      ind.classList.remove('active', 'completed');
      if (idx + 1 === stepNum) {
        ind.classList.add('active');
        ind.setAttribute('aria-current', 'step');
      } else if (idx + 1 < stepNum) {
        ind.classList.add('completed');
      }
    });

    if (stepNum === 3) {
      populateConfirmation();
    }
  }

  function populateConfirmation() {
    const nama = document.getElementById('nama_lengkap').value;
    const kelas = document.querySelector('input[name="kelas"]:checked')?.value || '-';
    const nisn = document.getElementById('nisn').value;
    const noHp = document.getElementById('no_hp').value;
    const laptop = document.querySelector('input[name="laptop"]:checked')?.value || 'Tidak';
    


    const motivasi = document.getElementById('motivasi').value;
    const summaryContainer = document.getElementById('confirmation-summary');

    let customSummaryHtml = '';
    if (regSettings.customQuestions) {
      regSettings.customQuestions.forEach(q => {
        let ans = '-';
        if (q.type === 'text' || q.type === 'select') {
          const input = document.getElementById(q.id);
          if (input && input.value.trim()) ans = input.value.trim();
        } else if (q.type === 'radio') {
          const checkedRadio = document.querySelector(`input[name="${q.id}"]:checked`);
          if (checkedRadio) ans = checkedRadio.value;
        }
        customSummaryHtml += `<div class="summary-item block"><strong>${q.label}:</strong> <span>${ans}</span></div>`;
      });
    }
    
    summaryContainer.innerHTML = `
      <div class="summary-item"><strong>Nama Lengkap:</strong> <span>${nama}</span></div>
      <div class="summary-item"><strong>Kelas:</strong> <span>Kelas ${kelas}</span></div>
      <div class="summary-item"><strong>NISN:</strong> <span>${nisn}</span></div>
      <div class="summary-item"><strong>No. WhatsApp:</strong> <span>${noHp}</span></div>
      <div class="summary-item"><strong>Punya Laptop:</strong> <span>${laptop}</span></div>
      <div class="summary-item block"><strong>Motivasi:</strong> <p>${motivasi}</p></div>
      ${customSummaryHtml}
    `;
  }

  btnNext1.addEventListener('click', () => {
    if (validateStep(1)) {
      currentStep = 2;
      renderStep(currentStep);
      playRoboticSound('click');
    }
  });

  btnNext2.addEventListener('click', () => {
    if (validateStep(2)) {
      currentStep = 3;
      renderStep(currentStep);
      playRoboticSound('click');
    }
  });

  btnPrev2.addEventListener('click', () => {
    currentStep = 1;
    renderStep(currentStep);
    playRoboticSound('click');
  });

  btnPrev3.addEventListener('click', () => {
    currentStep = 2;
    renderStep(currentStep);
    playRoboticSound('click');
  });



  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Memproses Enkripsi Data...';

    playRoboticSound('success');

    setTimeout(() => {
      const rawNama = document.getElementById('nama_lengkap').value;
      const kelasSiswa = document.querySelector('input[name="kelas"]:checked')?.value || 'X';
      const rawNoHp = document.getElementById('no_hp').value;
      const regId = 'ROBO-' + Math.floor(100000 + Math.random() * 900000);

      // Sanitize registration input values
      const namaSiswa = sanitizeInput(rawNama);
      const noHpSiswa = sanitizeInput(rawNoHp);
      const nisnSiswa = sanitizeInput(document.getElementById('nisn').value);
      const motivasiSiswa = sanitizeInput(document.getElementById('motivasi').value);

      // Populate review pending elements
      const studentNameEl = document.getElementById('registered-student-name');
      const studentPhoneEl = document.getElementById('registered-student-phone');
      const studentIdEl = document.getElementById('registered-student-id');
      if (studentNameEl) studentNameEl.textContent = namaSiswa;
      if (studentPhoneEl) studentPhoneEl.textContent = noHpSiswa;
      if (studentIdEl) studentIdEl.textContent = regId;

      // Update student card contents for future approval display
      const cardNameEl = document.getElementById('card-student-name');
      const cardClassEl = document.getElementById('card-student-class');
      const cardIdEl = document.getElementById('card-student-id');
      if (cardNameEl) cardNameEl.textContent = namaSiswa;
      if (cardClassEl) cardClassEl.textContent = 'KELAS ' + kelasSiswa;
      if (cardIdEl) cardIdEl.textContent = regId;

      // Toggle pending review display active, hide approved student card display
      const pendingWrapper = document.getElementById('review-pending-wrapper');
      const approvedWrapper = document.getElementById('card-approved-wrapper');
      if (pendingWrapper) pendingWrapper.style.display = 'block';
      if (approvedWrapper) approvedWrapper.style.display = 'none';

      // Kumpulkan jawaban pertanyaan kustom
      const customAnswers = {};
      if (regSettings.customQuestions) {
        regSettings.customQuestions.forEach((q) => {
          if (q.type === 'text' || q.type === 'select') {
            const input = document.getElementById(q.id);
            if (input) customAnswers[q.id] = sanitizeInput(input.value);
          } else if (q.type === 'radio') {
            const checkedRadio = document.querySelector(`input[name="${q.id}"]:checked`);
            if (checkedRadio) customAnswers[q.id] = sanitizeInput(checkedRadio.value);
          }
        });
      }

      // Save as Pending Applicant to localStorage database
      const newApplicant = {
        id: regId,
        nama: namaSiswa,
        kelas: kelasSiswa,
        nisn: nisnSiswa,
        noHp: noHpSiswa,
        laptop: document.querySelector('input[name="laptop"]:checked')?.value || 'Tidak',
        divisi: [],
        motivasi: motivasiSiswa,
        tanggalDaftar: new Date().toISOString().split('T')[0],
        status: 'Pending',
        customAnswers: customAnswers
      };

      applicants.push(newApplicant);
      saveData('robotik_applicants', applicants);

      if (useFirebase) {
        db.collection('applicants').doc(regId).set(newApplicant)
          .then(() => console.log("Applicant successfully saved to Cloud Firestore!"))
          .catch(err => console.error("Firestore save applicant failed:", err));
      }

      // Refresh admin table
      renderAdminApplicantsTable();

      // Show success screen and scroll
      formContainer.style.display = 'none';
      successCard.style.display = 'block';
      
      triggerVisualSuccess();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1200);
  });
}

function triggerVisualSuccess() {
  const successCard = document.getElementById('reg-success-card');
  if (successCard) {
    successCard.classList.add('glow-spark');
    setTimeout(() => {
      successCard.classList.remove('glow-spark');
    }, 2000);
  }
}

// --- CMS & SECURITY MODULE CONTROLLER ---

// Render Admin Blog Table Content
function renderAdminBlogTable() {
  const tableBody = document.getElementById('admin-blog-table-body');
  if (!tableBody) return;

  if (blogArticles.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Tidak ada artikel blog. Silakan tambah baru.</td></tr>`;
    return;
  }

  tableBody.innerHTML = blogArticles.map((article, index) => `
    <tr>
      <td>${index + 1}</td>
      <td style="font-weight: 600; color: var(--text-white);">${article.title}</td>
      <td><span class="table-badge">${article.category.toUpperCase()}</span></td>
      <td>${article.date || '-'}</td>
      <td>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-outline-cyan btn-sm edit-blog-btn" data-id="${article.id}" aria-label="Ubah Artikel">Edit</button>
          <button class="btn btn-secondary btn-sm delete-blog-btn" data-id="${article.id}" style="border-color: rgba(244,63,94,0.3); color: #FB7185;" aria-label="Hapus Artikel">Hapus</button>
        </div>
      </td>
    </tr>
  `).join('');

  // Bind edit buttons
  document.querySelectorAll('.edit-blog-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      openCmsEditor('blog', 'edit', id);
    });
    btn.addEventListener('mouseenter', () => playRoboticSound('hover'));
  });

  // Bind delete buttons
  document.querySelectorAll('.delete-blog-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Apakah Anda yakin ingin menghapus artikel blog ini?')) {
        playRoboticSound('click');
        blogArticles = blogArticles.filter(a => String(a.id) !== String(id));
        saveData('robotik_blog', blogArticles);
        renderAdminBlogTable();
        renderPublicArticles();
      } else {
        playRoboticSound('error');
      }
    });
    btn.addEventListener('mouseenter', () => playRoboticSound('hover'));
  });
}

// Render Admin Portfolio Table Content
function renderAdminPortfolioTable() {
  const tableBody = document.getElementById('admin-portfolio-table-body');
  if (!tableBody) return;

  if (portfolioProjects.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Tidak ada proyek portfolio. Silakan tambah baru.</td></tr>`;
    return;
  }

  tableBody.innerHTML = portfolioProjects.map((proj, index) => `
    <tr>
      <td>${index + 1}</td>
      <td style="font-weight: 600; color: var(--text-white);">${proj.title}</td>
      <td><span class="table-badge">${proj.category.toUpperCase()}</span></td>
      <td><span class="portfolio-badge badge-${proj.status === 'Selesai' ? 'success' : 'progress'}">${proj.status}</span></td>
      <td>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-outline-cyan btn-sm edit-portfolio-btn" data-id="${proj.id}" aria-label="Ubah Proyek">Edit</button>
          <button class="btn btn-secondary btn-sm delete-portfolio-btn" data-id="${proj.id}" style="border-color: rgba(244,63,94,0.3); color: #FB7185;" aria-label="Hapus Proyek">Hapus</button>
        </div>
      </td>
    </tr>
  `).join('');

  // Bind edit buttons
  document.querySelectorAll('.edit-portfolio-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      openCmsEditor('portfolio', 'edit', id);
    });
    btn.addEventListener('mouseenter', () => playRoboticSound('hover'));
  });

  // Bind delete buttons
  document.querySelectorAll('.delete-portfolio-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Apakah Anda yakin ingin menghapus proyek portfolio ini?')) {
        playRoboticSound('click');
        portfolioProjects = portfolioProjects.filter(p => String(p.id) !== String(id));
        saveData('robotik_portfolio', portfolioProjects);
        renderAdminPortfolioTable();
        renderPublicPortfolio();
      } else {
        playRoboticSound('error');
      }
    });
    btn.addEventListener('mouseenter', () => playRoboticSound('hover'));
  });
}

// Global CMS dynamic form renderer
function openCmsEditor(type, mode, id = null) {
  playRoboticSound('click');
  const dialog = document.getElementById('cms-editor-dialog');
  const form = document.getElementById('cms-editor-form');
  const title = document.getElementById('cms-dialog-title');
  const container = document.getElementById('cms-form-fields-container');

  // Store metadata tags on form
  form.setAttribute('data-type', type);
  form.setAttribute('data-mode', mode);
  if (id) form.setAttribute('data-id', id);

  if (type === 'blog') {
    title.textContent = mode === 'add' ? 'Tambah Artikel Blog Baru' : 'Ubah Artikel Blog';
    const article = mode === 'edit' ? (blogArticles.find(a => String(a.id) === String(id)) || {}) : {};
    
    container.innerHTML = `
      <div class="form-group">
        <label class="form-label" for="edit-title">Judul Artikel <span>*</span></label>
        <input type="text" id="edit-title" class="input-control" required value="${article.title || ''}" placeholder="Masukkan judul menarik...">
      </div>
      <div class="form-group">
        <label class="form-label" for="edit-category">Kategori <span>*</span></label>
        <select id="edit-category" class="input-control" required style="appearance: auto;">
          <option value="arduino" ${article.category === 'arduino' ? 'selected' : ''}>Arduino</option>
          <option value="tutorial" ${article.category === 'tutorial' ? 'selected' : ''}>Tutorial Perakitan</option>
          <option value="iot" ${article.category === 'iot' ? 'selected' : ''}>IoT (Internet of Things)</option>
          <option value="kompetisi" ${article.category === 'kompetisi' ? 'selected' : ''}>Tips Kompetisi</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="edit-author">Penulis <span>*</span></label>
        <input type="text" id="edit-author" class="input-control" required value="${article.author || 'Tim Mentor Robotik'}" placeholder="Nama penulis atau mentor...">
      </div>
      <div class="form-group">
        <label class="form-label" for="edit-header-image">URL Gambar Header (Foto Sampul)</label>
        <div style="display: flex; gap: 0.75rem; align-items: flex-start; margin-bottom: 0.5rem;">
          <input type="text" id="edit-header-image" class="input-control" value="${article.headerImage || ''}" placeholder="Tautan foto Unsplash, Imgur, atau URL gambar..." style="flex: 1; margin-bottom: 0;">
          <button type="button" id="btn-upload-local" class="btn btn-secondary" style="white-space: nowrap; height: 42px; display: inline-flex; align-items: center; justify-content: center; gap: 0.35rem; padding: 0.5rem 0.75rem; font-size: 0.85rem;">
            Pilih File 📁
          </button>
        </div>
        <input type="file" id="edit-image-file" accept="image/*" style="display: none;">
        <div id="upload-preview-container" style="display: flex; gap: 1rem; align-items: center; margin-top: 0.5rem;">
          <div class="img-upload-preview" id="edit-image-preview"></div>
          <span id="upload-status" style="font-size: 0.8rem; color: var(--text-muted);"></span>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="edit-excerpt">Ringkasan Singkat (Excerpt) <span>*</span></label>
        <textarea id="edit-excerpt" class="input-control" required placeholder="Tulis deskripsi 1-2 baris untuk kartu list artikel...">${article.excerpt || ''}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label" for="edit-content">Konten Lengkap (Format Markdown) <span>*</span></label>
        
        <!-- Markdown Helper Toolbar -->
        <div class="markdown-toolbar" style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem; flex-wrap: wrap; background: rgba(2, 6, 23, 0.45); border: 1px solid rgba(255, 255, 255, 0.08); padding: 0.5rem; border-radius: var(--radius-md);">
          <button type="button" class="md-btn btn btn-secondary btn-sm" data-insert="### " title="Judul H3" style="padding: 0.35rem 0.75rem; min-height: auto; font-size: 0.8rem;">Heading 🏷️</button>
          <button type="button" class="md-btn btn btn-secondary btn-sm" data-insert="**" data-wrap="true" title="Teks Tebal" style="padding: 0.35rem 0.75rem; min-height: auto; font-size: 0.8rem; font-weight: bold;">Tebal B</button>
          <button type="button" class="md-btn btn btn-secondary btn-sm" data-insert="*" data-wrap="true" title="Teks Miring" style="padding: 0.35rem 0.75rem; min-height: auto; font-size: 0.8rem; font-style: italic;">Miring I</button>
          <button type="button" class="md-btn btn btn-secondary btn-sm" data-insert="- " title="Daftar List" style="padding: 0.35rem 0.75rem; min-height: auto; font-size: 0.8rem;">Daftar 📋</button>
          <button type="button" class="md-btn btn btn-secondary btn-sm" data-insert="[Teks Tautan](https://)" title="Link Tautan" style="padding: 0.35rem 0.75rem; min-height: auto; font-size: 0.8rem;">Tautan 🔗</button>
          <button type="button" class="md-btn btn btn-secondary btn-sm" data-insert="![Keterangan Foto](https://)" title="Sisipkan Foto" style="padding: 0.35rem 0.75rem; min-height: auto; font-size: 0.8rem;">Foto 📷</button>
          <button type="button" class="md-btn btn btn-secondary btn-sm" data-insert="\\\`\\\`\\\`javascript\\n// tulis kode disini\\n\\\`\\\`\\\`" title="Blok Kode" style="padding: 0.35rem 0.75rem; min-height: auto; font-size: 0.8rem; font-family: monospace;">Kode 💻</button>
        </div>
        
        <textarea id="edit-content" class="input-control" required placeholder="Tulis isi tulisan lengkap menggunakan format Markdown (misal: ### Judul, **tebal**, *miring*, - list, dll)..." style="height: 250px;">${article.content || ''}</textarea>
      </div>
    `;

  } else if (type === 'portfolio') {
    title.textContent = mode === 'add' ? 'Tambah Proyek Portfolio Baru' : 'Ubah Proyek Portfolio';
    const proj = mode === 'edit' ? (portfolioProjects.find(p => String(p.id) === String(id)) || {}) : {};

    container.innerHTML = `
      <div class="form-group">
        <label class="form-label" for="edit-title">Judul Proyek <span>*</span></label>
        <input type="text" id="edit-title" class="input-control" required value="${proj.title || ''}" placeholder="Contoh: Lengan Robot 4 DOF...">
      </div>
      <div class="form-group">
        <label class="form-label" for="edit-category">Kategori Fokus <span>*</span></label>
        <select id="edit-category" class="input-control" required style="appearance: auto;">
          <option value="mekanik & elektronik" ${proj.category === 'mekanik & elektronik' ? 'selected' : ''}>Mekanik & Elektronik</option>
          <option value="iot" ${proj.category === 'iot' ? 'selected' : ''}>Internet of Things (IoT)</option>
          <option value="pemrograman" ${proj.category === 'pemrograman' ? 'selected' : ''}>Pemrograman Robot</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="edit-status">Status Proyek <span>*</span></label>
        <select id="edit-status" class="input-control" required style="appearance: auto;">
          <option value="Selesai" ${proj.status === 'Selesai' ? 'selected' : ''}>Selesai</option>
          <option value="Pengembangan" ${proj.status === 'Pengembangan' ? 'selected' : ''}>Pengembangan</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="edit-creators">Pembuat Proyek Siswa <span>*</span></label>
        <input type="text" id="edit-creators" class="input-control" required value="${proj.creators || ''}" placeholder="Masukkan nama pembuat (Kelas)...">
      </div>
      <div class="form-group">
        <label class="form-label" for="edit-header-image">URL Gambar Header (Foto Sampul)</label>
        <div style="display: flex; gap: 0.75rem; align-items: flex-start; margin-bottom: 0.5rem;">
          <input type="text" id="edit-header-image" class="input-control" value="${proj.headerImage || ''}" placeholder="Tautan foto Unsplash, Imgur, atau URL gambar..." style="flex: 1; margin-bottom: 0;">
          <button type="button" id="btn-upload-local" class="btn btn-secondary" style="white-space: nowrap; height: 42px; display: inline-flex; align-items: center; justify-content: center; gap: 0.35rem; padding: 0.5rem 0.75rem; font-size: 0.85rem;">
            Pilih File 📁
          </button>
        </div>
        <input type="file" id="edit-image-file" accept="image/*" style="display: none;">
        <div id="upload-preview-container" style="display: flex; gap: 1rem; align-items: center; margin-top: 0.5rem;">
          <div class="img-upload-preview" id="edit-image-preview"></div>
          <span id="upload-status" style="font-size: 0.8rem; color: var(--text-muted);"></span>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="edit-components">Komponen Utama <span>*</span></label>
        <input type="text" id="edit-components" class="input-control" required value="${proj.components || ''}" placeholder="Arduino Mega, Sensor ultrasonik, driver servo...">
      </div>
      <div class="form-group">
        <label class="form-label" for="edit-specs">Spesifikasi Fisik/Fitur <span>*</span></label>
        <input type="text" id="edit-specs" class="input-control" required value="${proj.specs || ''}" placeholder="Kecepatan maks, jangkauan sensor, kapasitas daya...">
      </div>
      <div class="form-group">
        <label class="form-label" for="edit-content">Deskripsi Lengkap Proyek (Format Markdown) <span>*</span></label>
        
        <!-- Markdown Helper Toolbar -->
        <div class="markdown-toolbar" style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem; flex-wrap: wrap; background: rgba(2, 6, 23, 0.45); border: 1px solid rgba(255, 255, 255, 0.08); padding: 0.5rem; border-radius: var(--radius-md);">
          <button type="button" class="md-btn btn btn-secondary btn-sm" data-insert="### " title="Judul H3" style="padding: 0.35rem 0.75rem; min-height: auto; font-size: 0.8rem;">Heading 🏷️</button>
          <button type="button" class="md-btn btn btn-secondary btn-sm" data-insert="**" data-wrap="true" title="Teks Tebal" style="padding: 0.35rem 0.75rem; min-height: auto; font-size: 0.8rem; font-weight: bold;">Tebal B</button>
          <button type="button" class="md-btn btn btn-secondary btn-sm" data-insert="*" data-wrap="true" title="Teks Miring" style="padding: 0.35rem 0.75rem; min-height: auto; font-size: 0.8rem; font-style: italic;">Miring I</button>
          <button type="button" class="md-btn btn btn-secondary btn-sm" data-insert="- " title="Daftar List" style="padding: 0.35rem 0.75rem; min-height: auto; font-size: 0.8rem;">Daftar 📋</button>
          <button type="button" class="md-btn btn btn-secondary btn-sm" data-insert="[Teks Tautan](https://)" title="Link Tautan" style="padding: 0.35rem 0.75rem; min-height: auto; font-size: 0.8rem;">Tautan 🔗</button>
          <button type="button" class="md-btn btn btn-secondary btn-sm" data-insert="![Keterangan Foto](https://)" title="Sisipkan Foto" style="padding: 0.35rem 0.75rem; min-height: auto; font-size: 0.8rem;">Foto 📷</button>
          <button type="button" class="md-btn btn btn-secondary btn-sm" data-insert="\\\`\\\`\\\`javascript\\n// tulis kode disini\\n\\\`\\\`\\\`" title="Blok Kode" style="padding: 0.35rem 0.75rem; min-height: auto; font-size: 0.8rem; font-family: monospace;">Kode 💻</button>
        </div>
        
        <textarea id="edit-content" class="input-control" required placeholder="Tulis deskripsi proyek lengkap menggunakan format Markdown..." style="height: 200px;">${proj.content || ''}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label" for="edit-code">Kode Arduino C++ <span>*</span></label>
        <textarea id="edit-code" class="input-control" required placeholder="Tempel kode pemrograman robot Arduino Anda di sini..." style="font-family: monospace; font-size: 0.9rem;">${proj.code || ''}</textarea>
      </div>
    `;
  }

  // Setup markdown formatting toolbar logic
  setupMarkdownToolbar();

  // Setup local image compressor / uploader logic
  setupLocalImageUploader(type === 'blog' ? article : proj);

  dialog.showModal();
  document.body.classList.add('dialog-open');
}

// Markdown formatting toolbar event bindings
function setupMarkdownToolbar() {
  const textarea = document.getElementById('edit-content');
  if (!textarea) return;

  const buttons = document.querySelectorAll('.md-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      playRoboticSound('click');
      const insertText = btn.getAttribute('data-insert');
      const isWrap = btn.getAttribute('data-wrap') === 'true';

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;

      if (isWrap) {
        // Wrap selected text
        const selected = text.substring(start, end);
        const replacement = insertText + (selected || btn.title) + insertText;
        textarea.value = text.substring(0, start) + replacement + text.substring(end);
        textarea.focus();
        textarea.setSelectionRange(start + insertText.length, start + insertText.length + (selected || btn.title).length);
      } else {
        // Insert directly at cursor
        textarea.value = text.substring(0, start) + insertText + text.substring(end);
        textarea.focus();
        textarea.setSelectionRange(start + insertText.length, start + insertText.length);
      }
    });
  });
}

function closeCmsEditor() {
  playRoboticSound('click');
  const dialog = document.getElementById('cms-editor-dialog');
  dialog.close();
  document.body.classList.remove('dialog-open');
}

const ADMIN_PASS_HASH = '7094bc26dc244ec1bbef932b02a6fe1b2c629f334e3212621188674058c6bd11';

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// CMS Admin Authentication controllers
function setupCmsAuthentication() {
  const loginForm = document.getElementById('cms-login-form');
  const logoutBtn = document.getElementById('btn-admin-logout');
  const toggleEye = document.getElementById('toggle-admin-password');
  const passwordInput = document.getElementById('admin_password');
  
  const loginSection = document.getElementById('admin-login-section');
  const panelSection = document.getElementById('admin-panel-section');

  const btnResetDb = document.getElementById('btn-reset-db');

  // Eye password unmask visibility toggle
  if (toggleEye && passwordInput) {
    toggleEye.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      const isPressed = toggleEye.getAttribute('aria-pressed') === 'true';
      toggleEye.setAttribute('aria-pressed', !isPressed);
      playRoboticSound('hover');
    });
  }

  // Handle local data Reset Database button
  if (btnResetDb) {
    btnResetDb.addEventListener('click', () => {
      if (confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh database blog, portfolio, dan pendaftar ke kondisi default asli? Semua data tambahan akan hilang.')) {
        playRoboticSound('success');
        localStorage.removeItem('robotik_blog');
        localStorage.removeItem('robotik_portfolio');
        localStorage.removeItem('robotik_applicants');
        localStorage.removeItem('robotik_reg_settings');
        localStorage.removeItem('robotik_landing');
        
        // Reload arrays
        blogArticles = INITIAL_BLOG_ARTICLES;
        portfolioProjects = INITIAL_PORTFOLIO_PROJECTS;
        applicants = INITIAL_APPLICANTS;
        regSettings = JSON.parse(JSON.stringify(INITIAL_REG_SETTINGS));
        landingData = JSON.parse(JSON.stringify(INITIAL_LANDING_DATA));
        
        saveData('robotik_blog', blogArticles);
        saveData('robotik_portfolio', portfolioProjects);
        saveData('robotik_applicants', applicants);
        saveData('robotik_reg_settings', regSettings);
        saveData('robotik_landing', landingData);

        if (useFirebase) {
          // Reset and re-seed applicants collection in Cloud Firestore
          db.collection('applicants').get()
            .then(snapshot => {
              const batch = db.batch();
              snapshot.forEach(doc => {
                batch.delete(doc.ref);
              });
              // Re-seed initial demo applicants
              INITIAL_APPLICANTS.forEach(app => {
                const docRef = db.collection('applicants').doc(app.id);
                batch.set(docRef, app);
              });
              return batch.commit();
            })
            .then(() => console.log("Cloud Reset: Applicants database successfully reset & re-seeded!"))
            .catch(err => console.error("Cloud Reset Error: Firestore applicants clear failed:", err));
        }
        
        renderAdminBlogTable();
        renderAdminPortfolioTable();
        renderAdminApplicantsTable();
        renderPublicArticles();
        renderPublicPortfolio();
        renderLandingPage();
        
        if (typeof window.populateLandingCmsInputs === 'function') {
          window.populateLandingCmsInputs();
        }
        
        // Update registration countdown and questions
        if (typeof renderCustomQuestionsInForm === 'function') renderCustomQuestionsInForm();
        if (typeof renderAdminQuestionsTable === 'function') renderAdminQuestionsTable();
        if (typeof updateCountdownTimer === 'function') updateCountdownTimer();
        
        if (typeof window.populateRegSettingsCmsInputs === 'function') {
          window.populateRegSettingsCmsInputs();
        }
        if (typeof renderWhatsAppBanner === 'function') {
          renderWhatsAppBanner();
        }
        
        alert('Database telah dikembalikan ke kondisi default!');
      } else {
        playRoboticSound('error');
      }
    });
  }

  // Login authentication trigger
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const user = document.getElementById('admin_username').value.trim();
      const pass = document.getElementById('admin_password').value.trim();

      const errMsg = document.getElementById('login-error-msg');
      if (errMsg) errMsg.style.display = 'none';

      const inputHash = await sha256(pass);

      // Credentials verification (approved default configuration)
      if (user === 'admin' && inputHash === ADMIN_PASS_HASH) {
        playRoboticSound('success');
        sessionStorage.setItem('robotik_admin_logged', 'true');

        const performLoginTransition = () => {
          loginSection.style.display = 'none';
          panelSection.style.display = 'block';
          
          // Clear inputs safely
          document.getElementById('admin_password').value = '';
          
          renderAdminBlogTable();
          renderAdminPortfolioTable();
          renderAdminApplicantsTable();
        };

        if (document.startViewTransition) {
          document.startViewTransition(performLoginTransition);
        } else {
          performLoginTransition();
        }
      } else {
        playRoboticSound('error');
        if (errMsg) {
          errMsg.textContent = 'Kombinasi Username atau Password salah!';
          errMsg.style.display = 'block';
        }
      }
    });
  }

  // Logout trigger
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      playRoboticSound('click');
      sessionStorage.removeItem('robotik_admin_logged');
      
      const performLogoutTransition = () => {
        window.appNavigate('view-home');
      };

      if (document.startViewTransition) {
        document.startViewTransition(performLogoutTransition);
      } else {
        performLogoutTransition();
      }
    });
  }
}

// CMS Admin Dashboard Tab toggling controllers
function setupCmsTabs() {
  const tabs = document.querySelectorAll('.cms-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      playRoboticSound('click');
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.getAttribute('data-cms-target');
      document.querySelectorAll('.cms-view-content').forEach(view => {
        view.classList.remove('active');
      });
      document.getElementById(target).classList.add('active');
    });
    tab.addEventListener('mouseenter', () => playRoboticSound('hover'));
  });

  // Editor Dynamic Actions: "Tambah Baru" buttons
  const btnAddBlog = document.getElementById('btn-add-blog');
  const btnAddPortfolio = document.getElementById('btn-add-portfolio');
  
  if (btnAddBlog) {
    btnAddBlog.addEventListener('click', () => openCmsEditor('blog', 'add'));
  }
  if (btnAddPortfolio) {
    btnAddPortfolio.addEventListener('click', () => openCmsEditor('portfolio', 'add'));
  }

  const closeEditorBtn = document.getElementById('close-editor-dialog-btn');
  const cancelEditorBtn = document.getElementById('cms-editor-cancel');
  const editorDialog = document.getElementById('cms-editor-dialog');

  if (closeEditorBtn) closeEditorBtn.addEventListener('click', closeCmsEditor);
  if (cancelEditorBtn) cancelEditorBtn.addEventListener('click', closeCmsEditor);
  
  if (editorDialog) {
    editorDialog.addEventListener('cancel', () => {
      document.body.classList.remove('dialog-open');
    });
  }

  // Main Save Submit Action inside editor form
  const editorForm = document.getElementById('cms-editor-form');
  if (editorForm) {
    editorForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const type = editorForm.getAttribute('data-type');
      const mode = editorForm.getAttribute('data-mode');
      
      playRoboticSound('success');
      
      if (type === 'blog') {
        const titleVal = document.getElementById('edit-title').value.trim();
        const catVal = document.getElementById('edit-category').value;
        const authVal = document.getElementById('edit-author').value.trim();
        const excVal = document.getElementById('edit-excerpt').value.trim();
        const conVal = document.getElementById('edit-content').value.trim();
        const headerImgVal = document.getElementById('edit-header-image').value.trim();

        if (mode === 'add') {
          const newId = blogArticles.length > 0 ? Math.max(...blogArticles.map(a => a.id)) + 1 : 1;
          const today = new Date();
          const formatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
          const dateStr = today.toLocaleDateString('id-ID', formatOptions);

          blogArticles.push({
            id: newId,
            title: titleVal,
            category: catVal,
            author: authVal,
            date: dateStr,
            excerpt: excVal,
            content: conVal,
            headerImage: headerImgVal
          });
        } else if (mode === 'edit') {
          const id = editorForm.getAttribute('data-id');
          const article = blogArticles.find(a => String(a.id) === String(id));
          if (article) {
            article.title = titleVal;
            article.category = catVal;
            article.author = authVal;
            article.excerpt = excVal;
            article.content = conVal;
            article.headerImage = headerImgVal;
          }
        }
        
        saveData('robotik_blog', blogArticles);
        renderAdminBlogTable();
        renderPublicArticles();
        
      } else if (type === 'portfolio') {
        const titleVal = document.getElementById('edit-title').value.trim();
        const catVal = document.getElementById('edit-category').value;
        const statVal = document.getElementById('edit-status').value;
        const creatVal = document.getElementById('edit-creators').value.trim();
        const compVal = document.getElementById('edit-components').value.trim();
        const specVal = document.getElementById('edit-specs').value.trim();
        const codeVal = document.getElementById('edit-code').value.trim();
        const conVal = document.getElementById('edit-content').value.trim();
        const headerImgVal = document.getElementById('edit-header-image').value.trim();

        if (mode === 'add') {
          const newId = portfolioProjects.length > 0 ? Math.max(...portfolioProjects.map(p => p.id)) + 1 : 1;
          portfolioProjects.push({
            id: newId,
            title: titleVal,
            category: catVal,
            status: statVal,
            creators: creatVal,
            components: compVal,
            specs: specVal,
            code: codeVal,
            content: conVal,
            headerImage: headerImgVal
          });
        } else if (mode === 'edit') {
          const id = editorForm.getAttribute('data-id');
          const proj = portfolioProjects.find(p => String(p.id) === String(id));
          if (proj) {
            proj.title = titleVal;
            proj.category = catVal;
            proj.status = statVal;
            proj.creators = creatVal;
            proj.components = compVal;
            proj.specs = specVal;
            proj.code = codeVal;
            proj.content = conVal;
            proj.headerImage = headerImgVal;
          }
        }

        saveData('robotik_portfolio', portfolioProjects);
        renderAdminPortfolioTable();
        renderPublicPortfolio();
      }

      closeCmsEditor();
    });
  }
}
// --- FLOATING PUSH NOTIFICATION & SOUND TRIGGERS REMOVED ---

// --- CMS APPLICANTS MANAGEMENT CONTROLLER ---
function renderAdminApplicantsTable() {
  const tableBody = document.getElementById('admin-applicants-table-body');
  if (!tableBody) return;

  const searchInput = document.getElementById('search-applicants');
  const statusSelect = document.getElementById('filter-applicant-status');
  
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const statusFilter = statusSelect ? statusSelect.value : 'ALL';

  // Filter list
  const filtered = applicants.filter(app => {
    const matchesSearch = (app.nama || '').toLowerCase().includes(query) || (app.id || '').toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Tidak ada pendaftar yang cocok dengan filter.</td></tr>`;
    return;
  }

  tableBody.innerHTML = filtered.map((applicant, index) => {
    let statusClass = 'status-pending';
    let statusLabel = 'Menunggu Persetujuan';
    
    if (applicant.status === 'Diterima') {
      statusClass = 'status-approved';
      statusLabel = 'Diterima';
    } else if (applicant.status === 'Ditolak') {
      statusClass = 'status-rejected';
      statusLabel = 'Ditolak';
    }

    const showLihatKartu = applicant.status === 'Diterima' 
      ? `<button class="btn btn-outline-cyan btn-sm btn-view-card" data-id="${applicant.id}">Lihat Kartu 🪪</button>`
      : '';

    const showActions = applicant.status === 'Pending'
      ? `<button class="btn btn-yellow btn-sm btn-approve" data-id="${applicant.id}">Setujui 🟢</button>
         <button class="btn btn-secondary btn-sm btn-reject" data-id="${applicant.id}" style="border-color: rgba(244,63,94,0.3); color: #FB7185;">Tolak 🔴</button>`
      : '';

    const joinedDivisions = Array.isArray(applicant.divisi) 
      ? applicant.divisi.join(', ') 
      : applicant.divisi;

    return `
      <tr>
        <td>${index + 1}</td>
        <td style="font-weight: 600; color: var(--text-white);">${escapeHtml(applicant.nama)}</td>
        <td>${escapeHtml(applicant.kelas)}</td>
        <td>${escapeHtml(applicant.noHp)}</td>
        <td>${escapeHtml(joinedDivisions)}</td>
        <td>${escapeHtml(applicant.tanggalDaftar)}</td>
        <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
        <td>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            ${showActions}
            ${showLihatKartu}
            <button class="btn btn-secondary btn-sm btn-delete" data-id="${applicant.id}" style="border-color: rgba(244,63,94,0.2); color: rgba(255,255,255,0.4);" aria-label="Hapus Pendaftar">Hapus 🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Bind Approvals
  tableBody.querySelectorAll('.btn-approve').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      approveApplicant(id);
    });
    btn.addEventListener('mouseenter', () => playRoboticSound('hover'));
  });

  // Bind Rejections
  tableBody.querySelectorAll('.btn-reject').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      rejectApplicant(id);
    });
    btn.addEventListener('mouseenter', () => playRoboticSound('hover'));
  });

  // Bind Card View Dialog Pops
  tableBody.querySelectorAll('.btn-view-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      viewApplicantCard(id);
    });
    btn.addEventListener('mouseenter', () => playRoboticSound('hover'));
  });

  // Bind Deletions
  tableBody.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      deleteApplicant(id);
    });
    btn.addEventListener('mouseenter', () => playRoboticSound('hover'));
  });
}

function approveApplicant(id) {
  const idx = applicants.findIndex(a => a.id === id);
  if (idx !== -1) {
    playRoboticSound('success');
    applicants[idx].status = 'Diterima';
    saveData('robotik_applicants', applicants);
    renderAdminApplicantsTable();

    if (useFirebase) {
      db.collection('applicants').doc(id).update({ status: 'Diterima' })
        .then(() => console.log("Applicant approval successfully synced to Cloud Firestore!"))
        .catch(err => console.error("Firestore approval sync failed:", err));
    }
  }
}

function rejectApplicant(id) {
  const idx = applicants.findIndex(a => a.id === id);
  if (idx !== -1) {
    playRoboticSound('error');
    applicants[idx].status = 'Ditolak';
    saveData('robotik_applicants', applicants);
    renderAdminApplicantsTable();

    if (useFirebase) {
      db.collection('applicants').doc(id).update({ status: 'Ditolak' })
        .then(() => console.log("Applicant rejection successfully synced to Cloud Firestore!"))
        .catch(err => console.error("Firestore rejection sync failed:", err));
    }
  }
}

function deleteApplicant(id) {
  const idx = applicants.findIndex(a => a.id === id);
  if (idx !== -1) {
    if (confirm(`Apakah Anda yakin ingin menghapus data pendaftar ${applicants[idx].nama}?`)) {
      playRoboticSound('click');
      applicants.splice(idx, 1);
      saveData('robotik_applicants', applicants);
      renderAdminApplicantsTable();

      if (useFirebase) {
        db.collection('applicants').doc(id).delete()
          .then(() => console.log("Applicant deletion successfully synced to Cloud Firestore!"))
          .catch(err => console.error("Firestore deletion sync failed:", err));
      }
    } else {
      playRoboticSound('error');
    }
  }
}

function viewApplicantCard(id) {
  const applicant = applicants.find(a => a.id === id);
  if (!applicant) return;

  const container = document.getElementById('admin-card-preview-container');
  if (!container) return;

  container.innerHTML = generateStudentCardHtml(applicant.nama, applicant.kelas, applicant.id);

  const dialog = document.getElementById('admin-card-preview-dialog');
  if (dialog) {
    playRoboticSound('success');
    dialog.showModal();
    document.body.classList.add('dialog-open');
  }
}

function generateStudentCardHtml(nama, kelas, regId) {
  return `
    <div class="robot-student-card" style="margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      <div class="card-header">
        <span class="card-title">MOTECHART ROBOTIK MEMBER</span>
        <svg class="card-logo" width="24" height="24" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="stroke: currentColor;">
          <defs>
            <linearGradient id="gold-grad-card-dyn" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFEFA6" />
              <stop offset="30%" stop-color="#E5C158" />
              <stop offset="70%" stop-color="#B28C32" />
              <stop offset="100%" stop-color="#805C15" />
            </linearGradient>
            <linearGradient id="silver-grad-card-dyn" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFFFFF" />
              <stop offset="25%" stop-color="#E5E5EA" />
              <stop offset="50%" stop-color="#AEAEB2" />
              <stop offset="75%" stop-color="#636366" />
              <stop offset="100%" stop-color="#3A3A3C" />
            </linearGradient>
            <radialGradient id="cyan-glow-card-dyn" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#00F0FF" />
              <stop offset="70%" stop-color="#06B6D4" />
              <stop offset="100%" stop-color="#083344" />
            </radialGradient>
          </defs>
          <g transform="translate(64, 108)">
            <circle cx="0" cy="0" r="14" fill="url(#silver-grad-card-dyn)" stroke="#1E293B" stroke-width="0.5" />
            <circle cx="0" cy="0" r="8" fill="url(#cyan-glow-card-dyn)" />
            <circle cx="0" cy="0" r="4" fill="#000" />
          </g>
          <g transform="translate(136, 108)">
            <circle cx="0" cy="0" r="14" fill="url(#silver-grad-card-dyn)" stroke="#1E293B" stroke-width="0.5" />
            <circle cx="0" cy="0" r="8" fill="url(#cyan-glow-card-dyn)" />
            <circle cx="0" cy="0" r="4" fill="#000" />
          </g>
          <g transform="translate(100, 150)">
            <circle cx="0" cy="0" r="19" fill="url(#silver-grad-card-dyn)" stroke="#1E293B" stroke-width="0.5" />
          </g>
          <g fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M 100,45 L 35,45 L 35,125 L 48,155 L 76,108 L 82,90 L 100,90 L 118,90 L 124,108 L 152,155 L 165,125 L 165,45 Z" stroke="url(#gold-grad-card-dyn)" stroke-width="5" fill="none" />
            <path d="M 100,53 L 43,53 L 43,121 L 53,144 L 75,107 L 80,98 L 100,98 L 120,98 L 125,107 L 147,144 L 157,121 L 157,53 Z" stroke="url(#gold-grad-card-dyn)" stroke-width="3" fill="none" />
          </g>
          <circle cx="100" cy="150" r="6" fill="url(#gold-grad-card-dyn)" />
        </svg>
      </div>
      <div class="card-body">
        <div class="card-avatar" aria-label="Avatar robotik">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div class="card-info">
          <div class="card-name">${escapeHtml(nama)}</div>
          <div class="card-class">KELAS ${escapeHtml(kelas)}</div>
          <div class="card-id-row">NIM/ID: <span>${escapeHtml(regId)}</span></div>
        </div>
      </div>
      <div class="card-footer-barcode" aria-label="Barcode keamanan">
        <svg width="150" height="30" viewBox="0 0 100 20" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="2" width="2" height="16" fill="var(--accent-cyan)" />
          <rect x="4" y="2" width="1" height="16" fill="var(--accent-cyan)" />
          <rect x="7" y="2" width="3" height="16" fill="var(--accent-cyan)" />
          <rect x="12" y="2" width="1" height="16" fill="var(--accent-cyan)" />
          <rect x="15" y="2" width="2" height="16" fill="var(--accent-cyan)" />
          <rect x="19" y="2" width="4" height="16" fill="var(--accent-cyan)" />
          <rect x="25" y="2" width="1" height="16" fill="var(--accent-cyan)" />
          <rect x="28" y="2" width="2" height="16" fill="var(--accent-cyan)" />
          <rect x="32" y="2" width="1" height="16" fill="var(--accent-cyan)" />
          <rect x="35" y="2" width="3" height="16" fill="var(--accent-cyan)" />
          <rect x="40" y="2" width="2" height="16" fill="var(--accent-cyan)" />
          <rect x="44" y="2" width="1" height="16" fill="var(--accent-cyan)" />
          <rect x="47" y="2" width="4" height="16" fill="var(--accent-cyan)" />
          <rect x="53" y="2" width="1" height="16" fill="var(--accent-cyan)" />
          <rect x="56" y="2" width="2" height="16" fill="var(--accent-cyan)" />
          <rect x="60" y="2" width="1" height="16" fill="var(--accent-cyan)" />
          <rect x="63" y="2" width="3" height="16" fill="var(--accent-cyan)" />
          <rect x="68" y="2" width="2" height="16" fill="var(--accent-cyan)" />
          <rect x="72" y="2" width="1" height="16" fill="var(--accent-cyan)" />
          <rect x="75" y="2" width="4" height="16" fill="var(--accent-cyan)" />
          <rect x="81" y="2" width="1" height="16" fill="var(--accent-cyan)" />
          <rect x="84" y="2" width="2" height="16" fill="var(--accent-cyan)" />
          <rect x="88" y="2" width="3" height="16" fill="var(--accent-cyan)" />
          <rect x="93" y="2" width="1" height="16" fill="var(--accent-cyan)" />
          <rect x="96" y="2" width="4" height="16" fill="var(--accent-cyan)" />
        </svg>
      </div>
    </div>
  `;
}

// --- SETUP AUDIO TOGGLE BUTTON ---
function setupAudioToggle() {
  const toggleBtn = document.getElementById('sound-toggle-btn');
  if (!toggleBtn) return;

  const soundText = toggleBtn.querySelector('.sound-status-text');
  const soundIconOn = toggleBtn.querySelector('.sound-icon-on');
  const soundIconOff = toggleBtn.querySelector('.sound-icon-off');

  toggleBtn.addEventListener('click', () => {
    soundMuted = !soundMuted;
    
    if (soundMuted) {
      soundText.textContent = "Sound: OFF";
      soundIconOn.style.display = "none";
      soundIconOff.style.display = "inline";
      toggleBtn.classList.add('muted');
    } else {
      soundText.textContent = "Sound: ON";
      soundIconOn.style.display = "inline";
      soundIconOff.style.display = "none";
      toggleBtn.classList.remove('muted');
      playRoboticSound('success');
    }
  });

  toggleBtn.addEventListener('mouseenter', () => playRoboticSound('hover'));
}

// --- VISUAL CIRCUIT ANIMATION CONTROL ---
function setupInteractiveCircuit() {
  const circuitBackground = document.querySelector('.bg-circuit-lines');
  if (!circuitBackground) return;

  // Only bind mousemove event on devices that support hover (non-touch/desktop)
  if (window.matchMedia('(hover: hover)').matches) {
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      circuitBackground.style.transform = `translate(${x}px, ${y}px)`;
    });
  }
}

// --- SETUP APPLICANTS DIALOG ACTIONS ---
function setupApplicantsDialog() {
  const closePreviewBtn = document.getElementById('close-preview-dialog-btn');
  const previewDialog = document.getElementById('admin-card-preview-dialog');
  if (closePreviewBtn && previewDialog) {
    closePreviewBtn.addEventListener('click', () => {
      playRoboticSound('click');
      previewDialog.close();
    });
    previewDialog.addEventListener('close', () => {
      document.body.classList.remove('dialog-open');
    });
  }
}

// --- DYNAMIC REGISTRATION CMS, COUNTDOWN, CUSTOM QUESTIONS & STATUS CHECK ---

function renderCustomQuestionsInForm() {
  const container = document.getElementById('custom-questions-injected-container');
  if (!container) return;

  container.innerHTML = '';
  
  if (!regSettings.customQuestions || regSettings.customQuestions.length === 0) {
    return;
  }

  regSettings.customQuestions.forEach(q => {
    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';
    formGroup.style.marginBottom = '1.5rem';

    const label = document.createElement('label');
    label.className = 'form-label';
    if (q.type !== 'radio') {
      label.htmlFor = q.id;
    }
    label.innerHTML = `${escapeHtml(q.label)} ${q.required ? '<span>*</span>' : ''}`;
    formGroup.appendChild(label);

    if (q.type === 'text') {
      const input = document.createElement('input');
      input.type = 'text';
      input.id = q.id;
      input.className = 'input-control';
      input.placeholder = 'Masukkan jawaban Anda';
      if (q.required) input.required = true;

      input.addEventListener('blur', () => {
        if (q.required && !input.value.trim()) {
          showCustomFieldError(input, 'Pertanyaan wajib diisi.');
        } else {
          clearCustomFieldError(input);
        }
      });
      input.addEventListener('input', () => {
        clearCustomFieldError(input);
      });

      formGroup.appendChild(input);
    } else if (q.type === 'select') {
      const select = document.createElement('select');
      select.id = q.id;
      select.className = 'input-control';
      if (q.required) select.required = true;

      const defaultOpt = document.createElement('option');
      defaultOpt.value = '';
      defaultOpt.textContent = '-- Pilih salah satu --';
      select.appendChild(defaultOpt);

      if (q.options) {
        q.options.forEach(opt => {
          const option = document.createElement('option');
          option.value = opt;
          option.textContent = opt;
          select.appendChild(option);
        });
      }

      select.addEventListener('change', () => {
        if (q.required && !select.value) {
          showCustomFieldError(select, 'Pilihan wajib dipilih.');
        } else {
          clearCustomFieldError(select);
        }
      });

      formGroup.appendChild(select);
    } else if (q.type === 'radio') {
      const radioContainer = document.createElement('div');
      radioContainer.style.display = 'flex';
      radioContainer.style.flexDirection = 'column';
      radioContainer.style.gap = '0.5rem';
      radioContainer.style.marginTop = '0.5rem';

      if (q.options) {
        q.options.forEach((opt, oIdx) => {
          const labelWrapper = document.createElement('label');
          labelWrapper.style.display = 'flex';
          labelWrapper.style.alignItems = 'center';
          labelWrapper.style.gap = '0.75rem';
          labelWrapper.style.cursor = 'pointer';
          labelWrapper.style.color = 'var(--text-white)';

          const radioInput = document.createElement('input');
          radioInput.type = 'radio';
          radioInput.name = q.id;
          radioInput.id = `${q.id}-${oIdx}`;
          radioInput.value = opt;
          radioInput.style.width = 'auto';
          radioInput.style.cursor = 'pointer';
          if (q.required && oIdx === 0) radioInput.required = true;

          radioInput.addEventListener('change', () => {
            clearCustomFieldError(radioInput);
          });

          const span = document.createElement('span');
          span.textContent = opt;

          labelWrapper.appendChild(radioInput);
          labelWrapper.appendChild(span);
          radioContainer.appendChild(labelWrapper);
        });
      }
      formGroup.appendChild(radioContainer);
    }

    container.appendChild(formGroup);
  });
}

function showCustomFieldError(input, message) {
  const group = input.closest('.form-group');
  if (!group) return;
  group.classList.add('has-error');
  
  let errorSpan = group.querySelector('.error-message');
  if (!errorSpan) {
    errorSpan = document.createElement('span');
    errorSpan.className = 'error-message';
    group.appendChild(errorSpan);
  }
  errorSpan.textContent = message;
  errorSpan.setAttribute('aria-live', 'assertive');
}

function clearCustomFieldError(input) {
  const group = input.closest('.form-group');
  if (!group) return;
  group.classList.remove('has-error');
  const errorSpan = group.querySelector('.error-message');
  if (errorSpan) {
    group.removeChild(errorSpan);
  }
}

function updateCountdownTimer() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }

  const closedContainer = document.getElementById('reg-closed-container');
  const regLayout = document.querySelector('.reg-layout');
  if (!closedContainer || !regLayout) return;

  const progressBar = document.querySelector('.progress-bar-container');
  const formContainer = document.getElementById('reg-form-container');
  const successCard = document.getElementById('reg-success-card');

  if (regSettings.isOpen) {
    closedContainer.style.display = 'none';
    regLayout.style.display = '';
    
    // When open, restore form container and progress bar if success card is NOT displayed
    if (successCard && successCard.style.display === 'block') {
      if (progressBar) progressBar.style.display = 'none';
      if (formContainer) formContainer.style.display = 'none';
    } else {
      if (progressBar) progressBar.style.display = '';
      if (formContainer) formContainer.style.display = '';
    }
  } else {
    closedContainer.style.display = 'block';
    regLayout.style.display = ''; // Keep reg-layout visible so status checker is displayed
    if (progressBar) progressBar.style.display = 'none';
    if (formContainer) formContainer.style.display = 'none';
    if (successCard) successCard.style.display = 'none';

    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minutesEl = document.getElementById('cd-minutes');
    const secondsEl = document.getElementById('cd-seconds');

    function tick() {
      const targetTime = new Date(regSettings.countdownTarget).getTime();
      const now = Date.now();
      const diff = targetTime - now;

      if (isNaN(targetTime) || diff <= 0) {
        if (daysEl) daysEl.textContent = '00';
        if (hoursEl) hoursEl.textContent = '00';
        if (minutesEl) minutesEl.textContent = '00';
        if (secondsEl) secondsEl.textContent = '00';

        regSettings.isOpen = true;
        saveData('robotik_reg_settings', regSettings);
        clearInterval(countdownInterval);
        countdownInterval = null;
        closedContainer.style.display = 'none';
        regLayout.style.display = '';
        if (progressBar) progressBar.style.display = '';
        if (formContainer) formContainer.style.display = '';
        
        const statusToggle = document.getElementById('reg-status-toggle');
        if (statusToggle) statusToggle.value = 'open';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const pad = (num) => String(num).padStart(2, '0');

      if (daysEl) daysEl.textContent = pad(days);
      if (hoursEl) hoursEl.textContent = pad(hours);
      if (minutesEl) minutesEl.textContent = pad(minutes);
      if (secondsEl) secondsEl.textContent = pad(seconds);
    }

    tick();
    countdownInterval = setInterval(tick, 1000);
  }
}

function checkApplicantStatus(id) {
  const applicant = applicants.find(a => a.id.toUpperCase() === id.trim().toUpperCase());
  const contentContainer = document.getElementById('student-status-content-container');
  if (!contentContainer) return;

  if (!applicant) {
    playRoboticSound('error');
    contentContainer.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <div style="font-size: 3rem; color: #FB7185; margin-bottom: 1rem;">⚠️</div>
        <h3 style="color: var(--text-white); margin-bottom: 0.5rem;">ID Tidak Ditemukan</h3>
        <p style="color: var(--text-muted); font-size: 0.95rem;">
          ID pendaftaran <strong>"${escapeHtml(id)}"</strong> tidak terdaftar di database kami. Silakan periksa kembali penulisan ID Anda atau hubungi admin.
        </p>
      </div>
    `;
  } else if (applicant.status === 'Pending') {
    playRoboticSound('success');
    contentContainer.innerHTML = `
      <div style="padding: 1.5rem; text-align: center;">
        <div class="pulsing-radar-icon" aria-hidden="true" style="margin: 0 auto 1.5rem auto; border-color: var(--accent-yellow); background: rgba(245, 158, 11, 0.1); width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-yellow)" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <h3 style="color: var(--accent-yellow); font-size: 1.5rem; margin-bottom: 0.5rem;">Menunggu Persetujuan ⏳</h3>
        <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.5rem;">
          Halo <strong>${escapeHtml(applicant.nama)}</strong>, pendaftaran Anda untuk kelas <strong>${escapeHtml(applicant.kelas)}</strong> sedang diproses oleh pengurus ekskul Motechart Robotik.
        </p>
        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); border-radius: 8px; padding: 1rem; text-align: left; margin-bottom: 1.5rem;">
          <div style="display: grid; grid-template-columns: 100px 1fr; gap: 0.5rem; font-size: 0.9rem;">
            <span style="color: var(--text-muted);">ID Unik:</span><span style="color: var(--text-white); font-weight: bold;">${escapeHtml(applicant.id)}</span>
            <span style="color: var(--text-muted);">Divisi:</span><span style="color: var(--text-white);">${escapeHtml(Array.isArray(applicant.divisi) ? applicant.divisi.join(', ') : applicant.divisi)}</span>
            <span style="color: var(--text-muted);">Tanggal:</span><span style="color: var(--text-white);">${escapeHtml(applicant.tanggalDaftar)}</span>
          </div>
        </div>
        <p style="color: var(--text-white); font-size: 0.95rem; margin-bottom: 1rem;">
          ${escapeHtml(regSettings.waDesc || 'Harap bergabung ke grup koordinasi calon anggota baru di bawah ini untuk mendapatkan info jadwal wawancara, tes masuk, dan demonstrasi alat robotika:')}
        </p>
        <a href="${escapeHtml(regSettings.waLink || 'https://chat.whatsapp.com/mock-motechart-robotik')}" target="_blank" class="btn btn-yellow" style="display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none; justify-content: center; width: 100%;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.031 2C6.51 2 2.03 6.48 2.03 12c0 2.159.57 4.259 1.66 6.13l-1.77 6.47 6.63-1.74c1.88 1.02 4 1.56 6.13 1.56 5.52 0 10-4.48 10-10S17.551 2 12.031 2zm6.39 14.19c-.27.76-1.55 1.48-2.15 1.56-.54.07-1.24.1-3.64-.89-3.07-1.26-5.05-4.38-5.2-4.58-.15-.2-1.2-1.6-1.2-3.06 0-1.46.76-2.17 1.03-2.46.27-.3.59-.37.79-.37.2 0 .4.01.57.02.18.01.41-.07.65.5.24.58.82 2.02.9 2.17.08.16.14.35.03.56-.11.22-.26.47-.38.61-.13.14-.26.3-.11.56.15.26.68 1.12 1.46 1.82.99.9 1.83 1.18 2.09 1.31.26.13.41.11.56-.06.15-.18.66-.76.84-.96.18-.2.37-.16.63-.07.26.09 1.66.78 1.95.92.29.14.48.22.56.35.07.13.07.76-.2 1.52z"/>
          </svg>
          Gabung Grup WhatsApp 💬
        </a>
      </div>
    `;
  } else if (applicant.status === 'Diterima') {
    playRoboticSound('success');
    contentContainer.innerHTML = `
      <div style="padding: 0.5rem; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">🎉</div>
        <h3 style="color: var(--accent-cyan); font-size: 1.5rem; margin-bottom: 0.5rem;">Selamat, Anda Diterima!</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; margin-bottom: 1.5rem;">
          Selamat bergabung di <strong>Motechart Robotik</strong>, <strong>${escapeHtml(applicant.nama)}</strong>! Berikut adalah Kartu Anggota Digital resmi Anda. Silakan simpan / screenshot kartu ini.
        </p>
        
        <div style="display: flex; justify-content: center; margin-bottom: 1rem; overflow-x: auto; padding: 0.5rem;">
          ${generateStudentCardHtml(applicant.nama, applicant.kelas, applicant.id)}
        </div>
      </div>
    `;
  } else if (applicant.status === 'Ditolak') {
    playRoboticSound('error');
    contentContainer.innerHTML = `
      <div style="padding: 1.5rem; text-align: center;">
        <div class="pulsing-radar-icon" aria-hidden="true" style="margin: 0 auto 1.5rem auto; border-color: #FB7185; background: rgba(244, 63, 94, 0.1); width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FB7185" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <h3 style="color: #FB7185; font-size: 1.5rem; margin-bottom: 0.5rem;">Pendaftaran Ditolak 🔴</h3>
        <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.6;">
          Halo <strong>${escapeHtml(applicant.nama)}</strong>, mohon maaf saat ini pendaftaran Anda belum dapat kami setujui karena kuota divisi penuh atau alasan administratif lainnya.
        </p>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 1rem;">
          Terima kasih atas minat besar Anda untuk bergabung dengan Motechart Robotik. Tetap semangat belajar robotika!
        </p>
      </div>
    `;
  }

  const dialog = document.getElementById('student-status-dialog');
  if (dialog) {
    dialog.showModal();
    document.body.classList.add('dialog-open');
  }
}

function setupStatusChecker() {
  const btnCheckStatus = document.getElementById('btn-check-status');
  const inputCheckStatus = document.getElementById('status-check-id-input');
  const closeStudentStatusBtn = document.getElementById('close-student-status-btn');
  const studentStatusDialog = document.getElementById('student-status-dialog');

  if (btnCheckStatus && inputCheckStatus) {
    const handleCheck = () => {
      const id = inputCheckStatus.value.trim();
      if (!id) {
        playRoboticSound('error');
        alert('Silakan masukkan ID Unik Anda terlebih dahulu!');
        inputCheckStatus.focus();
        return;
      }
      playRoboticSound('click');
      checkApplicantStatus(id);
    };

    btnCheckStatus.addEventListener('click', handleCheck);
    inputCheckStatus.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleCheck();
      }
    });
  }

  if (closeStudentStatusBtn && studentStatusDialog) {
    closeStudentStatusBtn.addEventListener('click', () => {
      playRoboticSound('click');
      studentStatusDialog.close();
    });
    studentStatusDialog.addEventListener('close', () => {
      document.body.classList.remove('dialog-open');
    });
  }
}

function setupAdminRegSettings() {
  const statusToggle = document.getElementById('reg-status-toggle');
  const countdownTargetInput = document.getElementById('reg-countdown-target');
  const regSettingsForm = document.getElementById('cms-reg-settings-form');

  function populateRegSettingsCmsInputs() {
    if (statusToggle && countdownTargetInput) {
      statusToggle.value = regSettings.isOpen ? 'open' : 'closed';
      let targetVal = regSettings.countdownTarget || '';
      if (targetVal.includes('T') && targetVal.length > 16) {
        targetVal = targetVal.slice(0, 16);
      }
      countdownTargetInput.value = targetVal;
    }

    const waTitleInput = document.getElementById('reg-wa-title');
    const waDescInput = document.getElementById('reg-wa-desc');
    const waLinkInput = document.getElementById('reg-wa-link');

    if (waTitleInput) waTitleInput.value = regSettings.waTitle || '';
    if (waDescInput) waDescInput.value = regSettings.waDesc || '';
    if (waLinkInput) waLinkInput.value = regSettings.waLink || '';
  }

  populateRegSettingsCmsInputs();
  window.populateRegSettingsCmsInputs = populateRegSettingsCmsInputs;

  if (regSettingsForm) {
    regSettingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      regSettings.isOpen = (statusToggle.value === 'open');
      regSettings.countdownTarget = countdownTargetInput.value;

      const waTitleInput = document.getElementById('reg-wa-title');
      const waDescInput = document.getElementById('reg-wa-desc');
      const waLinkInput = document.getElementById('reg-wa-link');

      if (waTitleInput) regSettings.waTitle = waTitleInput.value.trim();
      if (waDescInput) regSettings.waDesc = waDescInput.value.trim();
      if (waLinkInput) regSettings.waLink = waLinkInput.value.trim();

      saveData('robotik_reg_settings', regSettings);

      if (useFirebase) {
        db.collection('settings').doc('registration').set(regSettings)
          .then(() => console.log("Registration settings successfully synced to Cloud Firestore!"))
          .catch(err => console.error("Firestore settings sync failed:", err));
      }

      playRoboticSound('success');
      updateCountdownTimer();
      renderWhatsAppBanner();
      alert('Konfigurasi pendaftaran berhasil disimpan! 💾');
    });
  }

  renderAdminQuestionsTable();

  const btnAddQuestion = document.getElementById('btn-add-custom-question');
  const questionDialog = document.getElementById('custom-question-dialog');
  const questionForm = document.getElementById('custom-question-form');
  const questionTypeSelect = document.getElementById('question-type');
  const optionsGroup = document.getElementById('question-options-group');
  const btnCancelQuestion = document.getElementById('btn-cancel-question-dialog');
  const btnCloseQuestion = document.getElementById('close-question-dialog-btn');

  if (btnAddQuestion && questionDialog) {
    btnAddQuestion.addEventListener('click', () => {
      playRoboticSound('click');
      questionForm.reset();
      document.getElementById('edit-question-id').value = '';
      document.getElementById('question-dialog-title').textContent = 'Tambah Pertanyaan Baru';
      if (optionsGroup) optionsGroup.style.display = 'none';
      
      const optionsInput = document.getElementById('question-options');
      if (optionsInput) optionsInput.removeAttribute('required');

      questionDialog.showModal();
      document.body.classList.add('dialog-open');
    });
  }

  if (questionTypeSelect && optionsGroup) {
    questionTypeSelect.addEventListener('change', () => {
      const type = questionTypeSelect.value;
      const optionsInput = document.getElementById('question-options');
      
      if (type === 'radio' || type === 'select') {
        optionsGroup.style.display = 'block';
        if (optionsInput) optionsInput.setAttribute('required', 'required');
      } else {
        optionsGroup.style.display = 'none';
        if (optionsInput) optionsInput.removeAttribute('required');
      }
    });
  }

  const closeQuestionDialog = () => {
    playRoboticSound('click');
    if (questionDialog) questionDialog.close();
  };

  if (btnCancelQuestion) btnCancelQuestion.addEventListener('click', closeQuestionDialog);
  if (btnCloseQuestion) btnCloseQuestion.addEventListener('click', closeQuestionDialog);
  if (questionDialog) {
    questionDialog.addEventListener('close', () => {
      document.body.classList.remove('dialog-open');
    });
  }

  if (questionForm && questionDialog) {
    questionForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const qIdInput = document.getElementById('edit-question-id');
      const labelInput = document.getElementById('question-label');
      const typeSelect = document.getElementById('question-type');
      const optionsInput = document.getElementById('question-options');
      const requiredCheckbox = document.getElementById('question-required');

      const label = labelInput.value.trim();
      const type = typeSelect.value;
      const required = requiredCheckbox.checked;
      let options = null;

      if (type === 'radio' || type === 'select') {
        options = optionsInput.value.split(',')
          .map(opt => opt.trim())
          .filter(opt => opt.length > 0);
        
        if (options.length === 0) {
          playRoboticSound('error');
          alert('Silakan masukkan opsi pilihan yang valid (koma-dipisahkan) untuk tipe pertanyaan pilihan!');
          optionsInput.focus();
          return;
        }
      }

      const qId = qIdInput.value;
      if (!qId) {
        const newQuestion = {
          id: 'q-' + Date.now(),
          label: label,
          type: type,
          options: options,
          required: required
        };
        if (!regSettings.customQuestions) regSettings.customQuestions = [];
        regSettings.customQuestions.push(newQuestion);
      } else {
        const idx = regSettings.customQuestions.findIndex(q => q.id === qId);
        if (idx !== -1) {
          regSettings.customQuestions[idx] = {
            id: qId,
            label: label,
            type: type,
            options: options,
            required: required
          };
        }
      }

      saveData('robotik_reg_settings', regSettings);
      
      playRoboticSound('success');
      questionDialog.close();

      renderCustomQuestionsInForm();
      renderAdminQuestionsTable();
      alert('Pertanyaan kustom berhasil disimpan!');
    });
  }
}

function renderAdminQuestionsTable() {
  const tableBody = document.getElementById('admin-questions-table-body');
  if (!tableBody) return;

  if (!regSettings.customQuestions || regSettings.customQuestions.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Tidak ada pertanyaan kustom. Silakan tambah baru.</td></tr>`;
    return;
  }

  tableBody.innerHTML = regSettings.customQuestions.map((q, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td style="font-weight: 600; color: var(--text-white);">${escapeHtml(q.label)}</td>
      <td><span class="table-badge">${escapeHtml(q.type.toUpperCase())}</span></td>
      <td>${q.options ? escapeHtml(q.options.join(', ')) : '-'}</td>
      <td>
        <span class="table-badge" style="background: ${q.required ? 'rgba(234,179,8,0.1)' : 'rgba(255,255,255,0.05)'}; color: ${q.required ? '#FACC15' : 'var(--text-muted)'}; font-weight: bold;">
          ${q.required ? 'YA' : 'TIDAK'}
        </span>
      </td>
      <td>
        <div style="display: flex; gap: 0.5rem;">
          <button type="button" class="btn btn-outline-cyan btn-sm edit-question-btn" data-id="${q.id}">Edit</button>
          <button type="button" class="btn btn-secondary btn-sm delete-question-btn" data-id="${q.id}" style="border-color: rgba(244,63,94,0.3); color: #FB7185;">Hapus</button>
        </div>
      </td>
    </tr>
  `).join('');

  tableBody.querySelectorAll('.edit-question-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const qId = btn.getAttribute('data-id');
      const q = regSettings.customQuestions.find(item => item.id === qId);
      if (!q) return;

      playRoboticSound('click');
      
      document.getElementById('edit-question-id').value = q.id;
      document.getElementById('question-label').value = q.label;
      document.getElementById('question-type').value = q.type;
      
      const optionsInput = document.getElementById('question-options');
      const optionsGroup = document.getElementById('question-options-group');
      if (q.type === 'radio' || q.type === 'select') {
        if (optionsInput) {
          optionsInput.value = q.options ? q.options.join(', ') : '';
          optionsInput.setAttribute('required', 'required');
        }
        if (optionsGroup) optionsGroup.style.display = 'block';
      } else {
        if (optionsInput) {
          optionsInput.value = '';
          optionsInput.removeAttribute('required');
        }
        if (optionsGroup) optionsGroup.style.display = 'none';
      }

      document.getElementById('question-required').checked = q.required;
      document.getElementById('question-dialog-title').textContent = 'Ubah Pertanyaan Kustom';

      const questionDialog = document.getElementById('custom-question-dialog');
      if (questionDialog) {
        questionDialog.showModal();
        document.body.classList.add('dialog-open');
      }
    });
    btn.addEventListener('mouseenter', () => playRoboticSound('hover'));
  });

  tableBody.querySelectorAll('.delete-question-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const qId = btn.getAttribute('data-id');
      const qIdx = regSettings.customQuestions.findIndex(item => item.id === qId);
      if (qIdx === -1) return;

      const q = regSettings.customQuestions[qIdx];
      if (confirm(`Apakah Anda yakin ingin menghapus pertanyaan kustom: "${q.label}"?`)) {
        playRoboticSound('click');
        regSettings.customQuestions.splice(qIdx, 1);
        saveData('robotik_reg_settings', regSettings);
        
        renderCustomQuestionsInForm();
        renderAdminQuestionsTable();
      } else {
        playRoboticSound('error');
      }
    });
    btn.addEventListener('mouseenter', () => playRoboticSound('hover'));
  });
}

function renderLandingPage() {
  const heroTagEl = document.getElementById('home-hero-tag');
  const heroTitleEl = document.getElementById('home-title');
  const heroDescEl = document.getElementById('home-hero-desc');
  const visiTextEl = document.getElementById('home-visi-text');
  const misiListEl = document.getElementById('home-misi-list');
  const divMechDescEl = document.getElementById('home-div-mech-desc');
  const divElecDescEl = document.getElementById('home-div-elec-desc');
  const divProgDescEl = document.getElementById('home-div-prog-desc');
  const achievementsEl = document.getElementById('home-achievements-marquee');

  if (heroTagEl) heroTagEl.textContent = landingData.heroTag;
  if (heroTitleEl) heroTitleEl.innerHTML = landingData.heroTitle;
  if (heroDescEl) heroDescEl.textContent = landingData.heroDesc;
  if (visiTextEl) visiTextEl.textContent = landingData.visiText;
  
  if (misiListEl && landingData.misiList) {
    misiListEl.innerHTML = landingData.misiList.map(misi => `<li>${escapeHtml(misi)}</li>`).join('');
  }
  
  if (divMechDescEl) divMechDescEl.textContent = landingData.divMechDesc;
  if (divElecDescEl) divElecDescEl.textContent = landingData.divElecDesc;
  if (divProgDescEl) divProgDescEl.textContent = landingData.divProgDesc;

  if (achievementsEl && landingData.achievements) {
    const itemsHtml = landingData.achievements.map(ach => 
      `<div class="prestasi-item"><span class="prestasi-trophy">🏆</span> ${escapeHtml(ach.title)} <span class="prestasi-year">${escapeHtml(ach.year)}</span></div>`
    ).join('');
    achievementsEl.innerHTML = `
      <div class="marquee-track">${itemsHtml}</div>
      <div class="marquee-track">${itemsHtml}</div>
    `;
  }
}

function setupLandingPageCMS() {
  const form = document.getElementById('cms-landing-form');
  if (!form) return;

  function renderAdminAchievementsTable() {
    const tableBody = document.getElementById('admin-achievements-table-body');
    if (!tableBody) return;

    if (!landingData.achievements || landingData.achievements.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Tidak ada data prestasi kejuaraan. Silakan tambah baru.</td></tr>`;
      return;
    }

    tableBody.innerHTML = landingData.achievements.map((ach, idx) => `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td style="font-weight: 600; color: var(--text-white);">${escapeHtml(ach.title)}</td>
        <td style="text-align: center;"><span class="table-badge" style="background: rgba(6,182,212,0.1); color: var(--accent-cyan); font-weight: bold; border: 1px solid rgba(6,182,212,0.2);">${escapeHtml(ach.year)}</span></td>
        <td style="text-align: center;">
          <div style="display: flex; gap: 0.5rem; justify-content: center;">
            <button type="button" class="btn btn-outline-cyan btn-sm edit-ach-btn" data-index="${idx}">Edit</button>
            <button type="button" class="btn btn-secondary btn-sm delete-ach-btn" data-index="${idx}" style="border-color: rgba(244,63,94,0.3); color: #FB7185;">Hapus</button>
          </div>
        </td>
      </tr>
    `).join('');

    // Attach click listeners for edit
    tableBody.querySelectorAll('.edit-ach-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        const ach = landingData.achievements[idx];
        if (!ach) return;
        
        playRoboticSound('click');
        document.getElementById('edit-achievement-idx').value = idx;
        document.getElementById('achievement-title').value = ach.title;
        document.getElementById('achievement-year').value = ach.year;
        
        const dialog = document.getElementById('custom-achievement-dialog');
        if (dialog) dialog.showModal();
      });
    });

    // Attach click listeners for delete
    tableBody.querySelectorAll('.delete-ach-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        if (confirm('Apakah Anda yakin ingin menghapus prestasi kejuaraan ini?')) {
          playRoboticSound('click');
          landingData.achievements.splice(idx, 1);
          saveData('robotik_landing', landingData);
          renderLandingPage();
          renderAdminAchievementsTable();
        }
      });
    });
  }

  const achDialog = document.getElementById('custom-achievement-dialog');
  const achForm = document.getElementById('custom-achievement-form');
  const btnAddAch = document.getElementById('btn-add-custom-achievement');
  const btnCloseAch = document.getElementById('close-achievement-dialog-btn');
  const btnCancelAch = document.getElementById('btn-cancel-achievement-dialog');

  if (btnAddAch && achDialog) {
    btnAddAch.addEventListener('click', () => {
      playRoboticSound('click');
      document.getElementById('edit-achievement-idx').value = '';
      document.getElementById('achievement-title').value = '';
      document.getElementById('achievement-year').value = '';
      achDialog.showModal();
    });
  }

  const closeAchModal = () => {
    playRoboticSound('click');
    if (achDialog) achDialog.close();
  };

  if (btnCloseAch) btnCloseAch.addEventListener('click', closeAchModal);
  if (btnCancelAch) btnCancelAch.addEventListener('click', closeAchModal);

  if (achForm) {
    achForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const idxVal = document.getElementById('edit-achievement-idx').value;
      const titleVal = document.getElementById('achievement-title').value.trim();
      const yearVal = document.getElementById('achievement-year').value.trim();

      if (!landingData.achievements) {
        landingData.achievements = [];
      }

      if (idxVal !== '') {
        const idx = parseInt(idxVal, 10);
        landingData.achievements[idx] = { title: titleVal, year: yearVal };
      } else {
        landingData.achievements.push({ title: titleVal, year: yearVal });
      }

      saveData('robotik_landing', landingData);
      renderLandingPage();
      renderAdminAchievementsTable();

      playRoboticSound('success');
      if (achDialog) achDialog.close();
    });
  }

  function populateLandingCmsInputs() {
    const heroTagInput = document.getElementById('cms-hero-tag');
    const heroTitleInput = document.getElementById('cms-hero-title');
    const heroDescInput = document.getElementById('cms-hero-desc');
    const visiTextInput = document.getElementById('cms-visi-text');
    const divMechInput = document.getElementById('cms-div-mech-desc');
    const divElecInput = document.getElementById('cms-div-elec-desc');
    const divProgInput = document.getElementById('cms-div-prog-desc');

    if (heroTagInput) heroTagInput.value = landingData.heroTag || '';
    if (heroTitleInput) heroTitleInput.value = landingData.heroTitle || '';
    if (heroDescInput) heroDescInput.value = landingData.heroDesc || '';
    if (visiTextInput) visiTextInput.value = landingData.visiText || '';

    // Populate Misi list
    if (landingData.misiList) {
      for (let i = 0; i < 4; i++) {
        const input = document.getElementById(`cms-misi-item-${i + 1}`);
        if (input) input.value = landingData.misiList[i] || '';
      }
    }

    if (divMechInput) divMechInput.value = landingData.divMechDesc || '';
    if (divElecInput) divElecInput.value = landingData.divElecDesc || '';
    if (divProgInput) divProgInput.value = landingData.divProgDesc || '';

    renderAdminAchievementsTable();
  }

  // Populate initially
  populateLandingCmsInputs();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    playRoboticSound('click');

    const heroTagInput = document.getElementById('cms-hero-tag');
    const heroTitleInput = document.getElementById('cms-hero-title');
    const heroDescInput = document.getElementById('cms-hero-desc');
    const visiTextInput = document.getElementById('cms-visi-text');
    const divMechInput = document.getElementById('cms-div-mech-desc');
    const divElecInput = document.getElementById('cms-div-elec-desc');
    const divProgInput = document.getElementById('cms-div-prog-desc');

    // Collect Misi list
    const updatedMisi = [];
    for (let i = 1; i <= 4; i++) {
      const input = document.getElementById(`cms-misi-item-${i}`);
      if (input) updatedMisi.push(input.value.trim());
    }

    // Save to landingData object
    landingData = {
      heroTag: heroTagInput ? heroTagInput.value.trim() : '',
      heroTitle: heroTitleInput ? heroTitleInput.value.trim() : '',
      heroDesc: heroDescInput ? heroDescInput.value.trim() : '',
      visiText: visiTextInput ? visiTextInput.value.trim() : '',
      misiList: updatedMisi,
      divMechDesc: divMechInput ? divMechInput.value.trim() : '',
      divElecDesc: divElecInput ? divElecInput.value.trim() : '',
      divProgDesc: divProgInput ? divProgInput.value.trim() : '',
      achievements: landingData.achievements || []
    };

    saveData('robotik_landing', landingData);
    renderLandingPage();

    playRoboticSound('success');
    alert('Konten landing page berhasil diperbarui! 🚀');
  });

  // Expose populate function to window for database reset triggers
  window.populateLandingCmsInputs = populateLandingCmsInputs;
}

function renderWhatsAppBanner() {
  const successWaTitle = document.getElementById('success-wa-title');
  const successWaDesc = document.getElementById('success-wa-desc');
  const successWaLink = document.getElementById('success-wa-link');

  if (successWaTitle) {
    successWaTitle.textContent = regSettings.waTitle || 'Grup WhatsApp Resmi Calon Anggota';
  }
  if (successWaDesc) {
    successWaDesc.textContent = regSettings.waDesc || '';
  }
  if (successWaLink) {
    successWaLink.href = regSettings.waLink || 'https://chat.whatsapp.com/mock-motechart-robotik';
    successWaLink.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.031 2C6.51 2 2.03 6.48 2.03 12c0 2.159.57 4.259 1.66 6.13l-1.77 6.47 6.63-1.74c1.88 1.02 4 1.56 6.13 1.56 5.52 0 10-4.48 10-10S17.551 2 12.031 2zm6.39 14.19c-.27.76-1.55 1.48-2.15 1.56-.54.07-1.24.1-3.64-.89-3.07-1.26-5.05-4.38-5.2-4.58-.15-.2-1.2-1.6-1.2-3.06 0-1.46.76-2.17 1.03-2.46.27-.3.59-.37.79-.37.2 0 .4.01.57.02.18.01.41-.07.65.5.24.58.82 2.02.9 2.17.08.16.14.35.03.56-.11.22-.26.47-.38.61-.13.14-.26.3-.11.56.15.26.68 1.12 1.46 1.82.99.9 1.83 1.18 2.09 1.31.26.13.41.11.56-.06.15-.18.66-.76.84-.96.18-.2.37-.16.63-.07.26.09 1.66.78 1.95.92.29.14.48.22.56.35.07.13.07.76-.2 1.52z"/>
      </svg>
      Gabung Grup WhatsApp Calon Anggota 🚀
    `;
  }
}

async function initializeCloudDataSync() {
  if (useFirebase) {
    console.log("Motechart Cloud Engine: Initiating data sync from Firebase Firestore...");
    await syncLandingDataFromFirestore();
    await syncRegSettingsFromFirestore();
    await syncApplicantsFromFirestore();
    
    // Setup real-time dynamic listener for admin applicants list
    setupRealTimeApplicantsSync();
    
    // Re-render components with newly synced cloud data
    renderLandingPage();
    renderCustomQuestionsInForm();
    updateCountdownTimer();
    renderWhatsAppBanner();
    
    // Re-populate inputs in CMS if forms are loaded
    if (typeof window.populateLandingCmsInputs === 'function') {
      window.populateLandingCmsInputs();
    }
    if (typeof window.populateRegSettingsCmsInputs === 'function') {
      window.populateRegSettingsCmsInputs();
    }
  }
}

function setupPendaftaranCMSAndCountdown() {
  renderCustomQuestionsInForm();
  updateCountdownTimer();
  setupStatusChecker();
  setupAdminRegSettings();
  renderWhatsAppBanner();
}

// --- COMPRESS IMAGE & CANVAS UPLOADER ---
function compressImage(file, callback) {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (event) => {
    const img = new Image();
    img.src = event.target.result;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      const maxBound = 800;
      if (width > maxBound) {
        height = Math.round((height * maxBound) / width);
        width = maxBound;
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
      callback(compressedDataUrl);
    };
  };
}

function setupLocalImageUploader(item) {
  const btnUploadLocal = document.getElementById('btn-upload-local');
  const editImageFile = document.getElementById('edit-image-file');
  const editHeaderImage = document.getElementById('edit-header-image');
  const editImagePreview = document.getElementById('edit-image-preview');
  const uploadStatus = document.getElementById('upload-status');

  if (item && editImagePreview && item.headerImage) {
    editImagePreview.style.backgroundImage = `url('${item.headerImage}')`;
    editImagePreview.style.display = 'block';
  }

  if (btnUploadLocal && editImageFile) {
    btnUploadLocal.addEventListener('click', () => {
      playRoboticSound('click');
      editImageFile.click();
    });

    editImageFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (uploadStatus) {
        uploadStatus.textContent = 'Mengompres gambar... 🔄';
        uploadStatus.style.color = 'var(--accent-cyan)';
      }

      compressImage(file, (base64Url) => {
        if (editHeaderImage) {
          editHeaderImage.value = base64Url;
          editHeaderImage.dispatchEvent(new Event('input'));
        }
        if (editImagePreview) {
          editImagePreview.style.backgroundImage = `url('${base64Url}')`;
          editImagePreview.style.display = 'block';
        }
        if (uploadStatus) {
          const sizeInKb = Math.round((base64Url.length * 3) / 4 / 1024);
          uploadStatus.textContent = `Sukses dikompres! ⚡ (${sizeInKb} KB)`;
          uploadStatus.style.color = '#34D399';
        }
        playRoboticSound('success');
      });
    });
  }

  if (editHeaderImage && editImagePreview) {
    editHeaderImage.addEventListener('input', () => {
      const urlVal = editHeaderImage.value.trim();
      if (urlVal) {
        editImagePreview.style.backgroundImage = `url('${urlVal}')`;
        editImagePreview.style.display = 'block';
      } else {
        editImagePreview.style.backgroundImage = 'none';
        editImagePreview.style.display = 'none';
      }
    });
  }
}


// --- APPLICANTS FILTER & EXPORTER ---
function setupApplicantsFilterAndExport() {
  const searchInput = document.getElementById('search-applicants');
  const statusSelect = document.getElementById('filter-applicant-status');
  const btnExportCsv = document.getElementById('btn-export-applicants-csv');

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderAdminApplicantsTable();
    });
  }

  if (statusSelect) {
    statusSelect.addEventListener('change', () => {
      playRoboticSound('click');
      renderAdminApplicantsTable();
    });
  }

  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', () => {
      playRoboticSound('click');
      exportApplicantsToCsv();
    });
  }
}

function exportApplicantsToCsv() {
  if (applicants.length === 0) {
    alert('Tidak ada data pendaftar untuk diekspor.');
    playRoboticSound('error');
    return;
  }

  const headers = ['No', 'ID Pendaftaran', 'Nama Lengkap', 'Kelas', 'NISN', 'No. WhatsApp', 'Minat Divisi', 'Motivasi', 'Tanggal Daftar', 'Status'];
  
  const rows = applicants.map((app, index) => {
    const joinedDivisions = Array.isArray(app.divisi) ? app.divisi.join(', ') : app.divisi;
    return [
      index + 1,
      app.id || '',
      app.nama || '',
      app.kelas || '',
      app.nisn || '',
      app.noHp || '',
      joinedDivisions || '',
      (app.motivasi || '').replace(/\r?\n/g, ' '),
      app.tanggalDaftar || '',
      app.status || ''
    ];
  });

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.map(val => {
      const strVal = String(val).replace(/"/g, '""');
      return `"${strVal}"`;
    }).join(';'))
  ].join('\r\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `pendaftar-robotik-${new Date().getFullYear()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  playRoboticSound('success');
}

// --- APP BOOTSTRAP ---
document.addEventListener('DOMContentLoaded', () => {
  setupRouter();
  setupAudioToggle();
  setupBlog();
  setupPortfolio();
  setupRegistrationForm();
  setupInteractiveCircuit();
  setupApplicantsDialog();
  
  // Initialize landing page content
  renderLandingPage();
  setupLandingPageCMS();
  
  // Dynamic CMS setups boot hookup
  setupCmsAuthentication();
  setupCmsTabs();
  setupPendaftaranCMSAndCountdown();
  setupApplicantsFilterAndExport();

  // Async cloud sync trigger (runs in background and populates UI seamlessly)
  initializeCloudDataSync();
});

