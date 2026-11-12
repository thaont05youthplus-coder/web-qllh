// textures.js - Procedural High-Definition Canvas Textures for 3D Virtual Classroom
// Tạo texture độ phân giải nét cao hoàn toàn trên canvas, không phụ thuộc ảnh mạng bên ngoài

const TextureGenerator = {
    // 1. Vân sàn gỗ bóng cao cấp (Wood Parquet)
    createWoodFloorTexture: function() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Nền gỗ ấm áp
        ctx.fillStyle = '#b88656';
        ctx.fillRect(0, 0, 1024, 1024);

        // Vẽ các thanh gỗ ghép (Parquet planks)
        const plankHeight = 64;
        const plankWidth = 256;

        for (let y = 0; y < 1024; y += plankHeight) {
            const rowOffset = (Math.floor(y / plankHeight) % 2) * (plankWidth / 2);
            for (let x = -plankWidth; x < 1024 + plankWidth; x += plankWidth) {
                const px = x + rowOffset;
                
                // Tông màu gỗ ngẫu nhiên nhẹ giữa các thanh
                const shade = 0.9 + Math.random() * 0.2;
                const r = Math.min(255, Math.floor(184 * shade));
                const g = Math.min(255, Math.floor(134 * shade));
                const b = Math.min(255, Math.floor(86 * shade));
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(px, y, plankWidth - 2, plankHeight - 2);

                // Đường vân gỗ (grain)
                ctx.strokeStyle = `rgba(100, 60, 30, 0.15)`;
                ctx.lineWidth = 1;
                for (let i = 0; i < 15; i++) {
                    const gy = y + Math.random() * plankHeight;
                    ctx.beginPath();
                    ctx.moveTo(px, gy);
                    ctx.bezierCurveTo(
                        px + plankWidth * 0.3, gy + (Math.random() - 0.5) * 6,
                        px + plankWidth * 0.7, gy + (Math.random() - 0.5) * 6,
                        px + plankWidth, gy
                    );
                    ctx.stroke();
                }

                // Viền rãnh thanh gỗ sắc nét
                ctx.strokeStyle = '#4a2c11';
                ctx.lineWidth = 2;
                ctx.strokeRect(px, y, plankWidth, plankHeight);
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(6, 6);
        texture.anisotropy = 16;
        return texture;
    },

    // 2. Bảng đen lớp học viết phấn chi tiết (Chalkboard with formulas)
    createChalkboardTexture: function() {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Màu xanh rêu bảng đen truyền thống
        ctx.fillStyle = '#1e382b';
        ctx.fillRect(0, 0, 2048, 1024);

        // Vết bụi phấn mờ tự nhiên
        for (let i = 0; i < 50000; i++) {
            const x = Math.random() * 2048;
            const y = Math.random() * 1024;
            const alpha = Math.random() * 0.04;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fillRect(x, y, Math.random() * 4, Math.random() * 4);
        }

        // Kẻ ô ly mờ chuẩn lớp học
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
        ctx.lineWidth = 1;
        for (let x = 0; x < 2048; x += 64) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 1024);
            ctx.stroke();
        }
        for (let y = 0; y < 1024; y += 64) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(2048, y);
            ctx.stroke();
        }

        // Viết chữ phấn trên bảng
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
        ctx.fillText('THỨ SÁU, NGÀY 06 THÁNG 11 NĂM 2026', 120, 90);

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 54px "Segoe UI", Arial, sans-serif';
        ctx.fillText('BÀI HỌC: KHÁM PHÁ KHÔNG GIAN ẢO & ĐỒ HỌA 3D', 420, 170);

        // Cột trái: Toán & Vật Lý
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 38px "Cambria Math", Georgia, serif';
        ctx.fillText('1. Toán học & Vật lý không gian:', 120, 280);

        ctx.font = '34px "Cambria Math", Georgia, serif';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText('• Công thức Einstein:   E = mc²', 160, 350);
        ctx.fillText('• Định lý Pythagoras:    a² + b² = c²', 160, 420);
        ctx.fillText('• Tích phân Newton:     ∫ f(x)dx = F(x) + C', 160, 490);
        ctx.fillText('• Phương trình Euler:    e^(iπ) + 1 = 0', 160, 560);
        ctx.fillText('• Ma trận biến đổi 3D:   P\' = M × P', 160, 630);

        // Vẽ hình minh họa tam giác vuông và trục tọa độ 3D
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(200, 880);
        ctx.lineTo(450, 880);
        ctx.lineTo(200, 720);
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = '#38bdf8';
        ctx.font = '28px sans-serif';
        ctx.fillText('c = √(a²+b²)', 320, 790);

        // Cột phải: Tin học & Đồ họa
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 38px "Segoe UI", Arial, sans-serif';
        ctx.fillText('2. Mô phỏng Thực tế ảo (Web 3D):', 1100, 280);

        ctx.fillStyle = '#a7f3d0';
        ctx.font = '32px "Segoe UI", Arial, sans-serif';
        ctx.fillText('✔ Công nghệ WebGL & Three.js chuẩn hiện đại', 1140, 350);
        ctx.fillText('✔ Cấu hình hiển thị siêu nét: Retina 2.0x DPI', 1140, 420);
        ctx.fillText('✔ Đổ bóng thời gian thực mềm mại (Soft Shadow)', 1140, 490);
        ctx.fillText('✔ Tương tác bài giảng & góc nhìn FPS tự do', 1140, 560);
        ctx.fillText('✔ Âm thanh tương tác Web Audio chân thực', 1140, 630);

        // Vẽ mô hình nguyên tử bên phải dưới
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(1550, 800, 180, 70, Math.PI / 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(1550, 800, 180, 70, -Math.PI / 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(1550, 800, 22, 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24';
        ctx.fill();

        // Ghi chú bài tập về nhà
        ctx.fillStyle = '#fde047';
        ctx.font = 'italic bold 32px "Segoe UI", sans-serif';
        ctx.fillText('BTVN: Khám phá toàn bộ góc lớp học và trải nghiệm chế độ cấu hình nét!', 1100, 940);

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = 16;
        return texture;
    },

    // 3. Màn hình chiếu thông minh tương tác (Smart Projector Screen Slides)
    createSlideTexture: function(slideIndex = 0) {
        const canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');

        // Nền slide hiện đại
        const gradient = ctx.createLinearGradient(0, 0, 1920, 1080);
        if (slideIndex === 0) {
            gradient.addColorStop(0, '#0f172a');
            gradient.addColorStop(1, '#1e1b4b');
        } else if (slideIndex === 1) {
            gradient.addColorStop(0, '#064e3b');
            gradient.addColorStop(1, '#022c22');
        } else if (slideIndex === 2) {
            gradient.addColorStop(0, '#701a75');
            gradient.addColorStop(1, '#3b0764');
        } else {
            gradient.addColorStop(0, '#1c1917');
            gradient.addColorStop(1, '#292524');
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1920, 1080);

        // Header bar
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(0, 0, 1920, 120);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 44px "Segoe UI", sans-serif';
        ctx.fillText('HỆ THỐNG BÀI GIẢNG THÔNG MINH 4.0 - TRƯỜNG HỌC SỐ', 80, 80);

        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 36px monospace';
        ctx.fillText(`SLIDE ${slideIndex + 1}/4`, 1700, 80);

        if (slideIndex === 0) {
            // Slide 1: Hệ Mặt Trời & Không gian
            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 72px "Segoe UI", sans-serif';
            ctx.fillText('CHỦ ĐỀ 1: HỆ MẶT TRỜI & THIÊN VĂN HỌC', 120, 260);

            ctx.fillStyle = '#cbd5e1';
            ctx.font = '36px "Segoe UI", sans-serif';
            ctx.fillText('Mặt Trời là ngôi sao ở trung tâm của Hệ Mặt Trời, chiếm 99.86% khối lượng toàn hệ.', 120, 360);
            ctx.fillText('Gồm 8 hành tinh chính: Thủy tinh, Kim tinh, Trái Đất, Hỏa tinh, Mộc tinh, Thổ tinh, Thiên Vương, Hải Vương.', 120, 430);

            // Vẽ minh họa các hành tinh
            const planets = [
                { name: 'Mặt Trời', r: 90, color: '#f59e0b', x: 220, y: 720 },
                { name: 'Thủy', r: 16, color: '#9ca3af', x: 420, y: 720 },
                { name: 'Kim', r: 24, color: '#fcd34d', x: 540, y: 720 },
                { name: 'Trái Đất', r: 28, color: '#38bdf8', x: 690, y: 720 },
                { name: 'Hỏa', r: 20, color: '#ef4444', x: 840, y: 720 },
                { name: 'Mộc', r: 60, color: '#fb923c', x: 1040, y: 720 },
                { name: 'Thổ', r: 50, color: '#fef08a', x: 1260, y: 720, ring: true },
                { name: 'Thiên Vương', r: 35, color: '#67e8f9', x: 1480, y: 720 },
                { name: 'Hải Vương', r: 34, color: '#3b82f6', x: 1680, y: 720 }
            ];

            planets.forEach(p => {
                if (p.ring) {
                    ctx.strokeStyle = 'rgba(253, 224, 71, 0.7)';
                    ctx.lineWidth = 10;
                    ctx.beginPath();
                    ctx.ellipse(p.x, p.y, p.r * 1.8, 18, Math.PI / 6, 0, Math.PI * 2);
                    ctx.stroke();
                }
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();

                ctx.fillStyle = '#f8fafc';
                ctx.font = 'bold 24px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(p.name, p.x, p.y + p.r + 40);
                ctx.textAlign = 'left';
            });
        } else if (slideIndex === 1) {
            // Slide 2: Cấu tạo tế bào & Sinh học
            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 72px "Segoe UI", sans-serif';
            ctx.fillText('CHỦ ĐỀ 2: CẤU TẠO TẾ BÀO ĐỘNG VẬT', 120, 260);

            ctx.fillStyle = '#a7f3d0';
            ctx.font = '36px "Segoe UI", sans-serif';
            ctx.fillText('Tế bào là đơn vị cấu trúc và chức năng cơ bản của mọi sinh vật sống.', 120, 360);
            ctx.fillText('Thành phần cốt lõi: Màng sinh chất, Tế bào chất, Ty thể, Bộ máy Golgi và Nhân tế bào chứa ADN.', 120, 430);

            // Vẽ tế bào 2D đồ họa
            ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.arc(960, 720, 240, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Nhân
            ctx.fillStyle = '#8b5cf6';
            ctx.beginPath();
            ctx.arc(960, 720, 90, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 28px sans-serif';
            ctx.fillText('Nhân ADN', 900, 725);
            ctx.fillText('Màng tế bào', 1220, 640);
            ctx.fillText('Ty thể (Cung cấp năng lượng)', 600, 840);
        } else if (slideIndex === 2) {
            // Slide 3: Công nghệ Đồ họa 3D & AI
            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 72px "Segoe UI", sans-serif';
            ctx.fillText('CHỦ ĐỀ 3: CÔNG NGHỆ 3D THỜI GIAN THỰC & AI', 120, 260);

            ctx.fillStyle = '#f5d0fe';
            ctx.font = '36px "Segoe UI", sans-serif';
            ctx.fillText('Lớp học ảo 3D ứng dụng WebGL rendering, tính toán ma trận GPU với 60 FPS mượt mà.', 120, 360);
            ctx.fillText('Trí tuệ nhân tạo (AI) hỗ trợ cá nhân hóa lộ trình học tập và tương tác thời gian thực.', 120, 430);

            // Điểm nhấn đồ họa
            ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.fillRect(120, 520, 500, 380);
            ctx.fillRect(710, 520, 500, 380);
            ctx.fillRect(1300, 520, 500, 380);

            ctx.fillStyle = '#ec4899';
            ctx.font = 'bold 36px sans-serif';
            ctx.fillText('RENDER ENGINE', 160, 590);
            ctx.fillText('PBR SHADING', 750, 590);
            ctx.fillText('INTERACTION', 1340, 590);

            ctx.fillStyle = '#f1f5f9';
            ctx.font = '28px sans-serif';
            ctx.fillText('• 60/120 FPS Rendering', 160, 670);
            ctx.fillText('• Canvas Ultra HD', 160, 730);
            ctx.fillText('• High DPI scaling', 160, 790);

            ctx.fillText('• Soft Shadows 2K', 750, 670);
            ctx.fillText('• Specular Highlights', 750, 730);
            ctx.fillText('• Ambient Occlusion', 750, 790);

            ctx.fillText('• FPS Pointer Lock', 1340, 670);
            ctx.fillText('• Physics Collision', 1340, 730);
            ctx.fillText('• Web Audio Chimes', 1340, 790);
        } else {
            // Slide 4: Tổng kết & Lịch học
            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 72px "Segoe UI", sans-serif';
            ctx.fillText('THỜI KHÓA BIỂU & NHIỆM VỤ HỌC TẬP', 120, 260);

            ctx.fillStyle = '#e2e8f0';
            ctx.font = '34px "Segoe UI", sans-serif';
            ctx.fillText('Tiết 1: Toán học giải tích (07:30 - 08:15)', 160, 380);
            ctx.fillText('Tiết 2: Vật lý đại cương (08:25 - 09:10)', 160, 460);
            ctx.fillText('Tiết 3: Tin học lập trình 3D (09:25 - 10:10)', 160, 540);
            ctx.fillText('Tiết 4: Ngoại ngữ giao tiếp (10:20 - 11:05)', 160, 620);

            ctx.fillStyle = '#34d399';
            ctx.font = 'bold 40px sans-serif';
            ctx.fillText('★ BẤM PHÍM [E] HOẶC CLICK VÀO BẢNG ĐỂ ĐỔI SLIDE TIẾP THEO ★', 220, 800);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = 16;
        return texture;
    },

    // 4. Bảng thông báo lớp học (Notice Board: Nội quy 5T, Lịch trực nhật)
    createNoticeBoardTexture: function() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 768;
        const ctx = canvas.getContext('2d');

        // Nền bảng ghim bần (corkboard)
        ctx.fillStyle = '#c89d6c';
        ctx.fillRect(0, 0, 1024, 768);

        // Hạt sần bần
        for (let i = 0; i < 20000; i++) {
            ctx.fillStyle = Math.random() > 0.5 ? 'rgba(90, 50, 20, 0.08)' : 'rgba(255, 230, 180, 0.08)';
            ctx.fillRect(Math.random() * 1024, Math.random() * 768, 3, 3);
        }

        // Tờ giấy 1: NỘI QUY LỚP HỌC (bên trái)
        ctx.save();
        ctx.translate(60, 60);
        ctx.rotate(-0.02);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;
        ctx.fillRect(0, 0, 420, 620);
        ctx.shadowColor = 'transparent';

        // Đinh ghim đỏ
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(210, 20, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1e3a8a';
        ctx.font = 'bold 26px "Segoe UI", sans-serif';
        ctx.fillText('NỘI QUY LỚP HỌC 5T', 60, 70);

        ctx.fillStyle = '#334155';
        ctx.font = '18px "Segoe UI", sans-serif';
        const rules = [
            '1. TỰ GIÁC: Đi học đúng giờ.',
            '2. TÔN TRỌNG: Thầy cô & bạn bè.',
            '3. TẬP TRUNG: Lắng nghe bài giảng.',
            '4. TÍCH CỰC: Phát biểu xây dựng bài.',
            '5. TRÁCH NHIỆM: Giữ vệ sinh chung.'
        ];
        rules.forEach((r, idx) => {
            ctx.fillText(r, 30, 130 + idx * 45);
        });

        ctx.fillStyle = '#059669';
        ctx.font = 'bold 20px "Segoe UI", sans-serif';
        ctx.fillText('Lớp 12A1 - Năm học 2026', 80, 560);
        ctx.restore();

        // Tờ giấy 2: LỊCH THI ĐUA & DANH SÁCH TRỰC NHẬT (bên phải)
        ctx.save();
        ctx.translate(520, 80);
        ctx.rotate(0.03);
        ctx.fillStyle = '#fef9c3';
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;
        ctx.fillRect(0, 0, 440, 580);
        ctx.shadowColor = 'transparent';

        // Đinh ghim vàng
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(220, 20, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#92400e';
        ctx.font = 'bold 24px "Segoe UI", sans-serif';
        ctx.fillText('PHÂN CÔNG TRỰC NHẬT', 70, 70);

        ctx.fillStyle = '#451a03';
        ctx.font = '18px "Segoe UI", sans-serif';
        const duties = [
            'Thứ 2: Tổ 1 (Quét lớp, lau bảng)',
            'Thứ 3: Tổ 2 (Tưới cây, đóng rèm)',
            'Thứ 4: Tổ 3 (Kê bàn ghế, lau cửa)',
            'Thứ 5: Tổ 4 (Tắt quạt đèn sau giờ)',
            'Thứ 6: Cả lớp tổng vệ sinh'
        ];
        duties.forEach((d, idx) => {
            ctx.fillText(d, 30, 130 + idx * 45);
        });

        // Sticker sao khen thưởng
        ctx.fillStyle = '#e11d48';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('★ TUẦN NÀY: XẾP HẠNG NHẤT KHỐI ★', 30, 480);
        ctx.restore();

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = 16;
        return texture;
    },

    // 5. Khẩu hiệu lớp học "TIÊN HỌC LỄ - HẬU HỌC VĂN"
    createBannerTexture: function() {
        const canvas = document.createElement('canvas');
        canvas.width = 1600;
        canvas.height = 320;
        const ctx = canvas.getContext('2d');

        // Nền đỏ thắm truyền thống của trường học Việt Nam
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(0, 0, 1600, 320);

        // Viền chỉ vàng sang trọng
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 10;
        ctx.strokeRect(20, 20, 1560, 280);

        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 3;
        ctx.strokeRect(36, 36, 1528, 248);

        // Chữ vàng rực rỡ
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 100px "Times New Roman", serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;
        ctx.fillText('TIÊN HỌC LỄ  —  HẬU HỌC VĂN', 800, 195);

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = 16;
        return texture;
    },

    // 6. Mặt đồng hồ treo tường (Clock dial)
    createClockTexture: function(hours = 9, minutes = 15, seconds = 30) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(256, 256, 250, 0, Math.PI * 2);
        ctx.fill();

        // Vành ngoài kim loại
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 14;
        ctx.stroke();

        // Các số 1 đến 12
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 42px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 1; i <= 12; i++) {
            const angle = (i * Math.PI) / 6 - Math.PI / 2;
            const x = 256 + Math.cos(angle) * 190;
            const y = 256 + Math.sin(angle) * 190;
            ctx.fillText(i.toString(), x, y);
        }

        // Vạch phút
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 3;
        for (let i = 0; i < 60; i++) {
            const angle = (i * Math.PI) / 30;
            const r1 = i % 5 === 0 ? 210 : 225;
            const r2 = 235;
            ctx.beginPath();
            ctx.moveTo(256 + Math.cos(angle) * r1, 256 + Math.sin(angle) * r1);
            ctx.lineTo(256 + Math.cos(angle) * r2, 256 + Math.sin(angle) * r2);
            ctx.stroke();
        }

        // Tâm đồng hồ
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(256, 256, 12, 0, Math.PI * 2);
        ctx.fill();

        // Kim giờ
        const hAngle = ((hours % 12) + minutes / 60) * (Math.PI / 6) - Math.PI / 2;
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(256, 256);
        ctx.lineTo(256 + Math.cos(hAngle) * 110, 256 + Math.sin(hAngle) * 110);
        ctx.stroke();

        // Kim phút
        const mAngle = (minutes + seconds / 60) * (Math.PI / 30) - Math.PI / 2;
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(256, 256);
        ctx.lineTo(256 + Math.cos(mAngle) * 160, 256 + Math.sin(mAngle) * 160);
        ctx.stroke();

        // Kim giây
        const sAngle = seconds * (Math.PI / 30) - Math.PI / 2;
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(256, 256);
        ctx.lineTo(256 + Math.cos(sAngle) * 180, 256 + Math.sin(sAngle) * 180);
        ctx.stroke();

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = 16;
        return texture;
    },

    // 7. Biển hiệu cửa lớp "LỚP HỌC ẢO 3D - PHÒNG 101"
    createDoorSignTexture: function() {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');

        // Mica xanh đậm biển phòng
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(0, 0, 600, 200);

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 6;
        ctx.strokeRect(10, 10, 580, 180);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('LỚP HỌC THÔNG MINH 3D', 300, 75);

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 64px "Segoe UI", sans-serif';
        ctx.fillText('PHÒNG 101', 300, 150);

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    },

    // 8. Cảnh quan ngoài cửa sổ (Sky & Campus greenery view)
    createWindowViewTexture: function() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Bầu trời xanh mây trắng
        const skyGrad = ctx.createLinearGradient(0, 0, 0, 350);
        skyGrad.addColorStop(0, '#38bdf8');
        skyGrad.addColorStop(1, '#bae6fd');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, 1024, 512);

        // Mặt trời ấm áp
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(800, 120, 60, 0, Math.PI * 2);
        ctx.fill();

        // Mây trắng trôi
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        const drawCloud = (cx, cy, s) => {
            ctx.beginPath();
            ctx.arc(cx, cy, 35 * s, 0, Math.PI * 2);
            ctx.arc(cx + 30 * s, cy - 15 * s, 45 * s, 0, Math.PI * 2);
            ctx.arc(cx + 70 * s, cy, 35 * s, 0, Math.PI * 2);
            ctx.fill();
        };
        drawCloud(200, 150, 1.2);
        drawCloud(500, 110, 0.9);
        drawCloud(700, 180, 0.8);

        // Dãy cây xanh sân trường xa xa
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.moveTo(0, 360);
        for (let x = 0; x <= 1024; x += 40) {
            ctx.lineTo(x, 340 + Math.sin(x * 0.05) * 20);
        }
        ctx.lineTo(1024, 512);
        ctx.lineTo(0, 512);
        ctx.fill();

        // Hàng cây gần xanh mướt
        ctx.fillStyle = '#16a34a';
        for (let x = 50; x < 1000; x += 120) {
            ctx.beginPath();
            ctx.arc(x, 420, 60, 0, Math.PI * 2);
            ctx.fill();
        }

        // Tòa nhà giảng đường đối diện
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(400, 300, 240, 120);
        ctx.fillStyle = '#b91c1c';
        ctx.beginPath();
        ctx.moveTo(380, 300);
        ctx.lineTo(520, 250);
        ctx.lineTo(660, 300);
        ctx.fill();

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = 16;
        return texture;
    },

    // Helper vẽ hình chữ nhật bo góc an toàn trên mọi phiên bản Canvas2D
    drawRoundedRectPath: function (ctx, x, y, width, height, radius) {
        const r = Math.min(radius, width / 2, height / 2);
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + width - r, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + r);
        ctx.lineTo(x + width, y + height - r);
        ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
        ctx.lineTo(x + r, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    },

    // Texture bảng/màn hình bài học động theo từng Tình huống mô phỏng
    createScenarioBoardTexture: function (boardLesson) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Nền bảng xanh tối hiện đại + viền công nghệ
        const grad = ctx.createLinearGradient(0, 0, 1024, 512);
        grad.addColorStop(0, '#0f2922');
        grad.addColorStop(0.5, '#13382e');
        grad.addColorStop(1, '#0c221c');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1024, 512);

        // Khung viền nhẹ
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = 6;
        ctx.strokeRect(18, 18, 988, 476);

        // Thanh tiêu đề trên cùng
        ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
        ctx.fillRect(28, 28, 968, 74);
        ctx.font = 'bold 30px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#34d399';
        ctx.textAlign = 'left';
        ctx.fillText((boardLesson && boardLesson.title) || 'CLASSROOM SIMULATION', 48, 74);

        // Phụ đề mẫu câu / mục tiêu
        ctx.font = 'bold 34px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#fef08a';
        const subtitle = (boardLesson && boardLesson.subtitle) || '';
        ctx.fillText(subtitle.slice(0, 56), 48, 152);
        if (subtitle.length > 56) {
            ctx.fillText(subtitle.slice(56, 112), 48, 194);
        }

        // Nhiệm vụ lớp học
        const taskY = subtitle.length > 56 ? 228 : 196;
        ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
        this.drawRoundedRectPath(ctx, 48, taskY, 928, 62, 12);
        ctx.fill();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = 'bold 26px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#7dd3fc';
        ctx.fillText('TASK: ' + ((boardLesson && boardLesson.task) || ''), 68, taskY + 40);

        // Ghi chú trên bảng
        const notes = (boardLesson && Array.isArray(boardLesson.notes)) ? boardLesson.notes : [];
        ctx.font = '25px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#f8fafc';
        notes.slice(0, 4).forEach((note, idx) => {
            ctx.fillText(String(note), 64, taskY + 106 + idx * 44);
        });

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = 16;
        return texture;
    },

    // Texture bong bóng lời thoại 3D nổi trên đầu học sinh
    createSpeechBubbleTexture: function (speakerName, text, accentColor = '#38bdf8') {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Khung bong bóng
        this.drawRoundedRectPath(ctx, 18, 14, 604, 178, 26);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = accentColor;
        ctx.stroke();

        // Đuôi tam giác chỉ xuống đầu nhân vật
        ctx.beginPath();
        ctx.moveTo(298, 192);
        ctx.lineTo(320, 226);
        ctx.lineTo(342, 192);
        ctx.closePath();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
        ctx.fill();
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 4;
        ctx.stroke();

        // Tên nhân vật
        ctx.font = 'bold 24px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = accentColor;
        ctx.textAlign = 'left';
        ctx.fillText(speakerName || 'Học sinh', 42, 54);

        // Xuống dòng tự động cho lời thoại (tối đa 3 dòng)
        ctx.font = 'bold 25px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#f8fafc';
        const words = String(text || '').split(/\s+/);
        const lines = [];
        let current = '';
        const maxWidth = 556;

        for (let i = 0; i < words.length; i++) {
            const testLine = current ? `${current} ${words[i]}` : words[i];
            if (ctx.measureText(testLine).width > maxWidth && current) {
                lines.push(current);
                current = words[i];
                if (lines.length === 3) break;
            } else {
                current = testLine;
            }
        }
        if (current && lines.length < 3) {
            lines.push(current);
        }
        if (lines.length === 3 && words.join(' ').length > lines.join(' ').length) {
            lines[2] = lines[2].slice(0, Math.max(0, lines[2].length - 3)) + '...';
        }

        lines.forEach((line, idx) => {
            ctx.fillText(line, 42, 96 + idx * 34);
        });

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        return texture;
    }
};

window.TextureGenerator = TextureGenerator;
