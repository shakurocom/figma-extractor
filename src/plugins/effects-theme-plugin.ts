import path from 'path';

import { Mode } from '@/types';

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

interface FormattedEffects {
  backdropBlur?: {
    [key: string]: string;
  };
  blur?: {
    [key: string]: string;
  };
  [key: string]: any; // This allows for any other key-value pairs
}

const template = ({
  blur,
  backdropBlur,
  boxShadow,
}: {
  blur?: {
    [key: string]: string | number;
  };
  backdropBlur?: {
    [key: string]: string | number;
  };
  boxShadow?: {
    [key: string]: string | number;
  };
}) => `export const effects = {
    ${boxShadow ? `boxShadow: ${stringifyRecordsWithSort(boxShadow)},` : ''}
    ${backdropBlur ? `backdropBlur: ${stringifyRecordsWithSort(backdropBlur)},` : ''}
    ${blur ? `blur: ${stringifyRecordsWithSort(blur)},` : ''}
    }
    `;

const formattedEffects = (effects: Record<string, string>): FormattedEffects => {
  return Object.entries(effects).reduce((acc, [name, value]) => {
    if (name.includes('backdrop-blur')) {
      const backdropBlur = acc.backdropBlur || {};
      // format name from backdrop-blur-100 to 100
      // because className in tailwind backdrop-blur-100 better then backdrop-blur-backdrop-blur-100
      const backdropBlurName = name.split('-')[2];

      return {
        ...acc,
        backdropBlur: {
          ...backdropBlur,
          [backdropBlurName]: value,
        },
      };
    }
    if (name.includes('blur')) {
      const blur = acc.blur || {};
      // format name from blur-100 to 100
      const blurName = name.split('-')[1];

      return {
        ...acc,
        blur: {
          ...blur,
          [blurName]: value,
        },
      };
    }
    if (name.includes('shadow')) {
      const shadow = acc.boxShadow || {};
      // format name from boxShadow-100 to 100
      const shadowName = name.split('-')[1];

      return {
        ...acc,
        boxShadow: {
          ...shadow,
          [shadowName]: value,
        },
      };
    }

    return { ...acc, [name]: value };
  }, {} as FormattedEffects);
};

export const effectsThemePlugin: Plugin = (
  { config, writeFile, addEslintDisableRules, log },
  { variables },
) => {
  if (config?.styles?.responsive?.disabled) {
    log(
      '[info:effects-theme] >>> ',
      'Effects-theme plugin has been disabled so the plugin had not been launched',
    );

    return;
  }
  log('[info:effects-theme] >>> ', 'Effects-theme plugin starts working...');
  const filteredCollections = variables.filter(({ name }) =>
    config?.styles?.effects?.collectionNames?.includes(name),
  );

  const modes = filteredCollections.reduce<Mode[]>((acc, item) => [...acc, ...item.modes], []);
  const modesWithFilteredVariablesByGroup = modes.map(item => ({
    ...item,
    variables: item.variables.filter(variable => {
      if ((config.styles.colors?.groupNames || []).length > 0) {
        const [group] = variable.name.split('/');

        return config.styles?.effects?.groupNames?.includes(group);
      }

      return variable;
    }),
  }));

  const { allowedThemes, defaultTheme } = checkConfigAndThrowCommonError({
    allowedThemes: config?.styles?.allowedThemes,
    defaultTheme: config?.styles?.defaultTheme,
  });

  log('[info:effects-theme] >>> ', 'Allowed themes: ', JSON.stringify(allowedThemes));
  log('[info:effects-theme] >>> ', 'Default themes: ', defaultTheme);

  const themesCollection = createThemeCollection({ allowedThemes });
  const effects = getEffectStyles(modesWithFilteredVariablesByGroup, config);

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
    const effects = formattedEffects(jsData);
    for (const [name, value] of Object.entries(jsData)) {
      log(`[info:effects-theme/${themeName}] >>> `, `'${name}' => '${value}'`);
    }

    const cssData = generateCSSVariables(variables, themeName);

    const fullPath = path.join(config?.styles?.exportPath || '', `effects/${themeName}`);

    const jsTemplate = template(effects);

    writeFile(
      addEslintDisableRules(jsTemplate, [
        'disable-max-lines',
        'disable-typescript-naming-convention',
      ]),
      path.join(fullPath, 'index.ts'),
    );

    writeFile(cssData, path.join(fullPath, 'vars.css'));

    if (currentThemeIsDefault) {
      const fullPath = path.join(config?.styles?.exportPath || '', 'effects');

      const jsData = generateJsVariables(
        variables,
        defaultTheme && themesCollection[defaultTheme] ? themesCollection[defaultTheme] : {},
      );

      const effects = formattedEffects(jsData);
      const jsTemplate = template(effects);

      writeFile(
        addEslintDisableRules(jsTemplate, [
          'disable-max-lines',
          'disable-typescript-naming-convention',
        ]),
        path.join(fullPath, 'with-vars.ts'),
      );

      const jsLegacyData = generateJsColors(variables);
      const effectsLegacy = formattedEffects(jsLegacyData);

      const jsLegacyTemplate = template(effectsLegacy);

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
};

effectsThemePlugin.pluginName = 'effects-theme';
