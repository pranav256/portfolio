import profile from "@/research/github-profile.json";

export const site = {
  name: profile.name,
  username: profile.login,
  github: profile.html_url,
  description: "Open-source tools, web experiments, and notes on building software by Pranav.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
};

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}
