import path from 'path';

import { getColorName } from '../lib/color/get-color-name/get-color-name';
import { getColorStyles } from '../lib/get-color-styles';
import { sortCollection } from '../lib/sort-collection';
import { Plugin } from './types';

export const colorsPlugin: Plugin = (
  { config, styleTypeUtils, writeFile, addEslintDisableRules, log },
  { styleMetadata, fileNodes },
) => {
  const metaColors = styleMetadata.filter(styleTypeUtils.isFill);

  log('[info:color] >>> ', 'Colors plugin starts working...');

  if (!config?.styles?.colors?.disabled) {
    const keyNameCallback = config?.styles?.colors?.keyName ?? getColorName;
    const colors = getColorStyles(metaColors, fileNodes, name => keyNameCallback(name, false));

    const sortedColors = sortCollection(colors);
    for (const [colorName, colorValue] of Object.entries(sortedColors)) {
      log('[info:color] >>> ', `'${colorName}' => '${colorValue}'`);
    }
    const colorTemplate = `module.exports = ${JSON.stringify(sortedColors)};`;

    writeFile(
      addEslintDisableRules(colorTemplate, [
        'disable-max-lines',
        'disable-typescript-naming-convention',
      ]),
      path.join(config?.styles?.exportPath || '', 'colors.js'),
    );
  } else {
    log('[info:color] >>> ', 'Colors plugin has been disabled so the plugin had not been launched');
  }
};

colorsPlugin.pluginName = 'colors';
