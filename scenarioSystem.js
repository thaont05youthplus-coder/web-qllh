// scenarioSystem.js - ULIS TeachLab: Hệ thống Mô phỏng Sư phạm Bản 2
// Hai loại tình huống nghiệp vụ (Giảng dạy & Chủ nhiệm), Ba nguyên tắc xử lý (P1, P2, P3), Nhận xét KHÔNG CHẤM ĐIỂM
(function () {
    'use strict';

    const PROGRESS_STORAGE_KEY = 'qllh_3d_group_progress_v2';

    function normalizeText(str) {
        return String(str || '')
            .toLowerCase()
            .replace(/[.,!?;:"“”'’()\-—…]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function stripVietnameseAccents(str) {
        return normalizeText(str)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd');
    }

    function matchesKeyword(rawText, keyword) {
        const normText = normalizeText(rawText);
        const normKw = normalizeText(keyword);
        if (!normKw) return false;
        if (normText.includes(normKw)) return true;
        if (normKw.length >= 4) {
            return stripVietnameseAccents(normText).includes(stripVietnameseAccents(normKw));
        }
        return false;
    }

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatClock(totalSeconds) {
        const sec = Math.max(0, Math.floor(totalSeconds || 0));
        const m = String(Math.floor(sec / 60)).padStart(2, '0');
        const s = String(sec % 60).padStart(2, '0');
        return `${m}:${s}`;
    }

    function parseDurationSec(durationText) {
        const match = String(durationText || '').match(/(\d+)/);
        return match ? parseInt(match[1], 10) * 60 : 600;
    }

    function renderAvatarSvg(persona, sizePx) {
        const size = sizePx || 78;
        const bg = (persona && persona.bgTint) || '#f1f5f9';
        const skin = (persona && persona.avatarBg) || '#f3caa6';
        const shirt = (persona && persona.shirtColor) || '#334155';
        const isFemale = !persona || persona.hairStyle === 'female';
        const hairColor = '#1e293b';
        const backHair = isFemale
            ? `<circle cx="48" cy="24" r="17" fill="${hairColor}"/><path d="M27 36 C25 56, 30 62, 34 62 L62 62 C66 62, 71 56, 69 36 Z" fill="${hairColor}"/>`
            : `<path d="M27 34 Q48 12 69 34 Z" fill="${hairColor}"/>`;
        const glasses = (persona && persona.hasGlasses)
            ? `<rect x="33" y="36" width="12" height="8" rx="2" fill="none" stroke="#334155" stroke-width="1.8"/><rect x="51" y="36" width="12" height="8" rx="2" fill="none" stroke="#334155" stroke-width="1.8"/><line x1="45" y1="39" x2="51" y2="39" stroke="#334155" stroke-width="1.8"/>`
            : '';
        return `
            <svg width="${size}" height="${size}" viewBox="0 0 96 96" style="border-radius:14px; background:${bg}; display:block;">
                <rect x="2" y="2" width="92" height="92" rx="14" fill="${bg}" stroke="#e2e8f0" stroke-width="2"/>
                ${backHair}
                <path d="M20 92 C23 66, 73 66, 76 92 Z" fill="${shirt}"/>
                <rect x="42" y="52" width="12" height="14" rx="4" fill="${skin}"/>
                <circle cx="48" cy="40" r="16" fill="${skin}"/>
                <circle cx="42" cy="39" r="1.8" fill="#1e293b"/>
                <circle cx="54" cy="39" r="1.8" fill="#1e293b"/>
                <path d="M43 46 Q48 50 53 46" fill="none" stroke="#9a3412" stroke-width="1.8" stroke-linecap="round"/>
                ${glasses}
            </svg>
        `;
    }

    function renderTeacherPortrait(persona, sizePx) {
        const size = sizePx || 96;
        const bg = (persona && persona.bgTint) || '#f1f5f9';
        const fallbackSvg = renderAvatarSvg(persona, size);
        if (!persona || !persona.portraitUrl) {
            return `<div class="mp-portrait-wrap" style="width:${size}px; height:${size}px; background:${bg};">${fallbackSvg}</div>`;
        }
        return `
            <div class="mp-portrait-wrap" style="width:${size}px; height:${size}px; background:${bg};">
                <img class="mp-portrait-img" src="${escapeHtml(persona.portraitUrl)}" alt="${escapeHtml(persona.name || 'Giáo viên')}"
                     loading="lazy" onerror="this.style.display='none'; if(this.nextElementSibling){ this.nextElementSibling.style.display='block'; }">
                <div style="display:none; width:100%; height:100%;">${fallbackSvg}</div>
            </div>
        `;
    }

    const ScenarioSystem = {
        scenarios: [],
        categories: {},
        principles: {},
        legalDocs: {},
        mbtiGroups: [],
        teacherPersonas: [],
        voiceModes: [],
        gradeLevels: [],
        stepsMeta: [],
        progressHistory: [],

        // Luồng 14 bước & 4 Giai đoạn
        // 1: Thử micro | 2: Nhân vật GV | 3: Chọn tình huống (Mockup Trang 2)
        // 5: Vào phòng mô phỏng (Trang 3/10) | 6: Khởi động | 7: Tình huống phát sinh (Trang 4/11)
        // 8: Tạm dừng quan sát (Trang 5) | 9: Xử lý tình huống (Trang 6/11/12) | 10: Hết giờ/Kết thúc
        // 11: Phản tư (Trang 14) | 12: Nhận xét tổng quan (Trang 15) | 13: Giải pháp mẫu (Trang 17) | 14: Hồ sơ tiến bộ (Trang 18)
        flowStep: 1,
        maxReachedStep: 1,
        wizardClosedForRoam: false,

        // Bước 1: Thử micro
        step1Verified: false,
        step1HeardText: '',

        // Bước 2: Nhân vật & giọng giáo viên
        selectedTeacherGender: 'female',
        selectedMbtiGroup: 'all',
        selectedTeacherId: 'intj_minh_thu',
        teacherDisplayName: 'Cô Minh Thư',
        teacherNameEdited: false,
        selectedVoiceId: 'female_young',

        // Bước 3: Thiết lập tình huống (Trang 2)
        selectedCategory: 'teaching', // 'teaching' | 'homeroom'
        selectedActivityId: 'act_practice',
        selectedScenarioId: 1,
        selectedMode: 'guided', // 'guided' (Luyện tập) | 'realistic' (Thử thách)
        selectedGradeId: 'thcs',
        selectedGradeNumber: 7,

        // Trạng thái trong lớp học 3D (Bước 6–10)
        activeScenario: null,
        sessionElapsedSec: 0,
        sessionDurationSec: 600,
        isPaused: false,
        hintBannerText: '',
        endReasonText: 'Mọi bạn đã có việc · Đã hẹn trao đổi với gia đình',
        warmupGreetingText: '',

        // Trạng thái mức căng thẳng ẩn & tiến trình (Trang 4, 9, 11, 13, 15)
        tensionLevel: 'Đang tăng', // 'Lớn' | 'Đang tăng' | 'Nhỏ' | 'Đã lắng'
        tensionTimeline: [], // { time: '08:42', level: 'Đang tăng', note: '...' }

        // Bảng kết nối 3 bên (Trang 12)
        connectionModalOpen: false,
        connectionTab: 'parents', // 'parents' | 'counseling' | 'chidoi'
        connectionTargetChannel: 'private_msg', // 'private_msg' | 'group_reply' | 'phone' | 'meet'
        connectionDraftText: '',
        connectionSubmitted: false,
        parentToastVisible: false,

        // Nhắc nhở tức thời (Trang 8)
        instantWarning: null, // { text, lawRefs, principle, canRetry }

        // Bước 8: Tạm dừng để quan sát (Trang 5)
        step8Answer: '',
        step8PrinciplesSelected: ['P2', 'P1'],
        step8HintLevel: 1,

        // Dòng thời gian khoảnh khắc trong lớp học
        transcriptLog: [],
        userMomentsTimeline: [], // { timeStr, actionTitle, role, text, isBad, principle, lawRef }
        studentParticipation: {},
        draftUtterance: '',
        showManualTextInput: false,
        step3Resolved: false,

        // Phản tư & Nhận xét không chấm điểm (Trang 14–18)
        selfEvalSelectedMoment: 0,
        selfEvalPrinciples: { P1: true, P2: true, P3: true },
        selfEvalEvidence: {
            P2: 'Tạm dừng phân công, chuyển sang đặt tiêu chí chung',
            P1: 'Nói riêng với Khoa, sau đó với Minh',
            P3: 'Nhắn riêng, hẹn gọi điện cho mẹ Khoa'
        },
        selfEvalResolutionLevel: 'resolved_monitoring', // 'still_large' | 'reduced' | 'resolved_monitoring'
        selfEvalRetryThought: 'Mình sẽ không nhắc Minh trước lớp mà tạm dừng phân công trước, nói riêng với Minh sau.',
        reviewSubTab: 'overview', // 'overview' (Trang 15) | 'actions' (Trang 16) | 'model_solution' (Trang 17) | 'progress' (Trang 18)
        step13RetryText: '',
        step13RetrySuccess: false,

        // Runtime controls
        _clockTimer: null,
        _spaceHolding: false,
        _sttTarget: 'main', // 'main' | 'step1' | 'step8' | 'step13'

        get selectedTeacher() {
            const p = this.teacherPersonas.find(t =>
                t.id === this.selectedTeacherId || (t.aliasIds && t.aliasIds.includes(this.selectedTeacherId))
            ) || this.teacherPersonas[0] || {
                id: 'intj_minh_thu', mbti: 'INTJ', mbtiGroup: 'NT', name: 'Cô Minh Thư', displayName: 'Cô Minh Thư',
                pronoun: 'Cô', gender: 'female', age: 35, colorHex: '#5B3F8C', bgTint: '#F3EFFA',
                avatar: '👩‍🏫', outfitDesc: 'Blazer tím than, tóc búi gọn', suitColor: 0x5B3F8C, tieColor: 0xFFFFFF,
                hasGlasses: true, hairStyle: 'female', voicePitch: 1.10, voiceRate: 0.99, defaultVoiceId: 'female_young'
            };
            const voice = this.voiceModes.find(v => v.id === this.selectedVoiceId) || this.voiceModes[0] || {};
            return {
                ...p,
                displayName: this.teacherDisplayName || p.displayName || p.name,
                voicePitch: voice.pitch || p.voicePitch || 1.0,
                voiceRate: voice.rate || p.voiceRate || 1.0,
                muteTeacherTts: Boolean(voice.muteTeacherTts)
            };
        },

        init: function () {
            this.scenarios = Array.isArray(window.SCENARIOS_5) ? window.SCENARIOS_5 : [];
            this.categories = window.SCENARIO_CATEGORIES || {};
            this.principles = window.THREE_PRINCIPLES || {};
            this.legalDocs = window.LEGAL_BASIS_DOCS || {};
            this.mbtiGroups = Array.isArray(window.MBTI_GROUPS) ? window.MBTI_GROUPS : [];
            this.teacherPersonas = Array.isArray(window.TEACHER_PERSONAS) ? window.TEACHER_PERSONAS : [];
            this.voiceModes = Array.isArray(window.TEACHER_VOICE_MODES) ? window.TEACHER_VOICE_MODES : [];
            this.gradeLevels = Array.isArray(window.GRADE_LEVELS) ? window.GRADE_LEVELS : [];
            this.stepsMeta = Array.isArray(window.MOCKUP_14_STEPS) ? window.MOCKUP_14_STEPS : [];
            this.progressHistory = Array.isArray(window.PROGRESS_HISTORY_SAMPLE) ? window.PROGRESS_HISTORY_SAMPLE : [];

            this.activeScenario = this.scenarios.find(s => s.id === this.selectedScenarioId) || this.scenarios[0] || null;
            this._bindSpeechEngineCallbacks();
            this._ensureContainers();
            if (window.CharacterManager && window.CharacterManager.setTeacherPersona) {
                window.CharacterManager.setTeacherPersona(this.selectedTeacher);
            }
            this.goToFlowStep(1);
        },

        _ensureContainers: function () {
            if (!document.getElementById('flow-modal')) {
                const modal = document.createElement('div');
                modal.id = 'flow-modal';
                modal.className = 'modal-backdrop';
                document.body.appendChild(modal);
            }
            if (!document.getElementById('sim-panel')) {
                const panel = document.createElement('aside');
                panel.id = 'sim-panel';
                document.body.appendChild(panel);
            }
        },

        _bindSpeechEngineCallbacks: function () {
            if (!window.SpeechEngine) return;
            window.SpeechEngine.onSttResult = (text, isFinal) => {
                if (this._sttTarget === 'step1') {
                    this.step1HeardText = text;
                    if (isFinal && text.trim().length > 3) {
                        this.step1Verified = true;
                    }
                    this.renderAll();
                    return;
                }
                if (this._sttTarget === 'step8') {
                    this.step8Answer = text;
                    const el = document.getElementById('mp-step8-input');
                    if (el) el.value = text;
                    return;
                }
                if (this._sttTarget === 'step13') {
                    this.step13RetryText = text;
                    if (isFinal) {
                        this.step13RetrySuccess = true;
                    }
                    this.renderAll();
                    return;
                }
                // STT chính trong lớp học
                this.draftUtterance = text;
                const liveEl = document.getElementById('c3d-voice-live-text');
                if (liveEl) liveEl.textContent = text || 'Đang lắng nghe...';
                if (isFinal && text.trim().length > 2) {
                    this.submitTeacherUtterance(text);
                }
            };
            window.SpeechEngine.onSttStateChange = (listening) => {
                const micBtn = document.getElementById('c3d-mic-btn');
                if (micBtn) {
                    micBtn.classList.toggle('listening', listening);
                }
                this.renderInClassHud();
            };
        },

        // ================= ĐIỀU HƯỚNG BƯỚC (1–14) =================
        goToFlowStep: function (step) {
            this.flowStep = Math.max(1, Math.min(14, step));
            this.maxReachedStep = Math.max(this.maxReachedStep, this.flowStep);

            // Xử lý camera Three.js theo bước
            if (window.ClassroomGame && window.ClassroomGame.setFlowPhase) {
                if (this.flowStep <= 4) {
                    window.ClassroomGame.setFlowPhase('setup');
                } else if (this.flowStep === 5) {
                    window.ClassroomGame.setFlowPhase('preview');
                } else if (this.flowStep >= 6 && this.flowStep <= 10) {
                    window.ClassroomGame.setFlowPhase('practice');
                } else {
                    window.ClassroomGame.setFlowPhase('feedback');
                }
            }

            if (this.flowStep === 6) {
                this._initInClassSession();
            } else if (this.flowStep === 7) {
                this._triggerIncident();
            }

            this.renderAll();
        },

        // ================= BƯỚC 1: THỬ MICRO =================
        toggleMic: function (target = 'main') {
            this._sttTarget = target;
            if (!window.SpeechEngine) return;
            if (window.SpeechEngine.isListening) {
                window.SpeechEngine.stopListening();
            } else {
                window.SpeechEngine.startListening();
            }
        },
        skipStep1: function () {
            this.step1Verified = true;
            this.goToFlowStep(2);
        },
        simulateStep1MicSuccess: function () {
            this.step1HeardText = 'Chào cả lớp, hôm nay chúng ta bắt đầu bài học nhé!';
            this.step1Verified = true;
            this.renderAll();
        },

        // ================= BƯỚC 2: CHỌN GIÁO VIÊN =================
        selectTeacherGender: function (gender) {
            this.selectedTeacherGender = gender;
            const valid = this.teacherPersonas.filter(t => t.gender === gender);
            if (valid.length > 0 && !valid.some(t => t.id === this.selectedTeacherId)) {
                this.selectTeacherId(valid[0].id);
            } else {
                this.renderAll();
            }
        },
        selectTeacherId: function (id) {
            this.selectedTeacherId = id;
            const p = this.teacherPersonas.find(t => t.id === id);
            if (p) {
                if (!this.teacherNameEdited) {
                    this.teacherDisplayName = p.displayName || p.name;
                }
                if (p.defaultVoiceId) {
                    this.selectedVoiceId = p.defaultVoiceId;
                }
                if (window.CharacterManager && window.CharacterManager.setTeacherPersona) {
                    window.CharacterManager.setTeacherPersona(this.selectedTeacher);
                }
            }
            this.renderAll();
        },
        selectVoiceId: function (vId) {
            this.selectedVoiceId = vId;
            this.renderAll();
        },
        setTeacherDisplayName: function (name) {
            this.teacherDisplayName = name.trim();
            this.teacherNameEdited = true;
        },
        previewTeacherVoice: function () {
            if (!window.SpeechEngine) return;
            const t = this.selectedTeacher;
            const sampleText = `Xin chào các em học sinh, thầy cô là ${t.displayName}. Chúng ta cùng bắt đầu buổi học nhé!`;
            window.SpeechEngine.speak(sampleText, {
                speaker: t.displayName,
                gender: t.gender,
                pitch: t.voicePitch,
                rate: t.voiceRate
            });
        },

        // ================= BƯỚC 3: THIẾT LẬP TÌNH HUỐNG (TRANG 2) =================
        selectCategory: function (catId) {
            this.selectedCategory = catId;
            if (catId === 'teaching') {
                this.selectedActivityId = 'act_practice';
                this.selectedScenarioId = 1;
            } else {
                this.selectedActivityId = 'act_experience';
                this.selectedScenarioId = 2;
            }
            this.activeScenario = this.scenarios.find(s => s.id === this.selectedScenarioId) || this.scenarios[0];
            this.renderAll();
        },
        selectActivity: function (actId) {
            this.selectedActivityId = actId;
            // Chọn kịch bản tương ứng nếu có
            if (actId === 'act_practice') {
                this.selectedScenarioId = 1;
            } else if (actId === 'act_experience') {
                this.selectedScenarioId = 2;
            } else if (actId === 'act_knowledge') {
                this.selectedScenarioId = 3;
            } else if (actId === 'act_homeroom') {
                this.selectedScenarioId = 4;
            } else if (actId === 'act_apply') {
                this.selectedScenarioId = 5;
            }
            this.activeScenario = this.scenarios.find(s => s.id === this.selectedScenarioId) || this.scenarios[0];
            this.renderAll();
        },
        selectScenarioInSetup: function (scId) {
            this.selectedScenarioId = scId;
            this.activeScenario = this.scenarios.find(s => s.id === scId) || this.scenarios[0];
            if (this.activeScenario) {
                this.selectedCategory = this.activeScenario.category || 'teaching';
                this.selectedActivityId = this.activeScenario.activityId || (this.selectedCategory === 'teaching' ? 'act_practice' : 'act_experience');
            }
            this.renderAll();
        },
        selectMode: function (mode) {
            this.selectedMode = mode;
            this.renderAll();
        },
        selectGradeNumber: function (num) {
            this.selectedGradeNumber = num;
            this.renderAll();
        },

        // ================= BƯỚC 5 -> 6 -> 7: VÀO LỚP & KÍCH HOẠT =================
        startScenarioFromStep5: function () {
            this.activeScenario = this.scenarios.find(s => s.id === this.selectedScenarioId) || this.scenarios[0];
            this.goToFlowStep(6);
        },

        _initInClassSession: function () {
            const sc = this.activeScenario;
            if (!sc) return;

            this.sessionElapsedSec = parseDurationSec(sc.phaseTimeStart || '08:40');
            this.sessionDurationSec = parseDurationSec(sc.phaseTimeEnd || '15:00');
            this.isPaused = false;
            this.tensionLevel = 'Đang tăng';
            this.tensionTimeline = [
                { time: formatClock(this.sessionElapsedSec), level: 'Đang tăng', note: 'Bắt đầu hoạt động' }
            ];
            this.instantWarning = null;
            this.parentToastVisible = false;
            this.connectionModalOpen = false;
            this.connectionSubmitted = false;
            this.step3Resolved = false;
            this.transcriptLog = [];
            this.userMomentsTimeline = [];
            this.studentParticipation = {};

            // Khởi tạo học sinh trong Three.js
            if (window.CharacterManager && window.CharacterManager.loadScenarioStudents) {
                window.CharacterManager.loadScenarioStudents(sc.students || []);
                window.CharacterManager.setStudentsAttentive();
            }

            // Đồng hồ thời gian thực trong lớp
            if (this._clockTimer) clearInterval(this._clockTimer);
            this._clockTimer = setInterval(() => {
                if (!this.isPaused && this.flowStep >= 6 && this.flowStep <= 9) {
                    this.sessionElapsedSec += 1;
                    const timerEl = document.getElementById('c3d-timer-val');
                    if (timerEl) {
                        timerEl.textContent = `${formatClock(this.sessionElapsedSec)} / ${formatClock(this.sessionDurationSec)}`;
                    }
                }
            }, 1000);

            // Mở đầu khởi động
            const warmup = sc.warmupGreeting || 'Các cặp bắt đầu làm Phiếu số 3 nhé, 10 phút.';
            this.transcriptLog.push({
                role: 'teacher',
                speaker: (this.selectedTeacher && this.selectedTeacher.displayName) || 'Bạn',
                timestampSec: this.sessionElapsedSec,
                text: warmup
            });
        },

        _triggerIncident: function () {
            const sc = this.activeScenario;
            if (!sc) return;

            this.sessionElapsedSec = parseDurationSec(sc.incidentTime || '08:42');
            this.tensionLevel = sc.incidentTension || 'Đang tăng';
            this.tensionTimeline.push({
                time: formatClock(this.sessionElapsedSec),
                level: this.tensionLevel,
                note: 'Tình huống phát sinh'
            });

            // Nếu kịch bản chủ nhiệm (Khoa), di chuyển Khoa ra bàn cuối
            if (sc.id === 2 && window.CharacterManager && window.CharacterManager.moveStudentDesk) {
                window.CharacterManager.moveStudentDesk('khoa', { row: 2, col: 0, seat: 0 });
                this.parentToastVisible = true;
            }

            // Kích hoạt các câu thoại mở màn của học sinh
            if (Array.isArray(sc.incidentDialogue)) {
                let delay = 300;
                sc.incidentDialogue.forEach((line, idx) => {
                    setTimeout(() => {
                        this.transcriptLog.push({
                            role: 'student',
                            speaker: line.speakerName,
                            studentId: line.speakerId,
                            timestampSec: this.sessionElapsedSec + (idx * 2),
                            text: line.text
                        });
                        this.studentParticipation[line.speakerId] = true;

                        if (window.CharacterManager) {
                            window.CharacterManager.setStudentPosture(line.speakerId, line.posture || 'attentive', line.text);
                            window.CharacterManager.showSpeechBubble(line.speakerId, line.text, 5500);
                            if (line.statusTag) {
                                window.CharacterManager.setStudentStatusTag(line.speakerId, line.statusTag);
                            }
                        }

                        // Phát TTS ElevenLabs
                        if (window.SpeechEngine && window.SpeechEngine.ttsEnabled) {
                            window.SpeechEngine.speak(line.text, {
                                speaker: line.speakerId,
                                isStudent: true,
                                gender: line.gender || 'male'
                            });
                        }
                        this.renderInClassHud();
                    }, delay);
                    delay += 3200;
                });
            }

            this.hintBannerText = sc.incidentBanner || 'Tình huống đã phát sinh! Hãy lựa chọn cách xử lý sư phạm.';
            this.renderInClassHud();
        },

        replayCurrentIncident: function () {
            const sc = this.activeScenario;
            if (!sc) return;
            if (Array.isArray(sc.incidentDialogue) && sc.incidentDialogue.length > 0) {
                const first = sc.incidentDialogue[0];
                if (window.SpeechEngine) {
                    window.SpeechEngine.speak(first.text, {
                        speaker: first.speakerId,
                        isStudent: true
                    });
                }
            }
        },

        togglePracticePause: function () {
            this.isPaused = !this.isPaused;
            if (window.ClassroomGame) {
                window.ClassroomGame.isPaused = this.isPaused;
            }
            if (window.SpeechEngine && this.isPaused) {
                window.SpeechEngine.stopSpeaking();
            }
            this.renderInClassHud();
        },

        advanceAfterStep7: function () {
            if (this.selectedMode === 'realistic') {
                this.goToFlowStep(9);
            } else {
                this.goToFlowStep(8);
            }
        },

        // ================= BƯỚC 8: TẠM DỪNG ĐỂ QUAN SÁT (TRANG 5) =================
        toggleStep8Principle: function (pId) {
            const idx = this.step8PrinciplesSelected.indexOf(pId);
            if (idx >= 0) {
                this.step8PrinciplesSelected.splice(idx, 1);
            } else {
                this.step8PrinciplesSelected.push(pId);
            }
            this.renderAll();
        },
        cycleStep8Hint: function () {
            this.step8HintLevel = this.step8HintLevel === 1 ? 2 : 1;
            this.renderAll();
        },
        submitStep8: function (rawText) {
            const sc = this.activeScenario;
            const inputEl = document.getElementById('mp-step8-input');
            const val = rawText !== undefined ? rawText : (inputEl ? inputEl.value : this.step8Answer);
            this.step8Answer = val || (sc ? sc.step8ObservationText : '');
            this.goToFlowStep(9);
        },

        // ================= BƯỚC 9: XỬ LÝ VỚI 4 NHÓM HÀNH ĐỘNG (TRANG 6, 7, 8, 11, 12) =================
        executeAction: function (actionType, actionMeta = {}) {
            const sc = this.activeScenario;
            if (!sc) return;

            const timeStr = formatClock(this.sessionElapsedSec);

            if (actionType === 'speak_all') {
                // Nói với cả lớp (P2)
                const text = sc.id === 2
                    ? 'Cả lớp dừng phân công một chút, mình cùng đặt tiêu chí trước nhé: mỗi bạn một việc, theo điểm mạnh.'
                    : 'Cả lớp tiếp tục làm phiếu. Chuyện của cặp nào, cô sẽ trao đổi riêng với cặp đó.';
                this.submitTeacherUtterance(text, {
                    actionName: 'Lời nói với cả lớp',
                    principle: 'P2',
                    lawRef: 'Đ9 k2 điểm d · TT 30 Đ12 k1 e'
                });
            } else if (actionType === 'speak_private') {
                // Nói riêng một em (P1·P2)
                const text = sc.id === 2
                    ? 'Cô muốn nghe em kể, em thích làm phần nào của gian hàng?'
                    : 'Cô nghe Lan trước, rồi nghe Nam. Lan đã làm những câu nào? Nam, em kể cô nghe em dùng AI thế nào?';
                this.submitTeacherUtterance(text, {
                    actionName: 'Nói riêng từng em',
                    principle: 'P1',
                    lawRef: 'Đ9 k2 điểm e · TT 30 Đ12 k1 đ'
                });
            } else if (actionType === 'nonverbal_stop') {
                // Nhìn / ra hiệu dừng (P2)
                const logText = sc.id === 2 ? 'Nhìn và ra hiệu dừng với Minh · Mời cả lớp chú ý' : 'Ra hiệu dừng với Huy · Giao nhiệm vụ chuẩn bị báo cáo';
                this.transcriptLog.push({
                    role: 'action',
                    speaker: 'Hành động',
                    timestampSec: this.sessionElapsedSec,
                    text: logText
                });
                this.userMomentsTimeline.push({
                    timeStr: timeStr,
                    actionTitle: 'Phi ngôn ngữ: Ra hiệu dừng',
                    quote: logText,
                    isBad: false,
                    principle: 'P2',
                    lawRef: 'Luật NG Đ9 k2 e'
                });
                this.tensionLevel = 'Đang giảm';
                this.tensionTimeline.push({ time: timeStr, level: 'Đang giảm', note: 'Ra hiệu dừng hạ nhiệt' });

                if (window.CharacterManager) {
                    if (sc.id === 1) {
                        window.CharacterManager.setStudentPosture('huy', 'writing', 'Dạ, em chuẩn bị câu 1 ạ!');
                        window.CharacterManager.setStudentStatusTag('huy', 'chuẩn bị báo cáo', '#10b981');
                    } else {
                        window.CharacterManager.setStudentPosture('minh', 'attentive', 'Vâng ạ.');
                    }
                }
                this.renderInClassHud();
            } else if (actionType === 'nonverbal_sit') {
                // Mời ngồi xuống (P2)
                this.transcriptLog.push({
                    role: 'action',
                    speaker: 'Hành động',
                    timestampSec: this.sessionElapsedSec,
                    text: 'Mời học sinh ngồi xuống bình tĩnh trao đổi'
                });
                this.tensionLevel = 'Đang giảm';
                this.renderInClassHud();
            } else if (actionType === 'nonverbal_wait') {
                // Im lặng chờ (P2)
                this.transcriptLog.push({
                    role: 'action',
                    speaker: 'Hành động',
                    timestampSec: this.sessionElapsedSec,
                    text: 'Giáo viên im lặng chờ cả lớp trật tự'
                });
                this.renderInClassHud();
            } else if (actionType === 'org_pause') {
                // Tạm dừng hoạt động 2 phút (P2)
                const promptText = sc.id === 2
                    ? 'Cả lớp dừng phân công một chút, mình cùng đặt tiêu chí trước nhé.'
                    : 'Cả lớp tạm dừng làm phiếu 2 phút, ngồi nghe cô phổ biến quy tắc dùng AI.';
                this.submitTeacherUtterance(promptText, {
                    actionName: 'Tạm dừng hoạt động + Lời nói',
                    principle: 'P2',
                    lawRef: 'NQ 29 · TT 30 Đ12 k1 e'
                });
            } else if (actionType === 'org_split') {
                // Chia lại nhóm / tách cặp (P1)
                this.transcriptLog.push({
                    role: 'action',
                    speaker: 'Hành động',
                    timestampSec: this.sessionElapsedSec,
                    text: 'Tạm tách cặp / Phân chia vai trò rõ ràng cho từng bạn'
                });
                this.tensionLevel = 'Đã lắng';
                this.step3Resolved = true;
                this.renderInClassHud();
            } else if (actionType === 'org_assign') {
                // Giao nhiệm vụ (P2)
                const text = sc.id === 2 ? 'Khoa, em có muốn giúp lớp vẽ biển hiệu gian hàng không? Cô thấy em vẽ rất đẹp.' : 'Huy, em chuẩn bị báo cáo câu 1 cho cả lớp giúp cô nhé.';
                this.submitTeacherUtterance(text, {
                    actionName: 'Giao nhiệm vụ cụ thể',
                    principle: 'P2',
                    lawRef: 'TT 30 Đ12 k1 điểm e'
                });
            } else if (actionType === 'org_rules') {
                // Chỉ quy định về AI / Tiêu chí (P1)
                const text = sc.id === 2 ? 'Quy ước chung của lớp mình: Mỗi bạn một việc, làm theo điểm mạnh, không ai bị bỏ lại!' : 'Quy định của lớp mình: Được dùng AI để tra cứu, nhưng phải tự viết câu trả lời và ghi chú rõ ràng.';
                this.submitTeacherUtterance(text, {
                    actionName: 'Đưa quy ước / tiêu chí lên bảng',
                    principle: 'P1',
                    lawRef: 'TT 02/2025 · QĐ 2422/2026'
                });
            } else if (actionType === 'conn_meet') {
                // Hẹn gặp riêng sau giờ (P1)
                this.transcriptLog.push({
                    role: 'action',
                    speaker: 'Hành động',
                    timestampSec: this.sessionElapsedSec,
                    text: 'Hẹn gặp riêng sau giờ để lắng nghe và hỗ trợ thêm'
                });
                this.step3Resolved = true;
                this.tensionLevel = 'Đã lắng';
                this.renderInClassHud();
            } else if (actionType === 'conn_parents') {
                // Mở Bảng kết nối Nhà trường – Gia đình – Xã hội (P3)
                this.openConnectionModal('parents');
            } else if (actionType === 'conn_report') {
                // Báo GVCN / Tổ tư vấn (P3)
                this.openConnectionModal('counseling');
            }
        },

        submitTeacherUtterance: function (customText, meta = {}) {
            const sc = this.activeScenario;
            if (!sc) return;

            const text = (customText || this.draftUtterance || '').trim();
            if (!text) return;
            this.draftUtterance = '';

            const timeStr = formatClock(this.sessionElapsedSec);
            const isBadBranch = /chép ai là gian lận|0 điểm|phạt|gọi phụ huynh để răn đe|lớp trưởng mà nói thế à|đứng lên xin lỗi ngay/i.test(text);

            this.transcriptLog.push({
                role: 'teacher',
                speaker: (this.selectedTeacher && this.selectedTeacher.displayName) || 'Bạn',
                timestampSec: this.sessionElapsedSec,
                text: text,
                isBad: isBadBranch
            });

            this.userMomentsTimeline.push({
                timeStr: timeStr,
                actionTitle: meta.actionName || 'Lời nói giáo viên',
                quote: text,
                isBad: isBadBranch,
                principle: meta.principle || (isBadBranch ? 'P2' : 'P1'),
                lawRef: meta.lawRef || (isBadBranch ? 'Luật NG Đ11 k2 điểm b · TT 22 Đ4 k2' : 'Luật NG Đ9 k2 d, e')
            });

            // Nếu người dùng chọn/nói vào Nhánh B (Chưa phù hợp)
            if (isBadBranch) {
                this.tensionLevel = 'Lớn';
                this.tensionTimeline.push({ time: timeStr, level: 'Lớn', note: 'Phê bình gay gắt làm tăng nhiệt' });

                // Phản ứng học sinh Nhánh B
                setTimeout(() => {
                    if (sc.id === 1) {
                        const reply = 'Em không chép! Cô không tin em!';
                        this.transcriptLog.push({ role: 'student', speaker: 'Nam', studentId: 'nam', timestampSec: this.sessionElapsedSec + 2, text: reply });
                        if (window.CharacterManager) {
                            window.CharacterManager.setStudentPosture('nam', 'disagreeing', reply);
                            window.CharacterManager.showSpeechBubble('nam', reply, 5000);
                        }
                        if (window.SpeechEngine) window.SpeechEngine.speak(reply, { speaker: 'nam', isStudent: true, gender: 'male' });
                    } else {
                        const reply = 'Minh xấu hổ cúi mặt, cãi lại. Khoa càng bối rối!';
                        this.transcriptLog.push({ role: 'action', speaker: 'Diễn biến', timestampSec: this.sessionElapsedSec + 2, text: reply });
                    }

                    // Hiện thẻ nhắc nhở tức thời (Trang 8)
                    if (this.selectedMode === 'guided') {
                        this.instantWarning = {
                            text: sc.id === 2
                                ? 'Phê bình lớp trưởng trước tập thể khiến Minh mất mặt và lớp chia phe rõ hơn; chuyện nhỏ có nguy cơ thành lớn. Nhà giáo cần tôn trọng người học và giữ ứng xử mực thước.'
                                : 'Kết luận “gian lận” trước lớp khi chưa nghe hai phía làm mâu thuẫn lớn thêm. Điểm số phản ánh kết quả học tập, không dùng để phạt hành vi; gọi phụ huynh để răn đe khác với phối hợp cùng gia đình.',
                            lawRefs: sc.id === 2 ? 'Luật NG · Đ9 k2 điểm d · TT 30 · Đ6 k4' : 'TT 22 · Đ4 k2 · Luật NG · Đ11 k2 điểm b',
                            principle: 'P2'
                        };
                    }
                    this.renderInClassHud();
                }, 600);
            } else {
                // Nhánh A (Phù hợp)
                this.tensionLevel = this.tensionLevel === 'Lớn' ? 'Đang giảm' : 'Đã lắng';
                this.tensionTimeline.push({ time: timeStr, level: this.tensionLevel, note: 'Xử lý phù hợp' });
                this.step3Resolved = true;

                setTimeout(() => {
                    if (sc.id === 1) {
                        const lanReply = 'Em làm cả 4 câu, Nam chỉ chép câu 2, 3 thôi ạ.';
                        const namReply = 'Câu 2 và 3 em hỏi AI, em ghi chú lại ạ.';
                        this.transcriptLog.push({ role: 'student', speaker: 'Lan', studentId: 'lan', timestampSec: this.sessionElapsedSec + 2, text: lanReply });
                        this.transcriptLog.push({ role: 'student', speaker: 'Nam', studentId: 'nam', timestampSec: this.sessionElapsedSec + 4, text: namReply });

                        if (window.CharacterManager) {
                            window.CharacterManager.setStudentPosture('lan', 'writing', lanReply);
                            window.CharacterManager.setStudentStatusTag('lan', 'bình tĩnh', '#10b981');
                            window.CharacterManager.setStudentPosture('nam', 'writing', namReply);
                            window.CharacterManager.setStudentStatusTag('nam', 'tự làm bài', '#38bdf8');
                            window.CharacterManager.showSpeechBubble('nam', namReply, 5000);
                        }
                        if (window.SpeechEngine) window.SpeechEngine.speak(namReply, { speaker: 'nam', isStudent: true, gender: 'male' });
                    } else {
                        const khoaReply = 'Em cảm ơn cô, em sẽ vẽ biển hiệu thật đẹp cho lớp ạ!';
                        this.transcriptLog.push({ role: 'student', speaker: 'Khoa', studentId: 'khoa', timestampSec: this.sessionElapsedSec + 2, text: khoaReply });
                        if (window.CharacterManager) {
                            window.CharacterManager.setStudentPosture('khoa', 'writing', khoaReply);
                            window.CharacterManager.setStudentStatusTag('khoa', 'nhận vẽ biển', '#10b981');
                            window.CharacterManager.showSpeechBubble('khoa', khoaReply, 5000);
                        }
                        if (window.SpeechEngine) window.SpeechEngine.speak(khoaReply, { speaker: 'khoa', isStudent: true, gender: 'male' });
                    }
                    this.renderInClassHud();
                }, 600);
            }

            this.renderInClassHud();
        },

        retryBranchB: function () {
            this.instantWarning = null;
            this.tensionLevel = 'Đang giảm';
            this.executeAction('speak_all');
        },

        dismissInstantWarning: function () {
            this.instantWarning = null;
            this.renderInClassHud();
        },

        // ================= BẢNG KẾT NỐI NHÀ TRƯỜNG – GIA ĐÌNH – XÃ HỘI (TRANG 12) =================
        openConnectionModal: function (tab = 'parents') {
            this.connectionTab = tab;
            this.connectionModalOpen = true;
            this.connectionDraftText = 'Chào chị, em là GVCN lớp 8B. Cảm ơn chị đã báo cho em. Em đang trực tiếp nói chuyện với các con ở lớp. Tối nay khoảng 20h em gọi điện cho chị để nghe thêm về Khoa và cùng bàn cách giúp con, chị thấy có tiện không ạ?';
            this.renderInClassHud();
        },
        closeConnectionModal: function () {
            this.connectionModalOpen = false;
            this.renderInClassHud();
        },
        switchConnectionTab: function (tab) {
            this.connectionTab = tab;
            this.renderInClassHud();
        },
        selectConnectionChannel: function (ch) {
            this.connectionTargetChannel = ch;
            this.renderInClassHud();
        },
        sendConnectionMessage: function () {
            const timeStr = formatClock(this.sessionElapsedSec);
            const draftEl = document.getElementById('c3d-conn-draft');
            const content = draftEl ? draftEl.value : this.connectionDraftText;

            this.transcriptLog.push({
                role: 'action',
                speaker: 'Bảng kết nối',
                timestampSec: this.sessionElapsedSec,
                text: `Gửi tin nhắn riêng đến phụ huynh Khoa: "${content}"`
            });

            this.userMomentsTimeline.push({
                timeStr: timeStr,
                actionTitle: 'Bảng kết nối · Nhắn riêng',
                quote: content,
                isBad: false,
                principle: 'P3',
                lawRef: 'TT 30 · Đ12 k1 điểm g · NQ 29 Nhà trường – Gia đình – Xã hội'
            });

            this.connectionModalOpen = false;
            this.connectionSubmitted = true;
            this.parentToastVisible = false;

            // Phụ huynh phản hồi tích cực
            setTimeout(() => {
                const parentReply = 'Mẹ Khoa: Cảm ơn cô, tối nay 20h tôi đợi điện thoại của cô ạ.';
                this.transcriptLog.push({
                    role: 'action',
                    speaker: 'Mẹ Khoa (Phụ huynh)',
                    timestampSec: this.sessionElapsedSec + 2,
                    text: parentReply
                });
                if (window.SpeechEngine) {
                    window.SpeechEngine.speak('Cảm ơn cô, tối nay 20h tôi đợi điện thoại của cô ạ.', {
                        speaker: 'me_khoa',
                        isStudent: true,
                        gender: 'female'
                    });
                }
                this.tensionLevel = 'Đã lắng';
                this.tensionTimeline.push({ time: timeStr, level: 'Đã lắng', note: 'Phụ huynh đồng ý phối hợp' });
                this.renderInClassHud();
            }, 800);

            this.renderInClassHud();
        },

        finishPracticePhase: function () {
            if (this._clockTimer) clearInterval(this._clockTimer);
            if (window.SpeechEngine) window.SpeechEngine.stopSpeaking();
            this.goToFlowStep(10);
        },

        // ================= BƯỚC 11: PHẢN TƯ (TRANG 14) =================
        toggleSelfEvalPrinciple: function (pId) {
            this.selfEvalPrinciples[pId] = !this.selfEvalPrinciples[pId];
            this.renderAll();
        },
        setSelfEvalResolution: function (level) {
            this.selfEvalResolutionLevel = level;
            this.renderAll();
        },
        finishToNoScoreReport: function () {
            const retryInput = document.getElementById('mp-self-retry-input');
            if (retryInput) this.selfEvalRetryThought = retryInput.value;
            this.reviewSubTab = 'overview';
            this.goToFlowStep(12);
        },

        switchReviewSubTab: function (tab) {
            this.reviewSubTab = tab;
            this.renderAll();
        },

        // ================= RENDERING =================
        renderAll: function () {
            const modal = document.getElementById('flow-modal');
            if (!modal) return;

            // Nếu đang trong lớp học 3D (Bước 6, 7, 9) và không phải modal Step 8/10
            if (this.flowStep === 6 || this.flowStep === 7 || this.flowStep === 9) {
                modal.classList.add('hidden');
                modal.innerHTML = '';
                this.renderInClassHud();
                return;
            }

            modal.classList.remove('hidden');

            let contentHtml = '';
            if (this.flowStep === 1) contentHtml = this._renderStep1Page();
            else if (this.flowStep === 2) contentHtml = this._renderStep2Page();
            else if (this.flowStep === 3) contentHtml = this._renderStep3Page();
            else if (this.flowStep === 5) contentHtml = this._renderStep5Page();
            else if (this.flowStep === 8) contentHtml = this._renderStep8ModalHtml();
            else if (this.flowStep === 10) contentHtml = this._renderStep10ModalHtml();
            else if (this.flowStep === 11) contentHtml = this._renderStep11Page();
            else if (this.flowStep === 12) {
                if (this.reviewSubTab === 'actions') {
                    contentHtml = this._renderActionReviewsPage();
                } else if (this.reviewSubTab === 'model_solution') {
                    contentHtml = this._renderStep13Page();
                } else if (this.reviewSubTab === 'progress') {
                    contentHtml = this._renderStep14Page();
                } else {
                    contentHtml = this._renderStep12Page();
                }
            } else if (this.flowStep === 13) contentHtml = this._renderStep13Page();
            else if (this.flowStep === 14) contentHtml = this._renderStep14Page();

            modal.innerHTML = `<div class="modal-card mp-flow-box">${contentHtml}</div>`;
            this.renderInClassHud();
        },

        _renderTopStepperHeader: function (currentPhaseIndex, rightSubBadgeText) {
            const phases = [
                { idx: 1, label: '1 · Chuẩn bị' },
                { idx: 2, label: '2 · Trong lớp học' },
                { idx: 3, label: '3 · Phản tư & phản hồi' },
                { idx: 4, label: '4 · Luyện lại' }
            ];
            const pills = phases.map(p => `
                <span class="mp-stepper-pill ${p.idx === currentPhaseIndex ? 'active' : ''}">${p.label}</span>
            `).join('');

            return `
                <div class="mp-top-stepper-bar">
                    <div class="mp-stepper-brand">
                        <span class="mp-stepper-logo">TL</span>
                        <strong>ULIS TeachLab</strong>
                    </div>
                    <div class="mp-stepper-pills">${pills}</div>
                    <div class="mp-stepper-subbadge">${escapeHtml(rightSubBadgeText || '')}</div>
                </div>
            `;
        },

        // ================= TRANG BƯỚC 1: THỬ MICRO =================
        _renderStep1Page: function () {
            const listening = Boolean(window.SpeechEngine && window.SpeechEngine.isListening);
            return `
                ${this._renderTopStepperHeader(1, 'Thử thiết bị')}
                <div class="mp-kicker">GIAI ĐOẠN 1 · CHUẨN BỊ</div>
                <h1 class="mp-h1">Kiểm tra micro của bạn</h1>
                <p class="mp-subtitle">Để điều phối lớp học và giao tiếp tự nhiên với học sinh AI, hãy nói thử một câu ngắn vào micro.</p>

                <div class="mp-card" style="text-align:center; padding:32px 20px;">
                    <button class="mp-mic-circle ${listening ? 'listening' : ''}" onclick="window.ScenarioSystem.toggleMic('step1')">
                        ${listening ? '⏹' : '🎙️'}
                    </button>
                    <div style="margin-top:14px; font-weight:700; color:#0f172a;">
                        ${listening ? 'Đang lắng nghe... Hãy nói câu thử nghiệm' : 'Nhấn vào biểu tượng hoặc giữ phím Space để nói'}
                    </div>
                    <div class="mp-speech-heard-box">
                        “${escapeHtml(this.step1HeardText || 'Ví dụ: Chào cả lớp, chúng ta bắt đầu nhé!')}”
                    </div>
                    <div style="margin-top:10px;">
                        ${this.step1Verified
                            ? '<span class="mp-badge-ok">✓ Đã nhận diện âm thanh tốt</span>'
                            : '<button class="mp-ghost-mini" onclick="window.ScenarioSystem.simulateStep1MicSuccess()">Nhận diện mẫu (Bỏ qua thử)</button>'}
                    </div>
                </div>

                <div class="mp-footer">
                    <button class="mp-btn-secondary" onclick="window.ScenarioSystem.skipStep1()">Bỏ qua micro</button>
                    <button class="mp-btn-primary" onclick="window.ScenarioSystem.goToFlowStep(2)">Tiếp tục</button>
                </div>
            `;
        },

        // ================= TRANG BƯỚC 2: CHỌN GIÁO VIÊN & GIỌNG NÓI =================
        _renderStep2Page: function () {
            const activeTeacher = this.selectedTeacher;
            const validTeachers = this.teacherPersonas.filter(t => t.gender === this.selectedTeacherGender);
            const teacherOptions = validTeachers.map(t => {
                const selected = t.id === this.selectedTeacherId;
                return `
                    <div class="mp-card mp-card-selectable mp-teacher-card ${selected ? 'selected' : ''}"
                         onclick="window.ScenarioSystem.selectTeacherId('${t.id}')">
                        <div style="display:flex; gap:12px; align-items:center;">
                            ${renderTeacherPortrait(t, 54)}
                            <div>
                                <div style="font-weight:800; font-size:14px; color:#0f172a;">${escapeHtml(t.displayName || t.name)}</div>
                                <div style="font-size:12px; color:#64748b;">${escapeHtml(t.mbti)} · ${escapeHtml(t.outfitDesc || '')}</div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            return `
                ${this._renderTopStepperHeader(1, 'Chọn nhân vật')}
                <div class="mp-kicker">GIAI ĐOẠN 1 · CHUẨN BỊ</div>
                <h1 class="mp-h1">Chọn hình tượng giáo viên của bạn</h1>
                <p class="mp-subtitle">Hình ảnh và giọng nói của giáo viên được đồng bộ hóa với hệ thống lớp học 3D.</p>

                <div style="display:flex; gap:10px; margin-bottom:14px;">
                    <button class="mp-pill ${this.selectedTeacherGender === 'female' ? 'selected' : ''}"
                            onclick="window.ScenarioSystem.selectTeacherGender('female')">Cô giáo (Nữ)</button>
                    <button class="mp-pill ${this.selectedTeacherGender === 'male' ? 'selected' : ''}"
                            onclick="window.ScenarioSystem.selectTeacherGender('male')">Thầy giáo (Nam)</button>
                </div>

                <div class="mp-teacher-grid-3" style="max-height:280px; overflow-y:auto; padding-right:4px;">
                    ${teacherOptions}
                </div>

                <div class="mp-card" style="margin-top:14px; display:flex; justify-content:space-between; align-items:center; gap:12px;">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <span style="font-size:24px;">${this.selectedTeacherGender === 'female' ? '👩‍🏫' : '👨‍🏫'}</span>
                        <div>
                            <div style="font-weight:700; font-size:13.5px; color:#0f172a;">Giọng nói: ${escapeHtml(activeTeacher.displayName)}</div>
                            <div style="font-size:12px; color:#64748b;">Giọng chuẩn người Việt truyền cảm qua ElevenLabs</div>
                        </div>
                    </div>
                    <button class="mp-btn-secondary" onclick="window.ScenarioSystem.previewTeacherVoice()">▶ Nghe thử giọng</button>
                </div>

                <div class="mp-footer">
                    <button class="mp-btn-secondary" onclick="window.ScenarioSystem.goToFlowStep(1)">Quay lại</button>
                    <button class="mp-btn-primary" onclick="window.ScenarioSystem.goToFlowStep(3)">Tiếp tục</button>
                </div>
            `;
        },

        // ================= TRANG BƯỚC 3: CHỌN LOẠI TÌNH HUỐNG (MOCKUP TRANG 2) =================
        _renderStep3Page: function () {
            const isTeaching = this.selectedCategory === 'teaching';

            // Kịch bản mẫu 1 & 2
            const scTeaching = this.scenarios.find(s => s.id === 1) || this.scenarios[0];
            const scHomeroom = this.scenarios.find(s => s.id === 2) || this.scenarios[1];

            return `
                ${this._renderTopStepperHeader(1, 'Chọn tình huống')}
                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:14px; margin-bottom:8px;">
                    <div>
                        <div class="mp-kicker">BƯỚC 3 · CHỌN LOẠI TÌNH HUỐNG</div>
                        <h1 class="mp-h1" style="margin:2px 0 4px;">Hôm nay bạn muốn luyện tình huống nào?</h1>
                    </div>
                    <div class="mp-mode-toggle-group">
                        <button class="mp-mode-btn ${this.selectedMode === 'guided' ? 'selected' : ''}"
                                onclick="window.ScenarioSystem.selectMode('guided')">
                            ⭕ Luyện tập
                        </button>
                        <button class="mp-mode-btn ${this.selectedMode === 'realistic' ? 'selected' : ''}"
                                onclick="window.ScenarioSystem.selectMode('realistic')">
                            🚩 Thử thách
                        </button>
                    </div>
                </div>

                <div class="mp-category-grid-2">
                    <!-- CỘT TRÁI: NHÓM 1 · TÌNH HUỐNG GIẢNG DẠY -->
                    <div class="mp-card mp-category-column ${isTeaching ? 'active' : ''}"
                         onclick="window.ScenarioSystem.selectCategory('teaching')">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <span class="mp-cat-icon">📖</span>
                                <div>
                                    <div style="font-weight:800; font-size:16px; color:#0f172a;">Tình huống giảng dạy</div>
                                    <div style="font-size:12px; color:#64748b;">Phát sinh trong một giờ học, theo tiến trình 4 hoạt động</div>
                                </div>
                            </div>
                            ${isTeaching ? '<span class="mp-badge-tag active">Đang chọn</span>' : ''}
                        </div>

                        <div class="mp-activities-flow">
                            <div class="mp-act-box ${this.selectedActivityId === 'act_warmup' ? 'selected' : ''}"
                                 onclick="event.stopPropagation(); window.ScenarioSystem.selectActivity('act_warmup')">
                                <span class="mp-act-step">HOẠT ĐỘNG 1</span>
                                <strong>Khởi động</strong>
                                <p>Lớp chưa vào bài, học sinh mất tập trung, câu hỏi mở đầu không ai trả lời</p>
                            </div>
                            <div class="mp-act-box ${this.selectedActivityId === 'act_knowledge' ? 'selected' : ''}"
                                 onclick="event.stopPropagation(); window.ScenarioSystem.selectActivity('act_knowledge')">
                                <span class="mp-act-step">HOẠT ĐỘNG 2</span>
                                <strong>Hình thành kiến thức</strong>
                                <p>Học sinh hiểu sai, hỏi khó, tranh luận trái chiều</p>
                            </div>
                            <div class="mp-act-box highlighted ${this.selectedActivityId === 'act_practice' ? 'selected' : ''}"
                                 onclick="event.stopPropagation(); window.ScenarioSystem.selectActivity('act_practice')">
                                <span class="mp-act-step">HOẠT ĐỘNG 3</span>
                                <strong>Luyện tập</strong>
                                <p>Chép bài, dùng AI làm hộ, nhóm làm việc không đều</p>
                            </div>
                            <div class="mp-act-box ${this.selectedActivityId === 'act_apply' ? 'selected' : ''}"
                                 onclick="event.stopPropagation(); window.ScenarioSystem.selectActivity('act_apply')">
                                <span class="mp-act-step">HOẠT ĐỘNG 4</span>
                                <strong>Vận dụng thực tế</strong>
                                <p>Ý tưởng bị chê, sản phẩm thất bại, liên hệ nhạy cảm</p>
                            </div>
                        </div>

                        <div style="font-size:11.5px; color:#64748b; margin:10px 0 6px;">
                            Tiến trình theo Kế hoạch bài dạy của Công văn 5512: Mở đầu → Hình thành kiến thức mới → Luyện tập → Vận dụng.
                        </div>

                        <div class="mp-scenario-featured-card" onclick="event.stopPropagation(); window.ScenarioSystem.selectScenarioInSetup(1)">
                            <div style="font-size:20px;">🤖</div>
                            <div style="flex:1;">
                                <div style="font-weight:800; font-size:14px; color:#0f172a;">Bài làm nhờ AI</div>
                                <div style="font-size:12px; color:#475569;">Lớp 7 · KHTN · Hai bạn trong cặp tranh cãi vì một bạn dùng chatbot làm phiếu học tập</div>
                            </div>
                            <div style="display:flex; gap:4px;">
                                <span class="mp-principle-badge p1">⚖️ P1</span>
                                <span class="mp-principle-badge p2">↓ P2</span>
                            </div>
                        </div>
                    </div>

                    <!-- CỘT PHẢI: NHÓM 2 · TÌNH HUỐNG CHỦ NHIỆM LỚP -->
                    <div class="mp-card mp-category-column ${!isTeaching ? 'active' : ''}"
                         onclick="window.ScenarioSystem.selectCategory('homeroom')">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <span class="mp-cat-icon">👥</span>
                                <div>
                                    <div style="font-weight:800; font-size:16px; color:#0f172a;">Tình huống chủ nhiệm lớp</div>
                                    <div style="font-size:12px; color:#64748b;">Phát sinh khi tổ chức lớp, sinh hoạt tập thể</div>
                                </div>
                            </div>
                            ${!isTeaching ? '<span class="mp-badge-tag active">Đang chọn</span>' : ''}
                        </div>

                        <div class="mp-activities-flow">
                            <div class="mp-act-box ${this.selectedActivityId === 'act_homeroom' ? 'selected' : ''}"
                                 onclick="event.stopPropagation(); window.ScenarioSystem.selectActivity('act_homeroom')">
                                <span class="mp-act-step">BỐI CẢNH 1</span>
                                <strong>Sinh hoạt lớp</strong>
                                <p>Bầu cán bộ lớp, phê bình, nề nếp</p>
                            </div>
                            <div class="mp-act-box ${this.selectedActivityId === 'act_union' ? 'selected' : ''}"
                                 onclick="event.stopPropagation(); window.ScenarioSystem.selectActivity('act_union')">
                                <span class="mp-act-step">BỐI CẢNH 2</span>
                                <strong>Đoàn – Đội</strong>
                                <p>Phong trào thi đua, kế hoạch chi đội</p>
                            </div>
                            <div class="mp-act-box highlighted ${this.selectedActivityId === 'act_experience' ? 'selected' : ''}"
                                 onclick="event.stopPropagation(); window.ScenarioSystem.selectActivity('act_experience')">
                                <span class="mp-act-step">BỐI CẢNH 3</span>
                                <strong>Hoạt động trải nghiệm</strong>
                                <p>Phân công nhóm, gây quỹ, sản phẩm</p>
                            </div>
                            <div class="mp-act-box ${this.selectedActivityId === 'act_extracurricular' ? 'selected' : ''}"
                                 onclick="event.stopPropagation(); window.ScenarioSystem.selectActivity('act_extracurricular')">
                                <span class="mp-act-step">BỐI CẢNH 4</span>
                                <strong>Ngoại khóa</strong>
                                <p>Dã ngoại, câu lạc bộ, an toàn</p>
                            </div>
                        </div>

                        <div style="font-size:11.5px; color:#64748b; margin:10px 0 6px;">
                            Bốn bối cảnh tổ chức lớp: sinh hoạt lớp, Đoàn – Đội, trải nghiệm, ngoại khóa.
                        </div>

                        <div class="mp-scenario-featured-card" onclick="event.stopPropagation(); window.ScenarioSystem.selectScenarioInSetup(2)">
                            <div style="font-size:20px;">🎪</div>
                            <div style="flex:1;">
                                <div style="font-weight:800; font-size:14px; color:#0f172a;">Gian hàng không có Khoa</div>
                                <div style="font-size:12px; color:#475569;">Lớp 8 · Một bạn bị gạt khỏi nhóm, phụ huynh nhắn tin vào nhóm chung</div>
                            </div>
                            <div style="display:flex; gap:4px;">
                                <span class="mp-principle-badge p3">🏫 P3</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- THANH CHỌN KHỐI LỚP -->
                <div class="mp-card" style="margin-top:14px; display:flex; justify-content:space-between; align-items:center;">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <span style="font-weight:700; color:#0f172a; font-size:14px;">Khối lớp:</span>
                        <div style="display:flex; gap:6px;">
                            
                                <button class="mp-num-pill ${this.selectedGradeNumber === n ? 'selected' : ''}"
                                        onclick="window.ScenarioSystem.selectGradeNumber(6)">6</button>
                            
                                <button class="mp-num-pill ${this.selectedGradeNumber === n ? 'selected' : ''}"
                                        onclick="window.ScenarioSystem.selectGradeNumber(7)">7</button>
                            
                                <button class="mp-num-pill ${this.selectedGradeNumber === n ? 'selected' : ''}"
                                        onclick="window.ScenarioSystem.selectGradeNumber(8)">8</button>
                            
                                <button class="mp-num-pill ${this.selectedGradeNumber === n ? 'selected' : ''}"
                                        onclick="window.ScenarioSystem.selectGradeNumber(9)">9</button>
                            
                        </div>
                        <span style="font-size:13px; color:#475569;">· ${isTeaching ? 'Lớp 7A' : 'Lớp 8B'}</span>
                    </div>
                    <button class="mp-btn-primary" style="padding:10px 24px; font-weight:800;" onclick="window.ScenarioSystem.goToFlowStep(5)">
                        Vào phòng mô phỏng ▶
                    </button>
                </div>
            `;
        },

        // ================= TRANG BƯỚC 5: VÀO PHÒNG MÔ PHỎNG (TRANG 3 & TRANG 10) =================
        _renderStep5Page: function () {
            const sc = this.activeScenario;
            if (!sc) return '';

            const isTeaching = sc.category === 'teaching';

            if (isTeaching) {
                // Mockup Trang 3: Tình huống giảng dạy - Bài làm nhờ AI
                return `
                    ${this._renderTopStepperHeader(2, 'Phòng mô phỏng')}
                    <div class="mp-kicker">TÌNH HUỐNG GIẢNG DẠY · LỚP 7A · KHOA HỌC TỰ NHIÊN</div>
                    <h1 class="mp-h1" style="margin:2px 0 12px;">Bài: Trao đổi nước và chất dinh dưỡng ở thực vật</h1>

                    <div class="mp-step5-grid-3">
                        <!-- CỘT 1: KẾ HOẠCH BÀI DẠY (CV 5512) -->
                        <div class="mp-card">
                            <strong style="font-size:13px; color:#64748b; letter-spacing:0.5px;">KẾ HOẠCH BÀI DẠY (CV 5512)</strong>
                            <div class="mp-plan-steps" style="margin-top:12px;">
                                <div class="mp-plan-step"><span>1</span> Mở đầu</div>
                                <div class="mp-plan-step"><span>2</span> Hình thành kiến thức</div>
                                <div class="mp-plan-step active"><span>3</span> <strong>Luyện tập · đang ở đây</strong></div>
                                <div class="mp-plan-step"><span>4</span> Vận dụng</div>
                            </div>
                            <div style="font-size:12.5px; color:#475569; margin-top:14px; line-height:1.5; background:#f8fafc; padding:10px; border-radius:8px;">
                                <strong>Hoạt động 3 – Luyện tập:</strong> học sinh làm Phiếu số 3 theo cặp trong 10 phút, sau đó báo cáo và thảo luận.
                            </div>
                        </div>

                        <!-- CỘT 2: NHIỆM VỤ CỦA BẠN & HỌC SINH -->
                        <div class="mp-card">
                            <strong style="font-size:13px; color:#64748b; letter-spacing:0.5px;">NHIỆM VỤ CỦA BẠN</strong>
                            <p style="font-size:13.5px; color:#0f172a; line-height:1.5; margin:8px 0 14px;">
                                Theo dõi các cặp làm Phiếu số 3. Nếu có vấn đề phát sinh, <strong>xử lý sao cho hoạt động Luyện tập tiếp tục</strong> và mọi học sinh vẫn được học.
                            </p>

                            <strong style="font-size:13px; color:#64748b; letter-spacing:0.5px;">NGUYÊN TẮC XỬ LÝ TRỌNG TÂM</strong>
                            <div style="display:flex; flex-wrap:wrap; gap:6px; margin:8px 0 16px;">
                                <span class="mp-principle-badge p1">⚖️ Trung hòa mâu thuẫn</span>
                                <span class="mp-principle-badge p2">↓ Giảm thiểu thiệt hại</span>
                                <span class="mp-principle-badge p3">🏫 Nhà trường – Gia đình – Xã hội</span>
                            </div>

                            <strong style="font-size:13px; color:#64748b; letter-spacing:0.5px;">HỌC SINH TRONG LỚP</strong>
                            <div style="display:flex; flex-direction:column; gap:6px; margin-top:8px;">
                                <div class="mp-student-badge-item"><span class="badge-avatar">L</span> <strong>Lan · tổ trưởng</strong> <span class="sub">Tính cách: ẩn</span></div>
                                <div class="mp-student-badge-item"><span class="badge-avatar">N</span> <strong>Nam</strong> <span class="sub">Tính cách: ẩn</span></div>
                                <div class="mp-student-badge-item"><span class="badge-avatar">H</span> <strong>Huy</strong> <span class="sub">Tính cách: ẩn</span></div>
                            </div>
                        </div>

                        <!-- CỘT 3: CĂN CỨ ÁP DỤNG & QUY ĐỊNH AI -->
                        <div class="mp-card">
                            <strong style="font-size:13px; color:#64748b; letter-spacing:0.5px;">CĂN CỨ ÁP DỤNG CHO TÌNH HUỐNG NÀY</strong>
                            <div class="mp-law-chips-list" style="margin:10px 0 16px;">
                                <span class="mp-law-chip">🏛️ NQ 29-NQ/TW · Quan điểm chỉ đạo</span>
                                <span class="mp-law-chip">📜 Luật Nhà giáo 2025 · Điều 9, 11</span>
                                <span class="mp-law-chip">📋 TT 30/2026 · Điều 4, 6, 12</span>
                                <span class="mp-law-chip">📑 CV 5512 · Phụ lục IV, Hoạt động 3</span>
                                <span class="mp-law-chip">📊 TT 22/2021 · Điều 4</span>
                                <span class="mp-law-chip">💡 TT 02/2025 · QĐ 2422/2026</span>
                            </div>

                            <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; padding:12px;">
                                <strong style="font-size:12.5px; color:#1e40af; text-transform:uppercase;">QUY ĐỊNH CỦA LỚP VỀ AI</strong>
                                <p style="font-size:13px; color:#1e3a8a; margin:4px 0 0; line-height:1.45;">
                                    Được dùng AI để tra cứu, nhưng <strong>phải tự viết câu trả lời</strong> và ghi rõ đã dùng AI ở bước nào.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="mp-footer">
                        <button class="mp-btn-secondary" onclick="window.ScenarioSystem.goToFlowStep(3)">Đổi tình huống</button>
                        <button class="mp-btn-primary" onclick="window.ScenarioSystem.startScenarioFromStep5()">Vào lớp</button>
                    </div>
                `;
            } else {
                // Mockup Trang 10: Tình huống chủ nhiệm - Gian hàng không có Khoa
                return `
                    ${this._renderTopStepperHeader(2, 'Phòng mô phỏng')}
                    <div class="mp-kicker">TÌNH HUỐNG CHỦ NHIỆM · LỚP 8B · HOẠT ĐỘNG TRẢI NGHIỆM</div>
                    <h1 class="mp-h1" style="margin:2px 0 12px;">Sinh hoạt lớp: Chuẩn bị gian hàng Hội chợ Xuân gây quỹ</h1>

                    <div class="mp-step5-grid-3">
                        <!-- CỘT 1: TIẾN TRÌNH TIẾT SINH HOẠT -->
                        <div class="mp-card">
                            <strong style="font-size:13px; color:#64748b; letter-spacing:0.5px;">TIẾN TRÌNH TIẾT SINH HOẠT</strong>
                            <div class="mp-plan-steps" style="margin-top:12px;">
                                <div class="mp-plan-step"><span>1</span> Sơ kết tuần (Minh – lớp trưởng)</div>
                                <div class="mp-plan-step active"><span>2</span> <strong>Phân công gian hàng · đang ở đây</strong></div>
                                <div class="mp-plan-step"><span>3</span> Thảo luận ý tưởng gian hàng</div>
                                <div class="mp-plan-step"><span>4</span> Giáo viên kết luận</div>
                            </div>
                            <div style="font-size:12.5px; color:#475569; margin-top:14px; line-height:1.5; background:#f8fafc; padding:10px; border-radius:8px;">
                                Ban cán sự tự điều hành; giáo viên chủ nhiệm theo dõi và hỗ trợ.
                            </div>
                        </div>

                        <!-- CỘT 2: NHIỆM VỤ CỦA BẠN & NGUYÊN TẮC -->
                        <div class="mp-card">
                            <strong style="font-size:13px; color:#64748b; letter-spacing:0.5px;">NHIỆM VỤ CỦA BẠN</strong>
                            <p style="font-size:13.5px; color:#0f172a; line-height:1.5; margin:8px 0 14px;">
                                Hỗ trợ ban cán sự hoàn tất phân công, bảo đảm <strong>mỗi bạn đều có ít nhất một việc và không ai bị bỏ lại</strong>.
                            </p>

                            <strong style="font-size:13px; color:#64748b; letter-spacing:0.5px;">NGUYÊN TẮC XỬ LÝ TRỌNG TÂM</strong>
                            <div style="display:flex; flex-wrap:wrap; gap:6px; margin:8px 0 16px;">
                                <span class="mp-principle-badge p3">🏫 Nhà trường – Gia đình – Xã hội</span>
                                <span class="mp-principle-badge p1">⚖️ Trung hòa mâu thuẫn</span>
                                <span class="mp-principle-badge p2">↓ Giảm thiểu thiệt hại</span>
                            </div>

                            <strong style="font-size:13px; color:#64748b; letter-spacing:0.5px;">HỌC SINH TRONG LỚP</strong>
                            <div style="display:flex; flex-direction:column; gap:6px; margin-top:8px;">
                                <div class="mp-student-badge-item"><span class="badge-avatar">M</span> <strong>Minh · lớp trưởng</strong> <span class="sub">Tính cách: ẩn</span></div>
                                <div class="mp-student-badge-item"><span class="badge-avatar">T</span> <strong>Thảo</strong> <span class="sub">Tính cách: ẩn</span></div>
                                <div class="mp-student-badge-item"><span class="badge-avatar">K</span> <strong>Khoa</strong> <span class="sub">Tính cách: ẩn</span></div>
                            </div>
                        </div>

                        <!-- CỘT 3: KÊNH PHỐI HỢP & CĂN CỨ -->
                        <div class="mp-card">
                            <strong style="font-size:13px; color:#64748b; letter-spacing:0.5px;">KÊNH PHỐI HỢP CÓ THỂ DÙNG</strong>
                            <div style="display:flex; flex-direction:column; gap:8px; margin:10px 0 16px;">
                                <div class="mp-channel-box">
                                    <strong>👨‍👩‍👧 Cha mẹ học sinh</strong>
                                    <span>Nhắn riêng · gọi điện · hẹn gặp</span>
                                </div>
                                <div class="mp-channel-box">
                                    <strong>🩺 Tổ tư vấn học đường</strong>
                                    <span>Phiếu chuyển tư vấn</span>
                                </div>
                                <div class="mp-channel-box">
                                    <strong>🚩 Chi đội 8B</strong>
                                    <span>Giao chi đội cùng tổ chức</span>
                                </div>
                            </div>

                            <strong style="font-size:13px; color:#64748b; letter-spacing:0.5px;">CĂN CỨ ÁP DỤNG</strong>
                            <div class="mp-law-chips-list" style="margin-top:6px;">
                                <span class="mp-law-chip">NQ 29-NQ/TW · Quan điểm chỉ đạo</span>
                                <span class="mp-law-chip">Luật Nhà giáo 2025 · Điều 9</span>
                                <span class="mp-law-chip">TT 30/2026 · Đ4 k1 d; Đ12 k1 e, g</span>
                                <span class="mp-law-chip">TT 18/2025 · Tư vấn học đường</span>
                            </div>
                        </div>
                    </div>

                    <div class="mp-footer">
                        <button class="mp-btn-secondary" onclick="window.ScenarioSystem.goToFlowStep(3)">Đổi tình huống</button>
                        <button class="mp-btn-primary" onclick="window.ScenarioSystem.startScenarioFromStep5()">Vào lớp</button>
                    </div>
                `;
            }
        },

        // ================= BƯỚC 8: TẠM DỪNG ĐỂ QUAN SÁT (TRANG 5) =================
        _renderStep8ModalHtml: function () {
            const sc = this.activeScenario;
            const isTeaching = sc && sc.category === 'teaching';

            const defaultObs = isTeaching
                ? 'Lan và Nam mâu thuẫn về việc dùng AI, Lan tố cáo trước lớp, Huy hùa theo. Nam có thể bị xấu hổ, Lan thấy bất công, cả lớp đang bị cuốn vào.'
                : 'Minh gạt Khoa khỏi phân công gian hàng với lời lẽ coi thường. Thảo bênh bạn, lớp bắt đầu chia phe. Khoa bỏ ra ngồi bàn cuối. Mẹ Khoa nhắn tin vào nhóm phụ huynh chung 41 người.';

            const hintText = this.step8HintLevel === 1
                ? 'Gợi ý 1/2: Trước khi xác định ai đúng ai sai, hãy nghĩ cách để cả lớp không tiếp tục chú ý vào sự việc cá nhân.'
                : 'Gợi ý 2/2: Ưu tiên nguyên tắc Giảm thiểu thiệt hại (P2) để hạ nhiệt ngay, sau đó mới giải quyết mâu thuẫn riêng (P1) và phối hợp phụ huynh (P3).';

            return `
                <div class="mp-card" style="max-width:680px; margin:0 auto; padding:24px;">
                    <div class="mp-kicker" style="color:#d97706;">TẠM DỪNG ĐỂ QUAN SÁT</div>
                    <h2 class="mp-h1" style="font-size:20px; margin:2px 0 10px;">Chuyện gì đang xảy ra, và ai đang bị ảnh hưởng?</h2>

                    <textarea id="mp-step8-input" rows="3" class="mp-input-light" style="width:100%; margin-bottom:14px; font-size:13.5px;"
                              placeholder="Nhận định của bạn...">${escapeHtml(this.step8Answer || defaultObs)}</textarea>

                    <div style="font-weight:700; font-size:13.5px; color:#0f172a; margin-bottom:8px;">
                        Bạn sẽ ưu tiên nguyên tắc nào trước? (chọn một hoặc nhiều)
                    </div>
                    <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px;">
                        <button class="mp-principle-check-btn ${this.step8PrinciplesSelected.includes('P2') ? 'selected' : ''}"
                                onclick="window.ScenarioSystem.toggleStep8Principle('P2')">
                            ${this.step8PrinciplesSelected.includes('P2') ? '✓ ' : ''}↓ Giảm thiểu thiệt hại
                        </button>
                        <button class="mp-principle-check-btn ${this.step8PrinciplesSelected.includes('P1') ? 'selected' : ''}"
                                onclick="window.ScenarioSystem.toggleStep8Principle('P1')">
                            ${this.step8PrinciplesSelected.includes('P1') ? '✓ ' : ''}⚖️ Trung hòa mâu thuẫn
                        </button>
                        <button class="mp-principle-check-btn ${this.step8PrinciplesSelected.includes('P3') ? 'selected' : ''}"
                                onclick="window.ScenarioSystem.toggleStep8Principle('P3')">
                            ${this.step8PrinciplesSelected.includes('P3') ? '✓ ' : ''}🏫 Nhà trường – Gia đình – Xã hội
                        </button>
                    </div>

                    <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:10px 12px; font-size:13px; color:#92400e; margin-bottom:16px;">
                        💡 ${escapeHtml(hintText)}
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <button class="mp-btn-secondary" onclick="window.ScenarioSystem.cycleStep8Hint()">Gợi ý tiếp</button>
                        <button class="mp-btn-primary" onclick="window.ScenarioSystem.submitStep8()">Tiếp tục xử lý ▶</button>
                    </div>
                </div>
            `;
        },

        // ================= BƯỚC 10: HẾT GIỜ / KẾT THÚC =================
        _renderStep10ModalHtml: function () {
            const sc = this.activeScenario;
            const isHomeroom = sc && sc.category === 'homeroom';
            const reason = isHomeroom
                ? 'Mọi bạn đã có việc · Đã hẹn trao đổi với gia đình'
                : 'Báo cáo – thảo luận diễn ra đúng giờ · Mâu thuẫn đã lắng';

            return `
                <div class="mp-card" style="max-width:540px; margin:0 auto; text-align:center; padding:32px 20px;">
                    <div style="font-size:36px; margin-bottom:8px;">🎉</div>
                    <h2 class="mp-h1" style="font-size:22px; margin-bottom:8px;">Buổi luyện đã hoàn thành!</h2>
                    <div class="mp-status-pill-ok" style="display:inline-block; margin-bottom:16px;">
                        ✓ ${escapeHtml(reason)}
                    </div>
                    <p style="font-size:13.5px; color:#475569; line-height:1.5; margin-bottom:20px;">
                        Trước khi xem nhận xét đối chiếu theo 3 nguyên tắc và 6 nhóm văn bản quy phạm, hãy dành 1 phút tự nhìn lại và phản tư cách xử lý của mình.
                    </p>
                    <button class="mp-btn-primary" style="width:100%; padding:12px; font-weight:800;" onclick="window.ScenarioSystem.goToFlowStep(11)">
                        Bắt đầu phản tư ▶
                    </button>
                </div>
            `;
        },

        // ================= BƯỚC 11: KẾT THÚC VÀ PHẢN TƯ (TRANG 14) =================
        _renderStep11Page: function () {
            const sc = this.activeScenario;
            const isHomeroom = sc && sc.category === 'homeroom';
            const endReason = isHomeroom
                ? 'mọi bạn đã có việc · đã hẹn trao đổi với gia đình'
                : 'báo cáo – thảo luận diễn ra đúng giờ · mâu thuẫn đã lắng';

            // Dòng thời gian khoảnh khắc
            const moments = isHomeroom ? [
                { time: '12:22', label: 'Minh gạt Khoa' },
                { time: '12:26', label: 'Nhắc Minh' },
                { time: '12:30', label: 'Tạm dừng' },
                { time: '12:33', label: 'Nhắn mẹ Khoa' },
                { time: '12:38', label: 'Nói riêng Khoa' },
                { time: '12:44', label: 'Đặt tiêu chí' }
            ] : [
                { time: '08:42', label: 'Lan tố Nam' },
                { time: '08:45', label: 'Huy hùa theo' },
                { time: '08:53', label: 'Ra hiệu Huy' },
                { time: '08:54', label: 'Nhắc cả lớp' },
                { time: '08:55', label: 'Nói riêng Lan-Nam' },
                { time: '08:58', label: 'Tự viết lại' }
            ];

            const momentDots = moments.map((m, idx) => `
                <div class="mp-moment-node ${this.selfEvalSelectedMoment === idx ? 'selected' : ''}"
                     onclick="window.ScenarioSystem.selfEvalSelectedMoment = ${idx}; window.ScenarioSystem.renderAll();">
                    <div class="mp-moment-dot"></div>
                    <span class="mp-moment-time">${m.time}</span>
                    <span class="mp-moment-label">${m.label}</span>
                </div>
            `).join('');

            return `
                ${this._renderTopStepperHeader(3, 'Phản tư')}
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                    <div>
                        <div class="mp-kicker">BUỔI LUYỆN ĐÃ KẾT THÚC · PHẢN TƯ</div>
                        <h1 class="mp-h1" style="margin:2px 0 4px;">Nhìn lại trước khi xem nhận xét</h1>
                    </div>
                    <div class="mp-end-reason-badge">
                        Lý do kết thúc: <strong>${escapeHtml(endReason)}</strong>
                    </div>
                </div>

                <!-- 1. DÒNG THỜI GIAN KHOẢNH KHẮC -->
                <div class="mp-card" style="margin-bottom:14px; padding:16px 20px;">
                    <strong style="font-size:13.5px; color:#0f172a;">1. Chọn khoảnh khắc bạn muốn xem lại</strong>
                    <div class="mp-timeline-track" style="margin-top:14px;">
                        ${momentDots}
                    </div>
                </div>

                <div class="mp-step11-grid-2">
                    <!-- 2. BẠN ĐÃ THỰC HIỆN NGUYÊN TẮC NÀO? -->
                    <div class="mp-card">
                        <strong style="font-size:13.5px; color:#0f172a;">2. Bạn đã thực hiện những nguyên tắc nào? Ghi lại minh chứng</strong>
                        <div style="display:flex; flex-direction:column; gap:10px; margin-top:10px;">
                            <label class="mp-checkbox-label">
                                <input type="checkbox" ${this.selfEvalPrinciples.P2 ? 'checked' : ''} onchange="window.ScenarioSystem.toggleSelfEvalPrinciple('P2')">
                                <div>
                                    <strong>Giảm thiểu thiệt hại (P2)</strong>
                                    <div class="mp-ev-desc">Minh chứng: ${escapeHtml(this.selfEvalEvidence.P2)}</div>
                                </div>
                            </label>
                            <label class="mp-checkbox-label">
                                <input type="checkbox" ${this.selfEvalPrinciples.P1 ? 'checked' : ''} onchange="window.ScenarioSystem.toggleSelfEvalPrinciple('P1')">
                                <div>
                                    <strong>Trung hòa mâu thuẫn (P1)</strong>
                                    <div class="mp-ev-desc">Minh chứng: ${escapeHtml(this.selfEvalEvidence.P1)}</div>
                                </div>
                            </label>
                            <label class="mp-checkbox-label">
                                <input type="checkbox" ${this.selfEvalPrinciples.P3 ? 'checked' : ''} onchange="window.ScenarioSystem.toggleSelfEvalPrinciple('P3')">
                                <div>
                                    <strong>Nhà trường – Gia đình – Xã hội (P3)</strong>
                                    <div class="mp-ev-desc">Minh chứng: ${escapeHtml(this.selfEvalEvidence.P3)}</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- 3 & 4. MỨC GIẢI TỎA & CÂU HỎI LÀM LẠI -->
                    <div style="display:flex; flex-direction:column; gap:14px;">
                        <div class="mp-card">
                            <strong style="font-size:13.5px; color:#0f172a;">3. Theo bạn, mâu thuẫn đã được giải tỏa đến đâu?</strong>
                            <div style="display:flex; gap:8px; margin-top:10px;">
                                <button class="mp-pill ${this.selfEvalResolutionLevel === 'still_large' ? 'selected' : ''}"
                                        onclick="window.ScenarioSystem.setSelfEvalResolution('still_large')">Vẫn lớn</button>
                                <button class="mp-pill ${this.selfEvalResolutionLevel === 'reduced' ? 'selected' : ''}"
                                        onclick="window.ScenarioSystem.setSelfEvalResolution('reduced')">Đã nhỏ lại</button>
                                <button class="mp-pill ${this.selfEvalResolutionLevel === 'resolved_monitoring' ? 'selected' : ''}"
                                        onclick="window.ScenarioSystem.setSelfEvalResolution('resolved_monitoring')">Đã lắng, cần theo dõi</button>
                            </div>
                        </div>

                        <div class="mp-card">
                            <strong style="font-size:13.5px; color:#0f172a;">4. Nếu làm lại khoảnh khắc ${moments[this.selfEvalSelectedMoment].time}?</strong>
                            <textarea id="mp-self-retry-input" rows="2" class="mp-input-light" style="margin-top:8px; font-size:13px;"
                                      placeholder="Bạn sẽ thay đổi câu nói hoặc thao tác nào...">${escapeHtml(this.selfEvalRetryThought)}</textarea>
                        </div>
                    </div>
                </div>

                <div class="mp-footer">
                    <button class="mp-btn-secondary" onclick="window.ScenarioSystem.goToFlowStep(9)">Quay lại lớp học</button>
                    <button class="mp-btn-primary" onclick="window.ScenarioSystem.finishToNoScoreReport()">Xem nhận xét ▶</button>
                </div>
            `;
        },

        // ================= BƯỚC 12: NHẬN XÉT TỔNG QUAN – KHÔNG CHẤM ĐIỂM (TRANG 15) =================
        _renderStep12Page: function () {
            const sc = this.activeScenario;
            const isHomeroom = sc && sc.category === 'homeroom';

            const subTabs = `
                <div class="mp-subtabs-row">
                    <button class="mp-subtab ${this.reviewSubTab === 'overview' ? 'active' : ''}" onclick="window.ScenarioSystem.switchReviewSubTab('overview')">Tổng quan (Trang 15)</button>
                    <button class="mp-subtab ${this.reviewSubTab === 'actions' ? 'active' : ''}" onclick="window.ScenarioSystem.switchReviewSubTab('actions')">Từng hành động (Trang 16)</button>
                    <button class="mp-subtab ${this.reviewSubTab === 'model_solution' ? 'active' : ''}" onclick="window.ScenarioSystem.switchReviewSubTab('model_solution')">Giải pháp mẫu (Trang 17)</button>
                    <button class="mp-subtab ${this.reviewSubTab === 'progress' ? 'active' : ''}" onclick="window.ScenarioSystem.switchReviewSubTab('progress')">Hồ sơ tiến bộ (Trang 18)</button>
                </div>
            `;

            if (isHomeroom) {
                // Mockup Trang 15: Gian hàng không có Khoa
                return `
                    ${this._renderTopStepperHeader(3, 'Nhận xét')}
                    ${subTabs}
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                        <div>
                            <div class="mp-kicker">NHẬN XÉT TỔNG QUAN · GIAN HÀNG KHÔNG CÓ KHOA</div>
                            <h1 class="mp-h1" style="margin:2px 0 4px;">Bạn đã đưa tình huống từ “lớn” về “đã lắng” và kết nối được với gia đình</h1>
                        </div>
                        <div class="mp-notice-box-gold">
                            ⚠ Không điểm số, không xếp loại. Nhận xét dựa trên 9 minh chứng trong buổi luyện.
                        </div>
                    </div>

                    <!-- 3 CỘT NGUYÊN TẮC: P2, P1, P3 -->
                    <div class="mp-no-score-grid-3">
                        <!-- CỘT 1: GIẢM THIỂU THIỆT HẠI -->
                        <div class="mp-card mp-principle-col">
                            <div class="mp-col-header">
                                <span class="mp-principle-badge p2">↓ Giảm thiểu thiệt hại</span>
                            </div>
                            <div class="mp-col-body">
                                <div class="mp-col-section">
                                    <strong class="label-ok">Bạn đã làm được:</strong>
                                    <span>tạm dừng phân công và chuyển cả lớp sang việc chung, nên sự chú ý không dồn vào Khoa hay Minh.</span>
                                </div>
                                <div class="mp-quote-box">
                                    12:30 · “Cả lớp dừng phân công một chút, mình cùng đặt tiêu chí trước nhé.”
                                </div>
                                <div class="mp-col-section">
                                    <strong class="label-adjust">Nên điều chỉnh:</strong>
                                    <span>câu nhắc Minh trước lớp ở 12:26 làm mức căng thẳng tăng thêm một bậc trước khi giảm.</span>
                                </div>
                            </div>
                            <div class="mp-col-footer">
                                <span class="mp-law-tag">⚖️ Đ9 k2 e</span>
                                <span class="mp-law-tag">⚖️ Đ12 k1 e</span>
                            </div>
                        </div>

                        <!-- CỘT 2: TRUNG HÒA MÂU THUẪN -->
                        <div class="mp-card mp-principle-col">
                            <div class="mp-col-header">
                                <span class="mp-principle-badge p1">⚖️ Trung hòa mâu thuẫn</span>
                            </div>
                            <div class="mp-col-body">
                                <div class="mp-col-section">
                                    <strong class="label-ok">Bạn đã làm được:</strong>
                                    <span>nghe Khoa trước, rồi nghe Minh, không phân xử ai đúng ai sai trước lớp; cả lớp tự đặt tiêu chí phân công.</span>
                                </div>
                                <div class="mp-quote-box">
                                    12:38 · “Cô muốn nghe em kể, em thích làm phần nào của gian hàng?”
                                </div>
                                <div class="mp-col-section">
                                    <strong class="label-adjust">Nên điều chỉnh:</strong>
                                    <span>chưa hỏi lý do Minh vội vàng (áp lực “đứng nhất”), nên Minh mới chỉ chấp nhận chứ chưa hiểu.</span>
                                </div>
                            </div>
                            <div class="mp-col-footer">
                                <span class="mp-law-tag">⚖️ Đ9 k2 d</span>
                                <span class="mp-law-tag">⚖️ Đ12 k1 đ</span>
                                <span class="mp-law-tag">🏛️ NQ 29</span>
                            </div>
                        </div>

                        <!-- CỘT 3: NHÀ TRƯỜNG – GIA ĐÌNH – XÃ HỘI -->
                        <div class="mp-card mp-principle-col">
                            <div class="mp-col-header">
                                <span class="mp-principle-badge p3">🏫 Nhà trường – Gia đình – Xã hội</span>
                            </div>
                            <div class="mp-col-body">
                                <div class="mp-col-section">
                                    <strong class="label-ok">Bạn đã làm được:</strong>
                                    <span>trả lời phụ huynh bằng tin nhắn riêng, hẹn gọi điện; trong nhóm chung chỉ xác nhận ngắn, không nêu tên học sinh.</span>
                                </div>
                                <div class="mp-quote-box">
                                    12:33 · “Tối nay khoảng 20h em gọi điện cho chị để nghe thêm về Khoa…”
                                </div>
                                <div class="mp-col-section">
                                    <strong class="label-adjust">Nên điều chỉnh:</strong>
                                    <span>có thể cân nhắc thêm kênh tư vấn học đường nếu Khoa bị cô lập kéo dài.</span>
                                </div>
                            </div>
                            <div class="mp-col-footer">
                                <span class="mp-law-tag">⚖️ Đ4 k1 d</span>
                                <span class="mp-law-tag">⚖️ Đ12 k1 g</span>
                                <span class="mp-law-tag">🏛️ NQ 29</span>
                                <span class="mp-law-tag">📋 TT 18/2025</span>
                            </div>
                        </div>
                    </div>

                    <!-- HÀNG DƯỚI: DIỄN BIẾN CĂNG THẲNG & ĐẶT CẠNH TỰ ĐÁNH GIÁ -->
                    <div class="mp-step12-bottom-grid" style="margin-top:14px;">
                        <div class="mp-card">
                            <strong style="font-size:13.5px; color:#0f172a;">Diễn biến mức căng thẳng</strong>
                            <div class="mp-tension-flow" style="margin-top:10px;">
                                <span class="tension-pill red">Lớn · 12:22</span> →
                                <span class="tension-pill red">Lớn hơn · 12:26</span> →
                                <span class="tension-pill orange">Đang giảm · 12:30</span> →
                                <span class="tension-pill yellow">Nhỏ · 12:38</span> →
                                <span class="tension-pill green">Đã lắng · 12:44</span>
                            </div>
                        </div>

                        <div class="mp-card">
                            <strong style="font-size:13.5px; color:#0f172a;">Đặt cạnh tự đánh giá của bạn</strong>
                            <p style="font-size:13px; color:#334155; margin:8px 0 0; line-height:1.5;">
                                Bạn chọn đúng khoảnh khắc 12:26 là điểm chưa ổn, và cách “làm lại” bạn đề xuất trùng với giải pháp mẫu. Bạn đánh giá mâu thuẫn <strong>“đã lắng, cần theo dõi”</strong> – hệ thống hoàn toàn đồng ý.
                            </p>
                        </div>
                    </div>

                    <div class="mp-footer">
                        <button class="mp-btn-secondary" onclick="window.ScenarioSystem.goToFlowStep(11)">Quay lại phản tư</button>
                        <button class="mp-btn-primary" onclick="window.ScenarioSystem.switchReviewSubTab('actions')">Xem từng hành động (Trang 16) ▶</button>
                    </div>
                `;
            } else {
                // Mockup: Bài làm nhờ AI
                return `
                    ${this._renderTopStepperHeader(3, 'Nhận xét')}
                    ${subTabs}
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                        <div>
                            <div class="mp-kicker">NHẬN XÉT TỔNG QUAN · BÀI LÀM NHỜ AI (KHTN 7)</div>
                            <h1 class="mp-h1" style="margin:2px 0 4px;">Bạn đã giải tỏa mâu thuẫn trước lớp, bảo đảm hoạt động Luyện tập tiếp tục</h1>
                        </div>
                        <div class="mp-notice-box-gold">
                            ⚠ Không điểm số, không xếp loại. Nhận xét dựa trên minh chứng trong buổi luyện.
                        </div>
                    </div>

                    <div class="mp-no-score-grid-3">
                        <div class="mp-card mp-principle-col">
                            <div class="mp-col-header"><span class="mp-principle-badge p2">↓ Giảm thiểu thiệt hại</span></div>
                            <div class="mp-col-body">
                                <div class="mp-col-section">
                                    <strong class="label-ok">Bạn đã làm được:</strong>
                                    <span>ra hiệu dừng với Huy và giao việc; thông báo cả lớp tiếp tục làm phiếu, chuyện riêng sẽ trao đổi riêng tại bàn.</span>
                                </div>
                                <div class="mp-quote-box">08:53 · “Huy, em chuẩn bị báo cáo câu 1 cho cả lớp giúp cô nhé.”</div>
                                <div class="mp-col-section">
                                    <strong class="label-adjust">Nên điều chỉnh:</strong>
                                    <span>tránh phân xử hoặc quy kết “chép AI là gian lận” trước lớp khi chưa xác minh minh chứng.</span>
                                </div>
                            </div>
                            <div class="mp-col-footer">
                                <span class="mp-law-tag">⚖️ Đ9 k2 d, e</span>
                                <span class="mp-law-tag">⚖️ TT 30 Đ12</span>
                            </div>
                        </div>

                        <div class="mp-card mp-principle-col">
                            <div class="mp-col-header"><span class="mp-principle-badge p1">⚖️ Trung hòa mâu thuẫn</span></div>
                            <div class="mp-col-body">
                                <div class="mp-col-section">
                                    <strong class="label-ok">Bạn đã làm được:</strong>
                                    <span>lắng nghe cả hai phía tại bàn; ghi nhận công sức tự làm phiếu của Lan; cho Nam cơ hội tự viết lại và ghi chú AI.</span>
                                </div>
                                <div class="mp-quote-box">08:55 · “Cô nghe Lan trước, rồi nghe Nam. Nam, em kể cô nghe em dùng AI thế nào?”</div>
                                <div class="mp-col-section">
                                    <strong class="label-adjust">Nên điều chỉnh:</strong>
                                    <span>nhắc lại chuẩn mực quy định về AI đã phổ biến từ đầu bài.</span>
                                </div>
                            </div>
                            <div class="mp-col-footer">
                                <span class="mp-law-tag">⚖️ Đ9 k2 d</span>
                                <span class="mp-law-tag">📋 TT 02/2025</span>
                            </div>
                        </div>

                        <div class="mp-card mp-principle-col">
                            <div class="mp-col-header"><span class="mp-principle-badge p3">🏫 Nhà trường – Gia đình – Xã hội</span></div>
                            <div class="mp-col-body">
                                <div class="mp-col-section">
                                    <strong class="label-ok">Bạn đã làm được:</strong>
                                    <span>giải quyết trọn vẹn trong phạm vi lớp học mà không làm tổn thương học sinh; chỉ kết nối gia đình khi cần theo dõi thêm.</span>
                                </div>
                                <div class="mp-quote-box">08:58 · “Báo cáo – thảo luận diễn ra đúng giờ.”</div>
                                <div class="mp-col-section">
                                    <strong class="label-adjust">Nên điều chỉnh:</strong>
                                    <span>trao đổi với GVCN để hỗ trợ kỹ năng sử dụng công cụ AI liêm chính.</span>
                                </div>
                            </div>
                            <div class="mp-col-footer">
                                <span class="mp-law-tag">⚖️ CV 5512 HĐ3</span>
                                <span class="mp-law-tag">🏛️ NQ 29</span>
                            </div>
                        </div>
                    </div>

                    <div class="mp-step12-bottom-grid" style="margin-top:14px;">
                        <div class="mp-card">
                            <strong style="font-size:13.5px; color:#0f172a;">Diễn biến mức căng thẳng</strong>
                            <div class="mp-tension-flow" style="margin-top:10px;">
                                <span class="tension-pill orange">Đang tăng · 08:42</span> →
                                <span class="tension-pill yellow">Nhỏ · 08:53</span> →
                                <span class="tension-pill green">Đã lắng · 08:58</span>
                            </div>
                        </div>
                        <div class="mp-card">
                            <strong style="font-size:13.5px; color:#0f172a;">Đối chiếu tự đánh giá</strong>
                            <p style="font-size:13px; color:#334155; margin:8px 0 0; line-height:1.5;">
                                Bạn đã áp dụng chuẩn mực ứng xử sư phạm phù hợp với Điều 9 Luật Nhà giáo 2025 và Thông tư 30/2026.
                            </p>
                        </div>
                    </div>

                    <div class="mp-footer">
                        <button class="mp-btn-secondary" onclick="window.ScenarioSystem.goToFlowStep(11)">Quay lại phản tư</button>
                        <button class="mp-btn-primary" onclick="window.ScenarioSystem.switchReviewSubTab('actions')">Xem từng hành động ▶</button>
                    </div>
                `;
            }
        },

        // ================= TRANG BỔ SUNG: NHẬN XÉT TỪNG HÀNH ĐỘNG (TRANG 16) =================
        _renderActionReviewsPage: function () {
            const sc = this.activeScenario;
            const isHomeroom = sc && sc.category === 'homeroom';

            const subTabs = `
                <div class="mp-subtabs-row">
                    <button class="mp-subtab" onclick="window.ScenarioSystem.switchReviewSubTab('overview')">Tổng quan (Trang 15)</button>
                    <button class="mp-subtab active" onclick="window.ScenarioSystem.switchReviewSubTab('actions')">Từng hành động (Trang 16)</button>
                    <button class="mp-subtab" onclick="window.ScenarioSystem.switchReviewSubTab('model_solution')">Giải pháp mẫu (Trang 17)</button>
                    <button class="mp-subtab" onclick="window.ScenarioSystem.switchReviewSubTab('progress')">Hồ sơ tiến bộ (Trang 18)</button>
                </div>
            `;

            const actionCards = isHomeroom ? [
                {
                    timeStr: '12:26 · Lời nói với cả lớp',
                    status: 'Chưa phù hợp',
                    statusCls: 'warn',
                    quote: '“Minh, lớp trưởng mà nói thế à? Cả lớp thấy có được không?”',
                    desc: 'Phê bình một học sinh trước tập thể khiến Minh mất mặt và lớp chia phe rõ hơn; chuyện nhỏ có nguy cơ thành lớn. Nhà giáo cần tôn trọng người học và thực hiện quy tắc ứng xử.',
                    tags: ['P2', 'Luật NG · Đ9 k2 điểm d', 'TT 30 · Đ6 k4']
                },
                {
                    timeStr: '12:30 · Tạm dừng hoạt động + lời nói',
                    status: 'Phù hợp',
                    statusCls: 'ok',
                    quote: '“Cả lớp dừng phân công một chút, mình cùng đặt tiêu chí trước nhé: mỗi bạn một việc, theo điểm mạnh.”',
                    desc: 'Chuyển sự chú ý từ cá nhân sang nguyên tắc chung; học sinh tự xây dựng quy ước, phát huy tính tích cực, chủ động – đúng định hướng lấy người học làm trung tâm.',
                    tags: ['P2', 'P1', 'NQ 29', 'TT 30 · Đ12 k1 điểm e']
                },
                {
                    timeStr: '12:33 · Bảng kết nối · nhắn riêng',
                    status: 'Phù hợp',
                    statusCls: 'ok',
                    quote: '“Cảm ơn chị đã báo cho em… Tối nay khoảng 20h em gọi điện cho chị để nghe thêm về Khoa.”',
                    desc: 'Phản hồi kịp thời, đúng kênh, giữ kín thông tin học sinh trong nhóm chung; tạo quan hệ tin tưởng với gia đình để cùng giáo dục học sinh.',
                    tags: ['P3', 'TT 30 · Đ12 k1 điểm g', 'NQ 29 · nhà trường – gia đình – xã hội']
                },
                {
                    timeStr: '12:38 · Đi lại gần + nói riêng với Khoa',
                    status: 'Phù hợp',
                    statusCls: 'ok',
                    quote: '“Cô muốn nghe em kể, em thích làm phần nào của gian hàng?”',
                    desc: 'Hỏi về điểm mạnh thay vì hỏi “ai bắt nạt em”, giúp Khoa an toàn để chia sẻ; thể hiện hiểu đối tượng học sinh và tư vấn, hỗ trợ.',
                    tags: ['P1', 'TT 30 · Đ12 k1 điểm đ; Đ4 k1 điểm d', 'Luật NG · Đ9 k2 điểm e']
                }
            ] : [
                {
                    timeStr: '08:53 · Ra hiệu dừng với Huy · Giao nhiệm vụ',
                    status: 'Phù hợp',
                    statusCls: 'ok',
                    quote: '“Huy, em chuẩn bị báo cáo câu 1 cho cả lớp giúp cô nhé.”',
                    desc: 'Giải tỏa đám đông hùa theo, chuyển năng lượng gây rối thành nhiệm vụ học tập có ích.',
                    tags: ['P2', 'Luật NG · Đ9 k2 điểm d, e', 'CV 5512 HĐ3']
                },
                {
                    timeStr: '08:54 · Nói với cả lớp',
                    status: 'Phù hợp',
                    statusCls: 'ok',
                    quote: '“Cả lớp tiếp tục làm phiếu. Chuyện của cặp nào, cô sẽ trao đổi riêng với cặp đó.”',
                    desc: 'Ngăn sự việc lan rộng ra cả lớp, bảo đảm thời gian tiến trình hoạt động 3 đúng 10 phút.',
                    tags: ['P2', 'TT 30 · Đ12 k1 điểm đ, e']
                },
                {
                    timeStr: '08:55 · Đi lại gần bàn Lan – Nam · Nói nhỏ',
                    status: 'Phù hợp',
                    statusCls: 'ok',
                    quote: '“Cô nghe Lan trước, rồi nghe Nam. Lan đã làm những câu nào? Nam, em kể cô nghe em dùng AI thế nào?”',
                    desc: 'Nghe đủ hai phía, không phân xử công khai; tạo không gian an toàn để Nam thừa nhận cách dùng AI.',
                    tags: ['P1', 'TT 22 · Đ4 k4', 'TT 02/2025']
                }
            ];

            const cardsHtml = actionCards.map(c => `
                <div class="mp-action-item-card ${c.statusCls}">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <strong style="font-size:14px; color:#0f172a;">${escapeHtml(c.timeStr)}</strong>
                        <span class="mp-badge-tag ${c.statusCls}">${escapeHtml(c.status)}</span>
                    </div>
                    <div class="mp-quote-box" style="margin-bottom:8px;">${escapeHtml(c.quote)}</div>
                    <div style="font-size:13px; color:#334155; line-height:1.5; margin-bottom:10px;">${escapeHtml(c.desc)}</div>
                    <div style="display:flex; flex-wrap:wrap; gap:6px;">
                        ${c.tags.map(t => `<span class="mp-law-tag">${escapeHtml(t)}</span>`).join('')}
                    </div>
                </div>
            `).join('');

            return `
                ${this._renderTopStepperHeader(3, 'Nhận xét từng hành động')}
                ${subTabs}
                <div class="mp-kicker">NHẬN XÉT TỪNG HÀNH ĐỘNG</div>
                <h1 class="mp-h1" style="margin:2px 0 12px;">Mỗi lời nói, mỗi thao tác được đối chiếu với nguyên tắc và căn cứ</h1>

                <div class="mp-action-cards-grid">
                    ${cardsHtml}
                </div>

                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px; margin-top:16px; font-size:12.5px; color:#475569;">
                    <strong>Cách đọc:</strong> nhãn <em>Phù hợp / Chưa phù hợp</em> chỉ áp dụng cho từng hành động cụ thể so với một quy định cụ thể, không cộng dồn thành điểm hay xếp loại cho cả buổi.
                </div>

                <div class="mp-footer">
                    <button class="mp-btn-secondary" onclick="window.ScenarioSystem.switchReviewSubTab('overview')">Quay lại tổng quan</button>
                    <button class="mp-btn-primary" onclick="window.ScenarioSystem.switchReviewSubTab('model_solution')">Xem giải pháp mẫu (Trang 17) ▶</button>
                </div>
            `;
        },

        // ================= BƯỚC 13: GIẢI PHÁP MẪU · 3 NGUYÊN TẮC (TRANG 17) =================
        _renderStep13Page: function () {
            const sc = this.activeScenario;
            const isHomeroom = sc && sc.category === 'homeroom';

            const subTabs = `
                <div class="mp-subtabs-row">
                    <button class="mp-subtab" onclick="window.ScenarioSystem.switchReviewSubTab('overview')">Tổng quan (Trang 15)</button>
                    <button class="mp-subtab" onclick="window.ScenarioSystem.switchReviewSubTab('actions')">Từng hành động (Trang 16)</button>
                    <button class="mp-subtab active" onclick="window.ScenarioSystem.switchReviewSubTab('model_solution')">Giải pháp mẫu (Trang 17)</button>
                    <button class="mp-subtab" onclick="window.ScenarioSystem.switchReviewSubTab('progress')">Hồ sơ tiến bộ (Trang 18)</button>
                </div>
            `;

            if (isHomeroom) {
                // Mockup Trang 17: Gian hàng không có Khoa
                return `
                    ${this._renderTopStepperHeader(3, 'Giải pháp mẫu')}
                    ${subTabs}
                    <div class="mp-kicker">GIẢI PHÁP MẪU · ĐI THEO BA NGUYÊN TẮC</div>
                    <h1 class="mp-h1" style="margin:2px 0 14px;">Giải tỏa trước, trung hòa sau, phối hợp để theo dõi lâu dài</h1>

                    <div class="mp-model-grid-3">
                        <!-- BƯỚC 1 -->
                        <div class="mp-card mp-model-col">
                            <div class="step-num-badge">1</div>
                            <strong style="font-size:14.5px; color:#0f172a;">Giải tỏa tại chỗ</strong>
                            <span class="mp-principle-badge p2" style="margin:4px 0 8px;">Giảm thiểu thiệt hại</span>
                            <p style="font-size:13px; color:#475569; line-height:1.45;">
                                Dừng hoạt động đang gây căng thẳng, chuyển sự chú ý sang quy ước chung. Không nêu tên ai trước lớp.
                            </p>
                            <div class="mp-quote-box" style="margin:10px 0;">
                                “Cả lớp dừng phân công một chút, mình cùng đặt tiêu chí trước: mỗi bạn một việc, theo điểm mạnh.”
                            </div>
                            <div style="margin-top:auto; font-size:11.5px; color:#64748b;">⚖️ Đ9 k2 e · Đ12 k1 e</div>
                        </div>

                        <!-- BƯỚC 2 -->
                        <div class="mp-card mp-model-col">
                            <div class="step-num-badge">2</div>
                            <strong style="font-size:14.5px; color:#0f172a;">Nghe riêng từng phía</strong>
                            <span class="mp-principle-badge p1" style="margin:4px 0 8px;">Trung hòa mâu thuẫn</span>
                            <p style="font-size:13px; color:#475569; line-height:1.45;">
                                Nghe Khoa trước, sau đó nghe Minh; ghi nhận mong muốn chính đáng của Minh rồi mới bàn cách sửa.
                            </p>
                            <div class="mp-quote-box" style="margin:10px 0;">
                                “Khoa, cô muốn nghe em kể, em thích làm phần nào? · Minh, cô biết em muốn gian hàng thật tốt. Mình cùng tìm cách để bạn nào cũng góp sức nhé.”
                            </div>
                            <div style="margin-top:auto; font-size:11.5px; color:#64748b;">⚖️ Đ9 k2 d · Đ12 k1 đ</div>
                        </div>

                        <!-- BƯỚC 3 -->
                        <div class="mp-card mp-model-col">
                            <div class="step-num-badge">3</div>
                            <strong style="font-size:14.5px; color:#0f172a;">Phối hợp đúng kênh</strong>
                            <span class="mp-principle-badge p3" style="margin:4px 0 8px;">Nhà trường – Gia đình – Xã hội</span>
                            <p style="font-size:13px; color:#475569; line-height:1.45;">
                                Nhắn riêng phụ huynh, xác nhận ngắn trong nhóm chung; nếu cần, lập phiếu chuyển tổ tư vấn; giao chi đội cùng theo dõi việc phân công.
                            </p>
                            <div class="mp-quote-box" style="margin:10px 0;">
                                “Cảm ơn chị đã báo. Tối nay em gọi điện để nghe thêm về Khoa và cùng bàn cách giúp con.”
                            </div>
                            <div style="margin-top:auto; font-size:11.5px; color:#64748b;">⚖️ Đ4 k1 d; Đ12 k1 g · NQ 29 · TT 18/2025</div>
                        </div>
                    </div>

                    <div class="mp-step17-extra-grid" style="margin-top:14px;">
                        <div class="mp-card" style="background:#fef2f2; border-color:#fecaca;">
                            <strong style="font-size:13.5px; color:#991b1b;">Nếu phụ huynh vẫn bức xúc</strong>
                            <p style="font-size:12.5px; color:#7f1d1d; margin:4px 0 0; line-height:1.45;">
                                Đề nghị gặp trực tiếp tại trường, có thể mời thêm cán bộ tư vấn; không tranh luận trên nhóm chung.
                            </p>
                        </div>
                        <div class="mp-card" style="background:#fff7ed; border-color:#fed7aa;">
                            <strong style="font-size:13.5px; color:#9a3412;">Điều nên tránh</strong>
                            <p style="font-size:12.5px; color:#7c2d12; margin:4px 0 0; line-height:1.45;">
                                Phê bình lớp trưởng trước lớp; ép xin lỗi ngay; trả lời phụ huynh kiểu “chuyện trẻ con”.
                            </p>
                        </div>
                        <div class="mp-card" style="display:flex; flex-direction:column; justify-content:center; gap:8px;">
                            <button class="mp-btn-primary" style="background:#b91c1c; border-color:#991b1b;" onclick="window.ScenarioSystem.goToFlowStep(9)">
                                ↺ Nói thử lại khoảnh khắc 12:26
                            </button>
                            <button class="mp-btn-secondary" onclick="window.ScenarioSystem.startScenarioFromStep5()">
                                Luyện lại cả tình huống
                            </button>
                        </div>
                    </div>

                    <div class="mp-footer">
                        <button class="mp-btn-secondary" onclick="window.ScenarioSystem.switchReviewSubTab('actions')">Quay lại từng hành động</button>
                        <button class="mp-btn-primary" onclick="window.ScenarioSystem.switchReviewSubTab('progress')">Xem hồ sơ tiến bộ (Trang 18) ▶</button>
                    </div>
                `;
            } else {
                // Mockup: Bài làm nhờ AI
                return `
                    ${this._renderTopStepperHeader(3, 'Giải pháp mẫu')}
                    ${subTabs}
                    <div class="mp-kicker">GIẢI PHÁP MẪU · ĐI THEO BA NGUYÊN TẮC</div>
                    <h1 class="mp-h1" style="margin:2px 0 14px;">Giải tỏa trước, lắng nghe riêng, bám sát kế hoạch bài dạy</h1>

                    <div class="mp-model-grid-3">
                        <div class="mp-card mp-model-col">
                            <div class="step-num-badge">1</div>
                            <strong style="font-size:14.5px; color:#0f172a;">Giải tỏa tại chỗ</strong>
                            <span class="mp-principle-badge p2" style="margin:4px 0 8px;">Giảm thiểu thiệt hại</span>
                            <p style="font-size:13px; color:#475569; line-height:1.45;">
                                Ra hiệu dừng với học sinh hùa theo và giao nhiệm vụ có ích; yêu cầu cả lớp tiếp tục làm phiếu.
                            </p>
                            <div class="mp-quote-box" style="margin:10px 0;">
                                “Huy, em chuẩn bị báo cáo câu 1 cho cả lớp giúp cô nhé. Cả lớp tiếp tục làm phiếu, chuyện riêng cô sẽ hỗ trợ tại bàn.”
                            </div>
                        </div>
                        <div class="mp-card mp-model-col">
                            <div class="step-num-badge">2</div>
                            <strong style="font-size:14.5px; color:#0f172a;">Nghe riêng hai phía</strong>
                            <span class="mp-principle-badge p1" style="margin:4px 0 8px;">Trung hòa mâu thuẫn</span>
                            <p style="font-size:13px; color:#475569; line-height:1.45;">
                                Đến tận bàn, nghe Lan trước để giải tỏa bất công, sau đó lắng nghe Nam giải thích cách dùng AI.
                            </p>
                            <div class="mp-quote-box" style="margin:10px 0;">
                                “Cảm ơn em đã nói thật. Em tự viết lại câu 2, 3 bằng lời của mình, phần nào lấy từ AI thì ghi chú nhé. Lan, cô ghi nhận em đã tự làm cả phiếu.”
                            </div>
                        </div>
                        <div class="mp-card mp-model-col">
                            <div class="step-num-badge">3</div>
                            <strong style="font-size:14.5px; color:#0f172a;">Tiếp tục giờ học</strong>
                            <span class="mp-principle-badge p3" style="margin:4px 0 8px;">Bám sát kế hoạch</span>
                            <p style="font-size:13px; color:#475569; line-height:1.45;">
                                Giữ đúng tiến độ 10 phút của Hoạt động 3 Luyện tập, chuyển sang bước báo cáo – thảo luận đúng giờ.
                            </p>
                            <div class="mp-quote-box" style="margin:10px 0;">
                                “Hết thời gian làm phiếu, cô mời nhóm bạn Huy lên trình bày câu 1!”
                            </div>
                        </div>
                    </div>

                    <div class="mp-footer">
                        <button class="mp-btn-secondary" onclick="window.ScenarioSystem.switchReviewSubTab('actions')">Quay lại</button>
                        <button class="mp-btn-primary" onclick="window.ScenarioSystem.switchReviewSubTab('progress')">Xem hồ sơ tiến bộ ▶</button>
                    </div>
                `;
            }
        },

        // ================= BƯỚC 14: HỒ SƠ TIẾN BỘ (TRANG 18) =================
        _renderStep14Page: function () {
            const subTabs = `
                <div class="mp-subtabs-row">
                    <button class="mp-subtab" onclick="window.ScenarioSystem.switchReviewSubTab('overview')">Tổng quan (Trang 15)</button>
                    <button class="mp-subtab" onclick="window.ScenarioSystem.switchReviewSubTab('actions')">Từng hành động (Trang 16)</button>
                    <button class="mp-subtab" onclick="window.ScenarioSystem.switchReviewSubTab('model_solution')">Giải pháp mẫu (Trang 17)</button>
                    <button class="mp-subtab active" onclick="window.ScenarioSystem.switchReviewSubTab('progress')">Hồ sơ tiến bộ (Trang 18)</button>
                </div>
            `;

            // Bảng các buổi luyện mẫu (Trang 18)
            const rows = [
                { date: '12/11', name: 'Lúc nào cũng là Huy', type: 'Giảng dạy · Khởi động', p2: false, p1: true, p3: false },
                { date: '15/11', name: 'Bài làm nhờ AI', type: 'Giảng dạy · Luyện tập', p2: true, p1: true, p3: false },
                { date: '19/11', name: 'Gian hàng không có Khoa', type: 'Chủ nhiệm · Trải nghiệm', p2: true, p1: true, p3: true }
            ].map(r => `
                <tr>
                    <td>${r.date}</td>
                    <td><strong>${r.name}</strong></td>
                    <td>${r.type}</td>
                    <td style="text-align:center;">${r.p2 ? '<span class="mp-dot-filled brown">●</span>' : '<span class="mp-dot-empty">○</span>'}</td>
                    <td style="text-align:center;">${r.p1 ? '<span class="mp-dot-filled teal">●</span>' : '<span class="mp-dot-empty">○</span>'}</td>
                    <td style="text-align:center;">${r.p3 ? '<span class="mp-dot-filled green">●</span>' : '<span class="mp-dot-empty">○</span>'}</td>
                </tr>
            `).join('');

            return `
                ${this._renderTopStepperHeader(4, 'Hồ sơ tiến bộ')}
                ${subTabs}
                <div class="mp-kicker">HỒ SƠ TIẾN BỘ</div>
                <h1 class="mp-h1" style="margin:2px 0 14px;">Hành trình của bạn qua 3 buổi luyện</h1>

                <div class="mp-step18-grid-2">
                    <!-- BẢNG CÁC BUỔI LUYỆN -->
                    <div class="mp-card">
                        <table class="mp-progress-table">
                            <thead>
                                <tr>
                                    <th>NGÀY</th>
                                    <th>TÌNH HUỐNG</th>
                                    <th>LOẠI</th>
                                    <th style="text-align:center;">P2</th>
                                    <th style="text-align:center;">P1</th>
                                    <th style="text-align:center;">P3</th>
                                </tr>
                            </thead>
                            <tbody>${rows}</tbody>
                        </table>
                        <div style="font-size:12px; color:#64748b; margin-top:8px;">
                            <em>Chấm tròn đặc:</em> có ít nhất một minh chứng thực hiện nguyên tắc trong buổi đó. Không cộng điểm, không xếp hạng.
                        </div>
                    </div>

                    <!-- NHỮNG BỐI CẢNH ĐÃ LUYỆN -->
                    <div class="mp-card">
                        <strong style="font-size:13.5px; color:#0f172a;">Những bối cảnh đã luyện</strong>
                        <div style="margin-top:10px;">
                            <div style="font-size:11.5px; font-weight:800; color:#64748b;">GIẢNG DẠY</div>
                            <div class="mp-context-chips" style="margin:6px 0 12px;">
                                <span class="mp-ctx-chip done">✓ Khởi động</span>
                                <span class="mp-ctx-chip">Hình thành kiến thức</span>
                                <span class="mp-ctx-chip done">✓ Luyện tập</span>
                                <span class="mp-ctx-chip">Vận dụng thực tế</span>
                            </div>

                            <div style="font-size:11.5px; font-weight:800; color:#64748b;">CHỦ NHIỆM</div>
                            <div class="mp-context-chips" style="margin-top:6px;">
                                <span class="mp-ctx-chip">Sinh hoạt lớp</span>
                                <span class="mp-ctx-chip">Đoàn – Đội</span>
                                <span class="mp-ctx-chip done">✓ Hoạt động trải nghiệm</span>
                                <span class="mp-ctx-chip">Ngoại khóa</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mp-step18-bottom-grid" style="margin-top:14px;">
                    <!-- ĐIỀU ĐÃ CHUYỂN BIẾN -->
                    <div class="mp-card">
                        <strong style="font-size:13.5px; color:#0f172a;">Điều đã chuyển biến</strong>
                        <p style="font-size:13px; color:#334155; margin:8px 0 0; line-height:1.55;">
                            Ở buổi đầu, bạn xử lý bằng cách nhắc trực tiếp học sinh trước lớp. Đến buổi thứ ba, bạn <strong>tạm dừng hoạt động trước, nói riêng sau</strong>, và lần đầu tiên <strong>chủ động kết nối với gia đình</strong>. Điều còn lặp lại: câu nhắc đầu tiên vẫn hướng vào cá nhân (12:26).
                        </p>
                    </div>

                    <!-- GỢI Ý BUỔI TIẾP THEO -->
                    <div class="mp-card" style="background:#eff6ff; border-color:#bfdbfe;">
                        <strong style="font-size:13.5px; color:#1e40af;">Gợi ý buổi tiếp theo</strong>
                        <p style="font-size:13px; color:#1e3a8a; margin:6px 0 12px; line-height:1.5;">
                            <strong>“Bầu lại lớp trưởng”</strong> – Chủ nhiệm · Sinh hoạt lớp. Luyện câu nhắc đầu tiên không hướng vào cá nhân; bối cảnh bạn chưa thử.
                        </p>
                        <button class="mp-btn-primary" style="background:#b91c1c; border-color:#991b1b; padding:8px 18px;"
                                onclick="window.ScenarioSystem.selectScenarioInSetup(4); window.ScenarioSystem.goToFlowStep(5);">
                            Bắt đầu
                        </button>
                    </div>
                </div>

                <div class="mp-footer">
                    <button class="mp-btn-secondary" onclick="window.ScenarioSystem.goToFlowStep(3)">Chọn tình huống khác</button>
                    <button class="mp-btn-primary" onclick="window.ScenarioSystem.startScenarioFromStep5()">Luyện lại</button>
                </div>
            `;
        },

        // ================= HUD TRONG LỚP HỌC 3D (TRANG 4, 6, 7, 8, 11, 12) =================
        renderInClassHud: function () {
            const panel = document.getElementById('sim-panel');
            if (!panel) return;

            const visible = !this.wizardClosedForRoam && this.flowStep >= 6 && this.flowStep <= 10;
            if (!visible || !this.activeScenario) {
                panel.classList.add('hidden');
                panel.className = 'hidden';
                return;
            }

            const sc = this.activeScenario;
            const isHomeroom = sc.category === 'homeroom';
            const listening = Boolean(window.SpeechEngine && window.SpeechEngine.isListening);
            const pauseSuffix = this.isPaused ? ' · Đã tạm dừng' : '';

            panel.className = 'class3d-shell';

            // Top Bar
            const topBarHtml = `
                <div class="c3d-topbar">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <button class="c3d-pill-dark" onclick="window.ScenarioSystem.goToFlowStep(5)">⬅ Bối cảnh</button>
                        <button class="c3d-pill-dark" onclick="window.ScenarioSystem.replayCurrentIncident()">↺ Nghe lại</button>
                        <span class="c3d-pill-dark">⏱ <span id="c3d-timer-val">${formatClock(this.sessionElapsedSec)} / ${formatClock(this.sessionDurationSec)}</span>${pauseSuffix}</span>
                        <span class="c3d-pill-mode ${this.selectedMode === 'realistic' ? 'c3d-pill-challenge' : ''}">
                            ${this.selectedMode === 'realistic' ? 'Thử thách' : 'Luyện tập'}
                        </span>
                        <span class="c3d-pill-dark">
                            ${isHomeroom ? 'Lớp 8B · Sinh hoạt lớp · Hội chợ Xuân' : 'Lớp 7A · KHTN · Hoạt động 3: Luyện tập'}
                        </span>
                    </div>

                    <!-- MỨC CĂNG THẲNG (CHỈ Ở LUYỆN TẬP) -->
                    ${this.selectedMode === 'guided' ? `
                        <div style="display:flex; align-items:center; gap:6px;">
                            <span style="font-size:12px; color:#cbd5e1; font-weight:700;">Mức căng thẳng</span>
                            <div class="c3d-tension-indicator ${this.tensionLevel.toLowerCase().replace(/\s+/g, '-')}">
                                <span class="dot"></span>
                                <strong>${this.tensionLevel}</strong>
                            </div>
                        </div>
                    ` : ''}

                    <div style="display:flex; align-items:center; gap:8px;">
                        <button class="c3d-pill-dark" onclick="window.ScenarioSystem.togglePracticePause()">${this.isPaused ? '▶ Tiếp' : '⏸ Tạm dừng'}</button>
                        <button class="c3d-pill-dark" style="background:#15803d; border-color:#22c55e; font-weight:800;" onclick="window.ScenarioSystem.finishPracticePhase()">Kết thúc</button>
                    </div>
                </div>
            `;

            // Toast Phụ huynh (Trang 11)
            const parentToastHtml = (isHomeroom && this.parentToastVisible) ? `
                <div class="c3d-parent-notify-toast" onclick="window.ScenarioSystem.openConnectionModal('parents')">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <span style="font-weight:800; font-size:12.5px; color:#1e3a8a;">Nhóm Phụ huynh lớp 8B · 41 thành viên</span>
                        <span style="font-size:11px; color:#64748b;">vừa xong</span>
                    </div>
                    <div style="font-size:13px; color:#0f172a; line-height:1.4;">
                        <strong>Mẹ Khoa:</strong> Cô ơi, con tôi về kể bị các bạn gạt ra mấy tuần nay rồi. Lớp mình có chuyện gì vậy cô? Mong cô trả lời.
                    </div>
                </div>
            ` : '';

            // Thẻ nhắc nhở tức thời (Nhánh B - Trang 8)
            const instantWarningHtml = this.instantWarning ? `
                <div class="c3d-instant-warning-card">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
                        <div style="flex:1;">
                            <div style="font-weight:800; font-size:13px; color:#b91c1c; margin-bottom:4px;">
                                ⚠️ Lưu ý (chế độ Luyện tập):
                            </div>
                            <div style="font-size:12.5px; color:#450a0a; line-height:1.45;">
                                ${escapeHtml(this.instantWarning.text)}
                            </div>
                            <div style="margin-top:8px; display:flex; gap:6px; align-items:center;">
                                <span class="mp-law-tag">${escapeHtml(this.instantWarning.lawRefs)}</span>
                                <span class="mp-principle-badge p2">↓ ${escapeHtml(this.instantWarning.principle)}</span>
                            </div>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:6px;">
                            <button class="mp-btn-primary" style="background:#b91c1c; border-color:#991b1b; padding:6px 14px; font-size:12px;"
                                    onclick="window.ScenarioSystem.retryBranchB()">
                                ↺ Nói lại
                            </button>
                            <button class="mp-btn-secondary" style="padding:6px 14px; font-size:12px;"
                                    onclick="window.ScenarioSystem.dismissInstantWarning()">
                                Tiếp tục
                            </button>
                        </div>
                    </div>
                </div>
            ` : '';

            // Bảng kết nối 3 bên Modal (Trang 12)
            const connectionModalHtml = this.connectionModalOpen ? `
                <div class="c3d-connection-modal-backdrop">
                    <div class="c3d-connection-card">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid #e2e8f0; padding-bottom:8px;">
                            <strong style="font-size:15px; color:#0f172a;">🏫 Bảng kết nối</strong>
                            <span style="font-size:12px; color:#64748b;">Nhà trường – Gia đình – Xã hội</span>
                        </div>

                        <div class="mp-tabs-bar" style="margin-bottom:14px;">
                            <button class="mp-tab-btn ${this.connectionTab === 'parents' ? 'active' : ''}" onclick="window.ScenarioSystem.switchConnectionTab('parents')">Cha mẹ học sinh</button>
                            <button class="mp-tab-btn ${this.connectionTab === 'counseling' ? 'active' : ''}" onclick="window.ScenarioSystem.switchConnectionTab('counseling')">Tổ tư vấn</button>
                            <button class="mp-tab-btn ${this.connectionTab === 'chidoi' ? 'active' : ''}" onclick="window.ScenarioSystem.switchConnectionTab('chidoi')">Chi đội 8B</button>
                        </div>

                        ${this.connectionTab === 'parents' ? `
                            <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px;">
                                <button class="mp-pill ${this.connectionTargetChannel === 'group_reply' ? 'selected' : ''}" onclick="window.ScenarioSystem.selectConnectionChannel('group_reply')">✕ Trả lời trong nhóm chung</button>
                                <button class="mp-pill ${this.connectionTargetChannel === 'private_msg' ? 'selected' : ''}" onclick="window.ScenarioSystem.selectConnectionChannel('private_msg')">✓ Nhắn riêng mẹ Khoa</button>
                                <button class="mp-pill ${this.connectionTargetChannel === 'phone' ? 'selected' : ''}" onclick="window.ScenarioSystem.selectConnectionChannel('phone')">Gọi điện</button>
                                <button class="mp-pill ${this.connectionTargetChannel === 'meet' ? 'selected' : ''}" onclick="window.ScenarioSystem.selectConnectionChannel('meet')">Hẹn gặp</button>
                            </div>

                            <strong style="font-size:12px; color:#64748b; text-transform:uppercase;">TIN NHẮN RIÊNG · BẢN NHÁP CỦA BẠN</strong>
                            <textarea id="c3d-conn-draft" rows="4" class="mp-input-light" style="width:100%; margin:6px 0 10px; font-size:13px;">${escapeHtml(this.connectionDraftText)}</textarea>

                            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:8px 12px; margin-bottom:10px;">
                                <strong style="font-size:11.5px; color:#475569; text-transform:uppercase;">TRONG NHÓM CHUNG:</strong>
                                <div style="font-size:12.5px; color:#0f172a; margin-top:2px;">
                                    “Cô đã nhận được tin và sẽ trao đổi riêng với gia đình ạ.” (một câu ngắn, không nêu tên học sinh)
                                </div>
                            </div>

                            <div style="font-size:12px; color:#0369a1; background:#f0f9ff; padding:8px 10px; border-radius:6px; margin-bottom:14px;">
                                💡 <strong>Gợi ý kênh tiếp theo:</strong> nếu Khoa có dấu hiệu bị cô lập kéo dài, lập phiếu chuyển tư vấn học đường cho em.
                            </div>
                        ` : `
                            <div style="padding:20px; text-align:center; color:#64748b; font-size:13px;">
                                Kênh ${this.connectionTab === 'counseling' ? 'Tổ tư vấn học đường' : 'Chi đội 8B'} đã được liên kết và theo dõi.
                            </div>
                        `}

                        <div style="display:flex; justify-content:flex-end; gap:8px;">
                            <button class="mp-btn-secondary" onclick="window.ScenarioSystem.closeConnectionModal()">Đóng</button>
                            <button class="mp-btn-primary" onclick="window.ScenarioSystem.sendConnectionMessage()">Gửi tin nhắn</button>
                        </div>
                    </div>
                </div>
            ` : '';

            // Action Dock 4 nhóm (Trang 6)
            const dockHtml = `
                <div class="c3d-action-dock-4groups">
                    <!-- NHÓM 1: LỜI NÓI -->
                    <div class="c3d-action-group">
                        <span class="group-title">LỜI NÓI</span>
                        <button class="c3d-dock-action-btn" onclick="window.ScenarioSystem.executeAction('speak_all')">
                            <span>Nói với cả lớp</span>
                            <span class="btn-sub">Giữ Space</span>
                            <span class="p-tag p2">P2</span>
                        </button>
                        <button class="c3d-dock-action-btn" onclick="window.ScenarioSystem.executeAction('speak_private')">
                            <span>Nói riêng một em</span>
                            <span class="btn-sub">Đi lại gần + nói nhỏ</span>
                            <span class="p-tag p1">P1·P2</span>
                        </button>
                        <button class="c3d-dock-action-btn" onclick="window.ScenarioSystem.showManualTextInput = !window.ScenarioSystem.showManualTextInput; window.ScenarioSystem.renderInClassHud();">
                            <span>Gõ câu nói</span>
                            <span class="btn-sub">Khi không tiện nói</span>
                        </button>
                    </div>

                    <!-- NHÓM 2: PHI NGÔN NGỮ -->
                    <div class="c3d-action-group">
                        <span class="group-title">PHI NGÔN NGỮ</span>
                        <button class="c3d-dock-action-btn" onclick="window.ScenarioSystem.executeAction('nonverbal_stop')">
                            <span>Nhìn, ra hiệu dừng</span>
                            <span class="btn-sub">Với Huy, với cả lớp</span>
                            <span class="p-tag p2">P2</span>
                        </button>
                        <button class="c3d-dock-action-btn" onclick="window.ScenarioSystem.executeAction('nonverbal_sit')">
                            <span>Mời ngồi xuống</span>
                            <span class="btn-sub">Hạ nhiệt</span>
                            <span class="p-tag p2">P2</span>
                        </button>
                        <button class="c3d-dock-action-btn" onclick="window.ScenarioSystem.executeAction('nonverbal_wait')">
                            <span>Im lặng chờ</span>
                            <span class="btn-sub">Chờ lớp ổn định</span>
                            <span class="p-tag p2">P2</span>
                        </button>
                    </div>

                    <!-- NHÓM 3: TỔ CHỨC LỚP -->
                    <div class="c3d-action-group">
                        <span class="group-title">TỔ CHỨC LỚP</span>
                        <button class="c3d-dock-action-btn" onclick="window.ScenarioSystem.executeAction('org_pause')">
                            <span>Tạm dừng hoạt động</span>
                            <span class="btn-sub">Làm việc cá nhân 2 phút</span>
                            <span class="p-tag p2">P2</span>
                        </button>
                        <button class="c3d-dock-action-btn" onclick="window.ScenarioSystem.executeAction('org_split')">
                            <span>Chia lại nhóm</span>
                            <span class="btn-sub">Tạm tách cặp</span>
                            <span class="p-tag p1">P1</span>
                        </button>
                        <button class="c3d-dock-action-btn" onclick="window.ScenarioSystem.executeAction('org_assign')">
                            <span>Giao nhiệm vụ</span>
                            <span class="btn-sub">${isHomeroom ? 'Khoa vẽ biển hiệu' : 'Huy chuẩn bị báo cáo'}</span>
                            <span class="p-tag p2">P2</span>
                        </button>
                        <button class="c3d-dock-action-btn" onclick="window.ScenarioSystem.executeAction('org_rules')">
                            <span>Chỉ quy định / Tiêu chí</span>
                            <span class="btn-sub">Đưa lên bảng</span>
                            <span class="p-tag p1">P1</span>
                        </button>
                    </div>

                    <!-- NHÓM 4: KẾT NỐI -->
                    <div class="c3d-action-group">
                        <span class="group-title">KẾT NỐI</span>
                        <button class="c3d-dock-action-btn" onclick="window.ScenarioSystem.executeAction('conn_meet')">
                            <span>Hẹn gặp riêng sau giờ</span>
                            <span class="btn-sub">${isHomeroom ? 'Với Minh và Khoa' : 'Với Lan và Nam'}</span>
                            <span class="p-tag p1">P1</span>
                        </button>
                        <button class="c3d-dock-action-btn" onclick="window.ScenarioSystem.executeAction('conn_parents')">
                            <span>Trao đổi với phụ huynh</span>
                            <span class="btn-sub">Mở Bảng kết nối</span>
                            <span class="p-tag p3">P3</span>
                        </button>
                        <button class="c3d-dock-action-btn" onclick="window.ScenarioSystem.executeAction('conn_report')">
                            <span>Báo GV chủ nhiệm / Tư vấn</span>
                            <span class="btn-sub">Khi cần theo dõi thêm</span>
                            <span class="p-tag p3">P3</span>
                        </button>
                    </div>
                </div>
            `;

            // Ô gõ phím khi bật
            const keyboardBarHtml = this.showManualTextInput ? `
                <div class="c3d-keyboard-bar">
                    <input id="c3d-custom-input" type="text" class="c3d-speech-input"
                           placeholder="Gõ câu xử lý sư phạm của thầy cô (Enter để gửi)..."
                           onkeydown="if(event.key==='Enter'){ window.ScenarioSystem.submitTeacherUtterance(this.value); }">
                    <button class="mp-btn-primary" onclick="const el=document.getElementById('c3d-custom-input'); if(el) window.ScenarioSystem.submitTeacherUtterance(el.value);">Gửi</button>
                </div>
            ` : '';

            // Drawer Lời thoại bên phải
            const drawerHtml = `
                <aside class="c3d-drawer">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <strong style="font-size:14px; color:#ffffff;">Lời thoại</strong>
                        <span style="font-size:11.5px; color:#94a3b8;">Đọc lại học sinh đã nói gì</span>
                    </div>
                    <div class="c3d-drawer-log" id="c3d-log-scroll">
                        ${this.transcriptLog.map(entry => `
                            <div class="c3d-log-card ${entry.role === 'teacher' ? 'teacher' : (entry.role === 'action' ? 'action' : '')}">
                                <div style="font-size:11px; font-weight:700; color:${entry.role === 'teacher' ? '#93c5fd' : (entry.role === 'action' ? '#a78bfa' : '#fbbf24')}; margin-bottom:2px;">
                                    ${escapeHtml(entry.speaker)} · ${formatClock(entry.timestampSec)}
                                </div>
                                <div style="line-height:1.45;">${escapeHtml(entry.text)}</div>
                            </div>
                        `).join('')}
                    </div>
                </aside>
            `;

            panel.innerHTML = `
                ${topBarHtml}
                ${parentToastHtml}
                ${instantWarningHtml}
                ${connectionModalHtml}
                <div class="c3d-middle">
                    ${drawerHtml}
                </div>
                ${keyboardBarHtml}
                ${dockHtml}
            `;

            const logScroll = document.getElementById('c3d-log-scroll');
            if (logScroll) logScroll.scrollTop = logScroll.scrollHeight;
        },

        // Phím tắt tương thích
        closeWizardForRoam: function () {
            if (window.ClassroomGame && window.ClassroomGame.setFlowPhase) {
                window.ClassroomGame.setFlowPhase('free');
            }
            this.wizardClosedForRoam = true;
            this.renderAll();
        },
        openGuideModal: function () { this.goToFlowStep(1); },
        openScenariosModal: function () { this.goToFlowStep(3); },
        openStudentsModal: function () { this.goToFlowStep(5); }
    };

    window.ScenarioSystem = ScenarioSystem;
    window.ScenarioManager = ScenarioSystem;

    window.addEventListener('DOMContentLoaded', () => {
        ScenarioSystem.init();
    });
})();
