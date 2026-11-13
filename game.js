// game.js - 3D Virtual Classroom Game Simulation Engine
// Sử dụng Three.js để render mô hình lớp học 3D tương tác với cấu hình nét cao

(function () {
    'use strict';

    // ================= TRẠNG THÁI HỆ THỐNG & CẤU HÌNH NÉT =================
    const Config = {
        preset: 'ultra', // 'ultra', 'high', 'medium', 'low'
        pixelRatioScale: 2.0, // Tỷ lệ độ phân giải nét
        antialiasing: true,
        shadows: true,
        shadowMapSize: 2048,
        sunlight: true,
        fov: 75,
        headBobbing: true,
        cameraMode: 'fps', // 'fps' hoặc 'overview'
        lightsOn: true
    };

    // Khởi tạo các biến Three.js
    let scene, camera, renderer;
    let roomGroup, interactables = [];
    let ceilingLights = [], deskLampLight, sunLight, ambientLight;
    let fanBlades = [], globeMesh, wallClockHourHand, wallClockMinuteHand, wallClockSecondHand;
    let smartSlideMesh, currentSlideIndex = 0;

    // Biến điều khiển nhân vật & vật lý
    const player = {
        position: new THREE.Vector3(0, 1.7, 5), // Chiều cao mắt người đứng: 1.7m
        velocity: new THREE.Vector3(),
        direction: new THREE.Vector3(),
        rotation: new THREE.Euler(0, 0, 0, 'YXZ'),
        speed: 5.5,
        sprintMultiplier: 1.75,
        isGrounded: true,
        jumpVelocity: 4.8,
        gravity: 14.0,
        bobTimer: 0,
        isSprinting: false,
        height: 1.7
    };

    const keys = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        sprint: false,
        jump: false
    };

    let isPointerLocked = false;
    let hasEnteredClassroom = true;
    let isDraggingCamera = false;
    let lastDragX = 0;
    let lastDragY = 0;
    let dragDistanceMoved = 0;
    let raycaster, centerScreen, pointerVec;
    let hoveredObject = null;
    let boardMesh = null;

    // Biến thống kê hiệu năng
    let frameCount = 0;
    let lastTime = performance.now();
    let currentFps = 60;
    let clock = new THREE.Clock();

    // DOM Elements
    const dom = {
        canvasContainer: document.getElementById('canvas-container'),
        canvas: document.getElementById('webgl-canvas'),
        crosshair: document.getElementById('crosshair'),
        prompt: document.getElementById('interaction-prompt'),
        promptText: document.getElementById('prompt-text'),
        statPreset: document.getElementById('stat-preset'),
        statFps: document.getElementById('stat-fps'),
        statRes: document.getElementById('stat-res'),
        statCamMode: document.getElementById('stat-cam-mode'),
        blocker: document.getElementById('blocker'),
        btnStart: document.getElementById('btn-start-game'),
        settingsModal: document.getElementById('settings-modal'),
        slideModal: document.getElementById('slide-modal'),
        helpModal: document.getElementById('help-modal'),
        minimapCanvas: document.getElementById('minimap-canvas')
    };

    // ================= 1. KHỞI TẠO THREE.JS VỚI CẤU HÌNH NÉT =================
    function initThree() {
        // Tạo Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xbfe3f7);
        scene.fog = new THREE.FogExp2(0xbfe3f7, 0.015);

        // Tạo Camera
        const aspect = window.innerWidth / window.innerHeight;
        camera = new THREE.PerspectiveCamera(Config.fov, aspect, 0.1, 100);
        camera.position.copy(player.position);
        camera.rotation.copy(player.rotation);

        // Tạo WebGLRenderer với cấu hình đồ họa cao nhất
        renderer = new THREE.WebGLRenderer({
            canvas: dom.canvas,
            antialias: Config.antialiasing,
            powerPreference: 'high-performance',
            alpha: false
        });

        renderer.setSize(window.innerWidth, window.innerHeight);
        applyResolutionSettings();

        // Cấu hình bóng đổ thực tế (Realistic Soft Shadows)
        renderer.shadowMap.enabled = Config.shadows;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        if (renderer.outputColorSpace) {
            renderer.outputColorSpace = THREE.SRGBColorSpace;
        }

        // Raycaster cho tâm ngắm tương tác & click trực tiếp không khóa chuột
        raycaster = new THREE.Raycaster();
        centerScreen = new THREE.Vector2(0, 0);
        pointerVec = new THREE.Vector2(0, 0);

        // Xây dựng thế giới phòng học 3D
        buildClassroom();

        // Thiết lập ánh sáng
        setupLights();

        // Bắt đầu các sự kiện
        setupEvents();

        // Cập nhật thống kê ban đầu
        updateStatsDisplay();

        // Vòng lặp render chính
        animate();
    }

    // Áp dụng độ nét và tỷ lệ pixel
    function applyResolutionSettings() {
        const dpr = Math.min(window.devicePixelRatio || 1, Config.pixelRatioScale);
        renderer.setPixelRatio(dpr);
        const w = window.innerWidth;
        const h = window.innerHeight;
        renderer.setSize(w, h);
        if (dom.statRes) {
            dom.statRes.textContent = `${Math.round(w * dpr)}×${Math.round(h * dpr)} @ ${Config.pixelRatioScale.toFixed(1)}x`;
        }
    }

    // ================= 2. XÂY DỰNG MÔ HÌNH PHÒNG HỌC 3D CHI TIẾT =================
    function buildClassroom() {
        roomGroup = new THREE.Group();
        scene.add(roomGroup);

        const roomWidth = 14;   // Chiều rộng phòng học (m)
        const roomLength = 20;  // Chiều dài phòng học (m)
        const roomHeight = 4.5; // Chiều cao trần nhà (m)

        // --- A. SÀN PHÒNG HỌC GỖ BÓNG SẮC NÉT ---
        const floorGeo = new THREE.PlaneGeometry(roomWidth, roomLength);
        const floorTex = TextureGenerator.createWoodFloorTexture();
        const floorMat = new THREE.MeshStandardMaterial({
            map: floorTex,
            roughness: 0.35,
            metalness: 0.08
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        roomGroup.add(floor);

        // --- B. TRẦN NHÀ & CÁC TẤM THẠCH CAO ---
        const ceilingGeo = new THREE.PlaneGeometry(roomWidth, roomLength);
        const ceilingMat = new THREE.MeshStandardMaterial({
            color: 0xf1f5f9,
            roughness: 0.9,
            metalness: 0.0
        });
        const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
        ceiling.position.y = roomHeight;
        ceiling.rotation.x = Math.PI / 2;
        roomGroup.add(ceiling);

        // Các gờ trần trang trí
        const trimMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5 });
        for (let z = -8; z <= 8; z += 4) {
            const beam = new THREE.Mesh(new THREE.BoxGeometry(roomWidth, 0.1, 0.15), trimMat);
            beam.position.set(0, roomHeight - 0.05, z);
            roomGroup.add(beam);
        }

        // --- C. CÁC BỨC TƯỜNG PHÒNG HỌC ---
        const wallMat = new THREE.MeshStandardMaterial({
            color: 0xfdfbf7, // Màu kem ấm áp
            roughness: 0.85,
            metalness: 0.02
        });

        // 1. Tường trước (Bục giảng & Bảng)
        const frontWall = new THREE.Mesh(new THREE.BoxGeometry(roomWidth, roomHeight, 0.3), wallMat);
        frontWall.position.set(0, roomHeight / 2, -roomLength / 2);
        frontWall.receiveShadow = true;
        roomGroup.add(frontWall);

        // 2. Tường sau (Cửa ra vào & Bảng tin)
        const backWall = new THREE.Mesh(new THREE.BoxGeometry(roomWidth, roomHeight, 0.3), wallMat);
        backWall.position.set(0, roomHeight / 2, roomLength / 2);
        backWall.receiveShadow = true;
        roomGroup.add(backWall);

        // 3. Tường phải (Trưng bày & Tủ sách)
        const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, roomHeight, roomLength), wallMat);
        rightWall.position.set(roomWidth / 2, roomHeight / 2, 0);
        rightWall.receiveShadow = true;
        roomGroup.add(rightWall);

        // 4. Tường trái (Có dãy cửa sổ lớn nhìn ra sân trường)
        buildLeftWallWithWindows(roomWidth, roomLength, roomHeight, wallMat);

        // Len chân tường gỗ chạy quanh phòng (Baseboard)
        buildBaseboards(roomWidth, roomLength);

        // --- D. BỤC GIẢNG & KHU VỰC GIÁO VIÊN ---
        buildTeacherArea(roomLength);

        // --- E. BẢNG ĐEN, MÀN HÌNH CHIẾU & KHẨU HIỆU ---
        buildPresentationArea(roomLength, roomHeight);

        // --- F. CÁC DÃY BÀN GHẾ HỌC SINH (16 BỘ) ---
        buildStudentDesks();

        // --- G. KHU VỰC CUỐI LỚP: BẢNG TIN, ĐỒNG HỒ, CỬA, TỦ SÁCH ---
        buildBackArea(roomLength, roomWidth);

        // --- H. QUẠT TRẦN & ĐÈN LED CHIẾU SÁNG ---
        buildCeilingEquipment(roomHeight);

        // --- I. CÂY CẢNH PHONG THỦY TRANG TRÍ ---
        buildPottedPlants();

        // --- J. GIÁO VIÊN VÀ HỌC SINH LỚP HỌC 3D ---
        if (window.CharacterManager) {
            CharacterManager.init(scene, roomGroup, interactables, camera);
        }
    }

    // Xây dựng tường trái có 4 khung cửa sổ lớn
    function buildLeftWallWithWindows(w, l, h, wallMat) {
        const wallX = -w / 2;
        const windowFrameMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
        const glassMat = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.25,
            roughness: 0.1,
            transmission: 0.9,
            thickness: 0.05
        });

        // Tường đặc dưới bệ cửa sổ
        const bottomWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.0, l), wallMat);
        bottomWall.position.set(wallX, 0.5, 0);
        bottomWall.receiveShadow = true;
        roomGroup.add(bottomWall);

        // Tường đặc trên đầu cửa sổ
        const topWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.9, l), wallMat);
        topWall.position.set(wallX, h - 0.45, 0);
        topWall.receiveShadow = true;
        roomGroup.add(topWall);

        // Tranh phong cảnh sân trường nhìn qua cửa sổ (Background Backdrop)
        const sceneryTex = TextureGenerator.createWindowViewTexture();
        const sceneryMat = new THREE.MeshBasicMaterial({ map: sceneryTex });
        const sceneryMesh = new THREE.Mesh(new THREE.PlaneGeometry(l, 4), sceneryMat);
        sceneryMesh.position.set(wallX - 0.4, 2.3, 0);
        sceneryMesh.rotation.y = Math.PI / 2;
        roomGroup.add(sceneryMesh);

        // 4 Cụm Cửa sổ lớn
        const windowZPositions = [-6.5, -2.2, 2.2, 6.5];
        windowZPositions.forEach(z => {
            // Khung kính
            const glass = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.4, 3.2), glassMat);
            glass.position.set(wallX, 2.3, z);
            roomGroup.add(glass);

            // Khung viền gỗ/nhôm đen
            const frame = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.5, 3.3), windowFrameMat);
            frame.position.set(wallX, 2.3, z);
            roomGroup.add(frame);

            // Nan chia ô cửa sổ chữ thập
            const barH = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.08, 3.2), windowFrameMat);
            barH.position.set(wallX, 2.3, z);
            roomGroup.add(barH);

            const barV = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.4, 0.08), windowFrameMat);
            barV.position.set(wallX, 2.3, z);
            roomGroup.add(barV);

            // Bệ cửa sổ rộng có gờ để trang trí
            const sill = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 3.5), windowFrameMat);
            sill.position.set(wallX + 0.1, 1.05, z);
            roomGroup.add(sill);
        });
    }

    // Len chân tường gỗ
    function buildBaseboards(w, l) {
        const bbMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.6 });
        const bbH = 0.15, bbT = 0.05;

        // Dọc 2 bên
        const bbLeft = new THREE.Mesh(new THREE.BoxGeometry(bbT, bbH, l), bbMat);
        bbLeft.position.set(-w / 2 + bbT / 2, bbH / 2, 0);
        roomGroup.add(bbLeft);

        const bbRight = new THREE.Mesh(new THREE.BoxGeometry(bbT, bbH, l), bbMat);
        bbRight.position.set(w / 2 - bbT / 2, bbH / 2, 0);
        roomGroup.add(bbRight);

        // Ngang trước sau
        const bbFront = new THREE.Mesh(new THREE.BoxGeometry(w, bbH, bbT), bbMat);
        bbFront.position.set(0, bbH / 2, -l / 2 + bbT / 2);
        roomGroup.add(bbFront);

        const bbBack = new THREE.Mesh(new THREE.BoxGeometry(w, bbH, bbT), bbMat);
        bbBack.position.set(0, bbH / 2, l / 2 - bbT / 2);
        roomGroup.add(bbBack);
    }

    // Khu vực bục giảng & bàn ghế giáo viên
    function buildTeacherArea(roomLength) {
        const podiumZ = -roomLength / 2 + 2.5;

        // Bục giảng nâng cao 18cm bằng gỗ sồi
        const podiumGeo = new THREE.BoxGeometry(10, 0.18, 3.2);
        const podiumMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.4 });
        const podium = new THREE.Mesh(podiumGeo, podiumMat);
        podium.position.set(0, 0.09, podiumZ);
        podium.receiveShadow = true;
        roomGroup.add(podium);

        // Bàn giáo viên lớn
        const deskGroup = new THREE.Group();
        deskGroup.position.set(2.2, 0.18, podiumZ + 0.4);

        const deskWoodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.3 });
        // Mặt bàn
        const deskTop = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 1.1), deskWoodMat);
        deskTop.position.y = 0.85;
        deskTop.castShadow = true;
        deskTop.receiveShadow = true;
        deskGroup.add(deskTop);

        // Chân bàn & ngăn tủ
        const drawer = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 1.0), deskWoodMat);
        drawer.position.set(0.7, 0.4, 0);
        drawer.castShadow = true;
        deskGroup.add(drawer);

        const legL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.8, 1.0), deskWoodMat);
        legL.position.set(-0.95, 0.4, 0);
        legL.castShadow = true;
        deskGroup.add(legL);

        // Ghế xoay giáo viên
        const chairGroup = new THREE.Group();
        chairGroup.position.set(2.2, 0.18, podiumZ - 0.4);
        const chairMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.55), chairMat);
        seat.position.y = 0.5;
        seat.castShadow = true;
        chairGroup.add(seat);

        const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.6, 0.08), chairMat);
        backrest.position.set(0, 0.8, -0.24);
        backrest.castShadow = true;
        chairGroup.add(backrest);

        const chairPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.45), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 }));
        chairPole.position.y = 0.25;
        chairGroup.add(chairPole);
        roomGroup.add(chairGroup);

        // ĐỒ VẬT TRÊN BÀN GIÁO VIÊN:
        // 1. Laptop mở màn hình
        const laptopGroup = new THREE.Group();
        laptopGroup.position.set(2.0, 1.07, podiumZ + 0.35);
        const laptopBase = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.015, 0.28), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 }));
        laptopGroup.add(laptopBase);

        const laptopScreen = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.26, 0.015), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5 }));
        laptopScreen.position.set(0, 0.13, -0.13);
        laptopScreen.rotation.x = -0.2;
        laptopGroup.add(laptopScreen);

        // Màn hình laptop phát sáng
        const screenGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.22), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
        screenGlow.position.set(0, 0.13, -0.12);
        screenGlow.rotation.x = -0.2;
        laptopGroup.add(screenGlow);
        roomGroup.add(laptopGroup);

        laptopGroup.userData = {
            interactable: true,
            name: 'Laptop giáo viên',
            action: () => {
                soundEngine.playInteract();
                showInteractionMessage('💻 Bạn đã mở Laptop giáo viên - Hệ thống quản lý lớp học trực tuyến sẵn sàng!');
            }
        };
        interactables.push(laptopGroup);

        // 2. Quả địa cầu 3D xoay được (Globe)
        const globeGroup = new THREE.Group();
        globeGroup.position.set(2.8, 1.15, podiumZ + 0.35);

        const globeStand = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.04), new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.6 }));
        globeGroup.add(globeStand);

        const globeAxis = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.015, 8, 24, Math.PI), new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.7 }));
        globeAxis.position.y = 0.18;
        globeAxis.rotation.z = Math.PI / 6;
        globeGroup.add(globeAxis);

        const globeGeo = new THREE.SphereGeometry(0.15, 32, 32);
        const globeMat = new THREE.MeshStandardMaterial({
            color: 0x2563eb,
            roughness: 0.4
        });
        globeMesh = new THREE.Mesh(globeGeo, globeMat);
        globeMesh.position.y = 0.18;
        globeGroup.add(globeMesh);

        globeGroup.userData = {
            interactable: true,
            name: 'Quả địa cầu 3D',
            action: () => {
                soundEngine.playInteract();
                rotateGlobeFast();
                showInteractionMessage('🌍 Quả địa cầu đang xoay: "Trái Đất quay một vòng quanh trục mất 24 giờ!"');
            }
        };
        interactables.push(globeGroup);
        roomGroup.add(globeGroup);

        // 3. Đèn bàn giáo viên (Desk Lamp)
        const lampGroup = new THREE.Group();
        lampGroup.position.set(1.4, 1.07, podiumZ + 0.35);

        const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.02), new THREE.MeshStandardMaterial({ color: 0x059669 }));
        lampGroup.add(lampBase);

        const lampArm = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.35), new THREE.MeshStandardMaterial({ color: 0x10b981 }));
        lampArm.position.set(0, 0.17, 0);
        lampArm.rotation.z = -0.3;
        lampGroup.add(lampArm);

        const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.12, 16), new THREE.MeshStandardMaterial({ color: 0x059669 }));
        lampShade.position.set(0.1, 0.32, 0);
        lampShade.rotation.z = 0.5;
        lampGroup.add(lampShade);

        // Ánh sáng phát ra từ đèn bàn
        deskLampLight = new THREE.PointLight(0xfef08a, 1.2, 3.5);
        deskLampLight.position.set(0.1, 0.3, 0);
        lampGroup.add(deskLampLight);

        lampGroup.userData = {
            interactable: true,
            name: 'Đèn bàn giáo viên',
            action: () => {
                soundEngine.playSwitch();
                deskLampLight.visible = !deskLampLight.visible;
                showInteractionMessage(deskLampLight.visible ? '💡 Đã bật đèn bàn giáo viên.' : '🌑 Đã tắt đèn bàn giáo viên.');
            }
        };
        interactables.push(lampGroup);
        roomGroup.add(lampGroup);

        // 4. Chồng sách giáo trình nhiều màu
        const bookColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b];
        bookColors.forEach((col, i) => {
            const book = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.035, 0.32), new THREE.MeshStandardMaterial({ color: col, roughness: 0.6 }));
            book.position.set(1.5, 1.07 + i * 0.038, podiumZ + 0.6);
            book.rotation.y = (Math.random() - 0.5) * 0.2;
            deskGroup.add(book);
        });

        roomGroup.add(deskGroup);
    }

    // Khu vực bảng đen viết phấn & màn chiếu slide
    function buildPresentationArea(roomLength, roomHeight) {
        const boardZ = -roomLength / 2 + 0.16;

        // 1. Khẩu hiệu trường học trang trọng phía trên bảng
        const bannerTex = TextureGenerator.createBannerTexture();
        const bannerGeo = new THREE.PlaneGeometry(8.0, 1.2);
        const bannerMat = new THREE.MeshStandardMaterial({ map: bannerTex, roughness: 0.5 });
        const banner = new THREE.Mesh(bannerGeo, bannerMat);
        banner.position.set(0, roomHeight - 0.8, boardZ);
        roomGroup.add(banner);

        // 2. Bảng đen viết phấn truyền thống (2 cánh bên)
        const chalkTex = TextureGenerator.createChalkboardTexture();
        const boardGeo = new THREE.PlaneGeometry(10.5, 2.2);
        const boardMat = new THREE.MeshStandardMaterial({ map: chalkTex, roughness: 0.7 });
        const board = new THREE.Mesh(boardGeo, boardMat);
        board.position.set(0, 2.2, boardZ);
        board.receiveShadow = true;
        roomGroup.add(board);

        // Khung viền gỗ bao quanh bảng đen
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.5 });
        const frameTop = new THREE.Mesh(new THREE.BoxGeometry(10.7, 0.08, 0.08), frameMat);
        frameTop.position.set(0, 3.34, boardZ + 0.04);
        roomGroup.add(frameTop);

        const frameBottom = new THREE.Mesh(new THREE.BoxGeometry(10.7, 0.12, 0.14), frameMat); // Máng phấn
        frameBottom.position.set(0, 1.06, boardZ + 0.06);
        roomGroup.add(frameBottom);

        // Viên phấn & Khăn lau trên máng phấn
        const chalkWhite = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.1), new THREE.MeshStandardMaterial({ color: 0xffffff }));
        chalkWhite.rotation.z = Math.PI / 2;
        chalkWhite.position.set(-1.2, 1.14, boardZ + 0.08);
        roomGroup.add(chalkWhite);

        const eraser = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.08), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
        eraser.position.set(-0.8, 1.14, boardZ + 0.08);
        roomGroup.add(eraser);

        // 3. Màn hình chiếu thông minh tương tác (Smart Slide Screen ở trung tâm)
        const slideTex = TextureGenerator.createSlideTexture(currentSlideIndex);
        const slideGeo = new THREE.PlaneGeometry(4.8, 2.7);
        const slideMat = new THREE.MeshBasicMaterial({ map: slideTex });
        smartSlideMesh = new THREE.Mesh(slideGeo, slideMat);
        smartSlideMesh.position.set(-2.4, 2.2, boardZ + 0.02);
        smartSlideMesh.userData = {
            interactable: true,
            name: 'Màn hình Bài Giảng Thông Minh',
            action: () => {
                soundEngine.playSlideChange();
                nextSlide();
            }
        };
        interactables.push(smartSlideMesh);
        roomGroup.add(smartSlideMesh);

        boardMesh = board;

        // Cho phép bấm vào toàn bộ bảng đen để xem bài giảng
        board.userData = {
            interactable: true,
            name: 'Bảng Đen Lớp Học',
            action: () => {
                soundEngine.playSlideChange();
                openSlideModal();
            }
        };
        interactables.push(board);
    }

    // Xây dựng 16 bộ bàn ghế học sinh xếp ngay ngắn (4 hàng x 4 dãy)
    function buildStudentDesks() {
        const rows = 4;
        const cols = 4;
        const xSpacing = 2.6; // Khoảng cách giữa các dãy
        const zSpacing = 2.8; // Khoảng cách giữa các hàng
        const startX = -((cols - 1) * xSpacing) / 2;
        const startZ = -1.2;

        const deskWoodMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 });
        const metalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
        const chairWoodMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.5 });

        // Tạo sẵn geometry để tối ưu hiệu năng
        const topGeo = new THREE.BoxGeometry(1.6, 0.05, 0.65);
        const legGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.72);
        const seatGeo = new THREE.BoxGeometry(0.48, 0.04, 0.45);
        const backGeo = new THREE.BoxGeometry(0.46, 0.32, 0.04);

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const deskGroup = new THREE.Group();
                const dx = startX + c * xSpacing;
                const dz = startZ + r * zSpacing;
                deskGroup.position.set(dx, 0, dz);

                // Mặt bàn học sinh
                const top = new THREE.Mesh(topGeo, deskWoodMat);
                top.position.y = 0.74;
                top.castShadow = true;
                top.receiveShadow = true;
                deskGroup.add(top);

                // Khung kim loại 4 chân bàn
                const legPositions = [
                    [-0.72, 0.36, -0.26],
                    [0.72, 0.36, -0.26],
                    [-0.72, 0.36, 0.26],
                    [0.72, 0.36, 0.26]
                ];
                legPositions.forEach(pos => {
                    const leg = new THREE.Mesh(legGeo, metalMat);
                    leg.position.set(...pos);
                    leg.castShadow = true;
                    deskGroup.add(leg);
                });

                // Ngăn bàn để sách vở
                const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.03, 0.55), metalMat);
                shelf.position.y = 0.6;
                deskGroup.add(shelf);

                // 2 Chiếc ghế cho 2 học sinh ngồi mỗi bàn
                [-0.45, 0.45].forEach(cx => {
                    const chair = new THREE.Group();
                    chair.position.set(cx, 0, 0.55);

                    // Mặt ghế
                    const seat = new THREE.Mesh(seatGeo, chairWoodMat);
                    seat.position.y = 0.45;
                    seat.castShadow = true;
                    chair.add(seat);

                    // Tựa lưng
                    const back = new THREE.Mesh(backGeo, chairWoodMat);
                    back.position.set(0, 0.72, 0.2);
                    back.castShadow = true;
                    chair.add(back);

                    // 4 Chân ghế
                    const cLegGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.45);
                    [[-0.2, 0.22, -0.18], [0.2, 0.22, -0.18], [-0.2, 0.22, 0.18], [0.2, 0.22, 0.18]].forEach(lp => {
                        const cl = new THREE.Mesh(cLegGeo, metalMat);
                        cl.position.set(...lp);
                        cl.castShadow = true;
                        chair.add(cl);
                    });

                    // Cọc nối tựa lưng
                    const pole1 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.3), metalMat);
                    pole1.position.set(-0.18, 0.58, 0.2);
                    chair.add(pole1);
                    const pole2 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.3), metalMat);
                    pole2.position.set(0.18, 0.58, 0.2);
                    chair.add(pole2);

                    deskGroup.add(chair);
                });

                // Các vật dụng ngẫu nhiên trên bàn học sinh (Sách vở, bút, bình nước)
                if ((r + c) % 2 === 0) {
                    const notebook = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.02, 0.3), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
                    notebook.position.set(-0.35, 0.78, 0.05);
                    notebook.rotation.y = 0.1;
                    deskGroup.add(notebook);

                    const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.18), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
                    pen.rotation.z = Math.PI / 2;
                    pen.position.set(-0.15, 0.78, 0.05);
                    deskGroup.add(pen);
                } else if ((r + c) % 3 === 0) {
                    const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.24), new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.2 }));
                    bottle.position.set(0.6, 0.89, -0.15);
                    deskGroup.add(bottle);
                }

                roomGroup.add(deskGroup);
            }
        }
    }

    // Khu vực cuối lớp: Bảng tin, Đồng hồ chạy giờ thực, Cửa ra vào, Tủ sách
    function buildBackArea(roomLength, roomWidth) {
        const backZ = roomLength / 2 - 0.16;

        // 1. Bảng tin thông báo lớp học (Notice Board ghim bần)
        const noticeTex = TextureGenerator.createNoticeBoardTexture();
        const noticeGeo = new THREE.PlaneGeometry(3.6, 2.4);
        const noticeMat = new THREE.MeshStandardMaterial({ map: noticeTex, roughness: 0.8 });
        const noticeBoard = new THREE.Mesh(noticeGeo, noticeMat);
        noticeBoard.position.set(-2.6, 2.4, backZ);
        noticeBoard.rotation.y = Math.PI;
        noticeBoard.receiveShadow = true;
        noticeBoard.userData = {
            interactable: true,
            name: 'Bảng Tin Lớp Học',
            action: () => {
                soundEngine.playInteract();
                showInteractionMessage('📋 Bảng thông báo: "Lớp 12A1 đạt giải Nhất phong trào học tập & Tuần tới thi giữa kỳ!"');
            }
        };
        interactables.push(noticeBoard);
        roomGroup.add(noticeBoard);

        // Khung gỗ bảng tin
        const noticeFrame = new THREE.Mesh(new THREE.BoxGeometry(3.8, 2.6, 0.08), new THREE.MeshStandardMaterial({ color: 0x78350f }));
        noticeFrame.position.set(-2.6, 2.4, backZ - 0.02);
        roomGroup.add(noticeFrame);

        // 2. Đồng hồ treo tường kim trôi theo giờ thực máy tính
        const clockGroup = new THREE.Group();
        clockGroup.position.set(0, 3.4, backZ);
        clockGroup.rotation.y = Math.PI;

        const clockDialGeo = new THREE.CircleGeometry(0.45, 32);
        const now = new Date();
        const clockTex = TextureGenerator.createClockTexture(now.getHours(), now.getMinutes(), now.getSeconds());
        const clockMat = new THREE.MeshBasicMaterial({ map: clockTex });
        const clockDial = new THREE.Mesh(clockDialGeo, clockMat);
        clockGroup.add(clockDial);

        // Viền kim loại đồng hồ
        const clockRim = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.03, 16, 48), new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 }));
        clockRim.position.z = 0.01;
        clockGroup.add(clockRim);

        clockGroup.userData = {
            interactable: true,
            name: 'Đồng Hồ Treo Tường',
            action: () => {
                soundEngine.playBell();
                const d = new Date();
                const timeStr = d.toLocaleTimeString('vi-VN');
                showInteractionMessage(`⏰ Đồng hồ lớp học đang điểm: ${timeStr} - Đã rung chuông báo giờ!`);
            }
        };
        interactables.push(clockGroup);
        roomGroup.add(clockGroup);

        // 3. Cửa ra vào lớp học có ô kính & biển hiệu "PHÒNG 101"
        const doorGroup = new THREE.Group();
        doorGroup.position.set(4.0, 1.4, backZ);
        doorGroup.rotation.y = Math.PI;

        // Cánh cửa gỗ sồi
        const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.8, 0.1), new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.5 }));
        doorGroup.add(doorLeaf);

        // Ô kính trên cửa nhìn ra hành lang
        const doorGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), new THREE.MeshPhysicalMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.4, transmission: 0.8 }));
        doorGlass.position.set(0, 0.5, 0.06);
        doorGroup.add(doorGlass);

        // Biển hiệu phòng học "PHÒNG 101"
        const signTex = TextureGenerator.createDoorSignTexture();
        const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.28), new THREE.MeshBasicMaterial({ map: signTex }));
        signMesh.position.set(0, 1.1, 0.06);
        doorGroup.add(signMesh);

        // Tay nắm cửa kim loại sáng bóng
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.2), new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9 }));
        handle.rotation.z = Math.PI / 2;
        handle.position.set(-0.6, 0, 0.08);
        doorGroup.add(handle);

        doorGroup.userData = {
            interactable: true,
            name: 'Cửa Lớp Học Phòng 101',
            action: () => {
                soundEngine.playInteract();
                showInteractionMessage('🚪 Cửa phòng học 101 nối ra hành lang trường học rợp bóng cây.');
            }
        };
        interactables.push(doorGroup);
        roomGroup.add(doorGroup);

        // 4. Tủ sách thư viện nhỏ góc lớp
        buildBookshelf(roomWidth / 2 - 0.7, backZ - 1.2);
    }

    // Tủ sách gỗ góc phòng học
    function buildBookshelf(x, z) {
        const shelfGroup = new THREE.Group();
        shelfGroup.position.set(x, 1.4, z);

        const woodMat = new THREE.MeshStandardMaterial({ color: 0x582a0b, roughness: 0.6 });
        // Khung tủ đứng
        const frame = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.8, 0.5), woodMat);
        shelfGroup.add(frame);

        // Các ngăn tầng đựng sách
        const colors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6, 0xec4899];
        for (let tier = -1; tier <= 1; tier++) {
            const yOffset = tier * 0.7;
            for (let b = 0; b < 14; b++) {
                const bCol = colors[Math.floor(Math.random() * colors.length)];
                const book = new THREE.Mesh(
                    new THREE.BoxGeometry(0.05, 0.35 + Math.random() * 0.1, 0.32),
                    new THREE.MeshStandardMaterial({ color: bCol, roughness: 0.5 })
                );
                book.position.set(-0.35 + b * 0.055, yOffset, 0.05);
                shelfGroup.add(book);
            }
        }

        shelfGroup.userData = {
            interactable: true,
            name: 'Tủ Sách Thư Viện Lớp',
            action: () => {
                soundEngine.playSlideChange();
                showInteractionMessage('📖 Tủ sách lớp học: Có hơn 50 đầu sách Khoa học, Văn học và Toán học bổ ích!');
            }
        };
        interactables.push(shelfGroup);
        roomGroup.add(shelfGroup);
    }

    // Thiết bị trần nhà: Quạt trần quay & Đèn tuýp LED
    function buildCeilingEquipment(roomHeight) {
        // 1. Quạt trần quay 3 cánh (2 chiếc ở giữa lớp)
        [-4, 4].forEach(z => {
            const fanGroup = new THREE.Group();
            fanGroup.position.set(0, roomHeight - 0.6, z);

            // Trục treo quạt
            const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6), new THREE.MeshStandardMaterial({ color: 0x334155 }));
            rod.position.y = 0.3;
            fanGroup.add(rod);

            // Bầu quạt
            const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 0.12), new THREE.MeshStandardMaterial({ color: 0x0284c7 }));
            fanGroup.add(hub);

            // Cánh quạt
            const bladeGeo = new THREE.BoxGeometry(1.2, 0.02, 0.18);
            const bladeMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3 });

            const bladesRotator = new THREE.Group();
            for (let i = 0; i < 3; i++) {
                const blade = new THREE.Mesh(bladeGeo, bladeMat);
                blade.rotation.y = (i * Math.PI * 2) / 3;
                blade.position.x = Math.cos((i * Math.PI * 2) / 3) * 0.6;
                blade.position.z = Math.sin((i * Math.PI * 2) / 3) * 0.6;
                bladesRotator.add(blade);
            }
            fanGroup.add(bladesRotator);
            fanBlades.push(bladesRotator);

            roomGroup.add(fanGroup);
        });

        // 2. Hệ thống đèn tuýp LED chiếu sáng âm trần (8 bộ đèn đôi)
        const lampX = [-3.5, 3.5];
        const lampZ = [-6, -2, 2, 6];

        lampX.forEach(x => {
            lampZ.forEach(z => {
                const lightBox = new THREE.Mesh(
                    new THREE.BoxGeometry(0.6, 0.06, 1.8),
                    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, emissive: 0xfef08a, emissiveIntensity: 0.8 })
                );
                lightBox.position.set(x, roomHeight - 0.03, z);
                roomGroup.add(lightBox);

                // Point Light phát sáng
                const pointLight = new THREE.PointLight(0xfef9c3, 0.8, 9, 1.8);
                pointLight.position.set(x, roomHeight - 0.3, z);
                pointLight.castShadow = Config.shadows;
                pointLight.shadow.mapSize.width = 1024;
                pointLight.shadow.mapSize.height = 1024;
                roomGroup.add(pointLight);
                ceilingLights.push(pointLight);
            });
        });
    }

    // Chậu cây cảnh phong thủy trang trí góc lớp
    function buildPottedPlants() {
        const plantPositions = [
            [-5.5, 0, -8.5],
            [5.5, 0, -8.5],
            [-5.5, 0, 8.5]
        ];

        plantPositions.forEach(pos => {
            const plantGroup = new THREE.Group();
            plantGroup.position.set(...pos);

            // Chậu sứ trắng hiện đại
            const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.2, 0.55, 24), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }));
            pot.position.y = 0.28;
            pot.castShadow = true;
            plantGroup.add(pot);

            // Đất trồng
            const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.05), new THREE.MeshStandardMaterial({ color: 0x3e2723 }));
            soil.position.y = 0.52;
            plantGroup.add(soil);

            // Tán lá xanh tươi
            const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4 });
            for (let i = 0; i < 7; i++) {
                const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), leafMat);
                const angle = (i * Math.PI * 2) / 7;
                leaf.position.set(Math.cos(angle) * 0.22, 0.8 + (i % 2) * 0.15, Math.sin(angle) * 0.22);
                leaf.scale.set(1.4, 0.4, 1.0);
                leaf.rotation.y = angle;
                leaf.rotation.z = 0.4;
                leaf.castShadow = true;
                plantGroup.add(leaf);
            }

            plantGroup.userData = {
                interactable: true,
                name: 'Cây Cảnh Góc Lớp',
                action: () => {
                    soundEngine.playInteract();
                    showInteractionMessage('🌿 Cây bàng Singapore xanh mát thanh lọc không khí trong lành cho lớp học.');
                }
            };
            interactables.push(plantGroup);
            roomGroup.add(plantGroup);
        });
    }

    // ================= 3. THIẾT LẬP HỆ THỐNG ÁNH SÁNG & BÓNG ĐỔ =================
    function setupLights() {
        // Ánh sáng môi trường (Ambient Light)
        ambientLight = new THREE.AmbientLight(0xf8fafc, 0.45);
        scene.add(ambientLight);

        // Ánh nắng mặt trời tự nhiên chiếu qua dãy cửa sổ bên trái
        sunLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
        sunLight.position.set(-15, 9, 2);
        sunLight.target.position.set(0, 0, 0);

        if (Config.shadows) {
            sunLight.castShadow = true;
            sunLight.shadow.mapSize.width = Config.shadowMapSize;
            sunLight.shadow.mapSize.height = Config.shadowMapSize;
            sunLight.shadow.camera.near = 0.5;
            sunLight.shadow.camera.far = 40;
            sunLight.shadow.camera.left = -12;
            sunLight.shadow.camera.right = 12;
            sunLight.shadow.camera.top = 10;
            sunLight.shadow.camera.bottom = -10;
            sunLight.shadow.bias = -0.0005;
        }

        scene.add(sunLight);
        scene.add(sunLight.target);
    }

    // ================= 4. ĐIỀU KHIỂN & VẬT LÝ NHÂN VẬT =================
    function setupEvents() {
        // Bắt đầu vào lớp (mặc định Tự do con trỏ để dùng được ngay Micro STT, Kéo xoay chuột & chọn 5 Tình huống)
        dom.btnStart.addEventListener('click', () => {
            soundEngine.init();
            soundEngine.playBell();
            hasEnteredClassroom = true;
            dom.blocker.classList.add('hidden');
            showInteractionMessage('🎓 Chào mừng đến Lớp học 3D! Kéo chuột trên nền lớp để xoay góc nhìn, hoặc bấm [C]/[P] để mô phỏng.');
        });

        // Trạng thái Khóa chuột FPS (tùy chọn khi double-click hoặc bấm nút Khóa FPS)
        document.addEventListener('pointerlockchange', () => {
            isPointerLocked = (document.pointerLockElement === document.body || document.pointerLockElement === dom.canvas);
            if (isPointerLocked) {
                hasEnteredClassroom = true;
                dom.blocker.classList.add('hidden');
            }
            const lockBtn = document.getElementById('btn-pointer-lock');
            if (lockBtn) lockBtn.classList.toggle('active', isPointerLocked);
        });

        // Kéo chuột trực tiếp trên Canvas để xoay góc nhìn khi không khóa FPS
        dom.canvas.addEventListener('mousedown', (e) => {
            if (!hasEnteredClassroom || isPointerLocked) return;
            if (e.button === 0) {
                isDraggingCamera = true;
                lastDragX = e.clientX;
                lastDragY = e.clientY;
                dragDistanceMoved = 0;
            }
        });

        window.addEventListener('mouseup', () => {
            isDraggingCamera = false;
        });

        // Xoay chuột góc nhìn FPS hoặc kéo chuột tự do
        document.addEventListener('mousemove', (e) => {
            let movementX = 0;
            let movementY = 0;

            if (isPointerLocked) {
                movementX = e.movementX || 0;
                movementY = e.movementY || 0;
            } else if (isDraggingCamera) {
                movementX = e.clientX - lastDragX;
                movementY = e.clientY - lastDragY;
                lastDragX = e.clientX;
                lastDragY = e.clientY;
                dragDistanceMoved += Math.abs(movementX) + Math.abs(movementY);
            } else {
                return;
            }

            const sensitivity = isPointerLocked ? 0.0022 : 0.0032;
            player.rotation.y -= movementX * sensitivity;
            player.rotation.x -= movementY * sensitivity;

            // Giới hạn góc ngước lên / nhìn xuống (Clamping)
            const maxPitch = Math.PI / 2 - 0.05;
            player.rotation.x = Math.max(-maxPitch, Math.min(maxPitch, player.rotation.x));
        });

        // Double-click lên vùng 3D để bật Khóa chuột FPS nhanh
        dom.canvas.addEventListener('dblclick', () => {
            if (hasEnteredClassroom && !isPointerLocked) {
                requestPointerLock();
            }
        });

        // Bàn phím WASD & phím tắt chức năng
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        // Click chuột để tương tác đồ vật & học sinh 3D (cả khi Khóa FPS lẫn Free-Mouse)
        dom.canvas.addEventListener('click', (e) => {
            if (!hasEnteredClassroom) return;

            if (isPointerLocked) {
                if (hoveredObject && hoveredObject.userData && hoveredObject.userData.action) {
                    hoveredObject.userData.action();
                }
                return;
            }

            // Nếu vừa kéo xoay camera thì không tính là click tương tác
            if (dragDistanceMoved > 6) return;

            pointerVec.x = (e.clientX / window.innerWidth) * 2 - 1;
            pointerVec.y = -(e.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(pointerVec, camera);
            const hits = raycaster.intersectObjects(interactables, true);
            if (hits.length > 0 && hits[0].distance <= 14.0) {
                let target = hits[0].object;
                while (target && (!target.userData || !target.userData.interactable) && target.parent) {
                    target = target.parent;
                }
                if (target && target.userData && target.userData.action) {
                    target.userData.action();
                }
            }
        });

        // Resize màn hình
        window.addEventListener('resize', onWindowResize);

        // Nút HUD dưới màn hình
        setupToolbarButtons();

        // Cài đặt đồ họa Modal
        setupSettingsModalEvents();

        // Slide modal
        setupSlideModalEvents();

        // Mobile touch buttons
        setupMobileControls();
    }

    function requestPointerLock() {
        document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock;
        if (document.body.requestPointerLock) {
            document.body.requestPointerLock();
        }
    }

    function onKeyDown(e) {
        // Không kích hoạt phím tắt game khi người dùng đang gõ vào ô văn bản STT / tự đánh giá
        const tag = e.target && e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target && e.target.isContentEditable)) {
            return;
        }

        // Nếu buổi luyện đang tạm dừng, chặn di chuyển và phím hành động (chỉ cho phép phím P hoặc Space tiếp tục)
        const isPausedSim = (window.ClassroomGame && window.ClassroomGame.isPaused) || (window.ScenarioSystem && window.ScenarioSystem.isPaused);
        if (isPausedSim) {
            if (e.code === 'KeyP') {
                if (window.ScenarioSystem && window.ScenarioSystem.togglePracticePause) {
                    e.preventDefault();
                    window.ScenarioSystem.togglePracticePause();
                }
            }
            return;
        }

        switch (e.code) {
            case 'KeyW':
            case 'ArrowUp':
                keys.forward = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                keys.backward = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                keys.left = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                keys.right = true;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                keys.sprint = true;
                break;
            case 'Space':
                if (window.ScenarioSystem && window.ScenarioSystem.handleSpaceDown && window.ScenarioSystem.handleSpaceDown(e)) {
                    e.preventDefault();
                    break;
                }
                if (hasEnteredClassroom && player.isGrounded) {
                    player.velocity.y = player.jumpVelocity;
                    player.isGrounded = false;
                }
                break;
            case 'KeyE':
                if (hoveredObject && hoveredObject.userData && hoveredObject.userData.action) {
                    hoveredObject.userData.action();
                }
                break;
            case 'KeyP':
                if (window.ScenarioSystem) window.ScenarioSystem.openScenariosModal();
                break;
            case 'KeyC':
                if (window.ScenarioSystem) window.ScenarioSystem.openGuideModal();
                break;
            case 'KeyU':
                if (window.ScenarioSystem) window.ScenarioSystem.openStudentsModal();
                break;
            case 'KeyT':
                if (window.ScenarioSystem) window.ScenarioSystem.toggleMic();
                break;
            case 'KeyL':
                toggleClassroomLights();
                break;
            case 'KeyB':
                soundEngine.playBell();
                showInteractionMessage('🔔 Tiếng chuông trường ngân vang rộn rã!');
                break;
            case 'KeyM':
                const bgmOn = soundEngine.toggleBgm();
                updateBgmButtonUI(bgmOn);
                showInteractionMessage(bgmOn ? '🎵 Đã bật nhạc nền Lofi thư giãn học tập.' : '🔇 Đã tắt nhạc nền Lofi.');
                break;
            case 'KeyV':
                toggleCameraMode();
                break;
            case 'KeyO':
                openSettingsModal();
                break;
            case 'KeyH':
                openHelpModal();
                break;
        }
    }

    function onKeyUp(e) {
        switch (e.code) {
            case 'KeyW':
            case 'ArrowUp':
                keys.forward = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                keys.backward = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                keys.left = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                keys.right = false;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                keys.sprint = false;
                break;
            case 'Space':
                if (window.ScenarioSystem && window.ScenarioSystem.handleSpaceUp) {
                    window.ScenarioSystem.handleSpaceUp(e);
                }
                break;
        }
    }

    // Quản lý Camera 3D phóng cận cảnh học sinh đang phát biểu
    const cameraFocusState = {
        active: false,
        studentId: null,
        targetPos: new THREE.Vector3(),
        targetLookAt: new THREE.Vector3(),
        startPos: new THREE.Vector3(),
        progress: 0,
        stage: 'none', // 'zooming_in' | 'holding' | 'zooming_out'
        holdDuration: 4500,
        holdTimer: 0
    };

    function focusOnStudent(studentId, durationMs = 4500) {
        if (!window.CharacterManager) return;
        const stPos = window.CharacterManager.getStudentWorldPosition(studentId);
        if (!stPos) return;

        cameraFocusState.active = true;
        cameraFocusState.studentId = studentId;
        // Đặt Camera lướt đến đối diện cận cảnh khuôn mặt học sinh
        const offsetX = stPos.x * 0.55;
        cameraFocusState.targetPos.set(offsetX, 1.34, stPos.z - 1.18);
        cameraFocusState.targetLookAt.set(stPos.x, 1.12, stPos.z);
        cameraFocusState.startPos.copy(camera.position);
        cameraFocusState.progress = 0;
        cameraFocusState.stage = 'zooming_in';
        cameraFocusState.holdDuration = durationMs || 4500;
        cameraFocusState.holdTimer = 0;

        // Bật hoạt họa học sinh đứng lên, mấp máy môi & gật đầu
        if (window.CharacterManager.setStudentSpeaking) {
            window.CharacterManager.setStudentSpeaking(studentId, true, durationMs);
        }
    }

    function returnToTeacherPodium() {
        if (cameraFocusState.active) {
            cameraFocusState.stage = 'zooming_out';
            cameraFocusState.progress = 0;
            cameraFocusState.startPos.copy(camera.position);
        }
    }

    // Cập nhật di chuyển & va chạm người chơi
    function updatePlayerMovement(delta) {
        // Tốc độ di chuyển
        const currentSpeed = (keys.sprint ? player.speed * player.sprintMultiplier : player.speed) * delta;

        // Vector hướng nhìn trên mặt phẳng nằm ngang
        const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation.y);
        const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation.y);

        const moveDir = new THREE.Vector3();
        if (keys.forward) moveDir.add(forward);
        if (keys.backward) moveDir.sub(forward);
        if (keys.right) moveDir.add(right);
        if (keys.left) moveDir.sub(right);

        const isMoving = moveDir.lengthSq() > 0.001;
        if (isMoving) {
            moveDir.normalize();
            player.position.addScaledVector(moveDir, currentSpeed);

            // Tiếng bước chân nhịp nhàng & Nhún bước chân (Head-bobbing)
            if (player.isGrounded && Config.headBobbing) {
                player.bobTimer += delta * (keys.sprint ? 14 : 9);
                const stepCycle = Math.sin(player.bobTimer);
                if (stepCycle < -0.95 && !player.stepped) {
                    soundEngine.playFootstep();
                    player.stepped = true;
                } else if (stepCycle > 0) {
                    player.stepped = false;
                }
            }
        } else {
            player.bobTimer = 0;
        }

        // Vật lý trọng lực & nhảy
        if (!player.isGrounded) {
            player.velocity.y -= player.gravity * delta;
            player.position.y += player.velocity.y * delta;

            if (player.position.y <= player.height) {
                player.position.y = player.height;
                player.velocity.y = 0;
                player.isGrounded = true;
            }
        }

        // Giới hạn va chạm phòng học (Bounding Box Collision)
        // Kích thước phòng 14m x 20m -> X: [-6.4, 6.4], Z: [-9.4, 9.4]
        const boundX = 6.3;
        const boundZ = 9.3;
        player.position.x = Math.max(-boundX, Math.min(boundX, player.position.x));
        player.position.z = Math.max(-boundZ, Math.min(boundZ, player.position.z));

        // Cập nhật vị trí Camera
        if (cameraFocusState.active) {
            // Hiệu ứng Camera 3D phóng cận cảnh khuôn mặt học sinh đang nói
            if (cameraFocusState.stage === 'zooming_in') {
                cameraFocusState.progress = Math.min(1.0, cameraFocusState.progress + delta * 2.8);
                const t = 0.5 - 0.5 * Math.cos(cameraFocusState.progress * Math.PI); // Smooth easeInOut
                camera.position.lerpVectors(cameraFocusState.startPos, cameraFocusState.targetPos, t);
                camera.lookAt(cameraFocusState.targetLookAt);
                if (cameraFocusState.progress >= 1.0) {
                    cameraFocusState.stage = 'holding';
                    cameraFocusState.holdTimer = 0;
                }
            } else if (cameraFocusState.stage === 'holding') {
                camera.position.copy(cameraFocusState.targetPos);
                camera.lookAt(cameraFocusState.targetLookAt);
                cameraFocusState.holdTimer += delta * 1000;
                if (cameraFocusState.holdTimer >= cameraFocusState.holdDuration) {
                    cameraFocusState.stage = 'zooming_out';
                    cameraFocusState.progress = 0;
                    cameraFocusState.startPos.copy(camera.position);
                }
            } else if (cameraFocusState.stage === 'zooming_out') {
                cameraFocusState.progress = Math.min(1.0, cameraFocusState.progress + delta * 2.2);
                const t = 0.5 - 0.5 * Math.cos(cameraFocusState.progress * Math.PI);
                const podiumPos = new THREE.Vector3(player.position.x, player.position.y, player.position.z);
                camera.position.lerpVectors(cameraFocusState.startPos, podiumPos, t);
                camera.rotation.copy(player.rotation);
                if (cameraFocusState.progress >= 1.0) {
                    cameraFocusState.active = false;
                }
            }
        } else if (Config.cameraMode === 'fps') {
            camera.position.x = player.position.x;
            // Hiệu ứng nhún đầu khi đi lại
            const bobOffset = Config.headBobbing && isMoving ? Math.sin(player.bobTimer) * 0.045 : 0;
            camera.position.y = player.position.y + bobOffset;
            camera.position.z = player.position.z;
            camera.rotation.copy(player.rotation);
        } else {
            // Chế độ quan sát toàn cảnh lớp học (Overview / Third Person Cinematic)
            const time = clock.getElapsedTime() * 0.15;
            camera.position.set(Math.sin(time) * 5, 3.8, Math.cos(time) * 4 + 4);
            camera.lookAt(0, 1.5, -2);
        }
    }

    // ================= 5. TƯƠNG TÁC ĐỒ VẬT QUA TÂM NGẮM (RAYCASTING) =================
    function checkRaycastInteraction() {
        if (Config.cameraMode !== 'fps') {
            dom.crosshair.classList.remove('interactable');
            dom.prompt.classList.remove('show');
            hoveredObject = null;
            return;
        }

        raycaster.setFromCamera(centerScreen, camera);
        const intersects = raycaster.intersectObjects(interactables, true);

        if (intersects.length > 0 && intersects[0].distance <= 5.0) {
            // Tìm root object có userData.interactable
            let target = intersects[0].object;
            while (target && (!target.userData || !target.userData.interactable) && target.parent) {
                target = target.parent;
            }

            if (target && target.userData && target.userData.interactable) {
                hoveredObject = target;
                dom.crosshair.classList.add('interactable');
                dom.promptText.textContent = target.userData.name || 'Tương tác';
                dom.prompt.classList.add('show');
                return;
            }
        }

        hoveredObject = null;
        dom.crosshair.classList.remove('interactable');
        dom.prompt.classList.remove('show');
    }

    // Hiển thị thông báo tương tác nổi trên màn hình
    let toastTimeout = null;
    function showInteractionMessage(msg) {
        let toast = document.getElementById('hud-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'hud-toast';
            toast.style.cssText = `
                position: absolute;
                top: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(15, 23, 42, 0.9);
                backdrop-filter: blur(12px);
                border: 1px solid #38bdf8;
                border-radius: 30px;
                padding: 10px 24px;
                color: #f8fafc;
                font-size: 14px;
                font-weight: 600;
                box-shadow: 0 8px 30px rgba(0,0,0,0.5);
                z-index: 80;
                pointer-events: none;
                transition: all 0.3s ease;
                white-space: nowrap;
            `;
            document.getElementById('hud-overlay').appendChild(toast);
        }

        toast.textContent = msg;
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';

        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(-10px)';
        }, 3600);
    }
    window.showInteractionMessage = showInteractionMessage;

    // Đổi Slide bài giảng tiếp theo
    function nextSlide() {
        currentSlideIndex = (currentSlideIndex + 1) % 4;
        const newTex = TextureGenerator.createSlideTexture(currentSlideIndex);
        smartSlideMesh.material.map = newTex;
        smartSlideMesh.material.needsUpdate = true;
        showInteractionMessage(`📊 Đã chuyển sang Slide ${currentSlideIndex + 1}/4 trên màn hình thông minh!`);
    }

    // Xoay quả địa cầu nhanh
    let globeSpeed = 0.01;
    function rotateGlobeFast() {
        globeSpeed = 0.15;
        setTimeout(() => {
            globeSpeed = 0.01;
        }, 2500);
    }

    // Bật / Tắt hệ thống đèn chiếu sáng lớp học
    function toggleClassroomLights() {
        soundEngine.playSwitch();
        Config.lightsOn = !Config.lightsOn;
        ceilingLights.forEach(light => {
            light.visible = Config.lightsOn;
        });
        ambientLight.intensity = Config.lightsOn ? 0.45 : 0.15;
        const btn = document.getElementById('btn-toggle-lights');
        if (btn) btn.classList.toggle('active', Config.lightsOn);
        showInteractionMessage(Config.lightsOn ? '💡 Đã bật đèn chiếu sáng trần nhà.' : '🌙 Đã tắt đèn phòng học (Chế độ ánh sáng dịu).');
    }

    // Đổi góc nhìn FPS / Toàn cảnh
    function toggleCameraMode() {
        Config.cameraMode = (Config.cameraMode === 'fps') ? 'overview' : 'fps';
        dom.statCamMode.textContent = Config.cameraMode === 'fps' ? 'Người thứ nhất (FPS)' : 'Toàn cảnh tự do';
        showInteractionMessage(Config.cameraMode === 'fps' ? '📷 Chế độ góc nhìn: Người thứ nhất (FPS Controls)' : '📷 Chế độ góc nhìn: Toàn cảnh lớp học');
    }

    // ================= 6. MINI-MAP SƠ ĐỒ THỜI GIAN THỰC =================
    function renderMinimap() {
        const ctx = dom.minimapCanvas.getContext('2d');
        const w = dom.minimapCanvas.width;
        const h = dom.minimapCanvas.height;

        ctx.clearRect(0, 0, w, h);

        // Nền phòng học trên minimap
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);

        // Kích thước tỷ lệ: Phòng 14m rộng x 20m dài
        const scaleX = w / 16;
        const scaleZ = h / 22;
        const centerX = w / 2;
        const centerZ = h / 2;

        // Tường phòng
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.strokeRect(centerX - 7 * scaleX, centerZ - 10 * scaleZ, 14 * scaleX, 20 * scaleZ);

        // Bục giảng & Bảng trước
        ctx.fillStyle = '#10b981';
        ctx.fillRect(centerX - 5 * scaleX, centerZ - 9.8 * scaleZ, 10 * scaleX, 1.5 * scaleZ);

        // Bàn học sinh (các chấm nhỏ)
        ctx.fillStyle = '#f59e0b';
        const startX = -((4 - 1) * 2.6) / 2;
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                const mx = centerX + (startX + c * 2.6) * scaleX;
                const mz = centerZ + (-1.2 + r * 2.8) * scaleZ;
                ctx.fillRect(mx - 3, mz - 2, 6, 4);
            }
        }

        // Hiển thị vị trí Giáo viên trên Minimap (khi đang hiện)
        if (window.CharacterManager && CharacterManager.teacher && CharacterManager.teacher.mesh && CharacterManager.teacher.mesh.visible) {
            const tx = centerX + CharacterManager.teacher.mesh.position.x * scaleX;
            const tz = centerZ + CharacterManager.teacher.mesh.position.z * scaleZ;
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(tx, tz, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Hiển thị vị trí các Học sinh AI đang hoạt động trên Minimap
        if (window.CharacterManager && CharacterManager.characters) {
            CharacterManager.characters.forEach(char => {
                if (char.type === 'student') {
                    const sx = centerX + char.mesh.position.x * scaleX;
                    const sz = centerZ + char.mesh.position.z * scaleZ;
                    ctx.fillStyle = char.color || '#38bdf8';
                    ctx.beginPath();
                    ctx.arc(sx, sz, 4.2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1;
                    ctx.stroke();

                    if (char.name) {
                        ctx.fillStyle = '#f8fafc';
                        ctx.font = 'bold 9px "Segoe UI", Arial, sans-serif';
                        ctx.textAlign = 'center';
                        ctx.fillText(char.name, sx, sz - 6);
                    }
                }
            });
        }

        // Vị trí người chơi (Tam giác chỉ hướng nhìn)
        const px = centerX + player.position.x * scaleX;
        const pz = centerZ + player.position.z * scaleZ;

        ctx.save();
        ctx.translate(px, pz);
        ctx.rotate(-player.rotation.y);

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(-4, 5);
        ctx.lineTo(4, 5);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    // ================= 7. GIAO DIỆN CÀI ĐẶT CẤU HÌNH NÉT =================
    function setupSettingsModalEvents() {
        const presets = {
            ultra: { scale: 2.0, aa: true, shadows: true, fov: 75, name: 'SIÊU NÉT (ULTRA)' },
            high: { scale: 1.5, aa: true, shadows: true, fov: 75, name: 'SẮC NÉT (HD)' },
            medium: { scale: 1.0, aa: true, shadows: true, fov: 75, name: 'TIÊU CHUẨN' },
            low: { scale: 0.75, aa: false, shadows: false, fov: 75, name: 'TIẾT KIỆM' }
        };

        const presetBtns = document.querySelectorAll('.preset-btn');
        presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                presetBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const pKey = btn.dataset.preset;
                const p = presets[pKey];
                if (p) {
                    Config.preset = pKey;
                    Config.pixelRatioScale = p.scale;
                    Config.antialiasing = p.aa;
                    Config.shadows = p.shadows;
                    Config.fov = p.fov;

                    document.getElementById('slider-res-scale').value = p.scale;
                    document.getElementById('val-res-scale').textContent = `${p.scale}x`;
                    document.getElementById('chk-antialiasing').checked = p.aa;
                    document.getElementById('chk-shadows').checked = p.shadows;
                    document.getElementById('slider-fov').value = p.fov;
                    document.getElementById('val-fov').textContent = `${p.fov}°`;

                    dom.statPreset.textContent = p.name;
                    applyGraphicsSettings();
                }
            });
        });

        // Sliders & Toggles
        const resSlider = document.getElementById('slider-res-scale');
        resSlider.addEventListener('input', (e) => {
            Config.pixelRatioScale = parseFloat(e.target.value);
            document.getElementById('val-res-scale').textContent = `${Config.pixelRatioScale}x`;
            applyResolutionSettings();
        });

        const fovSlider = document.getElementById('slider-fov');
        fovSlider.addEventListener('input', (e) => {
            Config.fov = parseInt(e.target.value);
            document.getElementById('val-fov').textContent = `${Config.fov}°`;
            camera.fov = Config.fov;
            camera.updateProjectionMatrix();
        });

        document.getElementById('chk-shadows').addEventListener('change', (e) => {
            Config.shadows = e.target.checked;
            renderer.shadowMap.enabled = Config.shadows;
            sunLight.castShadow = Config.shadows;
        });

        document.getElementById('chk-sunlight').addEventListener('change', (e) => {
            Config.sunlight = e.target.checked;
            sunLight.visible = Config.sunlight;
        });

        document.getElementById('chk-headbob').addEventListener('change', (e) => {
            Config.headBobbing = e.target.checked;
        });

        document.getElementById('btn-close-settings').addEventListener('click', closeSettingsModal);
        document.getElementById('btn-save-settings').addEventListener('click', () => {
            closeSettingsModal();
            showInteractionMessage('✅ Đã lưu và áp dụng cấu hình đồ họa nét!');
        });
    }

    function applyGraphicsSettings() {
        applyResolutionSettings();
        renderer.shadowMap.enabled = Config.shadows;
        sunLight.castShadow = Config.shadows;
        camera.fov = Config.fov;
        camera.updateProjectionMatrix();
    }

    function openSettingsModal() {
        if (document.exitPointerLock) document.exitPointerLock();
        dom.settingsModal.classList.add('show');
    }

    function closeSettingsModal() {
        dom.settingsModal.classList.remove('show');
    }

    function openHelpModal() {
        if (document.pointerLockElement && document.exitPointerLock) document.exitPointerLock();
        dom.helpModal.classList.add('show');
    }

    function closeHelpModal() {
        dom.helpModal.classList.remove('show');
    }

    // Modal xem bài giảng chi tiết
    function setupSlideModalEvents() {
        document.getElementById('btn-close-slide').addEventListener('click', closeSlideModal);
        document.getElementById('btn-prev-slide').addEventListener('click', () => {
            currentSlideIndex = (currentSlideIndex + 3) % 4;
            updateSlideModalPreview();
        });
        document.getElementById('btn-next-slide').addEventListener('click', () => {
            currentSlideIndex = (currentSlideIndex + 1) % 4;
            updateSlideModalPreview();
        });
    }

    function openSlideModal() {
        if (document.pointerLockElement && document.exitPointerLock) document.exitPointerLock();
        updateSlideModalPreview();
        dom.slideModal.classList.add('show');
    }

    function closeSlideModal() {
        dom.slideModal.classList.remove('show');
    }

    function updateSlideModalPreview() {
        const slidePreviewCanvas = document.getElementById('slide-preview-canvas');
        const ctx = slidePreviewCanvas.getContext('2d');
        const tex = TextureGenerator.createSlideTexture(currentSlideIndex);
        ctx.drawImage(tex.image, 0, 0, slidePreviewCanvas.width, slidePreviewCanvas.height);
        document.getElementById('slide-number-indicator').textContent = `${currentSlideIndex + 1} / 4`;

        // Đồng bộ lên màn chiếu 3D
        smartSlideMesh.material.map = tex;
        smartSlideMesh.material.needsUpdate = true;
    }

    // Thanh công cụ nút bấm dưới màn hình
    function setupToolbarButtons() {
        const bind = (id, fn) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', fn);
        };

        bind('btn-gameplay-guide', () => {
            if (window.ScenarioSystem) window.ScenarioSystem.openGuideModal();
        });
        bind('btn-scenarios', () => {
            if (window.ScenarioSystem) window.ScenarioSystem.openScenariosModal();
        });
        bind('btn-ai-students', () => {
            if (window.ScenarioSystem) window.ScenarioSystem.openStudentsModal();
        });
        bind('btn-mic-quick', () => {
            if (window.ScenarioSystem) window.ScenarioSystem.toggleMic();
        });
        bind('btn-pointer-lock', () => {
            if (isPointerLocked) {
                if (document.exitPointerLock) document.exitPointerLock();
            } else {
                requestPointerLock();
            }
        });

        bind('btn-settings', openSettingsModal);
        bind('btn-toggle-lights', toggleClassroomLights);
        bind('btn-school-bell', () => {
            soundEngine.playBell();
            showInteractionMessage('🔔 Tiếng chuông trường ngân vang rộn rã!');
        });
        bind('btn-toggle-bgm', () => {
            const bgmOn = soundEngine.toggleBgm();
            updateBgmButtonUI(bgmOn);
            showInteractionMessage(bgmOn ? '🎵 Đã bật nhạc nền Lofi thư giãn học tập.' : '🔇 Đã tắt nhạc nền Lofi.');
        });
        bind('btn-toggle-view', toggleCameraMode);
        bind('btn-help', openHelpModal);
        bind('btn-close-help', closeHelpModal);
        bind('btn-confirm-help', closeHelpModal);
    }

    function updateBgmButtonUI(isPlaying) {
        const btn = document.getElementById('btn-toggle-bgm');
        if (btn) btn.classList.toggle('active', isPlaying);
    }

    // Touch controls trên điện thoại
    function setupMobileControls() {
        const btnInteract = document.getElementById('m-btn-interact');
        const btnJump = document.getElementById('m-btn-jump');

        if (btnInteract) {
            btnInteract.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (hoveredObject && hoveredObject.userData && hoveredObject.userData.action) {
                    hoveredObject.userData.action();
                }
            });
        }

        if (btnJump) {
            btnJump.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (player.isGrounded) {
                    player.velocity.y = player.jumpVelocity;
                    player.isGrounded = false;
                }
            });
        }
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        applyResolutionSettings();
    }

    function updateStatsDisplay() {
        if (dom.statFps) {
            dom.statFps.textContent = `${Math.round(currentFps)} FPS`;
        }
        const scoreEl = document.getElementById('stat-pedagogy-score');
        if (scoreEl && window.ScenarioSystem) {
            scoreEl.textContent = `${window.ScenarioSystem.totalScore} / ${window.ScenarioSystem.maxScore}`;
        }
    }

        // API cho hệ thống 14 bước mô phỏng điều khiển lớp 3D
    window.ClassroomGame = {
        markEntered: function () {
            if (!hasEnteredClassroom) {
                hasEnteredClassroom = true;
                soundEngine.init();
            }
            if (dom.blocker) dom.blocker.classList.add('hidden');
        },

        updateBoardForScenario: function (boardLesson) {
            if (!smartSlideMesh || !window.TextureGenerator || !TextureGenerator.createScenarioBoardTexture) return;
            if (smartSlideMesh.material.map) {
                smartSlideMesh.material.map.dispose();
            }
            const tex = TextureGenerator.createScenarioBoardTexture(boardLesson);
            smartSlideMesh.material.map = tex;
            smartSlideMesh.material.needsUpdate = true;
        },

        focusPlayerOnClass: function () {
            hasEnteredClassroom = true;
            if (dom.blocker) dom.blocker.classList.add('hidden');
            // Đưa giáo viên đứng giữa bục giảng nhìn bao quát rõ cả 3 học sinh 3D trong khung hình
            player.position.set(0.0, 1.74, -4.45);
            player.velocity.set(0, 0, 0);
            player.rotation.set(-0.15, Math.PI, 0, 'YXZ');
            Config.cameraMode = 'fps';
            if (dom.statCamMode) dom.statCamMode.textContent = 'Người thứ nhất (FPS)';
        },

        openSettings: function () {
            openSettingsModal();
        },

        toggleLights: function () {
            toggleClassroomLights();
        },

        toggleCamera: function () {
            toggleCameraMode();
        },

        setFlowPhase: function (phaseMode) {
            // 'wizard' (1-5, 11-14) | 'classroom3d' (6-10) | 'free'
            document.body.dataset.flowPhase = phaseMode || 'wizard';
        },

        focusOnStudent: function (studentId, durationMs) {
            focusOnStudent(studentId, durationMs);
        },

        returnToPodium: function () {
            returnToTeacherPodium();
        },

        getDistanceToPoint: function (targetVec) {
            if (!targetVec) return 999;
            const dx = player.position.x - targetVec.x;
            const dz = player.position.z - targetVec.z;
            return Math.sqrt(dx * dx + dz * dz);
        },

        isPaused: false,

        setPaused: function (paused) {
            this.isPaused = Boolean(paused);
            if (this.isPaused) {
                // Hủy phím bấm và vận tốc đang chuyển động để không bị trôi nhân vật
                keys.forward = false;
                keys.backward = false;
                keys.left = false;
                keys.right = false;
                keys.sprint = false;
                player.velocity.set(0, 0, 0);
            }
        }
    };

    // ================= 8. VÒNG LẶP RENDER HOẠT HỌA 60+ FPS =================
    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();

        // Kiểm tra đóng băng mô phỏng khi Tạm dừng
        const isSimulationPaused = (window.ClassroomGame && window.ClassroomGame.isPaused) || (window.ScenarioSystem && window.ScenarioSystem.isPaused);
        if (isSimulationPaused) {
            // Vẫn vẽ scene tĩnh để không giật nháy màn hình, nhưng đóng băng quạt trần, đồng hồ, vật lý và cử động
            renderer.render(scene, camera);
            return;
        }

        // Đo FPS
        frameCount++;
        const now = performance.now();
        if (now - lastTime >= 1000) {
            currentFps = (frameCount * 1000) / (now - lastTime);
            frameCount = 0;
            lastTime = now;
            updateStatsDisplay();
        }

        // 1. Cập nhật di chuyển & vật lý nhân vật
        updatePlayerMovement(delta);

        // 1b. Cập nhật hoạt họa Giáo viên & Học sinh 3D
        if (window.CharacterManager) {
            CharacterManager.update(delta, clock.getElapsedTime());
        }

        // 2. Tương tác tâm ngắm (Raycast)
        checkRaycastInteraction();

        // 3. Hoạt họa quạt trần quay nhịp nhàng
        fanBlades.forEach(blades => {
            blades.rotation.y += delta * 4.5;
        });

        // 4. Hoạt họa quả địa cầu 3D xoay
        if (globeMesh) {
            globeMesh.rotation.y += globeSpeed;
        }

        // 5. Cập nhật kim giây đồng hồ thực tế
        if (wallClockSecondHand) {
            const d = new Date();
            const sAngle = d.getSeconds() * (Math.PI / 30);
            wallClockSecondHand.rotation.z = -sAngle;
        }

        // 6. Vẽ Minimap thời gian thực
        renderMinimap();

        // 7. Render cảnh 3D
        renderer.render(scene, camera);
    }

    // Khởi động khi tải xong trang
    window.addEventListener('DOMContentLoaded', initThree);

})();
