#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-var-requires */
const { cosmiconfig, defaultLoaders } = require('cosmiconfig');
import path from 'path';

import { generateIcons } from './generate-icons';
import { generateStyles } from './generate-styles';

const argv = require('yargs/yargs')(process.argv.slice(2))
  .usage('Usage: $0 [options]')
  .example('$0 --only=icons,colors', 'Extract only icons and colors')
  .alias('o', 'only')
  .describe('o', 'Extract only')
  .help('h')
  .alias('h', 'help').argv;

const getOnlyArgs = (onlyArg: string) => {
  if (!onlyArg) return null;

  const arrayArgs = onlyArg?.split(',');
  const onlyArgs: OnlyArgs[] = arrayArgs.map((item: any) => item.trim() as OnlyArgs);
  return onlyArgs;
};

const disabledKeys = ['icons', 'colors', 'effects', 'textStyles', 'gradients'] as OnlyArgs[];

function run(config: Config) {
  const rootPath = process.cwd();
  console.log('Please wait...');
  config = {
    ...config,
    styles: {
      ...config.styles,
      exportPath: path.join(rootPath, config?.styles?.exportPath || ''),
    },
    icons: { ...config?.icons, exportPath: path.join(rootPath, config?.icons?.exportPath || '') },
  };
  const onlyArgs = getOnlyArgs(argv.only);

  if (onlyArgs) {
    disabledKeys?.forEach(item => {
      const includedKey = onlyArgs.includes(item);
      const prop =
        item === 'icons'
          ? {
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

  generateStyles(config);

  if (!config.icons?.disabled) {
    generateIcons(config).catch(err => {
      console.error(err);
      console.error(err.stack);
    });
  }
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
    '.json': customLoader('json'),
    '.js': customLoader('js'),
  },
});

explorer
  .search()
  .then((result: { config: Config }) => {
    run(result.config);
  })
  .catch((error: any) => {
    console.log('error', error);
  });
