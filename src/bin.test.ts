/* eslint-disable max-lines */
import { cosmiconfig } from 'cosmiconfig';

import { getClient } from './lib/client';
import { generateIcons } from './lib/icon/generate-icons';
import { generateIconSpriteFromLocalFiles } from './lib/icon/generate-icons-sprite-from-local-files';
import { createCore } from './core';
import {
  colorsPlugin,
  effectsPlugin,
  gradientsPlugin,
  iconsPlugin,
  launchPlugins,
  textStylesPlugin,
} from './plugins';

jest.mock('cosmiconfig', () => {
  return {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    cosmiconfig: jest.fn(),
    // defaultLoaders
  };
});
jest.mock('./lib/client');
jest.mock('./plugins');
jest.mock('./core');
jest.mock('./lib/icon/generate-icons');
jest.mock('./lib/icon/generate-icons-sprite-from-local-files');

(getClient as jest.Mock).mockImplementation(() => ({
  fileStyles: () => Promise.resolve({ data: { meta: { styles: [] } } }),
  fileNodes: () => Promise.resolve({ data: {} }),
}));
(generateIcons as jest.Mock).mockImplementation(() => Promise.resolve());

describe('bin', () => {
  let originalArgv: any;
  let originalCwd: any;

  beforeEach(async () => {
    (cosmiconfig as jest.Mock).mockClear();
    (getClient as jest.Mock).mockClear();
    (createCore as jest.Mock).mockClear();
    (launchPlugins as jest.Mock).mockClear();
    (generateIcons as jest.Mock).mockClear();
    (generateIconSpriteFromLocalFiles as jest.Mock).mockClear();
    // Remove all cached modules. The cache needs to be cleared before running
    // each command, otherwise you will see the same results from the command
    // run in your first test in subsequent tests.
    // jest.resetModules();

    // Each test overwrites process arguments so store the original arguments
    originalArgv = process.argv;
    originalCwd = process.cwd;
  });

  afterEach(() => {
    // jest.resetModules();

    // Set process arguments back to the original value
    process.argv = originalArgv;
    process.cwd = originalCwd;
  });

  it('should be launched with empty config', async () => {
    (cosmiconfig as jest.Mock).mockReset();
    let resolver: any;
    const promise = new Promise(res => (resolver = res));
    const search = jest.fn(() => {
      return {
        then: (func: any) => {
          return func({ config: {} }).then(resolver);
        },
      };
    });

    (cosmiconfig as jest.Mock).mockImplementationOnce(
      jest.fn(() => ({
        search,
      })),
    );

    await runCommand();

    return promise.then(() => {
      // TODO: Need to add exception if there is no apiKey
      expect(getClient).toHaveBeenCalledWith(undefined);
      expect(createCore).toBeCalledWith({
        rootPath: '/test-figma-extractor',
        config: {
          icons: {
            exportPath: '/test-figma-extractor',
            localIcons: false,
          },
          styles: {
            exportPath: '/test-figma-extractor',
          },
        },
        plugins: [colorsPlugin, textStylesPlugin, effectsPlugin, gradientsPlugin, iconsPlugin],
      });
      expect(launchPlugins).toHaveBeenCalled();
      expect(generateIcons).toHaveBeenCalledWith((getClient as jest.Mock).mock.results[0].value, {
        icons: {
          exportPath: '/test-figma-extractor',
          localIcons: false,
        },
        styles: {
          exportPath: '/test-figma-extractor',
        },
      });
    });
  });

  it('should be launched with a filled config', async () => {
    let resolver: any;
    const promise = new Promise(res => (resolver = res));
    const search = jest.fn(() => {
      return {
        then: (func: any) => {
          return func({
            config: {
              apiKey: '123',
              fileId: 'fsdfhjkh423j423',
              styles: {
                exportPath: './ui/theme',
                colors: {},
                effects: {},
                gradients: {},
                textStyles: {
                  merge: true,
                },
              },
              icons: {
                nodeIds: ['2310:0', '2090:11', '276:18'],
                exportPath: './ui/atoms/icon',
                generateSprite: true,
                generateTypes: true,
                localIcons: false,
              },
            },
          }).then(resolver);
        },
      };
    });

    (cosmiconfig as jest.Mock).mockImplementationOnce(
      jest.fn(() => ({
        search,
      })),
    );

    // await runCommand('install', 'some-package', '--save', '--only=icons,colors');
    await runCommand();

    return promise.then(() => {
      // TODO: Need to add exception if there is no apiKey
      expect(getClient).toHaveBeenCalledWith('123');
      expect(createCore).toBeCalledWith({
        rootPath: '/test-figma-extractor',
        config: {
          apiKey: '123',
          fileId: 'fsdfhjkh423j423',
          icons: {
            exportPath: '/test-figma-extractor/ui/atoms/icon',
            localIcons: false,
            generateSprite: true,
            generateTypes: true,
            nodeIds: ['2310:0', '2090:11', '276:18'],
          },
          styles: {
            exportPath: '/test-figma-extractor/ui/theme',
            colors: {},
            effects: {},
            gradients: {},
            textStyles: {
              merge: true,
            },
          },
        },
        plugins: [colorsPlugin, textStylesPlugin, effectsPlugin, gradientsPlugin, iconsPlugin],
      });
      expect(launchPlugins).toHaveBeenCalled();
      expect(generateIcons).toHaveBeenCalledWith((getClient as jest.Mock).mock.results[0].value, {
        apiKey: '123',
        fileId: 'fsdfhjkh423j423',
        icons: {
          exportPath: '/test-figma-extractor/ui/atoms/icon',
          localIcons: false,
          generateSprite: true,
          generateTypes: true,
          nodeIds: ['2310:0', '2090:11', '276:18'],
        },
        styles: {
          exportPath: '/test-figma-extractor/ui/theme',
          colors: {},
          effects: {},
          gradients: {},
          textStyles: {
            merge: true,
          },
        },
      });
    });
  });

  it('should be launched with flag --only=icons and config must have only icons section is enabled', async () => {
    let resolver: any;
    const promise = new Promise(res => (resolver = res));
    const search = jest.fn(() => {
      return {
        then: (func: any) => {
          return func({
            config: {
              apiKey: '123',
              fileId: 'fsdfhjkh423j423',
              styles: {
                exportPath: './ui/theme',
                colors: {},
                effects: {},
                gradients: {},
                textStyles: {
                  merge: true,
                },
              },
              icons: {
                nodeIds: ['2310:0', '2090:11', '276:18'],
                exportPath: './ui/atoms/icon',
                generateSprite: true,
                generateTypes: true,
                localIcons: false,
              },
            },
          }).then(resolver);
        },
      };
    });

    (cosmiconfig as jest.Mock).mockImplementationOnce(
      jest.fn(() => ({
        search,
      })),
    );

    await runCommand('--only=icons');

    return promise.then(() => {
      expect(createCore).toBeCalledWith({
        rootPath: '/test-figma-extractor',
        config: {
          apiKey: '123',
          fileId: 'fsdfhjkh423j423',
          icons: {
            disabled: false,
            exportPath: '/test-figma-extractor/ui/atoms/icon',
            localIcons: false,
            generateSprite: true,
            generateTypes: true,
            nodeIds: ['2310:0', '2090:11', '276:18'],
          },
          styles: {
            exportPath: '/test-figma-extractor/ui/theme',
            colors: {
              disabled: true,
            },
            effects: {
              disabled: true,
            },
            gradients: {
              disabled: true,
            },
            textStyles: {
              disabled: true,
              merge: true,
            },
          },
        },
        plugins: [colorsPlugin, textStylesPlugin, effectsPlugin, gradientsPlugin, iconsPlugin],
      });
      expect(launchPlugins).toHaveBeenCalled();
      expect(generateIcons).toHaveBeenCalledWith((getClient as jest.Mock).mock.results[0].value, {
        apiKey: '123',
        fileId: 'fsdfhjkh423j423',
        icons: {
          disabled: false,
          exportPath: '/test-figma-extractor/ui/atoms/icon',
          localIcons: false,
          generateSprite: true,
          generateTypes: true,
          nodeIds: ['2310:0', '2090:11', '276:18'],
        },
        styles: {
          exportPath: '/test-figma-extractor/ui/theme',
          colors: {
            disabled: true,
          },
          effects: {
            disabled: true,
          },
          gradients: {
            disabled: true,
          },
          textStyles: {
            disabled: true,
            merge: true,
          },
        },
      });
    });
  });

  it('should be launched with flag --only=icons,colors and config must have only icons and colors sections are enabled', async () => {
    let resolver: any;
    const promise = new Promise(res => (resolver = res));
    const search = jest.fn(() => {
      return {
        then: (func: any) => {
          return func({
            config: {
              apiKey: '123',
              fileId: 'fsdfhjkh423j423',
              styles: {
                exportPath: './ui/theme',
                colors: {},
                effects: {},
                gradients: {},
                textStyles: {
                  merge: true,
                },
              },
              icons: {
                nodeIds: ['2310:0', '2090:11', '276:18'],
                exportPath: './ui/atoms/icon',
                generateSprite: true,
                generateTypes: true,
                localIcons: false,
              },
            },
          }).then(resolver);
        },
      };
    });

    (cosmiconfig as jest.Mock).mockImplementationOnce(
      jest.fn(() => ({
        search,
      })),
    );

    await runCommand('--only=icons,colors');

    return promise.then(() => {
      expect(createCore).toBeCalledWith({
        rootPath: '/test-figma-extractor',
        config: {
          apiKey: '123',
          fileId: 'fsdfhjkh423j423',
          icons: {
            disabled: false,
            exportPath: '/test-figma-extractor/ui/atoms/icon',
            localIcons: false,
            generateSprite: true,
            generateTypes: true,
            nodeIds: ['2310:0', '2090:11', '276:18'],
          },
          styles: {
            exportPath: '/test-figma-extractor/ui/theme',
            colors: {
              disabled: false,
            },
            effects: {
              disabled: true,
            },
            gradients: {
              disabled: true,
            },
            textStyles: {
              disabled: true,
              merge: true,
            },
          },
        },
        plugins: [colorsPlugin, textStylesPlugin, effectsPlugin, gradientsPlugin, iconsPlugin],
      });
      expect(launchPlugins).toHaveBeenCalled();
      expect(generateIcons).toHaveBeenCalledWith((getClient as jest.Mock).mock.results[0].value, {
        apiKey: '123',
        fileId: 'fsdfhjkh423j423',
        icons: {
          disabled: false,
          exportPath: '/test-figma-extractor/ui/atoms/icon',
          localIcons: false,
          generateSprite: true,
          generateTypes: true,
          nodeIds: ['2310:0', '2090:11', '276:18'],
        },
        styles: {
          exportPath: '/test-figma-extractor/ui/theme',
          colors: {
            disabled: false,
          },
          effects: {
            disabled: true,
          },
          gradients: {
            disabled: true,
          },
          textStyles: {
            disabled: true,
            merge: true,
          },
        },
      });
    });
  });

  it('should be launched with flag --local-icons and it must be generated only local icons', async () => {
    let resolver: any;
    const promise = new Promise(res => (resolver = res));
    const search = jest.fn(() => {
      return {
        then: (func: any) => {
          return func({
            config: {
              apiKey: '123',
              fileId: 'fsdfhjkh423j423',
              styles: {
                exportPath: './ui/theme',
                colors: {},
                effects: {},
                gradients: {},
                textStyles: {
                  merge: true,
                },
              },
              icons: {
                nodeIds: ['2310:0', '2090:11', '276:18'],
                exportPath: './ui/atoms/icon',
                generateSprite: true,
                generateTypes: true,
                localIcons: false,
              },
            },
          }).then(resolver);
        },
      };
    });

    (cosmiconfig as jest.Mock).mockImplementationOnce(
      jest.fn(() => ({
        search,
      })),
    );

    await runCommand('--local-icons');

    return promise.then(() => {
      expect(createCore).toBeCalledWith({
        rootPath: '/test-figma-extractor',
        config: {
          apiKey: '123',
          fileId: 'fsdfhjkh423j423',
          icons: {
            exportPath: '/test-figma-extractor/ui/atoms/icon',
            localIcons: true,
            generateSprite: true,
            generateTypes: true,
            nodeIds: ['2310:0', '2090:11', '276:18'],
          },
          styles: {
            exportPath: '/test-figma-extractor/ui/theme',
            colors: {},
            effects: {},
            gradients: {},
            textStyles: {
              merge: true,
            },
          },
        },
        plugins: [colorsPlugin, textStylesPlugin, effectsPlugin, gradientsPlugin, iconsPlugin],
      });
      expect(launchPlugins).toHaveBeenCalled();
      expect(generateIconSpriteFromLocalFiles).toHaveBeenCalledWith({
        apiKey: '123',
        fileId: 'fsdfhjkh423j423',
        icons: {
          exportPath: '/test-figma-extractor/ui/atoms/icon',
          localIcons: true,
          generateSprite: true,
          generateTypes: true,
          nodeIds: ['2310:0', '2090:11', '276:18'],
        },
        styles: {
          exportPath: '/test-figma-extractor/ui/theme',
          colors: {},
          effects: {},
          gradients: {},
          textStyles: {
            merge: true,
          },
        },
      });
    });
  });
});

/**
 * Programmatically set arguments and execute the CLI script
 *
 * @param {...string} args - positional and option arguments for the command to run
 */
async function runCommand(...args: any[]) {
  process.argv = [
    'node', // Not used but a value is required at this index in the array
    'bin.js', // Not used but a value is required at this index in the array
    ...args,
  ];
  process.cwd = () => '/test-figma-extractor';
  let resolver: any;
  const promise = new Promise(res => (resolver = res));
  jest.isolateModules(() => {
    require('./bin');
    resolver();
  });

  return promise;

  // Require the yargs CLI script
  // return require('./bin');
}
