"use client";
import { useState, useRef } from "react";

interface DocumentUploadProps {
    label: string;
    value?: string;
    onChange: (fileOrUrl: any) => void;
}

export default function DocumentUpload({ label, value, onChange }: DocumentUploadProps) {
    const [fileName, setFileName] = useState<string>("Chưa có file đính kèm");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            const url = URL.createObjectURL(file);
            onChange(url);
        }
    };

    const resetUpload = () => {
        setFileName("Chưa có file đính kèm");
        onChange("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

            <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-slate-100 rounded text-slate-500">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{fileName}</p>
                    <p className="text-xs text-slate-500">PDF, DOC, DOCX...</p>
                </div>

                <div className="flex gap-2">
                    {!fileName.includes("Chưa") && (
                        <button type="button" onClick={(e) => { e.stopPropagation(); resetUpload(); }} className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded">Xóa</button>
                    )}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md"
                    >
                        Tải lên
                    </button>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                />
            </div>
        </div>
    );
}