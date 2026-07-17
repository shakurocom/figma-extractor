import { File, Files, Folder } from 'fumadocs-ui/components/files';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';

import {
  CodeFiles,
  CodeFilesContent,
  CodeFilesFile,
  CodeFilesPanel,
  CodeFilesTree,
} from './code-files';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Tab,
    Tabs,
    Step,
    Steps,
    File,
    Files,
    Folder,
    CodeFiles,
    CodeFilesTree,
    CodeFilesPanel,
    CodeFilesFile,
    CodeFilesContent,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
