/* eslint-disable @typescript-eslint/naming-convention */
import fs from 'fs';
import { vol } from 'memfs';
import path from 'path';

import { generateIconTypes } from '../generate-icon-types';
import { generateIconsSprite } from '../generate-icons-sprite';
import { generateIconSpriteFromLocalFiles } from './generate-icons-sprite-from-local-files';

jest.mock('fs');
jest.mock('../generate-icon-types');
jest.mock('../generate-icons-sprite');

const svgDirectory = path.join(__dirname, '../../utils/generate-styles/fixtures');

describe('generateIconSpriteFromLocalFiles', () => {
  afterEach(() => {
    vol.reset();
    (generateIconTypes as jest.Mock).mockReset();
    (generateIconsSprite as jest.Mock).mockReset();
  });

  it("should throw the error because exportPath doesn't exist", () => {
    const config: any = {
      fileId: 'any',
      icons: {
        nodeIds: [],
      },
    };

    expect(() => generateIconSpriteFromLocalFiles(config.icons, jest.fn())).toThrow(
      'Attempt to generate icon sprite from non-existent files',
    );
  });

  it('should create icons sprite', () => {
    const config: any = {
      fileId: 'any',
      icons: {
        exportPath: '/tmp',
        nodeIds: [],
      },
    };

    fs.mkdirSync('/tmp/svg', { recursive: true });

    generateIconSpriteFromLocalFiles(config.icons, jest.fn());

    expect(generateIconTypes).not.toHaveBeenCalled();
    expect(generateIconsSprite).toHaveBeenCalledWith('/tmp');
  });

  it('should create icons sprite and attempt to generate icons types from empty folder', () => {
    const config: any = {
      apiKey: 'api_key',
      fileId: 'file_id',
      icons: {
        exportPath: '/tmp',
        nodeIds: ['12790:103016'],
        generateTypes: true,
      },
    };

    const log = jest.fn();

    fs.mkdirSync('/tmp/svg', { recursive: true });

    generateIconSpriteFromLocalFiles(config.icons, log);

    expect(generateIconTypes).toHaveBeenCalledWith([], '/tmp');
    expect(generateIconsSprite).toHaveBeenCalledWith('/tmp');
  });

  it('should create icons sprite and generate icons types from exist svg files', () => {
    const config: any = {
      apiKey: 'api_key',
      fileId: 'file_id',
      icons: {
        exportPath: '/tmp',
        nodeIds: ['12790:103016'],
        generateTypes: true,
      },
    };

    const log = jest.fn();

    vol.fromJSON({
      '/tmp/svg/profile.svg': (fs as any).__originalFs.readFileSync(
        path.join(svgDirectory, 'profile.svg'),
        {
          encoding: 'UTF-8',
        },
      ),
      '/tmp/svg/settings.svg': (fs as any).__originalFs.readFileSync(
        path.join(svgDirectory, 'settings.svg'),
        {
          encoding: 'UTF-8',
        },
      ),
      '/tmp/svg/sidebar-notifications.svg': (fs as any).__originalFs.readFileSync(
        path.join(svgDirectory, 'sidebar-notifications.svg'),
        {
          encoding: 'UTF-8',
        },
      ),
    });

    generateIconSpriteFromLocalFiles(config.icons, log);

    expect(generateIconTypes).toHaveBeenCalledWith(
      ['profile', 'settings', 'sidebar-notifications'],
      '/tmp',
    );
    expect(generateIconsSprite).toHaveBeenCalledWith('/tmp');
  });
});
