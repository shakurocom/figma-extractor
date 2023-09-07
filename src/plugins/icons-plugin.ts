import { ClientInterface } from 'figma-js';

import { Core } from '../core';
import { generateIcons } from '../lib/icon/generate-icons';
import { generateIconSpriteFromLocalFiles } from '../lib/icon/generate-icons-sprite-from-local-files';
import { Config, IconConfig } from '../types';
import { Plugin } from './types';

const runEachIconConfig = async (
  iconConfig: IconConfig,
  config: Config,
  figmaClient: ClientInterface,
  log: Core['log'],
  index: number,
) => {
  const logTitle = index > 0 ? `[info:icons/${index}] >>> ` : '[info:icons] >>> ';
  log(logTitle, 'Icon config has been launched with config: ', JSON.stringify(iconConfig));

  if (!iconConfig.disabled) {
    if (iconConfig.localIcons) {
      log(logTitle, 'Icon config has localIcons = true');
      try {
        return generateIconSpriteFromLocalFiles(iconConfig, (...args: string[]) =>
          log(logTitle, ...args),
        );
      } catch (err) {
        console.error(err);
      }
    } else {
      return generateIcons(figmaClient, iconConfig, config, (...args: string[]) =>
        log(logTitle, ...args),
      ).catch(err => {
        console.error(err);
        console.error(err.stack);
      });
    }
  } else {
    log(logTitle, 'Icon config is disabled');
  }
};

export const iconsPlugin: Plugin = async ({ config, log }, { figmaClient }) => {
  log('[info:icons] >>> ', 'Icons plugin starts working...');

  if (!!config.icons) {
    if (Array.isArray(config.icons)) {
      log('[info:icons] >>> ', `There are ${config.icons.length} icon configs`);
      let index = 1;
      for await (const iconConfig of config.icons) {
        await runEachIconConfig(iconConfig, config, figmaClient, log, index);
        index++;
      }
    } else {
      await runEachIconConfig(config.icons, config, figmaClient, log, 0);
    }
  }
};

iconsPlugin.pluginName = 'icons';
