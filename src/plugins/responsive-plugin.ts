import path from 'path';

import { getResponsive } from '../lib/get-responsive';
import { Plugin } from './types';

export const responsivePlugin: Plugin = (
  { config, writeFile, addEslintDisableRules, log },
  { variables },
) => {
  if (config?.styles?.responsive?.disabled) {
    log(
      '[info:responsive] >>> ',
      'Responsive plugin has been disabled so the plugin had not been launched',
    );

    return;
  }
  log('[info:responsive] >>> ', 'Responsive plugin starts working...');

  const { screens, ...result } = getResponsive(variables, config);

  writeFile(
    addEslintDisableRules(
      `
    const responsiveVariants = ${JSON.stringify(result)};

    module.exports = {responsiveVariants}`,
      ['disable-max-lines', 'disable-typescript-naming-convention'],
    ),
    path.join(config?.styles?.exportPath || '', 'responsive.js'),
  );
};

responsivePlugin.pluginName = 'responsive';
