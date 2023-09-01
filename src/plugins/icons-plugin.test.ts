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

  describe('single icon config', () => {
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

      const result = iconsPlugin(core, { figmaClient } as any);

      return (result as Promise<void>).then(() => {
        expect(generateIcons).not.toHaveBeenCalled();
        expect(generateIconSpriteFromLocalFiles).not.toHaveBeenCalled();
      });
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

      const result = iconsPlugin(core, { figmaClient } as any);

      return (result as Promise<void>).then(() => {
        expect(generateIcons).toHaveBeenCalledWith(figmaClient, core.config.icons, core.config);
        expect(generateIconSpriteFromLocalFiles).not.toHaveBeenCalled();
      });
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

      const result = iconsPlugin(core, { figmaClient } as any);

      return (result as Promise<void>).then(() => {
        expect(generateIcons).not.toHaveBeenCalled();
        expect(generateIconSpriteFromLocalFiles).toHaveBeenCalledWith(core.config.icons);
      });
    });
  });

  describe('multi icon config (icons is an array)', () => {
    it('should be disabled all configs and launch nothing', () => {
      const core = createCore({
        config: {
          icons: [
            {
              disabled: true,
              exportPath: '/export-path/',
            },
            {
              disabled: true,
              exportPath: '/export-path/',
            },
          ],
        },
        plugins: [],
        rootPath: '/root-path',
      });

      const figmaClient = jest.fn();

      const result = iconsPlugin(core, { figmaClient } as any);

      return (result as Promise<void>).then(() => {
        expect(generateIcons).not.toHaveBeenCalled();
        expect(generateIconSpriteFromLocalFiles).not.toHaveBeenCalled();
      });
    });

    it('should be disabled for one config and another config should be launched', () => {
      const core = createCore({
        config: {
          icons: [
            {
              disabled: true,
              exportPath: '/export-path/',
            },
            {
              disabled: false,
              exportPath: '/export-path/',
            },
          ],
        },
        plugins: [],
        rootPath: '/root-path',
      });

      const figmaClient = jest.fn();

      (generateIcons as jest.Mock).mockImplementationOnce(() => {
        return Promise.resolve();
      });

      const result = iconsPlugin(core, { figmaClient } as any);

      return (result as Promise<void>).then(() => {
        expect(generateIcons).toHaveBeenCalled();
        expect(generateIcons).toHaveBeenCalledTimes(1);
        expect(generateIcons).toHaveBeenCalledWith(figmaClient, core.config.icons[1], core.config);
        expect(generateIconSpriteFromLocalFiles).not.toHaveBeenCalled();
      });
    });

    it('should launch both configs for downloading and generating icons', () => {
      const core = createCore({
        config: {
          icons: [
            {
              exportPath: '/export-path/',
            },
            {
              exportPath: '/export-path-2/',
            },
          ],
        },
        plugins: [],
        rootPath: '/root-path',
      });

      (generateIcons as jest.Mock).mockImplementationOnce(() => {
        return Promise.resolve();
      });
      (generateIcons as jest.Mock).mockImplementationOnce(() => {
        return Promise.resolve();
      });

      const figmaClient = jest.fn();

      const result = iconsPlugin(core, { figmaClient } as any);

      return (result as Promise<void>).then(() => {
        expect(generateIcons).toHaveBeenCalledTimes(2);
        expect(generateIcons).toHaveBeenNthCalledWith(
          1,
          figmaClient,
          core.config.icons[0],
          core.config,
        );
        expect(generateIcons).toHaveBeenNthCalledWith(
          2,
          figmaClient,
          core.config.icons[1],
          core.config,
        );
        expect(generateIconSpriteFromLocalFiles).not.toHaveBeenCalled();
      });
    });

    it('should launch generation local icons for one config and generation icons', () => {
      const core = createCore({
        config: {
          icons: [
            {
              exportPath: '/export-path/',
              localIcons: true,
            },
            {
              exportPath: '/export-path-2/',
            },
          ],
        },
        plugins: [],
        rootPath: '/root-path',
      });

      (generateIcons as jest.Mock).mockImplementationOnce(() => {
        return Promise.resolve();
      });
      (generateIconSpriteFromLocalFiles as jest.Mock).mockImplementationOnce(() => {
        return Promise.resolve();
      });

      const figmaClient = jest.fn();

      const result = iconsPlugin(core, { figmaClient } as any);

      return (result as Promise<void>).then(() => {
        expect(generateIcons).toHaveBeenCalledWith(figmaClient, core.config.icons[1], core.config);
        expect(generateIconSpriteFromLocalFiles).toHaveBeenCalledWith(core.config.icons[0]);
      });
    });
  });
});
