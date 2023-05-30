import path from 'path';

import { getColorStyles } from '../lib/get-color-styles';
import { stringifyRecordsWithSort } from '../lib/stringify';
import { Plugin } from './types';

export const colorsPlugin: Plugin = (
  { config, styleTypeUtils, writeFile, runFormattingFile },
  { styleMetadata, fileNodes },
) => {
  const metaColors = styleMetadata.filter(styleTypeUtils.isFill);

  if (!config?.styles?.colors?.disabled) {
    const colors = getColorStyles(metaColors, fileNodes, config);
    const colorTemplate = `module.exports = ${stringifyRecordsWithSort(colors)};`;

    writeFile(colorTemplate, path.join(config?.styles?.exportPath || '', 'colors.js'));
    runFormattingFile(path.join(config?.styles?.exportPath || '', 'colors.js'));
  }
};

colorsPlugin.pluginName = 'colors';
