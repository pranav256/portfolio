import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="site-header" id="top">
      <div className="container header-inner">
        <Link href="/" className="wordmark" aria-label="Pranav, home">
          Pranav<span aria-hidden="true">.</span>
        </Link>
        <nav aria-label="Main navigation" className="main-nav">
          <Button asChild nativeButton={false} role="link" variant="ghost" className="nav-link">
            <Link href="/#work">Work</Link>
          </Button>
          <Button asChild nativeButton={false} role="link" variant="ghost" className="nav-link">
            <Link href="/#writing">Writing</Link>
          </Button>
          <Button asChild nativeButton={false} role="link" variant="ghost" className="nav-link">
            <Link href="/#about">About</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
