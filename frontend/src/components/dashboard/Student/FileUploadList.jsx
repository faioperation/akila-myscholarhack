"use client";
import { Icon } from "@iconify/react";

export default function FileUploadList({ files, onRemove }) {
    if (files.length === 0) return null;

    return (
        <div className="mb-6 space-y-2">
            <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Files:</p>
            {files.map((file, index) => (
                <div key={index} className="flex items-center gap-3 bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg">
                    <Icon
                        icon={file.type === 'application/pdf' ? 'mdi:file-pdf-box' : 'mdi:image'}
                        width={24}
                        height={24}
                        className={file.type === 'application/pdf' ? 'text-red-500' : 'text-blue-500'}
                    />
                    <span className="text-sm text-gray-700 flex-1 truncate">{file.name}</span>
                    <button
                        onClick={() => onRemove(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <Icon icon="mdi:close-circle" width={20} height={20} />
                    </button>
                </div>
            ))}
        </div>
    );
}
