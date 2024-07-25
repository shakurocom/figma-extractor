import { ClientInterface, FileNodesResponse } from 'figma-js';

import { Plugin } from '@/plugins';
import { Config, ThemeVariablesConfig } from '@/types';

import { addEslintDisableAtTheTopOfText } from './add-eslint-disable';
import { runFormattingFile } from './run-formatting-file';
import { styleTypeUtils } from './style-type-utils';
import { writeFile } from './write-file';

export interface FigmaData {
  figmaClient: ClientInterface;
  fileNodes: FileNodesResponse;
  variables: ThemeVariablesConfig[];
}

export interface Core {
  config: Config;
  rootPath: string;
  plugins: Plugin[];
  styleTypeUtils: typeof styleTypeUtils;
  writeFile: typeof writeFile;
  runFormattingFile: typeof runFormattingFile;
  addEslintDisableRules: typeof addEslintDisableAtTheTopOfText;
  log: (...args: string[]) => void;
}

export const createCore = (args: {
  config: Config;
  rootPath: string;
  plugins: Plugin[];
  log: (...args: string[]) => void;
}): Core => {
  return {
    ...args,
    styleTypeUtils,
    writeFile,
    runFormattingFile,
    addEslintDisableRules: addEslintDisableAtTheTopOfText,
  };
};
