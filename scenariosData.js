// scenariosData.js - Dữ liệu chuẩn Kịch bản 5 tình huống mô phỏng quản lý lớp học
// Căn cứ nhận xét: Luật Nhà giáo số 73/2025/QH15 (hiệu lực từ 01/01/2026)

(function () {
    'use strict';

    // Bộ 8 tiêu chí chung theo Luật Nhà giáo số 73/2025/QH15
    const LAW_2025_CRITERIA = {
        1: {
            id: 1,
            name: 'Tổ chức giảng dạy có chất lượng',
            citation: 'Điều 7 khoản 2 điểm a; Điều 9 khoản 2 điểm a Luật Nhà giáo số 73/2025/QH15',
            shortRef: 'Điều 9 khoản 2 điểm a',
            passDesc: 'Hoạt động đi đúng mục tiêu tiết học, không lãng phí thời gian.',
            failDesc: 'Mục tiêu bài bị bỏ dở, lớp mất nhiều thời gian vì tình huống.'
        },
        2: {
            id: 2,
            name: 'Tôn trọng, công bằng với người học',
            citation: 'Điều 9 khoản 2 điểm d; Điều 11 khoản 2 điểm a Luật Nhà giáo số 73/2025/QH15',
            shortRef: 'Điều 9 khoản 2 điểm d và Điều 11 khoản 2 điểm a',
            passDesc: 'Lời nói tôn trọng; mọi học sinh có cơ hội như nhau.',
            failDesc: 'Xúc phạm, chế giễu, làm bẽ mặt, chỉ chú ý vài em.'
        },
        3: {
            id: 3,
            name: 'Phát huy phẩm chất, năng lực người học',
            citation: 'Điều 7 khoản 1; Điều 9 khoản 2 điểm c Luật Nhà giáo số 73/2025/QH15',
            shortRef: 'Điều 9 khoản 2 điểm c',
            passDesc: 'Hỗ trợ theo năng lực từng em; em giỏi có việc để phát triển, em yếu có bậc để bước lên.',
            failDesc: 'Bỏ mặc em yếu hoặc dập tắt em giỏi.'
        },
        4: {
            id: 4,
            name: 'Mẫu mực, nêu gương',
            citation: 'Điều 7 khoản 1; Điều 9 khoản 2 điểm b Luật Nhà giáo số 73/2025/QH15',
            shortRef: 'Điều 9 khoản 2 điểm b',
            passDesc: 'Bình tĩnh, ngôn ngữ chuẩn mực.',
            failDesc: 'Nóng giận, mỉa mai, tranh cãi với học sinh trước lớp.'
        },
        5: {
            id: 5,
            name: 'Môi trường giáo dục an toàn, dân chủ',
            citation: 'Điều 9 khoản 2 điểm e Luật Nhà giáo số 73/2025/QH15',
            shortRef: 'Điều 9 khoản 2 điểm e',
            passDesc: 'Học sinh dám hỏi, dám sai, được lắng nghe.',
            failDesc: 'Học sinh sợ hãi, im lặng, bị cười chê mà không được bảo vệ.'
        },
        6: {
            id: 6,
            name: 'Áp dụng khoa học giáo dục',
            citation: 'Điều 9 khoản 2 điểm đ Luật Nhà giáo số 73/2025/QH15',
            shortRef: 'Điều 9 khoản 2 điểm đ',
            passDesc: 'Dùng cách làm có cơ sở (làm mẫu, cho thời gian suy nghĩ, gợi ý từng bước).',
            failDesc: 'Xử lý cảm tính, lặp lại cách đã không hiệu quả.'
        },
        7: {
            id: 7,
            name: 'Nhận xét, xử lý kỷ luật đúng quy định',
            citation: 'Điều 8 khoản 2 điểm a Luật Nhà giáo số 73/2025/QH15',
            shortRef: 'Điều 8 khoản 2 điểm a',
            passDesc: 'Dựa trên nội quy, quy chế đã có.',
            failDesc: 'Tự đặt hình thức xử lý ngoài quy định.'
        },
        8: {
            id: 8,
            name: 'Tự đánh giá sau buổi luyện',
            citation: 'Điều 13 khoản 4 Luật Nhà giáo số 73/2025/QH15',
            shortRef: 'Điều 13 khoản 4',
            passDesc: 'Nêu được điểm làm tốt, điểm cần sửa và cách sửa cụ thể.',
            failDesc: 'Chỉ nhận xét chung chung.'
        }
    };

    // 5 Tình huống mô phỏng theo đúng kịch bản
    const SCENARIOS_5 = [
        {
            id: 1,
            title: 'Tình huống 1 – “Cô ơi làm gì ạ?”',
            shortTitle: '1. Cô ơi làm gì ạ?',
            group: 'Tổ chức và quy trình',
            grade: 'Tiểu học – lớp 4',
            duration: '5 phút',
            visibleContext: 'Bạn vừa dạy xong mẫu câu "What do you like doing? – I like …ing". Nhiệm vụ: tổ chức hoạt động hỏi – đáp theo cặp trong 3 phút, sau đó gọi một cặp trình bày.',
            blindContext: {
                classLabel: 'Lớp 4A',
                unitName: 'Sở thích (Hobbies)',
                objective: 'Học sinh hỏi – đáp đúng mẫu câu “What do you like doing? – I like …ing” theo cặp.',
                teacherTask: 'Giao nhiệm vụ hỏi – đáp theo cặp trong 3 phút, sau đó gọi một cặp trình bày trước lớp.',
                warmupPrompt: 'Chào cả lớp! Hôm nay cô trò mình cùng luyện mẫu câu hỏi về sở thích nhé!',
                seats: { bin: 'Bàn đầu, dãy giữa', na: 'Bàn đầu, bên cạnh Bin', ti: 'Bàn đầu, cạnh cửa sổ' }
            },
            step13Context: {
                issueLabel: 'Chưa kiểm tra mức độ hiểu & chưa giao việc rõ cho Bin',
                badExampleQuote: 'Bin! Sao em lại chạy lung tung thế, im lặng ngồi xuống ngay!',
                badConsequence: 'Bin xị mặt ngồi xuống; Tí rụt tay không dám hỏi lại'
            },
            step13Tones: [
                {
                    tone: 'Mềm mỏng',
                    toneColor: 'green',
                    text: 'Một, hai, ba — cả lớp nhìn lên cô nào! Cô và bạn Na làm mẫu trước cho cả lớp xem nhé.',
                    whyWorks: 'Thu hút sự chú ý nhẹ nhàng, làm mẫu trực quan để cả lớp không bối rối.'
                },
                {
                    tone: 'Dứt khoát',
                    toneColor: 'blue',
                    text: 'Cả lớp dừng tay nhìn lên bảng! Bây giờ chúng ta nói chuyện với bạn bên cạnh hay chép vào vở? Đúng rồi, chỉ nói thôi không viết nhé!',
                    whyWorks: 'Dùng câu hỏi kiểm tra hiểu ngắn gọn, chốt rõ hành động nói thay vì chép bài.'
                },
                {
                    tone: 'Hài hước',
                    toneColor: 'orange',
                    text: 'Bin nhanh chân thật đấy! Nhưng hôm nay cô phong em làm trọng tài bấm giờ 3 phút ngay tại bàn nhé!',
                    whyWorks: 'Chuyển năng lượng dư thừa của Bin thành vai trò có ích mà không làm em mất hứng.'
                }
            ],
            initialSceneText: 'Cả lớp bắt đầu hoạt động nhưng Bin đã chạy sang bàn khác, Na đang lấy vở ra chép, còn Tí ngơ ngác giơ tay hỏi: "Cô ơi làm gì ạ?"',
            boardLesson: {
                title: 'ENGLISH GRADE 4 — UNIT: HOBBIES',
                subtitle: 'Pattern: "What do you like doing?" — "I like ...ing"',
                task: 'Pairwork (Speaking): 3 minutes → Present to class',
                notes: [
                    '• I like reading books.',
                    '• I like playing football.',
                    '• I like drawing pictures.'
                ]
            },
            students: [
                {
                    id: 'bin',
                    name: 'Bin',
                    avatar: '⚡',
                    color: '#f59e0b',
                    gender: 'male',
                    deskIndex: { row: 0, col: 1, seat: 0 },
                    hiddenProfile: 'Hiếu động, nghe nửa câu đã làm; xong nhanh rồi chạy sang bàn khác.',
                    initialPosture: 'standing_restless',
                    initialLine: 'Em xong rồi! Em chạy qua bàn kia chơi nha!',
                    voicePitch: 1.35,
                    voiceRate: 1.15
                },
                {
                    id: 'na',
                    name: 'Na',
                    avatar: '📝',
                    color: '#38bdf8',
                    gender: 'female',
                    deskIndex: { row: 0, col: 1, seat: 1 },
                    hiddenProfile: 'Chăm chỉ nhưng hiểu nhầm là viết, lấy vở ra chép.',
                    initialPosture: 'writing',
                    initialLine: 'Dạ... để em chép mẫu câu vào vở cho sạch đẹp ạ.',
                    voicePitch: 1.25,
                    voiceRate: 1.0
                },
                {
                    id: 'ti',
                    name: 'Tí',
                    avatar: '🙋',
                    color: '#10b981',
                    gender: 'male',
                    deskIndex: { row: 0, col: 2, seat: 0 },
                    hiddenProfile: 'Nghe không kịp, hỏi bằng tiếng Việt “Cô ơi làm gì ạ?” rồi ngồi chờ.',
                    initialPosture: 'raising_hand',
                    initialLine: 'Cô ơi làm gì ạ?',
                    voicePitch: 1.3,
                    voiceRate: 0.95
                }
            ],
            step1: {
                question: 'Bạn nhận diện vấn đề cốt lõi đang xảy ra trong lớp là gì?',
                answer: 'Hướng dẫn chưa rõ, thiếu làm mẫu và kiểm tra mức độ hiểu, nên mỗi em làm một kiểu; lớp bắt đầu lộn xộn.',
                expectedKeywords: ['hướng dẫn', 'chưa rõ', 'làm mẫu', 'kiểm tra', 'hiểu', 'mỗi em', 'lộn xộn', 'không rõ']
            },
            step2Analysis: 'Học sinh lớp 4 chỉ nhớ được chỉ dẫn ngắn; một đoạn hướng dẫn dài bằng tiếng Anh dễ khiến các em bỏ lỡ. Lớp cũng chưa có tín hiệu dừng hay quy trình chuyển hoạt động.',
            step3Samples: [
                { label: 'Dừng lớp bằng tín hiệu', text: 'One, two, three — eyes on me!' },
                { label: 'Làm mẫu với 1 học sinh', text: 'Watch me and Na. Na, what do you like doing? Great! Now your turn.' },
                { label: 'Kiểm tra mức độ hiểu (ICQs)', text: 'Are we writing or speaking? Speaking! Who do you talk to? How many minutes?' },
                { label: 'Nhắc ngắn tiếng Việt nếu cần', text: 'Hỏi bạn bên cạnh nhé, không viết vào vở.' },
                { label: 'Giao việc cho Bin', text: 'Bin, you are the timekeeper. Tell me when three minutes are up.' }
            ],
            checkpoints: [
                { id: 'stop_signal', label: 'Dùng tín hiệu dừng lớp / thu hút chú ý', keywords: ['eyes on me', 'one two three', '1 2 3', 'dừng', 'nhìn cô', 'nhìn thầy', 'trật tự', 'listen', 'stop', 'chú ý'] },
                { id: 'model_demo', label: 'Làm mẫu (demo) với 1 học sinh', keywords: ['làm mẫu', 'watch me', 'mẫu', 'example', 'demo', 'na, what do you', 'what do you like doing'] },
                { id: 'check_icq', label: 'Kiểm tra hiểu (nói hay viết / hỏi ai / mấy phút)', keywords: ['writing or speaking', 'nói hay viết', 'không viết', 'viết vào vở', 'speaking', 'who do you', 'how many minutes', 'bạn bên cạnh', 'mấy phút', 'hiểu chưa', 'làm gì'] },
                { id: 'assign_bin', label: 'Giao việc tích cực cho Bin (bấm giờ / timekeeper)', keywords: ['timekeeper', 'bấm giờ', 'đếm giờ', 'canh giờ', 'bin', '3 phút', 'three minutes', 'giúp cô'] }
            ],
            branches: [
                {
                    id: 'scold_bin',
                    label: 'Mắng Bin trước lớp',
                    sampleSpeech: 'Bin! Sao em lại chạy lung tung thế, im lặng ngồi xuống ngay!',
                    triggers: ['mắng', 'quát', 'hư', 'ngồi xuống ngay', 'phạt', 'đứng góc', 'im đi', 'ngu', 'chạy lung tung'],
                    reactions: {
                        bin: { posture: 'pouting', line: 'Hứ... em chỉ đi hỏi bạn thôi mà cô mắng em.' },
                        na: { posture: 'writing', line: 'Sợ quá, mình cứ chép tiếp cho chắc...' },
                        ti: { posture: 'head_down', line: 'Dạ... thôi em không hỏi nữa đâu ạ...' }
                    },
                    success: false,
                    feedbackSummary: 'Bin ngồi xuống nhưng xị mặt; Tí sợ, không dám hỏi nữa.'
                },
                {
                    id: 'repeat_louder',
                    label: 'Nói to hơn, nhắc lại y nguyên hướng dẫn',
                    sampleSpeech: 'Các em chú ý, làm việc theo cặp trong 3 phút đi, nhanh lên nào!',
                    triggers: ['nhanh lên', 'làm việc theo cặp', 'pairwork', 'theo cặp đi', 'nghe lại nè'],
                    reactions: {
                        bin: { posture: 'standing_restless', line: 'Em xong từ nãy rồi cô ơi!' },
                        na: { posture: 'writing', line: 'Dạ... vậy là vẫn chép vào vở đúng không ạ?' },
                        ti: { posture: 'raising_hand', line: 'Cô ơi làm gì ạ? Em vẫn chưa nghe kịp...' }
                    },
                    success: false,
                    feedbackSummary: 'Bin vẫn chạy, Na vẫn viết; lớp ồn hơn.'
                },
                {
                    id: 'structured_positive',
                    label: 'Dùng tín hiệu dừng → làm mẫu → kiểm tra hiểu → giao việc cho Bin',
                    sampleSpeech: 'One, two, three — eyes on me! Watch me and Na: Na, what do you like doing? Are we writing or speaking? Speaking! Hỏi bạn bên cạnh nhé, không viết vào vở. Bin, you are the timekeeper for 3 minutes!',
                    reactions: {
                        bin: { posture: 'happy_task', line: 'Dạ vâng! Em làm người bấm giờ 3 phút cho cả lớp nhé!' },
                        na: { posture: 'speaking_pair', line: 'À, nói chứ không viết ạ! Tí ơi, cậu thích làm gì nhất vào lúc rảnh thế?' },
                        ti: { posture: 'speaking_pair', line: 'À em hiểu rồi ạ! Mình thích đá bóng cùng các bạn nhất!' }
                    },
                    success: true,
                    feedbackSummary: 'Cả ba em làm đúng; Bin vui vì được giao việc “bấm giờ”. Đạt điều kiện kết thúc!'
                }
            ],
            lesson: 'Với học sinh nhỏ, “làm cho xem” hiệu quả hơn “giải thích cho nghe”.',
            endCondition: 'Ít nhất 2/3 học sinh hỏi – đáp đúng mẫu câu trong thời gian quy định.',
            lawCriteriaIds: [1, 6, 2, 5] // Điều 9 k2 a, đ, d, e
        },

        {
            id: 2,
            title: 'Tình huống 2 – “Lúc nào cũng là Huy”',
            shortTitle: '2. Lúc nào cũng là Huy',
            group: 'Điều phối sự tham gia',
            grade: 'THCS – lớp 7',
            duration: '6 phút',
            visibleContext: 'Phần khởi động của bài về lối sống lành mạnh. Bạn đặt các câu hỏi thảo luận như “What do you do to stay healthy?”. Nhiệm vụ: cả ba học sinh đều nói được ít nhất một câu hoàn chỉnh.',
            blindContext: {
                classLabel: 'Lớp 7A',
                unitName: 'Lối sống lành mạnh (Healthy living)',
                objective: 'Học sinh nói được 1–2 câu hoàn chỉnh về thói quen giữ sức khỏe của mình.',
                teacherTask: 'Dẫn phần khởi động bằng câu hỏi thảo luận về thói quen giữ sức khỏe. Đảm bảo cả ba học sinh đều nói được ít nhất một câu.',
                warmupPrompt: 'Chào cả lớp! Hôm nay chúng ta cùng thảo luận về thói quen sống lành mạnh nhé!',
                seats: { huy: 'Bàn đầu, bên phải', lan: 'Bàn đầu, ở giữa', nam: 'Bàn đầu, cạnh cửa sổ' }
            },
            step13Context: {
                issueLabel: 'Huy trả lời trước khi bạn gọi',
                badExampleQuote: 'Huy, thôi dừng lại đi, để bạn khác trả lời chứ!',
                badConsequence: 'Huy xị mặt, ngừng tham gia ~1 phút'
            },
            step13Tones: [
                {
                    tone: 'Mềm mỏng',
                    toneColor: 'green',
                    text: 'Ý kiến của Huy rất hay! Em giữ thêm ý tưởng đó nhé, lượt này cô muốn nghe thêm từ Lan trước.',
                    whyWorks: 'Ghi nhận ý của Huy trước, rồi mới xin lượt cho bạn khác.'
                },
                {
                    tone: 'Dứt khoát',
                    toneColor: 'blue',
                    text: 'Cảm ơn Huy nhé. Cả lớp nhớ nội quy giơ tay trước khi nói nào. Tất cả suy nghĩ 30 giây đã nhé.',
                    whyWorks: 'Nhắc lại nội quy chung của lớp, không nhắm vào cá nhân Huy.'
                },
                {
                    tone: 'Hài hước',
                    toneColor: 'orange',
                    text: 'Hôm nay Huy chạy nhanh như tên lửa ấy nhỉ! Để dành phần cho các bạn cùng trả lời với nhé, chịu không?',
                    whyWorks: 'Giữ không khí vui, Huy không thấy bị chê trước lớp.'
                }
            ],
            initialSceneText: 'Ngay câu hỏi đầu tiên, Huy giơ tay trả lời leo trước khi bạn kịp gọi ai. Lan cúi xuống im lặng, còn Nam quay mặt nhìn ra cửa sổ.',
            boardLesson: {
                title: 'ENGLISH GRADE 7 — HEALTHY LIFESTYLE',
                subtitle: 'Warm-up Discussion: "What do you do to stay healthy?"',
                task: 'Goal: Every student says at least 1 complete sentence',
                notes: [
                    '• I play sports / badminton.',
                    '• I eat vegetables and fruit.',
                    '• I sleep 8 hours a day.'
                ]
            },
            students: [
                {
                    id: 'huy',
                    name: 'Huy',
                    avatar: '⚡',
                    color: '#38bdf8',
                    gender: 'male',
                    deskIndex: { row: 0, col: 1, seat: 0 },
                    hiddenProfile: 'Giỏi, nhanh nhạy, thích thể hiện; trả lời leo mọi câu hỏi dù không được gọi. Không có ác ý.',
                    initialPosture: 'raising_hand',
                    initialLine: 'Em ạ! Em ăn nhiều rau xanh, uống đủ nước và ngày nào cũng chơi cầu lông cho khỏe ạ!',
                    voicePitch: 1.05,
                    voiceRate: 1.15
                },
                {
                    id: 'lan',
                    name: 'Lan',
                    avatar: '🌷',
                    color: '#f472b6',
                    gender: 'female',
                    deskIndex: { row: 0, col: 2, seat: 0 },
                    hiddenProfile: 'Khá, nhưng ngại nói vì sợ sai; nếu có thời gian chuẩn bị thì nói được.',
                    initialPosture: 'head_down',
                    initialLine: 'Dạ... em hơi ngại, em chưa nghĩ kịp câu trả lời ạ...',
                    voicePitch: 1.2,
                    voiceRate: 0.95
                },
                {
                    id: 'nam',
                    name: 'Nam',
                    avatar: '🪟',
                    color: '#fbbf24',
                    gender: 'male',
                    deskIndex: { row: 0, col: 2, seat: 1 },
                    hiddenProfile: 'Trình độ yếu hơn, trả lời ngắn hoặc né nhìn ra cửa sổ.',
                    initialPosture: 'looking_window',
                    initialLine: 'Em không biết nói sao cả ạ...',
                    voicePitch: 0.95,
                    voiceRate: 0.95
                }
            ],
            step1: {
                question: 'Bạn nhận diện vấn đề đang diễn ra trong lớp là gì?',
                answer: 'Sự tham gia không đồng đều: một em lấn át, hai em né tránh vì những lý do khác nhau (Lan sợ sai, Nam thiếu ngôn ngữ).',
                expectedKeywords: ['không đồng đều', 'lấn át', 'trả lời leo', 'né tránh', 'sợ sai', 'thiếu', 'một em', 'im lặng']
            },
            step2Analysis: 'Khi giáo viên hỏi chung cả lớp và chờ người xung phong, em nhanh nhất sẽ luôn trả lời và các em còn lại quen với việc không phải nghĩ. Cần vừa mở cơ hội cho Lan và Nam, vừa giữ hứng thú cho Huy.',
            step3Samples: [
                { label: 'Cho thời gian suy nghĩ (Think time)', text: 'Everyone, think for 30 seconds. Don’t say anything yet.' },
                { label: 'Ghi nhận Huy & giữ lượt', text: 'Huy, great ideas! Can you hold the next one? I want to hear from Lan first.' },
                { label: 'Giàn giáo (Scaffolding) cho Nam', text: 'Nam, do you play sports? Yes or no? Which sport? So say: I play football.' },
                { label: 'Giảm áp lực cho Lan', text: 'Lan, talk to Nam first, then tell me Nam’s answer.' },
                { label: 'Giao vai trò thư ký cho Huy', text: 'Huy, you’re our reporter — write down everyone’s ideas.' }
            ],
            checkpoints: [
                { id: 'think_time', label: 'Cho thời gian suy nghĩ / thảo luận cặp trước khi gọi', keywords: ['30 giây', '30 seconds', 'suy nghĩ', 'think', 'chuẩn bị', 'thảo luận', 'talk to'] },
                { id: 'ack_huy', label: 'Ghi nhận Huy và giao vai trò tích cực (reporter/ghi chép)', keywords: ['huy', 'great', 'tốt', 'hay', 'reporter', 'thư ký', 'ghi lại', 'write down', 'nhường', 'hold'] },
                { id: 'scaffold_nam', label: 'Gợi ý từng bước (giàn giáo) cho Nam', keywords: ['nam', 'yes or no', 'play sports', 'thể thao', 'từng bước', 'gợi ý', 'say: i', 'bóng đá', 'một câu'] },
                { id: 'support_lan', label: 'Mở cơ hội an toàn cho Lan chuẩn bị và trả lời', keywords: ['lan', 'đừng sợ', 'tự tin', 'chuẩn bị', 'chia sẻ', 'nói với bạn'] }
            ],
            branches: [
                {
                    id: 'silence_huy',
                    label: 'Bảo Huy im đi',
                    sampleSpeech: 'Huy, em im đi không nói leo nữa để bạn khác còn nói!',
                    triggers: ['im đi', 'trật tự đi huy', 'đừng nói nữa', 'nói leo', 'im miệng'],
                    reactions: {
                        huy: { posture: 'pouting', line: 'Hứ... vậy em im lặng luôn cũng được.' },
                        lan: { posture: 'head_down', line: 'Dạ... em chưa kịp nghĩ ạ...' },
                        nam: { posture: 'looking_window', line: 'Em không biết đâu ạ.' }
                    },
                    success: false,
                    feedbackSummary: 'Huy cụt hứng và thôi tham gia.'
                },
                {
                    id: 'call_lan_suddenly',
                    label: 'Gọi thẳng Lan khi em chưa chuẩn bị',
                    sampleSpeech: 'Lan đứng dậy trả lời câu này cho cô xem nào!',
                    triggers: ['lan đứng dậy', 'lan trả lời', 'mời lan', 'who can answer'],
                    reactions: {
                        huy: { posture: 'raising_hand', line: 'Để em trả lời thay cho ạ!' },
                        lan: { posture: 'head_down', line: 'Dạ... em... em run quá chưa biết nói thế nào ạ...' },
                        nam: { posture: 'looking_window', line: 'May quá không gọi tới mình...' }
                    },
                    success: false,
                    feedbackSummary: 'Lan đứng im, đỏ mặt, không nói được; hoặc Huy vẫn trả lời hết.'
                },
                {
                    id: 'think_pair_scaffold',
                    label: 'Cho thời gian suy nghĩ → thảo luận cặp → giàn giáo cho Nam & giao vai cho Huy',
                    sampleSpeech: 'Everyone, think for 30 seconds! Huy, great ideas — you’re our reporter, write down everyone’s ideas. Lan, talk to Nam first. Nam, do you play sports? Yes or no? Which sport? So say: I play football.',
                    reactions: {
                        huy: { posture: 'happy_task', line: 'Dạ vâng! Em sẽ làm thư ký ghi lại ý kiến của các bạn ạ!' },
                        lan: { posture: 'speaking_pair', line: 'Em uống đủ nước mỗi ngày và hay chạy bộ buổi sáng cùng mẹ ạ!' },
                        nam: { posture: 'speaking_pair', line: 'Dạ có ạ! Em chơi đá bóng mỗi buổi chiều để giữ sức khỏe ạ!' }
                    },
                    success: true,
                    feedbackSummary: 'Cả ba em đều nói được câu hoàn chỉnh; Huy vẫn hăng hái với vai trò phóng viên!'
                }
            ],
            lesson: 'Học sinh im lặng không phải lúc nào cũng vì lười; cần tìm đúng lý do để hỗ trợ đúng cách.',
            endCondition: 'Mỗi em nói ít nhất một câu hoàn chỉnh và Huy vẫn tham gia tích cực.',
            lawCriteriaIds: [2, 3, 5, 6] // Điều 9 k2 d + Đ11 k2 a, Đ9 k2 c, Đ9 k2 e, Đ9 k2 đ
        },

        {
            id: 3,
            title: 'Tình huống 3 – “Điện thoại dưới gầm bàn”',
            shortTitle: '3. Điện thoại dưới gầm bàn',
            group: 'Hành vi lệch chuẩn',
            grade: 'THPT – lớp 10',
            duration: '6 phút',
            visibleContext: 'Cả lớp đang làm bài nghe điền từ. Nội quy lớp đã thống nhất: không dùng điện thoại khi làm bài. Nhiệm vụ: cả lớp hoàn thành bài nghe, tiết học không bị gián đoạn.',
            blindContext: {
                classLabel: 'Lớp 10A',
                unitName: 'Luyện nghe (Listening Practice)',
                objective: 'Hoàn thành bài nghe điền từ câu 1–5 mà không bị gián đoạn mạch nghe của cả lớp.',
                teacherTask: 'Điều phối lớp làm bài nghe, giữ tập trung và duy trì nội quy không dùng điện thoại.',
                warmupPrompt: 'Chào cả lớp! Bây giờ chúng ta tập trung nghe băng và điền từ câu 1 đến câu 5 nhé!',
                seats: { khoa: 'Bàn hai, bên phải', duc: 'Bàn hai, cạnh Khoa', vy: 'Bàn hai, cạnh cửa sổ' }
            },
            step13Context: {
                issueLabel: 'Xử lý điện thoại làm gián đoạn bài nghe',
                badExampleQuote: 'Dừng băng lại! Khoa nộp ngay điện thoại lên đây cho cô!',
                badConsequence: 'Khoa cãi lại trước lớp, không khí căng thẳng'
            },
            step13Tones: [
                {
                    tone: 'Mềm mỏng',
                    toneColor: 'green',
                    text: 'Khoa ơi, cất điện thoại vào cặp giúp cô ngay nhé. Xong bài nghe mình trao đổi sau.',
                    whyWorks: 'Đi lại gần nhắc nhỏ đủ nghe, giữ thể diện cho học sinh THPT và không cắt bài nghe.'
                },
                {
                    tone: 'Dứt khoát',
                    toneColor: 'blue',
                    text: 'Cô nghe em nói rồi. Nội quy lớp là không dùng máy khi nghe bài, cuối tiết mình trao đổi. Đức, câu số 3 em chọn gì?',
                    whyWorks: 'Khẳng định nội quy bình tĩnh không tranh cãi, chuyển ngay sự chú ý của Đức về bài học.'
                },
                {
                    tone: 'Hài hước',
                    toneColor: 'orange',
                    text: 'Khoa ơi, đèn màn hình dưới gầm bàn sáng quá làm lu mờ bài nghe rồi kìa. Cất máy giúp cô nhé!',
                    whyWorks: 'Nhắc nhẹ khéo léo đủ để Khoa tự hiểu và cất máy mà không bẽ mặt trước Đức.'
                }
            ],
            initialSceneText: 'Khoảng 30 giây sau khi bài nghe bắt đầu, Khoa cúi xuống gầm bàn, ánh sáng màn hình điện thoại hắt lên mặt. Đức ngồi cạnh liếc sang cười khúc khích, còn Vy bắt đầu nhíu mày khó chịu.',
            boardLesson: {
                title: 'ENGLISH GRADE 10 — LISTENING PRACTICE',
                subtitle: 'Task: Listen and fill in the blanks (Questions 1–5)',
                task: 'Class Rule: No mobile phones during listening',
                notes: [
                    '1. The festival takes place in ________.',
                    '2. Visitors can enjoy ________ music.',
                    '3. Remember to bring ________.'
                ]
            },
            students: [
                {
                    id: 'khoa',
                    name: 'Khoa',
                    avatar: '📱',
                    color: '#ef4444',
                    gender: 'male',
                    deskIndex: { row: 1, col: 1, seat: 0 },
                    hiddenProfile: 'Chơi game trên điện thoại dưới gầm bàn. Nếu bị nhắc công khai sẽ cãi “Em đang tra từ điển mà!”; nếu được nhắc riêng, bình tĩnh thì cất máy.',
                    initialPosture: 'using_phone',
                    initialLine: 'Tranh thủ bấm nốt ván game dưới gầm bàn tí thôi...',
                    voicePitch: 0.95,
                    voiceRate: 1.05
                },
                {
                    id: 'duc',
                    name: 'Đức',
                    avatar: '🤭',
                    color: '#fbbf24',
                    gender: 'male',
                    deskIndex: { row: 1, col: 1, seat: 1 },
                    hiddenProfile: 'Ngồi cạnh, liếc sang màn hình và cười; sắp bị kéo theo.',
                    initialPosture: 'peeking_laugh',
                    initialLine: 'Haha, pha đó mượt ghê mày!',
                    voicePitch: 1.0,
                    voiceRate: 1.1
                },
                {
                    id: 'vy',
                    name: 'Vy',
                    avatar: '🎧',
                    color: '#10b981',
                    gender: 'female',
                    deskIndex: { row: 1, col: 2, seat: 0 },
                    hiddenProfile: 'Chăm chú, khó chịu vì ồn; nếu kéo dài sẽ nói “Cô ơi bạn ồn quá”.',
                    initialPosture: 'attentive',
                    initialLine: 'Bàn bên kia nhỏ tiếng giùm đi để mình còn nghe bài...',
                    voicePitch: 1.15,
                    voiceRate: 1.0
                }
            ],
            step1: {
                question: 'Bạn nhận diện hành vi và nguy cơ đang diễn ra là gì?',
                answer: 'Hành vi lệch chuẩn mức độ nhẹ đến vừa (vi phạm nội quy đã thống nhất), có nguy cơ lan sang Đức và ảnh hưởng đến Vy.',
                expectedKeywords: ['lệch chuẩn', 'vi phạm', 'nội quy', 'điện thoại', 'lan sang', 'ảnh hưởng', 'gián đoạn']
            },
            step2Analysis: 'Học sinh lớp 10 rất nhạy cảm với việc bị “bắt lỗi” trước bạn bè. Mục tiêu là chấm dứt hành vi mà không dừng bài học và không biến chuyện nhỏ thành cuộc đối đầu trước lớp.',
            step3Samples: [
                { label: 'Đi lại gần bàn Khoa, nhắc nhỏ riêng', text: 'Khoa, phone away, please. You can check words after the task.' },
                { label: 'Nếu Khoa cãi, giữ bình tĩnh hẹn sau giờ', text: 'I hear you. Our rule is no phones during listening. Let’s talk after class.' },
                { label: 'Kéo Đức về nhiệm vụ bài nghe', text: 'Đức, what do you have for question 3?' },
                { label: 'Đưa cả lớp quay lại bài ngay', text: 'OK everyone, let’s check question 4.' }
            ],
            checkpoints: [
                { id: 'private_calm', label: 'Nhắc riêng ngắn gọn, giữ bình tĩnh (không quát trước lớp)', keywords: ['nhắc riêng', 'nhỏ', 'phone away', 'cất điện thoại', 'cất máy', 'after the task', 'bình tĩnh', 'sau giờ'] },
                { id: 'refer_rule', label: 'Nhắc lại nội quy lớp đã thống nhất (không tự đặt hình phạt)', keywords: ['nội quy', 'quy định', 'rule', 'thống nhất', 'no phone', 'không dùng điện thoại'] },
                { id: 'redirect_duc', label: 'Kéo Đức và cả lớp quay lại câu hỏi bài nghe', keywords: ['đức', 'question', 'câu', 'bài nghe', 'listening', 'quay lại', 'tập trung'] }
            ],
            branches: [
                {
                    id: 'public_yell',
                    label: 'Dừng bài nghe, lớn tiếng yêu cầu nộp điện thoại trước lớp',
                    sampleSpeech: 'Dừng băng lại! Khoa nộp ngay điện thoại lên đây cho cô, sao giờ nghe lại bấm máy!',
                    triggers: ['nộp điện thoại', 'tịch thu', 'dừng bài', 'đưa đây', 'ra khỏi lớp', 'viết kiểm điểm', 'quát'],
                    reactions: {
                        khoa: { posture: 'pouting', line: 'Em đang tra từ điển mà cô! Sao cô lại tịch thu máy em!' },
                        duc: { posture: 'head_down', line: 'Thôi chết rồi, không khí căng thẳng quá...' },
                        vy: { posture: 'head_down', line: 'Tiếc quá, đang nghe dở bài...' }
                    },
                    success: false,
                    feedbackSummary: 'Khoa cãi lại, không khí căng thẳng, tiết học mất vài phút.'
                },
                {
                    id: 'ignore_phone',
                    label: 'Không để ý hoặc bỏ qua',
                    sampleSpeech: 'Thôi các em tự làm đi nhé, cô không nhắc nữa.',
                    triggers: ['bỏ qua', 'kệ', 'tiếp tục đi', 'làm tiếp đi', 'không sao'],
                    reactions: {
                        khoa: { posture: 'using_phone', line: 'Ngon, cô không thấy! Chơi thêm trận nữa!' },
                        duc: { posture: 'peeking_laugh', line: 'Haha cho tao xem với Khoa ơi!' },
                        vy: { posture: 'raising_hand', line: 'Cô ơi bạn ồn quá, em không nghe được gì hết ạ!' }
                    },
                    success: false,
                    feedbackSummary: 'Sau vài lượt, Đức cũng xem cùng; Vy lên tiếng phàn nàn (hiệu ứng lan).'
                },
                {
                    id: 'quiet_rule_redirect',
                    label: 'Vẫn cho bài nghe chạy, đi lại gần nhắc riêng theo nội quy & kéo Đức về nhiệm vụ',
                    sampleSpeech: 'Khoa, phone away, please. Our rule is no phones during listening — we can talk after class. Đức, what do you have for question 3? OK everyone, let’s check question 4.',
                    reactions: {
                        khoa: { posture: 'attentive', line: 'Dạ... để em cất điện thoại vào cặp và nghe tiếp ạ.' },
                        duc: { posture: 'writing', line: 'Dạ câu số 3 em điền xong rồi, em làm tiếp câu 4 đây ạ!' },
                        vy: { posture: 'attentive', line: 'May quá, lớp yên tĩnh lại để nghe tiếp rồi ạ.' }
                    },
                    success: true,
                    feedbackSummary: 'Khoa cất máy; Đức quay lại làm bài; Vy không phải lên tiếng. Bài nghe không bị gián đoạn!'
                }
            ],
            lesson: 'Xử lý vi phạm nhỏ càng kín đáo, bình tĩnh thì càng ít làm gián đoạn bài học.',
            endCondition: 'Khoa và Đức quay lại nhiệm vụ; bài nghe không bị dừng quá 30 giây.',
            lawCriteriaIds: [7, 4, 2, 1] // Điều 8 k2 a, Điều 9 k2 b, Điều 9 k2 d, Điều 9 k2 a
        },

        {
            id: 4,
            title: 'Tình huống 4 – “Xong rồi, chưa bắt đầu, làm sai”',
            shortTitle: '4. Xong rồi, chưa bắt đầu, làm sai',
            group: 'Hỗ trợ học tập',
            grade: 'THPT – lớp 11',
            duration: '7 phút',
            visibleContext: 'Học sinh viết một đoạn văn khoảng 80 từ trả lời câu hỏi “What job would you like to do in the future, and why?” trong 10 phút. Bạn đi quanh lớp để hỗ trợ.',
            blindContext: {
                classLabel: 'Lớp 11A',
                unitName: 'Nghề nghiệp tương lai (Future Jobs)',
                objective: 'Mỗi học sinh viết được đoạn văn ngắn (~80 từ) đúng trọng tâm nghề nghiệp tương lai của bản thân.',
                teacherTask: 'Đi quan sát các bàn để hỗ trợ kịp thời tiến độ và chất lượng viết của từng học sinh.',
                warmupPrompt: 'Cả lớp bắt đầu viết đoạn văn ngắn về nghề nghiệp tương lai nhé, cô sẽ đi quanh lớp hỗ trợ!',
                seats: { mai: 'Bàn đầu, bên phải', tuan: 'Bàn hai, bên phải', linh: 'Bàn hai, cạnh cửa sổ' }
            },
            step13Context: {
                issueLabel: 'Chênh lệch tốc độ & học sinh hiểu sai đề bài',
                badExampleQuote: 'Mai xong rồi thì sang bàn Tuấn viết hộ giúp bạn đi em!',
                badConsequence: 'Tuấn chép y nguyên mà không tự nghĩ, Linh vẫn viết lạc đề'
            },
            step13Tones: [
                {
                    tone: 'Mềm mỏng',
                    toneColor: 'green',
                    text: 'Tuấn ơi, mình bắt đầu từng bước nhỏ nhé: em thích làm nghề gì? Vì sao? Viết câu mở đầu theo mẫu cô gợi ý nha.',
                    whyWorks: 'Cấp giàn giáo từng bước vừa sức để Tuấn tự đặt được câu đầu tiên.'
                },
                {
                    tone: 'Dứt khoát',
                    toneColor: 'blue',
                    text: 'Linh dừng bút một chút và đọc lại đề bài giúp cô nào. Đề đang hỏi về nghề nghiệp của ai — của chính em hay của bố mẹ?',
                    whyWorks: 'Đặt câu hỏi gợi mở đúng lúc giúp Linh tự phát hiện lỗi lạc đề.'
                },
                {
                    tone: 'Hài hước',
                    toneColor: 'orange',
                    text: 'Mai viết nhanh như gió ấy nhỉ! Nâng cấp thêm cho cô một lý do thật bất ngờ và một ví dụ thực tế trước khi hết giờ nhé!',
                    whyWorks: 'Tạo thử thách mở rộng thú vị để Mai không thấy nhàm chán quay sang nói chuyện.'
                }
            ],
            initialSceneText: 'Phút thứ 3, Mai đặt bút xuống quay sang nói chuyện với bạn; Tuấn ngồi nhìn tờ giấy trắng bóc; còn Linh đang viết rất chăm chú nhưng lại viết về nghề của bố mẹ.',
            boardLesson: {
                title: 'ENGLISH GRADE 11 — WRITING (~80 WORDS)',
                subtitle: 'Topic: "What job would you like to do in the future, and why?"',
                task: 'Time: 10 minutes · Teacher circulates to support',
                notes: [
                    '• Structure: Topic sentence → 2 reasons → Example',
                    '• Useful: "I want to be a ... because ..."'
                ]
            },
            students: [
                {
                    id: 'mai',
                    name: 'Mai',
                    avatar: '✨',
                    color: '#a855f7',
                    gender: 'female',
                    deskIndex: { row: 0, col: 1, seat: 0 },
                    hiddenProfile: 'Giỏi; viết xong sau 3 phút, chán, bắt đầu nói chuyện với bạn.',
                    initialPosture: 'peeking_laugh',
                    initialLine: 'Ôi mình viết xong 90 từ rồi! Này cậu viết đến đâu rồi?',
                    voicePitch: 1.2,
                    voiceRate: 1.1
                },
                {
                    id: 'tuan',
                    name: 'Tuấn',
                    avatar: '📄',
                    color: '#fbbf24',
                    gender: 'male',
                    deskIndex: { row: 1, col: 1, seat: 0 },
                    hiddenProfile: 'Yếu hơn; tờ giấy vẫn trắng, nói nhỏ “Em không biết viết gì” nhưng ngại hỏi.',
                    initialPosture: 'head_down',
                    initialLine: 'Em không biết viết gì hết... (nhìn tờ giấy trắng)',
                    voicePitch: 0.95,
                    voiceRate: 0.9
                },
                {
                    id: 'linh',
                    name: 'Linh',
                    avatar: '✍️',
                    color: '#10b981',
                    gender: 'female',
                    deskIndex: { row: 1, col: 2, seat: 1 },
                    hiddenProfile: 'Khá, nhưng hiểu nhầm đề, đang viết về nghề của bố mẹ.',
                    initialPosture: 'writing',
                    initialLine: 'Mình đang viết bài về nghề kỹ sư của bố và nghề giáo viên của mẹ...',
                    voicePitch: 1.15,
                    voiceRate: 1.0
                }
            ],
            step1: {
                question: 'Bạn nhận diện vấn đề học tập đang xảy ra ở 3 học sinh là gì?',
                answer: 'Chênh lệch trình độ (một em xong quá sớm, một em bế tắc) cộng với một em hiểu sai nhiệm vụ. Trường hợp của Linh khó phát hiện nhất vì em trông rất tập trung.',
                expectedKeywords: ['chênh lệch', 'xong sớm', 'bế tắc', 'hiểu sai', 'nhầm đề', 'linh', 'tốc độ', 'khác nhau']
            },
            step2Analysis: 'Một nhiệm vụ giống nhau cho cả lớp luôn tạo ra chênh lệch tốc độ. Nếu chỉ nhìn biểu hiện bên ngoài (ai đang viết, ai không), giáo viên sẽ bỏ sót Linh. Cần theo dõi tiến độ của từng em và hỗ trợ theo nhu cầu riêng.',
            step3Samples: [
                { label: 'Giao nhiệm vụ mở rộng cho Mai', text: 'Great, you’re done! Now add one more reason with "because" and one real example.' },
                { label: 'Khung gợi ý từng bước cho Tuấn', text: 'Let’s start small. What job do you like? Why? Write: I want to be a ... because ...' },
                { label: 'Câu hỏi gợi mở để Linh tự phát hiện', text: 'Linh, can you read the question again for me? Whose job is it asking about?' },
                { label: 'Nhắc chung cả lớp', text: 'Quick reminder, everyone: write about your future job.' }
            ],
            checkpoints: [
                { id: 'extend_mai', label: 'Giao nhiệm vụ mở rộng cho Mai', keywords: ['mai', 'mở rộng', 'ví dụ', 'example', 'reason', 'lý do', 'add one more', 'viết thêm'] },
                { id: 'scaffold_tuan', label: 'Đưa khung gợi ý câu mở đầu cho Tuấn', keywords: ['tuấn', 'what job', 'because', 'want to be', 'gợi ý', 'khung', 'start small', 'em thích nghề'] },
                { id: 'check_linh', label: 'Kiểm tra và gợi mở để Linh tự đọc lại đề bài', keywords: ['linh', 'đọc lại đề', 'read the question', 'whose job', 'câu hỏi', 'nghề của ai', 'tương lai của em'] }
            ],
            branches: [
                {
                    id: 'generic_encourage',
                    label: 'Chỉ nói chung: “Các em cố lên, còn 5 phút”',
                    sampleSpeech: 'Các em cố gắng lên nhé, chỉ còn 5 phút nữa thôi!',
                    triggers: ['cố lên', 'còn 5 phút', 'viết nhanh lên', 'tập trung viết'],
                    reactions: {
                        mai: { posture: 'peeking_laugh', line: 'Chán quá, quay sang nói chuyện tiếp vậy.' },
                        tuan: { posture: 'head_down', line: 'Khó quá, tờ giấy vẫn trắng nguyên không biết viết câu đầu sao...' },
                        linh: { posture: 'writing', line: 'Mình viết tiếp đoạn kể nghề kỹ sư của bố cho hay...' }
                    },
                    success: false,
                    feedbackSummary: 'Không ai thay đổi; Mai làm phiền bạn, Tuấn vẫn giấy trắng, Linh lạc đề.'
                },
                {
                    id: 'mai_help_tuan',
                    label: 'Bảo Mai sang viết hộ / làm giúp Tuấn',
                    sampleSpeech: 'Mai xong rồi thì sang bàn Tuấn giúp bạn viết bài đi em!',
                    triggers: ['giúp tuấn', 'viết hộ', 'làm giúp', 'chỉ cho tuấn viết'],
                    reactions: {
                        mai: { posture: 'writing', line: 'Đưa đây tớ đọc từng chữ cho cậu chép theo này!' },
                        tuan: { posture: 'writing', line: 'Ừ, để mình chép y nguyên câu của cậu cho xong...' },
                        linh: { posture: 'writing', line: 'Sắp xong bài về nghề của bố mẹ rồi...' }
                    },
                    success: false,
                    feedbackSummary: 'Mai viết hộ, Tuấn chép lại mà không học được gì; Linh vẫn lạc đề.'
                },
                {
                    id: 'differentiated_support',
                    label: 'Giao mở rộng cho Mai, khung gợi ý cho Tuấn, hỏi Linh đọc lại đề',
                    sampleSpeech: 'Mai, great job! Add one more reason with "because" and one real example. Tuấn, let’s start small: what job do you like? Write: I want to be a ... because ... Linh, can you read the question again — whose job is it asking about?',
                    reactions: {
                        mai: { posture: 'writing', line: 'Dạ! Em sẽ viết thêm một ví dụ thực tế nữa ạ!' },
                        tuan: { posture: 'writing', line: 'À, em nghĩ ra rồi! Em sẽ viết là mình muốn làm nhà thiết kế vì em thích vẽ ạ!' },
                        linh: { posture: 'writing', line: 'Ối, đề hỏi nghề tương lai của chính em! Em cảm ơn, để em sửa lại ngay ạ!' }
                    },
                    success: true,
                    feedbackSummary: 'Mai có việc mở rộng; Tuấn viết được câu đầu; Linh tự nhận ra và sửa đúng đề!'
                }
            ],
            lesson: '“Trông có vẻ đang làm” chưa chắc là “đang làm đúng”.',
            endCondition: 'Tuấn viết được ít nhất 2 câu, Linh viết lại đúng đề, Mai có nhiệm vụ mở rộng.',
            lawCriteriaIds: [3, 2, 1, 6] // Điều 9 k2 c, Đ9 k2 d + Đ11 k2 a, Đ9 k2 a, Đ9 k2 đ
        },

        {
            id: 5,
            title: 'Tình huống 5 – “Tiếng cười sau lưng”',
            shortTitle: '5. Tiếng cười sau lưng',
            group: 'Quan hệ và cảm xúc',
            grade: 'THCS – lớp 8',
            duration: '5 phút',
            visibleContext: 'Các em đọc to từng đoạn của một bài hội thoại về đồ ăn. Bạn gọi Thảo đọc đoạn tiếp theo. Nhiệm vụ: hoàn thành phần đọc và giữ không khí lớp tích cực.',
            blindContext: {
                classLabel: 'Lớp 8B',
                unitName: 'Đồ ăn & Sức khỏe (Healthy Food)',
                objective: 'Hoàn thành phần đọc hội thoại to trước lớp, giữ tâm lý an toàn và tôn trọng lẫn nhau.',
                teacherTask: 'Mời Thảo đọc đoạn hội thoại và điều phối cả lớp lắng nghe, luyện phát âm tự tin.',
                warmupPrompt: 'Cả lớp cùng luyện đọc to đoạn hội thoại về đồ ăn nhé. Thảo đọc giúp cô đoạn tiếp theo nào!',
                seats: { thao: 'Bàn đầu, bên phải', quan: 'Bàn hai, bên phải', ha: 'Bàn hai, cạnh Quân' }
            },
            step13Context: {
                issueLabel: 'Học sinh bị cười nhại khi phát âm sai',
                badExampleQuote: 'Thôi Thảo ngồi xuống đi, mời bạn khác đọc tiếp cho nhanh.',
                badConsequence: 'Thảo thu mình im lặng cả tiết, tiếng cười trêu chọc tiếp diễn'
            },
            step13Tones: [
                {
                    tone: 'Mềm mỏng',
                    toneColor: 'green',
                    text: 'Cả lớp dừng một chút nhé. Trong lớp mình, nói nhầm là chuyện bình thường để tiến bộ. Thảo ơi, em muốn tự đọc tiếp hay đọc cùng cô nào?',
                    whyWorks: 'Bảo vệ Thảo bằng sự lựa chọn an toàn, không ép buộc nhưng trao lại tự tin.'
                },
                {
                    tone: 'Dứt khoát',
                    toneColor: 'blue',
                    text: 'Dừng lại một chút! Lớp chúng ta tôn trọng nhau và không cười khi bạn phát âm chưa chuẩn. Bây giờ cả lớp cùng đọc chung từ này nhé!',
                    whyWorks: 'Đặt lại chuẩn mực chung rõ ràng và biến từ khó thành luyện tập chung của cả lớp.'
                },
                {
                    tone: 'Hài hước',
                    toneColor: 'orange',
                    text: 'Quân hôm nay nhiều năng lượng quá nhỉ! Giữ giọng khỏe đó giúp cô đóng vai nhân vật tiếp theo cho thật hào hứng nhé!',
                    whyWorks: 'Giảm căng thẳng, giữ thể diện cho Quân và chuyển sự hăng hái vào bài đọc.'
                }
            ],
            initialSceneText: 'Thảo phát âm từ "vegetable" thành "ve-ge-tây-bồ". Quân cười phá lên nhại lại, Hà cười hùa theo. Thảo dừng lại, cúi mặt nói nhỏ: "Em không đọc nữa đâu ạ."',
            boardLesson: {
                title: 'ENGLISH GRADE 8 — READING ALOUD',
                subtitle: 'Dialogue: Healthy Food & Cooking',
                task: 'Focus Word: vegetable  /ˈvedʒ.tə.bəl/',
                notes: [
                    '• "First, wash the fresh vegetables carefully."',
                    '• Pronunciation tip: VEJ-tuh-bul (3 syllables)'
                ]
            },
            students: [
                {
                    id: 'thao',
                    name: 'Thảo',
                    avatar: '😢',
                    color: '#f472b6',
                    gender: 'female',
                    deskIndex: { row: 0, col: 1, seat: 0 },
                    hiddenProfile: 'Nhút nhát, dễ tổn thương; phát âm sai từ vegetable (đọc thành “ve-ge-tây-bồ”). Nếu được bảo vệ và động viên, em sẽ đọc tiếp.',
                    initialPosture: 'head_down',
                    initialLine: 'Ve-ge-tây-bồ... (cúi gằm mặt): Em không đọc nữa đâu ạ.',
                    voicePitch: 1.25,
                    voiceRate: 0.9
                },
                {
                    id: 'quan',
                    name: 'Quân',
                    avatar: '😆',
                    color: '#fbbf24',
                    gender: 'male',
                    deskIndex: { row: 1, col: 1, seat: 0 },
                    hiddenProfile: 'Hay đùa, không ác ý; cười to và nhại lại. Nếu bị phê bình gắt trước lớp sẽ tự ái và thôi tham gia.',
                    initialPosture: 'peeking_laugh',
                    initialLine: 'Haha! Ve-ge-tây-bồ nghe mắc cười quá đi!',
                    voicePitch: 1.05,
                    voiceRate: 1.15
                },
                {
                    id: 'ha',
                    name: 'Hà',
                    avatar: '🤭',
                    color: '#38bdf8',
                    gender: 'female',
                    deskIndex: { row: 1, col: 1, seat: 1 },
                    hiddenProfile: 'Hay a dua, cười theo Quân.',
                    initialPosture: 'peeking_laugh',
                    initialLine: 'Hihi, đúng rồi đó Quân!',
                    voicePitch: 1.2,
                    voiceRate: 1.1
                }
            ],
            step1: {
                question: 'Bạn nhận diện vấn đề cảm xúc và quan hệ lớp học đang xảy ra là gì?',
                answer: 'Một học sinh bị tổn thương và sự tôn trọng lẫn nhau trong lớp bị vi phạm. Nguy cơ lớn nhất: Thảo, và cả những em khác, sẽ sợ nói tiếng Anh vì sợ bị cười.',
                expectedKeywords: ['tổn thương', 'tôn trọng', 'cười nhạo', 'nhại lại', 'sợ nói', 'an toàn', 'xấu hổ']
            },
            step2Analysis: 'Cần làm ba việc cùng lúc: bảo vệ Thảo, đặt lại chuẩn mực chung cho cả lớp, và xử lý Quân mà không đẩy em vào thế đối đầu. Nếu chỉ tập trung phạt Quân, Thảo càng bị cả lớp chú ý và càng ngại.',
            step3Samples: [
                { label: 'Đặt chuẩn mực chung bình tĩnh', text: 'Hold on. In this class, mistakes are how we learn. We laugh with people, not at people.' },
                { label: 'Biến lỗi cá nhân thành lỗi chung', text: 'Actually, this word is tricky for many people. Let’s all say it together: VEJ-tuh-bul.' },
                { label: 'Trao quyền lựa chọn cho Thảo', text: 'Thảo, would you like to continue, or read the next line with me?' },
                { label: 'Chuyển năng lượng Quân sang tích cực', text: 'Quân, you have great energy. Can you read the next part for us?' }
            ],
            checkpoints: [
                { id: 'set_norm', label: 'Đặt chuẩn mực chung "không cười khi bạn mắc lỗi"', keywords: ['hold on', 'không cười', 'not at people', 'mistakes', 'sai là bình thường', 'tôn trọng', 'chuẩn mực', 'dừng'] },
                { id: 'normalize_word', label: 'Bình thường hóa từ khó (cả lớp cùng đọc vegetable)', keywords: ['tricky', 'together', 'cả lớp', 'cùng đọc', 'vej', 'vegetable', 'từ này khó'] },
                { id: 'support_thao', label: 'Bảo vệ & trao lựa chọn cho Thảo đọc tiếp (hoặc đọc cùng cô)', keywords: ['thảo', 'continue', 'đọc tiếp', 'with me', 'cùng cô', 'cùng thầy', 'động viên'] },
                { id: 'redirect_quan', label: 'Chuyển năng lượng của Quân tích cực (không mắng gắt)', keywords: ['quân', 'energy', 'next part', 'đọc đoạn', 'lần sau', 'cùng bạn'] }
            ],
            branches: [
                {
                    id: 'ignore_laugh',
                    label: 'Bỏ qua tiếng cười, gọi bạn khác đọc tiếp',
                    sampleSpeech: 'Thôi Thảo ngồi xuống đi, mời bạn khác đọc tiếp cho nhanh.',
                    triggers: ['bạn khác đọc', 'ngồi xuống đi', 'bỏ qua', 'người khác đọc'],
                    reactions: {
                        thao: { posture: 'head_down', line: 'Thôi từ giờ mình không dám giơ tay đọc nữa đâu...' },
                        quan: { posture: 'peeking_laugh', line: 'Hihi, qua màn luôn!' },
                        ha: { posture: 'peeking_laugh', line: 'Buồn cười quá đi mất!' }
                    },
                    success: false,
                    feedbackSummary: 'Thảo im lặng cả tiết; Quân và Hà tiếp tục trêu chọc người khác.'
                },
                {
                    id: 'harsh_scold_quan',
                    label: 'Phê bình nặng Quân trước lớp',
                    sampleSpeech: 'Quân! Sao em vô duyên thế, bạn đọc sai thì phải thông cảm chứ sao lại cười nhại bạn! Đứng lên kiểm điểm!',
                    triggers: ['vô duyên', 'xấu hổ', 'kiểm điểm', 'quân im', 'trừ điểm quân', 'mắng quân'],
                    reactions: {
                        thao: { posture: 'head_down', line: 'Ngại quá, cả lớp cứ nhìn chằm chằm về phía mình...' },
                        quan: { posture: 'pouting', line: 'Em chỉ đùa xíu thôi mà cô làm căng thế... Em không đọc nữa đâu.' },
                        ha: { posture: 'head_down', line: 'Sợ quá, im lặng luôn cho yên chuyện...' }
                    },
                    success: false,
                    feedbackSummary: 'Quân tự ái, lớp im lặng căng thẳng; Thảo càng ngại vì bị chú ý.'
                },
                {
                    id: 'norm_normalize_empower',
                    label: 'Dừng ngắn → đặt chuẩn mực → cả lớp cùng đọc → cho Thảo chọn & giao việc cho Quân',
                    sampleSpeech: 'Hold on. In this class, mistakes are how we learn — we laugh with people, not at people. This word is tricky: let’s all say it together: VEJ-tuh-bul! Thảo, would you like to read the next line with me? Quân, you have great energy, can you read the next part for us?',
                    reactions: {
                        thao: { posture: 'speaking_pair', line: 'Dạ... vét-giơ-tơ-bồ. Em cảm ơn ạ, em xin đọc tiếp câu sau!' },
                        quan: { posture: 'attentive', line: 'Mình xin lỗi Thảo nhé. Vét-giơ-tơ-bồ! Dạ để em đọc đoạn tiếp theo ạ!' },
                        ha: { posture: 'attentive', line: 'Vét-giơ-tơ-bồ! Em sẽ tập trung theo dõi bài ạ.' }
                    },
                    success: true,
                    feedbackSummary: 'Thảo đọc tiếp tự tin; Quân và Hà thôi cười, Quân vẫn tham gia tích cực!'
                }
            ],
            lesson: 'Trong lớp ngoại ngữ, cảm giác an toàn khi mắc lỗi là điều kiện để học sinh dám nói.',
            endCondition: 'Thảo đọc tiếp được ít nhất một câu; Quân không bị cô lập và vẫn tham gia.',
            lawCriteriaIds: [5, 2, 4, 3] // Điều 9 k2 e, d, b, Điều 7 k1
        }
    ];

    // 4 Nhóm màu MBTI chuẩn (chỉ dùng để tạo cá tính & hình ảnh nhân vật, không đánh giá người dùng)
    const MBTI_GROUPS = [
        { id: 'NT', label: 'Tím · Phân tích (NT)', shortLabel: 'Tím · NT', colorHex: '#5B3F8C', bgTint: '#F3EFFA', borderHex: '#C4B5FD' },
        { id: 'NF', label: 'Xanh lá · Ngoại giao (NF)', shortLabel: 'Xanh lá · NF', colorHex: '#2E8B57', bgTint: '#ECFDF5', borderHex: '#86EFAC' },
        { id: 'SJ', label: 'Xanh dương ngọc · Giữ gìn (SJ)', shortLabel: 'Xanh dương ngọc · SJ', colorHex: '#2B5FA8', bgTint: '#EFF6FF', borderHex: '#93C5FD' },
        { id: 'SP', label: 'Vàng · Khám phá (SP)', shortLabel: 'Vàng · SP', colorHex: '#C9A227', bgTint: '#FEFCE8', borderHex: '#FDE047' }
    ];

    // 16 Nhân vật giáo viên theo MBTI (8 nữ, 8 nam) cho Bước 2
    const TEACHER_PERSONAS = [
        // --- NHÓM TÍM – PHÂN TÍCH (NT) ---
        {
            id: 'intj_minh_thu',
            aliasIds: ['co_giao_tre', 'co_minh_anh'],
            mbti: 'INTJ',
            mbtiGroup: 'NT',
            mbtiGroupLabel: 'Nhóm Tím · Phân tích (NT)',
            name: 'Cô Minh Thư',
            displayName: 'Cô Minh Thư',
            pronoun: 'Cô',
            gender: 'female',
            age: 35,
            colorHex: '#5B3F8C',
            bgTint: '#F3EFFA',
            traits: 'Chiến lược, độc lập, điềm tĩnh, ít nói nhưng chính xác',
            outfitDesc: 'Blazer tím than, tóc búi gọn, kính gọng mảnh, ôm bìa giáo án; ánh mắt tập trung, nụ cười nhẹ',
            teachingStyle: 'Lên kế hoạch kỹ, mục tiêu từng tiết rõ ràng; quản lý lớp bằng quy trình; giải thích logic, ít cảm xúc',
            portraitUrl: 'assets/teachers/01_intj_minh_thu.jpg',
            portraitPrompt: 'Half-body portrait of a Vietnamese school teacher, friendly flat vector illustration with soft shading, facing the viewer, plain light background tinted with #5B3F8C, square 1:1, no text, no logo. female teacher, about 35, deep purple blazer, neat bun, thin-framed glasses, holding a lesson-plan folder, calm focused expression',
            hasGlasses: true,
            avatar: '👩‍🏫',
            avatarBg: '#f6d2b6',
            shirtColor: '#5B3F8C',
            suitColor: 0x5B3F8C,
            tieColor: 0xFFFFFF,
            hairStyle: 'female',
            defaultVoiceId: 'female_young',
            voicePitch: 1.10,
            voiceRate: 0.99
        },
        {
            id: 'intp_khoi',
            aliasIds: [],
            mbti: 'INTP',
            mbtiGroup: 'NT',
            mbtiGroupLabel: 'Nhóm Tím · Phân tích (NT)',
            name: 'Thầy Khôi',
            displayName: 'Thầy Khôi',
            pronoun: 'Thầy',
            gender: 'male',
            age: 30,
            colorHex: '#8E6CC2',
            bgTint: '#F5F0FC',
            traits: 'Tò mò, thích lý giải, cởi mở với ý tưởng mới, hơi đãng trí',
            outfitDesc: 'Áo len cổ tim màu oải hương khoác ngoài sơ mi, tóc hơi rối, cầm bút dạ ngang cằm như đang suy nghĩ',
            teachingStyle: 'Hay hỏi “tại sao”, khuyến khích tư duy phản biện; có lúc lạc đề và quên giờ',
            portraitUrl: 'assets/teachers/02_intp_khoi.jpg',
            portraitPrompt: 'Half-body portrait of a Vietnamese school teacher, friendly flat vector illustration with soft shading, facing the viewer, plain light background tinted with #8E6CC2, square 1:1, no text, no logo. male teacher, about 30, lavender sweater vest over a shirt, slightly messy hair, marker held to chin, curious thoughtful look',
            hasGlasses: false,
            avatar: '👨‍🏫',
            avatarBg: '#efc3a0',
            shirtColor: '#8E6CC2',
            suitColor: 0x8E6CC2,
            tieColor: 0xF8FAFC,
            hairStyle: 'male',
            defaultVoiceId: 'male_young',
            voicePitch: 0.92,
            voiceRate: 1.00
        },
        {
            id: 'entj_quan',
            aliasIds: ['thay_giao_tre', 'thay_hoang_nam'],
            mbti: 'ENTJ',
            mbtiGroup: 'NT',
            mbtiGroupLabel: 'Nhóm Tím · Phân tích (NT)',
            name: 'Thầy Quân',
            displayName: 'Thầy Quân',
            pronoun: 'Thầy',
            gender: 'male',
            age: 40,
            colorHex: '#4B2C82',
            bgTint: '#EFEBF9',
            traits: 'Quyết đoán, dẫn dắt mạnh, đặt kỳ vọng cao',
            outfitDesc: 'Sơ mi trắng, cà vạt tím đậm, tay áo xắn gọn, đứng thẳng, một tay chỉ về phía trước',
            teachingStyle: 'Nhịp nhanh, giao việc rõ ràng, hướng tới kết quả; cần chú ý lắng nghe học sinh theo kịp chậm hơn',
            portraitUrl: 'assets/teachers/03_entj_quan.jpg',
            portraitPrompt: 'Half-body portrait of a Vietnamese school teacher, friendly flat vector illustration with soft shading, facing the viewer, plain light background tinted with #4B2C82, square 1:1, no text, no logo. male teacher, about 40, white shirt with deep purple tie, rolled-up sleeves, confident upright posture, pointing forward',
            hasGlasses: false,
            avatar: '👨‍🏫',
            avatarBg: '#e4b38d',
            shirtColor: '#4B2C82',
            suitColor: 0xF8FAFC,
            tieColor: 0x4B2C82,
            hairStyle: 'male',
            defaultVoiceId: 'male_young',
            voicePitch: 0.88,
            voiceRate: 1.03
        },
        {
            id: 'entp_vy',
            aliasIds: ['co_thao_vy'],
            mbti: 'ENTP',
            mbtiGroup: 'NT',
            mbtiGroupLabel: 'Nhóm Tím · Phân tích (NT)',
            name: 'Cô Vy',
            displayName: 'Cô Vy',
            pronoun: 'Cô',
            gender: 'female',
            age: 28,
            colorHex: '#A57FD6',
            bgTint: '#F6F0FD',
            traits: 'Nhanh nhạy, thích tranh luận, sáng tạo, hay ứng biến',
            outfitDesc: 'Áo khoác ngắn màu tím sáng, tóc ngắn ngang vai, nhướn mày tinh nghịch, tay cầm thẻ câu hỏi',
            teachingStyle: 'Tổ chức tranh luận, đổi hoạt động liên tục, ít bám giáo án; lớp sôi nổi nhưng dễ mất nhịp',
            portraitUrl: 'assets/teachers/04_entp_vy.jpg',
            portraitPrompt: 'Half-body portrait of a Vietnamese school teacher, friendly flat vector illustration with soft shading, facing the viewer, plain light background tinted with #A57FD6, square 1:1, no text, no logo. female teacher, about 28, bright violet cropped jacket, shoulder-length bob, playful raised eyebrow, holding question cards',
            hasGlasses: false,
            avatar: '👩‍🏫',
            avatarBg: '#f6d2b6',
            shirtColor: '#A57FD6',
            suitColor: 0xA57FD6,
            tieColor: 0xFFFFFF,
            hairStyle: 'female',
            defaultVoiceId: 'female_young',
            voicePitch: 1.16,
            voiceRate: 1.04
        },

        // --- NHÓM XANH LÁ – NGOẠI GIAO (NF) ---
        {
            id: 'infj_hanh',
            aliasIds: ['co_giao_ao_dai'],
            mbti: 'INFJ',
            mbtiGroup: 'NF',
            mbtiGroupLabel: 'Nhóm Xanh lá · Ngoại giao (NF)',
            name: 'Cô Hạnh',
            displayName: 'Cô Hạnh',
            pronoun: 'Cô',
            gender: 'female',
            age: 38,
            colorHex: '#4E7D5B',
            bgTint: '#EDF5EF',
            traits: 'Thấu hiểu, sâu sắc, quan tâm từng người, nói nhẹ nhàng',
            outfitDesc: 'Áo dài xanh rêu, tóc dài buộc thấp, tay cầm cuốn sổ nhỏ; ánh mắt ấm áp',
            teachingStyle: 'Gắn bài học với giá trị sống; chú ý cảm xúc học sinh, hay trò chuyện riêng với em gặp khó khăn',
            portraitUrl: 'assets/teachers/05_infj_hanh.jpg',
            portraitPrompt: 'Half-body portrait of a Vietnamese school teacher, friendly flat vector illustration with soft shading, facing the viewer, plain light background tinted with #4E7D5B, square 1:1, no text, no logo. female teacher, about 38, moss green áo dài, long hair tied low, holding a small notebook, warm gentle gaze',
            hasGlasses: false,
            avatar: '👩‍🏫',
            avatarBg: '#f3caa6',
            shirtColor: '#4E7D5B',
            suitColor: 0x4E7D5B,
            tieColor: 0xD1FAE5,
            hairStyle: 'female',
            defaultVoiceId: 'female_young',
            voicePitch: 1.10,
            voiceRate: 0.96
        },
        {
            id: 'infp_an',
            aliasIds: [],
            mbti: 'INFP',
            mbtiGroup: 'NF',
            mbtiGroupLabel: 'Nhóm Xanh lá · Ngoại giao (NF)',
            name: 'Thầy An',
            displayName: 'Thầy An',
            pronoun: 'Thầy',
            gender: 'male',
            age: 27,
            colorHex: '#7FB08A',
            bgTint: '#EFF7F1',
            traits: 'Lý tưởng, nhẹ nhàng, giàu tưởng tượng',
            outfitDesc: 'Sơ mi linen xanh lá nhạt, tóc mềm rủ trán, ôm cuốn truyện tranh tiếng Anh, nụ cười hiền',
            teachingStyle: 'Dùng truyện, thơ, bài hát; tôn trọng cá tính học sinh; ngại kỷ luật cứng rắn',
            portraitUrl: 'assets/teachers/06_infp_an.jpg',
            portraitPrompt: 'Half-body portrait of a Vietnamese school teacher, friendly flat vector illustration with soft shading, facing the viewer, plain light background tinted with #7FB08A, square 1:1, no text, no logo. male teacher, about 27, pale green linen shirt, soft fringe, hugging an English storybook, shy kind smile',
            hasGlasses: false,
            avatar: '👨‍🏫',
            avatarBg: '#f1c6a2',
            shirtColor: '#7FB08A',
            suitColor: 0x7FB08A,
            tieColor: 0xFEF3C7,
            hairStyle: 'male',
            defaultVoiceId: 'male_young',
            voicePitch: 0.95,
            voiceRate: 0.98
        },
        {
            id: 'enfj_phuong',
            aliasIds: [],
            mbti: 'ENFJ',
            mbtiGroup: 'NF',
            mbtiGroupLabel: 'Nhóm Xanh lá · Ngoại giao (NF)',
            name: 'Cô Phương',
            displayName: 'Cô Phương',
            pronoun: 'Cô',
            gender: 'female',
            age: 33,
            colorHex: '#2E8B57',
            bgTint: '#EAF7F0',
            traits: 'Truyền cảm hứng, nhiệt tình, giỏi gắn kết mọi người',
            outfitDesc: 'Váy liền xanh lục bảo, tóc uốn nhẹ, hai tay mở rộng như đang chào cả lớp, cười tươi',
            teachingStyle: 'Khen ngợi cụ thể, xây dựng tinh thần tập thể, giúp từng em thấy mình quan trọng',
            portraitUrl: 'assets/teachers/07_enfj_phuong.jpg',
            portraitPrompt: 'Half-body portrait of a Vietnamese school teacher, friendly flat vector illustration with soft shading, facing the viewer, plain light background tinted with #2E8B57, square 1:1, no text, no logo. female teacher, about 33, emerald green dress, softly curled hair, open welcoming arms, bright smile',
            hasGlasses: false,
            avatar: '👩‍🏫',
            avatarBg: '#f6d2b6',
            shirtColor: '#2E8B57',
            suitColor: 0x2E8B57,
            tieColor: 0xFDE68A,
            hairStyle: 'female',
            defaultVoiceId: 'female_young',
            voicePitch: 1.14,
            voiceRate: 1.02
        },
        {
            id: 'enfp_duy',
            aliasIds: ['thay_giao_nang_dong'],
            mbti: 'ENFP',
            mbtiGroup: 'NF',
            mbtiGroupLabel: 'Nhóm Xanh lá · Ngoại giao (NF)',
            name: 'Thầy Duy',
            displayName: 'Thầy Duy',
            pronoun: 'Thầy',
            gender: 'male',
            age: 26,
            colorHex: '#5DBB63',
            bgTint: '#EEF9EE',
            traits: 'Nhiệt huyết, vui vẻ, nhiều ý tưởng, năng lượng cao',
            outfitDesc: 'Áo polo xanh lá tươi, tóc vênh, đeo dây thẻ nhiều huy hiệu, giơ ngón cái, cười lớn',
            teachingStyle: 'Dạy qua trò chơi và hoạt động vận động; lớp rất vui nhưng đôi khi khó giữ trật tự',
            portraitUrl: 'assets/teachers/08_enfp_duy.jpg',
            portraitPrompt: 'Half-body portrait of a Vietnamese school teacher, friendly flat vector illustration with soft shading, facing the viewer, plain light background tinted with #5DBB63, square 1:1, no text, no logo. male teacher, about 26, bright green polo shirt, spiky hair, lanyard with colorful pins, thumbs up, big grin',
            hasGlasses: false,
            avatar: '👨‍🏫',
            avatarBg: '#efc3a0',
            shirtColor: '#5DBB63',
            suitColor: 0x5DBB63,
            tieColor: 0x38BDF8,
            hairStyle: 'male',
            defaultVoiceId: 'male_young',
            voicePitch: 0.96,
            voiceRate: 1.05
        },

        // --- NHÓM XANH DƯƠNG NGỌC – GIỮ GÌN (SJ) ---
        {
            id: 'istj_hung',
            aliasIds: [],
            mbti: 'ISTJ',
            mbtiGroup: 'SJ',
            mbtiGroupLabel: 'Nhóm Xanh dương ngọc · Giữ gìn (SJ)',
            name: 'Thầy Hùng',
            displayName: 'Thầy Hùng',
            pronoun: 'Thầy',
            gender: 'male',
            age: 45,
            colorHex: '#1F4E79',
            bgTint: '#EAF1F8',
            traits: 'Nghiêm túc, đáng tin cậy, đúng giờ, cẩn thận',
            outfitDesc: 'Vest navy, sơ mi cài kín cổ, tóc cắt gọn, đeo đồng hồ, cầm sổ điểm',
            teachingStyle: 'Bám sát giáo án và nội quy; chấm bài công bằng, nhất quán; ít khi ứng biến',
            portraitUrl: 'assets/teachers/09_istj_hung.jpg',
            portraitPrompt: 'Half-body portrait of a Vietnamese school teacher, friendly flat vector illustration with soft shading, facing the viewer, plain light background tinted with #1F4E79, square 1:1, no text, no logo. male teacher, about 45, navy suit jacket, buttoned-up shirt, short neat hair, wristwatch, holding a grade book, composed serious face',
            hasGlasses: false,
            avatar: '👨‍🏫',
            avatarBg: '#e4b38d',
            shirtColor: '#1F4E79',
            suitColor: 0x1F4E79,
            tieColor: 0xE2E8F0,
            hairStyle: 'male',
            defaultVoiceId: 'male_young',
            voicePitch: 0.86,
            voiceRate: 0.97
        },
        {
            id: 'isfj_lan_anh',
            aliasIds: [],
            mbti: 'ISFJ',
            mbtiGroup: 'SJ',
            mbtiGroupLabel: 'Nhóm Xanh dương ngọc · Giữ gìn (SJ)',
            name: 'Cô Lan Anh',
            displayName: 'Cô Lan Anh',
            pronoun: 'Cô',
            gender: 'female',
            age: 42,
            colorHex: '#5BA4B0',
            bgTint: '#EAF5F7',
            traits: 'Chu đáo, kiên nhẫn, tận tụy, nhớ từng chi tiết',
            outfitDesc: 'Cardigan xanh ngọc nhạt, tóc ngang vai, kẹp tóc nhỏ, tay cầm hộp bút màu phát cho học sinh',
            teachingStyle: 'Hỗ trợ sát sao em yếu, nhắc nhở nhẹ nhàng, tạo cảm giác an toàn trong lớp',
            portraitUrl: 'assets/teachers/10_isfj_lan_anh.svg',
            portraitPrompt: 'Half-body portrait of a Vietnamese school teacher, friendly flat vector illustration with soft shading, facing the viewer, plain light background tinted with #5BA4B0, square 1:1, no text, no logo. female teacher, about 42, light teal cardigan, shoulder-length hair with a small clip, holding a box of colored pencils, patient caring smile',
            hasGlasses: false,
            avatar: '👩‍🏫',
            avatarBg: '#f6d2b6',
            shirtColor: '#5BA4B0',
            suitColor: 0x5BA4B0,
            tieColor: 0xFFFFFF,
            hairStyle: 'female',
            defaultVoiceId: 'female_young',
            voicePitch: 1.09,
            voiceRate: 0.97
        },
        {
            id: 'estj_thao',
            aliasIds: [],
            mbti: 'ESTJ',
            mbtiGroup: 'SJ',
            mbtiGroupLabel: 'Nhóm Xanh dương ngọc · Giữ gìn (SJ)',
            name: 'Cô Thảo',
            displayName: 'Cô Thảo',
            pronoun: 'Cô',
            gender: 'female',
            age: 40,
            colorHex: '#2B5FA8',
            bgTint: '#ECF2FA',
            traits: 'Tổ chức tốt, thẳng thắn, kỷ luật, thực tế',
            outfitDesc: 'Áo sơ mi xanh cobalt sơ vin, tóc buộc đuôi ngựa cao, cầm bảng kẹp giấy và bút, dáng đứng dứt khoát',
            teachingStyle: 'Phân công rõ, kiểm tra tiến độ thường xuyên, lớp nề nếp; đôi khi hơi cứng nhắc',
            portraitUrl: 'assets/teachers/11_estj_thao.jpg',
            portraitPrompt: 'Half-body portrait of a Vietnamese school teacher, friendly flat vector illustration with soft shading, facing the viewer, plain light background tinted with #2B5FA8, square 1:1, no text, no logo. female teacher, about 40, tucked-in cobalt blue shirt, high ponytail, clipboard and pen, decisive stance',
            hasGlasses: false,
            avatar: '👩‍🏫',
            avatarBg: '#f3caa6',
            shirtColor: '#2B5FA8',
            suitColor: 0x2B5FA8,
            tieColor: 0xFFFFFF,
            hairStyle: 'female',
            defaultVoiceId: 'female_young',
            voicePitch: 1.08,
            voiceRate: 1.03
        },
        {
            id: 'esfj_binh',
            aliasIds: [],
            mbti: 'ESFJ',
            mbtiGroup: 'SJ',
            mbtiGroupLabel: 'Nhóm Xanh dương ngọc · Giữ gìn (SJ)',
            name: 'Thầy Bình',
            displayName: 'Thầy Bình',
            pronoun: 'Thầy',
            gender: 'male',
            age: 35,
            colorHex: '#2A8C9A',
            bgTint: '#E9F6F8',
            traits: 'Thân thiện, hòa đồng, quan tâm không khí tập thể',
            outfitDesc: 'Áo sơ mi teal ngắn tay, khuôn mặt tròn phúc hậu, vẫy tay chào, nụ cười thân thiện',
            teachingStyle: 'Xây dựng lớp như một gia đình, giữ hòa khí, lưu ý đến cảm xúc từng em; có thể ngại xử lý xung đột',
            portraitUrl: 'assets/teachers/12_esfj_binh.jpg',
            portraitPrompt: 'Half-body portrait of a Vietnamese school teacher, friendly flat vector illustration with soft shading, facing the viewer, plain light background tinted with #2A8C9A, square 1:1, no text, no logo. male teacher, about 35, short-sleeved teal shirt, round friendly face, waving hello, warm smile',
            hasGlasses: false,
            avatar: '👨‍🏫',
            avatarBg: '#efc3a0',
            shirtColor: '#2A8C9A',
            suitColor: 0x2A8C9A,
            tieColor: 0xE0F2FE,
            hairStyle: 'male',
            defaultVoiceId: 'male_young',
            voicePitch: 0.91,
            voiceRate: 1.00
        },

        // --- NHÓM VÀNG – KHÁM PHÁ (SP) ---
        {
            id: 'istp_tuan',
            aliasIds: [],
            mbti: 'ISTP',
            mbtiGroup: 'SP',
            mbtiGroupLabel: 'Nhóm Vàng · Khám phá (SP)',
            name: 'Thầy Tuấn',
            displayName: 'Thầy Tuấn',
            pronoun: 'Thầy',
            gender: 'male',
            age: 32,
            colorHex: '#C9A227',
            bgTint: '#FBF7E7',
            traits: 'Thực tế, ít lời, bình tĩnh, giỏi xử lý tình huống',
            outfitDesc: 'Áo khoác vải vàng mù tạt khoác ngoài áo thun, tóc cắt ngắn, khoanh tay, ánh mắt quan sát',
            teachingStyle: 'Nói ít, làm mẫu nhiều; cho học sinh tự thực hành; xử lý sự cố gọn và không nóng giận',
            portraitUrl: 'assets/teachers/13_istp_tuan.jpg',
            portraitPrompt: 'Half-body portrait of a Vietnamese school teacher, friendly flat vector illustration with soft shading, facing the viewer, plain light background tinted with #C9A227, square 1:1, no text, no logo. male teacher, about 32, mustard yellow canvas jacket over a T-shirt, short hair, arms crossed, calm observant look',
            hasGlasses: false,
            avatar: '👨‍🏫',
            avatarBg: '#e4b38d',
            shirtColor: '#C9A227',
            suitColor: 0xC9A227,
            tieColor: 0xFFFFFF,
            hairStyle: 'male',
            defaultVoiceId: 'male_young',
            voicePitch: 0.89,
            voiceRate: 0.98
        },
        {
            id: 'isfp_mai',
            aliasIds: [],
            mbti: 'ISFP',
            mbtiGroup: 'SP',
            mbtiGroupLabel: 'Nhóm Vàng · Khám phá (SP)',
            name: 'Cô Mai',
            displayName: 'Cô Mai',
            pronoun: 'Cô',
            gender: 'female',
            age: 29,
            colorHex: '#E8C766',
            bgTint: '#FDF9EC',
            traits: 'Nghệ sĩ, tinh tế, linh hoạt, dịu dàng',
            outfitDesc: 'Áo blouse vàng kem, tóc dài xõa kẹp một bên, cầm tấm tranh minh họa tự vẽ',
            teachingStyle: 'Dùng hình ảnh, âm nhạc, hoạt động thủ công; điều chỉnh theo cảm xúc của lớp',
            portraitUrl: 'assets/teachers/14_isfp_mai.svg',
            portraitPrompt: 'Half-body portrait of a Vietnamese school teacher, friendly flat vector illustration with soft shading, facing the viewer, plain light background tinted with #E8C766, square 1:1, no text, no logo. female teacher, about 29, cream yellow blouse, long loose hair clipped to one side, holding a hand-drawn picture card, gentle smile',
            hasGlasses: false,
            avatar: '👩‍🏫',
            avatarBg: '#f6d2b6',
            shirtColor: '#E8C766',
            suitColor: 0xE8C766,
            tieColor: 0xFFFBEB,
            hairStyle: 'female',
            defaultVoiceId: 'female_young',
            voicePitch: 1.15,
            voiceRate: 0.98
        },
        {
            id: 'estp_long',
            aliasIds: [],
            mbti: 'ESTP',
            mbtiGroup: 'SP',
            mbtiGroupLabel: 'Nhóm Vàng · Khám phá (SP)',
            name: 'Thầy Long',
            displayName: 'Thầy Long',
            pronoun: 'Thầy',
            gender: 'male',
            age: 30,
            colorHex: '#E3A21A',
            bgTint: '#FDF6E6',
            traits: 'Năng động, táo bạo, ứng biến nhanh, thích thử thách',
            outfitDesc: 'Áo khoác thể thao vàng cam, còi đeo cổ, tay cầm đồng hồ bấm giờ, tư thế nghiêng người về phía trước',
            teachingStyle: 'Biến bài học thành thử thách có bấm giờ, phản ứng nhanh với tình huống; ít chuẩn bị trước',
            portraitUrl: 'assets/teachers/15_estp_long.jpg',
            portraitPrompt: 'Half-body portrait of a Vietnamese school teacher, friendly flat vector illustration with soft shading, facing the viewer, plain light background tinted with #E3A21A, square 1:1, no text, no logo. male teacher, about 30, amber sports jacket, whistle around neck, holding a stopwatch, leaning forward energetically',
            hasGlasses: false,
            avatar: '👨‍🏫',
            avatarBg: '#efc3a0',
            shirtColor: '#E3A21A',
            suitColor: 0xE3A21A,
            tieColor: 0x1E293B,
            hairStyle: 'male',
            defaultVoiceId: 'male_young',
            voicePitch: 0.93,
            voiceRate: 1.05
        },
        {
            id: 'esfp_ngoc',
            aliasIds: [],
            mbti: 'ESFP',
            mbtiGroup: 'SP',
            mbtiGroupLabel: 'Nhóm Vàng · Khám phá (SP)',
            name: 'Cô Ngọc',
            displayName: 'Cô Ngọc',
            pronoun: 'Cô',
            gender: 'female',
            age: 27,
            colorHex: '#F2C230',
            bgTint: '#FEF9E7',
            traits: 'Vui nhộn, biểu cảm, hòa đồng, sống trong hiện tại',
            outfitDesc: 'Váy vàng tươi, băng đô vải, cầm con rối tay, biểu cảm cười to',
            teachingStyle: 'Kể chuyện, đóng vai, biến lớp học thành sân khấu; dễ thu hút học sinh nhỏ',
            portraitUrl: 'assets/teachers/16_esfp_ngoc.svg',
            portraitPrompt: 'Half-body portrait of a Vietnamese school teacher, friendly flat vector illustration with soft shading, facing the viewer, plain light background tinted with #F2C230, square 1:1, no text, no logo. female teacher, about 27, bright yellow dress, fabric headband, holding a hand puppet, laughing expressively',
            hasGlasses: false,
            avatar: '👩‍🏫',
            avatarBg: '#f6d2b6',
            shirtColor: '#F2C230',
            suitColor: 0xF2C230,
            tieColor: 0xF97316,
            hairStyle: 'female',
            defaultVoiceId: 'female_young',
            voicePitch: 1.18,
            voiceRate: 1.04
        }
    ];

    const TEACHER_VOICE_MODES = [
        { id: 'female_young', label: 'Giọng nữ, trẻ', pitch: 1.14, rate: 1.02, muteTeacherTts: false },
        { id: 'male_young', label: 'Giọng nam, trẻ', pitch: 0.9, rate: 1.0, muteTeacherTts: false },
        { id: 'real_voice', label: 'Dùng giọng thật của tôi', pitch: 1.0, rate: 1.0, muteTeacherTts: true }
    ];

    // Danh mục cấp học cho Bước 3 (theo mockup PDF trang 3)
    const GRADE_LEVELS = [
        {
            id: 'tieu_hoc',
            label: 'Tiểu học',
            shortTag: 'TIỂU HỌC',
            rangeLabel: 'Lớp 3–5',
            accentHex: '#f59e0b',
            grades: [3, 4, 5],
            defaultGrade: 4,
            bullets: [
                'Câu ngắn, hay chen tiếng Việt',
                'Mất tập trung nhanh, tranh nhau trả lời'
            ],
            scenarioIds: [1],
            defaultGroupId: 'group_org'
        },
        {
            id: 'thcs',
            label: 'Trung học cơ sở',
            shortTag: 'THCS',
            rangeLabel: 'Lớp 6–9',
            accentHex: '#2563eb',
            grades: [6, 7, 8, 9],
            defaultGrade: 7,
            bullets: [
                'Hay thử giới hạn giáo viên',
                'Sợ “quê” trước bạn bè'
            ],
            scenarioIds: [2, 5],
            defaultGroupId: 'group_participation'
        },
        {
            id: 'thpt',
            label: 'Trung học phổ thông',
            shortTag: 'THPT',
            rangeLabel: 'Lớp 10–12',
            accentHex: '#059669',
            grades: [10, 11, 12],
            defaultGrade: 10,
            bullets: [
                'Biết phản biện, đôi khi cãi lý',
                'Quan tâm điểm thi'
            ],
            scenarioIds: [3, 4],
            defaultGroupId: 'group_misbehavior'
        }
    ];

    // 5 Nhóm tình huống cho Bước 4 (khớp 1-1 với 5 kịch bản từ Google Doc + mockup PDF trang 4)
    const SCENARIO_GROUPS = [
        {
            id: 'group_org',
            name: 'Tổ chức và quy trình',
            desc: 'Giao nhiệm vụ, chia nhóm, chuyển hoạt động',
            icon: '📋',
            scriptsLabel: '',
            scenarioIds: [1],
            recommendedGrade: 'tieu_hoc'
        },
        {
            id: 'group_participation',
            name: 'Điều phối sự tham gia',
            desc: 'Lớp im lặng, vài em lấn át, em thụ động',
            icon: '👥',
            scriptsLabel: '',
            scenarioIds: [2],
            recommendedGrade: 'thcs'
        },
        {
            id: 'group_misbehavior',
            name: 'Hành vi lệch chuẩn',
            desc: 'Nói chuyện riêng, dùng điện thoại, chống đối',
            icon: '⚠️',
            scriptsLabel: '',
            scenarioIds: [3],
            recommendedGrade: 'thpt'
        },
        {
            id: 'group_learning_support',
            name: 'Hỗ trợ học tập',
            desc: 'Hiểu sai nhiệm vụ, chênh lệch trình độ',
            icon: '📑',
            scriptsLabel: '',
            scenarioIds: [4],
            recommendedGrade: 'thpt'
        },
        {
            id: 'group_emotion',
            name: 'Quan hệ và cảm xúc',
            desc: 'Học sinh tự ti, bị trêu chọc, phản ứng mạnh',
            icon: '💙',
            scriptsLabel: '',
            scenarioIds: [5],
            recommendedGrade: 'thcs'
        }
    ];

    const DIFFICULTY_LEVELS = [
        { id: 'easy', label: 'Nhẹ', desc: 'Học sinh dễ hợp tác', silenceTimeoutSec: 0 },
        { id: 'medium', label: 'Vừa', desc: 'Có hiệu ứng lan', silenceTimeoutSec: 9 },
        { id: 'hard', label: 'Khó', desc: 'Leo thang nhanh', silenceTimeoutSec: 7 }
    ];

    // Thứ tự 14 bước chia 4 giai đoạn (khớp PDF trang 1–14)
    const MOCKUP_14_STEPS = [
        { step: 1, title: 'Hướng dẫn nhanh', stage: 1, stageLabel: '1 · Chuẩn bị' },
        { step: 2, title: 'Chọn nhân vật giáo viên', stage: 1, stageLabel: '1 · Chuẩn bị' },
        { step: 3, title: 'Chọn cấp học', stage: 1, stageLabel: '1 · Chuẩn bị' },
        { step: 4, title: 'Chọn nhóm tình huống và chế độ', stage: 1, stageLabel: '1 · Chuẩn bị' },
        { step: 5, title: 'Đọc bối cảnh', stage: 1, stageLabel: '1 · Chuẩn bị' },
        { step: 6, title: 'Khởi động tiết học', stage: 2, stageLabel: '2 · Trong lớp học' },
        { step: 7, title: 'Tình huống xuất hiện', stage: 2, stageLabel: '2 · Trong lớp học' },
        { step: 8, title: 'Nhận diện', stage: 2, stageLabel: '2 · Trong lớp học' },
        { step: 9, title: 'Xử lý bằng lời nói', stage: 2, stageLabel: '2 · Trong lớp học' },
        { step: 10, title: 'Kết thúc', stage: 2, stageLabel: '2 · Trong lớp học' },
        { step: 11, title: 'Tự đánh giá', stage: 3, stageLabel: '3 · Phản tư & phản hồi' },
        { step: 12, title: 'Phân tích', stage: 3, stageLabel: '3 · Phản tư & phản hồi' },
        { step: 13, title: 'Câu mẫu gợi ý', stage: 3, stageLabel: '3 · Phản tư & phản hồi' },
        { step: 14, title: 'Tua lại hoặc chuyển tiếp', stage: 4, stageLabel: '4 · Luyện lại' }
    ];

    window.LAW_2025_CRITERIA = LAW_2025_CRITERIA;
    window.SCENARIOS_5 = SCENARIOS_5;
    window.MBTI_GROUPS = MBTI_GROUPS;
    window.TEACHER_PERSONAS = TEACHER_PERSONAS;
    window.TEACHER_VOICE_MODES = TEACHER_VOICE_MODES;
    window.GRADE_LEVELS = GRADE_LEVELS;
    window.SCENARIO_GROUPS = SCENARIO_GROUPS;
    window.DIFFICULTY_LEVELS = DIFFICULTY_LEVELS;
    window.MOCKUP_14_STEPS = MOCKUP_14_STEPS;
})();
