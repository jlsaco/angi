import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Angi Multi-Provider Test
      </h1>
      <p className="text-gray-600 mb-8">
        Testing Angi with Anthropic, OpenAI, and Gemini adapters. Use the
        provider dropdown in the nav to switch between them.
      </p>
      <div className="space-y-4">
        <Link
          href="/blog"
          className="block p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
        >
          <h2 className="font-semibold text-gray-900">Blog (Read-only)</h2>
          <p className="text-sm text-gray-500 mt-1">
            Ask the AI questions about a blog post. Tests read permissions.
          </p>
        </Link>
        <Link
          href="/form"
          className="block p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
        >
          <h2 className="font-semibold text-gray-900">Form (Read + Write)</h2>
          <p className="text-sm text-gray-500 mt-1">
            Ask the AI to fill in form fields. Tests read and write permissions.
          </p>
        </Link>
      </div>
    </div>
  );
}
