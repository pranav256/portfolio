import repositories from "@/data/repositories.json";

function repository(name: string) {
  const item = repositories.find((repo) => repo.name === name && !repo.fork);
  if (!item) throw new Error(`Repository not found: ${name}`);
  return item;
}

export const projects = [
  {
    id: "hooky",
    name: "Hooky",
    kind: "Video automation",
    description: "Long videos, shorter stories. A Python pipeline for finding highlights and creating captioned vertical clips.",
    technologies: ["Python", "Gemini", "FFmpeg"],
    repository: repository("Hooky"),
  },
  {
    id: "vault",
    name: "RustyVault",
    kind: "Desktop software",
    description: "A local password vault, built with Rust and egui. Encrypted storage with Argon2id and AES-256-GCM.",
    technologies: ["Rust", "egui", "Cryptography"],
    repository: repository("Password-Manager"),
  },
  {
    id: "news",
    name: "news-api",
    kind: "Open data",
    description: "Global news as ordinary JSON. Refreshed every two hours with GitHub Actions, ready to build with.",
    technologies: ["Python", "GitHub Actions", "JSON"],
    repository: repository("news-api"),
  },
] as const;

export type Project = (typeof projects)[number];
export type ProjectId = Project["id"];

export const experiments = [
  { name: "Weather", repository: repository("weather-react"), description: "A React weather app" },
  { name: "Movie finder", repository: repository("movie-finder-react"), description: "Film discovery with React" },
  { name: "Notes", repository: repository("notes"), description: "A small JavaScript notebook" },
  { name: "Clock", repository: repository("clock"), description: "A clock for the browser" },
  { name: "Face detector", repository: repository("Face-Detector"), description: "An OpenCV experiment" },
  { name: "Space Duel", repository: repository("Space-Duel"), description: "A two-dimensional Pygame game" },
];

export const journey = [
  {
    year: "2021",
    title: "Start small. Make something.",
    description: "Python desktop tools, Pygame experiments, and the first JavaScript apps.",
    links: [repository("Notepad"), repository("Space-Duel"), repository("weather")],
  },
  {
    year: "2022",
    title: "Revisit the familiar.",
    description: "Weather and movie apps, rebuilt in React. More experiments with TypeScript and the web.",
    links: [repository("weather-react"), repository("movie-finder-react"), repository("github-user-finder-react")],
  },
  {
    year: "2026",
    title: "Give the tools more to do.",
    description: "Hooky brings video discovery, transcription, and editing into one Python pipeline.",
    links: [repository("Hooky")],
  },
] as const;
