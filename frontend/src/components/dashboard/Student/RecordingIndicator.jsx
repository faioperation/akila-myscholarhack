"use client";
import { Icon } from "@iconify/react";

export default function RecordingIndicator({
    isRecording,
    isPaused,
    recordingTime,
    onTogglePause
}) {
    if (!isRecording) return null;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className={`w-3 h-3 bg-red-500 rounded-full ${!isPaused && 'animate-pulse'}`}></div>
                    <span className="text-sm font-semibold text-red-700">
                        {isPaused ? 'Paused' : 'Recording'}
                    </span>
                    <span className="text-sm font-mono text-red-600">{formatTime(recordingTime)}</span>
                </div>

                <button
                    onClick={onTogglePause}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                    <Icon icon={isPaused ? "mdi:play" : "mdi:pause"} width={18} height={18} />
                    {isPaused ? 'Resume' : 'Pause'}
                </button>
            </div>
        </div>
    );
}
