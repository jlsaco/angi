import ContactForm from "@/components/ContactForm";

export default function Home() {
  return (
    <main className="min-h-screen w-full relative overflow-hidden flex items-center justify-center p-4">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[#030303]" />
      <div 
        className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] animate-pulse" 
        style={{ animationDuration: '8s' }}
      />
      <div 
        className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/10 blur-[120px] animate-pulse"
        style={{ animationDuration: '10s' }}
      />
      
      {/* Decorative Grid */}
      <div className="absolute inset-0 -z-5 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="mb-12 text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
            Angi Proof of Concept
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Experience the future of seamless interaction with our modern, premium form system.
          </p>
        </div>

        <div className="w-full">
          <ContactForm />
        </div>
        
        <footer className="mt-20 text-gray-500 text-sm">
          Built with Next.js & Tailwind CSS
        </footer>
      </div>
    </main>
  );
}
