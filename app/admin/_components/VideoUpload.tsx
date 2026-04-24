"use client";
import { useState, useRef } from "react";

interface VideoUploadProps {
    label: string;
    value?: string; // URL từ DB hoặc Blob URL tạm
    onChange: (fileOrUrl: any) => void;
}

export default function VideoUpload({ label, value, onChange }: VideoUploadProps) {
    const [previewUrl, setPreviewUrl] = useState<string>(value || "");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("video/")) {
                alert("Vui lòng chọn file video (MP4, AVI...)");
                return;
            }

            // Lưu Blob URL để gửi đi sau khi submit
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            onChange(url);
        }
    };

    const resetUpload = () => {
        setPreviewUrl("");
        onChange("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

            {/* Khung xem trước */}
            <div
                className={`relative w-full h-40 bg-black rounded-xl overflow-hidden cursor-pointer group ${!previewUrl ? 'border border-dashed border-gray-300 flex items-center justify-center' : ''}`}
                onClick={() => fileInputRef.current?.click()}
            >
                {previewUrl ? (
                    <>
                        <video src={previewUrl} controls className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <span className="text-white font-medium bg-black/50 px-3 py-1 rounded">Đang có video</span>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center text-gray-400">
                        <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        <span className="text-xs">Nhấn để chọn Video</span>
                    </div>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="video/mp4,video/x-m4v,*/*"
                    onChange={handleFileChange}
                />
            </div>

            {previewUrl && (
                <div className="mt-2 flex justify-end">
                    <button type="button" onClick={(e) => { e.stopPropagation(); resetUpload(); }} className="text-xs text-red-500 hover:text-red-700 underline">
                        Xóa video hiện tại
                    </button>
                </div>
            )}
        </div>
    );
}