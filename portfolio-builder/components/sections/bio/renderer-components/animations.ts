import { Variants, TargetAndTransition, Transition, Easing } from "framer-motion";
import type { BioAnimations } from "@/portfolio-builder/types/bio";

export function resolveEasing(easing: string): Easing {
  switch (easing) {
    case "easeOut":
      return [0.0, 0.0, 0.2, 1];
    case "easeIn":
      return [0.4, 0, 1, 1];
    case "easeInOut":
      return [0.4, 0, 0.2, 1];
    case "linear":
      return "linear";
    case "anticipate":
      return [0.36, 0, 0.66, -0.56];
    case "spring":
      return [0.34, 1.56, 0.64, 1];
    default:
      return [0.0, 0.0, 0.2, 1];
  }
}
export function buildVariants(anim: BioAnimations): Variants {
  const ease = resolveEasing(anim.easing ?? "easeOut");
  const duration = anim.duration ?? 0.6;
  const isSpring = anim.easing === "spring";

  const transition: Transition = isSpring
    ? { type: "spring" as const, stiffness: 260, damping: 20, duration }
    : { ease, duration };

  const hidden: TargetAndTransition = { opacity: 0 };
  const visible: TargetAndTransition = { opacity: 1 };

  switch (anim.preset) {
    case "slideUp":
      hidden.y = 40;
      visible.y = 0;
      break;
    case "slideDown":
      hidden.y = -40;
      visible.y = 0;
      break;
    case "slideLeft":
      hidden.x = -60;
      visible.x = 0;
      break;
    case "slideRight":
      hidden.x = 60;
      visible.x = 0;
      break;
    case "scaleUp":
      hidden.scale = 0.85;
      visible.scale = 1;
      break;
    case "blurIn":
      hidden.filter = "blur(12px)";
      hidden.scale = 1.02;
      visible.filter = "blur(0px)";
      visible.scale = 1;
      break;
    case "fadeIn":
    default:
      break;
  }

  return {
    hidden,
    visible: {
      ...visible,
      transition,
    },
  };
}

export function buildContainerVariants(anim: BioAnimations): Variants {
  const initialDelay = anim.delay ?? 0.1;
  const stagger = anim.staggerChildren ? (anim.staggerDelay ?? 0.12) : 0;

  return {
    hidden: {},
    visible: {
      transition: {
        delayChildren: initialDelay,
        staggerChildren: stagger,
      },
    },
  };
}
