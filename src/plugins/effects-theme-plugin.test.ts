/* eslint-disable max-lines */
import path from 'path';

import { createCore } from '../core';
import { ThemeVariablesConfig } from '../types';
import { fileNodes } from '../utils/generate-styles/fixtures/file-nodes';
import { styleMetadata } from '../utils/generate-styles/fixtures/style-metadata';
import { readJsonFile } from '../utils/read-json-file';
import { effectsThemePlugin } from './effects-theme-plugin';

describe('effectsThemePlugin', () => {
  const rootPath = process.cwd();
  const jsonVariablesPath = './variables.json';
  const variables = readJsonFile<ThemeVariablesConfig[]>(path.join(rootPath, jsonVariablesPath));

  it('should throw the error because the allowedThemes is not defined', () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          effects: { collectionNames: ['effects'] },
        },
      },
      plugins: [],
      rootPath: '/root-path',
      log: jest.fn(),
    });

    core.writeFile = jest.fn();

    expect(() =>
      effectsThemePlugin(core, {
        styleMetadata: styleMetadata.styles,
        fileNodes,
        variables,
      } as any),
    ).toThrow(
      '`config -> styles -> allowedThemes` field is required when the useTheme is equal true',
    );
  });

  it('should throw the error because the defaultTheme is not defined', () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          allowedThemes: [],
          effects: { collectionNames: ['effects'] },
        },
      },
      plugins: [],
      rootPath: '/root-path',
      log: jest.fn(),
    });

    core.writeFile = jest.fn();

    expect(() =>
      effectsThemePlugin(core, {
        styleMetadata: styleMetadata.styles,
        fileNodes,
        variables,
      } as any),
    ).toThrow(
      '`config -> styles -> defaultTheme` field is required when the useTheme is equal true',
    );
  });

  it('should throw the error because the allowedThemes is empty', () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          allowedThemes: [],
          defaultTheme: 'any',
          effects: { collectionNames: ['effects'] },
        },
      },
      plugins: [],
      rootPath: '/root-path',
      log: jest.fn(),
    });

    core.writeFile = jest.fn();

    expect(() =>
      effectsThemePlugin(core, {
        styleMetadata: styleMetadata.styles,
        fileNodes,
        variables,
      } as any),
    ).toThrow('`config -> styles -> allowedThemes` field must have one or more theme name');
  });

  it('should throw the error because the defined defaultTheme is not included in allowedThemes list', () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          allowedThemes: ['light', 'dark', 'monochrome'],
          defaultTheme: 'another',
          effects: { collectionNames: ['effects'] },
        },
      },
      plugins: [],
      rootPath: '/root-path',
      log: jest.fn(),
    });

    core.writeFile = jest.fn();

    expect(() =>
      effectsThemePlugin(core, {
        styleMetadata: styleMetadata.styles,
        fileNodes,
        variables,
      } as any),
    ).toThrow("`config -> styles -> defaultTheme` field must be one of allowedThemes' values");
  });

  it("should throw the error because any theme wasn't found inside figma data", () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          allowedThemes: ['theme1', 'theme2'],
          defaultTheme: 'theme1',
          effects: { collectionNames: ['effects'] },
        },
      },
      plugins: [],
      rootPath: '/root-path',
      log: jest.fn(),
    });

    core.writeFile = jest.fn();

    expect(() =>
      effectsThemePlugin(core, {
        styleMetadata: styleMetadata.styles,
        fileNodes,
        variables,
      } as any),
    ).toThrow("None of themes was found inside figma data. Check your themes and figma's themes");
  });

  it('should throw the error because some colors from themes contain not-valid chars', () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          allowedThemes: ['light', 'dark', 'monochrome'],
          defaultTheme: 'monochrome',
          effects: {
            collectionNames: ['effects'],
            keyName: (name?: string) => {
              return name === 'light/shadow-600' ? name + '+prefix' : name;
            },
          },
        },
      },
      plugins: [],
      rootPath: '/root-path',
      log: jest.fn(),
    });

    core.writeFile = jest.fn();

    expect(() =>
      effectsThemePlugin(core, {
        styleMetadata: styleMetadata.styles,
        fileNodes,
        variables,
      } as any),
    ).toThrow('Effect name: "shadow-600+prefix" from "light" theme contains not-valid chars.');
  });

  it('should throw the error because some colors from no themes contain not-valid chars', () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          allowedThemes: ['light'],
          defaultTheme: 'light',
          effects: {
            collectionNames: ['effects'],

            keyName: (name?: string) => {
              return name === 'dark/shadow-600' ? name + '+prefix' : name;
            },
          },
        },
      },
      plugins: [],
      rootPath: '/root-path',
      log: jest.fn(),
    });

    core.writeFile = jest.fn();

    expect(() =>
      effectsThemePlugin(core, {
        styleMetadata: styleMetadata.styles,
        fileNodes,
        variables,
      } as any),
    ).toThrow('Effect name: "dark-shadow-600+prefix" without theme contains not-valid chars.');
  });

  it('should create js files with css variables', () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          allowedThemes: ['light', 'dark', 'monochrome'],
          defaultTheme: 'monochrome',
          effects: { collectionNames: ['effects'] },
        },
      },
      plugins: [],
      rootPath: '/root-path',
      log: jest.fn(),
    });

    core.writeFile = jest.fn();

    effectsThemePlugin(core, { styleMetadata: styleMetadata.styles, fileNodes, variables } as any);

    expect(core.writeFile).toHaveBeenCalled();
    expect((core.writeFile as jest.Mock).mock.calls[0][1]).toBe(
      '/export-path/effects/light/index.ts',
    );
    expect((core.writeFile as jest.Mock).mock.calls[0][0]).toMatchSnapshot(
      '/export-path/effects/light/index.ts',
    );
    expect((core.writeFile as jest.Mock).mock.calls[2][1]).toBe(
      '/export-path/effects/dark/index.ts',
    );
    expect((core.writeFile as jest.Mock).mock.calls[2][0]).toMatchSnapshot(
      '/export-path/effects/dark/index.ts',
    );
    expect((core.writeFile as jest.Mock).mock.calls[4][1]).toBe(
      '/export-path/effects/monochrome/index.ts',
    );
    expect((core.writeFile as jest.Mock).mock.calls[4][0]).toMatchSnapshot(
      '/export-path/effects/monochrome/index.ts',
    );
    expect((core.writeFile as jest.Mock).mock.calls[6][1]).toBe(
      '/export-path/effects/with-vars.ts',
    );
    expect((core.writeFile as jest.Mock).mock.calls[6][0]).toMatchSnapshot(
      '/export-path/effects/with-vars.ts',
    );
    expect((core.writeFile as jest.Mock).mock.calls[7][1]).toBe('/export-path/effects/index.ts');
    expect((core.writeFile as jest.Mock).mock.calls[7][0]).toMatchSnapshot(
      '/export-path/effects/index.ts',
    );
  });

  it('should create css files with css variables', () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          allowedThemes: ['light', 'dark', 'monochrome'],
          defaultTheme: 'monochrome',
          effects: { collectionNames: ['effects'] },
        },
      },
      plugins: [],
      rootPath: '/root-path',
      log: jest.fn(),
    });

    core.writeFile = jest.fn();

    effectsThemePlugin(core, { styleMetadata: styleMetadata.styles, fileNodes, variables } as any);

    expect(core.writeFile).toHaveBeenCalled();
    expect((core.writeFile as jest.Mock).mock.calls[1][1]).toBe(
      '/export-path/effects/light/vars.css',
    );
    expect((core.writeFile as jest.Mock).mock.calls[1][0]).toMatchSnapshot(
      '/export-path/effects/light/vars.css',
    );
    expect((core.writeFile as jest.Mock).mock.calls[3][1]).toBe(
      '/export-path/effects/dark/vars.css',
    );
    expect((core.writeFile as jest.Mock).mock.calls[3][0]).toMatchSnapshot(
      '/export-path/effects/dark/vars.css',
    );
    expect((core.writeFile as jest.Mock).mock.calls[5][1]).toBe(
      '/export-path/effects/monochrome/vars.css',
    );
    expect((core.writeFile as jest.Mock).mock.calls[5][0]).toMatchSnapshot(
      '/export-path/effects/monochrome/vars.css',
    );
    expect((core.writeFile as jest.Mock).mock.calls[8][1]).toBe('/export-path/effects/vars.css');
    expect((core.writeFile as jest.Mock).mock.calls[8][0]).toMatchSnapshot(
      '/export-path/effects/vars.css',
    );
  });

  it("should create theme-list.ts files with themes' types", () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          allowedThemes: ['light', 'dark', 'monochrome'],
          defaultTheme: 'monochrome',
          effects: { collectionNames: ['effects'] },
        },
      },
      plugins: [],
      rootPath: '/root-path',
      log: jest.fn(),
    });

    core.writeFile = jest.fn();

    effectsThemePlugin(core, { styleMetadata: styleMetadata.styles, fileNodes, variables } as any);

    expect(core.writeFile).toHaveBeenCalled();
    expect((core.writeFile as jest.Mock).mock.calls[9][1]).toBe('/export-path/themes-list.ts');
    expect((core.writeFile as jest.Mock).mock.calls[9][0]).toMatchSnapshot(
      '/export-path/themes-list.ts',
    );
  });

  describe("create theme data with one theme which doesn't exist in figma", () => {
    it('should create js files with css variables', () => {
      const core = createCore({
        config: {
          styles: {
            exportPath: '/export-path/',
            allowedThemes: ['light', 'dark-blue', 'monochrome'],
            defaultTheme: 'monochrome',
            effects: { collectionNames: ['effects'] },
          },
        },
        plugins: [],
        rootPath: '/root-path',
        log: jest.fn(),
      });

      core.writeFile = jest.fn();

      effectsThemePlugin(core, {
        styleMetadata: styleMetadata.styles,
        fileNodes,
        variables,
      } as any);

      expect(core.writeFile).toHaveBeenCalled();
      expect((core.writeFile as jest.Mock).mock.calls[0][1]).toBe(
        '/export-path/effects/light/index.ts',
      );
      expect((core.writeFile as jest.Mock).mock.calls[0][0]).toMatchSnapshot(
        '/export-path/effects/light/index.ts',
      );
      expect((core.writeFile as jest.Mock).mock.calls[2][1]).toBe(
        '/export-path/effects/dark-blue/index.ts',
      );
      expect((core.writeFile as jest.Mock).mock.calls[2][0]).toMatchSnapshot(
        '/export-path/effects/dark-blue/index.ts',
      );
      expect((core.writeFile as jest.Mock).mock.calls[4][1]).toBe(
        '/export-path/effects/monochrome/index.ts',
      );
      expect((core.writeFile as jest.Mock).mock.calls[4][0]).toMatchSnapshot(
        '/export-path/effects/monochrome/index.ts',
      );
      expect((core.writeFile as jest.Mock).mock.calls[6][1]).toBe(
        '/export-path/effects/with-vars.ts',
      );
      expect((core.writeFile as jest.Mock).mock.calls[6][0]).toMatchSnapshot(
        '/export-path/effects/with-vars.ts',
      );
      expect((core.writeFile as jest.Mock).mock.calls[7][1]).toBe('/export-path/effects/index.ts');
      expect((core.writeFile as jest.Mock).mock.calls[7][0]).toMatchSnapshot(
        '/export-path/effects/index.ts',
      );
    });

    it('should create css files with css variables', () => {
      const core = createCore({
        config: {
          styles: {
            exportPath: '/export-path/',
            allowedThemes: ['light', 'dark-blue', 'monochrome'],
            defaultTheme: 'monochrome',
            effects: { collectionNames: ['effects'] },
          },
        },
        plugins: [],
        rootPath: '/root-path',
        log: jest.fn(),
      });

      core.writeFile = jest.fn();

      effectsThemePlugin(core, {
        styleMetadata: styleMetadata.styles,
        fileNodes,
        variables,
      } as any);

      expect(core.writeFile).toHaveBeenCalled();
      expect((core.writeFile as jest.Mock).mock.calls[1][1]).toBe(
        '/export-path/effects/light/vars.css',
      );
      expect((core.writeFile as jest.Mock).mock.calls[1][0]).toMatchSnapshot(
        '/export-path/effects/light/vars.css',
      );
      expect((core.writeFile as jest.Mock).mock.calls[3][1]).toBe(
        '/export-path/effects/dark-blue/vars.css',
      );
      expect((core.writeFile as jest.Mock).mock.calls[3][0]).toMatchSnapshot(
        '/export-path/effects/dark-blue/vars.css',
      );
      expect((core.writeFile as jest.Mock).mock.calls[5][1]).toBe(
        '/export-path/effects/monochrome/vars.css',
      );
      expect((core.writeFile as jest.Mock).mock.calls[5][0]).toMatchSnapshot(
        '/export-path/effects/monochrome/vars.css',
      );
      expect((core.writeFile as jest.Mock).mock.calls[8][1]).toBe('/export-path/effects/vars.css');
      expect((core.writeFile as jest.Mock).mock.calls[8][0]).toMatchSnapshot(
        '/export-path/effects/vars.css',
      );
    });

    it("should create theme-list.ts files with themes' types", () => {
      const core = createCore({
        config: {
          styles: {
            exportPath: '/export-path/',
            allowedThemes: ['light', 'dark-blue', 'monochrome'],
            defaultTheme: 'monochrome',
            effects: { collectionNames: ['effects'] },
          },
        },
        plugins: [],
        rootPath: '/root-path',
        log: jest.fn(),
      });

      core.writeFile = jest.fn();

      effectsThemePlugin(core, {
        styleMetadata: styleMetadata.styles,
        fileNodes,
        variables,
      } as any);

      expect(core.writeFile).toHaveBeenCalled();
      expect((core.writeFile as jest.Mock).mock.calls[9][1]).toBe('/export-path/themes-list.ts');
      expect((core.writeFile as jest.Mock).mock.calls[9][0]).toMatchSnapshot(
        '/export-path/themes-list.ts',
      );
    });
  });
});
