/* eslint-disable max-lines */
import { createCore } from '../core';
import { fileNodes } from '../utils/generate-styles/fixtures/file-nodes';
import { styleMetadata } from '../utils/generate-styles/fixtures/style-metadata';
import { colorsThemePlugin } from './colors-theme-plugin';

describe('colorsThemePlugin', () => {
  it('should throw the error because the allowedThemes is not defined', () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          colors: {
            useTheme: true,
          },
        },
      },
      plugins: [],
      rootPath: '/root-path',
      log: jest.fn(),
    });

    core.writeFile = jest.fn();

    expect(() =>
      colorsThemePlugin(core, { styleMetadata: styleMetadata.styles, fileNodes } as any),
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
          colors: {
            useTheme: true,
          },
        },
      },
      plugins: [],
      rootPath: '/root-path',
      log: jest.fn(),
    });

    core.writeFile = jest.fn();

    expect(() =>
      colorsThemePlugin(core, { styleMetadata: styleMetadata.styles, fileNodes } as any),
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
          colors: {
            useTheme: true,
          },
        },
      },
      plugins: [],
      rootPath: '/root-path',
      log: jest.fn(),
    });

    core.writeFile = jest.fn();

    expect(() =>
      colorsThemePlugin(core, { styleMetadata: styleMetadata.styles, fileNodes } as any),
    ).toThrow('`config -> styles -> allowedThemes` field must have one or more theme name');
  });

  it('should throw the error because the defined defaultTheme is not included in allowedThemes list', () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          allowedThemes: ['light', 'dark', 'monochrome'],
          defaultTheme: 'another',
          colors: {
            useTheme: true,
          },
        },
      },
      plugins: [],
      rootPath: '/root-path',
      log: jest.fn(),
    });

    core.writeFile = jest.fn();

    expect(() =>
      colorsThemePlugin(core, { styleMetadata: styleMetadata.styles, fileNodes } as any),
    ).toThrow("`config -> styles -> defaultTheme` field must be one of allowedThemes' values");
  });

  it("should throw the error because any theme wasn't found inside figma data", () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          allowedThemes: ['theme1', 'theme2'],
          defaultTheme: 'theme1',
          colors: {
            useTheme: true,
          },
        },
      },
      plugins: [],
      rootPath: '/root-path',
      log: jest.fn(),
    });

    core.writeFile = jest.fn();

    expect(() =>
      colorsThemePlugin(core, { styleMetadata: styleMetadata.styles, fileNodes } as any),
    ).toThrow("None of themes was found inside figma data. Check your themes and figma's themes");
  });

  it('should throw the error because some colors from themes contain not-valid chars', () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          allowedThemes: ['light', 'dark', 'monochrome'],
          defaultTheme: 'monochrome',
          colors: {
            useTheme: true,
            keyName: (name?: string) => (name === 'light/text/txt900' ? name + '+prefix' : name),
          },
        },
      },
      plugins: [],
      rootPath: '/root-path',
      log: jest.fn(),
    });

    core.writeFile = jest.fn();

    expect(() =>
      colorsThemePlugin(core, { styleMetadata: styleMetadata.styles, fileNodes } as any),
    ).toThrow('Color name: "text-txt900+prefix" from "light" theme contains not-valid chars.');
  });

  it('should throw the error because some colors from no themes contain not-valid chars', () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          allowedThemes: ['light', 'dark', 'monochrome'],
          defaultTheme: 'monochrome',
          colors: {
            useTheme: true,
            keyName: (name?: string) => (name === 'text/txt900' ? name + '+prefix' : name),
          },
        },
      },
      plugins: [],
      rootPath: '/root-path',
      log: jest.fn(),
    });

    core.writeFile = jest.fn();

    expect(() =>
      colorsThemePlugin(core, { styleMetadata: styleMetadata.styles, fileNodes } as any),
    ).toThrow('Color name: "text-txt900+prefix" without theme contains not-valid chars.');
  });

  it('should check the second parameter of the custom keyName function', () => {
    const keyName = jest.fn((name?: string) => name);
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          allowedThemes: ['light', 'dark', 'monochrome'],
          defaultTheme: 'monochrome',
          colors: {
            useTheme: true,
            keyName,
          },
        },
      },
      plugins: [],
      rootPath: '/root-path',
      log: jest.fn(),
    });

    core.writeFile = jest.fn();

    colorsThemePlugin(core, { styleMetadata: styleMetadata.styles, fileNodes } as any);

    expect((keyName as jest.Mock).mock.calls[0][1]).toBeTruthy();
  });

  it('should create js files with css variables', () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          allowedThemes: ['light', 'dark', 'monochrome'],
          defaultTheme: 'monochrome',
          colors: {
            useTheme: true,
          },
        },
      },
      plugins: [],
      rootPath: '/root-path',
      log: jest.fn(),
    });

    core.writeFile = jest.fn();

    colorsThemePlugin(core, { styleMetadata: styleMetadata.styles, fileNodes } as any);

    expect(core.writeFile).toHaveBeenCalled();
    expect((core.writeFile as jest.Mock).mock.calls[0][1]).toBe(
      '/export-path/colors/light/index.js',
    );
    expect((core.writeFile as jest.Mock).mock.calls[0][0]).toMatchSnapshot(
      '/export-path/colors/light/index.js',
    );
    expect((core.writeFile as jest.Mock).mock.calls[2][1]).toBe(
      '/export-path/colors/dark/index.js',
    );
    expect((core.writeFile as jest.Mock).mock.calls[2][0]).toMatchSnapshot(
      '/export-path/colors/dark/index.js',
    );
    expect((core.writeFile as jest.Mock).mock.calls[4][1]).toBe(
      '/export-path/colors/monochrome/index.js',
    );
    expect((core.writeFile as jest.Mock).mock.calls[4][0]).toMatchSnapshot(
      '/export-path/colors/monochrome/index.js',
    );
    expect((core.writeFile as jest.Mock).mock.calls[6][1]).toBe('/export-path/colors/with-vars.js');
    expect((core.writeFile as jest.Mock).mock.calls[6][0]).toMatchSnapshot(
      '/export-path/colors/with-vars.js',
    );
    expect((core.writeFile as jest.Mock).mock.calls[7][1]).toBe('/export-path/colors/index.js');
    expect((core.writeFile as jest.Mock).mock.calls[7][0]).toMatchSnapshot(
      '/export-path/colors/index.js',
    );
  });

  it('should create css files with css variables', () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          allowedThemes: ['light', 'dark', 'monochrome'],
          defaultTheme: 'monochrome',
          colors: {
            useTheme: true,
          },
        },
      },
      plugins: [],
      rootPath: '/root-path',
      log: jest.fn(),
    });

    core.writeFile = jest.fn();

    colorsThemePlugin(core, { styleMetadata: styleMetadata.styles, fileNodes } as any);

    expect(core.writeFile).toHaveBeenCalled();
    expect((core.writeFile as jest.Mock).mock.calls[1][1]).toBe(
      '/export-path/colors/light/vars.css',
    );
    expect((core.writeFile as jest.Mock).mock.calls[1][0]).toMatchSnapshot(
      '/export-path/colors/light/vars.css',
    );
    expect((core.writeFile as jest.Mock).mock.calls[3][1]).toBe(
      '/export-path/colors/dark/vars.css',
    );
    expect((core.writeFile as jest.Mock).mock.calls[3][0]).toMatchSnapshot(
      '/export-path/colors/dark/vars.css',
    );
    expect((core.writeFile as jest.Mock).mock.calls[5][1]).toBe(
      '/export-path/colors/monochrome/vars.css',
    );
    expect((core.writeFile as jest.Mock).mock.calls[5][0]).toMatchSnapshot(
      '/export-path/colors/monochrome/vars.css',
    );
    expect((core.writeFile as jest.Mock).mock.calls[8][1]).toBe('/export-path/colors/vars.css');
    expect((core.writeFile as jest.Mock).mock.calls[8][0]).toMatchSnapshot(
      '/export-path/colors/vars.css',
    );
  });

  it("should create theme-list.ts files with themes' types", () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          allowedThemes: ['light', 'dark', 'monochrome'],
          defaultTheme: 'monochrome',
          colors: {
            useTheme: true,
          },
        },
      },
      plugins: [],
      rootPath: '/root-path',
      log: jest.fn(),
    });

    core.writeFile = jest.fn();

    colorsThemePlugin(core, { styleMetadata: styleMetadata.styles, fileNodes } as any);

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
            colors: {
              useTheme: true,
            },
          },
        },
        plugins: [],
        rootPath: '/root-path',
        log: jest.fn(),
      });

      core.writeFile = jest.fn();

      colorsThemePlugin(core, { styleMetadata: styleMetadata.styles, fileNodes } as any);

      expect(core.writeFile).toHaveBeenCalled();
      expect((core.writeFile as jest.Mock).mock.calls[0][1]).toBe(
        '/export-path/colors/light/index.js',
      );
      expect((core.writeFile as jest.Mock).mock.calls[0][0]).toMatchSnapshot(
        '/export-path/colors/light/index.js',
      );
      expect((core.writeFile as jest.Mock).mock.calls[2][1]).toBe(
        '/export-path/colors/dark-blue/index.js',
      );
      expect((core.writeFile as jest.Mock).mock.calls[2][0]).toMatchSnapshot(
        '/export-path/colors/dark-blue/index.js',
      );
      expect((core.writeFile as jest.Mock).mock.calls[4][1]).toBe(
        '/export-path/colors/monochrome/index.js',
      );
      expect((core.writeFile as jest.Mock).mock.calls[4][0]).toMatchSnapshot(
        '/export-path/colors/monochrome/index.js',
      );
      expect((core.writeFile as jest.Mock).mock.calls[6][1]).toBe(
        '/export-path/colors/with-vars.js',
      );
      expect((core.writeFile as jest.Mock).mock.calls[6][0]).toMatchSnapshot(
        '/export-path/colors/with-vars.js',
      );
      expect((core.writeFile as jest.Mock).mock.calls[7][1]).toBe('/export-path/colors/index.js');
      expect((core.writeFile as jest.Mock).mock.calls[7][0]).toMatchSnapshot(
        '/export-path/colors/index.js',
      );
    });

    it('should create css files with css variables', () => {
      const core = createCore({
        config: {
          styles: {
            exportPath: '/export-path/',
            allowedThemes: ['light', 'dark-blue', 'monochrome'],
            defaultTheme: 'monochrome',
            colors: {
              useTheme: true,
            },
          },
        },
        plugins: [],
        rootPath: '/root-path',
        log: jest.fn(),
      });

      core.writeFile = jest.fn();

      colorsThemePlugin(core, { styleMetadata: styleMetadata.styles, fileNodes } as any);

      expect(core.writeFile).toHaveBeenCalled();

      expect((core.writeFile as jest.Mock).mock.calls[1][1]).toBe(
        '/export-path/colors/light/vars.css',
      );
      expect((core.writeFile as jest.Mock).mock.calls[1][0]).toMatchSnapshot(
        '/export-path/colors/light/vars.css',
      );
      expect((core.writeFile as jest.Mock).mock.calls[3][1]).toBe(
        '/export-path/colors/dark-blue/vars.css',
      );
      expect((core.writeFile as jest.Mock).mock.calls[3][0]).toMatchSnapshot(
        '/export-path/colors/dark-blue/vars.css',
      );
      expect((core.writeFile as jest.Mock).mock.calls[5][1]).toBe(
        '/export-path/colors/monochrome/vars.css',
      );
      expect((core.writeFile as jest.Mock).mock.calls[5][0]).toMatchSnapshot(
        '/export-path/colors/monochrome/vars.css',
      );
      expect((core.writeFile as jest.Mock).mock.calls[8][1]).toBe('/export-path/colors/vars.css');
      expect((core.writeFile as jest.Mock).mock.calls[8][0]).toMatchSnapshot(
        '/export-path/colors/vars.css',
      );
    });

    it("should create theme-list.ts files with themes' types", () => {
      const core = createCore({
        config: {
          styles: {
            exportPath: '/export-path/',
            allowedThemes: ['light', 'dark-blue', 'monochrome'],
            defaultTheme: 'monochrome',
            colors: {
              useTheme: true,
            },
          },
        },
        plugins: [],
        rootPath: '/root-path',
        log: jest.fn(),
      });

      core.writeFile = jest.fn();

      colorsThemePlugin(core, { styleMetadata: styleMetadata.styles, fileNodes } as any);

      expect(core.writeFile).toHaveBeenCalled();
      expect((core.writeFile as jest.Mock).mock.calls[9][1]).toBe('/export-path/themes-list.ts');
      expect((core.writeFile as jest.Mock).mock.calls[9][0]).toMatchSnapshot(
        '/export-path/themes-list.ts',
      );
    });
  });
});
