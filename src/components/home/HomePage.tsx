import { CLINIC, NAV_LINKS, SERVICES, PRINCIPLES, PROCESS, TEAM, PRICES, REVIEWS, FAQS, RESULT_CASES } from "@/i18n/clinic";
import { LanguageProvider, LanguageSwitcher, useLanguage } from "@/i18n/language";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import {
  ArrowDown, ArrowRight, Clock, Menu, Minus, Phone, Plus, X,
} from "lucide-react";
import { AlignerScene } from "./AlignerScene";
import { ToothHeroScene } from "./ToothHeroScene";
import studioConcept from "@/assets/campaign/studio-concept.webp";
import { useCinematicScroll } from "@/hooks/use-cinematic-scroll";

function useDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return desktop;
}

function SectionTag({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <div className={`section-tag ${light ? "section-tag-light" : ""}`}><span />{children}</div>;
}

function ArrowLink({ href, children, inverse = false }: { href: string; children: ReactNode; inverse?: boolean }) {
  return <a href={href} className={`arrow-link ${inverse ? "arrow-link-inverse" : ""}`}><span>{children}</span><span className="arrow-link-icon" aria-hidden="true"><ArrowRight /></span></a>;
}

function Brand() {
  const { t } = useLanguage();
  return <a href="#top" className="brand" aria-label={t("{name} home", {name: CLINIC.name})}><span className="brand-wordmark"><strong>{CLINIC.brand}</strong><small>{t(CLINIC.descriptor)}</small></span></a>;
}

function Nav() {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [surface, setSurface] = useState<"default" | "blue">("default");
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 40);
      const header = document.querySelector<HTMLElement>(".site-nav");
      const probeY = Math.min(window.innerHeight - 1, (header?.getBoundingClientRect().bottom ?? 96) + 4);
      const behind = document.elementFromPoint(window.innerWidth / 2, probeY);
      const blueBackground = Boolean(behind?.closest(".final-cta"));
      setSurface(blueBackground ? "blue" : "default");
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const background = Array.from(document.querySelectorAll<HTMLElement>("main, .site-footer, .mobile-actions"));
    const previousInert = background.map((element) => element.inert);
    background.forEach((element) => { element.inert = true; });
    const controls = () => [menuButtonRef.current, ...Array.from(menuRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [])].filter((item): item is HTMLElement => item !== null);
    menuRef.current?.querySelector<HTMLElement>("button, a[href]")?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setOpen(false); }
      if (event.key === "Tab") {
        const items = controls();
        const index = items.indexOf(document.activeElement as HTMLElement);
        event.preventDefault();
        items[(index + (event.shiftKey ? -1 : 1) + items.length) % items.length]?.focus();
      }
    };
    const keepFocus = (event: FocusEvent) => {
      if (!controls().includes(event.target as HTMLElement)) controls()[1]?.focus();
    };
    const desktopQuery = window.matchMedia("(min-width: 1400px)");
    const closeOnDesktop = () => { if (desktopQuery.matches) setOpen(false); };
    window.addEventListener("keydown", keydown);
    document.addEventListener("focusin", keepFocus);
    desktopQuery.addEventListener("change", closeOnDesktop);
    return () => {
      document.body.style.overflow = previous;
      background.forEach((element, index) => { element.inert = previousInert[index]; });
      window.removeEventListener("keydown", keydown);
      document.removeEventListener("focusin", keepFocus);
      desktopQuery.removeEventListener("change", closeOnDesktop);
      menuButtonRef.current?.focus();
    };
  }, [open]);
  const closeAndGo = (href: string) => {
    setOpen(false);
    window.setTimeout(() => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" }), 80);
  };
  return <>
    <div className="demo-bar"><a href="/terms.html">{t("Demo website · Fictional clinic & content")}</a></div>
    <header className={`site-nav site-nav-over-${surface} ${scrolled ? "site-nav-scrolled" : ""}`}>
      <Brand />
      <nav className="desktop-nav" aria-label={t("Primary navigation")}>{NAV_LINKS.map((item) => <a key={item.href} href={item.href}>{t(item.label)}</a>)}</nav>
      <div className="nav-actions"><LanguageSwitcher /><a className="nav-phone" href={`tel:${CLINIC.phoneRaw}`}>{CLINIC.phone}</a><ArrowLink href="#contact" inverse>{t("Let’s Talk")}</ArrowLink></div>
      <button ref={menuButtonRef} type="button" aria-controls="mobile-navigation" className="menu-button" aria-label={t(open ? "Close menu" : "Open menu")} aria-expanded={open} onClick={() => setOpen((value) => !value)}>{open ? <X /> : <Menu />}</button>
    </header>
    {mounted && createPortal(<AnimatePresence>{open && <motion.div ref={menuRef} id="mobile-navigation" className="mobile-menu" role="dialog" aria-modal="true" aria-label={t("Mobile navigation")} initial={{ clipPath: "circle(0% at calc(100% - 42px) 62px)" }} animate={{ clipPath: "circle(150% at calc(100% - 42px) 62px)" }} exit={{ clipPath: "circle(0% at calc(100% - 42px) 62px)" }} transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}>
      <div className="mobile-menu-links mobile-menu-links-top">{NAV_LINKS.map((item, index) => <motion.button type="button" key={item.href} onClick={() => closeAndGo(item.href)} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18 + index * 0.06 }}><span>0{index + 1}</span>{t(item.label)}</motion.button>)}</div>
      <LanguageSwitcher mobile /><div className="mobile-menu-footer"><a href={`tel:${CLINIC.phoneRaw}`} onClick={() => setOpen(false)}><Phone /> {CLINIC.phone}</a><button type="button" onClick={() => closeAndGo("#contact")}>{t("Schedule a consultation")} <ArrowRight /></button></div>
    </motion.div>}</AnimatePresence>, document.body)}
  </>;
}

function Hero() {
  const { t } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -96]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.4, 0.68], [1, 1, 0]);
  const titleScale = useTransform(scrollYProgress, [0, 0.6], [1, 1.12]);
  const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return <section ref={ref} id="top" className="hero-shell"><div className="hero-sticky">
    <div className="hero-ambient" aria-hidden="true" />
    <ToothHeroScene progress={scrollYProgress} />
    <div className="hero-vignette" aria-hidden="true" />
    <motion.div className="hero-content" style={reduceMotion ? undefined : { y: copyY, opacity: copyOpacity }}>
      <motion.div className="hero-title-wrap" style={reduceMotion ? undefined : { scale: titleScale }}>
        <div className="hero-kicker"><span>{t("New York, NY")}</span><span>{t("Cosmetic & restorative dentistry")}</span></div>
        <h1 className="hero-title"><span>{t("A natural smile.")}</span><em>{t("Designed around you.")}</em></h1>
      </motion.div>
      <div className="hero-lower">
        <p>{t("Personalized care, clear options, and precise planning—so every decision feels informed and every result still feels like you.")}</p>
        <div className="hero-actions"><a href="#contact" className="hero-cta"><span>{t("Schedule a consultation")}</span><ArrowRight /></a><a href="#services" className="text-link hero-explore">{t("Explore treatments")} <ArrowDown /></a></div>
        <div className="hero-trust" aria-label={t("What to expect")}><span>{t("Clear estimates")}</span><span>{t("Coordinated specialists")}</span><span>{t("Unhurried visits")}</span></div>
      </div>
    </motion.div>
    <div className="hero-progress" aria-hidden="true"><span>{t("Scroll")}</span><i><motion.b style={reduceMotion ? undefined : { scaleX: progressScale }} /></i><span>01</span></div>
  </div></section>;
}

function CinematicStatement() {
  const { t } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const precisionOpacity = useTransform(scrollYProgress, [0, 0.06, 0.25, 0.35], [0, 1, 1, 0]);
  const precisionScale = useTransform(scrollYProgress, [0, 0.35], [0.76, 1.22]);
  const technologyOpacity = useTransform(scrollYProgress, [0.28, 0.4, 0.58, 0.68], [0, 1, 1, 0]);
  const technologyX = useTransform(scrollYProgress, [0.28, 0.68], [-180, 120]);
  const aestheticsOpacity = useTransform(scrollYProgress, [0.62, 0.74, 0.96], [0, 1, 1]);
  const aestheticsY = useTransform(scrollYProgress, [0.62, 1], [130, -40]);
  const words = [
    { word: "Precision.", className: "statement-one", style: { opacity: precisionOpacity, scale: precisionScale } },
    { word: "Technology.", className: "statement-two", style: { opacity: technologyOpacity, x: technologyX } },
    { word: "Aesthetics.", className: "statement-three", style: { opacity: aestheticsOpacity, y: aestheticsY } },
  ];
  return <section ref={ref} className={`cinematic-statement ${reduceMotion ? "reduced" : ""}`}><div className="statement-sticky"><div className="statement-grid" aria-hidden="true" /><p className="statement-context">{t("Three ideas.")}<br />{t("One connected standard of care.")}</p><div className="statement-words">{words.map((item) => <motion.span key={item.word} className={item.className} style={reduceMotion ? undefined : item.style}>{t(item.word)}</motion.span>)}</div><motion.div className="statement-line" style={reduceMotion ? undefined : { scaleX: scrollYProgress }} /></div></section>;
}

function Services({ onSelectService }: { onSelectService: (service: string) => void }) {
  const { t } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const desktop = useDesktop();
  const canPin = desktop && !reduceMotion;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-78%"]);
  return <section ref={ref} id="services" className={`horizontal-section services-section ${canPin ? "is-pinned" : ""}`}><div className="horizontal-sticky">
    <div className="rail-heading"><SectionTag>{t("01 · Treatments")}</SectionTag><h2>{t("Care, composed")}<br /><em>{t("for real life.")}</em></h2><p>{t("Every treatment begins with a clear view of the whole—not a one-size-fits-all solution.")}</p></div>
    <div className="rail-scroll" aria-label={t("Treatments")}><motion.div className="services-track" style={canPin ? { x } : undefined}>{SERVICES.map((service, index) => { const Icon = service.icon; return <article className="service-card" key={service.title}><div className="service-card-top"><span className="service-number">0{index + 1}</span><Icon aria-hidden="true" /></div><div><p className="service-eyebrow">{t(service.eyebrow)}</p><h3>{t(service.title)}</h3><p className="service-copy">{t(service.copy)}</p></div><div className="service-card-bottom"><span>{t(service.detail)}</span><a href="#contact" onClick={() => onSelectService(service.title)} aria-label={t("Ask about {service}", {service: t(service.title)})}><ArrowRight /></a></div></article>; })}</motion.div></div>
    <div className="rail-progress" aria-hidden="true"><motion.i style={canPin ? { scaleX: scrollYProgress } : undefined} /></div>
  </div></section>;
}

function Approach() {
  const { t } = useLanguage();
  return <section id="approach" className="approach-section"><div className="approach-intro"><SectionTag>{t("02 · Our approach")}</SectionTag><h2>{t("High-tech care.")}<br /><em>{t("Low-pressure experience.")}</em></h2></div><div className="approach-layout">
    <div className="approach-visual-wrap"><div className="approach-visual"><img src={studioConcept} alt={t("Refined dental consultation studio")} width={1536} height={1024} loading="lazy" /></div></div>
    <div className="principle-list">{PRINCIPLES.map((principle, index) => <motion.article key={principle.number} className="principle" initial={{ opacity: 0, x: index % 2 ? 60 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-18%" }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}><span>{principle.number}</span><h3>{t(principle.title)}</h3><p>{t(principle.copy)}</p></motion.article>)}</div>
  </div></section>;
}

function SmileArchitecture() {
  const { t } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const desktop = useDesktop();
  const canPin = desktop && !reduceMotion;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-79%"]);
  return <section ref={ref} className={`horizontal-section process-section process-aligner ${canPin ? "is-pinned" : ""}`}><div className="horizontal-sticky process-sticky">
    <AlignerScene progress={scrollYProgress} />
    <div className="process-heading"><SectionTag light>{t("03 · The process")}</SectionTag><h2>{t("The architecture")}<br />{t("of a smile.")}</h2><p>{t("Conceptual imagery—not before-and-after evidence.")}</p></div>
    <div className="rail-scroll process-scroll" aria-label={t("Care process")}><motion.div className="process-track" style={canPin ? { x } : undefined}>{PROCESS.map((step) => <article className="process-card" key={step.number}><span>{step.number}</span><p>{t(step.label)}</p><h3>{t(step.title)}</h3><div><i />{t(step.copy)}</div></article>)}</motion.div></div>
  </div></section>;
}

function Team() {
  const { t } = useLanguage();
  return <section id="team" className="team-section"><div className="team-heading"><SectionTag>{t("04 · Clinical team")}</SectionTag><h2>{t("Clinical expertise,")}<br /><em>{t("thoughtfully delivered.")}</em></h2></div><div className="team-grid">{TEAM.map((member, index) => <motion.article key={member.name} className="team-card" initial={{ opacity: 0, y: 54 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-12%" }} transition={{ duration: 0.85, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}><div className="team-portrait"><img src={member.portrait} alt={`${t(member.name)}, ${t(member.role)}`} width={1200} height={1500} loading="lazy" /><span>0{index + 1}</span></div><div className="team-card-copy"><div><h3>{t(member.name)}</h3><p>{t(member.role)}</p></div><a href="#contact" aria-label={t("Request an appointment with {name}", {name: t(member.name)})}><ArrowRight /></a><p>{t(member.note)}</p></div></motion.article>)}</div></section>;
}

function BeforeAfterCard({ title, detail, before, after, index }: { title: string; detail: string; before: string; after: string; index: number }) {
  const { t } = useLanguage();
  const [position, setPosition] = useState(50);
  return <motion.article className="result-card" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-12%" }} transition={{ duration: .75, delay: index * .06, ease: [0.22, 1, 0.36, 1] }}>
    <div className="before-after">
      <img src={before} alt={t("{title} concept before view", {title: t(title)})} width={1100} height={700} loading="lazy" />
      <div className="after-layer" style={{ clipPath: `inset(0 0 0 ${position}%)` }}><img src={after} alt={t("{title} concept after view", {title: t(title)})} width={1100} height={700} loading="lazy" /></div>
      <span className="result-label result-label-before">{t("Before")}</span><span className="result-label result-label-after">{t("After")}</span>
      <div className="result-handle" style={{ left: `${position}%` }} aria-hidden="true"><i><ArrowRight /><ArrowRight /></i></div>
      <input type="range" min="0" max="100" value={position} onChange={(event) => setPosition(Number(event.target.value))} aria-label={t("Compare before and after for {title}", {title: t(title)})} />
    </div>
    <div className="result-card-copy"><span>0{index + 1}</span><div><h3>{t(title)}</h3><p>{t(detail)}</p></div><small>{t("Interactive demo")}</small></div>
  </motion.article>;
}

function Results() {
  const { t } = useLanguage();
  return <section id="gallery" className="results-section">
    <div className="results-heading"><SectionTag light>{t("05 · Results")}</SectionTag><h2>{t("Before / after.")}<br /><em>{t("See the difference.")}</em></h2></div>
    <div className="results-grid">{RESULT_CASES.map((item, index) => <BeforeAfterCard key={item.title} {...item} index={index} />)}</div>
  </section>;
}

function Pricing({ onSelectService }: { onSelectService: (service: string) => void }) {
  const { t } = useLanguage();
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const groups = [
    { title: "First visit", note: "A clear place to begin.", entries: PRICES.slice(0, 2) },
    { title: "Everyday care", note: "Keep your smile feeling its best.", entries: PRICES.slice(2, 3) },
    { title: "Smile transformations", note: "Thoughtful changes, made for you.", entries: PRICES.slice(3) },
  ];
  return <section id="pricing" className="fee-section fee-dark" aria-labelledby="fee-title">
    <div className="fee-dark-intro"><SectionTag light>{t("06 · Pricing")}</SectionTag><h2 id="fee-title">{t("Clear costs.")}<br /><em>{t("Considered care.")}</em></h2><p>{t("Explore your options.")}<br />{t("Plan your next step.")}</p><ArrowLink href="#contact" inverse>{t("Discuss your options")}</ArrowLink><small>{t("Illustrative demo fees in USD. Your final estimate depends on your individual care plan.")}</small></div>
    <div className="fee-workspace">
      <div className="fee-tabs" role="tablist" aria-label={t("Treatment pricing categories")}>{groups.map((group, index) => <button type="button" role="tab" id={`fee-tab-${index}`} aria-controls={`fee-panel-${index}`} aria-selected={active === index} tabIndex={active === index ? 0 : -1} key={group.title} ref={(element) => { tabs.current[index] = element; }} onClick={() => setActive(index)} onKeyDown={(event) => {
        let next = index;
        if (event.key === "ArrowRight") next = (index + 1) % groups.length;
        else if (event.key === "ArrowLeft") next = (index + groups.length - 1) % groups.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = groups.length - 1;
        else return;
        event.preventDefault(); setActive(next); tabs.current[next]?.focus();
      }}><span>0{index + 1}</span>{t(group.title)}</button>)}</div>
      {groups.map((group, index) => <div key={group.title} role="tabpanel" id={`fee-panel-${index}`} aria-labelledby={`fee-tab-${index}`} hidden={active !== index} tabIndex={0}>
        {active === index && <motion.div key={index} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .28 }}>
          <div className="fee-panel-caption"><p>{t(group.note)}</p><span>{group.entries.length} {t(group.entries.length === 1 ? "service" : group.entries.length < 5 ? "servicesFew" : "services")}</span></div>
          <div className="fee-items">{group.entries.map(([name, price, time]) => <a className="fee-item" href="#contact" key={name} onClick={() => onSelectService(name)} aria-label={t("Discuss {name}, {price}", {name: t(name), price: t(price)})}>
            <span className="fee-service"><strong>{t(name)}</strong><small>{t(time)}</small></span>
            <span className="fee-amount">{price.startsWith("From ") && <small>{t("From")}</small>}<b>{price.replace("From ", "")}</b></span><span className="fee-arrow" aria-hidden="true"><ArrowRight /></span>
          </a>)}</div>
        </motion.div>}
      </div>)}
    </div>
  </section>;
}

function Testimonials() {
  const { t } = useLanguage();
  const repeated = [...REVIEWS, ...REVIEWS];
  return <section className="reviews-section" aria-labelledby="reviews-title"><div className="reviews-heading"><SectionTag>{t("07 · Patient perspective")}</SectionTag><h2 id="reviews-title">{t("What care")}<br /><em>{t("should feel like.")}</em></h2></div><div className="review-marquee"><div className="review-track">{repeated.map((review, index) => <article className="review-card" key={`${review.name}-${index}`} aria-hidden={index >= REVIEWS.length}><div className="quote-mark">“</div><blockquote>{t(review.quote)}</blockquote><footer><span>{t(review.name)}</span><small>{t(review.treatment)}</small></footer></article>)}</div></div></section>;
}

function FAQ() {
  const { t } = useLanguage();
  const [active, setActive] = useState(0);
  return <section id="faq" className="faq-section"><div className="faq-heading"><SectionTag>{t("08 · Before your visit")}</SectionTag><h2>{t("Questions,")}<br /><em>{t("answered clearly.")}</em></h2><p>{t("Still deciding? Call the office and talk through what you need before scheduling.")}</p><a href={`tel:${CLINIC.phoneRaw}`} className="faq-phone"><Phone /> {CLINIC.phone}</a></div><div className="faq-list">{FAQS.map((item, index) => { const open = active === index; return <article className={`faq-item ${open ? "open" : ""}`} key={item.q}><button type="button" onClick={() => setActive(open ? -1 : index)} aria-expanded={open}><span>0{index + 1}</span><strong>{t(item.q)}</strong>{open ? <Minus /> : <Plus />}</button><AnimatePresence initial={false}>{open && <motion.div className="faq-answer" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35 }}><p>{t(item.a)}</p></motion.div>}</AnimatePresence></article>; })}</div></section>;
}

function FinalCTA() {
  const { t } = useLanguage();
  return <section className="final-cta"><div className="cta-orbit cta-orbit-one" aria-hidden="true" /><div className="cta-orbit cta-orbit-two" aria-hidden="true" /><span className="cta-label">{t("A more considered dental experience")}</span><h2>{t("A smile you’ll")}<br /><em>{t("want to show.")}</em></h2><p>{t("Start with a conversation. We’ll help you understand the options without rushing the decision.")}</p><div className="cta-actions"><ArrowLink href="#contact" inverse>{t("Start a Conversation")}</ArrowLink><a href={`tel:${CLINIC.phoneRaw}`} className="cta-call"><Phone /> {t("Call the Office")}</a></div></section>;
}

function Contact({ service, setService }: { service: string; setService: (service: string) => void }) {
  const { t } = useLanguage();
  const [timing, setTiming] = useState("Within the next two weeks");
  const [feedback, setFeedback] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [smsSeparator, setSmsSeparator] = useState("?");
  useEffect(() => {
    if (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) setSmsSeparator("&");
  }, []);
  const message = t("Hello! I’m trying the {clinic} website demo. Treatment interest: {service}. Preferred timing: {timing}. I’d like to discuss the available options.", {clinic: CLINIC.name, service: t(service), timing: t(timing)});
  const encoded = encodeURIComponent(message);
  const copyMessage = async () => {
    try { await navigator.clipboard.writeText(message); setFeedback("Copied — paste it into your messaging app if needed."); }
    catch { setFeedback("Select the message below and copy it manually."); }
  };
  return <section id="contact" className="contact-section">
    <div className="contact-copy"><SectionTag>{t("09 · Contact")}</SectionTag><h2>{t("Let’s plan")}<br /><em>{t("your next step.")}</em></h2><p>{t("A treatment in mind? Choose what interests you and when you’d like to begin.")}</p>
      <div className="contact-details"><a href={`tel:${CLINIC.phoneRaw}`}><Phone /><span><small>{t("Demo contact")}</small>{CLINIC.phone}</span></a><div><Clock /><span><small>{t("At your pace")}</small>{t("Choose a time frame that works for you.")}</span></div></div>
    </div>
    <div className="contact-form-wrap conversation-builder contact-refined">
      <div className="form-heading"><span>{t("Let’s talk.")}</span><small>{t("Two details to get started")}</small></div>
      <label><span>{t("Treatment interest")}</span><select value={service} onChange={(e) => setService(e.target.value)}><option value={"General consultation"}>{t("General consultation")}</option>{Array.from(new Set([...SERVICES.map((item) => item.title), ...PRICES.map(([name]) => name)])).map((name) => <option key={name} value={name}>{t(name)}</option>)}</select></label>
      <label><span>{t("Preferred timing")}</span><select value={timing} onChange={(e) => setTiming(e.target.value)}><option value={"First available"}>{t("First available")}</option><option value={"Within the next two weeks"}>{t("Within the next two weeks")}</option><option value={"This month"}>{t("This month")}</option><option value={"I’m flexible"}>{t("I’m flexible")}</option></select></label>
      <button ref={trigger} type="button" className="submit-button" onClick={() => { setFeedback(""); dialog.current?.showModal(); }}><span>{t("Send message")}</span><i><ArrowRight /></i></button>
      <p className="message-notice">{t("Choose SMS or WhatsApp in the next step. Review and send your message in the app.")}</p>
      <p className="message-notice contact-fineprint">{t("Demo contact, not a dental practice. No appointment is booked.")} <a href="/privacy-policy.html">{t("Privacy")}</a> · <a href="/terms.html">{t("Terms")}</a></p>
    </div>
    <dialog ref={dialog} className="contact-channel-dialog" aria-labelledby="channel-title" aria-describedby="channel-description" onClose={() => trigger.current?.focus()} onClick={(e) => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
      <div className="channel-dialog-inner">
        <button type="button" className="channel-close" onClick={() => dialog.current?.close()} aria-label={t("Close messaging options")}><X /></button>
        <span className="channel-eyebrow">{t("Your message is ready")}</span><h3 id="channel-title">{t("Where shall we")}<br /><em>{t("continue?")}</em></h3>
        <p id="channel-description">{t("Open an app to review and send to the demo owner at {phone}.", {phone: CLINIC.phone})}</p>
        <div className="channel-links"><a href={`sms:${CLINIC.phoneRaw}${smsSeparator}body=${encoded}`}><Phone /><span>{t("SMS / Text")}<small>{t("Open your messaging app")}</small></span><ArrowRight /></a><a href={`https://wa.me/${CLINIC.phoneRaw.replace(/\D/g, "")}?text=${encoded}`} target="_blank" rel="noopener noreferrer"><ArrowRight /><span>{t("WhatsApp")}<small>{t("Continue in WhatsApp")}</small></span><ArrowRight /></a></div>
        <details className="channel-preview"><summary>{t("View prepared message")}</summary><p>{message}</p></details>
        <button className="channel-copy" type="button" onClick={copyMessage}>{t("App didn’t open? Copy message")}</button><p role="status" className="message-feedback">{t(feedback)}</p>
        <p className="channel-note">{t("Nothing is sent automatically. Please don’t include sensitive medical information. SMS charges may apply.")}</p>
      </div>
    </dialog>
  </section>;
}
function Footer() {
  const { t } = useLanguage();
  return <footer className="site-footer"><div className="footer-top"><Brand /><p>{t("Modern dentistry, designed around the person.")}</p><a href="#top">{t("Back to top")} <ArrowRight /></a></div><div className="footer-grid"><div><small>{t("Explore")}</small>{NAV_LINKS.map((item) => <a key={item.href} href={item.href}>{t(item.label)}</a>)}</div><div><small>{t("Contact")}</small><a href={`tel:${CLINIC.phoneRaw}`}>{CLINIC.phone}</a><a href="#contact">{CLINIC.email}</a><span>{t(CLINIC.address)}</span></div><div><small>{t("Office hours")}</small><span>{t(CLINIC.hours)}</span><a href="#contact">{t("Start a Conversation")}</a></div></div><div className="footer-bottom"><span>© 2026 {CLINIC.name} {t("demo")}</span><span>{t("U.S. demo content · Verify all business details before publication")}</span><div><a href="/privacy-policy.html" target="_blank">{t("Privacy")}</a><a href="/terms.html" target="_blank">{t("Terms")}</a></div></div></footer>;
}

function MobileActions() {
  const { t } = useLanguage();
  return <div className="mobile-actions"><a href={`tel:${CLINIC.phoneRaw}`}><Phone />{t("Call")}</a><a href="#contact">{t("Message")}<ArrowRight /></a></div>;
}

export function HomePage() {
  const [service, setService] = useState("General consultation");
  return <LanguageProvider><HomeExperience service={service} setService={setService} /></LanguageProvider>;
}

function HomeExperience({ service, setService }: { service: string; setService: (service: string) => void }) {
  useCinematicScroll();
  return <div className="site-shell"><Nav /><main><Hero /><CinematicStatement /><Services onSelectService={setService} /><Approach /><SmileArchitecture /><Team /><Results /><Pricing onSelectService={setService} /><Testimonials /><FAQ /><FinalCTA /><Contact service={service} setService={setService} /></main><Footer /><MobileActions /></div>;
}
