import { useLanguage } from "@/i18n/language";
import { useEffect, useRef, useState } from "react";
import { type MotionValue, useReducedMotion } from "motion/react";
import ceramic from "@/assets/campaign/ceramic-study-v3.webp";

export function AlignerScene({ progress }: { progress: MotionValue<number> }) {
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
        const { mountAligner } = await import("./aligner-renderer");
        if (stopped) return;
        cleanup = await mountAligner(element, progress, !!reduceMotion, () => { if (!stopped) setReady(true); }, () => { if (!stopped) setReady(false); });
        if (stopped) cleanup();
      } catch { /* Keep the existing ceramic image if 3D cannot load. */ }
    }, { rootMargin: "240px" });
    observer.observe(element);
    return () => { stopped = true; observer.disconnect(); cleanup?.(); };
  }, [progress, reduceMotion]);
  return <div className={`aligner-scene ${ready ? "is-ready" : ""}`} ref={host} role="img" aria-label={t("Illustrative 3D dental arch with a clear aligner lifting gently as you scroll")}>
    <img className="aligner-fallback" src={ceramic} alt="" loading="lazy" width={1800} height={1125} />
  </div>;
}
