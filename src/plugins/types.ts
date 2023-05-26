import { Core, FigmaData } from '../core';

export interface Plugin {
  (core: Core, data: FigmaData): Promise<void> | void;
  pluginName: string;
}
