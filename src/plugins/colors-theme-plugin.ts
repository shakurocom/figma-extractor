import path from 'path';

import { getColorName } from '../lib/color/get-color-name/get-color-name';
import { getColorStyles } from '../lib/get-color-styles';
import { stringifyRecordsWithSort } from '../lib/stringify';
import {
  addNewNameToEachTheme,
  checkConfigAndThrowCommonError,
  createThemeCollection,
  DEFAULT_THEME_NAME,
  NOT_FOUND_THEME_NAME,
  separateThemes,
  ThemeCollection,
  variableNameIsValid,
  VariablesCollection,
} from '../lib/themes';
import { Plugin } from './types';

type ColorName = string;

const generateJsVariables = (
  variablesCollection: VariablesCollection,
  defaultVariablesCollection: VariablesCollection,
) => {
  const data: Record<ColorName, string> = {};
  for (const colorName of Object.keys(variablesCollection)) {
    data[colorName] = `var(--sh-${colorName},'${defaultVariablesCollection[colorName] ?? ''}')`;
  }

  return data;
};

const generateJsColors = (variablesCollection: VariablesCollection) => {
  const data: Record<ColorName, string> = {};
  for (const [colorName, value] of Object.entries(variablesCollection)) {
    if (value) {
      data[colorName] = value;
    }
  }

  return data;
};

const generateCSSVariables = (variablesCollection: VariablesCollection, themeName?: ThemeName) => {
  const data: string[] = [];
  for (const [colorName, value] of Object.entries(variablesCollection)) {
    data.push(`--sh-${colorName}: '${value}';`);
  }
  data.sort((a, b) => {
    if (a === b) {
      return 0;
    }

    return a > b ? 1 : -1;
  });

  if (themeName === DEFAULT_THEME_NAME) {
    return `
:root {
}`;
  } else if (themeName && themeName !== NOT_FOUND_THEME_NAME) {
    return `
[data-theme='${themeName}'] {
  ${data.join('\n')}
}`;
  } else {
    return `
:root {
  ${data.join('\n')}
}`;
  }
};

const generateThemeListTS = (themeCollection: ThemeCollection, defaultTheme?: string) => {
  const themes: string[] = Object.keys(themeCollection)
    .filter(theme => {
      if (defaultTheme) {
        return (
          theme !== defaultTheme && theme !== NOT_FOUND_THEME_NAME && theme !== DEFAULT_THEME_NAME
        );
      }

      return theme !== NOT_FOUND_THEME_NAME && theme !== DEFAULT_THEME_NAME;
    })
    .map(theme => `'${theme}'`);

  return `
// THIS FILE IS GENERATED AUTOMATICALLY. DON'T CHANGE IT.

export type DefaultTheme = '${defaultTheme ?? ''}';

export type Theme = ${themes.join(' | ')};  
  `;
};

export const colorsThemePlugin: Plugin = (
  { config, styleTypeUtils, writeFile, runFormattingFile },
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

  const colors = getColorStyles(
    metaColors,
    fileNodes,
    config?.styles?.colors?.keyName ?? getColorName,
  );

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

  for (const [themeName, variables] of Object.entries(themesCollection)) {
    if (themeName === NOT_FOUND_THEME_NAME) {
      continue;
    }

    const currentThemeIsDefault =
      defaultTheme && themesCollection[defaultTheme] && defaultTheme === themeName;

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
    if (defaultTheme && themesCollection[defaultTheme] && defaultTheme === themeName) {
      fullPath = path.join(config?.styles?.exportPath || '', `colors`);
    } else if (themeName === DEFAULT_THEME_NAME) {
      fullPath = path.join(config?.styles?.exportPath || '', `colors`);
    }

    const jsTemplate = `module.exports = ${stringifyRecordsWithSort(jsData)};`;
    writeFile(jsTemplate, path.join(fullPath, 'index.js'));
    runFormattingFile(path.join(fullPath, 'index.js'));

    writeFile(cssData, path.join(fullPath, 'vars.css'));
    runFormattingFile(path.join(fullPath, 'vars.css'));
  }

  const themeListTSData = generateThemeListTS(themesCollection, defaultTheme);

  writeFile(themeListTSData, path.join(config?.styles?.exportPath || '', 'themes-list.ts'));
  runFormattingFile(path.join(config?.styles?.exportPath || '', `themes-list.ts`));
};

colorsThemePlugin.pluginName = 'colors-theme';
