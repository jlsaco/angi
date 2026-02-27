"use client";

import ContactForm from "@/components/ContactForm";
import { AngiChatBubble, Angi } from "angi/client";


export default function Home() {
  return (
    <main className="min-h-screen w-full relative overflow-hidden flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-[#030303]" />
      <div
        className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] animate-pulse"
        style={{ animationDuration: "8s" }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/10 blur-[120px] animate-pulse"
        style={{ animationDuration: "10s" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="mb-12 text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
            Angi Proof of Concept
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            React components that are natively AI-addressable.
          </p>
        </div>

        {/*
          <Angi.Form> is a thin boundary — it only provides id + permissions in context.
          ContactForm registers itself via useAngiComponent() internally.
        */}
        <Angi id="contact-form -1" permissions={["read", "write"]}>
          <ContactForm />
        </Angi>
        <footer className="mt-20 text-gray-600 text-sm">
          Built with Next.js · Powered by{" "}
          <span className="text-primary font-medium">Angi</span>
        </footer>
      </div>

      {/* Floating AI Chat Bubble */}
      <AngiChatBubble />
    </main>

  );
}
