'use client';

import { useState } from 'react';
import Link from 'next/link';

const FIGMA_PLUGIN_URL =
  'https://www.figma.com/community/plugin/1497234576776347282/figma-to-json-exporter';

const CODE_SNIPPET = '$ pnpm add -D @shakuroinc/figma-extractor';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium text-white/80 transition-colors hover:bg-white/20"
    >
      {copied ? 'Copied' : 'Copy code'}
    </button>
  );
}

export function Hero() {
  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-[#444] px-6 py-14 sm:px-12"
      style={{
        backgroundImage:
          'radial-gradient(120% 120% at 20% 0%, #383838 0%, #292929 50%, #1a1a1a 100%)',
      }}
    >
      <div className="relative z-10 grid items-center gap-10 lg:grid-cols-2">
        {/* Left column */}
        <div className="flex flex-col items-start gap-6 text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
            <span className="size-2 rounded-full bg-[#62bdff]" />
            Figma Extractor
          </span>

          <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
            Easy <span className="text-[#62bdff]">copy variables</span> from your Figma file into
            your project in <span className="text-[#62bdff]">one command</span>!
          </h1>

          <p className="max-w-md text-sm text-white/60">
            Extract design variables, styles and SVG icons from Figma into ready-to-use TypeScript
            and CSS — colors, typography, effects and responsive tokens.
          </p>

          <div className="mt-2 flex flex-row flex-wrap items-center gap-3">
            <Link
              href="/docs"
              className="rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black transition-colors hover:bg-white/90"
            >
              Get started
            </Link>
            <a
              href={FIGMA_PLUGIN_URL}
              rel="noreferrer noopener"
              target="_blank"
              className="rounded-full border border-white/20 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Figma plugin
            </a>
          </div>
        </div>

        {/* Right column — code window mock */}
        <div className="w-full overflow-hidden rounded-xl border border-[#424242] bg-[#2c2c2c] shadow-2xl">
          <div className="flex items-center gap-2 border-b border-[#424242] px-3 py-2">
            <span className="size-2.5 rounded-full bg-[#62bdff]" />
            <span className="flex-1 text-xs font-medium text-white/80">Figma Extractor</span>
            <CopyButton text={CODE_SNIPPET} />
          </div>
          <pre className="overflow-x-auto px-4 py-4 text-[13px] leading-relaxed text-white/85">
            <code className="font-mono">{CODE_SNIPPET}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
