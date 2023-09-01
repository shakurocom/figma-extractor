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
    return expect(
      generateIcons({} as any, {
        fileId: 'any',
        icons: {
          nodeIds: [],
        },
      }),
    ).rejects.toThrow('config -> icons -> exportPath is required field');
  });

  it('should throw the error because launching of downloadStreamingToFile triggers the error', () => {
    (downloadStreamingToFile as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Inner error');
    });

    return expect(
      generateIcons(createClient(), {
        fileId: 'any',
        icons: {
          exportPath: '/tmp',
          nodeIds: ['12790:103016'],
        },
      }),
    ).rejects.toThrow('Inner error');
  });

  it('should throw the error because launching of optimizeSvg triggers the error', () => {
    (optimizeSvg as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Inner error');
    });

    return expect(
      generateIcons(createClient(), {
        fileId: 'any',
        icons: {
          exportPath: '/tmp',
          nodeIds: ['12790:103016'],
        },
      }),
    ).rejects.toThrow('Inner error');
  });

  it('should create folder for exporting', () => {
    const spy = jest.spyOn(fs, 'mkdirSync');

    return generateIcons(createClient(), {
      fileId: 'any',
      icons: {
        exportPath: '/tmp',
        nodeIds: [],
      },
    }).then(() => {
      expect(spy).toHaveBeenCalledWith('/tmp/svg', { recursive: true });
    });
  });

  it('should download and write svg icons', () => {
    const client = createClient();

    return generateIcons(client, {
      apiKey: 'api_key',
      fileId: 'file_id',
      icons: {
        exportPath: '/tmp',
        nodeIds: ['12790:103016'],
      },
    }).then(() => {
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

    return generateIcons(client, {
      apiKey: 'api_key',
      fileId: 'file_id',
      icons: {
        exportPath: '/tmp',
        nodeIds: ['12790:103016'],
        iconName: (name: string) => name + '_extra',
      },
    }).then(() => {
      expect(vol.toJSON()).toMatchSnapshot();
    });
  });

  it('should launch generation of icon types', () => {
    const client = createClient();

    return generateIcons(client, {
      apiKey: 'api_key',
      fileId: 'file_id',
      icons: {
        exportPath: '/tmp',
        nodeIds: ['12790:103016'],
        generateTypes: true,
      },
    }).then(() => {
      expect(generateIconTypes).toHaveBeenCalledWith(
        ['profile', 'settings', 'sidebar-notifications', 'pin', 'unpin'],
        '/tmp',
      );
    });
  });

  it('should launch generation an icon sprite', () => {
    const client = createClient();

    return generateIcons(client, {
      apiKey: 'api_key',
      fileId: 'file_id',
      icons: {
        exportPath: '/tmp',
        nodeIds: ['12790:103016'],
        generateSprite: true,
      },
    }).then(() => {
      expect(generateIconsSprite).toHaveBeenCalledWith('/tmp');
    });
  });

  it('should launch generation with custom optimize config', () => {
    const client = createClient();

    return generateIcons(client, {
      apiKey: 'api_key',
      fileId: 'file_id',
      icons: {
        exportPath: '/tmp',
        nodeIds: ['12790:103016'],
        optimizeSvg: config => ({ ...config, plugins: [] }),
      },
    }).then(() => {
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

    return generateIcons(client, {
      apiKey: 'api_key',
      fileId: 'file_id',
      icons: {
        exportPath: '/tmp',
        nodeIds: ['12790:103016'],
        optimizeSvg: false,
      },
    }).then(() => {
      expect(optimizeSvg).not.toHaveBeenCalled();
    });
  });
});
