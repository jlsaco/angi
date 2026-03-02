"use client";

import { useAngiComponent } from "@angi-ai/angi/client";

const BLOG_CONTENT = {
  title: "How Do LLMs Work? A Guide for Kids",
  sections: [
    {
      heading: "What is an LLM?",
      body: "LLM stands for Large Language Model. Think of it like a super-smart parrot that has read millions of books, websites, and articles. But instead of just repeating things, it learned patterns about how words fit together. When you ask it a question, it uses those patterns to put together an answer word by word.",
    },
    {
      heading: "How Does It Learn?",
      body: "Imagine you read thousands of stories. After a while, if someone said 'Once upon a...' you would probably guess the next word is 'time.' That is basically what an LLM does, but on a much bigger scale. It looks at huge amounts of text and learns which words are likely to come next. This process is called training.",
    },
    {
      heading: "Tokens: Breaking Words into Pieces",
      body: "LLMs do not read whole words like we do. They break text into smaller pieces called tokens. The word 'hamburger' might become 'ham', 'bur', 'ger'. The word 'the' is usually one token. This helps the model handle any word, even ones it has never seen before.",
    },
    {
      heading: "What Happens When You Ask a Question?",
      body: "When you type a question, the model reads your words (as tokens), thinks about all the patterns it learned, and then predicts the best next token. It does this over and over, one token at a time, until it finishes its answer. It is like writing a story one word at a time, always picking the word that makes the most sense.",
    },
    {
      heading: "Can It Think?",
      body: "Not really. An LLM does not understand things the way you do. It is very good at patterns and can sound very smart, but it does not have feelings or real understanding. It is a tool that is great at working with language. Think of it like a calculator for words.",
    },
  ],
};

export default function BlogContent() {
  useAngiComponent({
    description:
      "Blog post about how LLMs work, written for kids. Contains title and five sections.",
    getState: () => BLOG_CONTENT,
    actions: {},
  });

  return (
    <article>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {BLOG_CONTENT.title}
      </h1>
      {BLOG_CONTENT.sections.map((section, i) => (
        <section key={i} className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            {section.heading}
          </h2>
          <p className="text-gray-600 leading-relaxed">{section.body}</p>
        </section>
      ))}
      <div className="mt-8 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
        <p className="text-sm text-indigo-700">
          Open the AI chat bubble and ask questions about this article. Try:
          &quot;What are tokens?&quot; or &quot;Explain how an LLM learns&quot;
        </p>
      </div>
    </article>
  );
}
