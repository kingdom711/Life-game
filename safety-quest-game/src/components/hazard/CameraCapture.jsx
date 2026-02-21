import { useEffect, useMemo, useState } from 'react';

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
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-200">{title}</h3>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">
                사진 선택
                <input
                    className="hidden"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                />
            </label>

            {previewUrl && (
                <div className="mt-4 overflow-hidden rounded-xl border border-slate-700">
                    <img src={previewUrl} alt="preview" className="h-52 w-full object-cover" />
                </div>
            )}
        </div>
    );
}

export default CameraCapture;
