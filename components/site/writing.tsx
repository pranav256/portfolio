import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { PostList } from "@/components/blog/post-list";
import { Button } from "@/components/ui/button";
import { getPosts, summarizePost } from "@/lib/posts";

export function Writing() {
  return (
    <section id="writing" className="section section-rule writing-section" aria-labelledby="writing-title">
      <div className="section-heading">
        <h2 id="writing-title">Writing along the way<span className="accent-period">.</span></h2>
        <Button asChild nativeButton={false} role="link" variant="link" className="inline-action">
          <Link href="/blog">All writing <ArrowRightIcon className="icon" aria-hidden="true" /></Link>
        </Button>
      </div>
      <PostList posts={getPosts().slice(0, 3).map(summarizePost)} headingLevel={3} />
    </section>
  );
}
