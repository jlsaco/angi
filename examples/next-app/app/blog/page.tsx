"use client";

import { Angi } from "@angi-ai/angi/client";
import { BlogContent } from "@/components/BlogContent";

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#030303]">
      <Angi id="blog-post" permissions={["read"]}>
        <BlogContent />
      </Angi>
    </main>
  );
}
