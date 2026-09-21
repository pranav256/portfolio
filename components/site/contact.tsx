import { ArrowRightIcon, GithubIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

export function Contact() {
  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-title">
      <div>
        <h2 id="contact-title">There’s always<br /><em>something next.</em></h2>
        <p>More experiments, ideas, and things in progress.</p>
      </div>
      <Button asChild nativeButton={false} role="link" size="lg" className="primary-action">
        <a href={site.github}><GithubIcon className="icon" aria-hidden="true" /> Find me on GitHub <ArrowRightIcon className="icon arrow-out" aria-hidden="true" /></a>
      </Button>
    </section>
  );
}
