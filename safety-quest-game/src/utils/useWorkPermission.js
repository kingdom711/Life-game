import { useState, useCallback } from 'react';
import { checkWorkPermission } from './educationManager';

/**
 * 작업 권한 체크 커스텀 훅
 * 
 * 사용 예시:
 * ```jsx
 * const { hasPermission, showModal, checkPermission, closeModal, educationInfo } = useWorkPermission();
 * 
 * const handleSubmitChecklist = () => {
 *     if (!checkPermission()) {
 *         return; // 교육 미완료 시 모달 표시
 *     }
 *     // 체크리스트 제출 로직
 * };
 * 
 * return (
 *     <>
 *         <button onClick={handleSubmitChecklist}>체크리스트 제출</button>
 *         <EducationRequiredModal 
 *             isOpen={showModal} 
 *             onClose={closeModal}
 *             educationInfo={educationInfo}
 *         />
 *     </>
 * );
 * ```
 */
const useWorkPermission = () => {
    const [showModal, setShowModal] = useState(false);
    const [educationInfo, setEducationInfo] = useState(null);

    /**
     * 작업 권한 체크
     * @returns {boolean} 권한이 있으면 true, 없으면 false (모달 표시)
     */
    const checkPermission = useCallback(() => {
        const result = checkWorkPermission();
        
        if (result.hasPermission) {
            return true;
        }

        // 교육 정보 저장 및 모달 표시
        setEducationInfo(result.education);
        setShowModal(true);
        return false;
    }, []);

    /**
     * 모달 닫기
     */
    const closeModal = useCallback(() => {
        setShowModal(false);
    }, []);

    /**
     * 현재 권한 상태 조회 (모달 표시 없이)
     */
    const hasPermission = useCallback(() => {
        const result = checkWorkPermission();
        return result.hasPermission;
    }, []);

    return {
        hasPermission: hasPermission(),
        showModal,
        checkPermission,
        closeModal,
        educationInfo
    };
};

export default useWorkPermission;
