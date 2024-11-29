/* eslint-disable max-lines */
import path from 'path';

import { createCore } from '../core';
import { ThemeVariablesConfig } from '../types';
import { fileNodes } from '../utils/generate-styles/fixtures/file-nodes';
import { styleMetadata } from '../utils/generate-styles/fixtures/style-metadata';
import { readJsonFile } from '../utils/read-json-file';
import { textStylesPlugin } from './text-styles-plugin';

describe('textStylesPlugin', () => {
  const rootPath = process.cwd();
  const jsonVariablesPath = './variables.json';
  const variables = readJsonFile<ThemeVariablesConfig[]>(path.join(rootPath, jsonVariablesPath));

  it('should write ts file', () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          textStyles: { collectionNames: ['typography', 'typography_xl'] },
          responsive: { collectionNames: ['responsive', 'responsive_extra'] },
        },
      },
      plugins: [],
      rootPath: '/root-path',
      log: jest.fn(),
    });

    core.writeFile = jest.fn();

    textStylesPlugin(core, { variables } as any);

    expect(core.writeFile).toHaveBeenCalled();
    expect((core.writeFile as jest.Mock).mock.calls[0][1]).toBe('/export-path/text-styles.ts');
  });

  it('should write generated date with media queries', () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          textStyles: { collectionNames: ['typography', 'typography_xl'] },
          responsive: { collectionNames: ['responsive', 'responsive_extra'] },
        },
      },
      plugins: [],
      rootPath: '/root-path',
      log: jest.fn(),
    });

    core.writeFile = jest.fn();

    textStylesPlugin(core, { variables } as any);

    expect(core.writeFile).toHaveBeenCalled();
    expect((core.writeFile as jest.Mock).mock.calls[0][0]).toMatchSnapshot();
  });

  it('should be skipped due to disabled field', () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          textStyles: { collectionNames: ['typography', 'typography_xl'], disabled: true },
          responsive: { collectionNames: ['responsive', 'responsive_extra'] },
        },
      },
      plugins: [],
      rootPath: '/root-path',
      log: jest.fn(),
    });

    core.writeFile = jest.fn();

    textStylesPlugin(core, { variables } as any);

    expect(core.writeFile).not.toHaveBeenCalled();
  });

  it("shouldn't create media queries styles because of responsive collection has no screen sizes", () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          textStyles: { collectionNames: ['typography', 'typography_xl'] },
        },
      },
      plugins: [],
      rootPath: '/root-path',
      log: jest.fn(),
    });

    core.writeFile = jest.fn();

    textStylesPlugin(core, { variables } as any);

    expect(core.writeFile).toHaveBeenCalled();
    expect((core.writeFile as jest.Mock).mock.calls[0][0]).toMatchSnapshot();
  });

  /*it('should add extra styles which have prefix screen', () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          textStyles: {
            collectionNames: ['typography', 'typography_xl'],
            addStylesWithPrefixScreen: true,
          },
          responsive: { collectionNames: ['responsive', 'responsive_extra'] },
        },
      },
      plugins: [],
      rootPath: '/root-path',
      log: jest.fn(),
    });

    core.writeFile = jest.fn();

    textStylesPlugin(core, { variables } as any);

    expect(core.writeFile).toHaveBeenCalled();
    expect((core.writeFile as jest.Mock).mock.calls[0][0]).toMatchSnapshot();
  });*/

  it('should create data with custom keyName function', () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          textStyles: {
            collectionNames: ['typography', 'typography_xl'],
            keyName: (name?: string) => name + '__extra',
          },
          responsive: { collectionNames: ['responsive', 'responsive_extra'] },
        },
      },
      plugins: [],
      rootPath: '/root-path',
      log: jest.fn(),
    });

    core.writeFile = jest.fn();

    textStylesPlugin(core, { variables } as any);

    expect(core.writeFile).toHaveBeenCalled();
    expect((core.writeFile as jest.Mock).mock.calls[0][0]).toMatchSnapshot();
  });
});
