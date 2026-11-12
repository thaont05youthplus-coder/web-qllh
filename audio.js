// audio.js - Web Audio API Sound Synthesizer for 3D Virtual Classroom
// Tạo hiệu ứng âm thanh phong phú 100% bằng code trình duyệt, không cần tải file ngoài

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.isBgmPlaying = false;
        this.bgmTimer = null;
        this.masterVolume = 0.6;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // 1. Tiếng bước chân trên sàn gỗ (Footsteps)
    playFootstep() {
        if (this.isMuted) return;
        this.init();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Tần số trầm mô phỏng tiếng chân đập sàn gỗ
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(80 + Math.random() * 20, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.2 * this.masterVolume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.08);
    }

    // 2. Tiếng công tắc bật / tắt đèn điện lớp học (Light Switch Click)
    playSwitch() {
        if (this.isMuted) return;
        this.init();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.04);

        gain.gain.setValueAtTime(0.25 * this.masterVolume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.04);
    }

    // 3. Tiếng chuông trường học báo giờ vào lớp (School Bell Chimes)
    playBell() {
        if (this.isMuted) return;
        this.init();

        // 3 nốt chuông ngân vang vui tai: Đô - Mi - Sol - Đố (C5, E5, G5, C6)
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
            const startTime = this.ctx.currentTime + idx * 0.35;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);

            // Hòa âm cho tiếng chuông kim loại ngân vang
            const oscHarmonic = this.ctx.createOscillator();
            const gainHarmonic = this.ctx.createGain();
            oscHarmonic.type = 'triangle';
            oscHarmonic.frequency.setValueAtTime(freq * 2, startTime);

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.4 * this.masterVolume, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

            gainHarmonic.gain.setValueAtTime(0.15 * this.masterVolume, startTime);
            gainHarmonic.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.8);

            osc.connect(gain);
            oscHarmonic.connect(gainHarmonic);
            gain.connect(this.ctx.destination);
            gainHarmonic.connect(this.ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 1.3);
            oscHarmonic.start(startTime);
            oscHarmonic.stop(startTime + 0.9);
        });
    }

    // 4. Tiếng tương tác đồ vật (Object Interaction Beep)
    playInteract() {
        if (this.isMuted) return;
        this.init();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.15 * this.masterVolume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    // 5. Tiếng lật trang sách / chuyển slide (Page Flip)
    playSlideChange() {
        if (this.isMuted) return;
        this.init();

        const bufferSize = this.ctx.sampleRate * 0.1;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000, this.ctx.currentTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.12 * this.masterVolume, this.ctx.currentTime);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start();
    }

    // 6. Nhạc nền Lofi học tập êm dịu (Procedural Lofi Ambient Chords)
    toggleBgm() {
        this.init();
        this.isBgmPlaying = !this.isBgmPlaying;

        if (this.isBgmPlaying) {
            this.startLofiBgm();
        } else {
            this.stopLofiBgm();
        }
        return this.isBgmPlaying;
    }

    startLofiBgm() {
        // Hợp âm Lofi ấm áp: Cmaj7 - Am7 - Dm7 - G7
        const chords = [
            [261.63, 329.63, 392.00, 493.88], // Cmaj7
            [220.00, 261.63, 329.63, 392.00], // Am7
            [293.66, 349.23, 440.00, 523.25], // Dm7
            [196.00, 246.94, 293.66, 349.23]  // G7
        ];

        let chordIdx = 0;

        const playChord = () => {
            if (!this.isBgmPlaying || this.isMuted) return;
            const chord = chords[chordIdx];
            chordIdx = (chordIdx + 1) % chords.length;

            chord.forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.05);

                const startTime = this.ctx.currentTime + i * 0.05;
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.04 * this.masterVolume, startTime + 0.8);
                gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 3.8);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(startTime);
                osc.stop(startTime + 3.9);
            });

            this.bgmTimer = setTimeout(playChord, 3800);
        };

        playChord();
    }

    stopLofiBgm() {
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted && this.isBgmPlaying) {
            this.stopLofiBgm();
            this.isBgmPlaying = false;
        }
        return this.isMuted;
    }
}

window.soundEngine = new SoundEngine();
