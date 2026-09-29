import profile from "@/data/profile.json";

const configuredUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3000");
if (!["http:", "https:"].includes(configuredUrl.protocol)) {
  throw new Error("NEXT_PUBLIC_SITE_URL must be an http or https address.");
}

export const site = {
  name: profile.name,
  username: profile.login,
  github: profile.html_url,
  description: "Open-source tools, web experiments, and notes on building software by Pranav.",
  url: configuredUrl.origin,
};

export const socialImage = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: "Pranav — open-source tools, web experiments, and notes on building, beside an illustrated workbench.",
};

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}
