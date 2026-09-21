import { Hero } from "@/components/site/hero";
import { Projects } from "@/components/site/projects";

export default function HomePage() {
  return (
    <main id="main" tabIndex={-1} className="container">
      <Hero />
      <Projects />
      <section id="about" className="section section-rule">
        <h2>Learning by building.</h2>
        <p>Small tools, familiar problems, and a growing collection of experiments.</p>
      </section>
      <section id="writing" className="section section-rule">
        <h2>Writing along the way.</h2>
        <p>Notes on building tools and making software easier to understand.</p>
      </section>
    </main>
  );
}
