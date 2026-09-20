import { ScanLine, ShieldCheck, Sparkles, Layers3, Smile, FlaskConical, type LucideIcon } from "lucide-react";
import alignerAfter from "@/assets/results/aligner-after.webp";
import alignerBefore from "@/assets/results/aligner-before.webp";
import bondingAfter from "@/assets/results/bonding-after.webp";
import bondingBefore from "@/assets/results/bonding-before.webp";
import veneersAfter from "@/assets/results/veneers-after.webp";
import veneersBefore from "@/assets/results/veneers-before.webp";
import whiteningAfter from "@/assets/results/whitening-after.webp";
import whiteningBefore from "@/assets/results/whitening-before.webp";
import ameliaPortrait from "@/assets/team/amelia-hart.webp";
import ethanPortrait from "@/assets/team/ethan-cole.webp";
import nataliePortrait from "@/assets/team/natalie-brooks.webp";
export { default as CLINIC } from "../../public/clinic.json";

export const NAV_LINKS = [
  { label: "Treatments", href: "#services" },
  { label: "Our approach", href: "#approach" },
  { label: "Team", href: "#team" },
  { label: "Results", href: "#gallery" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
] as const;

type Service = { title: string; eyebrow: string; copy: string; detail: string; icon: LucideIcon };
export const SERVICES: Service[] = [
  { title: "Digital Diagnostics", eyebrow: "See the full picture", copy: "3D imaging and a thoughtful exam create the foundation for every care plan.", detail: "Consultation · 3D imaging", icon: ScanLine },
  { title: "Dental Implants", eyebrow: "Designed for stability", copy: "Implant planning that considers function, comfort, and the final restoration from day one.", detail: "Planning · Placement · Restoration", icon: ShieldCheck },
  { title: "Porcelain Veneers", eyebrow: "Refined, never generic", copy: "Shape, translucency, and proportion are considered together for a natural-looking result.", detail: "E.max ceramic options", icon: Sparkles },
  { title: "Clear Aligners", eyebrow: "Movement with intention", copy: "A digitally guided approach to alignment, with progress reviewed throughout treatment.", detail: "Clear aligners · Braces", icon: Layers3 },
  { title: "Preventive Care", eyebrow: "Protect what feels good", copy: "Professional cleaning, enamel polishing, and practical guidance tailored to your routine.", detail: "Cleaning · Maintenance", icon: Smile },
  { title: "Family Dentistry", eyebrow: "Care at every stage", copy: "Calm, clear visits for adults and younger patients, without rushing the conversation.", detail: "Adults · Children", icon: FlaskConical },
];

export const PRINCIPLES = [
  { number: "01", title: "One clear plan, clearly explained", copy: "We connect diagnosis, treatment, and restoration into one seamless, understandable path—so every next step is clear and intentional." },
  { number: "02", title: "Technology with a human touch", copy: "Digital tools help us plan with greater precision. But they never replace the time we spend listening, answering your questions, and making sure you feel comfortable." },
  { number: "03", title: "An in-house dental lab", copy: "With ceramic and restorative work completed on-site, our clinical and technical teams stay closely connected throughout the process." },
  { number: "04", title: "A calmer kind of visit", copy: "Warm materials, uncluttered spaces, and thoughtful communication create a more relaxed experience—without compromising precision." },
] as const;

export const PROCESS = [
  { number: "01", label: "Scan", title: "Understand", copy: "A detailed view of your starting point." },
  { number: "02", label: "Plan", title: "Compose", copy: "Function, proportion, and priorities aligned." },
  { number: "03", label: "Craft", title: "Refine", copy: "Materials chosen for the individual case." },
  { number: "04", label: "Review", title: "Adjust", copy: "Thoughtful checks before the final step." },
  { number: "05", label: "Care", title: "Maintain", copy: "A practical plan for what comes next." },
] as const;

export const TEAM = [
  { name: "Dr. Amelia Hart, DDS", role: "Cosmetic & Restorative Dentistry", note: "Natural-looking restorative care guided by proportion, comfort, and long-term function.", portrait: ameliaPortrait },
  { name: "Dr. Natalie Brooks, DMD", role: "Orthodontics & Clear Aligners", note: "Thoughtful alignment plans for adults and teens, with clear milestones at every stage.", portrait: nataliePortrait },
  { name: "Dr. Ethan Cole, DDS, MS", role: "Implant & Surgical Dentistry", note: "Digitally planned implant care with close coordination from placement through restoration.", portrait: ethanPortrait },
] as const;

export const PRICES = [
  ["New patient consultation", "$150", "45 min"],
  ["3D dental imaging", "From $225", "20 min"],
  ["Professional cleaning", "From $175", "60 min"],
  ["Professional whitening", "From $595", "75 min"],
  ["Porcelain veneer", "From $2,350", "2+ visits"],
  ["Dental implant", "From $4,500", "Case dependent"],
  ["Braces", "From $5,800", "12–24 months"],
  ["Clear aligners", "From $5,200", "6–18 months"],
] as const;

export const REVIEWS = [
  { name: "Olivia M.", treatment: "Smile consultation", quote: "Every option was explained in plain language. I left with a plan that felt considered, realistic, and completely mine." },
  { name: "Daniel R.", treatment: "Restorative care", quote: "The visit never felt rushed. The team paid attention to comfort, detail, and how the final result would work long term." },
  { name: "Sophia L.", treatment: "Clear aligners", quote: "I always knew what the next milestone was. The process felt organized, discreet, and much easier than I expected." },
  { name: "Marcus T.", treatment: "Implant care", quote: "From the scan to the final restoration, the specialists communicated clearly and made a complex treatment feel manageable." },
] as const;

export const FAQS = [
  { q: "What happens at a first visit?", a: "We begin with a conversation about your goals and concerns, then complete an exam and any recommended imaging. You receive a clear care plan before deciding how to proceed." },
  { q: "How long will treatment take?", a: "Timing depends on the treatment and your individual needs. A consultation may take about 30 minutes; orthodontic and implant care typically involves multiple visits over a longer period." },
  { q: "Do you offer payment plans or accept insurance?", a: "Flexible monthly payment options are available for qualifying treatment plans. We can also review out-of-network PPO benefits and provide an itemized estimate before care begins." },
  { q: "What if I feel anxious about dental care?", a: "Tell the team before your visit. They can explain what to expect, move at a comfortable pace, and discuss appropriate comfort options for the care you need." },
  { q: "How is pricing determined?", a: "Final fees depend on the diagnosis, materials, and complexity of care. You should receive an itemized estimate before treatment begins." },
] as const;

export const RESULT_CASES = [
  { title: "Professional whitening", detail: "Shade refinement", before: whiteningBefore, after: whiteningAfter },
  { title: "Clear aligners", detail: "Alignment preview", before: alignerBefore, after: alignerAfter },
  { title: "Ceramic veneers", detail: "Shape & proportion", before: veneersBefore, after: veneersAfter },
  { title: "Composite bonding", detail: "Edge restoration", before: bondingBefore, after: bondingAfter },
] as const;

