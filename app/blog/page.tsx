import type { Metadata } from "next";
import { Suspense } from "react";
import { RssFeedIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { PostList } from "@/components/blog/post-list";
import { PostSearch } from "@/components/blog/post-search";
import { getPosts, summarizePost } from "@/lib/posts";
import { socialImage } from "@/lib/site";

export const metadata: Metadata = {
  title: "Writing",
  description: "Notes on small tools, thoughtful interfaces, and the things learned while building.",
  alternates: { canonical: "/blog" },
  openGraph: { title: "Writing — Pranav", description: "Notes on small tools, thoughtful interfaces, and learning by building.", url: "/blog", images: [socialImage] },
};

export default function BlogPage() {
  const posts = getPosts();
  return (
    <main id="main" tabIndex={-1} className="container blog-page">
      <header className="blog-intro">
        <h1>Notes from<br /><em>the workbench.</em></h1>
        <div className="blog-intro-bottom">
          <p>Tools, interfaces, and lessons from building.</p>
          <Button asChild nativeButton={false} role="link" variant="link" className="inline-action">
            <a href="/feed.xml"><RssFeedIcon className="icon" aria-hidden="true" /> RSS feed</a>
          </Button>
        </div>
      </header>
      <Suspense fallback={<PostList posts={posts.map(summarizePost)} compact />}>
        <PostSearch posts={posts.map((post) => ({ ...summarizePost(post), searchText: post.searchText }))} />
      </Suspense>
    </main>
  );
}
