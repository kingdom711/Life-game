import { useState, useEffect } from 'react';
import { 
    getEducationStats, 
    getLegalHoursProgress,
    generateCertificate 
} from '../utils/educationManager';
import { educationHistory } from '../utils/storage';
import { CATEGORY_INFO } from '../data/educationData';

/**
 * 교육 이력 및 증명서 모달
 * 
 * 기능:
 * - 완료한 교육 목록 표시
 * - 법정 교육 시간 진행 상황
 * - 이수 증명서 생성 및 다운로드
 */
const EducationHistoryModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('history'); // 'history' | 'certificate'
    const [stats, setStats] = useState(null);
    const [history, setHistory] = useState([]);
    const [certificate, setCertificate] = useState(null);
    const [certificateError, setCertificateError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    const loadData = () => {
        // 통계 로드
        const statsData = getEducationStats();
        setStats(statsData);

        // 이력 로드
        const historyData = educationHistory.getRecent(50);
        setHistory(historyData);
    };

    // 증명서 생성
    const handleGenerateCertificate = () => {
        const result = generateCertificate();
        if (result.success) {
            setCertificate(result.certificate);
            setCertificateError(null);
        } else {
            setCertificate(null);
            setCertificateError(result.message);
        }
    };

    // 증명서 다운로드 (HTML → 이미지/PDF)
    const handleDownloadCertificate = () => {
        if (!certificate) return;

        // 간단한 HTML 증명서 생성
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>안전 교육 이수 증명서</title>
    <style>
        body { font-family: 'Malgun Gothic', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
        .certificate { border: 3px double #2563eb; padding: 40px; background: linear-gradient(135deg, #f8fafc, #e2e8f0); }
        .header { text-align: center; margin-bottom: 30px; }
        .title { font-size: 28px; font-weight: bold; color: #1e40af; margin-bottom: 10px; }
        .subtitle { color: #64748b; }
        .content { margin: 30px 0; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
        .info-label { color: #64748b; }
        .info-value { font-weight: bold; color: #1e293b; }
        .status { text-align: center; margin: 30px 0; padding: 20px; background: #dcfce7; border-radius: 10px; }
        .status-text { color: #16a34a; font-size: 20px; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 12px; }
        .cert-id { font-family: monospace; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="header">
            <div class="title">🏆 안전 교육 이수 증명서</div>
            <div class="subtitle">Safety Education Completion Certificate</div>
        </div>
        
        <div class="content">
            <div class="info-row">
                <span class="info-label">성명</span>
                <span class="info-value">${certificate.userName}</span>
            </div>
            ${certificate.companyName ? `
            <div class="info-row">
                <span class="info-label">소속</span>
                <span class="info-value">${certificate.companyName}</span>
            </div>` : ''}
            <div class="info-row">
                <span class="info-label">총 교육 시간</span>
                <span class="info-value">${certificate.totalEducationHours}시간</span>
            </div>
            <div class="info-row">
                <span class="info-label">이수 과목 수</span>
                <span class="info-value">${certificate.completedCourses}개</span>
            </div>
            <div class="info-row">
                <span class="info-label">평균 점수</span>
                <span class="info-value">${certificate.averageScore}점</span>
            </div>
            <div class="info-row">
                <span class="info-label">유효 연도</span>
                <span class="info-value">${certificate.validYear}년</span>
            </div>
        </div>
        
        <div class="status">
            <div class="status-text">✓ 법정 의무 교육 이수 완료</div>
            <div style="color: #16a34a; margin-top: 5px;">
                (${certificate.legalRequirement.required}시간 기준 충족)
            </div>
        </div>
        
        <div class="footer">
            <div>발급일: ${new Date(certificate.issueDate).toLocaleDateString('ko-KR')}</div>
            <div class="cert-id">증명서 번호: ${certificate.certificateId}</div>
        </div>
    </div>
</body>
</html>`;

        // Blob으로 다운로드
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `안전교육_이수증명서_${certificate.validYear}_${certificate.userName}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // 날짜 포맷
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1200] p-4">
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-700">
                {/* 헤더 */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center">
                    <h2 className="text-white font-bold text-lg flex items-center gap-2">
                        <span>📜</span>
                        <span>교육 이력 & 증명서</span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* 탭 메뉴 */}
                <div className="flex border-b border-gray-700">
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-3 font-medium transition-colors ${
                            activeTab === 'history'
                                ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800/50'
                                : 'text-gray-400 hover:text-gray-300'
                        }`}
                    >
                        교육 이력
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('certificate');
                            handleGenerateCertificate();
                        }}
                        className={`flex-1 py-3 font-medium transition-colors ${
                            activeTab === 'certificate'
                                ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800/50'
                                : 'text-gray-400 hover:text-gray-300'
                        }`}
                    >
                        이수 증명서
                    </button>
                </div>

                <div className="p-4 overflow-y-auto max-h-[60vh]">
                    {/* 통계 요약 */}
                    {stats && (
                        <div className="grid grid-cols-4 gap-3 mb-6">
                            <div className="bg-gray-800/50 rounded-xl p-3 text-center">
                                <div className="text-2xl font-bold text-blue-400">{stats.totalCompleted}</div>
                                <div className="text-xs text-gray-500">총 완료</div>
                            </div>
                            <div className="bg-gray-800/50 rounded-xl p-3 text-center">
                                <div className="text-2xl font-bold text-green-400">{stats.thisMonthCompleted}</div>
                                <div className="text-xs text-gray-500">이번 달</div>
                            </div>
                            <div className="bg-gray-800/50 rounded-xl p-3 text-center">
                                <div className="text-2xl font-bold text-purple-400">{stats.avgScore}점</div>
                                <div className="text-xs text-gray-500">평균 점수</div>
                            </div>
                            <div className="bg-gray-800/50 rounded-xl p-3 text-center">
                                <div className="text-2xl font-bold text-orange-400">{stats.educationStreak}일</div>
                                <div className="text-xs text-gray-500">연속 교육</div>
                            </div>
                        </div>
                    )}

                    {/* 교육 이력 탭 */}
                    {activeTab === 'history' && (
                        <div className="space-y-3">
                            {history.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-5xl mb-4">📚</div>
                                    <p className="text-gray-400">아직 완료한 교육이 없습니다.</p>
                                    <p className="text-gray-500 text-sm mt-2">
                                        오늘의 안전 교육을 시작해보세요!
                                    </p>
                                </div>
                            ) : (
                                history.map((record) => {
                                    const catInfo = CATEGORY_INFO[record.category];
                                    return (
                                        <div 
                                            key={record.id}
                                            className="bg-gray-800/50 rounded-xl p-4 border border-gray-700"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                                                    style={{ backgroundColor: `${catInfo?.color}20` }}
                                                >
                                                    {catInfo?.icon || '📚'}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-white font-medium">{record.title}</h4>
                                                    <div className="flex items-center gap-3 mt-1 text-sm">
                                                        <span className="text-gray-500">
                                                            {formatDate(record.completedAt)}
                                                        </span>
                                                        <span className="text-gray-600">•</span>
                                                        <span className="text-purple-400">
                                                            {record.quizScore}점
                                                        </span>
                                                        <span className="text-gray-600">•</span>
                                                        <span className="text-yellow-400">
                                                            +{record.pointsEarned}P
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-green-400">
                                                    ✓
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* 이수 증명서 탭 */}
                    {activeTab === 'certificate' && (
                        <div>
                            {certificateError ? (
                                <div className="text-center py-12">
                                    <div className="text-5xl mb-4">📋</div>
                                    <p className="text-orange-400 font-medium">{certificateError}</p>
                                    <p className="text-gray-500 text-sm mt-2">
                                        법정 교육 시간을 충족하면 증명서를 발급받을 수 있습니다.
                                    </p>
                                    
                                    {/* 진행률 표시 */}
                                    {stats?.legalProgress && (
                                        <div className="mt-6 max-w-sm mx-auto">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-500">현재 진행률</span>
                                                <span className="text-blue-400 font-bold">
                                                    {stats.legalProgress.currentYearHours}h / {stats.legalProgress.requiredHours}h
                                                </span>
                                            </div>
                                            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                                                    style={{ width: `${stats.legalProgress.completionRate}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : certificate ? (
                                <div>
                                    {/* 증명서 미리보기 */}
                                    <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl p-6 border-2 border-dashed border-blue-500/50 mb-6">
                                        <div className="text-center mb-6">
                                            <div className="text-4xl mb-2">🏆</div>
                                            <h3 className="text-xl font-bold text-white">안전 교육 이수 증명서</h3>
                                            <p className="text-gray-400 text-sm">Safety Education Completion Certificate</p>
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex justify-between py-2 border-b border-gray-700">
                                                <span className="text-gray-400">성명</span>
                                                <span className="text-white font-medium">{certificate.userName}</span>
                                            </div>
                                            {certificate.companyName && (
                                                <div className="flex justify-between py-2 border-b border-gray-700">
                                                    <span className="text-gray-400">소속</span>
                                                    <span className="text-white font-medium">{certificate.companyName}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between py-2 border-b border-gray-700">
                                                <span className="text-gray-400">총 교육 시간</span>
                                                <span className="text-blue-400 font-bold">{certificate.totalEducationHours}시간</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-gray-700">
                                                <span className="text-gray-400">이수 과목</span>
                                                <span className="text-white font-medium">{certificate.completedCourses}개</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-gray-700">
                                                <span className="text-gray-400">평균 점수</span>
                                                <span className="text-purple-400 font-medium">{certificate.averageScore}점</span>
                                            </div>
                                        </div>

                                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                                            <div className="text-green-400 font-bold flex items-center justify-center gap-2">
                                                <span>✓</span>
                                                <span>법정 의무 교육 이수 완료</span>
                                            </div>
                                        </div>

                                        <div className="text-center mt-4">
                                            <p className="text-gray-500 text-sm">
                                                발급일: {formatDate(certificate.issueDate)}
                                            </p>
                                            <p className="text-gray-600 text-xs font-mono mt-1">
                                                {certificate.certificateId}
                                            </p>
                                        </div>
                                    </div>

                                    {/* 다운로드 버튼 */}
                                    <button
                                        onClick={handleDownloadCertificate}
                                        className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        <span>📥</span>
                                        <span>증명서 다운로드</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="animate-spin text-4xl mb-4">⏳</div>
                                    <p className="text-gray-400">증명서 생성 중...</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EducationHistoryModal;
