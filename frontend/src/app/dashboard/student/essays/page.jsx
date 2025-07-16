"use client";
import { Icon } from "@iconify/react";
import { useState, useRef, useEffect } from "react";
import LoadingModal from "@/components/dashboard/Student/LoadingModal";
import EssayResultModal from "@/components/dashboard/Student/EssayResultModal";
import ConfirmationModal from "@/components/dashboard/Student/ConfirmationModal";
import FileUploadList from "@/components/dashboard/Student/FileUploadList";
import RecordingIndicator from "@/components/dashboard/Student/RecordingIndicator";
import AudioPlayer from "@/components/dashboard/Student/AudioPlayer";
import { useRouter } from "next/navigation";
import { apiPost, apiGet } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getAccessToken } from "@/lib/auth-storage";

const STUDENT_INSTRUCTION_SEEN_KEY = "student_essay_instruction_seen_token";

function StudentInstructionModal({ isOpen, onClose, instruction, onCopyPrompt, isCopied }) {
    if (!isOpen || !instruction) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto scrollbar-hide bg-black/40 px-4 py-6 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="scrollbar-hide relative my-auto w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[32px] border border-white/60 bg-white/95 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.18)] sm:p-8"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-28 rounded-t-[32px] bg-gradient-to-r from-[#FFF6D8] via-[#FFF1B8] to-[#FFE4A3]" />
                <button
                    onClick={onClose}
                    className="absolute right-5 top-5 rounded-full border border-white/70 bg-white/80 p-2 text-gray-500 shadow-sm transition hover:bg-white hover:text-gray-700"
                    aria-label="Close instruction modal"
                >
                    <Icon icon="mdi:close" width={22} height={22} />
                </button>

                <div className="relative mb-6 pr-10">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/85 px-4 py-2 text-sm font-medium text-amber-700 shadow-sm">
                        <Icon icon="mdi:lightbulb-on-outline" width={18} height={18} />
                        Essay instruction
                    </div>
                    <h2 className="text-2xl font-bold text-[#2D3748]">
                        {instruction.title || "Student Instruction"}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[#718096]">
                        Read this once before generating your essay. You can reopen it any time from the
                        top-right button.
                    </p>
                </div>

                <div className="space-y-5">
                    <div className="rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 shadow-sm">
                        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#4A5568]">
                            Instruction
                        </h3>
                        <p className="text-[15px] leading-7 text-[#2D3748]">
                            {instruction.instructionText}
                        </p>
                    </div>

                    <div className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
                        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#4A5568]">
                                Prompt
                            </h3>
                            <button
                                onClick={onCopyPrompt}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#F6C844] via-[#F4B942] to-[#F59E0B] px-4 py-2 text-sm font-semibold text-[#2D3748] transition hover:opacity-90"
                            >
                                <Icon icon={isCopied ? "mdi:check" : "mdi:content-copy"} width={18} height={18} />
                                {isCopied ? "Copied" : "Copy Prompt"}
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={onCopyPrompt}
                            className="w-full rounded-2xl border border-dashed border-[#D6DEE8] bg-[#F8FAFC] p-4 text-left transition hover:border-[#F6C844] hover:bg-[#FFF9E8]"
                        >
                            <p className="whitespace-pre-wrap break-words text-[15px] leading-7 text-[#2D3748]">
                                {instruction.instructionPrompt}
                            </p>
                            <span className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#B7791F]">
                                <Icon icon="mdi:gesture-tap" width={16} height={16} />
                                Tap anywhere in this box to copy the prompt
                            </span>
                        </button>
                    </div>

                    <div className="rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 shadow-sm">
                        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#4A5568]">
                            About Scholarship
                        </h3>
                        <p className="text-[15px] leading-7 text-[#2D3748]">
                            {instruction.aboutScholarshipText}
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end border-t border-[#EDF2F7] pt-5">
                    <button
                        onClick={onClose}
                        className="rounded-full bg-[#2D3748] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#1F2937]"
                    >
                        Start Writing
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Essays() {
    const [essayPrompt, setEssayPrompt] = useState("");
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioURL, setAudioURL] = useState(null);
    const [showLoadingModal, setShowLoadingModal] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [showEssayModal, setShowEssayModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [generatedEssay, setGeneratedEssay] = useState("");
    const [generatedSubject, setGeneratedSubject] = useState("");
    const [generatedEssayId, setGeneratedEssayId] = useState(null);
    const [activeScholarship, setActiveScholarship] = useState(null);
    const [showInstructionModal, setShowInstructionModal] = useState(false);
    const [isPromptCopied, setIsPromptCopied] = useState(false);
    const navigation = useRouter()

    const fileInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingIntervalRef = useRef(null);
    const streamRef = useRef(null);
    const progressIntervalRef = useRef(null);

    const { data: instructionResponse, isLoading: isInstructionLoading } = useQuery({
        queryKey: ["student-instruction"],
        queryFn: () => apiGet("/student-instruction"),
        retry: false,
    });

    const studentInstruction = instructionResponse?.success ? instructionResponse.data : null;
    const promptCharacterCount = essayPrompt.trim().length;

    useEffect(() => {
        return () => {
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Check for active scholarship from Apply Now
    useEffect(() => {
        const storedScholarship = localStorage.getItem("selected_scholarship_for_application");
        if (storedScholarship) {
            const scholarship = JSON.parse(storedScholarship);
            setActiveScholarship(scholarship);

            // Optionally pre-fill prompt if empty
            setEssayPrompt(prev => prev || `Write an essay for the "${scholarship.title}" provided by ${scholarship.provider}. Description: ${scholarship.description || "N/A"}`);
        }

        // Check for returning from Edit Essay page
        const isEdited = localStorage.getItem("essay_edited");
        if (isEdited) {
            const editedEssayData = localStorage.getItem("essay_to_edit");
            if (editedEssayData) {
                const { essay, subject, id } = JSON.parse(editedEssayData);
                setGeneratedEssay(essay);
                setGeneratedSubject(subject);
                if (id) setGeneratedEssayId(id);
                // Re-open the modal with updated data
                setShowEssayModal(true);
            }
            // Clear flag
            localStorage.removeItem("essay_edited");
        }
    }, []);

    useEffect(() => {
        if (!studentInstruction) return;

        const accessToken = getAccessToken();
        const seenForToken = localStorage.getItem(STUDENT_INSTRUCTION_SEEN_KEY);
        const currentLoginKey = accessToken || "logged-in-user";

        if (seenForToken !== currentLoginKey) {
            setShowInstructionModal(true);
            localStorage.setItem(STUDENT_INSTRUCTION_SEEN_KEY, currentLoginKey);
        }
    }, [studentInstruction]);

    const handleFileUpload = (event) => {
        const files = Array.from(event.target.files);
        const validFiles = files.filter(file => {
            const isImage = file.type.startsWith('image/');
            const isPDF = file.type === 'application/pdf';
            return isImage || isPDF;
        });

        setUploadedFiles(prev => [...prev, ...validFiles]);
    };

    const removeFile = (index) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                const url = URL.createObjectURL(audioBlob);
                setAudioURL(url);

                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
            setIsPaused(false);

            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (error) {

            alert('Could not access microphone. Please grant permission.');
        }
    };

    const togglePauseRecording = () => {
        if (!mediaRecorderRef.current) return;

        if (isPaused) {
            mediaRecorderRef.current.resume();
            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
            setIsPaused(false);
        } else {
            mediaRecorderRef.current.pause();
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
            setIsPaused(true);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
        }
        setIsRecording(false);
        setIsPaused(false);
    };

    const deleteRecording = () => {
        if (audioURL) {
            URL.revokeObjectURL(audioURL);
        }
        setAudioURL(null);
        setRecordingTime(0);
    };

    const handleGenerateEssay = async () => {
        // Check if user has provided any input
        const hasPrompt = essayPrompt.trim().length > 0;
        const hasFiles = uploadedFiles.length > 0;
        const hasAudio = audioURL !== null || (isRecording && audioChunksRef.current.length > 0);

        if (!hasPrompt && !hasFiles && !hasAudio) {
            alert("Please provide a prompt, upload files, or record audio.");
            return;
        }

        // If recording is active (paused or not), stop it first to create audioURL
        let audioBlobToUse = null;
        if (isRecording && mediaRecorderRef.current) {
            // Stop the media recorder
            mediaRecorderRef.current.stop();

            // Stop the recording interval
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }

            // Stop the media stream tracks
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }

            setIsRecording(false);
            setIsPaused(false);

            // Create blob directly from chunks if we have them
            if (audioChunksRef.current.length > 0) {
                audioBlobToUse = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                const url = URL.createObjectURL(audioBlobToUse);
                setAudioURL(url);
            }

            // Wait a bit for the onstop event handler to complete (if it hasn't already)
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        // Show loading modal and start progress animation
        setShowLoadingModal(true);
        setLoadingProgress(0);

        // Progress simulation (0-90%)
        progressIntervalRef.current = setInterval(() => {
            setLoadingProgress(prev => {
                const next = prev + Math.random() * 5;
                return next > 90 ? 90 : next;
            });
        }, 500);

        try {
            // 1. Fetch User Profile Data
            let userProfileData = null;
            try {
                const profileRes = await apiGet("/profile/me");
                if (profileRes.success) {
                    userProfileData = profileRes.data;
                }
            } catch (err) {
                console.warn("Failed to fetch profile data for essay context:", err);
                // We proceed even if profile fetch fails, or should we stop? 
                // Usually better to proceed with partial data, but user said "niye nio" (take it).
            }

            const formData = new FormData();
            formData.append("prompt", essayPrompt);

            // Append Profile Data if available
            if (userProfileData) {
                formData.append("userProfile", JSON.stringify(userProfileData));
            }

            // 2. Files -> 'document'
            uploadedFiles.forEach((file) => {
                formData.append("document", file);
            });

            // 2. Audio -> 'audio'
            if (audioBlobToUse) {
                // Use the blob we just created from active recording
                try {
                    const audioFile = new File([audioBlobToUse], "voice_instruction.wav", { type: "audio/wav" });
                    formData.append("audio", audioFile);
                } catch (e) {
                    console.error("Failed to append audio:", e);
                }
            } else if (audioURL) {
                // Use existing audioURL (from previously stopped recording)
                try {
                    const audioBlob = await fetch(audioURL).then(r => r.blob());
                    // Create a File object from the Blob
                    const audioFile = new File([audioBlob], "voice_instruction.wav", { type: "audio/wav" });
                    formData.append("audio", audioFile);
                } catch (e) {
                    console.error("Failed to append audio:", e);
                }
            }

            // 3. Title & Subject -> 'title', 'subject'
            // Use active scholarship context data if available, otherwise defaults
            const title = activeScholarship?.title || "Generated Essay";
            const subject = activeScholarship?.subject || "General";

            formData.append("title", title);
            formData.append("subject", subject);

            // API Call
            const response = await apiPost("/generate-essay/generate", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // Complete progress
            clearInterval(progressIntervalRef.current);
            setLoadingProgress(100);

            // Wait a bit to show 100%
            setTimeout(() => {
                // Ensure we handle response structure correctly
                // Priority: contentFinal (new format), then essay (legacy/fallback)
                // Check both root level (if flattened) and data level (if nested)
                let essayContent = "No content generated.";
                const responseData = response?.data || response;

                if (typeof response === 'string') {
                    essayContent = response;
                } else if (responseData?.contentFinal) {
                    essayContent = responseData.contentFinal;
                } else if (responseData?.essay) {
                    essayContent = responseData.essay;
                } else if (response?.essay) {
                    essayContent = response.essay;
                } else if (response?.contentFinal) {
                    essayContent = response.contentFinal;
                } else if (responseData && typeof responseData === 'string') {
                    essayContent = responseData;
                } else if (response?.message) {
                    // Sometimes message contains the text if it's a simple return
                    essayContent = response.message;
                }

                // Capture ID - prioritize the one associated with the content
                const essayId = responseData?.id || response?.id;

                // Capture Subject
                const essaySubject = responseData?.subject || response?.subject || activeScholarship?.subject || "General";

                // Handle case where content is "Existing essay:<br/>..."
                if (essayContent && typeof essayContent === 'string' && essayContent.startsWith("Existing essay:<br/>")) {
                    essayContent = essayContent.replace("Existing essay:<br/>", "");
                }

                // Reset form inputs as requested
                setEssayPrompt("");
                setUploadedFiles([]);
                if (audioURL) {
                    URL.revokeObjectURL(audioURL);
                }
                setAudioURL(null);
                setRecordingTime(0);

                setGeneratedEssay(essayContent);
                setGeneratedSubject(essaySubject);
                if (essayId) setGeneratedEssayId(essayId);

                setShowLoadingModal(false);
                setShowEssayModal(true);
            }, 500);

        } catch (error) {
            console.error("Essay generation failed:", error);
            clearInterval(progressIntervalRef.current);
            setShowLoadingModal(false);
            const errorMsg = error?.response?.data?.message || error?.message || "Failed to generate essay.";
            alert(`Error: ${errorMsg}`);
        }
    };

    const closeLoadingModal = () => {
        setShowLoadingModal(false);
        setLoadingProgress(0);
    };

    const closeEssayModal = () => {
        setShowEssayModal(false);
    };

    const handleSaveEssay = async () => {
        // Check if we have an active scholarship linkage
        if (activeScholarship?.id && generatedEssayId) {
            try {
                await apiPost("/application/save", {
                    scholarshipId: activeScholarship.id,
                    essayId: generatedEssayId
                });
                // Optionally clear active context after successful save
                localStorage.removeItem("selected_scholarship_for_application");
                localStorage.removeItem("current_active_scholarship");
            } catch (error) {
                console.error("Failed to save application linkage:", error);
                alert("Essay saved locally, but failed to link to application.");
            }
        }

        // Update Application Tracker locally (Legacy/Fallback or for instant UI update)
        const activeId = localStorage.getItem("current_active_scholarship");
        if (activeId) {
            const currentData = JSON.parse(localStorage.getItem("application_tracker_data") || "[]");
            const appIndex = currentData.findIndex(item => item.id === activeId);

            if (appIndex >= 0) {
                // Extract title from content (first line usually) or use default
                const titleLine = generatedEssay.split('\n')[0].replace(/^#\s*/, '').trim();
                const essayTitle = titleLine || "Generated Essay";

                currentData[appIndex] = {
                    ...currentData[appIndex],
                    status: "Done",
                    essayTitle: essayTitle,
                    essayContent: generatedEssay
                };
                localStorage.setItem("application_tracker_data", JSON.stringify(currentData));
            }
        }

        navigation.push('/dashboard/student/view_essay')
        closeEssayModal();
    };

    const handleEditEssay = () => {
        // Save generate essay to local storage for editing
        localStorage.setItem("essay_to_edit", JSON.stringify({
            essay: generatedEssay,
            subject: generatedSubject,
            id: generatedEssayId
        }));
        navigation.push('/dashboard/student/essays/edit_essay')
    };

    const handleRemoveEssay = () => {
        // Open confirmation modal
        setShowDeleteModal(true);
    };

    const confirmRemoveEssay = () => {
        setGeneratedEssay("");
        closeEssayModal();
        setShowDeleteModal(false);
        // Using toast instead of alert would be better, but sticking to alert for simplicity per user pattern or upgrade later
        // alert("Essay removed successfully!"); 
        // Actually, let's just close silently or use a toast if available. The user used alert before.
        // We'll skip the alert to make it smoother since the modal is confirming the action.
    };

    const handleOpenInstructions = () => {
        if (!studentInstruction) {
            toast.error("Instruction is not available right now.");
            return;
        }

        setShowInstructionModal(true);
    };

    const handleCloseInstructions = () => {
        setShowInstructionModal(false);
        setIsPromptCopied(false);
    };

    const handleCopyPrompt = async () => {
        if (!studentInstruction?.instructionPrompt) {
            toast.error("Prompt is not available to copy.");
            return;
        }

        try {
            await navigator.clipboard.writeText(studentInstruction.instructionPrompt);
            setIsPromptCopied(true);
            toast.success("Prompt copied successfully");

            setTimeout(() => {
                setIsPromptCopied(false);
            }, 2000);
        } catch (error) {
            toast.error("Failed to copy prompt");
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#fff9e8_0%,_#ffffff_45%,_#f8fbff_100%)] flex items-center justify-center px-6 py-10">
            <div className="pointer-events-none absolute left-[-80px] top-10 h-64 w-64 rounded-full bg-[#FFE7A3] opacity-40 blur-3xl" />
            <div className="pointer-events-none absolute bottom-[-40px] right-[-60px] h-72 w-72 rounded-full bg-[#DDEBFF] opacity-60 blur-3xl" />

            <div className="absolute right-6 top-6 z-10 sm:right-10 sm:top-8">
                <div
                    className="rounded-full p-[2px] shadow-[0_14px_38px_rgba(245,158,11,0.34)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(245,158,11,0.42)]"
                    style={{
                        background:
                            "linear-gradient(120deg, #f59e0b, #facc15, #fb7185, #a855f7, #60a5fa, #f59e0b)",
                        backgroundSize: "300% 300%",
                        animation: "instructionBorderFlow 4s linear infinite",
                    }}
                >
                    <button
                        onClick={handleOpenInstructions}
                        disabled={isInstructionLoading}
                        className="inline-flex items-center gap-2 rounded-full border bg-gradient-to-r from-[#F6C844] via-[#F4B942] to-[#F59E0B] border-white/80 bg-white px-5 py-3 text-sm font-semibold text-[#1F2937] backdrop-blur-sm transition hover:bg-[#FFFDF7] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        <Icon icon="mdi:book-open-page-variant-outline" width={20} height={20} className="text-[#B45309]" />
                        {isInstructionLoading ? "Loading Instruction..." : "See Instruction"}
                    </button>
                </div>
            </div>

            <div className="relative w-full max-w-[640px]">
                <div className="mb-8 text-center">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#F6E7B4] bg-white/80 px-4 py-2 text-sm font-medium text-[#B7791F] shadow-sm backdrop-blur">
                        <Icon icon="mdi:sparkles" width={18} height={18} />
                        AI-powered essay workspace
                    </div>
                    <h1 className="text-[44px] font-bold text-[#2D3748] mb-2">
                        Create an Essay
                    </h1>
                    <p className="text-[17px] text-[#718096]">
                        Turn your ideas, files, and voice notes into a polished essay.
                    </p>
                </div>

                

                <div className="mb-6 rounded-[28px] border border-white bg-white/90 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur transition hover:shadow-[0_28px_70px_rgba(15,23,42,0.12)]">
                    {/* Active Scholarship Context */}
                    {activeScholarship && (
                        <div className="mb-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 shadow-sm">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-semibold text-gray-800 text-sm">Applying for: {activeScholarship.title}</h3>
                                <button
                                    onClick={() => {
                                        setActiveScholarship(null);
                                        localStorage.removeItem("selected_scholarship_for_application");
                                        setEssayPrompt("");
                                    }}
                                    className="rounded-full p-1 text-gray-400 transition hover:bg-white hover:text-red-500"
                                >
                                    <Icon icon="mdi:close" width={16} height={16} />
                                </button>
                            </div>
                            {activeScholarship.subject && <p className="text-xs text-gray-500 mb-1">Subject: {activeScholarship.subject}</p>}
                            {activeScholarship.description && (
                                <p className="text-xs text-gray-600 line-clamp-2 italic">
                                    "{activeScholarship.description}"
                                </p>
                            )}
                        </div>
                    )}

                    <textarea
                        value={essayPrompt}
                        onChange={(e) => setEssayPrompt(e.target.value)}
                        placeholder="Write anything..."
                        className="min-h-[140px] w-full resize-none rounded-2xl bg-transparent px-1 py-2 text-[15px] text-[#4A5568] placeholder-[#A0AEC0] focus:outline-none"
                    />

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[#718096]">
                        <p className="inline-flex items-center gap-2">
                            <Icon icon="mdi:flash-outline" width={16} height={16} className="text-[#B7791F]" />
                            Add a clear prompt for better essay results
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="rounded-full bg-[#F8FAFC] px-3 py-1 font-medium text-[#4A5568] ring-1 ring-[#E2E8F0]">
                                {promptCharacterCount} characters
                            </span>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,.pdf"
                                multiple
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="group rounded-full border border-[#E2E8F0] bg-white p-2.5 text-[#A0AEC0] shadow-sm transition hover:-translate-y-0.5 hover:border-[#F6C844] hover:text-[#B7791F]"
                                title="Upload files"
                            >
                                <Icon icon="mdi:attachment" width={22} height={22} className="transition group-hover:rotate-12" />
                            </button>

                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`flex h-11 w-11 items-center justify-center rounded-full shadow-md transition-all ${isRecording
                                    ? "scale-105 bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-red-200"
                                    : "bg-gradient-to-r from-[#F6C844] to-[#F59E0B] text-[#2D3748] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(245,158,11,0.28)]"
                                    }`}
                                title={isRecording ? "Stop recording" : "Start recording"}
                            >
                                <Icon
                                    icon={isRecording ? "mdi:stop" : "mdi:microphone"}
                                    width={22}
                                    height={22}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                <FileUploadList files={uploadedFiles} onRemove={removeFile} />

                <RecordingIndicator
                    isRecording={isRecording}
                    isPaused={isPaused}
                    recordingTime={recordingTime}
                    onTogglePause={togglePauseRecording}
                />

                <AudioPlayer
                    audioURL={audioURL}
                    recordingTime={recordingTime}
                    onDelete={deleteRecording}
                />

                <button
                    onClick={handleGenerateEssay}
                    className="group w-full rounded-full bg-gradient-to-r from-[#F6C844] via-[#F4B942] to-[#F59E0B] py-4 text-[16px] font-semibold text-[#2D3748] shadow-[0_18px_40px_rgba(245,158,11,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_50px_rgba(245,158,11,0.35)]"
                >
                    <span className="inline-flex items-center gap-2">
                        Generate Essay
                        <Icon icon="mdi:arrow-right" width={18} height={18} className="transition group-hover:translate-x-1" />
                    </span>
                </button>
            </div>

            <StudentInstructionModal
                isOpen={showInstructionModal}
                onClose={handleCloseInstructions}
                instruction={studentInstruction}
                onCopyPrompt={handleCopyPrompt}
                isCopied={isPromptCopied}
            />

            <LoadingModal
                isOpen={showLoadingModal}
                progress={loadingProgress}
                onClose={closeLoadingModal}
            />

            <EssayResultModal
                isOpen={showEssayModal}
                essay={generatedEssay}
                subject={generatedSubject}
                essayId={generatedEssayId}
                onClose={closeEssayModal}
                onSave={handleSaveEssay}
                onEdit={handleEditEssay}
                onRemove={handleRemoveEssay}
            />

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmRemoveEssay}
                title="Remove Essay?"
                message="Are you sure you want to remove this generated essay? This action cannot be undone."
                confirmText="Remove"
                confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
                icon="mdi:delete-forever"
            />
            <style jsx>{`
                @keyframes instructionBorderFlow {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }
            `}</style>
        </div>
    );
}
