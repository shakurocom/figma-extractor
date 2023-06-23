import path from 'path';

import { getColorName } from '../lib/color/get-color-name/get-color-name';
import { getColorStyles } from '../lib/get-color-styles';
import { stringifyRecordsWithSort } from '../lib/stringify';
import {
  addNewNameToEachTheme,
  checkConfigAndThrowCommonError,
  createThemeCollection,
  DEFAULT_THEME_NAME,
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

type ColorName = string;

export const colorsThemePlugin: Plugin = (
  { config, styleTypeUtils, writeFile, addEslintDisableRules },
  { styleMetadata, fileNodes },
) => {
  const metaColors = styleMetadata.filter(styleTypeUtils.isFill);

  if (config?.styles?.colors?.disabled) {
    return;
  }

  const { allowedThemes, defaultTheme } = checkConfigAndThrowCommonError({
    allowedThemes: config?.styles?.allowedThemes,
    defaultTheme: config?.styles?.defaultTheme,
  });

  const themesCollection = createThemeCollection({ allowedThemes, defaultTheme });

  const keyNameCallback = config?.styles?.colors?.keyName ?? getColorName;
  const colors = getColorStyles(metaColors, fileNodes, name => keyNameCallback(name, true));

  let anyThemeIsUsed = false;
  for (const { newName, value, theme } of separateThemes({ allowedThemes, data: colors })) {
    if (theme === NOT_FOUND_THEME_NAME) {
      if (!variableNameIsValid(newName)) {
        throw new Error(`Color name: "${newName}" without theme contains not-valid chars.`);
      }
      themesCollection[NOT_FOUND_THEME_NAME][newName] = value;
    } else {
      if (!variableNameIsValid(newName)) {
        throw new Error(`Color name: "${newName}" from "${theme}" theme contains not-valid chars.`);
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
    let jsData: Record<ColorName, string> = {};
    if (currentThemeIsDefault || themeName === DEFAULT_THEME_NAME) {
      jsData = generateJsVariables(
        variables,
        defaultTheme && themesCollection[defaultTheme] ? themesCollection[defaultTheme] : {},
      );
    } else {
      jsData = generateJsColors(variables);
    }

    const cssData = generateCSSVariables(
      variables,
      defaultTheme === themeName ? undefined : themeName,
    );

    let fullPath = path.join(config?.styles?.exportPath || '', `colors/${themeName}`);
    if (currentThemeIsDefault) {
      fullPath = path.join(config?.styles?.exportPath || '', `colors`);
    } else if (themeName === DEFAULT_THEME_NAME) {
      fullPath = path.join(config?.styles?.exportPath || '', `colors`);
    }

    const jsTemplate = `module.exports = ${stringifyRecordsWithSort(jsData)};`;
    writeFile(
      addEslintDisableRules(jsTemplate, ['disable-max-lines']),
      path.join(fullPath, 'index.js'),
    );

    writeFile(cssData, path.join(fullPath, 'vars.css'));
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

colorsThemePlugin.pluginName = 'colors-theme';
