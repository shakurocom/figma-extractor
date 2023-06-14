import fs from 'fs';
import { vol } from 'memfs';

import { fileNodes } from './fixtures/file-nodes';
import { styleMetadata } from './fixtures/style-metadata';
import { generateStyles } from './generate-styles';

jest.mock('fs');

// The default config has all style items disabled
const getConfig = ({
  disableColors = true,
  disableGradients = true,
  disableEffects = true,
  disableTextStyles = true,
  disableIcons = false,
} = {}) => ({
  apiKey: 'dummy-api-key',
  fileId: 'dummy-file-id',
  styles: {
    exportPath: '/ui/theme',
    colors: {
      disabled: disableColors,
    },
    gradients: {
      disabled: disableGradients,
    },
    effects: {
      disabled: disableEffects,
    },
    textStyles: {
      disabled: disableTextStyles,
    },
  },
  icons: {
    disabled: disableIcons,
  },
});

describe('generateStyles', () => {
  afterEach(() => {
    vol.reset();
  });

  it('creates styles dir according to provided config if there is none', () => {
    const config = getConfig();

    expect(fs.existsSync('/ui/theme')).toBe(false);

    generateStyles(config, styleMetadata.styles, fileNodes);

    expect(fs.existsSync('/ui/theme')).toBe(true);
  });

  it('creates file with gradient styles according to provided config', () => {
    const config = getConfig({
      disableGradients: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    generateStyles(config, styleMetadata.styles, fileNodes);

    expect(vol.toJSON()).toMatchSnapshot();
  });
});
