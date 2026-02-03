"use client";

import { motion } from "framer-motion";
import { FileText, FileImage, FileVideo, FileArchive, Music, FileCode, File } from "lucide-react";

interface FileIconProps {
    filename: string;
    size?: number;
}

export function FileIcon({ filename, size = 24 }: FileIconProps) {
    const ext = filename.split('.').pop()?.toLowerCase() || '';

    const iconMap: Record<string, { icon: any; className: string }> = {
        // Images
        jpg: { icon: FileImage, className: "file-icon-image" },
        jpeg: { icon: FileImage, className: "file-icon-image" },
        png: { icon: FileImage, className: "file-icon-image" },
        gif: { icon: FileImage, className: "file-icon-image" },
        svg: { icon: FileImage, className: "file-icon-image" },
        webp: { icon: FileImage, className: "file-icon-image" },

        // PDFs
        pdf: { icon: FileText, className: "file-icon-pdf" },

        // Archives
        zip: { icon: FileArchive, className: "file-icon-zip" },
        rar: { icon: FileArchive, className: "file-icon-zip" },
        '7z': { icon: FileArchive, className: "file-icon-zip" },
        tar: { icon: FileArchive, className: "file-icon-zip" },
        gz: { icon: FileArchive, className: "file-icon-zip" },

        // Videos
        mp4: { icon: FileVideo, className: "file-icon-video" },
        avi: { icon: FileVideo, className: "file-icon-video" },
        mov: { icon: FileVideo, className: "file-icon-video" },
        mkv: { icon: FileVideo, className: "file-icon-video" },
        webm: { icon: FileVideo, className: "file-icon-video" },

        // Audio
        mp3: { icon: Music, className: "file-icon-audio" },
        wav: { icon: Music, className: "file-icon-audio" },
        flac: { icon: Music, className: "file-icon-audio" },
        m4a: { icon: Music, className: "file-icon-audio" },

        // Documents
        doc: { icon: FileText, className: "file-icon-doc" },
        docx: { icon: FileText, className: "file-icon-doc" },
        txt: { icon: FileText, className: "file-icon-doc" },
        rtf: { icon: FileText, className: "file-icon-doc" },

        // Code
        js: { icon: FileCode, className: "file-icon-doc" },
        ts: { icon: FileCode, className: "file-icon-doc" },
        jsx: { icon: FileCode, className: "file-icon-doc" },
        tsx: { icon: FileCode, className: "file-icon-doc" },
        py: { icon: FileCode, className: "file-icon-doc" },
        java: { icon: FileCode, className: "file-icon-doc" },
    };

    const { icon: Icon, className } = iconMap[ext] || { icon: File, className: "file-icon-default" };

    return <Icon className={`${className}`} size={size} />;
}

interface FileCardProps {
    filename: string;
    roomId: string;
    backendUrl: string;
    index: number;
}

export function FileCard({ filename, roomId, backendUrl, index }: FileCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileTap={{ scale: 0.98 }}
            className="glass rounded-xl p-3 flex items-center gap-3 active:bg-white/5 transition-colors"
        >
            <div className="flex-shrink-0 bg-white/5 p-2 rounded-lg">
                <FileIcon filename={filename} size={20} />
            </div>

            <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-200 truncate pr-2">
                    {filename}
                </p>
            </div>

            <a
                href={`${backendUrl}/download/${roomId}/${filename}`}
                download
                className="flex-shrink-0"
            >
                <button className="w-10 h-10 rounded-lg bg-[#6366f1]/10 text-[#6366f1] hover:bg-[#6366f1]/20 flex items-center justify-center transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                </button>
            </a>
        </motion.div>
    );
}
