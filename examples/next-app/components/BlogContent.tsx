"use client";

import { useAngiComponent } from "@angi-ai/angi/client";

const BLOG_SECTIONS = [
  {
    title: "What is an LLM?",
    body: "LLM stands for Large Language Model. Think of it like a super-smart parrot that has read millions of books, websites, and articles. But instead of just repeating things, it learned patterns about how words fit together. When you ask it a question, it uses those patterns to put together an answer word by word.",
  },
  {
    title: "How Does It Learn?",
    body: "Imagine you read thousands of stories. After a while, if someone said 'Once upon a...' you would probably guess the next word is 'time.' That is basically what an LLM does, but on a much bigger scale. It looks at huge amounts of text and learns which words are likely to come next. This process is called training.",
  },
  {
    title: "Tokens: Breaking Words into Pieces",
    body: "LLMs do not read whole words like we do. They break text into smaller pieces called tokens. The word 'hamburger' might become 'ham', 'bur', 'ger'. The word 'the' is usually one token. This helps the model handle any word, even ones it has never seen before.",
  },
  {
    title: "What Happens When You Ask a Question?",
    body: "When you type a question, the model reads your words (as tokens), thinks about all the patterns it learned, and then predicts the best next token. It does this over and over, one token at a time, until it finishes its answer. It is like writing a story one word at a time, always picking the word that makes the most sense.",
  },
  {
    title: "Can It Think?",
    body: "Not really. An LLM does not understand things the way you do. It is very good at patterns and can sound very smart, but it does not have feelings or real understanding. It is a tool that is great at working with language. Think of it like a calculator for words.",
  },
];

export function BlogContent() {
  useAngiComponent({
    description:
      "A blog article titled 'How Do LLMs Work? A Guide for Kids' with sections about what LLMs are, how they learn, tokens, answering questions, and whether they can think.",
    getState: () =>
      BLOG_SECTIONS.map((s) => ({ title: s.title, content: s.body })),
  });

  return (
    <article className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold tracking-tight text-white mb-8">
        How Do LLMs Work? A Guide for Kids
      </h1>

      {BLOG_SECTIONS.map((section) => (
        <section key={section.title} className="mb-8">
          <h2 className="text-xl font-semibold text-gray-200 mb-3">
            {section.title}
          </h2>
          <p className="text-gray-400 leading-relaxed">{section.body}</p>
        </section>
      ))}

      <p className="text-sm text-gray-500 mt-12 border-t border-white/10 pt-6">
        Open the AI chat bubble and ask questions about this article. Try: &ldquo;What
        are tokens?&rdquo; or &ldquo;Explain how an LLM learns&rdquo;
      </p>
    </article>
  );
}
