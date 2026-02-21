import { useState } from 'react';
import CameraCapture from './CameraCapture';

function CompletionUpload({ onUpload, loading = false }) {
    const [file, setFile] = useState(null);
    const [note, setNote] = useState('');

    const submit = () => {
        if (!file || loading) return;
        onUpload(file, note);
    };

    return (
        <div className="space-y-4 rounded-2xl border border-slate-700/60 bg-slate-900/70 p-5">
            <CameraCapture onCapture={setFile} title="조치 완료 사진 업로드" />

            <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={2000}
                rows={3}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500"
                placeholder="조치 내용을 입력하세요 (선택)"
            />

            <button
                onClick={submit}
                disabled={!file || loading}
                className="w-full rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-700"
            >
                {loading ? '업로드 중...' : '조치 완료 제출'}
            </button>
        </div>
    );
}

export default CompletionUpload;
