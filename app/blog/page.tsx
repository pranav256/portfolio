import type { Metadata } from "next";
import { PostList } from "@/components/blog/post-list";
import { getPosts, summarizePost } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Writing — Pranav",
  description: "Notes on small tools, thoughtful interfaces, and the things learned while building.",
};

export default function BlogPage() {
  return (
    <main id="main" tabIndex={-1} className="container blog-page">
      <header className="blog-intro">
        <h1>Notes from<br /><em>the workbench.</em></h1>
        <p>On small tools, thoughtful interfaces, and learning by building.</p>
      </header>
      <PostList posts={getPosts().map(summarizePost)} />
    </main>
  );
}
