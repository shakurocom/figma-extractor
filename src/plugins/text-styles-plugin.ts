import path from 'path';

import { getTextStyles } from '../lib/get-text-styles';
import { mergeTextStyle } from '../lib/merge-text-styles';
import { sortTextStyles } from '../lib/text/sort-text-styles';
import { Plugin } from './types';

export const textStylesPlugin: Plugin = (
  { config, writeFile, addEslintDisableRules, log },
  { variables },
) => {
  log('[info:text-styles] >>> ', 'Text styles plugin starts working...');

  if (!config?.styles?.textStyles?.disabled) {
    const result = getTextStyles(variables, config);

    let rawTextStyle = result.textStyles;
    if (!!config?.styles?.textStyles?.merge) {
      log('[info:text-styles/merge] >>> ', 'Merging of text styles has been enabled');
      if (config?.screens) {
        log(
          '[info:text-styles/merge] >>> ',
          'Available screens: ',
          JSON.stringify(config?.screens),
        );
        rawTextStyle = mergeTextStyle({ textStyles: rawTextStyle, screens: config?.screens });
      } else {
        console.warn(
          "Attention! You have merging of text styles is enabled and don't have any screens. Add some screens for correctly working it.",
        );
      }
    }

    if (result.fontFamily) {
      for (const [fontTitle, fontValue] of Object.entries(result.fontFamily)) {
        log('[info:text-styles/fonts] >>> ', `'${fontTitle}' => '${fontValue}'`);
      }
    }

    if (Array.isArray(rawTextStyle)) {
      for (let i = 0; i < rawTextStyle.length; i++) {
        for (const [styleTitle, styleValue] of Object.entries(rawTextStyle[i])) {
          log('[info:text-styles/styles] >>> ', `'${styleTitle}' => `, JSON.stringify(styleValue));
        }
      }
    }

    const textStyles = sortTextStyles(rawTextStyle);

    const fontFamilyTemplate = JSON.stringify(result.fontFamily);
    const textStylesTemplate = `{${textStyles.join()}};`;
    writeFile(
      addEslintDisableRules(
        `
      const fontFamily = ${fontFamilyTemplate};

      const textVariants = ${textStylesTemplate};

      module.exports = {fontFamily, textVariants}`,
        ['disable-max-lines', 'disable-typescript-naming-convention'],
      ),
      path.join(config?.styles?.exportPath || '', 'text-styles.js'),
    );
  } else {
    log(
      '[info:text-styles] >>> ',
      'Text styles plugin has been disabled so the plugin had not been launched',
    );
  }
};

textStylesPlugin.pluginName = 'text-styles';
