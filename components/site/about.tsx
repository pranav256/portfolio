import { ArrowRightIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Timeline } from "@/components/ui/timeline";
import { journey } from "@/lib/projects";
import { site } from "@/lib/site";

export function About() {
  return (
    <section id="about" className="section section-rule about-section" aria-labelledby="about-title">
      <div className="about-copy">
        <h2 id="about-title">Learning by<br /><em>making.</em></h2>
        <p>I build with Python, Rust, and the web. You’ll find desktop tools, browser experiments, and automation projects in my GitHub.</p>
        <Button asChild nativeButton={false} role="link" variant="link" className="inline-action">
          <a href={site.github}>A little more on GitHub <ArrowRightIcon className="icon arrow-out" aria-hidden="true" /></a>
        </Button>
      </div>
      <div className="journey">
        <h3>One project at a time.</h3>
        <Timeline className="journey-timeline" items={journey.map((item) => ({ title: item.title, description: item.description, timestamp: item.year }))} />
      </div>
    </section>
  );
}
