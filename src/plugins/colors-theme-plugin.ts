import path from 'path';

import { getColorStyles } from '../lib/get-color-styles';
import { stringifyRecordsWithSort } from '../lib/stringify';
import { Plugin } from './types';
import { getColorName, replaceSlashToDash } from '../lib/color/get-color-name/get-color-name';

type ThemeName = string;

type ColorName = string;

type ColorValue = string;

type VariablesCollection = Record<ColorName, ColorValue>;

type ThemeCollection = Record<ThemeName, VariablesCollection>;

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

  if (themeName && themeName !== '_') {
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
        return theme !== defaultTheme && theme !== '_';
      }

      return theme !== '_';
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

  const themesCollection = [...allowedThemes, '_'].reduce<ThemeCollection>((col, current) => {
    col[current] = {};

    return col;
  }, {});

  const colors = getColorStyles(metaColors, fileNodes, {
    ...config,
    styles: {
      ...config.styles,
      colors: {
        ...config.styles.colors,
        disabled: false,
        keyName: getColorName,
      },
    },
  });

  for (const [colorName, value] of Object.entries(colors)) {
    const separatedData = colorName.split('/');
    if (separatedData.length > 1) {
      const [separatedTheme, ...others] = separatedData;
      if (separatedTheme && allowedThemes.includes(separatedTheme)) {
        const newColorName =
          config?.styles?.colors?.keyName?.(others.join('/')) ??
          replaceSlashToDash(others.join('/'));

        themesCollection[separatedTheme][newColorName] = value;
        continue;
      }
    }

    const newColorName =
      config?.styles?.colors?.keyName?.(colorName) ?? replaceSlashToDash(colorName);

    themesCollection['_'][newColorName] = value;
  }

  for (const [themeName, variables] of Object.entries(themesCollection)) {
    const jsData = generateJsVariables(
      variables,
      defaultTheme && themesCollection[defaultTheme]
        ? themesCollection[defaultTheme]
        : themesCollection['_'],
    );

    const cssData = generateCSSVariables(variables, themeName);

    let fullPath = path.join(config?.styles?.exportPath || '', `colors/${themeName}`);
    if (defaultTheme && themesCollection[defaultTheme]) {
      if (themeName === '_') {
        continue;
      }
      fullPath = path.join(config?.styles?.exportPath || '', `colors`);
    } else if (themeName === '_') {
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
