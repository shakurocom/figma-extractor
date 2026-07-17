import { Hero } from '@/components/hero';

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-4 py-12">
      <Hero />

      <section className="mx-auto">
        <p className="text-lg text-fd-muted-foreground">
          <span className="font-medium text-fd-foreground">Figma Extractor</span> simplifies
          extracting design variables, styles, and components from your Figma file into a structured
          JSON format. With one command, turn design tokens (colors, typography, spacing, and more)
          into ready-to-use code for seamless integration into your development pipeline.
        </p>

        <p className="mt-4 text-fd-muted-foreground">
          It saves time, ensures design consistency, and supports UI/UX designers, front-end
          developers, and teams managing design systems.
        </p>
      </section>

      <footer className="mt-auto pt-6 text-sm text-fd-muted-foreground text-center">
        Developed by the{' '}
        <a
          href="https://shakuro.com/?utm_source=docs&utm_medium=website&utm_campaign=figma-extractor"
          rel="noreferrer noopener"
          target="_blank"
          className="font-medium text-fd-foreground underline underline-offset-4"
        >
          Shakuro
        </a>{' '}
        team.
      </footer>
    </main>
  );
}
