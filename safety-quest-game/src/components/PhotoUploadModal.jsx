import React, { useState, useEffect, useRef } from 'react';
import { triggerQuestAction } from '../utils/questManager';
import { userProfile, storage } from '../utils/storage';

const REQUIRED_PHOTOS = 3;
const MAX_PHOTOS = 5;
const STORAGE_KEY = 'safety_quest_photos';

const getStoredPhotos = () => {
    return storage.get(STORAGE_KEY, []);
};

const savePhotoRecord = (record) => {
    const existing = getStoredPhotos();
    existing.push(record);
    storage.set(STORAGE_KEY, existing);
};

// 이미지를 작은 썸네일로 리사이즈 (localStorage 용량 절약)
const resizeImage = (file, maxSize = 80) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.6));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
};

const PhotoUploadModal = ({ isOpen, onClose, onComplete, role }) => {
    const [photos, setPhotos] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setPhotos([]);
            setShowSuccess(false);
            setError('');
        }
    }, [isOpen]);

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        if (photos.length + files.length > MAX_PHOTOS) {
            setError(`사진은 최대 ${MAX_PHOTOS}장까지 업로드 가능합니다.`);
            setTimeout(() => setError(''), 3000);
            return;
        }

        const newPhotos = [];
        for (const file of files) {
            if (!file.type.startsWith('image/')) continue;
            const thumbnail = await resizeImage(file);
            const previewUrl = URL.createObjectURL(file);
            newPhotos.push({
                id: `photo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                fileName: file.name,
                fileSize: file.size,
                thumbnail,
                previewUrl,
                description: '',
                timestamp: new Date().toISOString()
            });
        }

        setPhotos(prev => [...prev, ...newPhotos]);

        // 파일 입력 리셋
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const updateDescription = (index, description) => {
        setPhotos(prev => prev.map((p, i) => i === index ? { ...p, description } : p));
    };

    const removePhoto = (index) => {
        setPhotos(prev => {
            const removed = prev[index];
            if (removed.previewUrl) URL.revokeObjectURL(removed.previewUrl);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSubmit = async () => {
        if (photos.length < REQUIRED_PHOTOS) return;

        setIsSubmitting(true);
        setError('');

        await new Promise(resolve => setTimeout(resolve, 800));

        const record = {
            id: `photo_record_${Date.now()}`,
            submittedAt: new Date().toISOString(),
            submittedBy: userProfile.getName() || '작업자',
            photos: photos.map(({ id, fileName, thumbnail, description, timestamp }) => ({
                id, fileName, thumbnail, description, timestamp
            }))
        };

        savePhotoRecord(record);

        // 업로드한 사진 수만큼 퀘스트 진행
        triggerQuestAction('upload_photo', role || 'technician', photos.length);

        setIsSubmitting(false);
        setShowSuccess(true);

        // 프리뷰 URL 정리
        photos.forEach(p => { if (p.previewUrl) URL.revokeObjectURL(p.previewUrl); });

        setTimeout(() => {
            if (onComplete) onComplete();
            onClose();
        }, 2500);
    };

    if (!isOpen) return null;

    const canSubmit = photos.length >= REQUIRED_PHOTOS && !isSubmitting;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 2000,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            backdropFilter: 'blur(5px)'
        }}>
            {showSuccess ? (
                <div style={{ textAlign: 'center', color: '#fff' }}>
                    <div style={{
                        width: '150px', height: '150px',
                        border: '4px solid #00ff88', borderRadius: '50%',
                        margin: '0 auto 2rem',
                        boxShadow: '0 0 30px #00ff88',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '4rem',
                        animation: 'pulse 1.5s infinite'
                    }}>📸</div>
                    <h1 style={{ fontSize: '2.5rem', textShadow: '0 0 20px #00ff88', marginBottom: '1rem' }}>
                        사진 업로드 완료!
                    </h1>
                    <div style={{ fontSize: '1.2rem', color: '#00ff88' }}>
                        현장 사진 {photos.length}장을 기록했습니다 (+150P)
                    </div>
                </div>
            ) : (
                <div style={{
                    position: 'relative',
                    width: '95%', maxWidth: '700px', maxHeight: '90vh',
                    backgroundColor: '#1a1a2e',
                    border: '1px solid #4a4e69',
                    borderRadius: '10px',
                    display: 'flex', flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 0 50px rgba(0,0,0,0.5)'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '1rem 1.5rem',
                        borderBottom: '1px solid #4a4e69',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: 'rgba(255,255,255,0.05)',
                        flexShrink: 0
                    }}>
                        <div>
                            <h2 style={{ color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                📸 현장 사진 기록
                                <span style={{ fontSize: '0.8rem', background: '#333', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#aaa' }}>
                                    Daily Quest
                                </span>
                            </h2>
                            <p style={{ color: '#aaa', margin: '0.5rem 0 0', fontSize: '0.85rem' }}>
                                현장 사진을 촬영하여 안전 기록을 남기세요. ({photos.length}/{REQUIRED_PHOTOS}장, 최대 {MAX_PHOTOS}장)
                            </p>
                        </div>
                        <button onClick={onClose} style={{
                            background: 'none', border: 'none', color: '#fff', fontSize: '2rem', cursor: 'pointer'
                        }}>×</button>
                    </div>

                    {/* Body */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                        {/* 업로드 버튼 */}
                        {photos.length < MAX_PHOTOS && (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    border: '2px dashed #4a4e69',
                                    borderRadius: '12px',
                                    padding: '2rem',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    marginBottom: '1.5rem',
                                    transition: 'all 0.2s ease',
                                    background: 'rgba(139, 92, 246, 0.05)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#8b5cf6';
                                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#4a4e69';
                                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.05)';
                                }}
                            >
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📷</div>
                                <div style={{ color: '#8b5cf6', fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>
                                    사진 촬영 / 파일 선택
                                </div>
                                <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                    탭하여 카메라 또는 갤러리에서 선택
                                </div>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            multiple
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />

                        {/* 진행 바 */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                marginBottom: '0.5rem'
                            }}>
                                <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>업로드 진행</span>
                                <span style={{
                                    color: photos.length >= REQUIRED_PHOTOS ? '#00ff88' : '#fbbf24',
                                    fontSize: '0.85rem', fontWeight: 700
                                }}>
                                    {photos.length} / {REQUIRED_PHOTOS}장
                                </span>
                            </div>
                            <div style={{
                                height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden'
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${Math.min(100, (photos.length / REQUIRED_PHOTOS) * 100)}%`,
                                    background: photos.length >= REQUIRED_PHOTOS
                                        ? 'linear-gradient(90deg, #00ff88, #00cc6a)'
                                        : 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                                    borderRadius: '3px',
                                    transition: 'width 0.3s ease'
                                }} />
                            </div>
                        </div>

                        {/* 사진 목록 */}
                        {photos.length === 0 ? (
                            <div style={{
                                textAlign: 'center', padding: '2rem', color: '#64748b'
                            }}>
                                아직 업로드된 사진이 없습니다
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {photos.map((photo, index) => (
                                    <div key={photo.id} style={{
                                        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                                        padding: '0.75rem',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid #333',
                                        borderRadius: '8px'
                                    }}>
                                        {/* 썸네일 */}
                                        <div style={{
                                            width: '80px', height: '80px', flexShrink: 0,
                                            borderRadius: '6px', overflow: 'hidden',
                                            border: '1px solid #444'
                                        }}>
                                            <img
                                                src={photo.previewUrl || photo.thumbnail}
                                                alt={`사진 ${index + 1}`}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>

                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                marginBottom: '0.4rem'
                                            }}>
                                                <span style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600 }}>
                                                    사진 #{index + 1}
                                                </span>
                                                <button
                                                    onClick={() => removePhoto(index)}
                                                    style={{
                                                        background: 'rgba(255, 68, 68, 0.15)',
                                                        border: '1px solid rgba(255, 68, 68, 0.3)',
                                                        color: '#ff6b6b', borderRadius: '4px',
                                                        padding: '0.2rem 0.5rem', cursor: 'pointer',
                                                        fontSize: '0.75rem'
                                                    }}
                                                >
                                                    삭제
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                value={photo.description}
                                                onChange={(e) => updateDescription(index, e.target.value)}
                                                placeholder="사진 설명 (예: 2구역 비계 상태)"
                                                style={{
                                                    width: '100%', padding: '0.4rem 0.5rem',
                                                    background: '#0f0f23', border: '1px solid #333',
                                                    borderRadius: '4px', color: '#cbd5e1',
                                                    fontSize: '0.8rem'
                                                }}
                                            />
                                            <div style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '0.25rem' }}>
                                                {photo.fileName} · {new Date(photo.timestamp).toLocaleTimeString('ko-KR')}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{
                        padding: '1rem 1.5rem',
                        borderTop: '1px solid #4a4e69',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: 'rgba(255,255,255,0.05)',
                        flexShrink: 0
                    }}>
                        <div style={{ color: '#ff4444', fontWeight: 'bold', fontSize: '0.85rem', height: '1.5rem' }}>
                            {error}
                            {!error && photos.length < REQUIRED_PHOTOS && (
                                <span style={{ color: '#aaa' }}>
                                    {REQUIRED_PHOTOS - photos.length}장 더 촬영해주세요
                                </span>
                            )}
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={!canSubmit}
                            style={{
                                padding: '0.8rem 2rem',
                                background: canSubmit ? 'linear-gradient(45deg, #00ff88, #00cc6a)' : '#333',
                                color: canSubmit ? '#000' : '#666',
                                border: 'none', borderRadius: '30px',
                                fontWeight: 'bold', fontSize: '1rem',
                                cursor: canSubmit ? 'pointer' : 'not-allowed',
                                boxShadow: canSubmit ? '0 0 20px rgba(0, 255, 136, 0.4)' : 'none',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {isSubmitting ? '제출 중...' : '사진 기록 제출'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PhotoUploadModal;
