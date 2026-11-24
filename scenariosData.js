// scenariosData.js - Dữ liệu chuẩn Kịch bản Mô phỏng Sư phạm ULIS TeachLab (BẢN 2)
// Căn cứ nhận xét: 6 nhóm văn bản pháp lý & Ba nguyên tắc xử lý (P1, P2, P3)
// Nhận xét KHÔNG CHẤM ĐIỂM theo Mockup Bản 2

(function () {
    'use strict';

    // ================= 1. CĂN CỨ NHẬN XÉT (6 NHÓM VĂN BẢN PHÁP LÝ - TRANG 1) =================
    const LEGAL_BASIS_DOCS = {
        nq29: {
            id: 'nq29',
            code: 'NQ 29-NQ/TW (2013)',
            title: 'Nghị quyết số 29-NQ/TW ngày 04/11/2013',
            name: 'Đổi mới căn bản, toàn diện giáo dục và đào tạo',
            summary: 'Định hướng phát triển phẩm chất, năng lực người học; nhà trường kết hợp chặt chẽ với gia đình và xã hội; đổi mới phương pháp dạy học và đánh giá.'
        },
        luat_nhagiao: {
            id: 'luat_nhagiao',
            code: 'Luật Nhà giáo 73/2025/QH15',
            title: 'Luật Nhà giáo số 73/2025/QH15 (hiệu lực từ 01/01/2026)',
            name: 'Luật Nhà giáo năm 2025',
            articles: {
                d8: 'Điều 8: Quyền của nhà giáo trong hoạt động nghề nghiệp (khoản 2 điểm a: được tôn trọng nhân cách, bảo vệ uy tín danh dự).',
                d9: 'Điều 9: Nghĩa vụ của nhà giáo (khoản 2 điểm a: bảo đảm chất lượng dạy học; điểm b: giữ gìn phẩm chất đạo đức, uy tín; điểm c: phát triển năng lực người học; điểm d: tôn trọng nhân cách, đối xử công bằng; điểm e: bảo vệ an toàn tinh thần, thể chất người học).',
                d11: 'Điều 11: Những việc nhà giáo không được làm (khoản 2 điểm b: xúc phạm danh dự, nhân phẩm, thân thể người học; điểm d: phân biệt đối xử, trù dập).',
                d13: 'Điều 13: Đào tạo, bồi dưỡng và tự đánh giá (khoản 4: quyền và nghĩa vụ tự đánh giá theo chuẩn nghề nghiệp nhà giáo).'
            }
        },
        tt30: {
            id: 'tt30',
            code: 'Thông tư 30/2026/TT-BGDĐT',
            title: 'Thông tư số 30/2026/TT-BGDĐT',
            name: 'Chuẩn nghề nghiệp giáo viên cơ sở giáo dục phổ thông',
            articles: {
                d4: 'Điều 4: Phẩm chất nghề nghiệp (quy tắc ứng xử chuẩn mực, yêu thương, bao dung, không định kiến).',
                d6: 'Điều 6: Đạo đức nhà giáo (mẫu mực, làm gương, công bằng, tôn trọng nhân cách học sinh).',
                d12: 'Điều 12: Phát triển chuyên môn và xây dựng môi trường giáo dục an toàn, dân chủ, chống bạo lực học đường (khoản 1 điểm đ: hỗ trợ đối tượng cá biệt; điểm e: tổ chức dạy học phân hóa; điểm g: phối hợp cha mẹ học sinh).'
            }
        },
        cv5512: {
            id: 'cv5512',
            code: 'Công văn 5512/BGDĐT-GDTrH',
            title: 'Công văn số 5512/BGDĐT-GDTrH',
            name: 'Xây dựng và tổ chức thực hiện kế hoạch giáo dục của nhà trường',
            summary: 'Kế hoạch bài dạy gồm 4 hoạt động: 1. Mở đầu/Khởi động -> 2. Hình thành kiến thức mới -> 3. Luyện tập -> 4. Vận dụng. Mỗi hoạt động gồm 4 bước: Giao nhiệm vụ -> Thực hiện -> Báo cáo, thảo luận -> Kết luận, nhận định.'
        },
        tt22: {
            id: 'tt22',
            code: 'Thông tư 22/2021/TT-BGDĐT',
            title: 'Thông tư số 22/2021/TT-BGDĐT (sửa đổi bởi TT 89/2026)',
            name: 'Quy định về đánh giá học sinh trung học cơ sở và trung học phổ thông',
            articles: {
                d4: 'Điều 4: Yêu cầu đánh giá (khoản 2: vì sự tiến bộ của người học; coi trọng động viên, khích lệ; không dùng điểm số để phạt hành vi; khoản 4: công bằng, khách quan, trung thực).'
            }
        },
        khung_ai: {
            id: 'khung_ai',
            code: 'TT 02/2025 · TT 18/2026 · QĐ 2422/2026',
            title: 'Khung năng lực số & Khung nội dung giáo dục Trí tuệ nhân tạo (AI)',
            name: 'Quy định sử dụng công nghệ và Trí tuệ nhân tạo có trách nhiệm',
            summary: 'Khung năng lực số người học và giáo viên. Quy định liêm chính học thuật: Được sử dụng AI làm công cụ tra cứu, gợi ý ý tưởng nhưng người học phải tự viết câu trả lời và ghi rõ nguồn gốc / bước sử dụng AI.'
        },
        tt18_tuvan: {
            id: 'tt18_tuvan',
            code: 'Thông tư 18/2025/TT-BGDĐT',
            title: 'Thông tư số 18/2025/TT-BGDĐT',
            name: 'Hướng dẫn công tác tư vấn tâm lý học sinh và công tác xã hội trong trường học',
            summary: 'Quy trình tiếp nhận, sàng lọc, lập phiếu chuyển tư vấn học đường và bảo mật thông tin khi học sinh có dấu hiệu bị cô lập, khủng hoảng tâm lý kéo dài.'
        }
    };

    // ================= 2. BA NGUYÊN TẮC XỬ LÝ CHUNG (P1, P2, P3 - TRANG 1) =================
    const THREE_PRINCIPLES = {
        P1: {
            id: 'P1',
            code: 'P1',
            name: 'Trung hòa mâu thuẫn',
            icon: '⚖️',
            badgeBg: '#eff6ff',
            badgeColor: '#1d4ed8',
            borderColor: '#93c5fd',
            desc: 'Lắng nghe đủ các bên, tìm điểm chung, không phân xử vội.',
            actionTip: 'Nói nhỏ tại bàn, nghe riêng từng em, không quy kết gian lận khi chưa đủ minh chứng.'
        },
        P2: {
            id: 'P2',
            code: 'P2',
            name: 'Giảm thiểu thiệt hại',
            icon: '↓',
            badgeBg: '#fef2f2',
            badgeColor: '#b91c1c',
            borderColor: '#fca5a5',
            desc: 'Giải tỏa ngay: chuyện lớn thành nhỏ, chuyện nhỏ thành không; không để lan rộng.',
            actionTip: 'Ra hiệu dừng, giao nhiệm vụ cho em hùa theo, tạm dừng hoạt động chung để kéo sự chú ý về bài học.'
        },
        P3: {
            id: 'P3',
            code: 'P3',
            name: 'Nhà trường – Gia đình – Xã hội',
            icon: '🏫',
            badgeBg: '#ecfdf5',
            badgeColor: '#047857',
            borderColor: '#6ee7b7',
            desc: 'Phối hợp đúng kênh với gia đình, tổ tư vấn, Đoàn – Đội khi vượt quá phạm vi lớp học.',
            actionTip: 'Nhắn riêng phụ huynh, xác nhận ngắn kín đáo trong nhóm chung, kết nối tổ tư vấn học đường.'
        }
    };

    // ================= 3. HAI NHÓM TÌNH HUỐNG (TRANG 1 & 2) =================
    const SCENARIO_CATEGORIES = {
        teaching: {
            id: 'teaching',
            name: 'Nhóm 1 · Tình huống giảng dạy',
            desc: 'Công tác giảng dạy chuyên môn, đi theo chu trình một giờ học (CV 5512)',
            badgeText: 'Giảng dạy',
            accentColor: '#b91c1c',
            activities: [
                { id: 'act_warmup', stepNum: 1, name: 'HOẠT ĐỘNG 1', label: 'Khởi động', desc: 'Lớp chưa vào bài, học sinh mất tập trung, câu hỏi mở đầu không ai trả lời', scenarioId: 'sc_huy_khoidong' },
                { id: 'act_knowledge', stepNum: 2, name: 'HOẠT ĐỘNG 2', label: 'Hình thành kiến thức', desc: 'Học sinh hiểu sai, hỏi khó, tranh luận trái chiều', scenarioId: 'sc_hieusai' },
                { id: 'act_practice', stepNum: 3, name: 'HOẠT ĐỘNG 3', label: 'Luyện tập', desc: 'Chép bài, dùng AI làm hộ, nhóm làm việc không đều', scenarioId: 'sc_ai_luyentap', isDefault: true, selected: true },
                { id: 'act_apply', stepNum: 4, name: 'HOẠT ĐỘNG 4', label: 'Vận dụng thực tế', desc: 'Ý tưởng bị chê, sản phẩm thất bại, liên hệ nhạy cảm', scenarioId: 'sc_vandung' }
            ]
        },
        homeroom: {
            id: 'homeroom',
            name: 'Nhóm 2 · Tình huống chủ nhiệm lớp',
            desc: 'Công tác giáo viên chủ nhiệm, tổ chức lớp học',
            badgeText: 'Chủ nhiệm',
            accentColor: '#1d4ed8',
            activities: [
                { id: 'ctx_meeting', stepNum: 1, name: 'BỐI CẢNH 1', label: 'Sinh hoạt lớp', desc: 'Bầu cán bộ lớp, phê bình, nề nếp', scenarioId: 'sc_gianhang_khoa', isDefault: true, selected: true },
                { id: 'ctx_union', stepNum: 2, name: 'BỐI CẢNH 2', label: 'Đoàn – Đội', desc: 'Phong trào thi đua, kế hoạch chi đội', scenarioId: 'sc_doandoi' },
                { id: 'ctx_exp', stepNum: 3, name: 'BỐI CẢNH 3', label: 'Hoạt động trải nghiệm', desc: 'Phân công nhóm, gây quỹ, sản phẩm', scenarioId: 'sc_gianhang_khoa' },
                { id: 'ctx_extra', stepNum: 4, name: 'BỐI CẢNH 4', label: 'Ngoại khóa', desc: 'Dã ngoại, câu lạc bộ, an toàn', scenarioId: 'sc_ngoaikhoa' }
            ]
        }
    };

    // ================= 4. CÁC TÌNH HUỐNG MÔ PHỎNG CHI TIẾT (BẢN 2) =================
    const SCENARIOS_5 = [
        // ---------- KỊCH BẢN 1: BÀI LÀM NHỜ AI (TRỌNG TÂM GIẢNG DẠY - TRANG 2-9) ----------
        {
            id: 1,
            aliasId: 'sc_ai_luyentap',
            category: 'teaching',
            activityId: 'act_practice',
            activityLabel: 'Hoạt động 3: Luyện tập',
            title: 'Tình huống giảng dạy · “Bài làm nhờ AI”',
            shortTitle: 'Bài làm nhờ AI',
            grade: 'Lớp 7A',
            gradeGroup: 'thcs',
            subject: 'Khoa học tự nhiên (KHTN)',
            topic: 'Bài: Trao đổi nước và chất dinh dưỡng ở thực vật',
            duration: '15 phút',
            durationSec: 900,
            primaryPrinciples: ['P1', 'P2'],
            lessonPlanCV5512: {
                title: 'KẾ HOẠCH BÀI DẠY (CV 5512)',
                currentStep: 3,
                steps: [
                    { num: 1, name: 'Mở đầu' },
                    { num: 2, name: 'Hình thành kiến thức' },
                    { num: 3, name: 'Luyện tập · đang ở đây', desc: 'Học sinh làm Phiếu số 3 theo cặp trong 10 phút, sau đó báo cáo và thảo luận.' },
                    { num: 4, name: 'Vận dụng' }
                ]
            },
            yourTask: 'Theo dõi các cặp làm Phiếu số 3. Nếu có vấn đề phát sinh, xử lý sao cho hoạt động Luyện tập tiếp tục và mọi học sinh vẫn được học.',
            classAIRule: 'Được dùng AI để tra cứu, nhưng phải tự viết câu trả lời và ghi rõ đã dùng AI ở bước nào.',
            applicableLegalDocs: [
                'NQ 29-NQ/TW · Quan điểm chỉ đạo',
                'Luật Nhà giáo 2025 · Điều 9, 11',
                'TT 30/2026 · Điều 4, 6, 12',
                'CV 5512 · Phụ lục IV, Hoạt động 3',
                'TT 22/2021 · Điều 4',
                'TT 02/2025 · QĐ 2422/2026'
            ],
            students: [
                {
                    id: 'lan',
                    name: 'Lan',
                    role: 'Tổ trưởng',
                    avatar: '👧',
                    color: '#f472b6',
                    gender: 'female',
                    deskIndex: { row: 0, col: 1, seat: 0 },
                    hiddenProfile: 'Chăm chỉ, tự làm cả 4 câu trong phiếu, thấy bất công khi Nam dùng AI nên bức xúc tố cáo trước lớp.',
                    initialPosture: 'standing_complaint',
                    initialStatus: 'bất bình',
                    initialLine: 'Cô ơi! Nam chép hết trên AI, em phải làm một mình!'
                },
                {
                    id: 'nam',
                    name: 'Nam',
                    role: 'Bạn cùng bàn',
                    avatar: '👦',
                    color: '#3b82f6',
                    gender: 'male',
                    deskIndex: { row: 0, col: 1, seat: 1 },
                    hasTablet: true,
                    hiddenProfile: 'Đỏ mặt, chống chế; thực tế dùng AI tra cứu câu 2 và 3 nhưng chưa ghi chú nguồn, xấu hổ vì bị bạn bêu xấu trước lớp.',
                    initialPosture: 'blushing_defense',
                    initialStatus: 'đỏ mặt, chống chế',
                    initialLine: 'Em có làm mà! Em chỉ hỏi AI thôi, sao bạn lại mách?'
                },
                {
                    id: 'huy',
                    name: 'Huy',
                    role: 'Học sinh bàn bên',
                    avatar: '👦',
                    color: '#22c55e',
                    gender: 'male',
                    deskIndex: { row: 0, col: 2, seat: 0 },
                    hiddenProfile: 'Hiếu động, thích gây chú ý, hùa theo để chọc bạn khiến chuyện nhỏ dễ lan thành chuyện lớn.',
                    initialPosture: 'laughing_loud',
                    initialStatus: 'cười to, hùa theo',
                    initialLine: 'Ê cả lớp ơi, Nam chép AI kìa!'
                }
            ],
            openingTeacherLine: 'Các cặp bắt đầu làm Phiếu số 3 nhé, 10 phút.',
            followupStudentLine: 'Phiếu này em không ghi tên bạn ấy đâu!',
            observationPrompt: {
                question: 'Chuyện gì đang xảy ra, và ai đang bị ảnh hưởng?',
                description: 'Lan và Nam mâu thuẫn về việc dùng AI, Lan tố cáo trước lớp, Huy hùa theo. Nam có thể bị xấu hổ, Lan thấy bất công, cả lớp đang bị cuốn vào.',
                hints: [
                    'Gợi ý 1/2: Trước khi xác định ai đúng ai sai, hãy nghĩ cách để cả lớp không tiếp tục chú ý vào Nam.',
                    'Gợi ý 2/2: Quy định về AI của lớp cho phép tra cứu nhưng phải tự viết; hãy kiểm tra cách Nam đã dùng trước khi kết luận.'
                ]
            },
            branches: {
                A: {
                    id: 'branch_a',
                    type: 'appropriate',
                    label: 'Nhánh A · Xử lý phù hợp (Giải tỏa trước, trung hòa sau)',
                    badge: 'Phù hợp',
                    tensionProgression: ['Lớn', 'Nhỏ', 'Đã lắng'],
                    actions: [
                        { time: '08:53', type: 'action', title: 'Ra hiệu dừng với Huy · Giao nhiệm vụ', text: 'Huy, em chuẩn bị báo cáo câu 1 cho cả lớp giúp cô nhé.', principle: 'P2', citation: 'TT 30 · Đ12 k1 điểm e' },
                        { time: '08:54', type: 'speech', title: 'Nói với cả lớp', text: 'Cả lớp tiếp tục làm phiếu. Chuyện của cặp nào, cô sẽ trao đổi riêng với cặp đó.', principle: 'P2', citation: 'CV 5512 · HĐ 3' },
                        { time: '08:55', type: 'action', title: 'Đi lại gần bàn Lan – Nam · Nói nhỏ', text: 'Cô nghe Lan trước, rồi nghe Nam. Lan đã làm những câu nào?', principle: 'P1', citation: 'Luật NG · Đ9 k2 điểm d' },
                        { time: '08:56', type: 'student', speaker: 'Lan', text: 'Em làm cả 4 câu, Nam chỉ chép câu 2, 3 thôi ạ.' },
                        { time: '08:57', type: 'speech', title: 'Hỏi Nam nhẹ nhàng', text: 'Nam, em kể cô nghe em dùng AI thế nào?', principle: 'P1', citation: 'Luật NG · Đ9 k2 điểm d, e' },
                        { time: '08:57', type: 'student', speaker: 'Nam', text: 'Câu 2 và 3 em hỏi AI, em ghi chú lại ạ.' },
                        { time: '08:58', type: 'speech', title: 'Kết luận hướng dẫn tại bàn', text: 'Cảm ơn em đã nói thật. Em tự viết lại câu 2, 3 bằng lời của mình, phần nào lấy từ AI thì ghi chú nhé. Lan, cô ghi nhận em đã tự làm cả phiếu.', principle: 'P1', citation: 'TT 02/2025' }
                    ],
                    outcome: 'Báo cáo – thảo luận diễn ra đúng giờ. Mâu thuẫn đã lắng. Nam tự viết lại câu 2, 3; Lan vui vẻ ghi tên bạn.',
                    citations: ['P2', 'P1', 'Luật NG · Đ9 k2 điểm d, e', 'TT 30 · Đ12 k1 điểm đ, e', 'TT 22 · Đ4 k4', 'CV 5512 · HĐ 3', 'TT 02/2025']
                },
                B: {
                    id: 'branch_b',
                    type: 'inappropriate',
                    label: 'Nhánh B · Xử lý chưa phù hợp (Quy kết công khai, phạt điểm)',
                    badge: 'Chưa phù hợp',
                    tensionProgression: ['Lớn', 'Lớn'],
                    actions: [
                        { time: '08:53', type: 'speech', title: 'Phân xử công khai trước lớp', text: 'Nam! Cả lớp nhìn đây: chép AI là gian lận. Bài này 0 điểm, cuối giờ cô gọi phụ huynh em.', principle: 'Chưa phù hợp', citation: 'TT 22 · Đ4 k2; Luật NG · Đ11 k2 điểm b' },
                        { time: '08:54', type: 'student', speaker: 'Nam', text: 'Em không chép! Cô không tin em!' },
                        { time: '08:54', type: 'student', speaker: 'Huy', text: 'Ồ ồ ồ…' }
                    ],
                    instantWarning: 'Lưu ý (chế độ Luyện tập): Kết luận “gian lận” trước lớp khi chưa nghe hai phía làm mâu thuẫn lớn thêm. Điểm số phản ánh kết quả học tập, không dùng để phạt hành vi; gọi phụ huynh để răn đe khác với phối hợp cùng gia đình.',
                    outcome: 'Nam cãi lại, Lan bối rối, Huy càng hùa. Lớp mất 6 phút tranh cãi, không kịp báo cáo thảo luận.',
                    citations: ['P2 vi phạm', 'P1 vi phạm', 'TT 22 · Đ4 k2', 'Luật NG · Đ9 k2 điểm d; Đ11 k2 điểm b', 'QĐ 2422 · Phần VI']
                },
                C: {
                    id: 'branch_c',
                    type: 'caution',
                    label: 'Nhánh C · Cần lưu ý (Bỏ mặc học sinh tự giải quyết)',
                    badge: 'Cần lưu ý',
                    tensionProgression: ['Lớn', 'Nhỏ'],
                    actions: [
                        { time: '08:53', type: 'speech', title: 'Bỏ qua mâu thuẫn', text: 'Thôi, hai em tự giải quyết, làm tiếp đi.', principle: 'Cần lưu ý', citation: 'TT 30 · Đ12 k1 đ' }
                    ],
                    outcome: 'Lớp tạm yên nhưng Lan và Nam không nói chuyện với nhau; Nam không ghi chú AI; mâu thuẫn chuyển thành ngầm.',
                    citations: ['P1', 'Đ12 k1 đ', 'TT 02/2025']
                }
            }
        },

        // ---------- KỊCH BẢN 2: GIAN HÀNG KHÔNG CÓ KHOA (TRỌNG TÂM CHỦ NHIỆM - TRANG 10-13) ----------
        {
            id: 2,
            aliasId: 'sc_gianhang_khoa',
            category: 'homeroom',
            activityId: 'ctx_meeting',
            activityLabel: 'Sinh hoạt lớp · Hoạt động trải nghiệm',
            title: 'Tình huống chủ nhiệm · “Gian hàng không có Khoa”',
            shortTitle: 'Gian hàng không có Khoa',
            grade: 'Lớp 8B',
            gradeGroup: 'thcs',
            topic: 'Sinh hoạt lớp: Chuẩn bị gian hàng Hội chợ Xuân gây quỹ',
            duration: '20 phút',
            durationSec: 1200,
            primaryPrinciples: ['P3', 'P1', 'P2'],
            homeroomProgress: {
                title: 'TIẾN TRÌNH TIẾT SINH HOẠT',
                currentStep: 2,
                steps: [
                    { num: 1, name: 'Sơ kết tuần (Minh – lớp trưởng)' },
                    { num: 2, name: 'Phân công gian hàng · đang ở đây', desc: 'Ban cán sự tự điều hành; giáo viên chủ nhiệm theo dõi và hỗ trợ.' },
                    { num: 3, name: 'Thảo luận ý tưởng gian hàng' },
                    { num: 4, name: 'Giáo viên kết luận' }
                ]
            },
            yourTask: 'Hỗ trợ ban cán sự hoàn tất phân công, bảo đảm mỗi bạn đều có ít nhất một việc và không ai bị bỏ lại.',
            coordinationChannels: [
                { id: 'parents', name: 'Cha mẹ học sinh', desc: 'Nhắn riêng · gọi điện · hẹn gặp' },
                { id: 'counselor', name: 'Tổ tư vấn học đường', desc: 'Phiếu chuyển tư vấn' },
                { id: 'team8b', name: 'Chi đội 8B', desc: 'Giao chi đội cùng tổ chức' }
            ],
            applicableLegalDocs: [
                'NQ 29-NQ/TW · Quan điểm chỉ đạo',
                'Luật Nhà giáo 2025 · Điều 9',
                'TT 30/2026 · Đ4 k1 d; Đ12 k1 e, g',
                'TT 18/2025 · Tư vấn học đường'
            ],
            parentGroupNotification: {
                groupName: 'Nhóm Phụ huynh lớp 8B · 41 thành viên',
                timeAgo: 'vừa xong',
                sender: 'Mẹ Khoa',
                text: 'Cô ơi, con tôi về kể bị các bạn gạt ra mấy tuần nay rồi. Lớp mình có chuyện gì vậy cô? Mong cô trả lời.'
            },
            students: [
                {
                    id: 'minh',
                    name: 'Minh',
                    role: 'Lớp trưởng',
                    avatar: '👦',
                    color: '#3b82f6',
                    gender: 'male',
                    deskIndex: { row: 0, col: 0, seat: 0 },
                    hiddenProfile: 'Chịu áp lực "gian hàng phải đứng nhất", lo bạn chậm làm hỏng việc chung nên muốn làm cho nhanh, không ác ý.',
                    initialPosture: 'speaking_standing',
                    initialStatus: 'điều hành vội vàng',
                    initialLine: 'Khoa thì làm được gì, để bọn tớ lo cho nhanh.'
                },
                {
                    id: 'thao',
                    name: 'Thảo',
                    role: 'Bạn trong lớp',
                    avatar: '👧',
                    color: '#ec4899',
                    gender: 'female',
                    deskIndex: { row: 0, col: 1, seat: 0 },
                    hiddenProfile: 'Biết Khoa vẽ rất đẹp, thấy bất công khi bạn bị gạt nên thẳng thắn lên tiếng bênh vực.',
                    initialPosture: 'attentive',
                    initialStatus: 'bênh bạn',
                    initialLine: 'Sao cậu nói thế, Khoa vẽ đẹp mà!'
                },
                {
                    id: 'khoa',
                    name: 'Khoa',
                    role: 'Học sinh mới chuyển trường',
                    avatar: '👦',
                    color: '#64748b',
                    gender: 'male',
                    deskIndex: { row: 0, col: 2, seat: 0 },
                    backDeskIndex: { row: 2, col: 0, seat: 0 },
                    hiddenProfile: 'Chuyển trường giữa năm, ít bạn, vẽ đẹp nhưng tự ti; bị gạt nên đứng dậy lủi thủi ra bàn cuối.',
                    initialPosture: 'withdrawn_corner',
                    initialStatus: 'bỏ ra bàn cuối',
                    initialLine: 'Dạ... cô ơi, em thích vẽ biển hiệu cho gian hàng ạ.'
                }
            ],
            incidentDialogue: [
                { time: '12:05', speaker: 'Minh', text: 'Gian hàng đồ uống: tớ, Thảo, Hùng. Trang trí: Vy, Long…' },
                { time: '12:20', speaker: 'Thảo', text: 'Còn Khoa thì sao?' },
                { time: '12:22', speaker: 'Minh', text: 'Khoa thì làm được gì, để bọn tớ lo cho nhanh.' },
                { time: '12:24', speaker: 'Thảo', text: 'Sao cậu nói thế, Khoa vẽ đẹp mà!' },
                { time: '12:30', speaker: 'Hành động', text: 'Khoa đứng dậy, ra ngồi bàn cuối.' }
            ],
            connectionPanelOptions: {
                parents: {
                    inGroupText: '“Cô đã nhận được tin và sẽ trao đổi riêng với gia đình ạ.” (một câu ngắn, không nêu tên học sinh)',
                    privateMsgDraft: 'Chào chị, em là cô Hà, GVCN lớp 8B. Cảm ơn chị đã báo cho em. Em đang trực tiếp nói chuyện với các con ở lớp. Tối nay khoảng 20h em gọi điện cho chị để nghe thêm về Khoa và cùng bàn cách giúp con, chị thấy có tiện không ạ?',
                    nextTip: 'Gợi ý kênh tiếp theo: nếu Khoa có dấu hiệu bị cô lập kéo dài, lập phiếu chuyển tư vấn học đường cho em.'
                }
            },
            branches: {
                A: {
                    id: 'branch_a',
                    type: 'appropriate',
                    label: 'Nhánh A · Xử lý phù hợp (Phối hợp 3 bên, giải tỏa trước)',
                    badge: 'Phù hợp',
                    tensionProgression: ['Lớn', 'Lớn hơn', 'Đang giảm', 'Nhỏ', 'Đã lắng'],
                    actions: [
                        { time: '12:30', type: 'action', title: 'Tạm dừng phân công + Lời nói cả lớp', text: 'Cả lớp dừng phân công một chút, mình cùng đặt tiêu chí trước nhé: mỗi bạn một việc, theo điểm mạnh.', principle: 'P2', citation: 'TT 30 · Đ12 k1 điểm e; NQ 29' },
                        { time: '12:33', type: 'connection', title: 'Bảng kết nối · Nhắn riêng phụ huynh', text: 'Cảm ơn chị đã báo cho em… Tối nay khoảng 20h em gọi điện cho chị để nghe thêm về Khoa.', principle: 'P3', citation: 'TT 30 · Đ12 k1 điểm g; NQ 29' },
                        { time: '12:38', type: 'action', title: 'Đi lại gần + Nói riêng với Khoa', text: 'Cô muốn nghe em kể, em thích làm phần nào của gian hàng?', principle: 'P1', citation: 'TT 30 · Đ12 k1 điểm đ; Luật NG · Đ9 k2 điểm e' },
                        { time: '12:40', type: 'student', speaker: 'Khoa', text: 'Dạ... cô ơi, em thích vẽ biển hiệu cho gian hàng ạ.' },
                        { time: '12:42', type: 'action', title: 'Nói riêng với Minh', text: 'Minh, cô biết em muốn gian hàng thật tốt. Mình cùng tìm cách để bạn nào cũng góp sức nhé.', principle: 'P1', citation: 'Luật NG · Đ9 k2 điểm d' },
                        { time: '12:44', type: 'student', speaker: 'Minh', text: 'Dạ vâng, để tớ phân công lại cho Khoa vẽ biển hiệu nhé.' }
                    ],
                    outcome: 'Mọi bạn đều có việc. Mức căng thẳng: đã lắng. Lịch trao đổi với gia đình lúc 20h được ghi nhận.',
                    citations: ['P2', 'P1', 'P3', 'Đ12 k1 e, g', 'NQ 29', 'TT 18/2025']
                },
                B: {
                    id: 'branch_b',
                    type: 'inappropriate',
                    label: 'Nhánh B · Xử lý chưa phù hợp (Phê bình lớp trưởng trước lớp, cãi nhau trên nhóm)',
                    badge: 'Chưa phù hợp',
                    tensionProgression: ['Lớn', 'Lớn'],
                    actions: [
                        { time: '12:26', type: 'speech', title: 'Lời nói với cả lớp', text: 'Minh, lớp trưởng mà xử sự thế à? Đứng lên xin lỗi Khoa ngay!', principle: 'Chưa phù hợp', citation: 'Luật NG · Đ9 k2 điểm d; TT 30 · Đ6 k4' },
                        { time: '12:28', type: 'connection', title: 'Nhắn trên nhóm chung phụ huynh', text: 'Chuyện trẻ con thôi, chị đừng làm to.', principle: 'Chưa phù hợp', citation: 'TT 30 · Đ12 k1 điểm g' }
                    ],
                    outcome: 'Minh xấu hổ, cãi lại; nhóm phụ huynh nổ ra tranh luận; Khoa càng thêm ngại ngùng, co cụm.',
                    citations: ['P2 vi phạm', 'P3 vi phạm', 'Đ9 k2 d', 'Đ6 k4', 'Đ12 k1 g']
                },
                C: {
                    id: 'branch_c',
                    type: 'caution',
                    label: 'Nhánh C · Cần lưu ý (Tự giao việc qua loa, không kết nối phụ huynh)',
                    badge: 'Cần lưu ý',
                    tensionProgression: ['Lớn', 'Nhỏ'],
                    actions: [
                        { time: '12:30', type: 'speech', title: 'Tự áp đặt phân công', text: 'Thôi để cô giao Khoa làm trang trí, không cần bàn nữa.', principle: 'Cần lưu ý', citation: 'TT 30 · Đ4 k1 điểm d' }
                    ],
                    outcome: 'Đạt nhiệm vụ trên giấy nhưng nguyên nhân chưa giải quyết; Khoa vẫn ngồi riêng; mẹ Khoa nhắn tin lần hai.',
                    citations: ['P1', 'P3', 'Đ4 k1 d', 'TT 18/2025']
                }
            }
        },

        // ---------- KỊCH BẢN PHỤ TRỢ 3: ĐIỆN THOẠI DƯỚI GẦM BÀN (THPT) ----------
        {
            id: 3,
            aliasId: 'sc_dienthoai_gam_ban',
            category: 'teaching',
            activityId: 'act_knowledge',
            activityLabel: 'Hoạt động 2: Hình thành kiến thức',
            title: 'Tình huống 3 – “Điện thoại dưới gầm bàn”',
            shortTitle: '3. Điện thoại dưới gầm bàn',
            grade: 'Lớp 10A',
            gradeGroup: 'thpt',
            topic: 'Luyện nghe hiểu và ghi chép ý chính',
            duration: '6 phút',
            durationSec: 360,
            primaryPrinciples: ['P2', 'P1'],
            yourTask: 'Điều phối lớp làm bài nghe, giữ tập trung và duy trì nội quy không dùng điện thoại.',
            students: [
                { id: 'khoa', name: 'Khoa', avatar: '📱', color: '#ef4444', gender: 'male', deskIndex: { row: 0, col: 0, seat: 0 }, initialLine: 'Tranh thủ bấm nốt ván game dưới gầm bàn tí thôi...' },
                { id: 'duc', name: 'Đức', avatar: '🎮', color: '#f59e0b', gender: 'male', deskIndex: { row: 0, col: 0, seat: 1 }, initialLine: 'Haha, pha đó mượt ghê mày!' },
                { id: 'vy', name: 'Vy', avatar: '🎧', color: '#06b6d4', gender: 'female', deskIndex: { row: 0, col: 2, seat: 0 }, initialLine: 'Bàn bên kia nhỏ tiếng giùm đi để mình còn nghe bài...' }
            ]
        },

        // ---------- KỊCH BẢN PHỤ TRỢ 4: XONG RỒI, CHƯA BẮT ĐẦU, LÀM SAI ----------
        {
            id: 4,
            aliasId: 'sc_chenhlech_tocdo',
            category: 'teaching',
            activityId: 'act_apply',
            activityLabel: 'Hoạt động 4: Vận dụng thực tế',
            title: 'Tình huống 4 – “Xong rồi, chưa bắt đầu, làm sai”',
            shortTitle: '4. Chênh lệch tiến độ làm bài',
            grade: 'Lớp 11B',
            gradeGroup: 'thpt',
            topic: 'Viết đoạn văn ngắn về nghề nghiệp tương lai',
            duration: '6 phút',
            durationSec: 360,
            primaryPrinciples: ['P1', 'P2'],
            yourTask: 'Hỗ trợ phân hóa theo năng lực từng em: giao bài mở rộng cho em khá, cấp giàn giáo cho em bế tắc, định hướng lại cho em hiểu nhầm đề.',
            students: [
                { id: 'mai', name: 'Mai', avatar: '⚡', color: '#3b82f6', gender: 'female', deskIndex: { row: 1, col: 0, seat: 0 }, initialLine: 'Ôi mình viết xong 90 từ rồi! Này cậu viết đến đâu rồi?' },
                { id: 'tuan', name: 'Tuấn', avatar: '📄', color: '#fbbf24', gender: 'male', deskIndex: { row: 1, col: 1, seat: 0 }, initialLine: 'Em không biết viết gì hết... (nhìn tờ giấy trắng)' },
                { id: 'linh', name: 'Linh', avatar: '✍️', color: '#10b981', gender: 'female', deskIndex: { row: 1, col: 2, seat: 1 }, initialLine: 'Mình đang viết bài về nghề kỹ sư của bố và nghề giáo viên của mẹ...' }
            ]
        },

        // ---------- KỊCH BẢN PHỤ TRỢ 5: TIẾNG CƯỜI SAU LƯNG ----------
        {
            id: 5,
            aliasId: 'sc_tieng_cuoi_sau_lung',
            category: 'teaching',
            activityId: 'act_knowledge',
            activityLabel: 'Hoạt động 2: Hình thành kiến thức',
            title: 'Tình huống 5 – “Tiếng cười sau lưng”',
            shortTitle: '5. Tiếng cười sau lưng',
            grade: 'Lớp 8A',
            gradeGroup: 'thcs',
            topic: 'Đọc diễn cảm đoạn văn bản mô tả thiên nhiên',
            duration: '6 phút',
            durationSec: 360,
            primaryPrinciples: ['P1', 'P2', 'P3'],
            yourTask: 'Bảo vệ an toàn tâm lý cho học sinh bị trêu chọc, đặt chuẩn mực lớp học không cười khi bạn mắc lỗi, khích lệ học sinh tự tin.',
            students: [
                { id: 'thao', name: 'Thảo', avatar: '🌾', color: '#ec4899', gender: 'female', deskIndex: { row: 0, col: 1, seat: 0 }, initialLine: 'Ve-ge-tây-bồ... : Em không đọc nữa đâu ạ.' },
                { id: 'quan', name: 'Quân', avatar: '😂', color: '#f59e0b', gender: 'male', deskIndex: { row: 1, col: 1, seat: 0 }, initialLine: 'Haha! Ve-ge-tây-bồ nghe mắc cười quá đi!' },
                { id: 'ha', name: 'Hà', avatar: '🤭', color: '#10b981', gender: 'female', deskIndex: { row: 1, col: 1, seat: 1 }, initialLine: 'Hihi, đúng rồi đó Quân!' }
            ]
        }
    ];

    // ================= 5. DANH MỤC GIÁO VIÊN & CẤP HỌC (GIỮ NGUYÊN 16 THẦY CÔ MBTI) =================
    const MBTI_GROUPS = [
        { id: 'all', label: 'Tất cả (16 Thầy/Cô)' },
        { id: 'NT', label: 'Nhóm Tím · Phân tích (NT)' },
        { id: 'NF', label: 'Nhóm Xanh lá · Ngoại giao (NF)' },
        { id: 'SJ', label: 'Nhóm Xanh dương · Cần mẫn (SJ)' },
        { id: 'SP', label: 'Nhóm Vàng · Khám phá (SP)' }
    ];

    const TEACHER_PERSONAS = [
        { id: 'intj_minhthu', mbti: 'INTJ', mbtiGroup: 'NT', name: 'Cô Minh Thư', displayName: 'Cô Minh Thư', pronoun: 'Cô', gender: 'female', age: 34, colorHex: '#6D28D9', portraitUrl: 'assets/teachers/01_intj_minhthu.jpg', hairStyle: 'female', defaultVoiceId: 'female_young', voicePitch: 1.05, voiceRate: 1.0 },
        { id: 'intp_khoi', mbti: 'INTP', mbtiGroup: 'NT', name: 'Thầy Khôi', displayName: 'Thầy Khôi', pronoun: 'Thầy', gender: 'male', age: 31, colorHex: '#7C3AED', portraitUrl: 'assets/teachers/02_intp_khoi.jpg', hairStyle: 'male', defaultVoiceId: 'male_young', voicePitch: 0.95, voiceRate: 1.0 },
        { id: 'entj_quan', mbti: 'ENTJ', mbtiGroup: 'NT', name: 'Thầy Quân', displayName: 'Thầy Quân', pronoun: 'Thầy', gender: 'male', age: 38, colorHex: '#5B21B6', portraitUrl: 'assets/teachers/03_entj_quan.jpg', hairStyle: 'male', defaultVoiceId: 'male_young', voicePitch: 0.9, voiceRate: 1.02 },
        { id: 'entp_vy', mbti: 'ENTP', mbtiGroup: 'NT', name: 'Cô Vy', displayName: 'Cô Vy', pronoun: 'Cô', gender: 'female', age: 29, colorHex: '#8B5CF6', portraitUrl: 'assets/teachers/04_entp_vy.jpg', hairStyle: 'female', defaultVoiceId: 'female_young', voicePitch: 1.1, voiceRate: 1.03 },
        { id: 'infj_hanh', mbti: 'INFJ', mbtiGroup: 'NF', name: 'Cô Hạnh', displayName: 'Cô Hạnh', pronoun: 'Cô', gender: 'female', age: 36, colorHex: '#059669', portraitUrl: 'assets/teachers/05_infj_hanh.jpg', hairStyle: 'female', defaultVoiceId: 'female_young', voicePitch: 1.08, voiceRate: 0.98 },
        { id: 'infp_an', mbti: 'INFP', mbtiGroup: 'NF', name: 'Thầy An', displayName: 'Thầy An', pronoun: 'Thầy', gender: 'male', age: 28, colorHex: '#10B981', portraitUrl: 'assets/teachers/06_infp_an.jpg', hairStyle: 'male', defaultVoiceId: 'male_young', voicePitch: 0.98, voiceRate: 0.97 },
        { id: 'enfj_phuong', mbti: 'ENFJ', mbtiGroup: 'NF', name: 'Cô Phương', displayName: 'Cô Phương', pronoun: 'Cô', gender: 'female', age: 35, colorHex: '#047857', portraitUrl: 'assets/teachers/07_enfj_phuong.jpg', hairStyle: 'female', defaultVoiceId: 'female_young', voicePitch: 1.12, voiceRate: 1.01 },
        { id: 'enfp_duy', mbti: 'ENFP', mbtiGroup: 'NF', name: 'Thầy Duy', displayName: 'Thầy Duy', pronoun: 'Thầy', gender: 'male', age: 27, colorHex: '#34D399', portraitUrl: 'assets/teachers/08_enfp_duy.jpg', hairStyle: 'male', defaultVoiceId: 'male_young', voicePitch: 1.0, voiceRate: 1.05 },
        { id: 'istj_hung', mbti: 'ISTJ', mbtiGroup: 'SJ', name: 'Thầy Hùng', displayName: 'Thầy Hùng', pronoun: 'Thầy', gender: 'male', age: 42, colorHex: '#1D4ED8', portraitUrl: 'assets/teachers/09_istj_hung.jpg', hairStyle: 'male', defaultVoiceId: 'male_young', voicePitch: 0.88, voiceRate: 0.98 },
        { id: 'isfj_lananh', mbti: 'ISFJ', mbtiGroup: 'SJ', name: 'Cô Lan Anh', displayName: 'Cô Lan Anh', pronoun: 'Cô', gender: 'female', age: 33, colorHex: '#2563EB', portraitUrl: 'assets/teachers/10_isfj_lananh.jpg', hairStyle: 'female', defaultVoiceId: 'female_young', voicePitch: 1.06, voiceRate: 1.0 },
        { id: 'estj_thao', mbti: 'ESTJ', mbtiGroup: 'SJ', name: 'Cô Thảo', displayName: 'Cô Thảo', pronoun: 'Cô', gender: 'female', age: 39, colorHex: '#1E40AF', portraitUrl: 'assets/teachers/11_estj_thao.jpg', hairStyle: 'female', defaultVoiceId: 'female_young', voicePitch: 1.05, voiceRate: 1.02 },
        { id: 'esfj_binh', mbti: 'ESFJ', mbtiGroup: 'SJ', name: 'Thầy Bình', displayName: 'Thầy Bình', pronoun: 'Thầy', gender: 'male', age: 34, colorHex: '#3B82F6', portraitUrl: 'assets/teachers/12_esfj_binh.jpg', hairStyle: 'male', defaultVoiceId: 'male_young', voicePitch: 0.92, voiceRate: 1.0 },
        { id: 'istp_tuan', mbti: 'ISTP', mbtiGroup: 'SP', name: 'Thầy Tuấn', displayName: 'Thầy Tuấn', pronoun: 'Thầy', gender: 'male', age: 32, colorHex: '#D97706', portraitUrl: 'assets/teachers/13_istp_tuan.jpg', hairStyle: 'male', defaultVoiceId: 'male_young', voicePitch: 0.9, voiceRate: 1.0 },
        { id: 'isfp_mai', mbti: 'ISFP', mbtiGroup: 'SP', name: 'Cô Mai', displayName: 'Cô Mai', pronoun: 'Cô', gender: 'female', age: 26, colorHex: '#F59E0B', portraitUrl: 'assets/teachers/14_isfp_mai.jpg', hairStyle: 'female', defaultVoiceId: 'female_young', voicePitch: 1.15, voiceRate: 1.02 },
        { id: 'estp_long', mbti: 'ESTP', mbtiGroup: 'SP', name: 'Thầy Long', displayName: 'Thầy Long', pronoun: 'Thầy', gender: 'male', age: 30, colorHex: '#E3A21A', portraitUrl: 'assets/teachers/15_estp_long.jpg', hairStyle: 'male', defaultVoiceId: 'male_young', voicePitch: 0.93, voiceRate: 1.05 },
        { id: 'esfp_ngoc', mbti: 'ESFP', mbtiGroup: 'SP', name: 'Cô Ngọc', displayName: 'Cô Ngọc', pronoun: 'Cô', gender: 'female', age: 27, colorHex: '#F2C230', portraitUrl: 'assets/teachers/16_esfp_ngoc.svg', hairStyle: 'female', defaultVoiceId: 'female_young', voicePitch: 1.18, voiceRate: 1.04 }
    ];

    const TEACHER_VOICE_MODES = [
        { id: 'female_young', label: 'Giọng nữ, trẻ', gender: 'female', pitch: 1.14, rate: 1.02, muteTeacherTts: false },
        { id: 'male_young', label: 'Giọng nam, trẻ', gender: 'male', pitch: 0.9, rate: 1.0, muteTeacherTts: false },
        { id: 'real_voice', label: 'Dùng giọng thật của tôi', gender: 'all', pitch: 1.0, rate: 1.0, muteTeacherTts: true }
    ];

    const GRADE_LEVELS = [
        { id: 'tieu_hoc', label: 'Tiểu học', shortTag: 'TIỂU HỌC', rangeLabel: 'Lớp 3–5', accentHex: '#f59e0b', grades: [3, 4, 5], defaultGrade: 4 },
        { id: 'thcs', label: 'Trung học cơ sở', shortTag: 'THCS', rangeLabel: 'Lớp 6–9', accentHex: '#2563eb', grades: [6, 7, 8, 9], defaultGrade: 7 },
        { id: 'thpt', label: 'Trung học phổ thông', shortTag: 'THPT', rangeLabel: 'Lớp 10–12', accentHex: '#059669', grades: [10, 11, 12], defaultGrade: 10 }
    ];

    // Cấu trúc 14 bước chia 4 giai đoạn chuẩn Mockup Bản 2
    const MOCKUP_14_STEPS = [
        { step: 1, title: 'Hướng dẫn nhanh', stage: 1, stageLabel: '1 · Chuẩn bị' },
        { step: 2, title: 'Chọn nhân vật giáo viên', stage: 1, stageLabel: '1 · Chuẩn bị' },
        { step: 3, title: 'Chọn loại tình huống', stage: 1, stageLabel: '1 · Chuẩn bị' },
        { step: 4, title: 'Chọn kịch bản & lớp', stage: 1, stageLabel: '1 · Chuẩn bị' },
        { step: 5, title: 'Vào phòng mô phỏng (Thông tin kịch bản)', stage: 1, stageLabel: '1 · Chuẩn bị' },
        { step: 6, title: 'Bắt đầu tiết học', stage: 2, stageLabel: '2 · Trong lớp học' },
        { step: 7, title: 'Tình huống phát sinh', stage: 2, stageLabel: '2 · Trong lớp học' },
        { step: 8, title: 'Tạm dừng quan sát & Nhận diện', stage: 2, stageLabel: '2 · Trong lớp học' },
        { step: 9, title: 'Xử lý tương tác & Kết nối 3 bên', stage: 2, stageLabel: '2 · Trong lớp học' },
        { step: 10, title: 'Kết thúc buổi luyện', stage: 2, stageLabel: '2 · Trong lớp học' },
        { step: 11, title: 'Kết thúc và phản tư (Minh chứng P1, P2, P3)', stage: 3, stageLabel: '3 · Phản tư & nhận xét' },
        { step: 12, title: 'Nhận xét tổng quan (Không chấm điểm)', stage: 3, stageLabel: '3 · Phản tư & nhận xét' },
        { step: 13, title: 'Nhận xét từng hành động & Giải pháp mẫu', stage: 3, stageLabel: '3 · Phản tư & nhận xét' },
        { step: 14, title: 'Hồ sơ tiến bộ qua các buổi luyện', stage: 4, stageLabel: '4 · Luyện lại' }
    ];

    window.LEGAL_BASIS_DOCS = LEGAL_BASIS_DOCS;
    window.THREE_PRINCIPLES = THREE_PRINCIPLES;
    window.SCENARIO_CATEGORIES = SCENARIO_CATEGORIES;
    window.SCENARIOS_5 = SCENARIOS_5;
    window.MBTI_GROUPS = MBTI_GROUPS;
    window.TEACHER_PERSONAS = TEACHER_PERSONAS;
    window.TEACHER_VOICE_MODES = TEACHER_VOICE_MODES;
    window.GRADE_LEVELS = GRADE_LEVELS;
    window.MOCKUP_14_STEPS = MOCKUP_14_STEPS;
})();
