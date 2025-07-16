"use client";
import { Icon } from "@iconify/react";
import { useRef, useState } from "react";

export default function AudioPlayer({ audioURL, recordingTime, onDelete }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    if (!audioURL) return null;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const togglePlayAudio = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    return (
        <div className="mb-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                    <Icon icon="mdi:microphone" width={20} height={20} className="text-blue-600" />
                    <span className="text-sm font-semibold text-blue-700">Recorded Audio</span>
                    <span className="text-sm font-mono text-blue-600">{formatTime(recordingTime)}</span>
                </div>

                <audio
                    ref={audioRef}
                    src={audioURL}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                />

                <div className="flex items-center gap-2">
                    <button
                        onClick={togglePlayAudio}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                        <Icon icon={isPlaying ? "mdi:pause" : "mdi:play"} width={18} height={18} />
                        {isPlaying ? 'Pause' : 'Play'}
                    </button>
                    <button
                        onClick={onDelete}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                    >
                        <Icon icon="mdi:delete" width={18} height={18} />
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
