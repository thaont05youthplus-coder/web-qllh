// server.js - Máy chủ HTTP Node.js gọn nhẹ phục vụ Website Lớp Học Ảo 3D
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 8080;
const BASE_DIR = __dirname;
const TTS_CACHE_DIR = path.join(BASE_DIR, 'assets', 'audio', 'tts');

const VOICE_PROFILES = {
    teacher_female: 'EXAVITQu4vr4xnSDxMaL',
    teacher_male: 'pNInz6obpgDQGcFmaJgB',
    student_female_1: 'cgSgspJ2msm6clMCkdW9',
    student_female_2: 'FGY2WhTYpPnrIDTdsKH5',
    student_male_1: 'TX3LPaxmHKxFdv7VOQHJ',
    student_male_2: 'bIHbv24MWmeRgasZH58o'
};

function getElevenLabsKey() {
    if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY.trim();
    const keyPath = path.join(BASE_DIR, '.elevenlabs.key');
    try {
        if (fs.existsSync(keyPath)) {
            return fs.readFileSync(keyPath, 'utf8').trim();
        }
    } catch (_) {}
    return '';
}

function readJsonBody(req) {
    return new Promise((resolve, reject) => {
        let raw = '';
        req.on('data', chunk => {
            raw += chunk;
            if (raw.length > 32 * 1024) {
                reject(new Error('Payload too large'));
            }
        });
        req.on('end', () => {
            try {
                resolve(raw ? JSON.parse(raw) : {});
            } catch (e) {
                reject(e);
            }
        });
        req.on('error', reject);
    });
}

async function handleTtsApi(req, res) {
    try {
        const body = await readJsonBody(req);
        const text = String(body.text || '').trim();
        const profile = VOICE_PROFILES[body.profile] ? body.profile : 'teacher_female';
        if (!text || text.length > 1000) {
            res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: 'Invalid text length' }));
            return;
        }

        const hash = crypto.createHash('sha1').update(`${profile}|${text}`).digest('hex').slice(0, 16);
        const cacheFile = path.join(TTS_CACHE_DIR, `${hash}.mp3`);
        if (fs.existsSync(cacheFile) && fs.statSync(cacheFile).size > 500) {
            res.writeHead(200, { 'Content-Type': 'audio/mpeg' });
            fs.createReadStream(cacheFile).pipe(res);
            return;
        }

        const apiKey = getElevenLabsKey();
        if (!apiKey) {
            res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: 'ElevenLabs key not configured on server' }));
            return;
        }

        const voiceId = VOICE_PROFILES[profile];
        const hasVi = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text);
        const payload = {
            text,
            model_id: 'eleven_flash_v2_5',
            voice_settings: {
                stability: 0.55,
                similarity_boost: 0.78,
                style: 0.15,
                use_speaker_boost: true
            }
        };
        if (hasVi) payload.language_code = 'vi';

        const upstream = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
            method: 'POST',
            headers: {
                'xi-api-key': apiKey,
                'Content-Type': 'application/json',
                'Accept': 'audio/mpeg'
            },
            body: JSON.stringify(payload)
        });

        if (!upstream.ok) {
            const errMsg = await upstream.text();
            res.writeHead(upstream.status, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: errMsg }));
            return;
        }

        const buf = Buffer.from(await upstream.arrayBuffer());
        fs.mkdirSync(TTS_CACHE_DIR, { recursive: true });
        fs.writeFileSync(cacheFile, buf);
        res.writeHead(200, { 'Content-Type': 'audio/mpeg' });
        res.end(buf);
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: String(err.message || err) }));
    }
}

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg'
};

const server = http.createServer((req, res) => {
    // Chống cache triệt để để trình duyệt luôn tải mã nguồn mới nhất 100%
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    if (req.method === 'POST' && req.url.split('?')[0] === '/api/tts') {
        handleTtsApi(req, res);
        return;
    }

    let reqUrl = req.url.split('?')[0];
    if (reqUrl === '/') reqUrl = '/index.html';

    // Chặn truy cập trực tiếp tệp cấu hình ẩn hoặc mã nguồn server
    if (reqUrl.split('/').some(seg => seg.startsWith('.')) || reqUrl === '/server.js') {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('403 Forbidden');
        return;
    }

    const safePath = path.normalize(reqUrl).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(BASE_DIR, safePath);

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('404 Không tìm thấy tài nguyên: ' + reqUrl);
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': contentType });
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    });
});

function startServer(port) {
    server.listen(port, '0.0.0.0', () => {
        console.log(`====================================================`);
        console.log(`🎓 MÁY CHỦ WEBSITE LỚP HỌC ẢO 3D GAME ĐÃ SẴN SÀNG!`);
        console.log(`🌐 Truy cập ngay tại: http://localhost:${port}`);
        console.log(`✨ Cấu hình đồ họa: Ultra HD / Retina 2.0x sắc nét`);
        console.log(`🔒 Không xung đột cổng 3000 (đã để dành cho vn34mg)`);
        console.log(`====================================================`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`⚠️ Cổng ${port} đang bận, tự động chuyển sang cổng ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error('Lỗi máy chủ:', err);
        }
    });
}

startServer(PORT);
