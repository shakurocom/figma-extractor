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

    core.writeJsFile = jest.fn();
    core.runFormattingFile = jest.fn();

    colorsPlugin(core, { styleMetadata: styleMetadata.styles, fileNodes });

    expect(core.writeJsFile).toHaveBeenCalled();
    expect(core.writeJsFile.mock.calls[0][1]).toBe('/export-path/colors.js');

    expect(core.runFormattingFile).toHaveBeenCalled();
    expect(core.runFormattingFile).toHaveBeenCalledWith('/export-path/colors.js');
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

    core.writeJsFile = jest.fn();
    core.runFormattingFile = jest.fn();

    colorsPlugin(core, { styleMetadata: styleMetadata.styles, fileNodes });

    expect(core.writeJsFile).toHaveBeenCalled();
    expect(core.writeJsFile.mock.calls[0][0]).toMatchSnapshot();
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

    core.writeJsFile = jest.fn();
    core.runFormattingFile = jest.fn();

    colorsPlugin(core, { styleMetadata: styleMetadata.styles, fileNodes });

    expect(core.writeJsFile).not.toHaveBeenCalled();
    expect(core.runFormattingFile).not.toHaveBeenCalled();
  });

  it('should create data with custom keyName function', () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          colors: {
            keyName: name => name + '__extra',
          },
        },
      },
      plugins: [],
      rootPath: '/root-path',
    });

    core.writeJsFile = jest.fn();
    core.runFormattingFile = jest.fn();

    colorsPlugin(core, { styleMetadata: styleMetadata.styles, fileNodes });

    expect(core.writeJsFile).toHaveBeenCalled();
    expect(core.writeJsFile.mock.calls[0][0]).toMatchSnapshot();
  });
});
