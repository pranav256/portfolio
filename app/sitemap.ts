import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/posts";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url },
    { url: `${site.url}/blog` },
    ...getPosts().map((post) => ({ url: `${site.url}/blog/${post.slug}`, lastModified: post.date })),
  ];
}
