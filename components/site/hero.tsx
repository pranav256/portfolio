import Link from "next/link";
import { ArrowDownIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { WorkbenchArt } from "@/components/site/workbench-art";

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <h1 id="hero-title">I turn curiosity<br /><em>into code.</em></h1>
        <p>I’m Pranav. I build open-source tools for video, the web, and the everyday.</p>
        <Button asChild nativeButton={false} role="link" size="lg" className="primary-action hero-action">
          <Link href="#work">Explore my work <ArrowDownIcon className="icon" aria-hidden="true" /></Link>
        </Button>
      </div>
      <div className="hero-art"><WorkbenchArt /></div>
      <div className="hero-footnote" aria-label="Areas of work">
        <span>Python, Rust, and the web.</span>
        <span className="hero-footnote-right">A collection of things I’ve made <ArrowDownIcon className="icon" aria-hidden="true" /></span>
      </div>
    </section>
  );
}
