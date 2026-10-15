import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Calendar, Coins, Droplets, FlaskConical, MapPin, Sprout } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

// Shown for exactly as long as the crop-plan request is in flight. There is no server-side
// progress signal, so progress is indeterminate; the rotating messages describe what the
// recommendation considers, not completed stages, and the elapsed time is real.
const MESSAGE_INTERVAL_MS = 3200;

const NODES = [
  { icon: FlaskConical, key: "soil" },
  { icon: MapPin, key: "location" },
  { icon: Calendar, key: "season" },
  { icon: Droplets, key: "water" },
  { icon: Coins, key: "costs" },
] as const;

// Fixed positions so particles look organic without randomness on every render.
const PARTICLES = [
  { x: -46, delay: 0, size: 5 },
  { x: -20, delay: 1.1, size: 4 },
  { x: 8, delay: 0.5, size: 6 },
  { x: 30, delay: 1.7, size: 4 },
  { x: 52, delay: 0.9, size: 5 },
  { x: -64, delay: 2.2, size: 3 },
];

export default function CropPlanLoading() {
  const { t } = useLanguage();
  const tl = t.planning.loading;
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const tick = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    const rotate = setInterval(() => setIndex((i) => (i + 1) % tl.steps.length), MESSAGE_INTERVAL_MS);
    return () => {
      clearInterval(tick);
      clearInterval(rotate);
    };
  }, [tl.steps.length]);

  return (
    <div
      className="relative overflow-hidden bg-white rounded-3xl border border-gray-200 shadow-sm flex flex-col items-center justify-center gap-6 px-6 py-8 sm:py-10"
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-testid="plan-loading"
    >
      {/* One announcement for screen readers; the rotating captions below are decorative. */}
      <span className="sr-only">{tl.announce}</span>

      {/* Soft background glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(16,185,129,0.10),transparent_60%)]" aria-hidden="true" />

      <div className="relative w-60 h-60 sm:w-72 sm:h-72" aria-hidden="true">
        {/* Pulse rings */}
        {!reduce &&
          [0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-[18%] rounded-full border border-emerald-400/40"
              initial={{ scale: 0.85, opacity: 0.5 }}
              animate={{ scale: 1.55, opacity: 0 }}
              transition={{ duration: 3.6, repeat: Infinity, delay: i * 1.2, ease: "easeOut" }}
            />
          ))}

        {/* Orbit path */}
        <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full">
          <circle cx="100" cy="100" r="86" fill="none" stroke="#d1fae5" strokeWidth="1" strokeDasharray="3 5" />
          <circle cx="100" cy="100" r="58" fill="none" stroke="#ecfdf5" strokeWidth="14" />
        </svg>

        {/* Scanning ring */}
        <motion.div
          className="absolute inset-[22%] rounded-full"
          style={{ background: "conic-gradient(from 0deg, transparent 0deg, rgba(16,185,129,0.0) 250deg, rgba(16,185,129,0.55) 360deg)", WebkitMask: "radial-gradient(circle, transparent 62%, #000 64%)", mask: "radial-gradient(circle, transparent 62%, #000 64%)" }}
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
        />

        {/* Orbiting data nodes with connector lines to the plant */}
        <motion.div
          className="absolute inset-0"
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        >
          <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full">
            {NODES.map((_, i) => {
              const a = (i / NODES.length) * Math.PI * 2 - Math.PI / 2;
              return (
                <motion.line
                  key={i}
                  x1={100 + Math.cos(a) * 62} y1={100 + Math.sin(a) * 62}
                  x2={100 + Math.cos(a) * 80} y2={100 + Math.sin(a) * 80}
                  stroke="#34d399" strokeWidth="1" strokeDasharray="2 3"
                  animate={reduce ? undefined : { opacity: [0.2, 0.9, 0.2] }}
                  transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.45 }}
                />
              );
            })}
          </svg>
          {NODES.map(({ icon: Icon, key }, i) => {
            const a = (i / NODES.length) * Math.PI * 2 - Math.PI / 2;
            return (
              <div
                key={key}
                className="absolute w-9 h-9 sm:w-10 sm:h-10 -ml-[18px] -mt-[18px] sm:-ml-5 sm:-mt-5"
                style={{ left: `${50 + Math.cos(a) * 43}%`, top: `${50 + Math.sin(a) * 43}%` }}
              >
                {/* Counter-rotate so icons stay upright while orbiting */}
                <motion.div
                  className="w-full h-full rounded-xl bg-white border border-emerald-100 shadow-md shadow-emerald-900/5 flex items-center justify-center text-emerald-600"
                  animate={reduce ? undefined : { rotate: -360, scale: [1, 1.08, 1] }}
                  transition={{ rotate: { duration: 24, repeat: Infinity, ease: "linear" }, scale: { duration: 2.4, repeat: Infinity, delay: i * 0.45 } }}
                >
                  <Icon className="w-4 h-4" />
                </motion.div>
              </div>
            );
          })}
        </motion.div>

        {/* Central plant */}
        <div className="absolute inset-[26%] rounded-full bg-gradient-to-b from-emerald-50 to-white shadow-inner flex items-end justify-center overflow-hidden">
          {/* Rising particles */}
          {!reduce &&
            PARTICLES.map((p, i) => (
              <motion.span
                key={i}
                className="absolute bottom-[22%] rounded-full bg-emerald-400/70"
                style={{ width: p.size, height: p.size, left: `calc(50% + ${p.x * 0.6}px)` }}
                initial={{ y: 0, opacity: 0 }}
                animate={{ y: -70, opacity: [0, 0.9, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: p.delay, ease: "easeOut" }}
              />
            ))}

          <svg viewBox="0 0 100 100" className="relative w-[78%] h-[78%] mb-[6%]">
            <defs>
              <linearGradient id="fw-stem" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0" stopColor="#047857" />
                <stop offset="1" stopColor="#10b981" />
              </linearGradient>
              <radialGradient id="fw-glow">
                <stop offset="0" stopColor="#6ee7b7" stopOpacity="0.55" />
                <stop offset="1" stopColor="#6ee7b7" stopOpacity="0" />
              </radialGradient>
            </defs>
            <motion.circle
              cx="50" cy="48" r="30" fill="url(#fw-glow)"
              animate={reduce ? undefined : { opacity: [0.4, 0.9, 0.4], scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "50px 48px" }}
            />
            {/* Soil */}
            <ellipse cx="50" cy="88" rx="30" ry="6" fill="#064e3b" opacity="0.9" />
            <ellipse cx="50" cy="86" rx="24" ry="3.5" fill="#065f46" />
            {/* Plant sways from its base */}
            <motion.g
              style={{ transformOrigin: "50px 86px" }}
              animate={reduce ? undefined : { rotate: [-3, 3, -3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.path
                d="M50 86 C 50 70, 48 58, 50 40"
                fill="none" stroke="url(#fw-stem)" strokeWidth="3.2" strokeLinecap="round"
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.4, ease: "easeOut" }}
              />
              <motion.path
                d="M50 62 C 38 60, 30 52, 28 42 C 40 42, 48 50, 50 62 Z"
                fill="#10b981"
                style={{ transformOrigin: "50px 62px" }}
                initial={reduce ? false : { scale: 0 }}
                animate={reduce ? { scale: 1 } : { scale: [1, 1.06, 1] }}
                transition={reduce ? undefined : { scale: { duration: 3, repeat: Infinity, delay: 1.2 } }}
              />
              <motion.path
                d="M50 52 C 62 50, 70 42, 72 32 C 60 32, 52 40, 50 52 Z"
                fill="#34d399"
                style={{ transformOrigin: "50px 52px" }}
                initial={reduce ? false : { scale: 0 }}
                animate={reduce ? { scale: 1 } : { scale: [1, 1.08, 1] }}
                transition={reduce ? undefined : { scale: { duration: 3, repeat: Infinity, delay: 1.6 } }}
              />
              <motion.circle
                cx="50" cy="39" r="3.2" fill="#a7f3d0"
                initial={reduce ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.3 }}
              />
            </motion.g>
          </svg>

          {/* Scan line */}
          {!reduce && (
            <motion.div
              className="absolute left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_rgba(16,185,129,0.8)]"
              initial={{ top: "12%" }}
              animate={{ top: ["12%", "82%", "12%"] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </div>
      </div>

      {/* Caption */}
      <div className="relative w-full max-w-md text-center space-y-4" aria-hidden="true">
        <div className="flex items-center justify-center gap-2 text-emerald-700">
          <Sprout className="w-4 h-4" />
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">{tl.title}</span>
        </div>
        <div className="h-12 sm:h-8 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              className="text-base sm:text-lg font-bold text-gray-900"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, filter: "blur(4px)" }}
              transition={{ duration: reduce ? 0.01 : 0.35 }}
            >
              {tl.steps[index]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Indeterminate progress: no fake percentage */}
        <div className="h-1.5 w-full rounded-full bg-emerald-50 overflow-hidden">
          {reduce ? (
            <div className="h-full w-full bg-emerald-200" />
          ) : (
            <motion.div
              className="h-full w-1/3 rounded-full bg-gradient-to-r from-emerald-300 via-emerald-500 to-emerald-700"
              initial={{ x: "-100%" }}
              animate={{ x: "300%" }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </div>

        <p className="text-xs text-gray-400 font-medium tabular-nums">
          {tl.elapsed.replace("{s}", String(elapsed))} · {tl.hint}
        </p>
      </div>
    </div>
  );
}
