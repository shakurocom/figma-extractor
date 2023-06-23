import { createCore } from '../core';
import { fileNodes } from '../utils/generate-styles/fixtures/file-nodes';
import { styleMetadata } from '../utils/generate-styles/fixtures/style-metadata';
import { colorsPlugin } from './colors-plugin';

describe('colorsPlugin', () => {
  it('should write js file and run formatting tool', () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          colors: {},
        },
      },
      plugins: [],
      rootPath: '/root-path',
    });

    core.writeFile = jest.fn();

    colorsPlugin(core, { styleMetadata: styleMetadata.styles, fileNodes } as any);

    expect(core.writeFile).toHaveBeenCalled();
    expect((core.writeFile as jest.Mock).mock.calls[0][1]).toBe('/export-path/colors.js');
  });

  it('should write generated date for default config', () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          colors: {},
        },
      },
      plugins: [],
      rootPath: '/root-path',
    });

    core.writeFile = jest.fn();

    colorsPlugin(core, { styleMetadata: styleMetadata.styles, fileNodes } as any);

    expect(core.writeFile).toHaveBeenCalled();
    expect((core.writeFile as jest.Mock).mock.calls[0][0]).toMatchSnapshot();
  });

  it('should be skipped due to disabled field', () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          colors: {
            disabled: true,
          },
        },
      },
      plugins: [],
      rootPath: '/root-path',
    });

    core.writeFile = jest.fn();

    colorsPlugin(core, { styleMetadata: styleMetadata.styles, fileNodes } as any);

    expect(core.writeFile).not.toHaveBeenCalled();
  });

  it('should create data with custom keyName function', () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          colors: {
            keyName: (name?: string) => name + '__extra',
          },
        },
      },
      plugins: [],
      rootPath: '/root-path',
    });

    core.writeFile = jest.fn();

    colorsPlugin(core, { styleMetadata: styleMetadata.styles, fileNodes } as any);

    expect(core.writeFile).toHaveBeenCalled();
    expect((core.writeFile as jest.Mock).mock.calls[0][0]).toMatchSnapshot();
  });
});
