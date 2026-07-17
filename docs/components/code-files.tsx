'use client';
import { createContext, type ReactNode, useContext, useState } from 'react';
import { cn } from 'cnfast';
import { File } from 'fumadocs-ui/components/files';

interface CodeFilesContextValue {
  active: string;
  setActive: (file: string) => void;
}

const CodeFilesContext = createContext<CodeFilesContextValue | null>(null);

function useCodeFiles() {
  const ctx = useContext(CodeFilesContext);
  if (!ctx) throw new Error('CodeFiles components must be used inside <CodeFiles>');

  return ctx;
}

/**
 * Interactive "file tree + code viewer" widget: clicking a file in the tree
 * reveals its content next to it. Replacement for the old Nextra-based
 * `FileCollector`/`FileLinkInjector`/`FileContent` components.
 */
export function CodeFiles({ defaultFile, children }: { defaultFile: string; children: ReactNode }) {
  const [active, setActive] = useState(defaultFile);

  return (
    <CodeFilesContext.Provider value={{ active, setActive }}>
      <div className="flex flex-col gap-4 lg:flex-row">{children}</div>
    </CodeFilesContext.Provider>
  );
}

/** Column with the file tree (put `<Files>` markup inside). */
export function CodeFilesTree({ children }: { children: ReactNode }) {
  return <div className="lg:flex-none lg:w-64">{children}</div>;
}

/** Column that shows the currently selected file content. */
export function CodeFilesPanel({ children }: { children: ReactNode }) {
  return <div className="flex-1 min-w-0">{children}</div>;
}

/** Clickable file inside the tree. */
export function CodeFilesFile({ name, file }: { name: string; file?: string }) {
  const target = file ?? name;
  const { active, setActive } = useCodeFiles();

  return (
    <File
      name={name}
      role="button"
      aria-pressed={active === target}
      className={cn(
        'cursor-pointer',
        active === target && 'bg-fd-primary/10 text-fd-primary hover:bg-fd-primary/10',
      )}
      onClick={() => setActive(target)}
    />
  );
}

/** Content shown when its `file` is selected in the tree. */
export function CodeFilesContent({ file, children }: { file: string; children: ReactNode }) {
  const { active } = useCodeFiles();
  if (active !== file) return null;

  return <>{children}</>;
}
