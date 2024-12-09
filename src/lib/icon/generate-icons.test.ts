/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/naming-convention */
import { ClientInterface } from 'figma-js';
import fs from 'fs';
import { vol } from 'memfs';
import path from 'path';

import { iconsFileNodes } from '../../utils/generate-styles/fixtures/icons-file-nodes';
import { downloadStreamingToFile } from '../download-streaming-to-file';
import { generateIconTypes } from '../generate-icon-types';
import { generateIconsSprite } from '../generate-icons-sprite';
import { defaultSVGConfig, optimizeSvg } from '../optimize-svg';
import { generateIcons } from './generate-icons';

jest.mock('fs');
jest.mock('../generate-icon-types');
jest.mock('../generate-icons-sprite');
jest.mock('../download-streaming-to-file');
jest.mock('../optimize-svg', () => {
  const { defaultSVGConfig } = jest.requireActual('../optimize-svg');

  return {
    __esModule: true,
    defaultSVGConfig,
    optimizeSvg: jest.fn(),
  };
});

const createClient = (): ClientInterface => {
  return {
    fileNodes: jest.fn(function (fileId: any, { ids }: any) {
      if (ids.length > 0) {
        return { data: iconsFileNodes };
      }

      return { data: { nodes: {} } };
    }),
    fileImages: jest.fn((fileId: any, { ids }: any) => {
      const images: Record<string, string> = {};
      for (let i = 0; i < ids.length; i++) {
        images[ids[i]] = 'https://path-to-svg-file-' + ids[i];
      }

      return { data: { images } };
    }),
  } as any;
};

const svgDirectory = path.join(__dirname, '../../utils/generate-styles/fixtures');

describe('generateIcons', () => {
  beforeEach(() => {
    (downloadStreamingToFile as jest.Mock).mockImplementation((url: string, filename: string) => {
      if (!fs.existsSync('/tmp/svg')) {
        fs.mkdirSync('/tmp/svg', { recursive: true });
      }
      let realFileName = '';
      switch (filename) {
        case '/tmp/svg/profile.svg':
        case '/tmp/svg/profile_extra.svg':
          realFileName = 'profile.svg';
          break;
        case '/tmp/svg/settings.svg':
        case '/tmp/svg/settings_extra.svg':
          realFileName = 'settings.svg';
          break;
        case '/tmp/svg/sidebar-notifications.svg':
        case '/tmp/svg/sidebar-notifications_extra.svg':
          realFileName = 'sidebar-notifications.svg';
          break;
        case '/tmp/svg/pin.svg':
        case '/tmp/svg/pin_extra.svg':
          realFileName = 'pin.svg';
          break;
        case '/tmp/svg/unpin.svg':
        case '/tmp/svg/unpin_extra.svg':
          realFileName = 'unpin.svg';
          break;
      }
      if (realFileName) {
        vol.fromJSON({
          [filename]: (fs as any).__originalFs.readFileSync(path.join(svgDirectory, realFileName), {
            encoding: 'UTF-8',
          }),
        });
      }

      return Promise.resolve(filename);
    });
  });
  afterEach(() => {
    vol.reset();
    (downloadStreamingToFile as jest.Mock).mockReset();
    (optimizeSvg as jest.Mock).mockReset();
  });

  it('should throw the error because exportPath is empty', () => {
    const config: any = {
      fileId: 'any',
      icons: {
        nodeIds: [],
      },
    };

    return expect(generateIcons({} as any, config.icons, config, jest.fn())).rejects.toThrow(
      'config -> icons -> exportPath is required field',
    );
  });

  it('should throw the error because launching of downloadStreamingToFile triggers the error', () => {
    const config: any = {
      fileId: 'any',
      icons: {
        exportPath: '/tmp',
        nodeIds: ['12790:103016'],
      },
    };

    (downloadStreamingToFile as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Inner error');
    });

    return expect(generateIcons(createClient(), config.icons, config, jest.fn())).rejects.toThrow(
      'Inner error',
    );
  });

  it('should throw the error because launching of optimizeSvg triggers the error', () => {
    const config: any = {
      fileId: 'any',
      icons: {
        exportPath: '/tmp',
        nodeIds: ['12790:103016'],
      },
    };

    (optimizeSvg as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Inner error');
    });

    return expect(generateIcons(createClient(), config.icons, config, jest.fn())).rejects.toThrow(
      'Inner error',
    );
  });

  it('should throw the error because there are icon duplicates', () => {
    const config: any = {
      fileId: 'any',
      icons: {
        exportPath: '/tmp',
        nodeIds: ['12790:103016'],
      },
    };

    const client = createClient();
    (client as any).fileNodes = jest.fn(function (fileId: any, { ids }: any) {
      if (ids.length > 0) {
        return {
          data: {
            ...iconsFileNodes,
            nodes: {
              ...iconsFileNodes.nodes,
              '12790:103016': {
                ...iconsFileNodes.nodes['12790:103016'],
                document: {
                  ...iconsFileNodes.nodes['12790:103016'].document,
                  children: [
                    ...iconsFileNodes.nodes['12790:103016'].document.children,
                    {
                      id: '52790:503137',
                      name: 'profile',
                      type: 'COMPONENT',
                      scrollBehavior: 'SCROLLS',
                      blendMode: 'PASS_THROUGH',
                      children: [[Object]],
                      absoluteBoundingBox: { x: 5294, y: 665, width: 24, height: 24 },
                      absoluteRenderBounds: { x: 5294, y: 665, width: 24, height: 24 },
                      constraints: { vertical: 'TOP', horizontal: 'LEFT' },
                      layoutAlign: 'INHERIT',
                      layoutGrow: 0,
                      clipsContent: true,
                      background: [],
                      fills: [],
                      strokes: [],
                      strokeWeight: 1,
                      strokeAlign: 'INSIDE',
                      backgroundColor: { r: 0, g: 0, b: 0, a: 0 },
                      effects: [],
                    },
                  ],
                },
              },
            },
          },
        };
      }

      return { data: { nodes: {} } };
    });

    return expect(generateIcons(client, config.icons, config, jest.fn())).rejects.toThrow(
      "Icon with name: 'profile' is duplicate",
    );
  });

  it('should create folder for exporting', () => {
    const config: any = {
      fileId: 'any',
      icons: {
        exportPath: '/tmp',
        nodeIds: [],
      },
    };

    const spy = jest.spyOn(fs, 'mkdirSync');

    return generateIcons(createClient(), config.icons, config, jest.fn()).then(() => {
      expect(spy).toHaveBeenCalledWith('/tmp/svg', { recursive: true });
    });
  });

  it('should create sub folder for exporting', () => {
    const config: any = {
      fileId: 'any',
      icons: {
        exportPath: '/tmp',
        exportSubdir: 'exportSubdir',
        nodeIds: [],
      },
    };

    const spy = jest.spyOn(fs, 'mkdirSync');

    return generateIcons(createClient(), config.icons, config, jest.fn()).then(() => {
      expect(spy).toHaveBeenCalledWith('/tmp/exportSubdir/svg', { recursive: true });
    });
  });

  it('should download and write svg icons', () => {
    const client = createClient();
    const config: any = {
      apiKey: 'api_key',
      fileId: 'file_id',
      icons: {
        exportPath: '/tmp',
        nodeIds: ['12790:103016'],
      },
    };

    return generateIcons(client, config.icons, config, jest.fn()).then(() => {
      expect(client.fileNodes).toHaveBeenCalledWith('file_id', { ids: ['12790:103016'] });
      expect(client.fileImages).toHaveBeenNthCalledWith(1, 'file_id', {
        format: 'svg',
        ids: ['12790:103137', '12790:103136', '12790:103135'],
      });
      expect(client.fileImages).toHaveBeenNthCalledWith(2, 'file_id', {
        format: 'svg',
        ids: ['17310:267509', '16901:275425'],
      });

      expect(downloadStreamingToFile).toHaveBeenCalledTimes(5);

      expect(downloadStreamingToFile).toHaveBeenNthCalledWith(
        1,
        'https://path-to-svg-file-12790:103137',
        '/tmp/svg/profile.svg',
        { 'X-Figma-Token': 'api_key' },
      );

      expect(downloadStreamingToFile).toHaveBeenNthCalledWith(
        2,
        'https://path-to-svg-file-12790:103136',
        '/tmp/svg/settings.svg',
        { 'X-Figma-Token': 'api_key' },
      );

      expect(downloadStreamingToFile).toHaveBeenNthCalledWith(
        3,
        'https://path-to-svg-file-12790:103135',
        '/tmp/svg/sidebar-notifications.svg',
        { 'X-Figma-Token': 'api_key' },
      );

      expect(downloadStreamingToFile).toHaveBeenNthCalledWith(
        4,
        'https://path-to-svg-file-17310:267509',
        '/tmp/svg/pin.svg',
        { 'X-Figma-Token': 'api_key' },
      );

      expect(downloadStreamingToFile).toHaveBeenNthCalledWith(
        5,
        'https://path-to-svg-file-16901:275425',
        '/tmp/svg/unpin.svg',
        { 'X-Figma-Token': 'api_key' },
      );

      expect(optimizeSvg).toHaveBeenNthCalledWith(1, '/tmp/svg/profile.svg', {
        ...defaultSVGConfig,
      });
      expect(optimizeSvg).toHaveBeenNthCalledWith(2, '/tmp/svg/settings.svg', {
        ...defaultSVGConfig,
      });
      expect(optimizeSvg).toHaveBeenNthCalledWith(3, '/tmp/svg/sidebar-notifications.svg', {
        ...defaultSVGConfig,
      });
      expect(optimizeSvg).toHaveBeenNthCalledWith(4, '/tmp/svg/pin.svg', { ...defaultSVGConfig });
      expect(optimizeSvg).toHaveBeenNthCalledWith(5, '/tmp/svg/unpin.svg', { ...defaultSVGConfig });

      expect(vol.toJSON()).toMatchSnapshot();
    });
  });

  it('should download and write svg icons with custom icon name', () => {
    const client = createClient();
    const config: any = {
      apiKey: 'api_key',
      fileId: 'file_id',
      icons: {
        exportPath: '/tmp',
        nodeIds: ['12790:103016'],
        iconName: (name: string) => name + '_extra',
      },
    };

    return generateIcons(client, config.icons, config, jest.fn()).then(() => {
      expect(vol.toJSON()).toMatchSnapshot();
    });
  });

  it('should launch generation of icon types', () => {
    const client = createClient();
    const config: any = {
      apiKey: 'api_key',
      fileId: 'file_id',
      icons: {
        exportPath: '/tmp',
        nodeIds: ['12790:103016'],
        generateTypes: true,
      },
    };

    return generateIcons(client, config.icons, config, jest.fn()).then(() => {
      expect(generateIconTypes).toHaveBeenCalledWith(
        ['profile', 'settings', 'sidebar-notifications', 'pin', 'unpin'],
        '/tmp',
      );
    });
  });

  it('should launch generation an icon sprite', () => {
    const client = createClient();
    const config: any = {
      apiKey: 'api_key',
      fileId: 'file_id',
      icons: {
        exportPath: '/tmp',
        nodeIds: ['12790:103016'],
        generateSprite: true,
      },
    };

    return generateIcons(client, config.icons, config, jest.fn()).then(() => {
      expect(generateIconsSprite).toHaveBeenCalledWith('/tmp');
    });
  });

  it('should launch generation with custom optimize config', () => {
    const client = createClient();
    const config: any = {
      apiKey: 'api_key',
      fileId: 'file_id',
      icons: {
        exportPath: '/tmp',
        nodeIds: ['12790:103016'],
        optimizeSvg: config => ({ ...config, plugins: [] }),
      },
    };

    return generateIcons(client, config.icons, config, jest.fn()).then(() => {
      expect(optimizeSvg).toHaveBeenNthCalledWith(1, '/tmp/svg/profile.svg', {
        ...defaultSVGConfig,
        plugins: [],
      });
      expect(optimizeSvg).toHaveBeenNthCalledWith(2, '/tmp/svg/settings.svg', {
        ...defaultSVGConfig,
        plugins: [],
      });
      expect(optimizeSvg).toHaveBeenNthCalledWith(3, '/tmp/svg/sidebar-notifications.svg', {
        ...defaultSVGConfig,
        plugins: [],
      });
      expect(optimizeSvg).toHaveBeenNthCalledWith(4, '/tmp/svg/pin.svg', {
        ...defaultSVGConfig,
        plugins: [],
      });
      expect(optimizeSvg).toHaveBeenNthCalledWith(5, '/tmp/svg/unpin.svg', {
        ...defaultSVGConfig,
        plugins: [],
      });
    });
  });

  it('should launch generation without optimize svg', () => {
    const client = createClient();
    const config: any = {
      apiKey: 'api_key',
      fileId: 'file_id',
      icons: {
        exportPath: '/tmp',
        nodeIds: ['12790:103016'],
        optimizeSvg: false,
      },
    };

    return generateIcons(client, config.icons, config, jest.fn()).then(() => {
      expect(optimizeSvg).not.toHaveBeenCalled();
    });
  });

  it('should launch generation without skipIcon', () => {
    const client = createClient();
    const config: any = {
      apiKey: 'api_key',
      fileId: 'file_id',
      icons: {
        exportPath: '/tmp',
        nodeIds: ['12790:103016'],
      },
    };

    return generateIcons(client, config.icons, config, jest.fn()).then(() => {
      expect(vol.toJSON()).toMatchSnapshot();
    });
  });

  it('should launch generation with skipIcon and skip some icons', () => {
    const client = createClient();
    const skipIcon = jest.fn((name: string) => !name.includes('pin'));
    const config: any = {
      apiKey: 'api_key',
      fileId: 'file_id',
      icons: {
        exportPath: '/tmp',
        nodeIds: ['12790:103016'],
        skipIcon,
      },
    };

    return generateIcons(client, config.icons, config, jest.fn()).then(() => {
      expect(vol.toJSON()).toMatchSnapshot();
      expect(skipIcon).toHaveBeenCalledTimes(5);
      expect(skipIcon).toHaveBeenCalledWith('pin');
      expect(skipIcon).toHaveBeenCalledWith('unpin');
      expect(skipIcon).toHaveBeenCalledWith('profile');
      expect(skipIcon).toHaveBeenCalledWith('settings');
      expect(skipIcon).toHaveBeenCalledWith('sidebar-notifications');

      expect(downloadStreamingToFile).toHaveBeenCalledTimes(3);

      expect(downloadStreamingToFile).toHaveBeenNthCalledWith(
        1,
        'https://path-to-svg-file-12790:103137',
        '/tmp/svg/profile.svg',
        { 'X-Figma-Token': 'api_key' },
      );

      expect(downloadStreamingToFile).toHaveBeenNthCalledWith(
        2,
        'https://path-to-svg-file-12790:103136',
        '/tmp/svg/settings.svg',
        { 'X-Figma-Token': 'api_key' },
      );

      expect(downloadStreamingToFile).toHaveBeenNthCalledWith(
        3,
        'https://path-to-svg-file-12790:103135',
        '/tmp/svg/sidebar-notifications.svg',
        { 'X-Figma-Token': 'api_key' },
      );
    });
  });
});
