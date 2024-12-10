#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-var-requires */
const { cosmiconfig } = require('cosmiconfig');
import path from 'path';

import { getClient } from './lib/client';
import { createLog } from './utils/log';
import { readJsonFile } from './utils/read-json-file';
import { createCore } from './core';
import {
  colorsThemePlugin,
  effectsThemePlugin,
  iconsPlugin,
  launchPlugins,
  responsivePlugin,
  textStylesPlugin,
} from './plugins';
import { Config, OnlyArgs, ThemeVariablesConfig } from './types';

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
  .option('verbose', {
    description: 'More informative data output',
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

const disabledKeys: OnlyArgs[] = ['icons', 'colors', 'effects', 'textStyles', 'responsive'];

async function run(config: Config) {
  const rootPath = process.cwd();

  const log = createLog(!!argv.verbose);

  console.log('Please wait...');

  log('Income config: ', JSON.stringify(config, null, 2));
  log('Root path: ', rootPath);

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

  log(
    'Income console arguments: ',
    JSON.stringify(argv, (key, value) => {
      if (key === '$0') {
        return undefined;
      }

      return value;
    }),
  );
  log("Income the list of 'only' console argument: ", JSON.stringify(onlyArgs));

  if (onlyArgs) {
    disabledKeys?.forEach(item => {
      const includedKey = onlyArgs.includes(item);
      if (includedKey) {
        log('[info:only arguments] >>> ', `'${item}' has been enabled in config`);
      } else {
        log('[info:only arguments] >>> ', `'${item}' has been disabled automatically`);
      }
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

    log(
      "Changed config after launching of filtering by 'only' console argument: ",
      JSON.stringify(config, null, 2),
    );
  }
  const core = createCore({
    rootPath,
    config,
    plugins: [
      colorsThemePlugin,
      textStylesPlugin,
      effectsThemePlugin,
      responsivePlugin,
      iconsPlugin,
    ],
    log,
  });

  const variables = await readJsonFile<ThemeVariablesConfig[]>(
    path.join(rootPath, config.jsonVariablesPath || ''),
  );

  log('Getting of Figma client by api_key: ', config.apiKey);

  const client = getClient(config.apiKey);

  log('Getting of meta style from figma by file_id: ', config.fileId);

  log('Run plugins');
  launchPlugins(core, {
    figmaClient: client,
    variables,
  }).then(() => {
    log('Finish');
    console.log(`
+------------------------------------------------------+
|                                                      |
|     Don't forget to update figma-variables.json      |
|                                                      |
+------------------------------------------------------+
`);
  });
}

cosmiconfig('figma-extractor')
  .search()
  .then((result: { config: Config }) => {
    return run(result.config);
  })
  .catch((error: any) => {
    console.log('error', error);
  });
