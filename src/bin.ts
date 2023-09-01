#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-var-requires */
const { cosmiconfig, defaultLoaders } = require('cosmiconfig');
import path from 'path';

import { getClient } from './lib/client';
import { createCore } from './core';
import {
  colorsPlugin,
  colorsThemePlugin,
  effectsPlugin,
  effectsThemePlugin,
  gradientsPlugin,
  iconsPlugin,
  launchPlugins,
  textStylesPlugin,
} from './plugins';
import { Config, OnlyArgs } from './types';

const argv = require('yargs/yargs')(process.argv.slice(2))
  .usage('Usage: $0 [options]')
  .example('$0 --only=icons,colors', 'Extract only icons and colors')
  .alias('o', 'only')
  .describe('o', 'Extract only')
  .option('local-icons', {
    description:
      'Bypass downloading icons from Figma, generate sprite from local svg files instead',
    type: 'boolean',
  })
  .help('h')
  .alias('h', 'help').argv;

const getOnlyArgs = (onlyArg: string) => {
  if (!onlyArg) return null;

  const arrayArgs = onlyArg?.split(',');
  const onlyArgs: OnlyArgs[] = arrayArgs.map((item: any) => item.trim() as OnlyArgs);

  return onlyArgs;
};

const disabledKeys: OnlyArgs[] = ['icons', 'colors', 'effects', 'textStyles', 'gradients'];

async function run(config: Config) {
  const rootPath = process.cwd();

  console.log('Please wait...');

  config = {
    ...config,
    styles: {
      ...config.styles,
      exportPath: path.join(rootPath, config?.styles?.exportPath || ''),
    },
    icons: Array.isArray(config.icons)
      ? config.icons.map(conf => ({
          ...conf,
          exportPath: path.join(rootPath, conf.exportPath || ''),
          localIcons: argv.localIcons ?? conf.localIcons ?? false,
        }))
      : {
          ...config?.icons,
          exportPath: path.join(rootPath, config?.icons?.exportPath || ''),
          localIcons: argv.localIcons ?? config?.icons?.localIcons ?? false,
        },
  };

  const onlyArgs = getOnlyArgs(argv.only);

  if (onlyArgs) {
    disabledKeys?.forEach(item => {
      const includedKey = onlyArgs.includes(item);
      const prop: Partial<Config> =
        item === 'icons'
          ? Array.isArray(config.icons)
            ? {
                icons: config.icons.map(conf => ({
                  ...conf,
                  disabled: includedKey ? false : true,
                })),
              }
            : {
                icons: {
                  ...config.icons,
                  disabled: includedKey ? false : true,
                },
              }
          : {
              styles: {
                ...config.styles,
                [item]: {
                  ...config.styles[item],
                  disabled: includedKey ? false : true,
                },
              },
            };

      config = {
        ...config,
        ...prop,
      };
    });
  }

  const core = createCore({
    rootPath,
    config,
    plugins: [
      config?.styles?.colors?.useTheme ? colorsThemePlugin : colorsPlugin,
      textStylesPlugin,
      config?.styles?.effects?.useTheme ? effectsThemePlugin : effectsPlugin,
      gradientsPlugin,
      iconsPlugin,
    ],
  });

  const client = getClient(config.apiKey);
  const { meta } = await client.fileStyles(config.fileId).then(({ data }) => data);
  const nodeIds = meta.styles.map(item => item.node_id);
  const { data: fileNodes } = await client.fileNodes(config.fileId, { ids: nodeIds });

  launchPlugins(core, {
    figmaClient: client,
    styleMetadata: meta.styles,
    fileNodes,
  });
}

function generateSearchPlaces(moduleName: string) {
  const extensions = ['json', 'js', 'config.js'];
  // gives figma-extractor.json...
  const regular = extensions.map(ext => `${moduleName}.${ext}`);
  // gives .figma-extractorrc.json... but no .figma-extractorrc.config.js
  const dot = extensions.filter(ext => ext !== 'config.js').map(ext => `.${moduleName}rc.${ext}`);

  return [...regular.concat(dot), 'package.json'];
}

function customLoader(ext: 'json' | 'js') {
  function loader(filepath: string, content: string) {
    if (ext === 'json') {
      return defaultLoaders['.json'](filepath, content);
    }

    if (ext === 'js') {
      return defaultLoaders['.js'](filepath, content);
    }
  }

  return loader;
}

const moduleName = 'figma-extractor';

const explorer = cosmiconfig(moduleName, {
  packageProp: moduleName,
  searchPlaces: generateSearchPlaces(moduleName),
  loaders: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '.json': customLoader('json'),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '.js': customLoader('js'),
  },
});

explorer
  .search()
  .then((result: { config: Config }) => {
    return run(result.config);
  })
  .catch((error: any) => {
    console.log('error', error);
  });
