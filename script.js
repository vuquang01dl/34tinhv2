document.addEventListener("DOMContentLoaded", function () {
    // Tạo đối tượng Audio
    const audioPlayer = new Audio();
    let currentProvince = null;

    const mapImage = document.querySelector('img[usemap="#image-map"]');
    const mapCanvas = document.getElementById('mapCanvas');
    const mapContainer = document.querySelector('.map-container');
    const areas = document.querySelectorAll("#vietnam-map area");
    const canvasContext = mapCanvas ? mapCanvas.getContext('2d') : null;
    let activeArea = null;

    const provinceData = window.PROVINCE_DATA || {};
    const playingProvinceName = document.getElementById('playingProvinceName');
    const playingStatusText = document.getElementById('playingStatusText');
    const selectedProvinceName = document.getElementById('selectedProvinceName');
    const selectedProvinceSubtitle = document.getElementById('selectedProvinceSubtitle');
    const selectedProvinceStatus = document.getElementById('selectedProvinceStatus');
    const detailName = document.getElementById('detailName');
    const detailStatus = document.getElementById('detailStatus');
    const detailMerge = document.getElementById('detailMerge');
    const detailCenter = document.getElementById('detailCenter');
    const provinceList = document.getElementById('provinceList');
    let provinceButtons = [];

    // Mapping chính xác từ dataname sang tên file âm thanh
    // LƯU Ý: Không đổi tên file âm thanh trong thư mục 34tinh.
    // Một số file trong thư mục đang ở dạng #Uxxxx nên code sẽ trỏ đúng theo tên file hiện có.
    const soundFileMap = {
        'tuyenquang': 'Tuy#U00ean Quang.wav',
        'caobang': 'Cao B#U1eb1ng.wav',
        'laichau': 'Lai Ch#U00e2u.wav',
        'laocai': 'L#U00e0o Cai.wav',
        'thainguyen': 'Th#U00e1i Nguy#U00ean (2).wav',
        'dienbien': '#U0110i#U1ec7n Bi#U00ean.wav',
        'langson': 'L#U1ea1ng S#U01a1n.wav',
        'sonla': 'S#U01a1n La.wav',
        'phutho': 'Ph#U00fa TH#U1ecd (2).wav',
        'bacninh': 'B#U1eafc Ninh (2).wav',
        'quangninh': 'Qu#U1ea3ng Ninh.wav',
        'hanoi': 'hanoi.wav',
        'haiphong': 'TP H#U1ea3i Ph#U00f2ng (2).wav',
        'hungyen': 'H#U01b0ng Y#U00ean (2).wav',
        'ninhbinh': 'Ninh B#U00ecnh.wav',
        'thanhhoa': 'Thanh H#U00f3a.wav',
        'nghean': 'Ngh#U1ec7 An.wav',
        'hatinh': 'H#U00e0 T#U0129nh.wav',
        'quangtri': 'Qu#U1ea3ng Tr#U1ecb.wav',
        'hue': 'TP Hu#U1ebf.wav',
        'danang': 'TP #U0110#U00e0 N#U1eb5ng.wav',
        'quangngai': 'Qu#U1ea3ng Ng#U00e3i.wav',
        'gialai': 'Gia Lai.wav',
        'daklak': '#U0110#U1eafk L#U1eafk.wav',
        'khanhhoa': 'Kh#U00e1nh H#U00f2a.wav',
        'lamdong': 'L#U00e2m #U0110#U1ed3ng.wav',
        'dongnai': '#U0110#U1ed3ng Nai.wav',
        'tayninh': 'T#U00e2y Ninh.wav',
        'hochiminh': 'TP H#U1ed3 Ch#U00ed Minh.wav',
        'dongthap': '#U0110#U1ed3ng Th#U00e1p.wav',
        'angiang': 'An Giang.wav',
        'vinhlong': 'V#U0129nh Long.wav',
        'cantho': 'TP C#U1ea7n Th#U01a1.wav',
        'camau': 'C#U00e0 Mau.wav',

        // Hai quần đảo chỉ phát âm thanh, không sáng vùng bản đồ
        // vì hiện tại web chưa có vùng cảm ứng riêng cho hai đảo này.
        'hoangsa': 'qu#U1ea7n #U0111#U1ea3o Ho#U00e0ng Sa.wav',
        'truongsa': 'qu#U1ea7n #U0111#U1ea3o Tr#U01b0#U1eddng Sa.wav'
    };

    // Mapping từ số Arduino gửi lên sang dataname trên web.
    // Đã bỏ Hưng Yên theo phần cứng đang test.
    const arduinoNumberMap = {
        1: 'tuyenquang',
        2: 'caobang',
        3: 'laichau',
        4: 'laocai',
        5: 'thainguyen',
        6: 'dienbien',
        7: 'langson',
        8: 'sonla',
        9: 'phutho',
        10: 'bacninh',
        11: 'quangninh',
        12: 'hanoi',
        13: 'haiphong',
        15: 'ninhbinh',
        16: 'thanhhoa',
        17: 'nghean',
        18: 'hatinh',
        19: 'quangtri',
        20: 'hue',
        21: 'danang',
        22: 'quangngai',
        23: 'gialai',
        24: 'daklak',
        25: 'khanhhoa',
        26: 'lamdong',
        27: 'dongnai',
        28: 'tayninh',
        29: 'hochiminh',
        30: 'dongthap',
        31: 'angiang',
        32: 'vinhlong',
        33: 'cantho',
        34: 'camau',

        // Theo code Arduino test hiện tại:
        // D35 gửi số 35 là Hoàng Sa, D36 gửi số 36 là Trường Sa.
        35: 'hoangsa',
        36: 'truongsa',
        37: 'truongsa'
    };

    // Tạo notification element
    const notification = document.createElement('div');
    notification.id = 'sound-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #16a34a, #22c55e);
        color: white;
        padding: 14px 16px;
        border-radius: 16px;
        display: none;
        z-index: 10000;
        font-family: Arial, sans-serif;
        font-size: 14px;
        box-shadow: 0 16px 35px rgba(15,23,42,0.22);
        max-width: 340px;
        line-height: 1.45;
    `;
    document.body.appendChild(notification);

    // Hàm hiển thị thông báo
    function showNotification(message, isError = false) {
        notification.textContent = message;
        notification.style.background = isError
            ? 'linear-gradient(135deg, #ef4444, #f97316)'
            : 'linear-gradient(135deg, #16a34a, #22c55e)';
        notification.style.display = 'block';
    }

    // Hàm ẩn thông báo
    function hideNotification() {
        notification.style.display = 'none';
    }

    // Cập nhật khối thông tin bên phải
    function updateProvinceInfo(name, isPlaying = false) {
        const info = provinceData[name];
        if (!info) return;

        if (playingProvinceName) playingProvinceName.textContent = info.name;
        if (playingStatusText) {
            playingStatusText.textContent = isPlaying
                ? `Đang phát âm thanh của ${info.name}. Khi phát xong, tỉnh sẽ trở về bình thường.`
                : `Đã chọn ${info.name}.`;
        }

        if (selectedProvinceName) selectedProvinceName.textContent = info.name;
        if (selectedProvinceSubtitle) {
            selectedProvinceSubtitle.textContent = `${info.status} • ${info.merge} • Trung tâm: ${info.center}`;
        }
        if (selectedProvinceStatus) {
            selectedProvinceStatus.textContent = isPlaying ? 'Đang phát âm thanh' : 'Đã chọn tỉnh';
        }

        if (detailName) detailName.textContent = info.name;
        if (detailStatus) detailStatus.textContent = info.status;
        if (detailMerge) detailMerge.textContent = info.merge;
        if (detailCenter) detailCenter.textContent = info.center;

        provinceButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.name === name);
        });
    }

    // Tạo danh sách tỉnh bên phải để click nhanh
    function createProvinceList() {
        if (!provinceList) return;

        const entries = Object.entries(provinceData).sort((a, b) => a[1].stt - b[1].stt);
        provinceList.innerHTML = '';

        entries.forEach(([key, info]) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'province-btn';
            button.dataset.name = key;
            button.innerHTML = `
                <span class="province-number">${info.stt}</span>
                <span>
                    <strong>${info.name}</strong>
                    <span>${info.status === 'Giữ nguyên' ? 'Giữ nguyên' : info.merge}</span>
                </span>
            `;

            button.addEventListener('click', function () {
                playProvince(key, document.querySelector(`#vietnam-map area[dataname="${key}"]`));
            });

            provinceList.appendChild(button);
            provinceButtons.push(button);
        });
    }

    // Khi ảnh bản đồ bị thu nhỏ/phóng to, coords của image-map phải scale theo ảnh
    function resizeImageMap() {
        if (!mapImage || !mapImage.naturalWidth || !mapImage.naturalHeight) return;

        const scaleX = mapImage.clientWidth / mapImage.naturalWidth;
        const scaleY = mapImage.clientHeight / mapImage.naturalHeight;

        areas.forEach(area => {
            const originalCoords = area.dataset.originalCoords || area.getAttribute('coords');
            area.dataset.originalCoords = originalCoords;

            const resizedCoords = originalCoords
                .split(',')
                .map((value, index) => {
                    const numberValue = Number(value);
                    return Math.round(numberValue * (index % 2 === 0 ? scaleX : scaleY));
                })
                .join(',');

            area.setAttribute('coords', resizedCoords);
        });

        syncMapCanvas();
        if (activeArea) highlightProvince(activeArea);
    }

    // Đồng bộ canvas phủ sáng đúng vị trí ảnh bản đồ
    function syncMapCanvas() {
        if (!mapCanvas || !mapImage || !mapContainer || !canvasContext) return;

        const deviceRatio = window.devicePixelRatio || 1;
        const imageLeft = mapImage.offsetLeft;
        const imageTop = mapImage.offsetTop;
        const imageWidth = mapImage.clientWidth;
        const imageHeight = mapImage.clientHeight;

        mapCanvas.style.left = `${imageLeft}px`;
        mapCanvas.style.top = `${imageTop}px`;
        mapCanvas.style.width = `${imageWidth}px`;
        mapCanvas.style.height = `${imageHeight}px`;
        mapCanvas.width = Math.round(imageWidth * deviceRatio);
        mapCanvas.height = Math.round(imageHeight * deviceRatio);

        canvasContext.setTransform(deviceRatio, 0, 0, deviceRatio, 0, 0);
    }

    // Xóa hiệu ứng sáng tỉnh đang chọn
    function clearProvinceHighlight() {
        activeArea = null;
        if (!mapCanvas || !canvasContext) return;
        canvasContext.clearRect(0, 0, mapCanvas.clientWidth, mapCanvas.clientHeight);
    }

    // Vẽ hiệu ứng sáng lên đúng vùng tỉnh được click
    function highlightProvince(area) {
        if (!area || !mapCanvas || !mapImage || !canvasContext) return;

        syncMapCanvas();
        clearProvinceHighlight();
        activeArea = area;

        const originalCoords = (area.dataset.originalCoords || area.getAttribute('coords'))
            .split(',')
            .map(Number);
        const scaleX = mapImage.clientWidth / mapImage.naturalWidth;
        const scaleY = mapImage.clientHeight / mapImage.naturalHeight;

        if (originalCoords.length < 6) return;

        canvasContext.save();
        canvasContext.beginPath();
        canvasContext.moveTo(originalCoords[0] * scaleX, originalCoords[1] * scaleY);

        for (let i = 2; i < originalCoords.length; i += 2) {
            canvasContext.lineTo(originalCoords[i] * scaleX, originalCoords[i + 1] * scaleY);
        }

        canvasContext.closePath();
        canvasContext.shadowColor = 'rgba(255, 213, 79, 0.95)';
        canvasContext.shadowBlur = 18;
        canvasContext.fillStyle = 'rgba(255, 235, 59, 0.55)';
        canvasContext.strokeStyle = 'rgba(255, 152, 0, 0.95)';
        canvasContext.lineWidth = 3;
        canvasContext.fill();
        canvasContext.stroke();
        canvasContext.restore();
    }

    function stopAudio() {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        currentProvince = null;
        clearProvinceHighlight();
        provinceButtons.forEach(btn => btn.classList.remove('active'));
        if (playingStatusText) playingStatusText.textContent = 'Âm thanh đã dừng.';
        if (selectedProvinceStatus) selectedProvinceStatus.textContent = 'Đã dừng';
    }

    function playProvince(name, areaElement) {
        const fileName = soundFileMap[name];

        updateProvinceInfo(name, false);

        if (!fileName) {
            showNotification(`Chưa có file âm thanh cho tỉnh: ${provinceData[name]?.name || name}`, true);
            setTimeout(hideNotification, 3000);
            console.log(`Tỉnh "${name}" chưa có trong mapping hoặc chưa có file âm thanh.`);
            return;
        }

        if (areaElement) {
            highlightProvince(areaElement);
        } else {
            // Trường hợp Hoàng Sa / Trường Sa hoặc nơi không có vùng area trên bản đồ:
            // chỉ phát âm thanh, không sáng vùng bản đồ.
            clearProvinceHighlight();
        }

        // QUAN TRỌNG: Sử dụng đường dẫn TƯƠNG ĐỐI
        // Đảm bảo folder "34tinh" nằm CÙNG THƯ MỤC với file HTML
        const soundPath = `34tinh/${encodeURIComponent(fileName)}`;
        console.log('Đường dẫn âm thanh:', soundPath);

        // Dừng âm thanh hiện tại nếu đang phát cùng tỉnh
        if (currentProvince === name && !audioPlayer.paused) {
            stopAudio();
            showNotification('Đã dừng âm thanh');
            setTimeout(hideNotification, 2000);
            return;
        }

        try {
            // Reset audio player
            audioPlayer.pause();
            audioPlayer.currentTime = 0;

            // Đặt nguồn âm thanh
            audioPlayer.src = soundPath;

            // Thêm preload
            audioPlayer.preload = 'auto';

            // Thử phát âm thanh
            const playPromise = audioPlayer.play();

            if (playPromise !== undefined) {
                playPromise.then(() => {
                    currentProvince = name;
                    updateProvinceInfo(name, true);

                    // Hiển thị thông báo thành công
                    const displayName = provinceData[name]?.name || fileName.replace('.wav', '').replace(' (2)', '');
                    showNotification(`Đang phát: ${displayName}`);

                }).catch(error => {
                    console.error('Lỗi khi phát âm thanh:', error);
                    clearProvinceHighlight();
                    handleAudioError(error, fileName);
                });
            }

        } catch (error) {
            console.error('Lỗi không mong muốn:', error);
            clearProvinceHighlight();
            handleAudioError(error, fileName);
        }
    }

    if (mapImage) {
        if (mapImage.complete) resizeImageMap();
        mapImage.addEventListener('load', resizeImageMap);
        window.addEventListener('resize', resizeImageMap);
    }

    // Thêm style cho các tỉnh khi hover
    const style = document.createElement('style');
    style.textContent = `
        area {
            cursor: pointer;
            outline: none;
        }
        .map-container {
            position: relative;
        }
        #mapCanvas {
            position: absolute;
            display: block !important;
            pointer-events: none;
            z-index: 5;
        }
        .map-container img {
            position: relative;
            z-index: 1;
        }
    `;
    document.head.appendChild(style);

    areas.forEach(area => {
        area.addEventListener("click", async function (e) {
            e.preventDefault();
            const name = this.getAttribute("dataname");
            playProvince(name, this);
        });

        // Thêm tooltip
        const provinceName = provinceData[area.getAttribute('dataname')]?.name || area.getAttribute('dataname');
        area.title = `Click để nghe âm thanh ${provinceName}`;
    });

    audioPlayer.addEventListener('ended', function () {
        hideNotification();
        currentProvince = null;
        clearProvinceHighlight();
        provinceButtons.forEach(btn => btn.classList.remove('active'));
        if (playingStatusText) playingStatusText.textContent = 'Âm thanh đã phát xong, tỉnh đã trở về bình thường.';
        if (selectedProvinceStatus) selectedProvinceStatus.textContent = 'Đã phát xong';
    });

    // Hàm xử lý lỗi âm thanh
    function handleAudioError(error, fileName) {
        let errorMessage = 'Không thể phát âm thanh. ';

        if (error.name === 'NotAllowedError') {
            errorMessage += 'Trình duyệt chặn phát âm thanh tự động. ';
            errorMessage += 'Vui lòng click vào trang web trước.';
        } else if (error.name === 'NotFoundError') {
            errorMessage += `Không tìm thấy file: ${fileName}. `;
            errorMessage += 'Kiểm tra xem file có trong folder 34tinh không.';
        } else {
            errorMessage += 'Vui lòng kiểm tra cấu trúc thư mục. ';
            errorMessage += 'Folder "34tinh" phải cùng thư mục với file HTML.';
        }

        showNotification(errorMessage, true);
        setTimeout(hideNotification, 5000);
    }


    // ============================================================
    // KẾT NỐI ARDUINO MEGA QUA WEB SERIAL
    // ============================================================
    let serialPort = null;
    let serialReader = null;
    let serialBuffer = '';
    let lastArduinoKey = null;
    let lastArduinoTime = 0;

    // ============================================================
    // NÚT BẬT/TẮT RIÊNG CHO CẢM BIẾN HÀ NỘI
    // ============================================================
    // Lý do: Hà Nội đang dùng chân D13 trên Arduino Mega.
    // D13 có LED onboard nên thực tế có thể bị nhiễu/nhảy tín hiệu.
    // Mặc định để TẮT, khi cần dùng Hà Nội thì bấm nút bật lên.
    // Lưu ý: Nút này chỉ chặn tín hiệu Hà Nội gửi từ Arduino,
    // không sửa/chạm vào file âm thanh trong thư mục 34tinh.
    let hanoiArduinoEnabled = false;

    function createHanoiEnableButton() {
        const button = document.createElement('button');
        button.type = 'button';
        button.id = 'toggleHanoiArduinoBtn';
        button.style.cssText = `
            position: fixed;
            left: 20px;
            bottom: 70px;
            z-index: 10001;
            border: 1px solid rgba(148, 163, 184, 0.45);
            border-radius: 999px;
            padding: 5px 9px;
            background: rgba(100, 116, 139, 0.82);
            color: #ffffff;
            font-weight: 600;
            font-size: 11px;
            line-height: 1;
            cursor: pointer;
            opacity: 0.72;
            box-shadow: 0 6px 14px rgba(15, 23, 42, 0.14);
        `;

        button.addEventListener('mouseenter', function () {
            button.style.opacity = '1';
        });

        button.addEventListener('mouseleave', function () {
            button.style.opacity = '0.72';
        });

        function updateButtonText() {
            if (hanoiArduinoEnabled) {
                button.textContent = 'HN: ON';
                button.style.background = 'rgba(22, 163, 74, 0.82)';
            } else {
                button.textContent = 'HN: OFF';
                button.style.background = 'rgba(100, 116, 139, 0.82)';
            }
        }

        button.addEventListener('click', function () {
            hanoiArduinoEnabled = !hanoiArduinoEnabled;
            updateButtonText();

            if (hanoiArduinoEnabled) {
                showNotification('Đã ENABLE cảm biến Hà Nội. Khi Arduino gửi Hà Nội thì web sẽ phát âm thanh.');
            } else {
                showNotification('Đã DISABLE cảm biến Hà Nội. Tín hiệu nhiễu từ D13 sẽ bị bỏ qua.');
            }
            setTimeout(hideNotification, 3500);
        });

        updateButtonText();
        document.body.appendChild(button);
        return button;
    }

    function createArduinoConnectButton() {
        const button = document.createElement('button');
        button.type = 'button';
        button.id = 'connectArduinoBtn';
        button.textContent = 'Kết nối Arduino Mega';
        button.style.cssText = `
            position: fixed;
            left: 20px;
            bottom: 20px;
            z-index: 10001;
            border: none;
            border-radius: 999px;
            padding: 12px 18px;
            background: linear-gradient(135deg, #2563eb, #06b6d4);
            color: #ffffff;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
            box-shadow: 0 14px 30px rgba(15, 23, 42, 0.25);
        `;
        button.addEventListener('click', connectArduinoSerial);
        document.body.appendChild(button);
        return button;
    }

    const hanoiEnableBtn = createHanoiEnableButton();
    const connectArduinoBtn = createArduinoConnectButton();

    async function connectArduinoSerial() {
        if (!('serial' in navigator)) {
            showNotification('Trình duyệt chưa hỗ trợ Web Serial. Hãy dùng Chrome hoặc Edge và mở bằng localhost.', true);
            setTimeout(hideNotification, 6000);
            return;
        }

        try {
            if (serialReader) {
                showNotification('Arduino Mega đã được kết nối.');
                setTimeout(hideNotification, 2500);
                return;
            }

            serialPort = await navigator.serial.requestPort();
            await serialPort.open({ baudRate: 9600 });

            connectArduinoBtn.textContent = 'Arduino đã kết nối';
            connectArduinoBtn.style.background = 'linear-gradient(135deg, #16a34a, #22c55e)';
            showNotification('Đã kết nối Arduino Mega. Chạm cảm biến để phát âm thanh.');
            setTimeout(hideNotification, 3500);

            readArduinoLoop();
        } catch (error) {
            console.error('Lỗi kết nối Arduino:', error);
            showNotification('Không kết nối được Arduino. Kiểm tra cổng COM và quyền truy cập Serial.', true);
            setTimeout(hideNotification, 6000);
        }
    }

    async function readArduinoLoop() {
        const textDecoder = new TextDecoderStream();
        serialPort.readable.pipeTo(textDecoder.writable);
        serialReader = textDecoder.readable.getReader();

        try {
            while (true) {
                const { value, done } = await serialReader.read();
                if (done) break;
                if (value) handleArduinoChunk(value);
            }
        } catch (error) {
            console.error('Lỗi đọc dữ liệu Arduino:', error);
            showNotification('Mất kết nối Arduino.', true);
        } finally {
            serialReader = null;
            connectArduinoBtn.textContent = 'Kết nối Arduino Mega';
            connectArduinoBtn.style.background = 'linear-gradient(135deg, #2563eb, #06b6d4)';
        }
    }

    function handleArduinoChunk(chunk) {
        serialBuffer += chunk;
        const lines = serialBuffer.split(/\r?\n/);
        serialBuffer = lines.pop() || '';

        lines.forEach(line => {
            const cleanLine = line.trim();
            if (cleanLine) handleArduinoLine(cleanLine);
        });
    }

    function handleArduinoLine(line) {
        console.log('Arduino:', line);

        let webKey = null;

        // Dạng khuyến nghị từ code Arduino mới:
        // WEB_ID:hanoi
        const webIdMatch = line.match(/^WEB_ID\s*:\s*([a-z0-9_-]+)$/i);
        if (webIdMatch) {
            webKey = webIdMatch[1].toLowerCase();
        }

        // Dạng tương thích với code test cũ:
        // So tren ban do: 12
        if (!webKey) {
            const numberMatch = line.match(/So\s+tren\s+ban\s+do\s*:\s*(\d+)/i);
            if (numberMatch) {
                webKey = arduinoNumberMap[Number(numberMatch[1])];
            }
        }

        if (!webKey || !soundFileMap[webKey]) return;

        // Riêng Hà Nội: chỉ cho nhận tín hiệu Arduino khi nút Hà Nội đang ENABLE.
        // Khi DISABLE, tín hiệu nhiễu từ chân D13 sẽ bị bỏ qua hoàn toàn,
        // không làm sáng bản đồ và không phát âm thanh.
        if (webKey === 'hanoi' && !hanoiArduinoEnabled) {
            console.log('Bỏ qua tín hiệu Hà Nội từ Arduino vì đang DISABLE.');
            return;
        }

        // Chống phát lặp quá nhanh nếu cảm biến bị rung/nhiễu.
        const now = Date.now();
        if (webKey === lastArduinoKey && now - lastArduinoTime < 700) return;
        lastArduinoKey = webKey;
        lastArduinoTime = now;

        const areaElement = document.querySelector(`#vietnam-map area[dataname="${webKey}"]`);
        playProvince(webKey, areaElement);
    }

    createProvinceList();

    // Hiển thị thông báo chào mừng
    showNotification('Bản đồ đã sẵn sàng. Click vào tỉnh để nghe âm thanh!');
    setTimeout(hideNotification, 5000);

    // Xử lý nút dừng
    const stopButton = document.getElementById('stopBtn');
    if (stopButton) {
        stopButton.addEventListener('click', function() {
            stopAudio();
            showNotification('Đã dừng âm thanh');
            setTimeout(hideNotification, 2000);
        });
    }

    // Xử lý nút test
    const testButton = document.getElementById('testBtn');
    if (testButton) {
        testButton.addEventListener('click', function() {
            // Test với file An Giang.wav
            clearProvinceHighlight();
            const testPath = '34tinh/An Giang.wav';
            audioPlayer.src = testPath;
            audioPlayer.play().then(() => {
                showNotification('Test thành công: Đang phát âm thanh test');
                setTimeout(hideNotification, 3000);
            }).catch(error => {
                showNotification('Test thất bại. Kiểm tra cấu trúc thư mục.', true);
                setTimeout(hideNotification, 3000);
            });
        });
    }
});
