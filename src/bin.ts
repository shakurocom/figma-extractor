#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-var-requires */
const { cosmiconfig, defaultLoaders } = require('cosmiconfig');
import path from 'path';

import { getClient } from './lib/client';
import { createLog } from './utils/log';
import { createCore } from './core';
import { createImportVariablesAdapter, getVariablesJson } from './import-variables';
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

let enabledImportVariables = false;
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
  .command({
    command: 'import-variables <file>',
    aliases: ['iv'],
    desc: 'Import figma variables from file',
    builder: (yargs: any) =>
      yargs.positional('file', {
        describe: 'JSON file with variables',
        type: 'string',
      }),
    handler: () => {
      enabledImportVariables = true;
    },
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
      config?.styles?.colors?.useTheme ? colorsThemePlugin : colorsPlugin,
      !enabledImportVariables ? textStylesPlugin : undefined,
      config?.styles?.effects?.useTheme ? effectsThemePlugin : effectsPlugin,
      gradientsPlugin,
      !enabledImportVariables ? iconsPlugin : undefined,
    ],
    log,
  });

  log('Getting of Figma client by api_key: ', config.apiKey);

  const client = getClient(config.apiKey);

  const { styleMetadata, fileNodes } = await (async function () {
    if (enabledImportVariables) {
      log('Create import variables client with file path: ', argv.file);

      const filePath = path.isAbsolute(argv.file) ? argv.file : path.join(rootPath, argv.file);
      log('Resolved file path of variables: ', filePath);

      const variablesData = await getVariablesJson(filePath);

      // TODO: Add an adapter class from config and CLI argument as the second parameter
      const importClient = await createImportVariablesAdapter(variablesData);

      return { styleMetadata: importClient.styleMetadata, fileNodes: importClient.fileNodes };
    } else {
      log('Getting of meta style from figma by file_id: ', config.fileId);

      const { meta } = await client.fileStyles(config.fileId).then(({ data }) => data);

      const nodeIds = meta.styles.map(item => item.node_id);

      log('List of nodeIds has been received: ', JSON.stringify(nodeIds));

      const { data: fileNodes } = await client.fileNodes(config.fileId, { ids: nodeIds });

      return { styleMetadata: meta.styles, fileNodes };
    }
  })();

  log('Run plugins');
  launchPlugins(core, {
    figmaClient: client,
    styleMetadata,
    fileNodes,
  }).then(() => {
    log('Finish');
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
