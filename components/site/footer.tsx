import Link from "next/link";
import { ArrowRightIcon, GithubIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer" id="contact">
      <div className="container footer-inner">
        <p className="footer-credit">© {new Date().getFullYear()} {site.name}</p>
        <nav aria-label="Footer navigation" className="footer-nav">
          <Button asChild nativeButton={false} variant="link" className="footer-link">
            <a href={site.github}><GithubIcon className="icon" aria-hidden="true" /> GitHub</a>
          </Button>
          <Button asChild nativeButton={false} variant="link" className="footer-link">
            <Link href="#top">Back to top <ArrowRightIcon className="icon arrow-up" aria-hidden="true" /></Link>
          </Button>
        </nav>
      </div>
    </footer>
  );
}
