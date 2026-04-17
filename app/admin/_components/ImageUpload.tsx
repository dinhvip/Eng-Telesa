"use client";

import React, { useRef } from "react";

interface ImageUploadProps {
    label?: string;
    value?: string;
    onChange: (imageUrl: string, file?: File) => void;
    className?: string;
}

export default function ImageUpload({
    label,
    value,
    onChange,
    className = "",
}: ImageUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Tạo URL tạm thời để preview
        const imageUrl = URL.createObjectURL(file);

        // Trả về cả URL (để hiển thị) và File thật (để form có thể gửi lên API nếu cần)
        onChange(imageUrl, file);
    };

    const handleRemove = () => {
        onChange(""); // Xóa ảnh
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Reset input type file
        }
    };

    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                </label>
            )}
            <div className="flex items-center gap-4">
                {value ? (
                    <div className="relative w-20 h-20 group">
                        <img
                            src={value}
                            alt="Preview"
                            className="w-20 h-20 object-cover rounded-lg border border-gray-200 bg-white"
                        />
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove image"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <div className="w-20 h-20 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}

                {/* Nút bấm giả lập hành vi click vào thẻ input file bị ẩn */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9e005a]"
                >
                    {value ? "Change Image" : "Upload Image"}
                </button>

                {/* Input file bị ẩn */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>
        </div>
    );
}