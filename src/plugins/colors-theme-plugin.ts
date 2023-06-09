import path from 'path';

import { getColorName, replaceSlashToDash } from '../lib/color/get-color-name/get-color-name';
import { getColorStyles } from '../lib/get-color-styles';
import { stringifyRecordsWithSort } from '../lib/stringify';
import { Plugin } from './types';

type ThemeName = string;

type ColorName = string;

type ColorValue = string;

type VariablesCollection = Record<ColorName, ColorValue>;

type ThemeCollection = Record<ThemeName, VariablesCollection>;

const NOT_FOUND_THEME_NAME = '_';
const DEFAULT_THEME_NAME = '__DEFAULT__';

const variableNameIsValid = (name: string) => !!name.match(/^[\w\-]+$/);

const addNewColorNameToEachTheme = (collection: ThemeCollection, colorName: string) => {
  for (const themeName of Object.keys(collection)) {
    if (themeName !== NOT_FOUND_THEME_NAME && !(colorName in collection[themeName])) {
      collection[themeName][colorName] = '';
    }
  }
};

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

  const allowedThemes = config?.styles?.colors?.allowedThemes;
  const defaultTheme = config?.styles?.colors?.defaultTheme;

  if (!Array.isArray(allowedThemes)) {
    throw new Error(
      '`config -> styles -> colors -> allowedThemes` field is required when the useTheme is equal true',
    );
  }

  if (allowedThemes.length === 0) {
    throw new Error(
      '`config -> styles -> colors -> allowedThemes` field must have one or more theme name',
    );
  }

  if (defaultTheme && !allowedThemes.includes(defaultTheme)) {
    throw new Error(
      "`config -> styles -> colors -> defaultTheme` field must be one of allowedThemes' values",
    );
  }

  const themesCollection = [...allowedThemes, NOT_FOUND_THEME_NAME].reduce<ThemeCollection>(
    (col, current) => {
      col[current] = {};

      return col;
    },
    {},
  );

  if (!defaultTheme) {
    themesCollection[DEFAULT_THEME_NAME] = {};
  }

  const colors = getColorStyles(
    metaColors,
    fileNodes,
    config?.styles?.colors?.keyName ?? getColorName,
  );

  let anyThemeIsUsed = false;
  for (const [colorName, value] of Object.entries(colors)) {
    const separatedData = colorName.split('/');
    if (separatedData.length > 1) {
      const [separatedTheme, ...others] = separatedData;
      if (separatedTheme && allowedThemes.includes(separatedTheme.trim())) {
        const newColorName = replaceSlashToDash(others.join('/'));

        if (!variableNameIsValid(newColorName)) {
          throw new Error(
            `Color name: "${newColorName}" from "${separatedTheme.trim()}" theme contains not-valid chars.`,
          );
        }

        anyThemeIsUsed = true;
        addNewColorNameToEachTheme(themesCollection, newColorName);
        themesCollection[separatedTheme.trim()][newColorName] = value;
        continue;
      }
    }

    const newColorName = replaceSlashToDash(colorName);

    if (!variableNameIsValid(newColorName)) {
      throw new Error(`Color name: "${newColorName}" without theme contains not-valid chars.`);
    }

    themesCollection[NOT_FOUND_THEME_NAME][newColorName] = value;
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
