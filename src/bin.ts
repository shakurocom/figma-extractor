#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-var-requires */
const { cosmiconfig, defaultLoaders } = require('cosmiconfig');

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

const disabledKeys = ['icons', 'colors', 'effects', 'textStyles'] as OnlyArgs[];

function run(config: Config, path: string) {
  console.log('Please wait...');
  const onlyArgs = getOnlyArgs(argv.only);
  if (onlyArgs) {
    disabledKeys?.forEach(item => {
      const includedKey = onlyArgs.includes(item);
      config = {
        ...config,
        [item]: {
          ...config[item],
          disabled: includedKey ? false : true,
        },
      };
    });
  }

  generateStyles(config, path);

  if (!config.icons?.disabled) {
    generateIcons(config, path).catch(err => {
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
    run(result.config, process.cwd());
  })
  .catch((error: any) => {
    console.log('error', error);
  });
