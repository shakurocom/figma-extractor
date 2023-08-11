import { createCore } from '../core';
import { generateIcons } from '../lib/icon/generate-icons';
import { generateIconSpriteFromLocalFiles } from '../lib/icon/generate-icons-sprite-from-local-files';
import { iconsPlugin } from './icons-plugin';

jest.mock('../lib/icon/generate-icons');
jest.mock('../lib/icon/generate-icons-sprite-from-local-files');

describe('iconsPlugin', () => {
  beforeEach(() => {
    (generateIcons as jest.Mock).mockReset();
    (generateIconSpriteFromLocalFiles as jest.Mock).mockReset();
  });

  it('should be disabled and launch nothing', () => {
    const core = createCore({
      config: {
        icons: {
          disabled: true,
          exportPath: '/export-path/',
        },
      },
      plugins: [],
      rootPath: '/root-path',
    });

    const figmaClient = jest.fn();

    iconsPlugin(core, { figmaClient } as any);

    expect(generateIcons).not.toHaveBeenCalled();
    expect(generateIconSpriteFromLocalFiles).not.toHaveBeenCalled();
  });

  it('should launch download and generation icon', () => {
    const core = createCore({
      config: {
        icons: {
          exportPath: '/export-path/',
        },
      },
      plugins: [],
      rootPath: '/root-path',
    });

    (generateIcons as jest.Mock).mockImplementationOnce(() => {
      return Promise.resolve();
    });

    const figmaClient = jest.fn();

    iconsPlugin(core, { figmaClient } as any);

    expect(generateIcons).toHaveBeenCalledWith(figmaClient, core.config);
    expect(generateIconSpriteFromLocalFiles).not.toHaveBeenCalled();
  });

  it('should launch only generation local icons (with property localIcon = true)', () => {
    const core = createCore({
      config: {
        icons: {
          exportPath: '/export-path/',
          localIcons: true,
        },
      },
      plugins: [],
      rootPath: '/root-path',
    });

    (generateIconSpriteFromLocalFiles as jest.Mock).mockImplementationOnce(() => {
      return Promise.resolve();
    });

    const figmaClient = jest.fn();

    iconsPlugin(core, { figmaClient } as any);

    expect(generateIcons).not.toHaveBeenCalled();
    expect(generateIconSpriteFromLocalFiles).toHaveBeenCalledWith(core.config);
  });
});
