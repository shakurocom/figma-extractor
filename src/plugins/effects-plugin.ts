import path from 'path';

import { getEffectName } from '../lib/color/get-effect-name/get-effect-name';
import { getEffectStyles } from '../lib/get-effect-styles';
import { stringifyRecordsWithSort } from '../lib/stringify';
import { Plugin } from './types';

export const effectsPlugin: Plugin = (
  { config, styleTypeUtils, writeFile, runFormattingFile },
  { styleMetadata, fileNodes },
) => {
  if (!config?.styles?.effects?.disabled) {
    const metaEffects = styleMetadata.filter(styleTypeUtils.isEffect);
    const effects = getEffectStyles(
      metaEffects,
      fileNodes,
      config?.styles?.effects?.keyName ?? getEffectName,
    );

    const effectTemplate = `module.exports = {boxShadow: ${stringifyRecordsWithSort(effects)}};`;
    writeFile(effectTemplate, path.join(config?.styles?.exportPath || '', 'effects.js'));
    runFormattingFile(path.join(config?.styles?.exportPath || '', 'effects.js'));
  }
};

effectsPlugin.pluginName = 'effects';
