// === iOS-style Easing & Springs ===
export const iosEasing = [0.4, 0, 0.2, 1] as const
export const iosEasingSharp = [0.4, 0, 0.2, 1] as const

export const iosSpring = {
  type: "spring" as const,
  damping: 30,
  stiffness: 300,
  mass: 0.8,
  restDelta: 0.001,
}

export const iosSpringSoft = {
  type: "spring" as const,
  damping: 25,
  stiffness: 200,
  mass: 0.9,
  restDelta: 0.001,
}

export const iosSpringBouncy = {
  type: "spring" as const,
  damping: 20,
  stiffness: 250,
  mass: 0.7,
  restDelta: 0.001,
}

export const iosSpringSnappy = {
  type: "spring" as const,
  damping: 35,
  stiffness: 400,
  mass: 0.6,
  restDelta: 0.001,
}

// === Animaciones base ===
export const fadeInUp = {
  hidden: { opacity: 0, y: 40, scale: 0.96, filter: "blur(8px)", rotateX: 10 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    rotateX: 0,
    transition: iosSpring,
  },
}

export const fadeIn = {
  hidden: { opacity: 0, scale: 0.94, filter: "blur(10px)", y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    y: 0,
    transition: iosSpringSoft,
  },
}

export const slideUp = {
  hidden: { opacity: 0, y: 60, filter: "blur(8px)", scale: 0.98 },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", scale: 1, transition: iosSpring },
}

export const slideInLeft = {
  hidden: { opacity: 0, x: -60, filter: "blur(6px)", scale: 0.98 },
  visible: { opacity: 1, x: 0, filter: "blur(0px)", scale: 1, transition: iosSpring },
}

export const slideInRight = {
  hidden: { opacity: 0, x: 60, filter: "blur(6px)", scale: 0.98 },
  visible: { opacity: 1, x: 0, filter: "blur(0px)", scale: 1, transition: iosSpring },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.8, filter: "blur(12px)", rotateY: 15 },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    rotateY: 0,
    transition: iosSpringBouncy,
  },
}

// === Staggers ===
export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
}

export const staggerContainerSlow = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
}

// === Hover & Tap ===
export const hoverScale = {
  scale: 1.02,
  y: -2,
  transition: { type: "spring", damping: 20, stiffness: 300, mass: 0.8 },
}

export const tapScale = {
  scale: 0.98,
  y: 0,
  transition: { type: "spring", damping: 25, stiffness: 400, mass: 0.6 },
}

export const hoverGlow = {
  boxShadow: "0 20px 40px rgba(0, 122, 255, 0.15), 0 8px 16px rgba(0, 122, 255, 0.1)",
  transition: { duration: 0.3, ease: iosEasing },
}

export const hoverLift = {
  y: -8,
  scale: 1.02,
  boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15), 0 10px 20px rgba(0, 0, 0, 0.1)",
  transition: { type: "spring", damping: 20, stiffness: 300, mass: 0.8 },
}

export const hoverRotate = {
  rotateY: 5,
  rotateX: 5,
  scale: 1.02,
  transition: { type: "spring", damping: 20, stiffness: 200, mass: 0.9 },
}

// === Parallax & Floating ===
export const parallaxSlow = {
  y: [0, -50],
  transition: { duration: 2, ease: "linear", repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" as const },
}

export const parallaxMedium = {
  y: [0, -30],
  transition: { duration: 1.5, ease: "linear", repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" as const },
}

export const floatingAnimation = {
  y: [0, -10, 0],
  transition: { duration: 3, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY },
}

export const floatingAnimationAdvanced = {
  y: [0, -12, 0],
  rotate: [0, 2, 0, -2, 0],
  transition: { duration: 4, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY },
}

// === Modal & Overlay ===
export const modalBackdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: iosEasing } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: iosEasingSharp } },
}

export const modalContent = {
  hidden: { opacity: 0, scale: 0.9, y: 20, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: iosSpringBouncy,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    filter: "blur(4px)",
    transition: { duration: 0.2, ease: iosEasingSharp },
  },
}

// === Page & Section transitions ===
export const pageTransition = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: iosEasing, staggerChildren: 0.1 },
  },
  exit: {
    opacity: 0,
    y: -20,
    filter: "blur(6px)",
    transition: { duration: 0.3, ease: iosEasingSharp },
  },
}

export const sectionTransition = {
  hidden: { opacity: 0, y: 60, scale: 0.95, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { type: "spring", damping: 25, stiffness: 200, mass: 0.9, restDelta: 0.001 },
  },
}
