/*
  ============================================================
  PROJECT: TEST CAM BIEN TU + ARDUINO MEGA + BAN DO 34 TINH
  BOARD  : Arduino Mega 2560
  ============================================================

  PHIEN BAN:
  - Bo tinh Hung Yen do mat cam bien.
  - D15 la Ninh Binh.
  - D35 la Hoang Sa.
  - D36 la Truong Sa.

  XU LY NHIEU:
  - Chan D13 la Ha Noi.
  - D13 co LED onboard tren Arduino nen de bi nhay nhieu hon.
  - Code nay them co che loc nhieu rieng cho D13:
      + Tin hieu phai on dinh lien tuc mot khoang thoi gian moi tinh la hop le.
      + D13 co thoi gian chong nhieu lon hon cac chan khac.
*/

const int TOTAL_SENSOR = 35;

// Cam bien dang dung kieu INPUT_PULLUP
// Binh thuong: HIGH
// Kich hoat: LOW
const int ACTIVE_STATE = LOW;

// Thoi gian chong nhieu mac dinh cho cac chan binh thuong
const unsigned long DEBOUNCE_TIME_NORMAL = 200;

// Thoi gian chong nhieu rieng cho chan D13
// Co the tang len 800 hoac 1000 neu D13 van bi nhay
const unsigned long DEBOUNCE_TIME_D13 = 700;

// Thoi gian tin hieu phai giu on dinh moi duoc cong nhan
const unsigned long STABLE_TIME_NORMAL = 50;

// Rieng D13 yeu cau tin hieu on dinh lau hon
const unsigned long STABLE_TIME_D13 = 250;

/*
  Danh sach chan dang su dung

  D2  -> So 01
  D3  -> So 02
  ...
  D13 -> So 12 - TP Ha Noi
  D14 -> So 13 - TP Hai Phong
  Bo so 14 Hung Yen
  D15 -> So 15 - Ninh Binh
  ...
  D34 -> So 34 - Ca Mau
  D35 -> Hoang Sa
  D36 -> Truong Sa
*/
const int SENSOR_PINS[TOTAL_SENSOR] = {
  2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
  12, 13, 14,

  15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
  25, 26, 27, 28, 29, 30, 31, 32, 33, 34,

  35, 36
};

const int MAP_NUMBERS[TOTAL_SENSOR] = {
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  11, 12, 13,

  15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
  25, 26, 27, 28, 29, 30, 31, 32, 33, 34,

  35, 36
};

const char* PROVINCE_NAMES[TOTAL_SENSOR] = {
  "Tuyen Quang",       // 01 - D2
  "Cao Bang",          // 02 - D3
  "Lai Chau",          // 03 - D4
  "Lao Cai",           // 04 - D5
  "Thai Nguyen",       // 05 - D6
  "Dien Bien",         // 06 - D7
  "Lang Son",          // 07 - D8
  "Son La",            // 08 - D9
  "Phu Tho",           // 09 - D10
  "Bac Ninh",          // 10 - D11

  "Quang Ninh",        // 11 - D12
  "TP Ha Noi",         // 12 - D13 - chan de nhieu
  "TP Hai Phong",      // 13 - D14

  "Ninh Binh",         // 15 - D15
  "Thanh Hoa",         // 16 - D16
  "Nghe An",           // 17 - D17
  "Ha Tinh",           // 18 - D18
  "Quang Tri",         // 19 - D19
  "TP Hue",            // 20 - D20

  "TP Da Nang",        // 21 - D21
  "Quang Ngai",        // 22 - D22
  "Gia Lai",           // 23 - D23
  "Dak Lak",           // 24 - D24
  "Khanh Hoa",         // 25 - D25
  "Lam Dong",          // 26 - D26
  "Dong Nai",          // 27 - D27
  "Tay Ninh",          // 28 - D28
  "TP Ho Chi Minh",    // 29 - D29
  "Dong Thap",         // 30 - D30

  "An Giang",          // 31 - D31
  "Vinh Long",         // 32 - D32
  "TP Can Tho",        // 33 - D33
  "Ca Mau",            // 34 - D34

  "Hoang Sa",          // 35 - D35
  "Truong Sa"          // 36 - D36
};

/*
  WEB_IDS la ma gui len web.
  Web se dua vao ma nay de:
  - Tim dung vung tinh tren ban do va lam sang tinh do.
  - Phat dung file am thanh trong thu muc 34tinh.
  - Rieng hoangsa va truongsa: chi phat am thanh, khong lam sang vung ban do.
*/
const char* WEB_IDS[TOTAL_SENSOR] = {
  "tuyenquang",
  "caobang",
  "laichau",
  "laocai",
  "thainguyen",
  "dienbien",
  "langson",
  "sonla",
  "phutho",
  "bacninh",

  "quangninh",
  "hanoi",
  "haiphong",

  "ninhbinh",
  "thanhhoa",
  "nghean",
  "hatinh",
  "quangtri",
  "hue",

  "danang",
  "quangngai",
  "gialai",
  "daklak",
  "khanhhoa",
  "lamdong",
  "dongnai",
  "tayninh",
  "hochiminh",
  "dongthap",

  "angiang",
  "vinhlong",
  "cantho",
  "camau",

  "hoangsa",
  "truongsa"
};

// Trang thai doc tuc thoi gan nhat
int lastRawState[TOTAL_SENSOR];

// Trang thai da duoc loc nhieu
int stableState[TOTAL_SENSOR];

// Thoi diem trang thai doc tuc thoi thay doi
unsigned long lastRawChangeTime[TOTAL_SENSOR];

// Thoi diem kich hoat hop le gan nhat
unsigned long lastTriggerTime[TOTAL_SENSOR];

void setup() {
  Serial.begin(9600);
  delay(1000);

  Serial.println("========================================");
  Serial.println(" TEST CAM BIEN TU - BAN DO 34 TINH");
  Serial.println(" Arduino Mega 2560");
  Serial.println("========================================");
  Serial.println("Phien ban:");
  Serial.println("- Da bo tinh Hung Yen");
  Serial.println("- D13 la TP Ha Noi, da them loc nhieu rieng");
  Serial.println("- D15 la Ninh Binh");
  Serial.println("- D35 la Hoang Sa");
  Serial.println("- D36 la Truong Sa");
  Serial.println("========================================");
  Serial.println();

  for (int i = 0; i < TOTAL_SENSOR; i++) {
    pinMode(SENSOR_PINS[i], INPUT_PULLUP);

    int state = digitalRead(SENSOR_PINS[i]);

    lastRawState[i] = state;
    stableState[i] = state;
    lastRawChangeTime[i] = millis();
    lastTriggerTime[i] = 0;
  }

  Serial.println("Da san sang. Hay cham/kich hoat cam bien...");
  Serial.println();
}

void loop() {
  for (int i = 0; i < TOTAL_SENSOR; i++) {
    int pin = SENSOR_PINS[i];
    int currentRawState = digitalRead(pin);

    /*
      Neu tin hieu doc duoc thay doi,
      cap nhat lai moc thoi gian.
      Luc nay chua xu ly ngay de tranh nhieu.
    */
    if (currentRawState != lastRawState[i]) {
      lastRawState[i] = currentRawState;
      lastRawChangeTime[i] = millis();
    }

    /*
      Chon thoi gian loc nhieu rieng:
      - D13 dung thoi gian dai hon
      - Cac chan khac dung thoi gian ngan hon
    */
    unsigned long stableTime = STABLE_TIME_NORMAL;
    unsigned long debounceTime = DEBOUNCE_TIME_NORMAL;

    if (pin == 13) {
      stableTime = STABLE_TIME_D13;
      debounceTime = DEBOUNCE_TIME_D13;
    }

    /*
      Chi chap nhan trang thai moi neu no da on dinh du lau.
    */
    if ((millis() - lastRawChangeTime[i]) >= stableTime) {
      if (stableState[i] != currentRawState) {
        stableState[i] = currentRawState;

        /*
          Chi in ra khi cam bien vua chuyen sang trang thai kich hoat.
        */
        if (stableState[i] == ACTIVE_STATE) {
          unsigned long now = millis();

          if (now - lastTriggerTime[i] >= debounceTime) {
            lastTriggerTime[i] = now;

            Serial.println("----------------------------------------");

            Serial.print("So tren ban do: ");
            Serial.println(MAP_NUMBERS[i]);

            Serial.print("Chan Arduino: D");
            Serial.println(SENSOR_PINS[i]);

            Serial.print("Ten khu vuc: ");
            Serial.println(PROVINCE_NAMES[i]);

            /*
              Dong du lieu danh rieng cho web.
              Khong xoa dong nay vi trang web se doc WEB_ID de phat am thanh
              va lam sang dung tinh tren giao dien.
            */
            Serial.print("WEB_ID:");
            Serial.println(WEB_IDS[i]);

            if (pin == 13) {
              Serial.println("Ghi chu: Day la chan D13, da loc nhieu rieng.");
            }

            Serial.println("----------------------------------------");
            Serial.println();
          }
        }
      }
    }
  }
}