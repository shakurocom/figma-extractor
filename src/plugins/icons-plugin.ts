import { ClientInterface } from 'figma-js';

import { generateIcons } from '../lib/icon/generate-icons';
import { generateIconSpriteFromLocalFiles } from '../lib/icon/generate-icons-sprite-from-local-files';
import { Config, IconConfig } from '../types';
import { Plugin } from './types';

const runEachIconConfig = async (
  iconConfig: IconConfig,
  config: Config,
  figmaClient: ClientInterface,
) => {
  if (!iconConfig.disabled) {
    if (iconConfig.localIcons) {
      try {
        return generateIconSpriteFromLocalFiles(iconConfig);
      } catch (err) {
        console.error(err);
      }
    } else {
      return generateIcons(figmaClient, iconConfig, config).catch(err => {
        console.error(err);
        console.error(err.stack);
      });
    }
  }
};

export const iconsPlugin: Plugin = async ({ config }, { figmaClient }) => {
  if (!!config.icons) {
    if (Array.isArray(config.icons)) {
      for await (const iconConfig of config.icons) {
        await runEachIconConfig(iconConfig, config, figmaClient);
      }
    } else {
      await runEachIconConfig(config.icons, config, figmaClient);
    }
  }
};

iconsPlugin.pluginName = 'icons';
