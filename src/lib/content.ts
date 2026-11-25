import { MEDIA_ASSETS } from './media';
import type {
  Applicant,
  BlogArticle,
  DivisionCatalogItem,
  LandingData,
  PortfolioProject,
  RegistrationSettings,
} from './types';

export const INITIAL_BLOG_ARTICLES: BlogArticle[] = [
  {
    id: 1,
    title: 'Mengenal Mikrokontroler Arduino Uno & Sketch Pertama',
    category: 'arduino',
    date: '15 Mei 2026',
    author: 'Tim Mentor Motechart',
    readTime: '5 menit baca',
    excerpt:
      'Pelajari arsitektur mikrokontroler ATmega328P pada Arduino Uno, konfigurasi pin I/O digital-analog, serta cara menulis dan mengunggah program Blink pertamamu.',
    headerImage: MEDIA_ASSETS.arduinoWorkshop,
    content: `### Mengenal Mikrokontroler Arduino Uno

Arduino Uno adalah papan pengembangan berbasis **mikrokontroler ATmega328P** (arsitektur AVR 8-bit, clock 16 MHz) dengan 14 pin I/O digital (6 di antaranya mendukung PWM) dan 6 pin input analog (ADC 10-bit). Berbeda dengan mikroprosesor komputer, mikrokontroler sudah menyatukan CPU, RAM, Flash memory, dan periferal dalam satu chip sehingga ideal untuk mengendalikan sensor dan aktuator secara real-time.

### Struktur Dasar Sketch C++ Arduino

Setiap program Arduino (disebut *sketch*) ditulis dalam bahasa C/C++ dan memiliki dua fungsi wajib: \`setup()\` yang berjalan sekali saat daya aktif, serta \`loop()\` yang berjalan terus-menerus.

\`\`\`cpp
// Program Blink menggunakan LED bawaan (pin 13 / LED_BUILTIN)
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH); // Menyalakan LED (5V)
  delay(500);                      // Tunggu 500 ms
  digitalWrite(LED_BUILTIN, LOW);  // Mematikan LED (0V)
  delay(500);                      // Tunggu 500 ms
}
\`\`\`

### Langkah Uji Coba di Laboratorium

1. Hubungkan papan Arduino Uno ke laptop menggunakan kabel USB tipe B (atau USB-C pada varian R4/clone terbaru).
2. Buka **Arduino IDE 2.x**, lalu pilih papan *Arduino Uno* dan port COM/USB aktif pada menu **Tools -> Board & Port**.
3. Klik ikon **Verify** untuk memastikan tidak ada galat kompilasi, kemudian klik **Upload**.
4. Amati LED bertanda **L** di dekat pin 13 yang berkedip stabil setiap setengah detik.

> Tips keselamatan lab: Selalu pastikan pin 5V dan GND tidak terhubung singkat sebelum menghubungkan kabel USB ke laptop.`,
  },
  {
    id: 2,
    title: 'Panduan Merakit Robot Line Follower Analog dengan Komparator LM358',
    category: 'tutorial',
    date: '10 Mei 2026',
    author: 'Faris Ramadhan — Ketua Divisi Elektronik',
    readTime: '7 menit baca',
    excerpt:
      'Cara membangun robot pengikut garis tanpa pemrograman menggunakan sensor IR Photodiode, Op-Amp komparator LM358, transistor driver TIP41C, dan proteksi dioda flyback.',
    headerImage: MEDIA_ASSETS.mazeSolver,
    content: `### Prinsip Kerja Line Follower Analog

Robot Line Follower analog membaca perbedaan pantulan cahaya inframerah antara garis lintasan berwarna hitam dan permukaan arena berwarna putih, lalu mengendalikan kecepatan motor DC secara langsung melalui rangkaian elektronik tanpa mikrokontroler. Proyek ini menjadi fondasi wajib bagi anggota baru untuk memahami sensor optik dan driver motor.

### Daftar Komponen Utama

- **Sensor Optik**: 2 pasang LED Inframerah (IR LED) dan Photodiode (lebih cepat dan kebal terhadap perubahan lampu ruangan dibanding LDR).
- **Komparator**: 1 buah IC Dual Op-Amp **LM358** ditambah trimpot 10 kΩ sebagai pengatur tegangan referensi (*threshold*).
- **Driver Motor & Proteksi**: 2 transistor NPN **TIP41C** (dengan resistor basis 1 kΩ) dan 2 dioda **1N4007** paralel terbalik pada terminal motor sebagai *flyback diode* untuk meredam lonjakan tegangan induktif.
- **Aktuator & Daya**: Sepasang Motor DC Gearbox 6V–9V, sasis akrilik 3 mm, dan baterai Li-Ion 18650 2-cell (7.4V).

### Mekanisme Belok Otomatis

Ketika permukaan di bawah kedua sensor berwarna putih, cahaya IR terpantul maksimal sehingga kedua motor berputar maju serentak. Saat sensor kiri mendeteksi garis hitam, pantulan cahaya menurun tajam sehingga keluaran komparator mematikan motor kiri sementara motor kanan tetap berputar. Hasilnya, robot berbelok mulus **ke tengah garis lintasan** secara instan tanpa jeda perangkat lunak.`,
  },
  {
    id: 3,
    title: 'Telemetri Robot Jarak Jauh Menggunakan ESP32 dan Protokol MQTT',
    category: 'iot',
    date: '02 Mei 2026',
    author: 'Zaskia Amalia — Alumni & Mentor IoT',
    readTime: '6 menit baca',
    excerpt:
      'Pahami arsitektur publish-subscribe MQTT pada ESP32 untuk mengirim data sensor dan menerima perintah kendali robot berlatensi rendah melalui jaringan Wi-Fi.',
    headerImage: MEDIA_ASSETS.smartAgri,
    content: `### Mengapa ESP32 + MQTT Ideal untuk Robotika?

**ESP32** dibekali prosesor dual-core 240 MHz, Wi-Fi 2.4 GHz, Bluetooth BLE, serta ADC 12-bit dalam modul berbiaya terjangkau. Sementara **MQTT (Message Queuing Telemetry Transport)** adalah protokol komunikasi ringan berbasis arsitektur *publish/subscribe* melalui sebuah *broker* pusat—sangat hemat bandwidth dan memiliki latensi jauh lebih rendah dibanding HTTP polling.

### Contoh Kode Publish Telemetri ESP32

Berikut contoh potongan kode menggunakan pustaka \`PubSubClient\` untuk menerbitkan data kelembaban media tanam ke topik \`motechart/agri/moisture\`:

\`\`\`cpp
#include <WiFi.h>
#include <PubSubClient.h>

const char* SSID = "Lab_Motechart_WiFi";
const char* PASS = "rahasia_lab_2026";
const char* BROKER = "broker.hivemq.com";

WiFiClient espClient;
PubSubClient mqtt(espClient);

void setup() {
  Serial.begin(115200);
  WiFi.begin(SSID, PASS);
  while (WiFi.status() != WL_CONNECTED) delay(250);
  mqtt.setServer(BROKER, 1883);
}

void loop() {
  if (!mqtt.connected()) mqtt.connect("motechart-esp32-node01");
  mqtt.loop();
  int rawSoil = analogRead(34);
  char payload[16];
  snprintf(payload, sizeof(payload), "%d", rawSoil);
  mqtt.publish("motechart/agri/moisture", payload);
  delay(2000);
}
\`\`\`

### Praktik Terbaik di Lapangan

- Pisahkan topik perintah (contoh: \`motechart/robot/cmd\`) dari topik telemetri (\`motechart/robot/status\`).
- Hindari \`delay()\` panjang pada robot bergerak; gunakan \`millis()\` agar \`mqtt.loop()\` tetap responsif membaca perintah berhenti darurat.`,
  },
  {
    id: 4,
    title: 'Strategi Persiapan Tim untuk Kompetisi Robotika Nasional',
    category: 'kompetisi',
    date: '28 April 2026',
    author: 'Drs. Eko Prasetyo — Pembina Ekstrakurikuler',
    readTime: '6 menit baca',
    excerpt:
      'Pelajaran teknis dan nonteknis dari persiapan ajang KRI, Madrasah Robotics Competition (MRC), dan riset sains remaja bersama BRIN & Puspresnas.',
    headerImage: MEDIA_ASSETS.heroLab,
    content: `### 1. Arsitektur Sasis Modular & Mudah Diperbaiki

Pada kompetisi seperti **Madrasah Robotics Competition (MRC)** maupun lomba robotik tingkat nasional, benturan fisik hampir tidak terelakkan. Gunakan konektor JST/XT60 berlabel warna dan baut standar M3 sehingga motor, driver, atau modul sensor yang rusak dapat diganti dalam waktu kurang dari 3 menit di *pit-stop*.

### 2. Pemisahan Jalur Daya (Power Isolation)

Penyebab paling sering mikrokontroler mengalami *brown-out reset* di tengah arena adalah lonjakan arus start motor DC/servo yang ditarik dari jalur yang sama. Selalu gunakan baterai Li-Po dengan *C-Rating* memadai untuk aktuator, serta modul **Buck Converter terpisah** (atau kapasitor decoupling 1000 µF) untuk menyuplai tegangan bersih 5V ke mikrokontroler dan sensor.

### 3. Prosedur Kalibrasi Cepat 5 Menit

Pencahayaan gedung perlombaan selalu berbeda dari ruang laboratorium sekolah. Siapkan tombol fisik kalibrasi otomatis (*auto-threshold*) dan simpan nilai kalibrasi ke **EEPROM** agar tim pemrograman dapat menyesuaikan sensor garis atau sudut gyroscope segera saat sesi *running test* arena dimulai.`,
  },
];

export const INITIAL_PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: 1,
    title: 'Soccer Bot v2.0 — 4WD Mecanum Striker',
    category: 'mekanik & elektronik',
    divisionKey: 'mechanics',
    status: 'Selesai',
    year: '2025',
    creators: 'Tim R&D Kelas XI (Rian, Maya, Dika)',
    components:
      'Arduino Mega 2560, 2× Motor Driver BTS7960/L298N, 4× Motor DC High-Torque 12V + Roda Mecanum 60mm, Modul Bluetooth HC-05, Boost Converter 12V→24V + Bank Kapasitor, Solenoid Kicker 24V, Baterai Li-Po 3S 11.1V',
    specs:
      'Kecepatan puncak 1.4 m/s · Manuver omnidirectional 360° (Mecanum 4WD) · Daya tendang solenoid 24V non-blocking · Kontrol Bluetooth HC-05',
    description:
      'Robot penyerang 4-roda Mecanum berkecepatan tinggi dengan tendangan solenoid 24V berbasis boost converter untuk kompetisi sepak bola robot regional.',
    headerImage: MEDIA_ASSETS.soccerBot,
    content: `### Robot Striker Lapangan Hijau

Soccer Bot v2.0 dirancang untuk manuver lincah ke segala arah di arena sepak bola robot. Dengan konfigurasi empat roda **Mecanum 4WD**, robot dapat bergerak maju, mundur, menyamping (*strafe*), hingga berputar di tempat tanpa kehilangan orientasi ke gawang lawan.

### Arsitektur Mekanik & Elektronika

- **Sasis Berlapis**: Plat akrilik hitam 5 mm hasil pemotongan laser CNC dengan dudukan *standoff* aluminium M3 agar titik pusat massa tetap rendah.
- **Sistem Penendang Solenoid 24V**: Daya dari baterai Li-Po 3S (11.1V) dinaikkan melalui modul **DC-DC Boost Converter ke 24V** dan disimpan sementara pada kapasitor elektrolit 4700 µF untuk menghasilkan dorongan bola cepat melalui MOSFET switching pin D12.
- **Kendali Non-Blocking**: Pulsa tendangan dibatasi 120 ms menggunakan timer \`millis()\` sehingga robot tetap responsif bermanuver sambil menendang.

### Pencapaian

Meraih **Juara 2 Kategori Robot Sepak Bola Tingkat Regional 2025** dengan rekor tanpa kebobolan di babak penyisihan grup.`,
    code: `// Kendali Motor 4WD Mecanum (Dual-Channel L/R) & Solenoid Non-Blocking
// Board: Arduino Mega 2560 + Bluetooth HC-05 (Serial1)

const uint8_t PIN_L_FWD = 5;
const uint8_t PIN_L_REV = 6;
const uint8_t PIN_R_FWD = 9;
const uint8_t PIN_R_REV = 10;
const uint8_t PIN_KICKER = 12;

bool kickerActive = false;
unsigned long kickerStartMs = 0;
const unsigned long KICK_PULSE_MS = 120;

void driveMotors(int leftPwm, int rightPwm) {
  analogWrite(PIN_L_FWD, leftPwm > 0 ? leftPwm : 0);
  analogWrite(PIN_L_REV, leftPwm < 0 ? -leftPwm : 0);
  analogWrite(PIN_R_FWD, rightPwm > 0 ? rightPwm : 0);
  analogWrite(PIN_R_REV, rightPwm < 0 ? -rightPwm : 0);
}

void setup() {
  Serial1.begin(9600);
  pinMode(PIN_L_FWD, OUTPUT);
  pinMode(PIN_L_REV, OUTPUT);
  pinMode(PIN_R_FWD, OUTPUT);
  pinMode(PIN_R_REV, OUTPUT);
  pinMode(PIN_KICKER, OUTPUT);
  digitalWrite(PIN_KICKER, LOW);
}

void loop() {
  if (Serial1.available() > 0) {
    char cmd = Serial1.read();
    if (cmd == 'F') driveMotors(230, 230);        // Maju
    else if (cmd == 'B') driveMotors(-200, -200); // Mundur
    else if (cmd == 'L') driveMotors(-180, 180);  // Putar Kiri
    else if (cmd == 'R') driveMotors(180, -180);  // Putar Kanan
    else if (cmd == 'S') driveMotors(0, 0);       // Berhenti
    else if (cmd == 'K' && !kickerActive) {
      digitalWrite(PIN_KICKER, HIGH);
      kickerActive = true;
      kickerStartMs = millis();
    }
  }

  // Non-blocking release agar kontrol gerak tetap responsif
  if (kickerActive && (millis() - kickerStartMs >= KICK_PULSE_MS)) {
    digitalWrite(PIN_KICKER, LOW);
    kickerActive = false;
  }
}`,
    schematic: `### Pemetaan Pinout (Arduino Mega 2560)

- **Daya Utama**: Baterai Li-Po 3S 11.1V → Jalur Motor Driver & Buck Converter 5V (ke pin 5V Arduino).
- **Motor Sisi Kiri (Depan+Belakang)**: PWM Pin **D5** (Maju), **D6** (Mundur) ke Driver Channel A.
- **Motor Sisi Kanan (Depan+Belakang)**: PWM Pin **D9** (Maju), **D10** (Mundur) ke Driver Channel B.
- **Modul Bluetooth HC-05**: TX → **RX1 (D19)**, RX (via voltage divider 3.3V) → **TX1 (D18)**.
- **Solenoid Kicker 24V**: Pin **D12** → Gate MOSFET IRLZ44N → Boost Converter 24V + Kapasitor 4700 µF + Dioda Flyback.`,
    showCode: true,
    isWinner: true,
    awardName: 'Juara 2 Robot Sepak Bola Regional 2025',
  },
  {
    id: 2,
    title: 'Smart Agriculture Telemetry Node (ESP32 IoT)',
    category: 'iot',
    divisionKey: 'electronics',
    status: 'Selesai',
    year: '2026',
    creators: 'Tim IoT Kelas XII (Sarah, Kevin)',
    components:
      'ESP32 DevKit V1, Capacitive Soil Moisture v1.2, Sensor Suhu & Kelembaban DHT22, OLED SSD1306 I2C 0.96", Modul Relay 5V Optocoupler, Pompa Air DC 5V',
    specs:
      'Telemetri JSON via MQTT setiap 2 detik · Layar OLED lokal · Histeresis irigasi otomatis (anti-chattering relay)',
    description:
      'Node monitoring hidroponik dan kelembaban media tanam berbasis ESP32 dengan pengiriman data MQTT real-time serta kontrol pompa otomatis berhisteresis.',
    headerImage: MEDIA_ASSETS.smartAgri,
    content: `### Otomatisasi Kebun Sains Sekolah

Smart Agriculture Telemetry Node memantau kelembaban media tanam, suhu udara, serta kelembaban lingkungan kebun hidroponik sekolah selama 24 jam penuh. Data dikirim via protokol **MQTT** dalam format JSON dan ditampilkan secara simultan pada layar OLED lokal.

### Cara Kerja & Logika Histeresis

1. **Akuisisi Sensor**: Sensor kapasitif pada GPIO34 membaca nilai ADC 12-bit (0–4095; nilai tinggi = tanah kering, nilai rendah = basah), lalu dikonversi menjadi persentase 0–100%. Sensor DHT22 pada GPIO4 membaca suhu (°C) dan kelembaban udara (%).
2. **Histeresis Pompa**: Pompa menyala otomatis jika kelembaban turun di bawah **35%** dan baru berhenti saat mencapai **55%**. Rentang selisih 20% mencegah relay berkedip cepat (*chattering*) di sekitar ambang batas.
3. **Telemetri MQTT**: Paket JSON dikirim setiap 2 detik ke topik \`motechart/greenhouse/telemetry\` tanpa menghambat pembacaan tombol manual.

### Dampak Implementasi

Berhasil menghemat konsumsi air penyiraman hingga **38%** pada uji coba 30 hari kebun hidroponik selada sekolah.`,
    code: `// Smart Agriculture ESP32: Capacitive Soil + DHT22 + MQTT Telemetry
#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

#define PIN_SOIL   34
#define PIN_DHT    4
#define PIN_RELAY  23
#define DHT_TYPE   DHT22

const int DRY_ADC = 3300; // Kalibrasi sensor kering (udara)
const int WET_ADC = 1400; // Kalibrasi sensor basah (air)

DHT dht(PIN_DHT, DHT_TYPE);
WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);

bool pumpOn = false;
unsigned long lastPublishMs = 0;

void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(PIN_RELAY, OUTPUT);
  digitalWrite(PIN_RELAY, LOW);

  WiFi.begin("Lab_Motechart_WiFi", "motechart_2026");
  while (WiFi.status() != WL_CONNECTED) delay(300);
  mqtt.setServer("broker.hivemq.com", 1883);
}

void loop() {
  if (!mqtt.connected()) mqtt.connect("motechart-smart-agri");
  mqtt.loop();

  if (millis() - lastPublishMs >= 2000) {
    lastPublishMs = millis();
    int raw = analogRead(PIN_SOIL);
    int moisturePct = constrain(map(raw, DRY_ADC, WET_ADC, 0, 100), 0, 100);
    float tempC = dht.readTemperature();
    float humPct = dht.readHumidity();

    // Histeresis: aktif <35%, mati >=55%
    if (!pumpOn && moisturePct < 35) pumpOn = true;
    else if (pumpOn && moisturePct >= 55) pumpOn = false;
    digitalWrite(PIN_RELAY, pumpOn ? HIGH : LOW);

    char json[128];
    snprintf(json, sizeof(json),
      "{\\"moisture\\":%d,\\"temp\\":%.1f,\\"hum\\":%.1f,\\"pump\\":%s}",
      moisturePct, isnan(tempC) ? 0.0 : tempC, isnan(humPct) ? 0.0 : humPct,
      pumpOn ? "true" : "false");
    mqtt.publish("motechart/greenhouse/telemetry", json);
  }
}`,
    schematic: `### Pemetaan Pinout (ESP32 DevKit V1)

- **Capacitive Soil Moisture v1.2**: VCC → **3.3V**, GND → **GND**, AOUT → **GPIO34** (Input Analog ADC1).
- **Sensor DHT22**: VCC → **3.3V**, DATA → **GPIO4** (dengan pull-up 10 kΩ), GND → **GND**.
- **OLED SSD1306 I2C**: SDA → **GPIO21**, SCL → **GPIO22**, VCC → **3.3V**.
- **Modul Relay Optocoupler**: IN → **GPIO23**, VCC → **5V** (Adaptor eksternal 5V 2A untuk mengisolasi arus pompa air DC 5V).`,
    showCode: true,
    isWinner: true,
    awardName: 'Juara 1 Karya Cipta IoT Provinsi 2026',
  },
  {
    id: 3,
    title: 'Maze Solver Autonomous — Flood-Fill Micromouse',
    category: 'pemrograman',
    divisionKey: 'programming',
    status: 'Pengembangan',
    year: '2026',
    creators: 'Tim Kompetisi Kelas X & XI (Adit, Budi, Riri)',
    components:
      'Arduino Nano (ATmega328P), 3× Sensor Ultrasonik HC-SR04 (Kiri, Depan, Kanan), IMU Gyroscope MPU6050, Motor Driver TB6612FNG, 2× Micro Metal Gearmotor N20 + Encoder',
    specs:
      'Pemetaan labirin 8×8 sel berbasis Flood-Fill · Koreksi heading MPU6050 · Timeout pembacaan ultrasonik 15 ms (bebas hang)',
    description:
      'Robot otonom pemecah labirin berdinding dengan tiga sensor ultrasonik, stabilisasi sudut gyroscope MPU6050, dan navigasi algoritma Flood-Fill.',
    headerImage: MEDIA_ASSETS.mazeSolver,
    content: `### Navigasi Otonom di Dalam Labirin

Maze Solver Autonomous memetakan arena labirin secara mandiri pada putaran eksplorasi pertama, lalu menghitung lintasan terpendek menuju titik pusat menggunakan algoritma **Flood-Fill** pada putaran kecepatan (*speed run*).

### Integrasi Sensor & Algoritma

- **Tri-Sensor Ultrasonik Aman Timeout**: Tiga sensor HC-SR04 (kiri, depan, kanan) dibaca berurutan dengan batas *timeout* \`pulseIn(..., 15000UL)\` (maksimal ±250 cm) agar program tidak pernah membeku menunggu gema yang hilang.
- **Stabilisasi Heading IMU**: Sensor **MPU6050** membaca kecepatan sudut sumbu-Z (*yaw rate*) untuk memastikan belokan 90° presisi dan menjaga lintasan tetap lurus sejajar dinding.
- **Driver Efisien TB6612FNG**: Menggantikan L298N agar penurunan tegangan (*voltage drop*) minim dan motor N20 bekerja pada torsi optimal.

### Fokus Riset Saat Ini

Tim sedang menyempurnakan kurva akselerasi PID berbasis *magnetic encoder* untuk memangkas waktu tempuh labirin 8×8 di bawah 18 detik.`,
    code: `// Pembacaan 3 Sensor Ultrasonik (Kiri, Depan, Kanan) + Navigasi Dinding
// Board: Arduino Nano + TB6612FNG + MPU6050 (I2C A4/A5)

const uint8_t TRIG_L = 2, ECHO_L = 3;
const uint8_t TRIG_F = 4, ECHO_F = 5;
const uint8_t TRIG_R = 6, ECHO_R = 7;

const float WALL_THRESHOLD_CM = 12.0;
const unsigned long ECHO_TIMEOUT_US = 15000UL; // Cegah blocking >15ms

float readDistanceCm(uint8_t trigPin, uint8_t echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  unsigned long duration = pulseIn(echoPin, HIGH, ECHO_TIMEOUT_US);
  if (duration == 0) return 250.0; // Tidak ada halangan dalam jangkauan
  return (duration * 0.0343f) * 0.5f;
}

void setup() {
  Serial.begin(115200);
  uint8_t trigs[3] = { TRIG_L, TRIG_F, TRIG_R };
  uint8_t echos[3] = { ECHO_L, ECHO_F, ECHO_R };
  for (int i = 0; i < 3; i++) {
    pinMode(trigs[i], OUTPUT);
    pinMode(echos[i], INPUT);
  }
}

void loop() {
  float dLeft  = readDistanceCm(TRIG_L, ECHO_L);
  float dFront = readDistanceCm(TRIG_F, ECHO_F);
  float dRight = readDistanceCm(TRIG_R, ECHO_R);

  if (dFront < WALL_THRESHOLD_CM) {
    if (dLeft > dRight && dLeft > 15.0) {
      // turnLeft90WithGyro();
    } else if (dRight > 15.0) {
      // turnRight90WithGyro();
    } else {
      // turnAround180WithGyro();
    }
  } else {
    // moveForwardWithWallPID(dLeft, dRight);
  }
}`,
    schematic: `### Pemetaan Pinout (Arduino Nano)

- **Ultrasonik Kiri**: TRIG → **D2**, ECHO → **D3**.
- **Ultrasonik Depan**: TRIG → **D4**, ECHO → **D5**.
- **Ultrasonik Kanan**: TRIG → **D6**, ECHO → **D7**.
- **Gyroscope MPU6050 (I2C)**: SDA → **A4**, SCL → **A5**, VCC → **5V** (regulator on-board).
- **Motor Driver TB6612FNG**: PWMA → **D9**, PWMB → **D10**, AIN1/2 → **D8/D11**, BIN1/2 → **D12/D13**, STBY → **5V**.`,
    showCode: true,
    isWinner: false,
    awardName: '',
  },
  {
    id: 4,
    title: 'Line Follower PID High-Speed — 8-Channel IR Array',
    category: 'pemrograman',
    divisionKey: 'programming',
    status: 'Selesai',
    year: '2025',
    creators: 'Tim Prestasi Kelas XI (Faris, Nabila, Dimas)',
    components:
      'Arduino Nano, Array 8 Sensor IR Photodiode (TCRT5000), Multiplexer / Direct Analog Read, Motor Driver TB6612FNG, 2× Motor N20 1000 RPM, Baterai Li-Po 2S 7.4V',
    specs:
      'Sampling kontrol 500 Hz · Auto-calibration garis disimpan di EEPROM · Kecepatan lintasan lurus 1.8 m/s',
    description:
      'Robot pengikut garis kompetitif dengan 8 kanal sensor inframerah dan pengendali PID terkalibrasi untuk tikungan tajam 90 derajat tanpa tergelincir.',
    headerImage: MEDIA_ASSETS.heroLab,
    content: `### Presisi Kecepatan Tinggi dengan PID

Line Follower PID High-Speed dirancang untuk menaklukkan lintasan berliku, persimpangan X/T, dan tikungan patah 90° pada kompetisi tingkat regional maupun ASEAN.

### Fitur Utama

- **Array 8 Sensor IR**: Memberikan resolusi posisi garis dari \`-3500\` hingga \`+3500\` menggunakan metode *weighted average*.
- **Algoritma Kontrol PID**: Menghitung koreksi diferensial motor kiri dan kanan secara halus berdasarkan galat posisi (*Proportional*), akumulasi deviasi (*Integral*), serta laju perubahan posisi (*Derivative*) untuk meredam osilasi.
- **Kalibrasi Lapangan 5 Detik**: Cukup tekan tombol kalibrasi sambil menggeser robot di atas garis hitam-putih; nilai batas otomatis tersimpan di EEPROM.`,
    code: `// Loop Kontrol PID Line Follower 8-Sensor
float Kp = 0.085f, Ki = 0.0005f, Kd = 0.42f;
int baseSpeed = 185;
int lastError = 0;
float integral = 0;

int computePID(int position) {
  int error = position - 3500; // Titik tengah 8 sensor (0..7000)
  integral = constrain(integral + error, -5000, 5000);
  int derivative = error - lastError;
  lastError = error;
  return (int)(Kp * error + Ki * integral + Kd * derivative);
}

void applyMotorCorrection(int correction) {
  int leftSpeed  = constrain(baseSpeed + correction, -255, 255);
  int rightSpeed = constrain(baseSpeed - correction, -255, 255);
  // setTB6612Motors(leftSpeed, rightSpeed);
}`,
    schematic: `### Pemetaan Pinout (Arduino Nano)

- **Sensor IR 8-Kanal**: Pin Analog **A0–A7** (pembacaan langsung 10-bit ADC).
- **Motor Driver TB6612FNG**: PWMA → **D5**, PWMB → **D6**, AIN1/2 → **D7/D8**, BIN1/2 → **D9/D10**.
- **Tombol Kalibrasi**: Pin **D2** (INPUT_PULLUP) untuk memulai kalibrasi 5 detik.`,
    showCode: true,
    isWinner: true,
    awardName: 'Juara 2 ASEAN Line Follower 2025',
  },
];

export const INITIAL_APPLICANTS: Applicant[] = [
  {
    id: 'ROBO-2026A001',
    nama: 'Muhammad Farhan Pratama',
    kelas: 'XI',
    email: 'farhan.pratama@man1bogor.sch.id',
    noHp: '081234567890',
    divisi: 'Pemrograman',
    laptop: 'Ya, Siap Digunakan',
    motivasi: 'Ingin mendalami kontrol PID dan membangun robot otonom untuk mewakili sekolah di kompetisi nasional.',
    tanggalDaftar: '2026-05-12',
    timestamp: '2026-05-12T08:30:00.000Z',
    status: 'Diterima',
    customAnswers: {
      'q-1779445719': 'Menengah (C++/Arduino)',
    },
  },
  {
    id: 'ROBO-2026P002',
    nama: 'Nadia Azzahra',
    kelas: 'X',
    email: 'nadia.azzahra@man1bogor.sch.id',
    noHp: '081398765432',
    divisi: 'Elektronik',
    laptop: 'Ya, Siap Digunakan',
    motivasi: 'Tertarik merancang rangkaian sensor IoT ESP32 dan belajar penyolderan PCB dari dasar bersama mentor.',
    tanggalDaftar: '2026-05-18',
    timestamp: '2026-05-18T14:15:00.000Z',
    status: 'Pending',
    customAnswers: {
      'q-1779445719': 'Dasar (HTML/CSS)',
    },
  },
];

const DEFAULT_CLOSE_AT = (() => {
  const dt = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
  dt.setHours(23, 59, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  const off = -dt.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  const absOff = Math.abs(off);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T23:59:00${sign}${pad(Math.floor(absOff / 60))}:${pad(absOff % 60)}`;
})();

export const INITIAL_REG_SETTINGS: RegistrationSettings = {
  mode: 'manual_open',
  openAt: '',
  closeAt: DEFAULT_CLOSE_AT,
  showCountdown: true,
  isOpen: true,
  status: 'open',
  showHeaderCountdown: true,
  countdownTarget: DEFAULT_CLOSE_AT,
  customQuestions: [
    {
      id: 'q-1779445719',
      label: 'Pengalaman coding atau elektronika kamu saat ini',
      type: 'select',
      options: ['Belum pernah (Mulai dari nol)', 'Dasar (Scratch / HTML / Rangkaian Sederhana)', 'Menengah (C++ / Arduino / ESP32)', 'Mahir (PCB / ROS / Pernah Lomba)'],
      required: true,
    },
  ],
  waTitle: 'Grup WhatsApp Calon Anggota',
  waDesc:
    'Masuk grup ini untuk dapat jadwal wawancara, sesi kenalan lab, dan pengumuman seleksi.',
  waLink: 'https://chat.whatsapp.com/mock-motechart-robotik',
};

export const INITIAL_LANDING_DATA: LandingData = {
  heroTag: 'Lab Robotika · MAN 1 Bogor',
  heroTitle: 'Rakit, Program, dan Jalankan <span>Robot Pertamamu</span>.',
  heroDesc:
    'Mulai dari nol di lab sekolah. Kamu pegang solder, cetak sasis 3D, dan tulis kode C++ sampai robotmu jalan sendiri.',
  visiText:
    'Mencetak pelajar yang bisa merancang, merakit, dan membawa robot buatan sendiri ke arena lomba nasional maupun internasional.',
  misiList: [
    'Latihan rutin langsung di meja praktik: CAD 3D, elektronika, dan pemrograman mikrokontroler.',
    'Ubah masalah di sekitar sekolah jadi proyek nyata berbasis sensor dan ESP32.',
    'Siapkan tim tanding yang disiplin dari uji lintasan lab sampai panggung kejuaraan.',
    'Biasakan kerja aman di lab, rapi dalam dokumentasi, dan solid saat kerja tim.',
  ],
  divMechDesc:
    'Kamu ubah sketsa jadi rangka robot yang kuat dan ringan. Mulai dari desain 3D, potong akrilik, sampai rakit siap tanding.',
  divElecDesc:
    'Kamu rancang jalur listrik dan otak sensor robot. Belajar solder rapi, atur baterai aman, dan hubungkan motor tanpa korslet.',
  divProgDesc:
    'Kamu tulis logika yang bikin robot bergerak sendiri. Dari kode C++ dasar, kontrol PID, sampai kendali jarak jauh lewat Wi-Fi.',
  achievements: [
    {
      juara: 'Juara 1 Nasional Kontes Robot Soccer',
      organizer: 'Puspresnas — Kemendikdasmen RI',
      year: '2025',
      level: 'Nasional',
    },
    {
      juara: 'Juara 2 Internasional ASEAN Line Follower',
      organizer: 'ASEAN Robotics Association',
      year: '2025',
      level: 'Internasional',
    },
    {
      juara: 'Juara 1 Provinsi Lomba Karya Cipta IoT',
      organizer: 'Dinas Pendidikan Provinsi',
      year: '2026',
      level: 'Provinsi',
    },
    {
      juara: 'Juara Umum Kompetisi Robotik Pelajar',
      organizer: 'BRIN',
      year: '2025',
      level: 'Nasional',
    },
  ],
  footerTagline:
    'Tempat pelajar MAN 1 Bogor belajar merakit sasis, menyolder sirkuit, dan memprogram robot dari nol.',
  footerLocation: 'Lab Robotika, Gedung B Lantai 2 — MAN 1 Bogor',
  footerEmail: 'robotikmotechart@gmail.com',
  footerInstagram: 'https://www.instagram.com/motechart_mansabo/',
  footerYoutube: 'https://www.youtube.com/@Motechart-RobotikMAN1Bogor',
};

export const DIVISIONS_CATALOG: Record<'mechanics' | 'electronics' | 'programming', DivisionCatalogItem> = {
  mechanics: {
    id: 'mechanics',
    index: '01',
    label: 'Mekanik',
    subtitle: 'DESAIN STRUKTUR & RANGKA',
    portfolioCategory: 'mekanik & elektronik',
    tools: ['Fusion 360', '3D Printing PLA/PETG', 'Laser Cut Akrilik', 'Roda Mecanum'],
    focusPoints: [
      'Gambar rangka 3D siap cetak di Fusion 360',
      'Potong dan rakit sasis kokoh yang tahan benturan',
      'Hitung bobot dan rasio gear supaya robot lincah',
      'Cetak komponen cepat pakai 3D printer lab',
    ],
    sampleLabel: 'SCALE 1:1 · CAD-01',
  },
  electronics: {
    id: 'electronics',
    index: '02',
    label: 'Elektronik',
    subtitle: 'SIRKUIT, DAYA & SENSOR',
    portfolioCategory: 'iot',
    tools: ['KiCad / EasyEDA', 'Multimeter & Osiloskop', 'Arduino & ESP32', 'Solder THT/SMD'],
    focusPoints: [
      'Baca skematik dan desain jalur PCB sendiri',
      'Atur baterai Li-Po dan regulator daya tetap stabil',
      'Pasang driver motor dan sensor IR, ultrasonik, IMU',
      'Uji sinyal rangkaian pakai multimeter dan osiloskop',
    ],
    sampleLabel: 'VCC 5.0V · PCB-02',
  },
  programming: {
    id: 'programming',
    index: '03',
    label: 'Pemrograman',
    subtitle: 'KENDALI OTONOM & IOT',
    portfolioCategory: 'pemrograman',
    tools: ['C++ Arduino / ESP32', 'Python', 'PID & Flood-Fill', 'MQTT & Bluetooth'],
    focusPoints: [
      'Tulis kode C++ Arduino dan ESP32 tanpa macet',
      'Kalibrasi PID agar robot mulus di tikungan tajam',
      'Buat robot cari jalan sendiri di labirin (Flood-Fill)',
      'Kirim data sensor real-time lewat Wi-Fi dan MQTT',
    ],
    sampleLabel: 'NAV-03 · FLOOD-FILL',
  },
};

export const LEARNING_TRACK = [
  {
    phase: 'Bulan 1–2',
    title: 'Pegang Alat & Rakit Dasar',
    detail: 'Belum pernah ngoding atau nyolder? Aman. Kamu belajar dasar listrik, tulis kode Arduino pertama, lalu rakit robot pengikut garis.',
  },
  {
    phase: 'Bulan 3–5',
    title: 'Pilih Divisi & Bikin Prototipe',
    detail: 'Kamu masuk ke Mekanik, Elektronik, atau Pemrograman. Bangun proyek tim dari sketsa mentah sampai robotnya jalan di lantai lab.',
  },
  {
    phase: 'Bulan 6+',
    title: 'Uji Arena & Ikut Lomba',
    detail: 'Asah kecepatan robot di lintasan uji, rapikan kode dan kabel, lalu bawa karyamu tanding di ajang MRC, KRI, atau lomba provinsi.',
  },
];
