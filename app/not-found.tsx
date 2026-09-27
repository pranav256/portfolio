import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="container not-found-page">
      <h1>Page not found<span className="accent-period">.</span></h1>
      <p>That link doesn’t lead to a page. The work and writing are still here.</p>
      <div className="not-found-actions">
        <Button asChild nativeButton={false} role="link" className="primary-action">
          <Link href="/"><ArrowLeftIcon className="icon" aria-hidden="true" /> Back to home</Link>
        </Button>
        <Button asChild nativeButton={false} role="link" variant="outline">
          <Link href="/blog">Browse writing</Link>
        </Button>
      </div>
    </main>
  );
}
