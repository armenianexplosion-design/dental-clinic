import { CLINIC } from "@/i18n/clinic";
import { translate } from "@/i18n/language";
import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/home/HomePage";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: translate("hy", "{clinic} — Demo Website", {clinic: CLINIC.name}) },
      {
        name: "description",
        content:
          translate("hy", "A premium U.S. concept for modern dental care, including implants, porcelain veneers, clear aligners, preventive care, and digital diagnostics."),
      },
      { property: "og:title", content: translate("hy", "{clinic} — Demo Website", {clinic: CLINIC.name}) },
      {
        property: "og:description",
        content:
          translate("hy", "Advanced care, thoughtful design, and a dental experience built around the person."),
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
