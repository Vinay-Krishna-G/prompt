/** Premium motion tokens — calm, cinematic, no bounce */
export const EASE_PREMIUM = [0.22, 1, 0.36, 1];

export const transitionPremium = (duration = 0.65, delay = 0) => ({
  duration,
  delay,
  ease: EASE_PREMIUM,
});

export const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitionPremium(0.72),
  },
};

export const staggerChildren = (stagger = 0.06, delayChildren = 0.08) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: stagger, delayChildren },
  },
});

export const listItem = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitionPremium(0.6),
  },
};
