import { Core, FigmaData } from '../core';

export const launchPlugins = async (core: Core, data: FigmaData) => {
  for (let i = 0; i < core.plugins.length; i++) {
    const plugin = core.plugins[i];
    await plugin(core, data);
  }
};
