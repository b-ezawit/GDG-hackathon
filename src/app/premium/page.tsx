"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function PremiumPage() {
  const handlePackageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    alert("Coming soon");
  };

  const packages = [
    {
      name: "Basic",
      price: "$4.99",
      time: "15 mins",
      questions: "10 questions",
      desc: "Perfect for a quick refresher before a test or short interview.",
    },
    {
      name: "Pro",
      price: "$14.99",
      time: "45 mins",
      questions: "30 questions (High Quality)",
      desc: "Deep dive into your gaps with advanced scenario-based questions.",
      recommended: true,
    },
    {
      name: "Ultimate",
      price: "$29.99",
      time: "120 mins",
      questions: "100+ questions (Maximum Quality)",
      desc: "The ultimate pressure test. We will not stop until you are ready.",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white to-[#ffcccc] text-slate-900 dark:bg-none dark:bg-[#06050a] dark:text-zinc-100 flex flex-col items-center justify-center p-6">
      <div className="mb-12 text-center z-10">
        <h1 className="font-['Trajan',serif] text-4xl font-bold tracking-tight text-[#ff5a00] mb-4">
          Upgrade to Premium
        </h1>
        <p className="text-lg text-slate-600 dark:text-zinc-400 max-w-xl mx-auto">
          Unlock the full power of AmICooked. Get more time, more questions, and higher quality AI analysis to ensure you are fully prepared.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3 max-w-6xl w-full z-10">
        {packages.map((pkg, i) => (
          <motion.div
            key={pkg.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            className={`relative rounded-3xl p-8 bg-white dark:bg-zinc-900 shadow-xl border ${
              pkg.recommended
                ? "border-amber-500 shadow-amber-500/20"
                : "border-slate-200 dark:border-zinc-800"
            }`}
          >
            {pkg.recommended && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-4 py-1 text-xs font-bold uppercase tracking-widest text-white shadow-md">
                Recommended
              </div>
            )}
            <h2 className="text-2xl font-bold mb-2">{pkg.name}</h2>
            <div className="text-4xl font-extrabold text-[#ff5a00] mb-6">{pkg.price}</div>
            
            <ul className="space-y-4 mb-8 text-sm text-slate-600 dark:text-zinc-400">
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span>
                Time limit: {pkg.time}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span>
                Questions: {pkg.questions}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                <span>{pkg.desc}</span>
              </li>
            </ul>

            <button
              onClick={handlePackageClick}
              className={`w-full rounded-xl py-4 text-sm font-bold shadow-md transition-transform active:scale-95 ${
                pkg.recommended
                  ? "bg-amber-500 text-white hover:bg-amber-400"
                  : "bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700"
              }`}
            >
              Choose {pkg.name}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 z-10">
        <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
