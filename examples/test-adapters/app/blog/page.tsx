"use client";

import { Angi } from "@angi-ai/angi/client";
import BlogContent from "@/components/BlogContent";

export default function BlogPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <Angi id="blog-post" permissions={["read"]}>
        <BlogContent />
      </Angi>
    </div>
  );
}
