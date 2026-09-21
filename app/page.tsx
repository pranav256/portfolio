import { Hero } from "@/components/site/hero";
import { Projects } from "@/components/site/projects";
import { About } from "@/components/site/about";
import { Contact } from "@/components/site/contact";

export default function HomePage() {
  return (
    <main id="main" tabIndex={-1} className="container">
      <Hero />
      <Projects />
      <About />
      <section id="writing" className="section section-rule">
        <h2>Writing along the way.</h2>
        <p>Notes on building tools and making software easier to understand.</p>
      </section>
      <Contact />
    </main>
  );
}
