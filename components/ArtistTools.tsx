"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExperience } from "@/contexts/ExperienceContext";
import {
    Upload,
    Music,
    Palette,
    Code,
    X,
    AlertCircle,
    CheckCircle,
    Loader2,
    FileAudio,
    Image as ImageIcon,
    Wand2,
} from "lucide-react";

interface TrackSubmission {
    title: string;
    artist: string;
    audioFile: File | null;
    coverArt: File | null;
    visualizerType: string;
    description: string;
}

interface ArtistToolsProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ArtistTools({ isOpen, onClose }: ArtistToolsProps) {
    const { getEvolutionColors } = useExperience();
    const colors = getEvolutionColors();
    const [activeTab, setActiveTab] = useState<"upload" | "visualizer" | "preview">("upload");
    const [submission, setSubmission] = useState<TrackSubmission>({
        title: "",
        artist: "",
        audioFile: null,
        coverArt: null,
        visualizerType: "default",
        description: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

    const handleFileChange = useCallback((type: "audio" | "cover", file: File | null) => {
        if (type === "audio") {
            setSubmission(prev => ({ ...prev, audioFile: file }));
        } else {
            setSubmission(prev => ({ ...prev, coverArt: file }));
        }
    }, []);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmitStatus("idle");

        // Simulate submission (in production, this would upload to backend)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // For now, always show the "coming soon" message
        setSubmitStatus("success");
        setIsSubmitting(false);
    };

    const isValid = submission.title && submission.artist && submission.audioFile;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative max-w-2xl w-full max-h-[80vh] overflow-hidden bg-[#0a0a0a] border-2"
                        style={{ borderColor: colors.primary }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <Wand2 size={20} style={{ color: colors.primary }} />
                                <div>
                                    <div className="font-mono text-lg font-bold" style={{ color: colors.primary }}>
                                        ARTIST_TOOLS
                                    </div>
                                    <div className="font-mono text-xs text-white/40">
                                        Create and submit your own content
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white/40 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-white/10">
                            <TabButton
                                active={activeTab === "upload"}
                                onClick={() => setActiveTab("upload")}
                                icon={<Upload size={14} />}
                                label="UPLOAD"
                                color={colors.primary}
                            />
                            <TabButton
                                active={activeTab === "visualizer"}
                                onClick={() => setActiveTab("visualizer")}
                                icon={<Palette size={14} />}
                                label="VISUALIZER"
                                color={colors.primary}
                            />
                            <TabButton
                                active={activeTab === "preview"}
                                onClick={() => setActiveTab("preview")}
                                icon={<Code size={14} />}
                                label="PREVIEW"
                                color={colors.primary}
                            />
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto max-h-[50vh]">
                            {activeTab === "upload" && (
                                <UploadTab
                                    submission={submission}
                                    setSubmission={setSubmission}
                                    onFileChange={handleFileChange}
                                    color={colors.primary}
                                />
                            )}

                            {activeTab === "visualizer" && (
                                <VisualizerTab
                                    submission={submission}
                                    setSubmission={setSubmission}
                                    color={colors.primary}
                                />
                            )}

                            {activeTab === "preview" && (
                                <PreviewTab
                                    submission={submission}
                                    color={colors.primary}
                                />
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between p-4 border-t border-white/10">
                            <div className="font-mono text-xs text-white/40">
                                {submitStatus === "success" ? (
                                    <span className="flex items-center gap-2 text-green-400">
                                        <CheckCircle size={14} />
                                        Submission queued! (Coming soon to SYSTEM FLUX)
                                    </span>
                                ) : submitStatus === "error" ? (
                                    <span className="flex items-center gap-2 text-red-400">
                                        <AlertCircle size={14} />
                                        Submission failed. Try again later.
                                    </span>
                                ) : (
                                    "Fill in all required fields to submit"
                                )}
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={!isValid || isSubmitting}
                                className="flex items-center gap-2 px-4 py-2 font-mono text-sm transition-all disabled:opacity-50"
                                style={{
                                    backgroundColor: colors.primary + "20",
                                    borderColor: colors.primary,
                                    color: colors.primary,
                                    border: "1px solid",
                                }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        PROCESSING...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={14} />
                                        SUBMIT
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Coming Soon Overlay */}
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                            <div className="text-center p-8">
                                <div className="font-mono text-2xl mb-4" style={{ color: colors.primary }}>
                                    COMING_SOON
                                </div>
                                <p className="font-mono text-sm text-white/60 max-w-md">
                                    Artist Tools will allow musicians to submit their tracks and custom visualizers to SYSTEM FLUX.
                                    This feature requires backend infrastructure and will be available in a future update.
                                </p>
                                <div className="mt-6 flex items-center justify-center gap-4">
                                    <div className="font-mono text-xs text-white/40">
                                        <span style={{ color: colors.primary }}>STATUS:</span> In Development
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="mt-6 px-4 py-2 border font-mono text-sm transition-all hover:bg-white/5"
                                    style={{ borderColor: colors.primary, color: colors.primary }}
                                >
                                    CLOSE
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function TabButton({
    active,
    onClick,
    icon,
    label,
    color,
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    color: string;
}) {
    return (
        <button
            onClick={onClick}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-mono text-xs transition-all"
            style={{
                backgroundColor: active ? color + "20" : "transparent",
                color: active ? color : "rgba(255,255,255,0.5)",
                borderBottom: active ? `2px solid ${color}` : "2px solid transparent",
            }}
        >
            {icon}
            {label}
        </button>
    );
}

function UploadTab({
    submission,
    setSubmission,
    onFileChange,
    color,
}: {
    submission: TrackSubmission;
    setSubmission: React.Dispatch<React.SetStateAction<TrackSubmission>>;
    onFileChange: (type: "audio" | "cover", file: File | null) => void;
    color: string;
}) {
    return (
        <div className="space-y-6">
            {/* Track info */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="font-mono text-xs text-white/40 mb-2 block">TRACK_TITLE *</label>
                    <input
                        type="text"
                        value={submission.title}
                        onChange={(e) => setSubmission(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-white/30"
                        placeholder="Enter track title"
                    />
                </div>
                <div>
                    <label className="font-mono text-xs text-white/40 mb-2 block">ARTIST_NAME *</label>
                    <input
                        type="text"
                        value={submission.artist}
                        onChange={(e) => setSubmission(prev => ({ ...prev, artist: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-white/30"
                        placeholder="Enter artist name"
                    />
                </div>
            </div>

            {/* File uploads */}
            <div className="grid grid-cols-2 gap-4">
                <FileUpload
                    label="AUDIO_FILE *"
                    accept="audio/*"
                    file={submission.audioFile}
                    onChange={(file) => onFileChange("audio", file)}
                    icon={<FileAudio size={24} />}
                    color={color}
                />
                <FileUpload
                    label="COVER_ART"
                    accept="image/*"
                    file={submission.coverArt}
                    onChange={(file) => onFileChange("cover", file)}
                    icon={<ImageIcon size={24} />}
                    color={color}
                />
            </div>

            {/* Description */}
            <div>
                <label className="font-mono text-xs text-white/40 mb-2 block">DESCRIPTION</label>
                <textarea
                    value={submission.description}
                    onChange={(e) => setSubmission(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full h-20 bg-white/5 border border-white/10 px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-white/30 resize-none"
                    placeholder="Brief description of your track..."
                />
            </div>
        </div>
    );
}

function FileUpload({
    label,
    accept,
    file,
    onChange,
    icon,
    color,
}: {
    label: string;
    accept: string;
    file: File | null;
    onChange: (file: File | null) => void;
    icon: React.ReactNode;
    color: string;
}) {
    return (
        <div>
            <label className="font-mono text-xs text-white/40 mb-2 block">{label}</label>
            <label
                className="flex flex-col items-center justify-center p-4 border-2 border-dashed cursor-pointer transition-colors hover:bg-white/5"
                style={{ borderColor: file ? color : "rgba(255,255,255,0.1)" }}
            >
                <input
                    type="file"
                    accept={accept}
                    onChange={(e) => onChange(e.target.files?.[0] || null)}
                    className="hidden"
                />
                <div style={{ color: file ? color : "rgba(255,255,255,0.4)" }}>{icon}</div>
                <span className="font-mono text-xs mt-2" style={{ color: file ? color : "rgba(255,255,255,0.4)" }}>
                    {file ? file.name : "Click to upload"}
                </span>
            </label>
        </div>
    );
}

function VisualizerTab({
    submission,
    setSubmission,
    color,
}: {
    submission: TrackSubmission;
    setSubmission: React.Dispatch<React.SetStateAction<TrackSubmission>>;
    color: string;
}) {
    const visualizers = [
        { id: "default", name: "Default", description: "Circular waveform" },
        { id: "matrix", name: "Matrix", description: "Digital rain effect" },
        { id: "waves", name: "Waves", description: "Ocean-like waves" },
        { id: "grid", name: "Grid", description: "Reactive grid pattern" },
        { id: "custom", name: "Custom", description: "Upload your own visualizer" },
    ];

    return (
        <div className="space-y-4">
            <p className="font-mono text-xs text-white/40">
                Select a visualizer for your track or upload a custom one.
            </p>
            <div className="grid grid-cols-2 gap-3">
                {visualizers.map((viz) => (
                    <button
                        key={viz.id}
                        onClick={() => setSubmission(prev => ({ ...prev, visualizerType: viz.id }))}
                        className="p-4 border text-left transition-all hover:bg-white/5"
                        style={{
                            borderColor: submission.visualizerType === viz.id ? color : "rgba(255,255,255,0.1)",
                            backgroundColor: submission.visualizerType === viz.id ? color + "10" : "transparent",
                        }}
                    >
                        <div className="font-mono text-sm" style={{ color: submission.visualizerType === viz.id ? color : "white" }}>
                            {viz.name}
                        </div>
                        <div className="font-mono text-xs text-white/40 mt-1">{viz.description}</div>
                    </button>
                ))}
            </div>

            {submission.visualizerType === "custom" && (
                <div className="mt-4 p-4 border border-white/10 bg-white/5">
                    <p className="font-mono text-xs text-white/60 mb-3">
                        Create custom visualizers using the Visualizer SDK. See the SDK_DOCS for more info.
                    </p>
                    <div className="flex items-center gap-2">
                        <Code size={14} style={{ color }} />
                        <span className="font-mono text-xs" style={{ color }}>
                            Custom visualizer upload coming soon
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

function PreviewTab({
    submission,
    color,
}: {
    submission: TrackSubmission;
    color: string;
}) {
    return (
        <div className="space-y-4">
            <p className="font-mono text-xs text-white/40">
                Preview how your submission will appear on SYSTEM FLUX.
            </p>

            {/* Preview card */}
            <div className="border border-white/10 p-4">
                <div className="flex gap-4">
                    {/* Cover art preview */}
                    <div
                        className="w-24 h-24 border border-white/10 flex items-center justify-center"
                        style={{ backgroundColor: color + "10" }}
                    >
                        {submission.coverArt ? (
                            <img
                                src={URL.createObjectURL(submission.coverArt)}
                                alt="Cover"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Music size={32} style={{ color: color + "50" }} />
                        )}
                    </div>

                    {/* Track info */}
                    <div className="flex-1">
                        <div className="font-mono text-lg" style={{ color }}>
                            {submission.title || "UNTITLED"}
                        </div>
                        <div className="font-mono text-sm text-white/60">
                            {submission.artist || "Unknown Artist"}
                        </div>
                        <div className="font-mono text-xs text-white/40 mt-2">
                            Visualizer: {submission.visualizerType.toUpperCase()}
                        </div>
                        {submission.audioFile && (
                            <div className="font-mono text-xs text-white/40">
                                Audio: {submission.audioFile.name}
                            </div>
                        )}
                    </div>
                </div>

                {submission.description && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="font-mono text-xs text-white/60">{submission.description}</p>
                    </div>
                )}
            </div>

            {/* Validation status */}
            <div className="space-y-2">
                <ValidationItem
                    valid={!!submission.title}
                    label="Track title"
                    color={color}
                />
                <ValidationItem
                    valid={!!submission.artist}
                    label="Artist name"
                    color={color}
                />
                <ValidationItem
                    valid={!!submission.audioFile}
                    label="Audio file"
                    color={color}
                />
                <ValidationItem
                    valid={!!submission.coverArt}
                    label="Cover art (optional)"
                    color={color}
                    optional
                />
            </div>
        </div>
    );
}

function ValidationItem({
    valid,
    label,
    color,
    optional = false,
}: {
    valid: boolean;
    label: string;
    color: string;
    optional?: boolean;
}) {
    return (
        <div className="flex items-center gap-2 font-mono text-xs">
            {valid ? (
                <CheckCircle size={14} style={{ color }} />
            ) : (
                <AlertCircle size={14} style={{ color: optional ? "rgba(255,255,255,0.3)" : "rgba(255,100,100,0.8)" }} />
            )}
            <span style={{ color: valid ? "rgba(255,255,255,0.8)" : optional ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.6)" }}>
                {label}
            </span>
        </div>
    );
}

// Button to open artist tools
export function ArtistToolsButton({ onClick }: { onClick: () => void }) {
    const { getEvolutionColors } = useExperience();
    const colors = getEvolutionColors();

    return (
        <motion.button
            onClick={onClick}
            className="flex items-center gap-2 px-3 py-2 border font-mono text-xs transition-all hover:bg-white/5"
            style={{ borderColor: colors.primary + "50", color: colors.primary }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <Wand2 size={14} />
            ARTIST_TOOLS
        </motion.button>
    );
}
