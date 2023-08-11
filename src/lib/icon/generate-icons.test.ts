import { ClientInterface } from 'figma-js';
import fs from 'fs';
import { vol } from 'memfs';
import moxios from 'moxios';
import path from 'path';

import { iconsFileNodes } from '../../utils/generate-styles/fixtures/icons-file-nodes';
import { generateIconTypes } from '../generate-icon-types';
import { generateIconsSprite } from '../generate-icons-sprite';
import { generateIcons } from './generate-icons';

jest.mock('fs');
jest.mock('../generate-icon-types');
jest.mock('../generate-icons-sprite');

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

const stunRequest = () => {
  moxios.stubRequest('https://path-to-svg-file-12790:103137', {
    status: 200,
    response: (fs as any).__originalFs.createReadStream(path.join(svgDirectory, 'profile.svg')),
  });

  moxios.stubRequest('https://path-to-svg-file-12790:103136', {
    status: 200,
    response: (fs as any).__originalFs.createReadStream(path.join(svgDirectory, 'settings.svg')),
  });

  moxios.stubRequest('https://path-to-svg-file-12790:103135', {
    status: 200,
    response: (fs as any).__originalFs.createReadStream(
      path.join(svgDirectory, 'sidebar-notifications.svg'),
    ),
  });

  moxios.stubRequest('https://path-to-svg-file-17310:267509', {
    status: 200,
    response: (fs as any).__originalFs.createReadStream(path.join(svgDirectory, 'pin.svg')),
  });

  moxios.stubRequest('https://path-to-svg-file-16901:275425', {
    status: 200,
    response: (fs as any).__originalFs.createReadStream(path.join(svgDirectory, 'unpin.svg')),
  });
};

describe('generateIcons', () => {
  beforeEach(() => {
    moxios.install();
  });

  afterEach(() => {
    moxios.uninstall();
    vol.reset();
  });

  it('should thrown the error because exportPath is empty', () => {
    return expect(
      generateIcons({} as any, {
        fileId: 'any',
        icons: {
          nodeIds: [],
        },
      }),
    ).rejects.toThrow('config -> icons -> exportPath is required field');
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

  it('should download and write svg icons', done => {
    stunRequest();

    const client = createClient();

    generateIcons(client, {
      apiKey: 'api_key',
      fileId: 'file_id',
      icons: {
        exportPath: '/tmp',
        nodeIds: ['12790:103016'],
      },
    });

    moxios.wait(() => {
      expect(client.fileNodes).toHaveBeenCalledWith('file_id', { ids: ['12790:103016'] });
      expect(client.fileImages).toHaveBeenNthCalledWith(1, 'file_id', {
        format: 'svg',
        ids: ['12790:103137', '12790:103136', '12790:103135'],
      });
      expect(client.fileImages).toHaveBeenNthCalledWith(2, 'file_id', {
        format: 'svg',
        ids: ['17310:267509', '16901:275425'],
      });

      expect(moxios.requests.count()).toBe(5);

      const request1 = moxios.requests.at(0);
      expect(request1.url).toBe('https://path-to-svg-file-12790:103137');
      expect(request1.headers['X-Figma-Token']).toBe('api_key');

      const request2 = moxios.requests.at(1);
      expect(request2.url).toBe('https://path-to-svg-file-12790:103136');
      expect(request2.headers['X-Figma-Token']).toBe('api_key');

      const request3 = moxios.requests.at(2);
      expect(request3.url).toBe('https://path-to-svg-file-12790:103135');
      expect(request3.headers['X-Figma-Token']).toBe('api_key');

      const request4 = moxios.requests.at(3);
      expect(request4.url).toBe('https://path-to-svg-file-17310:267509');
      expect(request4.headers['X-Figma-Token']).toBe('api_key');

      const request5 = moxios.requests.at(4);
      expect(request5.url).toBe('https://path-to-svg-file-16901:275425');
      expect(request5.headers['X-Figma-Token']).toBe('api_key');

      expect(vol.toJSON()).toMatchSnapshot();
      done();
    });
  });

  it('should download and write svg icons with custom icon name', done => {
    stunRequest();

    const client = createClient();

    generateIcons(client, {
      apiKey: 'api_key',
      fileId: 'file_id',
      icons: {
        exportPath: '/tmp',
        nodeIds: ['12790:103016'],
        iconName: (name: string) => name + '_extra',
      },
    });

    moxios.wait(() => {
      expect(vol.toJSON()).toMatchSnapshot();
      done();
    });
  });

  it('should launch generation of icon types', done => {
    stunRequest();

    const client = createClient();

    generateIcons(client, {
      apiKey: 'api_key',
      fileId: 'file_id',
      icons: {
        exportPath: '/tmp',
        nodeIds: ['12790:103016'],
        generateTypes: true,
      },
    });

    moxios.wait(() => {
      expect(generateIconTypes).toHaveBeenCalledWith(
        ['profile', 'settings', 'sidebar-notifications', 'pin', 'unpin'],
        '/tmp',
      );
      done();
    });
  });

  it('should launch generation an icon sprite', done => {
    stunRequest();

    const client = createClient();

    generateIcons(client, {
      apiKey: 'api_key',
      fileId: 'file_id',
      icons: {
        exportPath: '/tmp',
        nodeIds: ['12790:103016'],
        generateSprite: true,
      },
    });

    moxios.wait(() => {
      expect(generateIconsSprite).toHaveBeenCalledWith('/tmp');
      done();
    });
  });
});
