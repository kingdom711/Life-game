import { useEffect, useMemo, useState } from 'react';
import '../../styles/pages/hazard-cycle.css';

function CameraCapture({ onCapture, initialFile = null, title = '위험 사진 촬영/업로드' }) {
    const [file, setFile] = useState(initialFile);

    useEffect(() => {
        setFile(initialFile);
    }, [initialFile]);

    const previewUrl = useMemo(() => {
        if (!file) return null;
        return URL.createObjectURL(file);
    }, [file]);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const handleFileChange = (event) => {
        const selected = event.target.files?.[0];
        if (!selected) return;
        setFile(selected);
        if (onCapture) onCapture(selected);
    };

    return (
        <div className="hazard-camera">
            <h3>{title}</h3>

            <label className="btn btn-primary hazard-photo-picker">
                사진 선택
                <input
                    type="file"
                    aria-label={title}
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                />
            </label>

            {previewUrl && (
                <div className="hazard-photo-preview">
                    <img src={previewUrl} alt="선택한 현장 사진" />
                </div>
            )}
        </div>
    );
}

export default CameraCapture;
