import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const cinematicEase = "none";

export function useCinematicScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      lerp: 0.075,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1,
      anchors: true,
    });

    const updateScrollTrigger = () => ScrollTrigger.update();
    const tick = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", updateScrollTrigger);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const context = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        gsap.fromTo(
          ".approach-visual img",
          { yPercent: 0, scale: 1, rotate: 0 },
          {
            yPercent: -8,
            scale: 1.13,
            rotate: 1.2,
            ease: cinematicEase,
            scrollTrigger: {
              trigger: ".approach-visual-wrap",
              start: "top bottom",
              end: "bottom top",
              scrub: 1.15,
            },
          },
        );

        gsap.fromTo(
          ".approach-intro",
          { y: 0 },
          {
            y: -54,
            ease: cinematicEase,
            scrollTrigger: {
              trigger: ".approach-section",
              start: "top 75%",
              end: "top top",
              scrub: 0.9,
            },
          },
        );

        gsap.fromTo(
          ".process-heading",
          { y: 0 },
          {
            y: -46,
            ease: cinematicEase,
            scrollTrigger: {
              trigger: ".process-section",
              start: "top top",
              end: "bottom bottom",
              scrub: 1,
            },
          },
        );

        gsap.fromTo(
          ".aligner-scene",
          { yPercent: 0, scale: 1, rotate: 0 },
          {
            yPercent: -10,
            scale: 1.08,
            rotate: -1.5,
            ease: cinematicEase,
            scrollTrigger: {
              trigger: ".process-section",
              start: "top top",
              end: "bottom bottom",
              scrub: 1.1,
            },
          },
        );

        gsap.fromTo(
          ".fee-dark-intro",
          { y: 0 },
          {
            y: -52,
            ease: cinematicEase,
            scrollTrigger: {
              trigger: ".fee-dark",
              start: "top bottom",
              end: "bottom top",
              scrub: 1.1,
            },
          },
        );

        gsap.fromTo(
          ".fee-workspace",
          { y: 32 },
          {
            y: -28,
            ease: cinematicEase,
            scrollTrigger: {
              trigger: ".fee-dark",
              start: "top bottom",
              end: "bottom top",
              scrub: 1.1,
            },
          },
        );
      });

      mm.add("(max-width: 1023px)", () => {
        gsap.fromTo(
          ".approach-visual img",
          { yPercent: 0, scale: 1, rotate: 0 },
          {
            yPercent: -5,
            scale: 1.08,
            rotate: 0.6,
            ease: cinematicEase,
            scrollTrigger: {
              trigger: ".approach-visual",
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
            },
          },
        );

        gsap.fromTo(
          ".aligner-scene",
          { yPercent: 0, scale: 1 },
          {
            yPercent: -6,
            scale: 1.045,
            ease: cinematicEase,
            scrollTrigger: {
              trigger: ".process-section",
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>(".team-portrait").forEach((portrait, index) => {
        const image = portrait.querySelector("img");
        if (!image) return;
        gsap.fromTo(
          image,
          { yPercent: index % 2 === 0 ? 0 : -4, scale: 1.06, rotate: 0 },
          {
            yPercent: index % 2 === 0 ? -7 : 3,
            scale: 1.12,
            rotate: index % 2 === 0 ? -0.7 : 0.7,
            ease: cinematicEase,
            scrollTrigger: {
              trigger: portrait,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.9,
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>(".before-after").forEach((frame, index) => {
        const images = frame.querySelectorAll("img");
        gsap.fromTo(
          images,
          { scale: 1.03, xPercent: 0 },
          {
            scale: 1.1,
            xPercent: index % 2 === 0 ? 2.2 : -2.2,
            ease: cinematicEase,
            scrollTrigger: {
              trigger: frame,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.85,
            },
          },
        );
      });

      gsap.fromTo(
        ".reviews-heading",
        { x: 0 },
        {
          x: -36,
          ease: cinematicEase,
          scrollTrigger: {
            trigger: ".reviews-section",
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        },
      );

      gsap.fromTo(
        ".final-cta h2",
        { y: 0, scale: 1, rotateX: 0 },
        {
          y: -34,
          scale: 1.055,
          rotateX: -3,
          transformPerspective: 900,
          ease: cinematicEase,
          scrollTrigger: {
            trigger: ".final-cta",
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        },
      );

      gsap.fromTo(
        ".contact-copy",
        { y: 0 },
        {
          y: -38,
          ease: cinematicEase,
          scrollTrigger: {
            trigger: ".contact-section",
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        },
      );

      gsap.fromTo(
        ".contact-form-wrap",
        { y: 28 },
        {
          y: -20,
          ease: cinematicEase,
          scrollTrigger: {
            trigger: ".contact-section",
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        },
      );

      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh, { once: true });
      document.fonts?.ready.then(refresh);

      return () => {
        window.removeEventListener("load", refresh);
        mm.revert();
      };
    });

    const resizeObserver = new ResizeObserver(() => ScrollTrigger.refresh());
    const shell = document.querySelector(".site-shell");
    if (shell) resizeObserver.observe(shell);

    return () => {
      resizeObserver.disconnect();
      context.revert();
      gsap.ticker.remove(tick);
      lenis.off("scroll", updateScrollTrigger);
      lenis.destroy();
    };
  }, []);
}