import { generateIcons } from '../lib/icon/generate-icons';
import { generateIconSpriteFromLocalFiles } from '../lib/icon/generate-icons-sprite-from-local-files';
import { Plugin } from './types';

export const iconsPlugin: Plugin = ({ config }, { figmaClient }) => {
  if (!config.icons?.disabled) {
    if (config.icons.localIcons) {
      try {
        generateIconSpriteFromLocalFiles(config);
      } catch (err) {
        console.error(err);
      }
    } else {
      generateIcons(figmaClient, config).catch(err => {
        console.error(err);
        console.error(err.stack);
      });
    }
  }
};

iconsPlugin.pluginName = 'icons';
