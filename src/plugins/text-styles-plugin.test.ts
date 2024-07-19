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

  it('should write js file and run formatting tool', () => {
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

    textStylesPlugin(core, { styleMetadata: styleMetadata.styles, fileNodes, variables } as any);

    expect(core.writeFile).toHaveBeenCalled();
    expect((core.writeFile as jest.Mock).mock.calls[0][1]).toBe('/export-path/text-styles.js');
  });

  it('should write generated date for default config', () => {
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

    textStylesPlugin(core, { styleMetadata: styleMetadata.styles, fileNodes, variables } as any);

    expect(core.writeFile).toHaveBeenCalled();
    expect((core.writeFile as jest.Mock).mock.calls[0][0]).toMatchSnapshot();
  });

  it('should be skipped due to disabled field', () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          textStyles: { collectionNames: ['typography', 'typography_xl'], disabled: true },
        },
      },
      plugins: [],
      rootPath: '/root-path',
      log: jest.fn(),
    });

    core.writeFile = jest.fn();

    textStylesPlugin(core, { styleMetadata: styleMetadata.styles, fileNodes, variables } as any);

    expect(core.writeFile).not.toHaveBeenCalled();
  });

  it('should create data with merged styles', () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          textStyles: { collectionNames: ['typography', 'typography_xl'], merge: true },
        },
        screens: {
          bs: 0,
          sm: '600px',
          md: '900px',
          lg: '1200px',
        },
      },
      plugins: [],
      rootPath: '/root-path',
      log: jest.fn(),
    });

    core.writeFile = jest.fn();

    textStylesPlugin(core, { styleMetadata: styleMetadata.styles, fileNodes, variables } as any);

    expect(core.writeFile).toHaveBeenCalled();
    expect((core.writeFile as jest.Mock).mock.calls[0][0]).toMatchSnapshot();
  });

  it('should create data with merged styles when the screens object has number items', () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          textStyles: { collectionNames: ['typography', 'typography_xl'], merge: true },
        },
        screens: {
          bs: 0,
          sm: 600,
          md: 900,
          lg: 1200,
        },
      },
      plugins: [],
      rootPath: '/root-path',
      log: jest.fn(),
    });

    core.writeFile = jest.fn();

    textStylesPlugin(core, { styleMetadata: styleMetadata.styles, fileNodes, variables } as any);

    expect(core.writeFile).toHaveBeenCalled();
    expect((core.writeFile as jest.Mock).mock.calls[0][0]).toMatchSnapshot();
  });

  it('should create data with merged styles when the screens object has string items as number', () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          textStyles: { collectionNames: ['typography', 'typography_xl'], merge: true },
        },
        screens: {
          bs: '0',
          sm: '600',
          md: '900',
          lg: '1200',
        },
      },
      plugins: [],
      rootPath: '/root-path',
      log: jest.fn(),
    });

    core.writeFile = jest.fn();

    textStylesPlugin(core, { styleMetadata: styleMetadata.styles, fileNodes, variables } as any);

    expect(core.writeFile).toHaveBeenCalled();
    expect((core.writeFile as jest.Mock).mock.calls[0][0]).toMatchSnapshot();
  });

  it('should create data with custom keyName function', () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          textStyles: {
            collectionNames: ['typography', 'typography_xl'],
            keyName: (name?: string) => name + '__extra',
          },
        },
      },
      plugins: [],
      rootPath: '/root-path',
      log: jest.fn(),
    });

    core.writeFile = jest.fn();

    textStylesPlugin(core, { styleMetadata: styleMetadata.styles, fileNodes, variables } as any);

    expect(core.writeFile).toHaveBeenCalled();
    expect((core.writeFile as jest.Mock).mock.calls[0][0]).toMatchSnapshot();
  });
});
