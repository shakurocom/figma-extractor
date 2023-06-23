import path from 'path';

import { getColorName } from '../lib/color/get-color-name/get-color-name';
import { getColorStyles } from '../lib/get-color-styles';
import { stringifyRecordsWithSort } from '../lib/stringify';
import { Plugin } from './types';

export const colorsPlugin: Plugin = (
  { config, styleTypeUtils, writeFile, addEslintDisableRules },
  { styleMetadata, fileNodes },
) => {
  const metaColors = styleMetadata.filter(styleTypeUtils.isFill);

  if (!config?.styles?.colors?.disabled) {
    const colors = getColorStyles(
      metaColors,
      fileNodes,
      config?.styles?.colors?.keyName ?? getColorName,
    );

    const colorTemplate = `module.exports = ${stringifyRecordsWithSort(colors)};`;

    writeFile(
      addEslintDisableRules(colorTemplate, ['disable-max-lines']),
      path.join(config?.styles?.exportPath || '', 'colors.js'),
    );
  }
};

colorsPlugin.pluginName = 'colors';
