// portfolio-builder/components/sections/hero/renderer-components/animations.ts

import {
  Variants,
  HTMLMotionProps,
  Transition,
  TargetAndTransition,
  Easing,
} from "framer-motion";
import type {
  HeroAnimations,
  AnimationEasing,
} from "@/portfolio-builder/types/hero";

export function resolveEasing(easing: AnimationEasing): Easing {
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
export function buildVariants(anim: HeroAnimations): Variants {
  const ease = resolveEasing(anim.easing ?? "easeOut");
  const duration = anim.duration ?? 0.6;
  const isSpring = anim.easing === "spring";

  const transition: Transition = isSpring
    ? { type: "spring", stiffness: 260, damping: 20, duration }
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
    case "scaleDown":
      hidden.scale = 1.15;
      visible.scale = 1;
      break;
    case "blurIn":
      hidden.filter = "blur(12px)";
      hidden.scale = 1.02;
      visible.filter = "blur(0px)";
      visible.scale = 1;
      break;
    case "rotateIn":
      hidden.rotate = -8;
      hidden.scale = 0.9;
      visible.rotate = 0;
      visible.scale = 1;
      break;
    case "flipUp":
      hidden.rotateX = 60;
      hidden.y = 20;
      visible.rotateX = 0;
      visible.y = 0;
      break;
    case "bounceIn":
      hidden.scale = 0.3;
      hidden.opacity = 0;
      visible.scale = 1;
      visible.opacity = 1;
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

export function buildContainerVariants(anim: HeroAnimations): Variants {
  const initialDelay = anim.delay ?? 0.1;
  const stagger = anim.staggerChildren ? (anim.staggerDelay ?? 0.12) : 0;

  return {
    hidden: {},
    visible: {
      transition: {
        delayChildren: initialDelay,
        staggerChildren: stagger,
      } satisfies Transition,
    },
  };
}

export function getHoverProps(
  anim: HeroAnimations,
): Partial<HTMLMotionProps<"div">> {
  if (!anim.hoverEffect || anim.hoverEffect === "none") return {};

  switch (anim.hoverEffect) {
    case "scale":
      return {
        whileHover: {
          scale: anim.hoverScale ?? 1.03,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 20,
          } satisfies Transition,
        },
      };
    case "lift":
      return {
        whileHover: {
          y: -6,
          scale: anim.hoverScale ?? 1.02,
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 20,
          } satisfies Transition,
        },
      };
    case "glow":
      return {
        whileHover: {
          boxShadow:
            "0 0 40px rgba(255,255,255,0.08), 0 0 80px rgba(255,255,255,0.04)",
        },
      };
    case "tilt":
      return {};
    default:
      return {};
  }
}
