"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { X, Send, Timer, Zap, AlertTriangle } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  weaknesses: string[];
  mode: "student" | "career";
};

export function HotSeat({ isOpen, onClose, weaknesses, mode }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [stressLevel, setStressLevel] = useState(10); // 0-100
  const [isSessionActive, setIsSessionActive] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSessionActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
        // Increase stress slowly as time passes
        setStressLevel((prev) => Math.min(100, prev + 0.1));
      }, 1000);
    } else if (timer === 0 && isSessionActive) {
      // Time's up! Penalty or automatic AI response?
      setStressLevel((prev) => Math.min(100, prev + 15));
      setTimer(60); // Reset timer for next turn
    }
    return () => clearInterval(interval);
  }, [isSessionActive, timer]);

  const startInterrogation = useCallback(async () => {
    setIsLoading(true);
    setIsSessionActive(true);
    setMessages([]);
    setStressLevel(20);
    setTimer(60);

    try {
      const res = await fetch("/api/hot-seat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          weaknesses,
          messages: [],
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessages([{ role: "assistant", content: data.content }]);
      } else {
        setMessages([
          { role: "assistant", content: `System Error: ${data.error || "Failed to start session."}` },
        ]);
      }
    } catch {
      setMessages([{ role: "assistant", content: "Connection lost. The interrogator has left the room." }]);
    } finally {
      setIsLoading(false);
    }
  }, [mode, weaknesses]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      startInterrogation();
    }
  }, [isOpen, messages.length, startInterrogation]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setTimer(60); // Reset timer on user response
    setStressLevel((prev) => Math.min(100, prev + 5)); // Increase stress on each exchange

    try {
      const res = await fetch("/api/hot-seat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          weaknesses,
          messages: newMessages,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Critical Error: ${data.error}` },
        ]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Signal interference. Try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl h-[85vh] flex flex-col bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-900/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-rose-600 to-violet-600 flex items-center justify-center shadow-[0_0_15px_rgba(225,29,72,0.4)]">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -inset-1 rounded-full border border-rose-500/30"
              />
            </div>
            <div>
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-white uppercase tracking-wider">
                The Hot Seat
              </h2>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                Interrogation Phase · Relentless Mode
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] text-zinc-500 uppercase font-mono mb-1">Stress Level</span>
              <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stressLevel}%` }}
                  className={`h-full ${
                    stressLevel > 80 ? "bg-rose-500 shadow-[0_0_10px_#f43f5e]" : 
                    stressLevel > 50 ? "bg-amber-500" : "bg-cyan-500"
                  }`}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
              <Timer className={`h-4 w-4 ${timer < 15 ? "text-rose-500 animate-pulse" : "text-zinc-400"}`} />
              <span className={`font-mono text-sm font-bold ${timer < 15 ? "text-rose-500" : "text-white"}`}>
                00:{timer.toString().padStart(2, "0")}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[radial-gradient(circle_at_50%_50%,rgba(24,24,27,1)_0%,rgba(9,9,11,1)_100%)]">
          <div className="max-w-2xl mx-auto space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20, y: 10 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-lg ${
                      msg.role === "user"
                        ? "bg-zinc-100 text-zinc-950 font-medium rounded-tr-none"
                        : "bg-white/5 border border-white/10 text-zinc-200 backdrop-blur-xl rounded-tl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl rounded-tl-none">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 bg-zinc-500 rounded-full animate-bounce" />
                    <span className="h-1.5 w-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Info Banner */}
        <div className="px-6 py-2 bg-rose-500/10 border-t border-rose-500/20 flex items-center gap-2">
          <AlertTriangle className="h-3 w-3 text-rose-400" />
          <span className="text-[10px] text-rose-300/80 uppercase tracking-widest font-medium">
            AI is analyzing for hesitation and technical gaps. Stay precise.
          </span>
        </div>

        {/* Input */}
        <div className="p-6 bg-zinc-900/50 backdrop-blur-xl border-t border-white/10">
          <div className="max-w-2xl mx-auto relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Provide your technical defense..."
              disabled={isLoading}
              className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500/50 transition-all pr-14"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-2 h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-100 text-zinc-950 hover:bg-white disabled:opacity-50 disabled:hover:bg-zinc-100 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-3 text-center text-[10px] text-zinc-600 uppercase tracking-tighter">
            Targeting: {weaknesses.slice(0, 2).join(", ")}...
          </p>
        </div>
      </motion.div>
    </div>
  );
}
