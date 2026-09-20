import { useLanguage } from "@/i18n/language";
import { useEffect, useRef, useState } from "react";
import { type MotionValue, useReducedMotion } from "motion/react";

export function ToothHeroScene({ progress }: { progress: MotionValue<number> }) {
  const { t } = useLanguage();
  const host = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let stopped = false, started = false;
    let cleanup: (() => void) | undefined;
    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting || started) return;
      started = true;
      try {
        const { mountToothParticles } = await import("./tooth-particle-renderer");
        if (stopped) return;
        cleanup = await mountToothParticles(element, progress, !!reduceMotion, () => { if (!stopped) setReady(true); }, () => { if (!stopped) setReady(false); });
        if (stopped) cleanup();
      } catch { /* WebGL unavailable; CSS backdrop remains. */ }
    }, { rootMargin: "240px" });
    observer.observe(element);
    return () => { stopped = true; observer.disconnect(); cleanup?.(); };
  }, [progress, reduceMotion]);
  return <div className={`tooth-scene ${ready ? "is-ready" : ""}`} ref={host} role="img" aria-label={t("A sculptural tooth formed from thousands of luminous particles, dissolving as you scroll")}>
    <div className="tooth-scene-aura" aria-hidden="true" />
    <div className="tooth-scene-glow" aria-hidden="true" />
  </div>;
}
