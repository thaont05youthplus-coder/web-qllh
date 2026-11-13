// characters.js - Hệ thống Nhân vật 3D (Giáo viên & Học sinh AI động theo Tình huống)
// Hỗ trợ tư thế biểu cảm 3D thời gian thực và bong bóng lời thoại TTS nổi trên đầu

(function () {
    'use strict';

    // Danh sách học sinh mặc định hiển thị ngay khi vào phòng (trước khi chọn tình huống)
    const DEFAULT_STUDENTS = [
        {
            id: 'bin',
            name: 'Bin',
            badgeText: 'Học sinh Lớp 4',
            avatar: '⚡',
            color: '#f59e0b',
            gender: 'male',
            deskIndex: { row: 0, col: 1, seat: 0 },
            initialPosture: 'raising_hand',
            quote: 'Chào thầy/cô! Bấm phím [P] hoặc nút "5 Tình huống" để bắt đầu mô phỏng tình huống 1 nhé!',
            lines: [
                'Chào thầy/cô! Bấm phím [P] hoặc nút "5 Tình huống" để bắt đầu mô phỏng nhé!',
                'Thầy/cô có thể nói bằng Micro (Speech-to-Text) để điều phối cả lớp.'
            ]
        },
        {
            id: 'na',
            name: 'Na',
            badgeText: 'Học sinh Lớp 4',
            avatar: '📝',
            color: '#38bdf8',
            gender: 'female',
            deskIndex: { row: 0, col: 1, seat: 1 },
            initialPosture: 'writing',
            quote: 'Em chào thầy/cô ạ! Lớp học 3D đã sẵn sàng cho 5 kịch bản quản lý lớp học.',
            lines: [
                'Em chào thầy/cô ạ! Lớp học 3D đã sẵn sàng cho 5 kịch bản quản lý lớp học.',
                'Sau mỗi tình huống, hệ thống sẽ nhận xét chi tiết theo Luật Nhà giáo 2025.'
            ]
        },
        {
            id: 'ti',
            name: 'Tí',
            badgeText: 'Học sinh Lớp 4',
            avatar: '🙋',
            color: '#10b981',
            gender: 'male',
            deskIndex: { row: 0, col: 2, seat: 0 },
            initialPosture: 'attentive',
            quote: 'Thầy/cô hãy chọn một trong 5 Tình huống để chúng em nhập vai theo kịch bản ạ!',
            lines: [
                'Thầy/cô hãy chọn một trong 5 Tình huống để chúng em nhập vai theo kịch bản ạ!'
            ]
        }
    ];

    const CharacterManager = {
        characters: [],
        studentMap: {},
        teacher: null,
        scene: null,
        roomGroup: null,
        interactables: null,
        camera: null,

        init: function (scene, roomGroup, interactables, camera) {
            this.scene = scene;
            this.roomGroup = roomGroup;
            this.interactables = interactables;
            this.camera = camera;
            this.characters = [];
            this.studentMap = {};

            // 1. Tạo Giáo viên đứng trên bục giảng cho chế độ tham quan tự do
            this.teacher = this.createTeacher({
                name: 'Giáo viên Hướng dẫn',
                role: 'Mô phỏng Quản lý Lớp học 3D',
                position: new THREE.Vector3(0.0, 0.18, -6.6),
                quote: 'Chào mừng bạn đến với Lớp học ảo 3D! Hãy chọn một trong 5 Tình huống mô phỏng và dùng Micro để giảng dạy, điều phối lớp học theo Luật Nhà giáo 2025.',
                lines: [
                    'Chào mừng bạn đến với Lớp học ảo 3D mô phỏng quản lý lớp học!',
                    'Hệ thống tích hợp Speech-to-Text để bạn nói trực tiếp bằng tiếng Việt hoặc tiếng Anh, và Text-to-Speech để học sinh phản hồi sống động.',
                    'Hãy bấm nút "5 Tình huống" (phím P) hoặc nhìn bảng điều khiển bên phải để bắt đầu!'
                ]
            });
            this.characters.push(this.teacher);

            // 2. Tạo sẵn 3 học sinh mặc định để lớp học luôn sinh động ngay từ đầu
            this.loadScenarioStudents(DEFAULT_STUDENTS, { isFreeExplore: true });
        },

        // Xóa sạch học sinh cũ trước khi nạp học sinh của tình huống mới
        clearStudents: function () {
            const removedMeshes = new Set();

            this.characters = this.characters.filter(ch => {
                if (ch.type === 'student') {
                    if (ch.speechBubble && ch.speechBubble.material && ch.speechBubble.material.map) {
                        ch.speechBubble.material.map.dispose();
                    }
                    ch.mesh.traverse(node => removedMeshes.add(node));
                    if (this.roomGroup) {
                        this.roomGroup.remove(ch.mesh);
                    }
                    return false;
                }
                return true;
            });

            // Đồng bộ xóa khỏi mảng interactables (giữ nguyên tham chiếu mảng của game.js)
            if (Array.isArray(this.interactables)) {
                for (let i = this.interactables.length - 1; i >= 0; i--) {
                    if (removedMeshes.has(this.interactables[i])) {
                        this.interactables.splice(i, 1);
                    }
                }
            }

            this.studentMap = {};
        },

        // Nạp học sinh theo tình huống (hoặc chế độ tham quan tự do)
        loadScenarioStudents: function (studentsList, options = {}) {
            this.clearStudents();

            // Trong chế độ nhập vai tình huống, ẩn NPC giáo viên để người dùng trực tiếp đóng vai giáo viên đứng lớp
            if (this.teacher && this.teacher.mesh) {
                this.teacher.mesh.visible = Boolean(options.isFreeExplore);
            }

            const isHighSchool = Boolean(options.grade && String(options.grade).toUpperCase().includes('THPT'));
            const list = Array.isArray(studentsList) && studentsList.length > 0 ? studentsList : DEFAULT_STUDENTS;

            list.forEach(st => {
                const startPosture = options.initialAttentive ? 'attentive' : st.initialPosture;
                const startLine = options.initialAttentive
                    ? 'Em đang lắng nghe hướng dẫn của thầy/cô ạ!'
                    : st.initialLine;

                const charObj = this.createStudent({
                    ...st,
                    initialPosture: startPosture,
                    initialLine: startLine,
                    hideScarf: isHighSchool,
                    isFreeExplore: Boolean(options.isFreeExplore),
                    badgeText: st.badgeText || (options.grade ? `${st.avatar || '🎓'} ${options.grade}` : `${st.avatar || '🎓'} Học sinh AI`)
                });
                this.characters.push(charObj);
                this.studentMap[charObj.id] = charObj;
            });
        },

        // Bước 6 -> Bước 7: Kích hoạt tình huống trên 3 học sinh trong lớp 3D
        triggerScenarioIncident: function (studentsList) {
            if (!Array.isArray(studentsList)) return;
            studentsList.forEach(st => {
                this.setStudentPosture(st.id, st.initialPosture, st.initialLine);
            });
        },

        // Đưa toàn bộ học sinh về trạng thái khởi động chăm chú (Bước 6)
        setStudentsAttentive: function () {
            this.characters.forEach(ch => {
                if (ch.type === 'student') {
                    this.setStudentPosture(ch.id, 'attentive', 'Em đang lắng nghe hướng dẫn ạ!');
                    this.setStudentStatusTag(ch.id, '');
                }
            });
            this.hideAllSpeechBubbles();
        },

        // Cập nhật nhãn trạng thái dưới/trên học sinh (vd: "Huy · đang ghi chép" theo mockup Bước 9)
        setStudentStatusTag: function (studentId, statusText, accentColor) {
            const char = this.studentMap[studentId];
            if (!char || !char.nametag || !char.nametag.material) return;
            if (char.nametag.material.map) {
                char.nametag.material.map.dispose();
            }
            const titleText = statusText
                ? `${char.name} · ${statusText}`
                : `${char.avatar || '🎓'} ${char.name}`.trim();
            const subText = statusText ? 'Học sinh AI · Trong lớp' : (char.badgeText || 'Học sinh AI');
            const color = accentColor || char.color || '#38bdf8';
            const updatedTag = this.createNameplate(titleText, subText, color);
            char.nametag.material.map = updatedTag.material.map;
            char.nametag.material.needsUpdate = true;
        },

        setTeacherPersona: function (persona) {
            if (!this.teacher || !persona) return;
            if (this.teacher.suitMat && persona.suitColor !== undefined) {
                this.teacher.suitMat.color.setHex(persona.suitColor);
            }
            if (this.teacher.tieMat && persona.tieColor !== undefined) {
                this.teacher.tieMat.color.setHex(persona.tieColor);
            }
            if (this.teacher.ponytail) {
                this.teacher.ponytail.visible = (persona.hairStyle === 'female');
            }
            if (this.teacher.glassesGroup) {
                this.teacher.glassesGroup.visible = Boolean(persona.hasGlasses);
            }
            const shownName = persona.displayName || persona.name;
            const badgeSub = persona.mbti ? `${persona.mbti} · ${persona.name}` : (persona.name || 'Giáo viên');
            const tagColor = persona.colorHex || '#38bdf8';
            if (this.teacher.nametag) {
                if (this.teacher.nametag.material.map) {
                    this.teacher.nametag.material.map.dispose();
                }
                const newTag = this.createNameplate(`${persona.avatar || ''} ${shownName}`.trim(), badgeSub, tagColor);
                this.teacher.nametag.material.map = newTag.material.map;
                this.teacher.nametag.material.needsUpdate = true;
            }
            if (this.teacher.mesh && this.teacher.mesh.userData) {
                this.teacher.mesh.userData.name = `${persona.avatar || '👨‍🏫'} ${shownName}`;
            }
        },

        setTeacherVisible: function (visible) {
            if (this.teacher && this.teacher.mesh) {
                this.teacher.mesh.visible = Boolean(visible);
            }
        },

        // Cập nhật tư thế & lời thoại hiện tại của 1 học sinh trong kịch bản
        setStudentPosture: function (studentId, posture, line) {
            const char = this.studentMap[studentId];
            if (!char) return;

            char.posture = posture || 'attentive';
            if (line) {
                char.currentLine = line;
            }
            this._applyBasePostureTransforms(char);
        },

        _applyBasePostureTransforms: function (char) {
            // Reset về trạng thái ngồi chuẩn
            char.mesh.position.set(char.basePos.x, char.basePos.y, char.basePos.z);
            char.mesh.rotation.set(0, 0, 0);
            char.head.rotation.set(0, 0, 0);
            char.torsoGroup.rotation.set(0, 0, 0);
            char.armL.rotation.set(Math.PI / 3, 0, 0);
            char.armR.rotation.set(Math.PI / 3, 0, 0);

            if (char.phoneMesh) {
                char.phoneMesh.visible = false;
            }
            if (char.legsSeatedGroup) {
                char.legsSeatedGroup.visible = true;
            }
            if (char.legsStandingGroup) {
                char.legsStandingGroup.visible = false;
            }

            switch (char.posture) {
                case 'standing_restless':
                    // Đứng nhấp nhổm lệch nhẹ cạnh ghế, chuẩn bị chạy sang bàn bạn
                    char.mesh.position.y = 0.22;
                    char.mesh.position.x = char.basePos.x - 0.22;
                    char.mesh.rotation.y = 0.35;
                    if (char.legsSeatedGroup) char.legsSeatedGroup.visible = false;
                    if (char.legsStandingGroup) char.legsStandingGroup.visible = true;
                    char.armL.rotation.set(0.25, 0, 0.2);
                    char.armR.rotation.set(-0.35, 0, -0.2);
                    break;

                case 'raising_hand':
                    char.armR.rotation.set(Math.PI * 0.88, 0, -0.15);
                    char.armL.rotation.set(Math.PI / 3, 0, 0);
                    break;

                case 'writing':
                    char.head.rotation.x = 0.35;
                    char.torsoGroup.rotation.x = 0.14;
                    char.armL.rotation.set(Math.PI / 2.4, -0.2, 0.15);
                    char.armR.rotation.set(Math.PI / 2.3, 0.25, -0.15);
                    break;

                case 'using_phone':
                    char.head.rotation.x = 0.48;
                    char.torsoGroup.rotation.x = 0.18;
                    char.armL.rotation.set(Math.PI / 2.2, -0.3, 0);
                    char.armR.rotation.set(Math.PI / 2.2, 0.3, 0);
                    if (char.phoneMesh) char.phoneMesh.visible = true;
                    break;

                case 'peeking_laugh':
                    // Quay người liếc sang bạn bên cạnh cười
                    char.mesh.rotation.y = 0.45;
                    char.head.rotation.y = 0.35;
                    char.armL.rotation.set(Math.PI / 2.6, 0, 0.2);
                    char.armR.rotation.set(Math.PI / 2.2, -0.35, 0.2);
                    break;

                case 'looking_window':
                    // Quay mặt nhìn ra phía cửa sổ bên phải (+X -> xoay -PI/2 theo trục Y vì mặt đang quay -Z)
                    char.mesh.rotation.y = -0.35;
                    char.head.rotation.y = -0.85;
                    char.head.rotation.x = -0.05;
                    break;

                case 'head_down':
                    char.head.rotation.x = 0.52;
                    char.torsoGroup.rotation.x = 0.16;
                    char.armL.rotation.set(Math.PI / 4, 0, 0.1);
                    char.armR.rotation.set(Math.PI / 4, 0, -0.1);
                    break;

                case 'pouting':
                    // Khoanh tay trước ngực, quay mặt đi
                    char.head.rotation.y = -0.35;
                    char.head.rotation.x = 0.1;
                    char.armL.rotation.set(Math.PI / 2.2, 0, 0.45);
                    char.armR.rotation.set(Math.PI / 2.2, 0, -0.45);
                    break;

                case 'happy_task':
                    char.head.rotation.x = -0.08;
                    char.armR.rotation.set(Math.PI * 0.72, 0, -0.25);
                    char.armL.rotation.set(Math.PI / 2.6, 0, 0.18);
                    break;

                case 'speaking_pair':
                    char.head.rotation.y = 0.25;
                    char.armL.rotation.set(Math.PI / 2.5, 0, 0.15);
                    char.armR.rotation.set(Math.PI / 2.4, -0.2, -0.15);
                    break;

                case 'attentive':
                default:
                    break;
            }
        },

        // Hiển thị bong bóng lời thoại 3D trên đầu học sinh
        showSpeechBubble: function (studentId, text, durationMs = 6500, accentColor) {
            const char = this.studentMap[studentId];
            if (!char || !char.speechBubble || !text) return;

            if (char.speechBubble.material.map) {
                char.speechBubble.material.map.dispose();
            }
            const tex = window.TextureGenerator.createSpeechBubbleTexture(
                `${char.avatar || ''} ${char.name}`.trim(),
                text,
                accentColor || char.color || '#38bdf8'
            );
            char.speechBubble.material.map = tex;
            char.speechBubble.material.needsUpdate = true;
            char.speechBubble.visible = true;
            char.speechBubbleExpiresAt = performance.now() + durationMs;
        },

        hideAllSpeechBubbles: function () {
            this.characters.forEach(ch => {
                if (ch.speechBubble) {
                    ch.speechBubble.visible = false;
                }
            });
        },

        getStudentWorldPosition: function (studentId) {
            const char = this.studentMap[studentId];
            return char ? char.mesh.position.clone() : null;
        },

        setStudentSpeaking: function (studentId, isSpeaking, durationMs = 4500) {
            const char = this.studentMap[studentId];
            if (!char) return;
            char.isSpeaking = Boolean(isSpeaking);
            char.speakingUntil = isSpeaking ? (performance.now() + durationMs) : 0;
            if (isSpeaking) {
                // Nhấc tư thế lên nhẹ nhàng và xoay mặt hướng về giáo viên
                char.head.rotation.y = 0;
                char.head.rotation.x = -0.05;
            }
        },

        stopAllSpeaking: function () {
            this.characters.forEach(ch => {
                ch.isSpeaking = false;
                ch.speakingUntil = 0;
                if (ch.mouthMesh) {
                    ch.mouthMesh.scale.set(1, 1, 1);
                }
            });
        },

        getActiveStudents: function () {
            return this.characters.filter(ch => ch.type === 'student');
        },

        // ================= TẠO GIÁO VIÊN 3D =================
        createTeacher: function (config) {
            const group = new THREE.Group();
            group.position.copy(config.position);
            group.rotation.y = 0;

            const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.5 });
            const suitMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.4 });
            const shirtMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
            const tieMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 });
            const pantsMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
            const shoesMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.2 });
            const hairMat = new THREE.MeshStandardMaterial({ color: 0x171717, roughness: 0.6 });

            const torso = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.72, 0.28), suitMat);
            torso.position.y = 1.15;
            torso.castShadow = true;
            group.add(torso);

            const collar = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.04), shirtMat);
            collar.position.set(0, 1.36, 0.14);
            group.add(collar);

            const tie = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.38, 0.02), tieMat);
            tie.position.set(0, 1.25, 0.165);
            group.add(tie);

            const head = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.28, 0.25), skinMat);
            head.position.y = 1.64;
            head.castShadow = true;
            group.add(head);

            const hair = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.27), hairMat);
            hair.position.set(0, 1.78, 0.01);
            group.add(hair);

            const ponytail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.34, 0.12), hairMat);
            ponytail.position.set(0, 1.62, -0.17);
            ponytail.rotation.x = -0.25;
            ponytail.visible = true;
            group.add(ponytail);

            const glassesGroup = new THREE.Group();
            const glassesMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });
            const gL = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.007, 8, 16), glassesMat);
            gL.position.set(-0.07, 1.65, 0.13);
            glassesGroup.add(gL);
            const gR = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.007, 8, 16), glassesMat);
            gR.position.set(0.07, 1.65, 0.13);
            glassesGroup.add(gR);
            const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.008, 0.01), glassesMat);
            bridge.position.set(0, 1.65, 0.13);
            glassesGroup.add(bridge);
            group.add(glassesGroup);

            const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
            const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), eyeMat);
            eyeL.position.set(-0.07, 1.65, 0.125);
            group.add(eyeL);
            const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), eyeMat);
            eyeR.position.set(0.07, 1.65, 0.125);
            group.add(eyeR);

            const armLGroup = new THREE.Group();
            armLGroup.position.set(-0.33, 1.4, 0);
            const armL = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.55, 0.14), suitMat);
            armL.position.y = -0.22;
            armLGroup.add(armL);
            const handL = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.12, 0.11), skinMat);
            handL.position.y = -0.52;
            armLGroup.add(handL);
            group.add(armLGroup);

            const armRGroup = new THREE.Group();
            armRGroup.position.set(0.33, 1.4, 0);
            armRGroup.rotation.x = -Math.PI / 4;
            armRGroup.rotation.z = -Math.PI / 8;
            const armR = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.55, 0.14), suitMat);
            armR.position.y = -0.22;
            armRGroup.add(armR);

            const handR = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.12, 0.11), skinMat);
            handR.position.y = -0.52;
            armRGroup.add(handR);

            const pointer = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.006, 0.9), new THREE.MeshStandardMaterial({ color: 0xd97706 }));
            pointer.position.set(0, -0.75, 0.28);
            pointer.rotation.x = Math.PI / 3;
            armRGroup.add(pointer);
            group.add(armRGroup);

            const legL = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.75, 0.2), pantsMat);
            legL.position.set(-0.14, 0.45, 0);
            legL.castShadow = true;
            group.add(legL);

            const legR = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.75, 0.2), pantsMat);
            legR.position.set(0.14, 0.45, 0);
            legR.castShadow = true;
            group.add(legR);

            const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.28), shoesMat);
            shoeL.position.set(-0.14, 0.05, 0.04);
            shoeL.castShadow = true;
            group.add(shoeL);

            const shoeR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.28), shoesMat);
            shoeR.position.set(0.14, 0.05, 0.04);
            shoeR.castShadow = true;
            group.add(shoeR);

            const nametag = this.createNameplate(config.name, config.role, '#38bdf8');
            nametag.position.y = 2.15;
            group.add(nametag);

            const actionFunc = () => {
                if (window.SpeechEngine) {
                    window.SpeechEngine.speak(config.quote || config.lines[0], { speaker: config.name });
                }
                CharacterManager.showDialogueModal({
                    name: config.name,
                    role: config.role,
                    avatar: '👨‍🏫',
                    lines: config.lines,
                    type: 'teacher'
                });
            };

            group.userData = {
                interactable: true,
                name: `👨‍🏫 ${config.name}`,
                action: actionFunc
            };

            group.traverse(child => {
                if (child.isMesh) {
                    child.userData = group.userData;
                    this.interactables.push(child);
                }
            });

            this.interactables.push(group);
            this.roomGroup.add(group);

            return {
                mesh: group,
                armR: armRGroup,
                armL: armLGroup,
                head: head,
                suitMat: suitMat,
                tieMat: tieMat,
                ponytail: ponytail,
                glassesGroup: glassesGroup,
                nametag: nametag,
                type: 'teacher',
                animOffset: 0
            };
        },

        // ================= TẠO HỌC SINH 3D ĐỘC BẢN CHO TỪNG NHÂN VẬT =================
        createStudent: function (config) {
            const group = new THREE.Group();

            // Hồ sơ hình thái 3D riêng biệt cho từng học sinh để không ai giống ai
            const STUDENT_LOOKS = {
                bin: { skin: 0xffe0bd, hairColor: 0x5c2c16, hairStyle: 'tousled', vestColor: null, collarColor: 0xf59e0b, glasses: false, scarf: true },
                na: { skin: 0xffe4cb, hairColor: 0x291d17, hairStyle: 'pigtails', vestColor: null, collarColor: 0x38bdf8, glasses: false, scarf: true },
                ti: { skin: 0xf5d0a9, hairColor: 0x18181b, hairStyle: 'parted', vestColor: 0x059669, collarColor: 0x10b981, glasses: true, scarf: true },
                huy: { skin: 0xf5d0a9, hairColor: 0x241711, hairStyle: 'spiky', vestColor: null, collarColor: 0x2563eb, glasses: false, scarf: true },
                lan: { skin: 0xffe4cb, hairColor: 0x3e2723, hairStyle: 'bob', vestColor: 0xd97706, collarColor: 0xf472b6, glasses: true, scarf: false },
                nam: { skin: 0xffe0bd, hairColor: 0x18181b, hairStyle: 'parted', vestColor: 0x1e3a8a, collarColor: 0x3b82f6, glasses: true, scarf: false },
                khoa: { skin: 0xedc9af, hairColor: 0x171717, hairStyle: 'undercut', vestColor: 0x334155, collarColor: 0xef4444, glasses: false, scarf: false, headphones: true },
                mai: { skin: 0xffe4cb, hairColor: 0x3b2318, hairStyle: 'headband', vestColor: 0x7c3aed, collarColor: 0xa855f7, glasses: false, scarf: false },
                tuan: { skin: 0xf5d0a9, hairColor: 0x262626, hairStyle: 'messy', vestColor: 0x2563eb, collarColor: 0x60a5fa, glasses: true, scarf: false },
                linh: { skin: 0xffe0bd, hairColor: 0x1c1917, hairStyle: 'ponytail', vestColor: null, collarColor: 0xec4899, glasses: false, scarf: false },
                thao: { skin: 0xffe4cb, hairColor: 0x451a03, hairStyle: 'braids', vestColor: null, collarColor: 0xf472b6, glasses: false, scarf: true },
                quan: { skin: 0xedc9af, hairColor: 0x18181b, hairStyle: 'spiky', vestColor: null, collarColor: 0x0284c7, glasses: false, scarf: true },
                ha: { skin: 0xffe0bd, hairColor: 0x291d17, hairStyle: 'pigtails', vestColor: null, collarColor: 0x10b981, glasses: false, scarf: true }
            };

            const normId = String(config.id || '').toLowerCase();
            const look = STUDENT_LOOKS[normId] || {
                skin: config.gender === 'female' ? 0xffe4cb : 0xffe0bd,
                hairColor: config.gender === 'female' ? 0x291d17 : 0x1e293b,
                hairStyle: config.gender === 'female' ? 'ponytail' : 'parted',
                vestColor: null,
                collarColor: 0x38bdf8,
                glasses: false,
                scarf: !config.hideScarf
            };

            // Khớp chính xác tọa độ bàn học sinh trong game.js
            const xSpacing = 2.6;
            const zSpacing = 2.8;
            const startX = -((4 - 1) * xSpacing) / 2;
            const startZ = -1.2;

            const row = (config.deskIndex && config.deskIndex.row !== undefined) ? config.deskIndex.row : 0;
            const col = (config.deskIndex && config.deskIndex.col !== undefined) ? config.deskIndex.col : 1;
            const seat = (config.deskIndex && config.deskIndex.seat !== undefined) ? config.deskIndex.seat : 0;

            const deskX = startX + col * xSpacing;
            const deskZ = startZ + row * zSpacing;
            const seatXOffset = (seat === 0) ? -0.45 : 0.45;
            const seatZOffset = 0.55;

            const basePos = new THREE.Vector3(deskX + seatXOffset, 0, deskZ + seatZOffset);
            group.position.copy(basePos);
            group.rotation.y = 0; // Quay mặt về phía bảng (-Z)

            const skinMat = new THREE.MeshStandardMaterial({ color: look.skin, roughness: 0.6 });
            const uniformWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
            const darkNavyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
            const redTieMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 });
            const hairMat = new THREE.MeshStandardMaterial({ color: look.hairColor, roughness: 0.75 });
            const shoeMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 });

            // Nhóm thân trên để có thể cúi người mượt mà
            const torsoGroup = new THREE.Group();
            torsoGroup.position.set(0, 0.52, 0);
            group.add(torsoGroup);

            const torso = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.48, 0.22), uniformWhiteMat);
            torso.position.y = 0.24;
            torso.castShadow = true;
            torsoGroup.add(torso);

            // Áo gile len / áo khoác màu sắc riêng cho từng học sinh
            if (look.vestColor) {
                const vestMat = new THREE.MeshStandardMaterial({ color: look.vestColor, roughness: 0.8 });
                const vest = new THREE.Mesh(new THREE.BoxGeometry(0.39, 0.43, 0.23), vestMat);
                vest.position.set(0, 0.22, 0);
                vest.castShadow = true;
                torsoGroup.add(vest);
            }

            if (look.scarf && !config.hideScarf) {
                const redScarf = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.24, 0.03), redTieMat);
                redScarf.position.set(0, 0.36, -0.12);
                torsoGroup.add(redScarf);
            }

            // Đầu & Mắt & Miệng & Tóc
            const headGroup = new THREE.Group();
            headGroup.position.set(0, 0.63, 0);
            torsoGroup.add(headGroup);

            const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.24, 0.22), skinMat);
            headMesh.castShadow = true;
            headGroup.add(headMesh);

            const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
            const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), eyeMat);
            eyeL.position.set(-0.055, 0.01, -0.115);
            headGroup.add(eyeL);
            const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), eyeMat);
            eyeR.position.set(0.055, 0.01, -0.115);
            headGroup.add(eyeR);

            // Miệng 3D mấp máy sinh động khi phát biểu
            const mouthMat = new THREE.MeshBasicMaterial({ color: 0x991b1b });
            const mouthMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.02), mouthMat);
            mouthMesh.position.set(0, -0.065, -0.115);
            headGroup.add(mouthMesh);

            // Kính mắt 3D nếu nhân vật đeo kính (Lan, Nam, Tí, Tuấn)
            if (look.glasses) {
                const glassMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
                const frameL = new THREE.Mesh(new THREE.RingGeometry(0.024, 0.034, 16), glassMat);
                frameL.position.set(-0.055, 0.01, -0.118);
                headGroup.add(frameL);
                const frameR = new THREE.Mesh(new THREE.RingGeometry(0.024, 0.034, 16), glassMat);
                frameR.position.set(0.055, 0.01, -0.118);
                headGroup.add(frameR);
                const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.008, 0.01), glassMat);
                bridge.position.set(0, 0.01, -0.118);
                headGroup.add(bridge);
            }

            // Tai nghe sành điệu cho Khoa
            if (look.headphones) {
                const hpMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
                const hpBand = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.02, 8, 24, Math.PI), hpMat);
                hpBand.rotation.x = Math.PI / 2;
                hpBand.position.set(0, -0.02, 0);
                torsoGroup.add(hpBand);
            }

            // Tạo kiểu tóc phong phú đa dạng theo cá tính học sinh
            if (look.hairStyle === 'pigtails') {
                const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.1, 0.24), hairMat);
                hairTop.position.set(0, 0.13, 0.01);
                headGroup.add(hairTop);
                const bunL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), hairMat);
                bunL.position.set(-0.14, 0.06, 0.05);
                headGroup.add(bunL);
                const bunR = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), hairMat);
                bunR.position.set(0.14, 0.06, 0.05);
                headGroup.add(bunR);
            } else if (look.hairStyle === 'bob') {
                const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.25), hairMat);
                hairTop.position.set(0, 0.12, 0.01);
                headGroup.add(hairTop);
                const hairSideL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.22), hairMat);
                hairSideL.position.set(-0.12, -0.01, 0.02);
                headGroup.add(hairSideL);
                const hairSideR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.22), hairMat);
                hairSideR.position.set(0.12, -0.01, 0.02);
                headGroup.add(hairSideR);
            } else if (look.hairStyle === 'spiky') {
                const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.11, 0.24), hairMat);
                hairTop.position.set(0, 0.13, -0.01);
                headGroup.add(hairTop);
                const spike = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.09, 4), hairMat);
                spike.position.set(0, 0.20, -0.03);
                headGroup.add(spike);
            } else if (look.hairStyle === 'braids') {
                const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.1, 0.24), hairMat);
                hairTop.position.set(0, 0.13, 0.01);
                headGroup.add(hairTop);
                const braidL = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.02, 0.26, 6), hairMat);
                braidL.position.set(-0.12, -0.05, -0.04);
                headGroup.add(braidL);
                const braidR = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.02, 0.26, 6), hairMat);
                braidR.position.set(0.12, -0.05, -0.04);
                headGroup.add(braidR);
            } else if (look.hairStyle === 'ponytail') {
                const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.1, 0.24), hairMat);
                hairTop.position.set(0, 0.13, 0.01);
                headGroup.add(hairTop);
                const ponytail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.26, 0.1), hairMat);
                ponytail.position.set(0, 0.03, 0.16);
                ponytail.rotation.x = 0.3;
                headGroup.add(ponytail);
            } else {
                const hairMale = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.09, 0.24), hairMat);
                hairMale.position.set(0, 0.13, -0.02);
                headGroup.add(hairMale);
            }

            // Cánh tay
            const armLGroup = new THREE.Group();
            armLGroup.position.set(-0.24, 0.42, 0);
            const armMeshL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.42, 0.1), uniformWhiteMat);
            armMeshL.position.y = -0.18;
            armLGroup.add(armMeshL);
            torsoGroup.add(armLGroup);

            const armRGroup = new THREE.Group();
            armRGroup.position.set(0.24, 0.42, 0);
            const armMeshR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.42, 0.1), uniformWhiteMat);
            armMeshR.position.y = -0.18;
            armRGroup.add(armMeshR);
            torsoGroup.add(armRGroup);

            // Điện thoại phát sáng dưới gầm bàn (bật khi posture === 'using_phone')
            const phoneMesh = new THREE.Mesh(
                new THREE.BoxGeometry(0.1, 0.015, 0.16),
                new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
            );
            phoneMesh.position.set(0, 0.65, -0.18);
            phoneMesh.visible = false;
            group.add(phoneMesh);

            // Chân ngồi ghế
            const legsSeatedGroup = new THREE.Group();
            const thighL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.38), darkNavyMat);
            thighL.position.set(-0.11, 0.46, -0.12);
            thighL.castShadow = true;
            legsSeatedGroup.add(thighL);

            const thighR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.38), darkNavyMat);
            thighR.position.set(0.11, 0.46, -0.12);
            thighR.castShadow = true;
            legsSeatedGroup.add(thighR);

            const calfL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 0.12), darkNavyMat);
            calfL.position.set(-0.11, 0.22, -0.28);
            calfL.castShadow = true;
            legsSeatedGroup.add(calfL);

            const calfR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 0.12), darkNavyMat);
            calfR.position.set(0.11, 0.22, -0.28);
            calfR.castShadow = true;
            legsSeatedGroup.add(calfR);

            const shoeS1 = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.08, 0.22), shoeMat);
            shoeS1.position.set(-0.11, 0.04, -0.32);
            legsSeatedGroup.add(shoeS1);

            const shoeS2 = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.08, 0.22), shoeMat);
            shoeS2.position.set(0.11, 0.04, -0.32);
            legsSeatedGroup.add(shoeS2);
            group.add(legsSeatedGroup);

            // Chân đứng (cho tư thế standing_restless)
            const legsStandingGroup = new THREE.Group();
            legsStandingGroup.visible = false;
            const stLegL = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.52, 0.13), darkNavyMat);
            stLegL.position.set(-0.11, 0.26, 0);
            legsStandingGroup.add(stLegL);
            const stLegR = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.52, 0.13), darkNavyMat);
            stLegR.position.set(0.11, 0.26, 0);
            legsStandingGroup.add(stLegR);
            group.add(legsStandingGroup);

            // Bảng tên 3D nổi (KHÔNG hiển thị hồ sơ ẩn)
            const nametag = this.createNameplate(
                `${config.avatar || '🎓'} ${config.name}`.trim(),
                config.badgeText || 'Học sinh AI',
                config.color || '#38bdf8'
            );
            nametag.position.y = 1.62;
            group.add(nametag);

            // Bong bóng lời thoại 3D nổi phía trên bảng tên
            const bubbleMat = new THREE.SpriteMaterial({
                transparent: true,
                depthTest: false
            });
            const speechBubble = new THREE.Sprite(bubbleMat);
            speechBubble.position.set(0, 2.25, 0);
            speechBubble.scale.set(2.35, 0.88, 1.0);
            speechBubble.visible = false;
            group.add(speechBubble);

            const initialLine = config.initialLine || config.quote || '';

            const charObj = {
                mesh: group,
                basePos: basePos,
                torsoGroup: torsoGroup,
                armR: armRGroup,
                armL: armLGroup,
                head: headGroup,
                phoneMesh: phoneMesh,
                legsSeatedGroup: legsSeatedGroup,
                legsStandingGroup: legsStandingGroup,
                nametag: nametag,
                badgeText: config.badgeText || 'Học sinh AI',
                speechBubble: speechBubble,
                speechBubbleExpiresAt: 0,
                mouthMesh: mouthMesh,
                isSpeaking: false,
                speakingUntil: 0,
                type: 'student',
                id: config.id,
                name: config.name,
                avatar: config.avatar || '🎓',
                color: config.color || '#38bdf8',
                gender: config.gender || 'female',
                posture: config.initialPosture || 'attentive',
                currentLine: initialLine,
                voicePitch: config.voicePitch || 1.0,
                voiceRate: config.voiceRate || 1.0,
                isFreeExplore: Boolean(config.isFreeExplore),
                lines: config.lines || [initialLine],
                animOffset: Math.random() * Math.PI * 2
            };

            this._applyBasePostureTransforms(charObj);

            const actionFunc = () => {
                if (window.soundEngine) window.soundEngine.playInteract();

                // Nếu đang ở chế độ tình huống mô phỏng: nói to lời thoại hiện tại + hiện bong bóng 3D
                if (!charObj.isFreeExplore && window.ScenarioSystem && window.ScenarioSystem.activeScenario) {
                    const line = charObj.currentLine || initialLine;
                    this.showSpeechBubble(charObj.id, line, 6500);
                    if (window.SpeechEngine) {
                        window.SpeechEngine.speak(line, {
                            speaker: charObj.name,
                            gender: charObj.gender,
                            isStudent: true,
                            forceLang: 'vi-VN',
                            pitch: charObj.voicePitch,
                            rate: charObj.voiceRate
                        });
                    }
                    if (window.showInteractionMessage) {
                        window.showInteractionMessage(`${charObj.avatar} ${charObj.name}: "${line}"`);
                    }
                    return;
                }

                // Chế độ tự do: phát âm & mở hội thoại giới thiệu
                if (window.SpeechEngine) {
                    window.SpeechEngine.speak(charObj.currentLine || config.quote, {
                        speaker: charObj.name,
                        gender: charObj.gender,
                        isStudent: true,
                        forceLang: 'vi-VN',
                        pitch: charObj.voicePitch,
                        rate: charObj.voiceRate
                    });
                }
                this.showSpeechBubble(charObj.id, charObj.currentLine || config.quote, 5500);
                CharacterManager.showDialogueModal({
                    name: charObj.name,
                    role: config.badgeText || 'Học sinh AI',
                    avatar: charObj.avatar,
                    lines: charObj.lines,
                    type: 'student'
                });
            };

            group.userData = {
                interactable: true,
                name: `${charObj.avatar} ${charObj.name} — Nghe lời thoại`,
                action: actionFunc
            };

            group.traverse(child => {
                if (child.isMesh) {
                    child.userData = group.userData;
                    this.interactables.push(child);
                }
            });

            this.interactables.push(group);
            this.roomGroup.add(group);

            return charObj;
        },

        // ================= BIỂN TÊN 3D NỔI =================
        createNameplate: function (name, role, accentColor) {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 160;
            const ctx = canvas.getContext('2d');

            const drawRect = () => {
                if (window.TextureGenerator && window.TextureGenerator.drawRoundedRectPath) {
                    window.TextureGenerator.drawRoundedRectPath(ctx, 10, 10, 492, 140, 24);
                } else {
                    ctx.beginPath();
                    ctx.rect(10, 10, 492, 140);
                    ctx.closePath();
                }
            };

            drawRect();
            ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
            ctx.fill();

            drawRect();
            ctx.strokeStyle = accentColor;
            ctx.lineWidth = 6;
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 34px "Segoe UI", Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(name, 256, 68);

            ctx.fillStyle = accentColor;
            ctx.font = 'bold 24px "Segoe UI", Arial, sans-serif';
            ctx.fillText(role, 256, 118);

            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                depthTest: true
            });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(1.4, 0.44, 1.0);
            return sprite;
        },

        // ================= HOẠT HỌA NHÂN VẬT THỜI GIAN THỰC =================
        update: function (delta, elapsedTime) {
            // 1. Giáo viên hướng dẫn (khi hiển thị)
            if (this.teacher && this.teacher.mesh.visible) {
                const t = elapsedTime * 2;
                this.teacher.head.rotation.y = Math.sin(t * 0.5) * 0.15;
                this.teacher.head.rotation.x = Math.sin(t * 1.2) * 0.05;
                this.teacher.armR.rotation.x = -Math.PI / 4 + Math.sin(t) * 0.12;
                this.teacher.armR.rotation.z = -Math.PI / 8 + Math.cos(t * 0.7) * 0.08;
                this.teacher.mesh.position.x = Math.sin(elapsedTime * 0.3) * 0.6;
            }

            const now = performance.now();

            // 2. Học sinh AI biểu cảm theo từng tư thế (posture)
            this.characters.forEach(char => {
                if (char.type !== 'student') return;

                const ct = elapsedTime * 2.5 + char.animOffset;

                // Hết giờ hiển thị bong bóng 3D
                if (char.speechBubble && char.speechBubble.visible && char.speechBubbleExpiresAt > 0 && now > char.speechBubbleExpiresAt) {
                    char.speechBubble.visible = false;
                }

                // Học sinh đang phát biểu trực tiếp: đứng nhấc người lên, mấp máy miệng, gật đầu sinh động
                if (char.isSpeaking && (char.speakingUntil === 0 || now < char.speakingUntil)) {
                    char.mesh.position.y = char.basePos.y + 0.14 + Math.sin(ct * 3.5) * 0.02;
                    char.head.rotation.x = Math.sin(ct * 6.0) * 0.1;
                    char.head.rotation.y = Math.sin(ct * 2.8) * 0.14;
                    if (char.mouthMesh) {
                        char.mouthMesh.scale.y = 1.0 + Math.abs(Math.sin(ct * 12.0)) * 3.6;
                    }
                    char.armR.rotation.x = -Math.PI / 3.2 + Math.sin(ct * 4.5) * 0.2;
                    return;
                } else if (char.mouthMesh && char.mouthMesh.scale.y > 1.0) {
                    char.mouthMesh.scale.y = 1.0;
                }

                switch (char.posture) {
                    case 'standing_restless':
                        char.mesh.position.x = char.basePos.x - 0.22 + Math.sin(ct * 1.6) * 0.12;
                        char.mesh.position.y = 0.22 + Math.abs(Math.sin(ct * 3.0)) * 0.03;
                        char.head.rotation.y = Math.sin(ct * 1.4) * 0.3;
                        break;

                    case 'raising_hand':
                        char.mesh.position.y = char.basePos.y + Math.sin(ct * 1.2) * 0.015;
                        char.armR.rotation.z = -0.15 + Math.sin(ct * 2.6) * 0.1;
                        char.head.rotation.y = Math.sin(ct * 0.7) * 0.12;
                        break;

                    case 'writing':
                        char.head.rotation.x = 0.35 + Math.sin(ct * 2.0) * 0.04;
                        char.armR.rotation.y = 0.25 + Math.sin(ct * 3.2) * 0.12;
                        break;

                    case 'using_phone':
                        char.head.rotation.x = 0.48 + Math.sin(ct * 0.9) * 0.06;
                        char.head.rotation.y = Math.sin(ct * 0.6) * 0.18;
                        break;

                    case 'peeking_laugh':
                        char.mesh.position.y = char.basePos.y + Math.abs(Math.sin(ct * 2.4)) * 0.025;
                        char.head.rotation.y = 0.35 + Math.sin(ct * 2.2) * 0.1;
                        char.head.rotation.z = Math.sin(ct * 2.8) * 0.06;
                        break;

                    case 'looking_window':
                        char.head.rotation.y = -0.85 + Math.sin(ct * 0.5) * 0.08;
                        break;

                    case 'head_down':
                        char.head.rotation.x = 0.52 + Math.sin(ct * 0.5) * 0.03;
                        break;

                    case 'pouting':
                        char.head.rotation.y = -0.35 + Math.sin(ct * 0.8) * 0.06;
                        break;

                    case 'happy_task':
                        char.mesh.position.y = char.basePos.y + Math.abs(Math.sin(ct * 2.0)) * 0.03;
                        char.armR.rotation.z = -0.25 + Math.sin(ct * 2.2) * 0.1;
                        char.head.rotation.y = Math.sin(ct * 1.0) * 0.16;
                        break;

                    case 'speaking_pair':
                        char.head.rotation.y = 0.25 + Math.sin(ct * 1.5) * 0.15;
                        char.armR.rotation.x = Math.PI / 2.4 + Math.sin(ct * 2.2) * 0.14;
                        break;

                    case 'attentive':
                    default:
                        char.mesh.position.y = char.basePos.y + Math.sin(ct * 0.8) * 0.008;
                        char.head.rotation.x = Math.sin(ct * 0.6) * 0.05;
                        char.head.rotation.y = Math.cos(ct * 0.35) * 0.08;
                        break;
                }
            });
        },

        // ================= HỘP THOẠI TỰ DO (KHI CHƯA CHỌN TÌNH HUỐNG) =================
        showDialogueModal: function (data) {
            if (window.soundEngine) soundEngine.playInteract();

            let modal = document.getElementById('dialogue-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'dialogue-modal';
                modal.className = 'modal-backdrop';
                modal.innerHTML = `
                    <div class="modal-content" style="max-width: 600px; border: 2px solid #38bdf8; background: rgba(15, 23, 42, 0.96);">
                        <div class="modal-header">
                            <h2 style="display:flex; align-items:center; gap:12px;">
                                <span id="dlg-avatar" style="font-size:36px;">👨‍🏫</span>
                                <div>
                                    <div id="dlg-name" style="font-size:18px; color:#f8fafc; font-weight:800;">Tên</div>
                                    <div id="dlg-role" style="font-size:12px; color:#38bdf8; font-weight:600;">Vai trò</div>
                                </div>
                            </h2>
                            <button id="btn-close-dlg" class="btn-close">&times;</button>
                        </div>
                        <div id="dlg-body" style="font-size:16px; line-height:1.8; color:#fde047; min-height:80px; padding:14px 0; font-style:italic;">
                            Nội dung lời thoại...
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px; border-top:1px solid rgba(255,255,255,0.1); padding-top:14px;">
                            <button id="btn-speak-again" class="hud-btn" style="background:#0284c7; color:#fff;">
                                <span>🔊 Phát âm lại</span>
                            </button>
                            <div style="display:flex; gap:10px;">
                                <button id="btn-next-dlg-line" class="hud-btn" style="background:#2563eb; color:#fff;">
                                    <span>💬 Nói tiếp ➔</span>
                                </button>
                                <button id="btn-dismiss-dlg" class="hud-btn">
                                    <span>Đóng</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);

                document.getElementById('btn-close-dlg').addEventListener('click', () => {
                    modal.classList.remove('show');
                });
                document.getElementById('btn-dismiss-dlg').addEventListener('click', () => {
                    modal.classList.remove('show');
                });
            }

            document.getElementById('dlg-avatar').textContent = data.avatar;
            document.getElementById('dlg-name').textContent = data.name;
            document.getElementById('dlg-role').textContent = data.role;

            let lineIndex = 0;
            const dlgBody = document.getElementById('dlg-body');
            const btnNext = document.getElementById('btn-next-dlg-line');
            const btnSpeak = document.getElementById('btn-speak-again');
            const lines = (Array.isArray(data.lines) && data.lines.length > 0) ? data.lines : ['Xin chào thầy/cô!'];

            const showLine = () => {
                const currentText = lines[lineIndex];
                dlgBody.innerHTML = `<p>" ${currentText} "</p>`;
                if (window.SpeechEngine) {
                    window.SpeechEngine.speak(currentText, {
                        speaker: data.name,
                        gender: data.gender || 'female',
                        isStudent: data.type !== 'teacher',
                        forceLang: 'vi-VN'
                    });
                }
                btnNext.textContent = (lineIndex >= lines.length - 1) ? '🔄 Bắt đầu lại' : '💬 Nói tiếp ➔';
            };

            btnSpeak.onclick = () => {
                if (window.SpeechEngine) {
                    window.SpeechEngine.speak(lines[lineIndex], {
                        speaker: data.name,
                        gender: data.gender || 'female',
                        isStudent: data.type !== 'teacher',
                        forceLang: 'vi-VN'
                    });
                }
            };

            btnNext.onclick = () => {
                if (window.soundEngine) soundEngine.playSlideChange();
                lineIndex = (lineIndex + 1) % lines.length;
                showLine();
            };

            showLine();

            if (document.pointerLockElement && document.exitPointerLock) {
                document.exitPointerLock();
            }
            modal.classList.add('show');
        }
    };

    window.CharacterManager = CharacterManager;
})();
