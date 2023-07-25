import path from 'path';

import { getColorName } from '../lib/color/get-color-name/get-color-name';
import { getGradientStyles } from '../lib/get-gradient-styles';
import { stringifyRecordsWithSort } from '../lib/stringify';
import { Plugin } from './types';

export const gradientsPlugin: Plugin = (
  { config, styleTypeUtils, writeFile, addEslintDisableRules },
  { styleMetadata, fileNodes },
) => {
  if (!config?.styles?.gradients?.disabled) {
    const metaColors = styleMetadata.filter(styleTypeUtils.isFill);
    const gradients = getGradientStyles(
      metaColors,
      fileNodes,
      config?.styles?.gradients?.keyName ?? getColorName,
    );

    const gradientsTemplate = `module.exports = ${stringifyRecordsWithSort(gradients)};`;
    writeFile(
      addEslintDisableRules(gradientsTemplate, [
        'disable-max-lines',
        'disable-typescript-naming-convention',
      ]),
      path.join(config?.styles?.exportPath || '', 'gradients.js'),
    );
  }
};

gradientsPlugin.pluginName = 'gradients';
