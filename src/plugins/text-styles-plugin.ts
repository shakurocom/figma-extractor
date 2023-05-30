import path from 'path';

import { getTextStyles } from '../lib/get-text-styles';
import { mergeTextStyle } from '../lib/merge-text-styles';
import { sortTextStyles } from '../lib/text/sort-text-styles/sort-text-styles';
import { Plugin } from './types';

export const textStylesPlugin: Plugin = (
  { config, styleTypeUtils, writeFile, runFormattingFile },
  { styleMetadata, fileNodes },
) => {
  if (!config?.styles?.textStyles?.disabled) {
    const metaTextStyles = styleMetadata.filter(styleTypeUtils.isText);
    const result = getTextStyles(metaTextStyles, fileNodes, config);

    let rawTextStyle = result.textStyles;

    if (!!config?.styles?.textStyles?.merge) {
      if (config?.screens) {
        rawTextStyle = mergeTextStyle({ textStyles: rawTextStyle, screens: config?.screens });
      } else {
        console.warn(
          "Attention! You have merging of text styles is enabled and don't have any screens. Add some screens for correctly working it.",
        );
      }
    }

    const textStyles = sortTextStyles(rawTextStyle);

    const fontFamilyTemplate = JSON.stringify(result.fontFamily);
    const textStylesTemplate = `{${textStyles.join()}};`;
    writeFile(
      `
      const fontFamily = ${fontFamilyTemplate};

      const textVariants = ${textStylesTemplate};

      module.exports = {fontFamily, textVariants}`,
      path.join(config?.styles?.exportPath || '', 'text-styles.js'),
    );
    runFormattingFile(path.join(config?.styles?.exportPath || '', 'text-styles.js'));
  }
};

textStylesPlugin.pluginName = 'text-styles';
