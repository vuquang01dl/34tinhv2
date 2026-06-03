# Hướng dẫn liên kết Arduino Mega với web bản đồ

## 1. File đã sửa

- `script.js`: thêm chức năng kết nối Arduino Mega bằng Web Serial.
- `arduino/Arduino_Mega_Web_Link_34_Tinh/Arduino_Mega_Web_Link_34_Tinh.ino`: code Arduino đã thêm dòng `WEB_ID:...` để web nhận biết đúng tỉnh.

Các file âm thanh trong thư mục `34tinh` được giữ nguyên tên, không đổi tên, không chỉnh sửa nội dung.

## 2. Cách nạp Arduino

1. Mở Arduino IDE.
2. Mở file:
   `arduino/Arduino_Mega_Web_Link_34_Tinh/Arduino_Mega_Web_Link_34_Tinh.ino`
3. Chọn board: `Arduino Mega or Mega 2560`.
4. Chọn đúng cổng COM.
5. Nạp code.
6. Mở Serial Monitor tốc độ `9600 baud` để test.

Khi chạm cảm biến, Serial Monitor vẫn hiển thị thông tin như trước, đồng thời có thêm dòng dạng:

```text
WEB_ID:hanoi
```

Dòng này là dòng web dùng để phát âm thanh và làm sáng tỉnh.

## 3. Cách chạy web

Nên chạy bằng local server, không nên mở trực tiếp file `index.html`.

Mở CMD/Terminal trong thư mục dự án rồi chạy:

```bash
python -m http.server 8000
```

Sau đó mở Chrome hoặc Edge:

```text
http://localhost:8000
```

## 4. Cách kết nối Arduino trên web

1. Mở web bằng Chrome hoặc Edge.
2. Bấm nút `Kết nối Arduino Mega` ở góc dưới bên trái.
3. Chọn đúng cổng COM của Arduino Mega.
4. Chạm cảm biến.

Kết quả:

- Các tỉnh có vùng trên bản đồ: web sẽ làm sáng tỉnh và phát âm thanh.
- Hoàng Sa và Trường Sa: chỉ phát âm thanh, không làm sáng vùng bản đồ.

## 5. Mapping phần cứng hiện tại

Theo code Arduino test hiện tại:

- D2 đến D14: tỉnh số 1 đến 13.
- Bỏ Hưng Yên.
- D15 đến D34: tỉnh số 15 đến 34.
- D35: Hoàng Sa.
- D36: Trường Sa.

Nếu sau này bạn đổi lại Hoàng Sa sang D36 và Trường Sa sang D37 thì chỉ cần sửa `SENSOR_PINS`, `MAP_NUMBERS` trong file `.ino` và mapping trong `script.js`.
