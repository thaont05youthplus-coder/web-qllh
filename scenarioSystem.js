// scenarioSystem.js - Hệ thống Mô phỏng Sư phạm 14 Bước (chuẩn Mockup + Luật Nhà giáo 73/2025/QH15)
(function () {
    'use strict';

    const PROGRESS_STORAGE_KEY = 'qllh_3d_group_progress_v1';

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

    function encodeArg(str) {
        return encodeURIComponent(String(str || '')).replace(/'/g, '%27');
    }

    function formatClock(totalSeconds) {
        const sec = Math.max(0, Math.floor(totalSeconds || 0));
        const m = String(Math.floor(sec / 60)).padStart(2, '0');
        const s = String(sec % 60).padStart(2, '0');
        return `${m}:${s}`;
    }

    function parseDurationSec(durationText) {
        const match = String(durationText || '').match(/(\d+)/);
        return match ? parseInt(match[1], 10) * 60 : 360;
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
        lawCriteria: {},
        mbtiGroups: [],
        teacherPersonas: [],
        voiceModes: [],
        gradeLevels: [],
        scenarioGroups: [],
        difficulties: [],
        stepsMeta: [],

        // Trạng thái 14 bước
        flowStep: 1,
        maxReachedStep: 1,
        wizardClosedForRoam: false,

        // Bước 1: Thử micro
        step1Verified: false,
        step1HeardText: '',

        // Bước 2: Giới tính, nhân vật 16 MBTI & giọng giáo viên
        selectedTeacherGender: 'female',
        selectedMbtiGroup: 'all',
        selectedTeacherId: 'intj_minh_thu',
        teacherDisplayName: 'Cô Minh Thư',
        teacherNameEdited: false,
        selectedVoiceId: 'female_young',

        // Bước 3: Cấp học & khối lớp
        selectedGradeId: 'thcs',
        selectedGradeNumber: 7,

        // Bước 4: Nhóm tình huống, chế độ & độ khó
        selectedGroupId: 'group_participation',
        selectedScenarioId: 2,
        selectedMode: 'guided', // 'guided' (Luyện tập) | 'realistic' (Thử thách)
        selectedDifficulty: 'easy', // 'easy' | 'medium' | 'hard'
        showDirectPickerInStep4: false,

        // Trạng thái trong lớp học 3D (Bước 6–10)
        activeScenario: null,
        sessionElapsedSec: 0,
        sessionDurationSec: 360,
        isPaused: false,
        silenceElapsedSec: 0,
        hintBannerText: '',
        endReasonText: 'Bạn đã hoàn tất xử lý tình huống sư phạm.',
        warmupGreetingText: '',
        step8Answer: '',
        step8Eval: null,
        transcriptLog: [],
        achievedCheckpoints: [],
        hitNegativeBranches: [],
        step3Resolved: false,
        proximityToKhoa: null,
        studentParticipation: {},
        draftUtterance: '',

        // Bước 11–14
        selfEvalScore: 4,
        selfEvalGoodText: '',
        selfEvalChangeText: '',
        selfEvalText: '',
        finalLawReport: null,
        step13RetryText: '',
        step13RetrySuccess: false,
        scenarioResults: {},
        groupProgress: {},

        // Runtime controls
        _clockTimer: null,
        _spaceHolding: false,
        _sttTarget: 'main', // 'main' | 'step1' | 'step8' | 'step13'

        get totalScore() {
            return Object.values(this.scenarioResults).reduce((sum, item) => sum + (item.score || 0), 0);
        },

        get maxScore() {
            return (this.scenarios.length || 5) * 100;
        },

        get completedCount() {
            return Object.values(this.scenarioResults).filter(item => item.completed).length;
        },

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
            this.lawCriteria = window.LAW_2025_CRITERIA || {};
            this.mbtiGroups = Array.isArray(window.MBTI_GROUPS) ? window.MBTI_GROUPS : [];
            this.teacherPersonas = Array.isArray(window.TEACHER_PERSONAS) ? window.TEACHER_PERSONAS : [];
            this.voiceModes = Array.isArray(window.TEACHER_VOICE_MODES) ? window.TEACHER_VOICE_MODES : [];
            this.gradeLevels = Array.isArray(window.GRADE_LEVELS) ? window.GRADE_LEVELS : [];
            this.scenarioGroups = Array.isArray(window.SCENARIO_GROUPS) ? window.SCENARIO_GROUPS : [];
            this.difficulties = Array.isArray(window.DIFFICULTY_LEVELS) ? window.DIFFICULTY_LEVELS : [];
            this.stepsMeta = Array.isArray(window.MOCKUP_14_STEPS) ? window.MOCKUP_14_STEPS : [];

            this._loadGroupProgress();
            this.activeScenario = this.scenarios.find(s => s.id === this.selectedScenarioId) || this.scenarios[0] || null;
            this._bindSpeechEngineCallbacks();
            this._ensureContainers();
            if (window.CharacterManager && window.CharacterManager.setTeacherPersona) {
                window.CharacterManager.setTeacherPersona(this.selectedTeacher);
            }
            this.goToFlowStep(1);
        },

        _loadGroupProgress: function () {
            const defaults = {
                group_org: 2,
                group_participation: 3,
                group_misbehavior: 1,
                group_learning_support: 0,
                group_emotion: 1
            };
            try {
                if (typeof window.localStorage !== 'undefined') {
                    const saved = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
                    this.groupProgress = saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
                    return;
                }
            } catch (e) {}
            this.groupProgress = defaults;
        },

        _saveGroupProgress: function (groupId) {
            if (!groupId) return;
            this.groupProgress[groupId] = (this.groupProgress[groupId] || 0) + 1;
            try {
                if (typeof window.localStorage !== 'undefined') {
                    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(this.groupProgress));
                }
            } catch (e) {}
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

            window.SpeechEngine.onSttResult = (finalText, interimText) => {
                const combined = [finalText, interimText].filter(Boolean).join(' ').trim();
                this.draftUtterance = combined;

                if (this._sttTarget === 'step1') {
                    this.step1HeardText = combined;
                    if (combined.length >= 4) {
                        this.step1Verified = true;
                    }
                    this.renderFlowWizard();
                    return;
                }
                if (this._sttTarget === 'step13') {
                    this.step13RetryText = combined;
                    this._evaluateStep13Retry(combined);
                    this.renderFlowWizard();
                    return;
                }

                const inputEl = this._getActiveSpeechInput();
                if (inputEl) inputEl.value = combined;
                const statusEl = document.getElementById('c3d-live-caption');
                if (statusEl) {
                    statusEl.textContent = interimText ? `Đang nghe: "${interimText}"` : combined;
                }
            };

            window.SpeechEngine.onSttStateChange = (listening) => {
                const btnMain = document.getElementById('c3d-mic-btn');
                if (btnMain) btnMain.classList.toggle('listening', listening);
                const labelEl = document.getElementById('c3d-mic-label');
                if (labelEl) labelEl.textContent = listening ? 'Đang nghe bạn nói...' : 'Giữ Space để nói';

                if (this.flowStep === 1 || this.flowStep === 13) {
                    this.renderFlowWizard();
                }
            };

            window.SpeechEngine.onSttError = (msg) => {
                const statusEl = document.getElementById('c3d-live-caption');
                if (statusEl) statusEl.textContent = msg;
                if (window.showInteractionMessage) window.showInteractionMessage(`🎙️ ${msg}`);
            };
        },

        _getActiveSpeechInput: function () {
            if (this.flowStep === 8) return document.getElementById('mp-step8-input');
            return document.getElementById('c3d-speech-input');
        },

        // ================= ĐIỀU HƯỚNG 14 BƯỚC =================
        goToFlowStep: function (stepNum) {
            const target = Math.max(1, Math.min(14, parseInt(stepNum, 10) || 1));
            this.flowStep = target;
            if (target > this.maxReachedStep) this.maxReachedStep = target;
            this.wizardClosedForRoam = false;
            this._sttTarget = target === 1 ? 'step1' : (target === 8 ? 'step8' : (target === 13 ? 'step13' : 'main'));

            if (window.ClassroomGame && window.ClassroomGame.markEntered) {
                window.ClassroomGame.markEntered();
            }

            // Đồng bộ chế độ HUD với lớp 3D
            const isClass3D = target >= 6 && target <= 10;
            if (window.ClassroomGame && window.ClassroomGame.setFlowPhase) {
                window.ClassroomGame.setFlowPhase(isClass3D ? 'classroom3d' : 'wizard');
            }

            // Quản lý đồng hồ đếm thời gian lớp học
            if (target === 6 || target === 7 || target === 9) {
                this.isPaused = false;
                this._startClassTimer();
            } else {
                this._stopClassTimer();
                if (target === 8 || target === 10) this.isPaused = true;
            }

            if (target >= 6 && target <= 9 && !this.activeScenario) {
                this.startScenario(this.selectedScenarioId, target);
                return;
            }

            if (target === 6 && this.activeScenario) {
                this._syncClassroom3D(this.activeScenario, true);
                this.hintBannerText = 'Khởi động: hãy dạy như bình thường';
            }

            if (target === 7 && this.activeScenario) {
                this._triggerStep7Incident();
            }

            if (target === 12 && !this.finalLawReport && this.activeScenario) {
                this._computeFinalLawReport();
            }

            this.renderAll();
        },

        _startClassTimer: function () {
            if (this._clockTimer) return;
            this._clockTimer = setInterval(() => {
                if (this.isPaused || (this.flowStep !== 6 && this.flowStep !== 7 && this.flowStep !== 9)) return;
                this.sessionElapsedSec += 1;

                // Thử thách mode: im lặng quá N giây (mặc định 7s ở Khó, 9s ở Vừa, 7s ở Thử thách) tự kích hoạt leo thang
                if (this.flowStep === 9 && this.selectedMode === 'realistic') {
                    this.silenceElapsedSec += 1;
                    const limit = this.selectedDifficulty === 'medium' ? 9 : 7;
                    if (this.silenceElapsedSec >= limit) {
                        this.silenceElapsedSec = 0;
                        this._triggerChallengeEscalation();
                    }
                }

                // Hết giờ tiết học -> sang Bước 10
                if (this.sessionElapsedSec >= this.sessionDurationSec) {
                    this.endReasonText = 'Đã hết thời lượng thực hành của tiết mô phỏng.';
                    this.finishPracticePhase();
                    return;
                }

                const timerEl = document.getElementById('c3d-timer-val');
                if (timerEl) {
                    timerEl.textContent = `${formatClock(this.sessionElapsedSec)} / ${formatClock(this.sessionDurationSec)}`;
                }
                const silenceEl = document.getElementById('c3d-silence-badge');
                if (silenceEl && this.selectedMode === 'realistic' && this.flowStep === 9) {
                    const limit = this.selectedDifficulty === 'medium' ? 9 : 7;
                    const left = Math.max(0, limit - this.silenceElapsedSec);
                    silenceEl.textContent = `⏳ Tự hành động sau ${left}s`;
                }
            }, 1000);
            if (typeof this._clockTimer.unref === 'function') {
                this._clockTimer.unref();
            }
        },

        _stopClassTimer: function () {
            if (this._clockTimer) {
                clearInterval(this._clockTimer);
                this._clockTimer = null;
            }
        },

        _triggerChallengeEscalation: function () {
            const sc = this.activeScenario;
            if (!sc || !sc.students || sc.students.length === 0) return;
            const st = sc.students[0];
            const msg = `(Lớp mất kiên nhẫn vì bạn im lặng quá 7 giây) ${st.name}: "${st.initialLine}"`;
            this.transcriptLog.push({
                role: 'student',
                studentId: st.id,
                speaker: st.name,
                text: msg,
                timestampSec: this.sessionElapsedSec,
                isBad: true
            });
            if (window.CharacterManager) {
                window.CharacterManager.showSpeechBubble(st.id, st.initialLine, 4500, '#ef4444');
            }
            this.renderInClassHud();
        },

        // ================= HÀNH ĐỘNG CHUẨN BỊ (BƯỚC 1–5) =================
        skipStep1: function () {
            this.goToFlowStep(2);
        },

        simulateStep1MicSuccess: function () {
            this.step1HeardText = 'Chào cả lớp, chúng ta bắt đầu nhé!';
            this.step1Verified = true;
            if (window.SpeechEngine) {
                window.SpeechEngine.speak('Chào cả lớp, chúng ta bắt đầu nhé!', { speaker: 'Thử giọng', forceLang: 'vi-VN', rate: 1.02 });
            }
            this.renderFlowWizard();
        },

        selectTeacherGender: function (gender) {
            const targetGender = gender === 'male' ? 'male' : 'female';
            this.selectedTeacherGender = targetGender;
            let pool = this.teacherPersonas.filter(t => (t.gender || t.hairStyle) === targetGender);
            if (this.selectedMbtiGroup !== 'all') {
                const byGroup = pool.filter(t => t.mbtiGroup === this.selectedMbtiGroup);
                if (byGroup.length > 0) {
                    pool = byGroup;
                } else {
                    this.selectedMbtiGroup = 'all';
                }
            }
            const cur = this.selectedTeacher;
            const stillInPool = pool.some(t => t.id === cur.id);
            if (!stillInPool && pool.length > 0) {
                const nextT = pool[0];
                this.selectedTeacherId = nextT.id;
                if (!this.teacherNameEdited) {
                    this.teacherDisplayName = nextT.displayName || nextT.name;
                }
                if (nextT.defaultVoiceId && this.selectedVoiceId !== 'real_voice') {
                    this.selectedVoiceId = nextT.defaultVoiceId;
                }
            } else if (this.selectedVoiceId !== 'real_voice') {
                this.selectedVoiceId = targetGender === 'male' ? 'male_young' : 'female_young';
            }
            if (window.CharacterManager && window.CharacterManager.setTeacherPersona) {
                window.CharacterManager.setTeacherPersona(this.selectedTeacher);
            }
            this.renderFlowWizard();
        },

        selectMbtiGroup: function (groupId) {
            this.selectedMbtiGroup = groupId || 'all';
            const pool = this.teacherPersonas.filter(t =>
                (t.gender || t.hairStyle) === this.selectedTeacherGender &&
                (this.selectedMbtiGroup === 'all' || t.mbtiGroup === this.selectedMbtiGroup)
            );
            const stillInPool = pool.some(t => t.id === this.selectedTeacher.id);
            if (!stillInPool && pool.length > 0) {
                const nextT = pool[0];
                this.selectedTeacherId = nextT.id;
                if (!this.teacherNameEdited) {
                    this.teacherDisplayName = nextT.displayName || nextT.name;
                }
                if (nextT.defaultVoiceId && this.selectedVoiceId !== 'real_voice') {
                    this.selectedVoiceId = nextT.defaultVoiceId;
                }
                if (window.CharacterManager && window.CharacterManager.setTeacherPersona) {
                    window.CharacterManager.setTeacherPersona(this.selectedTeacher);
                }
            }
            this.renderFlowWizard();
        },

        selectTeacher: function (teacherId) {
            const found = this.teacherPersonas.find(t =>
                t.id === teacherId || (t.aliasIds && t.aliasIds.includes(teacherId))
            );
            this.selectedTeacherId = found ? found.id : teacherId;
            if (found) {
                this.selectedTeacherGender = found.gender || (found.hairStyle === 'male' ? 'male' : 'female');
                if (!this.teacherNameEdited) {
                    this.teacherDisplayName = found.displayName || found.name;
                }
                if (found.defaultVoiceId && this.selectedVoiceId !== 'real_voice') {
                    this.selectedVoiceId = found.defaultVoiceId;
                }
            }
            if (window.CharacterManager && window.CharacterManager.setTeacherPersona) {
                window.CharacterManager.setTeacherPersona(this.selectedTeacher);
            }
            this.renderFlowWizard();
        },

        setTeacherDisplayName: function (val) {
            this.teacherNameEdited = true;
            this.teacherDisplayName = String(val || '').trim() || this.selectedTeacher.displayName || 'Teacher';
            if (window.CharacterManager && window.CharacterManager.setTeacherPersona) {
                window.CharacterManager.setTeacherPersona(this.selectedTeacher);
            }
        },

        selectTeacherVoice: function (voiceId) {
            this.selectedVoiceId = voiceId;
            const t = this.selectedTeacher;
            if (!t.muteTeacherTts && window.SpeechEngine) {
                window.SpeechEngine.speak(`Chào cả lớp, tôi là ${t.displayName}. Hôm nay chúng ta cùng học thật vui nhé.`, {
                    speaker: t.displayName,
                    gender: t.hairStyle === 'male' ? 'male' : 'female',
                    forceLang: 'vi-VN',
                    pitch: t.voicePitch,
                    rate: t.voiceRate
                });
            }
            this.renderFlowWizard();
        },

        selectGrade: function (gradeId) {
            this.selectedGradeId = gradeId;
            const g = this.gradeLevels.find(x => x.id === gradeId) || this.gradeLevels[0];
            if (g) {
                this.selectedGradeNumber = g.defaultGrade || g.grades[0];
                if (g.defaultGroupId) {
                    this.selectScenarioGroup(g.defaultGroupId, false);
                }
            }
            this.renderFlowWizard();
        },

        selectGradeNumber: function (num) {
            this.selectedGradeNumber = parseInt(num, 10) || 7;
            // Ánh xạ sang kịch bản THCS 7 vs 8 hoặc THPT 10 vs 11
            if (this.selectedGradeId === 'thcs') {
                if (this.selectedGradeNumber >= 8) {
                    this.selectScenarioGroup('group_emotion', false);
                } else {
                    this.selectScenarioGroup('group_participation', false);
                }
            } else if (this.selectedGradeId === 'thpt') {
                if (this.selectedGradeNumber >= 11) {
                    this.selectScenarioGroup('group_learning_support', false);
                } else {
                    this.selectScenarioGroup('group_misbehavior', false);
                }
            } else {
                this.selectScenarioGroup('group_org', false);
            }
            this.renderFlowWizard();
        },

        selectScenarioGroup: function (groupId, rerender = true) {
            this.selectedGroupId = groupId;
            const grp = this.scenarioGroups.find(g => g.id === groupId);
            if (grp && grp.scenarioIds && grp.scenarioIds.length > 0) {
                this.selectedScenarioId = grp.scenarioIds[0];
                this.activeScenario = this.scenarios.find(s => s.id === this.selectedScenarioId) || this.scenarios[0];
            }
            if (rerender) this.renderFlowWizard();
        },

        selectScenarioInSetup: function (scenarioId) {
            const id = parseInt(scenarioId, 10);
            this.selectedScenarioId = id;
            this.activeScenario = this.scenarios.find(s => s.id === id) || this.scenarios[0] || null;
            const matchingGroup = this.scenarioGroups.find(g => g.scenarioIds.includes(id));
            if (matchingGroup) this.selectedGroupId = matchingGroup.id;
            this.renderFlowWizard();
        },

        selectMode: function (mode) {
            this.selectedMode = (mode === 'realistic') ? 'realistic' : 'guided';
            this.renderFlowWizard();
        },

        selectDifficulty: function (diff) {
            this.selectedDifficulty = ['easy', 'medium', 'hard'].includes(diff) ? diff : 'easy';
            this.renderFlowWizard();
        },

        toggleDirectPickerInStep4: function () {
            this.showDirectPickerInStep4 = !this.showDirectPickerInStep4;
            this.renderFlowWizard();
        },

        // Bước 5 -> Bước 6
        startScenarioFromStep5: function () {
            this.startScenario(this.selectedScenarioId, 6);
        },

        startScenario: function (scenarioId, targetStep = 6) {
            const sc = this.scenarios.find(s => s.id === scenarioId) || this.scenarios[0];
            if (!sc) return;

            this.selectedScenarioId = sc.id;
            this.activeScenario = sc;
            this.sessionElapsedSec = 0;
            this.sessionDurationSec = parseDurationSec(sc.duration);
            this.isPaused = false;
            this.silenceElapsedSec = 0;
            this.hintBannerText = '';
            this.warmupGreetingText = '';
            this.step8Answer = '';
            this.step8Eval = null;
            this.transcriptLog = [];
            this.achievedCheckpoints = [];
            this.hitNegativeBranches = [];
            this.step3Resolved = false;
            this.proximityToKhoa = null;
            this.studentParticipation = {};
            this.draftUtterance = '';
            this.selfEvalScore = 4;
            this.selfEvalGoodText = '';
            this.selfEvalChangeText = '';
            this.selfEvalText = '';
            this.finalLawReport = null;
            this.step13RetryText = '';
            this.step13RetrySuccess = false;

            if (window.SpeechEngine) window.SpeechEngine.stopSpeaking();
            this._syncClassroom3D(sc, targetStep === 6);
            this.goToFlowStep(targetStep);
        },

        _syncClassroom3D: function (sc, initialAttentive) {
            if (!sc) return;
            if (window.CharacterManager) {
                window.CharacterManager.setTeacherPersona(this.selectedTeacher);
                window.CharacterManager.loadScenarioStudents(sc.students, {
                    grade: sc.grade,
                    isFreeExplore: false,
                    initialAttentive: initialAttentive
                });
            }
            if (window.ClassroomGame) {
                if (window.ClassroomGame.updateBoardForScenario) {
                    window.ClassroomGame.updateBoardForScenario(sc.boardLesson);
                }
                if (window.ClassroomGame.focusPlayerOnClass) {
                    window.ClassroomGame.focusPlayerOnClass();
                }
            }
        },

        // ================= TRONG LỚP HỌC 3D (BƯỚC 6–10) =================
        speakWarmupGreeting: function (customText) {
            const sc = this.activeScenario;
            if (!sc) return;
            const teacher = this.selectedTeacher;
            const warmupFallback = (sc.blindContext && sc.blindContext.warmupPrompt) ||
                `Chào cả lớp! Hôm nay chúng ta bắt đầu bài ${sc.blindContext ? sc.blindContext.unitName : sc.title} nhé.`;
            const line = (customText && String(customText).trim()) ? String(customText).trim() : warmupFallback;

            this.warmupGreetingText = line;
            this.transcriptLog.push({
                role: 'teacher',
                speaker: teacher.displayName,
                text: line,
                timestampSec: this.sessionElapsedSec,
                tag: 'Khởi động'
            });

            if (window.CharacterManager) {
                window.CharacterManager.setStudentsAttentive();
            }

            if (window.SpeechEngine && !teacher.muteTeacherTts) {
                window.SpeechEngine.speak(line, {
                    speaker: teacher.displayName,
                    gender: teacher.hairStyle === 'male' ? 'male' : 'female',
                    forceLang: 'vi-VN',
                    pitch: teacher.voicePitch,
                    rate: teacher.voiceRate,
                    onEnd: () => {
                        if (this.flowStep === 6) {
                            setTimeout(() => {
                                if (this.flowStep === 6) this.goToFlowStep(7);
                            }, 350);
                        }
                    }
                });
            } else {
                this.goToFlowStep(7);
            }
        },

        _triggerStep7Incident: function () {
            const sc = this.activeScenario;
            if (!sc) return;
            this.sessionElapsedSec = Math.max(this.sessionElapsedSec, 65); // 01:05 theo mockup
            this.hintBannerText = '';

            if (window.CharacterManager && window.CharacterManager.triggerScenarioIncident) {
                window.CharacterManager.triggerScenarioIncident(sc.students);
            }

            // Tránh nhân đôi bản ghi nếu đã chèn tình huống mở đầu
            const hasIncident = this.transcriptLog.some(l => l.tag === 'incident_start');
            if (!hasIncident) {
                const leadSt = sc.students[0];
                if (leadSt) {
                    this.transcriptLog.push({
                        role: 'student',
                        studentId: leadSt.id,
                        speaker: leadSt.name,
                        text: leadSt.initialLine,
                        pitch: leadSt.voicePitch,
                        rate: leadSt.voiceRate,
                        timestampSec: this.sessionElapsedSec,
                        tag: 'incident_start'
                    });
                }
            }

            if (window.SpeechEngine && window.CharacterManager) {
                const queue = sc.students.map((st, idx) => ({
                    text: st.initialLine,
                    speaker: st.name,
                    gender: st.gender || 'female',
                    isStudent: true,
                    forceLang: 'vi-VN',
                    pitch: st.voicePitch || 1.0,
                    rate: st.voiceRate || 1.0,
                    onStart: () => {
                        window.CharacterManager.showSpeechBubble(st.id, st.initialLine, 5500, st.color);
                    },
                    onEnd: () => {
                        if (idx === sc.students.length - 1 && this.flowStep === 7) {
                            this.hintBannerText = this.selectedMode === 'guided'
                                ? 'Đã quan sát rõ lớp? Bấm "Nhận diện tình huống" để mô tả!'
                                : 'Bạn có thể nói/xử lý ngay trong lớp!';
                        }
                    }
                }));
                window.SpeechEngine.speakSequence(queue);
            }
        },

        advanceAfterStep7: function () {
            if (this.selectedMode === 'realistic') {
                // Chế độ Thử thách: không tạm dừng giữa giờ, xử lý ngay ở Bước 9 (Bước 8 hỏi ở cuối buổi)
                this.goToFlowStep(9);
            } else {
                this.goToFlowStep(8);
            }
        },

        submitStep8: function (rawText) {
            const sc = this.activeScenario;
            if (!sc) return;
            const inputEl = document.getElementById('mp-step8-input');
            const val = rawText !== undefined ? String(rawText).trim() : (inputEl ? inputEl.value.trim() : '');
            this.step8Answer = val || '(Bỏ qua nhận định)';

            const hits = sc.step1.expectedKeywords.filter(kw => matchesKeyword(this.step8Answer, kw));
            this.step8Eval = {
                matchedCount: hits.length,
                isAccurate: hits.length >= 2,
                summary: hits.length >= 2
                    ? 'Chính xác — Bạn nhận ra đúng gốc rễ hành vi và cảm xúc của các học sinh trong lớp.'
                    : (hits.length === 1 ? 'Gần đúng — Bạn đã thấy dấu hiệu chính nhưng có thể mô tả đủ các em còn lại.' : 'Cần quan sát sâu hơn nguyên nhân đằng sau hành vi của từng học sinh.')
            };
            this.silenceElapsedSec = 0;

            if (this.selectedMode === 'realistic' && this.transcriptLog.some(l => l.role === 'teacher' && l.tag !== 'Khởi động')) {
                this.goToFlowStep(10);
            } else {
                this.goToFlowStep(9);
            }
        },

        submitTeacherUtterance: function (rawText) {
            const sc = this.activeScenario;
            if (!sc) return false;

            // Nếu đang ở Bước 6 thì xử lý như câu chào/dẫn nhập khởi động
            if (this.flowStep === 6) {
                this.speakWarmupGreeting(rawText);
                return true;
            }

            const inputEl = document.getElementById('c3d-speech-input');
            const text = (rawText !== undefined ? String(rawText) : (inputEl ? inputEl.value : '')).trim();
            if (!text) return false;

            if (inputEl) inputEl.value = '';
            this.draftUtterance = '';
            this.silenceElapsedSec = 0;
            this.sessionElapsedSec = Math.max(this.sessionElapsedSec + 25, 70);

            if (sc.id === 3 && window.CharacterManager && window.CharacterManager.getStudentWorldPosition && window.ClassroomGame && window.ClassroomGame.getDistanceToPoint) {
                const khoaPos = window.CharacterManager.getStudentWorldPosition('khoa');
                if (khoaPos) {
                    const dist = window.ClassroomGame.getDistanceToPoint(khoaPos);
                    this.proximityToKhoa = (this.proximityToKhoa === null) ? dist : Math.min(this.proximityToKhoa, dist);
                }
            }

            const matchedCps = [];
            sc.checkpoints.forEach(cp => {
                if (cp.keywords.some(kw => matchesKeyword(text, kw))) {
                    matchedCps.push(cp.id);
                    if (!this.achievedCheckpoints.includes(cp.id)) {
                        this.achievedCheckpoints.push(cp.id);
                    }
                }
            });

            let matchedNegBranch = null;
            for (const b of sc.branches) {
                if (!b.success && b.triggers && b.triggers.some(tr => matchesKeyword(text, tr))) {
                    matchedNegBranch = b;
                    if (!this.hitNegativeBranches.some(x => x.id === b.id)) {
                        this.hitNegativeBranches.push(b);
                    }
                    break;
                }
            }

            const isPositive = matchedCps.length > 0 && !matchedNegBranch;
            const teacher = this.selectedTeacher;
            this.transcriptLog.push({
                role: 'teacher',
                speaker: teacher.displayName,
                text: text,
                timestampSec: this.sessionElapsedSec,
                isGood: isPositive,
                isBad: Boolean(matchedNegBranch),
                matchedCps: matchedCps
            });

            if (matchedNegBranch) {
                this._applyAndSpeakReactions(sc, matchedNegBranch.reactions, false);
                this.renderInClassHud();
                return true;
            }

            const requiredCount = sc.id === 4 ? 2 : Math.max(2, sc.checkpoints.length - 1);
            if (this.achievedCheckpoints.length >= requiredCount || this._looksLikeCompleteResponse(sc, text)) {
                const posBranch = sc.branches.find(b => b.success);
                if (posBranch) {
                    this.step3Resolved = true;
                    sc.students.forEach(st => { this.studentParticipation[st.id] = true; });
                    this._applyAndSpeakReactions(sc, posBranch.reactions, true);
                    this.hintBannerText = `✅ Tốt lắm! Cả ${sc.students.length} học sinh đã hợp tác. Bạn có thể bấm "Kết thúc" để xem phân tích.`;
                    this.renderInClassHud();
                    return true;
                }
            }

            const partialReactions = this._buildPartialReactions(sc, matchedCps, text);
            this._applyAndSpeakReactions(sc, partialReactions, matchedCps.length > 0);
            this.renderInClassHud();
            return true;
        },

        _looksLikeCompleteResponse: function (sc, text) {
            return text.length > 75 && this.achievedCheckpoints.length >= 2;
        },

        _buildPartialReactions: function (sc, matchedCps, text) {
            const out = {};
            const difficulty = this.selectedDifficulty;
            sc.students.forEach((st, idx) => {
                const mentioned = matchesKeyword(text, st.name);
                if (matchedCps.length > 0 && (mentioned || idx === 0)) {
                    this.studentParticipation[st.id] = true;
                    if (sc.id === 2 && st.id === 'huy') {
                        out[st.id] = { posture: 'happy_task', statusTag: 'đang ghi chép', line: 'Dạ vâng! Em ghi lại ý kiến của cả nhóm ngay đây ạ!' };
                    } else if (sc.id === 1 && st.id === 'bin') {
                        out[st.id] = { posture: 'happy_task', statusTag: 'đang bấm giờ', line: 'Vâng! Em đứng bấm giờ 3 phút cho cả lớp nhé!' };
                    } else {
                        out[st.id] = { posture: 'speaking_pair', statusTag: 'đang tham gia', line: 'Dạ vâng, em hiểu rồi ạ!' };
                    }
                } else {
                    const extraWarning = difficulty === 'hard' ? ' (Em vẫn còn hơi bối rối...)' : '';
                    out[st.id] = {
                        posture: st.initialPosture,
                        statusTag: '',
                        line: st.initialLine + extraWarning
                    };
                }
            });
            return out;
        },

        _applyAndSpeakReactions: function (sc, reactions, isPositive) {
            const speechItems = [];
            sc.students.forEach(st => {
                const react = reactions[st.id];
                if (!react) return;

                if (isPositive && react.posture !== 'pouting' && react.posture !== 'head_down') {
                    this.studentParticipation[st.id] = true;
                }

                const statusTag = react.statusTag || (isPositive ? (st.id === 'huy' ? 'đang ghi chép' : 'hợp tác') : '');
                if (window.CharacterManager) {
                    window.CharacterManager.setStudentPosture(st.id, react.posture, react.line);
                    if (window.CharacterManager.setStudentStatusTag) {
                        window.CharacterManager.setStudentStatusTag(st.id, statusTag, isPositive ? '#10b981' : '#f59e0b');
                    }
                }

                this.transcriptLog.push({
                    role: 'student',
                    studentId: st.id,
                    speaker: st.name,
                    text: react.line,
                    pitch: st.voicePitch,
                    rate: st.voiceRate,
                    timestampSec: this.sessionElapsedSec + 5
                });

                speechItems.push({
                    text: react.line,
                    speaker: st.name,
                    gender: st.gender || 'female',
                    isStudent: true,
                    forceLang: 'vi-VN',
                    pitch: st.voicePitch || 1.0,
                    rate: st.voiceRate || 1.0,
                    onStart: () => {
                        if (window.CharacterManager) {
                            window.CharacterManager.showSpeechBubble(st.id, react.line, 6000, isPositive ? '#10b981' : '#f59e0b');
                        }
                    }
                });
            });

            if (window.SpeechEngine && speechItems.length > 0) {
                window.SpeechEngine.speakSequence(speechItems);
            }
        },

        triggerDemoBranch: function (branchId) {
            const sc = this.activeScenario;
            if (!sc) return;
            const branch = sc.branches.find(b => b.id === branchId);
            if (!branch) return;

            if (branch.success) {
                sc.checkpoints.forEach(cp => {
                    if (!this.achievedCheckpoints.includes(cp.id)) this.achievedCheckpoints.push(cp.id);
                });
                this.step3Resolved = true;
                sc.students.forEach(st => { this.studentParticipation[st.id] = true; });
            } else {
                if (!this.hitNegativeBranches.some(x => x.id === branch.id)) {
                    this.hitNegativeBranches.push(branch);
                }
            }

            this.sessionElapsedSec += 25;
            this.transcriptLog.push({
                role: 'teacher',
                speaker: this.selectedTeacher.displayName,
                text: branch.sampleSpeech,
                timestampSec: this.sessionElapsedSec,
                isGood: branch.success,
                isBad: !branch.success
            });
            this._applyAndSpeakReactions(sc, branch.reactions, branch.success);
            this.renderInClassHud();
        },

        togglePracticePause: function () {
            if (this.selectedMode === 'realistic') return;
            this.isPaused = !this.isPaused;
            this.renderInClassHud();
        },

        requestHintInStep9: function () {
            if (this.selectedMode === 'realistic' || !this.activeScenario) return;
            const sc = this.activeScenario;
            const nextCp = sc.checkpoints.find(cp => !this.achievedCheckpoints.includes(cp.id)) || sc.checkpoints[0];
            this.hintBannerText = nextCp ? `💡 Gợi ý: ${nextCp.label}` : `💡 ${sc.lesson}`;
            this.renderInClassHud();
        },

        finishPracticePhase: function () {
            if (window.SpeechEngine) window.SpeechEngine.stopSpeaking();
            this._stopClassTimer();
            const partCount = Object.keys(this.studentParticipation).length;
            const totalSt = this.activeScenario ? this.activeScenario.students.length : 3;
            if (this.step3Resolved || partCount >= totalSt) {
                this.endReasonText = `Lý do kết thúc: cả ${totalSt} học sinh đã tham gia hoàn thành mục tiêu.`;
            } else {
                this.endReasonText = `Lý do kết thúc: hoàn tất lượt xử lý sau ${formatClock(this.sessionElapsedSec)}.`;
            }

            if (this.selectedMode === 'realistic' && !this.step8Answer) {
                // Theo mockup Trang 8: Ở chế độ Thử thách, hỏi câu Nhận diện lúc cuối buổi
                this.goToFlowStep(8);
            } else {
                this.goToFlowStep(10);
            }
        },

        // ================= TỰ ĐÁNH GIÁ & PHÂN TÍCH (BƯỚC 11–14) =================
        setSelfEvalScore: function (scoreVal) {
            this.selfEvalScore = parseInt(scoreVal, 10) || 4;
            this.renderFlowWizard();
        },

        submitSelfEvaluation: function (rawText) {
            const sc = this.activeScenario;
            if (!sc) return;

            if (rawText !== undefined) {
                this.selfEvalText = String(rawText || '').trim();
                this.selfEvalGoodText = this.selfEvalText;
            } else {
                const gEl = document.getElementById('mp-self-good');
                const cEl = document.getElementById('mp-self-change');
                if (gEl) this.selfEvalGoodText = gEl.value.trim();
                if (cEl) this.selfEvalChangeText = cEl.value.trim();
                this.selfEvalText = [this.selfEvalGoodText, this.selfEvalChangeText].filter(Boolean).join(' — ');
            }
            this._computeFinalLawReport();
        },

        finishToLawFeedback: function (skipSelfEval = false) {
            if (skipSelfEval) {
                this.selfEvalGoodText = '';
                this.selfEvalChangeText = '';
                this.selfEvalText = '';
            } else {
                this.submitSelfEvaluation();
            }
            this._computeFinalLawReport();
            this._saveGroupProgress(this.selectedGroupId);
            this.goToFlowStep(12);
        },

        _computeFinalLawReport: function () {
            const sc = this.activeScenario;
            if (!sc) return null;

            const report = this.generateLaw2025Report(sc);
            this.finalLawReport = report;
            const passedItems = report.items.filter(it => it.passed).length;
            const lawRatio = report.items.length > 0 ? passedItems / report.items.length : 0;

            const textLow = normalizeText(this.selfEvalText);
            const hasSelfEvalDetail = textLow.length >= 16;
            const hasFixIdea = ['lần sau', 'sửa', 'đổi', 'cần', 'sẽ', 'gọi', 'hỏi', 'giải thích', 'ghi nhận', 'tốt hơn', 'chậm', 'chỉ dẫn']
                .some(kw => matchesKeyword(textLow, kw));
            const selfEvalPassed = hasSelfEvalDetail && hasFixIdea;

            let score = Math.round(lawRatio * 75);
            if (this.step8Eval && this.step8Eval.isAccurate) score += 10;
            if (selfEvalPassed) score += 15;
            if (this.hitNegativeBranches.length > 0) score = Math.max(20, score - 12);
            score = Math.min(100, Math.max(0, score));

            const prev = this.scenarioResults[sc.id];
            this.scenarioResults[sc.id] = {
                completed: true,
                score: prev ? Math.max(prev.score, score) : score,
                lawReport: report,
                selfEvalPassed: selfEvalPassed,
                selfEvalScore: this.selfEvalScore,
                selfEvalText: this.selfEvalText,
                lastTranscript: [...this.transcriptLog]
            };
            return report;
        },

        generateLaw2025Report: function (sc) {
            const teacherLines = this.transcriptLog.filter(l => l.role === 'teacher');
            const hasSpeech = teacherLines.length > 0;
            const hasNegBranch = this.hitNegativeBranches.length > 0;
            const cpSet = new Set(this.achievedCheckpoints);

            const pickQuoteWithTime = (keywords) => {
                for (let i = teacherLines.length - 1; i >= 0; i--) {
                    if (keywords.some(kw => matchesKeyword(teacherLines[i].text, kw))) {
                        return {
                            text: teacherLines[i].text,
                            timeStr: formatClock(teacherLines[i].timestampSec || 70)
                        };
                    }
                }
                const last = teacherLines[teacherLines.length - 1];
                return last
                    ? { text: last.text, timeStr: formatClock(last.timestampSec || 70) }
                    : { text: '(Chưa phát ngôn câu xử lý trực tiếp trên lớp)', timeStr: '00:00' };
            };

            const items = sc.lawCriteriaIds.map(cid => {
                const criterion = this.lawCriteria[cid];
                let passed = false;
                let quote = '';
                let timeStr = '01:10';
                let reason = '';

                if (!hasSpeech) {
                    passed = false;
                    quote = '(Chưa có lời nói cụ thể của bạn trong buổi mô phỏng)';
                    reason = `Chưa đạt đầy đủ — chưa thể hiện đầy đủ yêu cầu tại ${criterion.citation} vì bạn chưa thực hành phát ngôn điều phối lớp học.`;
                } else {
                    const pickWrap = (kws) => {
                        const res = pickQuoteWithTime(kws);
                        timeStr = res.timeStr;
                        return res.text;
                    };
                    const evalResult = this._evaluateCriterionForScenario(sc.id, cid, cpSet, hasNegBranch, teacherLines, pickWrap);
                    passed = evalResult.passed;
                    quote = evalResult.quote;
                    if (passed) {
                        reason = `${criterion.passDesc} (${criterion.citation})`;
                    } else {
                        reason = `Chưa thể hiện đầy đủ yêu cầu tại ${criterion.citation}. ${evalResult.gapDetail}`;
                    }
                }
                return { criterionId: cid, criterion, quote, timeStr, passed, reason };
            });

            return { scenarioId: sc.id, items, endConditionMet: this.step3Resolved };
        },

        _evaluateCriterionForScenario: function (scenarioId, cid, cpSet, hasNegBranch, teacherLines, pickQuote) {
            const negIds = new Set(this.hitNegativeBranches.map(b => b.id));

            if (scenarioId === 1) {
                if (cid === 1) return { passed: cpSet.has('model_demo') || cpSet.has('check_icq') || this.step3Resolved, quote: pickQuote(['làm mẫu', 'watch me', 'speaking', 'what do you like']), gapDetail: 'Hoạt động nói theo cặp chưa được hướng dẫn rõ quy trình để đạt mục tiêu tiết học.' };
                if (cid === 6) return { passed: cpSet.has('stop_signal') && (cpSet.has('model_demo') || cpSet.has('check_icq')), quote: pickQuote(['eyes on me', 'one', 'làm mẫu', 'writing or speaking', 'nói hay viết']), gapDetail: 'Cần dùng tín hiệu dừng kết hợp làm mẫu trực quan và câu hỏi kiểm tra hiểu (ICQs).' };
                if (cid === 2) return { passed: !negIds.has('scold_bin') && (cpSet.has('assign_bin') || this.step3Resolved), quote: pickQuote(['bin', 'timekeeper', 'bấm giờ', 'mắng', 'im đi']), gapDetail: 'Lời nói với Bin cần tôn trọng và trao cơ hội công bằng thay vì quát mắng.' };
                if (cid === 5) return { passed: !negIds.has('scold_bin') && (cpSet.has('check_icq') || cpSet.has('model_demo') || this.step3Resolved), quote: pickQuote(['tí', 'hỏi bạn', 'không viết', 'speaking', 'ngồi xuống ngay']), gapDetail: 'Cần giữ không khí an toàn để học sinh như Tí dám hỏi lại.' };
            }
            if (scenarioId === 2) {
                if (cid === 2) return { passed: !negIds.has('silence_huy') && cpSet.has('ack_huy') && (cpSet.has('scaffold_nam') || cpSet.has('support_lan')), quote: pickQuote(['huy', 'lan', 'nam', 'stop', 'im đi', 'nhường']), gapDetail: 'Cần ghi nhận Huy trước khi xin lượt công bằng cho Lan và Nam.' };
                if (cid === 3) return { passed: cpSet.has('scaffold_nam') || cpSet.has('ack_huy'), quote: pickQuote(['nam', 'play sports', 'reporter', 'thư ký', 'huy']), gapDetail: 'Cần tạo giàn giáo vừa sức cho Nam và chuyển năng lượng của Huy sang vai trò hữu ích.' };
                if (cid === 5) return { passed: !negIds.has('silence_huy') && !negIds.has('call_lan_suddenly') && (cpSet.has('think_time') || cpSet.has('support_lan')), quote: pickQuote(['30', 'think', 'suy nghĩ', 'lan', 'talk to']), gapDetail: 'Gọi bất ngờ khi học sinh chưa kịp chuẩn bị làm giảm cảm giác an toàn tâm lý.' };
                if (cid === 6) return { passed: cpSet.has('think_time') && (cpSet.has('scaffold_nam') || cpSet.has('support_lan')), quote: pickQuote(['30', 'think', 'yes or no', 'talk to']), gapDetail: 'Cần áp dụng thời gian chờ suy nghĩ (Think time) trước khi gọi.' };
            }
            if (scenarioId === 3) {
                if (cid === 7) return { passed: !negIds.has('public_yell') && cpSet.has('refer_rule'), quote: pickQuote(['nội quy', 'rule', 'quy định', 'tịch thu']), gapDetail: 'Cần căn cứ đúng nội quy lớp đã thống nhất, tránh tự đặt hình thức xử lý trước lớp.' };
                if (cid === 4) return { passed: !negIds.has('public_yell') && cpSet.has('private_calm'), quote: pickQuote(['phone away', 'cất máy', 'after class', 'sau giờ', 'dừng băng']), gapDetail: 'Cần giữ thái độ điềm tĩnh, ngôn ngữ mẫu mực để không căng thẳng hóa sự việc.' };
                if (cid === 2) {
                    const nearKhoa = this.proximityToKhoa !== null && this.proximityToKhoa <= 3.6;
                    return { passed: !negIds.has('public_yell') && (cpSet.has('private_calm') || nearKhoa), quote: pickQuote(['khoa', 'phone away', 'nhắc riêng', 'tịch thu']), gapDetail: 'Cần đi lại gần nhắc nhỏ kín đáo để giữ thể diện cho học sinh.' };
                }
                if (cid === 1) return { passed: !negIds.has('ignore_phone') && !negIds.has('public_yell') && cpSet.has('redirect_duc'), quote: pickQuote(['đức', 'question', 'câu', 'bài nghe']), gapDetail: 'Cần kéo Đức và lớp quay lại ngay nhiệm vụ bài nghe.' };
            }
            if (scenarioId === 4) {
                if (cid === 3) return { passed: !negIds.has('mai_help_tuan') && cpSet.has('extend_mai') && cpSet.has('scaffold_tuan'), quote: pickQuote(['mai', 'tuấn', 'example', 'want to be', 'giúp tuấn']), gapDetail: 'Cần giao việc mở rộng cho Mai và khung gợi ý cho Tuấn thay vì chép hộ.' };
                if (cid === 2) return { passed: !negIds.has('generic_encourage') && (cpSet.has('scaffold_tuan') || cpSet.has('check_linh')), quote: pickQuote(['tuấn', 'linh', 'cố lên']), gapDetail: 'Cần hỗ trợ công bằng cho cả học sinh bế tắc lẫn em làm nhầm đề.' };
                if (cid === 1) return { passed: cpSet.has('check_linh'), quote: pickQuote(['linh', 'đọc lại', 'whose job', 'câu hỏi']), gapDetail: 'Cần giúp Linh nhận ra trọng tâm đề bài để đạt mục tiêu bài viết.' };
                if (cid === 6) return { passed: cpSet.has('scaffold_tuan') && cpSet.has('check_linh'), quote: pickQuote(['start small', 'want to be', 'read the question', 'whose job']), gapDetail: 'Cần đặt câu hỏi gợi mở và khung câu từng bước dựa trên khoa học giáo dục.' };
            }
            if (scenarioId === 5) {
                if (cid === 5) return { passed: !negIds.has('ignore_laugh') && (cpSet.has('set_norm') || cpSet.has('support_thao')), quote: pickQuote(['hold on', 'không cười', 'mistakes', 'thảo', 'bạn khác']), gapDetail: 'Cần đặt chuẩn mực an toàn lớp học, bảo vệ em bị cười chê.' };
                if (cid === 2) return { passed: !negIds.has('ignore_laugh') && !negIds.has('harsh_scold_quan') && (cpSet.has('support_thao') || cpSet.has('normalize_word')), quote: pickQuote(['thảo', 'with me', 'together', 'vô duyên', 'kiểm điểm']), gapDetail: 'Cần đối xử công bằng, tôn trọng với cả Thảo và Quân.' };
                if (cid === 4) return { passed: !negIds.has('harsh_scold_quan') && !hasNegBranch && (cpSet.has('set_norm') || cpSet.has('redirect_quan') || this.step3Resolved), quote: pickQuote(['hold on', 'not at people', 'vô duyên', 'quân im']), gapDetail: 'Cần mẫu mực, giữ bình tĩnh khi uốn nắn hành vi trêu đùa.' };
                if (cid === 3) return { passed: cpSet.has('normalize_word') || cpSet.has('redirect_quan'), quote: pickQuote(['vej', 'vegetable', 'quân', 'energy', 'next part']), gapDetail: 'Cần giúp cả lớp luyện chung từ khó và hướng năng lượng của Quân tích cực.' };
            }

            return {
                passed: this.step3Resolved,
                quote: teacherLines[0] ? teacherLines[0].text : '',
                gapDetail: 'Cần thể hiện rõ hơn trong lời nói điều phối lớp.'
            };
        },

        _evaluateStep13Retry: function (spokenText) {
            const sc = this.activeScenario;
            if (!sc || !spokenText) return;
            const bad = sc.branches.some(b => !b.success && b.triggers && b.triggers.some(tr => matchesKeyword(spokenText, tr)));
            const good = !bad && (spokenText.length >= 12 || sc.checkpoints.some(cp => cp.keywords.some(kw => matchesKeyword(spokenText, kw))));
            this.step13RetrySuccess = good;
            if (good && window.SpeechEngine) {
                const st0 = sc.students && sc.students[0];
                window.SpeechEngine.speak('Dạ vâng, em hiểu rồi ạ!', {
                    speaker: st0 ? st0.name : 'Học sinh',
                    gender: st0 ? (st0.gender || 'female') : 'female',
                    isStudent: true,
                    forceLang: 'vi-VN',
                    pitch: 1.15
                });
            }
        },

        speakToneSample: function (idx) {
            const sc = this.activeScenario;
            if (!sc || !sc.step13Tones || !sc.step13Tones[idx] || !window.SpeechEngine) return;
            const t = this.selectedTeacher;
            const toneObj = sc.step13Tones[idx];
            window.SpeechEngine.speak(toneObj.text, {
                speaker: toneObj.tone,
                gender: t.hairStyle === 'male' ? 'male' : 'female',
                forceLang: 'vi-VN',
                pitch: t.voicePitch || 1.0,
                rate: t.voiceRate || 1.0
            });
            // Điền nhanh vào câu thử lại nếu đang test không có mic
            this.step13RetryText = toneObj.text;
            this.step13RetrySuccess = true;
            this.renderFlowWizard();
        },

        speakLawReport: function () {
            const sc = this.activeScenario;
            if (!sc || !window.SpeechEngine) return;
            const report = this.finalLawReport || this.generateLaw2025Report(sc);
            const parts = report.items.map((it, i) => `Mục ${i + 1}: ${it.criterion.shortRef}. ${it.reason}`);
            window.SpeechEngine.speak(parts.join(' '), { speaker: 'Phân tích Luật 2025' });
        },

        rewindToDecisionPoint: function (indexInLog) {
            const sc = this.activeScenario;
            if (!sc) return;
            if (window.SpeechEngine) window.SpeechEngine.stopSpeaking();

            // Giữ lại diễn biến trước điểm quyết định được chọn (tối thiểu phần mở đầu tình huống)
            const cutIdx = Math.max(0, Math.min(indexInLog, this.transcriptLog.length));
            const leadSt = sc.students[0];
            this.transcriptLog = cutIdx > 0
                ? this.transcriptLog.slice(0, cutIdx)
                : [{
                    role: 'student',
                    studentId: leadSt ? leadSt.id : 'st1',
                    speaker: leadSt ? leadSt.name : 'Học sinh',
                    text: leadSt ? leadSt.initialLine : sc.initialSceneText,
                    timestampSec: 65,
                    tag: 'incident_start'
                }];

            const lastEntry = this.transcriptLog[this.transcriptLog.length - 1];
            this.sessionElapsedSec = (lastEntry && lastEntry.timestampSec) || 65;
            this.achievedCheckpoints = [];
            this.hitNegativeBranches = [];
            this.step3Resolved = false;

            if (window.CharacterManager && window.CharacterManager.triggerScenarioIncident) {
                window.CharacterManager.triggerScenarioIncident(sc.students);
            }
            this.goToFlowStep(9);
        },

        rewindToStep9: function () {
            this.rewindToDecisionPoint(0);
        },

        rewindToStep5: function () {
            if (window.SpeechEngine) window.SpeechEngine.stopSpeaking();
            this.goToFlowStep(5);
        },

        advanceToNextScenario: function () {
            const curIdx = this.scenarios.findIndex(s => s.id === this.selectedScenarioId);
            const nextSc = this.scenarios[(curIdx + 1) % this.scenarios.length];
            if (nextSc) {
                this.selectScenarioInSetup(nextSc.id);
                this.goToFlowStep(5);
            }
        },

        launchSuggestedGroup: function (groupId, scenarioId) {
            this.selectScenarioGroup(groupId, false);
            this.selectScenarioInSetup(scenarioId);
            this.goToFlowStep(5);
        },

        // ================= PUSH-TO-TALK (SPACE) & VOICE BRIDGE =================
        handleSpaceDown: function (e) {
            if (this._spaceHolding || (e && e.repeat)) return false;
            if (this.wizardClosedForRoam) return false;
            const supportedSteps = [1, 6, 7, 9, 13];
            if (!supportedSteps.includes(this.flowStep)) return false;

            this._spaceHolding = true;
            this._sttTarget = this.flowStep === 1 ? 'step1' : (this.flowStep === 13 ? 'step13' : 'main');
            if (window.SpeechEngine) {
                window.SpeechEngine.startListening('');
            }
            return true;
        },

        handleSpaceUp: function () {
            if (!this._spaceHolding) return false;
            this._spaceHolding = false;
            if (!window.SpeechEngine) return false;

            window.SpeechEngine.flushAndStop((spokenText) => {
                if (!spokenText) return;
                if (this.flowStep === 1) {
                    this.step1HeardText = spokenText;
                    this.step1Verified = true;
                    this.renderFlowWizard();
                } else if (this.flowStep === 6) {
                    this.speakWarmupGreeting(spokenText);
                } else if (this.flowStep === 7) {
                    this.goToFlowStep(9);
                    this.submitTeacherUtterance(spokenText);
                } else if (this.flowStep === 9) {
                    this.submitTeacherUtterance(spokenText);
                } else if (this.flowStep === 13) {
                    this.step13RetryText = spokenText;
                    this._evaluateStep13Retry(spokenText);
                    this.renderFlowWizard();
                }
            });
            return true;
        },

        toggleMic: function (targetOverride) {
            if (!window.SpeechEngine) return;
            this._sttTarget = targetOverride || (this.flowStep === 1 ? 'step1' : (this.flowStep === 8 ? 'step8' : (this.flowStep === 13 ? 'step13' : 'main')));
            const activeInput = this._getActiveSpeechInput();
            const existing = (this._sttTarget === 'step8' && activeInput) ? activeInput.value : '';
            if (window.SpeechEngine.isListening) {
                window.SpeechEngine.flushAndStop((spokenText) => {
                    if (!spokenText) return;
                    if (this._sttTarget === 'step1') {
                        this.step1HeardText = spokenText;
                        this.step1Verified = true;
                        this.renderFlowWizard();
                    } else if (this._sttTarget === 'step13') {
                        this.step13RetryText = spokenText;
                        this._evaluateStep13Retry(spokenText);
                        this.renderFlowWizard();
                    } else if (this.flowStep === 6 || this.flowStep === 9) {
                        this.submitTeacherUtterance(spokenText);
                    }
                });
            } else {
                window.SpeechEngine.startListening(existing);
            }
        },

        toggleSttLang: function () {
            if (!window.SpeechEngine) return;
            const nextLang = window.SpeechEngine.sttLang === 'en-US' ? 'vi-VN' : 'en-US';
            window.SpeechEngine.setSttLang(nextLang);
            this.renderInClassHud();
        },

        speakLine: function (text, speaker, pitch = 1.0, rate = 1.0) {
            if (window.SpeechEngine) window.SpeechEngine.speak(text, { speaker, pitch, rate });
        },

        // ================= RENDER CHÍNH (MOCKUP 14 BƯỚC) =================
        renderAll: function () {
            this.renderFlowWizard();
            this.renderInClassHud();
        },

        renderFlowWizard: function () {
            const modal = document.getElementById('flow-modal');
            if (!modal) return;

            const isWizardScreen = (this.flowStep >= 1 && this.flowStep <= 5) ||
                this.flowStep === 8 ||
                this.flowStep === 10 ||
                (this.flowStep >= 11 && this.flowStep <= 14);

            if (!isWizardScreen || this.wizardClosedForRoam) {
                modal.classList.remove('show', 'dim-classroom');
                return;
            }

            modal.classList.add('show');

            // Bước 8 & Bước 10: Modal trắng nổi giữa lớp học 3D làm mờ
            if (this.flowStep === 8 || this.flowStep === 10) {
                modal.classList.add('dim-classroom');
                modal.innerHTML = `<div class="mp-center-modal-wrap">${
                    this.flowStep === 8 ? this._renderStep8ModalHtml() : this._renderStep10ModalHtml()
                }</div>`;
                return;
            }

            modal.classList.remove('dim-classroom');
            const currentMeta = this.stepsMeta.find(s => s.step === this.flowStep) || { stage: 1 };

            const stages = [
                { id: 1, label: '1 · Chuẩn bị', jumpStep: 1 },
                { id: 2, label: '2 · Trong lớp học', jumpStep: 6 },
                { id: 3, label: '3 · Phản tư & phản hồi', jumpStep: 11 },
                { id: 4, label: '4 · Luyện lại', jumpStep: 14 }
            ];

            const stagePillsHtml = stages.map(st => {
                const active = currentMeta.stage === st.id;
                const enabled = st.jumpStep <= this.maxReachedStep || st.id === 1;
                return `
                    <button class="mp-stage-pill ${active ? 'active' : ''}"
                        ${enabled ? `onclick="window.ScenarioSystem.goToFlowStep(${st.jumpStep})"` : 'disabled'}>
                        ${st.label}
                    </button>
                `;
            }).join('');

            modal.innerHTML = `
                <div class="mp-shell">
                    <header class="mp-topbar">
                        <div class="mp-brand">
                            <span class="mp-brand-logo">MP</span>
                            <span>Mô phỏng Sư phạm</span>
                        </div>
                        <nav class="mp-stage-stepper">${stagePillsHtml}</nav>
                        <div class="mp-topbar-right" aria-hidden="true"></div>
                    </header>
                    <main class="mp-scroll">
                        <div class="mp-container">
                            ${this._renderLightPageBody()}
                        </div>
                    </main>
                </div>
            `;
        },

        _renderLightPageBody: function () {
            switch (this.flowStep) {
                case 1: return this._renderStep1Page();
                case 2: return this._renderStep2Page();
                case 3: return this._renderStep3Page();
                case 4: return this._renderStep4Page();
                case 5: return this._renderStep5Page();
                case 11: return this._renderStep11Page();
                case 12: return this._renderStep12Page();
                case 13: return this._renderStep13Page();
                case 14: return this._renderStep14Page();
                default: return '';
            }
        },

        _renderStep1Page: function () {
            const listening = Boolean(window.SpeechEngine && window.SpeechEngine.isListening);
            const statusHtml = this.step1Verified
                ? `<div class="mp-status-pill-ok">✓ Đã nhận đúng: “${escapeHtml(this.step1HeardText || 'Chào cả lớp, chúng ta bắt đầu nhé!')}”</div>`
                : `<div style="font-size:13px; color:#64748b;">Bấm vào micro (hoặc giữ phím <strong>Space</strong>) rồi đọc to câu trên</div>`;

            return `
                <div class="mp-kicker">LẦN ĐẦU SỬ DỤNG</div>
                <h1 class="mp-h1">Chào mừng bạn! Thử micro trước khi vào lớp</h1>
                <p class="mp-subtitle">Mỗi buổi luyện kéo dài 5–7 phút. Bạn nói chuyện trực tiếp với học sinh AI trong lớp học, sau đó nhận phân tích và câu mẫu gợi ý.</p>

                <div class="mp-step1-grid">
                    <div class="mp-rule-list">
                        <div class="mp-rule-item">
                            <span class="mp-rule-num">1</span>
                            <div>
                                <div style="font-weight:700; font-size:15px; margin-bottom:4px;">Giữ phím Space hoặc nút micro để nói</div>
                                <div style="font-size:13.5px; color:#475569; line-height:1.5;">Thả ra khi nói xong. Học sinh AI trả lời theo lượt, không nói chồng lên nhau.</div>
                            </div>
                        </div>
                        <div class="mp-rule-item">
                            <span class="mp-rule-num">2</span>
                            <div>
                                <div style="font-weight:700; font-size:15px; margin-bottom:4px;">Nói tiếng Việt tự nhiên qua micro</div>
                                <div style="font-size:13.5px; color:#475569; line-height:1.5;">Giọng đọc người Việt rõ ràng giúp bạn dễ hình dung và xử lý tình huống như trên lớp thật.</div>
                            </div>
                        </div>
                        <div class="mp-rule-item">
                            <span class="mp-rule-num">3</span>
                            <div>
                                <div style="font-weight:700; font-size:15px; margin-bottom:4px;">Quan sát kỹ lớp học</div>
                                <div style="font-size:13.5px; color:#475569; line-height:1.5;">Tình huống không được báo trước. Bạn tự nhận ra qua hành vi của học sinh.</div>
                            </div>
                        </div>
                    </div>

                    <div class="mp-card mp-mic-test-box">
                        <div style="font-size:13px; color:#64748b; font-weight:600;">Đọc to câu sau</div>
                        <div style="font-size:22px; font-weight:800; color:#0f172a;">“Chào cả lớp, chúng ta bắt đầu nhé!”</div>
                        <button class="mp-mic-circle ${listening ? 'listening' : ''}" onclick="window.ScenarioSystem.toggleMic('step1')" title="Bấm hoặc giữ Space để nói">
                            🎙️
                        </button>
                        <div class="mp-wave-bars ${listening || this.step1Verified ? 'active' : ''}">
                            <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                        </div>
                        ${statusHtml}
                        ${!this.step1Verified ? `
                            <button class="mp-ghost-mini" onclick="window.ScenarioSystem.simulateStep1MicSuccess()">
                                🔊 Nghe & giả lập kiểm tra không cần mic
                            </button>
                        ` : ''}
                    </div>
                </div>

                <div class="mp-footer" style="justify-content:flex-end;">
                    <button class="mp-btn-primary" onclick="window.ScenarioSystem.goToFlowStep(2)">Tiếp tục</button>
                </div>
            `;
        },

        _renderStep2Page: function () {
            const activeTeacher = this.selectedTeacher;
            const currentGender = this.selectedTeacherGender === 'male' ? 'male' : 'female';
            const genderPool = this.teacherPersonas.filter(p => (p.gender || p.hairStyle) === currentGender);
            const filteredPersonas = this.selectedMbtiGroup === 'all'
                ? genderPool
                : genderPool.filter(p => p.mbtiGroup === this.selectedMbtiGroup);
            const shownPersonas = filteredPersonas.length > 0 ? filteredPersonas : genderPool;

            const femaleCount = this.teacherPersonas.filter(p => (p.gender || p.hairStyle) === 'female').length;
            const maleCount = this.teacherPersonas.filter(p => (p.gender || p.hairStyle) === 'male').length;

            const filterButtonsHtml = [
                `<button class="mp-mbti-filter-btn ${this.selectedMbtiGroup === 'all' ? 'selected' : ''}" onclick="window.ScenarioSystem.selectMbtiGroup('all')">Tất cả (${genderPool.length})</button>`,
                ...(this.mbtiGroups || []).map(g => {
                    const count = genderPool.filter(p => p.mbtiGroup === g.id).length;
                    const active = this.selectedMbtiGroup === g.id;
                    return `
                        <button class="mp-mbti-filter-btn ${active ? 'selected' : ''}"
                                style="${active ? `background:${g.colorHex}; border-color:${g.colorHex}; color:#fff;` : ''}"
                                onclick="window.ScenarioSystem.selectMbtiGroup('${g.id}')">
                            <span class="mp-mbti-dot" style="background:${active ? '#ffffff' : g.colorHex};"></span>
                            <span>${escapeHtml(g.label)} (${count})</span>
                        </button>
                    `;
                })
            ].join('');

            const avatarCards = shownPersonas.map(p => {
                const selected = activeTeacher.id === p.id;
                const accent = p.colorHex || '#1d4ed8';
                return `
                    <div class="mp-card mp-card-selectable mp-avatar-card ${selected ? 'selected' : ''}"
                         style="${selected ? `border-color:${accent}; box-shadow:0 0 0 1px ${accent}, 0 6px 16px rgba(15,23,42,0.08);` : ''}"
                         onclick="window.ScenarioSystem.selectTeacher('${p.id}')">
                        ${renderTeacherPortrait(p, 92)}
                        <div style="display:flex; align-items:center; justify-content:center; gap:6px; flex-wrap:wrap;">
                            <span class="mp-mbti-badge" style="background:${accent};">${escapeHtml(p.mbti || '')}</span>
                            <span style="font-size:11.5px; font-weight:600; color:#64748b;">${p.age ? `${p.age} tuổi` : ''}</span>
                        </div>
                        <div style="font-weight:800; font-size:15px; color:#0f172a;">${escapeHtml(p.name)}</div>
                        <div class="mp-avatar-traits">${escapeHtml(p.traits || p.outfitDesc || '')}</div>
                        <div style="font-size:12px; font-weight:700; margin-top:auto; color:${selected ? accent : '#64748b'};">
                            ${selected ? '✓ Đang chọn' : 'Chọn nhân vật'}
                        </div>
                    </div>
                `;
            }).join('');

            const voiceRadios = this.voiceModes.map(v => {
                const selected = this.selectedVoiceId === v.id;
                return `
                    <div class="mp-radio-opt ${selected ? 'selected' : ''}" onclick="window.ScenarioSystem.selectTeacherVoice('${v.id}')">
                        <span style="width:16px; height:16px; border-radius:50%; border:2px solid ${selected ? '#1d4ed8' : '#94a3b8'}; display:inline-flex; align-items:center; justify-content:center;">
                            ${selected ? '<span style="width:8px; height:8px; border-radius:50%; background:#1d4ed8;"></span>' : ''}
                        </span>
                        <span>${escapeHtml(v.label)}</span>
                    </div>
                `;
            }).join('');

            const detailColor = activeTeacher.colorHex || '#1d4ed8';

            return `
                <div class="mp-kicker">CHUẨN BỊ · NHÂN VẬT GIÁO VIÊN</div>
                <h1 class="mp-h1">Chọn giới tính & nhân vật giáo viên</h1>
                <p class="mp-subtitle" style="margin-bottom:10px;">Chọn giới tính giáo viên trước, sau đó chọn một trong 16 nhân vật theo phong cách MBTI (8 nữ, 8 nam).</p>
                <div class="mp-mbti-disclaimer">
                    <span>ℹ️</span>
                    <span>MBTI chỉ dùng để tạo cá tính và hình ảnh nhân vật, không dùng để đánh giá người dùng.</span>
                </div>

                <div style="font-size:13px; font-weight:800; color:#334155; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">
                    1. Chọn giới tính giáo viên
                </div>
                <div class="mp-gender-bar">
                    <button class="mp-gender-btn ${currentGender === 'female' ? 'selected' : ''}"
                            onclick="window.ScenarioSystem.selectTeacherGender('female')">
                        <span class="mp-gender-icon">👩‍🏫</span>
                        <div>
                            <div style="font-size:15px; font-weight:800; color:#0f172a;">Cô giáo (Nữ)</div>
                            <div style="font-size:12.5px; color:#64748b;">${femaleCount} nhân vật MBTI · Giọng nữ</div>
                        </div>
                    </button>
                    <button class="mp-gender-btn ${currentGender === 'male' ? 'selected' : ''}"
                            onclick="window.ScenarioSystem.selectTeacherGender('male')">
                        <span class="mp-gender-icon">👨‍🏫</span>
                        <div>
                            <div style="font-size:15px; font-weight:800; color:#0f172a;">Thầy giáo (Nam)</div>
                            <div style="font-size:12.5px; color:#64748b;">${maleCount} nhân vật MBTI · Giọng nam</div>
                        </div>
                    </button>
                </div>

                <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; margin-bottom:10px;">
                    <div style="font-size:13px; font-weight:800; color:#334155; text-transform:uppercase; letter-spacing:0.5px;">
                        2. Chọn nhân vật ${currentGender === 'female' ? 'Cô giáo' : 'Thầy giáo'} (${shownPersonas.length})
                    </div>
                </div>
                <div class="mp-mbti-filters">${filterButtonsHtml}</div>

                <div class="mp-step2-grid">
                    <div class="mp-avatar-grid-4">${avatarCards}</div>

                    <div class="mp-card" style="display:flex; flex-direction:column; gap:14px;">
                        <div style="display:flex; align-items:center; gap:12px; padding-bottom:12px; border-bottom:1px solid #e2e8f0;">
                            ${renderTeacherPortrait(activeTeacher, 76)}
                            <div style="min-width:0;">
                                <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-bottom:4px;">
                                    <span class="mp-mbti-badge" style="background:${detailColor};">${escapeHtml(activeTeacher.mbti || '')}</span>
                                    <span style="font-size:11.5px; font-weight:700; color:#64748b;">${escapeHtml(activeTeacher.mbtiGroupLabel || '')}</span>
                                </div>
                                <div style="font-size:16px; font-weight:800; color:#0f172a;">${escapeHtml(activeTeacher.name)}${activeTeacher.age ? ` · ${activeTeacher.age} tuổi` : ''}</div>
                            </div>
                        </div>

                        <div style="font-size:12.5px; color:#334155; line-height:1.5; display:flex; flex-direction:column; gap:6px; background:#f8fafc; padding:10px 12px; border-radius:10px; border:1px solid #e2e8f0;">
                            <div><strong>Tính cách:</strong> ${escapeHtml(activeTeacher.traits || '')}</div>
                            <div><strong>Ngoại hình:</strong> ${escapeHtml(activeTeacher.outfitDesc || '')}</div>
                            <div><strong>Phong cách dạy:</strong> ${escapeHtml(activeTeacher.teachingStyle || '')}</div>
                        </div>

                        <div>
                            <label style="display:block; font-size:13px; font-weight:700; color:#334155; margin-bottom:6px;">Tên hiển thị trong lớp</label>
                            <input type="text" class="mp-input-light" value="${escapeHtml(this.teacherDisplayName)}"
                                oninput="window.ScenarioSystem.setTeacherDisplayName(this.value)" placeholder="Ví dụ: ${escapeHtml(activeTeacher.name || 'Cô Minh Thư')}">
                        </div>
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            <div style="font-size:13px; font-weight:700; color:#334155;">Giọng nói của nhân vật</div>
                            ${voiceRadios}
                        </div>
                    </div>
                </div>

                <div class="mp-footer">
                    <button class="mp-btn-secondary" onclick="window.ScenarioSystem.goToFlowStep(1)">Quay lại</button>
                    <button class="mp-btn-primary" onclick="window.ScenarioSystem.goToFlowStep(3)">Tiếp tục</button>
                </div>
            `;
        },

        _renderStep3Page: function () {
            const activeGradeObj = this.gradeLevels.find(g => g.id === this.selectedGradeId) || this.gradeLevels[0];

            const gradeCards = this.gradeLevels.map(g => {
                const selected = this.selectedGradeId === g.id;
                const bulletsHtml = (g.bullets || []).map(b => `<li>${escapeHtml(b)}</li>`).join('');
                return `
                    <div class="mp-card mp-card-selectable ${selected ? 'selected' : ''}"
                         onclick="window.ScenarioSystem.selectGrade('${g.id}')">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                            <div class="mp-accent-bar" style="background:${g.accentHex}; margin-bottom:0;"></div>
                            ${selected ? '<span style="font-size:12px; font-weight:700; color:#1d4ed8;">Đang chọn</span>' : ''}
                        </div>
                        <div style="font-size:18px; font-weight:800; color:#0f172a; margin-top:8px;">${escapeHtml(g.label)}</div>
                        <div style="font-size:13px; color:#64748b; margin:2px 0 12px;">${escapeHtml(g.rangeLabel)}</div>
                        <ul style="margin:0; padding-left:18px; color:#475569; font-size:13.5px; line-height:1.6;">
                            ${bulletsHtml}
                        </ul>
                    </div>
                `;
            }).join('');

            const numPills = (activeGradeObj.grades || []).map(n => `
                <button class="mp-num-pill ${this.selectedGradeNumber === n ? 'selected' : ''}"
                        onclick="window.ScenarioSystem.selectGradeNumber(${n})">${n}</button>
            `).join('');

            return `
                <div class="mp-kicker">CHUẨN BỊ</div>
                <h1 class="mp-h1">Bạn muốn dạy lớp nào?</h1>
                <p class="mp-subtitle">Ngôn ngữ, hành vi và trình độ tiếng Anh của học sinh AI thay đổi theo lứa tuổi.</p>

                <div class="mp-grade-grid-3">${gradeCards}</div>

                <div class="mp-card mp-class-bar">
                    <span style="font-size:14px; font-weight:700; color:#0f172a;">Khối lớp</span>
                    <div style="display:flex; gap:8px;">${numPills}</div>
                    <span style="font-size:13.5px; color:#475569;">Độ khó tiếng Anh của học sinh AI bám theo sách Global Success lớp ${this.selectedGradeNumber}.</span>
                </div>

                <div class="mp-footer">
                    <button class="mp-btn-secondary" onclick="window.ScenarioSystem.goToFlowStep(2)">Quay lại</button>
                    <button class="mp-btn-primary" onclick="window.ScenarioSystem.goToFlowStep(4)">Tiếp tục</button>
                </div>
            `;
        },

        _renderStep4Page: function () {
            const gradeObj = this.gradeLevels.find(g => g.id === this.selectedGradeId) || this.gradeLevels[0];

            const groupCards = this.scenarioGroups.map(grp => {
                const selected = this.selectedGroupId === grp.id;
                return `
                    <div class="mp-card mp-card-selectable mp-group-card ${selected ? 'selected' : ''}"
                         onclick="window.ScenarioSystem.selectScenarioGroup('${grp.id}')">
                        <div>
                            <div class="mp-icon-tile">${grp.icon}</div>
                            <div style="font-weight:800; font-size:14.5px; color:#0f172a; margin-top:12px;">${escapeHtml(grp.name)}</div>
                            <div style="font-size:12.5px; color:#64748b; line-height:1.45; margin-top:6px;">${escapeHtml(grp.desc)}</div>
                        </div>
                        <div style="font-size:12.5px; font-weight:700; color:${selected ? '#1d4ed8' : '#64748b'};">
                            ${selected ? '✓ Đang chọn' : 'Nhấn để chọn'}
                        </div>
                    </div>
                `;
            }).join('');

            const modeCards = [
                { id: 'guided', title: 'Luyện tập', desc: 'Được tạm dừng và nhận gợi ý' },
                { id: 'realistic', title: 'Thử thách', desc: 'Thời gian thực, im lặng quá 7 giây học sinh sẽ tự hành động' }
            ].map(m => `
                <div class="mp-card mp-card-selectable ${this.selectedMode === m.id ? 'selected' : ''}" style="padding:14px;"
                     onclick="window.ScenarioSystem.selectMode('${m.id}')">
                    <div style="font-weight:800; font-size:14.5px; color:#0f172a;">${m.title}</div>
                    <div style="font-size:12.5px; color:#64748b; margin-top:4px; line-height:1.45;">${m.desc}</div>
                </div>
            `).join('');

            const diffCards = this.difficulties.map(d => `
                <div class="mp-card mp-card-selectable ${this.selectedDifficulty === d.id ? 'selected' : ''}" style="padding:14px;"
                     onclick="window.ScenarioSystem.selectDifficulty('${d.id}')">
                    <div style="font-weight:800; font-size:14.5px; color:#0f172a;">${escapeHtml(d.label)}</div>
                    <div style="font-size:12.5px; color:#64748b; margin-top:4px;">${escapeHtml(d.desc)}</div>
                </div>
            `).join('');

            const directPicker = this.showDirectPickerInStep4 ? `
                <div class="mp-card" style="margin-top:14px; background:#eff6ff; border-color:#bfdbfe;">
                    <div style="font-size:13px; font-weight:700; color:#1e40af; margin-bottom:8px;">Chọn trực tiếp 1 trong 5 kịch bản (dành cho giảng viên kiểm tra):</div>
                    <div style="display:flex; flex-wrap:wrap; gap:8px;">
                        ${this.scenarios.map(s => `
                            <button class="mp-ghost-mini" style="${this.selectedScenarioId === s.id ? 'background:#1d4ed8;color:#fff;border-color:#1d4ed8;' : ''}"
                                onclick="window.ScenarioSystem.selectScenarioInSetup(${s.id})">${escapeHtml(s.shortTitle)}</button>
                        `).join('')}
                    </div>
                </div>
            ` : '';

            return `
                <div class="mp-kicker">CHUẨN BỊ · ${escapeHtml(gradeObj.shortTag)} LỚP ${this.selectedGradeNumber}</div>
                <h1 class="mp-h1">Chọn nhóm tình huống muốn luyện</h1>
                <p class="mp-subtitle">Hệ thống chọn ngẫu nhiên một kịch bản trong nhóm. Tên tình huống cụ thể sẽ được giữ kín.</p>

                <div class="mp-group-grid-5">${groupCards}</div>

                <div class="mp-setup-bottom-2">
                    <div class="mp-card">
                        <div style="font-size:13.5px; font-weight:800; color:#0f172a; margin-bottom:10px;">Chế độ</div>
                        <div class="mp-chip-grid-2">${modeCards}</div>
                    </div>
                    <div class="mp-card">
                        <div style="font-size:13.5px; font-weight:800; color:#0f172a; margin-bottom:10px;">Độ khó</div>
                        <div class="mp-chip-grid-3">${diffCards}</div>
                    </div>
                </div>

                ${directPicker}

                <div class="mp-footer">
                    <div style="display:flex; gap:10px; align-items:center;">
                        <button class="mp-btn-secondary" onclick="window.ScenarioSystem.goToFlowStep(3)">Quay lại</button>
                        <button class="mp-ghost-mini" onclick="window.ScenarioSystem.toggleDirectPickerInStep4()">
                            ${this.showDirectPickerInStep4 ? 'Ẩn danh sách 5 kịch bản' : '🎯 Mở chọn trực tiếp 5 kịch bản'}
                        </button>
                    </div>
                    <button class="mp-btn-primary" onclick="window.ScenarioSystem.goToFlowStep(5)">Bắt đầu</button>
                </div>
            `;
        },

        _renderStep5Page: function () {
            const sc = this.activeScenario;
            if (!sc) return '';
            const bc = sc.blindContext || {};
            const modeLabel = this.selectedMode === 'realistic' ? 'Thử thách' : 'Luyện tập';
            const diffObj = this.difficulties.find(d => d.id === this.selectedDifficulty) || { label: 'Nhẹ' };
            const seats = bc.seats || {};
            const colors = ['#1e3a8a', '#9a3412', '#166534'];

            const studentRows = sc.students.map((st, idx) => `
                <div class="mp-student-chip-row">
                    <span class="mp-monogram" style="background:${colors[idx % colors.length]};">${escapeHtml(st.name.charAt(0).toUpperCase())}</span>
                    <div>
                        <div style="font-weight:700; font-size:14px; color:#0f172a;">${escapeHtml(st.name)}</div>
                        <div style="font-size:12.5px; color:#64748b;">${escapeHtml(seats[st.id] || 'Bàn đầu trong lớp')}</div>
                    </div>
                </div>
            `).join('');

            return `
                <div class="mp-kicker">BỐI CẢNH TIẾT HỌC</div>
                <h1 class="mp-h1">${escapeHtml(bc.classLabel || sc.grade)} · Tiết Tiếng Anh</h1>

                <div class="mp-step5-grid" style="margin-top:18px;">
                    <div class="mp-card">
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:18px;">
                            <div>
                                <div style="font-size:11.5px; font-weight:700; color:#64748b; text-transform:uppercase;">BÀI ĐANG DẠY</div>
                                <div style="font-size:16px; font-weight:800; color:#0f172a; margin-top:4px;">${escapeHtml(bc.unitName || sc.title)}</div>
                            </div>
                            <div>
                                <div style="font-size:11.5px; font-weight:700; color:#64748b; text-transform:uppercase;">THỜI LƯỢNG</div>
                                <div style="font-size:15px; font-weight:700; color:#0f172a; margin-top:4px;">${escapeHtml(sc.duration)} · Chế độ ${modeLabel} · Độ khó ${escapeHtml(diffObj.label)}</div>
                            </div>
                        </div>
                        <div>
                            <div style="font-size:11.5px; font-weight:700; color:#64748b; text-transform:uppercase;">MỤC TIÊU TIẾT HỌC</div>
                            <div style="font-size:14.5px; color:#334155; margin-top:4px; line-height:1.5;">${escapeHtml(bc.objective || sc.visibleContext)}</div>
                        </div>
                        <div class="mp-task-callout">
                            <div style="font-size:11.5px; font-weight:800; color:#b45309; text-transform:uppercase;">NHIỆM VỤ CỦA BẠN</div>
                            <div style="font-size:14.5px; font-weight:600; color:#451a03; margin-top:5px; line-height:1.55;">
                                ${escapeHtml(bc.teacherTask || sc.visibleContext)}
                            </div>
                        </div>
                    </div>

                    <div class="mp-card" style="display:flex; flex-direction:column; gap:10px;">
                        <div style="font-size:15px; font-weight:800; color:#0f172a; margin-bottom:4px;">Học sinh trong lớp</div>
                        ${studentRows}
                        <div style="font-size:12.5px; color:#64748b; margin-top:6px; line-height:1.45;">
                            ⓘ Tính cách của từng em sẽ bộc lộ qua cách các em phản ứng trong lớp.
                        </div>
                    </div>
                </div>

                <div class="mp-footer">
                    <button class="mp-btn-secondary" onclick="window.ScenarioSystem.goToFlowStep(4)">Đổi tình huống</button>
                    <button class="mp-btn-primary" onclick="window.ScenarioSystem.startScenarioFromStep5()">Vào lớp</button>
                </div>
            `;
        },

        _renderStep8ModalHtml: function () {
            const listening = Boolean(window.SpeechEngine && window.SpeechEngine.isListening);
            return `
                <div class="mp-center-card">
                    <div class="mp-kicker">TẠM DỪNG ĐỂ QUAN SÁT</div>
                    <h2 style="font-size:24px; font-weight:800; color:#0f172a; margin:0 0 6px;">Bạn nhận thấy điều gì đang xảy ra trong lớp?</h2>
                    <p style="font-size:14px; color:#475569; margin:0 0 18px;">Mô tả ngắn bằng lời của bạn. Không có lựa chọn gợi ý.</p>

                    <label style="display:block; font-size:13px; font-weight:700; color:#334155; margin-bottom:6px;">Nhận định của bạn</label>
                    <textarea id="mp-step8-input" rows="4" class="mp-input-light" placeholder="Ví dụ: Em học sinh A làm gì, hai bạn còn lại phản ứng ra sao...">${escapeHtml(this.step8Answer)}</textarea>

                    <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-top:16px;">
                        <button class="mp-btn-secondary" onclick="window.ScenarioSystem.toggleMic('step8')">
                            ${listening ? '⏹ Dừng nghe' : '🎙️ Nói thay vì gõ'}
                        </button>
                        <button class="mp-btn-primary" onclick="window.ScenarioSystem.submitStep8()">Tiếp tục xử lý</button>
                    </div>
                    <div style="font-size:12.5px; color:#64748b; margin-top:14px; line-height:1.45;">
                        Ở chế độ Thử thách, lớp không tạm dừng; câu hỏi này xuất hiện sau khi buổi luyện kết thúc.
                    </div>
                </div>
            `;
        },

        _renderStep10ModalHtml: function () {
            const sc = this.activeScenario;
            const totalSt = sc ? sc.students.length : 3;
            const participated = Math.max(Object.keys(this.studentParticipation).length, this.step3Resolved ? totalSt : 0);
            const teacherTurns = this.transcriptLog.filter(l => l.role === 'teacher').length;
            return `
                <div class="mp-center-card" style="text-align:center; max-width:500px;">
                    <div style="width:48px; height:48px; border-radius:50%; background:#ecfdf5; color:#059669; display:inline-flex; align-items:center; justify-content:center; font-size:22px; font-weight:900; margin-bottom:12px;">✓</div>
                    <h2 style="font-size:24px; font-weight:800; color:#0f172a; margin:0 0 6px;">Buổi luyện đã kết thúc</h2>
                    <p style="font-size:14px; color:#475569; margin:0;">${escapeHtml(this.endReasonText)}</p>

                    <div class="mp-stat-3">
                        <div class="mp-stat-box">
                            <div style="font-size:20px; font-weight:800; color:#0f172a;">${formatClock(this.sessionElapsedSec)}</div>
                            <div style="font-size:12px; color:#64748b; margin-top:2px;">Thời gian</div>
                        </div>
                        <div class="mp-stat-box">
                            <div style="font-size:20px; font-weight:800; color:#0f172a;">${teacherTurns}</div>
                            <div style="font-size:12px; color:#64748b; margin-top:2px;">Lượt nói của bạn</div>
                        </div>
                        <div class="mp-stat-box">
                            <div style="font-size:20px; font-weight:800; color:#0f172a;">${participated}/${totalSt}</div>
                            <div style="font-size:12px; color:#64748b; margin-top:2px;">Học sinh tham gia</div>
                        </div>
                    </div>

                    <p style="font-size:13.5px; color:#475569; margin:0 0 18px;">Trước khi xem phân tích, hãy dành một phút tự đánh giá buổi luyện của mình.</p>
                    <button class="mp-btn-primary" style="width:100%; padding:12px;" onclick="window.ScenarioSystem.goToFlowStep(11)">Tự đánh giá</button>
                </div>
            `;
        },

        _renderStep11Page: function () {
            const ratingBtns = [1, 2, 3, 4, 5].map(n => `
                <button class="mp-rate-btn ${this.selfEvalScore === n ? 'selected' : ''}"
                        onclick="window.ScenarioSystem.setSelfEvalScore(${n})">${n}</button>
            `).join('');

            return `
                <div class="mp-kicker">TỰ ĐÁNH GIÁ</div>
                <h1 class="mp-h1">Bạn thấy mình xử lý thế nào?</h1>
                <p class="mp-subtitle">Câu trả lời của bạn sẽ được đặt cạnh phân tích của AI để bạn so sánh.</p>

                <div class="mp-card">
                    <div style="font-size:14.5px; font-weight:700; color:#0f172a;">1. Bạn chấm buổi luyện này mấy điểm?</div>
                    <div class="mp-rating-row">
                        ${ratingBtns}
                        <span style="font-size:12.5px; color:#64748b; margin-left:6px;">1 = chưa ổn · 5 = rất tốt</span>
                    </div>

                    <div style="font-size:14.5px; font-weight:700; color:#0f172a; margin-bottom:6px;">2. Điều gì bạn làm tốt?</div>
                    <textarea id="mp-self-good" rows="3" class="mp-input-light" style="margin-bottom:16px;"
                        placeholder="Ví dụ: Tôi đã giữ bình tĩnh, cho học sinh thời gian suy nghĩ hoặc giao vai trò hợp lý...">${escapeHtml(this.selfEvalGoodText)}</textarea>

                    <div style="font-size:14.5px; font-weight:700; color:#0f172a; margin-bottom:6px;">3. Nếu làm lại, bạn sẽ đổi điều gì?</div>
                    <textarea id="mp-self-change" rows="3" class="mp-input-light"
                        placeholder="Ví dụ: Lần sau tôi sẽ ghi nhận ý kiến học sinh trước rồi mới xin lượt cho bạn khác...">${escapeHtml(this.selfEvalChangeText)}</textarea>
                </div>

                <div class="mp-footer">
                    <button class="mp-btn-secondary" onclick="window.ScenarioSystem.finishToLawFeedback(true)">Bỏ qua</button>
                    <button class="mp-btn-primary" onclick="window.ScenarioSystem.finishToLawFeedback(false)">Xem phân tích</button>
                </div>
            `;
        },

        _renderStep12Page: function () {
            const sc = this.activeScenario;
            if (!sc) return '';
            const grp = this.scenarioGroups.find(g => g.id === this.selectedGroupId) || { name: sc.group };
            const gradeObj = this.gradeLevels.find(g => g.id === this.selectedGradeId) || { shortTag: 'THCS' };
            const report = this.finalLawReport || this.generateLaw2025Report(sc);
            const firstWarn = report.items.find(it => !it.passed) || report.items[0];
            const res = this.scenarioResults[sc.id] || {};

            const headline = this.step3Resolved
                ? `Bạn đã điều phối hiệu quả tình huống “${sc.shortTitle.replace(/^\d+\.\s*/, '')}”`
                : 'Kết quả luyện tập mô phỏng tình huống lớp học';

            const subHeadline = firstWarn && !firstWarn.passed
                ? `Điểm cần cải thiện: ở ${firstWarn.timeStr}, ${firstWarn.criterion.name.toLowerCase()} chưa thể hiện đầy đủ.`
                : 'Tất cả tiêu chí trọng tâm đều thể hiện tốt chuẩn mực Luật Nhà giáo 2025.';

            // Track timeline (Mục b)
            const teacherEvs = this.transcriptLog.filter(l => l.role === 'teacher').slice(-3);
            const teacherPills = teacherEvs.length > 0
                ? teacherEvs.map(ev => `
                    <span class="mp-track-ev" style="background:${ev.isBad ? '#fee2e2;color:#991b1b;' : '#dbeafe;color:#1e40af;'}">
                        ${formatClock(ev.timestampSec)} “${escapeHtml(ev.text.slice(0, 20))}”
                    </span>
                `).join('')
                : `<span class="mp-track-ev" style="background:#f1f5f9;color:#64748b;">Chưa có phát ngôn</span>`;

            const studentTracksHtml = sc.students.map((st, idx) => {
                const bg = idx === 0 ? '#dcfce7;color:#166534;' : '#e2e8f0;color:#334155;';
                const stTurn = this.transcriptLog.find(l => l.role === 'student' && l.studentId === st.id && l.tag !== 'incident_start');
                return `
                    <div class="mp-track-row">
                        <span style="font-size:12.5px; font-weight:700; color:#475569;">${escapeHtml(st.name)}</span>
                        <div class="mp-track-lane">
                            <span class="mp-track-ev" style="background:#f1f5f9;color:#475569;">${escapeHtml(st.initialLine.slice(0, 22))}</span>
                            ${stTurn ? `<span class="mp-track-ev" style="background:${bg}">${formatClock(stTurn.timestampSec || 90)} ${escapeHtml(stTurn.text.slice(0, 22))}</span>` : ''}
                        </div>
                    </div>
                `;
            }).join('');

            // Cards (Mục c)
            const lawCardsHtml = report.items.map(it => `
                <div class="mp-law-item-card ${it.passed ? '' : 'warn'}">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                        <strong style="font-size:13.5px; color:#0f172a;">${escapeHtml(it.criterion.shortRef)} · Luật Nhà giáo 73/2025/QH15</strong>
                        <span class="${it.passed ? 'mp-badge-ok' : 'mp-badge-warn'}">${it.passed ? 'Đạt' : 'Chưa đạt đầy đủ'}</span>
                    </div>
                    <div class="mp-quote-pill">${escapeHtml(it.timeStr)} — “${escapeHtml(it.quote)}”</div>
                    <div style="font-size:13px; color:#475569; line-height:1.5;">${escapeHtml(it.reason)}</div>
                </div>
            `).join('');

            const selfEvalAiMsg = res.selfEvalPassed
                ? 'Bạn đã tự phát hiện điểm cần điều chỉnh cụ thể. Tự đánh giá như vậy đúng với tinh thần Điều 13 khoản 4: dùng chuẩn nghề nghiệp để tự đánh giá và rèn luyện.'
                : 'Cần nêu rõ điểm làm tốt và 1 điều chỉnh câu nói cụ thể nếu làm lại theo tinh thần Điều 13 khoản 4 Luật Nhà giáo 2025.';

            return `
                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px;">
                    <div>
                        <div class="mp-kicker">PHÂN TÍCH BUỔI LUYỆN · ${escapeHtml(grp.name.toUpperCase())} · ${escapeHtml(gradeObj.shortTag)} LỚP ${this.selectedGradeNumber}</div>
                        <h1 class="mp-h1">${escapeHtml(headline)}</h1>
                        <p class="mp-subtitle">${escapeHtml(subHeadline)}</p>
                    </div>
                    <button class="mp-btn-secondary" onclick="window.ScenarioSystem.speakLawReport()">🔊 Nghe phân tích</button>
                </div>

                <div class="mp-analysis-top">
                    <div class="mp-card">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                            <strong style="font-size:15px;">a. Nhận diện</strong>
                            <span class="${this.step8Eval && this.step8Eval.isAccurate ? 'mp-badge-ok' : 'mp-badge-warn'}">
                                ${this.step8Eval && this.step8Eval.isAccurate ? 'Chính xác' : 'Cần bổ sung'}
                            </span>
                        </div>
                        <div style="font-size:13.5px; color:#334155; line-height:1.55;">
                            <strong>Ghi nhận của bạn:</strong> ${escapeHtml(this.step8Answer || '(Chưa nhập)')}<br>
                            <strong>Đáp án tình huống:</strong> ${escapeHtml(sc.step1.answer)}
                        </div>
                    </div>

                    <div class="mp-card">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                            <strong style="font-size:15px;">b. Diễn biến buổi luyện</strong>
                            <span style="font-size:12px; color:#64748b;">00:00 → ${formatClock(this.sessionElapsedSec)}</span>
                        </div>
                        <div class="mp-track-row">
                            <span style="font-size:12.5px; font-weight:700; color:#1d4ed8;">Bạn</span>
                            <div class="mp-track-lane">${teacherPills}</div>
                        </div>
                        ${studentTracksHtml}
                    </div>
                </div>

                <div class="mp-card" style="margin-bottom:16px;">
                    <strong style="font-size:15px;">c. Nhận xét theo Luật Nhà giáo 2025</strong>
                    <div class="mp-law-grid-2">${lawCardsHtml}</div>
                </div>

                <div class="mp-card">
                    <strong style="font-size:15px;">d. Đối chiếu với tự đánh giá của bạn</strong>
                    <div class="mp-compare-2">
                        <div>
                            <div style="font-size:13px; font-weight:700; color:#334155;">Bạn tự chấm: ${this.selfEvalScore}/5</div>
                            <div style="font-size:13.5px; color:#475569; margin-top:4px; line-height:1.5;">
                                “${escapeHtml(this.selfEvalText || 'Chưa ghi nội dung tự đánh giá')}”
                            </div>
                        </div>
                        <div>
                            <div style="font-size:13px; font-weight:700; color:#1d4ed8;">AI nhận xét (Điều 13 khoản 4)</div>
                            <div style="font-size:13.5px; color:#475569; margin-top:4px; line-height:1.5;">${escapeHtml(selfEvalAiMsg)}</div>
                        </div>
                    </div>
                </div>

                <div class="mp-footer">
                    <button class="mp-btn-secondary" onclick="window.ScenarioSystem.goToFlowStep(11)">Quay lại</button>
                    <button class="mp-btn-primary" onclick="window.ScenarioSystem.goToFlowStep(13)">Xem câu mẫu cho phút ${escapeHtml(firstWarn ? firstWarn.timeStr : '01:10')}</button>
                </div>
            `;
        },

        _renderStep13Page: function () {
            const sc = this.activeScenario;
            if (!sc) return '';
            const ctx = sc.step13Context || { issueLabel: sc.shortTitle, badExampleQuote: '', badConsequence: '' };
            const firstBadTurn = this.transcriptLog.find(l => l.role === 'teacher' && l.isBad) || this.transcriptLog.find(l => l.role === 'teacher');
            const displayQuote = firstBadTurn ? firstBadTurn.text : ctx.badExampleQuote;
            const timeMark = firstBadTurn ? formatClock(firstBadTurn.timestampSec) : '01:10';
            const tones = sc.step13Tones || [];

            const toneCards = tones.map((t, idx) => {
                const badgeCls = t.toneColor === 'green' ? 'background:#dcfce7;color:#166534;'
                    : (t.toneColor === 'orange' ? 'background:#ffedd5;color:#9a3412;' : 'background:#dbeafe;color:#1e40af;');
                return `
                    <div class="mp-tone-card ${idx === 1 ? 'featured' : ''}">
                        <div>
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                                <span style="padding:4px 10px; border-radius:999px; font-size:12px; font-weight:700; ${badgeCls}">${escapeHtml(t.tone)}</span>
                                <button class="mp-play-round" onclick="window.ScenarioSystem.speakToneSample(${idx})" title="Nghe câu mẫu">▶</button>
                            </div>
                            <div style="font-size:15px; font-weight:700; color:#0f172a; line-height:1.45;">“${escapeHtml(t.text)}”</div>
                        </div>
                        <div style="font-size:13px; color:#475569; line-height:1.45; border-top:1px solid #f1f5f9; padding-top:10px;">${escapeHtml(t.whyWorks)}</div>
                    </div>
                `;
            }).join('');

            const listening = Boolean(window.SpeechEngine && window.SpeechEngine.isListening);

            return `
                <div class="mp-kicker">CÂU MẪU GỢI Ý</div>
                <h1 class="mp-h1">Phút ${escapeHtml(timeMark)} — ${escapeHtml(ctx.issueLabel)}</h1>

                <div style="background:#fff7ed; border:1px solid #fed7aa; border-radius:12px; padding:12px 16px; display:flex; justify-content:space-between; align-items:center; gap:12px; margin-top:14px;">
                    <div style="font-size:13.5px; color:#0f172a;">
                        <strong style="color:#c2410c; margin-right:8px;">BẠN ĐÃ NÓI</strong>
                        “${escapeHtml(displayQuote)}”
                    </div>
                    <span style="font-size:12.5px; color:#9a3412;">${escapeHtml(ctx.badConsequence)}</span>
                </div>

                <div class="mp-tone-grid-3">${toneCards}</div>

                <div class="mp-card" style="display:flex; align-items:center; justify-content:space-between; gap:14px;">
                    <div style="display:flex; align-items:center; gap:14px;">
                        <button class="mp-mic-circle ${listening ? 'listening' : ''}" style="width:48px; height:48px; font-size:18px;"
                                onclick="window.ScenarioSystem.toggleMic('step13')">🎙️</button>
                        <div>
                            <div style="font-weight:700; font-size:14.5px; color:#0f172a;">Nói thử lại một câu (hoặc bấm nút ▶ ở thẻ trên để thử)</div>
                            <div style="font-size:13px; color:#475569; margin-top:2px;">
                                ${this.step13RetryText ? `Bạn vừa nói: “${escapeHtml(this.step13RetryText)}”` : 'Giữ Space hoặc bấm Micro để nói câu sửa của bạn'}
                            </div>
                        </div>
                    </div>
                    ${this.step13RetrySuccess ? `<div class="mp-status-pill-ok">✓ Học sinh hợp tác tích cực!</div>` : ''}
                </div>

                <div class="mp-footer">
                    <button class="mp-btn-secondary" onclick="window.ScenarioSystem.goToFlowStep(12)">Quay lại phân tích</button>
                    <button class="mp-btn-primary" onclick="window.ScenarioSystem.goToFlowStep(14)">Tiếp tục</button>
                </div>
            `;
        },

        _renderStep14Page: function () {
            const sc = this.activeScenario;
            if (!sc) return '';
            const teacherTurns = this.transcriptLog.filter(l => l.role === 'teacher');

            const decisionRows = (teacherTurns.length > 0 ? teacherTurns : [{ timestampSec: 70, text: 'Mở đầu xử lý tình huống', isBad: false }]).map((t, idx) => {
                const rawIdx = this.transcriptLog.indexOf(t);
                const statusTxt = t.isBad ? 'Cần cải thiện · Điều 9 khoản 2 điểm d' : 'Đạt';
                return `
                    <div class="mp-decision-row">
                        <div>
                            <div style="font-weight:700; font-size:13.5px; color:#0f172a;">
                                <span style="color:#64748b; margin-right:8px;">${formatClock(t.timestampSec)}</span>
                                ${escapeHtml(t.text.slice(0, 48))}${t.text.length > 48 ? '...' : ''}
                            </div>
                            <div style="font-size:12px; color:${t.isBad ? '#c2410c' : '#166534'}; font-weight:600; margin-top:2px;">${statusTxt}</div>
                        </div>
                        <button class="${t.isBad || idx === 0 ? 'mp-btn-primary' : 'mp-btn-secondary'}" style="padding:7px 14px; font-size:12.5px;"
                                onclick="window.ScenarioSystem.rewindToDecisionPoint(${Math.max(0, rawIdx)})">Tua lại</button>
                    </div>
                `;
            }).join('');

            const progressRows = this.scenarioGroups.map(g => {
                const cnt = this.groupProgress[g.id] || 0;
                const pct = Math.min(100, cnt * 25);
                return `
                    <div style="margin-bottom:12px;">
                        <div style="display:flex; justify-content:space-between; font-size:13px; color:#0f172a;">
                            <span style="font-weight:${this.selectedGroupId === g.id ? '800' : '600'};">${escapeHtml(g.name)}</span>
                            <span style="color:#64748b;">${cnt > 0 ? `${cnt} buổi` : 'Chưa luyện'}</span>
                        </div>
                        <div class="mp-progress-track"><div class="mp-progress-fill" style="width:${pct}%;"></div></div>
                    </div>
                `;
            }).join('');

            // Gợi ý nhóm chưa luyện nhiều nhất
            const nextGrp = [...this.scenarioGroups].sort((a, b) => (this.groupProgress[a.id] || 0) - (this.groupProgress[b.id] || 0))[0] || this.scenarioGroups[0];
            const nextScId = nextGrp && nextGrp.scenarioIds ? nextGrp.scenarioIds[0] : 1;

            return `
                <div class="mp-kicker">LUYỆN LẠI</div>
                <h1 class="mp-h1">Thử lại khoảnh khắc chưa tốt, hoặc chuyển sang tình huống mới</h1>

                <div class="mp-step14-grid" style="margin-top:20px;">
                    <div class="mp-card">
                        <strong style="font-size:15px; color:#0f172a;">Tua lại tại điểm quyết định</strong>
                        ${decisionRows}
                    </div>

                    <div style="display:flex; flex-direction:column; gap:16px;">
                        <div class="mp-card">
                            <strong style="font-size:15px; color:#0f172a; display:block; margin-bottom:12px;">Hồ sơ tiến bộ</strong>
                            ${progressRows}
                        </div>

                        <div class="mp-card" style="background:#eff6ff; border-color:#bfdbfe;">
                            <div style="font-size:11.5px; font-weight:800; color:#1d4ed8; text-transform:uppercase;">GỢI Ý TIẾP THEO</div>
                            <div style="font-size:16px; font-weight:800; color:#0f172a; margin:6px 0 4px;">
                                ${escapeHtml(nextGrp.name)} · Lớp ${this.selectedGradeNumber}
                            </div>
                            <div style="font-size:13px; color:#334155; line-height:1.45; margin-bottom:14px;">
                                ${escapeHtml(nextGrp.desc)}. Mở rộng kỹ năng xử lý và đối chiếu Luật Nhà giáo 2025.
                            </div>
                            <button class="mp-btn-primary" style="width:100%;"
                                    onclick="window.ScenarioSystem.launchSuggestedGroup('${nextGrp.id}', ${nextScId})">
                                Luyện tình huống này
                            </button>
                        </div>
                    </div>
                </div>

                <div class="mp-footer">
                    <button class="mp-btn-secondary" onclick="window.ScenarioSystem.goToFlowStep(13)">Quay lại câu mẫu</button>
                    <button class="mp-btn-secondary" onclick="window.ScenarioSystem.goToFlowStep(4)">Chọn tình huống khác</button>
                </div>
            `;
        },

        // ================= HUD TỐI TRONG LỚP HỌC 3D (BƯỚC 6, 7, 9 & THANH TRÊN Ở BƯỚC 8, 10) =================
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
            const bc = sc.blindContext || {};
            const meta = this.stepsMeta.find(s => s.step === this.flowStep) || { title: '' };
            const modeLabel = this.selectedMode === 'realistic' ? 'Thử thách' : 'Luyện tập';
            const isModalOverlayStep = this.flowStep === 8 || this.flowStep === 10;
            const pauseSuffix = this.isPaused ? ' · Đã tạm dừng' : (this.flowStep === 10 ? ' · Đã kết thúc' : '');
            const listening = Boolean(window.SpeechEngine && window.SpeechEngine.isListening);
            const curLang = window.SpeechEngine ? window.SpeechEngine.sttLang : 'vi-VN';

            panel.className = `class3d-shell ${isModalOverlayStep ? 'dimmed-bar-only' : ''}`;

            const drawerHtml = this.flowStep === 9 ? `
                <aside class="c3d-drawer">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong style="font-size:14px; color:#ffffff;">Lời thoại</strong>
                        <span style="font-size:11px; color:#94a3b8;">${Object.keys(this.studentParticipation).length}/${sc.students.length} HS</span>
                    </div>
                    <div class="c3d-drawer-log" id="c3d-log-scroll">
                        ${this.transcriptLog.map(entry => `
                            <div class="c3d-log-card ${entry.role === 'teacher' ? 'teacher' : ''}">
                                <div style="font-size:11px; font-weight:700; color:${entry.role === 'teacher' ? '#93c5fd' : '#fbbf24'}; margin-bottom:2px;">
                                    ${escapeHtml(entry.speaker)} · ${formatClock(entry.timestampSec)}
                                </div>
                                <div style="line-height:1.45;">${escapeHtml(entry.text)}</div>
                            </div>
                        `).join('')}
                    </div>
                    ${this.selectedMode === 'guided' ? `
                        <details style="margin-top:8px; font-size:11.5px; color:#cbd5e1;">
                            <summary style="cursor:pointer; color:#7dd3fc;">🧪 Thử nhanh nhánh kịch bản</summary>
                            <div style="display:flex; flex-direction:column; gap:5px; margin-top:6px;">
                                ${sc.branches.map(b => `
                                    <button class="mp-ghost-mini" style="background:rgba(255,255,255,0.08);color:#fff;border-color:rgba(255,255,255,0.16);text-align:left;"
                                        onclick="window.ScenarioSystem.triggerDemoBranch('${b.id}')">${b.success ? '✅' : '⚠️'} ${escapeHtml(b.label)}</button>
                                `).join('')}
                            </div>
                        </details>
                    ` : ''}
                </aside>
            ` : '';

            const lastLog = this.transcriptLog[this.transcriptLog.length - 1];
            const rightDockBtn = this.flowStep === 6
                ? `<button class="c3d-action-btn" onclick="window.ScenarioSystem.goToFlowStep(7)">Tiếp: Tình huống ▶</button>`
                : (this.flowStep === 7
                    ? `<button class="c3d-action-btn" onclick="window.ScenarioSystem.advanceAfterStep7()">${this.selectedMode === 'realistic' ? 'Xử lý ngay ▶' : 'Nhận diện tình huống ▶'}</button>`
                    : (this.selectedMode === 'guided'
                        ? `<button class="c3d-action-btn" onclick="window.ScenarioSystem.requestHintInStep9()">Xin gợi ý</button>`
                        : `<span id="c3d-silence-badge" class="c3d-pill-dark" style="border-color:#ef4444;color:#fca5a5;">⏳ Thời gian thực (7s)</span>`));

            const centerBannerHtml = (!isModalOverlayStep && this.hintBannerText) ? `
                <div class="c3d-center-banner">
                    <span>${escapeHtml(this.hintBannerText)}</span>
                    ${this.flowStep === 7 && this.selectedMode === 'guided' ? `<button class="c3d-action-btn" style="padding:4px 10px;font-size:11.5px;" onclick="window.ScenarioSystem.advanceAfterStep7()">Nhận diện</button>` : ''}
                </div>
            ` : '';

            panel.innerHTML = `
                <div class="c3d-topbar">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span class="c3d-pill-dark">⏱ <span id="c3d-timer-val">${formatClock(this.sessionElapsedSec)} / ${formatClock(this.sessionDurationSec)}</span>${pauseSuffix}</span>
                        <span class="c3d-pill-mode ${this.selectedMode === 'realistic' ? 'c3d-pill-challenge' : ''}">${modeLabel}</span>
                        <span class="c3d-pill-dark">${escapeHtml(bc.classLabel || '')} · ${escapeHtml((bc.unitName || '').split('(')[0].trim())}</span>
                    </div>
                    <div style="font-size:12.5px; color:#cbd5e1; font-weight:600;">
                        Trong lớp học · ${escapeHtml((meta.title || '').replace(/\s*trong lớp\s*3D/i, ''))}
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <button class="c3d-pill-dark" style="cursor:pointer;" onclick="window.ClassroomGame && window.ClassroomGame.openSettings && window.ClassroomGame.openSettings()" title="Cài đặt hiển thị (Phím O)">⚙️</button>
                        ${this.selectedMode === 'guided' && !isModalOverlayStep ? `<button class="c3d-pill-dark" style="cursor:pointer;" onclick="window.ScenarioSystem.togglePracticePause()">${this.isPaused ? '▶ Tiếp' : '⏸'}</button>` : ''}
                        <button class="c3d-pill-dark" style="cursor:pointer;" onclick="window.ScenarioSystem.finishPracticePhase()">Kết thúc</button>
                    </div>
                </div>

                ${!isModalOverlayStep ? `
                    <div class="c3d-middle">
                        ${centerBannerHtml}
                        ${drawerHtml}
                    </div>
                    <div class="c3d-bottom-dock">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <button id="c3d-mic-btn" class="c3d-mic-btn ${listening ? 'listening' : ''}" onclick="window.ScenarioSystem.toggleMic('main')" title="Bật/Tắt Micro (Hoặc giữ Space)">🎙️</button>
                            <div style="display:flex; flex-direction:column;">
                                <span id="c3d-mic-label" style="font-size:12.5px; font-weight:700; color:#e2e8f0;">${listening ? 'Đang nghe bạn nói...' : 'Giữ Space để nói'}</span>
                                <button onclick="window.ScenarioSystem.toggleSttLang()" style="background:none;border:none;color:#7dd3fc;font-size:11px;padding:0;text-align:left;cursor:pointer;">
                                    🌐 ${curLang === 'en-US' ? 'English (en-US)' : 'Tiếng Việt (vi-VN)'}
                                </button>
                            </div>
                        </div>

                        <div class="c3d-speech-bar">
                            <input id="c3d-speech-input" type="text" class="c3d-speech-input"
                                value="${escapeHtml(this.draftUtterance)}"
                                placeholder="${lastLog ? `${escapeHtml(lastLog.speaker)}: ${escapeHtml(lastLog.text.slice(0, 68))}` : 'Nói bằng Space hoặc nhập câu xử lý (Enter để gửi)...'}"
                                onkeydown="if(event.key==='Enter'){ event.preventDefault(); window.ScenarioSystem.submitTeacherUtterance(); }">
                            <button class="c3d-pill-dark" style="background:#2563eb;border-color:#38bdf8;cursor:pointer;"
                                onclick="window.ScenarioSystem.submitTeacherUtterance()">Gửi</button>
                        </div>

                        ${rightDockBtn}
                    </div>
                ` : ''}
            `;

            const logScroll = document.getElementById('c3d-log-scroll');
            if (logScroll) logScroll.scrollTop = logScroll.scrollHeight;
        },

        // ================= HÀM TƯƠNG THÍCH CHO PHÍM TẮT =================
        closeWizardForRoam: function () {
            if (window.ClassroomGame && window.ClassroomGame.setFlowPhase) {
                window.ClassroomGame.setFlowPhase('free');
            }
            this.wizardClosedForRoam = true;
            this.renderAll();
        },
        openGuideModal: function () { this.goToFlowStep(1); },
        openScenariosModal: function () { this.goToFlowStep(4); },
        openStudentsModal: function () {
            if (this.flowStep >= 5 && this.activeScenario) {
                this.goToFlowStep(5);
            } else {
                this.goToFlowStep(4);
            }
        }
    };

    window.ScenarioSystem = ScenarioSystem;
    window.ScenarioManager = ScenarioSystem;

    window.addEventListener('DOMContentLoaded', () => {
        ScenarioSystem.init();
    });
})();
