import { createCore } from '../core';
import { fileNodes } from '../utils/generate-styles/fixtures/file-nodes';
import { styleMetadata } from '../utils/generate-styles/fixtures/style-metadata';
import { textStylesPlugin } from './text-styles-plugin';

describe('textStylesPlugin', () => {
  it('should write js file and run formatting tool', () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          textStyles: {},
        },
      },
      plugins: [],
      rootPath: '/root-path',
    });

    core.writeFile = jest.fn();
    core.runFormattingFile = jest.fn();

    textStylesPlugin(core, { styleMetadata: styleMetadata.styles, fileNodes });

    expect(core.writeFile).toHaveBeenCalled();
    expect(core.writeFile.mock.calls[0][1]).toBe('/export-path/text-styles.js');

    expect(core.runFormattingFile).toHaveBeenCalled();
    expect(core.runFormattingFile).toHaveBeenCalledWith('/export-path/text-styles.js');
  });

  it('should write generated date for default config', () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          textStyles: {},
        },
      },
      plugins: [],
      rootPath: '/root-path',
    });

    core.writeFile = jest.fn();
    core.runFormattingFile = jest.fn();

    textStylesPlugin(core, { styleMetadata: styleMetadata.styles, fileNodes });

    expect(core.writeFile).toHaveBeenCalled();
    expect(core.writeFile.mock.calls[0][0]).toMatchSnapshot();
  });

  it('should be skipped due to disabled field', () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          textStyles: {
            disabled: true,
          },
        },
      },
      plugins: [],
      rootPath: '/root-path',
    });

    core.writeFile = jest.fn();
    core.runFormattingFile = jest.fn();

    textStylesPlugin(core, { styleMetadata: styleMetadata.styles, fileNodes });

    expect(core.writeFile).not.toHaveBeenCalled();
    expect(core.runFormattingFile).not.toHaveBeenCalled();
  });

  it('should create data with merged styles', () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          textStyles: {
            merge: true,
          },
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
    });

    core.writeFile = jest.fn();
    core.runFormattingFile = jest.fn();

    textStylesPlugin(core, { styleMetadata: styleMetadata.styles, fileNodes });

    expect(core.writeFile).toHaveBeenCalled();
    expect(core.writeFile.mock.calls[0][0]).toMatchSnapshot();
  });

  it('should create data with custom keyName function', () => {
    const core = createCore({
      config: {
        styles: {
          exportPath: '/export-path/',
          textStyles: {
            keyName: name => name + '__extra',
          },
        },
      },
      plugins: [],
      rootPath: '/root-path',
    });

    core.writeFile = jest.fn();
    core.runFormattingFile = jest.fn();

    textStylesPlugin(core, { styleMetadata: styleMetadata.styles, fileNodes });

    expect(core.writeFile).toHaveBeenCalled();
    expect(core.writeFile.mock.calls[0][0]).toMatchSnapshot();
  });
});
