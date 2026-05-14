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
      queueMicrotask(() => {
        setStressLevel((prev) => Math.min(100, prev + 15));
        setTimer(60); // Reset timer for next turn
      });
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
    if (!isOpen || messages.length !== 0) return;
    const id = requestAnimationFrame(() => {
      void startInterrogation();
    });
    return () => cancelAnimationFrame(id);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm dark:bg-black/80">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-950"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/90 bg-slate-50/90 px-6 py-4 backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-rose-600 to-violet-600 shadow-lg shadow-rose-500/25 dark:shadow-[0_0_15px_rgba(225,29,72,0.4)]">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -inset-1 rounded-full border border-rose-400/40 dark:border-rose-500/30"
              />
            </div>
            <div>
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                The Hot Seat
              </h2>
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 dark:text-zinc-500">
                Interrogation Phase · Relentless Mode
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden flex-col items-end sm:flex">
              <span className="mb-1 text-[10px] font-mono uppercase text-slate-500 dark:text-zinc-500">Stress Level</span>
              <div className="h-1.5 w-32 overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-white/5 dark:bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stressLevel}%` }}
                  className={`h-full ${
                    stressLevel > 80
                      ? "bg-rose-500 shadow-[0_0_10px_#f43f5e] dark:shadow-[0_0_10px_#f43f5e]"
                      : stressLevel > 50
                        ? "bg-amber-500"
                        : "bg-cyan-500"
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
              <Timer className={`h-4 w-4 ${timer < 15 ? "animate-pulse text-rose-600 dark:text-rose-500" : "text-slate-400 dark:text-zinc-400"}`} />
              <span className={`font-mono text-sm font-bold ${timer < 15 ? "text-rose-600 dark:text-rose-500" : "text-slate-900 dark:text-white"}`}>
                00:{timer.toString().padStart(2, "0")}
              </span>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-white p-6 dark:from-zinc-950 dark:to-zinc-950 dark:bg-[radial-gradient(circle_at_50%_50%,rgba(24,24,27,1)_0%,rgba(9,9,11,1)_100%)]">
          <div className="custom-scrollbar mx-auto max-w-2xl space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20, y: 10 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-md ${
                      msg.role === "user"
                        ? "rounded-tr-none bg-violet-600 font-medium text-white dark:bg-zinc-100 dark:text-zinc-950"
                        : "rounded-tl-none border border-slate-200/90 bg-white text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:backdrop-blur-xl"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="rounded-2xl rounded-tl-none border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 dark:bg-zinc-500" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.2s] dark:bg-zinc-500" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.4s] dark:bg-zinc-500" />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Info Banner */}
        <div className="flex items-center gap-2 border-t border-rose-200/80 bg-rose-50 px-6 py-2 dark:border-rose-500/20 dark:bg-rose-500/10">
          <AlertTriangle className="h-3 w-3 text-rose-600 dark:text-rose-400" />
          <span className="text-[10px] font-medium uppercase tracking-widest text-rose-800 dark:text-rose-300/80">
            AI is analyzing for hesitation and technical gaps. Stay precise.
          </span>
        </div>

        {/* Input */}
        <div className="border-t border-slate-200/90 bg-white/95 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/50">
          <div className="relative mx-auto max-w-2xl">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Provide your technical defense..."
              disabled={isLoading}
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 pr-14 text-sm text-slate-900 placeholder:text-slate-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/25 dark:border-white/10 dark:bg-black/50 dark:text-white dark:placeholder:text-zinc-600 dark:focus:border-rose-500/50 dark:focus:ring-rose-500/40"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md transition-all hover:bg-slate-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white dark:disabled:hover:bg-zinc-100 dark:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-3 text-center text-[10px] uppercase tracking-tighter text-slate-500 dark:text-zinc-600">
            Targeting: {weaknesses.slice(0, 2).join(", ")}...
          </p>
        </div>
      </motion.div>
    </div>
  );
}
