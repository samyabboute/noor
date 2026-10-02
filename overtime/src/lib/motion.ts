/** Shared motion vocabulary — fast, out-expo, never bouncy for its own sake. */
export const ease = [0.22, 1, 0.36, 1] as const;
export const snap = [0.32, 0.72, 0, 1] as const;

export const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
};

export const stagger = (step = 0.06, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: step, delayChildren: delay } },
});
