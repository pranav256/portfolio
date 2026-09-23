import { Hero } from "@/components/site/hero";
import { Projects } from "@/components/site/projects";
import { About } from "@/components/site/about";
import { Contact } from "@/components/site/contact";
import { Writing } from "@/components/site/writing";

export default function HomePage() {
  return (
    <main id="main" tabIndex={-1} className="container">
      <Hero />
      <Projects />
      <About />
      <Writing />
      <Contact />
    </main>
  );
}
