import path from 'path';

import { Mode } from '@/types';

import { getColorName } from '../lib/get-color-name';
import { getColorStyles } from '../lib/get-color-styles';
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

type ColorName = string;

export const colorsThemePlugin: Plugin = (
  { config, writeFile, addEslintDisableRules, log },
  { variables },
) => {
  if (!config?.styles?.colors?.disabled) {
    const filteredCollections = variables.filter(({ name }) =>
      config?.styles?.colors?.collectionNames?.includes(name),
    );

    const modes = filteredCollections.reduce<Mode[]>((acc, item) => [...acc, ...item.modes], []);

    const { allowedThemes, defaultTheme } = checkConfigAndThrowCommonError({
      allowedThemes: config?.styles?.allowedThemes,
      defaultTheme: config?.styles?.defaultTheme,
    });

    log('[info:color-theme] >>> ', 'Allowed themes: ', JSON.stringify(allowedThemes));
    log('[info:color-theme] >>> ', 'Default themes: ', defaultTheme);

    const themesCollection = createThemeCollection({ allowedThemes });
    const keyNameCallback = config?.styles?.colors?.keyName ?? getColorName;
    const colors = getColorStyles(modes, name => keyNameCallback(name));

    let anyThemeIsUsed = false;
    for (const { newName, value, theme, originalName } of separateThemes({
      allowedThemes,
      data: colors,
    })) {
      log(
        '[info:color-theme] >>> ',
        `'${newName}' ${
          theme === NOT_FOUND_THEME_NAME ? 'without theme' : `on '${theme}' theme`
        } => '${value}'  (original: '${originalName}')`,
      );
      if (theme === NOT_FOUND_THEME_NAME) {
        if (!variableNameIsValid(newName)) {
          throw new Error(`Color name: "${newName}" without theme contains not-valid chars.`);
        }
        themesCollection[NOT_FOUND_THEME_NAME][newName] = value;
      } else {
        if (!variableNameIsValid(newName)) {
          throw new Error(
            `Color name: "${newName}" from "${theme}" theme contains not-valid chars.`,
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
      const jsData: Record<ColorName, string> = generateJsColors(variables);
      for (const [name, value] of Object.entries(jsData)) {
        log(`[info:color-theme/${themeName}] >>> `, `'${name}' => '${value}'`);
      }

      const cssData = generateCSSVariables(variables, themeName);

      const fullPath = path.join(config?.styles?.exportPath || '', `colors/${themeName}`);

      const jsTemplate = `export const colors = ${stringifyRecordsWithSort(jsData)};`;
      writeFile(
        addEslintDisableRules(jsTemplate, [
          'disable-max-lines',
          'disable-typescript-naming-convention',
        ]),
        path.join(fullPath, 'index.ts'),
      );

      writeFile(cssData, path.join(fullPath, 'vars.css'));

      if (currentThemeIsDefault) {
        const fullPath = path.join(config?.styles?.exportPath || '', 'colors');

        const jsData = generateJsVariables(
          variables,
          defaultTheme && themesCollection[defaultTheme] ? themesCollection[defaultTheme] : {},
        );

        const jsTemplate = `export const colors = ${stringifyRecordsWithSort(jsData)};`;
        writeFile(
          addEslintDisableRules(jsTemplate, [
            'disable-max-lines',
            'disable-typescript-naming-convention',
          ]),
          path.join(fullPath, 'with-vars.ts'),
        );

        const jsLegacyData = generateJsColors(variables);

        const jsLegacyTemplate = `export const colors = ${stringifyRecordsWithSort(jsLegacyData)};`;
        writeFile(
          addEslintDisableRules(jsLegacyTemplate, [
            'disable-max-lines',
            'disable-typescript-naming-convention',
          ]),
          path.join(fullPath, 'index.ts'),
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
  }
};

colorsThemePlugin.pluginName = 'colors-theme';
