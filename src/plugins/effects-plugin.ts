import path from 'path';

import { getEffectName } from '../lib/color/get-effect-name/get-effect-name';
import { getEffectStyles } from '../lib/get-effect-styles';
import { sortCollection } from '../lib/sort-collection';
import { Plugin } from './types';

export const effectsPlugin: Plugin = (
  { config, styleTypeUtils, writeFile, addEslintDisableRules, log },
  { styleMetadata, fileNodes },
) => {
  log('[info:effects] >>> ', 'Effects plugin starts working...');

  if (!config?.styles?.effects?.disabled) {
    const metaEffects = styleMetadata.filter(styleTypeUtils.isEffect);
    const effects = getEffectStyles(
      metaEffects,
      fileNodes,
      config?.styles?.effects?.keyName ?? getEffectName,
    );

    const sortedEffects = sortCollection(effects);
    for (const [effectName, effectValue] of Object.entries(sortedEffects)) {
      log('[info:effects] >>> ', `'${effectName}' => '${effectValue}'`);
    }

    const effectTemplate = `module.exports = {boxShadow: ${JSON.stringify(sortedEffects)}};`;
    writeFile(
      addEslintDisableRules(effectTemplate, [
        'disable-max-lines',
        'disable-typescript-naming-convention',
      ]),
      path.join(config?.styles?.exportPath || '', 'effects.js'),
    );
  } else {
    log(
      '[info:effects] >>> ',
      'Effects plugin has been disabled so the plugin had not been launched',
    );
  }
};

effectsPlugin.pluginName = 'effects';
