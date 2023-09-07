import path from 'path';

import { getEffectName } from '../lib/color/get-effect-name/get-effect-name';
import { getEffectStyles } from '../lib/get-effect-styles';
import { stringifyRecordsWithSort } from '../lib/stringify';
import {
  addNewNameToEachTheme,
  checkConfigAndThrowCommonError,
  createThemeCollection,
  generateCSSVariables,
  generateJsColors,
  generateJsVariables,
  generateThemeListTS,
  getRealThemesFromCollection,
  NOT_FOUND_THEME_NAME,
  separateThemes,
  variableNameIsValid,
} from '../lib/themes';
import { Plugin } from './types';

type EffectName = string;

export const effectsThemePlugin: Plugin = (
  { config, styleTypeUtils, writeFile, addEslintDisableRules, log },
  { styleMetadata, fileNodes },
) => {
  const metaEffects = styleMetadata.filter(styleTypeUtils.isEffect);

  log('[info:effects-theme] >>> ', 'Effects-theme plugin starts working...');

  if (config?.styles?.effects?.disabled) {
    log(
      '[info:effects-theme] >>> ',
      'Effects-theme plugin has been disabled so the plugin had not been launched',
    );

    return;
  }

  const { allowedThemes, defaultTheme } = checkConfigAndThrowCommonError({
    allowedThemes: config?.styles?.allowedThemes,
    defaultTheme: config?.styles?.defaultTheme,
  });

  log('[info:effects-theme] >>> ', 'Allowed themes: ', JSON.stringify(allowedThemes));
  log('[info:effects-theme] >>> ', 'Default themes: ', defaultTheme);

  const themesCollection = createThemeCollection({ allowedThemes });

  const effects = getEffectStyles(
    metaEffects,
    fileNodes,
    config?.styles?.effects?.keyName ?? getEffectName,
  );

  let anyThemeIsUsed = false;
  for (const { newName, value, theme, originalName } of separateThemes({
    allowedThemes,
    data: effects,
  })) {
    log(
      '[info:effects-theme] >>> ',
      `'${newName}' ${
        theme === NOT_FOUND_THEME_NAME ? 'without theme' : `on '${theme}' theme`
      } => '${value}'  (original: '${originalName}')`,
    );
    if (theme === NOT_FOUND_THEME_NAME) {
      if (!variableNameIsValid(newName)) {
        throw new Error(`Effect name: "${newName}" without theme contains not-valid chars.`);
      }
      themesCollection[NOT_FOUND_THEME_NAME][newName] = value;
    } else {
      if (!variableNameIsValid(newName)) {
        throw new Error(
          `Effect name: "${newName}" from "${theme}" theme contains not-valid chars.`,
        );
      }

      anyThemeIsUsed = true;
      addNewNameToEachTheme(themesCollection, newName);
      themesCollection[theme][newName] = value;
    }
  }

  if (!anyThemeIsUsed) {
    throw new Error(
      "None of themes was found inside figma data. Check your themes and figma's themes",
    );
  }

  for (const { themeName, variables, currentThemeIsDefault } of getRealThemesFromCollection({
    themesCollection,
    defaultTheme,
  })) {
    const jsData: Record<EffectName, string> = generateJsColors(variables);
    for (const [name, value] of Object.entries(jsData)) {
      log(`[info:effects-theme/${themeName}] >>> `, `'${name}' => '${value}'`);
    }

    const cssData = generateCSSVariables(variables, themeName);

    const fullPath = path.join(config?.styles?.exportPath || '', `effects/${themeName}`);

    const jsTemplate = `module.exports = {boxShadow: ${stringifyRecordsWithSort(jsData)}};`;
    writeFile(
      addEslintDisableRules(jsTemplate, [
        'disable-max-lines',
        'disable-typescript-naming-convention',
      ]),
      path.join(fullPath, 'index.js'),
    );

    writeFile(cssData, path.join(fullPath, 'vars.css'));

    if (currentThemeIsDefault) {
      const fullPath = path.join(config?.styles?.exportPath || '', 'effects');

      const jsData = generateJsVariables(
        variables,
        defaultTheme && themesCollection[defaultTheme] ? themesCollection[defaultTheme] : {},
      );

      const jsTemplate = `module.exports = {boxShadow: ${stringifyRecordsWithSort(jsData)}};`;
      writeFile(
        addEslintDisableRules(jsTemplate, [
          'disable-max-lines',
          'disable-typescript-naming-convention',
        ]),
        path.join(fullPath, 'with-vars.js'),
      );

      const jsLegacyData = generateJsColors(variables);

      const jsLegacyTemplate = `module.exports = {boxShadow: ${stringifyRecordsWithSort(
        jsLegacyData,
      )}};`;

      writeFile(
        addEslintDisableRules(jsLegacyTemplate, [
          'disable-max-lines',
          'disable-typescript-naming-convention',
        ]),
        path.join(fullPath, 'index.js'),
      );

      const cssData = generateCSSVariables(variables);
      writeFile(cssData, path.join(fullPath, 'vars.css'));
    }
  }

  const themeListTSData = generateThemeListTS(themesCollection, defaultTheme);

  writeFile(
    addEslintDisableRules(themeListTSData, [
      'disable-max-lines',
      'disable-typescript-naming-convention',
    ]),
    path.join(config?.styles?.exportPath || '', 'themes-list.ts'),
  );
};

effectsThemePlugin.pluginName = 'effects-theme';
