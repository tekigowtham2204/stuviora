"use client";

import { useEffect } from "react";

/**
 * j/k/enter keyboard navigation over elements marked data-keynav
 * (audit #39). j = next, k = previous, Enter = open. Skips when focus
 * is in an input so typing is never hijacked.
 */
export function KeyNav() {
  useEffect(() => {
    let index = -1;
    function items(): HTMLAnchorElement[] {
      return Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-keynav]"));
    }
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable) return;
      const list = items();
      if (list.length === 0) return;
      if (e.key === "j" || e.key === "k") {
        index = e.key === "j" ? Math.min(index + 1, list.length - 1) : Math.max(index - 1, 0);
        list[index].focus();
        list[index].scrollIntoView({ block: "nearest" });
        e.preventDefault();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}
