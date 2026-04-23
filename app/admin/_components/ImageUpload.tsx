"use client";
import { useState, useRef, useEffect } from "react";

interface ImageUploadProps {
    label: string;
    value?: string; // URL từ DB hoặc Base64
    onChange: (url: string) => void;
}

export default function ImageUpload({ label, value, onChange }: ImageUploadProps) {
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setPreviewUrl(value || "");
    }, [value]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Tạo URL tạm thời để hiển thị ngay lập tức
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            // Gửi về form (ở đây gửi url tạm, logic xử lý File thật đã làm ở page.tsx)
            onChange(url);
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className="mt-1 flex items-center gap-4">
                {/* Khung hiển thị ảnh */}
                <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-lg border border-gray-300 bg-gray-100 cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                    {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="h-full w-full object-cover transition-opacity group-hover:opacity-80" />
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center text-gray-500 text-xs">
                            <span className="text-2xl">+</span>
                            <span className="mt-1">Chọn ảnh</span>
                        </div>
                    )}
                    {/* Overlay khi hover */}
                    {!previewUrl && (
                        <div className="absolute inset-0 bg-black/10 hidden group-hover:block"></div>
                    )}
                </div>

                {/* Khu vực nút bấm */}
                <div className="flex flex-col justify-center">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mb-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Upload file
                    </button>
                    <p className="text-xs text-gray-500">JPG, PNG, WEBP</p>
                </div>

                {/* Input ẩn */}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />

                {/* Nút xóa nếu có ảnh */}
                {previewUrl && (
                    <button
                        type="button"
                        onClick={() => {
                            setPreviewUrl("");
                            onChange("");
                        }}
                        className="ml-auto text-red-500 text-xs underline"
                    >
                        Xóa
                    </button>
                )}
            </div>
        </div>
    );
}