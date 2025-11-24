"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function Terminal() {
    const [isOpen, setIsOpen] = useState(false);
    const [history, setHistory] = useState<string[]>([
        "FLUX_OS v1.0.0 initialized...",
        "Type 'help' for available commands.",
    ]);
    const [input, setInput] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "`" || e.key === "~") {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    const handleCommand = (cmd: string) => {
        const cleanCmd = cmd.trim().toLowerCase();
        const output = `> ${cmd}`;
        let response = "";

        switch (cleanCmd) {
            case "help":
                response = "AVAILABLE COMMANDS: help, list_tracks, secret, clear, exit";
                break;
            case "list_tracks":
                response = "1. Jury in my Head\n2. Villain\n3. Turn Me Louder\n... [DATA CORRUPTED]";
                break;
            case "secret":
                response = "THE CODE IS: UP UP DOWN DOWN LEFT RIGHT LEFT RIGHT B A";
                break;
            case "clear":
                setHistory([]);
                return;
            case "exit":
                setIsOpen(false);
                return;
            default:
                response = `COMMAND NOT RECOGNIZED: ${cleanCmd}`;
        }

        setHistory((prev) => [...prev, output, response]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input) return;
        handleCommand(input);
        setInput("");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: "-100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-100%" }}
                    transition={{ type: "spring", damping: 20, stiffness: 100 }}
                    className="fixed top-0 left-0 w-full h-1/2 bg-void-deep/95 border-b-2 border-signal z-[90] shadow-2xl shadow-signal/20 backdrop-blur-md font-mono text-sm md:text-base"
                >
                    <div className="flex flex-col h-full p-4">
                        <div className="flex justify-between items-center mb-2 border-b border-stark/10 pb-2">
                            <span className="text-signal">FLUX_OS_TERMINAL</span>
                            <button onClick={() => setIsOpen(false)} className="text-stark/50 hover:text-signal">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 text-stark/80 mb-4 font-mono">
                            {history.map((line, i) => (
                                <div key={i} className="whitespace-pre-wrap">{line}</div>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                            <span className="text-signal">{">"}</span>
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none text-stark font-mono"
                                autoFocus
                                spellCheck={false}
                            />
                        </form>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
