"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Scroll-reveal primitive. Enters on view with a subtle rise + fade.
 * - Never animates from scale(0) (starts at 0.99 + opacity).
 * - Honors prefers-reduced-motion (degrades to static).
 * - `index` adds a short stagger (30-80ms range) for lists.
 */
export function Reveal({
  children,
  index = 0,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  index?: number;
  className?: string;
  as?: "div" | "li" | "section";
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      initial={reduce ? false : { opacity: 0, y: 16, scale: 0.99 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.05, 0.3),
        ease: [0.23, 1, 0.32, 1],
      }}
    >
      {children}
    </MotionTag>
  );
}
