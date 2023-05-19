import { ClientInterface, FileNodesResponse, FullStyleMetadata } from 'figma-js';

import { Plugin } from '../plugins';
import { runFormattingFile } from './run-formatting-file';
import { styleTypeUtils } from './style-type-utils';
import { writeJsFile } from './write-js-file';

export interface FigmaData {
  figmaClient: ClientInterface;
  styleMetadata: readonly FullStyleMetadata[];
  fileNodes: FileNodesResponse;
}

export interface Core {
  config: Config;
  rootPath: string;
  plugins: Plugin[];
  styleTypeUtils: typeof styleTypeUtils;
  writeJsFile: typeof writeJsFile;
  runFormattingFile: typeof runFormattingFile;
}

export const createCore = (args: { config: Config; rootPath: string; plugins: Plugin[] }): Core => {
  return {
    ...args,
    styleTypeUtils,
    writeJsFile,
    runFormattingFile: runFormattingFile,
  };
};
