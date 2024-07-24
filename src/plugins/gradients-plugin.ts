import path from 'path';

import { getColorName } from '../lib/get-color-name';
import { getGradientStyles } from '../lib/get-gradient-styles';
import { sortCollection } from '../lib/sort-collection';
import { Plugin } from './types';

export const gradientsPlugin: Plugin = (
  { config, styleTypeUtils, writeFile, addEslintDisableRules, log },
  { styleMetadata, fileNodes },
) => {
  log('[info:gradients] >>> ', 'Gradients plugin starts working...');

  if (!config?.styles?.gradients?.disabled) {
    const metaColors = styleMetadata.filter(styleTypeUtils.isFill);
    const gradients = getGradientStyles(
      metaColors,
      fileNodes,
      config?.styles?.gradients?.keyName ?? getColorName,
    );

    const sortedGradients = sortCollection(gradients);
    for (const [gradientName, gradientValue] of Object.entries(sortedGradients)) {
      log('[info:gradients] >>> ', `'${gradientName}' => '${gradientValue}'`);
    }

    const gradientsTemplate = `module.exports = ${JSON.stringify(sortedGradients)};`;
    writeFile(
      addEslintDisableRules(gradientsTemplate, [
        'disable-max-lines',
        'disable-typescript-naming-convention',
      ]),
      path.join(config?.styles?.exportPath || '', 'gradients.js'),
    );
  } else {
    log(
      '[info:gradients] >>> ',
      'Gradients plugin has been disabled so the plugin had not been launched',
    );
  }
};

gradientsPlugin.pluginName = 'gradients';
