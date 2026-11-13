// speechEngine.js - Engine Speech-to-Text (STT) & Text-to-Speech (TTS) ElevenLabs Việt - Anh
// Ưu tiên phát file audio MP3 chất lượng cao tạo từ ElevenLabs (ttsManifest.js + /api/tts), fallback Web Speech API

(function () {
    'use strict';

    const VIETNAMESE_CHAR_REGEX = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

    const DEFAULT_STUDENT_PROFILES = {
        bin: 'student_male_1',
        ti: 'student_male_2',
        'tí': 'student_male_2',
        na: 'student_female_1',
        huy: 'student_male_1',
        nam: 'student_male_2',
        lan: 'student_female_1',
        khoa: 'student_male_1',
        duc: 'student_male_2',
        'đức': 'student_male_2',
        vy: 'student_female_1',
        mai: 'student_female_1',
        tuan: 'student_male_1',
        'tuấn': 'student_male_1',
        linh: 'student_female_2',
        thao: 'student_female_1',
        'thảo': 'student_female_1',
        quan: 'student_male_2',
        'quân': 'student_male_2',
        ha: 'student_female_2',
        'hà': 'student_female_2'
    };

    const SpeechEngine = {
        ttsEnabled: true,
        preferVietnameseVoice: true,
        useElevenLabs: true,
        voices: [],
        viVoice: null,
        viFemaleVoice: null,
        viMaleVoice: null,
        enVoice: null,
        ttsQueue: [],
        isSpeaking: false,
        currentAudio: null,
        playbackToken: 0,
        dynamicAudioCache: {},
        onStatusChange: null,

        // STT state
        recognition: null,
        isListening: false,
        sttLang: 'vi-VN', // 'vi-VN' hoặc 'en-US'
        onSttResult: null,
        onSttStateChange: null,
        onSttError: null,
        finalTranscriptBuffer: '',
        lastInterimText: '',

        init: function () {
            this.loadVoices();
            if (window.speechSynthesis && typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
                window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
            }
            this.initRecognition();
        },

        // ================= 1. TEXT-TO-SPEECH (TTS) =================
        loadVoices: function () {
            if (!window.speechSynthesis) return;
            this.voices = window.speechSynthesis.getVoices() || [];

            const viVoices = this.voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('vi'));

            // Ưu tiên giọng nữ người Việt tự nhiên (HoaiMy, Linh, Google Tiếng Việt)
            this.viFemaleVoice =
                viVoices.find(v => /hoaimy|linh|my|chi|female/i.test(v.name)) ||
                viVoices.find(v => /google/i.test(v.name)) ||
                viVoices[0] ||
                null;

            // Ưu tiên giọng nam người Việt tự nhiên (NamMinh, An) nếu trình duyệt có
            this.viMaleVoice =
                viVoices.find(v => /namminh|minh|\ban\b|male/i.test(v.name) && v !== this.viFemaleVoice) ||
                viVoices.find(v => v !== this.viFemaleVoice) ||
                this.viFemaleVoice ||
                null;

            this.viVoice = this.viFemaleVoice || this.viMaleVoice || null;

            // Giọng Tiếng Anh (chỉ dùng cho câu tiếng Anh thuần khi cần)
            this.enVoice =
                this.voices.find(v => v.lang && v.lang.toLowerCase().startsWith('en-us') && /google|natural/i.test(v.name)) ||
                this.voices.find(v => v.lang && v.lang.toLowerCase().startsWith('en')) ||
                null;
        },

        // Làm sạch ghi chú hành động trong ngoặc (...) và emoji để giọng đọc người Việt đọc trôi chảy
        _cleanSpeechText: function (text) {
            if (!text) return '';
            let clean = String(text)
                .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F]/gu, '')
                .trim();

            // Nếu trong câu có cả lời nói và mô tả hành động trong ngoặc, bỏ phần mô tả hành động khỏi giọng đọc
            const withoutStageNotes = clean.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
            if (withoutStageNotes) {
                clean = withoutStageNotes;
            } else {
                clean = clean.replace(/[()]/g, '').trim();
            }
            return clean;
        },

        // Giữ nguyên câu bằng giọng người Việt vi-VN cho học sinh & câu tiếng Việt; chỉ chuyển en-US nếu câu thuần tiếng Anh
        splitBilingualSegments: function (text, options = {}) {
            const clean = this._cleanSpeechText(text);
            if (!clean) return [];

            // Nếu là học sinh Việt Nam hoặc câu có chứa tiếng Việt -> đọc trọn câu bằng giọng người Việt (vi-VN)
            if (options.forceLang === 'vi-VN' || options.isStudent || VIETNAMESE_CHAR_REGEX.test(clean) || (this.preferVietnameseVoice && options.forceLang !== 'en-US' && VIETNAMESE_CHAR_REGEX.test(clean))) {
                return [{ text: clean, lang: 'vi-VN' }];
            }

            return [{
                text: clean,
                lang: options.forceLang || 'en-US'
            }];
        },

        _resolveVoiceProfile: function (item) {
            const speakerNorm = String(item.speaker || '').trim().toLowerCase();
            const customMap = (typeof window !== 'undefined' && window.ELEVENLABS_STUDENT_PROFILES) || {};
            if (item.isStudent) {
                if (customMap[speakerNorm]) return customMap[speakerNorm];
                if (DEFAULT_STUDENT_PROFILES[speakerNorm]) return DEFAULT_STUDENT_PROFILES[speakerNorm];
                return item.gender === 'male' ? 'student_male_1' : 'student_female_1';
            }
            return item.gender === 'male' ? 'teacher_male' : 'teacher_female';
        },

        _findManifestAudioUrl: function (item) {
            const manifest = (typeof window !== 'undefined' && window.ELEVENLABS_TTS_MANIFEST) || null;
            if (!manifest) return null;
            const clean = this._cleanSpeechText(item.text);
            if (!clean) return null;

            const profile = this._resolveVoiceProfile(item);
            const speakerNorm = String(item.speaker || '').trim().toLowerCase();
            const genericStudent = item.isStudent ? (item.gender === 'male' ? 'student_male' : 'student_female') : '';

            const candidates = [
                `${profile}|${clean}`,
                speakerNorm ? `${speakerNorm}|${clean}` : '',
                genericStudent ? `${genericStudent}|${clean}` : '',
                `*|${clean}`
            ].filter(Boolean);

            for (const k of candidates) {
                if (manifest[k]) return manifest[k];
            }
            return null;
        },

        stopSpeaking: function () {
            this.playbackToken += 1;
            this.ttsQueue = [];
            this.isSpeaking = false;
            if (this.currentAudio) {
                try {
                    this.currentAudio.onended = null;
                    this.currentAudio.onerror = null;
                    this.currentAudio.pause();
                    this.currentAudio.src = '';
                } catch (e) {}
                this.currentAudio = null;
            }
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
            this._notifyTtsStatus(false, '');
        },

        speak: function (text, options = {}) {
            if (!this.ttsEnabled || !text) {
                if (options.onEnd) options.onEnd();
                return;
            }
            const hasAudio = typeof Audio !== 'undefined';
            const hasSynth = typeof window !== 'undefined' && Boolean(window.speechSynthesis);
            if (!hasAudio && !hasSynth) {
                if (options.onEnd) options.onEnd();
                return;
            }
            if (!options.keepQueue) {
                this.stopSpeaking();
            }
            const segs = this.splitBilingualSegments(text, options);
            segs.forEach((seg, i) => {
                this.ttsQueue.push({
                    text: seg.text,
                    lang: options.forceLang || seg.lang,
                    gender: options.gender || '',
                    isStudent: Boolean(options.isStudent),
                    pitch: options.pitch || 1.0,
                    rate: options.rate || 1.02,
                    speaker: options.speaker || '',
                    onStart: i === 0 ? options.onStart : null,
                    onEnd: i === segs.length - 1 ? options.onEnd : null
                });
            });
            if (!this.isSpeaking) {
                this._processQueue();
            }
        },

        // Đọc lần lượt nhiều nhân vật nối tiếp nhau
        speakSequence: function (items) {
            if (!this.ttsEnabled || !items || items.length === 0) return;
            const hasAudio = typeof Audio !== 'undefined';
            const hasSynth = typeof window !== 'undefined' && Boolean(window.speechSynthesis);
            if (!hasAudio && !hasSynth) return;

            this.stopSpeaking();

            items.forEach(item => {
                const segs = this.splitBilingualSegments(item.text, item);
                segs.forEach((seg, idx) => {
                    this.ttsQueue.push({
                        text: seg.text,
                        lang: item.forceLang || seg.lang,
                        gender: item.gender || '',
                        isStudent: Boolean(item.isStudent),
                        pitch: item.pitch || 1.0,
                        rate: item.rate || 1.02,
                        speaker: item.speaker || '',
                        onStart: idx === 0 ? item.onStart : null,
                        onEnd: idx === segs.length - 1 ? item.onEnd : null
                    });
                });
            });

            if (!this.isSpeaking) {
                this._processQueue();
            }
        },

        _playAudioUrl: function (url, item, token, onDone, onFail) {
            try {
                const audio = new Audio(url);
                this.currentAudio = audio;
                const rawRate = Number(item.rate) || 1.0;
                audio.playbackRate = Math.min(1.15, Math.max(0.9, rawRate));

                let settled = false;
                let safetyTimer = null;
                const finish = (ok) => {
                    if (settled) return;
                    settled = true;
                    if (safetyTimer) {
                        clearTimeout(safetyTimer);
                        safetyTimer = null;
                    }
                    if (this.currentAudio === audio) {
                        this.currentAudio = null;
                    }
                    if (token !== this.playbackToken) return;
                    if (ok) onDone();
                    else onFail();
                };

                audio.onended = () => finish(true);
                audio.onerror = () => finish(false);

                // Timeout an toàn chỉ kích hoạt khi audio bị đơ hoàn toàn không bắn event onended
                const safetyMs = Math.max(30000, (item.text.length * 350) + 10000);
                safetyTimer = setTimeout(() => {
                    if (!settled && token === this.playbackToken && this.isSpeaking) {
                        finish(true);
                    }
                }, safetyMs);

                const playPromise = audio.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(() => finish(false));
                }
            } catch (e) {
                onFail();
            }
        },

        _fetchDynamicElevenLabsUrl: async function (item) {
            const profile = this._resolveVoiceProfile(item);
            const clean = this._cleanSpeechText(item.text);
            const cacheKey = `${profile}|${clean}`;
            if (this.dynamicAudioCache[cacheKey]) {
                return this.dynamicAudioCache[cacheKey];
            }
            if (typeof fetch !== 'function' || typeof window === 'undefined' || !window.location || !/^https?:/.test(window.location.protocol)) {
                return null;
            }
            try {
                const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
                const timeoutId = controller ? setTimeout(() => controller.abort(), 1400) : null;
                const res = await fetch('/api/tts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: clean,
                        profile: profile,
                        lang: item.lang
                    }),
                    signal: controller ? controller.signal : undefined
                });
                if (timeoutId) clearTimeout(timeoutId);
                if (!res.ok) return null;
                const contentType = res.headers.get('content-type') || '';
                if (!contentType.includes('audio')) return null;
                const blob = await res.blob();
                const objUrl = URL.createObjectURL(blob);
                this.dynamicAudioCache[cacheKey] = objUrl;
                return objUrl;
            } catch (err) {
                return null;
            }
        },

        _speakWithWebSpeech: function (item, token, finishStep) {
            if (typeof window === 'undefined' || !window.speechSynthesis) {
                finishStep();
                return;
            }
            const utter = new SpeechSynthesisUtterance(item.text);
            utter.lang = item.lang;
            utter.pitch = item.pitch;
            utter.rate = item.rate;

            if (item.lang === 'vi-VN') {
                if (item.gender === 'male' && this.viMaleVoice) {
                    utter.voice = this.viMaleVoice;
                    if (this.viMaleVoice === this.viFemaleVoice) {
                        utter.pitch = Math.max(0.75, (item.pitch || 1.0) * 0.85);
                    }
                } else if (this.viVoice) {
                    utter.voice = this.viVoice;
                }
            } else if (item.lang === 'en-US' && this.enVoice) {
                utter.voice = this.enVoice;
            }

            utter.onend = () => { if (token === this.playbackToken) finishStep(); };
            utter.onerror = () => { if (token === this.playbackToken) finishStep(); };

            const estMs = Math.max(2500, item.text.length * 110);
            setTimeout(() => {
                if (token === this.playbackToken && this.isSpeaking) {
                    finishStep();
                }
            }, estMs);

            window.speechSynthesis.speak(utter);
        },

        _processQueue: function () {
            if (this.ttsQueue.length === 0) {
                this.isSpeaking = false;
                this._notifyTtsStatus(false, '');
                return;
            }

            this.isSpeaking = true;
            const item = this.ttsQueue.shift();
            const token = this.playbackToken;

            if (item.onStart) {
                try { item.onStart(); } catch (e) { console.warn(e); }
            }
            this._notifyTtsStatus(true, item.speaker || item.text);

            let finished = false;
            const finishStep = () => {
                if (finished || token !== this.playbackToken) return;
                finished = true;
                if (item.onEnd) {
                    try { item.onEnd(); } catch (e) { console.warn(e); }
                }
                this._processQueue();
            };

            const hasAudio = typeof Audio !== 'undefined';
            if (this.useElevenLabs && hasAudio) {
                const manifestUrl = this._findManifestAudioUrl(item);
                if (manifestUrl) {
                    this._playAudioUrl(manifestUrl, item, token, finishStep, () => {
                        this._speakWithWebSpeech(item, token, finishStep);
                    });
                    return;
                }

                this._fetchDynamicElevenLabsUrl(item).then((dynUrl) => {
                    if (token !== this.playbackToken) return;
                    if (dynUrl) {
                        this._playAudioUrl(dynUrl, item, token, finishStep, () => {
                            this._speakWithWebSpeech(item, token, finishStep);
                        });
                    } else {
                        this._speakWithWebSpeech(item, token, finishStep);
                    }
                }).catch(() => {
                    if (token === this.playbackToken) {
                        this._speakWithWebSpeech(item, token, finishStep);
                    }
                });
                return;
            }

            this._speakWithWebSpeech(item, token, finishStep);
        },

        _notifyTtsStatus: function (speaking, label) {
            if (this.onStatusChange) {
                this.onStatusChange(speaking, label);
            }
        },

        // ================= 2. SPEECH-TO-TEXT (STT) =================
        isSttSupported: function () {
            return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
        },

        initRecognition: function () {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) return;

            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = this.sttLang;

            this.recognition.onstart = () => {
                this.isListening = true;
                if (this.onSttStateChange) this.onSttStateChange(true, this.sttLang);
            };

            this.recognition.onresult = (event) => {
                let interim = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        this.finalTranscriptBuffer += (this.finalTranscriptBuffer ? ' ' : '') + transcript.trim();
                    } else {
                        interim += transcript;
                    }
                }
                this.lastInterimText = interim.trim();
                if (this.onSttResult) {
                    this.onSttResult(this.finalTranscriptBuffer, this.lastInterimText);
                }
            };

            this.recognition.onerror = (event) => {
                let msg = 'Lỗi nhận diện giọng nói: ' + event.error;
                if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    msg = 'Trình duyệt chưa được cấp quyền Micro. Hãy cấp quyền Micro trên thanh địa chỉ hoặc nhập chữ trực tiếp.';
                } else if (event.error === 'no-speech') {
                    msg = 'Không nghe thấy giọng nói. Bạn hãy nói gần micro hơn nhé.';
                } else if (event.error === 'network') {
                    msg = 'Lỗi mạng khi gọi dịch vụ Speech-to-Text của trình duyệt (bạn vẫn có thể nhập văn bản trực tiếp).';
                }
                this.isListening = false;
                if (this.onSttStateChange) this.onSttStateChange(false, this.sttLang);
                if (this.onSttError) this.onSttError(msg, event.error);
            };

            this.recognition.onend = () => {
                this.isListening = false;
                if (this.onSttStateChange) this.onSttStateChange(false, this.sttLang);
            };
        },

        setSttLang: function (lang) {
            this.sttLang = lang;
            if (this.recognition) {
                this.recognition.lang = lang;
            }
            if (this.isListening) {
                this.stopListening();
                setTimeout(() => this.startListening(this.finalTranscriptBuffer), 250);
            }
        },

        startListening: function (initialText = '') {
            if (!this.isSttSupported()) {
                if (this.onSttError) {
                    this.onSttError('Trình duyệt hiện tại không hỗ trợ Web Speech Recognition (khuyến nghị Chrome hoặc Edge). Bạn có thể gõ lời nói vào ô bên dưới!', 'unsupported');
                }
                return false;
            }
            // Tạm dừng TTS để mic không thu lại tiếng loa
            this.stopSpeaking();

            this.finalTranscriptBuffer = initialText ? initialText.trim() : '';
            this.lastInterimText = '';
            if (!this.recognition) this.initRecognition();
            this.recognition.lang = this.sttLang;

            try {
                this.recognition.start();
                return true;
            } catch (e) {
                // Nếu đang start dở thì reset
                try {
                    this.recognition.stop();
                } catch (_) {}
                return false;
            }
        },

        stopListening: function () {
            if (this.recognition && this.isListening) {
                try {
                    this.recognition.stop();
                } catch (e) {}
            }
            this.isListening = false;
            if (this.onSttStateChange) this.onSttStateChange(false, this.sttLang);
        },

        // Dừng Push-to-Talk và đợi ngắn để thu nốt kết quả STT cuối cùng
        flushAndStop: function (callback) {
            if (this.recognition && this.isListening) {
                try {
                    this.recognition.stop();
                } catch (e) {}
            }
            setTimeout(() => {
                this.isListening = false;
                if (this.onSttStateChange) this.onSttStateChange(false, this.sttLang);
                const full = [this.finalTranscriptBuffer, this.lastInterimText]
                    .filter(Boolean)
                    .join(' ')
                    .trim();
                this.lastInterimText = '';
                if (callback) callback(full);
            }, 220);
        },

        toggleListening: function (initialText = '') {
            if (this.isListening) {
                this.stopListening();
                return false;
            } else {
                return this.startListening(initialText);
            }
        }
    };

    // Bridge tương thích với window.VoiceEngine cũ
    window.SpeechEngine = SpeechEngine;
    window.VoiceEngine = {
        get enabled() { return SpeechEngine.ttsEnabled; },
        set enabled(v) { SpeechEngine.ttsEnabled = v; },
        speak: (text, opts) => SpeechEngine.speak(text, opts)
    };

    SpeechEngine.init();
})();
