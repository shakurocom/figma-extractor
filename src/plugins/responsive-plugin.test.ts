/* eslint-disable max-lines */
import path from 'path';

import { createCore } from '../core';
import { ThemeVariablesConfig } from '../types';
import { readJsonFile } from '../utils/read-json-file';
import { responsivePlugin } from './responsive-plugin';

describe('responsivePlugin', () => {
  const rootPath = process.cwd();
  const jsonVariablesPath = './variables.json';
  const variables = readJsonFile<ThemeVariablesConfig[]>(path.join(rootPath, jsonVariablesPath));

  it('should write responsive js file and run formatting tool', () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          responsive: { collectionNames: ['responsive', 'responsive_extra'] },
        },
      },
      plugins: [],
      rootPath: '/root-path',
      log: jest.fn(),
    });

    core.writeFile = jest.fn();

    responsivePlugin(core, { variables } as any);

    expect(core.writeFile).toHaveBeenCalled();
    expect((core.writeFile as jest.Mock).mock.calls[0][1]).toBe('/export-path/responsive.ts');
  });

  it('should write screens js file and run formatting tool', () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          responsive: { collectionNames: ['responsive', 'responsive_extra'] },
        },
      },
      plugins: [],
      rootPath: '/root-path',
      log: jest.fn(),
    });

    core.writeFile = jest.fn();

    responsivePlugin(core, { variables } as any);
    expect(core.writeFile).toHaveBeenCalled();
    expect((core.writeFile as jest.Mock).mock.calls[1][1]).toBe('/export-path/screens.ts');
  });
});
